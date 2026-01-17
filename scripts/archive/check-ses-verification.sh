#!/bin/bash

# Prüft den SES Domain-Verifizierungsstatus für manuel-weiss.ch

echo "🔍 Prüfe SES Domain-Verifizierung für manuel-weiss.ch..."
echo ""

# Prüfe Nameserver
echo "📡 Nameserver Status:"
NS_COUNT=$(dig NS manuel-weiss.ch +short | wc -l | tr -d ' ')
if [ "$NS_COUNT" -eq 4 ]; then
    echo "✅ Alle 4 AWS Route53 Nameserver sind aktiv:"
    dig NS manuel-weiss.ch +short | sed 's/^/   - /'
else
    echo "⚠️  Nur $NS_COUNT Nameserver gefunden (erwartet: 4)"
fi
echo ""

# Prüfe Verifizierungs-Record
echo "🔐 Domain-Verifizierungs-Record:"
VERIFY_RECORD=$(dig TXT _amazonses.manuel-weiss.ch +short)
if [ -n "$VERIFY_RECORD" ]; then
    echo "✅ Verifizierungs-Record ist auflösbar: $VERIFY_RECORD"
else
    echo "❌ Verifizierungs-Record nicht gefunden"
fi
echo ""

# Prüfe DKIM Records
echo "🔑 DKIM Records:"
DKIM1=$(dig CNAME smln6ugnqm64joyksgg2thjvnli3vzyb._domainkey.manuel-weiss.ch +short)
DKIM2=$(dig CNAME oribrshwxibnst33qhxzgpuvsr2g7k5f._domainkey.manuel-weiss.ch +short)
DKIM3=$(dig CNAME hgq6gco2ns7ijaqqz3mk3fpniozp76rr._domainkey.manuel-weiss.ch +short)

if [ -n "$DKIM1" ] && [ -n "$DKIM2" ] && [ -n "$DKIM3" ]; then
    echo "✅ Alle 3 DKIM Records sind auflösbar"
else
    echo "⚠️  Nicht alle DKIM Records gefunden"
fi
echo ""

# Prüfe AWS SES Status
echo "☁️  AWS SES Verifizierungsstatus:"
SES_STATUS=$(aws sesv2 get-email-identity --email-identity manuel-weiss.ch --region eu-central-1 --query 'VerificationStatus' --output text 2>/dev/null)

if [ "$SES_STATUS" = "SUCCESS" ]; then
    echo "✅ Domain ist VERIFIZIERT!"
    echo ""
    DKIM_STATUS=$(aws sesv2 get-email-identity --email-identity manuel-weiss.ch --region eu-central-1 --query 'DkimAttributes.Status' --output text 2>/dev/null)
    MAILFROM_STATUS=$(aws sesv2 get-email-identity --email-identity manuel-weiss.ch --region eu-central-1 --query 'MailFromAttributes.MailFromDomainStatus' --output text 2>/dev/null)
    echo "   DKIM Status: $DKIM_STATUS"
    echo "   Mail-From Status: $MAILFROM_STATUS"
elif [ "$SES_STATUS" = "FAILED" ]; then
    echo "❌ Domain-Verifizierung FEHLGESCHLAGEN"
    ERROR_TYPE=$(aws sesv2 get-email-identity --email-identity manuel-weiss.ch --region eu-central-1 --query 'VerificationInfo.ErrorType' --output text 2>/dev/null)
    echo "   Fehlertyp: $ERROR_TYPE"
    echo ""
    echo "ℹ️  AWS prüft automatisch in Intervallen. Warte 10-30 Minuten und prüfe erneut."
elif [ "$SES_STATUS" = "PENDING" ]; then
    echo "⏳ Domain-Verifizierung läuft noch..."
else
    echo "⚠️  Unbekannter Status: $SES_STATUS"
fi
echo ""

# Prüfe Mail-From Domain
echo "📧 Mail-From Domain (mail.manuel-weiss.ch):"
MAILFROM_MX=$(dig MX mail.manuel-weiss.ch +short)
if [ -n "$MAILFROM_MX" ]; then
    echo "✅ MX Record gefunden: $MAILFROM_MX"
else
    echo "⚠️  MX Record nicht gefunden"
fi
echo ""

echo "💡 Tipp: AWS SES prüft automatisch alle 15-60 Minuten. Wenn alle DNS-Records korrekt sind, sollte die Verifizierung innerhalb der nächsten Stunde erfolgreich sein."

