# Netlify AWS Setup für Hero-Video Upload

## Problem: "S3 upload failed"

Dieser Fehler tritt auf, wenn die AWS Credentials in Netlify nicht korrekt konfiguriert sind.

## Lösung: AWS Credentials in Netlify setzen

### 1. Gehe zu Netlify Dashboard

1. Öffne https://app.netlify.com
2. Wähle deine Site (`mawps` oder `manuel-weiss`)
3. Gehe zu **Site settings** → **Environment variables**

### 2. Setze folgende Environment Variables

Füge folgende Variablen hinzu:

```
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=dein-access-key-id
AWS_SECRET_ACCESS_KEY=dein-secret-access-key
AWS_S3_HERO_VIDEO_BUCKET=manuel-weiss-hero-videos
DYNAMODB_SETTINGS_TABLE=manuel-weiss-settings
```

### 3. AWS IAM User erstellen (falls noch nicht vorhanden)

Falls du noch keinen IAM User mit den richtigen Berechtigungen hast:

```bash
# Erstelle IAM User
aws iam create-user --user-name netlify-hero-video-upload

# Erstelle Access Key
aws iam create-access-key --user-name netlify-hero-video-upload

# Erstelle Policy für S3 und DynamoDB
aws iam create-policy \
  --policy-name NetlifyHeroVideoUploadPolicy \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "s3:PutObject",
          "s3:GetObject",
          "s3:ListBucket",
          "s3:HeadBucket"
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
  }'

# Attach Policy zu User
aws iam attach-user-policy \
  --user-name netlify-hero-video-upload \
  --policy-arn arn:aws:iam::038333965110:policy/NetlifyHeroVideoUploadPolicy
```

### 4. Nach dem Setzen der Variablen

1. **Redeploy** die Site in Netlify (oder warte auf automatisches Deploy)
2. Die Environment Variables werden beim nächsten Deploy aktiv

### 5. Testen

1. Gehe zum Admin Panel → Hero-Video
2. Versuche erneut, ein Video hochzuladen
3. Prüfe die Netlify Function Logs für detaillierte Fehlermeldungen

## Troubleshooting

### Fehler: "Access denied"
- Prüfe, ob die IAM Policy korrekt angehängt ist
- Prüfe, ob die Resource ARNs korrekt sind

### Fehler: "Bucket not found"
- Prüfe, ob der Bucket-Name korrekt ist: `manuel-weiss-hero-videos`
- Prüfe, ob der Bucket in der richtigen Region ist: `eu-central-1`

### Fehler: "Invalid Access Key"
- Prüfe, ob `AWS_ACCESS_KEY_ID` korrekt ist (keine Leerzeichen, vollständig)
- Prüfe, ob `AWS_SECRET_ACCESS_KEY` korrekt ist

### Fehler: "DynamoDB table not found"
- Prüfe, ob die Tabelle `manuel-weiss-settings` existiert
- Falls nicht, erstelle sie:
  ```bash
  aws dynamodb create-table \
    --table-name manuel-weiss-settings \
    --attribute-definitions AttributeName=settingKey,AttributeType=S \
    --key-schema AttributeName=settingKey,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region eu-central-1
  ```

## Prüfen der aktuellen Konfiguration

```bash
# Prüfe Bucket
aws s3 ls s3://manuel-weiss-hero-videos

# Prüfe DynamoDB Tabelle
aws dynamodb describe-table --table-name manuel-weiss-settings --region eu-central-1
```

