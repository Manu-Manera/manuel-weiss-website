# Upload-System Konsolidierung

## ✅ Aktive Dateien (werden verwendet)

### 1. `js/aws-media.js`
- **Status:** ✅ AKTIV
- **Verwendung:** Wird in `admin.html` geladen
- **Funktion:** Haupt-Upload-Modul für Profile-Bilder
- **API:** `window.awsMedia.uploadProfileImage(file, userId)`
- **Endpoint:** `${AWS_APP_CONFIG.MEDIA_API_BASE}/profile-image/upload-url`

### 2. `lambda-profile-image/index.js`
- **Status:** ✅ AKTIV
- **Verwendung:** Wird via SAM Template deployed
- **Funktion:** Lambda-Funktion für Presigned URLs
- **Endpoints:**
  - `POST /profile-image/upload-url` - Presigned URL für Profile-Bilder
  - `POST /website-images` - Speichern in DynamoDB
  - `GET /website-images/{userId}` - Laden aus DynamoDB

### 3. `js/admin/sections/hero-about.js`
- **Status:** ✅ AKTIV
- **Verwendung:** Admin-Panel Upload-Handler
- **Funktion:** Verwendet `window.awsMedia.uploadProfileImage()`
- **Fallback:** Base64 bei AWS-Fehlern

## ❌ Redundante Dateien (nicht verwendet)

### 1. `js/unified-file-upload.js`
- **Status:** ❌ NICHT VERWENDET
- **Grund:** Nicht in admin.html oder index.html geladen
- **Empfehlung:** Löschen oder als deprecated markieren

### 2. `js/unified-aws-upload.js`
- **Status:** ❌ NICHT VERWENDET
- **Grund:** Nicht in admin.html oder index.html geladen
- **Empfehlung:** Löschen oder als deprecated markieren

### 3. `js/smart-media-api.js`
- **Status:** ❌ NICHT VERWENDET
- **Grund:** Nicht in admin.html oder index.html geladen
- **Empfehlung:** Löschen oder als deprecated markieren

### 4. `lambda/profile-image-upload-url.js`
- **Status:** ❌ VERALTET
- **Grund:** Wurde durch `lambda-profile-image/index.js` ersetzt
- **Empfehlung:** Löschen

## 🔧 Konsolidierte Upload-Architektur

```
Admin-Panel (hero-about.js)
    ↓
window.awsMedia.uploadProfileImage()
    ↓
js/aws-media.js
    ↓
POST /profile-image/upload-url
    ↓
lambda-profile-image/index.js
    ↓
S3 Presigned URL
    ↓
Direct S3 Upload
    ↓
DynamoDB (via /website-images)
```

## 📝 Nächste Schritte

1. ✅ Aktive Dateien beibehalten
2. ✅ Redundante Dateien als deprecated markiert
3. ✅ Upload-Flow dokumentiert
4. ✅ Fehlerbehandlung verbessert

## ✅ Konsolidierung abgeschlossen

### Aktive Upload-Architektur (3 Dateien):

1. **`js/aws-media.js`** - Client-seitiges Upload-Modul
   - `uploadProfileImage(file, userId)` - Hauptfunktion
   - `uploadDocument(file, userId, fileType)` - Für Dokumente
   - `testEndpoint()` - Endpoint-Test

2. **`lambda-profile-image/index.js`** - Server-seitige Lambda-Funktion
   - `POST /profile-image/upload-url` - Presigned URL generieren
   - `POST /website-images` - DynamoDB speichern
   - `GET /website-images/{userId}` - DynamoDB laden

3. **`js/admin/sections/hero-about.js`** - Admin-Panel Handler
   - `handleImageUpload(event)` - Upload-Handler
   - Verwendet `window.awsMedia.uploadProfileImage()`
   - Base64-Fallback bei AWS-Fehlern

### Deprecated Dateien (nicht mehr verwendet):

- ❌ `js/unified-file-upload.js` - Als deprecated markiert
- ❌ `js/unified-aws-upload.js` - Als deprecated markiert
- ❌ `js/smart-media-api.js` - Als deprecated markiert

### Upload-Flow:

```
1. Admin-Panel: handleImageUpload()
   ↓
2. window.awsMedia.uploadProfileImage(file, 'owner')
   ↓
3. POST /profile-image/upload-url (Lambda)
   ↓
4. S3 Presigned URL erhalten
   ↓
5. Direct S3 Upload (PUT)
   ↓
6. POST /website-images (DynamoDB speichern)
   ↓
7. localStorage + Website aktualisieren
```

### Fehlerbehandlung:

- ✅ Quota-Fehler erkannt → Base64-Fallback
- ✅ 403/400 Fehler erkannt → Base64-Fallback
- ✅ Netzwerkfehler → Base64-Fallback
- ✅ Bild wird immer lokal gespeichert (auch bei AWS-Fehlern)

