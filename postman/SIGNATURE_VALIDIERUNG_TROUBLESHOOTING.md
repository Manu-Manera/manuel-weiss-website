# 🔧 Signature Validierung Troubleshooting

## ❌ Problem: "Invalid signature"

### Mögliche Ursachen

1. **Challenge wurde falsch signiert**
2. **Challenge ist abgelaufen** (60 Sekunden Gültigkeit)
3. **Falscher Private Key verwendet**
4. **Signature wurde nicht korrekt übertragen**
5. **Public Key stimmt nicht mit Private Key überein**

---

## ✅ Lösung Schritt für Schritt

### Schritt 1: Prüfe ob Challenge noch gültig ist

**Challenge ist 60 Sekunden gültig!**

1. **Führe Request 2 erneut aus** ("Get Challenge")
2. **Signiere SOFORT** (innerhalb von 60 Sekunden)
3. **Generiere Token SOFORT** (innerhalb von 60 Sekunden)

### Schritt 2: Prüfe ob richtige Challenge signiert wurde

**Wichtig:** Die Challenge, die signiert wird, muss genau die sein, die vom Server generiert wurde!

1. **Kopiere Challenge aus Request 2 Response**
2. **Signiere diese EXAKTE Challenge:**
   ```bash
   node scripts/sign-challenge.js "<challenge-aus-response>" "keys/<apiKeyId>-private-key.pem"
   ```
3. **Kopiere Signature**
4. **Setze in Postman Environment Variable: signature**
5. **Führe Request 3 aus**

### Schritt 3: Prüfe ob richtiger Private Key verwendet wurde

**Wichtig:** Der Private Key muss zu dem Public Key passen, der registriert wurde!

1. **Prüfe apiKeyId:**
   - Muss in Request 1, 2 und 3 gleich sein
   - Prüfe Environment Variable `apiKeyId`

2. **Prüfe Private Key:**
   - Muss zu `keys/<apiKeyId>-private-key.pem` passen
   - Muss zu dem Public Key passen, der in Request 1 registriert wurde

### Schritt 4: Prüfe Signature Format

**Signature muss Base64-encoded sein!**

1. **Signature sollte so aussehen:**
   ```
   aBc123XyZ789... (langer Base64-String)
   ```
2. **Keine Newlines oder Whitespace**
3. **Nur Base64-Zeichen:** A-Z, a-z, 0-9, +, /, =

---

## 🔍 Debugging

### Option 1: CloudWatch Logs prüfen

Nach dem Request-Ausführen:
1. **AWS Console → CloudWatch → Log Groups**
2. **Finde:** `/aws/lambda/mawps-api-key-auth`
3. **Prüfe neueste Logs:**
   - Sollte zeigen, welche Challenge erwartet wurde
   - Sollte zeigen, welche Challenge empfangen wurde
   - Sollte zeigen, ob Signature validiert wurde

### Option 2: Manuell testen

**Teste Signature-Generierung:**
```bash
# 1. Hole Challenge aus Request 2 Response
# 2. Signiere:
node scripts/sign-challenge.js "<challenge>" "keys/<apiKeyId>-private-key.pem"

# 3. Prüfe ob Signature generiert wurde
# 4. Setze in Postman
# 5. Führe Request 3 aus
```

### Option 3: Challenge und Signature prüfen

**In Postman Console (unten):**
- Prüfe ob `challenge` gesetzt ist
- Prüfe ob `signature` gesetzt ist
- Prüfe ob beide nicht leer sind

---

## 📋 Checkliste

- [ ] Challenge wurde innerhalb von 60 Sekunden verwendet
- [ ] Challenge aus Request 2 Response wurde signiert (nicht eine alte)
- [ ] Richtiger Private Key verwendet (`keys/<apiKeyId>-private-key.pem`)
- [ ] Private Key passt zu Public Key (aus Request 1)
- [ ] `apiKeyId` ist in allen Requests gleich
- [ ] Signature ist Base64-encoded (keine Newlines)
- [ ] Signature wurde korrekt in Postman Environment Variable gesetzt

---

## 🆘 Häufige Fehler

### Fehler 1: Challenge abgelaufen

**Problem:** Challenge ist 60 Sekunden gültig

**Lösung:**
1. Führe Request 2 erneut aus
2. Hole neue Challenge
3. Signiere SOFORT
4. Generiere Token SOFORT

### Fehler 2: Falsche Challenge signiert

**Problem:** Alte Challenge oder falsche Challenge signiert

**Lösung:**
1. Kopiere Challenge aus Request 2 Response (nicht aus Environment Variable)
2. Signiere diese EXAKTE Challenge
3. Setze Signature in Postman

### Fehler 3: Falscher Private Key

**Problem:** Private Key passt nicht zu Public Key

**Lösung:**
1. Prüfe ob `apiKeyId` in allen Requests gleich ist
2. Prüfe ob Private Key zu diesem `apiKeyId` gehört
3. Generiere neue Keys falls nötig

### Fehler 4: Signature Format falsch

**Problem:** Signature enthält Newlines oder Whitespace

**Lösung:**
1. Signature sollte nur Base64-String sein
2. Keine Newlines (`\n`)
3. Keine Leerzeichen

---

## ✅ Quick Fix

```bash
# 1. Request 2 ausführen (neue Challenge holen)
# 2. Challenge aus Response kopieren
# 3. Signiere SOFORT:
node scripts/sign-challenge.js "<challenge>" "keys/<apiKeyId>-private-key.pem"

# 4. Signature in Postman setzen
# 5. Request 3 SOFORT ausführen (innerhalb von 60 Sekunden)
```

**Wichtig:** Alles muss schnell passieren (Challenge ist nur 60 Sekunden gültig)!

---

## 🔍 Erweiterte Debugging

Die Lambda-Funktion loggt jetzt detailliert:
- Welche Challenge erwartet wurde
- Welche Challenge empfangen wurde
- Signature-Validierung Details
- Public Key Details

**Prüfe CloudWatch Logs für Details!**

