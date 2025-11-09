#!/bin/bash

# AWS Cognito E-Mail-Konfiguration
# Konfiguriert den User Pool für E-Mail-Versand über SES

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

REGION="eu-central-1"
USER_POOL_ID="eu-central-1_8gP4gLK9r"
SES_EMAIL="weiss-manuel@gmx.de"  # Verifizierte E-Mail-Adresse

echo "📧 AWS Cognito E-Mail-Konfiguration"
echo "===================================="
echo ""

# Prüfe ob E-Mail-Adresse verifiziert ist
print_status "Prüfe E-Mail-Verifizierung für $SES_EMAIL..."
EMAIL_STATUS=$(aws sesv2 get-email-identity \
    --email-identity "$SES_EMAIL" \
    --region "$REGION" \
    --query "VerificationStatus" \
    --output text 2>/dev/null || echo "NOT_FOUND")

if [ "$EMAIL_STATUS" != "SUCCESS" ]; then
    print_error "E-Mail-Adresse $SES_EMAIL ist nicht verifiziert (Status: $EMAIL_STATUS)"
    print_status "Bitte verifizieren Sie die E-Mail-Adresse zuerst:"
    print_status "  aws sesv2 create-email-identity --email-identity $SES_EMAIL --region $REGION"
    exit 1
fi

print_success "E-Mail-Adresse ist verifiziert ✅"
echo ""

# Hole AWS Account ID
print_status "Hole AWS Account ID..."
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
print_success "Account ID: $ACCOUNT_ID"
echo ""

# Konfiguriere E-Mail-Einstellungen
print_status "Konfiguriere E-Mail-Einstellungen für User Pool..."

# Erstelle Source ARN
SOURCE_ARN="arn:aws:ses:$REGION:$ACCOUNT_ID:identity/$SES_EMAIL"

print_status "Source ARN: $SOURCE_ARN"

# Update User Pool E-Mail-Konfiguration
aws cognito-idp update-user-pool \
    --user-pool-id "$USER_POOL_ID" \
    --region "$REGION" \
    --email-configuration "{
        \"EmailSendingAccount\": \"DEVELOPER\",
        \"SourceArn\": \"$SOURCE_ARN\",
        \"ReplyToEmailAddress\": \"$SES_EMAIL\",
        \"From\": \"$SES_EMAIL\"
    }" && {
    print_success "✅ E-Mail-Konfiguration erfolgreich gesetzt"
} || {
    print_error "❌ Fehler beim Konfigurieren der E-Mail-Einstellungen"
    exit 1
}

echo ""

# Prüfe die Konfiguration
print_status "Prüfe aktuelle E-Mail-Konfiguration..."
EMAIL_CONFIG=$(aws cognito-idp describe-user-pool \
    --user-pool-id "$USER_POOL_ID" \
    --region "$REGION" \
    --query 'UserPool.EmailConfiguration' \
    --output json)

EMAIL_SENDING=$(echo "$EMAIL_CONFIG" | grep -o '"EmailSendingAccount":"[^"]*"' | cut -d'"' -f4 || echo "N/A")
REPLY_TO=$(echo "$EMAIL_CONFIG" | grep -o '"ReplyToEmailAddress":"[^"]*"' | cut -d'"' -f4 || echo "N/A")

print_status "  EmailSendingAccount: $EMAIL_SENDING"
print_status "  ReplyToEmailAddress: $REPLY_TO"

if [ "$EMAIL_SENDING" = "DEVELOPER" ]; then
    print_success "✅ E-Mail-Konfiguration ist korrekt"
else
    print_warning "⚠️  E-Mail-Konfiguration könnte nicht korrekt sein"
fi

echo ""
print_success "🎉 Konfiguration abgeschlossen!"
print_status "Der User Pool kann jetzt E-Mails über SES versenden."
echo ""

