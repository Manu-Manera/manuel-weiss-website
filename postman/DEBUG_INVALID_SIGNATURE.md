# 🔍 Debug Invalid Signature - Schritt für Schritt

## ❌ Problem: "Invalid signature" trotz korrekter Signature

**Symptom:** Signature wird erfolgreich generiert, lokale Verifizierung funktioniert, aber Lambda schlägt fehl.

---

## 🛠️ Debug-Schritte

### Schritt 1: Hole Werte aus Postman

**In Postman:**

1. **Führe Request 2 (Get Challenge) aus**
2. **Führe Request 2.5 (Generate Signature) aus**
3. **Kopiere folgende Werte aus Environment Variables:**
   - `apiKeyId`
   - `challenge`
   - `signature`

### Schritt 2: Teste lokal mit Postman-Werten

**Im Terminal:**

```bash
node scripts/test-with-postman-values.js <apiKeyId> "<challenge>" "<signature>"
```

**Beispiel:**
```bash
node scripts/test-with-postman-values.js 9eadacab-bc87-4dff-8d01-e4862c654b45 "2S4RjK9KluqJTHwUdvNIHYpI7RaWpeqppR..." "DAV0zE5MvSds7FDgpXp64qDYgRE8wNW..."
```

**Was das Script macht:**
1. ✅ Prüft ob Keys existieren
2. ✅ Verifiziert Signature lokal
3. ✅ Sendet Request an Lambda
4. ✅ Zeigt detaillierte Fehlermeldungen

### Schritt 3: Prüfe Ergebnis

**Falls lokale Verifizierung fehlschlägt:**
- ❌ Challenge stimmt nicht überein
- ❌ Signature wurde nicht korrekt generiert
- ❌ Private Key passt nicht zu Public Key

**Falls lokale Verifizierung erfolgreich, aber Lambda fehlschlägt:**
- ⚠️ Challenge ist abgelaufen (60 Sekunden)
- ⚠️ Challenge wurde zwischen Request 2 und 3 geändert
- ⚠️ Public Key wurde nicht korrekt registriert

---

## 🔍 Häufigste Ursachen

### 1. Challenge ist abgelaufen

**Problem:** Challenge ist nur 60 Sekunden gültig. Wenn zwischen Request 2 und Request 3 zu viel Zeit vergeht, schlägt die Verifizierung fehl.

**Lösung:**
1. Führe Request 2 (Get Challenge) erneut aus
2. Führe Request 2.5 (Generate Signature) **SOFORT** aus
3. Führe Request 3 (Get Token) **SOFORT** aus

**Alle 3 Requests sollten innerhalb von 60 Sekunden ausgeführt werden!**

### 2. Challenge stimmt nicht überein

**Problem:** Die Challenge, die signiert wurde, stimmt nicht mit der Challenge überein, die an Lambda gesendet wird.

**Prüfung:**
- In Postman Console: Prüfe ob Challenge zwischen Request 2 und Request 3 gleich bleibt
- Prüfe ob Challenge korrekt in Environment Variable gespeichert wurde

**Lösung:**
- Stelle sicher, dass Challenge korrekt in Environment Variable gespeichert wurde
- Prüfe ob Challenge zwischen Request 2 und Request 3 geändert wurde

### 3. Signature wurde nicht korrekt übertragen

**Problem:** Signature wird in Postman nicht korrekt gespeichert oder übertragen.

**Prüfung:**
- In Postman Console: Prüfe ob Signature gesetzt ist
- Prüfe ob Signature-Länge korrekt ist (sollte ~344 Zeichen sein)

**Lösung:**
- Stelle sicher, dass Environment aktiviert ist
- Prüfe ob Signature in Environment Variable gespeichert wurde (nach Request 2.5)

---

## 📋 Quick Fix

### Schneller Workflow (innerhalb von 60 Sekunden)

1. **Request 2:** Get Challenge → Send
2. **Request 2.5:** Generate Signature → Send (**SOFORT!**)
3. **Request 3:** Get Token → Send (**SOFORT!**)

**Wichtig:** Alle 3 Requests sollten schnell nacheinander ausgeführt werden!

---

## 🔍 Detailliertes Debugging

### Option 1: Test-Script verwenden

```bash
# Hole Werte aus Postman (Environment Variables)
# Dann:
node scripts/test-with-postman-values.js <apiKeyId> "<challenge>" "<signature>"
```

**Das Script zeigt:**
- ✅ Ob lokale Verifizierung funktioniert
- ✅ Ob Lambda-Request funktioniert
- ✅ Detaillierte Fehlermeldungen

### Option 2: CloudWatch Logs prüfen

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

## ✅ Checkliste

- [ ] Challenge ist nicht abgelaufen (< 60 Sekunden alt)
- [ ] Challenge wurde korrekt in Environment Variable gespeichert
- [ ] Signature wurde korrekt in Environment Variable gespeichert
- [ ] Alle 3 Requests wurden schnell nacheinander ausgeführt
- [ ] Environment ist in Postman aktiviert
- [ ] Lokale Verifizierung funktioniert (Test-Script)

---

## 🆘 Wenn nichts hilft

1. **Generiere neues Key-Pair:**
   ```bash
   node scripts/complete-api-key-setup.js
   ```

2. **Update Environment:**
   ```bash
   node scripts/update-postman-environment.js
   ```

3. **Importiere Environment in Postman erneut**

4. **Teste erneut:**
   - Request 2 → Request 2.5 → Request 3 (schnell nacheinander)

---

## 💡 Tipp

**Verwende das Test-Script, um genau zu sehen, was das Problem ist:**

```bash
node scripts/test-with-postman-values.js <apiKeyId> "<challenge>" "<signature>"
```

**Das zeigt dir genau, ob:**
- Lokale Verifizierung funktioniert
- Lambda-Request funktioniert
- Was genau das Problem ist

