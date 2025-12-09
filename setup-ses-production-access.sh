#!/bin/bash

# Script zum Beantragen von SES Production Access
# WICHTIG: Dies kann 24-48 Stunden dauern!

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

echo "🚀 SES Production Access beantragen"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Prüfe aktuellen Status
print_status "Prüfe aktuellen SES-Status..."
CURRENT_STATUS=$(aws sesv2 get-account --region "$REGION" --output json 2>&1 | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('ProductionAccessEnabled', False))" 2>/dev/null || echo "false")

if [ "$CURRENT_STATUS" = "True" ]; then
    print_success "✅ SES Production Access ist bereits aktiviert!"
    exit 0
fi

print_warning "⚠️  SES ist noch im Sandbox-Modus"
echo ""

# Prüfe verifizierte Identitäten
print_status "Prüfe verifizierte E-Mail-Adressen..."
VERIFIED_EMAILS=$(aws sesv2 list-email-identities --region "$REGION" --output json 2>&1 | python3 -c "import sys, json; d=json.load(sys.stdin); emails = [i.get('IdentityName') for i in d.get('EmailIdentities', []) if i.get('VerificationStatus') == 'SUCCESS']; print('\\n'.join(emails))" 2>/dev/null || echo "")

if [ -z "$VERIFIED_EMAILS" ]; then
    print_error "❌ Keine verifizierten E-Mail-Adressen gefunden!"
    print_warning "⚠️  Bitte verifizieren Sie mindestens eine E-Mail-Adresse vor dem Production Access Request"
    exit 1
fi

echo "Verifizierte E-Mail-Adressen:"
echo "$VERIFIED_EMAILS" | while read -r email; do
    echo "  ✅ $email"
done
echo ""

# Production Access Request
print_status "Stelle Production Access Request..."
print_warning "⚠️  Dies kann 24-48 Stunden dauern!"
echo ""

# Erstelle Request JSON
REQUEST_JSON=$(cat <<EOF
{
  "MailType": "TRANSACTIONAL",
  "WebsiteURL": "https://manuel-weiss.ch",
  "UseCaseDescription": "Wir senden Transaktions-E-Mails für Benutzer-Registrierungen, E-Mail-Bestätigungen und 2FA-Codes. Die E-Mails werden nur an registrierte Benutzer gesendet, die sich auf unserer Website angemeldet haben.",
  "AdditionalContactEmailAddresses": ["weiss-manuel@gmx.de"],
  "ProductionAccessEnabled": true
}
EOF
)

# AWS CLI unterstützt keine direkte Production Access Request
# Muss über AWS Console gemacht werden
print_warning "⚠️  AWS CLI unterstützt keine direkte Production Access Request"
print_status "Bitte beantragen Sie Production Access über die AWS Console:"
echo ""
echo "1. Gehen Sie zu: https://console.aws.amazon.com/ses/home?region=$REGION#/account"
echo "2. Klicken Sie auf 'Request production access'"
echo "3. Füllen Sie das Formular aus:"
echo "   - Mail Type: Transactional"
echo "   - Website URL: https://manuel-weiss.ch"
echo "   - Use Case: Transactional emails (E-Mail-Bestätigungen, 2FA-Codes)"
echo "   - Expected sending rate: 100-1000 E-Mails/Tag"
echo "   - Compliance: SPF, DKIM, DMARC bereits konfiguriert"
echo "4. Warten Sie auf Genehmigung (24-48 Stunden)"
echo ""

# Prüfe ob Request bereits gestellt wurde
print_status "Prüfe ob bereits ein Request gestellt wurde..."
REQUEST_STATUS=$(aws sesv2 get-account --region "$REGION" --output json 2>&1 | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('ProductionAccessEnabled', False))" 2>/dev/null || echo "false")

if [ "$REQUEST_STATUS" = "True" ]; then
    print_success "✅ Production Access ist bereits aktiviert!"
else
    print_warning "⚠️  Production Access noch nicht aktiviert"
    print_status "Bitte stellen Sie den Request über die AWS Console"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📋 Zusammenfassung:"
echo ""
echo "✅ Verifizierte E-Mail-Adressen:"
echo "$VERIFIED_EMAILS" | while read -r email; do
    echo "   - $email"
done
echo ""
echo "⏳ Nächste Schritte:"
echo "   1. Production Access über AWS Console beantragen"
echo "   2. Warten auf Genehmigung (24-48h)"
echo "   3. Status prüfen mit: aws sesv2 get-account --region $REGION"
echo ""

