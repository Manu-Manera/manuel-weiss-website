# 🏗️ Aktuelle Deployment-Architektur

> **Erstellt:** 2026-01-21  
> **Aktualisiert:** 2026-01-24  
> **Status:** ✅ Vollständig auf AWS migriert (Netlify abgeklemmt)

---

## 📊 ARCHITEKTUR-ÜBERSICHT

```
┌─────────────────────────────────────────────────────────────┐
│              LOKALE ENTWICKLUNG (Cursor/IDE)               │
│  • Dateien bearbeiten                                       │
│  • Änderungen speichern                                     │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              GIT COMMIT & PUSH (GitHub)                    │
│  • git add .                                                 │
│  • git commit -m "..."                                      │
│  • git push origin main                                     │
└─────────────────────────────────────────────────────────────┘
                        │
                        ├──────────────────────┐
                        ▼                      ▼
        ┌─────────────────────────┐  ┌─────────────────────────┐
        │   AWS S3 + CloudFront   │  │   AWS Backend           │
        │   (Frontend - LIVE)     │  │                         │
        │                         │  │  • Lambda Functions     │
        │  ✅ VOLLSTÄNDIG         │  │  • API Gateway          │
        │     DEPLOYED            │  │  • DynamoDB             │
        │                         │  │  • S3 (Media)           │
        │  • HTML/CSS/JS          │  │  • Cognito (Auth)       │
        │  • Static Files         │  │                         │
        │                         │  │  URL:                   │
        │  URL:                   │  │  https://of2iwj7h2c... │
        │  https://manuel-weiss.ch │  │                         │
        └─────────────────────────┘  └─────────────────────────┘
                        │                      │
                        └──────────┬───────────┘
                                   ▼
                    ┌──────────────────────────┐
                    │   LIVE PRODUCTION        │
                    │   https://manuel-weiss.ch │
                    └──────────────────────────┘
```

---

## 🎯 FRONTEND DEPLOYMENT (AWS S3 + CloudFront)

### **Status:** ✅ VOLLSTÄNDIG MIGRIERT

### **Aktuelles System:**
- **Hosting:** AWS S3 Static Website Hosting
- **CDN:** CloudFront Distribution
- **Domain:** `manuel-weiss.ch` → CloudFront
- **SSL:** ACM Certificate (via CloudFront)

### **S3 Bucket:**
```
Bucket: manuel-weiss-website
Region: eu-central-1
Type: Static Website Hosting
Index: index.html
Error: 404.html
```

### **CloudFront Distribution:**
```
Distribution ID: E305V0ATIXMNNG
Origin: manuel-weiss-website.s3-website.eu-central-1.amazonaws.com
Domain: d1234567890.cloudfront.net (via manuel-weiss.ch)
SSL: ACM Certificate
```

### **Deployment-Workflow:**
```bash
# 1. Dateien lokal ändern
# 2. Auf S3 hochladen
aws s3 sync . s3://manuel-weiss-website \
  --exclude "*.git/*" \
  --exclude "node_modules/*" \
  --exclude "infrastructure/*" \
  --exclude "lambda/*" \
  --exclude "netlify/*" \
  --region eu-central-1

# 3. CloudFront Cache invalidiert
aws cloudfront create-invalidation \
  --distribution-id E305V0ATIXMNNG \
  --paths "/*" \
  --region eu-central-1
```

### **Was wird deployed:**
- ✅ Alle HTML-Dateien (`*.html`)
- ✅ JavaScript-Dateien (`js/*.js`, `applications/js/*.js`)
- ✅ CSS-Dateien (`css/*.css`, `styles.css`, `admin-styles.css`)
- ✅ Bilder (`images/*`)
- ✅ Alle statischen Assets

### **Deployment-Zeit:**
- **S3 Upload:** ~1-2 Minuten
- **CloudFront Invalidation:** ~2-5 Minuten
- **Gesamt:** ~3-7 Minuten

---

## ☁️ BACKEND DEPLOYMENT (AWS)

### **Status:** ✅ VOLLSTÄNDIG DEPLOYED

### **AWS Infrastruktur:**

#### **Region:** `eu-central-1` (Frankfurt)

