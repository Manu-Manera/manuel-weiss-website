#!/bin/bash

# Schnell-Script: Bestehenden User zur Admin-Gruppe hinzufügen

USER_POOL_ID="eu-central-1_8gP4gLK9r"
REGION="eu-central-1"
GROUP_NAME="admin"

echo "🔐 Schnell-Setup: User zur Admin-Gruppe hinzufügen"
echo ""

# Zeige verfügbare User
echo "Verfügbare User:"
aws cognito-idp list-users \
  --user-pool-id "$USER_POOL_ID" \
  --region "$REGION" \
  --limit 10 \
  2>/dev/null | python3 -c "
import sys
import json
try:
    data = json.load(sys.stdin)
    users = data.get('Users', [])
    confirmed = [u for u in users if u.get('UserStatus') == 'CONFIRMED']
    if confirmed:
        print('Bestätigte User:')
        for i, user in enumerate(confirmed[:5], 1):
            attrs = {attr['Name']: attr['Value'] for attr in user.get('Attributes', [])}
            email = attrs.get('email', 'N/A')
            print(f'  {i}. {email}')
    else:
        print('Keine bestätigten User gefunden')
except:
    pass
"

echo ""
read -p "E-Mail-Adresse des Users eingeben: " USER_EMAIL

if [ -z "$USER_EMAIL" ]; then
    echo "❌ Keine E-Mail eingegeben"
    exit 1
fi

echo ""
echo "➕ Füge $USER_EMAIL zur Admin-Gruppe hinzu..."

aws cognito-idp admin-add-user-to-group \
  --user-pool-id "$USER_POOL_ID" \
  --username "$USER_EMAIL" \
  --group-name "$GROUP_NAME" \
  --region "$REGION" \
  2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ User wurde zur Admin-Gruppe hinzugefügt!"
    echo ""
    echo "📝 Du kannst dich jetzt anmelden mit:"
    echo "   E-Mail: $USER_EMAIL"
    echo "   Passwort: [dein aktuelles Passwort]"
    echo ""
    echo "🌐 Login-URL: https://mawps.netlify.app/admin-login.html"
else
    echo ""
    echo "❌ Fehler beim Hinzufügen zur Admin-Gruppe"
    echo "   Prüfe ob der User existiert und die E-Mail korrekt ist"
fi
