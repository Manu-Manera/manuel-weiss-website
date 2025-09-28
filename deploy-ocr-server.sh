#!/bin/bash

# OCR Server Deployment Script
# Deploys OCR server with Google Cloud Vision and Tesseract.js support

echo "🚀 Deploying OCR Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Navigate to backend directory
cd backend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create uploads directory
mkdir -p uploads
echo "✅ Created uploads directory"

# Set up environment variables
echo "🔧 Setting up environment..."

# Check for Google Cloud credentials
if [ -f "$HOME/.config/gcloud/application_default_credentials.json" ]; then
    echo "✅ Google Cloud credentials found"
    export GOOGLE_APPLICATION_CREDENTIALS="$HOME/.config/gcloud/application_default_credentials.json"
else
    echo "⚠️ Google Cloud credentials not found. OCR will use Tesseract.js fallback"
fi

# Create .env file
cat > .env << EOF
PORT=3001
NODE_ENV=production
GOOGLE_APPLICATION_CREDENTIALS=${GOOGLE_APPLICATION_CREDENTIALS:-}
EOF

echo "✅ Environment configured"

# Test the server
echo "🧪 Testing OCR server..."
timeout 10s node ocr-server.js &
SERVER_PID=$!

sleep 3

# Test health endpoint
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ OCR server is running and healthy"
    kill $SERVER_PID 2>/dev/null
else
    echo "❌ OCR server health check failed"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 OCR Server deployment completed successfully!"
echo ""
echo "📡 Server endpoints:"
echo "   POST /api/ocr - Single file OCR"
echo "   POST /api/ocr/batch - Multiple files OCR"
echo "   GET /api/health - Health check"
echo ""
echo "🚀 To start the server:"
echo "   cd backend && npm start"
echo ""
echo "🔧 To run in development mode:"
echo "   cd backend && npm run dev"
echo ""
echo "📚 Documentation:"
echo "   - Google Cloud Vision: https://cloud.google.com/vision/docs"
echo "   - Tesseract.js: https://tesseract.projectnaptha.com/"
echo "   - PDF Parse: https://www.npmjs.com/package/pdf-parse"
