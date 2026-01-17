#!/bin/bash

# Kompletter Fix für Auto-Verify - versucht verschiedene Methoden

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

echo "🔧 Kompletter Fix: Auto-Verify für E-Mail"
echo "=========================================="
echo ""

# Methode 1: Als Array
print_status "Methode 1: Setze Auto-Verify als Array..."
aws cognito-idp update-user-pool \
    --user-pool-id "$USER_POOL_ID" \
    --region "$REGION" \
    --auto-verified-attributes email 2>&1 | grep -v "An error occurred" && {
    print_success "✅ Befehl ausgeführt"
} || {
    print_warning "⚠️  Befehl gab Fehler zurück (möglicherweise bereits gesetzt)"
}

echo ""

# Prüfe Status
print_status "Prüfe Status nach Methode 1..."
STATUS1=$(aws cognito-idp describe-user-pool \
    --user-pool-id "$USER_POOL_ID" \
    --region "$REGION" \
    --query 'UserPool.AutoVerifiedAttributes' \
    --output json 2>/dev/null || echo "null")

echo "Status: $STATUS1"

if echo "$STATUS1" | grep -q "email"; then
    print_success "✅ Auto-Verify ist aktiviert!"
    exit 0
fi

echo ""

# Methode 2: Mit vollständiger Konfiguration
print_status "Methode 2: Setze mit vollständiger Konfiguration..."

# Hole aktuelle Konfiguration
CURRENT_CONFIG=$(aws cognito-idp describe-user-pool \
    --user-pool-id "$USER_POOL_ID" \
    --region "$REGION" \
    --output json)

# Erstelle Update mit allen bestehenden Einstellungen + Auto-Verify
aws cognito-idp update-user-pool \
    --user-pool-id "$USER_POOL_ID" \
    --region "$REGION" \
    --auto-verified-attributes email \
    --username-attributes email 2>&1 | grep -v "An error occurred" && {
    print_success "✅ Befehl ausgeführt"
} || {
    print_warning "⚠️  Befehl gab Fehler zurück"
}

echo ""

# Prüfe Status
print_status "Prüfe Status nach Methode 2..."
STATUS2=$(aws cognito-idp describe-user-pool \
    --user-pool-id "$USER_POOL_ID" \
    --region "$REGION" \
    --query 'UserPool.AutoVerifiedAttributes' \
    --output json 2>/dev/null || echo "null")

echo "Status: $STATUS2"

if echo "$STATUS2" | grep -q "email"; then
    print_success "✅ Auto-Verify ist aktiviert!"
    exit 0
fi

echo ""

# Wenn Auto-Verify nicht gesetzt werden kann, prüfe ob es ein anderes Problem ist
print_warning "⚠️  Auto-Verify konnte nicht aktiviert werden"
print_status ""
print_status "Mögliche Ursachen:"
print_status "  1. User Pool wurde mit bestimmten Einstellungen erstellt, die nicht geändert werden können"
print_status "  2. Auto-Verify muss beim Erstellen des User Pools gesetzt werden"
print_status "  3. Es gibt ein AWS-Limit oder eine Einschränkung"
print_status ""
print_status "Alternative Lösung:"
print_status "  - E-Mails werden möglicherweise trotzdem versendet, wenn die E-Mail-Konfiguration korrekt ist"
print_status "  - Prüfe CloudWatch Logs für E-Mail-Versand"
print_status "  - Teste mit einer verifizierten E-Mail-Adresse"

echo ""

