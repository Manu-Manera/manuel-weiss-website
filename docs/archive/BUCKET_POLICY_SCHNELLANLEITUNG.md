# Bucket Policy schnell erstellen - 3 Schritte

## ⚡ Schnell-Anleitung (2 Minuten)

### 1. Öffne AWS Console
- Gehe zu: https://console.aws.amazon.com/s3/
- Wähle den Bucket: **`manuel-weiss-hero-videos`**

### 2. Erstelle die Policy
- Klicke auf Tab **"Permissions"**
- Scrolle zu **"Bucket policy"**
- Klicke auf **"Edit"**
- **Lösche** alles was dort steht
- **Füge diese Policy ein:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::manuel-weiss-hero-videos/*"
    }
  ]
}
```

### 3. Speichern
- Klicke auf **"Save changes"**
- Fertig! ✅

## 🎬 Nach dem Speichern

1. **Warte 1-2 Minuten** (S3 braucht Zeit)
2. **Lade die Startseite neu** (Hard Refresh: Cmd+Shift+R)
3. **Das Video sollte jetzt angezeigt werden!**

## ✅ Prüfen ob es funktioniert

- Öffne Browser Console (F12)
- Suche nach: `Hero-Video geladen von: [URL]`
- Falls Fehler: Prüfe die Fehlermeldung

