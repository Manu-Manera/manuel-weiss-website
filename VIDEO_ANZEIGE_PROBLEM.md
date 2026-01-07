# Problem: Video wird nicht angezeigt

## Ursache
Die **Bucket Policy fehlt** - Videos sind nicht öffentlich zugänglich!

## Lösung: Bucket Policy in AWS Console erstellen

### Schritt-für-Schritt:

1. **Gehe zu AWS Console**
   - https://console.aws.amazon.com/s3/

2. **Wähle den Bucket**
   - `manuel-weiss-hero-videos`

3. **Gehe zu Permissions**
   - Klicke auf den Tab "Permissions"

4. **Bucket policy**
   - Scrolle zu "Bucket policy"
   - Klicke auf "Edit"

5. **Füge diese Policy ein:**

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

6. **Speichere**
   - Klicke auf "Save changes"

7. **Warte 1-2 Minuten**
   - S3 braucht Zeit für die Propagation

8. **Teste**
   - Lade die Startseite neu (Hard Refresh: Cmd+Shift+R)
   - Öffne Browser Console (F12) und prüfe Logs
   - Das Video sollte jetzt angezeigt werden!

## Prüfen ob es funktioniert:

1. **Browser Console (F12)**
   - Suche nach: `Hero-Video geladen von: [URL]`
   - Falls Fehler: Prüfe die Fehlermeldung

2. **Video-URL direkt testen**
   - Öffne die Video-URL direkt im Browser
   - Falls 403 Forbidden: Bucket Policy fehlt noch
   - Falls Video lädt: Problem liegt woanders

3. **Netlify Function testen**
   - Öffne: `https://mawps.netlify.app/.netlify/functions/hero-video-settings`
   - Sollte JSON mit `videoUrl` zurückgeben

## Falls es weiterhin nicht funktioniert:

- Prüfe Browser Console für CORS-Fehler
- Prüfe ob die Video-URL korrekt in DynamoDB gespeichert wurde
- Prüfe ob die Netlify Function die URL korrekt zurückgibt

