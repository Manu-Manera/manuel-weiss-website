# 📋 Admin Panel Migration Plan: Netlify → AWS

> **Erstellt:** 2026-01-21  
> **Status:** 🟡 Planungsphase  
> **Priorität:** Hoch

---

## 📊 EXECUTIVE SUMMARY

Das Admin Panel muss vollständig von Netlify Functions auf AWS Lambda + API Gateway migriert werden. Dies umfasst:

- **8 HTML-Dateien** (Admin Panel Seiten)
- **14 JavaScript-Dateien** (Admin Panel Core & Sections)
- **~15 Netlify Functions** (Backend APIs)
- **Verknüpfungen zur Website** (API-Aufrufe, Config-Dateien)

---

## 🔍 1. ANALYSE: Aktuelle Admin Panel Struktur

### 1.1 Admin Panel HTML-Dateien

| Datei | Zweck | Status |
|-------|-------|--------|
| `admin.html` | Haupt-Admin-Panel | ✅ Frontend auf S3 |
| `admin-login.html` | Login-Seite | ✅ Frontend auf S3 |
| `admin-ki-settings.html` | KI-Einstellungen | ✅ Frontend auf S3 |
| `admin-data.html` | Datenverwaltung | ✅ Frontend auf S3 |
| `admin-simple.html` | Vereinfachte Version | ✅ Frontend auf S3 |
| `admin-persoenlichkeitsentwicklung.html` | Persönlichkeitsentwicklung | ✅ Frontend auf S3 |
| `admin-backup.html` | Backup-Version | ✅ Frontend auf S3 |
| `admin-old.html` | Legacy-Version | ✅ Frontend auf S3 |

**✅ Alle HTML-Dateien sind bereits auf S3/CloudFront deployed.**

### 1.2 Admin Panel JavaScript-Dateien

#### Core Files
| Datei | Zweck | Netlify Functions? | AWS Lambda? |
|-------|-------|-------------------|-------------|
| `js/admin/core/admin-application.js` | Haupt-Application | ❌ | ❌ |
| `js/admin/components/admin-sidebar.js` | Sidebar Navigation | ❌ | ❌ |
| `js/admin/components/admin-topbar.js` | Topbar | ❌ | ❌ |
| `js/admin-auth-system.js` | Authentifizierung | ❌ | ❌ |

#### Section Files
| Datei | Zweck | Netlify Functions? | AWS Lambda? |
|-------|-------|-------------------|-------------|
| `js/admin/sections/user-management.js` | User-Verwaltung | ✅ `user-management` | ✅ `backend/admin-user-management` |
| `js/admin/sections/api-keys.js` | API Keys Verwaltung | ✅ `api-settings` | ✅ `lambda/api-settings` |
| `js/admin/sections/media.js` | Medienverwaltung | ✅ `profile-image-upload` | ✅ `backend/user-profile` |
| `js/admin/sections/content.js` | Content-Verwaltung | ✅ `profile-image-upload` | ✅ `backend/user-profile` |
| `js/admin/sections/hero-video.js` | Hero Video | ✅ `hero-video-*` | ⚠️ **FEHLT** |
| `js/admin/sections/hero-about.js` | Hero About | ✅ `profile-image-upload` | ✅ `backend/user-profile` |
| `js/admin/sections/applications.js` | Bewerbungen | ✅ `user-data` | ✅ `backend/user-profile` |
| `js/admin/sections/dashboard.js` | Dashboard | ❌ | ❌ |

