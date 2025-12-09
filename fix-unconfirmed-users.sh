#!/bin/bash

# Script zum Beheben von unbestätigten Benutzern
# Optionen: Manuell bestätigen oder E-Mail-Adresse in SES verifizieren

USER_POOL_ID="eu-central-1_8gP4gLK9r"
REGION="eu-central-1"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🔧 Unbestätigte Benutzer beheben"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Liste aller unbestätigten Benutzer
echo "📋 Unbestätigte Benutzer:"
UNCONFIRMED=$(aws cognito-idp list-users \
  --user-pool-id "$USER_POOL_ID" \
  --region "$REGION" \
  --filter "status = \"UNCONFIRMED\"" \
  --output json 2>&1)

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Fehler beim Abrufen der Benutzer${NC}"
    exit 1
fi

USER_COUNT=$(echo "$UNCONFIRMED" | python3 -c "import sys, json; d=json.load(sys.stdin); print(len(d.get('Users', [])))" 2>/dev/null || echo "0")

if [ "$USER_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✅ Keine unbestätigten Benutzer gefunden${NC}"
    exit 0
fi

echo "$UNCONFIRMED" | python3 -c "
import sys, json
d = json.load(sys.stdin)
users = d.get('Users', [])
print(f'Gefunden: {len(users)} unbestätigte Benutzer')
print('')
for i, u in enumerate(users[:10], 1):
    email = [attr.get('Value') for attr in u.get('Attributes', []) if attr.get('Name') == 'email']
    email = email[0] if email else 'N/A'
    username = u.get('Username', 'N/A')
    created = u.get('UserCreateDate', 'N/A')
    print(f'{i}. E-Mail: {email}')
    print(f'   Username: {username}')
    print(f'   Erstellt: {created}')
    print('')
"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "Optionen:"
echo ""
echo "1. Benutzer manuell bestätigen (empfohlen für Test-Benutzer)"
echo "2. E-Mail-Adresse in SES verifizieren (für echte Benutzer)"
echo "3. Bestätigungscode erneut senden (nur wenn E-Mail in SES verifiziert)"
echo ""
read -p "Wählen Sie eine Option (1-3): " option

case $option in
    1)
        echo ""
        read -p "E-Mail-Adresse des Benutzers (oder 'all' für alle): " email
        if [ "$email" = "all" ]; then
            echo "$UNCONFIRMED" | python3 -c "
import sys, json
import subprocess
d = json.load(sys.stdin)
users = d.get('Users', [])
for u in users:
    email = [attr.get('Value') for attr in u.get('Attributes', []) if attr.get('Name') == 'email']
    if email:
        email = email[0]
        username = u.get('Username')
        print(f'Bestätige: {email}...')
        result = subprocess.run([
            'aws', 'cognito-idp', 'admin-confirm-sign-up',
            '--user-pool-id', 'eu-central-1_8gP4gLK9r',
            '--username', username,
            '--region', 'eu-central-1'
        ], capture_output=True, text=True)
        if result.returncode == 0:
            print(f'✅ {email} bestätigt')
        else:
            print(f'❌ Fehler bei {email}: {result.stderr}')
"
        else
            USERNAME=$(echo "$UNCONFIRMED" | python3 -c "
import sys, json
d = json.load(sys.stdin)
users = d.get('Users', [])
for u in users:
    email_attr = [attr.get('Value') for attr in u.get('Attributes', []) if attr.get('Name') == 'email']
    if email_attr and email_attr[0] == '$email':
        print(u.get('Username'))
        break
")
            if [ -z "$USERNAME" ]; then
                echo -e "${RED}❌ Benutzer mit E-Mail $email nicht gefunden${NC}"
                exit 1
            fi
            aws cognito-idp admin-confirm-sign-up \
                --user-pool-id "$USER_POOL_ID" \
                --username "$USERNAME" \
                --region "$REGION" && \
                echo -e "${GREEN}✅ Benutzer $email manuell bestätigt${NC}" || \
                echo -e "${RED}❌ Fehler beim Bestätigen${NC}"
        fi
        ;;
    2)
        echo ""
        read -p "E-Mail-Adresse zum Verifizieren: " email
        echo "Verifiziere E-Mail-Adresse in SES..."
        aws sesv2 create-email-identity \
            --email-identity "$email" \
            --region "$REGION" && \
            echo -e "${GREEN}✅ Verifizierungs-E-Mail wurde an $email gesendet${NC}" || \
            echo -e "${RED}❌ Fehler beim Erstellen der Identität${NC}"
        echo ""
        echo "Bitte prüfen Sie Ihr E-Mail-Postfach und klicken Sie auf den Verifizierungs-Link."
        ;;
    3)
        echo ""
        read -p "E-Mail-Adresse: " email
        USERNAME=$(echo "$UNCONFIRMED" | python3 -c "
import sys, json
d = json.load(sys.stdin)
users = d.get('Users', [])
for u in users:
    email_attr = [attr.get('Value') for attr in u.get('Attributes', []) if attr.get('Name') == 'email']
    if email_attr and email_attr[0] == '$email':
        print(u.get('Username'))
        break
")
        if [ -z "$USERNAME" ]; then
            echo -e "${RED}❌ Benutzer mit E-Mail $email nicht gefunden${NC}"
            exit 1
        fi
        echo "Sende Bestätigungscode erneut..."
        aws cognito-idp resend-confirmation-code \
            --client-id 7kc5tt6a23fgh53d60vkefm812 \
            --username "$email" \
            --region "$REGION" && \
            echo -e "${GREEN}✅ Bestätigungscode wurde erneut gesendet${NC}" || \
            echo -e "${RED}❌ Fehler beim Senden des Codes${NC}"
        ;;
    *)
        echo -e "${RED}❌ Ungültige Option${NC}"
        exit 1
        ;;
esac

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ Fertig!"

