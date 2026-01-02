# 🔧 Token Request Troubleshooting

## ❌ Problem: "Missing required fields: apiKeyId, challenge, signature"

### Mögliche Ursachen

1. **Environment Variables nicht gesetzt**
2. **Challenge nicht gespeichert** (nach Request 2)
3. **Signature nicht gespeichert** (nach Signatur-Generierung)
4. **Variablen-Scope Problem** (Environment vs Collection)

---

## ✅ Lösung Schritt für Schritt

### Schritt 1: Prüfe Environment Variables

1. **Öffne Postman Environment** (oben rechts)
2. **Prüfe folgende Variablen:**
   - ✅ `apiKeyId` = sollte gesetzt sein (z.B. `a3c133e1-9e5c-44ff-bcd0-adfa1f4643ec`)
   - ✅ `challenge` = sollte nach Request 2 gesetzt sein
   - ✅ `signature` = sollte nach Signatur-Generierung gesetzt sein

### Schritt 2: Challenge prüfen

**Nach Request 2 ("Get Challenge"):**
- Response sollte `{"challenge": "...", "expiresIn": 60}` enthalten
- Challenge wird automatisch in Environment Variable gespeichert
- **Prüfe:** Environment Variable `challenge` sollte nicht leer sein

**Falls Challenge fehlt:**
1. Führe Request 2 erneut aus
2. Prüfe ob Challenge in Response enthalten ist
3. Prüfe ob Challenge in Environment Variable gespeichert wurde

### Schritt 3: Signature prüfen

**Nach Signatur-Generierung:**
```bash
node scripts/sign-challenge.js "<challenge>" "keys/<apiKeyId>-private-key.pem"
```

**Signature in Postman setzen:**
1. **Environment öffnen**
2. **Finde Variable:** `signature`
3. **Füge die generierte Signature ein**
4. **Save**

### Schritt 4: Request Body prüfen

**Im Request "3. Get Token":**
1. **Klicke auf "Body" Tab**
2. **Prüfe ob Variablen ersetzt wurden:**
   ```json
   {
     "apiKeyId": "a3c133e1-9e5c-44ff-bcd0-adfa1f4643ec",
     "challenge": "base64-challenge-string",
     "signature": "base64-signature-string"
   }
   ```
3. **Falls Variablen nicht ersetzt wurden:**
   - Prüfe ob Environment aktiviert ist
   - Prüfe ob Variablen korrekt benannt sind (`{{apiKeyId}}`, `{{challenge}}`, `{{signature}}`)

---

## 🔍 Debugging

### Option 1: Request Body prüfen

1. **Öffne Request "3. Get Token"**
2. **Klicke auf "Body" Tab**
3. **Prüfe ob Variablen ersetzt wurden:**
   - ✅ `{{apiKeyId}}` → sollte durch tatsächliche ID ersetzt sein
   - ✅ `{{challenge}}` → sollte durch Challenge-String ersetzt sein
   - ✅ `{{signature}}` → sollte durch Signature-String ersetzt sein

**Falls Variablen NICHT ersetzt wurden:**
- Environment ist nicht aktiviert
- Variablen-Namen stimmen nicht überein
- Variablen sind nicht gesetzt

### Option 2: Console Logs prüfen

Nach dem Request-Ausführen:
1. **Klicke auf "Console" Tab** (unten in Postman)
2. **Prüfe Logs:**
   - Sollte zeigen, welche Variablen verwendet wurden
   - Sollte zeigen, ob Variablen ersetzt wurden

### Option 3: Manuell testen

**Erstelle einen Test-Request mit festen Werten:**
```json
{
  "apiKeyId": "a3c133e1-9e5c-44ff-bcd0-adfa1f4643ec",
  "challenge": "DEINE_CHALLENGE_HIER",
  "signature": "DEINE_SIGNATURE_HIER"
}
```

Falls das funktioniert → Problem ist mit Variablen
Falls das nicht funktioniert → Problem ist mit Challenge/Signature

---

## 📋 Checkliste

- [ ] `apiKeyId` ist in Environment Variable gesetzt
- [ ] Request 2 ("Get Challenge") wurde ausgeführt
- [ ] `challenge` ist in Environment Variable gesetzt (nicht leer)
- [ ] Challenge wurde mit Private Key signiert
- [ ] `signature` ist in Environment Variable gesetzt (nicht leer)
- [ ] Environment ist aktiviert (Dropdown oben rechts)
- [ ] Request Body zeigt ersetzte Variablen (nicht `{{variable}}`)

---

## 🆘 Häufige Fehler

### Fehler 1: Challenge abgelaufen

**Problem:** Challenge ist 60 Sekunden gültig

**Lösung:**
1. Führe Request 2 erneut aus
2. Hole neue Challenge
3. Signiere sofort
4. Generiere Token schnell

### Fehler 2: Falsche Challenge signiert

**Problem:** Challenge wurde nicht korrekt signiert

**Lösung:**
1. Prüfe ob Challenge korrekt kopiert wurde
2. Prüfe ob Private Key korrekt ist
3. Signiere erneut mit korrekter Challenge

### Fehler 3: Variablen nicht ersetzt

**Problem:** Postman ersetzt Variablen nicht

**Lösung:**
1. Prüfe ob Environment aktiviert ist
2. Prüfe ob Variablen-Namen korrekt sind (`{{apiKeyId}}`, nicht `{apiKeyId}`)
3. Prüfe ob Variablen in Environment gesetzt sind

---

## ✅ Quick Fix

1. **Führe Request 2 aus** ("Get Challenge")
2. **Kopiere Challenge** aus Response
3. **Signiere Challenge:**
   ```bash
   node scripts/sign-challenge.js "<challenge>" "keys/<apiKeyId>-private-key.pem"
   ```
4. **Setze in Postman:**
   - `challenge` = Challenge aus Response
   - `signature` = Signature aus Script
5. **Führe Request 3 aus** ("Get Token")

**Das sollte funktionieren!** 🎉

