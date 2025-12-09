#!/bin/bash

# Fix Email Forwarder Lambda Function
# Aktualisiert die Lambda Function auf AWS SDK v3

LAMBDA_FUNCTION_NAME="ManuelWeissEmailSetup-EmailProcessor218EC076-i0Dq2uhJRLy9"
REGION="eu-central-1"
LAMBDA_DIR="lambda/email-forwarder"

echo "🔧 Fix Email Forwarder Lambda Function"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# 1. Installiere Dependencies
echo "1️⃣ Installiere Dependencies..."
cd "$LAMBDA_DIR"
npm install
cd - > /dev/null
echo "✅ Dependencies installiert"
echo ""

# 2. Erstelle ZIP-Paket
echo "2️⃣ Erstelle ZIP-Paket..."
cd "$LAMBDA_DIR"
zip -r email-forwarder.zip . -x "*.git*" -x "*.md" -x "node_modules/.cache/*"
cd - > /dev/null
echo "✅ ZIP-Paket erstellt: $LAMBDA_DIR/email-forwarder.zip"
echo ""

# 3. Aktualisiere Lambda Function Code
echo "3️⃣ Aktualisiere Lambda Function Code..."
aws lambda update-function-code \
  --function-name "$LAMBDA_FUNCTION_NAME" \
  --zip-file "fileb://$LAMBDA_DIR/email-forwarder.zip" \
  --region "$REGION" \
  --output json > /tmp/lambda-update.json

if [ $? -eq 0 ]; then
    echo "✅ Lambda Function Code aktualisiert"
    echo ""
    
    # 4. Warte auf Update
    echo "4️⃣ Warte auf Lambda Function Update..."
    aws lambda wait function-updated \
      --function-name "$LAMBDA_FUNCTION_NAME" \
      --region "$REGION"
    echo "✅ Lambda Function Update abgeschlossen"
    echo ""
    
    # 5. Aktualisiere Handler
    echo "5️⃣ Aktualisiere Handler auf index-v3.handler..."
    aws lambda update-function-configuration \
      --function-name "$LAMBDA_FUNCTION_NAME" \
      --handler "index-v3.handler" \
      --region "$REGION" \
      --output json > /tmp/lambda-config.json
    
    if [ $? -eq 0 ]; then
        echo "✅ Handler aktualisiert"
        echo ""
        
        # 6. Prüfe Status
        echo "6️⃣ Prüfe Lambda Function Status..."
        aws lambda get-function-configuration \
          --function-name "$LAMBDA_FUNCTION_NAME" \
          --region "$REGION" \
          --query "[State,LastUpdateStatus,Handler]" \
          --output text
        
        echo ""
        echo "═══════════════════════════════════════════════════════════════"
        echo "✅ Email Forwarder Lambda Function erfolgreich aktualisiert!"
        echo ""
        echo "Die Lambda Function verwendet jetzt AWS SDK v3 und sollte"
        echo "E-Mails korrekt weiterleiten können."
        echo ""
        echo "Testen Sie mit einer E-Mail an mail@manuel-weiss.ch"
    else
        echo "❌ Fehler beim Aktualisieren des Handlers"
        exit 1
    fi
else
    echo "❌ Fehler beim Aktualisieren des Lambda Function Codes"
    exit 1
fi

