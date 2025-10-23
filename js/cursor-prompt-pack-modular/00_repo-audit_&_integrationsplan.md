# Modul 00 — Repo-Audit & Integrationsplan (OPTIMIERT)
**Repo:** `Manu-Manera/manuel-weiss-website` • **Version:** 5.0 • **Zeitzone:** Europe/Zurich  
**Prinzip:** *Kein Test-/Demo-Daten-Einsatz. Nur echte Quellen/Provider. Serverseitige Secrets.*
**Ziel:** Vollständige Integration des AI Investment Systems in bestehende Website-Architektur

---
# Repo-Ausrichtung & Pfade (ERWEITERT)
- **Adminpanel:** `admin/sections/` (neue Sektion: `ai-investments/`), Navigation in `admin.html`/ähnlich.
- **Serverless:** `netlify/functions/` (Proxy, SSE/WS Fallback), **AWS:** `lambda/`, `infrastructure/` (CDK), `amplify/backend/` (falls genutzt).
- **API/Client:** `api/openapi.yaml` (neu), `packages/api-client/` (neu).
- **Shared:** `packages/common/` (neu) – Zod‑Schemas, Logger, LLM‑Adapter, AWS‑Helpers.
- **Tests:** `tests/` (Unit=logiknah; Integration/E2E=live).
- **CI/CD:** `.github/workflows/`.
- **Doku:** `docs/`.
- **AI Investment System:** `js/cursor-prompt-pack-modular/` (bestehend), Integration in Admin Panel

# Smart Prompt – Implementierung (FÜR CURSOR - OPTIMIERT)
> **An Cursor – Detaillierte Aufgaben (Deutsch):**  

## PHASE 1: Repository-Analyse & Mapping
1) **Vollständige Repo-Scan:**
   - Scanne das komplette Repository (Root + alle Subpackages)
   - Extrahiere **Node-Version** aus `.nvmrc`, `package.json`, `engines`
   - Identifiziere **Package-Manager** (npm/yarn/pnpm) aus Lockfiles
   - Dokumentiere alle **Build-Scripts** und **Deploy-Scripts**
   - Erstelle **Dependency-Map** aller verwendeten Frameworks

2) **Adminpanel-Integrationspunkte identifizieren:**
   - Analysiere `admin.html` und `admin-styles.css`
   - Finde alle Navigation-Punkte in `js/admin/components/admin-sidebar.js`
   - Identifiziere bestehende Section-Loader in `js/admin/sections/`
   - Dokumentiere aktuelle Routing-Logik in `js/admin/core/navigation.js`
   - Erstelle **Integrationsplan** für neue AI Investment Sektion

3) **Backend-Architektur mapping:**
   - Liste alle `netlify/functions/*` (Serverless Functions)
   - Analysiere `lambda/*` (AWS Lambda Functions)
   - Prüfe `infrastructure/*` (CDK/CloudFormation)
   - Untersuche `amplify/backend/*` (falls vorhanden)
   - Erstelle **Backend-Integration-Plan**

4) **Security & Key-Management Audit:**
   - Finde alle **API-Key-Ladepfade** im Frontend
   - Suche nach `localStorage`, `sessionStorage`, `OPENAI_API_KEY`
   - Identifiziere **Adminpanel-Formulare** mit Key-Eingaben
   - Prüfe **JSON-Konfigurationsdateien** auf hardcoded Keys
   - Erstelle **Security-Migration-Plan**

## PHASE 2: Dokumentation & Planung
5) **Erstelle `docs/overview.md` mit:**
   - **Tech-Stack Analyse:** React/Vanilla JS, Node.js Version, Build-Tools
   - **Deploy-Ziele:** Netlify/GitHub Pages, AWS Lambda, CDK
   - **Konkrete Integrationspunkte** mit exakten Pfaden
   - **Migrationsplan:** OpenAI/LLM nur serverseitig (Netlify Functions + AWS Secrets Manager)
   - **Guardrails:** `PRODUCTION_DATA_ONLY=1`, DSGVO-Compliance, A11y-Standards
   - **Task-Tabelle:** Modul, Ziel, Abhängigkeiten, Akzeptanzkriterien, Deliverables

6) **Erstelle `docs/checklists.md` mit:**
   - **Verbotsliste:** Keine Mocks/Fixtures/Sample-JSON im Repository
   - **Nur echte Provider:** Twitter API, Reddit API, News APIs, Finanz-APIs
   - **Security-Checklist:** Keys nur serverseitig, CORS-Konfiguration, Rate-Limiting
   - **Quality-Gates:** Linting, Testing, Performance-Metriken

7) **Clientseitige Key-Nutzung eliminieren:**
   - Erstelle **Patch-Plan** zur Deaktivierung aller clientseitigen API-Calls
   - Implementiere **Feature-Flags** für schrittweise Migration
   - Ersetze durch **Server-Proxy** über Netlify Functions
   - Erstelle **Migration-Guide** für Entwickler

## PHASE 3: AI Investment System Integration
8) **Admin Panel Integration:**
   - Erstelle neue Sektion `js/admin/sections/ai-investments.js`
   - Integriere in `admin-sidebar.js` Navigation
   - Erstelle **Dashboard-Widgets** für AI Investment System
   - Implementiere **Real-time Updates** via WebSocket/SSE

