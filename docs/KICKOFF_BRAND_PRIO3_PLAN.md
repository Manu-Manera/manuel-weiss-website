# Kick-off Studio — Prio 3 Brand-Umsetzung (Plan)

## Analyse-Quellen

| Quelle | Erkenntnis |
|--------|------------|
| **valkeen.com** | Professionelle Beratungsmarke, Fokus Menschen/RPM/Tempus; keine öffentlichen Hex-Codes im HTML — visuell dunkles Blau + frisches Grün/Türkis |
| **pptx_design.py** | Kanonisch `#0f4c81`, `#00a878`, `#0ea5e9`, Text `#1e293b` / muted `#64748b`, RAG-Farben |
| **Valkeen_2026_Master.pptx** | Logo in `ppt/media/image1.png` → `public/kickoff/valkeen-mark.png` |
| **architecture.png** | Integrations-Schaubild → `public/kickoff/architecture.png` |
| **kickoff-studio.css** | Bereits 2026-Farben; erweitern um Tokens, Kapitel, Karten |

## Umsetzung (dieser Commit)

1. **Design-Tokens** (`kickoff-brand.css`) — alle pptx-Farben + Kapitel-Akzente
2. **Typografie** — Inter 600/700 für Headlines (global bereits geladen)
3. **ValkeenBrandLogo** — Mark aus Master-PPTX + „Tempus Resource“ Subline
4. **Topbar** — Header-Band wie PPT (Primary + Accent-Streifen)
5. **Folien-Karte** — `.kickoff-slide-panel` auf der Stage
6. **Rail** — Kapitel-Farben + Theory/Workshop-Badge am Kicker
7. **KickoffVisuals** — 15+ deck-spezifische Diagramme + Architektur-Bild
8. **Tabellen/Optionen** — Valkeen-Tabellenkopf-Stile

## Bewusst nicht in Prio 3

- Presenter-Rail einklappen (Prio 1)
- Settings-Tabs (Prio 2)
