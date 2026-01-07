# Highscore Database Error Fix

## Problem
"Database error" beim Speichern von Highscores.

## Mögliche Ursachen

### 1. IAM Policy nicht angewendet
Die IAM Policy `iam-policy-hero-video.json` muss auf den IAM User angewendet werden, der von Netlify verwendet wird.

**Schritte:**
1. Öffne AWS Console → IAM → Users
2. Finde den User (wahrscheinlich `netlify-hero-video-upload`)
3. Gehe zu "Permissions" → "Add permissions" → "Attach policies directly"
4. Suche nach der Policy oder erstelle eine neue Policy mit dem Inhalt aus `iam-policy-hero-video.json`

### 2. Netlify Environment Variables
Stelle sicher, dass folgende Variablen in Netlify gesetzt sind:
- `NETLIFY_AWS_REGION=eu-central-1`
- `NETLIFY_AWS_ACCESS_KEY_ID=<dein-access-key>`
- `NETLIFY_AWS_SECRET_ACCESS_KEY=<dein-secret-key>`

**Prüfen:**
1. Netlify Dashboard → Site Settings → Environment Variables
2. Prüfe ob alle drei Variablen vorhanden sind

### 3. DynamoDB Tabelle
Die Tabelle `snowflake-highscores` existiert bereits und ist ACTIVE.

**Prüfen:**
```bash
aws dynamodb describe-table --table-name snowflake-highscores --region eu-central-1
```

### 4. Error Logs prüfen
Die Netlify Function loggt jetzt detailliertere Fehler:
1. Netlify Dashboard → Functions → `snowflake-highscores`
2. Prüfe die Logs für spezifische Fehlermeldungen

## Lösung

Die häufigste Ursache ist, dass die IAM Policy noch nicht auf den User angewendet wurde. Die Policy ist in `iam-policy-hero-video.json` definiert und muss in AWS angewendet werden.

