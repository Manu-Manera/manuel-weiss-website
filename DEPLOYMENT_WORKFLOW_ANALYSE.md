# 🚀 DEPLOYMENT-WORKFLOW ANALYSE
## Vollständige Übersicht des aktuellen Deployment-Systems

> **Erstellt:** $(date +%Y-%m-%d)  
> **Status:** ✅ Aktiv

---

## 📋 ÜBERSICHT: DAS KOMPLETTE SYSTEM

```
┌─────────────────────────────────────────────────────────────┐
│              LOKALE ENTWICKLUNG (Cursor/IDE)               │
│  • Dateien bearbeiten                                       │
│  • Änderungen speichern                                     │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              GIT COMMIT & PUSH                              │
│  • git add .                                                 │
│  • git commit -m "..."                                      │
│  • git push origin main                                     │
└─────────────────────────────────────────────────────────────┘
                        │
                        ├──────────────────────┐
                        ▼                      ▼
        ┌─────────────────────────┐  ┌─────────────────────────┐
        │   NETLIFY (Frontend)   │  │   AWS (Backend)          │
        │                         │  │                         │
        │  ✅ VOLLSTÄNDIG         │  │  ⚠️  MANUELL            │
        │     AUTOMATISCH         │  │     (via Skripte)       │
        │                         │  │                         │
        │  • GitHub Webhook       │  │  • Lambda Functions     │
        │  • Auto-Deploy          │  │  • API Gateway          │
        │  • Build (2-3 Min)      │  │  • DynamoDB             │
        │  • Live Website         │  │  • S3 Bucket             │
        │                         │  │                         │
        │  URL:                   │  │  API:                   │
        │  https://mawps...        │  │  https://of2iwj7h2c...  │
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

## 🎯 SYSTEM 1: FRONTEND DEPLOYMENT (NETLIFY)

### **Status:** ✅ VOLLSTÄNDIG AUTOMATISCH

### **Workflow:**
```
1. Code ändern (HTML/JS/CSS)
   ↓
2. Git Commit & Push
   ↓
3. GitHub Webhook → Netlify
   ↓
4. Netlify Build (automatisch)
   ↓
5. Live Website (2-3 Minuten)
```

### **Konfiguration:**

**Datei:** `netlify.toml`

```toml
[build]
  command = ""                    # Kein Build nötig (statische Seite)
  publish = "."                   # Root-Verzeichnis

[context.main]
  command = ""
  publish = "."
  NODE_ENV = "preview"

[functions]
  directory = "netlify/functions"  # Netlify Functions
