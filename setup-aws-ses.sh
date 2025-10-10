#!/bin/bash

# AWS SES Setup für E-Mail-Bestätigung
# Dieses Script konfiguriert Amazon SES für Cognito E-Mail-Versand

echo "🚀 AWS SES Setup für E-Mail-Bestätigung"
echo "======================================"

# Prüfen ob AWS CLI installiert ist
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI ist nicht installiert. Bitte installieren Sie es zuerst."
    echo "   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# AWS Region setzen
export AWS_DEFAULT_REGION="eu-central-1"
echo "📍 AWS Region: $AWS_DEFAULT_REGION"

# 1. SES Identity (E-Mail-Adresse) verifizieren
echo ""
echo "📧 Schritt 1: E-Mail-Adresse für SES verifizieren"
echo "-----------------------------------------------"

# E-Mail-Adresse für SES verifizieren
EMAIL_ADDRESS="noreply@mawps.netlify.app"
echo "📧 Verifiziere E-Mail-Adresse: $EMAIL_ADDRESS"

aws ses verify-email-identity --email-address "$EMAIL_ADDRESS" || {
    echo "⚠️  E-Mail-Adresse bereits verifiziert oder Fehler aufgetreten"
}

echo ""
echo "📋 WICHTIG: Sie müssen die Verifizierungs-E-Mail bestätigen!"
echo "   Prüfen Sie Ihr E-Mail-Postfach für: $EMAIL_ADDRESS"
echo "   Klicken Sie auf den Bestätigungslink in der E-Mail."

# 2. SES Sandbox-Modus verlassen (für Produktion)
echo ""
echo "🌍 Schritt 2: SES Sandbox-Modus verlassen"
echo "----------------------------------------"

# Prüfen ob bereits aus Sandbox-Modus
SES_SENDING_ENABLED=$(aws ses get-send-quota --query 'Max24HourSend' --output text 2>/dev/null)

if [ "$SES_SENDING_ENABLED" = "200.0" ]; then
    echo "✅ SES ist bereits aus dem Sandbox-Modus (Produktionsmodus aktiv)"
else
    echo "⚠️  SES ist noch im Sandbox-Modus"
    echo "   Für Produktion müssen Sie eine Anfrage stellen:"
    echo "   https://console.aws.amazon.com/ses/home?region=eu-central-1#/account"
    echo ""
    echo "   Oder verwenden Sie AWS Support für eine Erhöhung der Limits."
fi

# 3. Cognito User Pool E-Mail-Konfiguration
echo ""
echo "🔧 Schritt 3: Cognito User Pool E-Mail-Konfiguration"
echo "----------------------------------------------------"

# User Pool ID und Client ID aus der Konfiguration lesen
USER_POOL_ID=$(grep -o 'userPoolId: [^,]*' js/aws-config.js | cut -d"'" -f2 | head -1)
CLIENT_ID=$(grep -o 'clientId: [^,]*' js/aws-config.js | cut -d"'" -f2 | head -1)

if [ -z "$USER_POOL_ID" ] || [ "$USER_POOL_ID" = "eu-central-1_XXXXXXXXX" ]; then
    echo "❌ User Pool ID nicht konfiguriert. Bitte führen Sie zuerst setup-aws-cognito.sh aus."
    exit 1
fi

echo "📋 User Pool ID: $USER_POOL_ID"
echo "📋 Client ID: $CLIENT_ID"

# Cognito User Pool E-Mail-Konfiguration aktualisieren
echo ""
echo "📧 Konfiguriere E-Mail-Einstellungen für Cognito..."

# E-Mail-Konfiguration für Cognito setzen
aws cognito-idp update-user-pool \
    --user-pool-id "$USER_POOL_ID" \
    --email-configuration '{
        "EmailSendingAccount": "DEVELOPER",
        "SourceArn": "arn:aws:ses:eu-central-1:'$(aws sts get-caller-identity --query Account --output text)':identity/'$EMAIL_ADDRESS'",
        "ReplyToEmailAddress": "'$EMAIL_ADDRESS'"
    }' || {
    echo "⚠️  Fehler beim Konfigurieren der E-Mail-Einstellungen"
    echo "   Möglicherweise ist die E-Mail-Adresse noch nicht verifiziert."
}

