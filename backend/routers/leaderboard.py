from fastapi import APIRouter, HTTPException
from bson import ObjectId
from db import get_database

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])

@router.get("/{challenge_id}")
async def get_leaderboard(challenge_id: str):
    db = get_database()
    
    if challenge_id == "all":
        # Get all users sorted by points
        users = []
        async for user in db.users.find({}).sort("points", -1).limit(100):
            users.append({
                "id": str(user["_id"]),
                "username": user["username"],
                "points": user.get("points", 0),
            })
        return users
    else:
        # Get leaderboard for specific challenge
        if not ObjectId.is_valid(challenge_id):
            raise HTTPException(status_code=400, detail="Invalid challenge ID")
        
        # Aggregate submissions for this challenge
        pipeline = [
            {"$match": {"challenge_id": challenge_id, "status": "verified"}},
            {"$group": {
                "_id": "$user_id",
                "total_points": {"$sum": "$points_awarded"},
                "submissions_count": {"$sum": 1}
            }},
            {"$sort": {"total_points": -1}},
            {"$limit": 100}
        ]
        
        leaderboard = []
        async for result in db.submissions.aggregate(pipeline):
            user = await db.users.find_one({"_id": ObjectId(result["_id"])})
            if user:
                leaderboard.append({
                    "id": result["_id"],
                    "username": user["username"],
                    "points": result["total_points"],
                    "submissions": result["submissions_count"],
                })
        
        return leaderboard





