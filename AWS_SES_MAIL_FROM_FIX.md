# AWS SES Custom MAIL FROM Domain - Fehlerbehebung

## ❌ Problem

AWS SES kann den MX-Record für `mail.manuel-weiss.ch` als Custom MAIL FROM Domain nicht finden.

**Fehlermeldung:**
> "After 3 days of detection attempts, Amazon SES has been unable to detect the presence of the MX record required to use mail.manuel-weiss.ch as a custom MAIL FROM domain"

## 🔍 Ursache

Für eine Custom MAIL FROM Domain benötigt AWS SES:
1. Einen **MX-Record** im DNS für die Subdomain (z.B. `mail.manuel-weiss.ch`)
2. Einen **SPF-Record** (optional aber empfohlen)

Diese Records wurden entweder nicht korrekt gesetzt oder AWS kann sie nicht abrufen.

## ✅ Lösung 1: MX-Record manuell hinzufügen (Empfohlen)

### Schritt 1: DNS-Provider öffnen

Gehen Sie zu Ihrem DNS-Provider (z.B. Route 53, Namecheap, GoDaddy) und öffnen Sie die DNS-Verwaltung für `manuel-weiss.ch`.

### Schritt 2: MX-Record hinzufügen

Fügen Sie einen neuen MX-Record hinzu:

**Record-Typ:** `MX`  
**Name/Host:** `mail` (für `mail.manuel-weiss.ch`)  
**Priority/Wert:** `10`  
**Target/Value:** `feedback-smtp.eu-central-1.amazonses.com`  
**TTL:** `3600` (oder Standard)

**Beispiel (Route 53):**
```
Type: MX
Name: mail
Value: 10 feedback-smtp.eu-central-1.amazonses.com
TTL: 3600
```

### Schritt 3: SPF-Record hinzufügen (Optional aber empfohlen)

Fügen Sie auch einen TXT-Record für SPF hinzu:

**Record-Typ:** `TXT`  
**Name/Host:** `mail` (für `mail.manuel-weiss.ch`)  
**Value:** `v=spf1 include:amazonses.com ~all`  
**TTL:** `3600`

### Schritt 4: Warten und prüfen

1. Warten Sie 5-15 Minuten für DNS-Propagierung
2. Prüfen Sie ob der MX-Record erreichbar ist (siehe unten)
3. Gehen Sie zu AWS SES Console → Identities → `manuel-weiss.ch` → MAIL FROM Domain
4. Klicken Sie auf "Verify" oder "Retry"

### Schritt 5: DNS-Prüfung

Führen Sie diese Befehle aus um zu prüfen ob die Records korrekt sind:

```bash
# MX-Record prüfen
dig MX mail.manuel-weiss.ch +short

# Sollte zeigen:
# 10 feedback-smtp.eu-central-1.amazonses.com

# TXT/SPF-Record prüfen
dig TXT mail.manuel-weiss.ch +short

# Sollte zeigen:
# "v=spf1 include:amazonses.com ~all"
```

**Online-Tools:**
- https://mxtoolbox.com/SuperTool.aspx?action=mx%3amail.manuel-weiss.ch
- https://www.whatsmydns.net/#MX/mail.manuel-weiss.ch

## ✅ Lösung 2: Custom MAIL FROM Domain entfernen (Einfachste Lösung)

Wenn Sie die Custom MAIL FROM Domain nicht unbedingt benötigen:

### Schritt 1: AWS SES Console öffnen

1. Gehen Sie zu: https://console.aws.amazon.com/ses/
2. Wählen Sie Region: **Europe (Frankfurt)**
3. Navigieren Sie zu: **Identities** → `manuel-weiss.ch`

### Schritt 2: MAIL FROM Domain entfernen

1. Klicken Sie auf den Tab **"MAIL FROM domain"**
2. Klicken Sie auf **"Edit"**
3. **Entfernen** Sie `mail.manuel-weiss.ch` oder lassen Sie das Feld leer
4. Klicken Sie auf **"Save"**

