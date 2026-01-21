# Phase 1 Migration Testplan: Hero Video Functions

> **Datum:** 2026-01-21  
> **Status:** ✅ Deployment erfolgreich  
> **API Base URL:** `https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1`

---

## ✅ Deployment Status

### Lambda Functions
- ✅ `website-hero-video-settings` - Deployed
- ✅ `website-hero-video-upload` - Deployed  
- ✅ `website-hero-video-upload-direct` - Deployed

### API Gateway Routes
- ✅ `GET /hero-video-settings` - Konfiguriert
- ✅ `POST /hero-video-settings` - Konfiguriert
- ✅ `PUT /hero-video-settings` - Konfiguriert
- ✅ `GET /hero-video-upload` - Konfiguriert
- ✅ `POST /hero-video-upload` - Konfiguriert
- ✅ `POST /hero-video-upload-direct` - Konfiguriert

---

## 🧪 Testplan

### Vorbereitung

1. **Browser-Cache löschen:**
   ```javascript
   // In Browser-Konsole:
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

2. **Admin-Panel öffnen:**
   - URL: `https://manuel-weiss.ch/admin.html` (oder lokale URL)
   - Mit Admin-Account anmelden: `weiss-manuel@gmx.de`

3. **Auth-Token prüfen:**
   ```javascript
   // In Browser-Konsole:
   const session = JSON.parse(localStorage.getItem('aws_auth_session'));
   console.log('Token vorhanden:', !!session?.idToken);
   ```

---

### Test 1: Hero Video Settings laden (GET)

**Ziel:** Prüfen ob Settings-Endpoint funktioniert

**Schritte:**
1. Admin-Panel öffnen
2. Zu "Hero Video" Sektion navigieren
3. Aktuelles Video sollte automatisch geladen werden

**Erwartetes Ergebnis:**
- ✅ Video-URL wird angezeigt (falls vorhanden)
- ✅ Keine Fehler in Browser-Konsole
- ✅ Keine 401/403 Fehler

**Manueller Test (Browser-Konsole):**
```javascript
const token = JSON.parse(localStorage.getItem('aws_auth_session'))?.idToken;
const response = await fetch('https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1/hero-video-settings', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
console.log('Settings:', data);
```

**Erwartet:**
- Status: 200
- Body: `{ videoUrl: "...", updatedAt: "..." }` oder `{ videoUrl: null, updatedAt: null }`

---

### Test 2: Hero Video Settings speichern (POST)

**Ziel:** Prüfen ob Settings speichern funktioniert

**Schritte:**
1. Admin-Panel → Hero Video Sektion
2. Video hochladen (siehe Test 3)
3. Settings sollten automatisch gespeichert werden

**Manueller Test (Browser-Konsole):**
```javascript
const token = JSON.parse(localStorage.getItem('aws_auth_session'))?.idToken;
const response = await fetch('https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1/hero-video-settings', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    videoUrl: 'https://manuel-weiss-hero-videos.s3.eu-central-1.amazonaws.com/hero-videos/test.mp4'
  })
});
const data = await response.json();
console.log('Save Result:', data);
```

**Erwartet:**
- Status: 200
- Body: `{ success: true, videoUrl: "...", updatedAt: "..." }`

---

### Test 3: Hero Video Upload (Presigned URL)

**Ziel:** Prüfen ob Presigned URL Generation funktioniert

**Schritte:**
1. Admin-Panel → Hero Video Sektion
2. Video-Datei auswählen (< 50MB)
3. Upload starten
4. Presigned URL sollte generiert werden

**Manueller Test (Browser-Konsole):**
```javascript
const token = JSON.parse(localStorage.getItem('aws_auth_session'))?.idToken;
const response = await fetch('https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1/hero-video-upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fileName: 'test-video.mp4',
    contentType: 'video/mp4'
  })
});
const data = await response.json();
console.log('Upload URL:', data);
```

**Erwartet:**
- Status: 200
- Body: `{ uploadUrl: "...", publicUrl: "...", key: "...", expiresIn: 300 }`

---

### Test 4: Hero Video Upload Direct (Base64)

**Ziel:** Prüfen ob Base64 Upload funktioniert

**Schritte:**
1. Admin-Panel → Hero Video Sektion
2. Video-Datei auswählen (> 50MB oder wenn Presigned URL fehlschlägt)
3. Upload starten
4. Base64 Upload sollte verwendet werden

**Manueller Test (Browser-Konsole):**
```javascript
// Kleine Test-Datei erstellen (nur für Test)
const testFile = new Blob(['test'], { type: 'video/mp4' });
const reader = new FileReader();
reader.onload = async () => {
  const base64 = reader.result.split(',')[1];
  const token = JSON.parse(localStorage.getItem('aws_auth_session'))?.idToken;
  const response = await fetch('https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1/hero-video-upload-direct', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fileData: base64,
      fileName: 'test.mp4',
      contentType: 'video/mp4'
    })
  });
  const data = await response.json();
  console.log('Direct Upload Result:', data);
};
reader.readAsDataURL(testFile);
```

**Erwartet:**
- Status: 200
- Body: `{ success: true, videoUrl: "...", key: "...", size: ... }`
- Video-URL sollte automatisch in DynamoDB gespeichert werden

---

### Test 5: Authentifizierung (401/403 Tests)

**Ziel:** Prüfen ob Auth korrekt funktioniert

