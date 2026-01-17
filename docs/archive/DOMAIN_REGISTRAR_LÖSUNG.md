# 🔧 Domain-Registrar finden und Nameserver setzen

## ❌ PROBLEM

Die Domain `manuel-weiss.ch` ist **NICHT** über AWS Route53 Domains registriert.

**Das bedeutet:**
- ❌ Ich kann die Nameserver **NICHT** direkt über AWS setzen
- ⚠️  Die Nameserver müssen beim **Domain-Registrar** gesetzt werden
- ⚠️  Sie haben keinen Zugang zum Domain-Registrar

---

## 🔍 LÖSUNG: Registrar finden und kontaktieren

### Schritt 1: Registrar-Informationen finden

**Führen Sie aus:**
```bash
whois manuel-weiss.ch | grep -i registrar
```

**Oder verwenden Sie:**
```bash
./find-domain-registrar.sh
```

### Schritt 2: Registrar kontaktieren

**Was Sie brauchen:**
1. **Registrant E-Mail-Adresse** (aus WHOIS)
2. **Domain-Name:** `manuel-weiss.ch`
3. **Ihre Identität** (Name, Adresse)

**Kontaktieren Sie den Registrar Support:**
- Fragen Sie nach **Zugang zum Domain-Management**
- Erklären Sie, dass Sie die **Nameserver ändern** möchten
- Geben Sie die **Registrant E-Mail-Adresse** an

**Typische Support-Kanäle:**
- E-Mail Support
- Live Chat
- Telefon Support
- Support-Ticket-System

---

## ✅ ALTERNATIVE: Domain zu AWS transferieren

**Wenn Sie die Domain zu AWS Route53 Domains transferieren:**

1. **Domain wird zu AWS transferiert**
2. **Ich kann dann die Nameserver direkt setzen**
3. **Vollständige Kontrolle über die Domain**

**Kosten:** Domain-Transfer-Gebühr (meist 1 Jahr Verlängerung)

**So geht's:**
```bash
# 1. Domain-Transfer bei AWS beantragen
aws route53domains transfer-domain \
    --domain-name manuel-weiss.ch \
    --duration-in-years 1 \
    --admin-contact ... \
    --registrant-contact ... \
    --tech-contact ... \
    --region us-east-1

# 2. Nach Transfer: Nameserver automatisch setzen
./set-nameservers-via-aws.sh
```

**Hinweis:** Domain-Transfer kann 5-7 Tage dauern!

---

## 🎯 EMPFOHLENE VORGEWHENSWEISE

### Option 1: Registrar kontaktieren (SCHNELLER)

1. **Finden Sie den Registrar** (siehe oben)
2. **Kontaktieren Sie den Support**
3. **Bitten Sie um Zugang** oder **Nameserver-Änderung**
4. **Geben Sie die Route53 Nameserver an:**
   ```
   ns-656.awsdns-18.net
   ns-1665.awsdns-16.co.uk
   ns-1193.awsdns-21.org
   ns-371.awsdns-46.com
   ```
5. **Warten Sie 24-48 Stunden** auf DNS-Propagierung

**Zeitaufwand:** 1-2 Stunden (Support-Kontakt) + 24-48h Wartezeit

### Option 2: Domain zu AWS transferieren (LANGFRISTIG)

1. **Domain-Transfer bei AWS beantragen**
2. **Warten Sie 5-7 Tage** auf Transfer
3. **Ich setze dann automatisch die Nameserver**

**Zeitaufwand:** 5-7 Tage

---

## 📋 CHECKLISTE

- [ ] Registrar finden (`whois manuel-weiss.ch`)
- [ ] Registrant E-Mail-Adresse notieren
- [ ] Registrar Support kontaktieren
- [ ] Zugang zum Domain-Management anfordern
- [ ] Nameserver setzen (oder Support bitten)
- [ ] 24-48 Stunden warten
- [ ] Nameserver prüfen (`./check-nameserver-status.sh`)

---

## 🔗 HILFREICHE LINKS

- **WHOIS-Abfrage:** https://whois.net/
- **DNS-Checker:** https://dnschecker.org/
- **AWS Route53 Domains:** https://console.aws.amazon.com/route53domains/

---

**Erstellt:** $(date '+%Y-%m-%d %H:%M:%S')

