#!/bin/bash

# Setzt DKIM-Records in Cloudflare automatisch
# Benötigt: CLOUDFLARE_API_TOKEN oder CLOUDFLARE_EMAIL + CLOUDFLARE_API_KEY

set -e

DOMAIN="manuel-weiss.de"
ZONE_NAME="manuel-weiss.de"

# DKIM-Tokens (aus AWS SES)
TOKEN1="5zcuj67ai5ufq5w25aixfhdmcj2jugdp"
TOKEN2="zdzcg3k4zb55mwj7as7m2bxusj4rtk3l"
TOKEN3="effi2hih54bdyqog32qbwuhe3ze5okxr"

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

echo "🔧 DKIM-Records in Cloudflare setzen"
echo "===================================="
echo ""

# Prüfe ob Cloudflare API Token vorhanden
if [ -z "$CLOUDFLARE_API_TOKEN" ] && [ -z "$CLOUDFLARE_EMAIL" ]; then
    print_error "Cloudflare API Credentials nicht gefunden!"
    echo ""
    echo "Du musst einen Cloudflare API Token erstellen:"
    echo "1. Gehe zu: https://dash.cloudflare.com/profile/api-tokens"
    echo "2. Klicke 'Create Token'"
    echo "3. Verwende 'Edit zone DNS' Template"
    echo "4. Zone: manuel-weiss.de"
    echo "5. Kopiere den Token"
    echo ""
    echo "Dann setze:"
    echo "  export CLOUDFLARE_API_TOKEN='dein-token'"
    echo ""
    echo "ODER: Füge die Records manuell in Cloudflare hinzu (siehe cloudflare-dkim-records.txt)"
    exit 1
fi

# Hole Zone ID
print_status "Hole Cloudflare Zone ID..."
if [ -n "$CLOUDFLARE_API_TOKEN" ]; then
    AUTH_HEADER="Authorization: Bearer $CLOUDFLARE_API_TOKEN"
else
    AUTH_HEADER="X-Auth-Email: $CLOUDFLARE_EMAIL"
    AUTH_KEY="X-Auth-Key: $CLOUDFLARE_API_KEY"
fi

ZONE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=$ZONE_NAME" \
    -H "$AUTH_HEADER" \
    ${AUTH_KEY:+-H "$AUTH_KEY"} \
    -H "Content-Type: application/json" | \
    python3 -c "import sys, json; data=json.load(sys.stdin); print(data['result'][0]['id'] if data.get('result') else '')" 2>/dev/null || echo "")

if [ -z "$ZONE_ID" ]; then
    print_error "Zone ID konnte nicht abgerufen werden"
    exit 1
fi

print_success "Zone ID gefunden: $ZONE_ID"
echo ""

# Funktion zum Hinzufügen eines CNAME-Records
add_dkim_record() {
    local token=$1
    local name="${token}._domainkey"
    local target="${token}.dkim.amazonses.com"
    
    print_status "Füge hinzu: $name → $target"
    
    RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
        -H "$AUTH_HEADER" \
        ${AUTH_KEY:+-H "$AUTH_KEY"} \
        -H "Content-Type: application/json" \
        --data "{
            \"type\": \"CNAME\",
            \"name\": \"$name\",
            \"content\": \"$target\",
            \"ttl\": 3600,
            \"proxied\": false
        }")
    
    SUCCESS=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print('success' if data.get('success') else 'error')" 2>/dev/null || echo "error")
    
    if [ "$SUCCESS" = "success" ]; then
        print_success "✅ $name hinzugefügt"
        return 0
    else
        ERROR=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); errors=data.get('errors', []); print(errors[0].get('message', 'Unknown error') if errors else 'Unknown error')" 2>/dev/null || echo "Unknown error")
        if echo "$ERROR" | grep -q "already exists"; then
            print_warning "⚠️  $name existiert bereits"
            return 0
        else
            print_error "❌ Fehler: $ERROR"
            return 1
        fi
    fi
}

# Füge alle 3 Records hinzu
add_dkim_record "$TOKEN1"
add_dkim_record "$TOKEN2"
add_dkim_record "$TOKEN3"

echo ""
print_success "✅ Fertig!"
echo ""
print_status "Warte 5-10 Minuten auf DNS-Propagierung..."
echo "Dann prüfe: ./verify-domain-dns-records.sh"

