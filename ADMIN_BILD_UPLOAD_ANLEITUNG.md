# 📸 Admin Panel Bild-Upload - Implementierungsanleitung

## ✅ Was wurde implementiert?

### 1. AWS S3 Integration im Admin Panel

**Dateien geändert:**
- `admin.html` - AWS Skripte hinzugefügt
- `js/admin/sections/hero-about.js` - Verbessertes Logging und Fehlerbehandlung
- `js/aws-app-config.js` - AWS Konfiguration (bereits vorhanden)
- `js/aws-media.js` - Upload-Funktionen (bereits vorhanden)

### 2. Upload-Flow

Der Bild-Upload funktioniert nun wie folgt:

1. **Primärer Weg: AWS S3**
   - Bild wird zu AWS S3 hochgeladen
   - Nutzt Presigned URLs für sicheren Upload
   - Speichert die öffentliche S3 URL

2. **Fallback: Base64**
   - Falls AWS nicht verfügbar ist
   - Konvertiert Bild zu Base64
   - Speichert lokal in localStorage

### 3. Speicher-Locations

Hochgeladene Bilder werden gespeichert in:
- **AWS S3**: `s3://manuel-weiss-public-media/public/profile-images/owner/[timestamp]-[filename]`
- **localStorage Keys**:
  - `adminProfileImage`
  - `heroProfileImage`
  - `profileImage`
  - `heroData` (als Teil der JSON-Struktur)

### 4. Website-Integration

Die Startseite (`index.html`) lädt Bilder automatisch aus:
1. `heroData.profileImage`
2. `adminProfileImage`
3. `heroProfileImage`
4. `profileImage`

## 🧪 Testen der Implementierung

### Option 1: Über Admin Panel

1. Öffnen Sie: https://mawps.netlify.app/admin#hero-about
2. Klicken Sie auf "Bild hochladen"
3. Wählen Sie ein Bild aus
4. Überprüfen Sie die Browser-Konsole für Logs:
   - ✅ Erfolgreiche Uploads zeigen: "S3 Upload erfolgreich"
   - ⚠️ Fallback zeigt: "S3 Upload fehlgeschlagen, verwende Base64 Fallback"

### Option 2: Test-Seite

1. Öffnen Sie: https://mawps.netlify.app/test-image-upload.html
2. Die Seite zeigt automatisch:
   - Konfigurationsstatus
   - Verfügbarkeit der AWS Module
   - API Endpoint Status
3. Wählen Sie ein Testbild aus
4. Klicken Sie "Upload testen"
5. Die Logs zeigen den kompletten Upload-Prozess

## 🔧 Konfiguration

### AWS Konfiguration überprüfen

```javascript
// In Browser-Konsole ausführen:
console.log('AWS_APP_CONFIG:', window.AWS_APP_CONFIG);
console.log('awsMedia verfügbar:', !!window.awsMedia);
```

Sollte ausgeben:
```javascript
{
  MEDIA_API_BASE: "https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod",
  REGION: "eu-central-1",
  S3_PROFILE_BUCKET_NAME: "manuel-weiss-public-media",
  S3_PROFILE_PREFIX: "public/profile-images/"
}
```

### Erwartete Console Logs bei erfolgreichem Upload

```
📤 Starting image upload: image.jpg image/jpeg 245.32 KB
✅ AWS Module verfügbar, starte S3 Upload...
📍 API Endpoint: https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod
📤 Requesting presigned URL from: https://...
✅ Presigned URL erhalten: public/profile-images/owner/1705352400000-image.jpg
✅ S3 Upload erfolgreich: https://manuel-weiss-public-media.s3.eu-central-1.amazonaws.com/...
📦 Upload Details: {bucket: "manuel-weiss-public-media", key: "...", region: "eu-central-1"}
💾 Bild gespeichert in localStorage: {method: "AWS S3", urlLength: 142, isS3: true}
🎉 Image upload completed: AWS S3
```

## 🔍 Fehlersuche

### Problem: "window.awsMedia nicht verfügbar"

**Lösung**: Überprüfen Sie, ob die AWS Skripte geladen wurden:
```html
<script src="js/aws-app-config.js?v=20250115"></script>
<script src="js/aws-media.js?v=20250115"></script>
```

### Problem: "AWS_APP_CONFIG.MEDIA_API_BASE nicht konfiguriert"

**Lösung**: Überprüfen Sie `js/aws-app-config.js`:
```javascript
MEDIA_API_BASE: 'https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod'
```

### Problem: "502 Bad Gateway" oder "API Gateway nicht verfügbar"

**Ursachen:**
1. Lambda Function ist nicht deployed
2. API Gateway Endpoint ist falsch
3. Lambda Function hat einen Fehler

**Lösung**: Überprüfen Sie das AWS Lambda Backend:
```bash
aws lambda get-function --function-name profile-media-api --region eu-central-1
```

### Problem: Bild wird hochgeladen, aber nicht auf der Website angezeigt

**Lösung**: Überprüfen Sie localStorage:
```javascript
// In Browser-Konsole:
console.log('adminProfileImage:', localStorage.getItem('adminProfileImage'));
```

Dann aktualisieren Sie die Startseite (F5 oder Cmd+R).

## 📋 Checkliste für Deployment

- [✅] AWS Skripte sind im Admin Panel geladen
- [✅] AWS_APP_CONFIG ist korrekt konfiguriert
- [✅] window.awsMedia ist verfügbar
- [⚠️] Lambda Backend ist deployed und funktional
- [✅] S3 Bucket ist konfiguriert und öffentlich zugänglich
- [✅] Frontend lädt Bilder aus localStorage
- [✅] Test-Seite erstellt für einfaches Testen

## 🎯 Nächste Schritte

1. **Testen Sie den Upload im Admin Panel**
   - Öffnen Sie https://mawps.netlify.app/admin#hero-about
   - Laden Sie ein Testbild hoch
   - Überprüfen Sie die Console-Logs

2. **Überprüfen Sie die Test-Seite**
   - Öffnen Sie https://mawps.netlify.app/test-image-upload.html
   - Führen Sie einen Test-Upload durch

3. **Verifizieren Sie die Website-Anzeige**
   - Öffnen Sie https://mawps.netlify.app/
   - Das hochgeladene Bild sollte angezeigt werden

4. **Überprüfen Sie AWS S3**
   ```bash
   aws s3 ls s3://manuel-weiss-public-media/public/profile-images/owner/ --region eu-central-1
   ```

## 🚀 Verwendung der zwei Bilder (Default & Hover)

Für die zwei verschiedenen Bilder (geschlossener/offener Mund):

1. **Aktuell**: Beide Bilder (`profile-photo-default` und `profile-photo-hover`) verwenden das gleiche Bild aus dem Admin Panel

2. **Zukünftig**: Sie können separate Upload-Felder hinzufügen:
   - "Standard-Bild" (geschlossener Mund)
   - "Hover-Bild" (offener Mund)
   
   Und diese separat in localStorage speichern:
   ```javascript
   localStorage.setItem('profileImageDefault', url1);
   localStorage.setItem('profileImageHover', url2);
   ```

## 📞 Support

Bei Problemen überprüfen Sie:
1. Browser Console für Fehler
2. Network Tab für API-Aufrufe
3. AWS CloudWatch Logs für Lambda-Fehler
4. S3 Bucket Berechtigungen

## 📝 Notizen

- Die Implementierung verwendet einen graceful fallback zu Base64
- Bilder werden in localStorage zwischengespeichert
- Die Website synchronisiert sich automatisch mit dem Admin Panel
- Mehrere localStorage Keys werden für Kompatibilität verwendet

