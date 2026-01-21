# 🚀 Netlify → AWS Migration: Status & Schritte

> **Erstellt:** 2026-01-21  
> **Status:** ⏸️ Lambda noch blockiert, aber Infrastruktur vorbereitet

---

## 📊 AKTUELLER STATUS

### ✅ Bereits vorhanden:
- ✅ **CDK Stack Definition**: `infrastructure/lib/website-api-stack.ts`
- ✅ **Lambda Functions**: Alle 39 Functions in `lambda/` vorbereitet
- ✅ **Frontend vorbereitet**: `js/aws-app-config.js` mit `getApiUrl()` System
- ✅ **Netlify Functions als Fallback**: 21 Functions in `netlify/functions/`
- ✅ **CloudFormation Stacks**: Teilweise deployed (mit Fehlern)

### ⚠️ Aktuelle Probleme:
- ❌ **Lambda blockiert**: `AccessDeniedException` bei Lambda-Operationen
- ❌ **Website API Stack**: `ROLLBACK_COMPLETE` (fehlgeschlagen)
- ❌ **Profile Media Stack**: `UPDATE_ROLLBACK_COMPLETE` (fehlgeschlagen)

### ✅ Funktioniert:
- ✅ **S3**: Zugriff funktioniert
- ✅ **API Gateway**: Zugriff funktioniert
- ✅ **CloudFormation**: Stacks können abgefragt werden

---

## 🔍 DETAILLIERTE SCHRITTE (aus MIGRATION_ANLEITUNG.md)

### **Phase 1: AWS-Entsperrung prüfen**

```bash
# Test 1: Lambda-Zugriff
aws lambda list-functions --region eu-central-1 --max-items 5

# Test 2: S3-Zugriff
aws s3 ls --region eu-central-1

# Test 3: API Gateway
aws apigateway get-rest-apis --region eu-central-1
```

**Erwartetes Ergebnis:**
- ✅ S3: Sollte funktionieren
- ✅ API Gateway: Sollte funktionieren
- ❌ Lambda: Aktuell `AccessDeniedException`

---

### **Phase 2: CDK Deploy (nach Entsperrung)**

```bash
cd infrastructure
npm install

# Bootstrap (falls noch nicht gemacht)
npx cdk bootstrap --region eu-central-1

# Deploy Website API Stack
npx cdk deploy -a "npx ts-node bin/website-api.ts" manuel-weiss-website-api
```

**Was wird deployed:**
- API Gateway mit allen Endpoints
- 13 Lambda Functions (User Data, CV, Job Parser, etc.)
- CORS-Konfiguration
- IAM Rollen und Permissions

**Output nach Deploy:**
```
WebsiteApiUrl = https://xxxxxxxxxx.execute-api.eu-central-1.amazonaws.com/v1
```

---

### **Phase 3: Frontend konfigurieren**

**Datei:** `js/aws-app-config.js`

```javascript
// Ändern:
const USE_AWS_API = true; // Von false auf true

// API URL eintragen (aus CDK Output):
API_BASE: 'https://xxxxxxxxxx.execute-api.eu-central-1.amazonaws.com/v1'
```

**Test:**
```bash
# Browser Console öffnen (F12)
# Sollte zeigen:
# ✅ AWS App Config loaded, API_BASE: https://...
```

---

### **Phase 4: Statisches Hosting (S3 + CloudFront)**

**Option A: S3 Static Website Hosting + CloudFront**

```bash
# 1. S3 Bucket erstellen
aws s3 mb s3://manuel-weiss-website --region eu-central-1

# 2. Website aktivieren
aws s3 website s3://manuel-weiss-website \
  --index-document index.html \
  --error-document 404.html

# 3. Dateien hochladen
aws s3 sync . s3://manuel-weiss-website \
  --exclude "*.git/*" \
  --exclude "node_modules/*" \
  --exclude "infrastructure/*" \
  --exclude "lambda/*" \
  --exclude "netlify/*"

# 4. CloudFront Distribution erstellen (siehe cloudfront-config.yaml)
```

**Option B: AWS Amplify (einfacher)**

```bash
# App erstellen
aws amplify create-app \
  --name "manuel-weiss-website" \
  --repository "https://github.com/Manu-Manera/manuel-weiss-website.git" \
  --region eu-central-1

# Branch verbinden
aws amplify create-branch \
  --app-id APP_ID \
  --branch-name main

# Custom Domain
aws amplify create-domain-association \
  --app-id APP_ID \
  --domain-name manuel-weiss.ch \
  --sub-domain-settings prefix="",branchName="main" prefix="www",branchName="main"
```

---

### **Phase 5: SSL Zertifikat (ACM)**

```bash
# WICHTIG: Zertifikat muss in us-east-1 sein für CloudFront!
aws acm request-certificate \
  --domain-name manuel-weiss.ch \
  --subject-alternative-names "*.manuel-weiss.ch" \
  --validation-method DNS \
  --region us-east-1

# DNS-Validierung in Route53 eintragen
# (CNAME Records aus ACM-Output)
```

