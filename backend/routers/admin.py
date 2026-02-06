from fastapi import APIRouter, HTTPException, Depends, Query, Body
from typing import List, Optional
from bson import ObjectId
from datetime import datetime, timezone
from pydantic import BaseModel

from models.challenge_model import Challenge, ChallengeCreate, ChallengeUpdate
from routers.auth import get_current_user
from db import get_database

class RejectRequest(BaseModel):
    reason: Optional[str] = None

router = APIRouter(prefix="/api/admin", tags=["admin"])

async def verify_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.get("/stats")
async def get_admin_stats(admin_user: dict = Depends(verify_admin)):
    """Get admin dashboard statistics"""
    db = get_database()
    
    total_users = await db.users.count_documents({})
    total_challenges = await db.challenges.count_documents({})
    total_submissions = await db.submissions.count_documents({})
    pending_submissions = await db.submissions.count_documents({"status": "pending_admin"})
    verified_submissions = await db.submissions.count_documents({"status": "verified"})
    
    return {
        "total_users": total_users,
        "total_challenges": total_challenges,
        "total_submissions": total_submissions,
        "pending_submissions": pending_submissions,
        "verified_submissions": verified_submissions,
    }

@router.get("/users")
async def get_all_users(admin_user: dict = Depends(verify_admin)):
    """Get all users"""
    db = get_database()
    users = []
    async for user in db.users.find({}).sort("created_at", -1):
        user["id"] = str(user["_id"])
        user["_id"] = str(user["_id"])
        # Remove password hash
        user.pop("password_hash", None)
        users.append(user)
    return users

@router.get("/submissions")
async def get_all_submissions(
    status: Optional[str] = None,
    challenge_id: Optional[str] = None,
    admin_user: dict = Depends(verify_admin)
):
    """Get all submissions (admin only)"""
    db = get_database()
    
    query = {}
    if status:
        query["status"] = status
    if challenge_id and ObjectId.is_valid(challenge_id):
        query["challenge_id"] = challenge_id
    
    submissions = []
    async for submission in db.submissions.find(query).sort("created_at", -1):
        # Get user info
        user = await db.users.find_one({"_id": ObjectId(submission["user_id"])})
        submission["id"] = str(submission["_id"])
        submission["_id"] = str(submission["_id"])
        submission["username"] = user["username"] if user else "Unknown"
        submissions.append(submission)
    
    return submissions

@router.put("/submissions/{submission_id}/approve")
async def approve_submission(
    submission_id: str,
    admin_user: dict = Depends(verify_admin)
):
    """Approve a pending submission"""
    db = get_database()
    
    if not ObjectId.is_valid(submission_id):
        raise HTTPException(status_code=400, detail="Invalid submission ID")
    
    submission = await db.submissions.find_one({"_id": ObjectId(submission_id)})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    if submission["status"] not in ["pending", "pending_admin"]:
        raise HTTPException(status_code=400, detail="Submission is not pending")
    
    # Get challenge to get points
    challenge = await db.challenges.find_one({"_id": ObjectId(submission["challenge_id"])})
    points = challenge.get("points_per_checkpoint", 10) if challenge else 10
    
    # Update submission
    await db.submissions.update_one(
        {"_id": ObjectId(submission_id)},
        {
            "$set": {
                "status": "verified",
                "points_awarded": points,
                "verified_at": datetime.now(timezone.utc)
            }
        }
    )
    
    # Update user points
    await db.users.update_one(
        {"_id": ObjectId(submission["user_id"])},
        {"$inc": {"points": points}}
    )
    
    updated = await db.submissions.find_one({"_id": ObjectId(submission_id)})
    updated["id"] = str(updated["_id"])
    updated["_id"] = str(updated["_id"])
    return updated

