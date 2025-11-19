#!/bin/bash
# Deploy User Profile Lambda Function

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

REGION="eu-central-1"
FUNCTION_NAME="mawps-user-profile"
TABLE_NAME="mawps-user-profiles"

echo "🚀 Deploye User Profile Lambda..."

# Go to Lambda directory
cd backend/user-profile

# Install dependencies
echo "📦 Installiere Dependencies..."
if [ ! -f "package.json" ]; then
    cat > package.json <<EOF
{
  "name": "user-profile",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3.0.0"
  }
}
EOF
fi

npm install --production --silent 2>&1 | grep -E "(added|removed|up to date)" || true

# Create deployment package
echo "📦 Erstelle Deployment Package..."
rm -f ../user-profile.zip
zip -r ../user-profile.zip . -x "*.git*" "node_modules/.cache/*" "*.zip" "*.log" > /dev/null 2>&1

# Check if function exists
echo "🔍 Prüfe Lambda Function..."
if aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION" &> /dev/null; then
    echo "   ✅ Function existiert - Update..."
    
    aws lambda update-function-code \
        --function-name "$FUNCTION_NAME" \
        --zip-file fileb://../user-profile.zip \
        --region "$REGION" \
        --output json > /dev/null
    
    aws lambda update-function-configuration \
        --function-name "$FUNCTION_NAME" \
        --environment "Variables={TABLE=$TABLE_NAME}" \
        --region "$REGION" \
        --output json > /dev/null
    
    echo "   ✅ Lambda Function updated!"
else
    echo "   ⚠️  Function existiert nicht - erstelle sie..."
    
    # Get IAM role
    ROLE_NAME="mawps-lambda-execution-role"
    ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text 2>/dev/null || echo "")
    
    if [ -z "$ROLE_ARN" ]; then
        echo "   ❌ IAM Role $ROLE_NAME nicht gefunden"
        exit 1
    fi
    
    aws lambda create-function \
        --function-name "$FUNCTION_NAME" \
        --runtime nodejs20.x \
        --role "$ROLE_ARN" \
        --handler handler.handler \
        --zip-file fileb://../user-profile.zip \
        --environment "Variables={TABLE=$TABLE_NAME}" \
        --timeout 30 \
        --memory-size 256 \
        --region "$REGION" \
        --output json > /dev/null
    
    echo "   ✅ Lambda Function erstellt!"
fi

echo ""
echo "✅ User Profile Lambda erfolgreich deployed!"

