# Modul 14 — Backtesting (optional, echte historische APIs)
**Repo:** `Manu-Manera/manuel-weiss-website` • **Version:** 5.0 • **Zeitzone:** Europe/Zurich  
**Prinzip:** *Kein Test-/Demo-Daten-Einsatz. Nur echte Quellen/Provider. Serverseitige Secrets.*

---
# Repo-Ausrichtung & Pfade
- `lambda/backtest/`, `ui/admin/ai-investments/backtests/`

# Smart Prompt – Implementierung (für Cursor)
> **An Cursor – Implementierung:**  
- Runner für reale Zeitfenster/Assets; deterministische Seeds nur für Samplings (nicht für Daten).  
- Historische Preise/News über offizielle Provider‑APIs (Terms beachten).  
- Metriken: Sharpe, MaxDD, Breach‑Rate; Reports → S3/backtests.

# Zusätzliche Verbesserungen (production‑grade)
- **Provider‑Abstraktion** (Coinbase/Binance/Polygon).  
- **UI‑Berichte** mit Download (CSV/PDF).

# Fehlervermeidung – Was schiefgehen kann & Gegenmaßnahmen
- **Sampling‑Bias**/Leakage.  
  **Fix:** Zeitliche Isolation, Purge Windows.  
- **Rate‑Limit‑Exhaustion**.  
  **Fix:** Batch/Schedule, Budget‑Limiter.

# Akzeptanzkriterien (Definition of Done)
- Reproduzierbar; echte Quellen; Reports erzeugt.

# Build/Test-Gates & Verifikation (ausführen)
Ein Beispiel‑Run (kleines Fenster) mit Live‑Keys.

# Artefakte & Deliverables
- Backtest‑Lambda, UI‑Tab, S3‑Reports

