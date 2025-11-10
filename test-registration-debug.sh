#!/bin/bash

# Debug-Script für Registrierung - zeigt alle Details

set -e

REGION="eu-central-1"
USER_POOL_ID="eu-central-1_8gP4gLK9r"
CLIENT_ID="7kc5tt6a23fgh53d60vkefm812"

# Generiere Test-E-Mail
TEST_EMAIL="test-debug-$(date +%s)@example.com"
TEST_PASSWORD="Test1234!"

echo "🧪 Debug: Test-Registrierung"
echo "============================="
echo ""
echo "Test-E-Mail: $TEST_EMAIL"
echo "Test-Passwort: $TEST_PASSWORD"
echo ""

# Führe Registrierung durch und zeige ALLE Details
echo "📤 Führe Registrierung durch..."
RESULT=$(aws cognito-idp sign-up \
    --client-id "$CLIENT_ID" \
    --username "$TEST_EMAIL" \
    --password "$TEST_PASSWORD" \
    --user-attributes Name=email,Value="$TEST_EMAIL" Name=given_name,Value="Test" Name=family_name,Value="Debug" \
    --region "$REGION" \
    --output json 2>&1)

echo ""
echo "📋 Vollständige Antwort:"
echo "$RESULT" | jq '.' 2>/dev/null || echo "$RESULT"
echo ""

# Extrahiere Code Delivery Details
CODE_DELIVERY=$(echo "$RESULT" | grep -o '"CodeDeliveryDetails":{[^}]*}' || echo "")

if [ -n "$CODE_DELIVERY" ]; then
    echo "✅ Code Delivery Details gefunden:"
    echo "$CODE_DELIVERY"
    echo ""
    
    # Extrahiere Delivery Medium
    DELIVERY_MEDIUM=$(echo "$CODE_DELIVERY" | grep -o '"DeliveryMedium":"[^"]*"' | cut -d'"' -f4 || echo "N/A")
    DESTINATION=$(echo "$CODE_DELIVERY" | grep -o '"Destination":"[^"]*"' | cut -d'"' -f4 || echo "N/A")
    
    echo "📧 Delivery Medium: $DELIVERY_MEDIUM"
    echo "📧 Destination: $DESTINATION"
    
    if [ "$DELIVERY_MEDIUM" = "EMAIL" ]; then
        echo "✅ E-Mail sollte versendet worden sein an: $DESTINATION"
    else
        echo "⚠️  Delivery Medium ist nicht EMAIL: $DELIVERY_MEDIUM"
    fi
else
    echo "❌ Keine Code Delivery Details gefunden!"
    echo ""
    echo "Mögliche Probleme:"
    echo "  1. Auto-Verify ist nicht aktiviert"
    echo "  2. E-Mail-Konfiguration fehlt"
    echo "  3. SES ist nicht richtig konfiguriert"
fi

echo ""

