# 📸 Anleitung: Profilbilder im Admin Panel hochladen

## 🎯 Kurzanleitung (3 Schritte)

### Schritt 1: Admin Panel öffnen
Öffnen Sie: **https://mawps.netlify.app/admin#hero-about**

### Schritt 2: Bilder hochladen
Sie sehen nun **zwei Upload-Bereiche** nebeneinander:

#### Links: Standard-Bild (geschlossener Mund)
- Klicken Sie auf **"Standard-Bild hochladen"**
- Wählen Sie das Bild mit **geschlossenem Mund** aus (das mit der Brille, lächelnd)
- Das Bild wird automatisch hochgeladen

#### Rechts: Hover-Bild (offener Mund)  
- Klicken Sie auf **"Hover-Bild hochladen"**
- Wählen Sie das Bild mit **offenem Mund** aus (das mit der Brille, lachend)
- Das Bild wird automatisch hochgeladen

### Schritt 3: Überprüfen
- Öffnen Sie: **https://mawps.netlify.app/**
- Das Standard-Bild sollte angezeigt werden
- Fahren Sie mit der Maus über das Bild
- Das Hover-Bild sollte erscheinen

## ✨ Was passiert beim Upload?

### Automatischer Upload-Prozess:

1. **AWS S3 Upload (Primär)**
   - Bild wird zu AWS S3 hochgeladen
   - Sie erhalten eine öffentliche URL
   - ✅ Erfolgsmeldung: "Profilbild erfolgreich auf AWS S3 hochgeladen"

2. **Fallback: Lokale Speicherung**
   - Falls AWS nicht verfügbar ist
   - Bild wird als Base64 in localStorage gespeichert
   - ✅ Erfolgsmeldung: "Profilbild lokal gespeichert (Base64)"

3. **Automatische Synchronisation**
   - Die Website wird automatisch aktualisiert
   - Keine manuelle Aktualisierung nötig
   - Live-Updates alle 2 Sekunden

## 🔍 Fehlersuche

### Problem: "AWS Upload Module nicht geladen"

**Ursache**: AWS Skripte wurden nicht korrekt geladen

**Lösung**:
1. Öffnen Sie die Browser-Konsole (F12)
2. Führen Sie aus:
   ```javascript
   console.log('awsMedia:', !!window.awsMedia);
   console.log('AWS_APP_CONFIG:', window.AWS_APP_CONFIG);
   ```
3. Sollte `awsMedia: true` zeigen

### Problem: "AWS API nicht konfiguriert"

**Ursache**: API Endpoint fehlt

**Lösung**:
1. Überprüfen Sie `js/aws-app-config.js`
2. `MEDIA_API_BASE` sollte gesetzt sein:
   ```javascript
   MEDIA_API_BASE: 'https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod'
   ```

### Problem: Bilder werden nicht auf der Website angezeigt

**Lösung**:
1. Öffnen Sie die Browser-Konsole auf der Startseite
2. Überprüfen Sie localStorage:
   ```javascript
   console.log('Default:', localStorage.getItem('profileImageDefault'));
   console.log('Hover:', localStorage.getItem('profileImageHover'));
   ```
3. Aktualisieren Sie die Seite (F5)

## 📦 Technische Details

### Speicher-Struktur

```javascript
// localStorage Keys:
profileImageDefault  → Standard-Bild (geschlossener Mund)
profileImageHover    → Hover-Bild (offener Mund)
adminProfileImage    → Legacy (für Kompatibilität)
heroProfileImage     → Legacy (für Kompatibilität)
profileImage         → Legacy (für Kompatibilität)
```

### Unterstützte Dateiformate
- **JPG/JPEG** (empfohlen)
- **PNG**
- **SVG**
- **Max. Dateigröße**: 5 MB pro Bild

### AWS S3 Struktur
```
Bucket: manuel-weiss-public-media
Pfad: public/profile-images/owner/[timestamp]-[filename]
Region: eu-central-1
```

## 🎨 Empfehlungen für optimale Ergebnisse

1. **Bildgröße**: 
   - Empfohlen: 800x800 bis 1200x1200 Pixel
   - Mindestens: 400x400 Pixel

2. **Dateiformat**:
   - Beste Qualität: JPG mit 85-90% Qualität
   - Schnellste Ladezeit: Optimierte JPGs (TinyJPG, ImageOptim)

3. **Hintergrund**:
   - Verwenden Sie ähnliche Hintergründe für beide Bilder
   - So wirkt der Übergang smoother

4. **Bildausschnitt**:
   - Gleicher Bildausschnitt für beide Fotos
   - Zentriertes Gesicht
   - Genug Platz am Rand

## 📞 Hilfe

Bei weiteren Fragen oder Problemen:
- Überprüfen Sie die Browser-Konsole (F12 → Console)
- Nutzen Sie die Test-Seite: https://mawps.netlify.app/test-image-upload.html
- Lesen Sie: ADMIN_BILD_UPLOAD_ANLEITUNG.md für technische Details

