# 🔑 API Key Authentication - Postman Anleitung

## 🎯 Übersicht

Diese Anleitung zeigt dir, wie du die **API Key Authentication** (Private/Public Key Pair) in Postman testest.

**Workflow:**
1. RSA Key Pair generieren
2. Public Key registrieren
3. Challenge anfordern
4. Challenge mit Private Key signieren
5. Token generieren (4000 Sekunden gültig)
6. Token für API-Requests verwenden

---

## 📋 Schritt 1: Postman Collection importieren

### 1.1 Collection importieren

1. **Postman öffnen**
2. **Klicke auf Import** (oben links)
3. **Wähle die Datei:** `postman/API-Key-Authentication.postman_collection.json`
4. **Klicke auf Import**

### 1.2 Environment aktivieren

1. **Klicke auf Environments** (oben rechts)
2. **Wähle:** "Manuel Weiss API - Production" (oder erstelle ein neues Environment)
3. **Stelle sicher, dass es aktiviert ist**

---

## 🔑 Schritt 2: RSA Key Pair generieren

### Option A: Mit Node.js Script (Empfohlen)

1. **Öffne Terminal** im Projekt-Verzeichnis
2. **Führe aus:**
   ```bash
   node scripts/generate-keypair.js
   ```
3. **Output:**
   - `public-key.pem` - Public Key (wird registriert)
   - `private-key.pem` - Private Key (bleibt geheim!)

### Option B: Manuell mit OpenSSL

```bash
# RSA Key Pair generieren (2048 Bit)
openssl genrsa -out private-key.pem 2048
openssl rsa -in private-key.pem -pubout -out public-key.pem
```

---

## 📝 Schritt 3: Environment Variables setzen

### 3.1 Environment öffnen

1. **Klicke auf Environments** (oben rechts)
2. **Wähle:** "Manuel Weiss API - Production"

### 3.2 Variablen setzen

#### ✅ `baseUrl` (bereits gesetzt)
- **Wert:** `https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod`
- **Status:** Bereits konfiguriert ✅

#### 🔑 `apiKeyId` (MUSS gesetzt werden)
- **Wert:** Eindeutige ID (z.B. `postman-test-123` oder UUID)
- **Beispiel:** `postman-test-$(date +%s)`
- **Wichtig:** Muss eindeutig sein!

#### 📄 `publicKey` (MUSS gesetzt werden)
- **Wert:** Inhalt von `public-key.pem` (komplett, mit `-----BEGIN PUBLIC KEY-----` und `-----END PUBLIC KEY-----`)
- **Tipp:** Kopiere den kompletten Inhalt der Datei `public-key.pem`

#### 🔐 `privateKey` (MUSS gesetzt werden)
- **Wert:** Inhalt von `private-key.pem` (komplett)
- **Typ:** Secret (wird nicht angezeigt)
- **Wichtig:** Bleibt geheim! Nur für Signatur verwendet.

#### ⏳ `challenge` (wird automatisch gesetzt)
- **Wert:** (leer, wird von Request 2 gesetzt)

#### ✍️ `signature` (MUSS gesetzt werden)
- **Wert:** (wird in Schritt 5 generiert)

#### 🎫 `apiKeyToken` (wird automatisch gesetzt)
- **Wert:** (leer, wird von Request 3 gesetzt)

**Nach dem Setzen:** Klicke auf **Save**

---

## 🚀 Schritt 4: Public Key registrieren

### 4.1 Request ausführen

1. **Öffne Collection:** "API Key Authentication (Private/Public Key)"
2. **Wähle Request:** "1. Register Public Key"
3. **Prüfe Body:**
   ```json
   {
     "apiKeyId": "{{apiKeyId}}",
     "publicKey": "{{publicKey}}",
     "metadata": {
       "name": "Postman API Key",
       "description": "API Key for Postman testing"
     }
   }
   ```
4. **Klicke auf Send**

### 4.2 Erfolg prüfen

**Erwartete Response (200 OK):**
```json
{
  "success": true,
  "message": "Public key registered successfully",
  "apiKeyId": "postman-test-123",
  "createdAt": "2026-01-02T18:36:38.997Z"
}
```

**✅ Wenn erfolgreich:**
- `apiKeyId` wird automatisch in Environment Variable gespeichert
- Public Key ist jetzt registriert

---

## 🎲 Schritt 5: Challenge anfordern

### 5.1 Request ausführen

1. **Wähle Request:** "2. Get Challenge"
2. **Klicke auf Send**

### 5.2 Challenge speichern

**Erwartete Response (200 OK):**
```json
{
  "challenge": "base64-encoded-challenge-string",
  "expiresIn": 60
}
```

**✅ Automatisch:**
- `challenge` wird automatisch in Environment Variable gespeichert
- Challenge ist 60 Sekunden gültig

---

## ✍️ Schritt 6: Challenge signieren

### 6.1 Mit Node.js Script (Empfohlen)

1. **Öffne Terminal**
2. **Führe aus:**
   ```bash
   node scripts/sign-challenge.js <challenge> <private-key.pem>
   ```
3. **Beispiel:**
   ```bash
   node scripts/sign-challenge.js "base64-challenge-string" private-key.pem
   ```
4. **Output:** Base64-encoded Signature
5. **Kopiere die Signature**

### 6.2 Signature in Postman setzen

