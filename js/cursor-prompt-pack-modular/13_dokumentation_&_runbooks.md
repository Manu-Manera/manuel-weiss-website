# Modul 13 — Dokumentation & Runbooks
**Repo:** `Manu-Manera/manuel-weiss-website` • **Version:** 5.0 • **Zeitzone:** Europe/Zurich  
**Prinzip:** *Kein Test-/Demo-Daten-Einsatz. Nur echte Quellen/Provider. Serverseitige Secrets.*

---
# Repo-Ausrichtung & Pfade
- `docs/overview.md, infra.md, api.md, ui.md, operations.md, compliance.md, testing.md, contributing.md`

# Smart Prompt – Implementierung (für Cursor)
> **An Cursor – Implementierung:**  
- Diagramme (Mermaid), Datenflüsse, Bitemporalität, Security‑Modell.  
- Operations: Alarme → Diagnose → Lösung; Rotationen/OnCall.  
- Compliance: DSGVO‑Prozesse, Disclaimer‑Texte.

# Zusätzliche Verbesserungen (production‑grade)
- **„First 24h“** Checkliste nach Go‑Live.  
- **Cost‑Playbook**: Budget‑Alarme interpretieren.

# Fehlervermeidung – Was schiefgehen kann & Gegenmaßnahmen
- **Veraltete Doku** nach Refactors.  
  **Fix:** Doc‑Linter, PR‑Check: Doku‑Update Pflicht bei API/Infra‑Änderung.

# Akzeptanzkriterien (Definition of Done)
- Vollständig, konsistent, verlinkt; How‑tos für neue Agenten.

# Build/Test-Gates & Verifikation (ausführen)
Manuelle Review + Linkcheck.

# Artefakte & Deliverables
- Vollständiger `/docs`‑Satz

