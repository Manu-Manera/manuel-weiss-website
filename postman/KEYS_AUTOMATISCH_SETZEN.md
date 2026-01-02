# 🔑 Keys automatisch in Postman setzen - EINMALIG!

## ✅ Lösung: Environment-File wird automatisch aktualisiert

**Problem:** Keys müssen jedes Mal neu eingegeben werden, wenn Collection neu geladen wird.

**Lösung:** Script aktualisiert automatisch das Environment-File mit den Keys!

---

## 🚀 Quick Setup (einmalig)

### Schritt 1: Script ausführen

**Im Terminal:**
```bash
node scripts/update-postman-environment.js
```

**Das macht automatisch:**
- ✅ Findet neuestes Key-Pair
- ✅ Lädt Public Key und Private Key
- ✅ Formatiert Keys für Postman
- ✅ Schreibt Keys in Environment-File

### Schritt 2: Environment in Postman importieren

1. **Postman öffnen**
2. **Klicke auf "Import"** (oben links)
3. **Wähle:** `postman/API-Key-Authentication.postman_environment.json`
4. **Klicke auf "Import"**

### Schritt 3: Environment aktivieren

1. **Oben rechts** auf **Environments** klicken
2. **"API Key Authentication - Environment"** auswählen
3. **Stelle sicher, dass es aktiviert ist** (Dropdown oben rechts)

---

## ✅ Fertig!

**Jetzt kannst du die Collection beliebig oft neu laden** - die Keys bleiben erhalten! 🎉

---

## 🔄 Wenn neues Key-Pair generiert wird

**Falls du ein neues Key-Pair generierst:**

```bash
# 1. Generiere neues Key-Pair
node scripts/complete-api-key-setup.js

# 2. Update Environment automatisch
node scripts/update-postman-environment.js

# 3. Importiere Environment in Postman erneut (überschreibt alte Werte)
```

**Oder mit spezifischer apiKeyId:**
```bash
node scripts/update-postman-environment.js <apiKeyId>
```

---

## 💡 Warum funktioniert das?

**Collection Variables:**
- ❌ Werden beim Neuladen überschrieben
- ❌ Gehen bei Collection-Update verloren

**Environment Variables:**
- ✅ Bleiben beim Neuladen erhalten
- ✅ Bleiben bei Collection-Update erhalten
- ✅ Können exportiert/importiert werden
- ✅ Werden vom Script automatisch aktualisiert

---

## 📋 Checkliste

- [ ] Script ausgeführt: `node scripts/update-postman-environment.js`
- [ ] Environment importiert in Postman
- [ ] Environment aktiviert (Dropdown oben rechts)
- [ ] Collection importiert
- [ ] Test: Collection neu laden → Keys bleiben erhalten ✅

---

## 🆘 Troubleshooting

### Problem: "Keys nicht gefunden"

**Lösung:**
```bash
# Generiere zuerst ein Key-Pair
node scripts/complete-api-key-setup.js

# Dann update Environment
node scripts/update-postman-environment.js
```

### Problem: "Environment-File nicht gefunden"

**Lösung:**
- Stelle sicher, dass du im richtigen Verzeichnis bist
- Prüfe ob `postman/API-Key-Authentication.postman_environment.json` existiert

### Problem: "Keys gehen trotzdem verloren"

**Lösung:**
1. Prüfe ob Environment aktiviert ist (Dropdown oben rechts)
2. Prüfe ob Keys in Environment Variables sind (nicht Collection Variables)
3. Importiere Environment erneut

---

## ✅ Das war's!

**Nie wieder Keys manuell eingeben!** 🎉

