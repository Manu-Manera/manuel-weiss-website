# 🔧 DNS-Propagierung Troubleshooting

## ❌ PROBLEM: `dig NS manuel-weiss.ch +short` zeigt nichts

**Das ist normal, wenn Nameserver gerade erst gesetzt wurden!**

---

## ✅ PRÜFUNGEN

### 1. Lokaler DNS-Cache leeren (macOS)

```bash
# DNS-Cache leeren
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Dann erneut prüfen
dig NS manuel-weiss.ch +short
```

### 2. Verschiedene DNS-Server testen

```bash
# Google DNS
dig NS manuel-weiss.ch @8.8.8.8 +short

# Cloudflare DNS
dig NS manuel-weiss.ch @1.1.1.1 +short

# OpenDNS
dig NS manuel-weiss.ch @208.67.222.222 +short
```

### 3. WHOIS prüfen (zeigt was beim Registrar gesetzt ist)

```bash
whois manuel-weiss.ch | grep -i "name server"
```

**Wenn WHOIS die Route53 Nameserver zeigt:**
- ✅ Nameserver sind beim Registrar gesetzt
- ⏳ DNS-Propagierung läuft noch

**Wenn WHOIS andere Nameserver zeigt:**
- ❌ Nameserver wurden noch nicht gesetzt
- ⚠️  Prüfen Sie beim Registrar

---

## ⏱️ WARTEZEITEN

**Nach Nameserver-Änderung:**
- **Minimum:** 5-15 Minuten (sehr selten)
- **Typisch:** 1-6 Stunden
- **Maximum:** 24-48 Stunden

**Faktoren:**
- TTL (Time To Live) der alten Nameserver
- DNS-Caching weltweit
- Verschiedene DNS-Server aktualisieren sich unterschiedlich schnell

---

## 🔍 MONITORING

**Automatisches Monitoring:**
```bash
./monitor-dns-propagation.sh
```

**Das Skript prüft:**
- 4 verschiedene DNS-Server weltweit
- Zeigt, ob Route53 Nameserver gefunden wurden
- Gibt Status-Update

---

## ✅ WANN FUNKTIONIERT ES?

**Wenn `dig NS manuel-weiss.ch +short` zeigt:**
```
ns-656.awsdns-18.net
ns-1665.awsdns-16.co.uk
ns-1193.awsdns-21.org
ns-371.awsdns-46.com
```

**Dann:**
- ✅ DNS-Propagierung ist abgeschlossen
- ✅ AWS SES kann Domain verifizieren
- ✅ Alles funktioniert automatisch

---

## 🎯 NÄCHSTE SCHRITTE

1. **DNS-Cache leeren** (siehe oben)
2. **Verschiedene DNS-Server testen** (siehe oben)
3. **WHOIS prüfen** (bestätigt, dass Nameserver gesetzt sind)
4. **Warten** (1-6 Stunden normal)
5. **Erneut prüfen** mit `./monitor-dns-propagation.sh`

---

**Erstellt:** $(date '+%Y-%m-%d %H:%M:%S')

