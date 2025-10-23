# Modul 07 — API (OpenAPI & Client)
**Repo:** `Manu-Manera/manuel-weiss-website` • **Version:** 5.0 • **Zeitzone:** Europe/Zurich  
**Prinzip:** *Kein Test-/Demo-Daten-Einsatz. Nur echte Quellen/Provider. Serverseitige Secrets.*

---
# Repo-Ausrichtung & Pfade
- `api/openapi.yaml` + `packages/api-client/`

# Smart Prompt – Implementierung (für Cursor)
> **An Cursor – Implementierung:**  
- OpenAPI v1 mit `$ref` auf JSON‑Schemas (aus Zod generiert).  
- Codegen → `packages/api-client` (openapi-typescript).  
- Frontend nutzt **nur** diesen Client; keine direkten OpenAI‑Calls.

# Zusätzliche Verbesserungen (production‑grade)
- **Idempotency‑Key** Header.  
- Einheitliche Fehlerobjekte (code, message, details).  
- API‑Versionierung & Deprecation‑Policy.

# Fehlervermeidung – Was schiefgehen kann & Gegenmaßnahmen
- **Drift** zwischen Zod und OpenAPI.  
  **Fix:** JSON‑Schema direkt aus Zod exportieren; CI‑Check.  
- **CORS/Auth‑Fehler**.  
  **Fix:** Contract‑Tests mit Cognito‑JWT.

# Akzeptanzkriterien (Definition of Done)
- Lint‑freies OpenAPI; Client baut; Smoke gegen jede Route grün.

# Build/Test-Gates & Verifikation (ausführen)
Generate → Import im UI → eine Live‑Route testen.

# Artefakte & Deliverables
- `api/openapi.yaml`, `packages/api-client/*`

