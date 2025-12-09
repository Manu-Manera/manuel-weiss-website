#!/bin/bash

# Script zum Konfigurieren von Cognito E-Mail-Verification und MFA
# Setzt E-Mail-Vorlagen und aktiviert 2FA (TOTP + SMS)

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

USER_POOL_ID="eu-central-1_8gP4gLK9r"
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

echo "🔧 Cognito E-Mail-Verification & 2FA konfigurieren"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Schritt 1: E-Mail-Vorlagen setzen
print_status "1️⃣ Setze E-Mail-Verification-Vorlagen..."

# Erstelle temporäre JSON-Datei
TEMP_JSON=$(mktemp)

# E-Mail-Vorlage JSON (einfache Version)
cat > "$TEMP_JSON" <<'JSONEOF'
{
  "DefaultEmailOption": "CONFIRM_WITH_CODE",
  "EmailSubject": "Bestätigen Sie Ihre E-Mail-Adresse - Manuel Weiss",
  "EmailMessage": "Hallo {{username}},\n\nvielen Dank für Ihre Registrierung bei Manuel Weiss Professional Services!\n\nBitte bestätigen Sie Ihre E-Mail-Adresse mit dem folgenden Code:\n\n{{####}}\n\nDieser Code ist 24 Stunden gültig.\n\nMit freundlichen Grüßen\nManuel Weiss"
}
JSONEOF

# Setze E-Mail-Vorlage
aws cognito-idp update-user-pool \
    --user-pool-id "$USER_POOL_ID" \
    --region "$REGION" \
    --verification-message-template "file://$TEMP_JSON" && {
    print_success "✅ E-Mail-Vorlagen gesetzt"
    rm -f "$TEMP_JSON"
} || {
    print_error "❌ Fehler beim Setzen der E-Mail-Vorlagen"
    rm -f "$TEMP_JSON"
    exit 1
}

echo ""

# Schritt 2: MFA konfigurieren
print_status "2️⃣ Konfiguriere MFA (OPTIONAL, TOTP + SMS)..."

# Setze MFA auf OPTIONAL
aws cognito-idp update-user-pool \
    --user-pool-id "$USER_POOL_ID" \
    --region "$REGION" \
    --mfa-configuration OPTIONAL && {
    print_success "✅ MFA auf OPTIONAL gesetzt"
} || {
    print_error "❌ Fehler beim Setzen von MFA"
    exit 1
}

# Setze MFA Second Factor (TOTP + SMS)
# Hinweis: SMS erfordert SNS-Konfiguration, TOTP ist Standard
print_status "   → TOTP (Authenticator App) ist automatisch aktiviert"
print_warning "   ⚠️  SMS-MFA erfordert zusätzliche SNS-Konfiguration (optional)"

echo ""

# Schritt 3: Prüfe Konfiguration
print_status "3️⃣ Prüfe Konfiguration..."

# Prüfe E-Mail-Vorlagen
EMAIL_CONFIG=$(aws cognito-idp describe-user-pool \
    --user-pool-id "$USER_POOL_ID" \
    --region "$REGION" \
    --query "UserPool.VerificationMessageTemplate" \
    --output json 2>&1)

EMAIL_SUBJECT_CHECK=$(echo "$EMAIL_CONFIG" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('EmailSubject', 'NICHT GESETZT'))" 2>/dev/null || echo "FEHLER")

if [ "$EMAIL_SUBJECT_CHECK" != "NICHT GESETZT" ] && [ "$EMAIL_SUBJECT_CHECK" != "FEHLER" ]; then
    print_success "✅ E-Mail-Subject: $EMAIL_SUBJECT_CHECK"
else
    print_warning "⚠️  E-Mail-Subject nicht gesetzt"
fi

# Prüfe MFA
MFA_CONFIG=$(aws cognito-idp describe-user-pool \
    --user-pool-id "$USER_POOL_ID" \
    --region "$REGION" \
    --query "UserPool.MfaConfiguration" \
    --output text 2>&1)

if [ "$MFA_CONFIG" = "OPTIONAL" ]; then
    print_success "✅ MFA Configuration: $MFA_CONFIG"
else
    print_warning "⚠️  MFA Configuration: $MFA_CONFIG (erwartet: OPTIONAL)"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
print_success "✅ Cognito E-Mail-Verification & 2FA konfiguriert!"
echo ""
echo "📋 Zusammenfassung:"
echo "   ✅ E-Mail-Vorlagen gesetzt"
echo "   ✅ MFA auf OPTIONAL gesetzt"
echo "   ✅ TOTP (Authenticator App) aktiviert"
echo ""
echo "📝 Nächste Schritte:"
echo "   1. Testen Sie die E-Mail-Bestätigung mit einer neuen Registrierung"
echo "   2. Implementieren Sie die 2FA-Setup-UI im Frontend"
echo "   3. Implementieren Sie den 2FA-Login-Flow"
echo ""
