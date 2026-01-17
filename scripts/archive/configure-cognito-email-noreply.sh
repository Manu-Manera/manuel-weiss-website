#!/bin/bash

# Konfiguriert Cognito für no-reply E-Mail-Adresse

set -e

REGION="eu-central-1"
USER_POOL_ID="eu-central-1_8gP4gLK9r"
SES_EMAIL="noreply@mawps.netlify.app"

echo "📧 Konfiguriere Cognito für no-reply E-Mail"
echo "==========================================="
echo ""

# Prüfe ob E-Mail verifiziert ist
echo "Prüfe E-Mail-Verifizierung..."
STATUS=$(aws sesv2 get-email-identity \
    --email-identity "$SES_EMAIL" \
    --region "$REGION" \
    --query "VerificationStatus" \
    --output text 2>/dev/null || echo "NOT_FOUND")

if [ "$STATUS" != "SUCCESS" ]; then
    echo "❌ E-Mail-Adresse $SES_EMAIL ist nicht verifiziert (Status: $STATUS)"
    echo ""
    echo "Bitte verifiziere die E-Mail-Adresse zuerst:"
    echo "1. Prüfe E-Mail-Postfach für $SES_EMAIL"
    echo "2. Klicke auf Verifizierungs-Link"
    echo "3. Oder: Prüfe DNS-Einträge falls Domain-Verifizierung"
    exit 1
fi

echo "✅ E-Mail-Adresse ist verifiziert"
echo ""

# Hole Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
SOURCE_ARN="arn:aws:ses:$REGION:$ACCOUNT_ID:identity/$SES_EMAIL"

echo "Konfiguriere Cognito..."
aws cognito-idp update-user-pool \
    --user-pool-id "$USER_POOL_ID" \
    --region "$REGION" \
    --email-configuration "{
        \"EmailSendingAccount\": \"DEVELOPER\",
        \"SourceArn\": \"$SOURCE_ARN\",
        \"ReplyToEmailAddress\": \"$SES_EMAIL\",
        \"From\": \"$SES_EMAIL\"
    }" && {
    echo "✅ Cognito erfolgreich konfiguriert für $SES_EMAIL"
} || {
    echo "❌ Fehler beim Konfigurieren"
    exit 1
}

echo ""
echo "✅ Fertig! Cognito verwendet jetzt $SES_EMAIL"

