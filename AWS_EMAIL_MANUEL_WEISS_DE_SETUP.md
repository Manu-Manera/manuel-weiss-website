# 📧 E-Mail-Setup: mail@manuel-weiss.de

## ✅ Durchgeführte Schritte

**Datum:** 2025-11-07

### 1. Domain-Verifizierung gestartet ✅
- Domain: `manuel-weiss.de`
- Status: `PENDING`
- Region: `eu-central-1`

### 2. DKIM aktiviert ✅
- DKIM-Status: `PENDING`
- 3 DKIM-Tokens generiert

### 3. E-Mail-Adresse verifiziert ✅
- E-Mail: `mail@manuel-weiss.de`
- Status: `PENDING`
- Verifizierungs-E-Mail wurde gesendet

## 📋 Erforderliche DNS-Records

### DKIM-Records (3 CNAME Records)

Fügen Sie diese 3 CNAME-Records in Ihrem DNS-Manager hinzu:

1. **CNAME Record 1:**
   - Name: `5zcuj67ai5ufq5w25aixfhdmcj2jugdp._domainkey.manuel-weiss.de`
   - Type: `CNAME`
   - Value: `5zcuj67ai5ufq5w25aixfhdmcj2jugdp.dkim.amazonses.com`
   - TTL: `3600`

2. **CNAME Record 2:**
   - Name: `zdzcg3k4zb55mwj7as7m2bxusj4rtk3l._domainkey.manuel-weiss.de`
   - Type: `CNAME`
   - Value: `zdzcg3k4zb55mwj7as7m2bxusj4rtk3l.dkim.amazonses.com`
   - TTL: `3600`

3. **CNAME Record 3:**
   - Name: `effi2hih54bdyqog32qbwuhe3ze5okxr._domainkey.manuel-weiss.de`
   - Type: `CNAME`
   - Value: `effi2hih54bdyqog32qbwuhe3ze5okxr.dkim.amazonses.com`
   - TTL: `3600`

## 📧 E-Mail-Verifizierung

1. Prüfen Sie Ihr Postfach für `mail@manuel-weiss.de`
2. Öffnen Sie die Verifizierungs-E-Mail von AWS SES
3. Klicken Sie auf den Verifizierungs-Link

**Hinweis:** Falls die E-Mail nicht ankommt, können Sie die Verifizierung auch manuell in der AWS Console durchführen.

## ⏳ Nächste Schritte

1. **DNS-Records hinzufügen** (siehe oben)
2. **E-Mail-Verifizierung bestätigen** (Link in E-Mail klicken)
3. **Warten auf automatische Verifizierung** (24-48 Stunden)
4. **Status prüfen:**
   ```bash
   ./check-ses-complete-status.sh
   ```

## 🔍 Status prüfen

```bash
# Domain-Status
aws sesv2 get-email-identity \
  --email-identity manuel-weiss.de \
  --region eu-central-1 \
  --query "[VerificationStatus,DkimAttributes.Status]" \
  --output json

# E-Mail-Status
aws sesv2 get-email-identity \
  --email-identity mail@manuel-weiss.de \
  --region eu-central-1 \
  --query "VerificationStatus" \
  --output text
```

## 🔗 AWS Console

- SES Identities: https://console.aws.amazon.com/ses/home?region=eu-central-1#/verified-identities
- Domain: `manuel-weiss.de`
- E-Mail: `mail@manuel-weiss.de`

## ⚠️ Wichtig

- Die Verifizierung kann 24-48 Stunden dauern
- Alle DNS-Records müssen korrekt gesetzt sein
- Die E-Mail-Verifizierung muss bestätigt werden

## ✅ Nach erfolgreicher Verifizierung

Sobald beide Verifizierungen (`SUCCESS`) sind:
- ✅ E-Mails können von `mail@manuel-weiss.de` gesendet werden
- ✅ E-Mails können an `mail@manuel-weiss.de` empfangen werden (mit zusätzlicher Receipt Rule Konfiguration)

