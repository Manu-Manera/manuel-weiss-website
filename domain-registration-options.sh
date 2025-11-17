#!/bin/bash
# Domain-Registrierung Optionen und Preise

set -e

DOMAIN="manuel-weiss.ch"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🌐 Domain-Registrierung Optionen für $DOMAIN${NC}"
echo "=========================================="
echo ""

echo -e "${BLUE}1. AWS Route53 Domains (EMPFOHLEN - Ich kann es übernehmen!)${NC}"
echo ""
echo "   Vorteile:"
echo "   ✅ Direkt in AWS integriert"
echo "   ✅ Nameserver automatisch gesetzt"
echo "   ✅ Ich kann alles übernehmen"
echo "   ✅ Keine manuellen Schritte nötig"
echo ""
echo "   Preise (.ch Domain):"
echo "   → ~15-20 CHF/Jahr (ca. 15-20€)"
echo ""
echo "   Registrierung:"
echo "   → Kann ich direkt über AWS CLI machen"
echo "   → Nameserver werden automatisch gesetzt"
echo "   → Domain-Verifizierung funktioniert sofort"
echo ""

echo -e "${BLUE}2. Externe Registrar (günstiger, aber mehr Aufwand)${NC}"
echo ""
echo "   Günstige Optionen:"
echo "   → Namecheap: ~10-12 CHF/Jahr"
echo "   → Hostpoint (Schweiz): ~12-15 CHF/Jahr"
echo "   → IONOS: ~10-15 CHF/Jahr"
echo ""
echo "   Nachteile:"
echo "   ❌ Sie müssen Nameserver manuell setzen"
echo "   ❌ Mehr Schritte nötig"
echo ""

echo -e "${BLUE}3. EMPFEHLUNG: AWS Route53 Domains${NC}"
echo ""
echo "   Warum?"
echo "   ✅ Nur 5-10€ mehr pro Jahr"
echo "   ✅ Ich kann alles automatisch machen"
echo "   ✅ Nameserver werden automatisch gesetzt"
echo "   ✅ Keine manuellen Schritte"
echo "   ✅ Domain-Verifizierung funktioniert sofort"
echo ""

echo -e "${YELLOW}📋 NÄCHSTER SCHRITT:${NC}"
echo ""
echo "   Sagen Sie mir: 'Registriere die Domain über AWS'"
echo "   → Dann registriere ich sie direkt"
echo "   → Setze Nameserver automatisch"
echo "   → Domain-Verifizierung funktioniert sofort"
echo ""

