#!/bin/bash
# Prüft Domain-Verifizierung nach Nameserver-Set

set -e

DOMAIN="manuel-weiss.ch"
REGION="eu-central-1"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}✅ Nameserver wurden gesetzt - Prüfe Domain-Verifizierung...${NC}"
echo "=========================================="
echo ""

# 1. Prüfe Nameserver-Propagierung
echo -e "${BLUE}1. Prüfe Nameserver-Propagierung...${NC}"
PUBLIC_NS=$(dig NS "$DOMAIN" +short 2>&1 | sort)

if [ -z "$PUBLIC_NS" ]; then
    echo -e "${YELLOW}⚠️  Nameserver noch nicht propagiert${NC}"
    echo "   → Warten Sie 1-24 Stunden"
    echo "   → DNS-Propagierung kann dauern"
else
    echo -e "${GREEN}✅ Nameserver sind propagiert:${NC}"
    echo "$PUBLIC_NS" | while read ns; do
        if [ -n "$ns" ]; then
            echo "   - $ns"
        fi
    done
fi
echo ""

# 2. Prüfe TXT-Record
echo -e "${BLUE}2. Prüfe SES Verification TXT-Record...${NC}"
TXT_RECORD=$(dig TXT "_amazonses.$DOMAIN" +short 2>&1)

if [ -z "$TXT_RECORD" ]; then
    echo -e "${YELLOW}⚠️  TXT-Record noch nicht erreichbar${NC}"
    echo "   → Warten Sie auf DNS-Propagierung"
else
    echo -e "${GREEN}✅ TXT-Record ist erreichbar:${NC}"
    echo "   $TXT_RECORD"
fi
echo ""

# 3. Prüfe Domain-Verifizierung in SES
echo -e "${BLUE}3. Prüfe Domain-Verifizierung in AWS SES...${NC}"
VERIFICATION=$(aws ses get-identity-verification-attributes \
    --identities "$DOMAIN" \
    --region "$REGION" \
    --output json 2>&1)

STATUS=$(echo "$VERIFICATION" | grep -o '"VerificationStatus":"[^"]*"' | cut -d'"' -f4 || echo "")

if [ "$STATUS" = "Success" ]; then
    echo -e "${GREEN}✅ Domain ist verifiziert!${NC}"
    echo ""
    echo -e "${GREEN}🎉 ALLES FUNKTIONIERT!${NC}"
    echo ""
    echo "   Nächste Schritte:"
    echo "   1. Production Access beantragen:"
    echo "      https://eu-central-1.console.aws.amazon.com/ses/home?region=eu-central-1#/account"
    echo ""
    echo "   2. Oder ich kann es für Sie machen:"
    echo "      ./request-ses-production-access.sh"
elif [ "$STATUS" = "Pending" ]; then
    echo -e "${YELLOW}⏳ Domain-Verifizierung läuft noch...${NC}"
    echo "   → AWS prüft den TXT-Record"
    echo "   → Kann 5-30 Minuten dauern"
    echo ""
    echo "   Prüfen Sie später erneut:"
    echo "   ./verify-domain-after-nameserver-set.sh"
elif [ "$STATUS" = "Failed" ]; then
    echo -e "${RED}❌ Domain-Verifizierung fehlgeschlagen${NC}"
    echo ""
    echo "   Mögliche Gründe:"
    echo "   - TXT-Record noch nicht propagiert"
    echo "   - Falscher TXT-Record"
    echo ""
    echo "   Prüfen Sie:"
    echo "   dig TXT _amazonses.$DOMAIN +short"
else
    echo -e "${YELLOW}⚠️  Status: $STATUS${NC}"
    echo "   → Warten Sie auf DNS-Propagierung"
fi
echo ""

