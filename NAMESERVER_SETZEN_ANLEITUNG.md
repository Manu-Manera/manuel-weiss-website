# 🔧 Nameserver bei Domain-Registrar setzen - Schritt für Schritt

## ❌ AKTUELLER STATUS

**Problem:** Die Domain `manuel-weiss.ch` zeigt auf **KEINE Nameserver**!

**Auswirkung:**
- ❌ DNS-Records in Route53 sind nicht öffentlich erreichbar
- ❌ AWS SES kann Domain nicht verifizieren
- ❌ Production Access wurde abgelehnt

---

## ✅ LÖSUNG: Nameserver setzen

### Route53 Nameserver (MÜSSEN gesetzt werden):

```
ns-656.awsdns-18.net
ns-1665.awsdns-16.co.uk
ns-1193.awsdns-21.org
ns-371.awsdns-46.com
```

---

## 📋 SCHRITT-FÜR-SCHRITT ANLEITUNG

### Schritt 1: Domain-Registrar finden

**Prüfen Sie, wo Ihre Domain registriert ist:**

```bash
whois manuel-weiss.ch | grep -i registrar
```

**Häufige Domain-Registrare:**
- Namecheap
- GoDaddy
- Hostpoint (Schweiz)
- Hostinger
- IONOS

---

### Schritt 2: Bei Domain-Registrar einloggen

1. Gehen Sie zur Website Ihres Domain-Registrars
2. Loggen Sie sich ein
3. Öffnen Sie die Domain-Verwaltung

---

### Schritt 3: Nameserver ändern

#### **Namecheap:**
1. Gehen Sie zu: **Domain List**
2. Klicken Sie auf **"Manage"** bei `manuel-weiss.ch`
3. Gehen Sie zu **"Advanced DNS"** Tab
4. Scrollen Sie zu **"Nameservers"** Sektion
5. Wählen Sie **"Custom DNS"**
6. Geben Sie die 4 Route53 Nameserver ein:
   ```
   ns-656.awsdns-18.net
   ns-1665.awsdns-16.co.uk
   ns-1193.awsdns-21.org
   ns-371.awsdns-46.com
   ```
7. Klicken Sie auf **"Save"**

#### **GoDaddy:**
1. Gehen Sie zu: **My Products**
2. Klicken Sie auf **"DNS"** bei `manuel-weiss.ch`
3. Scrollen Sie zu **"Nameservers"**
4. Klicken Sie auf **"Change"**
5. Wählen Sie **"Custom"**
6. Geben Sie die 4 Route53 Nameserver ein
7. Klicken Sie auf **"Save"**

#### **Hostpoint (Schweiz):**
1. Gehen Sie zu: **Domain-Verwaltung**
2. Wählen Sie `manuel-weiss.ch`
3. Gehen Sie zu **"Nameserver"**
4. Wählen Sie **"Eigene Nameserver verwenden"**
5. Geben Sie die 4 Route53 Nameserver ein
6. Klicken Sie auf **"Speichern"**

#### **Allgemein:**
- Suchen Sie nach **"Nameserver"**, **"DNS Settings"**, oder **"DNS-Verwaltung"**
- Ändern Sie von **"Standard"** zu **"Custom"** oder **"Eigene Nameserver"**
- Geben Sie alle 4 Nameserver ein (jeweils eine Zeile)
- **Speichern** Sie die Änderungen

---

### Schritt 4: Warten auf DNS-Propagierung

**Wartezeit:** 24-48 Stunden

**Warum so lange?**
- DNS-Änderungen müssen weltweit propagiert werden
- Verschiedene DNS-Server aktualisieren sich unterschiedlich schnell

---

### Schritt 5: Prüfen ob Nameserver gesetzt sind

**Nach 24 Stunden prüfen:**

```bash
# Nameserver prüfen
dig NS manuel-weiss.ch +short

# Sollte zeigen:
# ns-656.awsdns-18.net
# ns-1665.awsdns-16.co.uk
# ns-1193.awsdns-21.org
# ns-371.awsdns-46.com
```

**Oder mit dem Prüf-Skript:**

```bash
./check-nameserver-status.sh
```

**Erwartetes Ergebnis:**
```
✅ ALLE Route53 Nameserver sind gesetzt!
```

---

### Schritt 6: Domain-Verifizierung prüfen

**Nach erfolgreicher Nameserver-Propagierung:**

```bash
aws ses get-identity-verification-attributes \
    --identities manuel-weiss.ch \
    --region eu-central-1
```

**Erwartetes Ergebnis:**
```json
{
    "VerificationAttributes": {
        "manuel-weiss.ch": {
            "VerificationStatus": "Success"  ← Sollte "Success" sein!
        }
    }
}
```

---

### Schritt 7: Production Access beantragen

**Nach erfolgreicher Domain-Verifizierung:**

1. Gehen Sie zu: https://eu-central-1.console.aws.amazon.com/ses/home?region=eu-central-1#/account
2. Klicken Sie auf **"Request production access"**
3. Füllen Sie das Formular aus (siehe `SES_PRODUCTION_ACCESS_PROBLEME.md`)
4. Warten Sie auf AWS-Genehmigung (24-48 Stunden)

---

## 🔍 PRÜFUNG

**Prüfen Sie den aktuellen Status:**

```bash
# 1. Nameserver prüfen
./check-nameserver-status.sh

# 2. Domain-Verifizierung prüfen
aws ses get-identity-verification-attributes \
    --identities manuel-weiss.ch \
    --region eu-central-1

# 3. Vollständige SES-Prüfung
./fix-ses-production-access.sh
```

---

## ⚠️ WICHTIGE HINWEISE

1. **Alle 4 Nameserver müssen gesetzt werden!**
   - Nicht nur 1 oder 2, sondern alle 4!

2. **DNS-Propagierung dauert 24-48 Stunden**
   - Haben Sie Geduld
   - Prüfen Sie nach 24 Stunden erneut

3. **Keine anderen DNS-Einstellungen ändern**
   - Ändern Sie NUR die Nameserver
   - Alle DNS-Records sind bereits in Route53 korrekt konfiguriert

4. **Nach Nameserver-Änderung:**
   - DNS-Records werden automatisch von Route53 bereitgestellt
   - Keine manuellen DNS-Record-Änderungen mehr beim Registrar nötig

---

## 📞 HILFE

**Falls Sie Probleme haben:**

1. **Kontaktieren Sie Ihren Domain-Registrar**
   - Support kann Ihnen helfen, Nameserver zu setzen

2. **Prüfen Sie die Dokumentation Ihres Registrars**
   - Jeder Registrar hat eine Anleitung für Nameserver-Änderungen

3. **Verwenden Sie das Prüf-Skript:**
   ```bash
   ./check-nameserver-status.sh
   ```

---

**Erstellt:** $(date '+%Y-%m-%d %H:%M:%S')

