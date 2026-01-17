# AWS Profile Storage Setup Guide

## Übersicht

Diese Anleitung beschreibt, wie Sie die AWS-Infrastruktur für die Benutzerprofil-Speicherung einrichten.

## Voraussetzungen

- AWS CLI installiert und konfiguriert
- AWS-Konto mit entsprechenden Berechtigungen
- Node.js und npm installiert

## 1. DynamoDB-Tabelle erstellen

```bash
# DynamoDB-Tabelle für Benutzerprofile erstellen
aws dynamodb create-table \
    --table-name mawps-user-profiles \
    --attribute-definitions \
        AttributeName=userId,AttributeType=S \
    --key-schema \
        AttributeName=userId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region eu-central-1
```

## 2. S3-Bucket für Profilbilder erstellen

```bash
# S3-Bucket erstellen
aws s3api create-bucket \
    --bucket mawps-profile-images \
    --region eu-central-1 \
    --create-bucket-configuration LocationConstraint=eu-central-1

# CORS-Konfiguration für S3
cat > cors-config.json << EOF
{
    "CORSRules": [
        {
            "AllowedOrigins": [
                "https://mawps.netlify.app",
                "https://www.manuel-weiss.ch",
                "https://manuel-weiss.ch"
            ],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
            "AllowedHeaders": ["*"],
            "MaxAgeSeconds": 3000
        }
    ]
}
EOF

aws s3api put-bucket-cors \
    --bucket mawps-profile-images \
    --cors-configuration file://cors-config.json

# Public Access Block konfigurieren (für öffentliche Profilbilder)
aws s3api put-public-access-block \
    --bucket mawps-profile-images \
    --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Bucket Policy für öffentlichen Lesezugriff
cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::mawps-profile-images/profile-images/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy \
    --bucket mawps-profile-images \
    --policy file://bucket-policy.json
```

## 3. Lambda-Funktion erstellen

```bash
# Lambda-Code zippen
cd lambda/profile-api
npm init -y
npm install aws-sdk
zip -r ../profile-api.zip .
cd ../..

# IAM-Rolle für Lambda erstellen
cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

aws iam create-role \
    --role-name mawps-profile-lambda-role \
    --assume-role-policy-document file://trust-policy.json

# Berechtigungen zur Rolle hinzufügen
aws iam attach-role-policy \
    --role-name mawps-profile-lambda-role \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# DynamoDB und S3 Berechtigungen
cat > lambda-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:GetItem",
                "dynamodb:PutItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem"
            ],
            "Resource": "arn:aws:dynamodb:eu-central-1:*:table/mawps-user-profiles"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::mawps-profile-images/*"
        }
    ]
}
EOF

aws iam put-role-policy \
    --role-name mawps-profile-lambda-role \
    --policy-name mawps-profile-lambda-policy \
    --policy-document file://lambda-policy.json

# Lambda-Funktion erstellen
aws lambda create-function \
    --function-name mawps-profile-api \
    --runtime nodejs18.x \
    --role arn:aws:iam::YOUR_ACCOUNT_ID:role/mawps-profile-lambda-role \
    --handler index.handler \
    --zip-file fileb://lambda/profile-api.zip \
    --timeout 30 \
    --memory-size 256 \
    --environment Variables="{PROFILE_TABLE=mawps-user-profiles,PROFILE_IMAGES_BUCKET=mawps-profile-images}" \
    --region eu-central-1
```

## 4. API Gateway konfigurieren

Nutzen Sie das bestehende API Gateway oder erstellen Sie ein neues:

```bash
# Neue REST API erstellen (falls noch nicht vorhanden)
aws apigateway create-rest-api \
    --name mawps-api \
    --region eu-central-1

# Resources und Methoden hinzufügen
# Dies kann auch über die AWS Console gemacht werden
```

## 5. Frontend-Konfiguration

Stellen Sie sicher, dass die API-URL in Ihren Frontend-Dateien konfiguriert ist:

```javascript
window.AWS_CONFIG = {
    region: 'eu-central-1',
    userPoolId: 'eu-central-1_8gP4gLK9r',
    clientId: '7kc5tt6a23fgh53d60vkefm812',
    apiBaseUrl: 'https://YOUR-API-ID.execute-api.eu-central-1.amazonaws.com/prod',
    dynamoDB: {
        tableName: 'mawps-user-profiles',
        region: 'eu-central-1'
    }
};
```

## 6. Testen

1. Melden Sie sich auf der Website an
2. Gehen Sie zu Ihrem Profil
3. Ändern Sie einige Daten und speichern Sie
4. Laden Sie ein Profilbild hoch
5. Aktualisieren Sie die Seite und prüfen Sie, ob die Daten erhalten bleiben

## Cleanup-Befehle (falls benötigt)

```bash
# Lambda-Funktion löschen
aws lambda delete-function --function-name mawps-profile-api

# DynamoDB-Tabelle löschen
aws dynamodb delete-table --table-name mawps-user-profiles

# S3-Bucket leeren und löschen
aws s3 rm s3://mawps-profile-images --recursive
aws s3api delete-bucket --bucket mawps-profile-images

# IAM-Rolle löschen
aws iam delete-role-policy --role-name mawps-profile-lambda-role --policy-name mawps-profile-lambda-policy
aws iam detach-role-policy --role-name mawps-profile-lambda-role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
aws iam delete-role --role-name mawps-profile-lambda-role
```

## Troubleshooting

### CORS-Fehler
- Prüfen Sie die CORS-Konfiguration in API Gateway und S3
- Stellen Sie sicher, dass die Origin-URLs korrekt sind

### 401 Unauthorized
- Prüfen Sie, ob der JWT-Token korrekt übertragen wird
- Verifizieren Sie die Cognito-Konfiguration

### 500 Internal Server Error
- Schauen Sie in die CloudWatch Logs der Lambda-Funktion
- Prüfen Sie die IAM-Berechtigungen

## Nächste Schritte

1. Implementieren Sie die Token-Validierung in der Lambda-Funktion
2. Fügen Sie Datenverschlüsselung für sensible Daten hinzu
3. Implementieren Sie Backup-Strategien für DynamoDB
4. Monitoring und Alarme einrichten
