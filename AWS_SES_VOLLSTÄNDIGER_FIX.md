# 🔧 AWS SES Vollständiger Fix - Schritt für Schritt

## ❌ Gefundene Probleme

### Problem 1: Nameserver fehlen (KRITISCH!) ⚠️
- Domain zeigt nicht auf Route53 Nameserver
- DNS-Records sind nicht öffentlich erreichbar
- **Dies ist das Hauptproblem!**

### Problem 2: SES Domain Verification fehlgeschlagen
- Status: FAILED
- ErrorType: HOST_NOT_FOUND
- Verification TXT Record wurde hinzugefügt ✅
- DKIM Records wurden hinzugefügt ✅
- **Aber:** Werden nicht gefunden wegen Nameserver-Problem

### Problem 3: Lambda Logs fehlen
- CloudWatch Log Group existiert nicht
- Bedeutet: Lambda wurde noch nie aufgerufen
- **Grund:** E-Mails kommen nicht an (wegen Problem 1)

## ✅ Bereits durchgeführte Fixes

1. ✅ **SES Verification TXT Record hinzugefügt**
   - Name: `_amazonses.manuel-weiss.ch`
   - Value: `"Lhc5q38H/NLjAaD3wH6SFeHOwPuW8M874vcsyp1cr1c="`

2. ✅ **DKIM Records hinzugefügt** (3 CNAME Records)
   - Alle 3 DKIM Tokens in Route53 gesetzt

3. ✅ **Receipt Rule Set aktiviert**
   - `manu-email-rules` ist aktiv
   - 2 Rules konfiguriert (Domain + mail@)

4. ✅ **Lambda Function erweitert**
   - E-Mail-Weiterleitung implementiert
   - Environment Variables gesetzt

5. ✅ **MX Records vorhanden**
   - In Route53 korrekt konfiguriert

## 🚨 KRITISCHER SCHRITT ERFORDERLICH

### Nameserver beim Domain-Registrar setzen

**Die Domain `manuel-weiss.ch` MUSS auf folgende Nameserver zeigen:**

```
ns-656.awsdns-18.net
ns-1665.awsdns-16.co.uk
ns-1193.awsdns-21.org
ns-371.awsdns-46.com
```

### Wie finden Sie Ihren Domain-Registrar?

```bash
# Prüfen Sie whois
whois manuel-weiss.ch | grep -i registrar
```

### Häufige Domain-Registrare:

1. **Namecheap:**
   - Login → Domain List → `manuel-weiss.ch` → Advanced DNS
   - → Nameservers → Custom DNS
   - → Eintragen: ns-656.awsdns-18.net, etc.

2. **GoDaddy:**
   - My Products → DNS → `manuel-weiss.ch`
   - → Nameservers → Change
   - → Custom → Eintragen der 4 Nameserver

3. **Hostpoint (Schweiz):**
   - Domain-Verwaltung → `manuel-weiss.ch`
   - → Nameserver → Eigene Nameserver
   - → Eintragen der 4 Nameserver

4. **Andere Registrar:**
   - Suchen Sie nach "Nameserver" oder "DNS Settings"
   - Ändern Sie zu "Custom Nameservers"
   - Tragen Sie die 4 Route53 Nameserver ein

## ⏳ Nach Nameserver-Änderung

### 1. Warten (24-48 Stunden)
DNS-Propagierung kann bis zu 48 Stunden dauern.

### 2. Prüfen
```bash
# Nameserver prüfen
dig NS manuel-weiss.ch +short

# Sollte zeigen:
# ns-656.awsdns-18.net
# ns-1665.awsdns-16.co.uk
# ns-1193.awsdns-21.org
# ns-371.awsdns-46.com

# Oder mit Script:
./check-ses-complete-status.sh
```

### 3. SES Status prüfen
```bash
aws sesv2 get-email-identity \
  --email-identity manuel-weiss.ch \
  --region eu-central-1 \
  --query "[VerificationStatus,DkimAttributes.Status]"
```

**Erwartet:** `["SUCCESS", "SUCCESS"]`

### 4. Test-E-Mail senden
Nach erfolgreicher Verifikation können Sie eine E-Mail an `mail@manuel-weiss.ch` senden.

## 📋 Vollständige Checkliste

### DNS-Konfiguration:
- [x] MX Record für `manuel-weiss.ch` (Route53)
- [x] MX Record für `mail.manuel-weiss.ch` (Route53)
- [x] SES Verification TXT Record (Route53)
- [x] DKIM CNAME Records (Route53)
- [x] SPF TXT Records (Route53)
- [ ] **Nameserver beim Domain-Registrar gesetzt** ⚠️ **NOCH AUSSTEHEND!**

### AWS SES:
- [ ] Domain Verification: SUCCESS (wartet auf Nameserver)
- [ ] DKIM: SUCCESS (wartet auf Nameserver)
- [x] MAIL FROM: PENDING (wird automatisch verifiziert)

### Receipt Rules:
- [x] Rule Set aktiviert
- [x] Rule für `manuel-weiss.ch`
- [x] Rule für `mail@manuel-weiss.ch`

### Lambda:
- [x] Function aktualisiert
- [x] Environment Variables gesetzt
- [x] Weiterleitung konfiguriert

## 🔍 Diagnose-Tools

### Vollständiger Status-Check:
```bash
./check-ses-complete-status.sh
```

### Einzelne Checks:
```bash
# Nameserver
dig NS manuel-weiss.ch +short

# MX Record
dig MX manuel-weiss.ch +short

# Verification
dig TXT _amazonses.manuel-weiss.ch +short

# DKIM
dig CNAME smln6ugnqm64joyksgg2thjvnli3vzyb._domainkey.manuel-weiss.ch +short
```

## ⚠️ WICHTIG

**Ohne korrekte Nameserver funktioniert NICHTS:**

- ❌ E-Mails werden nicht empfangen
- ❌ SES kann Domain nicht verifizieren
- ❌ DNS-Records sind nicht erreichbar
- ❌ Lambda wird nie aufgerufen

**Mit korrekten Nameservern funktioniert ALLES:**

- ✅ E-Mails werden empfangen
- ✅ SES verifiziert automatisch
- ✅ DNS-Records sind erreichbar
- ✅ Lambda verarbeitet und leitet weiter

## 📞 Zusammenfassung

**Aktueller Status:**
- ✅ Alle DNS-Records in Route53 gesetzt
- ✅ Lambda Function konfiguriert
- ✅ Receipt Rules aktiviert
- ❌ **Nameserver fehlen beim Domain-Registrar** ← **MUSS BEHOBEN WERDEN!**

**Nächster Schritt:**
1. Nameserver beim Domain-Registrar setzen
2. 24-48 Stunden warten
3. Status prüfen
4. Test-E-Mail senden

**Ohne Nameserver-Änderung funktioniert das E-Mail-System nicht!**








