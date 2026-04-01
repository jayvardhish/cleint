from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from typing import List, Optional
import os
import uuid
import shutil
import base64
from datetime import datetime
from database import get_database
from bson import ObjectId
from routers.auth import get_current_user
from models import UserResponse
from ai_client import client
from ocr_utils import get_reader
from utils.cloudinary_utils import upload_file_to_cloudinary
from utils.file_manager import ensure_local_file, cleanup_local_file

router = APIRouter(prefix="/api/ocr", tags=["OCR"])

UPLOAD_DIR = "uploads/ocr"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --- Helper Functions ---

async def perform_vision_ocr(content: bytes, mime_type: str, mode: str) -> str:
    """Uses AI Vision to extract text from an image with layout awareness."""
    if not client:
        return ""
    
    base64_image = base64.b64encode(content).decode('utf-8')
    
    # Mode-based prompt engineering
    if mode == "structured":
        system_prompt = "You are an expert OCR system specialized in handwritten documents. Your priority is preserving the structural layout (columns, lists, headers)."
        user_prompt = "Transcribe this handwritten page. Maintain the original layout. If there are columns, use a clear text representation of them. Output ONLY the transcribed text."
    elif mode == "clean":
        system_prompt = "You are an expert OCR system focused on readability and flow."
        user_prompt = "Convert this handwritten note into clean, professional digital text. Correct spelling mistakes and format it for high readability. Output ONLY the transcribed text."
    else: # default
        system_prompt = "You are an accurate OCR system for handwritten text."
        user_prompt = "Please accurately transcribe all handwritten text in this image. Do not add any commentary. Output ONLY the text found."

    # Try to use Groq's Vision model if Groq is active
    if not getattr(client, "is_fallback", False) and getattr(client, "model_name", "") == "llama-3.3-70b-versatile":
        vision_model = "llama-3.2-11b-vision-preview"
        vision_client = client
    else:
        # If fallback is active (DeepSeek etc.), they might not support vision cleanly here
        return ""

    try:
        response = vision_client.chat.completions.create(
            model=vision_model, 
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": user_prompt},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{mime_type};base64,{base64_image}"}
                        }
                    ]
                }
            ],
            max_tokens=getattr(vision_client, "default_max_tokens", 2000)
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Vision OCR Error: {e}")
        return ""

# --- Endpoints ---

@router.post("/upload")
async def recognize_handwriting(
    file: UploadFile = File(...),
    mode: str = Form("default"),
    current_user: UserResponse = Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are supported for OCR.")
    
    file_id = str(uuid.uuid4())
    
    # 1. Read File for Vision OCR
    content = await file.read()
    await file.seek(0)
    
    # Upload to Cloudinary
    try:
        secure_url = upload_file_to_cloudinary(file, folder="ocr", resource_type="image")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cloudinary error: {str(e)}")
    
    local_temp_path = None
    try:
        # 2. Try High-Fidelity Vision OCR first
        text = await perform_vision_ocr(content, file.content_type, mode)
        
        # 3. Fallback to Local OCR if Vision fails or returns empty
        if not text:
            print("OCR Detail: Vision failed or returned empty. Falling back to local EasyOCR.")
            local_temp_path = await ensure_local_file(secure_url)
            reader = get_reader()
            results = reader.readtext(local_temp_path)
            text = " ".join([res[1] for res in results])
        
        if not text:
            text = "No legible text could be extracted from this image."

        # 4. Store in Database
        db = await get_database()
        ocr_doc = {
            "_id": file_id,
            "user_id": current_user.id,
            "title": file.filename,
            "text": text,
            "image_path": secure_url,
            "type": "handwriting",
            "mode": mode,
            "created_at": datetime.utcnow()
        }
        await db.ocr.insert_one(ocr_doc)
        
        return {
            "id": file_id,
            "text": text,
            "mode": mode,
            "image_url": secure_url
        }
        
    except Exception as e:
        print(f"OCR Pipeline Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process image OCR.")
    finally:
        if local_temp_path:
            cleanup_local_file(local_temp_path)

@router.get("/history")
async def get_ocr_history(current_user: UserResponse = Depends(get_current_user)):
    db = await get_database()
    # Using 'ocr' collection as per previous logic, but ensuring it's queried by user
    history = await db.ocr.find({"user_id": current_user.id}).sort("created_at", -1).to_list(100)
    for item in history:
        item["_id"] = str(item["_id"])
    return history

@router.delete("/{ocr_id}")
async def delete_ocr_item(
    ocr_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    db = await get_database()
    
    ocr_filter = {"user_id": current_user.id}
    try:
        ocr_filter["_id"] = ObjectId(ocr_id)
    except:
        ocr_filter["_id"] = ocr_id

    result = await db.ocr.delete_one(ocr_filter)
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="OCR record not found.")
    return {"status": "success"}
