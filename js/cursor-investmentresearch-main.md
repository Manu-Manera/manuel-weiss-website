
# Cursor Prompt Pack – **Investment‑Research** (AWS, Multi‑Agent) – *Repo‑spezifisch & produktionsfokussiert*
**Repo:** `Manu-Manera/manuel-weiss-website`  
**Version:** 3.0  
**Prinzip:** *Keine Test- oder Demo-Daten. Nur echte Quellen, echte APIs, echte Ereignisse.*  
**Adminpanel:** Integration in `admin/sections/` (neue Sektion **AI Investments**) und bestehende `admin.html` Navigationsstruktur.  
**Backends:** `lambda/`, `netlify/functions/` (Proxy/Fallback), `infrastructure/` (AWS CDK).

> Quelle/Repo-Struktur (verifiziert): Top-Level-Verzeichnisse u. a. `.github/workflows/`, `admin/sections/`, `amplify/backend/`, `apps/web/`, `backend/`, `components/`, `docs/`, `infrastructure/`, `js/`, `lambda/`, `netlify/functions/`, `src/`, `tests/`, `translations/`. Live‑URL‑Hinweise, Key‑Ladepfade (u. a. Adminpanel) in Repo‑Doku vorhanden.  
> Live‑Hosting laut Doku: Netlify (Primär), GitHub Pages (Backup). OpenAI‑Key bisher teils clientseitig (localStorage/sessionStorage/Adminpanel/Dialog/JSON). **Wir verschieben Nutzung strikt serverseitig.**

---

## Globaler Arbeitsmodus für Cursor (immer voranstellen)
- **Tooling übernehmen:** Node/PNPM/NPM aus Root ermitteln. Linting/Formatting, ESM, strikte TypeScript‑Typen.  
- **Modular bauen:** Infra ↔ Services ↔ API ↔ UI ↔ Tests ↔ Docs.  
- **Secrets nie im Frontend:** OpenAI‑Key **nur serverseitig** via `netlify/functions/openai-proxy.ts` **oder** AWS API Gateway + Lambda `llm-proxy`.  
- **Zod‑Validation** an allen API‑Rändern, JSON‑Logs strukturiert.  
- **UX:** modern, reduziert, Dark/Light, A11y, Keyboard‑Shortcuts.  
- **Produktionsdaten‑Garantie:** `PRODUCTION_DATA_ONLY=1` erzwingen; wenn echte Provider‑Keys fehlen → **hart failen** (klare Fehlermeldung), **keine** Fallback‑Mocks.

---

## Ziel‑Ordnerstruktur (repo‑konform)
```
/infrastructure                    # AWS CDK Stacks
/lambda
  /ingestion-social                # ingestSocial
  /ingestion-news                  # ingestNews
  /scoring                         # scoreSignals, fusionEnsemble
  /orchestrator                    # proposeTrades, riskCheck
  /evaluation                      # storeDecision, evaluateOutcomes, autoTuning
  /backtest                        # optional: echte historische Daten via Provider
/netlify/functions                 # openai-proxy, dashboard-stream (SSE/WS Fallback)
/api                               # openapi.yaml + Codegen
/packages/common                   # zod-schemas, types, logger, time, hash, aws, llm-adapter
/ui/admin/ai-investments           # neue Adminpanel-Sektion (eingehängt in admin/sections)
/tests                             # unit (logiknah), integration (live), e2e (live)
/docs                              # Architektur, Operations, API, UX, Compliance
```

---

# 0) **Repo‑Audit & Integrationsplan**
**Pfadbezug:** `docs/overview.md` erzeugen  
**PROMPT (an Cursor):**
```
Lies die Struktur des Repos (Root + Subpackages). Liste:
- Package-Manager, Node-Version, Build/Test/Lint-Skripte
- Adminpanel-Struktur in admin/sections/ und admin.html
- Bestehende Netlify Functions unter netlify/functions/
- Lambda-Ordner und vorhandene Backends
- CDK/Amplify in infrastructure/ und amplify/backend/
- Doku-Quellen in docs/

Erzeuge docs/overview.md mit:
1) Tech-Stack-Zusammenfassung und Deployziele (Netlify, Pages)
2) Integrationspunkte und neue Module (konkrete Pfade)
3) Migrationsplan für OpenAI-Key: ausschließlich serverseitig (Proxy/API), optional Secrets Manager
4) Tabelle: Tasks, Abhängigkeiten, Artefakte, Gate-Kriterien
5) Guardrails: PRODUCTION_DATA_ONLY=1, DSGVO, A11y, Logging
```
**Verbesserungen pro Modul (Audit):**
- Automatische **Package‑Manager‑Erkennung** (pnpm/yarn/npm) und Speicherung im Root‑Script `scripts/dev.sh`.  
- **Config‑Inventur** (z. B. `data/website-content.json`, `aws-config.json`) → Referenzen konsolidieren.  
- **Key‑Suchpfade** (localStorage/… aus Doku) markieren und **in UI deaktivieren** (nur Anzeige „serverseitig aktiv“).

