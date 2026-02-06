from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from bson import ObjectId

class OCRResult(BaseModel):
    extracted_text: str
    match_score: float

class GPSResult(BaseModel):
    distance: float
    is_valid: bool

class FaceResult(BaseModel):
    liveness_score: float
    is_valid: bool
    match_score: Optional[float] = None

class Submission(BaseModel):
    id: Optional[str] = None
    user_id: str
    challenge_id: str
    checkpoint_id: str
    photo_path: str
    selfie_path: Optional[str] = None
    gps_latitude: float
    gps_longitude: float
    status: str = "pending"  # pending, verified, rejected, pending_admin
    ocr: Optional[OCRResult] = None
    gps: Optional[GPSResult] = None
    face: Optional[FaceResult] = None
    points_awarded: int = 0
    created_at: datetime = datetime.utcnow()
    verified_at: Optional[datetime] = None

class SubmissionCreate(BaseModel):
    challenge_id: str
    checkpoint_id: str
    gps_latitude: float
    gps_longitude: float

