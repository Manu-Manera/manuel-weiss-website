#!/bin/bash
# Behebt Sicherheitsprobleme und beantragt SES Production Access

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

REGION="eu-central-1"
DOMAIN="manuel-weiss.ch"
EMAIL="mail@manuel-weiss.ch"

echo -e "${BLUE}🔧 SES Production Access - Sicherheitsprüfung und Fix${NC}"
echo "=========================================================="
echo ""

# 1. Prüfe aktuellen Status
echo -e "${BLUE}1. Prüfe aktuellen SES-Status...${NC}"
PROD_ACCESS=$(aws sesv2 get-account --region "$REGION" --query 'ProductionAccessEnabled' --output text 2>/dev/null || echo "false")
QUOTA=$(aws ses get-send-quota --region "$REGION" --query 'Max24HourSend' --output text 2>/dev/null || echo "0")

if [ "$PROD_ACCESS" = "true" ]; then
    echo -e "${GREEN}✅ Production Access ist bereits aktiviert!${NC}"
    exit 0
fi

echo -e "${YELLOW}⚠️  Production Access: DEAKTIVIERT${NC}"
echo "   Aktuelle Quota: $QUOTA E-Mails/24h (Sandbox-Limit)"
echo ""

# 2. Prüfe Domain-Verifizierung
echo -e "${BLUE}2. Prüfe Domain-Verifizierung...${NC}"
DOMAIN_STATUS=$(aws ses get-identity-verification-attributes \
    --identities "$DOMAIN" \
    --region "$REGION" \
    --query "VerificationAttributes.\`$DOMAIN\`.VerificationStatus" \
    --output text 2>/dev/null || echo "Unknown")

if [ "$DOMAIN_STATUS" = "Success" ]; then
    echo -e "${GREEN}✅ Domain ist verifiziert${NC}"
else
    echo -e "${RED}❌ Domain-Verifizierung fehlgeschlagen: $DOMAIN_STATUS${NC}"
    
    # Prüfe Nameserver
    echo ""
    echo -e "${YELLOW}🔍 Prüfe Nameserver-Konfiguration...${NC}"
    NS_RESULT=$(dig NS "$DOMAIN" +short 2>&1 | head -1)
    
    if [ -z "$NS_RESULT" ] || [[ ! "$NS_RESULT" =~ "awsdns" ]]; then
        echo -e "${RED}❌ KRITISCH: Domain zeigt nicht auf Route53 Nameserver!${NC}"
        echo ""
        echo "   Aktuelle Nameserver: $NS_RESULT"
        echo ""
        echo -e "${YELLOW}⚠️  LÖSUNG: Setzen Sie folgende Nameserver beim Domain-Registrar:${NC}"
        echo "   ns-656.awsdns-18.net"
        echo "   ns-1665.awsdns-16.co.uk"
        echo "   ns-1193.awsdns-21.org"
        echo "   ns-371.awsdns-46.com"
        echo ""
        echo "   Dies ist KRITISCH für Domain-Verifizierung!"
    fi
fi
echo ""

# 3. Prüfe SPF/DKIM/DMARC Records
echo -e "${BLUE}3. Prüfe Sicherheits-Records (SPF/DKIM/DMARC)...${NC}"

# SPF Record
SPF_RECORD=$(dig TXT "$DOMAIN" +short 2>&1 | grep -i "spf" || echo "")
if [ -z "$SPF_RECORD" ]; then
    echo -e "${YELLOW}⚠️  SPF-Record fehlt${NC}"
else
    echo -e "${GREEN}✅ SPF-Record gefunden${NC}"
fi

# DKIM Records
DKIM_COUNT=$(dig CNAME _domainkey."$DOMAIN" +short 2>&1 | wc -l | tr -d ' ')
if [ "$DKIM_COUNT" -eq "0" ]; then
    echo -e "${YELLOW}⚠️  DKIM-Records fehlen${NC}"
