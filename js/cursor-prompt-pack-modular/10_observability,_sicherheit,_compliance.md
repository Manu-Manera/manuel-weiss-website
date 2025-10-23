# Modul 10 — Observability, Sicherheit, Compliance
**Repo:** `Manu-Manera/manuel-weiss-website` • **Version:** 5.0 • **Zeitzone:** Europe/Zurich  
**Prinzip:** *Kein Test-/Demo-Daten-Einsatz. Nur echte Quellen/Provider. Serverseitige Secrets.*

---
# Repo-Ausrichtung & Pfade
- CDK Stacks + Lambda Middleware + UI Banner

# Smart Prompt – Implementierung (für Cursor)
> **An Cursor – Implementierung:**  
- Structured JSON Logs (reqId, userId, module, costTokens).  
- Metriken (Latency/Error/Cost) + CloudWatch Dashboards.  
- Alarme: 5xx Spike, p95 Latenz, DLQ>0, Kostenbudget.  
- IAM Least Privilege; Secrets‑Rotation (KMS/Secrets Manager).  
- DSGVO: Pseudonymisierung, Export/Delete‑Flow; UI‑Disclaimer.
- API‑Edge: Schema‑Validation, Rate‑Limits, Auth.

# Zusätzliche Verbesserungen (production‑grade)
- **Trace‑IDs** über alle Ebenen propagieren.  
- **Cost‑Guard** pro Route, Hard‑Cap + Soft‑Warnungen.

# Fehlervermeidung – Was schiefgehen kann & Gegenmaßnahmen
- **Übersehenes PII** in Logs.  
  **Fix:** Redaction‑Middleware; Log‑Sampler.  
- **Alarm‑Flut**.  
  **Fix:** Deduplication & Quiet‑Hours.

# Akzeptanzkriterien (Definition of Done)
- Alarme auslösbar; Logs vollständig; Policies minimal; Banner aktiv.

# Build/Test-Gates & Verifikation (ausführen)
Probealarme manuell triggern; Policy‑Linter; Kosten‑Dashboard prüfbar.

# Artefakte & Deliverables
- CDK/Code & `docs/operations.md` (Alarme & Runbooks)

