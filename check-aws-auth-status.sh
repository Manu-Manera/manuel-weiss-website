#!/bin/bash

# AWS Cognito & SES Status Check Script
# Prüft die Konfiguration und den Status von AWS Cognito und SES

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

echo "🔍 AWS Cognito & SES Status Check"
echo "=================================="
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

REGION="eu-central-1"
USER_POOL_ID="eu-central-1_8gP4gLK9r"
CLIENT_ID="7kc5tt6a23fgh53d60vkefm812"

print_status "Region: $REGION"
print_status "User Pool ID: $USER_POOL_ID"
print_status "Client ID: $CLIENT_ID"
echo ""

# 1. Prüfe User Pool
echo "📋 Schritt 1: User Pool Status"
echo "------------------------------"
if aws cognito-idp describe-user-pool \
    --user-pool-id "$USER_POOL_ID" \
    --region "$REGION" &> /dev/null; then
    print_success "User Pool existiert"
    
    # Hole User Pool Details
    POOL_NAME=$(aws cognito-idp describe-user-pool \
        --user-pool-id "$USER_POOL_ID" \
        --region "$REGION" \
        --query 'UserPool.Name' \
        --output text 2>/dev/null || echo "N/A")
    
    AUTO_VERIFY=$(aws cognito-idp describe-user-pool \
        --user-pool-id "$USER_POOL_ID" \
        --region "$REGION" \
        --query 'UserPool.AutoVerifiedAttributes[0]' \
        --output text 2>/dev/null || echo "N/A")
    
    print_status "  Name: $POOL_NAME"
    print_status "  Auto-Verify: $AUTO_VERIFY"
    
    # Prüfe E-Mail-Konfiguration
    EMAIL_CONFIG=$(aws cognito-idp describe-user-pool \
        --user-pool-id "$USER_POOL_ID" \
        --region "$REGION" \
        --query 'UserPool.EmailConfiguration' \
        --output json 2>/dev/null || echo "{}")
    
    EMAIL_SENDING=$(echo "$EMAIL_CONFIG" | grep -o '"EmailSendingAccount":"[^"]*"' | cut -d'"' -f4 || echo "N/A")
    
    if [ "$EMAIL_SENDING" = "DEVELOPER" ] || [ "$EMAIL_SENDING" = "COGNITO_DEFAULT" ]; then
        print_success "  E-Mail-Konfiguration: $EMAIL_SENDING"
    else
        print_warning "  E-Mail-Konfiguration: $EMAIL_SENDING (möglicherweise nicht konfiguriert)"
    fi
else
    print_error "User Pool existiert nicht oder ist nicht erreichbar"
fi
echo ""

# 2. Prüfe App Client
echo "📱 Schritt 2: App Client Status"
echo "-------------------------------"
if aws cognito-idp describe-user-pool-client \
    --user-pool-id "$USER_POOL_ID" \
    --client-id "$CLIENT_ID" \
    --region "$REGION" &> /dev/null; then
    print_success "App Client existiert"
    
    CLIENT_NAME=$(aws cognito-idp describe-user-pool-client \
        --user-pool-id "$USER_POOL_ID" \
        --client-id "$CLIENT_ID" \
        --region "$REGION" \
        --query 'UserPoolClient.ClientName' \
        --output text 2>/dev/null || echo "N/A")
    
    AUTH_FLOWS=$(aws cognito-idp describe-user-pool-client \
        --user-pool-id "$USER_POOL_ID" \
        --client-id "$CLIENT_ID" \
        --region "$REGION" \
        --query 'UserPoolClient.ExplicitAuthFlows[*]' \
        --output text 2>/dev/null || echo "N/A")
    
    print_status "  Name: $CLIENT_NAME"
    print_status "  Auth Flows: $AUTH_FLOWS"
    
    # Prüfe ob USER_PASSWORD_AUTH aktiviert ist
    if echo "$AUTH_FLOWS" | grep -q "ALLOW_USER_PASSWORD_AUTH"; then
        print_success "  USER_PASSWORD_AUTH ist aktiviert"
    else
        print_warning "  USER_PASSWORD_AUTH ist NICHT aktiviert (wird benötigt!)"
    fi
