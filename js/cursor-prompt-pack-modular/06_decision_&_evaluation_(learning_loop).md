# Modul 06 — Decision & Evaluation (Learning Loop)
**Repo:** `Manu-Manera/manuel-weiss-website` • **Version:** 5.0 • **Zeitzone:** Europe/Zurich  
**Prinzip:** *Kein Test-/Demo-Daten-Einsatz. Nur echte Quellen/Provider. Serverseitige Secrets.*

---
# Repo-Ausrichtung & Pfade
- `lambda/evaluation/`, Routen `/decision`, `/evaluate`, Tabellen `outcomes`, `proposals`

# Smart Prompt – Implementierung (für Cursor)
> **An Cursor – Implementierung:**  
- **storeDecision**: Approve/Reject/Comment + Audit (User, Zeit, Hash).  
- **evaluateOutcomes**: Nach `horizon_days` echte Preise holen; `pnl_pct`, `hit`, `breaches` berechnen; in `outcomes`.  
- **autoTuning**: Thompson Sampling für A/B‑Arme; Kalibrierung (Platt/Isotonic) optional; Canary‑Guardrails.  
- **Exporte**: S3/backtests (CSV/Parquet).

# Zusätzliche Verbesserungen (production‑grade)
- **Bitemporalität** strikt: `published_at` vs `seen_at`.  
- **Do‑Not‑Learn‑Liste** (Fehlerfälle/Outages ausschließen).  
- **Kostenbereinigung** (Fees/Slippage/LLM‑Kosten).

# Fehlervermeidung – Was schiefgehen kann & Gegenmaßnahmen
- **Leakage** (falsche Zeitachsen).  
  **Fix:** Bitemporal validation & Purge windows.  
- **Autotuning verschlechtert Qualität**.  
  **Fix:** Canary‑Quota, Rollback bei KPI‑Drop.

# Akzeptanzkriterien (Definition of Done)
- Outcome‑Labels korrekt; Autotuning sicher; Exporte vorhanden.

# Build/Test-Gates & Verifikation (ausführen)
Live‑Preisabruf (real Provider) OK; KPI‑Monitoring sichtbar.

# Artefakte & Deliverables
- `lambda/evaluation/*`, README (Zeitachsen/Labels)

