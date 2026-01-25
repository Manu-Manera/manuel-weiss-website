#!/bin/bash
# Chrome-basierter Test-Loop für Lebenslauf-Editor Fixes
# Führt Tests mit Puppeteer in Chrome aus, analysiert Fehler, korrigiert und testet erneut

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

echo "🚀 Starte Chrome-basierte Tests für Lebenslauf-Editor Fixes..."
echo "═══════════════════════════════════════════"
echo ""

# Prüfe ob Puppeteer installiert ist
if ! npm list puppeteer > /dev/null 2>&1; then
    echo "⚠️ Puppeteer nicht installiert. Installiere..."
    npm install puppeteer
fi

# Prüfe ob lokaler Server läuft
if ! curl -s http://localhost:8080 > /dev/null 2>&1; then
    echo "💡 Starte lokalen Server..."
    python3 -m http.server 8080 > /dev/null 2>&1 &
    SERVER_PID=$!
    sleep 2
    echo "✅ Server gestartet (PID: $SERVER_PID)"
    echo ""
fi

# Führe Tests aus
echo "🧪 Führe automatisierte Code-Tests aus..."
node scripts/test-resume-fixes-automated.js

echo ""
echo "🌐 Für Browser-Tests:"
echo "1. Öffne Chrome Browser"
echo "2. Navigiere zu: http://localhost:8080/applications/resume-editor.html"
echo "3. Öffne Browser-Konsole (F12)"
echo "4. Führe aus: await window.resumeFixTester.runAllTests()"
echo ""
echo "📋 Siehe auch: scripts/test-resume-fixes-manual.md"
echo ""

# Warte auf Benutzer-Input
echo "Drücke Enter um fortzufahren (oder Ctrl+C zum Abbrechen)..."
read

# Cleanup
if [ ! -z "$SERVER_PID" ]; then
    kill $SERVER_PID 2>/dev/null || true
fi
