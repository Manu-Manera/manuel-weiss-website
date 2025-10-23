# Modul 11 — Tests (live only)
**Repo:** `Manu-Manera/manuel-weiss-website` • **Version:** 5.0 • **Zeitzone:** Europe/Zurich  
**Prinzip:** *Kein Test-/Demo-Daten-Einsatz. Nur echte Quellen/Provider. Serverseitige Secrets.*

---
# Repo-Ausrichtung & Pfade
- `tests/` (Unit=logiknah; Integration/E2E=live)

# Smart Prompt – Implementierung (für Cursor)
> **An Cursor – Implementierung:**  
- **Unit:** reine Logik (Parser/Scoring/Risk‑Formeln) – ohne Datenmocks.  
- **Integration/E2E:** gegen echte Provider‑APIs & echte Backend‑Routen.  
- Wenn Keys fehlen und `PRODUCTION_DATA_ONLY=1` → **hart fail** mit klarer Meldung.

# Zusätzliche Verbesserungen (production‑grade)
- **Live‑Smoke Suites** mit striktem Call‑Budget (Rate‑Limits respektieren).  
- **Stabile Abfragen** (z. B. per Provider‑IDs bekannter Events).

# Fehlervermeidung – Was schiefgehen kann & Gegenmaßnahmen
- **Flaky durch Live‑Daten**.  
  **Fix:** Stabilere IDs/Zeiträume, Retries in Testclient.  
- **Kostenexplosion**.  
  **Fix:** Budget‑Limiter im Test‑Runner.

# Akzeptanzkriterien (Definition of Done)
- CI grün mit Live‑Keys; keine Mocks/Fixtures im Baum.

# Build/Test-Gates & Verifikation (ausführen)
`pnpm test:live` (mit ENV Keys); Coverage‑Report erzeugen.

# Artefakte & Deliverables
- Test‑Runner‑Skripte, README testing.md

