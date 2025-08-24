#!/bin/bash

echo "🚀 GitHub Deployment für Manuel Weiss Website"
echo "=============================================="

# Prüfe Git Status
echo "📋 Prüfe Git Status..."
if [ -n "$(git status --porcelain)" ]; then
    echo "✅ Änderungen gefunden"
else
    echo "ℹ️  Keine neuen Änderungen"
    exit 0
fi

# Commit Änderungen
echo "💾 Committe Änderungen..."
git add .
git commit -m "✨ Neue Bewerbungen-Sektion mit interaktiver Bewerbungsmappe"

# Push zu GitHub
echo "📤 Push zu GitHub..."
echo "Hinweis: Du wirst nach deinen GitHub-Credentials gefragt"
echo "Verwende deinen Benutzernamen und das Personal Access Token als Passwort"
echo ""

git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment erfolgreich!"
    echo "🌐 Website: https://mawps.netlify.app"
    echo "📖 Bewerbungsmappe: https://mawps.netlify.app/bewerbungsmappe.html"
    echo ""
    echo "Netlify wird automatisch die Änderungen deployen..."
else
    echo ""
    echo "❌ Deployment fehlgeschlagen"
    echo "💡 Tipp: Stelle sicher, dass deine GitHub-Credentials korrekt sind"
    echo "🔗 Erstelle ein Personal Access Token unter: https://github.com/settings/tokens"
fi
