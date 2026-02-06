#!/bin/bash

cd "$(dirname "$0")/backend"

echo "🚀 Starting Backend Server..."
echo "📦 Installing dependencies if needed..."

# Try to install dependencies (use --user if system packages are protected)
pip3 install --user -q -r requirements.txt 2>/dev/null || pip3 install -q -r requirements.txt 2>/dev/null || echo "⚠️  Some dependencies may need manual installation"

echo ""
echo "🔍 Checking MongoDB..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB doesn't appear to be running"
    echo "   Start it with: brew services start mongodb-community"
    echo "   Or: mongod --dbpath /path/to/data"
fi

echo ""
echo "🌐 Starting FastAPI server on http://0.0.0.0:8000"
echo "   API docs available at http://localhost:8000/docs"
echo ""

python3 app.py

