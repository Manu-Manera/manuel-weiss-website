# Tempus Glaskacheln – Stylus-Anleitung

Damit die Tempus-Startseite Kacheln mit abgerundeten Ecken und Glaseffekt anzeigt:

## 1. Stylus installieren

1. Öffne den [Chrome Web Store](https://chrome.google.com/webstore/detail/stylus/clngdbkpkpeebahjckkjfobafhncgmne)
2. Klicke auf **„Zu Chrome hinzufügen“**

## 2. Stil hinzufügen

**Wichtig:** Kopiere die **gesamte** Datei inkl. Metadaten-Block (Zeilen 1–9), sonst erscheint „could not find metafile“.

### Option A: Aus Datei kopieren

1. Öffne `tempus-glaskacheln.user.css` (oder `tempus-glaskacheln-stylus.css`)
2. **Alles** markieren und kopieren (Strg+A / Cmd+A, dann Strg+C / Cmd+C)
3. Stylus-Symbol → **„Stylus verwalten“** → **„Neuer Stil“**
4. Den kompletten Inhalt einfügen (inkl. `==UserStyle==` … `==/UserStyle==`)
5. Speichern (Strg+S / Cmd+S)

### Option B: Install from URL (falls die Datei online liegt)

1. Stylus → **„Stylus verwalten“** → **„Install from URL“**
2. URL zur `.user.css`-Datei eingeben

## 3. Ergebnis

- **Abgerundete Ecken:** 24px Radius
- **Glaseffekt:** halbtransparenter Hintergrund mit `backdrop-filter: blur`
- **Leichter Rahmen:** weiße Kante für den Glaseffekt
- **Hover:** etwas heller beim Überfahren

## 4. Selektoren anpassen

Falls die Kacheln nicht verändert werden:

1. Tempus-Seite öffnen und einloggen
2. Rechtsklick auf eine Kachel → **„Untersuchen“**
3. Im DevTools die `class` des Kachel-Elements notieren
4. In Stylus einen zusätzlichen Selektor ergänzen, z.B.:
   ```css
   .deine-gefundene-klasse {
     border-radius: 24px !important;
     background: rgba(255, 255, 255, 0.25) !important;
     backdrop-filter: blur(12px);
     /* ... rest wie oben */
   }
   ```
