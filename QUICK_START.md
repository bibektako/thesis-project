# Quick Start Guide

## Prerequisites

1. **Python 3.8+** installed
2. **Node.js & npm** installed
3. **MongoDB** running locally
4. **Expo CLI** (optional, but recommended)

## Step 1: Install Backend Dependencies

```bash
cd backend
pip3 install --user -r requirements.txt
# OR if you have a virtual environment:
# python3 -m venv venv
# source venv/bin/activate
# pip install -r requirements.txt
```

## Step 2: Start MongoDB

```bash
# macOS with Homebrew
brew services start mongodb-community

# Or manually
mongod --dbpath /usr/local/var/mongodb
```

## Step 3: Start Backend Server

**Option A: Using the script**
```bash
./start_backend.sh
```

**Option B: Manually**
```bash
cd backend
python3 app.py
```

The backend will run on `http://0.0.0.0:8000`
- API: http://localhost:8000
- Docs: http://localhost:8000/docs

## Step 4: Start Mobile App

**Option A: Using the script**
```bash
./start_mobile.sh
```

**Option B: Manually**
```bash
cd mobile
npm install  # First time only
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## Step 5: Configure API URL

Before using the mobile app, update the API URL:

1. Find your computer's local IP address:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Or
   ipconfig getifaddr en0
   ```

2. Edit `mobile/src/services/api.js`:
   ```javascript
   const API_BASE_URL = 'http://YOUR_IP_ADDRESS:8000';
   ```

## Troubleshooting

### Backend won't start
- Check if MongoDB is running: `pgrep mongod`
- Check if port 8000 is available: `lsof -i :8000`
- Install missing dependencies: `pip3 install --user -r requirements.txt`

### Mobile app can't connect
- Ensure backend is running
- Check API_BASE_URL matches your computer's IP
- Ensure phone and computer are on same WiFi network
- For Android, you may need to use `http://10.0.2.2:8000` in emulator

### Dependencies issues
- Use `--user` flag: `pip3 install --user package_name`
- Or create virtual environment: `python3 -m venv venv && source venv/bin/activate`

## Running Both Services

Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
python3 app.py
```

**Terminal 2 (Mobile):**
```bash
cd mobile
npm start
```





