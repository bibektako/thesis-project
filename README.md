# Trek Challenge Verification System

A complete local-only trekking challenge verification system using OCR, GPS, and AI liveness detection.

## Project Structure

```
.
├── backend/          # FastAPI backend server
│   ├── app.py       # Main FastAPI application
│   ├── config.py    # Configuration settings
│   ├── db.py        # MongoDB connection
│   ├── routers/     # API route handlers
│   ├── models/      # Pydantic models
│   ├── ml/          # ML modules (OCR, liveness, face matching)
│   ├── utils/       # Utility functions (GPS, fuzzy matching, storage)
│   └── uploads/     # Local image storage
│
└── mobile/          # React Native mobile app
    ├── App.js       # Main app component
    ├── src/
    │   ├── screens/     # App screens
    │   ├── components/   # Reusable components
    │   ├── services/    # API services
    │   ├── state/       # Zustand state management
    │   └── utils/       # Utility functions
```

## Features

- **Admin Panel**: Create and manage trekking challenges with multiple checkpoints
- **User Verification**: 
  - Photo capture with OCR text matching
  - GPS location validation
  - Selfie capture with AI liveness detection
  - Optional face matching for anti-cheat
- **Real-time Validation**: Automatic verification pipeline
- **Leaderboard**: Track user progress and rankings
- **Local Only**: Everything runs on your local machine

## Quick Start

### Backend Setup

1. Install MongoDB Community Edition
   ```bash
   # macOS
   brew install mongodb-community
   brew services start mongodb-community
   ```

2. Install Python dependencies
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. Install Tesseract OCR
   ```bash
   # macOS
   brew install tesseract
   ```

4. Run the backend
   ```bash
   python app.py
   # Or
   uvicorn app:app --host 0.0.0.0 --port 8000 --reload
   ```

### Mobile App Setup

1. Install dependencies
   ```bash
   cd mobile
   npm install
   ```

2. Configure API URL
   - Edit `mobile/src/services/api.js`
   - Update `API_BASE_URL` to your local IP (e.g., `http://192.168.1.100:8000`)

3. Run the app
   ```bash
   npm start
   # Then press 'i' for iOS or 'a' for Android
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Challenges
- `GET /api/challenges` - List all challenges
- `GET /api/challenges/{id}` - Get challenge details

### Submissions
- `POST /api/submissions` - Submit checkpoint verification
- `GET /api/submissions/{id}` - Get submission status

### Admin
- `POST /api/admin/challenges` - Create challenge
- `PUT /api/admin/challenges/{id}` - Update challenge
- `DELETE /api/admin/challenges/{id}` - Delete challenge

### Leaderboard
- `GET /api/leaderboard/{challenge_id}` - Get leaderboard

## Verification Pipeline

When a user submits a checkpoint:

1. **GPS Validation**: Checks if user is within required radius
2. **OCR Validation**: Extracts text from photo and matches with expected sign text
3. **Liveness Detection**: Validates selfie using MediaPipe face detection
4. **Face Matching**: Optional face embedding comparison (if user consented)
5. **Status Assignment**:
   - `verified`: All checks passed
   - `rejected`: GPS failed
   - `pending_admin`: OCR or liveness below threshold

## Configuration

Edit `backend/config.py` to adjust:
- Verification thresholds (OCR, liveness, face matching)
- GPS radius defaults
- MongoDB connection
- JWT settings

## Technologies

### Backend
- FastAPI
- Motor (async MongoDB)
- Tesseract/PaddleOCR
- MediaPipe
- OpenCV
- RapidFuzz

### Mobile
- React Native
- Zustand
- react-native-vision-camera
- react-native-geolocation-service
- React Navigation

## Notes

- All images stored locally in `backend/uploads/`
- MongoDB runs on `localhost:27017`
- Backend runs on `0.0.0.0:8000` (accessible from mobile on same network)
- Make sure mobile device and laptop are on the same WiFi network

## License

Open source - use freely for your projects!