**Akzeptanzkriterien:** Übersicht vollständig, Pfade aus Repo belegt, klare Sequenz, Rollen `viewer | analyst | approver` definiert.

---

# 1) **Infrastruktur – AWS CDK (TypeScript)**
**Pfadbezug:** `infrastructure/`  
**Stacks:** `DataStack`, `ApiStack`, `ComputeStack`, `AuthStack`, `ObservabilityStack`  
**PROMPT:**
```
Implementiere CDK (TS):
DataStack:
  - DynamoDB: signals_yyyymm, proposals, outcomes, agents_config, tracked_entities (PK/SK + GSIs)
  - S3: raw/, curated/, features/, backtests/, eval/ (Lifecycle + SSE-S3/KMS, Block Public Access)
  - optional: Timestream für Preise/PnL
ApiStack:
  - REST: /ingest/social, /ingest/news, /score, /propose, /risk/check, /decision, /evaluate, /dashboard/summary, /dashboard/stream
  - WS/SSE-Bridge
ComputeStack:
  - Lambda TS (Node 20, esbuild), SQS-DLQs, Reserved Concurrency
  - EventBridge Cron: Social * * * * * | News */5 * * * * | Evaluate @daily
AuthStack:
  - Cognito UserPool, Gruppen viewer/analyst/approver, JWT-Authorizer
ObservabilityStack:
  - CloudWatch Dashboards, Metriken, Alarme (5xx, p95, DLQ>0)

Artefakte: bin/app.ts, tsconfig, package.json, cdk.json; Outputs -> cdk-outputs.json
Docs: docs/infrastructure.md (bootstrap/deploy/diff/destroy, ENV Variablen)
IAM: Least Privilege Policies je Lambda
```
**Verbesserungen:**
- **KMS‑Key** zentral, mit Rotation, für S3 & (optional) Secrets Manager.  
- **API Versionierung** (`/v1/...`) + CORS tight.  
- **Throttling**/Burst‑Limits auf API‑Gateway Routen (DDoS/Cost Guard).  
- **Cost‑Dashboards** (AWS Budgets/Cost Explorer Hinweise in docs).

**Akzeptanzkriterien:** `cdk synth` & `cdk diff` sauber; Stacks klar getrennt; Policies minimal.

---

# 2) **Common Package – Schemas & Utils**
**Pfadbezug:** `packages/common/`  
**Inhalte:** `zod-schemas.ts`, `types.ts`, `logger.ts`, `time.ts`, `hash.ts`, `aws.ts`, `llm.ts`  
**PROMPT:**
```
Erstelle Schemas (Signal, Proposal, OutcomeLabel, API-DTOs), Logger (JSON), Time Utils (Europe/Zurich), Hash (Sim/MinHash), AWS-Helpers (Dynamo, S3), LLM-Adapter:
makeOpenAIClient({ source: 'adminpanel' | 'secretsManager', model: 'gpt-3.5-turbo' })

Alle Exports ESM + TS. README mit Beispielen.
```
**Verbesserungen:**
- **Response‑Envelope Standard** `{ ok, data?, error? }`.  
- **Error‑Taxonomie** (Retryable, Unauthorized, BadInput, UpstreamLimit).  
- **Cost‑Logger** (Tokens/Cost je LLM‑Call).  
- **Env‑Guard:** Wenn `PRODUCTION_DATA_ONLY=1` & keine Provider‑Keys → **throw** (abbrechen).

**Akzeptanzkriterien:** Build grün; **keine** `any` in Public APIs; LLM‑Adapter benutzt nur serverseitige Keys.

---

