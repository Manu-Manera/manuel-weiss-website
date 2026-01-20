# Netlify Credits sparen: Preview-Setup

## 🎯 Konzept

| URL | Inhalt | Kosten |
|-----|--------|--------|
| **manuel-weiss.ch** | Platzhalter ("Coming Soon") | Minimal (1x deployed) |
| **deploy-preview-X--...** | Volle Website | **KOSTENLOS** ✅ |

---

## ⚡ Netlify Dashboard Setup (WICHTIG!)

### Schritt 1: Production Branch ändern

1. Öffne [app.netlify.com](https://app.netlify.com) → deine Site
2. **Site configuration** → **Build & deploy** → **Branches and deploy contexts**
3. Bei **"Production branch"** klicke **"Edit"**
4. Ändere von `main` auf **`production`**
5. **Save** klicken

### Schritt 2: Deploy Previews aktivieren

1. Im selben Bereich bei **"Deploy Previews"**
2. Wähle: **"Any pull request against your production branch"**
3. **Save** klicken

### Schritt 3: Branch Deploys für main aktivieren (optional)

1. Bei **"Branch deploys"** 
2. Wähle: **"All"** oder füge **"main"** hinzu
3. Das gibt dir: `main--manuel-weiss.netlify.app`

---

## 🔄 Workflow

### Änderungen testen (KOSTENLOS):

```bash
# 1. Auf main arbeiten
git checkout main

# 2. Änderungen machen
# ... code ...

# 3. Committen & pushen
git add -A && git commit -m "Mein Feature" && git push

# 4. Pull Request erstellen (main → production)
# → Netlify erstellt automatisch Preview-URL!
```

### Preview-URL:
```
https://deploy-preview-[PR-NUMMER]--manuel-weiss.netlify.app
```

---

## 📊 Ergebnis

| Was | URL | Inhalt |
|-----|-----|--------|
| Production | manuel-weiss.ch | "Coming Soon" Platzhalter |
| Branch Deploy | main--manuel-weiss.netlify.app | Volle Website |
| PR Preview | deploy-preview-X--manuel-weiss.netlify.app | Volle Website (KOSTENLOS) |

---

## 💡 Tipps

- **Pull Requests** erstellen = kostenlose Previews
- **Branch Deploys** (main) kosten auch Credits, aber weniger als Production
- Die Platzhalter-Seite auf manuel-weiss.ch wird nur 1x deployed

## 🚀 Website live schalten

Wenn du die echte Website auf manuel-weiss.ch haben willst:

```bash
# main in production mergen
git checkout production
git merge main
git push origin production
```

Dann deployed Netlify die volle Website auf manuel-weiss.ch.
