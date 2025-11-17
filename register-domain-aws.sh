#!/bin/bash
# Registriert Domain über AWS Route53 Domains

set -e

DOMAIN="manuel-weiss.ch"
REGION="us-east-1"  # Route53 Domains ist nur in us-east-1 verfügbar
EMAIL="weiss-manuel@gmx.de"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🌐 Registriere Domain $DOMAIN über AWS Route53 Domains${NC}"
echo "=========================================="
echo ""

# 1. Prüfe Verfügbarkeit
echo -e "${BLUE}1. Prüfe Domain-Verfügbarkeit...${NC}"
AVAILABILITY=$(aws route53domains check-domain-availability \
    --domain-name "$DOMAIN" \
    --region "$REGION" \
    --output json 2>&1 || echo "ERROR")

if echo "$AVAILABILITY" | grep -q "ERROR\|AccessDenied"; then
    echo -e "${RED}❌ Fehler beim Prüfen der Verfügbarkeit${NC}"
    echo "$AVAILABILITY"
    echo ""
    echo -e "${YELLOW}⚠️  Mögliche Gründe:${NC}"
    echo "   - AWS Free Tier unterstützt Route53 Domains nicht"
    echo "   - Fehlende Berechtigungen"
    echo "   - Domain ist bereits registriert"
    exit 1
fi

AVAILABLE=$(echo "$AVAILABILITY" | grep -o '"Availability":"[^"]*"' | cut -d'"' -f4 || echo "")

if [ "$AVAILABLE" = "AVAILABLE" ]; then
    echo -e "${GREEN}✅ Domain ist verfügbar!${NC}"
elif [ "$AVAILABLE" = "UNAVAILABLE" ]; then
    echo -e "${RED}❌ Domain ist bereits registriert${NC}"
    exit 1
else
    echo -e "${YELLOW}⚠️  Verfügbarkeit: $AVAILABLE${NC}"
fi
echo ""

# 2. Hole Preis
echo -e "${BLUE}2. Prüfe Preis...${NC}"
PRICE=$(echo "$AVAILABILITY" | grep -o '"Price":"[^"]*"' | cut -d'"' -f4 || echo "")
if [ -n "$PRICE" ]; then
    echo "   Preis: $PRICE"
else
    echo -e "${YELLOW}⚠️  Preis nicht verfügbar (wird bei Registrierung angezeigt)${NC}"
fi
echo ""

# 3. Registriere Domain
echo -e "${BLUE}3. Registriere Domain...${NC}"
echo -e "${YELLOW}⚠️  WICHTIG: Dies kostet Geld (~15-20 CHF/Jahr)${NC}"
echo ""
read -p "Möchten Sie fortfahren? (j/n): " CONFIRM

if [ "$CONFIRM" != "j" ] && [ "$CONFIRM" != "J" ]; then
    echo "Abgebrochen."
    exit 0
fi

echo ""
echo "Registriere Domain..."

# Kontakt-Informationen für .ch Domain
ADMIN_CONTACT="FirstName=Manuel,LastName=Weiss,ContactType=PERSON,AddressLine1=Hauptstrasse 1,City=Zürich,ZipCode=8001,CountryCode=CH,PhoneNumber=+41.798385590,Email=$EMAIL"
REGISTRANT_CONTACT="FirstName=Manuel,LastName=Weiss,ContactType=PERSON,AddressLine1=Hauptstrasse 1,City=Zürich,ZipCode=8001,CountryCode=CH,PhoneNumber=+41.798385590,Email=$EMAIL"
TECH_CONTACT="FirstName=Manuel,LastName=Weiss,ContactType=PERSON,AddressLine1=Hauptstrasse 1,City=Zürich,ZipCode=8001,CountryCode=CH,PhoneNumber=+41.798385590,Email=$EMAIL"

REGISTER_RESULT=$(aws route53domains register-domain \
    --domain-name "$DOMAIN" \
    --duration-in-years 1 \
    --admin-contact "$ADMIN_CONTACT" \
    --registrant-contact "$REGISTRANT_CONTACT" \
    --tech-contact "$TECH_CONTACT" \
    --region "$REGION" \
    --output json 2>&1 || echo "ERROR")

if echo "$REGISTER_RESULT" | grep -q "OperationId"; then
    OPERATION_ID=$(echo "$REGISTER_RESULT" | grep -o '"OperationId":"[^"]*"' | cut -d'"' -f4 || echo "")
    echo -e "${GREEN}✅ Domain-Registrierung gestartet!${NC}"
    echo "   Operation ID: $OPERATION_ID"
    echo ""
    echo -e "${YELLOW}⏳ Domain-Registrierung kann 1-3 Tage dauern${NC}"
    echo ""
    echo "   Nach der Registrierung:"
    echo "   → Nameserver werden automatisch gesetzt"
    echo "   → Domain-Verifizierung funktioniert sofort"
    echo "   → Production Access kann beantragt werden"
else
    echo -e "${RED}❌ Fehler bei Domain-Registrierung:${NC}"
    echo "$REGISTER_RESULT"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Fertig!${NC}"

