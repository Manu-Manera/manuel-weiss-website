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

| Netlify Function | Verwendet in | Priorität | Komplexität | Besonderheiten |
|------------------|--------------|-----------|-------------|----------------|
| `hero-video-settings.js` | `js/admin/sections/hero-video.js`, `js/admin-hero-fallback-widget.js` | 🔴 Hoch | Mittel | **KEINE Auth** (öffentlich lesbar) |
| `hero-video-upload.js` | `js/admin/sections/hero-video.js` | 🔴 Hoch | Mittel | Presigned URL Generation |
| `hero-video-upload-direct.js` | `js/admin/sections/hero-video.js` | 🔴 Hoch | **Hoch** | Base64 Decoding + S3 Upload + **DynamoDB Save** |
| `bewerbungsprofil-api.js` | `js/admin-bewerbungsprofil-manager.js` | 🟡 Mittel | Niedrig | Auth erforderlich |
| `documents-api.js` | `admin-script.js` | 🟡 Mittel | Niedrig | **Bereits in `backend/user-profile`** |
| `s3-upload.js` | Verschiedene Sections | 🟢 Niedrig | Niedrig | **Bereits ersetzt** durch `/profile-image/upload-url` |
| `s3-download-url.js` | Verschiedene Sections | 🟢 Niedrig | Niedrig | **Nicht mehr nötig** (CloudFront URLs) |
| `api-key-auth.js` | Legacy | 🟢 Niedrig | Niedrig | **Nicht mehr verwendet** |
| `openai-analyze.js` | ❌ Nicht verwendet | 🟢 Niedrig | Niedrig | **Kann entfernt werden** |
| `user-profile-api.js` | `js/user-profile.js` | 🔴 Hoch | Mittel | **Spezifische Tab-Endpoints** (`/personal`, `/applications`, `/settings`, etc.) |

### 2.3 Bereits existierende Lambda Functions

| Lambda Function | Status | Verwendet? | Anpassung nötig? |
|-----------------|--------|------------|-----------------|
| `lambda/hero-video/index.js` | ✅ Existiert | ❓ Unklar | ⚠️ **Prüfen** - kombiniert settings + upload, aber **FEHLT upload-direct** |

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
- **Schema:** `settingKey: 'hero-video-url'` (Partition Key), `settingValue: <url>`, `updatedAt: <iso>`
- **GET:** Settings aus DynamoDB laden (**Auth erforderlich - Admin-only**)
- **POST:** Settings in DynamoDB speichern (**Auth erforderlich - Admin-only**)
- **Auth-Implementierung:** `authUser(event)` + `isAdmin(user)` Check

**🔒 Authentifizierung:**
- **⚠️ WICHTIG:** Alle Endpoints (GET, POST, PUT) müssen mit Authentifizierung erreichbar sein
- **GET:** Auth erforderlich (Admin-only)
- **POST/PUT:** Auth erforderlich (Admin-only)
- **Keine öffentlichen Endpoints!**

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

**🔒 Authentifizierung:**
- **POST:** Auth erforderlich (Admin-only)
- **GET:** Auth erforderlich (Admin-only, falls implementiert)

**Lambda Code:** `lambda/hero-video-upload/index.js`
- S3 Presigned URL generieren für `manuel-weiss-hero-videos` Bucket
- Upload-URL mit 15 Minuten Gültigkeit zurückgeben

#### 3.1.3 `hero-video-upload-direct.js` → Lambda

**Netlify Function:** `netlify/functions/hero-video-upload-direct.js`

**Verwendet in:**
- `js/admin/sections/hero-video.js` (Zeile 331) - Fallback für große Videos (>50MB)

**Endpoints:**
- `POST /.netlify/functions/hero-video-upload-direct` - Direkter Upload (Base64)

**⚠️ WICHTIG: Diese Function macht 3 Dinge:**
1. Base64 Video-Daten decodieren
2. Video zu S3 hochladen
3. **Video-URL in DynamoDB speichern** (automatisch!)

