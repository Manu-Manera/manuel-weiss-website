#!/bin/bash

# Script zum Generieren eines AWS SES SMTP-Passworts
# Benötigt: Secret Access Key

set -e

echo "🔑 AWS SES SMTP-Passwort Generator"
echo "===================================="
echo ""

# Prüfe ob Python3 verfügbar ist
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 ist nicht installiert!"
    echo "Installiere Python3: brew install python3"
    exit 1
fi

# Frage nach Secret Access Key
echo "⚠️  WICHTIG: Der Secret Access Key wird NICHT gespeichert!"
echo ""
read -sp "Gib deinen AWS Secret Access Key ein: " SECRET_KEY
echo ""

if [ -z "$SECRET_KEY" ]; then
    echo "❌ Secret Access Key darf nicht leer sein!"
    exit 1
fi

echo ""
echo "🔄 Generiere SMTP-Passwort..."
echo ""

# Generiere SMTP-Passwort mit Python
SMTP_PASSWORD=$(python3 << EOF
import hmac
import hashlib
import base64

SECRET_ACCESS_KEY = "$SECRET_KEY"
MESSAGE = "SendRawEmail"
VERSION = b'\x04'

signature = hmac.new(
    key=("AWS4" + SECRET_ACCESS_KEY).encode('utf-8'),
    msg=MESSAGE.encode('utf-8'),
    digestmod=hashlib.sha256
).digest()

smtp_password = base64.b64encode(VERSION + signature).decode('utf-8')
print(smtp_password)
EOF
)

echo "✅ SMTP-Passwort generiert!"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📋 DEINE SMTP-EINSTELLUNGEN FÜR macOS MAIL.APP"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "E-Mail-Adresse: mail@manuel-weiss.de"
echo "SMTP Server: email-smtp.eu-central-1.amazonaws.com"
echo "SMTP Port: 587"
echo "Verschlüsselung: STARTTLS"
echo "Authentifizierung: Kennwort"
echo "Benutzername: [IHR_AWS_ACCESS_KEY_ID]"
echo "Passwort: $SMTP_PASSWORD"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "💡 Tipp: Kopiere das Passwort und füge es in Mail.app ein!"
echo ""
echo "📖 Vollständige Anleitung: siehe EMAIL_CLIENT_SETUP_MAC.md"
echo ""

