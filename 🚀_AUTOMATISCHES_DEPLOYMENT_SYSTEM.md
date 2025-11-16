# 🚀 AUTOMATISCHES DEPLOYMENT-SYSTEM
## Vollständige Dokumentation des Deployment-Konstrukts

> **⚠️ WICHTIG: Diese Datei beschreibt das KOMPLETTE automatische Deployment-System!**
> **Alle Änderungen werden automatisch deployed - Frontend UND Backend!**

---

## 📋 ÜBERSICHT: DAS KOMPLETTE SYSTEM

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOKALE ENTWICKLUNG                          │
│  Cursor/IDE → Dateien bearbeiten                               │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GITHUB DESKTOP                              │
│  Commit + Push → GitHub Repository                             │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ├─────────────────┐
                            ▼                 ▼
        ┌──────────────────────────┐  ┌──────────────────────────┐
        │   NETLIFY (Frontend)     │  │   AWS (Backend)          │
        │                          │  │                          │
        │  • Auto-Deploy           │  │  • Lambda Functions       │
        │  • Static Site           │  │  • API Gateway           │
        │  • https://mawps...      │  │  • DynamoDB               │
        │                          │  │  • S3 Bucket             │
        └──────────────────────────┘  └──────────────────────────┘
                            │                 │
                            └────────┬────────┘
                                     ▼
                        ┌────────────────────────┐
                        │   LIVE WEBSITE         │
                        │   https://mawps...     │
                        └────────────────────────┘
```

---

## 🎯 AUTOMATISCHES DEPLOYMENT: ZWEI SYSTEME

### **SYSTEM 1: Frontend (Netlify) - VOLLSTÄNDIG AUTOMATISCH**

```
GitHub Push → Netlify Webhook → Auto-Deploy → Live Website
```

**Was wird deployed:**
- ✅ Alle HTML-Dateien
- ✅ JavaScript-Dateien (`js/`)
- ✅ CSS-Dateien (`styles.css`, `css/`)
- ✅ Bilder (`images/`)
- ✅ Netlify Functions (`netlify/functions/`)

**Konfiguration:**
- **Datei:** `netlify.toml`
- **Build Command:** `echo 'Static site - no build required'`
- **Publish:** `.` (Root-Verzeichnis)
- **Auto-Deploy:** ✅ Aktiviert für `main` Branch

**Deployment-Zeit:** ~2-3 Minuten

---

### **SYSTEM 2: Backend (AWS Lambda) - AUTOMATISCH ÜBER SKRIPT**

```
Code ändern → Deployment-Skript ausführen → AWS Lambda updated → Live API
```

**Was wird deployed:**
- ✅ Lambda Functions (`lambda/profile-api/`)
- ✅ API Gateway Endpoints
- ✅ DynamoDB Tabellen (werden automatisch erstellt)
- ✅ S3 Bucket Policies

**Konfiguration:**
- **Deployment-Skript:** `lambda/deploy-aws-backend.sh`
- **SAM Template:** `infrastructure/profile-media-sam.yaml`
- **Region:** `eu-central-1`

**Deployment-Zeit:** ~5-10 Minuten

---

## 🔧 BACKEND DEPLOYMENT: LAMBDA FUNCTIONS

### **Lambda-Funktionen im System:**

#### 1. **PresignFunction** (für S3 Upload URLs)
- **Name:** `manuel-weiss-profile-media-PresignFunction-JE5AxO7R2uYd`
- **Code:** `lambda-profile-image/index.js`
- **Endpoints:**
  - `POST /profile-image/upload-url` → Presigned URL für Profilbilder
  - `POST /document/upload-url` → Presigned URL für Dokumente
- **Deployment:** Über SAM Template (`deploy/deploy-profile-media.sh`)

#### 2. **Profile API Function** (für DynamoDB)
- **Name:** `mawps-profile-api` (oder ähnlich)
- **Code:** `lambda/profile-api/index.js`
- **Endpoints:**
  - `GET /profile/{userId}` → Profil laden
  - `POST /profile` → Profil speichern
  - `POST /profile/upload-url` → Presigned URL (alternativ)
  - `POST /website-images` → **Website-Bilder speichern** ✅ NEU
  - `GET /website-images/{userId}` → **Website-Bilder laden** ✅ NEU
- **Deployment:** Über `lambda/deploy-aws-backend.sh`

---

## 🚀 AUTOMATISCHES DEPLOYMENT-SKRIPT

### **Vollständiges Deployment (Frontend + Backend):**

```bash
#!/bin/bash
# 🚀 AUTOMATISCHES DEPLOYMENT - Frontend & Backend

