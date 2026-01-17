# 📋 Befehle für die Konsole (Terminal)

## 🔧 DNS-Propagierung prüfen

### 1. DNS-Cache leeren (macOS)

**Kopieren und einfügen:**
```bash
sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder
```

**Was passiert:**
- Leert den lokalen DNS-Cache
- Startet DNS-Service neu
- Hilft, frische DNS-Daten zu bekommen

---

### 2. Nameserver prüfen

**Kopieren und einfügen:**
```bash
dig NS manuel-weiss.ch +short
```

**Erwartetes Ergebnis (wenn propagiert):**
```
ns-656.awsdns-18.net
ns-1665.awsdns-16.co.uk
ns-1193.awsdns-21.org
ns-371.awsdns-46.com
```

**Wenn nichts kommt:**
- ⏳ DNS-Propagierung läuft noch
- Warten Sie 1-6 Stunden

---

### 3. Mit verschiedenen DNS-Servern prüfen

**Google DNS:**
```bash
dig NS manuel-weiss.ch @8.8.8.8 +short
```

**Cloudflare DNS:**
```bash
dig NS manuel-weiss.ch @1.1.1.1 +short
```

**OpenDNS:**
```bash
dig NS manuel-weiss.ch @208.67.222.222 +short
```

---

### 4. Automatisches Monitoring

**Kopieren und einfügen:**
```bash
cd "/Users/manumanera/Documents/GitHub/Persönliche Website" && ./monitor-dns-propagation.sh
```

**Was passiert:**
- Prüft 4 verschiedene DNS-Server weltweit
- Zeigt, ob Route53 Nameserver gefunden wurden
- Gibt Status-Update

---

### 5. Domain-Verifizierung prüfen

**Kopieren und einfügen:**
```bash
cd "/Users/manumanera/Documents/GitHub/Persönliche Website" && ./verify-domain-after-nameserver-set.sh
```

**Was passiert:**
- Prüft Nameserver-Propagierung
- Prüft TXT-Record-Erreichbarkeit
- Prüft Domain-Verifizierung in AWS SES

---

## 🎯 SCHNELL-CHECK (Alles in einem)

**Kopieren und einfügen:**
```bash
cd "/Users/manumanera/Documents/GitHub/Persönliche Website" && sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder && echo "✅ DNS-Cache geleert" && echo "" && echo "Prüfe Nameserver..." && dig NS manuel-weiss.ch +short && echo "" && echo "Prüfe mit Google DNS..." && dig NS manuel-weiss.ch @8.8.8.8 +short && echo "" && echo "Prüfe mit Cloudflare DNS..." && dig NS manuel-weiss.ch @1.1.1.1 +short
```

---

## 📝 SO GEHT'S

1. **Terminal öffnen** (⌘ + Leertaste → "Terminal" eingeben)
2. **Befehl kopieren** (oben)
3. **Einfügen** (⌘ + V)
4. **Enter drücken**
5. **Fertig!**

---

**Erstellt:** $(date '+%Y-%m-%d %H:%M:%S')

