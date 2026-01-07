# Hero-Video Upload Debugging Guide

## Implementierte Features

### 1. Hybrid-Upload-Strategie
- **Direkter S3-Upload (Primär)**: Für Videos < 50MB
  - Verwendet Pre-Signed URLs
  - Upload direkt vom Browser zu S3
  - Schneller, kein 6MB Netlify Function Limit
  
- **Server-Side-Upload (Fallback)**: Automatisch bei Fehlern oder Videos > 50MB
  - Konvertiert zu Base64
  - Upload über Netlify Function
  - Max. 6MB Base64-Payload (≈4.5MB Original)

### 2. Error-Handling
- Detailliertes Logging in Browser Console
- Automatischer Fallback bei Fehlern
- Spezifische Fehlermeldungen für verschiedene Probleme

### 3. AWS Credentials Prüfung
- Alle Functions prüfen AWS Credentials
- Klare Fehlermeldungen bei fehlenden Credentials

## Troubleshooting

### Problem: "S3 upload failed"

**Mögliche Ursachen:**

1. **AWS Credentials fehlen in Netlify**
   - Lösung: Setze Environment Variables in Netlify Dashboard
   - Benötigte Variablen:
     - `AWS_REGION=eu-central-1`
     - `AWS_ACCESS_KEY_ID=...`
     - `AWS_SECRET_ACCESS_KEY=...`
     - `AWS_S3_HERO_VIDEO_BUCKET=manuel-weiss-hero-videos`
     - `DYNAMODB_SETTINGS_TABLE=manuel-weiss-settings`

2. **S3 Bucket existiert nicht**
   - Lösung: Erstelle Bucket: `aws s3 mb s3://manuel-weiss-hero-videos --region eu-central-1`

3. **DynamoDB Tabelle existiert nicht**
   - Lösung: Tabelle wurde bereits erstellt: `manuel-weiss-settings`
   - Falls nicht: Siehe `NETLIFY_AWS_SETUP.md`

4. **CORS-Problem (nur bei direktem Upload)**
   - Lösung: Siehe `S3_CORS_FIX.md`
   - Oder: System wechselt automatisch zu Server-Side Upload

5. **Video zu groß für Server-Side Upload**
   - Problem: Video > 4.5MB (nach Base64-Kodierung > 6MB)
   - Lösung: Video komprimieren oder direkter Upload verwenden

### Problem: "Network Error"

**Mögliche Ursachen:**

1. **CORS nicht konfiguriert**
   - Lösung: Siehe `S3_CORS_FIX.md`
   - Oder: System wechselt automatisch zu Server-Side Upload

2. **Pre-Signed URL abgelaufen**
   - Lösung: Automatisch behoben (URL wird neu generiert)

### Problem: "AWS credentials not configured"

**Lösung:**
1. Gehe zu Netlify Dashboard → Site settings → Environment variables
2. Füge alle benötigten AWS Environment Variables hinzu
3. Redeploy die Site

## Testing

### 1. Browser Console prüfen
Öffne Browser DevTools (F12) → Console Tab
- Suche nach: `🚀`, `✅`, `❌`, `⚠️` Emojis
- Diese zeigen den Upload-Fortschritt an

### 2. Netlify Function Logs prüfen
1. Gehe zu Netlify Dashboard → Functions
2. Wähle `hero-video-upload` oder `hero-video-upload-direct`
3. Klicke auf "Logs"
4. Prüfe Fehlermeldungen

### 3. Test-Video
- Verwende ein kleines Test-Video (< 5MB)
- Prüfe, ob direkter Upload funktioniert
- Teste dann mit größerem Video (> 10MB)

## Erwartetes Verhalten

### Erfolgreicher Upload (Direkt)
```
🚀 Versuche direkten S3-Upload (Pre-Signed URL)...
✅ Video erfolgreich zu S3 hochgeladen (direkt)
✅ Video erfolgreich hochgeladen: [URL]
```

### Erfolgreicher Upload (Server-Side)
```
🚀 Versuche direkten S3-Upload (Pre-Signed URL)...
⚠️ Direkter S3-Upload fehlgeschlagen, versuche Server-Side Upload
🔄 Wechsle zu Server-Side Upload...
📦 Konvertiere File zu Base64...
✅ Base64-Konvertierung erfolgreich
✅ Video erfolgreich hochgeladen (Server-Side): [URL]
```

### Fehler
```
❌ [Detaillierte Fehlermeldung]
```

## Nächste Schritte bei Problemen

1. **Prüfe Browser Console** für detaillierte Logs
2. **Prüfe Netlify Function Logs** für Server-seitige Fehler
3. **Prüfe AWS Credentials** in Netlify Environment Variables
4. **Prüfe S3 Bucket** und DynamoDB Tabelle existieren
5. **Teste mit kleinem Video** zuerst

## Support

Bei weiteren Problemen:
- Prüfe `NETLIFY_AWS_SETUP.md` für Setup-Anleitung
- Prüfe `S3_CORS_FIX.md` für CORS-Konfiguration
- Prüfe Netlify Function Logs für detaillierte Fehlermeldungen

