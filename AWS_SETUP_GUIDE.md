# 🚀 AWS Multi-User System Setup Guide

Dieses Guide führt Sie durch die komplette Einrichtung der AWS-Infrastruktur für Ihr Multi-User-Dateiverwaltungssystem.

## 🎯 Was wird eingerichtet?

- ✅ **AWS Cognito** - User Pool + Hosted UI für Benutzerauthentifizierung
- ✅ **S3 Bucket** - Sicherer Dateispeicher mit CORS-Konfiguration
- ✅ **DynamoDB Table** - Dokumenten-Metadaten und Benutzerdaten
- ✅ **Lambda Functions** - 2 Serverless APIs (Upload + Dokumentenverwaltung)
- ✅ **API Gateway** - REST API mit Cognito-Autorisierung
- ✅ **IAM Roles** - Sichere Berechtigungen nach dem Prinzip der geringsten Privilegien

## 🛠️ Option 1: Automatisches Setup (Empfohlen)

### Voraussetzungen:
```bash
# 1. AWS CLI installieren (falls nicht vorhanden)
# macOS:
brew install awscli

# Windows/Linux: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

# 2. AWS-Credentials konfigurieren
aws configure
# Eingeben: Access Key ID, Secret Access Key, Region (eu-central-1), Output format (json)
```

### Deployment ausführen:
```bash
# Einfach das Deployment-Skript ausführen
./deploy-aws.sh
```

**Das war's!** 🎉 Das Skript richtet alles automatisch ein und aktualisiert Ihre Frontend-Dateien mit den richtigen URLs.

## 🔧 Option 2: Manuelles Setup

### Schritt 1: CloudFormation Stack deployen
```bash
aws cloudformation deploy \
    --template-file aws-infrastructure.yaml \
    --stack-name "manuel-weiss-userfiles-stack" \
    --parameter-overrides \
        ProjectName="manuel-weiss-userfiles" \
        DomainName="manuel-weiss.com" \
        AllowedOrigins="https://manuel-weiss.com,http://localhost:8000" \
    --capabilities CAPABILITY_NAMED_IAM \
    --region eu-central-1
```

### Schritt 2: Lambda-Funktionen aktualisieren
```bash
# Upload-URL Lambda
cd backend/upload-url
npm install
zip -r ../../upload-url.zip .
cd ../..

aws lambda update-function-code \
    --function-name "manuel-weiss-userfiles-upload-url" \
    --zip-file "fileb://upload-url.zip"

# Docs Lambda  
cd backend/docs
npm install
zip -r ../../docs.zip .
cd ../..

aws lambda update-function-code \
    --function-name "manuel-weiss-userfiles-docs" \
    --zip-file "fileb://docs.zip"
```

### Schritt 3: Frontend-URLs aktualisieren
```bash
# Stack-Outputs abrufen
aws cloudformation describe-stacks \
    --stack-name "manuel-weiss-userfiles-stack" \
    --query "Stacks[0].Outputs"

# Dann manuell in bewerbung.html und js/docs.js die URLs ersetzen
```

## 🧪 Option 3: AWS CDK (Für Entwickler)

```bash
# CDK installieren
npm install -g aws-cdk

# CDK-Projekt erstellen (optional)
mkdir cdk-infrastructure
cd cdk-infrastructure
cdk init app --language typescript

# Unsere CloudFormation-Template in CDK konvertieren
# (Können wir bei Bedarf bereitstellen)
```

## 📋 Nach dem Deployment

### 1. Testen Sie das System:
```bash
# Health Check
curl https://your-api-id.execute-api.eu-central-1.amazonaws.com/api/docs \
     -H "Authorization: Bearer INVALID_TOKEN"
# Erwartete Antwort: 401 Unauthorized ✅

# Website öffnen
open https://manuel-weiss.com/bewerbung.html
open https://manuel-weiss.com/health.html
```

### 2. Ersten Benutzer erstellen:
- Gehen Sie zu **AWS Cognito Console**
- User Pool: `manuel-weiss-userfiles-users`
- **"Create user"** → Testbenutzer anlegen
- Oder nutzen Sie die Sign-up-Funktionalität auf Ihrer Website

### 3. Monitoring einrichten:
- **CloudWatch Logs** → Lambda-Funktions-Logs überwachen
- **CloudWatch Metrics** → API-Performance beobachten
- **S3 Bucket Metrics** → Speicherverbrauch verfolgen

## 🔍 Troubleshooting

### Problem: API-Aufrufe schlagen fehl
```bash
# CORS-Fehler prüfen
# → Überprüfen Sie AllowedOrigins in CloudFormation
# → Stellen Sie sicher, dass Ihre Domain SSL-Zertifikat hat

# Lambda-Logs prüfen
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/manuel-weiss"
```

### Problem: Login funktioniert nicht
```bash
# Cognito-Konfiguration prüfen
aws cognito-idp describe-user-pool-client \
    --user-pool-id your-pool-id \
    --client-id your-client-id

# Callback-URLs überprüfen
```

### Problem: Upload schlägt fehl
```bash
# S3-Bucket-Berechtigungen prüfen
aws s3api get-bucket-cors --bucket your-bucket-name

# Lambda-Umgebungsvariablen prüfen  
aws lambda get-function-configuration \
    --function-name manuel-weiss-userfiles-upload-url
```

## 💰 Kosten-Schätzung

Für ein kleines bis mittleres Projekt:
- **S3**: ~1-5€/Monat (je nach Speicher & Traffic)
- **DynamoDB**: ~0-3€/Monat (On-Demand Billing)
- **Lambda**: ~0-1€/Monat (1M Aufrufe gratis)
- **API Gateway**: ~0-2€/Monat (1M Aufrufe = ~3,50€)
- **Cognito**: 50.000 MAU gratis, dann 0,0463€/MAU

**Gesamt: 1-15€/Monat** je nach Nutzung

## 🛡️ Sicherheits-Features

- ✅ **Cognito JWT-Tokens** - Sichere Benutzerauthentifizierung
- ✅ **IAM Least Privilege** - Minimale Berechtigungen für alle Services
- ✅ **S3 Private Buckets** - Keine öffentlichen Uploads möglich
- ✅ **API Gateway CORS** - Nur erlaubte Domains
- ✅ **Signed URLs** - Zeitbegrenzte Upload/Download-Links
- ✅ **DynamoDB Encryption** - Alle Daten verschlüsselt at Rest

## 📞 Support

Bei Fragen oder Problemen:
1. Prüfen Sie die **CloudWatch Logs**
2. Nutzen Sie das **health.html** für API-Tests
3. Kontaktieren Sie den Entwickler

---

🎉 **Viel Erfolg mit Ihrem Multi-User-System!** 🎉
