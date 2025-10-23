# Modul 12 — CI/CD & Releases
**Repo:** `Manu-Manera/manuel-weiss-website` • **Version:** 5.0 • **Zeitzone:** Europe/Zurich  
**Prinzip:** *Kein Test-/Demo-Daten-Einsatz. Nur echte Quellen/Provider. Serverseitige Secrets.*

---
# Repo-Ausrichtung & Pfade
- `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`

# Smart Prompt – Implementierung (für Cursor)
> **An Cursor – Implementierung:**  
- `ci.yml`: Lint → Build → Live Tests → CDK Synth → Artifacts.  
- `deploy.yml`: Manuell/Tag, Reihenfolge Data→Auth→Compute→Api→Observability, Approval Gate.  
- Conventional Commits, Auto‑Changelog, Release Notes.  
- Smoke‑Tests nach Deploy (echte Endpoints).

# Zusätzliche Verbesserungen (production‑grade)
- **Canary Deploy** für Orchestrator‑Änderungen.  
- **Rollback‑Plan** (Tag/Release) dokumentieren.

# Fehlervermeidung – Was schiefgehen kann & Gegenmaßnahmen
- **Secrets fehlen** in CI.  
  **Fix:** Vor Job Start prüfen & failen, nicht mocken.  
- **Race Conditions** zwischen Stacks.  
  **Fix:** Sequenz & `needs` in Workflows.

# Akzeptanzkriterien (Definition of Done)
- Deterministische Builds; Smoke grün; Approval aktiv.

# Build/Test-Gates & Verifikation (ausführen)
Workflow‑Dry‑Run; Artefakte prüfen.

# Artefakte & Deliverables
- CI‑YAMLs, CHANGELOG.md Setup