# 3) **Services – Ingestion (Social, News)**
**Pfadbezug:** `lambda/ingestion-social/`, `lambda/ingestion-news/`  
**PROMPT:**
```
ingestSocial:
  - Offizielle APIs: X/Twitter v2 (zugelassen), Reddit API, YouTube Data API (Transkripte), verifizierte Telegram Bots/Feeds (wenn TOS-konform).
  - NER (Ticker/Token/Personen), Language Normalize (de/en/fr).
  - First-Pass Scores (sentiment, relevance, novelty, credibilityPrior).
  - Idempotenz über event_id; Dedupe via Hash.
  - Rohdaten -> S3/raw/<yyyy/mm/dd/HH/>
  - Validierte Signals -> Dynamo signals_yyyymm (PK=asset#yyyymmdd, SK=ts#agent#sourceId)

ingestNews:
  - Quellen: IR-RSS, offizielle News-APIs/Feeds (lizenzkonform), Regulator‑Seiten.
  - Event-Ontologie: earnings, guidance, mna, downgrade, lawsuit, sec/finma/esma, hack, listing.
  - Gleiches Speicher- & Dedupe‑Verhalten.
API: /ingest/social, /ingest/news (POST)
```
**Verbesserungen:**
- **Publisher Trust‑Score** je Quelle (historische Korrektheit, Latency).  
- **Cross‑Lingual Embeddings** für bessere Dedupe/Ähnlichkeit.  
- **Rate‑Limit‑aware Fetching** (Backoff, Jitter).  
- **Recht/TOS:** Nur offizielle Endpunkte, keine Scrapes/Paywalls.

**Akzeptanzkriterien:** Reale Datenquellen eingebunden; kein Mock; Logs/Metriken vorhanden; Idempotenz verifiziert.

---

# 4) **Services – Scoring & Fusion**
**Pfadbezug:** `lambda/scoring/`  
**PROMPT:**
```
scoreSignals:
  - Agent-spezifische Features (social/news/macro/people)
  - Gewichte aus agents_config; Seeds für Determinismus
  - Konflikte markieren (z. B. Social ++ vs News --)

fusionEnsemble:
  - Transparenter Logit/GBDT (bevorzugt Logit) pro Asset
  - Feature-Attribution (Top-Features) zurückgeben
  - Ergebnis 'relevance_fused' persistieren
API: /score (POST)
```
**Verbesserungen:**
- **Kalibrierung** (Platt/Isotonic) in späterer Phase aktivierbar.  
- **Drift‑Checks** (Score‑Verteilungen, Populationsshift).  
- **A/B‑Arme** per agents_config (Bandit später nutzt sie).

**Akzeptanzkriterien:** Deterministisch, Attribution sichtbar, Konfliktflag greift.

---

# 5) **Services – Orchestrator & Risk**
**Pfadbezug:** `lambda/orchestrator/`  
**PROMPT:**
```
proposeTrades:
  - Aggregiert Top-Signale zu Proposal JSON (these, assets[], size_pct, horizon_days, entry, invalidate_if, explain, constraints_checked, status='proposed')

riskCheck:
  - VaR/CVaR, Vol-Targeting, Bucket-Caps (Krypto/US-Tech/Makro)
  - Rolling Betas (60/240), Liquidität (Vol/Spread Heuristik)
  - Contra-Pass: 3 Why-Not-Argumente → ggf. Size Reduktion / reject

Persistiere in proposals.
API: /propose (POST), /risk/check (POST)
```
**Verbesserungen:**
- **Cluster‑Risiko** (Sektoren/Styles/Korrelationen) mit Hard/Soft‑Caps.  
- **Szenario‑Engine** (Base/Bull/Bear) → UI‑Explain konsistent.  
- **Exit‑Regeln** (`invalidate_if`) verpflichtend (diszipliniert).

**Akzeptanzkriterien:** Vollständige Proposals, Risk‑Brüche korrekt erkannt, Explain‑Felder sinnvoll.

---

# 6) **Services – Decision & Evaluation (Learning Loop)**
**Pfadbezug:** `lambda/evaluation/`  
**PROMPT:**
```
storeDecision: Approve/Reject/Comment + Audit (User, Zeit, Hash)
evaluateOutcomes: nach horizon_days Preise über echten Provider holen; pnl_pct, hit, breaches -> outcomes
autoTuning: Thompson Sampling auf A/B-Arme, Kalibrierung (Platt/Isotonic) optional
Exports: S3/backtests (CSV/Parquet)
API: /decision (POST), /evaluate (POST/cron)
```
**Verbesserungen:**
- **Bitemporalität** strikt (published_at vs seen_at).  
- **Do‑Not‑Learn‑Liste** (Datenfehler/Outages ausschließen).  
- **Kostenbereinigt** (Fees/Slippage/LLM‑Kosten) für Nettoperf.

**Akzeptanzkriterien:** Echte Preisfeeds; Outcome korrekt; Autotuning nur mit Canary‑Schutz aktiv.

---

