# 🌐 Domain-Registrierung für manuel-weiss.ch

## ❌ WICHTIG: AWS Route53 Domains unterstützt .ch-Domains NICHT!

**Das bedeutet:**
- ❌ Ich kann die Domain NICHT direkt über AWS registrieren
- ✅ Sie müssen einen externen Registrar verwenden
- ✅ Aber: Ich kann danach die Nameserver automatisch setzen!

---

## 💰 GÜNSTIGSTE OPTIONEN

### 1. Hostpoint (Schweiz) - EMPFOHLEN
- **Preis:** ~12-15 CHF/Jahr
- **Link:** https://www.hostpoint.ch/domains/ch-domain/
- **Vorteile:**
  - Schweizer Registrar
  - Gute Unterstützung
  - Einfache Nameserver-Änderung

### 2. Namecheap
- **Preis:** ~10-12 CHF/Jahr
- **Link:** https://www.namecheap.com/domains/registration/results/?domain=manuel-weiss.ch
- **Vorteile:**
  - Sehr günstig
  - Gute Benutzeroberfläche

### 3. IONOS
- **Preis:** ~10-15 CHF/Jahr
- **Link:** https://www.ionos.de/domains/domain-namen-registrieren
- **Vorteile:**
  - Günstig
  - Deutsche Unterstützung

---

## ✅ SO GEHT'S (mit meiner Hilfe)

### Schritt 1: Domain registrieren

**Wählen Sie einen Registrar (z.B. Hostpoint):**
1. Gehen Sie zur Website
2. Registrieren Sie `manuel-weiss.ch`
3. Verwenden Sie Ihre E-Mail: `weiss-manuel@gmx.de`

### Schritt 2: Nach Registrierung - Sagen Sie mir Bescheid!

**Dann führe ich aus:**
```bash
./set-nameservers-after-registration.sh
```

**Was ich dann mache:**
- ✅ Setze automatisch die Route53 Nameserver
- ✅ Prüfe DNS-Propagierung
- ✅ Aktiviere Domain-Verifizierung in SES
- ✅ Alles funktioniert sofort!

---

## 🎯 EMPFEHLUNG

**Hostpoint (Schweiz):**
- Günstig (~12-15 CHF/Jahr)
- Schweizer Support
- Einfache Nameserver-Änderung
- Ich kann danach alles automatisch machen

**Nach Registrierung:**
- Sagen Sie mir: "Domain ist registriert"
- Ich setze dann automatisch die Nameserver
- Alles funktioniert!

---

**Erstellt:** $(date '+%Y-%m-%d %H:%M:%S')

