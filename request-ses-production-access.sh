#!/bin/bash

# Script zur Beantragung von SES Production Access
# WICHTIG: Production Access muss über die AWS Console beantragt werden!

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

echo "📧 SES Production Access Beantragung"
echo "====================================="
echo ""

# Prüfe aktuellen Status
print_status "Prüfe aktuellen SES Status..."
SES_STATUS=$(aws sesv2 get-account \
    --region "$REGION" \
    --query 'ProductionAccessEnabled' \
    --output text 2>/dev/null || echo "false")

if [ "$SES_STATUS" = "true" ]; then
    print_success "✅ SES ist bereits im Production-Modus!"
    exit 0
fi

print_warning "⚠️  SES ist im Sandbox-Modus"
echo ""

# Prüfe ob es eine API gibt (normalerweise nicht)
print_status "Prüfe ob Production Access über CLI beantragt werden kann..."
print_warning "⚠️  Production Access kann NICHT über CLI beantragt werden!"
echo ""

print_status "📋 Nächste Schritte:"
echo ""
echo "1. Gehe zur AWS Console:"
echo "   https://eu-central-1.console.aws.amazon.com/ses/home?region=eu-central-1#/account"
echo ""
echo "2. Klicke auf 'Request production access' oder 'Production-Zugriff anfordern'"
echo ""
echo "3. Fülle das Formular aus:"
echo "   - Use case: 'Transactional emails for user verification'"
echo "   - Website URL: 'https://mawps.netlify.app'"
echo "   - Mail Type: 'Transactional'"
echo "   - Expected sending volume: 'Low (< 1000 emails/day)'"
echo "   - Describe your use case: 'Sending email verification codes for user registration in a web application'"
echo ""
echo "4. Warte auf AWS Genehmigung (meist 24-48 Stunden)"
echo ""

print_status "🔗 Direkter Link zur SES Console:"
echo "   https://eu-central-1.console.aws.amazon.com/ses/home?region=eu-central-1#/account"
echo ""

print_status "📝 Alternative: Ich kann ein Script erstellen, das die Informationen vorbereitet..."
echo ""

