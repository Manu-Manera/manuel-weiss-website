#!/bin/bash

# Script to add /website-images endpoints to existing API Gateway
# This allows saving and loading website images for the Admin Panel

set -e

echo "🚀 Adding /website-images endpoints to API Gateway..."
echo "======================================================"

# Configuration
API_ID="of2iwj7h2c"
REGION="eu-central-1"
FUNCTION_ARN="arn:aws:lambda:eu-central-1:$(aws sts get-caller-identity --query Account --output text):function:manuel-weiss-profile-media-PresignFunction-JE5AxO7R2uYd"

# Get root resource
ROOT_ID=$(aws apigateway get-resources --rest-api-id $API_ID --region $REGION --query 'items[?path==`/`].id' --output text)
echo "✅ Root resource ID: $ROOT_ID"

# Check if /website-images resource exists
WEBSITE_IMAGES_ID=$(aws apigateway get-resources --rest-api-id $API_ID --region $REGION --query 'items[?pathPart==`website-images`].id' --output text 2>/dev/null || echo "")

if [ -z "$WEBSITE_IMAGES_ID" ]; then
    echo "📌 Creating /website-images resource..."
    WEBSITE_IMAGES_ID=$(aws apigateway create-resource \
        --rest-api-id $API_ID \
        --parent-id $ROOT_ID \
        --path-part "website-images" \
        --region $REGION \
        --query 'id' \
        --output text)
    echo "✅ Created /website-images resource: $WEBSITE_IMAGES_ID"
else
    echo "✅ /website-images resource already exists: $WEBSITE_IMAGES_ID"
fi

# Add POST method to /website-images
echo "📌 Adding POST method to /website-images..."
aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $WEBSITE_IMAGES_ID \
    --http-method POST \
    --authorization-type NONE \
    --region $REGION \
    --no-api-key-required 2>/dev/null || echo "  Method might already exist"

# Add integration for POST
echo "📌 Adding Lambda integration for POST..."
aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $WEBSITE_IMAGES_ID \
    --http-method POST \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/$FUNCTION_ARN/invocations" \
    --region $REGION 2>/dev/null || echo "  Integration might already exist"

# Add OPTIONS method for CORS
echo "📌 Adding OPTIONS method for CORS..."
aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $WEBSITE_IMAGES_ID \
    --http-method OPTIONS \
    --authorization-type NONE \
    --region $REGION 2>/dev/null || echo "  OPTIONS method might already exist"

# Add MOCK integration for OPTIONS
aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $WEBSITE_IMAGES_ID \
    --http-method OPTIONS \
    --type MOCK \
    --request-templates '{"application/json": "{\"statusCode\": 200}"}' \
    --region $REGION 2>/dev/null || echo "  MOCK integration might already exist"

# Check if /website-images/{userId} resource exists
WEBSITE_IMAGES_USER_ID=$(aws apigateway get-resources --rest-api-id $API_ID --region $REGION --query 'items[?pathPart==`{userId}`&&parentId==`'$WEBSITE_IMAGES_ID'`].id' --output text 2>/dev/null || echo "")

if [ -z "$WEBSITE_IMAGES_USER_ID" ]; then
    echo "📌 Creating /website-images/{userId} resource..."
    WEBSITE_IMAGES_USER_ID=$(aws apigateway create-resource \
        --rest-api-id $API_ID \
        --parent-id $WEBSITE_IMAGES_ID \
        --path-part "{userId}" \
        --region $REGION \
        --query 'id' \
        --output text)
    echo "✅ Created /website-images/{userId} resource: $WEBSITE_IMAGES_USER_ID"
else
    echo "✅ /website-images/{userId} resource already exists: $WEBSITE_IMAGES_USER_ID"
fi

# Add GET method to /website-images/{userId}
echo "📌 Adding GET method to /website-images/{userId}..."
aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $WEBSITE_IMAGES_USER_ID \
    --http-method GET \
    --authorization-type NONE \
    --region $REGION \
    --no-api-key-required 2>/dev/null || echo "  Method might already exist"

# Add integration for GET
echo "📌 Adding Lambda integration for GET..."
aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $WEBSITE_IMAGES_USER_ID \
    --http-method GET \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/$FUNCTION_ARN/invocations" \
    --region $REGION 2>/dev/null || echo "  Integration might already exist"

# Add OPTIONS method for CORS
echo "📌 Adding OPTIONS method for CORS to /{userId}..."
aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $WEBSITE_IMAGES_USER_ID \
    --http-method OPTIONS \
    --authorization-type NONE \
    --region $REGION 2>/dev/null || echo "  OPTIONS method might already exist"

# Add MOCK integration for OPTIONS
aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $WEBSITE_IMAGES_USER_ID \
    --http-method OPTIONS \
    --type MOCK \
    --request-templates '{"application/json": "{\"statusCode\": 200}"}' \
    --region $REGION 2>/dev/null || echo "  MOCK integration might already exist"

# Grant API Gateway permission to invoke Lambda
echo "📌 Granting API Gateway permission to invoke Lambda..."
aws lambda add-permission \
    --function-name manuel-weiss-profile-media-PresignFunction-JE5AxO7R2uYd \
    --statement-id apigateway-website-images-$(date +%s) \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:$REGION:$(aws sts get-caller-identity --query Account --output text):$API_ID/*/*" \
    --region $REGION 2>/dev/null || echo "  Permission might already exist"

# Deploy API
echo "📌 Deploying API..."
DEPLOYMENT_ID=$(aws apigateway create-deployment \
    --rest-api-id $API_ID \
    --stage-name prod \
    --region $REGION \
    --query 'id' \
    --output text)

echo ""
echo "✅ API Gateway deployment completed!"
echo "======================================================"
echo ""
echo "📍 New Endpoints:"
echo "  POST   https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod/website-images"
echo "  GET    https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod/website-images/{userId}"
echo ""
echo "🧪 Test Commands:"
echo ""
echo "# Test save:"
echo "curl -X POST https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod/website-images \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"userId\":\"owner\",\"profileImageDefault\":\"https://example.com/test.jpg\",\"profileImageHover\":\"https://example.com/test2.jpg\"}'"
echo ""
echo "# Test load:"
echo "curl https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod/website-images/owner"
echo ""
echo "✅ Ready! Now update the Lambda function code with deploy.sh"

