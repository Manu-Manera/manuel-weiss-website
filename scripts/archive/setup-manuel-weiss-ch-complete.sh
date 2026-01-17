#!/bin/bash

# Vollständiges Setup für manuel-weiss.ch
# Registriert Domain, richtet Route53, SES, DKIM ein

set -e

DOMAIN="manuel-weiss.ch"
REGION="eu-central-1"
EMAIL="weiss-manuel@gmx.de"

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

echo "🚀 Vollständiges Setup für $DOMAIN"
echo "===================================="
echo ""

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

# Schritt 1: Prüfe ob Domain bereits registriert ist
print_status "1. Prüfe Domain-Status..."
DOMAIN_REGISTERED=$(aws route53domains list-domains --region us-east-1 --query "Domains[?DomainName=='$DOMAIN'].DomainName" --output text 2>&1)

if [ -n "$DOMAIN_REGISTERED" ]; then
    print_success "✅ Domain ist bereits registriert"
else
    print_warning "⚠️  Domain ist noch nicht registriert"
    echo ""
    echo "Registriere Domain mit:"
    echo "  ./setup-aws-domain-registration.sh $DOMAIN"
    echo ""
    read -p "Ist die Domain bereits registriert? (j/n): " DOMAIN_OK
    if [ "$DOMAIN_OK" != "j" ] && [ "$DOMAIN_OK" != "J" ]; then
        print_error "Bitte registriere die Domain zuerst!"
        exit 1
    fi
fi
echo ""

# Schritt 2: Erstelle Route53 Hosted Zone
print_status "2. Erstelle Route53 Hosted Zone..."
EXISTING_ZONE=$(aws route53 list-hosted-zones --query "HostedZones[?Name=='$DOMAIN.']" --output json 2>&1)

if echo "$EXISTING_ZONE" | grep -q "\[\]"; then
    print_status "Erstelle neue Hosted Zone..."
    ZONE_ID=$(aws route53 create-hosted-zone \
        --name "$DOMAIN" \
        --caller-reference "manuel-weiss-ch-$(date +%s)" \
        --query 'HostedZone.Id' \
        --output text 2>&1 | sed 's|/hostedzone/||')
    
    if [ -n "$ZONE_ID" ]; then
        print_success "✅ Hosted Zone erstellt: $ZONE_ID"
        
        # Zeige Nameserver
        echo ""
        print_status "Route53 Nameserver:"
        aws route53 get-hosted-zone --id "$ZONE_ID" --query 'DelegationSet.NameServers' --output text | tr '\t' '\n' | sed 's/^/  /'
        echo ""
        print_warning "⚠️  WICHTIG: Setze diese Nameserver bei deinem Domain-Registrar!"
    else
        print_error "Fehler beim Erstellen der Hosted Zone"
        exit 1
    fi
else
    ZONE_ID=$(echo "$EXISTING_ZONE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data[0]['Id'].split('/')[-1] if data else '')" 2>/dev/null || echo "")
    print_success "✅ Hosted Zone existiert bereits: $ZONE_ID"
fi
echo ""

# Schritt 3: SES Domain-Verifizierung
print_status "3. Richte SES Domain-Verifizierung ein..."
SES_DOMAIN=$(aws sesv2 get-email-identity --email-identity "$DOMAIN" --region "$REGION" --query 'VerificationStatus' --output text 2>&1 || echo "NOT_FOUND")

if [ "$SES_DOMAIN" = "NOT_FOUND" ] || [ "$SES_DOMAIN" = "None" ]; then
    print_status "Erstelle SES Domain-Identity..."
    aws sesv2 create-email-identity \
        --email-identity "$DOMAIN" \
        --region "$REGION" \
        --output json > /dev/null 2>&1 || true
    print_success "✅ SES Domain-Identity erstellt"
else
    print_success "✅ SES Domain-Identity existiert bereits"
fi

# Hole Verification Token
VERIFICATION_TOKEN=$(aws sesv2 get-email-identity \
    --email-identity "$DOMAIN" \
    --region "$REGION" \
    --query "VerificationRecords[0].Value" \
    --output text 2>&1 | sed 's/"//g' || echo "")

