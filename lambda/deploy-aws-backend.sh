#!/bin/bash

# AWS Backend Deployment Script
# Deploys Lambda functions and API Gateway for profile and document management

set -e

echo "=== AWS Backend Deployment ==="
echo ""

# Configuration
REGION="eu-central-1"
PROFILE_FUNCTION_NAME="mawps-profile-api"
DOCUMENTS_FUNCTION_NAME="mawps-documents-api"
API_NAME="mawps-api"
STAGE_NAME="prod"

# Environment variables
USER_POOL_ID="eu-central-1_8gP4gLK9r"
USER_POOL_CLIENT_ID="7kc5tt6a23fgh53d60vkefm812"
PROFILE_TABLE_NAME="mawps-user-profiles"
DOCUMENTS_TABLE_NAME="mawps-user-documents"
S3_BUCKET_NAME="mawps-user-files-1760106396"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}AWS CLI not found. Please install AWS CLI first.${NC}"
    exit 1
fi

# Check if logged in
echo "Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}Not logged in to AWS. Please run 'aws configure' first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ AWS credentials valid${NC}"
echo ""

# Create DynamoDB tables if they don't exist
echo "Setting up DynamoDB tables..."

# Profile table
if ! aws dynamodb describe-table --table-name $PROFILE_TABLE_NAME --region $REGION &> /dev/null; then
    echo "Creating profile table..."
    aws dynamodb create-table \
        --table-name $PROFILE_TABLE_NAME \
        --attribute-definitions \
            AttributeName=userId,AttributeType=S \
        --key-schema \
            AttributeName=userId,KeyType=HASH \
        --billing-mode PAY_PER_REQUEST \
        --region $REGION
    echo -e "${GREEN}✓ Profile table created${NC}"
else
    echo -e "${YELLOW}Profile table already exists${NC}"
fi

# Documents table
if ! aws dynamodb describe-table --table-name $DOCUMENTS_TABLE_NAME --region $REGION &> /dev/null; then
    echo "Creating documents table..."
    aws dynamodb create-table \
        --table-name $DOCUMENTS_TABLE_NAME \
        --attribute-definitions \
            AttributeName=userId,AttributeType=S \
            AttributeName=documentId,AttributeType=S \
        --key-schema \
            AttributeName=userId,KeyType=HASH \
            AttributeName=documentId,KeyType=RANGE \
        --billing-mode PAY_PER_REQUEST \
        --region $REGION
    echo -e "${GREEN}✓ Documents table created${NC}"
else
    echo -e "${YELLOW}Documents table already exists${NC}"
fi

echo ""

# Create Lambda execution role if it doesn't exist
ROLE_NAME="mawps-lambda-execution-role"
ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text 2>/dev/null || echo "")