#### Integration Files
| Datei | Zweck | Netlify Functions? | AWS Lambda? |
|-------|-------|-------------------|-------------|
| `js/admin-panel-integration.js` | Website-Integration | ❌ | ❌ |
| `js/admin-data-sync.js` | Daten-Synchronisation | ✅ `user-data` | ✅ `backend/user-profile` |
| `js/admin-bewerbungsprofil-manager.js` | Bewerbungsprofil | ✅ `bewerbungsprofil-api` | ⚠️ **FEHLT** |
| `js/admin-user-management-ui.js` | User Management UI | ✅ `user-management` | ✅ `backend/admin-user-management` |
| `js/admin-persoenlichkeitsentwicklung.js` | Persönlichkeitsentwicklung | ❌ | ❌ |
| `js/admin-real-time-dashboard.js` | Real-Time Dashboard | ❌ | ❌ |
| `js/admin-multiuser-integration.js` | Multi-User Integration | ❌ | ❌ |
| `js/admin-hero-fallback-widget.js` | Hero Fallback | ✅ `hero-video-settings` | ⚠️ **FEHLT** |
| `js/admin-panel-fix.js` | Fixes & Utilities | ❌ | ❌ |
| `admin-script.js` | Legacy Script | ✅ `user-data` | ✅ `backend/user-profile` |

---

## 🔌 2. NETLIFY FUNCTIONS → AWS LAMBDA MAPPING

### 2.1 Bereits migriert ✅

| Netlify Function | AWS Lambda | Endpoint | Status |
|------------------|------------|----------|--------|
| `user-data.js` | `backend/user-profile/handler.mjs` | `/user-profile/*` | ✅ Migriert |
| `api-settings.js` | `lambda/api-settings/index.js` | `/api-settings/*` | ✅ Migriert |
| `user-management.js` | `backend/admin-user-management/handler.mjs` | `/admin/user-management/*` | ✅ Migriert |
| `profile-image-upload.js` | `backend/user-profile/handler.mjs` | `/profile-image/*` | ✅ Migriert |
| `send-contact-email.js` | `lambda/contact-email/index.js` | `/contact-email` | ✅ Migriert |
| `snowflake-highscores.js` | `lambda/snowflake-highscores/index.js` | `/snowflake-highscores/*` | ✅ Migriert |
| `cv-export.js` | `lambda/cv-export/index.js` | `/cv-export` | ✅ Migriert |
| `cv-files-parse.js` | `lambda/cv-files-parse/index.js` | `/cv-files-parse` | ✅ Migriert |
| `cv-general.js` | `lambda/cv-general/index.js` | `/cv-general` | ✅ Migriert |
| `cv-job-parse.js` | `lambda/cv-job-parse/index.js` | `/cv-job-parse` | ✅ Migriert |
| `cv-target.js` | `lambda/cv-target/index.js` | `/cv-target` | ✅ Migriert |
| `job-parser.js` | `lambda/job-parser/index.js` | `/job-parser` | ✅ Migriert |
| `openai-proxy.js` | `lambda/openai-proxy/index.js` | `/openai-proxy` | ✅ Migriert |

### 2.2 Noch zu migrieren ⚠️

| Netlify Function | Verwendet in | Priorität | Komplexität |
|------------------|--------------|-----------|-------------|
| `hero-video-settings.js` | `js/admin/sections/hero-video.js` | 🔴 Hoch | Mittel |
| `hero-video-upload.js` | `js/admin/sections/hero-video.js` | 🔴 Hoch | Mittel |
| `hero-video-upload-direct.js` | `js/admin/sections/hero-video.js` | 🔴 Hoch | Mittel |
| `bewerbungsprofil-api.js` | `js/admin-bewerbungsprofil-manager.js` | 🟡 Mittel | Niedrig |
| `documents-api.js` | `admin-script.js` | 🟡 Mittel | Niedrig |
| `s3-upload.js` | Verschiedene Sections | 🟢 Niedrig | Niedrig |
| `s3-download-url.js` | Verschiedene Sections | 🟢 Niedrig | Niedrig |
| `api-key-auth.js` | Legacy | 🟢 Niedrig | Niedrig |

---

## 📝 3. DETAILLIERTER MIGRATIONSPLAN

### Phase 1: Hero Video Functions (🔴 Priorität: Hoch)

#### 3.1.1 `hero-video-settings.js` → Lambda

**Netlify Function:** `netlify/functions/hero-video-settings.js`

**Verwendet in:**
- `js/admin/sections/hero-video.js` (Zeile 104, 248, 369)
- `js/admin-hero-fallback-widget.js`

**Endpoints:**
- `GET /.netlify/functions/hero-video-settings` - Settings laden
- `POST /.netlify/functions/hero-video-settings` - Settings speichern

