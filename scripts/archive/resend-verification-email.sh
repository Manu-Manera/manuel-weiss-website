#!/bin/bash

# Script zum erneuten Senden der Verifizierungs-E-Mail für mail@manuel-weiss.de

set -e

EMAIL="mail@manuel-weiss.de"
REGION="eu-central-1"

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

echo "📧 Verifizierungs-E-Mail erneut senden"
echo "======================================"
echo ""

# Prüfe aktuellen Status
print_status "Prüfe aktuellen Status von $EMAIL..."
CURRENT_STATUS=$(aws sesv2 get-email-identity \
    --email-identity "$EMAIL" \
    --region "$REGION" \
    --query "VerificationStatus" \
    --output text 2>/dev/null)

echo "   Status: $CURRENT_STATUS"
echo ""

if [ "$CURRENT_STATUS" = "SUCCESS" ]; then
    print_success "E-Mail-Adresse ist bereits verifiziert!"
    exit 0
fi

# Lösche alte Verifizierung
print_status "Lösche alte Verifizierung..."
aws sesv2 delete-email-identity \
    --email-identity "$EMAIL" \
    --region "$REGION" \
    --output json > /dev/null 2>&1 || {
    print_warning "Konnte alte Verifizierung nicht löschen (möglicherweise bereits gelöscht)"
}

echo "   Warte 2 Sekunden..."
sleep 2

# Starte neue Verifizierung
print_status "Starte neue Verifizierung für $EMAIL..."
aws sesv2 create-email-identity \
    --email-identity "$EMAIL" \
    --region "$REGION" \
    --output json > /dev/null 2>&1

if [ $? -eq 0 ]; then
    print_success "Verifizierungs-E-Mail wurde gesendet!"
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "📋 NÄCHSTE SCHRITTE"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "1. Prüfe dein Postfach für: $EMAIL"
    echo "2. Suche nach einer E-Mail von AWS SES"
    echo "3. Klicke auf den Verifizierungs-Link in der E-Mail"
    echo "4. Status prüfen mit:"
    echo "   aws sesv2 get-email-identity --email-identity $EMAIL --region $REGION --query VerificationStatus --output text"
    echo ""
    print_warning "⚠️  Falls die E-Mail nicht ankommt:"
    echo "   - Prüfe den Spam-Ordner"
    echo "   - Prüfe, ob E-Mails an $EMAIL weitergeleitet werden"
    echo "   - Falls die Domain noch nicht verifiziert ist, kann die E-Mail nicht ankommen"
    echo ""
else
    print_error "Fehler beim Senden der Verifizierungs-E-Mail"
    exit 1
fi

