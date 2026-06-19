# Netlify AWS Credentials Setup

## ✅ IAM User und Policy wurden erstellt

Ein IAM User mit den notwendigen Berechtigungen wurde erstellt:
- **User Name**: `netlify-hero-video-upload`
- **Policy**: `NetlifyHeroVideoUploadPolicy`

## 🔑 AWS Access Keys

**WICHTIG: Die Keys wurden erstellt, aber aus Sicherheitsgründen nicht in dieser Datei gespeichert.**

Die Keys wurden beim Erstellen des IAM Users generiert. Du findest sie:
1. In der Terminal-Ausgabe beim Erstellen des Users (siehe oben)
2. Oder erstelle neue Keys mit: `aws iam create-access-key --user-name netlify-hero-video-upload`

**Falls du die Keys nicht mehr hast, erstelle neue:**
```bash
aws iam create-access-key --user-name netlify-hero-video-upload
```

## 📋 Schritte zum Setzen in Netlify

1. **Gehe zu Netlify Dashboard**
   - Öffne https://app.netlify.com
   - Wähle deine Site (`mawps` oder `manuel-weiss`)

2. **Gehe zu Environment Variables**
   - Klicke auf **Site settings**
   - Klicke auf **Environment variables** (im linken Menü)

3. **Füge folgende Variablen hinzu:**

   Klicke auf **Add a variable** und füge jeweils eine Variable hinzu:

   | Variable Name | Value |
   |--------------|-------|
   | `AWS_REGION` | `eu-central-1` |
   | `AWS_ACCESS_KEY_ID` | `[DEIN_ACCESS_KEY_ID]` (siehe Terminal-Ausgabe oder erstelle neue Keys) |
   | `AWS_SECRET_ACCESS_KEY` | `[DEIN_SECRET_ACCESS_KEY]` (siehe Terminal-Ausgabe oder erstelle neue Keys) |
   | `AWS_S3_HERO_VIDEO_BUCKET` | `manuel-weiss-hero-videos` |
   | `DYNAMODB_SETTINGS_TABLE` | `manuel-weiss-settings` |

4. **Wichtig: Scopes setzen**
   - Für jede Variable: Stelle sicher, dass **"All scopes"** oder **"Production"** ausgewählt ist
   - Dies ist wichtig, damit die Functions die Variablen verwenden können

5. **Site neu deployen**
   - Nach dem Setzen der Variablen: **Trigger deploy** (oder warte auf automatisches Deploy)
   - Die Environment Variables werden beim nächsten Deploy aktiv

## ✅ Verifizierung

Nach dem Deploy:
1. Gehe zum Admin Panel → Hero-Video
2. Versuche, ein Video hochzuladen
3. Prüfe Browser Console (F12) für Logs
4. Falls Fehler: Prüfe Netlify Function Logs

## 🔒 Sicherheit

- **NIEMALS** diese Keys in Git committen
- **NIEMALS** diese Keys öffentlich teilen
- Die Keys sind bereits in `.gitignore` (falls vorhanden)
- Falls die Keys kompromittiert wurden: Erstelle neue Keys über AWS Console

## 🆘 Falls Keys verloren gehen

Falls du die Keys verloren hast, kannst du neue erstellen:

```bash
# Neue Access Keys erstellen
aws iam create-access-key --user-name netlify-hero-video-upload

# Alte Keys deaktivieren (falls nötig)
aws iam update-access-key --user-name netlify-hero-video-upload --access-key-id [OLD_KEY_ID] --status Inactive
```

## 📝 IAM Policy Details

Die Policy erlaubt:
- **S3**: PutObject, GetObject, ListBucket, HeadBucket, DeleteObject auf `manuel-weiss-hero-videos`
- **DynamoDB**: PutItem, GetItem, UpdateItem, Query auf `manuel-weiss-settings`

Die Policy ist minimal und folgt dem Prinzip der geringsten Berechtigung.

