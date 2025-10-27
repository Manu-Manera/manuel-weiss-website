#!/bin/bash

# AWS SES Domain Monitoring Script für manuel-weiss.ch
# Überwacht Domain-Registrierung und SES-Verifizierung
# Sendet Benachrichtigungen bei Statusänderungen

set -e

# Configuration
DOMAIN="manuel-weiss.ch"
EMAIL="weiss-manuel@gmx.de"
REGION="eu-central-1"
OPERATION_ID="c5e5a200-f6b9-40b6-a7ab-450bea2168fc"
LOG_FILE="domain-monitor.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

print_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS:${NC} $1" | tee -a "$LOG_FILE"
}

print_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

print_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

# Function to send notification email
send_notification() {
    local subject="$1"
    local message="$2"
    
    # Try to send via AWS SES (if available)
    if aws ses get-identity-verification-attributes --identities "$DOMAIN" --region "$REGION" --query "VerificationAttributes.$DOMAIN.VerificationStatus" --output text 2>/dev/null | grep -q "Success"; then
        aws ses send-email \
            --from "noreply@$DOMAIN" \
            --to "$EMAIL" \
            --subject "$subject" \
            --text "$message" \
            --region "$REGION" 2>/dev/null || true
    fi
    
    # Also send via system mail (if available)
    echo "$message" | mail -s "$subject" "$EMAIL" 2>/dev/null || true
    
    # Log notification
    print_status "NOTIFICATION SENT: $subject"
}

# Function to check domain registration status
check_domain_registration() {
    print_status "Checking domain registration status..."
    
    local status=$(aws route53domains get-operation-detail \
        --operation-id "$OPERATION_ID" \
        --region us-east-1 \
        --query 'Status' \
        --output text 2>/dev/null || echo "UNKNOWN")
    
    case "$status" in
        "SUCCESSFUL")
            print_success "Domain $DOMAIN registration completed successfully!"
            send_notification "🎉 Domain $DOMAIN erfolgreich registriert!" \
                "Die Domain manuel-weiss.ch wurde erfolgreich registriert!\n\nNächste Schritte:\n1. DNS-Verifizierung läuft automatisch\n2. SES-Verifizierung wird automatisch gestartet\n3. E-Mail-Setup wird in 10-15 Minuten funktionieren\n\nDu kannst jetzt dein Mail-Programm konfigurieren!"
            return 0
            ;;
        "FAILED")
            print_error "Domain $DOMAIN registration failed!"
            send_notification "❌ Domain $DOMAIN Registrierung fehlgeschlagen!" \
                "Die Domain-Registrierung für manuel-weiss.ch ist fehlgeschlagen.\n\nBitte kontaktiere den Support oder versuche eine alternative Domain."
            return 1
            ;;
        "IN_PROGRESS")
            print_status "Domain registration still in progress..."
            return 2
            ;;
        *)
            print_warning "Unknown domain registration status: $status"
            return 3
            ;;
    esac
}

# Function to check SES verification status
check_ses_verification() {
    print_status "Checking SES verification status..."
    
    local verification_status=$(aws ses get-identity-verification-attributes \
        --identities "$DOMAIN" \
        --region "$REGION" \
        --query "VerificationAttributes.$DOMAIN.VerificationStatus" \
        --output text 2>/dev/null || echo "UNKNOWN")
    
    local dkim_status=$(aws ses get-identity-dkim-attributes \
        --identities "$DOMAIN" \
        --region "$REGION" \
        --query "DkimAttributes.$DOMAIN.DkimVerificationStatus" \
        --output text 2>/dev/null || echo "UNKNOWN")
    
    case "$verification_status" in
        "Success")
            if [ "$dkim_status" = "Success" ]; then
                print_success "SES verification and DKIM completed successfully!"
                send_notification "✅ E-Mail-Setup für $DOMAIN abgeschlossen!" \
                    "Deine E-Mail-Adresse mail@manuel-weiss.ch ist jetzt vollständig funktionsfähig!\n\nSMTP-Einstellungen:\nServer: email-smtp.eu-central-1.amazonaws.com\nPort: 587 (TLS)\nBenutzername: AKIAQR3HB4M3JM24NYXH\nPasswort: Hxzwq6fSFKzMFIVtm56IfC99TN5PqBWecSnc1Aqo\n\nDu kannst jetzt E-Mails senden und empfangen!"
                return 0
            else
                print_status "SES verification successful, DKIM still pending..."
                return 2
            fi
            ;;
        "Pending")
            print_status "SES verification still pending..."
            return 2
            ;;
        "Failed")
            print_error "SES verification failed!"
            send_notification "❌ SES-Verifizierung für $DOMAIN fehlgeschlagen!" \
                "Die SES-Verifizierung für manuel-weiss.ch ist fehlgeschlagen.\n\nBitte überprüfe die DNS-Einstellungen oder kontaktiere den Support."
            return 1
            ;;
        *)
            print_warning "Unknown SES verification status: $verification_status"
            return 3
            ;;
    esac
}