# 7) **API – OpenAPI & Client**
**Pfadbezug:** `api/openapi.yaml`, `packages/api-client/`  
**PROMPT:**
```
Erstelle OpenAPI (v1) mit allen Routen, $ref auf JSON-Schemas (aus Zod abgeleitet).
Codegen -> packages/api-client (openapi-typescript).
Client im UI verwenden (nur eigene API, kein direkter OpenAI-Aufruf).
```
**Verbesserungen:**
- **Idempotency‑Key** Header für write‑Ops.  
- **Fehlercodes** (4xx/5xx) + semantische Fehlerobjekte.  
- **Versionierung** (v1 → v2 Migrationspfad).

**Akzeptanzkriterien:** Lint-freies OpenAPI; Client baut; Smoke‑Tests grün.

---

# 8) **UI – Adminpanel (Dashboard & UX)**
**Pfadbezug:** `admin/sections/ai-investments/`  
**PROMPT:**
```
Tabs:
1) Live Signals (Virtualized, Filter, Dedupe-Badge, Zeit-Tooltip)
2) Proposals (Approve=A, Reject=R, Details=D; Drawer mit Why/Why-Not/Szenarien/Risiko)
3) Risk & Limits (VaR/CVaR Gauge, Bucket-Exposures, Corr-Heatmap)
4) Learning (Hitrate 7/30/90, Sharpe, Reliability, Prompt-A/B)
5) Agent Health (p95, Error-Rate, Kosten/1k Signals)

Design: Clean, Dark/Light, ARIA, Shortcuts, Skelett-Loader, Empty-States.
Datenbezug: ausschließlich über /packages/api-client.
```
**Verbesserungen:**
- **What‑Changed‑Diff** bei Re‑Scores.  
- **Explain‑Drawer** mit Quellen‑Links.  
- **Export** (CSV/PDF) + **Audit‑Trail** Einsicht.

**Akzeptanzkriterien:** Responsive, a11y‑Checks bestanden, Shortcuts funktionieren.

---

# 9) **Streaming (SSE/WS)**
**Pfadbezug:** `netlify/functions/dashboard-stream.ts` **oder** API‑Gateway WS  
**PROMPT:**
```
Events: signal.created, proposal.created|updated, risk.alert, eval.completed
Client: Backoff‑Reconnect, Offline‑Banner, Debounce/Cluster
Perf: Kein jank bei Event-Storm
```
**Verbesserungen:**
- **Replay‑Window** (letzte N Events on connect).  
- **Per‑User‑Filter** (Rollen‑basiert).

**Akzeptanzkriterien:** Flüssig, stabil, keine Dubletten.

---

# 10) **Observability, Sicherheit, Compliance**
**Pfadbezug:** CDK + Lambdas + UI Banner  
**PROMPT:**
```
Structured JSON Logging (reqId, userId), Metrics (Latency/Error/Cost), Tracing optional.  
Alarme: 5xx Spike, p95 Latenz, DLQ>0, Budget Warnung.
IAM Least Privilege.
PII/DSGVO: Pseudonymisierung, Export/Delete-Pfad.
Disclaimer Banner: Research/Simulation, keine Anlageberatung.
API-Edge Validation & Rate-Limit.
```
**Verbesserungen:**
- **Cost‑Guard** pro Route (Token/Preis‑Budget).  
- **Secrets‑Rotation** (KMS/Secrets Manager).  
- **Zeitzone** konsequent Europe/Zurich im UI.

**Akzeptanzkriterien:** Alarme testbar; Policies geprüft; Banner sichtbar.

---

# 11) **Tests – *Live only***
**Pfadbezug:** `tests/`  
**PROMPT:**
```
Unit-Tests für Logik (ohne Datenmocks).
Integration/E2E nur mit echten Datenquellen (Provider-Keys in CI Secrets).
Skip, wenn Keys fehlen (hart fail seit PRODUCTION_DATA_ONLY=1).
Golden-Checks basieren auf echten historischen Events (Provider-APIs).
```
**Verbesserungen:**
- **Live Smoke Suites** mit minimalem Call‑Budget (Respekt vor Rate‑Limits).  
- **Stabile Queries** (z. B. feste bekannte Earnings‑Events per Provider‑ID).  
- **Kein** LocalStack/Mockdaten.

**Akzeptanzkriterien:** Ein‑Klick CI Lauf grün mit realen Keys; keinerlei Mocks/Seed‑Daten.

---