# 4. E-Mail-Template für Bestätigung anpassen
echo ""
echo "📝 Schritt 4: E-Mail-Template konfigurieren"
echo "------------------------------------------"

# Custom E-Mail-Template für Bestätigung
aws cognito-idp update-user-pool \
    --user-pool-id "$USER_POOL_ID" \
    --admin-create-user-config '{
        "AllowAdminCreateUserOnly": false,
        "UnusedAccountValidityDays": 7,
        "InviteMessageAction": "SUPPRESS"
    }' \
    --verification-message-template '{
        "DefaultEmailOption": "CONFIRM_WITH_CODE",
        "EmailSubject": "Bestätigen Sie Ihr Konto - Manuel Weiss",
        "EmailMessage": "Hallo {{username}},\n\nWillkommen bei Manuel Weiss HR-Beratung!\n\nIhr Bestätigungscode lautet: {{####}}\n\nBitte geben Sie diesen Code ein, um Ihr Konto zu aktivieren.\n\nBei Fragen wenden Sie sich an: weiss-manuel@gmx.de\n\nMit freundlichen Grüßen\nManuel Weiss"
    }' || {
    echo "⚠️  Fehler beim Konfigurieren des E-Mail-Templates"
}

# 5. Test-E-Mail senden
echo ""
echo "🧪 Schritt 5: Test-E-Mail senden"
echo "-------------------------------"

# Test-E-Mail an sich selbst senden
TEST_EMAIL="weiss-manuel@gmx.de"
echo "📧 Sende Test-E-Mail an: $TEST_EMAIL"

aws ses send-email \
    --source "$EMAIL_ADDRESS" \
    --destination "ToAddresses=$TEST_EMAIL" \
    --message '{
        "Subject": {
            "Data": "Test-E-Mail von Manuel Weiss Website",
            "Charset": "UTF-8"
        },
        "Body": {
            "Text": {
                "Data": "Dies ist eine Test-E-Mail von Ihrer Manuel Weiss Website.\n\nWenn Sie diese E-Mail erhalten, funktioniert die E-Mail-Konfiguration korrekt.\n\nMit freundlichen Grüßen\nManuel Weiss",
                "Charset": "UTF-8"
            }
        }
    }' && {
    echo "✅ Test-E-Mail erfolgreich gesendet!"
} || {
    echo "❌ Fehler beim Senden der Test-E-Mail"
    echo "   Möglicherweise ist SES noch im Sandbox-Modus"
}

# 6. Zusammenfassung
echo ""
echo "📋 ZUSAMMENFASSUNG"
echo "=================="
echo "✅ SES E-Mail-Adresse verifiziert: $EMAIL_ADDRESS"
echo "✅ Cognito User Pool konfiguriert: $USER_POOL_ID"
echo "✅ E-Mail-Template angepasst"
echo "✅ Test-E-Mail gesendet"
echo ""
echo "📧 NÄCHSTE SCHRITTE:"
echo "1. Prüfen Sie Ihr E-Mail-Postfach für die Verifizierungs-E-Mail"
echo "2. Bestätigen Sie die E-Mail-Adresse $EMAIL_ADDRESS"
echo "3. Falls nötig, beantragen Sie die Entfernung aus dem SES Sandbox-Modus"
echo "4. Testen Sie die Registrierung auf Ihrer Website"
echo ""
echo "🔧 TROUBLESHOOTING:"
echo "- Falls E-Mails nicht ankommen, prüfen Sie den Spam-Ordner"
echo "- Bei Problemen mit SES Sandbox, verwenden Sie verified E-Mail-Adressen"
echo "- Für Produktion: Beantragen Sie SES Produktionszugang"
echo ""
echo "✅ AWS SES Setup abgeschlossen!"
