#!/bin/bash
# Prüft warum Nameserver nicht funktionieren, obwohl sie in Route53 korrekt sind

set -e

DOMAIN="manuel-weiss.ch"
HOSTED_ZONE_ID="Z02760862I1VK88B8J0ED"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Prüfe warum Nameserver nicht funktionieren...${NC}"
echo "=========================================="
echo ""

# 1. Route53 Nameserver
echo -e "${BLUE}1. Route53 Nameserver (sollten sein):${NC}"
ROUTE53_NS=$(aws route53 get-hosted-zone \
    --id "$HOSTED_ZONE_ID" \
    --query "DelegationSet.NameServers" \
    --output text 2>&1)

echo "$ROUTE53_NS" | while read ns; do
    if [ -n "$ns" ]; then
        echo -e "   ${GREEN}✅ $ns${NC}"
    fi
done
echo ""

# 2. Öffentliche Nameserver (verschiedene DNS-Server)
echo -e "${BLUE}2. Öffentliche Nameserver (was die Welt sieht):${NC}"

# Google DNS
GOOGLE_NS=$(dig NS "$DOMAIN" @8.8.8.8 +short 2>&1 | sort)
echo "   Google DNS (8.8.8.8):"
if [ -z "$GOOGLE_NS" ]; then
    echo -e "   ${RED}❌ KEINE Nameserver gefunden${NC}"
else
    echo "$GOOGLE_NS" | while read ns; do
        if [ -n "$ns" ]; then
            echo "   - $ns"
        fi
    done
fi
echo ""

# Cloudflare DNS
CLOUDFLARE_NS=$(dig NS "$DOMAIN" @1.1.1.1 +short 2>&1 | sort)
echo "   Cloudflare DNS (1.1.1.1):"
if [ -z "$CLOUDFLARE_NS" ]; then
    echo -e "   ${RED}❌ KEINE Nameserver gefunden${NC}"
else
    echo "$CLOUDFLARE_NS" | while read ns; do
        if [ -n "$ns" ]; then
            echo "   - $ns"
        fi
    done
fi
echo ""

# 3. WHOIS Nameserver
echo -e "${BLUE}3. WHOIS Nameserver (beim Registrar):${NC}"
WHOIS_NS=$(whois "$DOMAIN" 2>&1 | grep -i -E "name server|nameserver|nserver" | head -10)

if [ -z "$WHOIS_NS" ]; then
    echo -e "   ${RED}❌ KEINE Nameserver in WHOIS gefunden${NC}"
    echo "   → Domain zeigt auf KEINE Nameserver!"
else
    echo "$WHOIS_NS" | while read line; do
        if [ -n "$line" ]; then
            # Extrahiere Nameserver aus Zeile
            NS=$(echo "$line" | grep -oE "[a-z0-9.-]+\.(net|com|org|ch|de|uk)" | head -1)
            if [ -n "$NS" ]; then
                # Prüfe ob es Route53 Nameserver ist
                if echo "$ROUTE53_NS" | grep -q "$NS"; then
                    echo -e "   ${GREEN}✅ $NS${NC} (Route53)"
                else
                    echo -e "   ${RED}❌ $NS${NC} (NICHT Route53!)"
                fi
            fi
        fi
    done
fi
echo ""

# 4. Zusammenfassung
echo -e "${BLUE}4. DIAGNOSE:${NC}"
echo ""

if [ -z "$GOOGLE_NS" ] && [ -z "$CLOUDFLARE_NS" ]; then
    echo -e "${RED}❌ KRITISCH: Domain zeigt auf KEINE Nameserver!${NC}"
    echo ""
    echo "   Problem:"
    echo "   → Domain-Registrar hat KEINE Nameserver gesetzt"
    echo "   → DNS-Abfragen finden keine Nameserver"
    echo "   → Route53 DNS-Records sind nicht erreichbar"
    echo ""
    echo -e "${YELLOW}⚠️  LÖSUNG:${NC}"
    echo "   → Domain-Registrar KONTAKTIEREN"
    echo "   → Nameserver setzen lassen"
    echo "   → Route53 Nameserver angeben:"
    echo "$ROUTE53_NS" | while read ns; do
        if [ -n "$ns" ]; then
            echo "      - $ns"
        fi
    done
elif [ -n "$WHOIS_NS" ] && ! echo "$WHOIS_NS" | grep -q "awsdns"; then
    echo -e "${RED}❌ Domain zeigt auf FALSCHE Nameserver!${NC}"
    echo ""
    echo "   Problem:"
    echo "   → Domain-Registrar verwendet andere Nameserver"
    echo "   → Nicht die Route53 Nameserver"
    echo ""
    echo -e "${YELLOW}⚠️  LÖSUNG:${NC}"
    echo "   → Domain-Registrar KONTAKTIEREN"
    echo "   → Nameserver ÄNDERN lassen"
    echo "   → Route53 Nameserver angeben"
else
    echo -e "${GREEN}✅ Nameserver scheinen korrekt zu sein${NC}"
    echo "   → Prüfen Sie Domain-Verifizierung in SES"
fi
echo ""

