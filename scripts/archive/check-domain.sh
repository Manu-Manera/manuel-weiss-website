#!/bin/bash

# Einfaches Domain-Monitoring für manuel-weiss.ch
# Prüft Status und sendet Push-Benachrichtigung

DOMAIN="manuel-weiss.ch"
EMAIL="info@manuel-weiss.ch"
REGION="eu-central-1"
OPERATION_ID="c5e5a200-f6b9-40b6-a7ab-450bea2168fc"

echo "🔍 Prüfe Domain-Status für $DOMAIN..."

# Domain-Registrierung prüfen
DOMAIN_STATUS=$(aws route53domains get-operation-detail --operation-id "$OPERATION_ID" --region us-east-1 --query 'Status' --output text 2>/dev/null || echo "UNKNOWN")

echo "📋 Domain-Registrierung: $DOMAIN_STATUS"

if [ "$DOMAIN_STATUS" = "SUCCESSFUL" ]; then
    echo "✅ Domain erfolgreich registriert!"
    
    # SES-Verifizierung prüfen
    SES_STATUS=$(aws ses get-identity-verification-attributes --identities "$DOMAIN" --region "$REGION" --query "VerificationAttributes.$DOMAIN.VerificationStatus" --output text 2>/dev/null || echo "UNKNOWN")
    echo "📧 SES-Verifizierung: $SES_STATUS"
    
    if [ "$SES_STATUS" = "Success" ]; then
        echo "🎉 ALLES FERTIG! E-Mail funktioniert jetzt!"
        
        # Test-E-Mail senden
        if aws ses send-email --from "Manuel Weiss <noreply@$DOMAIN>" --to "$EMAIL" --subject "🎉 mail@$DOMAIN ist bereit!" --text "Deine E-Mail-Adresse mail@manuel-weiss.ch funktioniert jetzt! Du kannst E-Mails senden und empfangen." --region "$REGION" 2>/dev/null; then
            echo "📧 Test-E-Mail erfolgreich gesendet!"
        fi
        
        # Push-Benachrichtigung (falls verfügbar)
        if command -v osascript &> /dev/null; then
            osascript -e 'display notification "mail@manuel-weiss.ch ist bereit!" with title "E-Mail-Setup abgeschlossen"'
        fi
        
    else
        echo "⏳ SES-Verifizierung läuft noch..."
    fi
    
elif [ "$DOMAIN_STATUS" = "FAILED" ]; then
    echo "❌ Domain-Registrierung fehlgeschlagen!"
    
elif [ "$DOMAIN_STATUS" = "IN_PROGRESS" ]; then
    echo "⏳ Domain-Registrierung läuft noch..."
    
else
    echo "❓ Unbekannter Status: $DOMAIN_STATUS"
fi

echo "🔄 Nächste Prüfung in 10 Minuten..."
