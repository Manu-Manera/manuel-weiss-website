# S3 CORS-Konfiguration für Hero-Video Upload

## Problem
"Netzwerkfehler beim Hochladen des Videos" - Dies deutet auf ein CORS-Problem hin.

## Lösung: S3 Bucket CORS-Konfiguration aktualisieren

Führe folgenden Befehl aus, um die CORS-Konfiguration zu setzen:

```bash
aws s3api put-bucket-cors --bucket manuel-weiss-hero-videos --cors-configuration '{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
      "AllowedOrigins": [
        "https://mawps.netlify.app",
        "https://manuel-weiss.ch",
        "https://www.manuel-weiss.ch",
        "http://localhost:8888",
        "http://localhost:3000"
      ],
      "ExposeHeaders": ["ETag", "x-amz-server-side-encryption", "x-amz-request-id"],
      "MaxAgeSeconds": 3000
    }
  ]
}'
```

## Alternative: Überprüfe die aktuelle CORS-Konfiguration

```bash
aws s3api get-bucket-cors --bucket manuel-weiss-hero-videos
```

## Wichtige Punkte

1. **AllowedOrigins**: Muss die exakte Domain enthalten, von der der Upload kommt
2. **AllowedMethods**: Muss "PUT" enthalten (für Pre-Signed URL Uploads)
3. **AllowedHeaders**: "*" erlaubt alle Header (wichtig für XMLHttpRequest)
4. **ExposeHeaders**: Erlaubt dem Browser, bestimmte Response-Header zu lesen

## Testen

Nach dem Setzen der CORS-Konfiguration:
1. Warte 1-2 Minuten (CORS-Änderungen brauchen Zeit)
2. Versuche erneut, ein Video hochzuladen
3. Prüfe die Browser-Konsole (F12) auf CORS-Fehlermeldungen

## Falls es weiterhin nicht funktioniert

1. Prüfe die Browser-Konsole auf spezifische CORS-Fehlermeldungen
2. Prüfe, ob der S3-Bucket in der richtigen Region ist (eu-central-1)
3. Prüfe die IAM-Berechtigungen für die Netlify Functions
4. Prüfe die Netlify Environment Variables

