#!/bin/bash

# AWS Route53 Domain Registration Setup
# Registriert eine neue Domain bei AWS und richtet alles automatisch ein

set -e

# Konfiguration
DOMAIN_NAME="${1:-}"  # Domain als Parameter übergeben, z.B. "meine-domain.xyz"
REGION="eu-central-1"
EMAIL="${EMAIL:-weiss-manuel@gmx.de}"  # Deine E-Mail-Adresse

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

echo "🚀 AWS Route53 Domain Registration"
echo "===================================="
echo ""

# Prüfe ob Domain-Name angegeben wurde
if [ -z "$DOMAIN_NAME" ]; then
    print_error "Keine Domain angegeben!"
    echo ""
    echo "Verwendung:"
    echo "  ./setup-aws-domain-registration.sh meine-domain.xyz"
    echo ""
    echo "Günstige Domain-Optionen:"
    echo "  - .xyz: ~1-2€/Jahr"
    echo "  - .info: ~2-3€/Jahr"
    echo "  - .online: ~3-5€/Jahr"
    echo ""
    exit 1
fi

# Prüfe AWS CLI
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI ist nicht installiert!"
    exit 1
fi

# Prüfe AWS Credentials
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS Credentials nicht konfiguriert!"
    exit 1
fi

print_success "AWS CLI und Credentials OK"
echo ""

# Schritt 1: Prüfe Domain-Verfügbarkeit
print_status "1. Prüfe Domain-Verfügbarkeit: $DOMAIN_NAME..."
AVAILABILITY=$(aws route53domains check-domain-availability \
    --domain-name "$DOMAIN_NAME" \
    --region us-east-1 \
    --query 'Availability' \
    --output text 2>&1)

if [ "$AVAILABILITY" = "AVAILABLE" ]; then
    print_success "✅ Domain ist verfügbar!"
elif [ "$AVAILABILITY" = "UNAVAILABLE" ]; then
    print_error "❌ Domain ist nicht verfügbar (bereits registriert)"
    exit 1
elif [ "$AVAILABILITY" = "RESERVED" ]; then
    print_error "❌ Domain ist reserviert"
    exit 1
else
    print_warning "⚠️  Verfügbarkeit unbekannt: $AVAILABILITY"
    echo ""
    read -p "Möchtest du trotzdem fortfahren? (j/n): " CONTINUE
    if [ "$CONTINUE" != "j" ] && [ "$CONTINUE" != "J" ]; then
        exit 1
    fi
fi
echo ""

# Schritt 2: Hole Domain-Preis
print_status "2. Prüfe Domain-Preis..."
TLD=$(echo "$DOMAIN_NAME" | cut -d'.' -f2)
PRICE=$(aws route53domains list-prices \
    --tld "$TLD" \
    --region us-east-1 \
    --query 'Prices[0].Price' \
    --output text 2>&1 || echo "unbekannt")

if [ "$PRICE" != "unbekannt" ] && [ -n "$PRICE" ] && [ "$PRICE" != "None" ]; then
    print_success "Preis: $PRICE"
else
    print_warning "Preis konnte nicht abgerufen werden"
    echo ""
    echo "💡 Hinweis: Domain-Registrierung kostet normalerweise:"
    echo "   - .ch: ~10-15€/Jahr"
    echo "   - .xyz: ~1-2€/Jahr"
    echo "   - .info: ~2-3€/Jahr"
    echo "   - .de: ~10-12€/Jahr"
    PRICE="~10-15€/Jahr"
fi
echo ""

# Schritt 3: Bestätigung
echo "═══════════════════════════════════════════════════════════════"
echo "📋 Domain-Registrierung"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Domain: $DOMAIN_NAME"
echo "E-Mail: $EMAIL"
echo "Preis: $PRICE (jährlich)"
echo ""
read -p "Möchtest du diese Domain registrieren? (j/n): " CONFIRM

if [ "$CONFIRM" != "j" ] && [ "$CONFIRM" != "J" ]; then
    print_warning "Registrierung abgebrochen"
    exit 0
fi
echo ""

# Schritt 4: Registriere Domain
print_status "3. Registriere Domain: $DOMAIN_NAME..."
print_warning "⚠️  HINWEIS: Domain-Registrierung kostet Geld!"
echo ""

# Kontakt-Informationen für .ch Domain (Schweiz)
# Für CH: Kein State-Feld erlaubt!
ADMIN_CONTACT="FirstName=Manuel,LastName=Weiss,ContactType=PERSON,AddressLine1=Hauptstrasse 1,City=Zürich,ZipCode=8001,CountryCode=CH,PhoneNumber=+41.798385590,Email=$EMAIL"
REGISTRANT_CONTACT="FirstName=Manuel,LastName=Weiss,ContactType=PERSON,AddressLine1=Hauptstrasse 1,City=Zürich,ZipCode=8001,CountryCode=CH,PhoneNumber=+41.798385590,Email=$EMAIL"
TECH_CONTACT="FirstName=Manuel,LastName=Weiss,ContactType=PERSON,AddressLine1=Hauptstrasse 1,City=Zürich,ZipCode=8001,CountryCode=CH,PhoneNumber=+41.798385590,Email=$EMAIL"

REGISTER_RESULT=$(aws route53domains register-domain \
    --domain-name "$DOMAIN_NAME" \
    --duration-in-years 1 \
    --admin-contact "$ADMIN_CONTACT" \
    --registrant-contact "$REGISTRANT_CONTACT" \
    --tech-contact "$TECH_CONTACT" \
    --region us-east-1 \
    --output json 2>&1)

if echo "$REGISTER_RESULT" | grep -q "OperationId"; then
    OPERATION_ID=$(echo "$REGISTER_RESULT" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('OperationId', ''))" 2>/dev/null || echo "")
    print_success "✅ Domain-Registrierung gestartet!"
    echo "   Operation ID: $OPERATION_ID"
    echo ""
    print_warning "⏳ Domain-Registrierung kann 1-3 Tage dauern"
    echo ""
else
    print_error "❌ Fehler bei Domain-Registrierung:"
    echo "$REGISTER_RESULT"
    exit 1
fi

# Schritt 5: Erstelle Route53 Hosted Zone (wenn Domain registriert ist)
print_status "4. Erstelle Route53 Hosted Zone..."
print_warning "⚠️  Warte bis Domain registriert ist (1-3 Tage)"
echo ""
echo "Nach der Registrierung führe aus:"
echo "  ./setup-dkim-records-manuel-weiss-de.sh"
echo ""
echo "Oder manuell:"
echo "  aws route53 create-hosted-zone --name $DOMAIN_NAME --caller-reference $(date +%s)"

print_success "✅ Setup abgeschlossen!"
echo ""

