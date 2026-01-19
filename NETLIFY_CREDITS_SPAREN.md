# Netlify Credits sparen - Konfiguration

## Problem
- Jeder Deploy kostet 15 Credits
- Nur 1000 Credits pro Monat frei
- Netlify hat die Seite wegen zu vielen Deploys runtergenommen

## Lösung: Nur Production Branch deployt

### Aktuelle Konfiguration
Die `netlify.toml` ist jetzt so konfiguriert, dass:
- ✅ **NUR der `main` Branch** deployt (Production)
- ❌ **KEINE Preview Deploys** (Pull Requests)
- ❌ **KEINE Branch Deploys** (andere Branches)

### Netlify Dashboard Einstellungen

Gehe zu: **Site settings → Build & deploy → Continuous Deployment**

1. **Production branch**: `main` (oder `master`)
2. **Branch deploys**: **DEAKTIVIERT** ❌
3. **Deploy previews**: **DEAKTIVIERT** ❌
4. **Stop auto publishing**: **AKTIVIERT** ✅ (optional, für manuelle Kontrolle)

### Manuelle Deploys

Wenn du testen willst, ohne Credits zu verbrauchen:

1. **Lokal testen**:
   ```bash
   # Einfacher HTTP-Server
   python3 -m http.server 8000
   # Oder
   npx serve .
   ```

2. **Nur bei wichtigen Änderungen deployen**:
   - Commits sammeln
   - Erst am Ende des Tages deployen
   - Nicht bei jedem kleinen Commit

### Alternative: Netlify CLI für lokales Testen

```bash
# Netlify CLI installieren
npm install -g netlify-cli

# Lokal testen (kostet keine Credits)
netlify dev
```

### Branch-Strategie

**Empfohlene Workflow:**
1. Arbeite auf Feature-Branches
2. Teste lokal
3. Merge nur wenn fertig
4. Nur `main` Branch deployt automatisch

### Credits überwachen

**Netlify Dashboard → Billing → Usage**
- Siehst du, wie viele Credits verbraucht wurden
- 1000 Credits = ~66 Deploys pro Monat
- Mit dieser Konfiguration: Nur ~1-2 Deploys pro Tag möglich

### Notfall: Deploys komplett stoppen

Falls du gar nicht deployen willst:

1. **Netlify Dashboard → Site settings → Build & deploy**
2. **Stop auto publishing** aktivieren
3. Oder: **Continuous Deployment** komplett deaktivieren

### Tipps zum Credits sparen

1. ✅ **Commits sammeln**: Nicht bei jedem Commit deployen
2. ✅ **Lokal testen**: Vor dem Deploy alles testen
3. ✅ **Branch Deploys deaktivieren**: Nur Production
4. ✅ **Preview Deploys deaktivieren**: Keine PR-Deploys
5. ✅ **Manuelle Deploys**: Nur wenn nötig

### Wenn du trotzdem testen willst

**Option 1: Netlify Dev (kostenlos)**
```bash
netlify dev
```

**Option 2: Lokaler Server**
```bash
python3 -m http.server 8000
# Oder
npx serve .
```

**Option 3: GitHub Pages (kostenlos)**
- Alternative zu Netlify für Test-Deploys
- Unbegrenzt kostenlos

### Aktuelle netlify.toml Einstellungen

```toml
# NUR Production Branch deployt
[context.production]
  command = ""
  publish = "."

# Preview Deploys DEAKTIVIERT
[context.deploy-preview]
  skip_processing = true

# Branch Deploys DEAKTIVIERT
[context.branch-deploy]
  skip_processing = true
```

Diese Konfiguration stellt sicher, dass nur der `main` Branch deployt und keine Credits für Test-Deploys verbraucht werden.
