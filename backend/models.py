from typing import Optional, List, Annotated, Any
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel, EmailStr, Field, BeforeValidator, PlainSerializer

def validate_object_id(v: Any) -> ObjectId:
    if isinstance(v, ObjectId):
        return v
    if not ObjectId.is_valid(v):
        raise ValueError("Invalid ObjectId")
    return ObjectId(v)

PyObjectId = Annotated[
    ObjectId,
    BeforeValidator(validate_object_id),
    PlainSerializer(lambda v: str(v), return_type=str),
]

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    profile_picture: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserInDB(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
