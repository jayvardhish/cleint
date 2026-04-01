
from fastapi import APIRouter, Depends, HTTPException
import os
import shutil
import uuid
from database import get_database
from bson import ObjectId
from routers.auth import get_current_user
from models import UserResponse
from ai_client import client
from utils.video_utils import extract_frames
from ocr_utils import get_reader
from utils.file_manager import ensure_local_file, cleanup_local_file

router = APIRouter(prefix="/api/vdo-ocr", tags=["Video OCR"])

PROCESSED_FRAMES_DIR = "uploads/frames"
os.makedirs(PROCESSED_FRAMES_DIR, exist_ok=True)

@router.post("/{video_id}")
async def extract_text_from_video(
    video_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    db = await get_database()
    
    # Try finding by ObjectId if valid, else by string
    video_filter = {"user_id": current_user.id}
    try:
        video_filter["_id"] = ObjectId(video_id)
    except:
        video_filter["_id"] = video_id

    video = await db.videos.find_one(video_filter)
    
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
        
    video_path = video.get("file_path")
    if not video_path:
        raise HTTPException(status_code=400, detail="Video file not found. Video OCR requires a valid uploaded video.")

    local_video_path = await ensure_local_file(video_path)
    if not os.path.exists(local_video_path):
        raise HTTPException(status_code=400, detail="Failed to retrieve video file for processing.")

    # 1. Create a temporary folder for frames
    job_id = str(uuid.uuid4())
    temp_frames_dir = os.path.join(PROCESSED_FRAMES_DIR, job_id)
    
    try:
        # 2. Extract frames (every 10 seconds)
        frame_paths = extract_frames(local_video_path, temp_frames_dir, interval=10)
        
        if not frame_paths:
            return {"text": "No frames could be extracted from this video.", "video_id": video_id}

        # 3. Perform OCR on each frame
        all_text_blocks = []
        reader = get_reader()
        for frame_path in frame_paths:
            results = reader.readtext(frame_path)
            frame_text = " ".join([res[1] for res in results])
            if frame_text.strip():
                all_text_blocks.append(frame_text)
                
        # 4. Refine and De-duplicate with AI
        combined_raw_text = "\n---\n".join(all_text_blocks)
        
        refined_text = "No text detected in video."
        if combined_raw_text.strip() and client:
            try:
                prompt = (
                    "The following text blocks were extracted from different frames of a video lecture using OCR. "
                    "There are likely many repetitions and OCR errors. Please clean this up, remove duplicates, "
                    "fix errors, and provide a coherent, structured summary of the text that appeared on screen (slides, code, etc.). "
                    "Output ONLY the cleaned text content.\n\n"
                    f"{combined_raw_text[:6000]}" # Limit to avoid token issues
                )
                
                response = client.chat.completions.create(
                    model="deepseek/deepseek-chat",
                    messages=[
                        {"role": "system", "content": "You are a specialist in analyzing and cleaning up OCR data from video lectures."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=client.default_max_tokens
                )
                refined_text = response.choices[0].message.content.strip()
            except Exception as ai_err:
                print(f"AI Video OCR Refinement Error: {ai_err}")
                refined_text = combined_raw_text # Fallback to raw if AI fails
                
        # 5. Save results to DB
        await db.videos.update_one(
            video_filter,
            {"$set": {"video_ocr_text": refined_text}}
        )
        
        # Cleanup temp frames
        shutil.rmtree(temp_frames_dir, ignore_errors=True)
        
        return {
            "text": refined_text,
            "video_id": video_id
        }
        
    except Exception as e:
        print(f"Video OCR Error: {e}")
        shutil.rmtree(temp_frames_dir, ignore_errors=True)
        raise HTTPException(status_code=500, detail=f"Video OCR failed: {str(e)}")
    finally:
        cleanup_local_file(local_video_path)
