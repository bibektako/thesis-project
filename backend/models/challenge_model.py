from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

class RoutePoint(BaseModel):
    latitude: float
    longitude: float

class Checkpoint(BaseModel):
    checkpoint_id: str
    title: str
    description: str
    latitude: float
    longitude: float
    expected_sign_text: str
    require_selfie: bool = False
    require_photo: bool = True
    order_index: int
    gps_required: bool = True
    gps_radius: float = 50.0  # meters

class Challenge(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    checkpoints: List[Checkpoint]
    route_points: List[RoutePoint] = []
    created_by: str
    created_at: datetime = datetime.utcnow()
    is_active: bool = True
    points_per_checkpoint: int = 10

class ChallengeCreate(BaseModel):
    title: str
    description: str
    checkpoints: List[Checkpoint]
    route_points: List[RoutePoint] = []
    points_per_checkpoint: int = 10

class ChallengeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    checkpoints: Optional[List[Checkpoint]] = None
    route_points: Optional[List[RoutePoint]] = None
    is_active: Optional[bool] = None
    points_per_checkpoint: Optional[int] = None

