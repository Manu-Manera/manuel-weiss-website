#!/bin/bash
# ============================================================================
# Task Extractor - AWS Deployment
# ============================================================================
# Erstellt:
# - DynamoDB Tabelle für Task-Suggestions
# - Lambda-Funktion für Task-Extraktion
# - Lambda-Funktion für tägliche Zusammenfassung
# - API Gateway für Telegram Webhook
# - EventBridge Rules für Scheduler
# ============================================================================

set -e

REGION="eu-central-1"
LAMBDA_NAME="task-extractor"
SUMMARY_LAMBDA_NAME="task-extractor-summary"
ROLE_NAME="task-extractor-lambda-role"
DYNAMODB_TABLE="task-suggestions"
API_NAME="task-extractor-api"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

cd "$(dirname "$0")/.."

echo "🤖 Task Extractor - Deployment"
echo "================================"

# Prüfe Telegram Token
if [ -z "$TELEGRAM_BOT_TOKEN" ] || [ -z "$TELEGRAM_CHAT_ID" ]; then
    TELEGRAM_BOT_TOKEN="8881273570:AAErtrHi_9jJLxGd24xsAkDZlEE-jFRSzAY"
    TELEGRAM_CHAT_ID="7973027646"
fi

# DynamoDB Tabelle erstellen
echo "📊 Erstelle DynamoDB Tabelle..."
aws dynamodb describe-table --table-name $DYNAMODB_TABLE --region $REGION 2>/dev/null || \
aws dynamodb create-table \
    --table-name $DYNAMODB_TABLE \
    --attribute-definitions \
        AttributeName=pk,AttributeType=S \
        AttributeName=sk,AttributeType=S \
    --key-schema \
        AttributeName=pk,KeyType=HASH \
        AttributeName=sk,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --region $REGION > /dev/null

echo "✅ DynamoDB Tabelle: $DYNAMODB_TABLE"

# IAM Role erstellen
echo "🔐 Prüfe IAM Role..."
if ! aws iam get-role --role-name $ROLE_NAME 2>/dev/null; then
    echo "   Erstelle Role..."
    aws iam create-role \
        --role-name $ROLE_NAME \
        --assume-role-policy-document '{
            "Version": "2012-10-17",
            "Statement": [{
                "Effect": "Allow",
                "Principal": {"Service": "lambda.amazonaws.com"},
                "Action": "sts:AssumeRole"
            }]
        }' \
        --region $REGION > /dev/null
    
    # Basis-Berechtigung
    aws iam attach-role-policy \
        --role-name $ROLE_NAME \
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    
    # DynamoDB Berechtigung
    aws iam put-role-policy \
        --role-name $ROLE_NAME \
        --policy-name DynamoDBAccess \
        --policy-document "{
            \"Version\": \"2012-10-17\",
            \"Statement\": [{
                \"Effect\": \"Allow\",
                \"Action\": [
                    \"dynamodb:PutItem\",
                    \"dynamodb:GetItem\",
                    \"dynamodb:UpdateItem\",
                    \"dynamodb:Query\",
                    \"dynamodb:Scan\"
                ],
                \"Resource\": \"arn:aws:dynamodb:${REGION}:${ACCOUNT_ID}:table/${DYNAMODB_TABLE}\"
            }]
        }"
    
    # Secrets Manager Berechtigung
    aws iam put-role-policy \
        --role-name $ROLE_NAME \
        --policy-name SecretsAccess \
        --policy-document "{
            \"Version\": \"2012-10-17\",
            \"Statement\": [{
                \"Effect\": \"Allow\",
                \"Action\": [
                    \"secretsmanager:GetSecretValue\",
                    \"secretsmanager:PutSecretValue\"
                ],
                \"Resource\": \"arn:aws:secretsmanager:${REGION}:${ACCOUNT_ID}:secret:task-extractor/*\"
            }]
        }"
    
    # Bedrock Berechtigung
    aws iam put-role-policy \
        --role-name $ROLE_NAME \
        --policy-name BedrockAccess \
        --policy-document '{
            "Version": "2012-10-17",
            "Statement": [{
                "Effect": "Allow",
                "Action": ["bedrock:InvokeModel"],
                "Resource": ["arn:aws:bedrock:*::foundation-model/*", "arn:aws:bedrock:*:*:inference-profile/*"]
            }]
        }'
    
    echo "   Warte 10s auf Role-Propagierung..."
    sleep 10
fi

ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"
echo "✅ IAM Role: $ROLE_NAME"

# Lambda-Paket erstellen
echo "📦 Erstelle Lambda-Paket..."
cd lambda/task-extractor
rm -rf node_modules package-lock.json
npm install --production --silent
zip -r ../../task-extractor.zip . -x "*.git*" -x "oauth-server.js" > /dev/null
cd ../..

