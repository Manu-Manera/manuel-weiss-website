#!/bin/bash

# Fix AWS SES Domain Verification - Vollständige Reparatur
# Behebt alle Probleme mit SES Domain Verification

DOMAIN="manuel-weiss.ch"
REGION="eu-central-1"
HOSTED_ZONE_ID="Z02760862I1VK88B8J0ED"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔧 AWS SES Domain Verification Fix"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# 1. Prüfe aktuellen Status
echo "1️⃣ Prüfe aktuellen SES Status..."
SES_STATUS=$(aws sesv2 get-email-identity --email-identity "$DOMAIN" --region "$REGION" --query "VerificationStatus" --output text 2>&1)
echo "   Status: $SES_STATUS"
echo ""

# 2. Hole Verification Token
if [ "$SES_STATUS" != "SUCCESS" ]; then
    echo "2️⃣ Hole neuen Verification Token..."
    VERIFICATION_TOKEN=$(aws ses verify-domain-identity --domain "$DOMAIN" --region "$REGION" --query "VerificationToken" --output text 2>&1)
    
    if [ -n "$VERIFICATION_TOKEN" ]; then
        echo -e "${GREEN}✅ Verification Token erhalten${NC}"
        echo "   Token: $VERIFICATION_TOKEN"
        
        # Füge TXT Record hinzu
        echo "3️⃣ Füge Verification TXT Record hinzu..."
        aws route53 change-resource-record-sets --hosted-zone-id "$HOSTED_ZONE_ID" --change-batch "{
          \"Changes\": [{
            \"Action\": \"UPSERT\",
            \"ResourceRecordSet\": {
              \"Name\": \"_amazonses.$DOMAIN\",
              \"Type\": \"TXT\",
              \"TTL\": 1800,
              \"ResourceRecords\": [{
                \"Value\": \"\\\"$VERIFICATION_TOKEN\\\"\"
              }]
            }
          }]
        }" --output json > /tmp/verification-record.json 2>&1
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Verification TXT Record hinzugefügt${NC}"
        else
            echo -e "${RED}❌ Fehler beim Hinzufügen des Verification Records${NC}"
            cat /tmp/verification-record.json
        fi
    fi
fi

# 3. Prüfe DKIM Status
echo ""
echo "4️⃣ Prüfe DKIM Status..."
DKIM_STATUS=$(aws sesv2 get-email-identity --email-identity "$DOMAIN" --region "$REGION" --query "DkimAttributes.Status" --output text 2>&1)
echo "   DKIM Status: $DKIM_STATUS"

if [ "$DKIM_STATUS" != "SUCCESS" ]; then
    echo "5️⃣ Hole DKIM Tokens..."
    DKIM_TOKENS=$(aws sesv2 get-email-identity --email-identity "$DOMAIN" --region "$REGION" --query "DkimAttributes.Tokens" --output json 2>&1)
    
    echo "$DKIM_TOKENS" > /tmp/dkim-tokens.json
    
    # Erstelle DKIM Records
    cat > /tmp/dkim-changes.json << EOF
{
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "smln6ugnqm64joyksgg2thjvnli3vzyb._domainkey.$DOMAIN.",
        "Type": "CNAME",
        "TTL": 1800,
        "ResourceRecords": [{"Value": "smln6ugnqm64joyksgg2thjvnli3vzyb.dkim.amazonses.com"}]
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "oribrshwxibnst33qhxzgpuvsr2g7k5f._domainkey.$DOMAIN.",
        "Type": "CNAME",
        "TTL": 1800,
        "ResourceRecords": [{"Value": "oribrshwxibnst33qhxzgpuvsr2g7k5f.dkim.amazonses.com"}]
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "hgq6gco2ns7ijaqqz3mk3fpniozp76rr._domainkey.$DOMAIN.",
        "Type": "CNAME",
        "TTL": 1800,
        "ResourceRecords": [{"Value": "hgq6gco2ns7ijaqqz3mk3fpniozp76rr.dkim.amazonses.com"}]
      }
    }
  ]
}
EOF
    
    aws route53 change-resource-record-sets --hosted-zone-id "$HOSTED_ZONE_ID" --change-batch file:///tmp/dkim-changes.json --output json > /tmp/dkim-result.json 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ DKIM Records hinzugefügt${NC}"
    else
        echo -e "${RED}❌ Fehler beim Hinzufügen der DKIM Records${NC}"
        cat /tmp/dkim-result.json
    fi
fi

# 4. Prüfe Nameserver
echo ""
echo "6️⃣ Prüfe Nameserver Konfiguration..."
ROUTE53_NS=$(aws route53 get-hosted-zone --id "$HOSTED_ZONE_ID" --query "DelegationSet.NameServers" --output text 2>&1 | tr '\t' ' ')
CURRENT_NS=$(dig NS "$DOMAIN" +short 2>&1 | tr '\n' ' ')

echo "   Route53 Nameserver:"
echo "   $ROUTE53_NS"
echo ""
echo "   Aktuelle Nameserver (öffentlich):"
echo "   $CURRENT_NS"
echo ""

if [ -z "$CURRENT_NS" ] || [ "$CURRENT_NS" != "$ROUTE53_NS" ]; then
    echo -e "${YELLOW}⚠️  WICHTIG: Nameserver stimmen nicht überein!${NC}"
    echo ""
    echo "   Sie müssen beim Domain-Registrar folgende Nameserver setzen:"
    for ns in $ROUTE53_NS; do
        echo "   - $ns"
    done
    echo ""
    echo "   Ohne korrekte Nameserver können E-Mails nicht empfangen werden!"
else
    echo -e "${GREEN}✅ Nameserver sind korrekt konfiguriert${NC}"
fi

# 5. Warte auf Propagation
echo ""
echo "7️⃣ Warte auf DNS-Propagierung (15 Sekunden)..."
sleep 15

# 6. Prüfe Records
echo ""
echo "8️⃣ Prüfe DNS-Records..."
VERIFICATION_RECORD=$(dig TXT "_amazonses.$DOMAIN" +short 2>&1)
if [ -n "$VERIFICATION_RECORD" ]; then
    echo -e "${GREEN}✅ Verification Record gefunden: $VERIFICATION_RECORD${NC}"
else
    echo -e "${YELLOW}⚠️  Verification Record noch nicht propagiert${NC}"
fi

DKIM_RECORD=$(dig CNAME "smln6ugnqm64joyksgg2thjvnli3vzyb._domainkey.$DOMAIN" +short 2>&1)
if [ -n "$DKIM_RECORD" ]; then
    echo -e "${GREEN}✅ DKIM Records gefunden${NC}"
else
    echo -e "${YELLOW}⚠️  DKIM Records noch nicht propagiert${NC}"
fi

# 7. Finale Status-Prüfung
echo ""
echo "9️⃣ Finale SES Status-Prüfung..."
sleep 5
FINAL_STATUS=$(aws sesv2 get-email-identity --email-identity "$DOMAIN" --region "$REGION" --query "[VerificationStatus,DkimAttributes.Status]" --output json 2>&1)
echo "   $FINAL_STATUS"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Fix abgeschlossen!${NC}"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Wenn Nameserver falsch sind: Setzen Sie sie beim Domain-Registrar"
echo "2. Warten Sie 15-30 Minuten auf DNS-Propagierung"
echo "3. AWS SES prüft automatisch (alle paar Stunden)"
echo "4. Status prüfen mit: aws sesv2 get-email-identity --email-identity $DOMAIN --region $REGION"
echo ""











