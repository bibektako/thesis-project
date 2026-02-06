from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime, timezone
from bson import ObjectId

from models.challenge_model import Challenge, ChallengeCreate
from routers.auth import get_current_user
from db import get_database
from utils.badges import get_badges_to_award, BADGE_CATALOG

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


@router.get("/badges/catalog", response_model=dict)
async def get_badges_catalog():
    """Return badge catalog for the app (icons, names, descriptions)."""
    return BADGE_CATALOG


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


@router.post("/{challenge_id}/safe-exit", response_model=dict)
async def safe_exit_challenge(
    challenge_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Safe Exit: user abandons the challenge and receives badges for checkpoints completed.
    Returns earned_badges (with catalog info), completed_checkpoints, total_checkpoints.
    """
    db = get_database()
    user_id = str(current_user["_id"])

    if not ObjectId.is_valid(challenge_id):
        raise HTTPException(status_code=400, detail="Invalid challenge ID")

    challenge = await db.challenges.find_one({"_id": ObjectId(challenge_id)})
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    total_checkpoints = len(challenge.get("checkpoints", []))
    completed_count = await db.submissions.count_documents({
        "user_id": user_id,
        "challenge_id": challenge_id,
        "status": {"$in": ["verified", "pending_admin"]},
    })

    challenge_title = challenge.get("title", "")
    to_award = get_badges_to_award(
        completed_count, total_checkpoints, challenge_id, challenge_title
    )

    # Only add badges user doesn't already have for this challenge (by badge_id)
    existing_badges = current_user.get("badges") or []
    existing_keys = {(b.get("challenge_id"), b.get("badge_id")) for b in existing_badges}
    new_badges = [b for b in to_award if (b["challenge_id"], b["badge_id"]) not in existing_keys]

    if new_badges:
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$push": {"badges": {"$each": new_badges}}},
        )

    # Cancel active trek session if any
    await db.trek_sessions.update_many(
        {"user_id": user_id, "challenge_id": challenge_id, "status": "active"},
        {"$set": {"status": "cancelled", "cancel_reason": "Safe exit", "cancelled_at": datetime.now(timezone.utc)}},
    )

    # Build response with catalog info for earned badges
    earned_with_info = []
    for b in new_badges:
        info = BADGE_CATALOG.get(b["badge_id"], {})
        earned_with_info.append({
            **b,
            "name": info.get("name", b["badge_id"]),
            "description": info.get("description", ""),
            "icon": info.get("icon", "ribbon"),
            "gradient": info.get("gradient", ["#6366F1", "#8B5CF6"]),
        })

    return {
        "earned_badges": earned_with_info,
        "completed_checkpoints": completed_count,
        "total_checkpoints": total_checkpoints,
        "challenge_title": challenge_title,
    }





