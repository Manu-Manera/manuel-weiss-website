#!/bin/bash

# Test-Script für AWS Cognito Registrierung
# Testet die vollständige Registrierung und E-Mail-Bestätigung

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
CLIENT_ID="7kc5tt6a23fgh53d60vkefm812"

echo "🧪 AWS Cognito Registrierung Test"
echo "=================================="
echo ""

# Generiere Test-E-Mail
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="Test1234!"

print_status "Test-E-Mail: $TEST_EMAIL"
print_status "Test-Passwort: $TEST_PASSWORD"
echo ""

# 1. Test Registrierung
print_status "Schritt 1: Teste Registrierung..."
REGISTER_RESULT=$(aws cognito-idp sign-up \
    --client-id "$CLIENT_ID" \
    --username "$TEST_EMAIL" \
    --password "$TEST_PASSWORD" \
    --user-attributes Name=email,Value="$TEST_EMAIL" Name=given_name,Value="Test" Name=family_name,Value="User" \
    --region "$REGION" \
    --output json 2>&1)

if echo "$REGISTER_RESULT" | grep -q "UserSub"; then
    print_success "✅ Registrierung erfolgreich"
    
    # Extrahiere Code Delivery Details
    CODE_DELIVERY=$(echo "$REGISTER_RESULT" | grep -o '"CodeDeliveryDetails":{[^}]*}' || echo "")
    
    if [ -n "$CODE_DELIVERY" ]; then
        print_success "✅ Bestätigungscode wurde gesendet"
        print_status "Bitte prüfen Sie die E-Mail für $TEST_EMAIL"
    else
        print_warning "⚠️  Code Delivery Details nicht gefunden"
    fi
else
    ERROR_MSG=$(echo "$REGISTER_RESULT" | grep -o '"__type":"[^"]*"' | cut -d'"' -f4 || echo "Unknown")
    if echo "$REGISTER_RESULT" | grep -q "UsernameExistsException"; then
        print_warning "⚠️  Benutzer existiert bereits (OK für Test)"
    else
        print_error "❌ Registrierung fehlgeschlagen: $ERROR_MSG"
        echo "$REGISTER_RESULT"
        exit 1
    fi
fi

echo ""

# 2. Test Code erneut senden
print_status "Schritt 2: Teste Code erneut senden..."
RESEND_RESULT=$(aws cognito-idp resend-confirmation-code \
    --client-id "$CLIENT_ID" \
    --username "$TEST_EMAIL" \
    --region "$REGION" \
    --output json 2>&1)

if echo "$RESEND_RESULT" | grep -q "CodeDeliveryDetails"; then
    print_success "✅ Code erneut gesendet"
else
    print_warning "⚠️  Code erneut senden fehlgeschlagen (möglicherweise bereits bestätigt)"
fi

echo ""

print_success "🎉 Test abgeschlossen!"
print_status ""
print_status "Nächste Schritte:"
print_status "  1. Prüfen Sie die E-Mail für $TEST_EMAIL"
print_status "  2. Verwenden Sie den Bestätigungscode in der Web-Anwendung"
print_status "  3. Oder bestätigen Sie manuell mit:"
print_status "     aws cognito-idp confirm-sign-up \\"
print_status "       --client-id $CLIENT_ID \\"
print_status "       --username $TEST_EMAIL \\"
print_status "       --confirmation-code <CODE> \\"
print_status "       --region $REGION"
echo ""