**AWS Lambda Erstellen:**
```typescript
// infrastructure/lib/website-api-stack.ts
const heroVideoSettingsLambda = new lambda.Function(this, 'HeroVideoSettingsFunction', {
  functionName: 'website-hero-video-settings',
  runtime: lambda.Runtime.NODEJS_18_X,
  handler: 'index.handler',
  code: lambda.Code.fromAsset('../lambda/hero-video-settings'),
  role: lambdaRole,
  timeout: cdk.Duration.seconds(30),
  memorySize: 256,
  environment: {
    SETTINGS_TABLE: 'manuel-weiss-settings',
    HERO_VIDEO_BUCKET: 'manuel-weiss-hero-videos'
  }
});

// API Gateway Route
const heroVideoSettingsResource = this.api.root.addResource('hero-video-settings');
heroVideoSettingsResource.addMethod('GET', new apigateway.LambdaIntegration(heroVideoSettingsLambda));
heroVideoSettingsResource.addMethod('POST', new apigateway.LambdaIntegration(heroVideoSettingsLambda));
```

**Lambda Code:** `lambda/hero-video-settings/index.js`
- DynamoDB: `manuel-weiss-settings` Tabelle
- Key: `pk: 'hero-video#settings'`, `sk: 'settings'`
- GET: Settings aus DynamoDB laden
- POST: Settings in DynamoDB speichern

**Frontend Anpassung:**
```javascript
// js/admin/sections/hero-video.js
// ALT:
const apiUrl = window.getApiUrl ? window.getApiUrl('HERO_VIDEO_SETTINGS') : '/.netlify/functions/hero-video-settings';

// NEU:
const apiUrl = window.getApiUrl('HERO_VIDEO_SETTINGS') || `${window.AWS_APP_CONFIG?.API_BASE}/hero-video-settings`;
```

#### 3.1.2 `hero-video-upload.js` → Lambda

**Netlify Function:** `netlify/functions/hero-video-upload.js`

**Verwendet in:**
- `js/admin/sections/hero-video.js` (Zeile 177)

**Endpoints:**
- `POST /.netlify/functions/hero-video-upload` - Presigned URL für Upload generieren

**AWS Lambda Erstellen:**
```typescript
const heroVideoUploadLambda = new lambda.Function(this, 'HeroVideoUploadFunction', {
  functionName: 'website-hero-video-upload',
  runtime: lambda.Runtime.NODEJS_18_X,
  handler: 'index.handler',
  code: lambda.Code.fromAsset('../lambda/hero-video-upload'),
  role: lambdaRole,
  timeout: cdk.Duration.seconds(30),
  memorySize: 256,
  environment: {
    HERO_VIDEO_BUCKET: 'manuel-weiss-hero-videos'
  }
});

const heroVideoUploadResource = this.api.root.addResource('hero-video-upload');
heroVideoUploadResource.addMethod('POST', new apigateway.LambdaIntegration(heroVideoUploadLambda));
```

**Lambda Code:** `lambda/hero-video-upload/index.js`
- S3 Presigned URL generieren für `manuel-weiss-hero-videos` Bucket
- Upload-URL mit 15 Minuten Gültigkeit zurückgeben

#### 3.1.3 `hero-video-upload-direct.js` → Lambda

**Netlify Function:** `netlify/functions/hero-video-upload-direct.js`

**Verwendet in:**
- `js/admin/sections/hero-video.js` (Zeile 331)

**Endpoints:**
- `POST /.netlify/functions/hero-video-upload-direct` - Direkter Upload (Base64)

**AWS Lambda Erstellen:**
```typescript
const heroVideoUploadDirectLambda = new lambda.Function(this, 'HeroVideoUploadDirectFunction', {
  functionName: 'website-hero-video-upload-direct',
  runtime: lambda.Runtime.NODEJS_18_X,
  handler: 'index.handler',
  code: lambda.Code.fromAsset('../lambda/hero-video-upload-direct'),
  role: lambdaRole,
  timeout: cdk.Duration.seconds(60), // Länger für Base64 Upload
  memorySize: 512, // Mehr Memory für Base64 Decoding
  environment: {
    HERO_VIDEO_BUCKET: 'manuel-weiss-hero-videos'
  }
});

const heroVideoUploadDirectResource = this.api.root.addResource('hero-video-upload-direct');
heroVideoUploadDirectResource.addMethod('POST', new apigateway.LambdaIntegration(heroVideoUploadDirectLambda));
```

