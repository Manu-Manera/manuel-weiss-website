#!/bin/bash
# Deploy Admin User Management Lambda Function

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Deploye Admin User Management Lambda...${NC}"
echo ""

# Configuration
REGION="eu-central-1"
FUNCTION_NAME="mawps-admin-user-management"
API_GATEWAY_ID="of2iwj7h2c"
STAGE="prod"
USER_POOL_ID="eu-central-1_8gP4gLK9r"
TABLE_NAME="mawps-user-profiles"

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI nicht gefunden${NC}"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS Credentials nicht konfiguriert${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS Credentials OK${NC}"
echo ""

# Go to Lambda directory
cd backend/admin-user-management

# Install dependencies
echo "📦 Installiere Dependencies..."
if [ ! -f "package.json" ]; then
    echo "   Erstelle package.json..."
    cat > package.json <<EOF
{
  "name": "admin-user-management",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@aws-sdk/client-cognito-identity-provider": "^3.0.0",
    "@aws-sdk/client-dynamodb": "^3.0.0"
  }
}
EOF
fi

npm install --production --silent 2>&1 | grep -E "(added|removed|up to date)" || true

# Create deployment package
echo "📦 Erstelle Deployment Package..."
rm -f ../admin-user-management.zip
zip -r ../admin-user-management.zip . -x "*.git*" "node_modules/.cache/*" "*.zip" "*.log" > /dev/null 2>&1

# Check if function exists
echo "🔍 Prüfe Lambda Function..."
if aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION" &> /dev/null; then
    echo "   ✅ Function existiert - Update..."
    
    # Update function code
    aws lambda update-function-code \
        --function-name "$FUNCTION_NAME" \
        --zip-file fileb://../admin-user-management.zip \
        --region "$REGION" \
        --output json > /dev/null
    
    # Update environment variables
    echo "   ⚙️  Update Environment Variables..."
    aws lambda update-function-configuration \
        --function-name "$FUNCTION_NAME" \
        --environment "Variables={USER_POOL_ID=$USER_POOL_ID,TABLE_NAME=$TABLE_NAME,AWS_REGION=$REGION}" \
        --region "$REGION" \
        --output json > /dev/null
    
    echo -e "${GREEN}   ✅ Lambda Function updated!${NC}"
else
    echo -e "${YELLOW}   ⚠️  Function existiert nicht - erstelle sie...${NC}"
    
    # Get IAM role (use existing role or create new)
    ROLE_ARN=$(aws iam list-roles --query "Roles[?RoleName=='lambda-execution-role'].Arn" --output text 2>/dev/null || echo "")
    
    if [ -z "$ROLE_ARN" ]; then
        echo -e "${RED}   ❌ IAM Role nicht gefunden. Bitte erstelle eine Lambda Execution Role.${NC}"
        exit 1
    fi
    
    # Create function
    aws lambda create-function \
        --function-name "$FUNCTION_NAME" \
        --runtime nodejs18.x \
        --role "$ROLE_ARN" \
        --handler handler.handler \
        --zip-file fileb://../admin-user-management.zip \
        --timeout 30 \
        --memory-size 256 \
        --environment "Variables={USER_POOL_ID=$USER_POOL_ID,TABLE_NAME=$TABLE_NAME,AWS_REGION=$REGION}" \
        --region "$REGION" \
        --output json > /dev/null
    
    echo -e "${GREEN}   ✅ Lambda Function erstellt!${NC}"
fi

# Setup API Gateway integration
echo ""
echo "🌐 Setup API Gateway Routes..."

# Check if routes exist and create/update them
ROUTES=(
    "GET /admin/users"
    "POST /admin/users"
    "PUT /admin/users/{userId}"
    "DELETE /admin/users/{userId}"
    "POST /admin/users/{userId}/reset-password"
)

for route in "${ROUTES[@]}"; do
    METHOD=$(echo $route | cut -d' ' -f1)
    PATH=$(echo $route | cut -d' ' -f2-)
    echo "   📍 $METHOD $PATH"
done

echo ""
echo -e "${GREEN}✅ Deployment abgeschlossen!${NC}"
echo ""
echo "📋 Lambda Function: $FUNCTION_NAME"
echo "📋 API Gateway: https://${API_GATEWAY_ID}.execute-api.${REGION}.amazonaws.com/${STAGE}"
echo ""
echo -e "${YELLOW}⚠️  WICHTIG: API Gateway Routes müssen manuell konfiguriert werden!${NC}"
echo "   Verwende AWS Console oder SAM/CDK Template"

# Cleanup
rm -f ../admin-user-management.zip

cd ../..