# Haupt-Lambda erstellen/aktualisieren
echo "⚡ Deploye Lambda: $LAMBDA_NAME..."
if aws lambda get-function --function-name $LAMBDA_NAME --region $REGION 2>/dev/null; then
    aws lambda update-function-code \
        --function-name $LAMBDA_NAME \
        --zip-file fileb://task-extractor.zip \
        --region $REGION > /dev/null
    
    aws lambda wait function-updated --function-name $LAMBDA_NAME --region $REGION
    
    aws lambda update-function-configuration \
        --function-name $LAMBDA_NAME \
        --environment "Variables={TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN},TELEGRAM_CHAT_ID=${TELEGRAM_CHAT_ID},DYNAMODB_TABLE=${DYNAMODB_TABLE}}" \
        --timeout 60 \
        --memory-size 512 \
        --region $REGION > /dev/null
else
    aws lambda create-function \
        --function-name $LAMBDA_NAME \
        --runtime nodejs20.x \
        --role $ROLE_ARN \
        --handler index.handler \
        --zip-file fileb://task-extractor.zip \
        --timeout 60 \
        --memory-size 512 \
        --environment "Variables={TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN},TELEGRAM_CHAT_ID=${TELEGRAM_CHAT_ID},DYNAMODB_TABLE=${DYNAMODB_TABLE}}" \
        --region $REGION > /dev/null
fi

echo "✅ Lambda: $LAMBDA_NAME"

# Summary-Lambda erstellen/aktualisieren
echo "⚡ Deploye Lambda: $SUMMARY_LAMBDA_NAME..."
if aws lambda get-function --function-name $SUMMARY_LAMBDA_NAME --region $REGION 2>/dev/null; then
    aws lambda update-function-code \
        --function-name $SUMMARY_LAMBDA_NAME \
        --zip-file fileb://task-extractor.zip \
        --region $REGION > /dev/null
    
    aws lambda wait function-updated --function-name $SUMMARY_LAMBDA_NAME --region $REGION
    
    aws lambda update-function-configuration \
        --function-name $SUMMARY_LAMBDA_NAME \
        --handler index.feierabendCheck \
        --timeout 90 \
        --environment "Variables={TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN},TELEGRAM_CHAT_ID=${TELEGRAM_CHAT_ID},DYNAMODB_TABLE=${DYNAMODB_TABLE}}" \
        --region $REGION > /dev/null
else
    aws lambda create-function \
        --function-name $SUMMARY_LAMBDA_NAME \
        --runtime nodejs20.x \
        --role $ROLE_ARN \
        --handler index.feierabendCheck \
        --zip-file fileb://task-extractor.zip \
        --timeout 60 \
        --memory-size 256 \
        --environment "Variables={TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN},TELEGRAM_CHAT_ID=${TELEGRAM_CHAT_ID},DYNAMODB_TABLE=${DYNAMODB_TABLE}}" \
        --region $REGION > /dev/null
fi

echo "✅ Lambda: $SUMMARY_LAMBDA_NAME"

# API Gateway erstellen
echo "🌐 Konfiguriere API Gateway..."
API_ID=$(aws apigatewayv2 get-apis --region $REGION --query "Items[?Name=='$API_NAME'].ApiId" --output text)

if [ -z "$API_ID" ] || [ "$API_ID" = "None" ]; then
    echo "   Erstelle neues API Gateway..."
    API_ID=$(aws apigatewayv2 create-api \
        --name $API_NAME \
        --protocol-type HTTP \
        --cors-configuration "AllowOrigins=*,AllowMethods=GET,POST,PUT,OPTIONS,AllowHeaders=Content-Type" \
        --region $REGION \
        --query 'ApiId' --output text)
    
    aws apigatewayv2 create-stage \
        --api-id $API_ID \
        --stage-name "prod" \
        --auto-deploy \
        --region $REGION > /dev/null
fi

# Integration erstellen/aktualisieren
echo "   Konfiguriere Routes..."
INTEGRATION_ID=$(aws apigatewayv2 get-integrations --api-id $API_ID --region $REGION \
    --query "Items[?IntegrationUri=='arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${LAMBDA_NAME}'].IntegrationId" --output text)

if [ -z "$INTEGRATION_ID" ] || [ "$INTEGRATION_ID" = "None" ]; then
    INTEGRATION_ID=$(aws apigatewayv2 create-integration \
        --api-id $API_ID \
        --integration-type AWS_PROXY \
        --integration-uri "arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${LAMBDA_NAME}" \
        --payload-format-version "2.0" \
        --region $REGION \
        --query 'IntegrationId' --output text)
fi

