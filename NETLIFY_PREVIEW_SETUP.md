# Netlify Credits sparen: Nur Deploy Previews nutzen

## ⚡ Quick Setup (2 Minuten)

### Schritt 1: Production Builds stoppen

1. Öffne das [Netlify Dashboard](https://app.netlify.com)
2. Wähle deine Site (manuel-weiss)
3. Gehe zu: **Site configuration** → **Build & deploy** → **Continuous deployment**
4. Bei "Build settings" klicke auf **"Stop builds"**
   
   ⚠️ Das stoppt nur Production-Deploys, Deploy Previews bleiben aktiv!

### Schritt 2: Deploy Previews aktivieren (falls nicht aktiv)

1. Im selben Bereich: **Build & deploy** → **Continuous deployment**
2. Scrolle zu **"Deploy contexts"**
3. Stelle sicher dass **"Deploy Previews"** auf **"Any pull request against your production branch"** steht

---

## 🔄 Neuer Workflow

### So testest du Änderungen kostenlos:

```bash
# 1. Neuen Branch erstellen
git checkout -b feature/mein-feature

# 2. Änderungen machen und committen
git add -A
git commit -m "Mein Feature"

# 3. Branch pushen
git push -u origin feature/mein-feature

# 4. Pull Request auf GitHub erstellen
# → Netlify erstellt automatisch eine Preview-URL!
```

### Preview-URL Format:
```
https://deploy-preview-[PR-NUMMER]--[SITE-NAME].netlify.app
```

Beispiel: `https://deploy-preview-42--manuel-weiss.netlify.app`

---

## 💰 Kosten-Vergleich

| Deploy-Typ | Kosten | Wann verwendet |
|------------|--------|----------------|
| **Production** | Zählt zu Credits | Automatisch bei Push zu `main` |
| **Deploy Preview** | **KOSTENLOS** ✅ | Bei Pull Requests |
| **Branch Deploy** | Zählt zu Credits | Bei Pushes zu konfigurierten Branches |

---

## 🚀 Wenn du Production deployen willst

Falls du doch auf Production deployen willst (z.B. für finale Version):

1. **Option A**: Im Dashboard auf "Unlock" klicken und manuell deployen
2. **Option B**: Pull Request mergen (dann manuell im Dashboard "Deploy site" klicken)
3. **Option C**: Builds wieder aktivieren (Site configuration → Build & deploy → Enable builds)

---

## ❓ FAQ

**Q: Zählen Deploy Previews wirklich nicht zu den Credits?**
A: Korrekt! Deploy Previews (für Pull Requests) sind im Free-Tier unbegrenzt.

**Q: Was ist mit Bandwidth?**
A: Bandwidth wird für alle Deploys gezählt, aber Preview-Sites werden meist nur von dir besucht.

**Q: Kann ich mehrere Previews gleichzeitig haben?**
A: Ja! Jeder Pull Request bekommt seine eigene Preview-URL.
