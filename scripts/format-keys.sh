#!/bin/bash
# Formatiert alle Keys für Postman
# Usage: ./scripts/format-keys.sh [apiKeyId]

cd "$(dirname "$0")/.."

if [ -z "$1" ]; then
    # Keine API Key ID angegeben - finde die neueste
    echo "🔍 Suche neueste Key-Dateien..."
    
    if [ ! -d "keys" ]; then
        echo "❌ Keys-Verzeichnis existiert nicht"
        echo "💡 Generiere neue Keys mit: node scripts/generate-keypair.js"
        exit 1
    fi
    
    # Finde neueste Public Key Datei
    LATEST_PUBLIC=$(ls -t keys/*-public-key.pem 2>/dev/null | head -1)
    LATEST_PRIVATE=$(ls -t keys/*-private-key.pem 2>/dev/null | head -1)
    
    if [ -z "$LATEST_PUBLIC" ]; then
        echo "❌ Keine Public Key Dateien gefunden"
        echo "💡 Generiere neue Keys mit: node scripts/generate-keypair.js"
        exit 1
    fi
    
    # Extrahiere API Key ID aus Dateinamen
    API_KEY_ID=$(basename "$LATEST_PUBLIC" | sed 's/-public-key.pem$//')
    
    echo "✅ Gefunden: API Key ID = $API_KEY_ID"
    echo ""
else
    API_KEY_ID="$1"
    LATEST_PUBLIC="keys/${API_KEY_ID}-public-key.pem"
    LATEST_PRIVATE="keys/${API_KEY_ID}-private-key.pem"
fi

# Prüfe ob Dateien existieren
if [ ! -f "$LATEST_PUBLIC" ]; then
    echo "❌ Public Key nicht gefunden: $LATEST_PUBLIC"
    exit 1
fi

if [ ! -f "$LATEST_PRIVATE" ]; then
    echo "❌ Private Key nicht gefunden: $LATEST_PRIVATE"
    exit 1
fi

echo "📋 Formatiere Keys für Postman..."
echo ""

# Formatiere Public Key
echo "🔓 Public Key:"
echo "─".repeat(60)
node scripts/format-key-for-postman.js "$LATEST_PUBLIC"
echo ""

# Formatiere Private Key
echo "🔐 Private Key:"
echo "─".repeat(60)
node scripts/format-key-for-postman.js "$LATEST_PRIVATE"
echo ""

echo "✅ Beide Keys formatiert!"
echo ""
echo "📋 Für Postman:"
echo "1. Setze apiKeyId: $API_KEY_ID"
echo "2. Setze publicKey: (siehe oben - wurde in Zwischenablage kopiert)"
echo "3. Setze privateKey: (siehe oben - wurde in Zwischenablage kopiert)"