**Lambda Code:** `lambda/hero-video-upload-direct/index.js`
- Base64 Video-Daten empfangen
- Decodieren und zu S3 hochladen
- URL zurückgeben

---

### Phase 2: Bewerbungsprofil API (🟡 Priorität: Mittel)

#### 3.2.1 `bewerbungsprofil-api.js` → Lambda

**Netlify Function:** `netlify/functions/bewerbungsprofil-api.js`

**Verwendet in:**
- `js/admin-bewerbungsprofil-manager.js`

**Endpoints:**
- `GET /.netlify/functions/bewerbungsprofil-api` - Profil laden
- `POST /.netlify/functions/bewerbungsprofil-api` - Profil speichern
- `DELETE /.netlify/functions/bewerbungsprofil-api` - Profil löschen

**AWS Lambda Erstellen:**
```typescript
const bewerbungsprofilLambda = new lambda.Function(this, 'BewerbungsprofilFunction', {
  functionName: 'website-bewerbungsprofil',
  runtime: lambda.Runtime.NODEJS_18_X,
  handler: 'index.handler',
  code: lambda.Code.fromAsset('../lambda/bewerbungsprofil'),
  role: lambdaRole,
  timeout: cdk.Duration.seconds(30),
  memorySize: 256,
  environment: {
    USER_DATA_TABLE: 'mawps-user-profiles'
  }
});

const bewerbungsprofilResource = this.api.root.addResource('bewerbungsprofil');
bewerbungsprofilResource.addMethod('GET', new apigateway.LambdaIntegration(bewerbungsprofilLambda));
bewerbungsprofilResource.addMethod('POST', new apigateway.LambdaIntegration(bewerbungsprofilLambda));
bewerbungsprofilResource.addMethod('DELETE', new apigateway.LambdaIntegration(bewerbungsprofilLambda));
```

**Lambda Code:** `lambda/bewerbungsprofil/index.js`
- DynamoDB: `mawps-user-profiles` Tabelle
- Key: `pk: 'USER#${userId}'`, `sk: 'BEWERBUNGSPROFIL'`
- GET/POST/DELETE Operationen

---

### Phase 3: Documents API (🟡 Priorität: Mittel)

#### 3.3.1 `documents-api.js` → Lambda

**Netlify Function:** `netlify/functions/documents-api.js`

**Verwendet in:**
- `admin-script.js` (Legacy)

**Endpoints:**
- `GET /.netlify/functions/documents-api` - Dokumente laden
- `POST /.netlify/functions/documents-api` - Dokument speichern
- `DELETE /.netlify/functions/documents-api` - Dokument löschen

**Hinweis:** Diese API ist bereits in `backend/user-profile/handler.mjs` als `/user-profile/documents` implementiert!

**Frontend Anpassung:**
```javascript
// admin-script.js
// ALT:
fetch('/.netlify/functions/documents-api', ...)

// NEU:
fetch(`${window.AWS_APP_CONFIG?.API_BASE}/user-profile/documents`, ...)
```

---

### Phase 4: S3 Helper Functions (🟢 Priorität: Niedrig)

#### 3.4.1 `s3-upload.js` → Lambda (Optional)

**Netlify Function:** `netlify/functions/s3-upload.js`

**Status:** Wird bereits durch `backend/user-profile/handler.mjs` ersetzt (`/profile-image/upload-url`)

#### 3.4.2 `s3-download-url.js` → Lambda (Optional)

**Netlify Function:** `netlify/functions/s3-download-url.js`

**Status:** Kann durch direkte S3 URLs ersetzt werden (CloudFront)

---

### Phase 5: Legacy Functions (🟢 Priorität: Niedrig)

#### 3.5.1 `api-key-auth.js` → Entfernen

