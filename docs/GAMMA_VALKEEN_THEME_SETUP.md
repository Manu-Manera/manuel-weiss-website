# Valkeen / Tempus Custom Theme in Gamma

Die Gamma-**API kann keine Themes anlegen** (`POST /themes` → 404). Custom Themes gehen nur über die **Gamma-App**.

## Farben (aus `valkeen-2026-master.pptx`, Theme „Blau II“)

| Rolle | Hex | Verwendung |
|-------|-----|------------|
| Slate Navy | `#335B74` | Überschriften, Footer-Leiste |
| Hellblau | `#1CADE4` | Akzent 1, Icons |
| Mittelblau | `#2683C6` | Akzent 2, Diagramme |
| Teal | `#27CED7` | Akzent 3, Highlights |
| Grün | `#42BA97` | Akzent 4, positive Callouts |
| Hellgrau | `#DFE3E5` | Sekundärflächen |
| Weiß | `#FFFFFF` | Inhaltsfolien-Hintergrund |

**Schrift:** Calibri (Web-Fallback: Inter, Lato)

## Theme anlegen (einmalig, ~3 Min.)

### Option A – Referenz-Deck generieren

```bash
cd "Persönliche Website"
node scripts/setup-gamma-valkeen-theme.mjs
```

Öffne den Link aus der Ausgabe → Theme feintunen → **Save as custom theme** → Name: `Valkeen Tempus Blau II`

### Option B – Manuell in Gamma

1. **Themes** → **Create theme**
2. Basis: **Marine** oder **Consultant** wählen
3. Farben oben eintragen
4. Headings: `#335B74`, Body: dunkel, Background: weiß
5. Footer-Text: `Valkeen GmbH · Tempus Resource`
6. Speichern

## Theme-ID setzen

```bash
export VALKEEN_GAMMA_THEME_ID=<deine-theme-id>
python3 scripts/post-excel-walkthrough-to-gamma.py
```

## Excel-Walkthrough Links (Stand)

| Variante | Link |
|----------|------|
| Marine (empfohlen) | https://gamma.app/docs/oa9bn5qrgulm63c |
| Consultant | https://gamma.app/docs/oaz3c8ojnvvva7i |
| Seafoam | https://gamma.app/docs/t3ugi31y4p8tiea |
| Verdigris | https://gamma.app/docs/871bfvfeldmzp8r |

## PPTX (echter 1:1-Master)

Repariertes Build-Skript entfernt verwaiste Slide-Parts:

```bash
python3 scripts/build-excel-walkthrough-pptx-from-master.py
```

Download: https://manuel-weiss.ch/onboarding/tempus-excel-upload-walkthrough.pptx
