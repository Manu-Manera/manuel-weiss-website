#!/bin/bash

# Vollständiger SES Status-Check
# Prüft alle Komponenten für E-Mail-Empfang

DOMAIN="manuel-weiss.ch"
REGION="eu-central-1"
HOSTED_ZONE_ID="Z02760862I1VK88B8J0ED"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🔍 Vollständiger AWS SES Status-Check"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# 1. Nameserver Check
echo "1️⃣ NAMESERVER CHECK (KRITISCH!)"
echo "───────────────────────────────────────────────────────────────"
ROUTE53_NS=$(aws route53 get-hosted-zone --id "$HOSTED_ZONE_ID" --query "DelegationSet.NameServers" --output text 2>&1 | tr '\t' '\n')
CURRENT_NS=$(dig NS "$DOMAIN" +short 2>&1 | sort)

if [ -z "$CURRENT_NS" ] || [ "$(echo "$CURRENT_NS" | wc -l)" -eq 0 ]; then
    echo -e "${RED}❌ KEINE NAMESERVER GEFUNDEN!${NC}"
    echo ""
    echo "   Route53 Nameserver (sollten gesetzt sein):"
    echo "$ROUTE53_NS" | while read ns; do
        echo -e "   ${YELLOW}- $ns${NC}"
    done
    echo ""
    echo -e "${RED}⚠️  KRITISCH: Nameserver müssen beim Domain-Registrar gesetzt werden!${NC}"
    NS_OK=false
else
    echo -e "${GREEN}✅ Nameserver gefunden${NC}"
    echo "   Aktuelle Nameserver:"
    echo "$CURRENT_NS" | while read ns; do
        echo "   - $ns"
    done
    echo ""
    # Prüfe ob Route53 Nameserver dabei sind
    NS_MATCH=false
    for r53_ns in $ROUTE53_NS; do
        if echo "$CURRENT_NS" | grep -q "$r53_ns"; then
            NS_MATCH=true
            break
        fi
    done
    
    if [ "$NS_MATCH" = true ]; then
        echo -e "${GREEN}✅ Route53 Nameserver gefunden${NC}"
        NS_OK=true
    else
        echo -e "${YELLOW}⚠️  Route53 Nameserver nicht gefunden${NC}"
        echo "   Erwartete Nameserver:"
        echo "$ROUTE53_NS" | while read ns; do
            echo "   - $ns"
        done
        NS_OK=false
    fi
fi
echo ""

# 2. DNS Records Check
echo "2️⃣ DNS RECORDS CHECK"
echo "───────────────────────────────────────────────────────────────"

# MX Record
MX_RECORD=$(dig MX "$DOMAIN" +short 2>&1)
if echo "$MX_RECORD" | grep -q "inbound-smtp"; then
    echo -e "${GREEN}✅ MX Record: $MX_RECORD${NC}"
else
    echo -e "${RED}❌ MX Record fehlt oder falsch${NC}"
    if [ -z "$MX_RECORD" ]; then
        echo "   Kein MX-Record gefunden (Nameserver-Problem?)"
    else
        echo "   Gefunden: $MX_RECORD"
        echo "   Erwartet: 10 inbound-smtp.eu-central-1.amazonaws.com"
    fi
fi

# Verification TXT Record
VERIFICATION_RECORD=$(dig TXT "_amazonses.$DOMAIN" +short 2>&1)
if echo "$VERIFICATION_RECORD" | grep -q "Lhc5q38H"; then
    echo -e "${GREEN}✅ SES Verification Record gefunden${NC}"
else
    echo -e "${RED}❌ SES Verification Record fehlt${NC}"
fi

# DKIM Records
DKIM_COUNT=0
for token in smln6ugnqm64joyksgg2thjvnli3vzyb oribrshwxibnst33qhxzgpuvsr2g7k5f hgq6gco2ns7ijaqqz3mk3fpniozp76rr; do
    DKIM_RECORD=$(dig CNAME "${token}._domainkey.$DOMAIN" +short 2>&1)
    if echo "$DKIM_RECORD" | grep -q "dkim.amazonses.com"; then
        DKIM_COUNT=$((DKIM_COUNT + 1))
    fi
done

if [ "$DKIM_COUNT" -eq 3 ]; then
    echo -e "${GREEN}✅ Alle 3 DKIM Records gefunden${NC}"
