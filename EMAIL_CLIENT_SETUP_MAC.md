# 📧 E-Mail-Client Setup für macOS - mail@manuel-weiss.de

## ✅ Voraussetzungen

- ✅ SMTP-User erstellt: `manu-ses-smtp-user`
- ⚠️ E-Mail-Verifizierung: Noch `PENDING` (siehe `AWS_EMAIL_MANUEL_WEISS_DE_SETUP.md`)

## 🔑 SMTP-Credentials abrufen

### ✅ Access Key vorhanden

Dein Access Key ist bereits erstellt:
- **Access Key ID:** `AKIAQR3HB4M3JM24NYXH`
- **Status:** `Active`

### Schritt 1: Secret Access Key abrufen

Falls du den Secret Access Key nicht mehr hast, musst du einen neuen erstellen:

```bash
# Erstelle neuen Access Key (der alte wird ungültig!)
aws iam create-access-key --user-name manu-ses-smtp-user --region eu-central-1
```

**WICHTIG:** 
- Speichere die `AccessKeyId` und `SecretAccessKey` sicher!
- Der Secret Access Key wird nur einmal angezeigt!

### Schritt 2: SMTP-Passwort generieren

**Einfachste Methode: Script verwenden**

```bash
./generate-smtp-password.sh
```

Das Script fragt nach deinem Secret Access Key und generiert automatisch das SMTP-Passwort.

**Alternative Methoden:**

**Option A: Online-Tool (einfach)**
1. Gehe zu: https://docs.aws.amazon.com/ses/latest/dg/smtp-credentials.html
2. Verwende den "SMTP Credential Converter"
3. Gib ein:
   - **IAM User Name:** `manu-ses-smtp-user`
   - **Secret Access Key:** (dein SecretAccessKey)
   - **Region:** `eu-central-1`
4. Kopiere das generierte SMTP-Passwort

**Option B: Python-Script (lokal)**
```bash
# Installiere boto3 falls nötig
pip3 install boto3

# Generiere SMTP-Passwort
python3 << EOF
import hmac
import hashlib
import base64
import sys

# Ersetze SECRET_ACCESS_KEY mit deinem tatsächlichen Secret
SECRET_ACCESS_KEY = "DEIN_SECRET_ACCESS_KEY_HIER"
MESSAGE = "SendRawEmail"
VERSION = b'\x04'

signature = hmac.new(
    key=("AWS4" + SECRET_ACCESS_KEY).encode('utf-8'),
    msg=MESSAGE.encode('utf-8'),
    digestmod=hashlib.sha256
).digest()

smtp_password = base64.b64encode(VERSION + signature).decode('utf-8')
print(f"SMTP Password: {smtp_password}")
EOF
```

## 📱 macOS Mail.app einrichten

### Schritt 1: Mail.app öffnen

1. Öffne **Mail.app** auf deinem Mac
2. Gehe zu **Mail** → **Einstellungen** (oder `⌘,`)
3. Klicke auf **Konten** (oder `⌘⌥A`)

### Schritt 2: Neues Konto hinzufügen

1. Klicke auf das **+** (Plus-Symbol) unten links
2. Wähle **Weitere Mail-Accounts...**
3. Gib ein:
   - **Name:** `Manuel Weiss`
   - **E-Mail-Adresse:** `mail@manuel-weiss.de`
   - **Passwort:** (das generierte SMTP-Passwort von oben)
   - Klicke auf **Weiter**

### Schritt 3: Server-Einstellungen konfigurieren

**Falls Mail.app die Einstellungen nicht automatisch findet:**

#### Ausgehende E-Mails (SMTP):

1. Klicke auf **Weitere Optionen...**
2. Wähle **Manuell konfigurieren**
3. **Ausgehender Mail-Server (SMTP):**
   - **Server:** `email-smtp.eu-central-1.amazonaws.com`
   - **Port:** `587`
   - **Verschlüsselung:** `STARTTLS` (oder `TLS`)
   - **Authentifizierung:** `Kennwort`
   - **Benutzername:** (deine `AccessKeyId`)
   - **Passwort:** (das generierte SMTP-Passwort)

#### Eingehende E-Mails (IMAP/POP3):

