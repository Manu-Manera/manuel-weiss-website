# 🔧 Environment Setup - Werte bleiben erhalten!

## ✅ Lösung: Environment Variables verwenden

**Problem:** Bei jedem Neuladen der Collection gehen die Werte verloren.

**Lösung:** Verwende **Environment Variables** statt Collection Variables!

---

## 🚀 Quick Setup (einmalig)

### Schritt 1: Environment importieren

1. **Postman öffnen**
2. **Klicke auf "Import"** (oben links)
3. **Wähle:** `API-Key-Authentication.postman_environment.json`
4. **Klicke auf "Import"**

### Schritt 2: Environment aktivieren

1. **Oben rechts** auf **Environments** klicken
2. **"API Key Authentication - Environment"** auswählen
3. **Stelle sicher, dass es aktiviert ist** (Dropdown oben rechts)

### Schritt 3: Werte setzen (einmalig)

1. **Klicke auf "API Key Authentication - Environment"** um zu bearbeiten
2. **Setze folgende Werte:**

| Variable | Wert | Beschreibung |
|----------|------|--------------|
| `apiKeyId` | `9eadacab-bc87-4dff-8d01-e4862c654b45` | Deine API Key ID |
| `publicKey` | `-----BEGIN PUBLIC KEY-----\n...` | Dein Public Key (formatiert) |
| `privateKey` | `-----BEGIN PRIVATE KEY-----\n...` | Dein Private Key (formatiert) |
| `baseUrl` | `https://of2iwj7h2c...` | ✅ Bereits gesetzt |
| `signingServerBaseUrl` | `http://localhost:3001` | ✅ Bereits gesetzt |

3. **Klicke auf "Save"**

---

## ✅ Fertig!

**Jetzt kannst du die Collection beliebig oft neu laden** - deine Werte bleiben erhalten! 🎉

---

## 🔄 Collection aktualisieren (ohne Werte zu verlieren)

### So geht's:

1. **Collection in Postman exportieren** (optional, als Backup)
2. **Neue Collection importieren** (überschreibt die alte)
3. **Fertig!** - Deine Environment Variables bleiben erhalten

**Wichtig:** Environment muss aktiviert sein!

---

## 💡 Warum Environment Variables?

### Collection Variables:
- ❌ Werden beim Neuladen überschrieben
- ❌ Gehen bei Collection-Update verloren
- ✅ Gut für Default-Werte

### Environment Variables:
- ✅ Bleiben beim Neuladen erhalten
- ✅ Bleiben bei Collection-Update erhalten
- ✅ Können in mehreren Collections verwendet werden
- ✅ Können exportiert/importiert werden

---

## 🔐 Private Key sicher speichern

**Private Keys sind sensibel!**

1. **Environment Variable `privateKey`** ist als `secret` markiert
2. **Wird in Postman nicht angezeigt** (nur `•••••`)
3. **Wird nicht in Screenshots angezeigt**
4. **Nur lokal auf deinem Rechner**

**⚠️ Wichtig:** Teile niemals dein Environment-File mit anderen!

---

## 📋 Quick Reference

### Environment aktivieren:
- **Dropdown oben rechts** → "API Key Authentication - Environment"

### Werte setzen:
- **Environments** → "API Key Authentication - Environment" → Bearbeiten → Save

### Collection neu laden:
- **Import** → Neue Collection → **Deine Werte bleiben erhalten!** ✅

---

## 🆘 Troubleshooting

### Problem: "Variable nicht gefunden"

**Lösung:**
1. Prüfe ob Environment aktiviert ist (Dropdown oben rechts)
2. Prüfe ob Variable in Environment existiert
3. Prüfe ob Variable korrekt benannt ist (`{{apiKeyId}}`)

### Problem: "Werte gehen verloren"

**Lösung:**
1. Stelle sicher, dass du **Environment Variables** verwendest (nicht Collection Variables)
2. Prüfe ob Environment aktiviert ist
3. Prüfe ob du auf "Save" geklickt hast

---

## ✅ Checkliste

- [ ] Environment importiert
- [ ] Environment aktiviert
- [ ] `apiKeyId` gesetzt
- [ ] `publicKey` gesetzt
- [ ] `privateKey` gesetzt
- [ ] Collection importiert
- [ ] Test: Collection neu laden → Werte bleiben erhalten ✅