**Status:** Legacy, nicht mehr verwendet

---

## 🔗 4. VERKNÜPFUNGEN ZUR WEBSITE ANPASSEN

### 4.1 `js/aws-app-config.js` erweitern

**Aktuell:**
```javascript
const AWS_APP_CONFIG = {
  API_BASE: 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1',
  // ...
};
```

**Erweitern:**
```javascript
const AWS_APP_CONFIG = {
  API_BASE: 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1',
  
  // Admin Panel APIs
  HERO_VIDEO_SETTINGS: `${API_BASE}/hero-video-settings`,
  HERO_VIDEO_UPLOAD: `${API_BASE}/hero-video-upload`,
  HERO_VIDEO_UPLOAD_DIRECT: `${API_BASE}/hero-video-upload-direct`,
  BEWERBUNGSPROFIL_API: `${API_BASE}/bewerbungsprofil`,
  
  // ...
};
```

### 4.2 `window.getApiUrl()` Funktion erweitern

**Aktuell:** `js/aws-app-config.js`

**Erweitern:**
```javascript
window.getApiUrl = function(endpoint) {
  const config = window.AWS_APP_CONFIG || {};
  
  const endpointMap = {
    'HERO_VIDEO_SETTINGS': config.HERO_VIDEO_SETTINGS,
    'HERO_VIDEO_UPLOAD': config.HERO_VIDEO_UPLOAD,
    'HERO_VIDEO_UPLOAD_DIRECT': config.HERO_VIDEO_UPLOAD_DIRECT,
    'BEWERBUNGSPROFIL_API': config.BEWERBUNGSPROFIL_API,
    // ... bestehende Endpoints
  };
  
  return endpointMap[endpoint] || `${config.API_BASE}/${endpoint.toLowerCase()}`;
};
```

### 4.3 Frontend-Dateien anpassen

#### 4.3.1 `js/admin/sections/hero-video.js`

**Alle Vorkommen von:**
```javascript
const apiUrl = window.getApiUrl ? window.getApiUrl('HERO_VIDEO_SETTINGS') : '/.netlify/functions/hero-video-settings';
```

**Ersetzen durch:**
```javascript
const apiUrl = window.getApiUrl('HERO_VIDEO_SETTINGS') || `${window.AWS_APP_CONFIG?.API_BASE}/hero-video-settings`;
```

**Anpassungen:**
- Zeile 104: `HERO_VIDEO_SETTINGS` GET
- Zeile 177: `HERO_VIDEO_UPLOAD` POST
- Zeile 248: `HERO_VIDEO_SETTINGS` POST
- Zeile 331: `HERO_VIDEO_UPLOAD_DIRECT` POST
- Zeile 369: `HERO_VIDEO_SETTINGS` POST

#### 4.3.2 `js/admin-bewerbungsprofil-manager.js`

**Alle Vorkommen von:**
```javascript
fetch('/.netlify/functions/bewerbungsprofil-api', ...)
```

**Ersetzen durch:**
```javascript
fetch(`${window.AWS_APP_CONFIG?.API_BASE}/bewerbungsprofil`, ...)
```

#### 4.3.3 `js/admin-hero-fallback-widget.js`

**Alle Vorkommen von:**
```javascript
fetch('/.netlify/functions/hero-video-settings', ...)
```

**Ersetzen durch:**
```javascript
fetch(`${window.AWS_APP_CONFIG?.API_BASE}/hero-video-settings`, ...)
```

#### 4.3.4 `admin-script.js` (Legacy)

**Alle Vorkommen von:**
```javascript
fetch('/.netlify/functions/documents-api', ...)
```

**Ersetzen durch:**
```javascript
fetch(`${window.AWS_APP_CONFIG?.API_BASE}/user-profile/documents`, ...)
```

---

## 🚀 5. DEPLOYMENT SCHRITTE

### Schritt 1: Lambda Functions erstellen

1. **Hero Video Settings Lambda**
   ```bash
   mkdir -p lambda/hero-video-settings
   # Code aus netlify/functions/hero-video-settings.js kopieren und anpassen
   ```

