# ✍️ Challenge signieren - Schritt-für-Schritt

## 🎯 Nach Request 2 ("Get Challenge")

Nachdem du Request 2 ausgeführt hast, hast du eine Challenge erhalten. Diese muss jetzt mit deinem Private Key signiert werden.

---

## 📋 Schritt 1: Challenge aus Response kopieren

1. **Öffne Request 2** ("Get Challenge")
2. **Response sollte so aussehen:**
   ```json
   {
     "challenge": "pcA+jymkLFt7CIG3SGMEWmMfYXI4H...",
     "expiresIn": 60
   }
   ```
3. **Kopiere die Challenge** (der lange Base64-String)

**Hinweis:** Challenge wird automatisch in Environment Variable gespeichert, aber du brauchst sie für das Script.

---

## 📋 Schritt 2: Challenge signieren

### Im Terminal:

```bash
node scripts/sign-challenge.js "<challenge>" "keys/<apiKeyId>-private-key.pem"
```

**Beispiel:**
```bash
node scripts/sign-challenge.js "pcA+jymkLFt7CIG3SGMEWmMfYXI4H..." "keys/a3c133e1-9e5c-44ff-bcd0-adfa1f4643ec-private-key.pem"
```

**Output:**
```
🔐 Signiere Challenge...
✅ Signatur generiert!

📋 Signatur (für Postman Environment Variable "signature"):
────────────────────────────────────────────────────────────
aBc123XyZ789... (langer Base64-String)
────────────────────────────────────────────────────────────

✅ Signatur in Zwischenablage kopiert (macOS)
```

---

## 📋 Schritt 3: Signature in Postman setzen

1. **Öffne Postman Environment** (oben rechts)
2. **Finde Variable:** `signature`
3. **Füge die Signature ein:**
   - Die Signature wurde automatisch in die Zwischenablage kopiert
   - Oder kopiere sie aus der Terminal-Ausgabe
4. **Klicke auf Save**

---

## 📋 Schritt 4: Token generieren

1. **Öffne Request 3** ("Get Token (mit Signatur)")
2. **Klicke auf Send**
3. **Sollte funktionieren:** `{"success": true, "token": "...", ...}`

---

## ⚠️ Wichtige Hinweise

### Challenge Gültigkeit
- **Gültigkeit:** 60 Sekunden
- **Wichtig:** Challenge muss schnell signiert werden
- **Nach Ablauf:** Hole neue Challenge (Request 2 erneut ausführen)

### Private Key
- **⚠️ NIEMALS** den Private Key teilen!
- **⚠️ NIEMALS** den Private Key committen!
- **✅** Private Key nur lokal verwenden

### Signature Format
- **Format:** Base64-encoded
- **Algorithmus:** RSA-SHA256
- **Wird automatisch generiert** vom Script

---

## 🔄 Vollständiger Workflow

```
1. Request 1: Public Key registrieren ✅
   ↓
2. Request 2: Challenge anfordern ✅
   ↓
3. Challenge signieren (Terminal):
   node scripts/sign-challenge.js "<challenge>" "keys/<apiKeyId>-private-key.pem"
   ↓
4. Signature in Postman setzen (Environment Variable: signature)
   ↓
5. Request 3: Token generieren ✅
   ↓
6. Token verwenden für API-Requests ✅
```

---

## 🆘 Troubleshooting

### Problem: "Signature fehlt"

**Lösung:**
- Prüfe ob `signature` in Environment Variable gesetzt ist
- Prüfe ob Signature nicht leer ist
- Generiere Signature erneut

### Problem: "Invalid signature"

**Lösung:**
- Prüfe ob die richtige Challenge signiert wurde
- Prüfe ob der richtige Private Key verwendet wurde
- Challenge muss innerhalb von 60 Sekunden verwendet werden

### Problem: "Challenge expired"

**Lösung:**
- Challenge ist abgelaufen (60 Sekunden)
- Führe Request 2 erneut aus
- Hole neue Challenge
- Signiere sofort

---

## ✅ Quick Start

```bash
# 1. Challenge aus Postman Response kopieren
# 2. Signiere:
node scripts/sign-challenge.js "<challenge>" "keys/<apiKeyId>-private-key.pem"

# 3. Signature in Postman Environment Variable "signature" einfügen
# 4. Request 3 ausführen
```

**Fertig!** 🎉

