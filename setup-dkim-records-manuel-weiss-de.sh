#!/bin/bash

# Setzt DKIM-DNS-Records für manuel-weiss.de automatisch
# Prüft ob Route53 verwendet wird, sonst gibt es Anleitung

set -e

DOMAIN="manuel-weiss.de"
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

echo "🔧 DKIM-DNS-Records für $DOMAIN einrichten"
echo "==========================================="
echo ""

# Prüfe ob Route53 Hosted Zone existiert
print_status "Prüfe ob Route53 Hosted Zone existiert..."
HOSTED_ZONE=$(aws route53 list-hosted-zones --query "HostedZones[?Name=='$DOMAIN.']" --output json 2>&1)

if echo "$HOSTED_ZONE" | grep -q "\[\]"; then
    print_warning "Keine Route53 Hosted Zone für $DOMAIN gefunden"
    echo ""
    echo "=== Option 1: Route53 Hosted Zone erstellen ==="
    echo "Dann kann ich die Einträge automatisch setzen!"
    echo ""
    read -p "Soll ich eine Route53 Hosted Zone für $DOMAIN erstellen? (j/n): " CREATE_ZONE
    
    if [ "$CREATE_ZONE" = "j" ] || [ "$CREATE_ZONE" = "J" ]; then
        print_status "Erstelle Route53 Hosted Zone..."
        ZONE_ID=$(aws route53 create-hosted-zone \
            --name "$DOMAIN" \
            --caller-reference "ses-dkim-$(date +%s)" \
            --query 'HostedZone.Id' \
            --output text 2>&1 | sed 's|/hostedzone/||')
        
        if [ -n "$ZONE_ID" ]; then
            print_success "Hosted Zone erstellt: $ZONE_ID"
            echo ""
            print_warning "⚠️  WICHTIG: Du musst die Nameserver bei deinem Domain-Registrar setzen!"
            echo ""
            aws route53 get-hosted-zone --id "$ZONE_ID" --query 'DelegationSet.NameServers' --output text | tr '\t' '\n' | while read ns; do
                echo "   - $ns"
            done
            echo ""
            echo "Diese Nameserver müssen bei deinem Domain-Registrar eingetragen werden!"
        else
            print_error "Fehler beim Erstellen der Hosted Zone"
            exit 1
        fi
    else
        print_warning "Keine Hosted Zone erstellt - manuelle DNS-Einträge erforderlich"
        ZONE_ID=""
    fi
else
    ZONE_ID=$(echo "$HOSTED_ZONE" | jq -r '.[0].Id' | sed 's|/hostedzone/||')
    print_success "Route53 Hosted Zone gefunden: $ZONE_ID"
fi

# Hole DKIM-Tokens
print_status "Hole DKIM-Tokens von AWS..."
DKIM_TOKENS=$(aws sesv2 get-email-identity \
    --email-identity "$DOMAIN" \
    --region "$REGION" \
    --query 'DkimAttributes.Tokens' \
    --output json 2>&1)

if [ -z "$DKIM_TOKENS" ] || [ "$DKIM_TOKENS" = "null" ]; then
    print_status "Aktiviere DKIM..."
    aws sesv2 put-email-identity-dkim-attributes \
        --email-identity "$DOMAIN" \
        --region "$REGION" \
        --signing-enabled \
        --output json > /dev/null 2>&1
    
    sleep 2
    
    DKIM_TOKENS=$(aws sesv2 get-email-identity \
        --email-identity "$DOMAIN" \
        --region "$REGION" \
        --query 'DkimAttributes.Tokens' \
        --output json 2>&1)
fi

if [ -z "$DKIM_TOKENS" ] || [ "$DKIM_TOKENS" = "null" ] || [ "$DKIM_TOKENS" = "[]" ]; then
    print_error "DKIM-Tokens konnten nicht abgerufen werden"
    echo ""
    echo "Bitte prüfe in der AWS Console:"
    echo "https://eu-central-1.console.aws.amazon.com/ses/home?region=eu-central-1#/verified-identities/domain/$DOMAIN"
    exit 1
fi

print_success "DKIM-Tokens gefunden"
echo ""

# Parse Tokens
TOKEN1=$(echo "$DKIM_TOKENS" | jq -r '.[0]' 2>/dev/null || echo "")
TOKEN2=$(echo "$DKIM_TOKENS" | jq -r '.[1]' 2>/dev/null || echo "")
TOKEN3=$(echo "$DKIM_TOKENS" | jq -r '.[2]' 2>/dev/null || echo "")

if [ -z "$TOKEN1" ] || [ "$TOKEN1" = "null" ]; then
    print_error "Keine DKIM-Tokens gefunden"
    exit 1
fi

# Setze DNS-Records in Route53 falls Hosted Zone existiert
if [ -n "$ZONE_ID" ]; then
    print_status "Setze DKIM-Records in Route53..."
    
    # Erstelle Change Batch
    CHANGE_BATCH=$(cat <<EOF
{
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "${TOKEN1}._domainkey.$DOMAIN",
        "Type": "CNAME",
        "TTL": 3600,
        "ResourceRecords": [{"Value": "${TOKEN1}.dkim.amazonses.com"}]
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "${TOKEN2}._domainkey.$DOMAIN",
        "Type": "CNAME",
        "TTL": 3600,
        "ResourceRecords": [{"Value": "${TOKEN2}.dkim.amazonses.com"}]
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "${TOKEN3}._domainkey.$DOMAIN",
        "Type": "CNAME",
        "TTL": 3600,
        "ResourceRecords": [{"Value": "${TOKEN3}.dkim.amazonses.com"}]
      }
    }
  ]
}
EOF
)
    
    CHANGE_ID=$(aws route53 change-resource-record-sets \
        --hosted-zone-id "$ZONE_ID" \
        --change-batch "$CHANGE_BATCH" \
        --query 'ChangeInfo.Id' \
        --output text 2>&1 | sed 's|/change/||')
    
    if [ -n "$CHANGE_ID" ]; then
        print_success "✅ DKIM-Records in Route53 gesetzt!"
        echo "   Change ID: $CHANGE_ID"
        echo ""
        print_status "DNS-Propagierung läuft (5-60 Minuten)..."
    else
        print_error "Fehler beim Setzen der DNS-Records"
        exit 1
    fi
else
    print_warning "Keine Route53 Hosted Zone - manuelle DNS-Einträge erforderlich"
    echo ""
    echo "📋 Füge diese 3 CNAME-Records in deinem DNS-Provider hinzu:"
    echo ""
    echo "1. Name: ${TOKEN1}._domainkey.$DOMAIN"
    echo "   Type: CNAME"
    echo "   Value: ${TOKEN1}.dkim.amazonses.com"
    echo ""
    echo "2. Name: ${TOKEN2}._domainkey.$DOMAIN"
    echo "   Type: CNAME"
    echo "   Value: ${TOKEN2}.dkim.amazonses.com"
    echo ""
    echo "3. Name: ${TOKEN3}._domainkey.$DOMAIN"
    echo "   Type: CNAME"
    echo "   Value: ${TOKEN3}.dkim.amazonses.com"
    echo ""
fi

echo ""
print_success "✅ Fertig!"
echo ""
print_status "Prüfe Status nach 5-10 Minuten:"
echo "   ./verify-domain-dns-records.sh"

