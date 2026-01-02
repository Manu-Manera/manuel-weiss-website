#!/bin/bash
# Setup API Gateway Routes for API Key Authentication

set -e

REGION="eu-central-1"
API_ID="of2iwj7h2c"
STAGE_NAME="prod"
FUNCTION_NAME="mawps-api-key-auth"
FUNCTION_ARN=$(aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION" --query 'Configuration.FunctionArn' --output text)

echo "🔗 Konfiguriere API Gateway Routes für API Key Authentication..."
echo "   API ID: $API_ID"
echo "   Function: $FUNCTION_NAME"
echo ""

# Grant API Gateway permission to invoke Lambda
echo "🔐 Setze Lambda Permissions..."
aws lambda add-permission \
    --function-name "$FUNCTION_NAME" \
    --statement-id "apigateway-invoke-api-key-auth-$(date +%s)" \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:$REGION:*:$API_ID/*/*" \
    --region "$REGION" &> /dev/null || echo "   ⚠️  Permission bereits vorhanden (oder Fehler)"

# Check if API Gateway v2 (HTTP API) or v1 (REST API)
API_TYPE=$(aws apigatewayv2 get-api --api-id "$API_ID" --region "$REGION" --query 'ProtocolType' --output text 2>/dev/null || echo "REST")

if [ "$API_TYPE" = "HTTP" ]; then
    echo "📡 API Gateway v2 (HTTP API) erkannt..."
    
    # Create integration
    echo "🔧 Erstelle Integration..."
    INTEGRATION_ID=$(aws apigatewayv2 create-integration \
        --api-id "$API_ID" \
        --integration-type AWS_PROXY \
        --integration-uri "$FUNCTION_ARN" \
        --payload-format-version "2.0" \
        --region "$REGION" \
        --query 'IntegrationId' \
        --output text 2>/dev/null || \
        aws apigatewayv2 get-integrations --api-id "$API_ID" --region "$REGION" --query "Items[?IntegrationUri==\`$FUNCTION_ARN\`].IntegrationId" --output text | head -1)
    
    if [ -z "$INTEGRATION_ID" ]; then
        echo "   ❌ Integration konnte nicht erstellt werden"
        exit 1
    fi
    
    echo "   ✅ Integration ID: $INTEGRATION_ID"
    
    # Create routes
    echo "🛣️  Erstelle Routes..."
    
    routes=(
        "POST /auth/api-key/register"
        "POST /auth/api-key/challenge"
        "POST /auth/api-key/token"
        "GET /auth/api-key/status"
        "OPTIONS /auth/api-key/{proxy+}"
    )
    
    for route in "${routes[@]}"; do
        METHOD=$(echo "$route" | cut -d' ' -f1)
        PATH=$(echo "$route" | cut -d' ' -f2-)
        
        # Convert path to route key format
        ROUTE_KEY="$METHOD $PATH"
        
        echo "   📍 Erstelle Route: $ROUTE_KEY"
        
        aws apigatewayv2 create-route \
            --api-id "$API_ID" \
            --route-key "$ROUTE_KEY" \
            --target "integrations/$INTEGRATION_ID" \
            --region "$REGION" \
            --output json > /dev/null 2>&1 || echo "     ⚠️  Route existiert bereits oder Fehler"
    done
    
    # Create deployment
    echo "🚀 Erstelle Deployment..."
    DEPLOYMENT_ID=$(aws apigatewayv2 create-deployment \
        --api-id "$API_ID" \
        --stage-name "$STAGE_NAME" \
        --region "$REGION" \
        --query 'DeploymentId' \
        --output text 2>/dev/null || echo "")
    
    if [ -n "$DEPLOYMENT_ID" ]; then
        echo "   ✅ Deployment erstellt: $DEPLOYMENT_ID"
    else
        echo "   ⚠️  Deployment konnte nicht erstellt werden (möglicherweise bereits vorhanden)"
    fi
    
else
    echo "📡 API Gateway v1 (REST API) erkannt..."
    
    # Get root resource ID
    ROOT_RESOURCE_ID=$(aws apigateway get-resources --rest-api-id "$API_ID" --region "$REGION" --query 'items[?path==`/`].id' --output text)
    
    # Create auth resource
    echo "🔧 Erstelle Resources..."
    AUTH_RESOURCE_ID=$(aws apigateway create-resource \
        --rest-api-id "$API_ID" \
        --parent-id "$ROOT_RESOURCE_ID" \
        --path-part "auth" \
        --region "$REGION" \
        --query 'id' \
        --output text 2>/dev/null || \
        aws apigateway get-resources --rest-api-id "$API_ID" --region "$REGION" --query "items[?path==\`/auth\`].id" --output text)
    
    API_KEY_RESOURCE_ID=$(aws apigateway create-resource \
        --rest-api-id "$API_ID" \
        --parent-id "$AUTH_RESOURCE_ID" \
        --path-part "api-key" \
        --region "$REGION" \
        --query 'id' \
        --output text 2>/dev/null || \
        aws apigateway get-resources --rest-api-id "$API_ID" --region "$REGION" --query "items[?path==\`/auth/api-key\`].id" --output text)
    
    # Create sub-resources
    REGISTER_RESOURCE_ID=$(aws apigateway create-resource \
        --rest-api-id "$API_ID" \
        --parent-id "$API_KEY_RESOURCE_ID" \
        --path-part "register" \
        --region "$REGION" \
        --query 'id' \
        --output text 2>/dev/null || \
        aws apigateway get-resources --rest-api-id "$API_ID" --region "$REGION" --query "items[?path==\`/auth/api-key/register\`].id" --output text)
    
    CHALLENGE_RESOURCE_ID=$(aws apigateway create-resource \
        --rest-api-id "$API_ID" \
        --parent-id "$API_KEY_RESOURCE_ID" \
        --path-part "challenge" \
        --region "$REGION" \
        --query 'id' \
        --output text 2>/dev/null || \
        aws apigateway get-resources --rest-api-id "$API_ID" --region "$REGION" --query "items[?path==\`/auth/api-key/challenge\`].id" --output text)
    
    TOKEN_RESOURCE_ID=$(aws apigateway create-resource \
        --rest-api-id "$API_ID" \
        --parent-id "$API_KEY_RESOURCE_ID" \
        --path-part "token" \
        --region "$REGION" \
        --query 'id' \
        --output text 2>/dev/null || \
        aws apigateway get-resources --rest-api-id "$API_ID" --region "$REGION" --query "items[?path==\`/auth/api-key/token\`].id" --output text)
    
    STATUS_RESOURCE_ID=$(aws apigateway create-resource \
        --rest-api-id "$API_ID" \
        --parent-id "$API_KEY_RESOURCE_ID" \
        --path-part "status" \
        --region "$REGION" \
        --query 'id' \
        --output text 2>/dev/null || \
        aws apigateway get-resources --rest-api-id "$API_ID" --region "$REGION" --query "items[?path==\`/auth/api-key/status\`].id" --output text)
    
    # Create Lambda integration
    echo "🔗 Erstelle Lambda Integration..."
    INTEGRATION_URI="arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/$FUNCTION_ARN/invocations"
    
    # Create methods
    methods=(
        "POST:$REGISTER_RESOURCE_ID:register"
        "POST:$CHALLENGE_RESOURCE_ID:challenge"
        "POST:$TOKEN_RESOURCE_ID:token"
        "GET:$STATUS_RESOURCE_ID:status"
    )
    
    for method_info in "${methods[@]}"; do
        METHOD=$(echo "$method_info" | cut -d':' -f1)
        RESOURCE_ID=$(echo "$method_info" | cut -d':' -f2)
        NAME=$(echo "$method_info" | cut -d':' -f3)
        
        echo "   📍 Erstelle Method: $METHOD /auth/api-key/$NAME"
        
        # Create method
        aws apigateway put-method \
            --rest-api-id "$API_ID" \
            --resource-id "$RESOURCE_ID" \
            --http-method "$METHOD" \
            --authorization-type "NONE" \
            --region "$REGION" \
            --output json > /dev/null 2>&1 || echo "     ⚠️  Method existiert bereits"
        
        # Create integration
        aws apigateway put-integration \
            --rest-api-id "$API_ID" \
            --resource-id "$RESOURCE_ID" \
            --http-method "$METHOD" \
            --type AWS_PROXY \
            --integration-http-method POST \
            --uri "$INTEGRATION_URI" \
            --region "$REGION" \
            --output json > /dev/null 2>&1 || echo "     ⚠️  Integration existiert bereits"
    done
    
    # Create deployment
    echo "🚀 Erstelle Deployment..."
    DEPLOYMENT_ID=$(aws apigateway create-deployment \
        --rest-api-id "$API_ID" \
        --stage-name "$STAGE_NAME" \
        --region "$REGION" \
        --query 'id' \
        --output text 2>/dev/null || echo "")
    
    if [ -n "$DEPLOYMENT_ID" ]; then
        echo "   ✅ Deployment erstellt: $DEPLOYMENT_ID"
    fi
fi

echo ""
echo "✅ API Gateway Routes konfiguriert!"
echo ""
echo "🔗 Endpoints:"
echo "   POST https://$API_ID.execute-api.$REGION.amazonaws.com/$STAGE_NAME/auth/api-key/register"
echo "   POST https://$API_ID.execute-api.$REGION.amazonaws.com/$STAGE_NAME/auth/api-key/challenge"
echo "   POST https://$API_ID.execute-api.$REGION.amazonaws.com/$STAGE_NAME/auth/api-key/token"
echo "   GET  https://$API_ID.execute-api.$REGION.amazonaws.com/$STAGE_NAME/auth/api-key/status"