**AWS Lambda Erstellen:**
```typescript
const heroVideoUploadDirectLambda = new lambda.Function(this, 'HeroVideoUploadDirectFunction', {
  functionName: 'website-hero-video-upload-direct',
  runtime: lambda.Runtime.NODEJS_18_X,
  handler: 'index.handler',
  code: lambda.Code.fromAsset('../lambda/hero-video-upload-direct'),
  role: lambdaRole,
  timeout: cdk.Duration.seconds(120), // Länger für Base64 Upload (100MB max)
  memorySize: 1024, // Mehr Memory für Base64 Decoding + S3 Upload
  environment: {
    HERO_VIDEO_BUCKET: 'manuel-weiss-hero-videos',
    SETTINGS_TABLE: 'manuel-weiss-settings',
    SETTINGS_KEY: 'hero-video-url'
  }
});

const heroVideoUploadDirectResource = this.api.root.addResource('hero-video-upload-direct');
heroVideoUploadDirectResource.addMethod('POST', new apigateway.LambdaIntegration(heroVideoUploadDirectLambda));
```

**Lambda Code:** `lambda/hero-video-upload-direct/index.js`
- **🔒 Auth erforderlich (Admin-only)**
- Base64 Video-Daten empfangen (max 6MB nach Base64 Encoding = ~4.5MB Video)
- Decodieren zu Buffer
- Validierung: Max 100MB Dateigröße
- Upload zu S3 (`manuel-weiss-hero-videos/hero-videos/${timestamp}-${filename}`)
- **WICHTIG: Video-URL automatisch in DynamoDB speichern** (`manuel-weiss-settings` Tabelle, Key: `hero-video-url`)
- Public URL zurückgeben

**DynamoDB Schema:**
```javascript
{
  settingKey: 'hero-video-url',  // Partition Key
  settingValue: 'https://manuel-weiss-hero-videos.s3.eu-central-1.amazonaws.com/hero-videos/...',
  updatedAt: '2026-01-21T12:00:00.000Z'
}
```

**⚠️ Besonderheiten:**
- Netlify Function Limit: 6MB Request Body (Base64 encoded)
- Lambda kann größere Payloads verarbeiten (bis zu 6MB für API Gateway, aber Lambda selbst kann mehr)
- **Empfehlung:** Für Videos > 50MB sollte Presigned URL Upload verwendet werden

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
- DynamoDB: `mawps-user-profiles` Tabelle (oder `mawps-user-data` - prüfen!)
- **Schema:** 
  - `userId: <userId>` (Partition Key)
  - `sk: 'bewerbungsprofil'` (Sort Key)
  - Felder: `personalInfo`, `education`, `experience`, `skills`, `languages`, `certificates`, `documents`, `settings`, `lastModified`
- GET: Komplettes Profil laden (oder einzelne Sektion: `/section/{name}`)
- POST/PUT: Profil speichern/aktualisieren
- PUT `/section/{name}`: Einzelne Sektion aktualisieren
- DELETE: Profil löschen
- **Auth:** Erforderlich (JWT Token aus Header)

**⚠️ WICHTIG:** 
- Netlify Function verwendet `mawps-user-data` Tabelle
- Prüfen ob AWS Lambda `mawps-user-profiles` oder `mawps-user-data` verwenden soll
- User ID wird aus JWT Token extrahiert (`extractUserId`)

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

**✅ Status:** Diese API ist bereits in `backend/user-profile/handler.mjs` als `/user-profile/documents` implementiert!

**Frontend Anpassung:**
```javascript
// admin-script.js
// ALT:
fetch('/.netlify/functions/documents-api', ...)

// NEU:
fetch(`${window.AWS_APP_CONFIG?.API_BASE}/user-profile/documents`, ...)
```

**⚠️ Prüfen:**
- Endpoint-Schema identisch?
- Request/Response Format kompatibel?
- Auth-Mechanismus kompatibel?

---

### Phase 3.1: User Profile API (🔴 Priorität: Hoch)

#### 3.3.2 `user-profile-api.js` → Lambda

**Netlify Function:** `netlify/functions/user-profile-api.js`

**Verwendet in:**
- `js/user-profile.js` (Zeile 1613)

**Endpoints (Netlify Function):**
- `GET /personal` - Persönliche Daten laden
- `PUT /personal` - Persönliche Daten speichern
- `GET /applications` - Bewerbungsmanager Daten laden
- `GET /applications/resumes` - Lebensläufe laden
- `GET /applications/cover-letters` - Anschreiben laden
- `GET /settings` - Einstellungen laden
- `PUT /settings` - Einstellungen speichern
- `GET /progress` - Fortschritt laden
- `GET /achievements` - Erfolge laden
- `GET /training` - Training laden
- `GET /nutrition` - Ernährung laden
- `GET /coach` - Coach laden
- `GET /journal` - Tagebuch laden

