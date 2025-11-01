#!/bin/bash

# AWS SES Custom MAIL FROM Domain Fix Script
# Hilft beim Beheben des MAIL FROM Domain Problems

# Farbe für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

DOMAIN="manuel-weiss.ch"
MAIL_FROM_DOMAIN="mail.manuel-weiss.ch"
REGION="eu-central-1"

echo "🔧 AWS SES Custom MAIL FROM Domain Fix"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Domain: $DOMAIN"
echo "MAIL FROM Domain: $MAIL_FROM_DOMAIN"
echo "Region: $REGION"
echo ""

# Prüfe ob AWS CLI verfügbar ist
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI ist nicht installiert${NC}"
    echo "Installiere mit: pip install awscli oder brew install awscli"
    exit 1
fi

# Prüfe ob jq verfügbar ist
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠️  jq ist nicht installiert (optional, für JSON-Parsing)${NC}"
    JQ_AVAILABLE=false
else
    JQ_AVAILABLE=true
fi

# Funktion: DNS-Record prüfen
check_dns() {
    echo "🔍 Prüfe DNS-Records..."
    echo ""
    
    # Prüfe MX-Record
    MX_RECORD=$(dig +short MX "$MAIL_FROM_DOMAIN" 2>/dev/null | head -n 1)
    EXPECTED_MX="feedback-smtp.$REGION.amazonses.com"
    
    if [ -z "$MX_RECORD" ]; then
        echo -e "${RED}❌ MX-Record nicht gefunden für $MAIL_FROM_DOMAIN${NC}"
        return 1
    elif echo "$MX_RECORD" | grep -q "$EXPECTED_MX"; then
        echo -e "${GREEN}✅ MX-Record korrekt: $MX_RECORD${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  MX-Record gefunden, aber möglicherweise falsch: $MX_RECORD${NC}"
        echo "   Erwartet: 10 $EXPECTED_MX"
        return 1
    fi
}

# Funktion: AWS SES Status prüfen
check_ses_status() {
    echo ""
    echo "🔍 Prüfe AWS SES Status..."
    echo ""
    
    if [ "$JQ_AVAILABLE" = true ]; then
        SES_STATUS=$(aws sesv2 get-email-identity \
            --email-identity "$DOMAIN" \
            --region "$REGION" 2>/dev/null | jq -r '.MailFromAttributes.MailFromDomain // "NOT_CONFIGURED"')
        
        if [ "$SES_STATUS" = "NOT_CONFIGURED" ]; then
            echo -e "${YELLOW}⚠️  MAIL FROM Domain ist nicht konfiguriert${NC}"
            return 1
        else
            echo -e "${BLUE}ℹ️  MAIL FROM Domain: $SES_STATUS${NC}"
            return 0
        fi
    else
        echo -e "${YELLOW}⚠️  jq nicht verfügbar, überspringe SES Status-Check${NC}"
        return 0
    fi
}

# Funktion: Optionen anzeigen
show_options() {
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "📋 OPTIONEN"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "1️⃣  DNS-Records prüfen (mit check-mail-from-dns.sh)"
    echo "2️⃣  Custom MAIL FROM Domain entfernen (einfachste Lösung)"
    echo "3️⃣  Custom MAIL FROM Domain neu konfigurieren"
    echo "4️⃣  Manuelle Anleitung anzeigen"
    echo "5️⃣  Beenden"
    echo ""
}

# Hauptmenü
while true; do
    show_options
    read -p "Wähle eine Option (1-5): " choice
    
    case $choice in
        1)
            echo ""
            echo "🔍 Starte DNS-Prüfung..."
            echo ""
            ./check-mail-from-dns.sh "$MAIL_FROM_DOMAIN"
            ;;
        2)
            echo ""
            echo "🗑️  Entferne Custom MAIL FROM Domain..."
            echo ""
            echo "Dies entfernt die Custom MAIL FROM Domain Konfiguration."
            echo "E-Mails funktionieren weiterhin mit amazonses.com als MAIL FROM."
            echo ""
            read -p "Fortfahren? (j/n): " confirm
            if [ "$confirm" = "j" ] || [ "$confirm" = "J" ]; then
                echo ""
                echo "Anleitung:"
                echo "1. Gehe zu: https://console.aws.amazon.com/ses/"
                echo "2. Wähle Region: $REGION"
                echo "3. Navigiere zu: Identities → $DOMAIN"
                echo "4. Klicke auf Tab: 'MAIL FROM domain'"
                echo "5. Klicke auf: 'Remove' oder 'Delete'"
                echo "6. Bestätige die Löschung"
                echo ""
                echo -e "${GREEN}✅ Die Fehlermeldung sollte nach einiger Zeit verschwinden${NC}"
            fi
            ;;
        3)
            echo ""
            echo "⚙️  Konfiguriere Custom MAIL FROM Domain neu..."
            echo ""
            
            # Prüfe DNS
            if check_dns; then
                echo ""
                echo "Anleitung:"
                echo "1. Gehe zu: https://console.aws.amazon.com/ses/"
                echo "2. Wähle Region: $REGION"
                echo "3. Navigiere zu: Identities → $DOMAIN"
                echo "4. Klicke auf Tab: 'MAIL FROM domain'"
                echo "5. Klicke auf: 'Configure'"
                echo "6. Gebe ein: $MAIL_FROM_DOMAIN"
                echo "7. Wähle Behavior: 'UseAmazonSES' (falls MX noch nicht verifiziert)"
                echo "8. Klicke auf: 'Save'"
                echo "9. Nach 5-15 Minuten: Klicke auf 'Verify'"
                echo ""
                echo -e "${GREEN}✅ Wenn DNS-Records korrekt sind, sollte Verifikation erfolgreich sein${NC}"
            else
                echo ""
                echo -e "${RED}❌ DNS-Records sind nicht korrekt!${NC}"
                echo "Bitte zuerst DNS-Records setzen (siehe Option 4)"
            fi
            ;;
        4)
            echo ""
            echo "📖 Manuelle Anleitung:"
            echo ""
            echo "Siehe: AWS_SES_MAIL_FROM_FIX.md für detaillierte Anleitung"
            echo ""
            echo "Kurzfassung:"
            echo "═══════════════════════════════════════════════════════════════"
            echo ""
            echo "1. Gehe zu deinem DNS-Provider (Route 53, Namecheap, etc.)"
            echo ""
            echo "2. Füge MX-Record hinzu:"
            echo "   Type: MX"
            echo "   Name: mail"
            echo "   Priority: 10"
            echo "   Value: feedback-smtp.$REGION.amazonses.com"
            echo ""
            echo "3. (Optional) Füge SPF-Record hinzu:"
            echo "   Type: TXT"
            echo "   Name: mail"
            echo "   Value: v=spf1 include:amazonses.com ~all"
            echo ""
            echo "4. Warte 5-15 Minuten auf DNS-Propagierung"
            echo ""
            echo "5. Prüfe mit: ./check-mail-from-dns.sh $MAIL_FROM_DOMAIN"
            echo ""
            echo "6. In AWS SES Console: MAIL FROM Domain → Verify"
            echo ""
            ;;
        5)
            echo ""
            echo "👋 Auf Wiedersehen!"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Ungültige Option${NC}"
            ;;
    esac
    
    echo ""
    read -p "Drücke Enter um fortzufahren..."
done