**Hinweis:** Ohne Custom MAIL FROM Domain verwendet SES automatisch den Standard (`amazonses.com`), was in den meisten Fällen ausreicht.

### Schritt 3: Prüfen

- Die Fehlermeldung sollte nach einiger Zeit verschwinden
- E-Mails werden weiterhin funktionieren (mit amazonses.com als MAIL FROM)

## ✅ Lösung 3: MAIL FROM Domain neu konfigurieren

Falls die Domain bereits konfiguriert ist, aber nicht funktioniert:

### Schritt 1: Alte Konfiguration entfernen

1. AWS SES Console → Identities → `manuel-weiss.ch`
2. MAIL FROM Domain Tab → **Remove** oder **Delete**

### Schritt 2: DNS-Records korrekt setzen

Siehe Lösung 1, Schritt 2-3

### Schritt 3: Neu hinzufügen

1. MAIL FROM Domain Tab → **Configure**
2. Geben Sie ein: `mail.manuel-weiss.ch`
3. Wählen Sie Verhalten: `UseAmazonSES` (falls MX-Record fehlt)
4. Klicken Sie auf **"Save"**

### Schritt 4: Nach DNS-Update verifizieren

Nachdem die DNS-Records gesetzt sind:

1. Warten Sie 5-15 Minuten
2. Klicken Sie auf **"Verify"** oder warten Sie auf automatische Verifikation
3. Status sollte auf "Verified" wechseln

## 🔧 DNS-Record Prüfung Script

Ich habe ein Script erstellt, das die DNS-Records automatisch prüft:

```bash
# Script ausführen
./check-mail-from-dns.sh mail.manuel-weiss.ch
```

Siehe: `check-mail-from-dns.sh`

## 📋 Checkliste

- [ ] DNS-Provider Zugriff haben
- [ ] MX-Record für `mail.manuel-weiss.ch` gesetzt
- [ ] SPF-Record (TXT) für `mail.manuel-weiss.ch` gesetzt
- [ ] DNS-Propagierung abgewartet (5-15 Minuten)
- [ ] DNS-Records mit dig/nslookup geprüft
- [ ] AWS SES Console → MAIL FROM Domain → Verify/Retry
- [ ] Status ist "Verified"

## 🚨 Was passiert wenn nichts gemacht wird?

Wenn die Custom MAIL FROM Domain nicht verifiziert wird:

1. **E-Mails funktionieren weiterhin** ✅
2. SES verwendet automatisch `amazonses.com` als MAIL FROM
3. **Spam-Scores können etwas höher sein** (aber meist minimal)
4. Die Fehlermeldung wird weiterhin gesendet (aber harmlos)

**Empfehlung:** Wenn E-Mails funktionieren und Sie keine Probleme mit Spam-Filtern haben, können Sie die Custom MAIL FROM Domain einfach entfernen (Lösung 2).

## 💡 Warum Custom MAIL FROM Domain?

**Vorteile:**
- Bessere Branding (E-Mails kommen von `mail.manuel-weiss.ch` statt `amazonses.com`)
- Potentiell besserer Spam-Score
- Mehr Kontrolle über E-Mail-Deliverability

**Nachteile:**
- Zusätzliche DNS-Konfiguration nötig
- Kann Fehler verursachen wenn nicht korrekt konfiguriert
- Nicht zwingend notwendig

## 🔗 Wichtige Links

- **AWS SES Dokumentation:** https://docs.aws.amazon.com/ses/latest/dg/mail-from.html
- **MX Record Tool:** https://mxtoolbox.com/
- **DNS Propagation Checker:** https://www.whatsmydns.net/

## 📞 Support

Falls Probleme bestehen bleiben:

1. DNS-Records mit `check-mail-from-dns.sh` prüfen
2. AWS Support Ticket erstellen
3. Alternative: Custom MAIL FROM Domain entfernen (funktioniert fast genauso gut)

