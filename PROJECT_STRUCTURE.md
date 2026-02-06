# Project Structure

```
final thesis project/
│
├── README.md                          # Main project documentation
├── .gitignore                         # Git ignore rules
│
├── backend/                           # FastAPI Backend
│   ├── app.py                        # Main FastAPI application
│   ├── config.py                     # Configuration settings
│   ├── db.py                         # MongoDB connection
│   ├── requirements.txt              # Python dependencies
│   ├── README.md                     # Backend documentation
│   │
│   ├── routers/                      # API Route Handlers
│   │   ├── __init__.py
│   │   ├── auth.py                   # Authentication routes
│   │   ├── challenges.py             # Challenge routes
│   │   ├── submissions.py            # Submission routes
│   │   ├── admin.py                  # Admin routes
│   │   └── leaderboard.py            # Leaderboard routes
│   │
│   ├── models/                       # Pydantic Models
│   │   ├── __init__.py
│   │   ├── user_model.py             # User models
│   │   ├── challenge_model.py       # Challenge models
│   │   └── submission_model.py      # Submission models
│   │
│   ├── ml/                           # Machine Learning Modules
│   │   ├── __init__.py
│   │   ├── ocr.py                    # OCR text extraction
│   │   ├── liveness.py               # AI liveness detection
│   │   └── face_match.py             # Face matching
│   │
│   ├── utils/                        # Utility Functions
│   │   ├── __init__.py
│   │   ├── gps.py                    # GPS distance calculation
│   │   ├── fuzzy.py                  # Fuzzy text matching
│   │   └── storage.py                # File storage utilities
│   │
│   └── uploads/                      # Local Image Storage
│       ├── photos/                   # Checkpoint photos
│       │   └── .gitkeep
│       └── selfies/                  # Selfie photos
│           └── .gitkeep
│
└── mobile/                           # React Native Mobile App
    ├── App.js                        # Main app component
    ├── package.json                  # Node dependencies
    ├── app.json                      # Expo configuration
    ├── README.md                     # Mobile app documentation
    │
    └── src/
        ├── screens/                  # App Screens
        │   ├── LoginScreen.js
        │   ├── RegisterScreen.js
        │   ├── ChallengeListScreen.js
        │   ├── ChallengeDetailScreen.js
        │   ├── CaptureScreen.js
        │   ├── LeaderboardScreen.js
        │   └── ProgressScreen.js
        │
        ├── components/               # Reusable Components
        │   └── CameraView.js
        │
        ├── services/                 # API Services
        │   ├── api.js                # Axios configuration
        │   ├── auth.js               # Authentication service
        │   ├── challenges.js         # Challenge service
        │   └── submissions.js        # Submission service
        │
        ├── state/                    # Zustand State Management
        │   └── useAuthStore.js
        │
        └── utils/                    # Utility Functions
            └── gps.js                # GPS utilities
```

## File Count Summary

- **Backend**: 20+ Python files
- **Mobile**: 15+ JavaScript/React Native files
- **Total**: 35+ source files

## Key Features by Directory

### Backend
- **routers/**: RESTful API endpoints
- **models/**: Data validation and serialization
- **ml/**: OCR, liveness, and face recognition
- **utils/**: GPS, fuzzy matching, file storage

### Mobile
- **screens/**: Complete UI screens for all features
- **services/**: API communication layer
- **state/**: Global state management with Zustand
- **components/**: Reusable UI components





