# 🔑 Public Key Format - Wichtiger Hinweis

## ❌ Problem

Wenn du diesen Fehler bekommst:
```json
{
  "error": "Failed to register public key",
  "details": "Invalid public key format: error:1E08010C:DECODER routines::unsupported"
}
```

**Ursache:** Der Public Key ist nicht im korrekten PEM-Format.

---

## ✅ Lösung

### Option 1: Vollständigen Public Key verwenden (Empfohlen)

Der Public Key **MUSS** im PEM-Format sein:

```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyV2k3vJ8qJ8qJ8qJ8qJ8
qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8
...
QIDAQAB
-----END PUBLIC KEY-----
```

**Wichtig:**
- ✅ Muss `-----BEGIN PUBLIC KEY-----` am Anfang haben
- ✅ Muss `-----END PUBLIC KEY-----` am Ende haben
- ✅ Newlines müssen enthalten sein (oder als `\n` escaped)

### Option 2: Nur Base64-String (wird jetzt automatisch konvertiert)

Falls du nur den Base64-String hast (ohne BEGIN/END), wird er jetzt automatisch konvertiert.

**Aber:** Es ist besser, den vollständigen PEM-Key zu verwenden!

---

## 📋 So setzt du den Public Key in Postman

### Schritt 1: Public Key Datei öffnen

1. Öffne die Datei `keys/<apiKeyId>-public-key.pem`
2. **Kopiere den KOMPLETTEN Inhalt** (inkl. BEGIN/END Zeilen)

### Schritt 2: In Postman setzen

1. **Environment öffnen** (oben rechts)
2. **Finde Variable:** `publicKey`
3. **Füge den KOMPLETTEN Public Key ein:**
   ```
   -----BEGIN PUBLIC KEY-----
   MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
   ...
   QIDAQAB
   -----END PUBLIC KEY-----
   ```
4. **Klicke auf Save**

**Wichtig:**
- ✅ Kopiere ALLES (inkl. BEGIN/END Zeilen)
- ✅ Newlines werden automatisch von Postman escaped
- ❌ Nicht nur den Base64-String kopieren

---

## 🔍 Prüfen ob Public Key korrekt ist

### In Postman Environment Variable prüfen:

**✅ Korrekt:**
```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----
```

**❌ Falsch:**
```
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
```
(Fehlt BEGIN/END)

---

## 🛠️ Automatische Konvertierung

Die Lambda-Funktion versucht jetzt automatisch, Base64-Strings zu PEM zu konvertieren.

**Aber:** Es ist immer besser, den vollständigen PEM-Key zu verwenden!

---

## 📝 Beispiel: Korrekter Public Key

```json
{
  "apiKeyId": "test-key-123",
  "publicKey": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyV2k3vJ8qJ8qJ8qJ8qJ8\nqJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8\nqJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8\nQIDAQAB\n-----END PUBLIC KEY-----"
}
```

**In Postman Environment Variable:**
```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyV2k3vJ8qJ8qJ8qJ8qJ8
qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8
qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8
QIDAQAB
-----END PUBLIC KEY-----
```

---

## ✅ Quick Fix

1. **Öffne:** `keys/<apiKeyId>-public-key.pem`
2. **Kopiere:** Kompletten Inhalt (Cmd/Ctrl + A, dann Cmd/Ctrl + C)
3. **In Postman:** Environment Variable `publicKey` → Einfügen
4. **Save**
5. **Request erneut ausführen**

**Das sollte jetzt funktionieren!** 🎉

