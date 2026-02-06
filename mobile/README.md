# Trek Challenge Mobile App

## Setup

1. Install dependencies

   ```bash
   npm install
   # or
   yarn install
   ```

2. Configure API base URL

   - Edit `src/services/api.js`
   - Change `API_BASE_URL` to your local machine's IP address
   - Example: `http://192.168.1.100:8000`

3. Run the app

   ```bash
   # For iOS
   npm run ios

   # For Android
   npm run android

   # Or use Expo
   npm start
   ```

## Permissions

The app requires:

- Camera permission (for photo/selfie capture)
- Location permission (for GPS verification)

## Features

- User registration and login
- Challenge browsing
- Checkpoint verification with:
  - Photo capture
  - Selfie capture (when required)
  - GPS location
- Real-time submission status
- Leaderboard
- Progress tracking

## Notes

- Make sure your mobile device and laptop are on the same network
- Update the API base URL in `api.js` to match your backend server IP
- For Android, you may need to configure network security to allow HTTP connections