```

### **Was wird deployed:**
- ✅ Alle HTML-Dateien (`*.html`)
- ✅ JavaScript-Dateien (`js/*.js`, `applications/js/*.js`)
- ✅ CSS-Dateien (`css/*.css`, `styles.css`)
- ✅ Bilder (`images/*`)
- ✅ Netlify Functions (`netlify/functions/*`)

### **Deployment-Trigger:**
- ✅ **Automatisch:** Jeder Push auf `main` Branch
- ❌ **Deaktiviert:** Preview Deploys (Credits sparen)
- ❌ **Deaktiviert:** Branch Deploys (Credits sparen)

### **Deployment-Zeit:**
- **Build:** ~30 Sekunden
- **Deploy:** ~1-2 Minuten
- **Gesamt:** ~2-3 Minuten

### **Cache-Strategie:**
```toml
# Kein Caching für JS/CSS/HTML (immer neueste Version)
[[headers]]
  for = "/*.js"
  Cache-Control = "no-cache, no-store, must-revalidate"
```

### **Sicherheits-Headers:**
```toml
[[headers]]
  for = "/*"
  X-Frame-Options = "SAMEORIGIN"
  X-XSS-Protection = "1; mode=block"
  X-Content-Type-Options = "nosniff"
```

---

## ☁️ SYSTEM 2: BACKEND DEPLOYMENT (AWS)

### **Status:** ⚠️ MANUELL (via Skripte)

### **Workflow:**
```
1. Lambda Code ändern
   ↓
2. Deployment-Skript ausführen
   ↓
3. AWS Lambda Update
   ↓
4. API Gateway (automatisch verbunden)
   ↓
5. Live API (5-10 Minuten)
```

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

#### **S3 Bucket:**
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
```

### **Deployment-Skripte:**

#### **1. Lambda Function Update:**
```bash
cd lambda/profile-api
npm install --production
zip -r ../profile-api-update.zip .
aws lambda update-function-code \
  --function-name manuel-weiss-profile-media-PresignFunction-JE5AxO7R2uYd \
  --zip-file fileb://../profile-api-update.zip \
  --region eu-central-1
```

#### **2. SAM Stack Deployment:**
```bash
cd infrastructure
sam build --template-file profile-media-sam.yaml
sam deploy \
  --stack-name manuel-weiss-profile-media \
  --region eu-central-1 \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM
```

### **Deployment-Zeit:**
- **Lambda Update:** ~2-3 Minuten
- **SAM Stack:** ~5-10 Minuten
- **Gesamt:** ~5-10 Minuten

---

## 🔄 AKTUELLER DEPLOYMENT-WORKFLOW

### **Für Frontend-Änderungen (HTML/JS/CSS):**

```bash
# 1. Code ändern in Cursor/IDE
# 2. Git Commit & Push
git add .
git commit -m "Fix: Design-Editor-Buttons funktionieren jetzt"
git push origin main

# 3. Netlify deployt automatisch (2-3 Min)
# ✅ Fertig!
```

**Zeit:** ~3-5 Minuten (inkl. Commit)

---

### **Für Backend-Änderungen (Lambda):**

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

# ✅ Fertig!
```

**Zeit:** ~5-10 Minuten

---

### **Für Komplettes Deployment:**

```bash
# Automatisches Skript (falls vorhanden):
./🚀_DEPLOY_ALL.sh

# Oder manuell:
# 1. Frontend: git push
# 2. Backend: Lambda Deployment-Skript
```

**Zeit:** ~10-15 Minuten

---

## 📊 DEPLOYMENT-STATUS PRÜFEN

### **Frontend (Netlify):**
```bash
# Live Website:
https://mawps.netlify.app

# Netlify Dashboard:
https://app.netlify.com/projects/mawps/deploys

# Status prüfen:
curl -I https://mawps.netlify.app
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
- **Bewerbungsmanager:** https://mawps.netlify.app/applications/dashboard.html

### **Backend:**
- **API Base URL:** https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod
- **Presigned URL:** `POST /profile-image/upload-url`
- **Website Images:** `POST /website-images`, `GET /website-images/{userId}`

---

## ⚙️ KONFIGURATIONSDATEIEN

### **Frontend:**
- `netlify.toml` - Netlify Konfiguration
- `_redirects` - URL Redirects
- `_config.yml` - Jekyll Config (falls verwendet)

### **Backend:**
- `infrastructure/profile-media-sam.yaml` - SAM Template
- `lambda/profile-api/index.js` - Lambda Handler
- `lambda/profile-api/package.json` - Dependencies

---

## 🔐 AWS CREDENTIALS

### **Konfiguration:**
```bash
# AWS CLI konfiguriert mit:
aws configure --profile cdk-deploy-admin

# Oder Environment Variables:
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_DEFAULT_REGION=eu-central-1
```

### **Benötigte Berechtigungen:**
- Lambda: `lambda:UpdateFunctionCode`
- API Gateway: `apigateway:*`
- DynamoDB: `dynamodb:*`
- S3: `s3:*`
- CloudFormation: `cloudformation:*`

---

## 🚨 FEHLERBEHEBUNG

### **Problem: Frontend deployed, aber Änderungen nicht sichtbar**
**Lösung:**
1. Browser-Cache leeren (Cmd+Shift+R / Ctrl+Shift+R)
2. Netlify Cache leeren (Dashboard → Deploys → "Clear cache and deploy")
3. Cache-Busting-Version prüfen (`?v=20250116`)

### **Problem: Lambda Function deployed, aber API antwortet nicht**
**Lösung:**
1. Lambda Logs prüfen: AWS Console → Lambda → Function → Logs
2. API Gateway Routes prüfen: AWS Console → API Gateway → Routes
3. CORS Headers prüfen (müssen in Lambda Response sein)

### **Problem: DynamoDB Endpoint gibt 404**
**Lösung:**
1. Prüfe ob Route in API Gateway existiert
2. Prüfe ob Lambda Function den Endpoint unterstützt
3. Prüfe Lambda Logs für Fehler

---

## 📈 DEPLOYMENT-HISTORIE

### **Letzte Deployments:**

**Frontend:**
- ✅ Commit: `7b0b962` - "Fix: Design-Editor-Buttons und Speichern-Button funktionieren jetzt"
- ✅ Branch: `main`
- ✅ Status: Deployed via Netlify

**Backend:**
- ⚠️ Letztes Deployment: Manuell (siehe AWS Console)

---

## 💡 EMPFEHLUNGEN

### **Für Frontend-Änderungen:**
1. ✅ **Immer:** Git Commit & Push → Netlify deployt automatisch
2. ✅ **Cache-Busting:** Versionsnummern in JS/CSS erhöhen (`?v=20250116`)
3. ✅ **Testing:** Lokal testen vor Commit

### **Für Backend-Änderungen:**
1. ⚠️ **Immer:** Deployment-Skript ausführen
2. ⚠️ **Testing:** Lambda lokal testen (falls möglich)
3. ⚠️ **Logs:** AWS CloudWatch Logs prüfen nach Deployment

### **Für Komplettes Deployment:**
1. ✅ **Reihenfolge:** Erst Backend, dann Frontend
2. ✅ **Testing:** Nach jedem Deployment testen
3. ✅ **Monitoring:** AWS CloudWatch & Netlify Dashboard beobachten

---

## ✅ ZUSAMMENFASSUNG

| Komponente | Deployment-Methode | Automatisierung | Zeit |
|------------|-------------------|-----------------|------|
| **Frontend (Netlify)** | Git Push → Auto-Deploy | ✅ Vollautomatisch | 2-3 Min |
| **Backend (Lambda)** | Deployment-Skript | ⚠️ Manuell | 5-10 Min |
| **Netlify Functions** | Git Push → Auto-Deploy | ✅ Vollautomatisch | 2-3 Min |
| **SAM Stack** | SAM CLI | ⚠️ Manuell | 5-10 Min |

---

**Letzte Aktualisierung:** $(date +%Y-%m-%d)  
**Status:** ✅ Aktiv & Funktionsfähig