set -e

echo "🚀 STARTE AUTOMATISCHES DEPLOYMENT..."
echo ""

# 1. Frontend Deployment (über GitHub)
echo "📦 Frontend wird über GitHub Desktop deployed..."
echo "   → Commit + Push zu GitHub"
echo "   → Netlify deployt automatisch (2-3 Min)"
echo ""

# 2. Backend Deployment (Lambda Functions)
echo "☁️ Backend Deployment startet..."

cd lambda/profile-api

# Dependencies installieren
echo "📥 Installiere Dependencies..."
npm install --production

# Deployment Package erstellen
echo "📦 Erstelle Deployment Package..."
zip -r ../profile-api-update.zip . -x "*.git*" "node_modules/.cache/*"

cd ../..

# Lambda Function updaten
echo "☁️ Update Lambda Function..."
aws lambda update-function-code \
    --function-name manuel-weiss-profile-media-PresignFunction-JE5AxO7R2uYd \
    --zip-file fileb://lambda/profile-api-update.zip \
    --region eu-central-1

echo "✅ Lambda Function deployed!"
echo ""

# Cleanup
rm -f lambda/profile-api-update.zip

echo "🎉 DEPLOYMENT ABGESCHLOSSEN!"
echo ""
echo "Frontend: https://mawps.netlify.app"
echo "Backend API: https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod"
```

---

## 📁 DATEI-STRUKTUR & DEPLOYMENT

### **Frontend-Dateien (Netlify Auto-Deploy):**
```
/
├── index.html                    → Auto-Deploy ✅
├── admin.html                    → Auto-Deploy ✅
├── js/                           → Auto-Deploy ✅
│   ├── aws-profile-api.js        → Auto-Deploy ✅
│   └── admin/sections/           → Auto-Deploy ✅
├── styles.css                    → Auto-Deploy ✅
└── netlify.toml                  → Konfiguration
```

### **Backend-Dateien (Lambda Manual Deploy):**
```
lambda/
├── profile-api/
│   ├── index.js                  → Lambda Handler
│   └── package.json              → Dependencies
├── profile-image/
│   └── index.js                  → Presign Function
└── deploy-aws-backend.sh         → Deployment-Skript
```

---

## 🔄 DEPLOYMENT-WORKFLOW

### **Workflow 1: Frontend-Änderungen (HTML/JS/CSS)**

```bash
1. Dateien in Cursor/IDE bearbeiten
2. GitHub Desktop öffnen
3. Commit erstellen
4. "Push origin" klicken
5. Netlify deployt automatisch (2-3 Min)
6. Website ist live ✅
```

**Zeit:** ~3-5 Minuten

---

### **Workflow 2: Backend-Änderungen (Lambda Functions)**

```bash
1. Lambda Code ändern (lambda/profile-api/index.js)
2. Terminal öffnen
3. Deployment-Skript ausführen:
   cd lambda/profile-api
   npm install --production
   zip -r ../profile-api-update.zip .
   aws lambda update-function-code \
     --function-name manuel-weiss-profile-media-PresignFunction-JE5AxO7R2uYd \
     --zip-file fileb://../profile-api-update.zip \
     --region eu-central-1
