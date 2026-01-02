# 📋 Public/Private Key in Postman einfügen - Einfache Anleitung

## 🎯 Problem

Wenn du den Key direkt aus der Konsole kopierst, können die Newlines Probleme verursachen.

## ✅ Lösung: Automatische Formatierung

### Schritt 1: Key Pair generieren

```bash
node scripts/generate-keypair.js
```

### Schritt 2: Keys für Postman formatieren

**Public Key formatieren:**
```bash
node scripts/format-key-for-postman.js keys/<apiKeyId>-public-key.pem
```

**Private Key formatieren:**
```bash
node scripts/format-key-for-postman.js keys/<apiKeyId>-private-key.pem
```

Das Script:
- ✅ Konvertiert Newlines zu `\n` (escaped)
- ✅ Kopiert automatisch in Zwischenablage (macOS/Linux/Windows)
- ✅ Zeigt den formatierten Key an

### Schritt 3: In Postman einfügen

1. **Öffne Postman Environment** (oben rechts)
2. **Finde Variable:** `publicKey` oder `privateKey`
3. **Füge den formatierten Key ein** (Cmd/Ctrl + V)
4. **Klicke auf Save**

**Fertig!** 🎉

---

## 🔄 Alternative: Direkt aus Konsole kopieren

Falls du den Key direkt aus der Konsole kopierst:

### Schritt 1: Key aus Konsole kopieren

1. **Kopiere den KOMPLETTEN Key** (inkl. `-----BEGIN PUBLIC KEY-----` und `-----END PUBLIC KEY-----`)
2. **Wichtig:** Kopiere ALLE Zeilen, auch die BEGIN/END Zeilen!

### Schritt 2: In Postman einfügen

1. **Environment öffnen**
2. **Variable finden:** `publicKey` oder `privateKey`
3. **Einfügen:** Cmd/Ctrl + V
4. **Save**

**Postman sollte Newlines automatisch escaped haben!**

Falls nicht:
- Die Lambda-Funktion sollte jetzt auch unescaped Newlines verarbeiten können
- Oder verwende das Formatierungs-Script (siehe oben)

---

## 🧪 Testen

Nach dem Einfügen:

1. **Request ausführen:** "1. Register Public Key"
2. **Sollte funktionieren:** `{"success": true, ...}`

Falls Fehler:
- Prüfe ob Key komplett ist (inkl. BEGIN/END)
- Verwende das Formatierungs-Script
- Prüfe CloudWatch Logs für Details

---

## 📝 Beispiel

**Aus der Konsole:**
```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
...
QIDAQAB
-----END PUBLIC KEY-----
```

**In Postman Environment Variable:**
```
-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n...\nQIDAQAB\n-----END PUBLIC KEY-----
```

**Oder (wenn Postman automatisch escaped):**
```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
...
QIDAQAB
-----END PUBLIC KEY-----
```

Beide sollten funktionieren! ✅