#### **Lambda Functions:**
```
manuel-weiss-profile-media-PresignFunction-JE5AxO7R2uYd
├── Runtime: nodejs18.x
├── Handler: index.handler
├── Timeout: 30s
├── Memory: 256 MB
└── Endpoints:
    ├── POST /profile-image/upload-url
    ├── POST /document/upload-url
    ├── POST /website-images
    └── GET /website-images/{userId}
```

#### **API Gateway:**
```
Base URL: https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod
├── /profile-image/upload-url
├── /document/upload-url
├── /website-images
└── /website-images/{userId}
```

#### **DynamoDB:**
```
Table: mawps-user-profiles
├── Key: userId (String)
├── Billing: PAY_PER_REQUEST
└── Region: eu-central-1
```

#### **S3 Bucket (Media):**
```
Bucket: manuel-weiss-public-media
├── Region: eu-central-1
├── Public Access: ✅ Enabled
└── Structure:
    └── public/
        ├── profile-images/
        └── documents/
```

#### **Cognito:**
```
User Pool ID: eu-central-1_8gP4gLK9r
Client ID: 7kc5tt6a23fgh53d60vkefm812
Region: eu-central-1
```

### **Deployment-Workflow:**
```bash
# Lambda Function Update
cd lambda/profile-api
npm install --production
zip -r ../profile-api-update.zip .
aws lambda update-function-code \
  --function-name manuel-weiss-profile-media-PresignFunction-JE5AxO7R2uYd \
  --zip-file fileb://../profile-api-update.zip \
  --region eu-central-1
```

### **Deployment-Zeit:**
- **Lambda Update:** ~2-3 Minuten
- **Gesamt:** ~2-3 Minuten

---

## ✅ MIGRATION ABGESCHLOSSEN

### **Status:** ✅ Vollständig auf AWS migriert

### **Netlify:**
- **Status:** ❌ Abgeklemmt (nicht mehr in Verwendung)
- **Grund:** Vollständige Migration zu AWS S3 + CloudFront + Lambda + API Gateway

### **Migration-Status:**
- ✅ Frontend: Vollständig migriert zu AWS S3 + CloudFront
- ✅ Backend: Vollständig migriert zu AWS Lambda + API Gateway
- ✅ Alle Functions: Migriert zu AWS Lambda

**Hinweis:** Die `netlify/functions/` Dateien sind noch im Repository vorhanden, werden aber nicht mehr verwendet.

---

## 📋 DEPLOYMENT-WORKFLOWS

### **Frontend-Änderungen (HTML/JS/CSS):**

```bash
# 1. Code ändern in Cursor/IDE
# 2. Auf S3 hochladen
aws s3 sync . s3://manuel-weiss-website \
  --exclude "*.git/*" \
  --exclude "node_modules/*" \
  --exclude "infrastructure/*" \
  --exclude "lambda/*" \
  --exclude "netlify/*" \
  --region eu-central-1

# 3. CloudFront Cache invalidiert
aws cloudfront create-invalidation \
  --distribution-id E305V0ATIXMNNG \
  --paths "/*" \
  --region eu-central-1

# ✅ Fertig! (3-7 Minuten)
```

### **Backend-Änderungen (Lambda):**

```bash
# 1. Lambda Code ändern
# 2. Deployment-Skript ausführen
cd lambda/profile-api
npm install --production
zip -r ../profile-api-update.zip .
aws lambda update-function-code \
  --function-name manuel-weiss-profile-media-PresignFunction-JE5AxO7R2uYd \
  --zip-file fileb://../profile-api-update.zip \
  --region eu-central-1

# ✅ Fertig! (2-3 Minuten)
```

### **Komplettes Deployment:**

```bash
# Frontend + Backend
# 1. Frontend: S3 Sync + CloudFront Invalidation
# 2. Backend: Lambda Update
# Gesamt: ~5-10 Minuten
```

---

## 🎯 WICHTIGE ENDPUNKTE

### **Frontend:**
- **Live Website:** `https://manuel-weiss.ch`
- **CloudFront:** `d1234567890.cloudfront.net`
- **S3 Bucket:** `manuel-weiss-website`

### **Backend:**
- **API Base URL:** `https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod`
- **Cognito:** `eu-central-1_8gP4gLK9r`
- **DynamoDB:** `mawps-user-profiles`
- **S3 Media:** `manuel-weiss-public-media`

### **Legacy (nicht mehr in Verwendung):**
- **Netlify:** `https://mawps.netlify.app` (abgeklemmt)
- **Netlify Functions:** `/.netlify/functions/*` (migriert zu AWS Lambda)

