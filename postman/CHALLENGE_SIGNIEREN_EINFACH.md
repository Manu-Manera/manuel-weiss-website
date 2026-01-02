# ✍️ Challenge signieren - Einfache Methoden

## 🎯 Problem gelöst!

Du musst die Challenge **NICHT mehr manuell in die Konsole eingeben**! 

---

## ✅ Methode 1: Aus Datei (Empfohlen - Einfachste)

### Schritt 1: Challenge in Datei speichern

**Nach Request 2 ("Get Challenge"):**

1. **Kopiere die Challenge** aus der Response
2. **Speichere in Datei:**
   ```bash
   echo "pcA+jymkLFt7CIG3SGMEWmMfYXI4H..." > challenge.txt
   ```
   *(Ersetze mit deiner Challenge)*

### Schritt 2: Signiere aus Datei

```bash
node scripts/sign-challenge.js --file challenge.txt "keys/<apiKeyId>-private-key.pem"
```

**Das war's!** ✅

---

## ✅ Methode 2: Aus Zwischenablage (Noch einfacher!)

### Schritt 1: Challenge kopieren

1. **Request 2 ausführen** ("Get Challenge")
2. **Challenge aus Response kopieren** (Cmd/Ctrl + C)

### Schritt 2: Signiere aus Zwischenablage

```bash
node scripts/sign-challenge.js --clipboard "keys/<apiKeyId>-private-key.pem"
```

**Das war's!** ✅

**Hinweis:** Funktioniert nur wenn Challenge in Zwischenablage ist!

---

## ✅ Methode 3: Automatisch mit Signing-Server

### Schritt 1: Signing-Server starten

```bash
node scripts/sign-challenge-server.js
```

### Schritt 2: In Postman

**Request 3 ("Get Token")** signiert automatisch:
- Pre-request Script ruft Signing-Server auf
- Signature wird automatisch generiert
- Request wird ausgeführt

**Das war's!** ✅

---

## 📋 Vergleich der Methoden

| Methode | Aufwand | Empfehlung |
|---------|---------|------------|
| **Datei** | ⭐ Sehr einfach | ✅ **Empfohlen** |
| **Zwischenablage** | ⭐⭐ Einfach | ✅ Gut |
| **Signing-Server** | ⭐⭐⭐ Automatisch | ✅ Beste UX |

---

## 🎯 Quick Start (Datei-Methode)

```bash
# 1. Request 2: Challenge holen
# 2. Challenge in Datei speichern:
echo "<challenge-aus-response>" > challenge.txt

# 3. Signiere:
node scripts/sign-challenge.js --file challenge.txt "keys/<apiKeyId>-private-key.pem"

# 4. Signature in Postman setzen
# 5. Request 3 ausführen
```

**Viel einfacher!** 🎉

---

## 💡 Tipp: Challenge automatisch in Datei speichern

Du kannst auch ein kleines Script erstellen, das die Challenge automatisch in eine Datei speichert:

```bash
# Nach Request 2, kopiere Challenge und führe aus:
echo "<challenge>" > challenge.txt && node scripts/sign-challenge.js --file challenge.txt "keys/<apiKeyId>-private-key.pem"
```

Oder noch einfacher: **Verwende den Signing-Server** (Methode 3) - dann musst du gar nichts machen! 🚀