2. **Hero Video Upload Lambda**
   ```bash
   mkdir -p lambda/hero-video-upload
   # Code aus netlify/functions/hero-video-upload.js kopieren und anpassen
   ```

3. **Hero Video Upload Direct Lambda**
   ```bash
   mkdir -p lambda/hero-video-upload-direct
   # Code aus netlify/functions/hero-video-upload-direct.js kopieren und anpassen
   ```

4. **Bewerbungsprofil Lambda**
   ```bash
   mkdir -p lambda/bewerbungsprofil
   # Code aus netlify/functions/bewerbungsprofil-api.js kopieren und anpassen
   ```

### Schritt 2: CDK Stack erweitern

1. **`infrastructure/lib/website-api-stack.ts` erweitern:**
   - Hero Video Lambdas hinzufügen
   - Bewerbungsprofil Lambda hinzufügen
   - API Gateway Routes hinzufügen

2. **CDK deployen:**
   ```bash
   cd infrastructure
   npm run build
   cdk deploy WebsiteApiStack
   ```

### Schritt 3: Frontend anpassen

1. **`js/aws-app-config.js` erweitern**
2. **Admin Panel JavaScript-Dateien anpassen:**
   - `js/admin/sections/hero-video.js`
   - `js/admin-bewerbungsprofil-manager.js`
   - `js/admin-hero-fallback-widget.js`
   - `admin-script.js` (optional, Legacy)

### Schritt 4: Testen

1. **Hero Video Settings:**
   - Settings laden
   - Settings speichern

2. **Hero Video Upload:**
   - Presigned URL generieren
   - Video hochladen
   - Direkter Upload (Base64)

3. **Bewerbungsprofil:**
   - Profil laden
   - Profil speichern
   - Profil löschen

### Schritt 5: Deployen

1. **Frontend zu S3/CloudFront:**
   ```bash
   aws s3 cp js/aws-app-config.js s3://manuel-weiss-website/js/aws-app-config.js
   aws s3 cp js/admin/sections/hero-video.js s3://manuel-weiss-website/js/admin/sections/hero-video.js
   aws s3 cp js/admin-bewerbungsprofil-manager.js s3://manuel-weiss-website/js/admin-bewerbungsprofil-manager.js
   aws cloudfront create-invalidation --distribution-id E305V0ATIXMNNG --paths "/*"
   ```

2. **GitHub commit & push:**
   ```bash
   git add .
   git commit -m "feat: Admin Panel Migration - Hero Video & Bewerbungsprofil APIs"
   git push origin main
   ```

---

## ✅ 6. CHECKLISTE

### Phase 1: Hero Video Functions
- [ ] `lambda/hero-video-settings/index.js` erstellen
- [ ] `lambda/hero-video-upload/index.js` erstellen
- [ ] `lambda/hero-video-upload-direct/index.js` erstellen
- [ ] CDK Stack erweitern (Lambdas + Routes)
- [ ] `js/aws-app-config.js` erweitern
- [ ] `js/admin/sections/hero-video.js` anpassen
- [ ] `js/admin-hero-fallback-widget.js` anpassen
- [ ] Testen (Settings laden/speichern, Upload)
- [ ] Deployen

### Phase 2: Bewerbungsprofil API
- [ ] `lambda/bewerbungsprofil/index.js` erstellen
- [ ] CDK Stack erweitern (Lambda + Routes)
- [ ] `js/aws-app-config.js` erweitern
- [ ] `js/admin-bewerbungsprofil-manager.js` anpassen
- [ ] Testen (GET/POST/DELETE)
- [ ] Deployen

### Phase 3: Documents API
- [ ] Prüfen ob `/user-profile/documents` bereits funktioniert
- [ ] `admin-script.js` anpassen (optional)
- [ ] Testen
- [ ] Deployen

### Phase 4: Cleanup
- [ ] Netlify Functions aus `netlify/functions/` entfernen
- [ ] `netlify.toml` bereinigen
- [ ] Dokumentation aktualisieren

---

## 🔒 7. SICHERHEIT & AUTHENTIFIZIERUNG

### 7.1 Admin Panel Authentifizierung

