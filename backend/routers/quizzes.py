from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from typing import List, Optional, Annotated
import os
import uuid
from datetime import datetime
from database import get_database
from bson import ObjectId
from routers.auth import get_current_user
from models import UserResponse
from ai_client import client
import PyPDF2
import json

router = APIRouter(prefix="/api/quizzes", tags=["Quizzes"])

UPLOAD_DIR = "uploads/docs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# DeepSeek Client is imported as 'client'

def extract_text(file_path):
    """Extracts text from PDF or TXT files. Docs support requires python-docx (not installed)."""
    ext = os.path.splitext(file_path)[1].lower()
    text = ""
    try:
        if ext == ".pdf":
            with open(file_path, "rb") as f:
                pdf = PyPDF2.PdfReader(f)
                for page in pdf.pages:
                    text += page.extract_text() or ""
        elif ext == ".txt":
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
        elif ext == ".docx":
            # Direct binary read of .docx will fail, needs a library or better handling
            # Leaving as is but avoiding crash
            pass
    except Exception as e:
        print(f"Extraction Error: {e}")
    return text.strip()

from utils.cloudinary_utils import upload_file_to_cloudinary
from utils.file_manager import ensure_local_file, cleanup_local_file

@router.post("/generate")
async def generate_quiz(
    file: Optional[UploadFile] = File(None),
    content: Optional[str] = Form(None),
    difficulty: str = Form("medium"),
    num_questions: int = Form(5),
    current_user: UserResponse = Depends(get_current_user)
):
    source_text = content or ""
    
    if file:
        # 1. Upload to Cloudinary
        try:
            secure_url = upload_file_to_cloudinary(file, folder="quizzes", resource_type="raw")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"File persistence failed: {str(e)}")
            
        # 2. Extract Text (Temp download)
        local_path = None
        try:
            local_path = await ensure_local_file(secure_url)
            extracted = extract_text(local_path)
            source_text += f"\n\n{extracted}"
        except Exception as e:
            print(f"Extraction Pipeline Error: {e}")
        finally:
            if local_path:
                cleanup_local_file(local_path)
    
    if not source_text.strip():
        raise HTTPException(status_code=400, detail="No source knowledge provided for generation.")

    source_text = source_text.strip()
    source_preview = source_text[:3000] # Truncate for prompt safety

    prompt = f"""
    Generate a JSON quiz based on this content. 
    Difficulty: {difficulty}
    Number of questions: {num_questions}
    
    Format:
    {{
      "title": "Quiz Title",
      "questions": [
        {{
          "question": "The question text?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct_answer": "Option A",
          "explanation": "Brief explanation"
        }}
      ]
    }}
    
    Content: {source_preview}
    """

    try:
        response = client.chat.completions.create(
            model=getattr(client, "model_name", "deepseek-chat"),
            messages=[
                {"role": "system", "content": "You are a specialized quiz generator. Return ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"} if not getattr(client, "is_fallback", False) else None,
            max_tokens=client.default_max_tokens
        )
        
        quiz_data = json.loads(response.choices[0].message.content)
        
        db = await get_database()
        quiz_doc = {
            "user_id": current_user.id,
            "title": quiz_data.get("title", "Untitled Quiz"),
            "questions": quiz_data.get("questions", []),
            "difficulty": difficulty,
            "created_at": datetime.utcnow()
        }
        
        result = await db.quizzes.insert_one(quiz_doc)
        
        return {
            "id": str(result.inserted_id),
            "title": quiz_doc["title"],
            "questions": quiz_doc["questions"]
        }
    except Exception as e:
        print(f"Quiz Generation Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate quiz: {str(e)}")

@router.get("/")
async def get_user_quizzes(current_user: UserResponse = Depends(get_current_user)):
    db = await get_database()
    quizzes = await db.quizzes.find({"user_id": current_user.id}).to_list(100)
    for q in quizzes:
        q["_id"] = str(q["_id"])
    return quizzes
