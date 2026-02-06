import os
import uuid
from pathlib import Path
from fastapi import UploadFile
from config import PHOTOS_DIR, SELFIES_DIR

async def save_photo(file: UploadFile, user_id: str) -> str:
    """Save photo and return relative path"""
    ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    filename = f"{user_id}_{uuid.uuid4()}.{ext}"
    filepath = PHOTOS_DIR / filename
    
    with open(filepath, "wb") as f:
        content = await file.read()
        f.write(content)
    
    return f"uploads/photos/{filename}"

async def save_selfie(file: UploadFile, user_id: str) -> str:
    """Save selfie and return relative path"""
    ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    filename = f"{user_id}_{uuid.uuid4()}.{ext}"
    filepath = SELFIES_DIR / filename
    
    with open(filepath, "wb") as f:
        content = await file.read()
        f.write(content)
    
    return f"uploads/selfies/{filename}"