# Routes erstellen (nur wenn nicht vorhanden)
for ROUTE in "POST /webhook" "POST /oauth-callback" "GET /status" "GET /settings" "PUT /settings" "POST /test"; do
    EXISTING=$(aws apigatewayv2 get-routes --api-id $API_ID --region $REGION \
        --query "Items[?RouteKey=='$ROUTE'].RouteId" --output text)
    
    if [ -z "$EXISTING" ] || [ "$EXISTING" = "None" ]; then
        aws apigatewayv2 create-route \
            --api-id $API_ID \
            --route-key "$ROUTE" \
            --target "integrations/$INTEGRATION_ID" \
            --region $REGION > /dev/null
        echo "   ✓ Route: $ROUTE"
    fi
done

# Lambda Permission
aws lambda add-permission \
    --function-name $LAMBDA_NAME \
    --statement-id "apigateway-invoke-task" \
    --action "lambda:InvokeFunction" \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/*" \
    --region $REGION 2>/dev/null || true

WEBHOOK_URL="https://${API_ID}.execute-api.${REGION}.amazonaws.com/prod/webhook"
API_BASE_URL="https://${API_ID}.execute-api.${REGION}.amazonaws.com/prod"
echo "✅ API Gateway: $API_BASE_URL"

# Telegram Webhook setzen
echo "🔗 Setze Telegram Webhook..."
curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook?url=${WEBHOOK_URL}" > /dev/null

# EventBridge Rules erstellen
echo "📅 Konfiguriere EventBridge Scheduler..."

# Alle 2 Stunden Check (weniger Rauschen als 30 Min)
RULE_NAME="task-extractor-check"
aws events put-rule \
    --name $RULE_NAME \
    --schedule-expression "rate(2 hours)" \
    --state ENABLED \
    --description "Task Extractor - Check alle 2 Stunden" \
    --region $REGION > /dev/null

aws lambda add-permission \
    --function-name $LAMBDA_NAME \
    --statement-id "eventbridge-check" \
    --action "lambda:InvokeFunction" \
    --principal events.amazonaws.com \
    --source-arn "arn:aws:events:${REGION}:${ACCOUNT_ID}:rule/${RULE_NAME}" \
    --region $REGION 2>/dev/null || true

aws events put-targets \
    --rule $RULE_NAME \
    --targets "Id"="1","Arn"="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${LAMBDA_NAME}" \
    --region $REGION > /dev/null

echo "✅ Scheduler: Alle 2 Stunden"

# Feierabend-Check um 17:00 CET (15:00 UTC Sommer)
SUMMARY_RULE_NAME="task-extractor-summary"
aws events put-rule \
    --name $SUMMARY_RULE_NAME \
    --schedule-expression "cron(0 15 ? * MON-FRI *)" \
    --state ENABLED \
    --description "Feierabend-Check 17:00 CET: Zeit + unbeantwortete Mails" \
    --region $REGION > /dev/null

aws lambda add-permission \
    --function-name $SUMMARY_LAMBDA_NAME \
    --statement-id "eventbridge-summary" \
    --action "lambda:InvokeFunction" \
    --principal events.amazonaws.com \
    --source-arn "arn:aws:events:${REGION}:${ACCOUNT_ID}:rule/${SUMMARY_RULE_NAME}" \
    --region $REGION 2>/dev/null || true

aws events put-targets \
    --rule $SUMMARY_RULE_NAME \
    --targets "Id"="1","Arn"="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${SUMMARY_LAMBDA_NAME}" \
    --region $REGION > /dev/null

echo "✅ Scheduler: Feierabend-Check 17:00 CET"

# Aufräumen
rm -f task-extractor.zip

echo ""
echo "=============================================="
echo "  Deployment erfolgreich!"
echo "=============================================="
echo ""
echo "📱 Telegram Webhook: $WEBHOOK_URL"
echo "🌐 API Base URL: $API_BASE_URL"
echo ""
echo "🕐 Scheduler:"
echo "   - Check: Alle 2 Stunden"
echo "   - Feierabend-Check: 17:00 CET via telegram-productivity-reminder-daily (Graph-Mails + Zeit)"
echo ""
echo "⚠️  NÄCHSTE SCHRITTE:"
echo ""
echo "1. Azure AD App registrieren (falls noch nicht geschehen):"
echo "   ./scripts/setup-graph-app.sh"
echo ""
echo "2. OPTION A - Via Onboarding-App (empfohlen):"
echo "   - Öffne: https://manuel-weiss.ch/onboarding/task-extractor"
echo "   - Klicke 'Mit Microsoft verbinden'"
echo "   - Fertig!"
echo ""
echo "3. OPTION B - Lokal (nur bei Debugging):"
echo "   cd lambda/task-extractor"
echo "   node oauth-server.js"
echo "   Dann: http://localhost:3000/auth"
echo ""
echo "📝 Für die Onboarding-App, füge in .env hinzu:"
echo "   VITE_GRAPH_CLIENT_ID='deine-client-id'"
echo "   VITE_GRAPH_TENANT_ID='dein-tenant-id'"
echo ""
