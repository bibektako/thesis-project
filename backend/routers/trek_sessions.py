from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId

from models.trek_session_model import TrekSession, TrekSessionStart, TrekSessionCancel
from routers.auth import get_current_user
from db import get_database

router = APIRouter(prefix="/api/trek-sessions", tags=["trek-sessions"])


@router.post("/start", response_model=dict)
async def start_trek(
    trek_data: TrekSessionStart,
    current_user: dict = Depends(get_current_user)
):
    """Start a new trek session for a challenge"""
    db = get_database()
    user_id = str(current_user["_id"])

    # Validate challenge
    if not ObjectId.is_valid(trek_data.challenge_id):
        raise HTTPException(status_code=400, detail="Invalid challenge ID")

    challenge = await db.challenges.find_one({"_id": ObjectId(trek_data.challenge_id)})
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    if not challenge.get("is_active", False):
        raise HTTPException(status_code=400, detail="Challenge is not active")

    # Check if user already has an active trek for this challenge
    existing = await db.trek_sessions.find_one({
        "user_id": user_id,
        "challenge_id": trek_data.challenge_id,
        "status": "active"
    })
    if existing:
        existing["id"] = str(existing["_id"])
        existing["_id"] = str(existing["_id"])
        return existing

    # Count already completed checkpoints for this user+challenge
    completed_count = await db.submissions.count_documents({
        "user_id": user_id,
        "challenge_id": trek_data.challenge_id,
        "status": "verified"
    })

    total_checkpoints = len(challenge.get("checkpoints", []))

    session_dict = {
        "user_id": user_id,
        "challenge_id": trek_data.challenge_id,
        "status": "active",
        "started_at": datetime.now(timezone.utc),
        "cancelled_at": None,
        "completed_at": None,
        "cancel_reason": None,
        "checkpoints_completed": completed_count,
        "total_checkpoints": total_checkpoints,
    }

    result = await db.trek_sessions.insert_one(session_dict)
    session_dict["id"] = str(result.inserted_id)
    session_dict["_id"] = str(result.inserted_id)

    return session_dict


@router.put("/{session_id}/cancel", response_model=dict)
async def cancel_trek(
    session_id: str,
    cancel_data: TrekSessionCancel,
    current_user: dict = Depends(get_current_user)
):
    """Cancel an active trek session"""
    db = get_database()
    user_id = str(current_user["_id"])

    if not ObjectId.is_valid(session_id):
        raise HTTPException(status_code=400, detail="Invalid session ID")

    session = await db.trek_sessions.find_one({"_id": ObjectId(session_id)})
    if not session:
        raise HTTPException(status_code=404, detail="Trek session not found")

    if session["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    if session["status"] != "active":
        raise HTTPException(status_code=400, detail="Trek session is not active")

    await db.trek_sessions.update_one(
        {"_id": ObjectId(session_id)},
        {
            "$set": {
                "status": "cancelled",
                "cancelled_at": datetime.now(timezone.utc),
                "cancel_reason": cancel_data.reason or "User cancelled"
            }
        }
    )

    updated = await db.trek_sessions.find_one({"_id": ObjectId(session_id)})
    updated["id"] = str(updated["_id"])
    updated["_id"] = str(updated["_id"])
    return updated


@router.get("/active", response_model=Optional[dict])
async def get_active_trek(
    challenge_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get current user's active trek session, optionally filtered by challenge"""
    db = get_database()
    user_id = str(current_user["_id"])

    query = {"user_id": user_id, "status": "active"}
    if challenge_id:
        if not ObjectId.is_valid(challenge_id):
            raise HTTPException(status_code=400, detail="Invalid challenge ID")
        query["challenge_id"] = challenge_id

    session = await db.trek_sessions.find_one(query, sort=[("started_at", -1)])
    if not session:
        return None

    session["id"] = str(session["_id"])
    session["_id"] = str(session["_id"])
    return session


@router.get("/history", response_model=List[dict])
async def get_trek_history(
    current_user: dict = Depends(get_current_user)
):
    """Get all trek sessions for the current user"""
    db = get_database()
    user_id = str(current_user["_id"])

    sessions = []
    async for session in db.trek_sessions.find(
        {"user_id": user_id}
    ).sort("started_at", -1):
        session["id"] = str(session["_id"])
        session["_id"] = str(session["_id"])
        sessions.append(session)

    return sessions
