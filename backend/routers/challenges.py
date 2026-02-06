from fastapi import APIRouter, HTTPException, Depends
from typing import List
from bson import ObjectId

from models.challenge_model import Challenge, ChallengeCreate
from routers.auth import get_current_user
from db import get_database

router = APIRouter(prefix="/api/challenges", tags=["challenges"])

@router.get("", response_model=List[dict])
async def get_challenges():
    db = get_database()
    challenges = []
    async for challenge in db.challenges.find({"is_active": True}):
        challenge["id"] = str(challenge["_id"])
        challenge["_id"] = str(challenge["_id"])
        challenges.append(challenge)
    return challenges

@router.get("/{challenge_id}", response_model=dict)
async def get_challenge(challenge_id: str):
    db = get_database()
    
    if not ObjectId.is_valid(challenge_id):
        raise HTTPException(status_code=400, detail="Invalid challenge ID")
    
    challenge = await db.challenges.find_one({"_id": ObjectId(challenge_id)})
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    challenge["id"] = str(challenge["_id"])
    challenge["_id"] = str(challenge["_id"])
    return challenge





