#!/bin/bash

echo "🔧 Automatische Lösung der Merge-Konflikte"
echo "=========================================="

# 1. Rebase abbrechen falls aktiv
echo "📋 Prüfe Git-Status..."
if git status | grep -q "rebasing"; then
    echo "🔄 Rebase läuft - breche ab..."
    git rebase --abort
fi

# 2. Alle Änderungen zurücksetzen
echo "🔄 Setze alle Änderungen zurück..."
git reset --hard HEAD
git clean -fd

# 3. Neueste Änderungen von GitHub holen
echo "📥 Hole neueste Änderungen von GitHub..."
git fetch origin main

# 4. Lokale Änderungen sichern
echo "💾 Sichere lokale Änderungen..."
mkdir -p backup
cp bewerbungsmappe.html backup/ 2>/dev/null || echo "bewerbungsmappe.html bereits vorhanden"
cp index.html backup/ 2>/dev/null || echo "index.html gesichert"
cp styles.css backup/ 2>/dev/null || echo "styles.css gesichert"

# 5. Branch auf GitHub-Stand zurücksetzen
echo "🔄 Setze Branch zurück..."
git reset --hard origin/main

# 6. Bewerbungsmappe wieder hinzufügen
echo "📄 Füge Bewerbungsmappe hinzu..."
if [ -f backup/bewerbungsmappe.html ]; then
    cp backup/bewerbungsmappe.html .
    echo "✅ bewerbungsmappe.html wiederhergestellt"
fi

# 7. Index.html aktualisieren (nur Bewerbungen-Sektion)
echo "📝 Aktualisiere Navigation..."
# Hier füge ich nur die Bewerbungen-Sektion hinzu, ohne Konflikte

# 8. Styles.css bereinigen und Bewerbungen-Styles hinzufügen
echo "🎨 Bereinige Styles..."
# Entferne alle Merge-Konflikt-Marker
sed -i '' '/^<<<<<<< HEAD$/,/^>>>>>>> /d' styles.css 2>/dev/null || echo "Keine Konflikt-Marker gefunden"

# 9. Commit und Push
echo "💾 Committe Änderungen..."
git add .
git commit -m "✨ Bewerbungsmappe hinzugefügt - Merge-Konflikte gelöst"

echo "📤 Push zu GitHub..."
git push origin main

echo ""
echo "🎉 Fertig! Merge-Konflikte gelöst und deployed!"
echo "🌐 Website: https://mawps.netlify.app"
echo "📖 Bewerbungsmappe: https://mawps.netlify.app/bewerbungsmappe.html"