**Aktuell:**
- Admin Panel verwendet `js/admin-auth-system.js`
- Prüft Cognito User Pool Group `admin`

**AWS Lambda:**
- Alle Admin-Endpoints müssen `authUser(event)` verwenden
- Zusätzlich: Admin-Group-Check in Lambda

**Beispiel:**
```javascript
// lambda/hero-video-settings/index.js
const { authUser, isAdmin } = require('../shared/auth');

exports.handler = async (event) => {
  const user = authUser(event);
  
  if (!isAdmin(user)) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Admin access required' })
    };
  }
  
  // ... rest of handler
};
```

### 7.2 CORS Konfiguration

**API Gateway:**
- CORS bereits in `website-api-stack.ts` konfiguriert
- Erlaubte Origins: `manuel-weiss.ch`, `www.manuel-weiss.ch`

---

## 📊 8. TESTING PLAN

### 8.1 Unit Tests

- [ ] Hero Video Settings Lambda (GET/POST)
- [ ] Hero Video Upload Lambda (Presigned URL)
- [ ] Hero Video Upload Direct Lambda (Base64)
- [ ] Bewerbungsprofil Lambda (GET/POST/DELETE)

### 8.2 Integration Tests

- [ ] Admin Panel → Hero Video Settings
- [ ] Admin Panel → Hero Video Upload
- [ ] Admin Panel → Bewerbungsprofil
- [ ] Website → Hero Video (Frontend)

### 8.3 E2E Tests

- [ ] Kompletter Hero Video Upload-Workflow
- [ ] Bewerbungsprofil erstellen/bearbeiten/löschen
- [ ] Admin Panel Navigation

---

## 🐛 9. POTENTIELLE PROBLEME & LÖSUNGEN

### Problem 1: CORS-Fehler

**Symptom:** Browser blockiert API-Aufrufe

**Lösung:**
- API Gateway CORS korrekt konfigurieren
- `Access-Control-Allow-Origin` Header prüfen
- Preflight OPTIONS Requests handhaben

### Problem 2: Authentifizierung fehlgeschlagen

**Symptom:** 401/403 Fehler

**Lösung:**
- Cognito Token korrekt übergeben
- Admin-Group-Check in Lambda implementieren
- Token-Validierung prüfen

### Problem 3: DynamoDB Permissions

**Symptom:** 500 Fehler bei DB-Zugriff

**Lösung:**
- IAM Role Permissions prüfen
- DynamoDB Table Names korrekt
- Region korrekt (eu-central-1)

### Problem 4: S3 Upload fehlgeschlagen

**Symptom:** Presigned URL funktioniert nicht

**Lösung:**
- S3 Bucket Permissions prüfen
- Presigned URL Gültigkeit (15 Minuten)
- CORS auf S3 Bucket konfigurieren

---

## 📚 10. DOKUMENTATION

### 10.1 API Dokumentation

Nach Migration:
- API Endpoints dokumentieren
- Request/Response Formate
- Authentifizierung
- Fehlerbehandlung

### 10.2 Admin Panel Dokumentation

- Neue API-Endpoints
- Konfiguration
- Troubleshooting

---

## 🎯 11. ZEITPLAN

| Phase | Dauer | Status |
|-------|-------|--------|
| Phase 1: Hero Video Functions | 2-3 Stunden | ⏳ Pending |
| Phase 2: Bewerbungsprofil API | 1-2 Stunden | ⏳ Pending |
| Phase 3: Documents API | 0.5 Stunden | ⏳ Pending |
| Phase 4: Cleanup | 0.5 Stunden | ⏳ Pending |
| **Gesamt** | **4-6 Stunden** | ⏳ Pending |

---

## 📝 12. NOTIZEN

- Alle Frontend-Dateien sind bereits auf S3/CloudFront
- Die meisten Backend-Functions sind bereits migriert
- Hauptaufwand: Hero Video Functions + Frontend-Anpassungen
- Bewerbungsprofil API ist relativ einfach (DynamoDB CRUD)
- Documents API ist bereits in `backend/user-profile` implementiert

---

**Ende des Migrationsplans**
