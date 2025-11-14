#!/bin/bash

# Deployment Script für Profile API Lambda Function
# Deployed die erweiterte Lambda Function mit Website-Images Support

set -e

echo "🚀 Deploying Profile API Lambda Function..."
echo "============================================"

# Configuration
FUNCTION_NAME="mawps-profile-api"
REGION="eu-central-1"
TABLE_NAME="mawps-user-profiles"
BUCKET_NAME="mawps-profile-images"

# Check if function exists
if aws lambda get-function --function-name $FUNCTION_NAME --region $REGION &>/dev/null; then
    echo "✅ Lambda Function exists, updating..."
    UPDATE=true
else
    echo "ℹ️  Lambda Function does not exist, creating..."
    UPDATE=false
fi

# Package the function
echo "📦 Packaging function..."
cd "$(dirname "$0")"
npm install --production
zip -r function.zip index.js package.json node_modules/ -q

# Update or create the function
if [ "$UPDATE" = true ]; then
    echo "🔄 Updating function code..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://function.zip \
        --region $REGION
    
    echo "⏳ Waiting for update to complete..."
    aws lambda wait function-updated \
        --function-name $FUNCTION_NAME \
        --region $REGION
    
    echo "🔧 Updating environment variables..."
    aws lambda update-function-configuration \
        --function-name $FUNCTION_NAME \
        --environment "Variables={PROFILE_TABLE=$TABLE_NAME,PROFILE_IMAGES_BUCKET=$BUCKET_NAME}" \
        --region $REGION
    
else
    # Create new function (if needed)
    echo "❌ Function does not exist. Please create it first using AWS Console or CloudFormation."
    echo "ℹ️  Or run the full deployment script: lambda/deploy-aws-backend.sh"
    exit 1
fi

# Clean up
rm function.zip

echo ""
echo "✅ Deployment completed!"
echo "============================================"
echo ""
echo "📋 Function Details:"
echo "  Name: $FUNCTION_NAME"
echo "  Region: $REGION"
echo "  Table: $TABLE_NAME"
echo "  Bucket: $BUCKET_NAME"
echo ""
echo "🔍 New Endpoints Added:"
echo "  POST   /website-images          → Save website images (owner)"
echo "  GET    /website-images/owner    → Load website images"
echo ""
echo "🧪 Test Commands:"
echo ""
echo "# Test website images save:"
echo "curl -X POST https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod/website-images \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"userId\":\"owner\",\"profileImageDefault\":\"test.jpg\",\"profileImageHover\":\"test2.jpg\"}'"
echo ""
echo "# Test website images load:"
echo "curl https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod/website-images/owner"
echo ""
echo "✅ Ready to use!"