1. **Environment öffnen**
2. **Finde Variable:** `signature`
3. **Füge die kopierte Signature ein**
4. **Klicke auf Save**

---

## 🎫 Schritt 7: Token generieren

### 7.1 Request ausführen

1. **Wähle Request:** "3. Get Token (mit Signatur)"
2. **Prüfe Body:**
   ```json
   {
     "apiKeyId": "{{apiKeyId}}",
     "challenge": "{{challenge}}",
     "signature": "{{signature}}"
   }
   ```
3. **Klicke auf Send**

### 7.2 Token prüfen

**Erwartete Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 4000,
  "tokenType": "Bearer"
}
```

**✅ Automatisch:**
- `apiKeyToken` wird automatisch in Environment Variable gespeichert
- Token ist 4000 Sekunden (ca. 66 Minuten) gültig

---

## ✅ Schritt 8: Token verwenden

### 8.1 API-Request mit Token

1. **Öffne Collection:** "Manuel Weiss - User Profile API"
2. **Wähle Request:** "GET Profile - Profil laden"
3. **Prüfe Header:**
   ```
   Authorization: Bearer {{apiKeyToken}}
   ```
4. **Klicke auf Send**

**✅ Wenn erfolgreich:**
- Response sollte 200 OK sein
- Profildaten werden zurückgegeben

### 8.2 Status prüfen

1. **Öffne Collection:** "API Key Authentication"
2. **Wähle Request:** "4. Check API Key Status"
3. **Klicke auf Send**

**Erwartete Response (200 OK):**
```json
{
  "registered": true,
  "apiKeyId": "postman-test-123",
  "active": true
}
```

---

## 🔄 Workflow-Zusammenfassung

```
1. Key Pair generieren
   ↓
2. Public Key registrieren (Request 1)
   ↓
3. Challenge anfordern (Request 2)
   ↓
4. Challenge signieren (mit Node.js Script)
   ↓
5. Token generieren (Request 3)
   ↓
6. Token für API-Requests verwenden
```

---

## ⚠️ Wichtige Hinweise

### Public Key Format

**✅ Korrekt:**
- Muss komplett sein (mit `-----BEGIN PUBLIC KEY-----` und `-----END PUBLIC KEY-----`)
- Newlines müssen als `\n` im JSON enthalten sein
- Postman escaped automatisch korrekt

**❌ Falsch:**
- Nur der Key-Inhalt ohne Header/Footer
- Newlines als `\\n` (doppelt escaped)

### Token Gültigkeit

- **Gültigkeit:** 4000 Sekunden (ca. 66 Minuten)
- **Erneuern:** Führe Workflow erneut aus (Schritte 5-7)

### Challenge Gültigkeit

- **Gültigkeit:** 60 Sekunden
- **Wichtig:** Challenge muss schnell signiert werden

### Private Key Sicherheit

- **⚠️ NIEMALS** den Private Key teilen oder committen!
- **⚠️ NIEMALS** den Private Key in Git hochladen!
- **✅** Private Key nur lokal speichern
- **✅** `.gitignore` enthält bereits `*-key.pem`

---

## 🆘 Troubleshooting

### Problem: "Invalid JSON in request body"

**Lösung:**
- Public Key muss komplett sein (mit Header/Footer)
- Prüfe ob `publicKey` Environment Variable korrekt gesetzt ist
- Newlines sollten automatisch escaped werden

### Problem: "API Key not found"

**Lösung:**
- Public Key wurde nicht registriert
- Führe Request 1 (Register Public Key) erneut aus
- Prüfe ob `apiKeyId` korrekt gesetzt ist

### Problem: "Invalid signature"

**Lösung:**
- Challenge wurde falsch signiert
- Prüfe ob `challenge` und `signature` korrekt gesetzt sind
- Challenge muss mit dem passenden Private Key signiert werden
- Challenge darf nicht abgelaufen sein (60 Sekunden)

### Problem: "Challenge expired"

**Lösung:**
- Challenge ist abgelaufen (60 Sekunden)
- Führe Request 2 (Get Challenge) erneut aus
- Signiere die neue Challenge schnell

### Problem: Token funktioniert nicht

**Lösung:**
- Token ist möglicherweise abgelaufen (4000 Sekunden)
- Generiere neuen Token (Schritte 5-7)
- Prüfe ob `apiKeyToken` in Environment Variable gesetzt ist

---

## 📚 Weitere Dokumentation

- **API Key Setup:** `postman/API_KEY_SETUP_ANLEITUNG.md`
- **User Profile API:** `postman/SETUP_ANLEITUNG.md`
- **API Endpoints:** `API_ENDPOINTS_POSTMAN.md`

---

## 🎯 Quick Start (Zusammenfassung)

1. **Collection importieren:** `API-Key-Authentication.postman_collection.json`
2. **Key Pair generieren:** `node scripts/generate-keypair.js`
3. **Environment Variables setzen:**
   - `apiKeyId` = Eindeutige ID
   - `publicKey` = Inhalt von `public-key.pem`
   - `privateKey` = Inhalt von `private-key.pem`
4. **Public Key registrieren:** Request 1
5. **Challenge anfordern:** Request 2
6. **Challenge signieren:** `node scripts/sign-challenge.js <challenge> private-key.pem`
7. **Signature setzen:** In Environment Variable `signature`
8. **Token generieren:** Request 3
9. **Token verwenden:** Für API-Requests

**Fertig! 🎉**

