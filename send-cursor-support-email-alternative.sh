#!/bin/bash
# Alternative: Sendet E-Mail über SMTP oder zeigt Anleitung

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📧 E-Mail-Versand an Cursor Support"
echo "===================================="
echo ""
echo "⚠️  AWS SES ist im Sandbox-Modus"
echo "   → Kann nur an verifizierte E-Mail-Adressen senden"
echo "   → support@cursor.sh ist nicht verifiziert"
echo ""
echo "✅ ALTERNATIVE METHODEN:"
echo ""
echo "1. MANUELL ÜBER E-MAIL-CLIENT:"
echo "   - Öffnen Sie Ihr E-Mail-Programm (Mail, Outlook, etc.)"
echo "   - Erstellen Sie eine neue E-Mail"
echo "   - An: support@cursor.sh"
echo "   - Betreff: KRITISCHE BESCHWERDE - Unzureichende AI-Leistung..."
echo "   - Kopieren Sie den Inhalt aus: CURSOR_SUPPORT_BESCHWERDE.md"
echo ""
echo "2. ÜBER CURSOR SUPPORT-PORTAL:"
echo "   - Gehen Sie zu: https://cursor.sh/support"
echo "   - Erstellen Sie ein Support-Ticket"
echo "   - Kopieren Sie den Inhalt aus: CURSOR_SUPPORT_BESCHWERDE.md"
echo ""
echo "3. AWS SES PRODUCTION ACCESS BEANTRAGEN:"
echo "   - Führen Sie aus: ./request-ses-production-access.sh"
echo "   - Warten Sie auf AWS-Genehmigung (meist 24-48h)"
echo "   - Dann können Sie an beliebige E-Mail-Adressen senden"
echo ""
echo "📄 E-Mail-Inhalt befindet sich in: CURSOR_SUPPORT_BESCHWERDE.md"
echo ""

# Zeige E-Mail-Inhalt
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "E-MAIL-INHALT (zum Kopieren):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
cat CURSOR_SUPPORT_BESCHWERDE.md | \
    sed 's/\*\*//g' | \
    sed 's/^---$//' | \
    sed 's/^\[Ihr Name\]/Manuel Weiss/' | \
    sed "s/^\[Ihre E-Mail-Adresse\]/weiss-manuel@gmx.de/" | \
    sed 's/^\[Ihre Kundennummer, falls vorhanden\]//' | \
    sed "s/\$(date '+%Y-%m-%d')/$(date '+%Y-%m-%d')/"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

