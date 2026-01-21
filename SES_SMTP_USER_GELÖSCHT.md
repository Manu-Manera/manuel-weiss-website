# 🔓 SES SMTP User gelöscht: Auswirkungen & Lösung

> **Status:** `manu-ses-smtp-user` wurde gelöscht  
> **Datum:** 2026-01-21

---

## 📊 Aktuelle Situation

### ✅ **Was funktioniert:**
- ✅ **SES ist aktiviert:** `Enabled: true`
- ✅ **Lambda Functions:** Verwenden IAM Roles (keine expliziten Credentials)
- ✅ **E-Mail-Versand über Lambda:** Funktioniert weiterhin

### ⚠️ **Was betroffen sein könnte:**
- ⚠️ **Netlify Functions:** Verwenden `NETLIFY_AWS_ACCESS_KEY_ID` / `NETLIFY_AWS_SECRET_ACCESS_KEY`
- ⚠️ **SMTP für E-Mail-Clients:** Falls dieser User für Mail.app verwendet wurde

---

## 🔍 Betroffene Services

### **1. Netlify Functions (könnten betroffen sein)**

**Funktionen, die AWS Credentials verwenden:**
- `netlify/functions/send-contact-email.js`
- `netlify/functions/user-data.js`
- `netlify/functions/s3-upload.js`
- `netlify/functions/hero-video-settings.js`
- `netlify/functions/snowflake-highscores.js`
- ... und weitere

**Verwendete Environment Variables:**
```
NETLIFY_AWS_ACCESS_KEY_ID
NETLIFY_AWS_SECRET_ACCESS_KEY
```

**Status:** Falls diese Credentials vom gelöschten User stammen → **Müssen erneuert werden**

---

### **2. Lambda Functions (NICHT betroffen)**

**Lambda Functions verwenden IAM Roles:**
- `lambda/contact-email/index.js` - Verwendet IAM Role
- `lambda/email-forwarder/` - Verwendet IAM Role
- Alle anderen Lambda Functions - Verwenden IAM Roles

**Status:** ✅ **Funktionieren weiterhin** (keine Änderung nötig)

---

### **3. E-Mail-Clients (könnten betroffen sein)**

Falls `manu-ses-smtp-user` für SMTP in Mail.app oder anderen E-Mail-Clients verwendet wurde:

**Status:** ⚠️ **SMTP-Zugriff funktioniert nicht mehr**

**Lösung:** Neuen SMTP User erstellen (siehe unten)

---

## 🔧 Lösungsansätze

### **Option 1: Neuen SMTP User erstellen (falls für E-Mail-Clients benötigt)**

```bash
# 1. Neuen IAM User erstellen
aws iam create-user --user-name manu-ses-smtp-user-v2

# 2. SES Policy anhängen
aws iam attach-user-policy \
  --user-name manu-ses-smtp-user-v2 \
  --policy-arn arn:aws:iam::aws:policy/AmazonSESFullAccess

# 3. Access Key erstellen
aws iam create-access-key --user-name manu-ses-smtp-user-v2

# 4. SMTP Password generieren (für E-Mail-Clients)
# Siehe: https://docs.aws.amazon.com/ses/latest/dg/smtp-credentials.html
```

**Hinweis:** Für E-Mail-Clients wird ein **SMTP Password** benötigt (nicht der Secret Access Key direkt).

---

### **Option 2: Netlify Functions Credentials erneuern**

Falls die Netlify Functions die Credentials vom gelöschten User verwendet haben:

#### **Schritt 1: Neuen IAM User erstellen**

```bash
# User erstellen
aws iam create-user --user-name netlify-website-user

# Policy anhängen (minimal notwendige Permissions)
aws iam attach-user-policy \
  --user-name netlify-website-user \
  --policy-arn arn:aws:iam::aws:policy/AmazonSESFullAccess

# Zusätzliche Permissions für DynamoDB, S3, etc.
aws iam attach-user-policy \
  --user-name netlify-website-user \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

aws iam attach-user-policy \
  --user-name netlify-website-user \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
```