**Status:** ⚠️ **NICHT vollständig migriert** - `backend/user-profile/handler.mjs` hat andere Endpoint-Struktur

**AWS Lambda Erstellen:**
```typescript
const userProfileApiLambda = new lambda.Function(this, 'UserProfileApiFunction', {
  functionName: 'website-user-profile-api',
  runtime: lambda.Runtime.NODEJS_18_X,
  handler: 'index.handler',
  code: lambda.Code.fromAsset('../lambda/user-profile-api'),
  role: lambdaRole,
  timeout: cdk.Duration.seconds(30),
  memorySize: 256,
  environment: {
    PROFILES_TABLE: 'mawps-user-profiles',
    APPLICATIONS_TABLE: 'mawps-applications',
    RESUMES_TABLE: 'mawps-resumes',
    COVER_LETTERS_TABLE: 'mawps-cover-letters'
  }
});

const userProfileApiResource = this.api.root.addResource('user-profile-api');
userProfileApiResource.addProxy({
  anyMethod: true,
  defaultIntegration: new apigateway.LambdaIntegration(userProfileApiLambda)
});
```

**Lambda Code:** `lambda/user-profile-api/index.js`
- **🔒 Auth erforderlich für ALLE Endpoints** (JWT Token aus Header)
- DynamoDB: `mawps-user-profiles`, `mawps-applications`, `mawps-resumes`, `mawps-cover-letters`
- User ID wird aus JWT Token extrahiert (`extractUserId`)
- Alle Endpoints müssen `authUser(event)` verwenden

**Frontend Anpassung:**
```javascript
// js/user-profile.js
// ALT:
const apiBase = '/.netlify/functions/user-profile-api';

// NEU:
const apiBase = window.getApiUrl('USER_PROFILE_API') || `${window.AWS_APP_CONFIG?.API_BASE}/user-profile-api`;
```

**⚠️ WICHTIG:** 
- Diese Endpoints sind spezifisch für `js/user-profile.js` Tab-Navigation
- Können nicht einfach durch `backend/user-profile/handler.mjs` ersetzt werden
- Separate Lambda erforderlich oder `backend/user-profile/handler.mjs` erweitern

---

### Phase 4: S3 Helper Functions (🟢 Priorität: Niedrig)

#### 3.4.1 `s3-upload.js` → Lambda (Optional)

**Netlify Function:** `netlify/functions/s3-upload.js`

**Status:** ✅ Wird bereits durch `backend/user-profile/handler.mjs` ersetzt (`/profile-image/upload-url`)

**Aktion:** Keine Migration nötig, nur Frontend-Code prüfen

#### 3.4.2 `s3-download-url.js` → Lambda (Optional)

**Netlify Function:** `netlify/functions/s3-download-url.js`

**Status:** ✅ Kann durch direkte S3 URLs ersetzt werden (CloudFront)

**Aktion:** Keine Migration nötig, Frontend-Code auf direkte URLs umstellen

---

### Phase 5: Legacy Functions (🟢 Priorität: Niedrig)

#### 3.5.1 `api-key-auth.js` → Entfernen

**Status:** ❌ Legacy, nicht mehr verwendet

**Aktion:** Nach Migration entfernen

#### 3.5.2 `openai-analyze.js` → Entfernen

**Status:** ❌ Nicht verwendet (keine Referenzen gefunden)

**Aktion:** Nach Migration entfernen

---

### Phase 6: Bestehende Lambda prüfen

#### 3.6.1 `lambda/hero-video/index.js` Status

**Existiert bereits:** ✅ `lambda/hero-video/index.js`

**Funktionalität:**
- Kombiniert `hero-video-settings` und `hero-video-upload`
- **FEHLT:** `hero-video-upload-direct` Funktionalität

**Optionen:**
1. **Option A:** Bestehende Lambda erweitern um `upload-direct` Endpoint
2. **Option B:** Separate Lambda für `upload-direct` erstellen (empfohlen - unterschiedliche Timeout/Memory)

