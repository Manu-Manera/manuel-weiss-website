# 🇬🇧 English Language Implementation Plan - /en/ URL System

## 📋 Analyse der aktuellen Struktur

### ✅ Vorhandene Komponenten:
1. **Übersetzungssystem**: `js/simple-translation.js` mit `data-de`/`data-en` Attributen
2. **Netlify Redirects**: `_redirects` Datei vorhanden
3. **Workflow-Navigation**: `js/persoenlichkeitsentwicklung-methods.js` mit `startMethod()` Funktion
4. **Bereits vorhanden**: `en/persoenlichkeitsentwicklung-uebersicht.html`

### 📁 Workflow-Seiten die übersetzt werden müssen:

#### Haupt-Workflows:
1. `persoenlichkeitsentwicklung-uebersicht.html` ✅ (bereits vorhanden)
2. `persoenlichkeitsentwicklung.html` (Ikigai)
3. `ikigai.html`
4. `raisec-persoenlichkeitsentwicklung.html`
5. `raisec-theorie.html`
6. `raisec-anwendung.html`

#### Methods-Verzeichnis Workflows:
- `methods/ikigai/` - Alle Dateien
- `methods/raisec/` - Alle Dateien
- `methods/gallup-strengths/`
- `methods/via-strengths/`
- `methods/values-clarification/`
- `methods/strengths-analysis/`
- `methods/goal-setting/`
- `methods/mindfulness/`
- `methods/emotional-intelligence/`
- `methods/habit-building/`
- `methods/johari-window/`
- `methods/nlp-dilts/`
- `methods/five-pillars/`
- `methods/harvard-method/`
- `methods/moment-excellence/`
- `methods/nlp-meta-goal/`
- `methods/nonviolent-communication/`
- `methods/resource-analysis/`
- `methods/rafael-method/`
- `methods/walt-disney/`
- `methods/aek-communication/`
- `methods/change-stages/`
- `methods/circular-interview/`
- `methods/communication/`
- `methods/time-management/`
- `methods/therapy-form-finder/`
- `methods/competence-map/`
- `methods/conflict-escalation/`
- `methods/self-assessment/`
- `methods/solution-focused/`
- `methods/stress-management/`
- `methods/swot-analysis/`
- `methods/systemic-coaching/`
- `methods/target-coaching/`
- `methods/vision-board/`
- `methods/wheel-of-life/`

## 🎯 Umsetzungsschritte

### Phase 1: URL-System Setup
1. ✅ Netlify Redirects für `/en/` Pfade konfigurieren
2. ✅ Language-Switcher erweitern um URL-basierte Navigation
3. ✅ `SimpleTranslation` erweitern um URL-Pfade zu erkennen

### Phase 2: Hauptseiten übersetzen
1. ✅ `persoenlichkeitsentwicklung-uebersicht.html` → `en/persoenlichkeitsentwicklung-uebersicht.html` (prüfen/aktualisieren)
2. ✅ `persoenlichkeitsentwicklung.html` → `en/persoenlichkeitsentwicklung.html`
3. ✅ `ikigai.html` → `en/ikigai.html`
4. ✅ `raisec-*.html` → `en/raisec-*.html`

### Phase 3: Methods-Verzeichnis übersetzen
1. ✅ Alle `methods/*/` Verzeichnisse nach `en/methods/*/` kopieren
2. ✅ Alle Inhalte übersetzen (data-de/data-en + direkter Text)
3. ✅ Navigation und Links anpassen

### Phase 4: Navigation & Links
1. ✅ `startMethod()` Funktion erweitern um `/en/` Pfade
2. ✅ Alle internen Links auf englischen Seiten anpassen
3. ✅ Language-Switcher für beide Sprachen funktionsfähig machen

### Phase 5: Style-Optimierung
1. ✅ Cross-Browser Kompatibilität sicherstellen
2. ✅ Mobile Responsive Design optimieren
3. ✅ Alle Workflows testen

## 🔧 Technische Details

### URL-Struktur:
- Deutsch: `https://manuel-weiss.ch/persoenlichkeitsentwicklung-uebersicht.html`
- Englisch: `https://manuel-weiss.ch/en/persoenlichkeitsentwicklung-uebersicht.html`
- Deutsch Workflow: `https://manuel-weiss.ch/methods/ikigai/ikigai.html`
- Englisch Workflow: `https://manuel-weiss.ch/en/methods/ikigai/ikigai.html`

### Netlify Redirects Pattern:
```
/en/*                    /en/:splat                    200
/en/persoenlichkeitsentwicklung-uebersicht.html    /en/persoenlichkeitsentwicklung-uebersicht.html  200
/en/methods/*           /en/methods/:splat          200
```

### Language-Switcher Logik:
- Wenn auf `/en/` → Wechsel zu `/` (ohne `/en/`)
- Wenn auf `/` → Wechsel zu `/en/`
- Aktuelle URL-Pfade beibehalten (z.B. `/methods/ikigai/` → `/en/methods/ikigai/`)

