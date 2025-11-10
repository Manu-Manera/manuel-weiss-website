#!/bin/bash

# Fix: Aktiviert Auto-Verify für E-Mail im Cognito User Pool

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

echo "🔧 Fix: Aktiviere Auto-Verify für E-Mail"
echo "========================================"
echo ""

# Prüfe aktuellen Status
print_status "Prüfe aktuellen Status..."
CURRENT_AUTO_VERIFY=$(aws cognito-idp describe-user-pool \
    --user-pool-id "$USER_POOL_ID" \
    --region "$REGION" \
    --query 'UserPool.AutoVerifiedAttributes' \
    --output json 2>/dev/null || echo "[]")

echo "Aktuell: $CURRENT_AUTO_VERIFY"
echo ""

# Aktiviere Auto-Verify für Email
print_status "Aktiviere Auto-Verify für Email..."

aws cognito-idp update-user-pool \
    --user-pool-id "$USER_POOL_ID" \
    --region "$REGION" \
    --auto-verified-attributes email && {
    print_success "✅ Auto-Verify für Email aktiviert"
} || {
    print_error "❌ Fehler beim Aktivieren von Auto-Verify"
    exit 1
}

echo ""

# Setze E-Mail-Vorlage
print_status "Setze E-Mail-Vorlage..."

aws cognito-idp update-user-pool \
    --user-pool-id "$USER_POOL_ID" \
    --region "$REGION" \
    --verification-message-template '{
        "DefaultEmailOption": "CONFIRM_WITH_CODE",
        "EmailSubject": "Bestätigen Sie Ihr Konto - Manuel Weiss",
        "EmailMessage": "Hallo {{username}},\n\nWillkommen bei Manuel Weiss HR-Beratung!\n\nIhr Bestätigungscode lautet: {{####}}\n\nBitte geben Sie diesen Code ein, um Ihr Konto zu aktivieren.\n\nBei Fragen wenden Sie sich an: weiss-manuel@gmx.de\n\nMit freundlichen Grüßen\nManuel Weiss"
    }' && {
    print_success "✅ E-Mail-Vorlage gesetzt"
} || {
    print_warning "⚠️  Fehler beim Setzen der E-Mail-Vorlage (möglicherweise bereits gesetzt)"
}

echo ""

# Prüfe neuen Status
print_status "Prüfe neuen Status..."
NEW_AUTO_VERIFY=$(aws cognito-idp describe-user-pool \
    --user-pool-id "$USER_POOL_ID" \
    --region "$REGION" \
    --query 'UserPool.AutoVerifiedAttributes' \
    --output json 2>/dev/null || echo "[]")

echo "Neu: $NEW_AUTO_VERIFY"
echo ""

if echo "$NEW_AUTO_VERIFY" | grep -q "email"; then
    print_success "✅ Auto-Verify für Email ist jetzt aktiviert!"
    echo ""
    print_status "E-Mails sollten jetzt automatisch versendet werden bei Registrierung."
else
    print_error "❌ Auto-Verify konnte nicht aktiviert werden"
    exit 1
fi

echo ""