if [ -z "$ROLE_ARN" ]; then
    echo "Creating Lambda execution role..."
    
    # Create trust policy
    cat > trust-policy.json << EOF
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
    ROLE_ARN=$(aws iam create-role \
        --role-name $ROLE_NAME \
        --assume-role-policy-document file://trust-policy.json \
        --query 'Role.Arn' \
        --output text)
    
    # Attach policies
    aws iam attach-role-policy \
        --role-name $ROLE_NAME \
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    
    # Create custom policy for DynamoDB and S3
    cat > lambda-policy.json << EOF
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
                "dynamodb:Query",
                "dynamodb:Scan"
            ],
            "Resource": [
                "arn:aws:dynamodb:$REGION:*:table/$PROFILE_TABLE_NAME",
                "arn:aws:dynamodb:$REGION:*:table/$DOCUMENTS_TABLE_NAME"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::$S3_BUCKET_NAME/*"
        }
    ]
}
EOF

    aws iam put-role-policy \
        --role-name $ROLE_NAME \
        --policy-name mawps-lambda-policy \
        --policy-document file://lambda-policy.json
    
    rm trust-policy.json lambda-policy.json
    
    echo -e "${GREEN}✓ Lambda execution role created${NC}"
    echo "Waiting for role to propagate..."
    sleep 10
else
    echo -e "${YELLOW}Lambda execution role already exists${NC}"
fi

echo ""

# Package and deploy Profile API Lambda
echo "Deploying Profile API Lambda function..."
cd profile-api

# Install dependencies
npm install

# Create deployment package
zip -r ../profile-api.zip .

cd ..

# Create or update Lambda function
if aws lambda get-function --function-name $PROFILE_FUNCTION_NAME --region $REGION &> /dev/null; then
    echo "Updating existing profile function..."
    aws lambda update-function-code \
        --function-name $PROFILE_FUNCTION_NAME \
        --zip-file fileb://profile-api.zip \
        --region $REGION > /dev/null
else
    echo "Creating new profile function..."
    aws lambda create-function \
        --function-name $PROFILE_FUNCTION_NAME \
        --runtime nodejs20.x \
        --role $ROLE_ARN \
        --handler index.handler \
        --zip-file fileb://profile-api.zip \
        --timeout 30 \
        --memory-size 256 \
        --environment "Variables={USER_POOL_ID=$USER_POOL_ID,USER_POOL_CLIENT_ID=$USER_POOL_CLIENT_ID,PROFILE_TABLE=$PROFILE_TABLE_NAME,REGION=$REGION}" \
        --region $REGION > /dev/null
fi

# Update environment variables
aws lambda update-function-configuration \
    --function-name $PROFILE_FUNCTION_NAME \
    --environment "Variables={USER_POOL_ID=$USER_POOL_ID,USER_POOL_CLIENT_ID=$USER_POOL_CLIENT_ID,PROFILE_TABLE=$PROFILE_TABLE_NAME,REGION=$REGION}" \
    --region $REGION > /dev/null

echo -e "${GREEN}✓ Profile API Lambda deployed${NC}"

# Package and deploy Documents API Lambda
echo "Deploying Documents API Lambda function..."
cd documents-api

# Install dependencies
npm install

# Create deployment package
zip -r ../documents-api.zip .

cd ..

# Create or update Lambda function
if aws lambda get-function --function-name $DOCUMENTS_FUNCTION_NAME --region $REGION &> /dev/null; then
    echo "Updating existing documents function..."
    aws lambda update-function-code \
        --function-name $DOCUMENTS_FUNCTION_NAME \
        --zip-file fileb://documents-api.zip \
        --region $REGION > /dev/null
else
    echo "Creating new documents function..."
    aws lambda create-function \
        --function-name $DOCUMENTS_FUNCTION_NAME \
        --runtime nodejs20.x \
        --role $ROLE_ARN \
        --handler index.handler \
        --zip-file fileb://documents-api.zip \
        --timeout 30 \
        --memory-size 256 \
        --environment "Variables={USER_POOL_ID=$USER_POOL_ID,USER_POOL_CLIENT_ID=$USER_POOL_CLIENT_ID,DOCUMENTS_TABLE=$DOCUMENTS_TABLE_NAME,S3_BUCKET=$S3_BUCKET_NAME,REGION=$REGION}" \
        --region $REGION > /dev/null
fi

# Update environment variables
aws lambda update-function-configuration \
    --function-name $DOCUMENTS_FUNCTION_NAME \
    --environment "Variables={USER_POOL_ID=$USER_POOL_ID,USER_POOL_CLIENT_ID=$USER_POOL_CLIENT_ID,DOCUMENTS_TABLE=$DOCUMENTS_TABLE_NAME,S3_BUCKET=$S3_BUCKET_NAME,REGION=$REGION}" \
    --region $REGION > /dev/null

echo -e "${GREEN}✓ Documents API Lambda deployed${NC}"

# Clean up zip files
rm -f profile-api.zip documents-api.zip

echo ""

# Create or update API Gateway
echo "Setting up API Gateway..."

# Check if API exists
API_ID=$(aws apigatewayv2 get-apis --query "Items[?Name=='$API_NAME'].ApiId" --output text --region $REGION)

if [ -z "$API_ID" ]; then
    echo "Creating new API Gateway..."
    API_ID=$(aws apigatewayv2 create-api \
        --name $API_NAME \
        --protocol-type HTTP \
        --cors-configuration "AllowOrigins=*,AllowMethods=GET,POST,PUT,DELETE,OPTIONS,AllowHeaders=Content-Type,Authorization" \
        --query 'ApiId' \
        --output text \
        --region $REGION)
    echo -e "${GREEN}✓ API Gateway created${NC}"
else
    echo -e "${YELLOW}API Gateway already exists${NC}"
fi

# Get Lambda ARNs
PROFILE_LAMBDA_ARN=$(aws lambda get-function --function-name $PROFILE_FUNCTION_NAME --query 'Configuration.FunctionArn' --output text --region $REGION)
DOCUMENTS_LAMBDA_ARN=$(aws lambda get-function --function-name $DOCUMENTS_FUNCTION_NAME --query 'Configuration.FunctionArn' --output text --region $REGION)

# Create Lambda integrations
echo "Creating Lambda integrations..."

# Profile integration
PROFILE_INTEGRATION_ID=$(aws apigatewayv2 create-integration \
    --api-id $API_ID \
    --integration-type AWS_PROXY \
    --integration-uri $PROFILE_LAMBDA_ARN \
    --payload-format-version 2.0 \
    --query 'IntegrationId' \
    --output text \
    --region $REGION)

# Documents integration
DOCUMENTS_INTEGRATION_ID=$(aws apigatewayv2 create-integration \
    --api-id $API_ID \
    --integration-type AWS_PROXY \
    --integration-uri $DOCUMENTS_LAMBDA_ARN \
    --payload-format-version 2.0 \
    --query 'IntegrationId' \
    --output text \
    --region $REGION)

# Create routes
echo "Creating API routes..."

# Profile routes
aws apigatewayv2 create-route \
    --api-id $API_ID \
    --route-key 'ANY /profile' \
    --target "integrations/$PROFILE_INTEGRATION_ID" \
    --region $REGION > /dev/null

aws apigatewayv2 create-route \
    --api-id $API_ID \
    --route-key 'ANY /profile/{proxy+}' \
    --target "integrations/$PROFILE_INTEGRATION_ID" \
    --region $REGION > /dev/null

# Documents routes
aws apigatewayv2 create-route \
    --api-id $API_ID \
    --route-key 'ANY /documents' \
    --target "integrations/$DOCUMENTS_INTEGRATION_ID" \
    --region $REGION > /dev/null

aws apigatewayv2 create-route \
    --api-id $API_ID \
    --route-key 'ANY /documents/{proxy+}' \
    --target "integrations/$DOCUMENTS_INTEGRATION_ID" \
    --region $REGION > /dev/null

# Create deployment
echo "Creating API deployment..."
aws apigatewayv2 create-deployment \
    --api-id $API_ID \
    --stage-name $STAGE_NAME \
    --region $REGION > /dev/null

# Grant API Gateway permission to invoke Lambda
aws lambda add-permission \
    --function-name $PROFILE_FUNCTION_NAME \
    --statement-id apigateway-invoke-profile \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:$REGION:*:$API_ID/*/*" \
    --region $REGION &> /dev/null || true

aws lambda add-permission \
    --function-name $DOCUMENTS_FUNCTION_NAME \
    --statement-id apigateway-invoke-documents \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:$REGION:*:$API_ID/*/*" \
    --region $REGION &> /dev/null || true

# Get API endpoint
API_ENDPOINT="https://$API_ID.execute-api.$REGION.amazonaws.com/$STAGE_NAME"

echo ""
echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo ""
echo "API Gateway Endpoint: $API_ENDPOINT"
echo ""
echo "Update your frontend configuration with this API endpoint:"
echo "apiBaseUrl: '$API_ENDPOINT'"
echo ""
echo "API Routes:"
echo "- GET/POST    $API_ENDPOINT/profile"
echo "- GET/POST    $API_ENDPOINT/profile/upload-url"
echo "- GET/POST    $API_ENDPOINT/documents"
echo "- POST        $API_ENDPOINT/documents/upload-url"
echo "- GET         $API_ENDPOINT/documents/{documentId}"
echo "- GET         $API_ENDPOINT/documents/{documentId}/download-url"
echo "- DELETE      $API_ENDPOINT/documents/{documentId}"
echo ""

# Save configuration
cat > deployment-config.json << EOF
{
    "apiEndpoint": "$API_ENDPOINT",
    "apiId": "$API_ID",
    "profileFunctionName": "$PROFILE_FUNCTION_NAME",
    "documentsFunctionName": "$DOCUMENTS_FUNCTION_NAME",
    "profileTable": "$PROFILE_TABLE_NAME",
    "documentsTable": "$DOCUMENTS_TABLE_NAME",
    "s3Bucket": "$S3_BUCKET_NAME",
    "region": "$REGION",
    "deployedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

echo "Configuration saved to deployment-config.json"
