#!/bin/bash

# Script zum erneuten Senden des Bestätigungscodes für einen Benutzer

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

USER_POOL_ID="eu-central-1_8gP4gLK9r"
CLIENT_ID="7kc5tt6a23fgh53d60vkefm812"
REGION="eu-central-1"

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

if [ -z "$1" ]; then
    print_error "Bitte geben Sie eine E-Mail-Adresse an:"
    echo "  ./resend-verification-code-user.sh thorsten.tester69@yopmail.com"
    exit 1
fi

EMAIL="$1"

echo "📧 Bestätigungscode erneut senden"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# 1. Finde Benutzer
print_status "1️⃣ Suche Benutzer: $EMAIL"

USERS=$(aws cognito-idp list-users \
    --user-pool-id "$USER_POOL_ID" \
    --region "$REGION" \
    --output json 2>&1)

USER=$(echo "$USERS" | python3 -c "
import sys, json
users = json.load(sys.stdin).get('Users', [])
for u in users:
    email_attr = [a.get('Value') for a in u.get('Attributes', []) if a.get('Name') == 'email']
    if email_attr and email_attr[0].lower() == '$EMAIL'.lower():
        print(json.dumps(u))
        break
" 2>/dev/null)

if [ -z "$USER" ]; then
    print_error "❌ Benutzer mit E-Mail $EMAIL nicht gefunden!"
    exit 1
fi

USERNAME=$(echo "$USER" | python3 -c "import sys, json; print(json.load(sys.stdin).get('Username'))")
STATUS=$(echo "$USER" | python3 -c "import sys, json; print(json.load(sys.stdin).get('UserStatus'))")

print_success "✅ Benutzer gefunden:"
echo "   Username: $USERNAME"
echo "   Status: $STATUS"
echo ""

# 2. Prüfe Status
if [ "$STATUS" = "CONFIRMED" ]; then
    print_warning "⚠️  Benutzer ist bereits bestätigt!"
    echo ""
    read -p "Möchten Sie trotzdem einen neuen Code senden? (j/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[JjYy]$ ]]; then
        exit 0
    fi
fi

# 3. Sende Code erneut
print_status "2️⃣ Sende Bestätigungscode erneut..."

RESULT=$(aws cognito-idp resend-confirmation-code \
    --client-id "$CLIENT_ID" \
    --username "$USERNAME" \
    --region "$REGION" \
    --output json 2>&1)

if [ $? -eq 0 ]; then
    print_success "✅ Bestätigungscode wurde erneut gesendet!"
    echo ""
    echo "📧 E-Mail sollte ankommen an: $EMAIL"
    echo ""
    print_warning "⚠️  WICHTIG: Falls die E-Mail nicht ankommt:"
    echo "   - SES ist noch im Sandbox-Modus"
    echo "   - E-Mails können nur an verifizierte Adressen gesendet werden"
    echo "   - $EMAIL ist nicht verifiziert"
    echo ""
    echo "📋 Lösungen:"
    echo "   1. Warten Sie auf SES Production Access (24-48h)"
    echo "   2. Oder: Verifizieren Sie $EMAIL in SES"
    echo "   3. Oder: Benutzer manuell bestätigen (Admin-Panel)"
else
    print_error "❌ Fehler beim Senden des Codes:"
    echo "$RESULT" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('message', d))" 2>/dev/null || echo "$RESULT"
    exit 1
fi

