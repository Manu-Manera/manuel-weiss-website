#!/bin/bash
# Findet heraus, wo die Domain registriert ist

set -e

DOMAIN="manuel-weiss.ch"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Suche Domain-Registrar für $DOMAIN${NC}"
echo "=========================================="
echo ""

# 1. Prüfe AWS Route53 Domains
echo -e "${BLUE}1. Prüfe AWS Route53 Domains...${NC}"
AWS_DOMAIN=$(aws route53domains list-domains --region us-east-1 --query "Domains[?DomainName=='$DOMAIN'].DomainName" --output text 2>&1 || echo "")

if [ -n "$AWS_DOMAIN" ] && [ "$AWS_DOMAIN" != "None" ]; then
    echo -e "${GREEN}✅ Domain ist über AWS Route53 Domains registriert!${NC}"
    echo ""
    echo "   → Nameserver können direkt über AWS gesetzt werden"
    echo "   → Führen Sie aus: ./set-nameservers-via-aws.sh"
    exit 0
else
    echo -e "${YELLOW}⚠️  Domain ist NICHT über AWS Route53 Domains registriert${NC}"
fi
echo ""

# 2. Prüfe WHOIS
echo -e "${BLUE}2. Prüfe WHOIS-Informationen...${NC}"
WHOIS_INFO=$(whois "$DOMAIN" 2>&1)

# Extrahiere Registrar
REGISTRAR=$(echo "$WHOIS_INFO" | grep -i "registrar:" | head -1 | sed 's/.*[Rr]egistrar: *//' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' || echo "")

if [ -n "$REGISTRAR" ]; then
    echo -e "${GREEN}✅ Registrar gefunden: $REGISTRAR${NC}"
else
    # Versuche andere Formate
    REGISTRAR=$(echo "$WHOIS_INFO" | grep -i "registrar name" | head -1 | sed 's/.*[Rr]egistrar [Nn]ame: *//' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' || echo "")
    if [ -n "$REGISTRAR" ]; then
        echo -e "${GREEN}✅ Registrar gefunden: $REGISTRAR${NC}"
    else
        echo -e "${YELLOW}⚠️  Registrar nicht in WHOIS gefunden${NC}"
    fi
fi

# Extrahiere Registrant E-Mail
REGISTRANT_EMAIL=$(echo "$WHOIS_INFO" | grep -iE "registrant.*email|email.*registrant" | head -1 | grep -oE "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}" || echo "")

if [ -n "$REGISTRANT_EMAIL" ]; then
    echo "   Registrant E-Mail: $REGISTRANT_EMAIL"
fi
echo ""

# 3. Prüfe Nameserver
echo -e "${BLUE}3. Aktuelle Nameserver:${NC}"
CURRENT_NS=$(dig NS "$DOMAIN" +short 2>&1 | sort)

if [ -z "$CURRENT_NS" ]; then
    echo -e "${RED}❌ KEINE Nameserver gefunden${NC}"
else
    echo "   Gefundene Nameserver:"
    echo "$CURRENT_NS" | while read ns; do
        if [ -n "$ns" ]; then
            echo "   - $ns"
        fi
    done
fi
echo ""

# 4. Zusammenfassung
echo -e "${BLUE}4. Zusammenfassung:${NC}"
echo ""

if [ -n "$AWS_DOMAIN" ] && [ "$AWS_DOMAIN" != "None" ]; then
    echo -e "${GREEN}✅ Domain ist über AWS registriert${NC}"
    echo "   → Ich kann die Nameserver direkt setzen"
elif [ -n "$REGISTRAR" ]; then
    echo -e "${YELLOW}⚠️  Domain ist über externen Registrar registriert: $REGISTRAR${NC}"
    echo ""
    echo "   Optionen:"
    echo "   1. Kontaktieren Sie $REGISTRAR Support"
    echo "      → Fragen Sie nach Zugang zum Domain-Management"
    echo "      → Verwenden Sie die Registrant E-Mail: $REGISTRANT_EMAIL"
    echo ""
    echo "   2. Prüfen Sie Ihre E-Mails"
    echo "      → Suchen Sie nach E-Mails von $REGISTRAR"
    echo "      → Möglicherweise haben Sie einen Account erstellt"
    echo ""
    echo "   3. Domain-Transfer zu AWS Route53 Domains"
    echo "      → Transferieren Sie die Domain zu AWS"
    echo "      → Dann kann ich die Nameserver direkt setzen"
else
    echo -e "${RED}❌ Konnte Registrar nicht finden${NC}"
    echo ""
    echo "   Mögliche Gründe:"
    echo "   - Domain ist privat registriert (WHOIS Privacy)"
    echo "   - Domain-Registrierung ist sehr alt"
    echo "   - Domain wurde über einen Reseller registriert"
    echo ""
    echo "   Lösung:"
    echo "   - Kontaktieren Sie den Domain-Registrar Support"
    echo "   - Verwenden Sie die Registrant E-Mail: $REGISTRANT_EMAIL"
fi
echo ""

