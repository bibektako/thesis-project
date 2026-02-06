# Trek Challenge App - Summary

## Non-Technical Summary

The Trek Challenge app is a mobile application that helps people participate in outdoor trekking challenges in a fair and engaging way. The app ensures that participants actually visit each checkpoint by verifying their presence through photos, selfies, and location data.

### What Users Can Do

- **Create an account**: Users register with a username, email, and password to track their progress
- **Browse challenges**: View available trekking challenges with multiple checkpoints
- **Complete checkpoints**: Visit each checkpoint in the real world and submit proof
- **Submit verification**: At each checkpoint, users must:
  - Take a photo of the checkpoint sign
  - Take a selfie (when required)
  - Record their GPS location
- **Track progress**: View submission status, completed checkpoints, and overall progress
- **Earn points**: Receive points for verified checkpoints
- **View rankings**: See leaderboards showing top performers

### Admin Features

- **Manage challenges**: Create, edit, activate/deactivate, or delete challenges and checkpoints
- **Review submissions**: Approve or reject submissions that need manual review
- **View statistics**: See totals for users, challenges, and submissions

### Privacy and Security

- Camera and location permissions are requested from users
- Face recognition is optional and only used if the user enables it
- Passwords are securely stored (never stored in plain text)
- All data is stored locally on the server (not in the cloud)

---

## Major Tools and Technologies Used

### Backend (Server-Side)
- **Python 3.14** - Programming language
- **FastAPI** - Web framework for building the API
- **MongoDB** - Database for storing user data, challenges, and submissions
- **Tesseract OCR** - Extracts text from photos to verify checkpoint signs
- **OpenCV** - Image processing and analysis
- **MediaPipe** - Face detection for selfie verification
- **Bcrypt** - Password encryption

### Mobile App (Client-Side)
- **React Native** - Framework for building mobile apps
- **Expo** - Development platform and toolchain
- **React Navigation** - Screen navigation
- **Axios** - For communicating with the backend API
- **Expo Image Picker** - Camera access
- **Expo Location** - GPS location services

### Development Tools
- **Node.js** - JavaScript runtime
- **npm** - Package manager for JavaScript
- **pip** - Package manager for Python

### Key Features
- **OCR (Optical Character Recognition)** - Reads text from photos
- **GPS Verification** - Validates user location at checkpoints
- **Face Detection** - Verifies selfies are real (not pre-recorded)
- **Fuzzy Text Matching** - Compares extracted text with expected text
- **JWT Authentication** - Secure user login system
