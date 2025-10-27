#!/bin/bash

# AWS SES E-Mail Setup Script für mail@manu.ch
# Automatisiertes Setup für professionelle E-Mail-Adresse

set -e

echo "🚀 AWS SES E-Mail Setup für mail@manu.ch"
echo "========================================"

# Configuration
DOMAIN="manuel-weiss.ch"
EMAIL="mail@manuel-weiss.ch"
REGION="eu-central-1"
STACK_NAME="ManuEmailSetup"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if AWS CLI is installed
check_aws_cli() {
if ! command -v aws &> /dev/null; then
        print_error "AWS CLI ist nicht installiert!"
        echo "Installiere AWS CLI: https://aws.amazon.com/cli/"
        exit 1
    fi
    print_success "AWS CLI gefunden"
}

# Check if CDK is installed
check_cdk() {
    if ! command -v cdk &> /dev/null; then
        print_warning "AWS CDK ist nicht installiert. Installiere es..."
        npm install -g aws-cdk
    fi
    print_success "AWS CDK gefunden"
}

# Check AWS credentials
check_aws_credentials() {
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS Credentials nicht konfiguriert!"
        echo "Konfiguriere AWS CLI: aws configure"
    exit 1
fi
    print_success "AWS Credentials konfiguriert"
}

# Check if domain is available
check_domain_availability() {
    print_status "Prüfe Domain-Verfügbarkeit für $DOMAIN..."
    
    if aws route53domains check-domain-availability --domain-name $DOMAIN --query 'Availability' --output text | grep -q "AVAILABLE"; then
        print_success "Domain $DOMAIN ist verfügbar!"
        return 0
    else
        print_warning "Domain $DOMAIN ist nicht verfügbar oder bereits registriert"
        return 1
    fi
}

# Register domain
register_domain() {
    print_status "Registriere Domain $DOMAIN..."
    
    aws route53domains register-domain \
        --domain-name $DOMAIN \
        --duration-in-years 1 \
        --admin-contact FirstName=Manuel,LastName=Weiss,ContactType=PERSON,CountryCode=CH,City=Zürich,State=ZH,ZipCode=8001,PhoneNumber=+41.798385590,Email=weiss-manuel@gmx.de \
        --registrant-contact FirstName=Manuel,LastName=Weiss,ContactType=PERSON,CountryCode=CH,City=Zürich,State=ZH,ZipCode=8001,PhoneNumber=+41.798385590,Email=weiss-manuel@gmx.de \
        --tech-contact FirstName=Manuel,LastName=Weiss,ContactType=PERSON,CountryCode=CH,City=Zürich,State=ZH,ZipCode=8001,PhoneNumber=+41.798385590,Email=weiss-manuel@gmx.de
    
    print_success "Domain $DOMAIN registriert!"
}

# Bootstrap CDK
bootstrap_cdk() {
    print_status "Bootstrappe AWS CDK..."
    cdk bootstrap
    print_success "CDK bootstrapped"
}

# Deploy SES stack
deploy_ses_stack() {
    print_status "Deploye SES Stack..."
    cdk deploy $STACK_NAME --require-approval never
    print_success "SES Stack deployed"
}

# Verify domain in SES
verify_domain() {
    print_status "Verifiziere Domain in SES..."
    aws ses verify-domain-identity --domain $DOMAIN --region $REGION
    print_success "Domain-Verifizierung gestartet"
}

# Enable DKIM
enable_dkim() {
    print_status "Aktiviere DKIM..."
    aws ses put-identity-dkim-attributes --identity $DOMAIN --dkim-enabled --region $REGION
    print_success "DKIM aktiviert"
}

# Get DKIM tokens
get_dkim_tokens() {
    print_status "Rufe DKIM Tokens ab..."
    aws ses get-identity-dkim-attributes --identities $DOMAIN --region $REGION --query 'DkimAttributes.'$DOMAIN'.DkimTokens' --output table
    print_success "DKIM Tokens abgerufen"
}

# Send test email
send_test_email() {
    print_status "Sende Test-E-Mail..."
    aws ses send-email \
        --source $EMAIL \
        --destination ToAddresses=weiss-manuel@gmx.de \
        --message Subject.Data="Test E-Mail von $EMAIL" Body.Text.Data="Hallo! Diese E-Mail wurde von $EMAIL gesendet. Das Setup funktioniert!" \
        --region $REGION
    print_success "Test-E-Mail gesendet"
}

# Create SMTP user
create_smtp_user() {
    print_status "Erstelle SMTP User für E-Mail-Client..."
    
    # Create IAM user
    aws iam create-user --user-name manu-ses-smtp-user --region $REGION || true
    
    # Attach SES policy
    aws iam attach-user-policy \
        --user-name manu-ses-smtp-user \
        --policy-arn arn:aws:iam::aws:policy/AmazonSESFullAccess \
        --region $REGION || true
    
    # Create access key
    SMTP_CREDENTIALS=$(aws iam create-access-key --user-name manu-ses-smtp-user --region $REGION)
    
    print_success "SMTP User erstellt"
    echo "SMTP Credentials:"
    echo "$SMTP_CREDENTIALS"
}

# Main execution
main() {
    echo
    print_status "Starte AWS SES E-Mail Setup..."
    echo
    
    # Pre-flight checks
    check_aws_cli
    check_cdk
    check_aws_credentials
    
    echo
    print_status "Domain Setup..."
    
    # Domain registration
    if check_domain_availability; then
        register_domain
    else
        print_warning "Domain bereits registriert, fahre mit SES Setup fort..."
    fi
    
    echo
    print_status "SES Setup..."
    
    # CDK and SES deployment
    bootstrap_cdk
    deploy_ses_stack
    
    echo
    print_status "Domain Verification..."
    
    # Domain verification
    verify_domain
    enable_dkim
    get_dkim_tokens
    
    echo
    print_status "Testing..."
    
    # Test email
    send_test_email
    create_smtp_user
    
    echo
    print_success "🎉 E-Mail Setup abgeschlossen!"
    echo
    echo "📧 Deine E-Mail-Adresse: $EMAIL"
    echo "🌐 Domain: $DOMAIN"
    echo "📍 Region: $REGION"
    echo
    echo "📋 Nächste Schritte:"
    echo "1. DNS Records in Route 53 prüfen"
    echo "2. DKIM Tokens in DNS eintragen"
    echo "3. Domain-Verifizierung in SES Console abwarten"
    echo "4. E-Mail-Client mit SMTP Credentials konfigurieren"
    echo
    echo "🔗 AWS Console Links:"
    echo "- SES: https://console.aws.amazon.com/ses/home?region=$REGION"
    echo "- Route 53: https://console.aws.amazon.com/route53/home"
    echo "- IAM: https://console.aws.amazon.com/iam/home"
    echo
}

# Run main function
main "$@"