# Function to test email sending
test_email_sending() {
    print_status "Testing email sending capability..."
    
    if aws ses send-email \
        --from "Manuel Weiss <noreply@$DOMAIN>" \
        --to "$EMAIL" \
        --subject "🎉 Test E-Mail von mail@$DOMAIN" \
        --text "Hallo Manuel! Diese Test-E-Mail wurde erfolgreich von deiner neuen E-Mail-Adresse mail@$DOMAIN gesendet!\n\n✅ Domain-Verifizierung: Erfolgreich\n✅ SES-Setup: Erfolgreich\n✅ DKIM: Aktiviert\n✅ E-Mail-Versand: Funktioniert\n\nDeine professionelle E-Mail-Adresse ist jetzt vollständig einsatzbereit!\n\nGrüsse,\nManuel Weiss" \
        --region "$REGION" 2>/dev/null; then
        
        print_success "Test email sent successfully!"
        send_notification "🚀 E-Mail-Test erfolgreich!" \
            "Die Test-E-Mail von mail@manuel-weiss.ch wurde erfolgreich gesendet!\n\nDeine E-Mail-Adresse ist jetzt vollständig funktionsfähig.\n\nDu kannst:\n- E-Mails senden\n- E-Mails empfangen\n- Dein Mail-Programm verwenden\n\nAlles ist bereit!"
        return 0
    else
        print_warning "Test email sending failed (domain might still be verifying)"
        return 1
    fi
}

# Main monitoring function
monitor_domain() {
    print_status "Starting domain monitoring for $DOMAIN..."
    print_status "Monitoring will check every 5 minutes"
    print_status "Press Ctrl+C to stop monitoring"
    
    local domain_registered=false
    local ses_verified=false
    local email_tested=false
    
    while true; do
        # Check domain registration
        if [ "$domain_registered" = false ]; then
            check_domain_registration
            case $? in
                0) domain_registered=true ;;
                1) exit 1 ;;
                2) ;; # Still in progress
                3) ;; # Unknown status
            esac
        fi
        
        # Check SES verification (only if domain is registered)
        if [ "$domain_registered" = true ] && [ "$ses_verified" = false ]; then
            check_ses_verification
            case $? in
                0) ses_verified=true ;;
                1) exit 1 ;;
                2) ;; # Still pending
                3) ;; # Unknown status
            esac
        fi
        
        # Test email sending (only if SES is verified)
        if [ "$ses_verified" = true ] && [ "$email_tested" = false ]; then
            test_email_sending
            case $? in
                0) email_tested=true ;;
                1) ;; # Still not ready
            esac
        fi
        
        # If everything is working, exit
        if [ "$domain_registered" = true ] && [ "$ses_verified" = true ] && [ "$email_tested" = true ]; then
            print_success "🎉 Domain monitoring completed successfully!"
            print_success "mail@$DOMAIN is fully operational!"
            break
        fi
        
        # Wait 5 minutes before next check
        print_status "Waiting 5 minutes before next check..."
        sleep 300
    done
}

# Function to run single check
single_check() {
    print_status "Running single domain status check..."
    
    check_domain_registration
    local domain_result=$?
    
    if [ $domain_result -eq 0 ] || [ $domain_result -eq 2 ]; then
        check_ses_verification
        local ses_result=$?
        
        if [ $ses_result -eq 0 ] || [ $ses_result -eq 2 ]; then
            test_email_sending
        fi
    fi
    
    print_status "Single check completed. Check $LOG_FILE for details."
}

# Main execution
case "${1:-monitor}" in
    "monitor")
        monitor_domain
        ;;
    "check")
        single_check
        ;;
    "status")
        print_status "Current status:"
        check_domain_registration
        check_ses_verification
        ;;
    *)
        echo "Usage: $0 [monitor|check|status]"
        echo "  monitor - Continuous monitoring (default)"
        echo "  check   - Single status check"
        echo "  status  - Show current status"
        exit 1
        ;;
esac
