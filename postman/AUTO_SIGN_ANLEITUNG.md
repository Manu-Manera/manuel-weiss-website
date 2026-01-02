# 🤖 Automatische Signature-Generierung - Super Einfach!

## 🎯 Ziel

**Du musst NICHTS mehr manuell eingeben - alles automatisch!**

---

## ✅ Methode: Auto-Sign Script

### Schritt 1: Request 2 ausführen

1. **Führe Request 2 aus** ("Get Challenge")
2. **Challenge wird automatisch in Environment Variable gespeichert**

### Schritt 2: Auto-Sign Script ausführen

**Im Terminal (Cursor):**

```bash
node scripts/auto-sign-challenge.js
```

**Das war's!** ✅

Das Script:
- ✅ Liest Challenge aus Postman Environment File
- ✅ Liest apiKeyId aus Postman Environment File
- ✅ Signiert automatisch
- ✅ Speichert Signature in Postman Environment File
- ✅ Kopiert Signature in Zwischenablage

### Schritt 3: Request 3 ausführen

1. **Führe Request 3 aus** ("Get Token")
2. **Signature ist bereits gesetzt!** ✅

---

## 🔄 Vollständiger Workflow

```
1. Request 1: Public Key registrieren ✅
   ↓
2. Request 2: Challenge anfordern ✅
   (Challenge wird automatisch gespeichert)
   ↓
3. Auto-Sign Script ausführen:
   node scripts/auto-sign-challenge.js
   (Signature wird automatisch generiert und gespeichert)
   ↓
4. Request 3: Token generieren ✅
   (Signature ist bereits gesetzt!)
```

**Viel einfacher!** 🎉

---

## 📋 Alternative Quellen

Das Script sucht Challenge aus verschiedenen Quellen:

1. **Postman Environment File** (automatisch)
2. **challenge.txt** (falls vorhanden)
3. **Zwischenablage** (macOS)

Du kannst auch manuell eine Datei erstellen:

```bash
echo "<challenge>" > challenge.txt
node scripts/auto-sign-challenge.js
```

---

## ⚠️ Wichtige Hinweise

### Postman Environment File

Das Script sucht nach:
- `postman/Manuel-Weiss-API.postman_environment.json`

Falls dein Environment File anders heißt:
```bash
node scripts/auto-sign-challenge.js path/to/your-env-file.json
```

### Challenge Gültigkeit

- **Challenge ist 60 Sekunden gültig**
- Führe Auto-Sign Script schnell nach Request 2 aus
- Dann sofort Request 3 ausführen

---

## 🆘 Troubleshooting

### Problem: "Challenge nicht gefunden"

**Lösung:**
1. Prüfe ob Request 2 ausgeführt wurde
2. Prüfe ob Challenge in Postman Environment Variable gespeichert ist
3. Oder: Kopiere Challenge in `challenge.txt`:
   ```bash
   echo "<challenge>" > challenge.txt
   ```

### Problem: "apiKeyId nicht gefunden"

**Lösung:**
1. Prüfe ob `apiKeyId` in Postman Environment Variable gesetzt ist
2. Oder: Setze als Environment Variable:
   ```bash
   export apiKeyId="your-api-key-id"
   ```

### Problem: "Private Key nicht gefunden"

**Lösung:**
1. Prüfe ob Private Key existiert: `keys/<apiKeyId>-private-key.pem`
2. Prüfe ob `apiKeyId` korrekt ist
3. Generiere neue Keys falls nötig

---

## ✅ Quick Start

```bash
# 1. Request 2: Challenge holen
# 2. Auto-Sign:
node scripts/auto-sign-challenge.js

# 3. Request 3: Token generieren
```

**Fertig!** 🎉

---

## 💡 Tipp

Du kannst auch ein Alias erstellen:

```bash
# In ~/.zshrc oder ~/.bashrc:
alias sign-challenge="cd '/Users/manumanera/Documents/GitHub/Persönliche Website' && node scripts/auto-sign-challenge.js"

# Dann einfach:
sign-challenge
```

**Noch einfacher!** 🚀

