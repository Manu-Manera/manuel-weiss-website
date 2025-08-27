#!/bin/bash

echo "🚀 Einfaches Deployment ohne Probleme"
echo "===================================="

# 1. Alle Git-Probleme ignorieren und neu starten
echo "🔄 Starte frisch..."
rm -rf .git
git init
git remote add origin https://github.com/Manu-Manera/manuel-weiss-website.git

# 2. Bewerbungsmappe sicherstellen
echo "📄 Prüfe Bewerbungsmappe..."
if [ ! -f bewerbungsmappe.html ]; then
    echo "❌ bewerbungsmappe.html fehlt!"
    exit 1
fi

# 3. Styles.css bereinigen
echo "🎨 Bereinige Styles..."
# Entferne alle Merge-Konflikt-Marker
sed -i '' '/^<<<<<<< HEAD$/,/^>>>>>>> /d' styles.css 2>/dev/null
sed -i '' '/^=======$/d' styles.css 2>/dev/null

# 4. Alles committen
echo "💾 Committe alles..."
git add .
git commit -m "✨ Bewerbungsmappe hinzugefügt"

# 5. Force Push (überschreibt alles auf GitHub)
echo "📤 Force Push zu GitHub..."
git push -f origin main

echo ""
echo "🎉 Fertig! Deployment abgeschlossen!"
echo "🌐 Website: https://mawps.netlify.app"
echo "📖 Bewerbungsmappe: https://mawps.netlify.app/bewerbungsmappe.html"
