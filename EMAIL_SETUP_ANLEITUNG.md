# 📧 E-Mail-Versand Setup - Anleitung

## ✅ Was wurde implementiert

Eine Netlify Function wurde erstellt, die Kontaktformulare über AWS SES an `mail@manuel-weiss.ch` sendet.

## 🔧 Setup-Schritte

### 1. AWS Credentials in Netlify konfigurieren

Die Netlify Function benötigt AWS Credentials, um E-Mails über SES zu senden.

**Im Netlify Dashboard:**
1. Gehe zu: **Site settings** → **Environment variables**
2. Füge folgende Variablen hinzu:

```
AWS_ACCESS_KEY_ID=dein-aws-access-key
AWS_SECRET_ACCESS_KEY=dein-aws-secret-key
AWS_REGION=eu-central-1
FROM_EMAIL=mail@manuel-weiss.ch
TO_EMAIL=mail@manuel-weiss.ch
```

### 2. AWS IAM User erstellen (falls noch nicht vorhanden)

Falls noch kein IAM User für SES existiert:

```bash
# IAM User erstellen
aws iam create-user --user-name netlify-ses-sender

# SES SendEmail Policy anhängen
aws iam attach-user-policy \
  --user-name netlify-ses-sender \
  --policy-arn arn:aws:iam::aws:policy/AmazonSESFullAccess

# Access Keys erstellen
aws iam create-access-key --user-name netlify-ses-sender
```

### 3. E-Mail-Adresse verifizieren

Stelle sicher, dass `mail@manuel-weiss.ch` in AWS SES verifiziert ist:

```bash
aws ses verify-email-identity --email-address mail@manuel-weiss.ch --region eu-central-1
```

## 📋 Aktueller Status

- ✅ Netlify Function erstellt: `netlify/functions/send-contact-email.js`
- ✅ Fotobox-Seite aktualisiert: Sendet jetzt E-Mails
- ✅ Wiederverwendbare Funktion: `js/send-booking-email.js`
- ⚠️ AWS Credentials müssen noch in Netlify konfiguriert werden

## 🧪 Testen

Nach dem Setup der Credentials:

1. Gehe zu: https://manuel-weiss.ch/fotobox#booking
2. Fülle das Formular aus
3. Sende eine Testanfrage
4. Prüfe E-Mail-Posteingang (mail@manuel-weiss.ch wird automatisch weitergeleitet)

## 🔍 Troubleshooting

### Fehler: "AWS-Zugriff verweigert"
- Prüfe ob AWS Credentials korrekt in Netlify gesetzt sind
- Prüfe ob IAM User die richtigen Permissions hat

### Fehler: "E-Mail-Adresse nicht verifiziert"
- Verifiziere `mail@manuel-weiss.ch` in AWS SES Console
- Prüfe ob Domain verifiziert ist

### E-Mail kommt nicht an
- Prüfe Netlify Function Logs: **Functions** → **send-contact-email**
- Prüfe AWS SES Send Quota (Sandbox-Modus hat Limits)
- Prüfe ob E-Mail in Spam-Ordner gelandet ist

## 📊 Monitoring

- **Netlify Function Logs:** Netlify Dashboard → Functions → send-contact-email
- **AWS SES Logs:** CloudWatch → SES Metrics

