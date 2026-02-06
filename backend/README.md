# Trek Challenge Verification System - Backend

## Setup

1. Install MongoDB Community Edition locally
   ```bash
   # macOS
   brew install mongodb-community
   brew services start mongodb-community
   
   # Or download from https://www.mongodb.com/try/download/community
   ```

2. Install Python dependencies
   ```bash
   pip install -r requirements.txt
   ```

3. Install Tesseract OCR (for OCR functionality)
   ```bash
   # macOS
   brew install tesseract
   
   # Ubuntu/Debian
   sudo apt-get install tesseract-ocr
   ```

4. Run the backend
   ```bash
   python app.py
   # Or
   uvicorn app:app --host 0.0.0.0 --port 8000 --reload
   ```

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info
- `GET /api/challenges` - List all challenges
- `GET /api/challenges/{id}` - Get challenge details
- `POST /api/submissions` - Submit checkpoint verification
- `GET /api/submissions/{id}` - Get submission status
- `POST /api/admin/challenges` - Create challenge (admin)
- `PUT /api/admin/challenges/{id}` - Update challenge (admin)
- `DELETE /api/admin/challenges/{id}` - Delete challenge (admin)

## Configuration

Edit `config.py` to adjust:
- MongoDB connection
- Verification thresholds (OCR, liveness, face matching)
- GPS radius defaults
- JWT settings

## Notes

- All images are stored locally in `uploads/` directory
- OCR uses Tesseract by default, falls back to PaddleOCR if available
- MediaPipe is used for liveness detection
- Face matching requires InsightFace (optional)





