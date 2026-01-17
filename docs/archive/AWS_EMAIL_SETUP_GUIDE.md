# AWS SES E-Mail Setup für mail@manu.ch

## 🚀 **Schnellstart**

### **1. Domain registrieren**
```bash
# Option A: Domain bei AWS Route 53 registrieren
aws route53domains register-domain \
  --domain-name manu.ch \
  --duration-in-years 1 \
  --admin-contact FirstName=Manuel,LastName=Weiss,ContactType=PERSON,CountryCode=CH,City=Zürich,State=ZH,ZipCode=8001,PhoneNumber=+41.798385590,Email=weiss-manuel@gmx.de \
  --registrant-contact FirstName=Manuel,LastName=Weiss,ContactType=PERSON,CountryCode=CH,City=Zürich,State=ZH,ZipCode=8001,PhoneNumber=+41.798385590,Email=weiss-manuel@gmx.de \
  --tech-contact FirstName=Manuel,LastName=Weiss,ContactType=PERSON,CountryCode=CH,City=Zürich,State=ZH,ZipCode=8001,PhoneNumber=+41.798385590,Email=weiss-manuel@gmx.de

# Option B: Domain bei externem Provider registrieren (z.B. Namecheap, GoDaddy)
# Dann DNS auf AWS Route 53 umleiten
```

### **2. AWS SES Setup deployen**
```bash
# CDK Stack deployen
npm install -g aws-cdk
cdk bootstrap
cdk deploy ManuEmailSetup
```

### **3. Domain verifizieren**
```bash
# Domain in SES verifizieren
aws ses verify-domain-identity --domain manu.ch

# DKIM aktivieren
aws ses put-identity-dkim-attributes --identity manu.ch --dkim-enabled
```

### **4. DKIM Tokens abrufen**
```bash
# DKIM Tokens abrufen
aws ses get-identity-dkim-attributes --identities manu.ch
```

## 📧 **E-Mail-Adressen einrichten**

### **Primäre E-Mail-Adresse**
- **mail@manu.ch** - Haupt-E-Mail-Adresse
- **info@manu.ch** - Info-E-Mail-Adresse  
- **contact@manu.ch** - Kontakt-E-Mail-Adresse

### **E-Mail-Weiterleitung**
```bash
# E-Mails an mail@manu.ch weiterleiten an weiss-manuel@gmx.de
aws ses create-receipt-rule-set --rule-set-name manu-forwarding

aws ses create-receipt-rule \
  --rule-set-name manu-forwarding \
  --rule-name forward-to-gmx \
  --recipients mail@manu.ch \
  --actions Name=Bounce,Enabled=true
```

## 🔧 **Konfiguration**

### **DNS Records (automatisch erstellt)**
- **MX Record:** `10 inbound-smtp.eu-central-1.amazonaws.com`
- **SPF Record:** `v=spf1 include:amazonses.com ~all`
- **DMARC Record:** `v=DMARC1; p=quarantine; rua=mailto:dmarc@manu.ch`
- **DKIM Records:** 3 CNAME Records (aus SES Console abrufen)

### **SES Limits erhöhen**
```bash
# Sandbox-Modus verlassen (für Produktion)
aws ses put-account-sending-enabled --enabled true

# Sending Quota erhöhen
aws sesv2 put-account-sending-enabled --enabled true
```

## 💰 **Kosten**

### **AWS SES (Empfohlen)**
- **Kostenlos:** 62.000 E-Mails/Monat
- **Danach:** $0.10 pro 1.000 E-Mails
- **Domain:** ~$15/Jahr (Route 53)

### **AWS WorkMail (Vollständig)**
- **Kosten:** $4/Monat pro Mailbox
- **Inklusive:** Kalender, Kontakte, Webmail
- **Domain:** ~$15/Jahr (Route 53)

## 📱 **E-Mail-Client Setup**

### **IMAP/SMTP Einstellungen**
```
IMAP Server: imap.eu-west-1.amazonaws.com
IMAP Port: 993 (SSL)
SMTP Server: smtp.eu-west-1.amazonaws.com  
SMTP Port: 587 (TLS)
Username: mail@manu.ch
Password: [AWS SES SMTP Password]
```

### **SMTP Password generieren**
```bash
# SMTP Password für E-Mail-Client generieren
aws iam create-user --user-name manu-ses-smtp-user
aws iam attach-user-policy \
  --user-name manu-ses-smtp-user \
  --policy-arn arn:aws:iam::aws:policy/AmazonSESFullAccess
```

## 🚀 **Deployment Commands**

```bash
# 1. Domain registrieren
aws route53domains register-domain --domain-name manu.ch --duration-in-years 1

# 2. CDK Stack deployen  
cdk deploy ManuEmailSetup

# 3. Domain verifizieren
aws ses verify-domain-identity --domain manu.ch

# 4. DKIM aktivieren
aws ses put-identity-dkim-attributes --identity manu.ch --dkim-enabled

# 5. Test-E-Mail senden
aws ses send-email \
  --source mail@manu.ch \
  --destination ToAddresses=weiss-manuel@gmx.de \
  --message Subject.Data="Test E-Mail" Body.Text.Data="Hallo von mail@manu.ch!"
```

## ✅ **Verification Steps**

1. **Domain registriert** ✅
2. **SES Domain verifiziert** ✅  
3. **DKIM aktiviert** ✅
4. **DNS Records gesetzt** ✅
5. **Test-E-Mail gesendet** ✅
6. **E-Mail-Client konfiguriert** ✅

## 🎯 **Ergebnis**

Nach dem Setup hast du:
- ✅ **mail@manu.ch** funktionsfähig
- ✅ **E-Mail-Empfang** über S3 + Lambda
- ✅ **E-Mail-Versand** über SES
- ✅ **Professionelle E-Mail-Adresse**
- ✅ **Kostenlos** für normale Nutzung

**Bereit für Deployment!** 🚀