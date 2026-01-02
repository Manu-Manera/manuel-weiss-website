# 🔑 API Key Authentication Setup - Private/Public Key Pair

## Übersicht

Dieses System ermöglicht Authentifizierung über ein **Private/Public Key Pair**:
- **Public Key** wird auf dem Server gespeichert
- **Private Key** bleibt beim Client (geheim)
- **Challenge-Response** Mechanismus für sichere Authentifizierung
- **Token-Gültigkeit:** 4000 Sekunden (ca. 66 Minuten)

---

## 📋 Schritt 1: RSA Key Pair generieren

### Option A: Mit OpenSSL (Terminal)

```bash
# Generiere Private Key (2048 Bit RSA)
openssl genrsa -out private-key.pem 2048

# Extrahiere Public Key
openssl rsa -in private-key.pem -pubout -out public-key.pem

# Zeige Keys an
cat private-key.pem
cat public-key.pem
```

### Option B: Mit Node.js

```javascript
const crypto = require('crypto');

// Generiere Key Pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

console.log('Public Key:');
console.log(publicKey);
console.log('\nPrivate Key:');
console.log(privateKey);
```

### Option C: Online Generator

⚠️ **Nicht empfohlen für Produktion!** Nur für Tests:
- https://www.devglan.com/online-tools/rsa-encryption-decryption

---

## 📋 Schritt 2: Keys in Postman setzen

1. **Öffne Postman Environment:**
   - Klicke auf **Environments** (oben rechts)
   - Wähle **"Manuel Weiss API - Production"**

2. **Setze folgende Variablen:**

| Variable | Wert | Beschreibung |
|----------|------|--------------|
| `apiKeyId` | `my-api-key-123` | Eindeutige ID für deinen API Key (z.B. UUID) |
| `publicKey` | `-----BEGIN PUBLIC KEY-----...` | Dein Public Key (komplett, mit BEGIN/END) |
| `privateKey` | `-----BEGIN PRIVATE KEY-----...` | Dein Private Key (komplett, mit BEGIN/END) |

3. **Klicke auf Save**

**Wichtig:**
- `privateKey` ist vom Typ "secret" (wird nicht angezeigt)
- `publicKey` kann als "default" bleiben
- `apiKeyId` sollte eindeutig sein (z.B. UUID generieren)

---

## 📋 Schritt 3: Public Key registrieren

1. **Importiere Collection:** `API-Key-Authentication.postman_collection.json`
2. **Führe Request aus:** "1. Register Public Key"
3. **Erwartete Response:**
   ```json
   {
     "success": true,
     "message": "Public key registered successfully",
     "apiKeyId": "my-api-key-123",
     "createdAt": "2025-01-15T12:00:00.000Z"
   }
   ```

---

## 📋 Schritt 4: Challenge holen und signieren

### 4.1 Challenge holen

1. **Führe Request aus:** "2. Get Challenge"
2. **Response:**
   ```json
   {
     "challenge": "abc123...",
     "expiresIn": 60
   }
   ```
3. **Challenge wird automatisch in Environment Variable gespeichert**

### 4.2 Challenge signieren

**Option A: Mit Node.js Script**

Erstelle eine Datei `sign-challenge.js`:

```javascript
const crypto = require('crypto');
const fs = require('fs');

// Lade Private Key
const privateKey = process.env.PRIVATE_KEY || fs.readFileSync('private-key.pem', 'utf8');

// Challenge (aus Postman Environment Variable)
const challenge = process.argv[2] || 'YOUR_CHALLENGE_HERE';

// Signiere Challenge
const sign = crypto.createSign('RSA-SHA256');
sign.update(challenge);
sign.end();

const signature = sign.sign(privateKey, 'base64');

console.log('Signature:', signature);
console.log('\nKopiere diese Signatur in Postman Environment Variable: signature');
```

**Ausführen:**
```bash
node sign-challenge.js "DEINE_CHALLENGE_AUS_POSTMAN"
```

**Option B: Mit OpenSSL (Terminal)**

```bash
# Speichere Challenge in Datei
echo "DEINE_CHALLENGE_AUS_POSTMAN" > challenge.txt

# Signiere mit Private Key
openssl dgst -sha256 -sign private-key.pem -out signature.bin challenge.txt

# Konvertiere zu Base64
base64 signature.bin
```

**Option C: In Postman Pre-request Script**

Füge folgendes Script zum Request "3. Get Token" hinzu:

```javascript
// Pre-request Script für automatische Signatur
const crypto = require('crypto');

const privateKey = pm.environment.get('privateKey');
const challenge = pm.environment.get('challenge');

if (privateKey && challenge) {
    // Signiere Challenge
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(challenge);
    sign.end();
    
    const signature = sign.sign(privateKey, 'base64');
    
    // Speichere Signatur in Environment Variable
    pm.environment.set('signature', signature);
    
    console.log('✅ Challenge signiert!');
} else {
    console.log('⚠️ Private Key oder Challenge fehlt!');
}
```

**⚠️ Hinweis:** Postman unterstützt `crypto` nur in bestimmten Kontexten. Für Produktion: Verwende Node.js Script.

---

## 📋 Schritt 5: Token generieren

