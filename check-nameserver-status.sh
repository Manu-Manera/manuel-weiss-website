#!/bin/bash
# Prüft ob die Route53 Nameserver beim Domain-Registrar gesetzt sind

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

echo -e "${BLUE}🔍 Prüfe Nameserver-Status für $DOMAIN${NC}"
echo "=========================================="
echo ""

# 1. Prüfe öffentliche Nameserver
echo -e "${BLUE}1. Öffentliche Nameserver (via DNS):${NC}"
PUBLIC_NS=$(dig NS "$DOMAIN" +short 2>&1 | sort)

if [ -z "$PUBLIC_NS" ]; then
    echo -e "${RED}❌ KEINE Nameserver gefunden!${NC}"
    echo "   → Domain zeigt auf keine Nameserver"
    echo "   → DNS-Records sind nicht erreichbar"
else
    echo "   Gefundene Nameserver:"
    echo "$PUBLIC_NS" | while read ns; do
        if [ -n "$ns" ]; then
            # Prüfe ob es ein Route53 Nameserver ist
            IS_ROUTE53=false
            for route53_ns in "${ROUTE53_NS[@]}"; do
                if [[ "$ns" == *"$route53_ns"* ]]; then
                    IS_ROUTE53=true
                    break
                fi
            done
            
            if [ "$IS_ROUTE53" = true ]; then
                echo -e "   ${GREEN}✅ $ns${NC} (Route53)"
            else
                echo -e "   ${RED}❌ $ns${NC} (NICHT Route53!)"
            fi
        fi
    done
fi
echo ""

# 2. Prüfe Route53 Nameserver
echo -e "${BLUE}2. Erforderliche Route53 Nameserver:${NC}"
for ns in "${ROUTE53_NS[@]}"; do
    if echo "$PUBLIC_NS" | grep -q "$ns"; then
        echo -e "   ${GREEN}✅ $ns${NC} (gesetzt)"
    else
        echo -e "   ${RED}❌ $ns${NC} (FEHLT!)"
    fi
done
echo ""

# 3. Prüfe Domain-Registrar
echo -e "${BLUE}3. Domain-Registrar-Informationen:${NC}"
REGISTRAR=$(whois "$DOMAIN" 2>&1 | grep -i "registrar:" | head -1 | sed 's/.*Registrar: *//' || echo "Nicht gefunden")
echo "   Registrar: $REGISTRAR"
echo ""

# 4. Zusammenfassung
echo -e "${BLUE}4. Status-Zusammenfassung:${NC}"
ROUTE53_COUNT=$(echo "$PUBLIC_NS" | grep -c "awsdns" 2>/dev/null || echo "0")
ROUTE53_COUNT=${ROUTE53_COUNT:-0}

if [ "$ROUTE53_COUNT" -eq "4" ]; then
    echo -e "${GREEN}✅ ALLE Route53 Nameserver sind gesetzt!${NC}"
    echo ""
    echo "   → DNS-Propagierung kann 24-48h dauern"
    echo "   → Prüfen Sie Domain-Verifizierung:"
    echo "     aws ses get-identity-verification-attributes --identities $DOMAIN --region eu-central-1"
elif [ "$ROUTE53_COUNT" -gt "0" ]; then
    echo -e "${YELLOW}⚠️  Teilweise Route53 Nameserver gesetzt ($ROUTE53_COUNT/4)${NC}"
    echo "   → Setzen Sie ALLE 4 Nameserver beim Domain-Registrar"
elif [ -z "$PUBLIC_NS" ]; then
    echo -e "${RED}❌ KEINE Nameserver gefunden${NC}"
    echo "   → Domain zeigt auf keine Nameserver"
    echo "   → Setzen Sie die Route53 Nameserver beim Domain-Registrar"
else
    echo -e "${RED}❌ Route53 Nameserver sind NICHT gesetzt${NC}"
    echo "   → Aktuelle Nameserver sind NICHT von Route53"
    echo "   → Setzen Sie die Route53 Nameserver beim Domain-Registrar"
fi
echo ""

# 5. Anleitung
if [ "$ROUTE53_COUNT" -ne "4" ]; then
    echo -e "${YELLOW}📋 SO SETZEN SIE DIE NAMESERVER:${NC}"
    echo ""
    echo "1. Gehen Sie zu Ihrem Domain-Registrar: $REGISTRAR"
    echo ""
    echo "2. Öffnen Sie die DNS-Verwaltung für $DOMAIN"
    echo ""
    echo "3. Finden Sie 'Nameserver' oder 'DNS Settings'"
    echo ""
    echo "4. Setzen Sie folgende 4 Nameserver:"
    for ns in "${ROUTE53_NS[@]}"; do
        echo "   - $ns"
    done
    echo ""
    echo "5. Speichern Sie die Änderungen"
    echo ""
    echo "6. Warten Sie 24-48 Stunden auf DNS-Propagierung"
    echo ""
    echo "7. Prüfen Sie erneut mit: ./check-nameserver-status.sh"
    echo ""
fi

