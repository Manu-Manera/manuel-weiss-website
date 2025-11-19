#!/bin/bash
# Setup API Gateway Routes for User Profile Management

set -e

REGION="eu-central-1"
API_ID="of2iwj7h2c"
STAGE="prod"

# Prüfe welche Lambda für Profile zuständig ist
# Nutze admin-user-management da sie auch Profile-Funktionen hat
LAMBDA_FUNCTION_NAME="mawps-admin-user-management"
LAMBDA_ARN=$(aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME" --region "$REGION" --query "Configuration.FunctionArn" --output text 2>/dev/null)

if [ -z "$LAMBDA_ARN" ]; then
    echo "❌ Lambda Function $LAMBDA_FUNCTION_NAME nicht gefunden"
    echo "   Versuche complete-api Lambda..."
    # Falls complete-api Lambda existiert
    LAMBDA_FUNCTION_NAME="mawps-complete-api"
    LAMBDA_ARN=$(aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME" --region "$REGION" --query "Configuration.FunctionArn" --output text 2>/dev/null)
fi

if [ -z "$LAMBDA_ARN" ]; then
    echo "❌ Keine passende Lambda Function gefunden"
    echo "   Verwende admin-user-management als Fallback"
    LAMBDA_FUNCTION_NAME="mawps-admin-user-management"
    LAMBDA_ARN=$(aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME" --region "$REGION" --query "Configuration.FunctionArn" --output text)
fi

echo "🚀 Setup API Gateway Routes für User Profile"
echo "   API Gateway ID: $API_ID"
echo "   Lambda Function: $LAMBDA_FUNCTION_NAME"
echo "   Lambda ARN: $LAMBDA_ARN"
echo ""

# Get root resource ID
ROOT_RESOURCE_ID=$(aws apigateway get-resources --rest-api-id "$API_ID" --region "$REGION" --query "items[?path=='/'].id" --output text)
echo "✅ Root Resource ID: $ROOT_RESOURCE_ID"

# Create /profile resource if it doesn't exist
PROFILE_RESOURCE_ID=$(aws apigateway get-resources --rest-api-id "$API_ID" --region "$REGION" --query "items[?path=='/profile'].id" --output text)

if [ -z "$PROFILE_RESOURCE_ID" ]; then
    echo "📝 Erstelle /profile Resource..."
    PROFILE_RESOURCE_ID=$(aws apigateway create-resource \
        --rest-api-id "$API_ID" \
        --parent-id "$ROOT_RESOURCE_ID" \
        --path-part "profile" \
        --region "$REGION" \
        --query "id" \
        --output text)
    echo "✅ /profile Resource erstellt: $PROFILE_RESOURCE_ID"
else
    echo "✅ /profile Resource existiert bereits: $PROFILE_RESOURCE_ID"
fi

# Grant API Gateway permission to invoke Lambda
echo ""
echo "🔐 Erteile API Gateway Permission für Lambda..."
aws lambda add-permission \
    --function-name "$LAMBDA_FUNCTION_NAME" \
    --statement-id "apigateway-profile-$(date +%s)" \
    --action "lambda:InvokeFunction" \
    --principal "apigateway.amazonaws.com" \
    --source-arn "arn:aws:execute-api:$REGION:*:$API_ID/*/*" \
    --region "$REGION" 2>/dev/null || echo "⚠️  Permission existiert bereits oder Fehler (ignoriert)"

# Create Lambda Integration
INTEGRATION_URI="arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/$LAMBDA_ARN/invocations"

echo ""
echo "🔗 Erstelle Lambda Integration..."

# Helper function to create method if it doesn't exist
create_method() {
    local resource_id=$1
    local method=$2
    local method_exists=$(aws apigateway get-method --rest-api-id "$API_ID" --resource-id "$resource_id" --http-method "$method" --region "$REGION" 2>/dev/null && echo "yes" || echo "no")
    
    if [ "$method_exists" = "no" ]; then
        echo "   📍 Erstelle $method für Resource $resource_id"
        aws apigateway put-method \
            --rest-api-id "$API_ID" \
            --resource-id "$resource_id" \
            --http-method "$method" \
            --authorization-type "NONE" \
            --region "$REGION" > /dev/null
        
        aws apigateway put-integration \
            --rest-api-id "$API_ID" \
            --resource-id "$resource_id" \
            --http-method "$method" \
            --type "AWS_PROXY" \
            --integration-http-method "POST" \
            --uri "$INTEGRATION_URI" \
            --region "$REGION" > /dev/null
        
        echo "   ✅ $method erstellt"
    else
        echo "   ✅ $method existiert bereits"
    fi
}

# Create OPTIONS method for CORS (wichtig für Preflight!)
create_method "$PROFILE_RESOURCE_ID" "OPTIONS"

# Create GET /profile
create_method "$PROFILE_RESOURCE_ID" "GET"

# Create POST /profile
create_method "$PROFILE_RESOURCE_ID" "POST"

# Create PUT /profile
create_method "$PROFILE_RESOURCE_ID" "PUT"

# Deploy to stage
echo ""
echo "🚀 Deploye API Gateway zu Stage '$STAGE'..."
aws apigateway create-deployment \
    --rest-api-id "$API_ID" \
    --stage-name "$STAGE" \
    --region "$REGION" > /dev/null 2>&1 || \
aws apigateway update-deployment \
    --rest-api-id "$API_ID" \
    --deployment-id $(aws apigateway get-deployments --rest-api-id "$API_ID" --region "$REGION" --query "items[0].id" --output text) \
    --region "$REGION" > /dev/null

echo ""
echo "✅ API Gateway Routes erfolgreich konfiguriert!"
echo ""
echo "📋 API Base URL: https://${API_ID}.execute-api.${REGION}.amazonaws.com/${STAGE}"
echo "   OPTIONS /profile (CORS Preflight)"
echo "   GET     /profile"
echo "   POST    /profile"
echo "   PUT     /profile"

