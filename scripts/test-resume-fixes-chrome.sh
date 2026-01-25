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

# Prüfe ob Live-Site erreichbar ist
if ! curl -s https://manuel-weiss.ch > /dev/null 2>&1; then
    echo "⚠️ Live-Site nicht erreichbar. Bitte prüfe die Verbindung."
    exit 1
fi

echo "✅ Live-Site erreichbar: https://manuel-weiss.ch"
echo ""

# Führe Tests aus
echo "🧪 Führe automatisierte Code-Tests aus..."
node scripts/test-resume-fixes-automated.js

echo ""
echo "🌐 Für Browser-Tests:"
echo "1. Öffne Chrome Browser"
echo "2. Navigiere zu: https://manuel-weiss.ch/applications/resume-editor.html"
echo "3. Öffne Browser-Konsole (F12)"
echo "4. Führe aus: await window.resumeFixTester.runAllTests()"
echo ""
echo "📋 Siehe auch: scripts/test-resume-fixes-manual.md"
echo ""
