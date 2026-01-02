# 🔑 Neues Key-Pair Setup - Wichtig!

## ⚠️ Wichtig nach neuem Key-Pair

**Wenn du ein neues Key-Pair generiert hast, musst du den Public Key neu registrieren!**

---

## 📋 Schritt-für-Schritt nach neuem Key-Pair

### Schritt 1: Public Key in Postman setzen

1. **Public Key formatieren:**
   ```bash
   node scripts/format-key-for-postman.js keys/<neue-apiKeyId>-public-key.pem
   ```
2. **In Postman:**
   - Environment Variable `publicKey` → Formatierten Key einfügen
   - Save

### Schritt 2: apiKeyId in Postman setzen

1. **In Postman:**
   - Environment Variable `apiKeyId` → Neue API Key ID
   - Save

### Schritt 3: Public Key registrieren (WICHTIG!)

1. **Request 1:** "Register Public Key"
2. **Klicke auf Send**
3. **Erwartete Response:**
   ```json
   {
     "success": true,
     "message": "Public key registered successfully",
     "apiKeyId": "..."
   }
   ```

**⚠️ WICHTIG:** Dieser Schritt ist kritisch! Ohne Registrierung funktioniert die Signature-Validierung nicht!

### Schritt 4: Challenge anfordern

1. **Request 2:** "Get Challenge"
2. **Klicke auf Send**
3. **Challenge wird automatisch gespeichert**

### Schritt 5: Token generieren

1. **Request 3:** "Get Token"
2. **Klicke auf Send**
3. **Signature wird automatisch generiert** (wenn Signing-Server läuft)
4. **Token wird generiert**

---

## 🔍 Problem: "Invalid signature" nach neuem Key-Pair

### Ursache

**Der alte Public Key ist noch registriert, aber du verwendest den neuen Private Key!**

### Lösung

1. **Request 1 erneut ausführen** mit dem NEUEN Public Key
2. **Stelle sicher, dass:**
   - `apiKeyId` in Postman = Neue API Key ID
   - `publicKey` in Postman = Neuer Public Key
   - Public Key wurde in Request 1 registriert

### Prüfen

**Request 4:** "Check API Key Status"
- Sollte zeigen: `{"registered": true, "apiKeyId": "<neue-id>"}`

---

## ✅ Checkliste nach neuem Key-Pair

- [ ] Neues Key-Pair generiert: `node scripts/generate-keypair.js`
- [ ] Neue `apiKeyId` in Postman gesetzt
- [ ] Neuer `publicKey` in Postman gesetzt (formatiert)
- [ ] Neuer `privateKey` in Postman gesetzt (formatiert)
- [ ] **Request 1 ausgeführt** (Public Key registriert) ⚠️ WICHTIG!
- [ ] Request 2 ausgeführt (Challenge geholt)
- [ ] Request 3 ausgeführt (Token generiert)

---

## 🎯 Quick Fix

```bash
# 1. Neues Key-Pair generiert ✅
# 2. Keys in Postman setzen ✅
# 3. WICHTIG: Request 1 ausführen (Public Key registrieren!)
# 4. Request 2 ausführen
# 5. Request 3 ausführen
```

**Das sollte das Problem lösen!** 🎉

---

## 💡 Tipp

**Nach jedem neuen Key-Pair:**
1. Public Key in Postman setzen
2. **Request 1 ausführen** (Public Key registrieren)
3. Dann weiter mit Request 2 und 3

**Ohne Request 1 funktioniert die Signature-Validierung nicht!**

