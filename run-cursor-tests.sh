#!/bin/bash
# Cursor Test System - Sofortige Rückmeldung für Cursor AI

echo "🚀 CURSOR TEST SYSTEM GESTARTET"
echo "================================"

# Node.js Test-System ausführen
echo "📊 Führe Cursor Feedback System aus..."
node tests/cursor-feedback.js

# Ergebnisse anzeigen
echo ""
echo "📄 FEEDBACK-ERGEBNISSE:"
echo "======================"

if [ -f "cursor-feedback.json" ]; then
    echo "✅ Feedback-Datei erstellt: cursor-feedback.json"
    
    # JSON-Ergebnisse parsen und anzeigen
    echo ""
    echo "🔍 KRITISCHE PROBLEME:"
    cat cursor-feedback.json | jq -r '.errors[] | select(.type | contains("CRITICAL")) | "❌ " + .message' 2>/dev/null || echo "✅ Keine kritischen Probleme gefunden"
    
    echo ""
    echo "⚠️  WARNUNGEN:"
    cat cursor-feedback.json | jq -r '.warnings[] | "⚠️  " + .message' 2>/dev/null || echo "✅ Keine Warnungen"
    
    echo ""
    echo "✅ ERFOLGREICHE TESTS:"
    cat cursor-feedback.json | jq -r '.tests[] | select(.status == "PASS") | "✅ " + .name' 2>/dev/null | head -10
    
    echo ""
    echo "❌ FEHLGESCHLAGENE TESTS:"
    cat cursor-feedback.json | jq -r '.tests[] | select(.status == "FAIL") | "❌ " + .name' 2>/dev/null || echo "✅ Alle Tests bestanden"
    
else
    echo "❌ Feedback-Datei konnte nicht erstellt werden"
fi

echo ""
echo "🎯 NÄCHSTE SCHRITTE FÜR CURSOR:"
echo "=============================="
echo "1. Kritische Probleme sofort beheben"
echo "2. Warnungen überprüfen und beheben"
echo "3. Fehlgeschlagene Tests reparieren"
echo "4. System kontinuierlich überwachen"

echo ""
echo "📊 Test-System läuft alle 6 Stunden automatisch"
echo "🔄 Für sofortige Tests: ./run-cursor-tests.sh"
echo "🤖 Cursor AI erhält automatisches Feedback"
