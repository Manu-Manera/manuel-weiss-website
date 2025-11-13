# API Gateway URL Setup

## ✅ Status

Alle HTML-Dateien wurden mit der Standard-API Gateway URL-Struktur aktualisiert:
```
https://YOUR-API-ID.execute-api.eu-central-1.amazonaws.com/prod
```

## 🔍 So finden Sie Ihre tatsächliche API Gateway URL

### Option 1: AWS Console

1. Gehen Sie zu [AWS Console](https://console.aws.amazon.com/)
2. Navigieren Sie zu **API Gateway**
3. Wählen Sie Ihre API aus (z.B. `mawps-api` oder ähnlich)
4. Klicken Sie auf **Stages** im linken Menü
5. Wählen Sie den Stage aus (z.B. `prod`)
6. Kopieren Sie die **Invoke URL** (z.B. `https://abc123xyz.execute-api.eu-central-1.amazonaws.com/prod`)

### Option 2: AWS CLI

```bash
# Liste aller APIs
aws apigateway get-rest-apis --region eu-central-1

# Hole die API-ID (ersetzen Sie YOUR-API-NAME)
API_ID=$(aws apigateway get-rest-apis --region eu-central-1 --query "items[?name=='YOUR-API-NAME'].id" --output text)

# Hole die Invoke URL
aws apigateway get-stage \
    --rest-api-id $API_ID \
    --stage-name prod \
    --region eu-central-1 \
    --query "invokeUrl" \
    --output text
```

### Option 3: CloudFormation (falls verwendet)

```bash
aws cloudformation describe-stacks \
    --stack-name YOUR-STACK-NAME \
    --region eu-central-1 \
    --query "Stacks[0].Outputs[?OutputKey=='ApiGatewayUrl'].OutputValue" \
    --output text
```

## 🔧 API Gateway URL aktualisieren

### Methode 1: Automatisch mit Skript

1. Öffnen Sie `update-all-api-urls.sh`
2. Ersetzen Sie `YOUR-API-ID` mit Ihrer tatsächlichen API Gateway ID
3. Führen Sie das Skript aus:
```bash
bash update-all-api-urls.sh
```

### Methode 2: Manuell in allen Dateien

Suchen und ersetzen Sie in allen HTML-Dateien:
- **Alt:** `https://YOUR-API-ID.execute-api.eu-central-1.amazonaws.com/prod`
- **Neu:** `https://IHR-API-ID.execute-api.eu-central-1.amazonaws.com/prod`

### Methode 3: Mit sed (Linux/Mac)

```bash
# Ersetzen Sie YOUR-API-ID mit Ihrer tatsächlichen API-ID
API_ID="IHR-API-ID"
find . -name "*.html" -type f -exec sed -i '' "s/YOUR-API-ID/$API_ID/g" {} \;
```

## 📋 Aktualisierte Dateien

Die folgenden Dateien wurden aktualisiert:
- ✅ `index.html`
- ✅ `website-services.html`
- ✅ `user-profile.html`
- ✅ `persoenlichkeitsentwicklung-uebersicht.html`
- ✅ `persoenlichkeitsentwicklung.html`
- ✅ `ikigai.html`
- ✅ `applications/index.html`
- ✅ `applications/profile-setup.html`
- ✅ `applications/document-upload.html`
- ✅ `applications/interview-prep.html`
- ✅ `applications/application-generator.html`
- ✅ `applications/tracking-dashboard.html`

## 🧪 Testen

Nach dem Aktualisieren der URL:

1. Öffnen Sie die Browser-Konsole (F12)
2. Navigieren Sie zu einer Seite mit Profil-Funktionalität
3. Prüfen Sie, ob `window.AWS_CONFIG.apiBaseUrl` die korrekte URL enthält
4. Versuchen Sie, Profildaten zu speichern
5. Prüfen Sie die Network-Tab für API-Aufrufe

## ⚠️ Wichtig

- Die API Gateway URL muss mit `/prod` enden (oder dem entsprechenden Stage-Namen)
- Stellen Sie sicher, dass CORS in API Gateway korrekt konfiguriert ist
- Die Lambda-Funktion muss die richtigen Berechtigungen haben

## 🆘 Troubleshooting

### CORS-Fehler
- Prüfen Sie die CORS-Konfiguration in API Gateway
- Stellen Sie sicher, dass Ihre Domain in den erlaubten Origins ist

### 403 Forbidden
- Prüfen Sie die IAM-Berechtigungen der Lambda-Funktion
- Stellen Sie sicher, dass die API Gateway Resource Policy korrekt ist

### 404 Not Found
- Prüfen Sie, ob die API Gateway URL korrekt ist
- Stellen Sie sicher, dass der Stage-Name (`prod`) korrekt ist