**Empfehlung:** Option B - Separate Lambda, da `upload-direct` deutlich mehr Memory/Timeout benötigt

---

## 🔗 4. VERKNÜPFUNGEN ZUR WEBSITE ANPASSEN

### 4.1 `js/aws-app-config.js` erweitern

**Aktuell:**
```javascript
const AWS_APP_CONFIG = {
  API_BASE: 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1',
  ENDPOINTS: {
    // ...
  }
};
```

**Erweitern:**
```javascript
const AWS_APP_CONFIG = {
  API_BASE: 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1',
  
  ENDPOINTS: {
    // ... bestehende Endpoints ...
    
    // Admin Panel APIs (🔒 ALLE mit Auth erforderlich)
    HERO_VIDEO_SETTINGS: '/hero-video-settings',
    HERO_VIDEO_UPLOAD: '/hero-video-upload',
    HERO_VIDEO_UPLOAD_DIRECT: '/hero-video-upload-direct',
    BEWERBUNGSPROFIL_API: '/bewerbungsprofil',
    USER_PROFILE_API: '/user-profile-api',  // NEU
    
    // ...
  }
};
```

**⚠️ WICHTIG:** Alle Endpoints müssen mit Auth-Token aufgerufen werden:
```javascript
const response = await fetch(apiUrl, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${await getAuthToken()}`,
    'Content-Type': 'application/json'
  }
});
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

**Detaillierte Anpassungen:**

1. **Zeile 104:** `loadCurrentVideo()` - GET Settings
   ```javascript
   // ALT:
   const apiUrl = window.getApiUrl ? window.getApiUrl('HERO_VIDEO_SETTINGS') : '/.netlify/functions/hero-video-settings';
   
   // NEU:
   const apiUrl = window.getApiUrl('HERO_VIDEO_SETTINGS') || `${window.AWS_APP_CONFIG?.API_BASE}/hero-video-settings`;
   ```

2. **Zeile 177:** `uploadVideo()` - POST Presigned URL
   ```javascript
   // ALT:
   const uploadApiUrl = window.getApiUrl ? window.getApiUrl('HERO_VIDEO_UPLOAD') : '/.netlify/functions/hero-video-upload';
   
   // NEU:
   const uploadApiUrl = window.getApiUrl('HERO_VIDEO_UPLOAD') || `${window.AWS_APP_CONFIG?.API_BASE}/hero-video-upload`;
   ```

3. **Zeile 248:** `uploadVideo()` - POST Settings (nach direktem Upload)
   ```javascript
   // ALT:
   const settingsApiUrl = window.getApiUrl ? window.getApiUrl('HERO_VIDEO_SETTINGS') : '/.netlify/functions/hero-video-settings';
   
   // NEU:
   const settingsApiUrl = window.getApiUrl('HERO_VIDEO_SETTINGS') || `${window.AWS_APP_CONFIG?.API_BASE}/hero-video-settings`;
   ```

4. **Zeile 331:** `uploadVideo()` - POST Direct Upload (Base64)
   ```javascript
   // ALT:
   const directUploadApiUrl = window.getApiUrl ? window.getApiUrl('HERO_VIDEO_UPLOAD') : '/.netlify/functions/hero-video-upload-direct';
   
   // NEU:
   const directUploadApiUrl = window.getApiUrl('HERO_VIDEO_UPLOAD_DIRECT') || `${window.AWS_APP_CONFIG?.API_BASE}/hero-video-upload-direct`;
   ```
   **⚠️ WICHTIG:** Hier muss `HERO_VIDEO_UPLOAD_DIRECT` verwendet werden, nicht `HERO_VIDEO_UPLOAD`!

5. **Zeile 369:** `uploadVideo()` - POST Settings (nach Server-Side Upload)
   ```javascript
   // ALT:
   const saveSettingsApiUrl = window.getApiUrl ? window.getApiUrl('HERO_VIDEO_SETTINGS') : '/.netlify/functions/hero-video-settings';
   
   // NEU:
   const saveSettingsApiUrl = window.getApiUrl('HERO_VIDEO_SETTINGS') || `${window.AWS_APP_CONFIG?.API_BASE}/hero-video-settings`;
   ```

#### 4.3.2 `js/admin-bewerbungsprofil-manager.js`

