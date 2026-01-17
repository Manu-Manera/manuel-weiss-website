#!/bin/bash
# Fügt fehlende DNS-Records (SPF, DKIM, DMARC) in Route53 hinzu

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
HOSTED_ZONE_ID="Z02760862I1VK88B8J0ED"

echo -e "${BLUE}🔧 Füge fehlende DNS-Records hinzu...${NC}"
echo "=========================================="
echo ""

# 1. Prüfe vorhandene TXT Records
echo -e "${BLUE}1. Prüfe vorhandene DNS-Records...${NC}"
EXISTING_TXT=$(aws route53 list-resource-record-sets \
    --hosted-zone-id "$HOSTED_ZONE_ID" \
    --query "ResourceRecordSets[?Type=='TXT']" \
    --output json 2>/dev/null)

echo "   Gefundene TXT Records:"
echo "$EXISTING_TXT" | grep -o '"Name":"[^"]*"' | sed 's/"Name":"//;s/"$//' | while read name; do
    echo "   - $name"
done
echo ""

# 2. Prüfe SPF Record
echo -e "${BLUE}2. Prüfe SPF-Record...${NC}"
SPF_EXISTS=$(echo "$EXISTING_TXT" | grep -i "spf" || echo "")
if [ -z "$SPF_EXISTS" ]; then
    echo -e "${YELLOW}⚠️  SPF-Record fehlt - füge hinzu...${NC}"
    
    # Erstelle SPF Record
    cat > /tmp/spf-record.json <<EOF
{
    "Comment": "SPF Record for SES",
    "Changes": [{
        "Action": "UPSERT",
        "ResourceRecordSet": {
            "Name": "$DOMAIN.",
            "Type": "TXT",
            "TTL": 3600,
            "ResourceRecords": [{
                "Value": "\"v=spf1 include:amazonses.com ~all\""
            }]
        }
    }]
}
EOF
    
    aws route53 change-resource-record-sets \
        --hosted-zone-id "$HOSTED_ZONE_ID" \
        --change-batch file:///tmp/spf-record.json \
        --output json > /dev/null 2>&1
    
    echo -e "${GREEN}✅ SPF-Record hinzugefügt${NC}"
else
    echo -e "${GREEN}✅ SPF-Record existiert bereits${NC}"
fi
echo ""

# 3. Prüfe DKIM Records
echo -e "${BLUE}3. Prüfe DKIM-Records...${NC}"
DKIM_STATUS=$(aws ses get-identity-dkim-attributes \
    --identities "$DOMAIN" \
    --region "$REGION" \
    --query "DkimAttributes.\`$DOMAIN\`.DkimEnabled" \
    --output text 2>/dev/null || echo "false")

if [ "$DKIM_STATUS" != "true" ]; then
    echo -e "${YELLOW}⚠️  DKIM nicht aktiviert - aktiviere...${NC}"
    
    # Aktiviere DKIM
    aws ses put-identity-dkim-enabled \
        --identity "$DOMAIN" \
        --dkim-enabled \
        --region "$REGION" \
        --output json > /dev/null 2>&1
    
    echo -e "${GREEN}✅ DKIM aktiviert${NC}"
    echo "   Warte 10 Sekunden auf DKIM-Token-Generierung..."
    sleep 10
else
    echo -e "${GREEN}✅ DKIM ist aktiviert${NC}"
fi

# Hole DKIM Tokens
DKIM_TOKENS=$(aws ses get-identity-dkim-attributes \
    --identities "$DOMAIN" \
    --region "$REGION" \
    --query "DkimAttributes.\`$DOMAIN\`.DkimTokens" \
    --output json 2>/dev/null || echo "[]")

if [ "$DKIM_TOKENS" != "[]" ] && [ "$DKIM_TOKENS" != "null" ]; then
    echo "   DKIM-Tokens gefunden, prüfe CNAME Records..."
    
    # Prüfe ob DKIM CNAME Records existieren
    EXISTING_CNAME=$(aws route53 list-resource-record-sets \
        --hosted-zone-id "$HOSTED_ZONE_ID" \
        --query "ResourceRecordSets[?Type=='CNAME' && contains(Name, '_domainkey')]" \
        --output json 2>/dev/null)
    
    DKIM_COUNT=$(echo "$EXISTING_CNAME" | grep -o '"Name"' | wc -l | tr -d ' ')
    
    if [ "$DKIM_COUNT" -lt "3" ]; then
        echo -e "${YELLOW}⚠️  DKIM CNAME Records fehlen - füge hinzu...${NC}"
        echo "   (Dies muss manuell in der SES Console gemacht werden)"
        echo "   1. Gehen Sie zu: SES Console → Identities → $DOMAIN → DKIM"
        echo "   2. Kopieren Sie die 3 CNAME Records"
        echo "   3. Fügen Sie sie in Route53 hinzu"
    else
        echo -e "${GREEN}✅ DKIM CNAME Records existieren ($DKIM_COUNT)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  DKIM-Tokens noch nicht verfügbar${NC}"
    echo "   Warten Sie 5-10 Minuten und führen Sie das Skript erneut aus"
fi
echo ""

# 4. Prüfe DMARC Record
echo -e "${BLUE}4. Prüfe DMARC-Record...${NC}"
DMARC_EXISTS=$(echo "$EXISTING_TXT" | grep -i "_dmarc" || echo "")
if [ -z "$DMARC_EXISTS" ]; then
    echo -e "${YELLOW}⚠️  DMARC-Record fehlt - füge hinzu...${NC}"
    
    # Erstelle DMARC Record
    cat > /tmp/dmarc-record.json <<EOF
{
    "Comment": "DMARC Record for email security",
    "Changes": [{
        "Action": "UPSERT",
        "ResourceRecordSet": {
            "Name": "_dmarc.$DOMAIN.",
            "Type": "TXT",
            "TTL": 3600,
            "ResourceRecords": [{
                "Value": "\"v=DMARC1; p=quarantine; rua=mailto:weiss-manuel@gmx.de\""
            }]
        }
    }]
}
EOF
    
    aws route53 change-resource-record-sets \
        --hosted-zone-id "$HOSTED_ZONE_ID" \
        --change-batch file:///tmp/dmarc-record.json \
        --output json > /dev/null 2>&1
    
    echo -e "${GREEN}✅ DMARC-Record hinzugefügt${NC}"
else
    echo -e "${GREEN}✅ DMARC-Record existiert bereits${NC}"
fi
echo ""

# 5. Zeige Nameserver
echo -e "${BLUE}5. Route53 Nameserver:${NC}"
NAMESERVERS=$(aws route53 get-hosted-zone \
    --id "$HOSTED_ZONE_ID" \
    --query "DelegationSet.NameServers" \
    --output text 2>/dev/null)

echo "   Diese Nameserver MÜSSEN beim Domain-Registrar gesetzt werden:"
for ns in $NAMESERVERS; do
    echo "   - $ns"
done
echo ""

# Cleanup
rm -f /tmp/spf-record.json /tmp/dmarc-record.json

echo -e "${GREEN}✅ DNS-Records aktualisiert!${NC}"
echo ""
echo -e "${YELLOW}⚠️  WICHTIG:${NC}"
echo "   1. Setzen Sie die Nameserver beim Domain-Registrar"
echo "   2. Warten Sie 24-48 Stunden auf DNS-Propagierung"
echo "   3. Prüfen Sie dann Domain-Verifizierung:"
echo "      aws ses get-identity-verification-attributes --identities $DOMAIN --region $REGION"
echo ""

