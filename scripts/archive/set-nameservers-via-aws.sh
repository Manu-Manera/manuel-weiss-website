#!/bin/bash
# Setzt Nameserver direkt über AWS Route53 Domains API

set -e

DOMAIN="manuel-weiss.ch"
REGION="us-east-1"  # Route53 Domains API ist nur in us-east-1 verfügbar

ROUTE53_NS=(
    "ns-656.awsdns-18.net"
    "ns-1665.awsdns-16.co.uk"
    "ns-1193.awsdns-21.org"
    "ns-371.awsdns-46.com"
)

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Setze Nameserver für $DOMAIN über AWS${NC}"
echo "=========================================="
echo ""

# 1. Prüfe ob Domain über AWS registriert ist
echo -e "${BLUE}1. Prüfe Domain-Registrierung...${NC}"

# Versuche Domain-Details abzurufen
DOMAIN_DETAIL=$(aws route53domains get-domain-detail \
    --domain-name "$DOMAIN" \
    --region "$REGION" \
    --output json 2>&1 || echo "ERROR")

if echo "$DOMAIN_DETAIL" | grep -q "ERROR\|AccessDenied\|Free Tier"; then
    echo -e "${RED}❌ Domain ist NICHT über AWS Route53 Domains registriert${NC}"
    echo ""
    echo "   Oder: AWS Free Tier unterstützt Route53 Domains nicht"
    echo ""
    echo -e "${YELLOW}⚠️  ALTERNATIVE LÖSUNG:${NC}"
    echo ""
    echo "   Die Domain wurde wahrscheinlich über einen externen Registrar registriert."
    echo "   Sie müssen die Nameserver beim Domain-Registrar setzen."
    echo ""
    echo "   Schritte:"
    echo "   1. Finden Sie heraus, wer der Registrar ist:"
    echo "      whois $DOMAIN | grep -i registrar"
    echo ""
    echo "   2. Kontaktieren Sie den Registrar Support"
    echo "      → Fragen Sie nach Zugang zum Domain-Management"
    echo "      → Verwenden Sie die Registrant E-Mail-Adresse"
    echo ""
    echo "   3. Setzen Sie die Nameserver:"
    for ns in "${ROUTE53_NS[@]}"; do
        echo "      - $ns"
    done
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Domain ist über AWS registriert${NC}"
echo ""

# 2. Setze Nameserver
echo -e "${BLUE}2. Setze Nameserver...${NC}"

# Erstelle Nameserver-Liste für AWS API
NS_STRING=""
for ns in "${ROUTE53_NS[@]}"; do
    if [ -z "$NS_STRING" ]; then
        NS_STRING="$ns"
    else
        NS_STRING="$NS_STRING,$ns"
    fi
done

echo "   Nameserver:"
for ns in "${ROUTE53_NS[@]}"; do
    echo "   - $ns"
done
echo ""

# Versuche Nameserver zu setzen
echo "   Setze Nameserver über AWS API..."
UPDATE_RESULT=$(aws route53domains update-domain-nameservers \
    --domain-name "$DOMAIN" \
    --nameservers Name="$NS_STRING" \
    --region "$REGION" \
    --output json 2>&1 || echo "ERROR")

if echo "$UPDATE_RESULT" | grep -q "ERROR\|AccessDenied"; then
    echo -e "${RED}❌ Fehler beim Setzen der Nameserver:${NC}"
    echo "$UPDATE_RESULT"
    echo ""
    echo -e "${YELLOW}⚠️  Mögliche Gründe:${NC}"
    echo "   - Domain ist nicht über AWS registriert"
    echo "   - AWS Free Tier unterstützt Route53 Domains nicht"
    echo "   - Fehlende Berechtigungen"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Nameserver erfolgreich gesetzt!${NC}"
echo ""

# 3. Prüfe Status
echo -e "${BLUE}3. Prüfe Nameserver-Status...${NC}"
sleep 5  # Kurz warten

CURRENT_NS=$(dig NS "$DOMAIN" +short 2>&1 | sort)

if [ -z "$CURRENT_NS" ]; then
    echo -e "${YELLOW}⚠️  Nameserver noch nicht propagiert${NC}"
    echo "   → DNS-Propagierung kann 24-48 Stunden dauern"
    echo "   → Prüfen Sie später mit: dig NS $DOMAIN +short"
else
    echo "   Aktuelle Nameserver:"
    echo "$CURRENT_NS" | while read ns; do
        if [ -n "$ns" ]; then
            echo "   - $ns"
        fi
    done
fi
echo ""

echo -e "${GREEN}✅ Fertig!${NC}"
echo ""
echo "   Nach 24-48 Stunden prüfen Sie:"
echo "   ./check-nameserver-status.sh"

