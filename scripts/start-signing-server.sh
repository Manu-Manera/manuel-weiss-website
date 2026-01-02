#!/bin/bash
# Startet den Signing-Server im Hintergrund
# Usage: ./scripts/start-signing-server.sh

cd "$(dirname "$0")/.."

echo "🚀 Starte Signing-Server im Hintergrund..."
echo ""

# Prüfe ob Server bereits läuft
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Signing-Server läuft bereits auf Port 3001"
    echo ""
    echo "💡 Um Server zu stoppen:"
    echo "   lsof -ti:3001 | xargs kill"
    exit 0
fi

# Starte Server im Hintergrund
nohup node scripts/sign-challenge-server.js > /tmp/signing-server.log 2>&1 &

# Warte kurz
sleep 1

# Prüfe ob Server läuft
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Signing-Server gestartet!"
    echo "📋 Port: 3001"
    echo "📋 Logs: /tmp/signing-server.log"
    echo ""
    echo "💡 Um Server zu stoppen:"
    echo "   lsof -ti:3001 | xargs kill"
    echo ""
    echo "💡 Um Logs zu sehen:"
    echo "   tail -f /tmp/signing-server.log"
else
    echo "❌ Server konnte nicht gestartet werden"
    echo "📋 Prüfe Logs: /tmp/signing-server.log"
    exit 1
fi

