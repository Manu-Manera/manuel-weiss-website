#!/bin/bash

# AWS SES E-Mail Setup für mail@manuel-weiss.de
# Einfaches Setup-Skript für die neue E-Mail-Adresse

set -e

DOMAIN="manuel-weiss.de"
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

echo "🚀 AWS SES E-Mail Setup für $EMAIL"
echo "========================================"
echo ""

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI ist nicht installiert!"
    exit 1
fi

# Check credentials
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS Credentials nicht konfiguriert!"
    exit 1
fi

print_success "AWS CLI und Credentials OK"
echo ""

# Step 1: Verify domain identity
print_status "1. Verifiziere Domain $DOMAIN in SES..."
DOMAIN_VERIFY=$(aws sesv2 create-email-identity \
    --email-identity "$DOMAIN" \
    --region "$REGION" \
    --output json 2>&1)

if echo "$DOMAIN_VERIFY" | grep -q "already exists"; then
    print_warning "Domain $DOMAIN ist bereits in SES registriert"
else
    print_success "Domain-Verifizierung gestartet"
fi

# Get verification token
print_status "2. Rufe Verifizierungs-Token ab..."
VERIFICATION_TOKEN=$(aws sesv2 get-email-identity \
    --email-identity "$DOMAIN" \
    --region "$REGION" \
    --query "VerificationRecords[0].Value" \
    --output text 2>&1)

if [ -n "$VERIFICATION_TOKEN" ] && [ "$VERIFICATION_TOKEN" != "None" ]; then
    print_success "Verifizierungs-Token gefunden"
    echo ""
    echo "📋 DNS-RECORD ERFORDERLICH:"
    echo "   Name: _amazonses.$DOMAIN"
    echo "   Type: TXT"
    echo "   Value: $VERIFICATION_TOKEN"
    echo ""
    echo "⚠️  Bitte diesen TXT-Record in Ihrem DNS hinzufügen!"
    echo ""
else
    print_warning "Token konnte nicht abgerufen werden (möglicherweise bereits verifiziert)"
fi

# Step 2: Enable DKIM
print_status "3. Aktiviere DKIM für $DOMAIN..."
aws sesv2 put-email-identity-dkim-attributes \
    --email-identity "$DOMAIN" \
    --region "$REGION" \
    --signing-enabled \
    --output json > /dev/null 2>&1 || true

print_success "DKIM aktiviert"

# Get DKIM tokens
print_status "4. Rufe DKIM-Tokens ab..."
DKIM_TOKENS=$(aws sesv2 get-email-identity \
    --email-identity "$DOMAIN" \
    --region "$REGION" \
    --query "DkimAttributes.Tokens" \
    --output json 2>&1)

if echo "$DKIM_TOKENS" | grep -q "\["; then
    print_success "DKIM-Tokens gefunden"
    echo ""
    echo "📋 DKIM-RECORDS ERFORDERLICH (3 CNAME Records):"
    echo "$DKIM_TOKENS" | python3 -c "import sys, json; tokens = json.load(sys.stdin); [print(f'   Name: {t}._domainkey.$DOMAIN'); print(f'   Type: CNAME'); print(f'   Value: {t}.dkim.amazonses.com'); print('') for t in tokens]" 2>/dev/null || echo "   (Bitte in AWS Console prüfen)"
    echo ""
    echo "⚠️  Bitte diese 3 CNAME-Records in Ihrem DNS hinzufügen!"
    echo ""
else
    print_warning "DKIM-Tokens konnten nicht abgerufen werden"
fi

# Step 3: Verify email address
print_status "5. Verifiziere E-Mail-Adresse $EMAIL..."
EMAIL_VERIFY=$(aws sesv2 create-email-identity \
    --email-identity "$EMAIL" \
    --region "$REGION" \
    --output json 2>&1)

if echo "$EMAIL_VERIFY" | grep -q "already exists"; then
    print_warning "E-Mail-Adresse $EMAIL ist bereits in SES registriert"
else
    print_success "E-Mail-Verifizierung gestartet"
    echo ""
    echo "📧 VERIFIZIERUNGS-E-MAIL:"
    echo "   Eine E-Mail wurde an $EMAIL gesendet"
    echo "   Bitte klicken Sie auf den Verifizierungs-Link in der E-Mail"
    echo ""
fi

# Check current status
print_status "6. Prüfe aktuellen Status..."
DOMAIN_STATUS=$(aws sesv2 get-email-identity \
    --email-identity "$DOMAIN" \
    --region "$REGION" \
    --query "[VerificationStatus,DkimAttributes.Status]" \
    --output json 2>&1)

EMAIL_STATUS=$(aws sesv2 get-email-identity \
    --email-identity "$EMAIL" \
    --region "$REGION" \
    --query "VerificationStatus" \
    --output text 2>&1)

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📊 AKTUELLER STATUS"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Domain ($DOMAIN):"
echo "$DOMAIN_STATUS" | python3 -c "import sys, json; d=json.load(sys.stdin); print(f'   Verification: {d[0]}'); print(f'   DKIM: {d[1]}')" 2>/dev/null || echo "   Status: Prüfe in AWS Console"
echo ""
echo "E-Mail ($EMAIL):"
echo "   Verification: $EMAIL_STATUS"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "📋 NÄCHSTE SCHRITTE"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "1. DNS-Records hinzufügen (siehe oben)"
echo "2. Verifizierungs-E-Mail bestätigen (für $EMAIL)"
echo "3. Warten auf automatische Verifizierung (kann 24-48h dauern)"
echo ""
echo "🔗 AWS Console:"
echo "   https://console.aws.amazon.com/ses/home?region=$REGION#/verified-identities"
echo ""
print_success "Setup abgeschlossen!"
echo ""

