# 🔍 Debug Signature - Schritt für Schritt

## 📋 So verwendest du das Debug-Script

### Schritt 1: Hole die Werte aus Postman

**In Postman:**

1. **Führe Request 2 (Get Challenge) aus**
2. **Kopiere die Challenge** aus der Response:
   ```json
   {
     "challenge": "L7uwizdXfV2j9GmfbIzWbDSCj5CS2Bqk0/F20ayyce0=",
     "expiresIn": 60
   }
   ```
3. **Kopiere die apiKeyId** aus Environment Variable oder aus Request 1 Response

### Schritt 2: Führe Debug-Script aus

**Im Terminal:**

```bash
# Ersetze <apiKeyId> und <challenge> durch die echten Werte!
node scripts/debug-signature.js 9eadacab-bc87-4dff-8d01-e4862c654b45 "L7uwizdXfV2j9GmfbIzWbDSCj5CS2Bqk0/F20ayyce0="
```

**Wichtig:**
- `apiKeyId` ohne Anführungszeichen
- `challenge` **mit** Anführungszeichen (falls Leerzeichen oder Sonderzeichen enthalten)

### Schritt 3: Prüfe das Ergebnis

**Erwartetes Ergebnis:**
```
✅ Signature ist korrekt!
```

**Falls Fehler:**
```
❌ Signature ist NICHT korrekt!
```

---

## 💡 Beispiel

**Angenommen:**
- `apiKeyId`: `9eadacab-bc87-4dff-8d01-e4862c654b45`
- `challenge`: `L7uwizdXfV2j9GmfbIzWbDSCj5CS2Bqk0/F20ayyce0=`

**Befehl:**
```bash
node scripts/debug-signature.js 9eadacab-bc87-4dff-8d01-e4862c654b45 "L7uwizdXfV2j9GmfbIzWbDSCj5CS2Bqk0/F20ayyce0="
```

---

## 🔄 Alternative: Challenge aus Clipboard

**Falls Challenge in Zwischenablage ist:**

```bash
# macOS:
challenge=$(pbpaste)
apiKeyId="9eadacab-bc87-4dff-8d01-e4862c654b45"
node scripts/debug-signature.js "$apiKeyId" "$challenge"
```

---

## 📋 Quick Copy-Paste

**1. In Postman:**
- Request 2 ausführen
- Challenge kopieren (aus Response)

**2. Im Terminal:**
```bash
# Ersetze die Werte:
node scripts/debug-signature.js DEINE_API_KEY_ID "DEINE_CHALLENGE"
```

**3. Prüfe Ergebnis:**
- ✅ Wenn korrekt: Problem liegt in der Übertragung (Challenge/Signature)
- ❌ Wenn falsch: Private Key passt nicht zu Public Key

---

## 🆘 Troubleshooting

### Problem: "Private Key nicht gefunden"

**Lösung:**
- Prüfe ob `apiKeyId` korrekt ist
- Prüfe ob Private Key existiert: `ls keys/*-private-key.pem`

### Problem: "Challenge stimmt nicht überein"

**Lösung:**
- Stelle sicher, dass Challenge vollständig kopiert wurde
- Prüfe ob Challenge Base64-String ist
- Führe Request 2 erneut aus (Challenge könnte abgelaufen sein)

---

## ✅ Wenn Debug-Script erfolgreich ist

**Aber Lambda schlägt trotzdem fehl:**

1. **Challenge ist abgelaufen** (60 Sekunden)
   - Führe Request 2 erneut aus
   - Führe Request 2.5 und Request 3 sofort aus

2. **Challenge/Signature wird nicht korrekt übertragen**
   - Prüfe Postman Console
   - Prüfe ob Environment aktiviert ist
   - Prüfe ob Variablen korrekt gesetzt sind

3. **Public Key wurde nicht korrekt registriert**
   - Führe Request 1 erneut aus (Register Public Key)

