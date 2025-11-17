#!/bin/bash
# Überwacht DNS-Propagierung und zeigt Status

set -e

DOMAIN="manuel-weiss.ch"
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

echo -e "${BLUE}⏳ DNS-Propagierung überwachen für $DOMAIN${NC}"
echo "=========================================="
echo ""

echo -e "${YELLOW}ℹ️  WICHTIG: DNS-Propagierung ist automatisch!${NC}"
echo ""
echo "   → Sie können sie NICHT beschleunigen"
echo "   → Sie können sie NICHT manuell auslösen"
echo "   → Sie passiert automatisch weltweit"
echo "   → Dauert normalerweise 1-24 Stunden"
echo ""

# Prüfe verschiedene DNS-Server weltweit
echo -e "${BLUE}Prüfe DNS-Propagierung weltweit...${NC}"
echo ""

DNS_SERVERS=(
    "8.8.8.8:Google DNS (USA)"
    "1.1.1.1:Cloudflare DNS (Global)"
    "208.67.222.222:OpenDNS (USA)"
    "9.9.9.9:Quad9 (Global)"
)

ALL_OK=true
FOUND_COUNT=0

for server_info in "${DNS_SERVERS[@]}"; do
    SERVER_IP="${server_info%%:*}"
    SERVER_NAME="${server_info#*:}"
    
    NS_RESULT=$(dig NS "$DOMAIN" @"$SERVER_IP" +short 2>&1 | sort)
    
    echo -n "   $SERVER_NAME: "
    
    if [ -z "$NS_RESULT" ]; then
        echo -e "${RED}❌ Noch nicht propagiert${NC}"
        ALL_OK=false
    else
        # Prüfe ob Route53 Nameserver gefunden wurden
        ROUTE53_FOUND=0
        for route53_ns in "${ROUTE53_NS[@]}"; do
            if echo "$NS_RESULT" | grep -q "$route53_ns"; then
                ROUTE53_FOUND=$((ROUTE53_FOUND + 1))
            fi
        done
        
        if [ "$ROUTE53_FOUND" -eq "4" ]; then
            echo -e "${GREEN}✅ Alle 4 Route53 Nameserver gefunden${NC}"
            FOUND_COUNT=$((FOUND_COUNT + 1))
        elif [ "$ROUTE53_FOUND" -gt "0" ]; then
            echo -e "${YELLOW}⚠️  Teilweise ($ROUTE53_FOUND/4)${NC}"
            ALL_OK=false
        else
            echo -e "${RED}❌ Falsche Nameserver${NC}"
            ALL_OK=false
        fi
    fi
done

echo ""

# Zusammenfassung
if [ "$ALL_OK" = true ] && [ "$FOUND_COUNT" -eq "${#DNS_SERVERS[@]}" ]; then
    echo -e "${GREEN}✅ DNS-Propagierung ist abgeschlossen!${NC}"
    echo ""
    echo "   → Alle DNS-Server zeigen auf Route53 Nameserver"
    echo "   → AWS SES kann Domain jetzt verifizieren"
    echo ""
    echo "   Prüfen Sie Domain-Verifizierung:"
    echo "   ./verify-domain-after-nameserver-set.sh"
elif [ "$FOUND_COUNT" -gt "0" ]; then
    echo -e "${YELLOW}⏳ DNS-Propagierung läuft noch...${NC}"
    echo ""
    echo "   → $FOUND_COUNT von ${#DNS_SERVERS[@]} DNS-Servern zeigen Route53 Nameserver"
    echo "   → Propagierung ist im Gange"
    echo "   → Warten Sie noch 1-12 Stunden"
    echo ""
    echo "   Prüfen Sie später erneut:"
    echo "   ./monitor-dns-propagation.sh"
else
    echo -e "${RED}❌ DNS-Propagierung noch nicht gestartet${NC}"
    echo ""
    echo "   → Nameserver wurden gerade gesetzt"
    echo "   → Propagierung kann 1-24 Stunden dauern"
    echo "   → Warten Sie und prüfen Sie später erneut"
    echo ""
    echo "   Prüfen Sie in 1-2 Stunden:"
    echo "   ./monitor-dns-propagation.sh"
fi

echo ""