4. Lambda Function ist live ✅
```

**Zeit:** ~5-10 Minuten

---

### **Workflow 3: Komplettes Deployment (Frontend + Backend)**

```bash
# Automatisches Skript ausführen:
./🚀_DEPLOY_ALL.sh
```

**Zeit:** ~10-15 Minuten

---

## 🛠️ DEPLOYMENT-SKRIPTE

### **1. Frontend Deployment (automatisch)**
- **Methode:** GitHub Desktop → Push → Netlify Auto-Deploy
- **Skript:** Nicht nötig (automatisch)
- **Konfiguration:** `netlify.toml`

### **2. Backend Deployment (Lambda)**
- **Skript:** `lambda/deploy-aws-backend.sh`
- **Oder:** Manuell über AWS CLI (siehe oben)

### **3. Profile Media Stack (SAM)**
- **Skript:** `deploy/deploy-profile-media.sh`
- **Template:** `infrastructure/profile-media-sam.yaml`
- **Verwendet:** AWS SAM CLI

---

## 📊 AWS INFRASTRUKTUR

### **Lambda Functions:**
```
manuel-weiss-profile-media-PresignFunction-JE5AxO7R2uYd
├── Runtime: nodejs18.x
├── Handler: index.handler
├── Timeout: 30s
├── Memory: 256 MB
└── Endpoints:
    ├── POST /profile-image/upload-url
    └── POST /document/upload-url
```

### **API Gateway:**
```
https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod
├── /profile-image/upload-url (PresignFunction)
├── /website-images (Profile API) ✅ NEU
└── /website-images/{userId} (Profile API) ✅ NEU
```

### **DynamoDB:**
```
Table: mawps-user-profiles
├── Key: userId (String)
├── Item: {
│     userId: "owner",
│     profileImageDefault: "https://s3.../image1.jpg",
│     profileImageHover: "https://s3.../image2.jpg",
│     type: "website-images",
│     updatedAt: "2025-11-16T..."
│   }
└── Billing: PAY_PER_REQUEST
```

### **S3 Bucket:**
```
Bucket: manuel-weiss-public-media
├── Region: eu-central-1
├── Public Access: ✅ Enabled (für Bilder)
└── Structure:
    └── public/
        ├── profile-images/
        │   └── owner/
        │       └── profile/
        │           └── [timestamp]-[random].jpg
        └── documents/
            └── owner/
                └── cv/
                    └── [timestamp]-[random].pdf
```

---

## 🔐 AWS KONFIGURATION

### **Region:**
```
eu-central-1 (Frankfurt)
```

### **Cognito User Pool:**
```
User Pool ID: eu-central-1_8gP4gLK9r
Client ID: 7kc5tt6a23fgh53d60vkefm812
```

### **API Gateway:**
```
Base URL: https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod
```

### **DynamoDB:**
```
Table: mawps-user-profiles
Region: eu-central-1
```

### **S3:**
```
Bucket: manuel-weiss-public-media
Region: eu-central-1
```

---

## 🚀 SCHNELL-DEPLOYMENT: ALLES IN EINEM

### **Vollautomatisches Deployment-Skript:**

```bash
#!/bin/bash
# 🚀 DEPLOY_ALL.sh - Deployt Frontend UND Backend automatisch

set -e

echo "🚀 STARTE KOMPLETTES DEPLOYMENT..."
echo ""

# 1. Frontend: Git Commit & Push
echo "📦 Frontend Deployment..."
git add -A
git commit -m "Auto-deploy: $(date +%Y-%m-%d_%H-%M-%S)" || echo "Keine Änderungen"
git push origin main || echo "Push fehlgeschlagen - bitte manuell pushen"
echo "✅ Frontend wird über Netlify deployed (2-3 Min)"
echo ""

# 2. Backend: Lambda Function Update
echo "☁️ Backend Deployment..."

cd lambda/profile-api

# Dependencies
npm install --production --silent

# Package
zip -r ../profile-api-update.zip . -x "*.git*" "node_modules/.cache/*" > /dev/null

# Deploy
aws lambda update-function-code \
    --function-name manuel-weiss-profile-media-PresignFunction-JE5AxO7R2uYd \
    --zip-file fileb://../profile-api-update.zip \
    --region eu-central-1 \
    --output json > /dev/null

# Cleanup
rm -f ../profile-api-update.zip

cd ../..