elif [ "$DKIM_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Nur $DKIM_COUNT von 3 DKIM Records gefunden${NC}"
else
    echo -e "${RED}❌ Keine DKIM Records gefunden${NC}"
fi
echo ""

# 3. SES Status Check
echo "3️⃣ SES STATUS CHECK"
echo "───────────────────────────────────────────────────────────────"
SES_STATUS=$(aws sesv2 get-email-identity --email-identity "$DOMAIN" --region "$REGION" --output json 2>&1)

VERIFICATION_STATUS=$(echo "$SES_STATUS" | python3 -c "import sys, json; print(json.load(sys.stdin)['VerificationStatus'])" 2>/dev/null)
DKIM_STATUS=$(echo "$SES_STATUS" | python3 -c "import sys, json; print(json.load(sys.stdin)['DkimAttributes']['Status'])" 2>/dev/null)
MAIL_FROM_STATUS=$(echo "$SES_STATUS" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('MailFromAttributes', {}).get('MailFromDomainStatus', 'N/A'))" 2>/dev/null)

if [ "$VERIFICATION_STATUS" = "SUCCESS" ]; then
    echo -e "${GREEN}✅ Domain Verification: SUCCESS${NC}"
else
    echo -e "${RED}❌ Domain Verification: $VERIFICATION_STATUS${NC}"
fi

if [ "$DKIM_STATUS" = "SUCCESS" ]; then
    echo -e "${GREEN}✅ DKIM: SUCCESS${NC}"
else
    echo -e "${RED}❌ DKIM: $DKIM_STATUS${NC}"
fi

if [ "$MAIL_FROM_STATUS" = "SUCCESS" ] || [ "$MAIL_FROM_STATUS" = "PENDING" ]; then
    echo -e "${GREEN}✅ MAIL FROM: $MAIL_FROM_STATUS${NC}"
else
    echo -e "${RED}❌ MAIL FROM: $MAIL_FROM_STATUS${NC}"
fi
echo ""

# 4. Receipt Rules Check
echo "4️⃣ RECEIPT RULES CHECK"
echo "───────────────────────────────────────────────────────────────"
ACTIVE_RULE_SET=$(aws ses describe-active-receipt-rule-set --region "$REGION" --query "Metadata.Name" --output text 2>&1)

if [ "$ACTIVE_RULE_SET" = "manu-email-rules" ]; then
    echo -e "${GREEN}✅ Active Rule Set: $ACTIVE_RULE_SET${NC}"
    
    RULES=$(aws ses describe-active-receipt-rule-set --region "$REGION" --query "Rules[*].Name" --output text 2>&1)
    echo "   Rules: $RULES"
else
    echo -e "${RED}❌ Active Rule Set: $ACTIVE_RULE_SET (erwartet: manu-email-rules)${NC}"
fi
echo ""

# 5. Lambda Function Check
echo "5️⃣ LAMBDA FUNCTION CHECK"
echo "───────────────────────────────────────────────────────────────"
LAMBDA_STATUS=$(aws lambda get-function-configuration \
  --function-name ManuelWeissEmailSetup-EmailProcessor218EC076-i0Dq2uhJRLy9 \
  --region "$REGION" \
  --query "[State,LastUpdateStatus]" \
  --output text 2>&1)

if echo "$LAMBDA_STATUS" | grep -q "Active.*Successful"; then
    echo -e "${GREEN}✅ Lambda Function: Active & Successful${NC}"
    
    ENV_VARS=$(aws lambda get-function-configuration \
      --function-name ManuelWeissEmailSetup-EmailProcessor218EC076-i0Dq2uhJRLy9 \
      --region "$REGION" \
      --query "Environment.Variables.FORWARD_TO_EMAIL" \
      --output text 2>&1)
    
    echo "   Forward To: $ENV_VARS"
else
    echo -e "${RED}❌ Lambda Function Status: $LAMBDA_STATUS${NC}"
fi
echo ""

# 6. S3 Bucket Check
echo "6️⃣ S3 BUCKET CHECK"
echo "───────────────────────────────────────────────────────────────"
EMAIL_COUNT=$(aws s3 ls s3://manu-email-storage-038333965110/emails/ --recursive --region "$REGION" 2>&1 | wc -l)
if [ "$EMAIL_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ S3 Bucket: $EMAIL_COUNT E-Mail(s) gefunden${NC}"
    echo "   Letzte E-Mails:"
    aws s3 ls s3://manu-email-storage-038333965110/emails/ --recursive --region "$REGION" 2>&1 | tail -5 | awk '{print "   - " $4 " (" $1 " " $2 ")"}'
else
    echo -e "${YELLOW}⚠️  S3 Bucket: Keine E-Mails gefunden${NC}"
    echo "   (Dies ist normal wenn noch keine E-Mails angekommen sind)"
fi
echo ""

# Zusammenfassung
echo "═══════════════════════════════════════════════════════════════"
echo "📊 ZUSAMMENFASSUNG"
echo "═══════════════════════════════════════════════════════════════"
echo ""

CRITICAL_ISSUES=0

if [ "$NS_OK" != true ]; then
    echo -e "${RED}❌ KRITISCH: Nameserver müssen beim Domain-Registrar gesetzt werden!${NC}"
    CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
fi

if [ "$VERIFICATION_STATUS" != "SUCCESS" ]; then
    echo -e "${RED}❌ KRITISCH: Domain Verification fehlgeschlagen${NC}"
    echo "   Grund: Nameserver oder DNS-Records"
    CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
fi

if [ "$CRITICAL_ISSUES" -eq 0 ]; then
    echo -e "${GREEN}✅ Alle kritischen Checks bestanden!${NC}"
    echo ""
    echo "E-Mail-System sollte funktionieren."
    echo "Testen Sie mit einer E-Mail an mail@manuel-weiss.ch"
else
    echo -e "${RED}❌ $CRITICAL_ISSUES kritisches Problem(e) gefunden${NC}"
    echo ""
    echo "E-Mail-Empfang funktioniert NICHT bis diese Probleme behoben sind."
    echo ""
    echo "Siehe: AWS_SES_KRITISCHES_PROBLEM.md für Details"
fi

echo ""










