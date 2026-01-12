#!/bin/bash
# Interaktives Script zum Setzen der AWS Keys in Netlify Environment Variables

echo "🔐 Netlify AWS Environment Variables setzen"
echo ""
echo "Dieses Script setzt die AWS Credentials in Netlify Environment Variables."
echo ""

# Access Key ID (bereits bekannt)
ACCESS_KEY_ID="AKIAQR3HB4M3HSW7LW6E"

echo "Access Key ID: $ACCESS_KEY_ID"
echo ""
read -sp "AWS Secret Access Key: " SECRET_ACCESS_KEY
echo ""
echo ""

# Prüfe ob netlify CLI installiert ist
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI ist nicht installiert!"
    echo "   Installiere es mit: npm install -g netlify-cli"
    exit 1
fi

# Prüfe ob eingeloggt
if ! netlify status &> /dev/null; then
    echo "⚠️  Du bist nicht bei Netlify eingeloggt."
    echo "   Bitte logge dich ein mit: netlify login"
    exit 1
fi

echo "📦 Setze Environment Variables in Netlify..."
echo ""

# Setze für alle Kontexte (production, branch, deploy-preview)
for context in production branch deploy-preview; do
    echo "🔧 Setze für Kontext: $context"
    
    # Access Key ID (nicht secret)
    netlify env:set NETLIFY_AWS_ACCESS_KEY_ID "$ACCESS_KEY_ID" --context $context 2>&1 | grep -v "Warning:"
    
    # Secret Access Key (als secret markiert)
    echo "$SECRET_ACCESS_KEY" | netlify env:set NETLIFY_AWS_SECRET_ACCESS_KEY --context $context --secret 2>&1 | grep -v "Warning:"
    
    # Region
    netlify env:set NETLIFY_AWS_REGION "eu-central-1" --context $context 2>&1 | grep -v "Warning:"
    
    echo "✅ $context konfiguriert"
    echo ""
done

echo "🎉 Alle Environment Variables wurden gesetzt!"
echo ""
echo "📋 Übersicht:"
netlify env:list 2>&1 | grep -E "(NETLIFY_AWS|AWS)" | head -10

echo ""
echo "💡 Nächste Schritte:"
echo "   1. Gehe zu Netlify Dashboard → Deploys"
echo "   2. Klicke auf 'Trigger deploy' → 'Clear cache and deploy site'"
echo "   3. Warte bis das Deployment abgeschlossen ist"
echo "   4. Teste die hero-video-settings Function"
