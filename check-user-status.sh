#!/bin/bash

# AWS Cognito Benutzer-Status Prüfung
# Prüft ob weiss-manuel@gmx.de in AWS Cognito existiert

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

echo "🔍 AWS Cognito Benutzer-Status Prüfung"
echo "======================================"
echo ""
print_status "Region: $REGION"
print_status "User Pool ID: $USER_POOL_ID"
print_status "E-Mail: $EMAIL"
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

# 1. Prüfe ob Benutzer existiert
echo "📋 Schritt 1: Benutzer-Existenz prüfen"
echo "--------------------------------------"

# Versuche Benutzer zu finden (mit verschiedenen Methoden)
USER_FOUND=false

# Methode 1: Suche nach E-Mail
print_status "Suche nach E-Mail: $EMAIL"
USERS=$(aws cognito-idp list-users \
    --user-pool-id "$USER_POOL_ID" \
    --filter "email=\"$EMAIL\"" \
    --region "$REGION" \
    --query 'Users[*].[Username,UserStatus,Attributes]' \
    --output json 2>/dev/null || echo "[]")

if [ "$USERS" != "[]" ] && [ -n "$USERS" ]; then
    print_success "Benutzer gefunden!"
    echo "$USERS" | jq '.'
    USER_FOUND=true
else
    print_warning "Benutzer nicht über E-Mail-Filter gefunden"
fi

# Methode 2: Suche nach Username (E-Mail als Username)
print_status "Suche nach Username: $EMAIL"
if aws cognito-idp admin-get-user \
    --user-pool-id "$USER_POOL_ID" \
    --username "$EMAIL" \
    --region "$REGION" &> /dev/null; then
    print_success "Benutzer gefunden über Username!"
    USER_INFO=$(aws cognito-idp admin-get-user \
        --user-pool-id "$USER_POOL_ID" \
        --username "$EMAIL" \
        --region "$REGION" \
        --output json)
    
    echo "$USER_INFO" | jq '.'
    USER_FOUND=true
else
    print_warning "Benutzer nicht über Username gefunden"
fi

echo ""

# 2. Wenn Benutzer nicht gefunden, zeige alle Benutzer
if [ "$USER_FOUND" = false ]; then
    echo "📋 Schritt 2: Alle Benutzer auflisten"
    echo "--------------------------------------"
    print_status "Zeige alle Benutzer im User Pool..."
    
    ALL_USERS=$(aws cognito-idp list-users \
        --user-pool-id "$USER_POOL_ID" \
        --region "$REGION" \
        --query 'Users[*].[Username,UserStatus]' \
        --output json 2>/dev/null || echo "[]")
    
    if [ "$ALL_USERS" != "[]" ]; then
        echo "$ALL_USERS" | jq '.'
        print_warning "Benutzer $EMAIL wurde nicht gefunden!"
        print_status "Mögliche Ursachen:"
        print_status "  1. Benutzer wurde noch nicht registriert"
        print_status "  2. E-Mail-Adresse ist anders geschrieben"
        print_status "  3. Benutzer wurde gelöscht"
    else
        print_warning "Keine Benutzer im User Pool gefunden"
    fi
    echo ""
fi

# 3. Zusammenfassung
echo "📊 Zusammenfassung"
echo "=================="
if [ "$USER_FOUND" = true ]; then
    print_success "✅ Benutzer $EMAIL existiert in AWS Cognito"
    print_status "Nächste Schritte:"
    print_status "  1. Prüfe ob E-Mail bestätigt ist"
    print_status "  2. Prüfe ob Benutzer aktiviert ist"
    print_status "  3. Teste Login mit korrektem Passwort"
else
    print_error "❌ Benutzer $EMAIL wurde nicht gefunden"
    print_status "Nächste Schritte:"
    print_status "  1. Benutzer registrieren über die Webseite"
    print_status "  2. Oder Benutzer manuell erstellen:"
    print_status "     aws cognito-idp admin-create-user \\"
    print_status "       --user-pool-id $USER_POOL_ID \\"
    print_status "       --username $EMAIL \\"
    print_status "       --user-attributes Name=email,Value=$EMAIL \\"
    print_status "       --message-action SUPPRESS \\"
    print_status "       --region $REGION"
fi

echo ""

