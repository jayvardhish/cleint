from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import RedirectResponse
from fastapi_sso.sso.google import GoogleSSO
from fastapi_sso.sso.github import GithubSSO
from models import UserCreate, UserInDB, UserResponse, LoginRequest, Token, PasswordResetRequest, PasswordResetConfirm
from auth_utils import get_password_hash, verify_password, create_access_token, decode_token, create_password_reset_token, verify_password_reset_token

from email_utils import email_utils
import os
from database import get_database
from datetime import datetime

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
# Use both common variations for Render (with and without hyphens)
frontend_url = os.getenv("CLIENT_URL") or os.getenv("FRONTEND_URL") or "https://smart-learning-frontend.onrender.com"
# Fallback to Netlify if Render isn't the primary
if not os.getenv("CLIENT_URL") and not os.getenv("FRONTEND_URL"):
    frontend_url = "https://playful-caramel-674bc8.netlify.app"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    print(f"DEBUG: Decoding token: {token[:10]}...")
    payload = decode_token(token)
    if payload is None:
        print("DEBUG: Token decoding failed (payload is None)")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    email: str = payload.get("sub")
    print(f"DEBUG: Token email: {email}")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    
    db = await get_database()
    user = await db.users.find_one({"email": email})
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(
        id=str(user["_id"]),
        username=user["username"],
        email=user["email"],
        profile_picture=user.get("profile_picture"),
        created_at=user["created_at"]
    )

@router.post("/signup", response_model=UserResponse)
async def signup(user_data: UserCreate):
    db = await get_database()
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    new_user = {
        "username": user_data.username,
        "email": user_data.email,
        "password_hash": get_password_hash(user_data.password),
        "profile_picture": user_data.profile_picture,
        "created_at": datetime.utcnow()
    }
    
    try:
        result = await db.users.insert_one(new_user)
        
        return UserResponse(
            id=str(result.inserted_id),
            username=new_user["username"],
            email=new_user["email"],
            profile_picture=new_user["profile_picture"],
            created_at=new_user["created_at"]
        )
    except Exception as e:
        print(f"Signup Database Error: {e}")
        raise HTTPException(status_code=500, detail=f"Signup failed: {str(e)}")

@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest):
    db = await get_database()
    
    user = await db.users.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password")
async def forgot_password(request: PasswordResetRequest):
    db = await get_database()
    user = await db.users.find_one({"email": request.email})
    if user:
        token = create_password_reset_token(request.email)
        # Send actual email
        await email_utils.send_password_reset_email(request.email, token)
        # Keep logging for debug/dev purposes
        print(f"PASSWORD RESET LINK: {frontend_url}/reset-password?token={token}")
    
    return {"message": "If an account exists with this email, you will receive a reset link shortly."}

@router.post("/reset-password")
async def reset_password(request: PasswordResetConfirm):
    email = verify_password_reset_token(request.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    db = await get_database()
    new_hash = get_password_hash(request.new_password)
    await db.users.update_one(
        {"email": email},
        {"$set": {"password_hash": new_hash}}
    )
    
    return {"message": "Password reset successful"}

# OAuth Configuration
backend_url = os.getenv("BACKEND_URL") or os.getenv("RENDER_EXTERNAL_URL") or "https://smart-learning-backend.onrender.com"

google_sso = GoogleSSO(
    client_id=os.getenv("GOOGLE_CLIENT_ID") or "dummy",
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET") or "dummy",
    redirect_uri=os.getenv("GOOGLE_REDIRECT_URI") or f"{backend_url}/api/auth/google/callback",
    allow_insecure_http=True
)

github_sso = GithubSSO(
    client_id=os.getenv("GITHUB_CLIENT_ID") or "dummy",
    client_secret=os.getenv("GITHUB_CLIENT_SECRET") or "dummy",
    redirect_uri=os.getenv("GITHUB_REDIRECT_URI") or f"{backend_url}/api/auth/github/callback",
    allow_insecure_http=True
)

@router.get("/google/login")
async def google_login():
    print(f"DEBUG: Starting Google Login redirect_uri: {google_sso.redirect_uri}")
    async with google_sso:
        return await google_sso.get_login_redirect()

@router.get("/google/callback")
async def google_callback(request: Request):
    try:
        async with google_sso:
            user = await google_sso.verify_and_process(request)
        # Check if user exists, else create
        db = await get_database()
        existing_user = await db.users.find_one({"email": user.email})
        
        if not existing_user:
            new_user = {
                "username": user.display_name or user.email.split("@")[0],
                "email": user.email,
                "password_hash": "", # No password for OAuth users
                "profile_picture": user.picture,
                "created_at": datetime.utcnow(),
                "auth_provider": "google"
            }
            await db.users.insert_one(new_user)
        
        access_token = create_access_token(data={"sub": user.email})
        # Redirect to frontend with token
        target_url = f"{frontend_url}/dashboard?token={access_token}"
        print(f"DEBUG: Google Auth Success. Redirecting back to: {target_url}")
        return RedirectResponse(url=target_url)
    except Exception as e:
        print(f"Google Auth Error: {e}")
        # Return detailed error for debugging
        raise HTTPException(status_code=400, detail=f"Google Authentication Failed: {str(e)}")

@router.get("/github/login")
async def github_login():
    async with github_sso:
        return await github_sso.get_login_redirect()

@router.get("/github/callback")
async def github_callback(request: Request):
    try:
        async with github_sso:
            user = await github_sso.verify_and_process(request)
        db = await get_database()
        existing_user = await db.users.find_one({"email": user.email})
        
        if not existing_user:
            new_user = {
                "username": user.display_name or user.email,
                "email": user.email,
                "password_hash": "",
                "profile_picture": user.picture,
                "created_at": datetime.utcnow(),
                "auth_provider": "github"
            }
            await db.users.insert_one(new_user)
        
        access_token = create_access_token(data={"sub": user.email})
        return RedirectResponse(url=f"{frontend_url}/dashboard?token={access_token}")
    except Exception as e:
        print(f"GitHub Auth Error: {e}")
        raise HTTPException(status_code=400, detail="GitHub Authentication Failed")
