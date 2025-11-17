# 🔧 EINFACHE LÖSUNG: Nameserver setzen

## 🔗 DIREKTE LINKS

**Route53 Domains (Registrierte Domänen):**
https://console.aws.amazon.com/route53domains/home?region=us-east-1#/registered-domains

**Route53 DNS (Ihre Hosted Zone):**
https://console.aws.amazon.com/route53/v2/hostedzones#ListRecordSets/Z02760862I1VK88B8J0ED

---

## ✅ SCHNELL-CHECK

### 1. Öffnen Sie diesen Link:
https://console.aws.amazon.com/route53domains/home?region=us-east-1#/registered-domains

### 2. Suchen Sie nach: `manuel-weiss.ch`

**Wenn die Domain dort ist:**
- ✅ Domain ist über AWS registriert
- ✅ Ich kann Nameserver direkt setzen (sag mir Bescheid!)

**Wenn die Domain NICHT dort ist:**
- ❌ Domain ist über externen Registrar
- ⚠️  Siehe unten: Externer Registrar

---

## ❌ WENN DOMAIN NICHT BEI AWS IST

**Dann müssen Sie den externen Registrar kontaktieren.**

**Registrar finden:**
```bash
whois manuel-weiss.ch | grep -i registrar
```

**Oder einfach:**
- Gehen Sie zu: https://whois.net/
- Geben Sie ein: `manuel-weiss.ch`
- Suchen Sie nach "Registrar"

**Dann:**
1. Registrar Support kontaktieren
2. Sagen: "Ich möchte Nameserver für manuel-weiss.ch ändern"
3. Diese 4 Nameserver angeben:
   - ns-656.awsdns-18.net
   - ns-1665.awsdns-16.co.uk
   - ns-1193.awsdns-21.org
   - ns-371.awsdns-46.com

---

## 🎯 DAS IST ALLES

**Prüfen Sie den Link oben → Sagen Sie mir, ob die Domain dort ist → Dann kann ich helfen!**

