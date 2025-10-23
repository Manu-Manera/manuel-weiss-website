# Modul 08 — Admin‑UI (Dashboard & UX)
**Repo:** `Manu-Manera/manuel-weiss-website` • **Version:** 5.0 • **Zeitzone:** Europe/Zurich  
**Prinzip:** *Kein Test-/Demo-Daten-Einsatz. Nur echte Quellen/Provider. Serverseitige Secrets.*

---
# Repo-Ausrichtung & Pfade
- `ui/admin/ai-investments/` (in `admin/sections` registrieren)

# Smart Prompt – Implementierung (für Cursor)
> **An Cursor – Implementierung:**  
Tabs:
1) **Live Signals** (Virtualized, Filter, Dedupe‑Badge, Zeit‑Tooltip)  
2) **Proposals** (Approve=A, Reject=R, Details=D; Explain‑Drawer: Why/Why‑Not, Szenarien, Risiko‑Gauge)  
3) **Risk & Limits** (VaR/CVaR Gauge, Bucket‑Exposures, Corr‑Heatmap)  
4) **Learning** (Hitrate 7/30/90, Sharpe, Reliability, Prompt‑A/B)  
5) **Agent Health** (Latency p95, Error‑Rate, Kosten/1k Signals)  
Design: Clean, modern, Dark/Light, ARIA/Keyboard, Skelett‑Loader, lehrreiche Empty‑States.  
Datenzugriff **nur** via `packages/api-client`.

# Zusätzliche Verbesserungen (production‑grade)
- **What‑Changed‑Diff** bei Re‑Scores.  
- **CSV/PDF Export** & **Audit‑Trail** Ansicht.  
- **Prefetch/Cache** für häufige Queries.

# Fehlervermeidung – Was schiefgehen kann & Gegenmaßnahmen
- **Layout‑Jank** bei Event‑Storm.  
  **Fix:** Virtualization + Debounce.  
- **A11y Defizite** (Fokus, ARIA).  
  **Fix:** axe‑Checks, Tastatur‑Flows.

# Akzeptanzkriterien (Definition of Done)
- Responsiv, a11y‑Checks grün, Shortcuts funktionieren, keine direkten Secrets im FE.

# Build/Test-Gates & Verifikation (ausführen)
E2E (live) über Kernflows; Lighthouse/Axe Checks.

# Artefakte & Deliverables
- `ui/admin/ai-investments/*`, Style‑Guide‑Notizen

