# 🔧 Netlify Domain Fix - manuel-weiss.ch

## Problem

Die Domain `manuel-weiss.ch` ist nicht erreichbar, obwohl DNS-Records korrekt sind.

## Ursache

Netlify hat die Domain noch nicht erkannt oder das SSL-Zertifikat ist noch nicht ausgestellt.

---

## ✅ Lösung: Domain in Netlify hinzufügen

### Schritt 1: Gehe zu Netlify Dashboard

1. Öffne: https://app.netlify.com
2. Melde dich an
3. Wähle deine Site: **mawps**

### Schritt 2: Domain hinzufügen

1. Gehe zu: **Site settings** → **Domain management** → **Custom domains**
2. Klicke auf: **Add custom domain**
3. Gib ein: `manuel-weiss.ch`
4. Klicke auf: **Verify**

### Schritt 3: DNS-Verifizierung

Netlify wird die DNS-Records prüfen. Da wir bereits die korrekten Records haben:

- ✅ A Record: `manuel-weiss.ch` → `75.2.60.5` (bereits gesetzt)
- ✅ CNAME: `www.manuel-weiss.ch` → `mawps.netlify.app` (bereits gesetzt)

Netlify sollte die Records automatisch erkennen.

### Schritt 4: SSL-Zertifikat ausstellen

1. Nach erfolgreicher DNS-Verifizierung:
   - Netlify beginnt automatisch mit der SSL-Zertifikats-Ausstellung
   - Dies kann **1-24 Stunden** dauern

2. Status prüfen:
   - In Netlify Dashboard: **Domain management** → `manuel-weiss.ch`
   - Status sollte von "Pending" zu "Active" wechseln

### Schritt 5: Warten auf SSL-Zertifikat

- ⏳ **Normalerweise:** 1-2 Minuten
- ⏳ **Manchmal:** Bis zu 24 Stunden
- ⏳ **Bei Problemen:** Kontaktiere Netlify Support

---

## 🔍 Status prüfen

Führe aus:
```bash
./check-netlify-domain-status.sh
```

Oder manuell:
```bash
# Prüfe DNS
dig A manuel-weiss.ch +short

# Prüfe HTTP (sollte 200 oder 301/302 sein)
curl -I http://manuel-weiss.ch

# Prüfe HTTPS (sollte 200 sein, nach SSL-Ausstellung)
curl -I https://manuel-weiss.ch
```

---

## ⚠️ Häufige Probleme

### Problem 1: "Domain not verified"

**Lösung:**
- Klicke auf **"Verify DNS configuration"** in Netlify
- Warte 5-10 Minuten
- Prüfe erneut

### Problem 2: "SSL certificate pending"

**Lösung:**
- Warte 1-24 Stunden
- Prüfe Netlify Dashboard regelmäßig
- Falls nach 24h noch nicht aktiv: Kontaktiere Netlify Support

### Problem 3: "404 Not Found"

**Lösung:**
- Stelle sicher, dass die Domain in Netlify hinzugefügt ist
- Prüfe ob die Site korrekt deployed ist
- Prüfe ob die Domain als "Primary domain" gesetzt ist

---

## 📋 Checkliste

- [ ] Domain in Netlify hinzugefügt
- [ ] DNS-Records verifiziert
- [ ] SSL-Zertifikat ausgestellt (Status: Active)
- [ ] Domain ist als "Primary domain" gesetzt
- [ ] Website ist über `https://manuel-weiss.ch` erreichbar

---

## 🚀 Nach erfolgreicher Einrichtung

Die Website sollte dann erreichbar sein über:
- ✅ `https://manuel-weiss.ch` (mit SSL)
- ✅ `https://www.manuel-weiss.ch` (leitet auf manuel-weiss.ch um)
- ✅ `https://mawps.netlify.app` (Backup-URL, bleibt aktiv)

---

**Wichtig:** Nach dem Hinzufügen der Domain in Netlify kann es 1-24 Stunden dauern, bis alles funktioniert. Die DNS-Records sind bereits korrekt, es fehlt nur die Netlify-Konfiguration.

