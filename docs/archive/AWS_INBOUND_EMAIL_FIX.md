# AWS SES Eingehende E-Mails - Problembehebung

## ❌ Problem

Test-E-Mail an `mail@manuel-weiss.ch` kommt nicht an.

## ✅ Durchgeführte Fixes

### 1. Receipt Rule Set aktiviert ✅

**Vorher:**
- Receipt Rule Set existierte (`manu-email-rules`)
- War aber **nicht aktiv**

**Nachher:**
- Receipt Rule Set wurde aktiviert
- Eingehende E-Mails werden jetzt verarbeitet

### 2. Regel für mail@manuel-weiss.ch hinzugefügt ✅

**Problem:**
- Alte Regel hatte nur `manuel-weiss.ch` als Recipient
- E-Mails an `mail@manuel-weiss.ch` wurden nicht erfasst

**Lösung:**
- Neue Regel `mail-email-rule` hinzugefügt
- Recipient: `mail@manuel-weiss.ch`
- Actions: S3 + Lambda

## 📋 Aktuelle Konfiguration

### MX-Records ✅
- `manuel-weiss.ch` → `10 inbound-smtp.eu-central-1.amazonaws.com` ✅
- `mail.manuel-weiss.ch` → `10 feedback-smtp.eu-central-1.amazonses.com` (für MAIL FROM) ✅

### Receipt Rule Set ✅
- **Name:** `manu-email-rules`
- **Status:** Aktiv ✅
- **Rules:**
  1. Domain Rule: `manuel-weiss.ch` (alle E-Mails an @manuel-weiss.ch)
  2. Email Rule: `mail@manuel-weiss.ch` (spezifisch für mail@)

### E-Mail-Verarbeitung ✅
- **S3 Bucket:** `manu-email-storage-038333965110`
- **Pfad:** `emails/`
- **Lambda Function:** `ManuelWeissEmailSetup-EmailProcessor218EC076-i0Dq2uhJRLy9`

## 📧 Wo kommen E-Mails an?

### 1. S3 Bucket
E-Mails werden automatisch im S3 Bucket gespeichert:
- **Bucket:** `manu-email-storage-038333965110`
- **Pfad:** `s3://manu-email-storage-038333965110/emails/`

### 2. Lambda Function
Die Lambda Function wird für jede eingehende E-Mail ausgeführt:
- **Function:** `ManuelWeissEmailSetup-EmailProcessor218EC076-i0Dq2uhJRLy9`
- **Logs:** CloudWatch Logs

## 🔍 Eingehende E-Mails prüfen

### S3 Bucket prüfen:
```bash
# Liste aller E-Mails
aws s3 ls s3://manu-email-storage-038333965110/emails/ --recursive

# Letzte E-Mail anzeigen
aws s3 ls s3://manu-email-storage-038333965110/emails/ --recursive | tail -1
```

### Lambda Logs prüfen:
```bash
# Log-Gruppe finden
aws logs describe-log-groups --query "logGroups[?contains(logGroupName, 'EmailProcessor')]" --output table

# Letzte Logs anzeigen
aws logs tail /aws/lambda/ManuelWeissEmailSetup-EmailProcessor218EC076-i0Dq2uhJRLy9 --follow
```

### AWS Console:
1. **S3 Console:** https://console.aws.amazon.com/s3/
   - Bucket: `manu-email-storage-038333965110`
   - Pfad: `emails/`

2. **CloudWatch Logs:** https://console.aws.amazon.com/cloudwatch/
   - Log Group: `/aws/lambda/ManuelWeissEmailSetup-EmailProcessor218EC076-i0Dq2uhJRLy9`

3. **SES Console:** https://console.aws.amazon.com/ses/
   - Region: `eu-central-1`
   - Receipt Rules: `manu-email-rules`

## ⚠️ Wichtige Hinweise

### E-Mails werden NICHT in ein E-Mail-Client weitergeleitet!

**Aktueller Setup:**
- E-Mails werden in S3 gespeichert ✅
- Lambda Function wird ausgeführt ✅
- **ABER:** Keine automatische Weiterleitung an eine E-Mail-Adresse

### Optionen für E-Mail-Zugriff:

#### Option 1: S3 direkt nutzen
- E-Mails im S3 Bucket abrufen
- Manuell oder mit Script herunterladen

#### Option 2: Lambda erweitern
Lambda Function so erweitern, dass sie E-Mails weiterleitet:

```javascript
// In Lambda Function hinzufügen:
const ses = new AWS.SES();

// E-Mail aus S3 lesen
const email = await s3.getObject({
  Bucket: 'manu-email-storage-038333965110',
  Key: s3Key
}).promise();

// Weiterleiten an Ihre E-Mail-Adresse
await ses.sendEmail({
  Source: 'mail@manuel-weiss.ch',
  Destination: { ToAddresses: ['weiss-manuel@gmx.de'] },
  Message: {
    Subject: { Data: 'Weitergeleitet: ' + originalSubject },
    Body: { Text: { Data: email.Body.toString() } }
  }
}).promise();
```

#### Option 3: AWS WorkMail nutzen
Für vollständiges E-Mail-System mit IMAP/POP3:
- Kosten: ~$4/Monat pro Mailbox
- IMAP/POP3 Zugriff
- Webmail Interface
- Kalender, Kontakte

## 🧪 Test

### Test-E-Mail senden:
```bash
# Von einer anderen E-Mail-Adresse senden
# z.B. von Gmail, Outlook, etc.
# An: mail@manuel-weiss.ch
```

### Nach dem Versand prüfen:
```bash
# Warte 1-2 Minuten
# Dann prüfe S3:
aws s3 ls s3://manu-email-storage-038333965110/emails/ --recursive | tail -5

# Prüfe Lambda Logs:
aws logs tail /aws/lambda/ManuelWeissEmailSetup-EmailProcessor218EC076-i0Dq2uhJRLy9 --since 5m
```

## ✅ Status

- ✅ MX-Record: Konfiguriert
- ✅ Receipt Rule Set: Aktiviert
- ✅ Regel für mail@manuel-weiss.ch: Hinzugefügt
- ✅ S3 Bucket: Bereit
- ✅ Lambda Function: Aktiv

**E-Mails sollten jetzt ankommen und in S3 gespeichert werden!**

## 🔗 Nützliche Links

- **S3 Console:** https://console.aws.amazon.com/s3/buckets/manu-email-storage-038333965110
- **SES Console:** https://console.aws.amazon.com/ses/home?region=eu-central-1#/receipt-rules
- **CloudWatch Logs:** https://console.aws.amazon.com/cloudwatch/home?region=eu-central-1#logsV2:log-groups

