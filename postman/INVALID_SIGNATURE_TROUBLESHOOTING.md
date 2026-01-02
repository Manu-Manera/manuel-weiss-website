# 🔧 Invalid Signature - Troubleshooting

## ❌ Problem: "Invalid signature"

**Symptom:** Signature wird erfolgreich generiert, aber Verifizierung schlägt fehl.

---

## 🔍 Mögliche Ursachen

### 1. **Challenge ist abgelaufen** (häufigste Ursache)

**Challenge ist nur 60 Sekunden gültig!**

**Lösung:**
1. Führe **Request 2 (Get Challenge)** erneut aus
2. Führe sofort **Request 2.5 (Generate Signature)** aus
3. Führe sofort **Request 3 (Get Token)** aus

**Workflow sollte schnell sein:**
- Request 2 → Request 2.5 → Request 3 (innerhalb von 60 Sekunden)

---

### 2. **Challenge stimmt nicht überein**

**Problem:** Die Challenge, die signiert wurde, stimmt nicht mit der Challenge überein, die an den Server gesendet wird.

**Prüfung:**
1. **In Postman Console** (unten): Prüfe die Challenge-Länge
2. **Vergleiche:** Challenge aus Request 2 mit Challenge in Request 3

**Lösung:**
- Stelle sicher, dass Challenge korrekt in Environment Variable gespeichert wurde
- Prüfe ob Challenge zwischen Request 2 und Request 3 geändert wurde

---

### 3. **Private Key passt nicht zu Public Key**

**Problem:** Der Private Key, der zum Signieren verwendet wird, passt nicht zu dem Public Key, der registriert wurde.

**Prüfung:**
```bash
# Teste lokal ob Signature korrekt ist
node scripts/debug-signature.js <apiKeyId> <challenge>
```

**Lösung:**
- Stelle sicher, dass Private Key und Public Key aus demselben Key-Pair stammen
- Falls neues Key-Pair generiert: Public Key muss neu registriert werden (Request 1)

---

### 4. **Signature wird nicht korrekt übertragen**

**Problem:** Signature wird in Postman nicht korrekt gespeichert oder übertragen.

**Prüfung:**
1. **In Postman Console:** Prüfe ob Signature gesetzt ist
2. **In Request 3 Body:** Prüfe ob `{{signature}}` korrekt ersetzt wurde

**Lösung:**
- Stelle sicher, dass Environment aktiviert ist
- Prüfe ob Signature in Environment Variable gespeichert wurde (nach Request 2.5)

---

## 🛠️ Debug-Schritte

### Schritt 1: Challenge prüfen

**In Postman:**
1. Führe **Request 2 (Get Challenge)** aus
2. **Kopiere die Challenge** aus der Response
3. **Prüfe:** Challenge sollte Base64-String sein (z.B. `L7uwizdXfV2j9GmfbIzWbDSCj5CS2Bqk0/F20ayyce0=`)

### Schritt 2: Signature lokal testen

**Im Terminal:**
```bash
# Hole Challenge aus Postman (Request 2 Response)
# Dann:
node scripts/debug-signature.js <apiKeyId> <challenge>
```

**Erwartetes Ergebnis:**
```
✅ Signature ist korrekt!
```

**Falls Fehler:**
- Private Key passt nicht zu Public Key
- Challenge ist falsch

### Schritt 3: CloudWatch Logs prüfen

**In AWS Console:**
1. **CloudWatch** → **Log Groups** → `/aws/lambda/mawps-api-key-auth`
2. **Neueste Logs** öffnen
3. **Suche nach:**
   - `🔐 verifySignature called`
   - `Signature valid:`
   - `❌ Signature-Validierung fehlgeschlagen`

**Was zu prüfen:**
- Challenge-Länge stimmt überein?
- Signature-Länge stimmt überein?
- Public Key wurde korrekt geladen?

---

## ✅ Quick Fix

### Häufigste Lösung: Challenge erneuern

1. **Request 2:** Get Challenge → Send
2. **Request 2.5:** Generate Signature → Send (sofort!)
3. **Request 3:** Get Token → Send (sofort!)

**Wichtig:** Alle 3 Requests sollten innerhalb von 60 Sekunden ausgeführt werden!

---

## 🔍 Detailliertes Debugging

### Option 1: Debug-Script verwenden

```bash
# 1. Hole Challenge aus Postman (Request 2)
# 2. Hole apiKeyId aus Postman
# 3. Teste lokal:
node scripts/debug-signature.js <apiKeyId> <challenge>
```

**Falls lokal funktioniert, aber in Lambda nicht:**
- Problem liegt in der Übertragung (Challenge/Signature)
- Prüfe CloudWatch Logs

**Falls lokal nicht funktioniert:**
- Private Key passt nicht zu Public Key
- Generiere neues Key-Pair und registriere Public Key neu

### Option 2: CloudWatch Logs analysieren

**Suche nach diesen Logs:**
```
🔐 verifySignature called:
  challenge length: <Länge>
  signature length: <Länge>
  Signature valid: false
```

**Vergleiche:**
- Challenge-Länge sollte übereinstimmen
- Signature-Länge sollte übereinstimmen
- Public Key sollte korrekt geladen sein

---

## 📋 Checkliste

- [ ] Challenge ist nicht abgelaufen (< 60 Sekunden alt)
- [ ] Challenge wurde korrekt in Environment Variable gespeichert
- [ ] Signature wurde korrekt in Environment Variable gespeichert
- [ ] Private Key und Public Key stammen aus demselben Key-Pair
- [ ] Public Key wurde registriert (Request 1)
- [ ] Environment ist in Postman aktiviert
- [ ] Alle 3 Requests wurden schnell nacheinander ausgeführt

---

## 🆘 Wenn nichts hilft

1. **Generiere neues Key-Pair:**
   ```bash
   node scripts/complete-api-key-setup.js
   ```

2. **Registriere Public Key neu:**
   - Request 1: Register Public Key → Send

3. **Teste erneut:**
   - Request 2 → Request 2.5 → Request 3

---

## 💡 Tipp: Automatischer Workflow

**Verwende den vollständig automatischen Workflow:**
```bash
# Terminal: Server starten
./scripts/start-signing-server.sh

# Postman: Schnell nacheinander
# 1. Request 2: Get Challenge
# 2. Request 2.5: Generate Signature
# 3. Request 3: Get Token
```

**Alle 3 Requests sollten innerhalb von 60 Sekunden ausgeführt werden!**