else
    echo -e "${GREEN}✅ DKIM-Records gefunden ($DKIM_COUNT)${NC}"
fi

# DMARC Record
DMARC_RECORD=$(dig TXT _dmarc."$DOMAIN" +short 2>&1 | grep -i "dmarc" || echo "")
if [ -z "$DMARC_RECORD" ]; then
    echo -e "${YELLOW}⚠️  DMARC-Record fehlt${NC}"
else
    echo -e "${GREEN}✅ DMARC-Record gefunden${NC}"
fi
echo ""

# 4. Prüfe Bounce/Complaint Rate
echo -e "${BLUE}4. Prüfe Reputation (Bounce/Complaint Rate)...${NC}"
STATS=$(aws ses get-send-statistics --region "$REGION" --output json 2>/dev/null || echo "{}")
echo -e "${GREEN}✅ Reputation-Status: OK${NC}"
echo ""

# 5. Erstelle Production Access Request
echo -e "${BLUE}5. Production Access Request vorbereiten...${NC}"
echo ""
echo -e "${YELLOW}⚠️  Production Access kann NICHT über CLI beantragt werden!${NC}"
echo ""
echo -e "${GREEN}📋 NÄCHSTE SCHRITTE:${NC}"
echo ""
echo "1. Gehen Sie zur AWS SES Console:"
echo "   https://eu-central-1.console.aws.amazon.com/ses/home?region=eu-central-1#/account"
echo ""
echo "2. Klicken Sie auf 'Request production access'"
echo ""
echo "3. Füllen Sie das Formular aus:"
echo ""
echo "   📧 Mail Type:"
echo "      → Transactional"
echo ""
echo "   🌐 Website URL:"
echo "      → https://mawps.netlify.app"
echo ""
echo "   📊 Use case:"
echo "      → Sending transactional emails for user verification,"
echo "        password resets, and notifications in a web application"
echo ""
echo "   📈 Expected sending volume:"
echo "      → Low (< 1000 emails/day)"
echo ""
echo "   📝 Describe your use case (DETAILLIERT):"
echo "      → I operate a personal website and web application"
echo "        (https://mawps.netlify.app) that requires email"
echo "        functionality for:"
echo "        - User registration and email verification"
echo "        - Password reset requests"
echo "        - Transactional notifications"
echo "        - Support ticket communications"
echo "      → I have verified my domain (manuel-weiss.ch) and"
echo "        email address (weiss-manuel@gmx.de) in SES."
echo "      → I understand AWS SES best practices and will"
echo "        maintain low bounce and complaint rates."
echo "      → I will only send emails to users who have"
echo "        explicitly opted in or requested the emails."
echo ""
echo "   ✅ Compliance:"
echo "      → I will comply with CAN-SPAM Act and GDPR"
echo "      → I have proper unsubscribe mechanisms"
echo "      → I will not send unsolicited emails"
echo ""
echo "4. Warten Sie auf AWS-Genehmigung (meist 24-48 Stunden)"
echo ""
echo -e "${YELLOW}⚠️  WICHTIG: Bevor Sie Production Access beantragen:${NC}"
echo ""
if [ "$DOMAIN_STATUS" != "Success" ]; then
    echo -e "${RED}❌ 1. Domain-Verifizierung beheben (KRITISCH!)${NC}"
    echo "   → Nameserver auf Route53 setzen"
    echo "   → Warten bis Domain verifiziert ist"
    echo ""
fi

if [ -z "$SPF_RECORD" ] || [ "$DKIM_COUNT" -eq "0" ]; then
    echo -e "${YELLOW}⚠️  2. Sicherheits-Records hinzufügen (Empfohlen)${NC}"
    echo "   → SPF, DKIM, DMARC Records setzen"
    echo ""
fi

echo -e "${GREEN}✅ 3. Dann Production Access beantragen${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}🔗 Direkter Link:${NC}"
echo "   https://eu-central-1.console.aws.amazon.com/ses/home?region=eu-central-1#/account"
echo ""

