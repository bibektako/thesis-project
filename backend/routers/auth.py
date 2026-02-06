from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
import bcrypt
from datetime import datetime, timedelta
from bson import ObjectId

from models.user_model import User, UserCreate, UserLogin, UserResponse
from pydantic import BaseModel
from db import get_database
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from ml.face_match import extract_face_embedding

router = APIRouter(prefix="/api/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def verify_password(plain_password, hashed_password):
    if isinstance(plain_password, str):
        plain_password = plain_password.encode('utf-8')
    if isinstance(hashed_password, str):
        hashed_password = hashed_password.encode('utf-8')
    return bcrypt.checkpw(plain_password[:72], hashed_password)

def get_password_hash(password):
    if isinstance(password, str):
        password = password.encode('utf-8')
    return bcrypt.hashpw(password[:72], bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise credentials_exception
    
    return user

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    db = get_database()
    
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    existing_username = await db.users.find_one({"username": user_data.username})
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create user
    user_dict = {
        "username": user_data.username,
        "email": user_data.email,
        "password_hash": get_password_hash(user_data.password),
        "role": "user",
        "face_consent": user_data.face_consent,
        "face_embedding": None,
        "created_at": datetime.utcnow(),
        "points": 0,
        "badges": [],
    }
    
    result = await db.users.insert_one(user_dict)
    user_dict["_id"] = result.inserted_id
    
    return UserResponse(
        id=str(user_dict["_id"]),
        username=user_dict["username"],
        email=user_dict["email"],
        role=user_dict["role"],
        points=user_dict["points"],
        face_consent=user_dict["face_consent"],
        badges=user_dict.get("badges", []),
    )

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_database()
    
    user = await db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": str(user["_id"])})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(
            id=str(user["_id"]),
            username=user["username"],
            email=user["email"],
            role=user["role"],
            points=user["points"],
            face_consent=user.get("face_consent", False),
            badges=user.get("badges", []),
        )
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user["_id"]),
        username=current_user["username"],
        email=current_user["email"],
        role=current_user["role"],
        points=current_user["points"],
        face_consent=current_user.get("face_consent", False),
        badges=current_user.get("badges", []),
    )


# Badge IDs that can be awarded via API (e.g. altitude warning acknowledgment)
ALLOWED_SINGLE_BADGES = {"altitude_aware"}


class AwardBadgeRequest(BaseModel):
    badge_id: str


@router.post("/me/badges", response_model=dict)
async def award_badge(
    body: AwardBadgeRequest,
    current_user: dict = Depends(get_current_user),
):
    """Award a single badge (e.g. altitude_aware when user acknowledges altitude warning)."""
    badge_id = body.badge_id
    if badge_id not in ALLOWED_SINGLE_BADGES:
        raise HTTPException(status_code=400, detail="Invalid or disallowed badge_id")
    db = get_database()
    user_id = str(current_user["_id"])
    from datetime import datetime, timezone
    new_badge = {
        "badge_id": badge_id,
        "earned_at": datetime.now(timezone.utc).isoformat(),
        "challenge_id": None,
        "challenge_title": None,
    }
    existing = current_user.get("badges") or []
    if any(b.get("badge_id") == badge_id for b in existing):
        return {"awarded": False, "message": "Already have this badge"}
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$push": {"badges": new_badge}},
    )
    return {"awarded": True, "badge_id": badge_id}

