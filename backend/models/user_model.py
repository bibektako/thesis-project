from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from bson import ObjectId


class BadgeEarned(BaseModel):
    badge_id: str
    earned_at: datetime
    challenge_id: Optional[str] = None
    challenge_title: Optional[str] = None


class User(BaseModel):
    id: Optional[str] = None
    username: str
    email: EmailStr
    password_hash: str
    role: str = "user"  # "user" or "admin"
    face_consent: bool = False
    face_embedding: Optional[list] = None
    created_at: datetime = datetime.utcnow()
    points: int = 0
    badges: List[dict] = []  # list of { badge_id, earned_at, challenge_id?, challenge_title? }

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    face_consent: bool = False


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    role: str
    points: int
    face_consent: bool
    badges: List[dict] = []