@router.put("/submissions/{submission_id}/reject")
async def reject_submission(
    submission_id: str,
    admin_user: dict = Depends(verify_admin),
    reject_data: RejectRequest = Body(None)
):
    """Reject a pending submission"""
    db = get_database()
    
    if not ObjectId.is_valid(submission_id):
        raise HTTPException(status_code=400, detail="Invalid submission ID")
    
    submission = await db.submissions.find_one({"_id": ObjectId(submission_id)})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    if submission["status"] not in ["pending", "pending_admin"]:
        raise HTTPException(status_code=400, detail="Submission is not pending")
    
    update_data = {
        "status": "rejected",
        "rejection_reason": reject_data.reason if reject_data and reject_data.reason else "Rejected by admin"
    }
    
    await db.submissions.update_one(
        {"_id": ObjectId(submission_id)},
        {"$set": update_data}
    )
    
    updated = await db.submissions.find_one({"_id": ObjectId(submission_id)})
    updated["id"] = str(updated["_id"])
    updated["_id"] = str(updated["_id"])
    return updated

@router.post("/challenges", response_model=dict)
async def create_challenge(
    challenge_data: ChallengeCreate,
    admin_user: dict = Depends(verify_admin)
):
    db = get_database()
    
    try:
        # Convert checkpoints to dict (Pydantic v2 compatible)
        checkpoints_list = []
        for cp in challenge_data.checkpoints:
            if hasattr(cp, 'model_dump'):
                checkpoints_list.append(cp.model_dump())
            else:
                checkpoints_list.append(cp.dict())
        
        challenge_dict = {
            "title": challenge_data.title,
            "description": challenge_data.description,
            "checkpoints": checkpoints_list,
            "created_by": str(admin_user["_id"]),
            "created_at": datetime.now(timezone.utc),
            "is_active": True,
            "points_per_checkpoint": challenge_data.points_per_checkpoint
        }
        
        result = await db.challenges.insert_one(challenge_dict)
        challenge_dict["_id"] = result.inserted_id
        
        # Convert ObjectId to string for JSON serialization
        challenge_dict["id"] = str(result.inserted_id)
        challenge_dict["_id"] = str(result.inserted_id)
        
        return challenge_dict
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = str(e)
        print(f"Error creating challenge: {error_detail}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error creating challenge: {error_detail}")

@router.put("/challenges/{challenge_id}", response_model=dict)
async def update_challenge(
    challenge_id: str,
    challenge_data: ChallengeUpdate,
    admin_user: dict = Depends(verify_admin)
):
    db = get_database()
    
    if not ObjectId.is_valid(challenge_id):
        raise HTTPException(status_code=400, detail="Invalid challenge ID")
    
    challenge = await db.challenges.find_one({"_id": ObjectId(challenge_id)})
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    update_dict = {}
    if challenge_data.title is not None:
        update_dict["title"] = challenge_data.title
    if challenge_data.description is not None:
        update_dict["description"] = challenge_data.description
    if challenge_data.checkpoints is not None:
        checkpoints_list = []
        for cp in challenge_data.checkpoints:
            if hasattr(cp, 'model_dump'):
                checkpoints_list.append(cp.model_dump())
            else:
                checkpoints_list.append(cp.dict())
        update_dict["checkpoints"] = checkpoints_list
    if challenge_data.is_active is not None:
        update_dict["is_active"] = challenge_data.is_active
    if challenge_data.points_per_checkpoint is not None:
        update_dict["points_per_checkpoint"] = challenge_data.points_per_checkpoint
    
    await db.challenges.update_one(
        {"_id": ObjectId(challenge_id)},
        {"$set": update_dict}
    )
    
    updated = await db.challenges.find_one({"_id": ObjectId(challenge_id)})
    updated["id"] = str(updated["_id"])
    updated["_id"] = str(updated["_id"])
    return updated

@router.delete("/challenges/{challenge_id}")
async def delete_challenge(
    challenge_id: str,
    admin_user: dict = Depends(verify_admin)
):
    db = get_database()
    
    if not ObjectId.is_valid(challenge_id):
        raise HTTPException(status_code=400, detail="Invalid challenge ID")
    
    result = await db.challenges.delete_one({"_id": ObjectId(challenge_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    return {"message": "Challenge deleted successfully"}

@router.get("/challenges")
async def get_all_challenges_admin(admin_user: dict = Depends(verify_admin)):
    """Get all challenges including inactive ones (admin only)"""
    db = get_database()
    challenges = []
    async for challenge in db.challenges.find({}).sort("created_at", -1):
        challenge["id"] = str(challenge["_id"])
        challenge["_id"] = str(challenge["_id"])
        challenges.append(challenge)
    return challenges
