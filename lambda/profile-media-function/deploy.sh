#!/bin/bash

# Deploy the combined Profile Media Function

set -e

echo "🚀 Deploying Profile Media Function..."
echo "======================================="

# Configuration
FUNCTION_NAME="manuel-weiss-profile-media-PresignFunction-JE5AxO7R2uYd"
REGION="eu-central-1"
TABLE_NAME="mawps-user-profiles"
BUCKET_NAME="manuel-weiss-public-media"

cd "$(dirname "$0")"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Package
echo "📦 Packaging function..."
zip -r function.zip index.js package.json node_modules/ -q

# Update function code
echo "🔄 Updating Lambda function code..."
aws lambda update-function-code \
    --function-name $FUNCTION_NAME \
    --zip-file fileb://function.zip \
    --region $REGION

echo "⏳ Waiting for update to complete..."
aws lambda wait function-updated \
    --function-name $FUNCTION_NAME \
    --region $REGION

# Update environment variables
echo "🔧 Updating environment variables..."
aws lambda update-function-configuration \
    --function-name $FUNCTION_NAME \
    --environment "Variables={BUCKET_NAME=$BUCKET_NAME,TABLE_NAME=$TABLE_NAME,REGION=$REGION}" \
    --region $REGION \
    --timeout 30 \
    --memory-size 256

# Clean up
rm function.zip

echo ""
echo "✅ Deployment completed!"
echo "======================================="
echo ""
echo "📋 Function Details:"
echo "  Name: $FUNCTION_NAME"
echo "  Region: $REGION"
echo "  Table: $TABLE_NAME"
echo "  Bucket: $BUCKET_NAME"
echo ""
echo "🎯 Supported Endpoints:"
echo "  POST   /profile-image/upload-url  → Get presigned URL"
echo "  POST   /website-images            → Save website images"
echo "  GET    /website-images/{userId}   → Load website images"
echo ""
echo "🧪 Test the function:"
echo "  curl https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod/website-images/owner"
echo ""