**Alle Vorkommen von:**
```javascript
fetch('/.netlify/functions/bewerbungsprofil-api', ...)
// ODER
fetch('/api/applications/profiles', ...)
```

**Ersetzen durch:**
```javascript
fetch(`${window.AWS_APP_CONFIG?.API_BASE}/bewerbungsprofil`, ...)
```

**⚠️ Prüfen:**
- Zeile 49: `/api/applications/profiles` - ist das ein anderer Endpoint?
- Alle `fetch` Calls zu `bewerbungsprofil-api` finden und ersetzen
- Auth Header beibehalten: `Authorization: Bearer ${token}`

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
const apiUrl = window.getApiUrl('USER_DOCUMENTS') || `${window.AWS_APP_CONFIG?.API_BASE}/user-profile/documents`;
fetch(apiUrl, {
  headers: {
    'Authorization': `Bearer ${await getAuthToken()}`,
    'Content-Type': 'application/json'
  }
});
```

#### 4.3.5 `js/user-profile.js`

**Alle Vorkommen von:**
```javascript
const apiBase = '/.netlify/functions/user-profile-api';
```

**Ersetzen durch:**
```javascript
const apiBase = window.getApiUrl('USER_PROFILE_API') || `${window.AWS_APP_CONFIG?.API_BASE}/user-profile-api`;
```

**⚠️ WICHTIG:** Alle API-Calls müssen Auth-Token enthalten:
```javascript
const response = await fetch(`${apiBase}${endpoint}`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

#### 4.3.6 `js/workflow-api.js`

**Aktuell:**
```javascript
this.apiBaseUrl = '/.netlify/functions/user-data';
```

**Ersetzen durch:**
```javascript
this.apiBaseUrl = window.getApiUrl('USER_DATA') || `${window.AWS_APP_CONFIG?.API_BASE}/user-profile`;
```

**⚠️ WICHTIG:** Auth-Token wird bereits verwendet (Zeile 78), aber Endpoint muss angepasst werden.

#### 4.3.7 `js/netlify-storage.js`

**Status:** ⚠️ **Verwendet Netlify Forms, nicht Functions** - kann bleiben oder zu S3 migriert werden (niedrige Priorität)

**Aktuell:**
```javascript
this.apiEndpoint = this.isNetlify ? '/.netlify/functions/images' : '/api/images';
```

**Option:** Zu S3 + Lambda migrieren (optional, niedrige Priorität)

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
- [ ] `lambda/hero-video-settings/index.js` erstellen (**🔒 Auth für ALLE Endpoints**)
- [ ] `lambda/hero-video-upload/index.js` erstellen (**🔒 Auth erforderlich**)
- [ ] `lambda/hero-video-upload-direct/index.js` erstellen (**🔒 Auth erforderlich**)
- [ ] CDK Stack erweitern (Lambdas + Routes)
- [ ] `js/aws-app-config.js` erweitern
- [ ] `js/admin/sections/hero-video.js` anpassen (Auth-Token hinzufügen)
- [ ] `js/admin-hero-fallback-widget.js` anpassen (Auth-Token hinzufügen)
- [ ] Testen (Settings laden/speichern, Upload) - **mit Auth**
- [ ] Deployen

### Phase 2: Bewerbungsprofil API
- [ ] `lambda/bewerbungsprofil/index.js` erstellen (**🔒 Auth erforderlich**)
- [ ] CDK Stack erweitern (Lambda + Routes)
- [ ] `js/aws-app-config.js` erweitern
- [ ] `js/admin-bewerbungsprofil-manager.js` anpassen (Auth-Token hinzufügen)
- [ ] Testen (GET/POST/DELETE) - **mit Auth**
- [ ] Deployen

### Phase 3: Documents API
- [ ] Prüfen ob `/user-profile/documents` bereits funktioniert (**🔒 Auth erforderlich**)
- [ ] `admin-script.js` anpassen (Auth-Token hinzufügen)
- [ ] Testen - **mit Auth**
- [ ] Deployen

### Phase 3.1: User Profile API
- [ ] `lambda/user-profile-api/index.js` erstellen (**🔒 Auth für ALLE Endpoints**)
- [ ] CDK Stack erweitern (Lambda + Proxy Route)
- [ ] `js/aws-app-config.js` erweitern (`USER_PROFILE_API`)
- [ ] `js/user-profile.js` anpassen (Auth-Token bereits vorhanden, nur Endpoint ändern)
- [ ] Testen (alle Tab-Endpoints) - **mit Auth**
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
- **Hero Video Settings:** GET öffentlich (keine Auth), POST/PUT **sollte** Auth haben (aktuell keine in Netlify Function)
- **Hero Video Upload:** Auth empfohlen (aktuell keine in Netlify Function)
- **Hero Video Upload Direct:** Auth empfohlen (aktuell keine in Netlify Function)
- **Bewerbungsprofil:** Auth erforderlich (JWT Token)
- Alle Admin-Endpoints sollten `authUser(event)` verwenden
- Zusätzlich: Admin-Group-Check in Lambda für kritische Operationen

**Beispiel für Hero Video Settings (Auth ERFORDERLICH):**
```javascript
// lambda/hero-video-settings/index.js
const { authUser, isAdmin } = require('../shared/auth');

exports.handler = async (event) => {
  // CORS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  // 🔒 Auth ERFORDERLICH für ALLE Endpoints
  let user;
  try {
    user = authUser(event);
    if (!isAdmin(user)) {
      return {
        statusCode: 403,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Admin access required' })
      };
    }
  } catch (e) {
    return {
      statusCode: 401,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Unauthorized', message: 'Authentication required' })
    };
  }
  
  // GET: Settings laden (nur für Admin)
  if (event.httpMethod === 'GET') {
    // ... load settings
  }
  
  // POST/PUT: Settings speichern (nur für Admin)
  if (event.httpMethod === 'POST' || event.httpMethod === 'PUT') {
    // ... save settings
  }
};
```

**Beispiel für Bewerbungsprofil (Auth erforderlich):**
```javascript
// lambda/bewerbungsprofil/index.js
const { authUser } = require('../shared/auth');

exports.handler = async (event) => {
  const user = authUser(event); // Wirft Error wenn nicht authentifiziert
  
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
- CORS Headers in Lambda Response setzen

### Problem 2: Authentifizierung fehlgeschlagen

**Symptom:** 401/403 Fehler

**Lösung:**
- Cognito Token korrekt übergeben
- Admin-Group-Check in Lambda implementieren
- Token-Validierung prüfen
- **Hero Video Settings:** GET ohne Auth erlauben (für Kompatibilität)

### Problem 3: DynamoDB Permissions

**Symptom:** 500 Fehler bei DB-Zugriff

**Lösung:**
- IAM Role Permissions prüfen
- DynamoDB Table Names korrekt (`manuel-weiss-settings`, `mawps-user-profiles`)
- Region korrekt (eu-central-1)
- **WICHTIG:** Prüfen ob `mawps-user-data` oder `mawps-user-profiles` für Bewerbungsprofil

### Problem 4: S3 Upload fehlgeschlagen

**Symptom:** Presigned URL funktioniert nicht

**Lösung:**
- S3 Bucket Permissions prüfen
- Presigned URL Gültigkeit (15 Minuten)
- CORS auf S3 Bucket konfigurieren
- Bucket Policy für öffentlichen Lesezugriff

### Problem 5: Base64 Upload zu groß

**Symptom:** 413 Request Entity Too Large

**Lösung:**
- API Gateway Payload Limit: 10MB (aber Lambda kann mehr)
- Netlify Function Limit: 6MB (nicht mehr relevant)
- **Empfehlung:** Für Videos > 50MB Presigned URL Upload verwenden
- Lambda Memory erhöhen (1024MB für Base64 Decoding)

### Problem 6: DynamoDB Schema Mismatch

**Symptom:** Settings werden nicht gefunden/gespeichert

**Lösung:**
- Prüfen ob `settingKey` oder `pk`/`sk` Schema verwendet wird
- Hero Video Settings: `settingKey: 'hero-video-url'` (nicht `pk`/`sk`)
- Bewerbungsprofil: `userId` + `sk: 'bewerbungsprofil'` (nicht `pk`/`sk`)

### Problem 7: Lambda Timeout bei großen Videos

**Symptom:** Lambda Timeout nach 30 Sekunden

**Lösung:**
- Timeout für `hero-video-upload-direct` auf 120 Sekunden erhöhen
- Memory auf 1024MB erhöhen (für Base64 Decoding)
- Progress Tracking implementieren

---

## 📚 10. DOKUMENTATION

### 10.1 API Dokumentation

Nach Migration:
- API Endpoints dokumentieren
- Request/Response Formate
- Authentifizierung
- Fehlerbehandlung
- DynamoDB Schema
- S3 Bucket Struktur

### 10.2 Admin Panel Dokumentation

- Neue API-Endpoints
- Konfiguration
- Troubleshooting
- Upload-Strategien (Presigned URL vs. Direct Upload)

### 10.3 DynamoDB Schema Dokumentation

**Hero Video Settings:**
```javascript
{
  settingKey: 'hero-video-url',  // Partition Key (String)
  settingValue: 'https://...',   // Video URL
  updatedAt: '2026-01-21T...'    // ISO Timestamp
}
```

**Bewerbungsprofil:**
```javascript
{
  userId: 'user-123',            // Partition Key
  sk: 'bewerbungsprofil',         // Sort Key
  personalInfo: { ... },
  education: [ ... ],
  experience: [ ... ],
  skills: [ ... ],
  languages: [ ... ],
  certificates: [ ... ],
  documents: [ ... ],
  settings: { ... },
  lastModified: '2026-01-21T...'
}
```

---

## 🔄 11. ROLLBACK-STRATEGIE

### 11.1 Vor Migration

1. **Backup erstellen:**
   - Netlify Functions Code sichern
   - DynamoDB Daten exportieren (optional)
   - Frontend Code committen

2. **Feature Flag:**
   ```javascript
   // js/aws-app-config.js
   const USE_AWS_HERO_VIDEO = true; // Feature Flag
   
   const apiUrl = USE_AWS_HERO_VIDEO 
     ? window.getApiUrl('HERO_VIDEO_SETTINGS')
     : '/.netlify/functions/hero-video-settings';
   ```

### 11.2 Rollback bei Problemen

1. **Feature Flag auf `false` setzen**
2. **Netlify Functions wieder aktivieren** (falls noch deployed)
3. **Frontend neu deployen**
4. **Lambda Functions deaktivieren** (optional)

### 11.3 Monitoring

- CloudWatch Logs für Lambda Functions
- API Gateway Metrics
- Frontend Error Tracking
- DynamoDB Metrics

---

## 📊 12. MONITORING & LOGGING

### 12.1 CloudWatch Logs

**Lambda Functions:**
- `/aws/lambda/website-hero-video-settings`
- `/aws/lambda/website-hero-video-upload`
- `/aws/lambda/website-hero-video-upload-direct`
- `/aws/lambda/website-bewerbungsprofil`

**Log Groups erstellen:**
```bash
aws logs create-log-group --log-group-name /aws/lambda/website-hero-video-settings
```

### 12.2 API Gateway Metrics

- Request Count
- 4xx/5xx Errors
- Latency
- Cache Hit Rate

### 12.3 Alerts

- Lambda Errors > 5% in 5 Minuten
- API Gateway 5xx Errors
- DynamoDB Throttling
- S3 Upload Failures

---

## 🎯 13. ZEITPLAN

| Phase | Dauer | Status | Details |
|-------|-------|--------|---------|
| Phase 1: Hero Video Functions | 4-5 Stunden | ⏳ Pending | Settings (1.5h), Upload (1h), Upload-Direct (1.5h), Auth-Integration (0.5h), Testing (0.5h) |
| Phase 2: Bewerbungsprofil API | 1.5-2 Stunden | ⏳ Pending | Lambda (1h), Auth-Integration (0.25h), Testing (0.5h) |
| Phase 3: Documents API | 0.5 Stunden | ⏳ Pending | Frontend-Anpassung + Auth |
| Phase 3.1: User Profile API | 2-3 Stunden | ⏳ Pending | Lambda (1.5h), Auth-Integration (0.25h), Testing (0.75h) |
| Phase 4: Cleanup | 0.5 Stunden | ⏳ Pending | Netlify Functions entfernen |
| **Gesamt** | **8.5-11 Stunden** | ⏳ Pending | Mit Puffer für Testing + Auth-Integration |

---

## 📝 14. NOTIZEN & WICHTIGE HINWEISE

### 14.1 Bereits existierende Lambda

- ✅ `lambda/hero-video/index.js` existiert bereits
  - Kombiniert settings + upload
  - **FEHLT:** upload-direct Funktionalität
  - **Entscheidung:** Separate Lambda für upload-direct oder bestehende erweitern?

### 14.2 DynamoDB Schema Unterschiede

- **Hero Video Settings:** Verwendet `settingKey` (nicht `pk`/`sk`)
- **Bewerbungsprofil:** Verwendet `userId` + `sk` (nicht `pk`/`sk`)
- **WICHTIG:** Schema muss exakt übereinstimmen mit Netlify Functions

### 14.3 Authentifizierung

- **⚠️ WICHTIG:** **ALLE Endpoints müssen mit Authentifizierung erreichbar sein**
- **Hero Video Settings:** Auth ERFORDERLICH für GET, POST, PUT (Admin-only)
- **Hero Video Upload:** Auth ERFORDERLICH (Admin-only)
- **Hero Video Upload Direct:** Auth ERFORDERLICH (Admin-only)
- **Bewerbungsprofil:** Auth ERFORDERLICH (User + Admin)
- **User Profile API:** Auth ERFORDERLICH für ALLE Endpoints (User)
- **Keine öffentlichen Endpoints!**

### 14.4 Upload-Strategien

- **< 50MB:** Presigned URL Upload (direkt zu S3)
- **> 50MB:** Server-Side Upload (Base64 über Lambda)
- **Limit:** API Gateway 10MB, aber Lambda kann mehr verarbeiten

### 14.5 Frontend-Anpassungen

- **5 Stellen** in `hero-video.js` müssen angepasst werden
- **WICHTIG:** Zeile 331 muss `HERO_VIDEO_UPLOAD_DIRECT` verwenden (nicht `HERO_VIDEO_UPLOAD`)
- `admin-hero-fallback-widget.js` verwendet auch hero-video-settings

### 14.6 Testing Prioritäten

1. **Hero Video Settings** (GET/POST) - Kritisch
2. **Hero Video Upload** (Presigned URL) - Kritisch
3. **Hero Video Upload Direct** (Base64) - Wichtig (Fallback)
4. **Bewerbungsprofil** (GET/POST/DELETE) - Mittel
5. **Documents API** - Niedrig (Legacy)

---

## ✅ 15. VOLLSTÄNDIGKEITS-CHECKLISTE

### Backend
- [x] Hero Video Settings Lambda (**🔒 Auth für ALLE Endpoints**)
- [x] Hero Video Upload Lambda (**🔒 Auth erforderlich**)
- [x] Hero Video Upload Direct Lambda (**🔒 Auth erforderlich**, mit DynamoDB Save!)
- [x] Bewerbungsprofil Lambda (**🔒 Auth erforderlich**)
- [x] User Profile API Lambda (**🔒 Auth für ALLE Endpoints**)
- [x] Documents API Status geprüft (**🔒 Auth erforderlich**)
- [x] DynamoDB Schema dokumentiert
- [x] Authentifizierung dokumentiert (**ALLE Endpoints mit Auth**)
- [x] CORS konfiguriert

### Frontend
- [x] `js/aws-app-config.js` erweitern (alle neuen Endpoints)
- [x] `window.getApiUrl()` erweitern (inkl. `USER_PROFILE_API`)
- [x] `js/admin/sections/hero-video.js` (5 Stellen, **Auth-Token hinzufügen**)
- [x] `js/admin-hero-fallback-widget.js` (**Auth-Token hinzufügen**)
- [x] `js/admin-bewerbungsprofil-manager.js` (**Auth-Token hinzufügen**)
- [x] `js/user-profile.js` (**Endpoint ändern, Auth bereits vorhanden**)
- [x] `js/workflow-api.js` (**Endpoint ändern, Auth bereits vorhanden**)
- [x] `admin-script.js` (optional, **Auth-Token hinzufügen**)

### Infrastructure
- [x] CDK Stack erweitern
- [x] IAM Permissions
- [x] API Gateway Routes
- [x] Environment Variables

### Testing
- [x] Unit Tests
- [x] Integration Tests
- [x] E2E Tests
- [x] Error Handling
- [x] Rollback-Strategie

### Dokumentation
- [x] API Dokumentation
- [x] DynamoDB Schema
- [x] Troubleshooting
- [x] Monitoring Setup

---

**Ende des Migrationsplans**