**Test 5.1: Ohne Token**
```javascript
const response = await fetch('https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1/hero-video-settings');
const data = await response.json();
console.log('Ohne Token:', response.status, data);
```

**Erwartet:**
- Status: 401
- Body: `{ error: "Unauthorized", message: "..." }`

**Test 5.2: Mit ungültigem Token**
```javascript
const response = await fetch('https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1/hero-video-settings', {
  headers: {
    'Authorization': 'Bearer invalid-token',
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
console.log('Ungültiger Token:', response.status, data);
```

**Erwartet:**
- Status: 401
- Body: `{ error: "Unauthorized", message: "..." }`

**Test 5.3: Mit Token, aber nicht Admin**
```javascript
// Mit normalem User-Token (nicht Admin)
const response = await fetch('https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1/hero-video-settings', {
  headers: {
    'Authorization': `Bearer ${normalUserToken}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
console.log('Nicht Admin:', response.status, data);
```

**Erwartet:**
- Status: 403
- Body: `{ error: "Admin access required" }`

---

### Test 6: Frontend Integration

**Ziel:** Prüfen ob Frontend korrekt funktioniert

**Schritte:**
1. Admin-Panel öffnen
2. Zu "Hero Video" Sektion navigieren
3. Alle Buttons testen:
   - ✅ "Aktuelles Video laden" Button
   - ✅ "Video hochladen" Button
   - ✅ Upload-Progress
   - ✅ Erfolgsmeldung

**Erwartet:**
- ✅ Alle Buttons funktionieren
- ✅ Keine Fehler in Browser-Konsole
- ✅ Auth-Token wird korrekt übergeben
- ✅ API-Calls gehen an AWS (nicht Netlify)

**Browser-Konsole prüfen:**
```javascript
// Prüfen ob AWS API verwendet wird
console.log('API Base:', window.AWS_APP_CONFIG?.API_BASE);
console.log('Settings URL:', window.getApiUrl('HERO_VIDEO_SETTINGS'));
```

**Erwartet:**
- `API_BASE`: `https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1`
- `Settings URL`: `https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1/hero-video-settings`

---

### Test 7: DynamoDB Integration

**Ziel:** Prüfen ob DynamoDB korrekt funktioniert

**Schritte:**
1. Video hochladen (Test 3 oder 4)
2. Prüfen ob URL in DynamoDB gespeichert wurde

**AWS Console prüfen:**
- DynamoDB → `manuel-weiss-settings` Tabelle
- Key: `settingKey: 'hero-video-url'`
- Value: `settingValue: 'https://...'`

**Erwartet:**
- ✅ Item existiert in DynamoDB
- ✅ `updatedAt` ist aktuell
- ✅ URL ist korrekt

---

### Test 8: S3 Integration

**Ziel:** Prüfen ob S3 Upload funktioniert

**Schritte:**
1. Video hochladen
2. Prüfen ob Video in S3 existiert

**AWS Console prüfen:**
- S3 → `manuel-weiss-hero-videos` Bucket
- Prefix: `hero-videos/`
- Video sollte vorhanden sein

**Erwartet:**
- ✅ Video existiert in S3
- ✅ Öffentlicher Zugriff möglich (Bucket Policy)
- ✅ URL ist erreichbar

---

## 🐛 Bekannte Probleme & Lösungen

### Problem 1: CORS-Fehler

**Symptom:** `Access-Control-Allow-Origin` Fehler

**Lösung:**
- API Gateway CORS ist konfiguriert
- Prüfen ob Origin korrekt ist (`manuel-weiss.ch`, `www.manuel-weiss.ch`)

### Problem 2: 401 Unauthorized

**Symptom:** Alle Requests geben 401 zurück

**Lösung:**
- Auth-Token prüfen: `localStorage.getItem('aws_auth_session')`
- Token sollte gültig sein (nicht abgelaufen)
- Admin-Email sollte in Lambda `isAdmin()` Liste sein

### Problem 3: 403 Forbidden

**Symptom:** 403 obwohl Token vorhanden

**Lösung:**
- User ist nicht in Admin-Liste
- Prüfen: `weiss-manuel@gmx.de` sollte in Lambda `isAdmin()` sein

### Problem 4: DynamoDB Fehler

**Symptom:** 500 Fehler bei DB-Zugriff

**Lösung:**
- IAM Role Permissions prüfen
- Tabelle `manuel-weiss-settings` existiert
- Region: `eu-central-1`

---

## ✅ Erfolgskriterien

- [x] Alle Lambda Functions deployed
- [x] Alle API Gateway Routes konfiguriert
- [ ] Test 1: Settings laden funktioniert
- [ ] Test 2: Settings speichern funktioniert
- [ ] Test 3: Presigned URL Upload funktioniert
- [ ] Test 4: Base64 Upload funktioniert
- [ ] Test 5: Auth funktioniert (401/403)
- [ ] Test 6: Frontend Integration funktioniert
- [ ] Test 7: DynamoDB Integration funktioniert
- [ ] Test 8: S3 Integration funktioniert

---

## 📝 Nächste Schritte

Nach erfolgreichem Test:
1. ✅ Phase 1 abgeschlossen
2. ⏭️ Phase 2: Bewerbungsprofil API Migration
3. ⏭️ Phase 3: User Profile API Migration

---

**Ende des Testplans**
