# 🔐 Deploy Key entfernen - Anleitung

## ✅ Lokale Konfiguration bereits bereinigt:

- ✅ SSH Keys gelöscht
- ✅ SSH Config bereinigt  
- ✅ Git Remote auf HTTPS umgestellt

---

## 📋 Schritt 1: Deploy Key bei GitHub löschen

### 1. Öffnen Sie:
https://github.com/Manu-Manera/manuel-weiss-website/settings/keys

### 2. Suchen Sie den Key:
- **Title:** `manuel-weiss-website-deploy` (oder wie Sie ihn benannt haben)
- **Fingerprint:** `SHA256:...` (beginnt mit SHA256)

### 3. Klicken Sie auf:
**🗑️ Delete** (rechts neben dem Key)

### 4. Bestätigen Sie:
```
Are you sure you want to delete this deploy key?
This action cannot be undone.
```
→ **"I understand, delete this deploy key"**

---

## ✅ Fertig!

Der Deploy Key ist jetzt vollständig entfernt:
- ✅ Von GitHub gelöscht
- ✅ Lokale SSH Keys gelöscht
- ✅ SSH Config bereinigt
- ✅ Git Remote auf HTTPS zurückgesetzt

---

## 🔒 Sicherheitshinweis:

Da das Repository öffentlich ist, war es richtig, den Deploy Key zu entfernen. Für öffentliche Repositories sollten Sie stattdessen:

- **Personal Access Token** verwenden (für HTTPS)
- Oder **SSH Keys** über Ihr GitHub-Konto (nicht als Deploy Key)

---

**Der Rollback auf Commit 7422015 bleibt erhalten - nur die SSH-Konfiguration wurde entfernt!** ✅

