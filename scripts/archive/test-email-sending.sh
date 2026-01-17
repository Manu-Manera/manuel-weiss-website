#!/bin/bash

# Test ob E-Mails wirklich versendet werden

set -e

REGION="eu-central-1"
USER_POOL_ID="eu-central-1_8gP4gLK9r"
CLIENT_ID="7kc5tt6a23fgh53d60vkefm812"
TEST_EMAIL="weiss-manuel@gmx.de"  # Verifizierte E-Mail

echo "🧪 Test: E-Mail-Versand"
echo "======================"
echo ""

# Prüfe ob User existiert
echo "📋 Prüfe User-Status..."
USER_STATUS=$(aws cognito-idp admin-get-user \
    --user-pool-id "$USER_POOL_ID" \
    --username "$TEST_EMAIL" \
    --region "$REGION" \
    --query 'UserStatus' \
    --output text 2>/dev/null || echo "NOT_FOUND")

echo "User Status: $USER_STATUS"
echo ""

if [ "$USER_STATUS" = "CONFIRMED" ]; then
    echo "⚠️  User ist bereits bestätigt. Lösche User für Test..."
    aws cognito-idp admin-delete-user \
        --user-pool-id "$USER_POOL_ID" \
        --username "$TEST_EMAIL" \
        --region "$REGION" 2>&1 | grep -v "does not exist" || true
    echo "✅ User gelöscht (falls vorhanden)"
    echo ""
    sleep 2
fi

# Führe Registrierung durch
echo "📤 Führe Registrierung durch..."
RESULT=$(aws cognito-idp sign-up \
    --client-id "$CLIENT_ID" \
    --username "$TEST_EMAIL" \
    --password "Test1234!" \
    --user-attributes Name=email,Value="$TEST_EMAIL" Name=given_name,Value="Test" Name=family_name,Value="User" \
    --region "$REGION" \
    --output json 2>&1)

echo ""
echo "📋 Ergebnis:"
echo "$RESULT" | jq '.' 2>/dev/null || echo "$RESULT"
echo ""

# Prüfe Code Delivery
if echo "$RESULT" | grep -q "CodeDeliveryDetails"; then
    echo "✅ CodeDeliveryDetails gefunden!"
    
    DELIVERY_MEDIUM=$(echo "$RESULT" | jq -r '.CodeDeliveryDetails.DeliveryMedium' 2>/dev/null || echo "N/A")
    DESTINATION=$(echo "$RESULT" | jq -r '.CodeDeliveryDetails.Destination' 2>/dev/null || echo "N/A")
    
    echo "   Delivery Medium: $DELIVERY_MEDIUM"
    echo "   Destination: $DESTINATION"
    echo ""
    
    if [ "$DELIVERY_MEDIUM" = "EMAIL" ]; then
        echo "✅ E-Mail sollte versendet worden sein!"
        echo ""
        echo "📧 Bitte prüfen Sie das E-Mail-Postfach für: $DESTINATION"
        echo "   (Auch Spam-Ordner prüfen!)"
    fi
else
    echo "❌ Keine CodeDeliveryDetails gefunden!"
fi

echo ""