else
    print_error "App Client existiert nicht oder ist nicht erreichbar"
fi
echo ""

# 3. Prüfe SES E-Mail-Adressen
echo "📧 Schritt 3: SES E-Mail-Status"
echo "------------------------------"

# Prüfe verschiedene mögliche E-Mail-Adressen
EMAILS=(
    "noreply@mawps.netlify.app"
    "mail@manuel-weiss.de"
    "weiss-manuel@gmx.de"
)

VERIFIED_EMAILS=0
for EMAIL in "${EMAILS[@]}"; do
    STATUS=$(aws sesv2 get-email-identity \
        --email-identity "$EMAIL" \
        --region "$REGION" \
        --query "VerificationStatus" \
        --output text 2>/dev/null || echo "NOT_FOUND")
    
    if [ "$STATUS" = "SUCCESS" ]; then
        print_success "  $EMAIL: VERIFIED ✅"
        VERIFIED_EMAILS=$((VERIFIED_EMAILS + 1))
    elif [ "$STATUS" = "PENDING" ]; then
        print_warning "  $EMAIL: PENDING ⏳ (wartet auf Bestätigung)"
    elif [ "$STATUS" = "NOT_FOUND" ]; then
        print_status "  $EMAIL: Nicht registriert"
    else
        print_warning "  $EMAIL: $STATUS"
    fi
done

if [ $VERIFIED_EMAILS -eq 0 ]; then
    print_warning "Keine E-Mail-Adressen verifiziert!"
    print_status "Sie müssen mindestens eine E-Mail-Adresse in SES verifizieren"
else
    print_success "$VERIFIED_EMAILS E-Mail-Adresse(n) verifiziert"
fi
echo ""

# 4. Prüfe SES Sandbox-Status
echo "🌐 Schritt 4: SES Sandbox-Status"
echo "--------------------------------"
SES_SENDING_ENABLED=$(aws sesv2 get-account \
    --region "$REGION" \
    --query "ProductionAccessEnabled" \
    --output text 2>/dev/null || echo "false")

if [ "$SES_SENDING_ENABLED" = "true" ]; then
    print_success "SES Production Access aktiviert (kann an alle E-Mails senden)"
else
    print_warning "SES ist im Sandbox-Modus (kann nur an verifizierte E-Mails senden)"
    print_status "Für Produktion sollten Sie Production Access beantragen"
fi
echo ""

# 5. Zusammenfassung
echo "📊 Zusammenfassung"
echo "=================="

ISSUES=0

# Prüfe User Pool
if ! aws cognito-idp describe-user-pool --user-pool-id "$USER_POOL_ID" --region "$REGION" &> /dev/null; then
    print_error "❌ User Pool nicht erreichbar"
    ISSUES=$((ISSUES + 1))
fi

# Prüfe App Client
if ! aws cognito-idp describe-user-pool-client --user-pool-id "$USER_POOL_ID" --client-id "$CLIENT_ID" --region "$REGION" &> /dev/null; then
    print_error "❌ App Client nicht erreichbar"
    ISSUES=$((ISSUES + 1))
fi

# Prüfe E-Mail-Verifizierung
if [ $VERIFIED_EMAILS -eq 0 ]; then
    print_error "❌ Keine E-Mail-Adressen verifiziert"
    ISSUES=$((ISSUES + 1))
fi

if [ $ISSUES -eq 0 ]; then
    print_success "✅ Alle Prüfungen bestanden!"
    echo ""
    print_status "Das System sollte funktionieren. Sie können jetzt:"
    print_status "  1. Eine Registrierung testen"
    print_status "  2. Die E-Mail-Bestätigung testen"
    print_status "  3. Den Login testen"
else
    print_warning "⚠️  $ISSUES Problem(e) gefunden"
    echo ""
    print_status "Nächste Schritte:"
    if [ $VERIFIED_EMAILS -eq 0 ]; then
        print_status "  1. E-Mail-Adresse in SES verifizieren:"
        print_status "     aws sesv2 create-email-identity --email-identity mail@manuel-weiss.de --region eu-central-1"
    fi
    print_status "  2. User Pool E-Mail-Konfiguration prüfen"
    print_status "  3. App Client Auth Flows prüfen"
fi

echo ""

