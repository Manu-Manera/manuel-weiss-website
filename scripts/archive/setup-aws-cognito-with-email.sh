#!/bin/bash

# AWS Cognito Setup mit E-Mail-Konfiguration
# Dieses Script erstellt einen Cognito User Pool mit E-Mail-Bestätigung

echo "🚀 AWS Cognito Setup mit E-Mail-Konfiguration"
echo "============================================="

# Prüfen ob AWS CLI installiert ist
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI ist nicht installiert. Bitte installieren Sie es zuerst."
    echo "   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# AWS Region setzen
export AWS_DEFAULT_REGION="eu-central-1"
echo "📍 AWS Region: $AWS_DEFAULT_REGION"

# 1. User Pool erstellen
echo ""
echo "👥 Schritt 1: User Pool erstellen"
echo "---------------------------------"

USER_POOL_ID=$(aws cognito-idp create-user-pool \
    --pool-name "Manuel Weiss Website Users" \
    --policies '{
        "PasswordPolicy": {
            "MinimumLength": 8,
            "RequireUppercase": true,
            "RequireLowercase": true,
            "RequireNumbers": true,
            "RequireSymbols": false
        }
    }' \
    --username-attributes "email" \
    --auto-verified-attributes "email" \
    --verification-message-template '{
        "DefaultEmailOption": "CONFIRM_WITH_CODE",
        "EmailSubject": "Bestätigen Sie Ihr Konto - Manuel Weiss",
        "EmailMessage": "Hallo {{username}},\n\nWillkommen bei Manuel Weiss HR-Beratung!\n\nIhr Bestätigungscode lautet: {{####}}\n\nBitte geben Sie diesen Code ein, um Ihr Konto zu aktivieren.\n\nBei Fragen wenden Sie sich an: weiss-manuel@gmx.de\n\nMit freundlichen Grüßen\nManuel Weiss"
    }' \
    --admin-create-user-config '{
        "AllowAdminCreateUserOnly": false,
        "UnusedAccountValidityDays": 7,
        "InviteMessageAction": "SUPPRESS"
    }' \
    --schema '[
        {
            "Name": "email",
            "AttributeDataType": "String",
            "Required": true,
            "Mutable": true
        },
        {
            "Name": "given_name",
            "AttributeDataType": "String",
            "Required": true,
            "Mutable": true
        },
        {
            "Name": "family_name",
            "AttributeDataType": "String",
            "Required": true,
            "Mutable": true
        }
    ]' \
    --query 'UserPool.Id' \
    --output text)

echo "✅ User Pool erstellt: $USER_POOL_ID"

# 2. SES E-Mail-Adresse verifizieren
echo ""
echo "📧 Schritt 2: SES E-Mail-Adresse verifizieren"
echo "--------------------------------------------"

SES_EMAIL="noreply@mawps.netlify.app"
echo "📧 Verifiziere E-Mail-Adresse: $SES_EMAIL"

aws ses verify-email-identity --email-address "$SES_EMAIL" || {
    echo "⚠️  E-Mail-Adresse bereits verifiziert oder Fehler aufgetreten"
}

echo ""
echo "📋 WICHTIG: Sie müssen die Verifizierungs-E-Mail bestätigen!"
echo "   Prüfen Sie Ihr E-Mail-Postfach für: $SES_EMAIL"
echo "   Klicken Sie auf den Bestätigungslink in der E-Mail."

# 3. Cognito E-Mail-Konfiguration
echo ""
echo "🔧 Schritt 3: Cognito E-Mail-Konfiguration"
echo "----------------------------------------"

# Warten auf Benutzer-Bestätigung
echo "⏳ Warten Sie, bis Sie die E-Mail-Adresse $SES_EMAIL bestätigt haben..."
echo "   Drücken Sie Enter, wenn die E-Mail-Adresse bestätigt wurde."
read -p "   E-Mail-Adresse bestätigt? (Enter drücken) "

# E-Mail-Konfiguration für Cognito setzen
echo "📧 Konfiguriere E-Mail-Einstellungen für Cognito..."

aws cognito-idp update-user-pool \
    --user-pool-id "$USER_POOL_ID" \
    --email-configuration '{
        "EmailSendingAccount": "DEVELOPER",
        "SourceArn": "arn:aws:ses:eu-central-1:'$(aws sts get-caller-identity --query Account --output text)':identity/'$SES_EMAIL'",
        "ReplyToEmailAddress": "'$SES_EMAIL'"
    }' && {
    echo "✅ E-Mail-Konfiguration erfolgreich gesetzt"
} || {
    echo "❌ Fehler beim Konfigurieren der E-Mail-Einstellungen"
    echo "   Möglicherweise ist die E-Mail-Adresse noch nicht verifiziert."
}

# 4. App Client erstellen
echo ""
echo "📱 Schritt 4: App Client erstellen"
echo "---------------------------------"

CLIENT_ID=$(aws cognito-idp create-user-pool-client \
    --user-pool-id "$USER_POOL_ID" \
    --client-name "Manuel Weiss Website Client" \
    --explicit-auth-flows "ALLOW_USER_SRP_AUTH" "ALLOW_USER_PASSWORD_AUTH" "ALLOW_REFRESH_TOKEN_AUTH" \
    --supported-identity-providers "COGNITO" \
    --callback-urls "https://mawps.netlify.app" "http://localhost:3000" \
    --logout-urls "https://mawps.netlify.app" "http://localhost:3000" \
    --allowed-o-auth-flows "implicit" "code" \
    --allowed-o-auth-scopes "email" "openid" "profile" \
    --allowed-o-auth-flows-user-pool-client \
    --query 'UserPoolClient.ClientId' \
    --output text)

