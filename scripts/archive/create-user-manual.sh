#!/bin/bash

# AWS Cognito Benutzer manuell erstellen
# Erstellt weiss-manuel@gmx.de in AWS Cognito

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

REGION="eu-central-1"
USER_POOL_ID="eu-central-1_8gP4gLK9r"
EMAIL="weiss-manuel@gmx.de"
FIRST_NAME="Manuel"
LAST_NAME="Weiss"

echo "👤 AWS Cognito Benutzer erstellen"
echo "================================="
echo ""
print_status "Region: $REGION"
print_status "User Pool ID: $USER_POOL_ID"
print_status "E-Mail: $EMAIL"
print_status "Name: $FIRST_NAME $LAST_NAME"
echo ""

# Prüfe AWS CLI
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI ist nicht installiert"
    exit 1
fi

# Prüfe AWS Credentials
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS Credentials nicht konfiguriert"
    exit 1
fi

# Prüfe ob Benutzer bereits existiert
print_status "Prüfe ob Benutzer bereits existiert..."
if aws cognito-idp admin-get-user \
    --user-pool-id "$USER_POOL_ID" \
    --username "$EMAIL" \
    --region "$REGION" &> /dev/null; then
    print_warning "Benutzer existiert bereits!"
    print_status "Benutzer-Informationen:"
    aws cognito-idp admin-get-user \
        --user-pool-id "$USER_POOL_ID" \
        --username "$EMAIL" \
        --region "$REGION" \
        --output json | jq '.'
    exit 0
fi

# Frage nach Passwort
echo ""
read -sp "Passwort für Benutzer eingeben (min. 8 Zeichen, Groß-/Kleinbuchstaben, Zahlen): " PASSWORD
echo ""
read -sp "Passwort bestätigen: " PASSWORD_CONFIRM
echo ""

if [ "$PASSWORD" != "$PASSWORD_CONFIRM" ]; then
    print_error "Passwörter stimmen nicht überein"
    exit 1
fi

if [ ${#PASSWORD} -lt 8 ]; then
    print_error "Passwort muss mindestens 8 Zeichen lang sein"
    exit 1
fi

# Erstelle Benutzer
print_status "Erstelle Benutzer..."
RESULT=$(aws cognito-idp admin-create-user \
    --user-pool-id "$USER_POOL_ID" \
    --username "$EMAIL" \
    --user-attributes \
        Name=email,Value="$EMAIL" \
        Name=email_verified,Value=true \
        Name=given_name,Value="$FIRST_NAME" \
        Name=family_name,Value="$LAST_NAME" \
    --message-action SUPPRESS \
    --region "$REGION" \
    --output json 2>&1)

if [ $? -eq 0 ]; then
    print_success "Benutzer erfolgreich erstellt!"
    echo "$RESULT" | jq '.'
    
    # Setze Passwort
    print_status "Setze Passwort..."
    aws cognito-idp admin-set-user-password \
        --user-pool-id "$USER_POOL_ID" \
        --username "$EMAIL" \
        --password "$PASSWORD" \
        --permanent \
        --region "$REGION" &> /dev/null
    
    print_success "Passwort erfolgreich gesetzt!"
    
    # Aktiviere Benutzer
    print_status "Aktiviere Benutzer..."
    aws cognito-idp admin-enable-user \
        --user-pool-id "$USER_POOL_ID" \
        --username "$EMAIL" \
        --region "$REGION" &> /dev/null
    
    print_success "Benutzer erfolgreich aktiviert!"
    
    echo ""
    print_success "✅ Benutzer $EMAIL wurde erfolgreich erstellt und aktiviert!"
    print_status "Sie können sich jetzt auf der Webseite anmelden."
else
    print_error "Fehler beim Erstellen des Benutzers:"
    echo "$RESULT"
    exit 1
fi

echo ""

