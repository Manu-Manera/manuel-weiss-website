#!/bin/bash

# Prüft ob Domain-DNS-Datensätze korrekt eingetragen sind

set -e

DOMAIN="manuel-weiss.de"
REGION="eu-central-1"

echo "🔍 Prüfe Domain-Verifizierung: $DOMAIN"
echo "======================================"
echo ""

# Prüfe Verifizierungs-Status
STATUS=$(aws sesv2 get-email-identity \
    --email-identity "$DOMAIN" \
    --region "$REGION" \
    --query 'VerificationStatus' \
    --output text 2>/dev/null || echo "NOT_FOUND")

echo "Verifizierungs-Status: $STATUS"
echo ""

if [ "$STATUS" = "SUCCESS" ]; then
    echo "✅ Domain ist verifiziert!"
    echo ""
    echo "Jetzt kannst du Production Access beantragen:"
    echo "https://eu-central-1.console.aws.amazon.com/ses/home?region=eu-central-1#/account"
else
    echo "❌ Domain ist noch nicht verifiziert"
    echo ""
    echo "Du musst die DKIM-Datensätze in deine DNS-Einstellungen eintragen:"
    echo ""
    echo "1. Gehe zu deinem DNS-Provider (z.B. wo manuel-weiss.de verwaltet wird)"
    echo "2. Füge die 3 CNAME-Datensätze hinzu (siehe SES Console)"
    echo "3. Warte auf DNS-Propagierung (meist 5-60 Minuten)"
    echo "4. Prüfe dann erneut mit diesem Script"
fi

echo ""