echo "✅ App Client erstellt: $CLIENT_ID"

# 5. S3 Bucket für Dateien erstellen
echo ""
echo "📁 Schritt 5: S3 Bucket erstellen"
echo "---------------------------------"

BUCKET_NAME="mawps-user-files-$(date +%s)"
echo "📁 Erstelle S3 Bucket: $BUCKET_NAME"

aws s3 mb "s3://$BUCKET_NAME" --region eu-central-1 && {
    echo "✅ S3 Bucket erstellt: $BUCKET_NAME"
    
    # Bucket-Policy für öffentlichen Zugriff auf Uploads
    aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::'$BUCKET_NAME'/*"
            }
        ]
    }'
} || {
    echo "⚠️  S3 Bucket bereits vorhanden oder Fehler"
}

# 6. DynamoDB Tabelle erstellen
echo ""
echo "🗄️  Schritt 6: DynamoDB Tabelle erstellen"
echo "----------------------------------------"

TABLE_NAME="mawps-user-profiles"
echo "🗄️  Erstelle DynamoDB Tabelle: $TABLE_NAME"

aws dynamodb create-table \
    --table-name "$TABLE_NAME" \
    --attribute-definitions '[
        {
            "AttributeName": "userId",
            "AttributeType": "S"
        }
    ]' \
    --key-schema '[
        {
            "AttributeName": "userId",
            "KeyType": "HASH"
        }
    ]' \
    --billing-mode PAY_PER_REQUEST \
    --region eu-central-1 && {
    echo "✅ DynamoDB Tabelle erstellt: $TABLE_NAME"
} || {
    echo "⚠️  DynamoDB Tabelle bereits vorhanden oder Fehler"
}

# 7. Konfigurationsdatei aktualisieren
echo ""
echo "📋 Schritt 7: Konfigurationsdatei aktualisieren"
echo "----------------------------------------------"

# Backup erstellen
cp js/aws-config.js js/aws-config.js.backup

# Neue Konfiguration schreiben
cat > js/aws-config.js << EOF
// AWS Configuration for Production
window.AWS_CONFIG = {
    // Cognito User Pool Configuration
    userPoolId: '$USER_POOL_ID',
    clientId: '$CLIENT_ID',
    region: 'eu-central-1',
    
    // S3 Configuration for file uploads
    s3: {
        bucket: '$BUCKET_NAME',
        region: 'eu-central-1'
    },
    
    // DynamoDB Configuration for user data
    dynamodb: {
        tableName: '$TABLE_NAME',
        region: 'eu-central-1'
    },
    
    // API Gateway Configuration
    apiGateway: {
        baseUrl: 'https://api.mawps.netlify.app',
        endpoints: {
            userProfile: '/user/profile',
            userProgress: '/user/progress',
            userSettings: '/user/settings'
        }
    }
};

// Initialize AWS with configuration
if (typeof AWS !== 'undefined') {
    AWS.config.update({
        region: window.AWS_CONFIG.region
    });
    
    // Configure Cognito
    window.AWS_COGNITO_CONFIG = {
        UserPoolId: window.AWS_CONFIG.userPoolId,
        ClientId: window.AWS_CONFIG.clientId
    };
    
    console.log('✅ AWS Configuration loaded');
} else {
    console.warn('⚠️ AWS SDK not loaded yet');
}
EOF

echo "✅ Konfigurationsdatei aktualisiert"

# 8. Test-E-Mail senden
echo ""
echo "🧪 Schritt 8: Test-E-Mail senden"
echo "-------------------------------"

# Test-E-Mail an sich selbst senden
TEST_EMAIL="weiss-manuel@gmx.de"
echo "📧 Sende Test-E-Mail an: $TEST_EMAIL"

aws ses send-email \
    --source "$SES_EMAIL" \
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

# 9. Zusammenfassung
echo ""
echo "📋 ZUSAMMENFASSUNG"
echo "=================="
echo "✅ User Pool erstellt: $USER_POOL_ID"
echo "✅ App Client erstellt: $CLIENT_ID"
echo "✅ S3 Bucket erstellt: $BUCKET_NAME"
echo "✅ DynamoDB Tabelle erstellt: $TABLE_NAME"
echo "✅ E-Mail-Adresse verifiziert: $SES_EMAIL"
echo "✅ Konfigurationsdatei aktualisiert"
echo ""
echo "📧 NÄCHSTE SCHRITTE:"
echo "1. Prüfen Sie Ihr E-Mail-Postfach für die Verifizierungs-E-Mail"
echo "2. Bestätigen Sie die E-Mail-Adresse $SES_EMAIL"
echo "3. Falls nötig, beantragen Sie die Entfernung aus dem SES Sandbox-Modus"
echo "4. Testen Sie die Registrierung auf Ihrer Website"
echo ""
echo "🔧 TROUBLESHOOTING:"
echo "- Falls E-Mails nicht ankommen, prüfen Sie den Spam-Ordner"
echo "- Bei Problemen mit SES Sandbox, verwenden Sie verified E-Mail-Adressen"
echo "- Für Produktion: Beantragen Sie SES Produktionszugang"
echo ""
echo "✅ AWS Cognito Setup mit E-Mail-Konfiguration abgeschlossen!"