#### **Schritt 2: Access Keys erstellen**

```bash
aws iam create-access-key --user-name netlify-website-user
```

**Output:**
```json
{
    "AccessKey": {
        "UserName": "netlify-website-user",
        "AccessKeyId": "AKIA...",
        "Status": "Active",
        "SecretAccessKey": "...",
        "CreateDate": "2026-01-21T..."
    }
}
```

#### **Schritt 3: In Netlify Environment Variables setzen**

1. **Netlify Dashboard** → **Site settings** → **Environment variables**
2. **Aktualisieren:**
   - `NETLIFY_AWS_ACCESS_KEY_ID` = `[NEUER_ACCESS_KEY_ID]`
   - `NETLIFY_AWS_SECRET_ACCESS_KEY` = `[NEUER_SECRET_ACCESS_KEY]` (als Secret markieren!)

3. **Deployment neu starten:**
   - **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

---

### **Option 3: IAM Roles für Netlify Functions (Langfristig)**

**Besser:** Netlify Functions auf AWS Lambda migrieren (siehe `MIGRATION_STATUS_UND_SCHRITTE.md`)

Dann verwenden Lambda Functions IAM Roles statt Access Keys.

---

## 🧪 Testen

### **1. Netlify Functions testen:**

```bash
# Kontaktformular testen
curl -X POST https://mawps.netlify.app/.netlify/functions/send-contact-email \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test"}'
```

**Erwartetes Ergebnis:**
- ✅ Erfolg: E-Mail wird gesendet
- ❌ Fehler: `InvalidAccessKeyId` → Credentials müssen erneuert werden

### **2. Lambda Functions testen:**

```bash
# Lambda Function direkt testen (falls deployed)
aws lambda invoke \
  --function-name website-contact-email \
  --payload '{"httpMethod":"POST","body":"{\"name\":\"Test\",\"email\":\"test@example.com\",\"message\":\"Test\"}"}' \
  response.json
```

**Erwartetes Ergebnis:**
- ✅ Erfolg: Lambda verwendet IAM Role, funktioniert weiterhin

### **3. E-Mail-Versand testen:**

```bash
# Direkt über SES testen
aws ses send-email \
  --source noreply@manuel-weiss.ch \
  --destination ToAddresses=kontakt@manuel-weiss.ch \
  --message Subject.Data="Test" Body.Text.Data="Test E-Mail" \
  --region eu-central-1
```

**Erwartetes Ergebnis:**
- ✅ Erfolg: SES funktioniert
- ❌ Fehler: Falls Access Denied → IAM Permissions prüfen

---

## 📋 Checkliste

- [ ] **Prüfen:** Funktionieren Netlify Functions noch?
- [ ] **Prüfen:** Wurde der User für E-Mail-Clients verwendet?
- [ ] **Falls nötig:** Neuen IAM User erstellen
- [ ] **Falls nötig:** Access Keys in Netlify Environment Variables aktualisieren
- [ ] **Falls nötig:** SMTP Password für E-Mail-Clients generieren
- [ ] **Testen:** Alle betroffenen Services testen
- [ ] **Dokumentation:** `AWS_KEY_SICHER_KONFIGURIEREN.md` aktualisieren

---

## 🔗 Verwandte Dokumentation

- `AWS_KEY_SICHER_KONFIGURIEREN.md` - Sichere Konfiguration von AWS Keys
- `MIGRATION_STATUS_UND_SCHRITTE.md` - Migration zu AWS Lambda (verwendet IAM Roles)
- `EMAIL_SETUP_ANLEITUNG.md` - E-Mail-Setup Anleitung

---

## ⚠️ Wichtige Hinweise

1. **Access Keys rotieren:** Mindestens alle 90 Tage
2. **Minimale Permissions:** Nur notwendige Permissions vergeben
3. **Secrets verschlüsseln:** In Netlify als "Secret" markieren
4. **Langfristig:** Auf IAM Roles migrieren (Lambda Functions)

---

*Erstellt: 2026-01-21*  
*Status: User gelöscht, Auswirkungen prüfen*
