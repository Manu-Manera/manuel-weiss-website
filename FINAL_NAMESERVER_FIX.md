# ✅ FINALE LÖSUNG: Nameserver setzen

## ❌ PROBLEM

**404-Fehler bei Route53 Domains = Domain ist NICHT über AWS registriert**

**Das bedeutet:**
- Domain ist über **externen Registrar** registriert
- Nameserver müssen beim **externen Registrar** gesetzt werden
- Ich kann es **NICHT** direkt über AWS machen

---

## 🔧 LÖSUNG: Registrar finden und kontaktieren

### Schritt 1: Registrar finden

**Führen Sie aus:**
```bash
whois manuel-weiss.ch | grep -i registrar
```

**Oder online:**
- Gehen Sie zu: https://whois.net/
- Geben Sie ein: `manuel-weiss.ch`
- Suchen Sie nach "Registrar"

### Schritt 2: Registrar Support kontaktieren

**Was Sie sagen:**
> "Ich möchte die Nameserver für meine Domain `manuel-weiss.ch` ändern.  
> Bitte setzen Sie folgende 4 Nameserver:
> - ns-656.awsdns-18.net
> - ns-1665.awsdns-16.co.uk
> - ns-1193.awsdns-21.org
> - ns-371.awsdns-46.com"

**Benötigt:**
- Domain-Name: `manuel-weiss.ch`
- Ihre E-Mail-Adresse (Registrant)
- Ihre Identität (Name)

### Schritt 3: Nach 24-48h prüfen

```bash
./check-nameserver-status.sh
```

---

## 🎯 DAS IST ALLES

**Registrar finden → Support kontaktieren → Nameserver setzen lassen → Fertig!**

**Zeitaufwand:** 1-2 Stunden (Support-Kontakt) + 24-48h Wartezeit

