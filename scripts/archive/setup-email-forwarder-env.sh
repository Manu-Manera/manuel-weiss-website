#!/bin/bash

# Setup Environment Variables für Email Forwarder Lambda

FUNCTION_NAME="ManuelWeissEmailSetup-EmailProcessor218EC076-i0Dq2uhJRLy9"
REGION="eu-central-1"
FORWARD_TO="${1:-weiss-manuel@gmx.de}"

echo "🔧 Konfiguriere Email Forwarder Lambda..."
echo "Function: $FUNCTION_NAME"
echo "Forward To: $FORWARD_TO"
echo ""

# Update Environment Variables
aws lambda update-function-configuration \
  --function-name "$FUNCTION_NAME" \
  --region "$REGION" \
  --environment "Variables={
    EMAIL_BUCKET=manu-email-storage-038333965110,
    DOMAIN_NAME=manuel-weiss.ch,
    FORWARD_TO_EMAIL=$FORWARD_TO,
    FROM_EMAIL=mail@manuel-weiss.ch,
    AWS_REGION=$REGION
  }" \
  --output json > /tmp/lambda-update.json 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Environment Variables aktualisiert!"
    echo ""
    echo "Aktuelle Konfiguration:"
    aws lambda get-function-configuration \
      --function-name "$FUNCTION_NAME" \
      --region "$REGION" \
      --query "Environment.Variables" \
      --output json | python3 -m json.tool
else
    echo "❌ Fehler beim Aktualisieren"
    cat /tmp/lambda-update.json
fi

