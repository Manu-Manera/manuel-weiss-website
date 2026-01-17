#!/bin/bash

# Script zum Erstellen eines Admin-Users in AWS Cognito
# und Hinzufügen zur Admin-Gruppe

set -e

USER_POOL_ID="eu-central-1_8gP4gLK9r"
REGION="eu-central-1"
GROUP_NAME="admin"

echo "🔐 Admin-User Setup für Manuel Weiss Website"
echo "=============================================="
echo ""

# Prüfe ob Admin-User bereits existiert
read -p "E-Mail-Adresse für Admin-User eingeben: " ADMIN_EMAIL
read -sp "Passwort für Admin-User eingeben (min. 8 Zeichen, Groß-/Kleinbuchstaben, Zahlen): " ADMIN_PASSWORD
echo ""

# Prüfe ob User bereits existiert
echo "📋 Prüfe ob User bereits existiert..."
EXISTING_USER=$(aws cognito-idp list-users \
  --user-pool-id "$USER_POOL_ID" \
  --filter "email=\"$ADMIN_EMAIL\"" \
  --region "$REGION" \
  2>/dev/null | grep -o '"Username": "[^"]*"' | head -1 | cut -d'"' -f4 || echo "")

if [ -n "$EXISTING_USER" ]; then
    echo "✅ User existiert bereits: $EXISTING_USER"
    USERNAME="$EXISTING_USER"
    
    # Prüfe ob User bereits in Admin-Gruppe ist
    echo "📋 Prüfe ob User bereits in Admin-Gruppe ist..."
    IN_GROUP=$(aws cognito-idp admin-list-groups-for-user \
      --user-pool-id "$USER_POOL_ID" \
      --username "$USERNAME" \
      --region "$REGION" \
      2>/dev/null | grep -o "\"$GROUP_NAME\"" || echo "")
    
    if [ -n "$IN_GROUP" ]; then
        echo "✅ User ist bereits in Admin-Gruppe"
        echo ""
        echo "🎉 Setup abgeschlossen! User kann sich jetzt anmelden."
        exit 0
    else
        echo "➕ Füge User zur Admin-Gruppe hinzu..."
        aws cognito-idp admin-add-user-to-group \
          --user-pool-id "$USER_POOL_ID" \
          --username "$USERNAME" \
          --group-name "$GROUP_NAME" \
          --region "$REGION"
        echo "✅ User wurde zur Admin-Gruppe hinzugefügt"
        echo ""
        echo "🎉 Setup abgeschlossen! User kann sich jetzt anmelden."
        exit 0
    fi
else
    echo "➕ Erstelle neuen Admin-User..."
    
    # Erstelle User
    CREATE_RESULT=$(aws cognito-idp admin-create-user \
      --user-pool-id "$USER_POOL_ID" \
      --username "$ADMIN_EMAIL" \
      --user-attributes Name=email,Value="$ADMIN_EMAIL" Name=email_verified,Value=true \
      --message-action SUPPRESS \
      --region "$REGION" \
      2>&1)
    
    if [ $? -eq 0 ]; then
        USERNAME=$(echo "$CREATE_RESULT" | grep -o '"Username": "[^"]*"' | head -1 | cut -d'"' -f4)
        echo "✅ User erstellt: $USERNAME"
        
        # Setze permanentes Passwort
        echo "🔑 Setze Passwort..."
        aws cognito-idp admin-set-user-password \
          --user-pool-id "$USER_POOL_ID" \
          --username "$USERNAME" \
          --password "$ADMIN_PASSWORD" \
          --permanent \
          --region "$REGION" \
          2>&1
        
        if [ $? -eq 0 ]; then
            echo "✅ Passwort gesetzt"
        else
            echo "⚠️  Passwort konnte nicht gesetzt werden. Bitte manuell setzen."
        fi
        
        # Füge User zur Admin-Gruppe hinzu
        echo "➕ Füge User zur Admin-Gruppe hinzu..."
        aws cognito-idp admin-add-user-to-group \
          --user-pool-id "$USER_POOL_ID" \
          --username "$USERNAME" \
          --group-name "$GROUP_NAME" \
          --region "$REGION"
        
        echo "✅ User wurde zur Admin-Gruppe hinzugefügt"
        echo ""
        echo "🎉 Setup abgeschlossen!"
        echo ""
        echo "📝 Login-Daten:"
        echo "   E-Mail: $ADMIN_EMAIL"
        echo "   Passwort: [wie eingegeben]"
        echo ""
        echo "🌐 Login-URL: https://mawps.netlify.app/admin-login.html"
    else
        echo "❌ Fehler beim Erstellen des Users:"
        echo "$CREATE_RESULT"
        exit 1
    fi
fi

