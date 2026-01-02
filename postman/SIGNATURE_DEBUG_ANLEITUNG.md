# 🔍 Signature Debugging - Schritt für Schritt

## ❌ Problem: "Invalid signature"

Wenn du diesen Fehler bekommst, folge diesen Schritten:

---

## 📋 Schritt 1: Challenge und Signature lokal testen

### 1.1 Challenge aus Request 2 Response kopieren

1. **Führe Request 2 aus** ("Get Challenge")
2. **Kopiere die Challenge** aus der Response:
   ```json
   {
     "challenge": "pcA+jymkLFt7CIG3SGMEWmMfYXI4H...",
     "expiresIn": 60
   }
   ```

### 1.2 Challenge signieren

```bash
node scripts/sign-challenge.js "<challenge>" "keys/<apiKeyId>-private-key.pem"
```

**Kopiere die Signature** aus der Ausgabe.

### 1.3 Signature lokal validieren

```bash
node scripts/test-signature.js "<challenge>" "<signature>" "keys/<apiKeyId>-public-key.pem"
```

**Erwartetes Ergebnis:**
- ✅ `Signature valid: ✅ JA` → Signature ist korrekt
- ❌ `Signature valid: ❌ NEIN` → Problem identifiziert

---

## 📋 Schritt 2: Prüfe ob alles zusammenpasst

### 2.1 Prüfe apiKeyId

**Wichtig:** `apiKeyId` muss in allen Requests gleich sein!

1. **Request 1:** Welche `apiKeyId` wurde verwendet?
2. **Request 2:** Welche `apiKeyId` wurde verwendet?
3. **Request 3:** Welche `apiKeyId` wurde verwendet?

**Alle müssen gleich sein!**

### 2.2 Prüfe Public Key und Private Key

**Wichtig:** Public Key und Private Key müssen zusammenpassen!

**Test:**
```bash
# Prüfe ob Keys zusammenpassen
node scripts/test-signature.js "<challenge>" "<signature>" "keys/<apiKeyId>-public-key.pem"
```

Falls das lokal funktioniert, aber im API nicht:
- Prüfe ob der richtige Public Key registriert wurde
- Prüfe ob der richtige Private Key verwendet wurde

---

## 📋 Schritt 3: Challenge Gültigkeit prüfen

**Challenge ist nur 60 Sekunden gültig!**

### Workflow (schnell):

```
1. Request 2: Challenge anfordern
   ↓ (SOFORT)
2. Challenge signieren (Terminal)
   ↓ (SOFORT)
3. Signature in Postman setzen
   ↓ (SOFORT)
4. Request 3: Token generieren
```

**Alles innerhalb von 60 Sekunden!**

---

## 📋 Schritt 4: CloudWatch Logs prüfen

Nach Request 3:

1. **AWS Console → CloudWatch → Log Groups**
2. **Finde:** `/aws/lambda/mawps-api-key-auth`
3. **Prüfe neueste Logs:**
   - Welche Challenge wurde erwartet?
   - Welche Challenge wurde empfangen?
   - Signature-Validierung Details

---

## 🔍 Häufige Probleme und Lösungen

### Problem 1: Challenge abgelaufen

**Symptom:** "Challenge expired" oder "Invalid signature"

**Lösung:**
- Führe alles schneller durch (innerhalb von 60 Sekunden)
- Oder: Hole neue Challenge (Request 2 erneut)

### Problem 2: Falsche Challenge signiert

**Symptom:** "Invalid signature" obwohl lokal validiert

**Lösung:**
- Kopiere Challenge direkt aus Request 2 Response
- Nicht aus Environment Variable (könnte alt sein)
- Signiere diese EXAKTE Challenge

### Problem 3: Public Key und Private Key passen nicht

**Symptom:** Lokale Validierung schlägt fehl

**Lösung:**
- Prüfe ob `apiKeyId` in allen Requests gleich ist
- Prüfe ob Public Key zu Private Key passt
- Generiere neue Keys falls nötig

### Problem 4: Signature Format falsch

**Symptom:** "Invalid signature"

**Lösung:**
- Signature sollte nur Base64-String sein
- Keine Newlines (`\n`)
- Keine Leerzeichen
- Nur Base64-Zeichen: A-Z, a-z, 0-9, +, /, =

---

## ✅ Quick Debug Workflow

```bash
# 1. Request 2: Challenge holen
# 2. Challenge aus Response kopieren
# 3. Signiere:
node scripts/sign-challenge.js "<challenge>" "keys/<apiKeyId>-private-key.pem"

# 4. Teste lokal:
node scripts/test-signature.js "<challenge>" "<signature>" "keys/<apiKeyId>-public-key.pem"

# 5. Falls lokal validiert:
#    - Setze Signature in Postman
#    - Führe Request 3 SOFORT aus (innerhalb von 60 Sekunden)

# 6. Falls lokal nicht validiert:
#    - Prüfe ob Public Key und Private Key zusammenpassen
#    - Generiere neue Keys falls nötig
```

---

## 🎯 Zusammenfassung

1. **Teste lokal:** `test-signature.js` Script
2. **Prüfe Timing:** Alles innerhalb von 60 Sekunden
3. **Prüfe Keys:** Public Key und Private Key müssen zusammenpassen
4. **Prüfe Challenge:** Muss exakt die aus Request 2 sein

**Das sollte helfen, das Problem zu identifizieren!** 🔍