**⚠️ WICHTIG:** AWS SES unterstützt **KEINEN direkten E-Mail-Empfang** über IMAP/POP3!

Du hast zwei Optionen:

**Option 1: E-Mails weiterleiten (empfohlen)**
- Konfiguriere eine Receipt Rule in AWS SES, die E-Mails an `mail@manuel-weiss.de` an eine andere E-Mail-Adresse weiterleitet (z.B. `weiss-manuel@gmx.de`)
- Dann kannst du die E-Mails in deinem normalen Postfach empfangen

**Option 2: AWS WorkMail verwenden**
- AWS WorkMail bietet vollständige IMAP/POP3-Unterstützung
- Kosten: ~$4/Monat pro Mailbox
- Server: `imap.mail.eu-central-1.awsapps.com` (Port 993)
- SMTP: `smtp.mail.eu-central-1.awsapps.com` (Port 587)

### Schritt 4: Konto speichern

1. Klicke auf **Fertig**
2. Mail.app wird versuchen, eine Verbindung herzustellen
3. Falls Fehler auftreten, prüfe die Einstellungen nochmal

## 🔧 Alternative: Thunderbird einrichten

Falls du Thunderbird verwendest:

1. **Konto hinzufügen** → **E-Mail**
2. **E-Mail-Adresse:** `mail@manuel-weiss.de`
3. **Passwort:** (SMTP-Passwort)
4. **Manuelle Konfiguration:**
   - **Eingehend:** (leer lassen oder WorkMail verwenden)
   - **Ausgehend (SMTP):**
     - **Server:** `email-smtp.eu-central-1.amazonaws.com`
     - **Port:** `587`
     - **Verschlüsselung:** `STARTTLS`
     - **Authentifizierung:** `Normale Passwort-Authentifizierung`
     - **Benutzername:** (AccessKeyId)
     - **Passwort:** (SMTP-Passwort)

## ✅ Testen

1. **Test-E-Mail senden:**
   - Öffne Mail.app
   - Erstelle eine neue E-Mail
   - Sende an eine andere E-Mail-Adresse (z.B. deine private E-Mail)
   - Prüfe, ob die E-Mail ankommt

2. **Prüfe AWS SES:**
   ```bash
   aws ses get-send-statistics --region eu-central-1
   ```

## ⚠️ Wichtige Hinweise

### E-Mail-Verifizierung
- Die E-Mail-Adresse `mail@manuel-weiss.de` muss noch verifiziert werden
- Solange der Status `PENDING` ist, kannst du **nur an verifizierte E-Mail-Adressen** senden
- Nach der Verifizierung kannst du an alle E-Mail-Adressen senden

### Sandbox-Modus
- AWS SES startet im **Sandbox-Modus**
- Im Sandbox-Modus kannst du nur an verifizierte E-Mail-Adressen senden
- Um den Sandbox-Modus zu verlassen:
  ```bash
  aws sesv2 put-account-sending-enabled --enabled true --region eu-central-1
  ```
  Oder beantrage eine Limit-Erhöhung in der AWS Console

### E-Mail-Empfang
- AWS SES ist **nur für das Senden** von E-Mails
- Für den **Empfang** brauchst du:
  - **Option 1:** Receipt Rules (E-Mails werden weitergeleitet)
  - **Option 2:** AWS WorkMail (vollständige Mailbox)

## 🔗 Nützliche Links

- **AWS SES Console:** https://console.aws.amazon.com/ses/home?region=eu-central-1
- **SMTP Credential Converter:** https://docs.aws.amazon.com/ses/latest/dg/smtp-credentials.html
- **SES Limits:** https://console.aws.amazon.com/ses/home?region=eu-central-1#/account

## 📋 Zusammenfassung der Einstellungen

```
E-Mail-Adresse: mail@manuel-weiss.de
SMTP Server: email-smtp.eu-central-1.amazonaws.com
SMTP Port: 587
Verschlüsselung: STARTTLS
Authentifizierung: Kennwort
Benutzername: [AccessKeyId]
Passwort: [Generiertes SMTP-Passwort]
```

---

**Hinweis:** Falls du Probleme hast, prüfe zuerst, ob die E-Mail-Adresse verifiziert ist und ob du im Sandbox-Modus bist.

