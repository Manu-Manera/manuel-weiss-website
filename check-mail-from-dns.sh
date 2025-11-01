#!/bin/bash

# AWS SES Custom MAIL FROM Domain DNS Checker
# Prüft ob die DNS-Records für Custom MAIL FROM Domain korrekt gesetzt sind

# Farbe für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Parameter prüfen
if [ -z "$1" ]; then
    echo "Verwendung: $0 <mail-from-domain>"
    echo "Beispiel: $0 mail.manuel-weiss.ch"
    exit 1
fi

MAIL_FROM_DOMAIN="$1"
REGION="${AWS_REGION:-eu-central-1}"

echo "🔍 Prüfe DNS-Records für Custom MAIL FROM Domain: $MAIL_FROM_DOMAIN"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# 1. MX-Record prüfen
echo "1️⃣  Prüfe MX-Record..."
MX_RECORD=$(dig +short MX "$MAIL_FROM_DOMAIN" | head -n 1)

if [ -z "$MX_RECORD" ]; then
    echo -e "${RED}❌ MX-Record nicht gefunden!${NC}"
    echo ""
    echo "   Erforderlicher MX-Record:"
    echo "   Type: MX"
    echo "   Name: mail (für $MAIL_FROM_DOMAIN)"
    echo "   Priority: 10"
    echo "   Value: feedback-smtp.$REGION.amazonses.com"
    echo ""
    MX_OK=false
else
    # Prüfe ob der richtige Wert gesetzt ist
    EXPECTED_MX="feedback-smtp.$REGION.amazonses.com"
    if echo "$MX_RECORD" | grep -q "$EXPECTED_MX"; then
        echo -e "${GREEN}✅ MX-Record gefunden: $MX_RECORD${NC}"
        MX_OK=true
    else
        echo -e "${YELLOW}⚠️  MX-Record gefunden, aber möglicherweise falsch: $MX_RECORD${NC}"
        echo "   Erwartet: 10 feedback-smtp.$REGION.amazonses.com"
        MX_OK=false
    fi
fi

echo ""

# 2. SPF-Record (TXT) prüfen
echo "2️⃣  Prüfe SPF-Record (TXT)..."
SPF_RECORD=$(dig +short TXT "$MAIL_FROM_DOMAIN" | grep -i spf | head -n 1)

if [ -z "$SPF_RECORD" ]; then
    echo -e "${YELLOW}⚠️  SPF-Record nicht gefunden (optional, aber empfohlen)${NC}"
    echo ""
    echo "   Empfohlener TXT-Record:"
    echo "   Type: TXT"
    echo "   Name: mail (für $MAIL_FROM_DOMAIN)"
    echo "   Value: v=spf1 include:amazonses.com ~all"
    echo ""
    SPF_OK=false
else
    if echo "$SPF_RECORD" | grep -qi "amazonses.com"; then
        echo -e "${GREEN}✅ SPF-Record gefunden: $SPF_RECORD${NC}"
        SPF_OK=true
    else
        echo -e "${YELLOW}⚠️  SPF-Record gefunden, aber enthält nicht amazonses.com: $SPF_RECORD${NC}"
        SPF_OK=false
    fi
fi

echo ""

# 3. Vollständige DNS-Abfrage
echo "3️⃣  Vollständige DNS-Abfrage für $MAIL_FROM_DOMAIN..."
echo ""
echo "MX-Records:"
dig +noall +answer MX "$MAIL_FROM_DOMAIN"
echo ""
echo "TXT-Records:"
dig +noall +answer TXT "$MAIL_FROM_DOMAIN"
echo ""

# 4. AWS SES erwartete Werte
echo "4️⃣  AWS SES erwartete Werte für Region $REGION:"
echo ""
echo "   MX-Record sollte sein:"
echo "   10 feedback-smtp.$REGION.amazonses.com"
echo ""
echo "   TXT-Record (SPF) sollte sein:"
echo "   \"v=spf1 include:amazonses.com ~all\""
echo ""

# 5. Zusammenfassung
echo "═══════════════════════════════════════════════════════════════"
echo "📊 ZUSAMMENFASSUNG"
echo "═══════════════════════════════════════════════════════════════"
echo ""

if [ "$MX_OK" = true ] && [ "$SPF_OK" = true ]; then
    echo -e "${GREEN}✅ Alle DNS-Records sind korrekt gesetzt!${NC}"
    echo ""
    echo "Nächste Schritte:"
    echo "1. Warte 5-15 Minuten auf DNS-Propagierung"
    echo "2. Gehe zu AWS SES Console → Identities → manuel-weiss.ch"
    echo "3. Klicke auf 'MAIL FROM domain' Tab"
    echo "4. Klicke auf 'Verify' oder warte auf automatische Verifikation"
    EXIT_CODE=0
elif [ "$MX_OK" = true ]; then
    echo -e "${YELLOW}⚠️  MX-Record ist korrekt, aber SPF-Record fehlt${NC}"
    echo ""
    echo "Nächste Schritte:"
    echo "1. Füge SPF-Record hinzu (optional, aber empfohlen)"
    echo "2. Warte 5-15 Minuten auf DNS-Propagierung"
    echo "3. Prüfe in AWS SES Console"
    EXIT_CODE=0
elif [ "$MX_OK" = false ]; then
    echo -e "${RED}❌ MX-Record fehlt oder ist falsch!${NC}"
    echo ""
    echo "Erforderliche Aktionen:"
    echo "1. Gehe zu deinem DNS-Provider (Route 53, Namecheap, etc.)"
    echo "2. Füge einen MX-Record hinzu:"
    echo "   Type: MX"
    echo "   Name: mail"
    echo "   Priority: 10"
    echo "   Value: feedback-smtp.$REGION.amazonses.com"
    echo "3. Warte 5-15 Minuten"
    echo "4. Führe dieses Script erneut aus"
    EXIT_CODE=1
else
    echo -e "${RED}❌ Unbekannter Fehler${NC}"
    EXIT_CODE=1
fi

echo ""
echo "🔗 Nützliche Links:"
echo "   - MX Toolbox: https://mxtoolbox.com/SuperTool.aspx?action=mx%3a$MAIL_FROM_DOMAIN"
echo "   - DNS Checker: https://www.whatsmydns.net/#MX/$MAIL_FROM_DOMAIN"
echo "   - AWS SES Docs: https://docs.aws.amazon.com/ses/latest/dg/mail-from.html"
echo ""

exit $EXIT_CODE