# 12) **CI/CD & Releases**
**Pfadbezug:** `.github/workflows/`  
**PROMPT:**
```
ci.yml: Lint -> Build -> Tests (live) -> CDK Synth -> Artifacts
deploy.yml: manuell/tagbasiert; Reihenfolge Data->Auth->Compute->Api->Observability; Manual Approval
Release Notes: Conventional Commits + Auto-Changelog
Smoke-Tests nach Deploy (echte Endpoints)
```
**Verbesserungen:**
- **Canary Deploy** für Orchestrator‑Änderungen.  
- **Rollback‑Plan** (Tag/Release).

**Akzeptanzkriterien:** Deterministische Builds; Smoke grün; manuelle Approval‑Stufe.

---

# 13) **Dokumentation & Runbooks**
**Pfadbezug:** `docs/`  
**PROMPT:**
```
overview.md, infra.md, api.md, ui.md, operations.md, compliance.md, testing.md, contributing.md
Diagramme (Mermaid), Runbooks (Alarm→Diagnose→Lösung), DSGVO‑Prozesse.
```
**Verbesserungen:**
- **„First 24h“‑Checkliste** nach Go‑Live.  
- **Cost‑Playbook** (Budget‑Alarme interpretieren).

**Akzeptanzkriterien:** Vollständige Doku mit Cross‑Links.

---

# 14) **Optional – Backtesting (nur echte historische Quellen)**
**Pfadbezug:** `lambda/backtest/` + `ui/admin/ai-investments/backtests`  
**PROMPT:**
```
Szenario-Runner (Zeiträume/Assets), deterministische Seeds nur für Samplings (keine Mockdaten).  
Historische Preise/News aus echten Provider-APIs.  
Metriken: Sharpe, MaxDD, Breach-Rate. Reports in S3/backtests.
```
**Verbesserungen:**
- **Provider‑Abstraktion** für Preise (Polygon/Alpha Vantage/CoinAPI/Coinbase/Binance – nur offizielle Terms).  
- **UI‑Berichte** mit Download.

**Akzeptanzkriterien:** Reproduzierbar über echte Quellen, keine Seed‑JSONs.

---

## Preis/News/Social Provider – *Echt & lizenzkonform*
- **Preise:** z. B. Coinbase Exchange, Binance, Polygon.io, Alpha Vantage, CoinAPI (ENV: Provider‑Key/Secret, Region).  
- **News:** IR‑RSS, lizenzierte Feeds, Regulator‑Seiten, ggf. News‑APIs nach Vertrag.  
- **Social:** X/Twitter v2 (Achtung: Paid Tiers), Reddit API, YouTube Data.  
- **Wichtig:** **Keine Scrapes/Bypässe**. Nur Terms‑konforme Nutzung.

---

## Starke Produktions‑Guards (nie Testdaten)
- `PRODUCTION_DATA_ONLY=1` → *jede* Funktion prüft Provider‑Keys & erreicht echte Endpunkte; sonst **sofortiger Fehler**.  
- CI Secrets für Live‑Keys; E2E/Integration läuft **nur**, wenn Secrets gesetzt.  
- UI zeigt Warnung, wenn Live‑Daten deaktiviert wären (sollte nie passieren).  
- **CodeScanner**: Linter‑Rule verbietet Import/Benutzung von `__mocks__`, `fixtures`, `sample*.json`.

---

## UX‑Leitplanken (Adminpanel)
- **Tabs**: Live Signals, Proposals, Risk & Limits, Learning, Agent Health, (optional Backtests).  
- **Shortcuts**: `A` Approve, `R` Reject, `D` Details, `/` Suche.  
- **Explain‑Drawer**: „Why/Why‑Not“, Szenarien, Quellenlinks.  
- **Zeitformat**: Europe/Zurich (UTC Tooltip).  
- **Accessibility**: ARIA, Fokus‑Ringe, Skip‑Link.  
- **Performance**: Virtualized Lists > 200 Zeilen.

---

## Abschluss‑Gate je Modul (Kontroll‑Prompt)
```
Führe Build, Lint und alle Live-Tests aus.
Verifiziere: PRODUCTION_DATA_ONLY=1 aktiv, echte Provider-Keys vorhanden, keine Mock-Dateien im Code.
Behebe Fehler minimal-invasiv und wiederhole den Lauf.
Gib „OK“ nur aus, wenn alles grün ist.
```

---

## Disclaimer (UI)
> Inhalte sind **Research/Simulation** und **keine Anlageberatung**. Nutzung unterliegt den AGB der Datenanbieter & Regulatorik. DSGVO‑Hinweise verfügbar; Social‑Daten pseudonymisiert.

