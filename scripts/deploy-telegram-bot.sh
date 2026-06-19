#!/bin/bash
set -e

# ============================================================================
# Telegram Productivity Bot - AWS Deployment
# ============================================================================
# Erstellt:
# - Lambda-Funktion für Webhook
# - Lambda-Funktion für Reminder
# - API Gateway Endpoint
# - CloudWatch Event Rule für 17:00 Reminder
# ============================================================================

REGION="eu-central-1"
LAMBDA_NAME="telegram-productivity-bot"
REMINDER_LAMBDA_NAME="telegram-productivity-reminder"
ROLE_NAME="telegram-bot-lambda-role"
API_NAME="telegram-productivity-api"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

cd "$(dirname "$0")/.."

echo "🤖 Telegram Productivity Bot - Deployment"
echo "=========================================="

# Prüfe ob Telegram Bot Token gesetzt ist
if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo ""
    echo "⚠️  TELEGRAM_BOT_TOKEN nicht gesetzt!"
    echo ""
    echo "1. Gehe zu Telegram und schreibe @BotFather"
    echo "2. Sende /newbot und folge den Anweisungen"
    echo "3. Kopiere den Bot-Token"
    echo "4. Führe aus:"
    echo ""
    echo "   export TELEGRAM_BOT_TOKEN='dein-token-hier'"
    echo "   export ALLOWED_CHAT_ID='deine-chat-id'"
    echo ""
    echo "   Chat-ID findest du so:"
    echo "   - Schreibe deinem Bot eine Nachricht"
    echo "   - Öffne: https://api.telegram.org/bot<TOKEN>/getUpdates"
    echo "   - Suche nach 'chat':{'id': DEINE_ID}"
    echo ""
    exit 1
fi

if [ -z "$ALLOWED_CHAT_ID" ]; then
    echo "⚠️  ALLOWED_CHAT_ID nicht gesetzt! (Nur du darfst den Bot nutzen)"
    echo "   export ALLOWED_CHAT_ID='deine-chat-id'"
    exit 1
fi

# OpenAI Key aus AWS holen (optional)
OPENAI_KEY=""
if command -v curl &> /dev/null; then
    OPENAI_KEY=$(curl -s "https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1/api-settings?action=key&provider=openai&global=true" | grep -o '"apiKey":"[^"]*"' | cut -d'"' -f4 || echo "")
fi

echo "📦 Erstelle Lambda-Paket..."
cd lambda/telegram-productivity-bot
zip -r ../../telegram-bot.zip . -x "*.git*"
cd ../..

# IAM Role erstellen (falls nicht vorhanden)
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
        --region $REGION
    
    aws iam attach-role-policy \
        --role-name $ROLE_NAME \
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    
    echo "   Warte 10s auf Role-Propagierung..."
    sleep 10
fi

ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"

# Lambda erstellen oder aktualisieren
echo "⚡ Deploye Lambda: $LAMBDA_NAME..."
if aws lambda get-function --function-name $LAMBDA_NAME --region $REGION 2>/dev/null; then
    aws lambda update-function-code \
        --function-name $LAMBDA_NAME \
        --zip-file fileb://telegram-bot.zip \
        --region $REGION > /dev/null
    
    aws lambda update-function-configuration \
        --function-name $LAMBDA_NAME \
        --environment "Variables={TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN},ALLOWED_CHAT_ID=${ALLOWED_CHAT_ID},OPENAI_API_KEY=${OPENAI_KEY}}" \
        --timeout 30 \
        --region $REGION > /dev/null
else
    aws lambda create-function \
        --function-name $LAMBDA_NAME \
        --runtime nodejs20.x \
        --role $ROLE_ARN \
        --handler index.handler \
        --zip-file fileb://telegram-bot.zip \
        --timeout 30 \
        --memory-size 256 \
        --environment "Variables={TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN},ALLOWED_CHAT_ID=${ALLOWED_CHAT_ID},OPENAI_API_KEY=${OPENAI_KEY}}" \
        --region $REGION > /dev/null
fi

