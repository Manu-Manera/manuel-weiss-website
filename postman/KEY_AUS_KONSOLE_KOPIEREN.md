# 📋 Key aus Konsole in Postman einfügen - Einfache Anleitung

## 🎯 Problem

Du hast den Key aus der Konsole kopiert, aber keine Datei erstellt.

## ✅ Lösung: Direkt aus Konsole kopieren

### Schritt 1: Key aus Konsole kopieren

1. **Kopiere den KOMPLETTEN Key** aus der Konsole
2. **Wichtig:** Kopiere ALLES, inklusive:
   - `-----BEGIN PUBLIC KEY-----` (erste Zeile)
   - Alle Zeilen dazwischen
   - `-----END PUBLIC KEY-----` (letzte Zeile)

**Beispiel:**
```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
...
QIDAQAB
-----END PUBLIC KEY-----
```

### Schritt 2: In Postman einfügen

1. **Öffne Postman**
2. **Klicke auf Environments** (oben rechts)
3. **Wähle:** "Manuel Weiss API - Production" (oder dein Environment)
4. **Finde Variable:** `publicKey`
5. **Füge den Key ein:**
   - Klicke in das Feld
   - **Cmd/Ctrl + V** (Einfügen)
   - **Wichtig:** Postman sollte die Newlines automatisch escaped haben
6. **Klicke auf Save**

### Schritt 3: Prüfen

Nach dem Einfügen sollte die Variable so aussehen:

**Option A (Postman escaped automatisch):**
```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
...
QIDAQAB
-----END PUBLIC KEY-----
```

**Option B (Postman zeigt escaped):**
```
-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n...\nQIDAQAB\n-----END PUBLIC KEY-----
```

**Beide sollten funktionieren!** ✅

---

## 🔄 Falls es nicht funktioniert

### Option 1: Key manuell formatieren

1. **Öffne einen Text-Editor** (z.B. VS Code, TextEdit)
2. **Füge den Key ein**
3. **Ersetze alle Newlines:**
   - Suche: `\n` (Newline)
   - Ersetze: `\\n` (escaped Newline)
4. **Kopiere die formatierte Version**
5. **Füge in Postman ein**

### Option 2: Key in Datei speichern und formatieren

1. **Speichere den Key in einer Datei:**
   ```bash
   # Öffne Editor
   nano public-key.pem
   # Oder: code public-key.pem
   ```
2. **Füge den Key ein und speichere**
3. **Formatiere für Postman:**
   ```bash
   node scripts/format-key-for-postman.js public-key.pem
   ```
4. **Kopiere den formatierten Key**
5. **Füge in Postman ein**

---

## 📝 Beispiel: Kompletter Workflow

### 1. Key aus Konsole kopieren

```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwXgZ3VNc7zs2HTNvlNsi
KU42Aiu0kfCi/svBZwd/ZWpOB9LfI7/a9m8e0zjmUaiH+TJFQCsybnZs///rWerQ
Jaz8jU2wAj9n+WT/podiqyXfHnrt3U8xUqAggx1srFiQxwAZy5nU9z31Qy8wItwn
k5sxi0bhXT9/qiWOxpKhz/C8rtXwdd+4npflDma8Wmqe6ih9dduyDzfbvmZVYnji
hHD7MPb1J71bplUS9D2ePPZf8YeRl4pT9PaTMy4uwg8gDg5aifOhciiVgUYBsDPy
ABT7BwwGQRFmsJrdwPZzaRaUcTltfmT08xdEfFbCUg719zWNyvYR+QJC4oY3YQPm
YwIDAQAB
-----END PUBLIC KEY-----
```

### 2. In Postman einfügen

- Environment Variable `publicKey` → Einfügen → Save

### 3. Testen

- Request "1. Register Public Key" ausführen
- Sollte funktionieren! ✅

---

## ⚠️ Wichtige Hinweise

1. **Kopiere ALLES:** Inkl. `-----BEGIN PUBLIC KEY-----` und `-----END PUBLIC KEY-----`
2. **Alle Zeilen:** Nicht nur den Base64-String, sondern alle Zeilen
3. **Postman escaped automatisch:** Normalerweise musst du nichts manuell machen
4. **Lambda verarbeitet beide Formate:** Escaped und unescaped Newlines

---

## 🆘 Troubleshooting

### Problem: "Invalid JSON in request body"

**Lösung:**
- Postman hat Newlines nicht escaped
- Verwende Option 1 oder 2 (siehe oben)
- Oder: Die Lambda-Funktion sollte es jetzt auch verarbeiten können

### Problem: "Invalid public key format"

**Lösung:**
- Prüfe ob `-----BEGIN PUBLIC KEY-----` und `-----END PUBLIC KEY-----` vorhanden sind
- Prüfe ob alle Zeilen kopiert wurden
- Versuche es erneut mit komplettem Key

---

## ✅ Quick Start

1. **Key aus Konsole kopieren** (komplett, inkl. BEGIN/END)
2. **In Postman:** Environment Variable `publicKey` → Einfügen
3. **Save**
4. **Request ausführen**

**Das sollte funktionieren!** 🎉

