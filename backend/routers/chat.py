from fastapi import APIRouter, Depends, HTTPException, Body
from database import get_database
from routers.auth import get_current_user
from models import UserResponse
from datetime import datetime
import os
from ai_client import client

router = APIRouter(prefix="/api/chat", tags=["Chatbot"])

@router.post("/message")
async def send_message(
    message: str = Body(..., embed=True),
    current_user: UserResponse = Depends(get_current_user)
):
    db = await get_database()
    
    # Get recent conversation history
    history = await db.chat_history.find({"user_id": current_user.id}).sort("timestamp", -1).limit(10).to_list(10)
    history.reverse()
    
    messages = [
        {"role": "system", "content": "You are a helpful and knowledgeable virtual tutor. Help the user understand complex concepts, solve problems, and provide educational guidance. Keep responses encouraging and professional."}
    ]
    
    for h in history:
        messages.append({"role": h["role"], "content": h["content"]})
    
    messages.append({"role": "user", "content": message})

    try:
        # Save user message FIRST to prevent loss if AI fails
        await db.chat_history.insert_one({
            "user_id": current_user.id,
            "role": "user",
            "content": message,
            "timestamp": datetime.utcnow()
        })

        response = client.chat.completions.create(
            model=getattr(client, "model_name", "deepseek-chat"),
            messages=messages,
            max_tokens=client.default_max_tokens
        )
        
        reply = response.choices[0].message.content
        
        # Save assistant reply
        await db.chat_history.insert_one({
            "user_id": current_user.id,
            "role": "assistant",
            "content": reply,
            "timestamp": datetime.utcnow()
        })
        
        return {"reply": reply}
    except Exception as e:
        print(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get tutor response")

@router.get("/history")
async def get_chat_history(current_user: UserResponse = Depends(get_current_user)):
    db = await get_database()
    history = await db.chat_history.find({"user_id": current_user.id}).sort("timestamp", 1).to_list(100)
    for h in history:
        h["_id"] = str(h["_id"])
    return history

@router.delete("/history")
async def clear_chat_history(current_user: UserResponse = Depends(get_current_user)):
    db = await get_database()
    result = await db.chat_history.delete_many({"user_id": current_user.id})
    return {"status": "success", "deleted_count": result.deleted_count}