# Reminder Lambda erstellen
echo "⏰ Deploye Reminder Lambda: $REMINDER_LAMBDA_NAME..."
if aws lambda get-function --function-name $REMINDER_LAMBDA_NAME --region $REGION 2>/dev/null; then
    aws lambda update-function-code \
        --function-name $REMINDER_LAMBDA_NAME \
        --zip-file fileb://telegram-bot.zip \
        --region $REGION > /dev/null
    
    aws lambda update-function-configuration \
        --function-name $REMINDER_LAMBDA_NAME \
        --handler index.sendReminder \
        --environment "Variables={TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN},ALLOWED_CHAT_ID=${ALLOWED_CHAT_ID}}" \
        --region $REGION > /dev/null
else
    aws lambda create-function \
        --function-name $REMINDER_LAMBDA_NAME \
        --runtime nodejs20.x \
        --role $ROLE_ARN \
        --handler index.sendReminder \
        --zip-file fileb://telegram-bot.zip \
        --timeout 30 \
        --memory-size 128 \
        --environment "Variables={TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN},ALLOWED_CHAT_ID=${ALLOWED_CHAT_ID}}" \
        --region $REGION > /dev/null
fi

# API Gateway erstellen
echo "🌐 Konfiguriere API Gateway..."
API_ID=$(aws apigatewayv2 get-apis --region $REGION --query "Items[?Name=='$API_NAME'].ApiId" --output text)

if [ -z "$API_ID" ]; then
    echo "   Erstelle neues API Gateway..."
    API_ID=$(aws apigatewayv2 create-api \
        --name $API_NAME \
        --protocol-type HTTP \
        --region $REGION \
        --query 'ApiId' --output text)
    
    # Integration erstellen
    INTEGRATION_ID=$(aws apigatewayv2 create-integration \
        --api-id $API_ID \
        --integration-type AWS_PROXY \
        --integration-uri "arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${LAMBDA_NAME}" \
        --payload-format-version "2.0" \
        --region $REGION \
        --query 'IntegrationId' --output text)
    
    # Route erstellen
    aws apigatewayv2 create-route \
        --api-id $API_ID \
        --route-key "POST /webhook" \
        --target "integrations/$INTEGRATION_ID" \
        --region $REGION > /dev/null
    
    # Stage erstellen
    aws apigatewayv2 create-stage \
        --api-id $API_ID \
        --stage-name "prod" \
        --auto-deploy \
        --region $REGION > /dev/null
    
    # Lambda Permission
    aws lambda add-permission \
        --function-name $LAMBDA_NAME \
        --statement-id "apigateway-invoke" \
        --action "lambda:InvokeFunction" \
        --principal apigateway.amazonaws.com \
        --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/*" \
        --region $REGION 2>/dev/null || true
fi

WEBHOOK_URL="https://${API_ID}.execute-api.${REGION}.amazonaws.com/prod/webhook"

# CloudWatch Event für 17:00 Reminder (CET = 15:00 UTC im Sommer, 16:00 UTC im Winter)
echo "📅 Konfiguriere Abend-Reminder (17:00 CET)..."
RULE_NAME="telegram-productivity-reminder-daily"

aws events put-rule \
    --name $RULE_NAME \
    --schedule-expression "cron(0 15 ? * MON-FRI *)" \
    --state ENABLED \
    --description "Täglicher Productivity Reminder um 17:00 CET (Mo-Fr)" \
    --region $REGION > /dev/null

aws lambda add-permission \
    --function-name $REMINDER_LAMBDA_NAME \
    --statement-id "cloudwatch-trigger" \
    --action "lambda:InvokeFunction" \
    --principal events.amazonaws.com \
    --source-arn "arn:aws:events:${REGION}:${ACCOUNT_ID}:rule/${RULE_NAME}" \
    --region $REGION 2>/dev/null || true

aws events put-targets \
    --rule $RULE_NAME \
    --targets "Id"="1","Arn"="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${REMINDER_LAMBDA_NAME}" \
    --region $REGION > /dev/null

# Telegram Webhook setzen
echo "🔗 Setze Telegram Webhook..."
curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook?url=${WEBHOOK_URL}" > /dev/null

# Aufräumen
rm -f telegram-bot.zip

echo ""
echo "✅ Deployment erfolgreich!"
echo ""
echo "📱 Telegram Bot ist bereit!"
echo "   Webhook: $WEBHOOK_URL"
echo ""
echo "🕐 Reminder: Täglich 17:00 CET (Mo-Fr)"
echo ""
echo "👉 Jetzt kannst du deinem Bot schreiben!"
echo "   Beispiel: '2h Horizon Support-Call'"
echo ""