---

## 🔐 AWS KONFIGURATION

### **Credentials:**
```bash
# AWS CLI konfiguriert mit:
aws configure --profile cdk-deploy-admin

# Oder Environment Variables:
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_DEFAULT_REGION=eu-central-1
```

### **Benötigte Berechtigungen:**
- S3: `s3:PutObject`, `s3:GetObject`, `s3:ListBucket`
- CloudFront: `cloudfront:CreateInvalidation`
- Lambda: `lambda:UpdateFunctionCode`
- API Gateway: `apigateway:*`
- DynamoDB: `dynamodb:*`
- Cognito: `cognito-idp:*`

---

## 📊 DEPLOYMENT-STATUS

| Komponente | Deployment-Methode | Automatisierung | Zeit | Status |
|------------|-------------------|-----------------|------|--------|
| **Frontend (S3 + CloudFront)** | `aws s3 sync` + Invalidation | ⚠️ Manuell | 3-7 Min | ✅ Live |
| **Backend (Lambda)** | `aws lambda update-function-code` | ⚠️ Manuell | 2-3 Min | ✅ Live |
| **Netlify (Fallback)** | Git Push → Auto-Deploy | ✅ Automatisch | 2-3 Min | ⚠️ Aktiv |
| **CDK Stacks** | `cdk deploy` | ⚠️ Manuell | 5-10 Min | ✅ Deployed |

---

## 🚨 FEHLERBEHEBUNG

### **Problem: Frontend deployed, aber Änderungen nicht sichtbar**
**Lösung:**
1. CloudFront Cache invalidiert? → `aws cloudfront create-invalidation`
2. Browser-Cache leeren (Cmd+Shift+R / Ctrl+Shift+R)
3. Prüfe S3 Upload: `aws s3 ls s3://manuel-weiss-website --recursive`

### **Problem: Lambda Function deployed, aber API antwortet nicht**
**Lösung:**
1. Lambda Logs prüfen: AWS Console → Lambda → Function → Logs
2. API Gateway Routes prüfen: AWS Console → API Gateway → Routes
3. CORS Headers prüfen (müssen in Lambda Response sein)

### **Problem: S3 Upload fehlgeschlagen**
**Lösung:**
1. AWS Credentials prüfen: `aws sts get-caller-identity`
2. S3 Bucket-Berechtigungen prüfen
3. Region prüfen: `eu-central-1`

---

## 💡 EMPFEHLUNGEN

### **Für Frontend-Änderungen:**
1. ✅ **Immer:** S3 Sync + CloudFront Invalidation
2. ✅ **Cache-Busting:** Versionsnummern in JS/CSS erhöhen (`?v=20260121`)
3. ✅ **Testing:** Lokal testen vor Upload

### **Für Backend-Änderungen:**
1. ⚠️ **Immer:** Lambda Deployment-Skript ausführen
2. ⚠️ **Testing:** Lambda lokal testen (falls möglich)
3. ⚠️ **Logs:** AWS CloudWatch Logs prüfen nach Deployment

### **Für Automatisierung:**
1. 🔄 **GitHub Actions:** Automatisches S3 Sync bei Push
2. 🔄 **CI/CD Pipeline:** Automatisches Deployment
3. 🔄 **Monitoring:** CloudWatch Alarms für Fehler

---

## ✅ ZUSAMMENFASSUNG

**Aktuelle Architektur:**
- ✅ **Frontend:** AWS S3 + CloudFront (vollständig migriert)
- ✅ **Backend:** AWS Lambda + API Gateway + DynamoDB + S3
- ⚠️ **Fallback:** Netlify (noch aktiv, aber nicht primär)

**Deployment:**
- ⚠️ **Frontend:** Manuell (S3 Sync + CloudFront Invalidation)
- ⚠️ **Backend:** Manuell (Lambda Update)
- ✅ **Netlify:** Automatisch (Git Push)

**Nächste Schritte:**
- 🔄 Automatisierung: GitHub Actions für S3 Sync
- 🔄 Netlify deaktivieren: Nach vollständiger Migration
- 🔄 Monitoring: CloudWatch Alarms einrichten

---

*Letzte Aktualisierung: 2026-01-21*  
*Status: ✅ Hybrid-System aktiv (AWS primär, Netlify Fallback)*
