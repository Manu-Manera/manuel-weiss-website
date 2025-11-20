#!/bin/bash

# Prüft den Status der Netlify Custom Domain

echo "🔍 Prüfe Netlify Domain Status für manuel-weiss.ch"
echo "=================================================="
echo ""

# Prüfe DNS Records
echo "📡 DNS Records:"
A_RECORD=$(dig A manuel-weiss.ch +short)
CNAME_RECORD=$(dig CNAME www.manuel-weiss.ch +short)

if [ -n "$A_RECORD" ]; then
    echo "✅ A Record: manuel-weiss.ch → $A_RECORD"
else
    echo "❌ A Record nicht gefunden"
fi

if [ -n "$CNAME_RECORD" ]; then
    echo "✅ CNAME Record: www.manuel-weiss.ch → $CNAME_RECORD"
else
    echo "❌ CNAME Record nicht gefunden"
fi
echo ""

# Prüfe HTTP (ohne SSL)
echo "🌐 HTTP Status (ohne SSL):"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://manuel-weiss.ch 2>&1)
if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
    echo "✅ HTTP erreichbar (Status: $HTTP_STATUS)"
else
    echo "⚠️  HTTP Status: $HTTP_STATUS"
fi
echo ""

# Prüfe HTTPS (mit SSL)
echo "🔒 HTTPS Status (mit SSL):"
HTTPS_STATUS=$(curl -k -s -o /dev/null -w "%{http_code}" https://manuel-weiss.ch 2>&1)
if [ "$HTTPS_STATUS" = "200" ]; then
    echo "✅ HTTPS erreichbar (Status: $HTTPS_STATUS)"
    echo "⚠️  Aber SSL-Zertifikat ist noch nicht gültig (curl -k verwendet)"
else
    echo "❌ HTTPS nicht erreichbar (Status: $HTTPS_STATUS)"
fi
echo ""

# Prüfe SSL-Zertifikat Details
echo "📜 SSL-Zertifikat Details:"
SSL_INFO=$(echo | openssl s_client -connect manuel-weiss.ch:443 -servername manuel-weiss.ch 2>/dev/null | openssl x509 -noout -subject -dates 2>/dev/null)
if [ -n "$SSL_INFO" ]; then
    echo "$SSL_INFO"
else
    echo "❌ SSL-Zertifikat nicht gefunden oder nicht gültig"
fi
echo ""

# Prüfe Netlify Backup URL
echo "🌐 Netlify Backup URL (mawps.netlify.app):"
NETLIFY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://mawps.netlify.app 2>&1)
if [ "$NETLIFY_STATUS" = "200" ]; then
    echo "✅ Netlify URL funktioniert (Status: $NETLIFY_STATUS)"
else
    echo "❌ Netlify URL nicht erreichbar (Status: $NETLIFY_STATUS)"
fi
echo ""

echo "💡 Nächste Schritte:"
echo "1. Gehe zu https://app.netlify.com → Site settings → Domain management"
echo "2. Prüfe ob 'manuel-weiss.ch' als Custom Domain hinzugefügt ist"
echo "3. Prüfe ob SSL-Zertifikat ausgestellt wurde (kann 1-24 Stunden dauern)"
echo "4. Falls nicht, klicke auf 'Verify DNS configuration'"
echo "5. Warte bis Netlify das SSL-Zertifikat ausstellt"