9) **Backend-Services Setup:**
   - Erstelle `netlify/functions/ai-investment-*` Functions
   - Setup AWS Lambda Functions für schwere Berechnungen
   - Implementiere **API Gateway** für AI Investment Endpoints
   - Erstelle **Database Schema** für Investment-Daten

10) **Security & Compliance:**
    - Implementiere **JWT-Authentication** für AI Investment APIs
    - Setup **Rate-Limiting** und **Cost-Controls**
    - Erstelle **Audit-Logs** für alle Investment-Entscheidungen
    - Implementiere **DSGVO-Compliance** für Finanzdaten

# Zusätzliche Verbesserungen (PRODUCTION-GRADE - OPTIMIERT)
- **Root-Script `scripts/dev.sh`** generieren: erkennt pnpm/yarn/npm automatisch und ruft passende Kommandos auf
- **Zentraler `.nvmrc`/Engines-Block** für einheitliche Node-Version
- **Projektweite ESLint/Prettier-Konfiguration** vereinheitlichen
- **Mermaid-Diagramme** für High-Level-Architektur in `docs/overview.md`
- **TypeScript-Konfiguration** für bessere Type-Safety
- **Performance-Monitoring** für Build-Zeiten und Bundle-Size
- **Accessibility-Tests** (axe-core) in CI/CD Pipeline
- **Security-Scanning** (npm audit, Snyk) automatisiert

# Fehlervermeidung – Was schiefgehen kann & Gegenmaßnahmen (ERWEITERT)
- **Problem:** Cursor rät Pfade und erzeugt Dateien am falschen Ort.  
  **Gegenmaßnahme:** Prompt verlangt **Code-Scan** vor Generierung; in der Doku **konkrete Pfade** referenzieren; **Path-Validation** in CI
- **Problem:** Versehentlich verbleibende clientseitige Key-Nutzung.  
  **Gegenmaßnahme:** Erzeuge **Code-Such-Check** (grep) nach `localStorage`, `sessionStorage`, `OPENAI_API_KEY` im FE; ersetze Stellen; **Pre-commit-Hooks**
- **Problem:** Uneinheitliche Package-Manager.  
  **Gegenmaßnahme:** Root-Script + CI-Check, der falsche Manager-Aufrufe blockiert; **Lockfile-Validation**
- **Problem:** Security-Vulnerabilities in Dependencies.  
  **Gegenmaßnahme:** **Automated Security-Scanning**, **Dependency-Updates**, **Vulnerability-Alerts**
- **Problem:** Performance-Regressionen.  
  **Gegenmaßnahme:** **Bundle-Size-Monitoring**, **Performance-Budgets**, **Lighthouse-CI**
- **Problem:** Accessibility-Issues.  
  **Gegenmaßnahme:** **axe-core Integration**, **Keyboard-Navigation-Tests**, **Screen-Reader-Tests**

# Akzeptanzkriterien (Definition of Done - ERWEITERT)
- `docs/overview.md` & `docs/checklists.md` vorhanden und repo-realistisch
- Liste aller Key-Nutzungen im Frontend dokumentiert; Migrationsplan liegt vor
- Tooling (Node/PM) sauber erkannt & dokumentiert
- **Security-Audit** durchgeführt und dokumentiert
- **Performance-Baseline** etabliert
- **Accessibility-Checklist** erfüllt
- **AI Investment System** erfolgreich in Admin Panel integriert
- **Real-time Dashboard** funktional
- **API-Endpoints** getestet und dokumentiert

# Build/Test-Gates & Verifikation (AUSFÜHREN - OPTIMIERT)
- `./scripts/dev.sh doctor` (optional): prüft Node/PM
- **Statischer Code-Scan:** FE-Key-Nutzung → 0 Treffer
- **Security-Scan:** npm audit, Snyk, OWASP ZAP
- **Performance-Test:** Lighthouse CI, Bundle-Analyzer
- **Accessibility-Test:** axe-core, Keyboard-Navigation
- **API-Test:** Postman/Newman Collection
- **E2E-Test:** Playwright/Cypress für kritische User-Flows
- **PR-Template** ergänzt (Checkliste: „nur serverseitige Secrets", Security, Performance, A11y)

# Artefakte & Deliverables (ERWEITERT)
- `docs/overview.md`, `docs/checklists.md`, `scripts/dev.sh`
- **Security-Report** mit Vulnerability-Assessment
- **Performance-Report** mit Baseline-Metriken
- **Accessibility-Report** mit WCAG-Compliance
- **API-Documentation** mit OpenAPI-Spec
- **Admin Panel Integration** mit AI Investment Dashboard
- **PR-Template Update** mit erweiterten Checklisten

# Empfohlene Projekt-Kommandos (OPTIMIERT)
```bash
# Development & Testing
./scripts/dev.sh doctor
./scripts/dev.sh test:security
./scripts/dev.sh test:performance
./scripts/dev.sh test:accessibility

# AI Investment System
./scripts/dev.sh ai:setup
./scripts/dev.sh ai:test
./scripts/dev.sh ai:deploy

# Full Pipeline
./scripts/dev.sh ci:full
./scripts/dev.sh deploy:staging
./scripts/dev.sh deploy:production
```