import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables at the very beginning
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, videos, quizzes, ocr, math, chat, vdo_ocr
from database import close_db, get_database

app = FastAPI(title="Smart Multimodal Learning Platform API")

# Configure CORS (Expanding for all origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request, call_next):
    origin = request.headers.get("origin")
    print(f"DEBUG: {request.method} {request.url.path} - Origin: {origin}")
    response = await call_next(request)
    print(f"DEBUG: Response: {response.status_code}")
    return response

# Register routers
app.include_router(auth.router)
app.include_router(videos.router)
app.include_router(quizzes.router)
app.include_router(ocr.router)
app.include_router(math.router)
app.include_router(chat.router)
app.include_router(vdo_ocr.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Smart Multimodal Learning Platform API"}

@app.get("/api/health")
async def health_check():
    db = await get_database()
    try:
        # Ping the database if the object exists
        if db is not None:
            await db.command("ping")
            db_status = "connected"
        else:
            db_status = "not_initialized"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "healthy",
        "database": db_status
    }

@app.on_event("shutdown")
async def shutdown_event():
    await close_db()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
