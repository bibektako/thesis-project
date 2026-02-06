#!/bin/bash

cd "$(dirname "$0")/mobile"

echo "📱 Starting Mobile App..."
echo "📦 Installing dependencies if needed..."

if [ ! -d "node_modules" ]; then
    echo "Installing npm packages..."
    npm install
fi

echo ""
echo "📱 Starting Expo development server..."
echo "   Press 'i' for iOS simulator"
echo "   Press 'a' for Android emulator"
echo "   Scan QR code with Expo Go app on your phone"
echo ""

npm start

