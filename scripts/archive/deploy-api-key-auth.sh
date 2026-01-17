#!/bin/bash
# Deploy API Key Authentication Lambda Function

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

REGION="eu-central-1"
FUNCTION_NAME="mawps-api-key-auth"
TABLE_NAME="mawps-api-keys"
ROLE_NAME="mawps-api-key-auth-role"
ROLE_ARN=""

echo "🚀 Deploye API Key Authentication Lambda..."

# Go to Lambda directory
cd lambda/api-key-auth

# Install dependencies
echo "📦 Installiere Dependencies..."
if [ ! -f "package.json" ]; then
    echo "❌ package.json nicht gefunden!"
    exit 1
fi

npm install --production --silent 2>&1 | grep -E "(added|removed|up to date)" || true

# Create deployment package
echo "📦 Erstelle Deployment Package..."
rm -f ../api-key-auth.zip
zip -r ../api-key-auth.zip . -x "*.git*" "node_modules/.cache/*" "*.zip" "*.log" "README.md" > /dev/null 2>&1

# Check if IAM role exists, create if not
echo "🔍 Prüfe IAM Role..."
if aws iam get-role --role-name "$ROLE_NAME" --region "$REGION" &> /dev/null; then
    echo "   ✅ Role existiert"
    ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --region "$REGION" --query 'Role.Arn' --output text)
else
    echo "   ⚠️  Role existiert nicht - erstelle sie..."
    
    # Create trust policy
    cat > /tmp/trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

    # Create role
    aws iam create-role \
        --role-name "$ROLE_NAME" \
        --assume-role-policy-document file:///tmp/trust-policy.json \
        --region "$REGION" \
        --output json > /dev/null
    
    ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --region "$REGION" --query 'Role.Arn' --output text)
    
    # Attach basic Lambda execution policy
    aws iam attach-role-policy \
        --role-name "$ROLE_NAME" \
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole \
        --region "$REGION"
    
    # Create and attach DynamoDB policy
    cat > /tmp/dynamodb-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:${REGION}:*:table/${TABLE_NAME}"
    }
  ]
}
EOF

    POLICY_NAME="${ROLE_NAME}-dynamodb-policy"
    aws iam create-policy \
        --policy-name "$POLICY_NAME" \
        --policy-document file:///tmp/dynamodb-policy.json \
        --region "$REGION" \
        --output json > /dev/null 2>&1 || true
    
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    POLICY_ARN="arn:aws:iam::${ACCOUNT_ID}:policy/${POLICY_NAME}"
    
    aws iam attach-role-policy \
        --role-name "$ROLE_NAME" \
        --policy-arn "$POLICY_ARN" \
        --region "$REGION" 2>&1 || echo "   ⚠️  Policy attachment fehlgeschlagen (möglicherweise bereits vorhanden)"
    
    echo "   ✅ Role erstellt: $ROLE_ARN"
    
    # Wait for role to be available
    echo "   ⏳ Warte auf Role Propagation..."
    sleep 5
fi

# Check if DynamoDB table exists, create if not
echo "🔍 Prüfe DynamoDB Table..."
if aws dynamodb describe-table --table-name "$TABLE_NAME" --region "$REGION" &> /dev/null; then
    echo "   ✅ Table existiert"
else
    echo "   ⚠️  Table existiert nicht - erstelle sie..."
    
    aws dynamodb create-table \
        --table-name "$TABLE_NAME" \
        --attribute-definitions \
            AttributeName=pk,AttributeType=S \
            AttributeName=sk,AttributeType=S \
        --key-schema \
            AttributeName=pk,KeyType=HASH \
            AttributeName=sk,KeyType=RANGE \
        --billing-mode PAY_PER_REQUEST \
        --region "$REGION" \
        --output json > /dev/null
    
    echo "   ⏳ Warte auf Table Creation..."
    aws dynamodb wait table-exists --table-name "$TABLE_NAME" --region "$REGION"
    
    echo "   ✅ Table erstellt: $TABLE_NAME"
fi

# Check if function exists
echo "🔍 Prüfe Lambda Function..."
if aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION" &> /dev/null; then
    echo "   ✅ Function existiert - Update..."
    
    aws lambda update-function-code \
        --function-name "$FUNCTION_NAME" \
        --zip-file fileb://../api-key-auth.zip \
        --region "$REGION" \
        --output json > /dev/null
    
    # Update environment variables
    JWT_SECRET=$(aws secretsmanager get-secret-value --secret-id mawps-jwt-secret --region "$REGION" --query SecretString --output text 2>/dev/null || echo "change-me-in-production-$(date +%s)")
    
    aws lambda update-function-configuration \
        --function-name "$FUNCTION_NAME" \
        --environment "Variables={API_KEYS_TABLE=$TABLE_NAME,JWT_SECRET=$JWT_SECRET,TOKEN_SECRET=$JWT_SECRET}" \
        --timeout 30 \
        --memory-size 256 \
        --region "$REGION" \
        --output json > /dev/null
    
    echo "   ✅ Lambda Function updated!"
else
    echo "   ⚠️  Function existiert nicht - erstelle sie..."
    
    # Get JWT secret or use default
    JWT_SECRET=$(aws secretsmanager get-secret-value --secret-id mawps-jwt-secret --region "$REGION" --query SecretString --output text 2>/dev/null || echo "change-me-in-production-$(date +%s)")
    
    aws lambda create-function \
        --function-name "$FUNCTION_NAME" \
        --runtime nodejs18.x \
        --role "$ROLE_ARN" \
        --handler index.handler \
        --zip-file fileb://../api-key-auth.zip \
        --timeout 30 \
        --memory-size 256 \
        --environment "Variables={API_KEYS_TABLE=$TABLE_NAME,JWT_SECRET=$JWT_SECRET,TOKEN_SECRET=$JWT_SECRET}" \
        --region "$REGION" \
        --output json > /dev/null
    
    echo "   ✅ Lambda Function erstellt!"
fi

# Cleanup
rm -f ../api-key-auth.zip
rm -f /tmp/trust-policy.json /tmp/dynamodb-policy.json

echo ""
echo "✅ Deployment abgeschlossen!"
echo ""
echo "📋 Function Details:"
echo "   Name: $FUNCTION_NAME"
echo "   Region: $REGION"
echo "   Table: $TABLE_NAME"
echo ""
echo "🔗 API Gateway Integration:"
echo "   Endpoints müssen noch in API Gateway konfiguriert werden:"
echo "   - POST /auth/api-key/register"
echo "   - POST /auth/api-key/challenge"
echo "   - POST /auth/api-key/token"
echo "   - GET /auth/api-key/status"
echo ""
echo "🧪 Test mit:"
echo "   aws lambda invoke --function-name $FUNCTION_NAME --region $REGION --payload '{}' response.json"