if [ -n "$VERIFICATION_TOKEN" ] && [ "$VERIFICATION_TOKEN" != "None" ]; then
    print_status "Setze Verification TXT Record in Route53..."
    
    # Prüfe ob Record bereits existiert
    EXISTING_TXT=$(aws route53 list-resource-record-sets \
        --hosted-zone-id "$ZONE_ID" \
        --query "ResourceRecordSets[?Name=='_amazonses.$DOMAIN.']" \
        --output json 2>&1)
    
    if echo "$EXISTING_TXT" | grep -q "\[\]"; then
        # Erstelle TXT Record
        CHANGE_BATCH=$(cat <<EOF
{
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "_amazonses.$DOMAIN",
      "Type": "TXT",
      "TTL": 3600,
      "ResourceRecords": [{"Value": "\"$VERIFICATION_TOKEN\""}]
    }
  }]
}
EOF
)
        aws route53 change-resource-record-sets \
            --hosted-zone-id "$ZONE_ID" \
            --change-batch "$CHANGE_BATCH" \
            --output json > /dev/null 2>&1
        print_success "✅ Verification TXT Record gesetzt"
    else
        print_success "✅ Verification TXT Record existiert bereits"
    fi
fi
echo ""

# Schritt 4: Aktiviere DKIM
print_status "4. Aktiviere DKIM..."
aws sesv2 put-email-identity-dkim-attributes \
    --email-identity "$DOMAIN" \
    --region "$REGION" \
    --signing-enabled \
    --output json > /dev/null 2>&1 || true

sleep 2

# Hole DKIM Tokens
DKIM_TOKENS=$(aws sesv2 get-email-identity \
    --email-identity "$DOMAIN" \
    --region "$REGION" \
    --query 'DkimAttributes.Tokens' \
    --output json 2>&1)

if echo "$DKIM_TOKENS" | grep -q "\["; then
    print_success "✅ DKIM aktiviert"
    
    # Parse Tokens
    TOKEN1=$(echo "$DKIM_TOKENS" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data[0] if len(data) > 0 else '')" 2>/dev/null || echo "")
    TOKEN2=$(echo "$DKIM_TOKENS" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data[1] if len(data) > 1 else '')" 2>/dev/null || echo "")
    TOKEN3=$(echo "$DKIM_TOKENS" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data[2] if len(data) > 2 else '')" 2>/dev/null || echo "")
    
    if [ -n "$TOKEN1" ] && [ -n "$TOKEN2" ] && [ -n "$TOKEN3" ]; then
        print_status "Setze DKIM CNAME Records in Route53..."
        
        # Erstelle Change Batch für alle 3 DKIM Records
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
            print_success "✅ DKIM CNAME Records gesetzt (Change ID: $CHANGE_ID)"
        else
            print_error "Fehler beim Setzen der DKIM Records"
        fi
    fi
else
    print_warning "DKIM-Tokens konnten nicht abgerufen werden"
fi
echo ""

# Schritt 5: Verifiziere E-Mail-Adresse
print_status "5. Verifiziere E-Mail-Adresse: mail@$DOMAIN..."
EMAIL_IDENTITY=$(aws sesv2 get-email-identity --email-identity "mail@$DOMAIN" --region "$REGION" --query 'VerificationStatus' --output text 2>&1 || echo "NOT_FOUND")

if [ "$EMAIL_IDENTITY" = "NOT_FOUND" ] || [ "$EMAIL_IDENTITY" = "None" ]; then
    aws sesv2 create-email-identity \
        --email-identity "mail@$DOMAIN" \
        --region "$REGION" \
        --output json > /dev/null 2>&1 || true
    print_success "✅ E-Mail-Verifizierung gestartet (Prüfe E-Mail-Postfach)"
else
    print_success "✅ E-Mail-Identity existiert bereits"
fi
echo ""

# Zusammenfassung
echo "═══════════════════════════════════════════════════════════════"
echo "📊 SETUP ABGESCHLOSSEN"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "✅ Route53 Hosted Zone: $ZONE_ID"
echo "✅ SES Domain-Verifizierung: Gestartet"
echo "✅ DKIM: Aktiviert"
echo "✅ E-Mail-Verifizierung: mail@$DOMAIN"
echo ""
print_warning "⚠️  WICHTIG: Setze die Route53 Nameserver bei deinem Domain-Registrar!"
echo ""
print_status "Route53 Nameserver:"
aws route53 get-hosted-zone --id "$ZONE_ID" --query 'DelegationSet.NameServers' --output text | tr '\t' '\n' | sed 's/^/  /'
echo ""
print_success "✅ Fertig! Nach DNS-Propagierung (24-48h) ist alles aktiv."

