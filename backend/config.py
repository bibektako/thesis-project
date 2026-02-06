import os
from pathlib import Path

BASE_DIR = Path(__file__).parent

# MongoDB
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "trek_challenge")

# Storage
UPLOAD_DIR = BASE_DIR / "uploads"
PHOTOS_DIR = UPLOAD_DIR / "photos"
SELFIES_DIR = UPLOAD_DIR / "selfies"

# Create directories
UPLOAD_DIR.mkdir(exist_ok=True)
PHOTOS_DIR.mkdir(exist_ok=True)
SELFIES_DIR.mkdir(exist_ok=True)

# Verification thresholds
OCR_THRESHOLD = 70.0
LIVENESS_THRESHOLD = 0.6
FACE_MATCH_THRESHOLD = 0.7
DEFAULT_GPS_RADIUS = 50.0  # meters

# JWT
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# CORS
ALLOWED_ORIGINS = ["*"]  # For local development





