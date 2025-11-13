# AWS Lambda Backend für MAWPS

## Struktur

```
lambda/
├── profile-api/          # User Profile & Progress API
│   ├── index.js         # Lambda handler
│   └── package.json     # Dependencies
├── documents-api/        # Documents Management API
│   ├── index.js         # Lambda handler
│   └── package.json     # Dependencies
├── deploy-aws-backend.sh # Deployment script
└── README.md            # Diese Datei
```

## Deployment

### Voraussetzungen

1. AWS CLI installiert und konfiguriert
2. Node.js 20.x oder höher
3. Ausreichende AWS Berechtigungen für:
   - Lambda
   - DynamoDB
   - S3
   - API Gateway
   - IAM

### Deployment ausführen

```bash
# Im lambda/ Verzeichnis
chmod +x deploy-aws-backend.sh
./deploy-aws-backend.sh
```

Das Script führt automatisch aus:
1. Erstellt DynamoDB Tabellen
2. Erstellt IAM Rolle mit Berechtigungen
3. Installiert Dependencies für beide Funktionen
4. Erstellt/Updated Lambda-Funktionen
5. Konfiguriert API Gateway
6. Gibt die API Endpoint URL aus

### Manuelle Installation (falls Script fehlschlägt)

```bash
# Profile API
cd profile-api
npm install
zip -r ../profile-api.zip .
aws lambda create-function --function-name mawps-profile-api ...

# Documents API  
cd ../documents-api
npm install
zip -r ../documents-api.zip .
aws lambda create-function --function-name mawps-documents-api ...
```

## API Endpoints

Nach dem Deployment erhalten Sie eine URL wie:
```
https://YOUR-API-ID.execute-api.eu-central-1.amazonaws.com/prod
```

### Profile API Endpoints:
- `GET /profile` - User Profile abrufen
- `POST /profile` - User Profile speichern
- `GET /profile/upload-url` - Presigned URL für Profilbild

### Documents API Endpoints:
- `GET /documents` - Alle Dokumente auflisten
- `POST /documents` - Dokument-Metadaten speichern
- `GET /documents/{id}` - Einzelnes Dokument
- `DELETE /documents/{id}` - Dokument löschen
- `POST /documents/upload-url` - Presigned URL für Upload
- `GET /documents/{id}/download-url` - Presigned URL für Download

## Umgebungsvariablen

Die Lambda-Funktionen benötigen:
- `USER_POOL_ID` - Cognito User Pool ID
- `USER_POOL_CLIENT_ID` - Cognito Client ID
- `PROFILE_TABLE` - DynamoDB Tabelle für Profile
- `DOCUMENTS_TABLE` - DynamoDB Tabelle für Dokumente
- `S3_BUCKET` - S3 Bucket für Dateien
- `REGION` - AWS Region

Diese werden automatisch vom Deployment-Script gesetzt.

## Debugging

### CloudWatch Logs
```bash
# Profile API Logs
aws logs tail /aws/lambda/mawps-profile-api --follow

# Documents API Logs
aws logs tail /aws/lambda/mawps-documents-api --follow
```

### Lokales Testen
```javascript
// Test event für Profile API
{
  "httpMethod": "GET",
  "path": "/profile",
  "headers": {
    "Authorization": "Bearer YOUR_JWT_TOKEN"
  }
}
```

## Kosten

- Lambda: Erste 1M Requests/Monat kostenlos
- DynamoDB: Pay-per-Request, sehr günstig
- S3: $0.023 pro GB/Monat
- API Gateway: $3.50 pro Million Requests

Für normale Nutzung fallen praktisch keine Kosten an.
