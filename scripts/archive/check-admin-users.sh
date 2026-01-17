#!/bin/bash

# Script zum Prüfen vorhandener Admin-User

USER_POOL_ID="eu-central-1_8gP4gLK9r"
REGION="eu-central-1"
GROUP_NAME="admin"

echo "🔍 Prüfe Admin-User..."
echo ""

# Prüfe User in Admin-Gruppe
echo "=== User in Admin-Gruppe ==="
ADMIN_USERS=$(aws cognito-idp list-users-in-group \
  --user-pool-id "$USER_POOL_ID" \
  --group-name "$GROUP_NAME" \
  --region "$REGION" \
  2>/dev/null)

if [ $? -eq 0 ] && echo "$ADMIN_USERS" | grep -q "Users"; then
    echo "$ADMIN_USERS" | python3 -c "
import sys
import json
try:
    data = json.load(sys.stdin)
    users = data.get('Users', [])
    if users:
        for user in users:
            username = user.get('Username', 'N/A')
            attrs = {attr['Name']: attr['Value'] for attr in user.get('Attributes', [])}
            email = attrs.get('email', 'N/A')
            status = user.get('UserStatus', 'N/A')
            print(f'✅ Email: {email}')
            print(f'   Username: {username}')
            print(f'   Status: {status}')
            print('')
    else:
        print('⚠️  Keine User in Admin-Gruppe')
except Exception as e:
    print(f'Fehler beim Parsen: {e}')
" 2>/dev/null || echo "$ADMIN_USERS"
else
    echo "⚠️  Keine User in Admin-Gruppe gefunden"
    echo ""
    echo "📝 Um einen Admin-User zu erstellen, führe aus:"
    echo "   ./create-admin-user.sh"
fi

echo ""
echo "=== Alle User im Pool ==="
ALL_USERS=$(aws cognito-idp list-users \
  --user-pool-id "$USER_POOL_ID" \
  --region "$REGION" \
  --limit 10 \
  2>/dev/null)

if [ $? -eq 0 ] && echo "$ALL_USERS" | grep -q "Users"; then
    echo "$ALL_USERS" | python3 -c "
import sys
import json
try:
    data = json.load(sys.stdin)
    users = data.get('Users', [])
    if users:
        print(f'Gefunden: {len(users)} User(s)')
        for user in users:
            username = user.get('Username', 'N/A')
            attrs = {attr['Name']: attr['Value'] for attr in user.get('Attributes', [])}
            email = attrs.get('email', 'N/A')
            status = user.get('UserStatus', 'N/A')
            print(f'  - {email} ({status})')
    else:
        print('Keine User gefunden')
except Exception as e:
    print(f'Fehler: {e}')
" 2>/dev/null || echo "Konnte User-Liste nicht abrufen"
fi

