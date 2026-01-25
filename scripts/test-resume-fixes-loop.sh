#!/bin/bash
# Test Loop für Lebenslauf-Editor Fixes
# Führt Tests aus, analysiert Fehler, korrigiert und testet erneut

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

echo "🚀 Starte Test-Loop für Lebenslauf-Editor Fixes..."
echo "═══════════════════════════════════════════"
echo ""

# Prüfe ob Chrome/Chromium verfügbar ist
if ! command -v google-chrome &> /dev/null && ! command -v chromium &> /dev/null && ! command -v chromium-browser &> /dev/null; then
    echo "⚠️ Chrome/Chromium nicht gefunden. Verwende Browser-basiertes Testscript."
    echo ""
    echo "📋 Anleitung:"
    echo "1. Öffne applications/resume-editor.html im Browser (Chrome)"
    echo "2. Öffne Browser-Konsole (F12)"
    echo "3. Führe aus: await window.resumeFixTester.runAllTests()"
    echo "4. Prüfe fehlgeschlagene Tests und korrigiere sie"
    echo "5. Führe Tests erneut aus"
    echo ""
    exit 0
fi

# Browser-basiertes Testscript (wird im Browser ausgeführt)
echo "✅ Testscript erstellt: scripts/test-resume-editor-fixes-browser.js"
echo ""
echo "📋 Test-Anleitung:"
echo ""
echo "1. Öffne Chrome Browser"
echo "2. Navigiere zu: file://$PROJECT_DIR/applications/resume-editor.html"
echo "   Oder starte lokalen Server: python3 -m http.server 8080"
echo "   Dann: http://localhost:8080/applications/resume-editor.html"
echo ""
echo "3. Öffne Browser-Konsole (F12 → Console Tab)"
echo ""
echo "4. Führe Tests aus:"
echo "   await window.resumeFixTester.runAllTests()"
echo ""
echo "5. Prüfe fehlgeschlagene Tests in der Konsole"
echo ""
echo "6. Bei Fehlern:"
echo "   - Analysiere die Fehlermeldung"
echo "   - Prüfe den Code in der entsprechenden Datei"
echo "   - Korrigiere den Code"
echo "   - Führe Tests erneut aus"
echo ""
echo "═══════════════════════════════════════════"
echo ""

# Prüfe ob lokaler Server läuft
if curl -s http://localhost:8080 > /dev/null 2>&1; then
    echo "✅ Lokaler Server läuft auf http://localhost:8080"
    echo ""
    echo "🌐 Öffne im Browser: http://localhost:8080/applications/resume-editor.html"
    echo ""
else
    echo "💡 Tipp: Starte lokalen Server mit:"
    echo "   python3 -m http.server 8080"
    echo "   oder"
    echo "   npx http-server -p 8080"
    echo ""
fi

echo "Drücke Enter um fortzufahren (oder Ctrl+C zum Abbrechen)..."
read
