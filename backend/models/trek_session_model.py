from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TrekSession(BaseModel):
    id: Optional[str] = None
    user_id: str
    challenge_id: str
    status: str = "active"  # active, cancelled, completed
    started_at: datetime = datetime.utcnow()
    cancelled_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    cancel_reason: Optional[str] = None
    checkpoints_completed: int = 0
    total_checkpoints: int = 0


class TrekSessionStart(BaseModel):
    challenge_id: str


class TrekSessionCancel(BaseModel):
    reason: Optional[str] = None