echo "✅ Backend deployed!"
echo ""
echo "🎉 DEPLOYMENT ABGESCHLOSSEN!"
echo ""
echo "Frontend: https://mawps.netlify.app (wird in 2-3 Min live sein)"
echo "Backend: https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod"
```

---

## 📝 DEPLOYMENT-CHECKLISTE

### **Vor jedem Deployment:**

#### Frontend:
- [ ] Code getestet (lokal)
- [ ] Cache-Busting-Versionen erhöht (falls JS geändert)
- [ ] `netlify.toml` korrekt
- [ ] Keine Build-Fehler

#### Backend:
- [ ] Lambda Code getestet
- [ ] Dependencies aktuell (`npm install`)
- [ ] AWS Credentials konfiguriert
- [ ] Lambda Function Name korrekt

---

## 🔍 DEPLOYMENT-STATUS PRÜFEN

### **Frontend (Netlify):**
```bash
# Browser:
https://mawps.netlify.app

# Netlify Dashboard:
https://app.netlify.com/projects/mawps/deploys
```

### **Backend (AWS Lambda):**
```bash
# Lambda Function Status:
aws lambda get-function \
  --function-name manuel-weiss-profile-media-PresignFunction-JE5AxO7R2uYd \
  --region eu-central-1 \
  --query "Configuration.{LastModified:LastModified,CodeSize:CodeSize}"

# API Gateway Test:
curl -X POST "https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod/profile-image/upload-url" \
  -H "Content-Type: application/json" \
  -d '{"contentType":"image/jpeg","userId":"owner"}'
```

---

## 🎯 WICHTIGE ENDPUNKTE

### **Frontend:**
- **Live Website:** https://mawps.netlify.app
- **Admin Panel:** https://mawps.netlify.app/admin
- **Netlify Dashboard:** https://app.netlify.com/projects/mawps

### **Backend:**
- **API Base URL:** https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod
- **Presigned URL:** `POST /profile-image/upload-url`
- **Website Images Save:** `POST /website-images` ✅ NEU
- **Website Images Load:** `GET /website-images/owner` ✅ NEU

---

## 🔄 AUTOMATISIERUNG

### **Was wird automatisch deployed:**

#### ✅ **Automatisch (ohne Skript):**
- Frontend (HTML/JS/CSS) → GitHub Push → Netlify
- Netlify Functions → GitHub Push → Netlify

#### ⚠️ **Manuell (mit Skript):**
- Lambda Functions → `lambda/deploy-aws-backend.sh`
- SAM Stack → `deploy/deploy-profile-media.sh`

---

## 🚨 FEHLERBEHEBUNG

### **Problem: Frontend deployed, aber Änderungen nicht sichtbar**
**Lösung:**
1. Browser-Cache leeren (Cmd+Shift+R)
2. Netlify Cache leeren (Dashboard → Deploys → "Clear cache and deploy")
3. Cache-Busting-Version prüfen (`?v=20250116`)

### **Problem: Lambda Function deployed, aber API antwortet nicht**
**Lösung:**
1. Lambda Logs prüfen: AWS Console → Lambda → Function → Logs
2. API Gateway Routes prüfen: AWS Console → API Gateway → Routes
3. CORS Headers prüfen (müssen in Lambda Response sein)

### **Problem: DynamoDB Endpoint gibt 404**
**Lösung:**
1. Prüfe ob `/website-images` Route in API Gateway existiert
2. Prüfe ob Lambda Function den Endpoint unterstützt
3. Prüfe Lambda Logs für Fehler

---

## 📚 ZUSÄTZLICHE DOKUMENTATION

- **Frontend Deployment:** `🚀_DEPLOYMENT_FINAL.md`
- **AWS Setup:** `AWS_PROFILE_SETUP.md`
- **Lambda Deployment:** `lambda/README.md`
- **SAM Deployment:** `deploy/deploy-profile-media.sh`

---

## ✅ ZUSAMMENFASSUNG

**Frontend:** ✅ Vollautomatisch über GitHub Desktop → Netlify  
**Backend:** ⚠️ Manuell über Deployment-Skripte

**Empfehlung:** 
- Frontend-Änderungen: GitHub Desktop verwenden ✅
- Backend-Änderungen: Deployment-Skript ausführen ⚠️

---

**Letzte Aktualisierung:** 2025-11-16  
**Version:** 2.0  
**Status:** ✅ Aktiv & Vollständig

---

> **💡 ERINNERUNG:** Diese Datei sollte bei JEDER Änderung am System gelesen werden, um sicherzustellen, dass das Deployment korrekt durchgeführt wird!

