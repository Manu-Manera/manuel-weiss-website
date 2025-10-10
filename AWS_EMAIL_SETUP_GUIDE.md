# AWS E-Mail-Konfiguration für Cognito

## Problem
Bei der Registrierung erhalten Sie eine Erfolgsmeldung, aber der Bestätigungscode kommt nie an. Das liegt daran, dass AWS Cognito standardmäßig keine E-Mails sendet - dies muss konfiguriert werden.

## Lösung
Wir konfigurieren Amazon SES (Simple Email Service) für E-Mail-Versand und verknüpfen es mit Cognito.

## Schritt-für-Schritt Anleitung

### 1. AWS CLI konfigurieren
```bash
# AWS CLI installieren (falls noch nicht geschehen)
# https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

# AWS konfigurieren
aws configure
# Geben Sie Ihre AWS Access Key ID, Secret Access Key und Region (eu-central-1) ein
```

### 2. E-Mail-Konfiguration einrichten

#### Option A: Vollständiges Setup (empfohlen)
```bash
# Führen Sie das vollständige Setup aus
./setup-aws-cognito-with-email.sh
```

#### Option B: Nur E-Mail-Konfiguration
```bash
# Falls Cognito bereits existiert, nur E-Mail konfigurieren
./setup-aws-ses.sh
```

### 3. E-Mail-Adresse verifizieren

Nach dem Ausführen des Scripts erhalten Sie eine E-Mail an `noreply@mawps.netlify.app`:

1. **Prüfen Sie Ihr E-Mail-Postfach** (auch Spam-Ordner)
2. **Klicken Sie auf den Bestätigungslink** in der E-Mail
3. **Warten Sie 5-10 Minuten** für die Aktivierung

### 4. SES Sandbox-Modus verlassen (für Produktion)

Standardmäßig ist SES im Sandbox-Modus und kann nur an verifizierte E-Mail-Adressen senden.

#### Für Produktion:
1. Gehen Sie zur [AWS SES Console](https://console.aws.amazon.com/ses/home?region=eu-central-1#/account)
2. Klicken Sie auf "Request production access"
3. Füllen Sie das Formular aus:
   - **Use case description**: "E-Mail-Bestätigung für Website-Registrierung"
   - **Website URL**: "https://mawps.netlify.app"
   - **Expected sending volume**: "100-1000 E-Mails pro Monat"
   - **Bounce and complaint handling**: Beschreiben Sie Ihren Prozess

#### Alternative: Verifizierte E-Mail-Adressen verwenden
Falls Sie nicht auf Produktionszugang warten möchten:
```bash
# Verifizieren Sie Ihre eigene E-Mail-Adresse
aws ses verify-email-identity --email-address "weiss-manuel@gmx.de"
```

### 5. Testen der Konfiguration

#### Test-E-Mail senden:
```bash
# Test-E-Mail an sich selbst senden
aws ses send-email \
    --source "noreply@mawps.netlify.app" \
    --destination "ToAddresses=weiss-manuel@gmx.de" \
    --message '{
        "Subject": {"Data": "Test-E-Mail", "Charset": "UTF-8"},
        "Body": {"Text": {"Data": "Test erfolgreich!", "Charset": "UTF-8"}}
    }'
```

#### Website-Registrierung testen:
1. Gehen Sie zu Ihrer Website
2. Klicken Sie auf "Registrieren"
3. Geben Sie eine E-Mail-Adresse ein
4. Prüfen Sie, ob die Bestätigungs-E-Mail ankommt

## Troubleshooting

### Problem: E-Mails kommen nicht an
**Lösung:**
- Prüfen Sie den Spam-Ordner
- Stellen Sie sicher, dass die E-Mail-Adresse verifiziert ist
- Warten Sie 5-10 Minuten nach der Verifizierung

### Problem: "Email address not verified" Fehler
**Lösung:**
```bash
# E-Mail-Adresse erneut verifizieren
aws ses verify-email-identity --email-address "noreply@mawps.netlify.app"
```

### Problem: SES Sandbox-Modus
**Lösung:**
- Verwenden Sie nur verifizierte E-Mail-Adressen für Tests
- Beantragen Sie Produktionszugang für echte Nutzer

### Problem: Cognito sendet keine E-Mails
**Lösung:**
```bash
# Cognito E-Mail-Konfiguration prüfen
aws cognito-idp describe-user-pool --user-pool-id YOUR_USER_POOL_ID
```

## Konfigurationsdateien

Nach dem Setup werden folgende Dateien aktualisiert:
- `js/aws-config.js` - AWS-Konfiguration
- `js/aws-auth-system.js` - Authentifizierung
- `js/auth-modals.js` - Login/Registrierung UI

## Überwachung

#### SES-Statistiken prüfen:
```bash
# Sending quota prüfen
aws ses get-send-quota

# Verifizierte Identitäten prüfen
aws ses list-verified-email-addresses
```

#### Cognito-Statistiken prüfen:
```bash
# User Pool Details
aws cognito-idp describe-user-pool --user-pool-id YOUR_USER_POOL_ID

# Benutzer auflisten
aws cognito-idp list-users --user-pool-id YOUR_USER_POOL_ID
```

## Kosten

- **SES**: 0,10 USD pro 1000 E-Mails
- **Cognito**: Kostenlos für bis zu 50.000 aktive Nutzer
- **S3**: Kostenlos für bis zu 5 GB
- **DynamoDB**: Kostenlos für bis zu 25 GB

## Sicherheit

- E-Mail-Adressen werden nur für Bestätigungen verwendet
- Keine Marketing-E-Mails ohne Einwilligung
- DSGVO-konforme Datenverarbeitung
- Sichere AWS-Infrastruktur

## Support

Bei Problemen:
1. Prüfen Sie die AWS CloudWatch Logs
2. Kontaktieren Sie: weiss-manuel@gmx.de
3. AWS Support (falls verfügbar)

---

**Status**: ✅ E-Mail-Konfiguration bereit
**Nächster Schritt**: Führen Sie `./setup-aws-cognito-with-email.sh` aus