1. **Stelle sicher, dass `signature` in Environment Variable gesetzt ist**
2. **Führe Request aus:** "3. Get Token (mit Signatur)"
3. **Response:**
   ```json
   {
     "success": true,
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "expiresIn": 4000,
     "tokenType": "Bearer"
   }
   ```
4. **Token wird automatisch in `apiKeyToken` Environment Variable gespeichert**

---

## 📋 Schritt 6: Token verwenden

Der generierte Token kann jetzt für alle API-Requests verwendet werden:

**Header:**
```
Authorization: Bearer {{apiKeyToken}}
```

**Beispiel:** Request "5. Test: GET Profile mit API Key Token"

---

## 🔄 Workflow Zusammenfassung

```
1. RSA Key Pair generieren
   ↓
2. Public Key registrieren (POST /auth/api-key/register)
   ↓
3. Challenge holen (POST /auth/api-key/challenge)
   ↓
4. Challenge mit Private Key signieren
   ↓
5. Token generieren (POST /auth/api-key/token)
   ↓
6. Token verwenden für API-Requests (4000 Sekunden gültig)
```

---

## 🔧 Automatisierung in Postman

### Pre-request Script für automatische Signatur

Füge folgendes Script zum Request "3. Get Token" hinzu:

```javascript
// Automatische Signatur-Generierung
// Hinweis: Funktioniert nur wenn Node.js Crypto verfügbar ist
// Alternative: Verwende externes Script (siehe oben)

const privateKey = pm.environment.get('privateKey');
const challenge = pm.environment.get('challenge');

if (privateKey && challenge) {
    try {
        // Versuche Signatur zu generieren
        // Falls nicht möglich: Manuell signieren (siehe Optionen oben)
        pm.environment.set('signature', 'MANUAL_SIGNATURE_REQUIRED');
        console.log('⚠️ Bitte Signatur manuell setzen (siehe Anleitung)');
    } catch (error) {
        console.log('❌ Signatur-Generierung fehlgeschlagen:', error);
    }
}
```

---

## 📝 Environment Variables Checkliste

- [ ] `apiKeyId` gesetzt (eindeutige ID)
- [ ] `publicKey` gesetzt (komplett mit BEGIN/END)
- [ ] `privateKey` gesetzt (komplett mit BEGIN/END, Typ: secret)
- [ ] `challenge` wird automatisch gesetzt (nach Request 2)
- [ ] `signature` gesetzt (manuell oder automatisch)
- [ ] `apiKeyToken` wird automatisch gesetzt (nach Request 3)

---

## 🆘 Troubleshooting

### Problem: "Invalid public key format"

**Lösung:**
- Stelle sicher, dass Public Key komplett ist (inkl. `-----BEGIN PUBLIC KEY-----` und `-----END PUBLIC KEY-----`)
- Prüfe dass keine zusätzlichen Zeichen vorhanden sind
- Verwende PEM Format (nicht DER)

### Problem: "Invalid signature"

**Lösung:**
- Prüfe dass die richtige Challenge signiert wurde
- Stelle sicher, dass Private Key korrekt ist
- Prüfe dass Signatur in Base64 Format ist
- Challenge muss innerhalb von 60 Sekunden verwendet werden

### Problem: "Challenge expired"

**Lösung:**
- Hole neue Challenge (Request 2)
- Signiere sofort nach Erhalt
- Token-Generierung muss innerhalb von 60 Sekunden erfolgen

### Problem: "API Key not found"

**Lösung:**
- Stelle sicher, dass Public Key registriert wurde (Request 1)
- Prüfe dass `apiKeyId` korrekt ist
- Verwende gleichen `apiKeyId` für alle Requests

---

## 🔐 Sicherheitshinweise

1. **Private Key niemals teilen!**
   - Private Key bleibt beim Client
   - Nur Public Key wird an Server gesendet

2. **Token-Gültigkeit:**
   - Token ist 4000 Sekunden (ca. 66 Minuten) gültig
   - Nach Ablauf: Neue Challenge holen und Token generieren

3. **Challenge-Gültigkeit:**
   - Challenge ist 60 Sekunden gültig
   - Einmalige Verwendung (wird nach Token-Generierung gelöscht)

4. **Key Pair Rotation:**
   - Regelmäßig neue Key Pairs generieren
   - Alte Public Keys deaktivieren

---

## 📚 Weitere Dokumentation

- **API Endpoints:** `API_ENDPOINTS_POSTMAN.md`
- **Setup Anleitung:** `SETUP_ANLEITUNG.md`
- **Token Generierung:** `TOKEN_GENERIERUNG.md`

---

## ✅ Quick Start

1. **Key Pair generieren:** `openssl genrsa -out private-key.pem 2048 && openssl rsa -in private-key.pem -pubout -out public-key.pem`
2. **Keys in Postman setzen:** `apiKeyId`, `publicKey`, `privateKey`
3. **Public Key registrieren:** Request "1. Register Public Key"
4. **Challenge holen:** Request "2. Get Challenge"
5. **Challenge signieren:** Mit Private Key (Node.js Script oder OpenSSL)
6. **Token generieren:** Request "3. Get Token"
7. **Token verwenden:** `Authorization: Bearer {{apiKeyToken}}`

**Fertig! 🎉**

