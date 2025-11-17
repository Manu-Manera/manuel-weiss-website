#!/bin/bash
# Setzt Nameserver nach Domain-Registrierung beim externen Registrar

set -e

DOMAIN="manuel-weiss.ch"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Setze Nameserver nach Domain-Registrierung${NC}"
echo "=========================================="
echo ""

echo -e "${YELLOW}⚠️  WICHTIG:${NC}"
echo "   Diese Nameserver müssen beim Domain-Registrar gesetzt werden!"
echo ""

echo -e "${BLUE}Route53 Nameserver (MÜSSEN gesetzt werden):${NC}"
echo ""
echo "   ns-656.awsdns-18.net"
echo "   ns-1665.awsdns-16.co.uk"
echo "   ns-1193.awsdns-21.org"
echo "   ns-371.awsdns-46.com"
echo ""

echo -e "${BLUE}So setzen Sie die Nameserver:${NC}"
echo ""
echo "1. Gehen Sie zu Ihrem Domain-Registrar (z.B. Hostpoint)"
echo "2. Öffnen Sie die DNS-Verwaltung für $DOMAIN"
echo "3. Finden Sie 'Nameserver' oder 'DNS Settings'"
echo "4. Setzen Sie die 4 Nameserver oben"
echo "5. Speichern Sie die Änderungen"
echo ""

echo -e "${YELLOW}Nach 24-48 Stunden:${NC}"
echo "   Führen Sie aus: ./check-nameserver-status.sh"
echo ""

echo -e "${GREEN}✅ Dann funktioniert alles automatisch!${NC}"