---

### **Phase 6: DNS umstellen**

**Route53 Records ändern:**

```bash
# A-Record für manuel-weiss.ch
# Von: 75.2.60.5 (Netlify)
# Zu: CloudFront Distribution Domain (z.B. d1234567890.cloudfront.net)

# CNAME für www.manuel-weiss.ch
# Von: mawps.netlify.app
# Zu: CloudFront/Amplify Domain
```

**⚠️ WICHTIG:** Email (SES) bleibt unverändert!
- `mail.manuel-weiss.ch` (MX) → AWS SES
- `_dmarc.manuel-weiss.ch` (TXT) → DMARC Policy
- `*._domainkey...` (CNAME) → DKIM

---

### **Phase 7: Testing (1-2 Wochen Parallel-Betrieb)**

**Checkliste:**
- [ ] Website über neue URL erreichbar
- [ ] Login/Logout funktioniert
- [ ] Datei-Upload (Profilbild, Dokumente)
- [ ] CV Tailor funktioniert
- [ ] Kontaktformular sendet E-Mails
- [ ] Snowflake Highscores funktionieren
- [ ] Design Editor funktioniert
- [ ] PDF-Export funktioniert
- [ ] Performance vergleichen (Netlify vs AWS)

---

### **Phase 8: Netlify deaktivieren**

**Nur nach erfolgreichem Testing!**

```bash
# Netlify Dashboard → Site settings → Delete site
# Oder:
# netlify sites:delete mawps
```

---

## 📋 VORHANDENE INFRASTRUKTUR

### **CDK Stacks:**
- ✅ `manuel-weiss-website-api` (WebsiteApiStack)
- ✅ `manuel-weiss-profile-media` (SAM Stack)
- ✅ `manuel-weiss-simple-stack` (CREATE_COMPLETE)

### **Lambda Functions (vorbereitet):**
- `lambda/user-data/` - User Data API
- `lambda/cv-general/` - CV General
- `lambda/cv-target/` - CV Target
- `lambda/cv-job-parse/` - CV Job Parse
- `lambda/cv-files-parse/` - CV Files Parse
- `lambda/cv-export/` - CV Export
- `lambda/job-parser/` - Job Parser
- `lambda/openai-proxy/` - OpenAI Proxy
- `lambda/hero-video/` - Hero Video
- `lambda/snowflake-highscores/` - Snowflake Highscores
- `lambda/contact-email/` - Contact Email
- `lambda/profile-image-upload/` - Profile Image Upload
- `lambda/api-settings/` - API Settings

### **Frontend-Konfiguration:**
- `js/aws-app-config.js` - Zentrale API-Konfiguration
- `js/cloud-data-service.js` - Nutzt `getApiUrl()`
- Alle anderen Services nutzen `window.getApiUrl()`

---

## 🔧 AWS SUPPORT KONTAKTIEREN

**Falls Lambda weiterhin blockiert:**

1. AWS Console → Support → Create case
2. Kategorie: "Account and billing support"
3. Subject: "AWS Services blocked - Lambda AccessDeniedException"
4. Beschreibung:
   ```
   My AWS account (038333965110) shows AccessDeniedException 
   when trying to access Lambda services. I need to deploy 
   Lambda functions for my website migration from Netlify to AWS.
   
   Error: AccessDeniedException when calling ListFunctions
   Region: eu-central-1
   Account: 038333965110
   
   Please help resolve this billing/security issue.
   ```

---

## 📁 WICHTIGE DATEIEN

| Datei | Beschreibung |
|-------|--------------|
| `MIGRATION_ANLEITUNG.md` | Original Migrationsplan |
| `infrastructure/lib/website-api-stack.ts` | CDK Stack Definition |
| `infrastructure/bin/website-api.ts` | CDK App Entry Point |
| `js/aws-app-config.js` | API-Konfiguration |
| `lambda/` | Alle Lambda Functions |
| `netlify/functions/` | Fallback Netlify Functions |

---

## 🎯 NÄCHSTE SCHRITTE

1. ✅ **Status prüfen**: Lambda-Zugriff testen
2. ⏸️ **Warten auf Entsperrung**: Falls noch blockiert → AWS Support kontaktieren
3. 🚀 **CDK Deploy**: `npx cdk deploy -a "npx ts-node bin/website-api.ts"`
4. ⚙️ **Frontend konfigurieren**: `USE_AWS_API = true` in `aws-app-config.js`
5. 🌐 **Hosting einrichten**: S3 + CloudFront oder Amplify
6. 🔒 **SSL Zertifikat**: ACM Certificate in us-east-1
7. 🔄 **DNS umstellen**: Route53 Records ändern
8. ✅ **Testen**: Parallel-Betrieb 1-2 Wochen
9. 🗑️ **Netlify deaktivieren**: Nach erfolgreichem Testing

---

*Letzte Aktualisierung: 2026-01-21*  
*Status: Lambda blockiert, aber alle Vorbereitungen abgeschlossen*
