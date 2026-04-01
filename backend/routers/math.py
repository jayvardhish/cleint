from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from typing import List, Optional
import os
import uuid
import shutil
from datetime import datetime
from database import get_database
from bson import ObjectId
from routers.auth import get_current_user
from models import UserResponse
from ai_client import client
from ocr_utils import get_reader
from pydantic import BaseModel
from utils.cloudinary_utils import upload_file_to_cloudinary
from utils.file_manager import ensure_local_file, cleanup_local_file

router = APIRouter(prefix="/api/math", tags=["Math"])

UPLOAD_DIR = "uploads/math"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class MathTextRequest(BaseModel):
    expression: str

# --- Helper Functions ---

async def refine_math_ocr(raw_text: str) -> str:
    """Uses AI to clean up OCR results into valid LaTeX/Math format."""
    if not client or not raw_text.strip():
        return raw_text
    
    prompt = (
        "The following text was extracted from an image of a math problem using OCR. "
        "It likely contains errors in symbols like '=', '+', 'x^2', etc. "
        "Please correct these errors and return ONLY the mathematical expression in a clean LaTeX-friendly format. "
        "Output NOTHING ELSE but the expression.\n\n"
        f"Raw OCR: {raw_text}"
    )
    
    try:
        response = client.chat.completions.create(
            model=getattr(client, "model_name", "deepseek-chat"),
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Math OCR Refinement Error: {e}")
        return raw_text

async def get_pro_solution(expression: str) -> str:
    """Gets a detailed, step-by-step mathematical solution from the AI."""
    if not client:
        return "AI Solver is currently offline."
    
    prompt = (
        f"Problem: {expression}\n\n"
        "Please provide a rigorous, professional, step-by-step mathematical solution. "
        "Strict Formatting Requirements:\n"
        "1. Use LaTeX for ALL mathematical symbols, variables, and expressions.\n"
        "2. Use $...$ for inline math (e.g., $x = 5$).\n"
        "3. Use $$...$$ for standalone block equations or derivations.\n"
        "4. NEVER use plain text for math (e.g., don't write 'x^2', write '$x^2$').\n"
        "5. Explain the REASONING behind each step clearly.\n"
        "6. State every formula or theorem used in its own LaTeX block.\n"
        "7. Provide the final result in a bold, boxed LaTeX format at the very end."
    )
    
    try:
        response = client.chat.completions.create(
            model=getattr(client, "model_name", "deepseek-chat"),
            messages=[
                {"role": "system", "content": "You are a professional mathematician and tutor. You provide clear, rigorous, and easy-to-understand solutions."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=client.default_max_tokens
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Math Solving Error: {e}")
        return "I encountered an error while trying to solve this problem. Please check the expression and try again."

# --- Endpoints ---

@router.post("/solve")
async def solve_from_image(
    file: UploadFile = File(...),
    current_user: UserResponse = Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")
    
    file_id = str(uuid.uuid4())
    
    # Upload to Cloudinary
    try:
        secure_url = upload_file_to_cloudinary(file, folder="math", resource_type="image")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cloudinary error: {str(e)}")
        
    local_temp_path = None
    try:
        # Download temp for local OCR
        local_temp_path = await ensure_local_file(secure_url)
        
        # 2. Extract Text via Local OCR
        reader = get_reader()
        results = reader.readtext(local_temp_path)
        raw_text = " ".join([res[1] for res in results])
        
        # 3. Refine via AI
        expression = await refine_math_ocr(raw_text)
        
        # 4. Get Pro Solution
        solution = await get_pro_solution(expression)
        
        # 5. Store in Database
        db = await get_database()
        math_doc = {
            "_id": file_id,
            "user_id": current_user.id,
            "expression": expression,
            "solution": solution,
            "image_path": secure_url,
            "type": "image",
            "created_at": datetime.utcnow()
        }
        await db.math_solutions.insert_one(math_doc)
        
        return {
            "id": file_id,
            "expression": expression,
            "solution": solution,
            "image_url": secure_url
        }
        
    except Exception as e:
        print(f"Math Image Pipeline Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process math image.")
    finally:
        if local_temp_path:
            cleanup_local_file(local_temp_path)

@router.post("/solve-text")
async def solve_from_text(
    request: MathTextRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    if not request.expression.strip():
        raise HTTPException(status_code=400, detail="Expression cannot be empty.")
    
    try:
        # 1. Get Pro Solution
        solution = await get_pro_solution(request.expression)
        
        # 2. Store in Database
        db = await get_database()
        math_id = str(uuid.uuid4())
        math_doc = {
            "_id": math_id,
            "user_id": current_user.id,
            "expression": request.expression,
            "solution": solution,
            "type": "text",
            "created_at": datetime.utcnow()
        }
        await db.math_solutions.insert_one(math_doc)
        
        return {
            "id": math_id,
            "solution": solution
        }
    except Exception as e:
        print(f"Math Text Pipeline Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to solve math expression.")

@router.get("/history")
async def get_math_history(current_user: UserResponse = Depends(get_current_user)):
    db = await get_database()
    history = await db.math_solutions.find({"user_id": current_user.id}).sort("created_at", -1).to_list(100)
    for item in history:
        item["_id"] = str(item["_id"])
    return history

@router.delete("/{math_id}")
async def delete_math_item(
    math_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    db = await get_database()
    
    math_filter = {"user_id": current_user.id}
    try:
        math_filter["_id"] = ObjectId(math_id)
    except:
        math_filter["_id"] = math_id

    result = await db.math_solutions.delete_one(math_filter)
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"status": "success"}
