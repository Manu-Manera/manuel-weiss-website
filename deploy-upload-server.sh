#!/bin/bash

echo "🚀 Deploying Upload Server..."

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --package-lock-only

# If package-lock doesn't exist, install normally
if [ ! -f "package-lock.json" ]; then
    echo "📦 Creating package-lock.json..."
    npm install
fi

# Copy upload server package.json
echo "📋 Setting up upload server..."
cp package-upload.json package.json

# Install upload server dependencies
echo "📦 Installing upload server dependencies..."
npm install express multer cors

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p uploads

# Start the server
echo "🚀 Starting upload server..."
echo "🌐 Server will be available at: http://localhost:3001"
echo "📁 Uploads will be stored in: $(pwd)/uploads"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

node upload-server.js
