#!/bin/bash

# Prüft alle HTML-Seiten auf korrekte Auth-Konfiguration

echo "🔍 Prüfe alle Seiten auf korrekte Auth-Konfiguration..."
echo ""

PAGES=(
    "applications/index.html"
    "applications/document-upload.html"
    "applications/profile-setup.html"
    "applications/application-generator.html"
    "applications/interview-prep.html"
    "applications/tracking-dashboard.html"
)

ISSUES=0

for page in "${PAGES[@]}"; do
    if [ ! -f "$page" ]; then
        echo "⚠️  Datei nicht gefunden: $page"
        continue
    fi
    
    echo "📄 Prüfe: $page"
    
    # Prüfe ob aws-config.js geladen wird
    if ! grep -q "aws-config.js" "$page"; then
        echo "   ❌ aws-config.js fehlt!"
        ISSUES=$((ISSUES + 1))
    else
        echo "   ✅ aws-config.js gefunden"
    fi
    
    # Prüfe ob real-user-auth-system.js geladen wird
    if ! grep -q "real-user-auth-system.js" "$page"; then
        echo "   ❌ real-user-auth-system.js fehlt!"
        ISSUES=$((ISSUES + 1))
    else
        echo "   ✅ real-user-auth-system.js gefunden"
    fi
    
    # Prüfe ob aws-config.js VOR real-user-auth-system.js geladen wird
    AWS_CONFIG_LINE=$(grep -n "aws-config.js" "$page" | cut -d: -f1 | head -1)
    AUTH_SYSTEM_LINE=$(grep -n "real-user-auth-system.js" "$page" | cut -d: -f1 | head -1)
    
    if [ -n "$AWS_CONFIG_LINE" ] && [ -n "$AUTH_SYSTEM_LINE" ]; then
        if [ "$AWS_CONFIG_LINE" -lt "$AUTH_SYSTEM_LINE" ]; then
            echo "   ✅ aws-config.js wird vor Auth-System geladen"
        else
            echo "   ⚠️  aws-config.js sollte VOR real-user-auth-system.js geladen werden"
            ISSUES=$((ISSUES + 1))
        fi
    fi
    
    echo ""
done

echo "📊 Zusammenfassung"
echo "=================="
if [ $ISSUES -eq 0 ]; then
    echo "✅ Alle Seiten sind korrekt konfiguriert!"
else
    echo "⚠️  $ISSUES Problem(e) gefunden"
fi

echo ""

