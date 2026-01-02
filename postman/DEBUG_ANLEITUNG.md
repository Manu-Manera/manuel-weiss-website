# 🔍 Debug Invalid Signature - Schritt für Schritt

## ❌ Problem: "Invalid signature" trotz schneller Ausführung

**Wenn es innerhalb von 10 Sekunden nicht funktioniert, liegt das Problem woanders.**

---

## 🛠️ Debug-Schritte

### Schritt 1: Hole Werte aus Postman

**In Postman:**

1. **Öffne Environment Variables** (oben rechts)
2. **Kopiere folgende Werte:**
   - `apiKeyId`
   - `challenge` (nach Request 2)
   - `signature` (nach Request 2.5)

### Schritt 2: Teste lokal

**Im Terminal:**

```bash
node scripts/check-postman-values.js <apiKeyId> "<challenge>" "<signature>"
```

**Beispiel:**
```bash
node scripts/check-postman-values.js 9eadacab-bc87-4dff-8d01-e4862c654b45 "CjWqn/Vr0zyM8kRCQujJACEZTi8gizRoX3TfSveTHlc=" "T5j9oXdaNJBQiS4PmVWDOnLE/SCbrMXYEOac7amnMoTKnc6zux..."
```

**Was das Script macht:**
1. ✅ Prüft ob Keys existieren
2. ✅ Generiert neue Signature mit dieser Challenge
3. ✅ Vergleicht mit Postman-Signature
4. ✅ Verifiziert Signature lokal

### Schritt 3: Prüfe Ergebnis

**Falls Signature nicht übereinstimmt:**
- ❌ Challenge wurde zwischen Request 2 und Request 2.5 geändert
- ❌ Signature wurde mit einer anderen Challenge generiert

**Falls Signature übereinstimmt, aber Lambda fehlschlägt:**
- ⚠️ Challenge ist in Lambda abgelaufen
- ⚠️ Challenge stimmt nicht überein (wurde zwischen Request 2 und 3 geändert)
- ⚠️ Public Key in Lambda passt nicht zu diesem Private Key

---

## 🔍 Häufigste Ursachen

### 1. Challenge wird zwischen Request 2 und Request 2.5 geändert

**Problem:** Die Challenge, die in Request 2 zurückgegeben wird, stimmt nicht mit der Challenge überein, die in Request 2.5 verwendet wird.

**Prüfung:**
- In Postman Console: Prüfe ob Challenge zwischen Request 2 und Request 2.5 gleich bleibt
- Prüfe ob Challenge korrekt in Environment Variable gespeichert wurde

**Lösung:**
- Stelle sicher, dass Challenge korrekt in Environment Variable gespeichert wurde
- Prüfe ob Challenge zwischen Request 2 und Request 2.5 geändert wurde

### 2. Public Key passt nicht zu Private Key

**Problem:** Der Public Key, der in Lambda registriert ist, passt nicht zu dem Private Key, der zum Signieren verwendet wird.

**Prüfung:**
```bash
# Teste ob Keys zusammenpassen
node scripts/check-postman-values.js <apiKeyId> "<challenge>" "<signature>"
```

**Lösung:**
- Generiere neues Key-Pair: `node scripts/complete-api-key-setup.js`
- Registriere Public Key neu: Request 1 in Postman

### 3. Challenge wird zwischen Request 2.5 und Request 3 geändert

**Problem:** Die Challenge, die signiert wurde, stimmt nicht mit der Challenge überein, die an Lambda gesendet wird.

**Prüfung:**
- In Postman Console: Prüfe ob Challenge zwischen Request 2.5 und Request 3 gleich bleibt
- Prüfe ob Challenge korrekt in Environment Variable gespeichert wurde

**Lösung:**
- Stelle sicher, dass Challenge korrekt in Environment Variable gespeichert wurde
- Prüfe ob Challenge zwischen Request 2.5 und Request 3 geändert wurde

---

## 📋 Quick Fix

### Option 1: Neues Key-Pair generieren

```bash
# 1. Generiere neues Key-Pair
node scripts/complete-api-key-setup.js

# 2. Update Environment
node scripts/update-postman-environment.js

# 3. Importiere Environment in Postman erneut

# 4. Teste erneut:
#    Request 1 → Request 2 → Request 2.5 → Request 3
```

### Option 2: Challenge manuell prüfen

1. **Request 2:** Get Challenge → Kopiere Challenge aus Response
2. **Request 2.5:** Generate Signature → Prüfe ob Challenge gleich ist
3. **Request 3:** Get Token → Prüfe ob Challenge gleich ist

**Falls Challenge unterschiedlich ist:**
- ❌ Challenge wird zwischen Requests geändert
- **Lösung:** Prüfe Postman Console für Details

---

## ✅ Checkliste

- [ ] Keys existieren für apiKeyId
- [ ] Challenge wurde korrekt in Environment Variable gespeichert
- [ ] Signature wurde korrekt in Environment Variable gespeichert
- [ ] Challenge stimmt zwischen Request 2 und Request 2.5 überein
- [ ] Challenge stimmt zwischen Request 2.5 und Request 3 überein
- [ ] Public Key wurde korrekt registriert (Request 1)
- [ ] Environment ist in Postman aktiviert

---

## 🆘 Wenn nichts hilft

1. **Teste mit Script:**
   ```bash
   node scripts/check-postman-values.js <apiKeyId> "<challenge>" "<signature>"
   ```

2. **Prüfe CloudWatch Logs:**
   - Suche nach `Signature valid: false`
   - Prüfe ob Challenge-Länge übereinstimmt

3. **Generiere neues Key-Pair:**
   ```bash
   node scripts/complete-api-key-setup.js
   ```

