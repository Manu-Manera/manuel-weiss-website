# ⏳ DNS-Propagierung - Erklärung

## ❓ WAS IST DNS-PROPAGATION?

**DNS-Propagierung** ist der automatische Prozess, bei dem DNS-Änderungen (wie Nameserver-Änderungen) weltweit an alle DNS-Server weitergegeben werden.

**Wichtig:** Sie können DNS-Propagierung **NICHT** beschleunigen oder manuell auslösen!

---

## ⏱️ WIE LANGE DAUERT ES?

**Normalerweise:**
- **Minimum:** 5-15 Minuten (selten)
- **Typisch:** 1-6 Stunden
- **Maximum:** 24-48 Stunden (in seltenen Fällen)

**Faktoren:**
- TTL (Time To Live) der DNS-Records
- Verschiedene DNS-Server weltweit
- DNS-Caching

---

## 🔍 WIE PRÜFE ICH DEN STATUS?

### Automatisch:
```bash
./monitor-dns-propagation.sh
```

**Was das Skript macht:**
- Prüft verschiedene DNS-Server weltweit
- Zeigt, ob Route53 Nameserver gefunden wurden
- Gibt Status-Update

### Manuell:
```bash
# Prüfe Nameserver
dig NS manuel-weiss.ch +short

# Sollte zeigen:
# ns-656.awsdns-18.net
# ns-1665.awsdns-16.co.uk
# ns-1193.awsdns-21.org
# ns-371.awsdns-46.com
```

---

## ✅ WANN IST PROPAGATION ABGESCHLOSSEN?

**Wenn alle 4 Route53 Nameserver gefunden werden:**
- ✅ DNS-Propagierung ist abgeschlossen
- ✅ AWS SES kann Domain verifizieren
- ✅ Alles funktioniert automatisch

**Prüfen Sie:**
```bash
./verify-domain-after-nameserver-set.sh
```

---

## 🎯 WAS PASSIERT NACH PROPAGATION?

1. **AWS SES findet TXT-Record**
   - Automatisch alle 5-30 Minuten
   - Domain-Verifizierung wird erfolgreich

2. **Domain-Verifizierung erfolgreich**
   - Status ändert sich von "Failed" zu "Success"
   - Sie erhalten keine Fehler-Mails mehr

3. **Production Access kann beantragt werden**
   - Gehen Sie zu: AWS SES Console
   - Klicken Sie auf "Request production access"

---

## 📋 CHECKLISTE

- [x] Nameserver beim Registrar gesetzt ✅
- [ ] DNS-Propagierung abgeschlossen (1-24h)
- [ ] Nameserver weltweit erreichbar
- [ ] TXT-Record erreichbar
- [ ] Domain-Verifizierung erfolgreich
- [ ] Production Access beantragt

---

## 💡 TIPPS

**Beschleunigen können Sie es nicht, aber:**

1. **Prüfen Sie regelmäßig:**
   ```bash
   ./monitor-dns-propagation.sh
   ```

2. **Warten Sie geduldig:**
   - Meistens 1-6 Stunden
   - Selten länger als 24 Stunden

3. **Prüfen Sie verschiedene DNS-Server:**
   - Google DNS (8.8.8.8)
   - Cloudflare DNS (1.1.1.1)
   - Ihr lokaler DNS-Server

---

**Erstellt:** $(date '+%Y-%m-%d %H:%M:%S')

