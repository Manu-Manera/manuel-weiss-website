#!/bin/bash
# Setup API Gateway Routes for User Profile Management

set -e

REGION="eu-central-1"
API_ID="of2iwj7h2c"
STAGE="prod"

# Prüfe welche Lambda für Profile zuständig ist
LAMBDA_FUNCTION_NAME="mawps-user-profile"
LAMBDA_ARN=$(aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME" --region "$REGION" --query "Configuration.FunctionArn" --output text 2>/dev/null)

if [ -z "$LAMBDA_ARN" ]; then
    echo "❌ Lambda Function $LAMBDA_FUNCTION_NAME nicht gefunden"
    echo "   Versuche admin-user-management Lambda..."
    LAMBDA_FUNCTION_NAME="mawps-admin-user-management"
    LAMBDA_ARN=$(aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME" --region "$REGION" --query "Configuration.FunctionArn" --output text 2>/dev/null)
fi

if [ -z "$LAMBDA_ARN" ]; then
    echo "❌ Keine passende Lambda Function gefunden"
    exit 1
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

# Create /profiles resource if it doesn't exist
PROFILES_RESOURCE_ID=$(aws apigateway get-resources --rest-api-id "$API_ID" --region "$REGION" --query "items[?path=='/profiles'].id" --output text)

if [ -z "$PROFILES_RESOURCE_ID" ]; then
    echo "📝 Erstelle /profiles Resource..."
    PROFILES_RESOURCE_ID=$(aws apigateway create-resource \
        --rest-api-id "$API_ID" \
        --parent-id "$ROOT_RESOURCE_ID" \
        --path-part "profiles" \
        --region "$REGION" \
        --query "id" \
        --output text)
    echo "✅ /profiles Resource erstellt: $PROFILES_RESOURCE_ID"
else
    echo "✅ /profiles Resource existiert bereits: $PROFILES_RESOURCE_ID"
fi

# Create methods for /profiles
create_method "$PROFILES_RESOURCE_ID" "OPTIONS"
create_method "$PROFILES_RESOURCE_ID" "GET"

# Create /profiles/{uuid} resource
PROFILES_UUID_RESOURCE_ID=$(aws apigateway get-resources --rest-api-id "$API_ID" --region "$REGION" --query "items[?path=='/profiles/{uuid}'].id" --output text)

if [ -z "$PROFILES_UUID_RESOURCE_ID" ]; then
    echo "📝 Erstelle /profiles/{uuid} Resource..."
    PROFILES_UUID_RESOURCE_ID=$(aws apigateway create-resource \
        --rest-api-id "$API_ID" \
        --parent-id "$PROFILES_RESOURCE_ID" \
        --path-part "{uuid}" \
        --region "$REGION" \
        --query "id" \
        --output text)
    echo "✅ /profiles/{uuid} Resource erstellt: $PROFILES_UUID_RESOURCE_ID"
else
    echo "✅ /profiles/{uuid} Resource existiert bereits: $PROFILES_UUID_RESOURCE_ID"
fi

# Create methods for /profiles/{uuid}
create_method "$PROFILES_UUID_RESOURCE_ID" "OPTIONS"
create_method "$PROFILES_UUID_RESOURCE_ID" "GET"

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

# Create /resume resource if it doesn't exist
RESUME_RESOURCE_ID=$(aws apigateway get-resources --rest-api-id "$API_ID" --region "$REGION" --query "items[?path=='/resume'].id" --output text)

if [ -z "$RESUME_RESOURCE_ID" ]; then
    echo "📝 Erstelle /resume Resource..."
    RESUME_RESOURCE_ID=$(aws apigateway create-resource \
        --rest-api-id "$API_ID" \
        --parent-id "$ROOT_RESOURCE_ID" \
        --path-part "resume" \
        --region "$REGION" \
        --query "id" \
        --output text)
    echo "✅ /resume Resource erstellt: $RESUME_RESOURCE_ID"
else
    echo "✅ /resume Resource existiert bereits: $RESUME_RESOURCE_ID"
fi

# Create methods for /resume
create_method "$RESUME_RESOURCE_ID" "OPTIONS"
create_method "$RESUME_RESOURCE_ID" "GET"
create_method "$RESUME_RESOURCE_ID" "POST"
create_method "$RESUME_RESOURCE_ID" "PUT"
create_method "$RESUME_RESOURCE_ID" "DELETE"

# Create /resume/upload-url resource
RESUME_UPLOAD_RESOURCE_ID=$(aws apigateway get-resources --rest-api-id "$API_ID" --region "$REGION" --query "items[?path=='/resume/upload-url'].id" --output text)

if [ -z "$RESUME_UPLOAD_RESOURCE_ID" ]; then
    echo "📝 Erstelle /resume/upload-url Resource..."
    RESUME_UPLOAD_RESOURCE_ID=$(aws apigateway create-resource \
        --rest-api-id "$API_ID" \
        --parent-id "$RESUME_RESOURCE_ID" \
        --path-part "upload-url" \
        --region "$REGION" \
        --query "id" \
        --output text)
    echo "✅ /resume/upload-url Resource erstellt: $RESUME_UPLOAD_RESOURCE_ID"
else
    echo "✅ /resume/upload-url Resource existiert bereits: $RESUME_UPLOAD_RESOURCE_ID"
fi

create_method "$RESUME_UPLOAD_RESOURCE_ID" "OPTIONS"
create_method "$RESUME_UPLOAD_RESOURCE_ID" "POST"

# Create /resume/ocr resource
RESUME_OCR_RESOURCE_ID=$(aws apigateway get-resources --rest-api-id "$API_ID" --region "$REGION" --query "items[?path=='/resume/ocr'].id" --output text)

if [ -z "$RESUME_OCR_RESOURCE_ID" ]; then
    echo "📝 Erstelle /resume/ocr Resource..."
    RESUME_OCR_RESOURCE_ID=$(aws apigateway create-resource \
        --rest-api-id "$API_ID" \
        --parent-id "$RESUME_RESOURCE_ID" \
        --path-part "ocr" \
        --region "$REGION" \
        --query "id" \
        --output text)
    echo "✅ /resume/ocr Resource erstellt: $RESUME_OCR_RESOURCE_ID"
else
    echo "✅ /resume/ocr Resource existiert bereits: $RESUME_OCR_RESOURCE_ID"
fi

create_method "$RESUME_OCR_RESOURCE_ID" "OPTIONS"
create_method "$RESUME_OCR_RESOURCE_ID" "POST"

# Create /resume/personal-info/{field} resource
RESUME_PERSONAL_INFO_RESOURCE_ID=$(aws apigateway get-resources --rest-api-id "$API_ID" --region "$REGION" --query "items[?path=='/resume/personal-info/{field}'].id" --output text)

if [ -z "$RESUME_PERSONAL_INFO_RESOURCE_ID" ]; then
    echo "📝 Erstelle /resume/personal-info/{field} Resource..."
    RESUME_PERSONAL_INFO_RESOURCE_ID=$(aws apigateway create-resource \
        --rest-api-id "$API_ID" \
        --parent-id "$RESUME_RESOURCE_ID" \
        --path-part "personal-info" \
        --region "$REGION" \
        --query "id" \
        --output text)
    echo "✅ /resume/personal-info Resource erstellt: $RESUME_PERSONAL_INFO_RESOURCE_ID"
    
    # Create {field} sub-resource
    RESUME_FIELD_RESOURCE_ID=$(aws apigateway create-resource \
        --rest-api-id "$API_ID" \
        --parent-id "$RESUME_PERSONAL_INFO_RESOURCE_ID" \
        --path-part "{field}" \
        --region "$REGION" \
        --query "id" \
        --output text)
    echo "✅ /resume/personal-info/{field} Resource erstellt: $RESUME_FIELD_RESOURCE_ID"
else
    echo "✅ /resume/personal-info/{field} Resource existiert bereits: $RESUME_PERSONAL_INFO_RESOURCE_ID"
    RESUME_FIELD_RESOURCE_ID=$(aws apigateway get-resources --rest-api-id "$API_ID" --region "$REGION" --query "items[?path=='/resume/personal-info/{field}'].id" --output text)
fi

create_method "$RESUME_FIELD_RESOURCE_ID" "OPTIONS"
create_method "$RESUME_FIELD_RESOURCE_ID" "PUT"

echo ""
echo "✅ API Gateway Routes erfolgreich konfiguriert!"
echo ""
echo "📋 API Base URL: https://${API_ID}.execute-api.${REGION}.amazonaws.com/${STAGE}"
echo "   OPTIONS /profile (CORS Preflight)"
echo "   GET     /profile"
echo "   POST    /profile"
echo "   PUT     /profile"
echo "   GET     /profiles (Liste)"
echo "   GET     /profiles/{uuid} (Einzelnes Profil)"
echo "   GET     /resume (Lebenslauf laden)"
echo "   POST    /resume (Lebenslauf speichern)"
echo "   PUT     /resume (Lebenslauf aktualisieren)"
echo "   DELETE  /resume (Lebenslauf löschen)"
echo "   POST    /resume/upload-url (Upload URL)"
echo "   POST    /resume/ocr (OCR-Verarbeitung)"
echo "   PUT     /resume/personal-info/{field} (Einzelnes Feld aktualisieren)"

