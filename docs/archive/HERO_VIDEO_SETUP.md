# Hero-Video Upload System - Setup Guide

## Übersicht

Das Hero-Video-System ermöglicht es, das Hintergrund-Video auf der Startseite über das Admin-Panel zu verwalten. Videos werden auf AWS S3 gespeichert und die URL wird in DynamoDB gespeichert.

## AWS Setup

### 1. S3 Bucket erstellen

```bash
# Erstelle einen S3 Bucket für Hero-Videos
aws s3 mb s3://manuel-weiss-hero-videos --region eu-central-1

# Setze Bucket-Policy für öffentlichen Lesezugriff
aws s3api put-bucket-policy --bucket manuel-weiss-hero-videos --policy '{
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
}'

# Aktiviere CORS für Browser-Uploads
aws s3api put-bucket-cors --bucket manuel-weiss-hero-videos --cors-configuration '{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedOrigins": ["https://manuel-weiss.ch", "https://www.manuel-weiss.ch", "https://mawps.netlify.app"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}'
```

### 2. DynamoDB Tabelle erstellen (falls noch nicht vorhanden)

```bash
aws dynamodb create-table \
  --table-name manuel-weiss-settings \
  --attribute-definitions AttributeName=settingKey,AttributeType=S \
  --key-schema AttributeName=settingKey,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region eu-central-1
```

### 3. IAM Policy für Netlify Functions

Die Netlify Functions benötigen folgende Berechtigungen:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::manuel-weiss-hero-videos",
        "arn:aws:s3:::manuel-weiss-hero-videos/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem"
      ],
      "Resource": "arn:aws:dynamodb:eu-central-1:*:table/manuel-weiss-settings"
    }
  ]
}
```

## Netlify Environment Variables

Setze folgende Umgebungsvariablen im Netlify Dashboard:

1. **Site settings → Environment variables**

```
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=dein-access-key
AWS_SECRET_ACCESS_KEY=dein-secret-key
AWS_S3_HERO_VIDEO_BUCKET=manuel-weiss-hero-videos
DYNAMODB_SETTINGS_TABLE=manuel-weiss-settings
```

## Verwendung

### Im Admin-Panel

1. Gehe zu **Admin Panel → Hero-Video**
2. Klicke auf **"Datei auswählen"** und wähle ein MP4-Video (max. 100MB)
3. Klicke auf **"Video hochladen und aktivieren"**
4. Das Video wird automatisch zu S3 hochgeladen und auf der Startseite angezeigt

### Auf der Startseite

Die Startseite lädt automatisch die Video-URL von der API und zeigt das Video im Hintergrund an. Falls keine URL gesetzt ist, wird das Fallback-Video (`media/hero-manuel.mp4`) verwendet.

## API Endpoints

### GET `/.netlify/functions/hero-video-settings`
Lädt die aktuelle Video-URL.

**Response:**
```json
{
  "videoUrl": "https://manuel-weiss-hero-videos.s3.eu-central-1.amazonaws.com/hero-videos/1234567890-video.mp4",
  "updatedAt": "2025-01-07T10:00:00.000Z"
}
```

### POST `/.netlify/functions/hero-video-settings`
Speichert eine neue Video-URL.

**Request:**
```json
{
  "videoUrl": "https://manuel-weiss-hero-videos.s3.eu-central-1.amazonaws.com/hero-videos/1234567890-video.mp4"
}
```

### POST `/.netlify/functions/hero-video-upload`
Generiert eine Pre-Signed URL für direkten Upload zu S3.

**Request:**
```json
{
  "fileName": "hero-video.mp4",
  "contentType": "video/mp4"
}
```

**Response:**
```json
{
  "uploadUrl": "https://manuel-weiss-hero-videos.s3.eu-central-1.amazonaws.com/hero-videos/1234567890-hero-video.mp4?X-Amz-Algorithm=...",
  "publicUrl": "https://manuel-weiss-hero-videos.s3.eu-central-1.amazonaws.com/hero-videos/1234567890-hero-video.mp4",
  "key": "hero-videos/1234567890-hero-video.mp4",
  "expiresIn": 300
}
```

## Troubleshooting

### Video wird nicht angezeigt
- Prüfe, ob die Video-URL in DynamoDB gespeichert ist
- Prüfe, ob der S3-Bucket öffentlich lesbar ist
- Prüfe die Browser-Konsole auf Fehler

### Upload schlägt fehl
- Prüfe die Netlify Environment Variables
- Prüfe die IAM-Berechtigungen
- Prüfe die CORS-Konfiguration des S3-Buckets

### Video lädt langsam
- Komprimiere das Video (empfohlen: max. 10-20MB)
- Verwende moderne Video-Formate (H.264, MP4)
- Prüfe die S3-Region (sollte nah am Nutzer sein)

