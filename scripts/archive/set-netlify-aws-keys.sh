#!/bin/bash

# Script zum Setzen der AWS Environment Variables in Netlify
# Site: mawps (f7afabf6-ce35-4e69-874a-753ea066cfa6)

set -e

echo "🔐 Netlify AWS Environment Variables Setzen"
echo "=============================================="
echo ""
echo "⚠️  WICHTIG: Stelle sicher, dass du die neuen AWS Keys bereits erstellt hast!"
echo ""

# Prüfe ob Netlify CLI verfügbar ist
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI nicht gefunden!"
    echo "Installiere mit: npm install -g netlify-cli"
    exit 1
fi

# Prüfe ob eingeloggt
if ! netlify status &> /dev/null; then
    echo "❌ Nicht bei Netlify eingeloggt!"
    echo "Bitte führe aus: netlify login"
    exit 1
fi

echo "✅ Netlify CLI gefunden und eingeloggt"
echo ""

# Frage nach den neuen AWS Keys
read -p "Gib deinen NEUEN AWS Access Key ID ein (beginnt mit AKIA...): " ACCESS_KEY_ID
if [ -z "$ACCESS_KEY_ID" ]; then
    echo "❌ Access Key ID darf nicht leer sein!"
    exit 1
fi

read -sp "Gib deinen NEUEN AWS Secret Access Key ein: " SECRET_ACCESS_KEY
echo ""
if [ -z "$SECRET_ACCESS_KEY" ]; then
    echo "❌ Secret Access Key darf nicht leer sein!"
    exit 1
fi

echo ""
echo "🔄 Setze Environment Variables in Netlify..."
echo ""

# Setze NETLIFY_AWS_ACCESS_KEY_ID (nicht als Secret)
echo "📝 Setze NETLIFY_AWS_ACCESS_KEY_ID..."
netlify env:set NETLIFY_AWS_ACCESS_KEY_ID "$ACCESS_KEY_ID" --context production
netlify env:set NETLIFY_AWS_ACCESS_KEY_ID "$ACCESS_KEY_ID" --context deploy-preview
netlify env:set NETLIFY_AWS_ACCESS_KEY_ID "$ACCESS_KEY_ID" --context branch-deploy

# Setze NETLIFY_AWS_SECRET_ACCESS_KEY (als Secret)
echo "🔒 Setze NETLIFY_AWS_SECRET_ACCESS_KEY (als Secret)..."
netlify env:set NETLIFY_AWS_SECRET_ACCESS_KEY "$SECRET_ACCESS_KEY" --secret --context production
netlify env:set NETLIFY_AWS_SECRET_ACCESS_KEY "$SECRET_ACCESS_KEY" --secret --context deploy-preview
netlify env:set NETLIFY_AWS_SECRET_ACCESS_KEY "$SECRET_ACCESS_KEY" --secret --context branch-deploy

echo ""
echo "✅ Environment Variables erfolgreich gesetzt!"
echo ""
echo "📋 Übersicht:"
echo "   - NETLIFY_AWS_ACCESS_KEY_ID: ${ACCESS_KEY_ID:0:10}..."
echo "   - NETLIFY_AWS_SECRET_ACCESS_KEY: [VERSTECKT]"
echo ""
echo "🚀 Nächste Schritte:"
echo "   1. Alten AWS Key in AWS Console deaktivieren"
echo "   2. Netlify Site neu deployen (oder warte auf automatisches Deploy)"
echo "   3. Teste die Anwendung"
echo ""
echo "💡 Tipp: Prüfe die Variables im Dashboard:"
echo "   https://app.netlify.com/sites/mawps/configuration/env"
