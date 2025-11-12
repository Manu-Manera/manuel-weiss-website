# Cursor Runner – Modul‑Sequenz (OPTIMIERT - nur echte Daten)

**Regeln (global - ERWEITERT):**
- `PRODUCTION_DATA_ONLY=1` erzwingen; bei fehlenden Keys **Abbruch** mit Meldung.
- **Keine** Mocks/Fixtures/Sample‑JSON im Repo zulassen (Lint‑Guard).
- Nach **jedem** Modul: *bauen → live testen → korrigieren → dokumentieren → committen*. Erst bei „grün" weiter.
- **Security-First**: Alle API-Keys nur serverseitig, Client-Side Scanning aktiviert.
- **Performance-Monitoring**: Jedes Modul mit Performance-Benchmarks.
- **Accessibility**: WCAG 2.1 AA Compliance für alle UI-Komponenten.
- **Internationalization**: Deutsche/Englische Lokalisierung vollständig.

## PHASE 1: Foundation & Infrastructure
**Ablauf (OPTIMIERT):**  
0) **`00_repo-audit_&_integrationsplan.md`** → Vollständige Repo-Analyse, Admin Panel Integration, Security Audit. Gate: OK.  
1) **`01_infrastruktur_(aws_cdk,_ts).md`** → CDK synth/diff, Multi-Region Setup, Security Hardening. Gate: OK.  
2) **`02_common_package_(schemas_&_utils).md`** → Build/Tests, Type-Safety, Performance Benchmarks. Gate: OK.

## PHASE 2: Core AI Investment System
3) **`03_ingestion_(social,_news_–_echte_quellen).md`** → Live-Smoketests, Rate-Limiting, Data Quality. Gate: OK.  
4) **`04_scoring_&_fusion.md`** → Live Checks, Model Validation, Performance Metrics. Gate: OK.  
5) **`05_orchestrator_&_risiko.md`** → Stress-Checks, Risk Validation, Compliance Checks. Gate: OK.  
6) **`06_decision_&_evaluation_(learning_loop).md`** → Live-Preise, Learning Validation, Outcome Tracking. Gate: OK.

## PHASE 3: API & Integration
7) **`07_api_(openapi_&_client).md`** → Smoke Tests, API Documentation, Client Generation. Gate: OK.  
8) **`08_admin‑ui_(dashboard_&_ux).md`** → E2E live, A11y Tests, Responsive Design. Gate: OK.  
9) **`09_streaming_(sse_ws).md`** → Event‑Storm, Real-time Performance, Connection Management. Gate: OK.

## PHASE 4: Production & Monitoring
10) **`10_observability,_sicherheit,_compliance.md`** → Probealarme, Security Tests, Compliance Validation. Gate: OK.  
11) **`11_tests_(live_only).md`** → Comprehensive Test Suite, Performance Tests, Security Tests. Gate: OK.  
12) **`12_ci_cd_&_releases.md`** → CI grün, Automated Deployment, Rollback Testing. Gate: OK.

## PHASE 5: Documentation & Optimization
13) **`13_dokumentation_&_runbooks.md`** → Review, User Guides, Troubleshooting. Gate: OK.  
14) **`14_backtesting_(optional,_echte_historische_apis).md`** → Beispiel‑Run, Historical Validation, Performance Analysis. Gate: OK.

## PHASE 6: Admin Panel Integration (NEU)
15) **Admin Panel Integration** → AI Investment Dashboard, Real-time Updates, User Management. Gate: OK.

**Wenn ein Gate rot ist (ERWEITERT):**  
- **Fehleranalyse** durchführen (Logs/Stacks), **minimal‑invasiv fixen**, wiederholen.  
- Bei API/Infra‑Änderungen → Doku & OpenAPI synchronisieren.  
- Commit‑Nachricht erklärt **warum** (Root‑Cause).
- **Performance Impact** bewerten und dokumentieren.
- **Security Implications** prüfen und dokumentieren.
- **User Experience Impact** bewerten.

**UX/Compliance (ERWEITERT):**  
- Admin‑UI: A11y, Shortcuts, Dark/Light, Europe/Zurich + UTC Tooltip.  
- Disclaimer Banner: „Research/Simulation, keine Anlageberatung".  
- DSGVO: Pseudonymisierung, Export/Delete Flows.
- **Performance**: Lighthouse Score > 90, Core Web Vitals optimiert.
- **Security**: OWASP Top 10 Compliance, Penetration Testing.
- **Accessibility**: Screen Reader Support, Keyboard Navigation, High Contrast Mode.

## Zusätzliche Quality Gates (NEU)
- **Code Quality**: ESLint, Prettier, TypeScript strict mode.
- **Test Coverage**: >80% für kritische Business Logic.
- **Performance**: Response Times < 200ms für API Calls.
- **Security**: Vulnerability Scanning, Dependency Updates.
- **Documentation**: API Docs, User Guides, Troubleshooting.
- **Monitoring**: Health Checks, Alerts, Dashboards.
- **Backup**: Data Backup, Disaster Recovery, Business Continuity.

## Rollback Strategy (NEU)
- **Feature Flags** für schrittweise Rollouts.
- **Database Migrations** mit Rollback-Scripts.
- **API Versioning** für Backward Compatibility.
- **Monitoring** für automatische Rollbacks bei kritischen Fehlern.

## Deployment Strategy (NEU)
- **Blue-Green Deployment** für Zero-Downtime Updates.
- **Canary Releases** für schrittweise Rollouts.
- **Feature Toggles** für A/B Testing.
- **Monitoring & Alerting** für automatische Rollbacks.

## Compliance & Security (NEU)
- **DSGVO Compliance**: Data Protection, Right to be Forgotten, Data Portability.
- **SOC2 Type II**: Security, Availability, Processing Integrity.
- **ISO 27001**: Information Security Management.
- **Penetration Testing**: Quarterly Security Assessments.
- **Vulnerability Management**: Automated Scanning, Patch Management.

## Performance Optimization (NEU)
- **Lighthouse CI**: Automated Performance Testing.
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1.
- **Bundle Optimization**: Code Splitting, Tree Shaking, Compression.
- **CDN Integration**: Global Content Delivery.
- **Caching Strategy**: Redis, Browser Caching, API Caching.

## Monitoring & Observability (NEU)
- **Application Performance Monitoring**: New Relic, DataDog, or similar.
- **Error Tracking**: Sentry oder ähnlich.
- **Log Aggregation**: ELK Stack oder CloudWatch.
- **Metrics Collection**: Prometheus, Grafana.
- **Alerting**: PagerDuty, Slack, Email Notifications.

## Business Continuity (NEU)
- **Disaster Recovery**: RTO < 4h, RPO < 1h.
- **Backup Strategy**: Daily Backups, Cross-Region Replication.
- **Incident Response**: Runbooks, Escalation Procedures.
- **Communication**: Status Page, Customer Notifications.
