# Modul 09 — Streaming (SSE/WS)
**Repo:** `Manu-Manera/manuel-weiss-website` • **Version:** 5.0 • **Zeitzone:** Europe/Zurich  
**Prinzip:** *Kein Test-/Demo-Daten-Einsatz. Nur echte Quellen/Provider. Serverseitige Secrets.*

---
# Repo-Ausrichtung & Pfade
- `netlify/functions/dashboard-stream.ts` **oder** API‑Gateway WS + UI‑Client

# Smart Prompt – Implementierung (für Cursor)
> **An Cursor – Implementierung:**  
- Server: SSE oder WebSocket Events: `signal.created`, `proposal.created|updated`, `risk.alert`, `eval.completed`.  
- Client: Backoff‑Reconnect, Offline‑Banner, Event‑Debounce/Clustering, Replay‑Window (letzte N).  
- Rollenbasierte Filterung (viewer/analyst/approver).

# Zusätzliche Verbesserungen (production‑grade)
- **Heartbeats** & Zeitdrift‑Check.  
- **Event‑Batching** bei hoher Frequenz.

# Fehlervermeidung – Was schiefgehen kann & Gegenmaßnahmen
- **Verbindungs‑Flapping**.  
  **Fix:** Exponentielles Backoff, Max‑Retries, Telemetrie.  
- **Duplikate** bei Reconnect.  
  **Fix:** Replay‑Window + de‑dup IDs.

# Akzeptanzkriterien (Definition of Done)
- Flüssig, stabil, keine Duplikate, UI bleibt performant.

# Build/Test-Gates & Verifikation (ausführen)
Event‑Storm Simulation (mit echten Backend‑Events).

# Artefakte & Deliverables
- Server‑ und Client‑Code, README

