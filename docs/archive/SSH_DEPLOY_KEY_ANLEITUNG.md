# 🔐 SSH Deploy Key - Anleitung

## ✅ SSH Key wurde erstellt!

**Öffentlicher Key:**
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJsWOz77UoM4MK2/C++eOyRKFbc+rscgdoy/WT5Z8QF1 manuel-weiss-website-deploy
```

---

## 📋 Schritt 1: Key bei GitHub hinterlegen

### 1. Öffnen Sie:
https://github.com/Manu-Manera/manuel-weiss-website/settings/keys

### 2. Klicken Sie auf:
**"Add deploy key"** (rechts oben)

### 3. Füllen Sie aus:
- **Title:** `manuel-weiss-website-deploy` (oder beliebig)
- **Key:** Fügen Sie den kompletten Key ein:
  ```
  ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJsWOz77UoM4MK2/C++eOyRKFbc+rscgdoy/WT5Z8QF1 manuel-weiss-website-deploy
  ```
- **Allow write access:** ✅ **AKTIVIEREN** (wichtig für Force Push!)

### 4. Klicken Sie: **"Add key"**

---

## 🚀 Schritt 2: Force Push durchführen

Nachdem der Key bei GitHub hinterlegt ist, können Sie den Force Push durchführen:

### In Terminal:
```bash
cd "/Users/manumanera/Documents/GitHub/Persönliche Website"
git checkout main
git push origin main --force-with-lease
```

### Oder ich führe es für Sie aus, sobald Sie den Key hinzugefügt haben!

---

## ✅ Was wurde konfiguriert:

1. ✅ SSH Key erstellt: `~/.ssh/id_ed25519_manuel_weiss_website`
2. ✅ SSH Config erstellt: `~/.ssh/config` (Host: github-manuel-weiss)
3. ✅ Git Remote auf SSH umgestellt: `git@github-manuel-weiss:Manu-Manera/manuel-weiss-website.git`

---

## 🔍 Test der SSH-Verbindung:

Nachdem Sie den Key bei GitHub hinzugefügt haben, können Sie testen:

```bash
ssh -T git@github-manuel-weiss
```

Erwartete Antwort:
```
Hi Manu-Manera! You've successfully authenticated, but GitHub does not provide shell access.
```

---

## ⚠️ WICHTIG:

- **"Allow write access"** MUSS aktiviert sein für Force Push!
- Der private Key liegt in: `~/.ssh/id_ed25519_manuel_weiss_website`
- **NICHT** den privaten Key teilen oder committen!

---

**Sobald Sie den Key bei GitHub hinzugefügt haben, sagen Sie Bescheid - dann führe ich den Force Push für Sie aus!** 🚀

