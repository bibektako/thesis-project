from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Query
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId

from models.submission_model import Submission, SubmissionCreate
from routers.auth import get_current_user
from db import get_database
from utils.storage import save_photo, save_selfie
from utils.gps import is_gps_valid
from utils.fuzzy import is_ocr_match
from ml.ocr import extract_text
from ml.liveness import calculate_liveness_score
from ml.face_match import extract_face_embedding, match_faces
from config import OCR_THRESHOLD, LIVENESS_THRESHOLD, FACE_MATCH_THRESHOLD

router = APIRouter(prefix="/api/submissions", tags=["submissions"])

@router.post("", response_model=dict)
async def create_submission(
    challenge_id: str = Form(...),
    checkpoint_id: str = Form(...),
    gps_latitude: float = Form(...),
    gps_longitude: float = Form(...),
    photo: UploadFile = File(...),
    selfie: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    
    # Validate challenge and checkpoint
    if not ObjectId.is_valid(challenge_id):
        raise HTTPException(status_code=400, detail="Invalid challenge ID")
    
    challenge = await db.challenges.find_one({"_id": ObjectId(challenge_id)})
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    checkpoint = None
    for cp in challenge["checkpoints"]:
        if cp["checkpoint_id"] == checkpoint_id:
            checkpoint = cp
            break
    
    if not checkpoint:
        raise HTTPException(status_code=404, detail="Checkpoint not found")
    
    user_id = str(current_user["_id"])
    
    # Save files
    photo_path = await save_photo(photo, user_id)
    selfie_path = None
    if selfie:
        selfie_path = await save_selfie(selfie, user_id)
    
    # Create submission document
    submission_dict = {
        "user_id": user_id,
        "challenge_id": challenge_id,
        "checkpoint_id": checkpoint_id,
        "photo_path": photo_path,
        "selfie_path": selfie_path,
        "gps_latitude": gps_latitude,
        "gps_longitude": gps_longitude,
        "status": "pending",
        "ocr": None,
        "gps": None,
        "face": None,
        "points_awarded": 0,
        "created_at": datetime.now(timezone.utc),
        "verified_at": None
    }
    
    result = await db.submissions.insert_one(submission_dict)
    submission_id = str(result.inserted_id)
    
    # Run verification immediately
    await verify_submission(submission_id, checkpoint, current_user, challenge)
    
    # Fetch updated submission
    updated = await db.submissions.find_one({"_id": ObjectId(submission_id)})
    updated["id"] = str(updated["_id"])
    updated["_id"] = str(updated["_id"])
    
    return updated

async def verify_submission(submission_id: str, checkpoint: dict, user: dict, challenge: dict):
    """Run verification pipeline for submission"""
    db = get_database()
    submission = await db.submissions.find_one({"_id": ObjectId(submission_id)})
    
    if not submission:
        return
    
    from config import BASE_DIR
    
    photo_full_path = BASE_DIR / submission["photo_path"]
    selfie_full_path = BASE_DIR / submission["selfie_path"] if submission.get("selfie_path") else None
    
    verification_results = {
        "ocr": None,
        "gps": None,
        "face": None,
        "status": "pending",
        "points_awarded": 0
    }
    
    # 1. GPS Validation
    if checkpoint.get("gps_required", True):
        is_valid, distance = is_gps_valid(
            checkpoint["latitude"],
            checkpoint["longitude"],
            submission["gps_latitude"],
            submission["gps_longitude"],
            checkpoint.get("gps_radius", 50.0)
        )
        verification_results["gps"] = {
            "distance": distance,
            "is_valid": is_valid
        }
        
        if not is_valid:
            verification_results["status"] = "rejected"
            await db.submissions.update_one(
                {"_id": ObjectId(submission_id)},
                {"$set": verification_results}
            )
            return
    
    # 2. OCR Validation
    if checkpoint.get("require_photo", True):
        extracted_text = extract_text(str(photo_full_path))
        is_match, score = is_ocr_match(extracted_text, checkpoint["expected_sign_text"], OCR_THRESHOLD)
        
        verification_results["ocr"] = {
            "extracted_text": extracted_text,
            "match_score": score
        }
        
        if not is_match:
            verification_results["status"] = "pending_admin"
    
    # 3. Liveness Validation (if selfie required)
    if checkpoint.get("require_selfie", False) and selfie_full_path:
        liveness_score = calculate_liveness_score(str(selfie_full_path))
        is_valid = liveness_score >= LIVENESS_THRESHOLD
        
        verification_results["face"] = {
            "liveness_score": liveness_score,
            "is_valid": is_valid
        }
        
        if not is_valid:
            verification_results["status"] = "pending_admin"
    
    # 4. Face Matching (if user consented)
    if user.get("face_consent") and selfie_full_path and user.get("face_embedding"):
        new_embedding = extract_face_embedding(str(selfie_full_path))
        if new_embedding:
            is_match, match_score = match_faces(
                user["face_embedding"],
                new_embedding,
                FACE_MATCH_THRESHOLD
            )
            if verification_results["face"]:
                verification_results["face"]["match_score"] = match_score
            else:
                verification_results["face"] = {
                    "liveness_score": 0.0,
                    "is_valid": False,
                    "match_score": match_score
                }
    
    # 5. Final decision
    if verification_results["status"] == "pending":
        verification_results["status"] = "verified"
        verification_results["points_awarded"] = challenge.get("points_per_checkpoint", 10)
        verification_results["verified_at"] = datetime.now(timezone.utc)
        
        # Update user points
        await db.users.update_one(
            {"_id": ObjectId(user["_id"])},
            {"$inc": {"points": verification_results["points_awarded"]}}
        )
    
    # Update submission
    await db.submissions.update_one(
        {"_id": ObjectId(submission_id)},
        {"$set": verification_results}
    )

@router.get("", response_model=List[dict])
async def get_submissions(
    challenge_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get submissions for current user, optionally filtered by challenge_id"""
    db = get_database()
    
    query = {"user_id": str(current_user["_id"])}
    if challenge_id:
        if ObjectId.is_valid(challenge_id):
            query["challenge_id"] = challenge_id
        else:
            raise HTTPException(status_code=400, detail="Invalid challenge ID")
    
    submissions = []
    async for submission in db.submissions.find(query).sort("created_at", -1):
        submission["id"] = str(submission["_id"])
        submission["_id"] = str(submission["_id"])
        submissions.append(submission)
    
    return submissions

@router.get("/{submission_id}", response_model=dict)
async def get_submission(
    submission_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    
    if not ObjectId.is_valid(submission_id):
        raise HTTPException(status_code=400, detail="Invalid submission ID")
    
    submission = await db.submissions.find_one({"_id": ObjectId(submission_id)})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    # Check ownership or admin
    if submission["user_id"] != str(current_user["_id"]) and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    submission["id"] = str(submission["_id"])
    submission["_id"] = str(submission["_id"])
    return submission

