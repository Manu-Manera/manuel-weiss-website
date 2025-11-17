# 🚨 AWS SES Domain-Verifizierung fehlgeschlagen - Erklärung

## ❌ PROBLEM (aus AWS Health Event)

**Fehlermeldung:**
> "We have been attempting to verify the domain manuel-weiss.ch in region Europe (Frankfurt) for the last 3 days. We have not been able to detect the required TXT record in your DNS settings."

**Event:** `AWS_SES_VERIFICATION_PENDING_TO_FAILED`  
**Region:** `eu-central-1`  
**Datum:** 4. November 2025

---

## 🔍 WARUM SCHLÄGT DIE VERIFIZIERUNG FEHL?

### ✅ TXT-Record existiert in Route53

**Der TXT-Record ist korrekt in Route53 konfiguriert:**
- Name: `_amazonses.manuel-weiss.ch`
- Value: `Lhc5q38H/NLjAaD3wH6SFeHOwPuW8M874vcsyp1cr1c=`
- Status in Route53: ✅ Vorhanden

### ❌ AWS kann den TXT-Record NICHT finden

**Warum?**
- ❌ Domain zeigt **NICHT** auf Route53 Nameserver
- ❌ DNS-Abfragen finden keine Nameserver
- ❌ Route53 DNS-Records sind **nicht öffentlich erreichbar**
- ❌ AWS SES kann den TXT-Record nicht abrufen

**Das ist genau das Nameserver-Problem, das wir identifiziert haben!**

---

## ✅ LÖSUNG

### Schritt 1: Nameserver beim Registrar setzen

**Diese 4 Nameserver müssen gesetzt werden:**
- `ns-656.awsdns-18.net`
- `ns-1665.awsdns-16.co.uk`
- `ns-1193.awsdns-21.org`
- `ns-371.awsdns-46.com`

### Schritt 2: Nach 24-48h

**Nach Nameserver-Propagierung:**
1. AWS SES kann den TXT-Record finden
2. Domain-Verifizierung wird automatisch erfolgreich
3. Production Access kann beantragt werden

---

## 📋 CHECKLISTE

- [ ] Registrar finden (https://whois.net/)
- [ ] Registrar kontaktieren
- [ ] Nameserver setzen lassen
- [ ] 24-48h warten
- [ ] Nameserver prüfen: `./check-nameserver-status.sh`
- [ ] Domain-Verifizierung prüfen: AWS SES Console
- [ ] Production Access beantragen

---

## 🎯 ZUSAMMENFASSUNG

**Problem:** Nameserver zeigen nicht auf Route53  
**Auswirkung:** AWS SES kann TXT-Record nicht finden → Verifizierung fehlgeschlagen  
**Lösung:** Nameserver beim Registrar setzen → Alles funktioniert automatisch

**Der TXT-Record ist korrekt - nur die Nameserver fehlen!**

---

**Erstellt:** $(date '+%Y-%m-%d %H:%M:%S')

