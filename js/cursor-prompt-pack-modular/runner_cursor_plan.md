# Cursor Runner – Modul‑Sequenz (nur echte Daten)

**Regeln (global):**
- `PRODUCTION_DATA_ONLY=1` erzwingen; bei fehlenden Keys **Abbruch** mit Meldung.
- **Keine** Mocks/Fixtures/Sample‑JSON im Repo zulassen (Lint‑Guard).
- Nach **jedem** Modul: *bauen → live testen → korrigieren → dokumentieren → committen*. Erst bei „grün“ weiter.

**Ablauf:**  
0) Öffne `00_repo-audit_&_integrationsplan.md` und führe den Prompt exakt aus. Gate: OK.  
1) `01_infrastruktur_(aws_cdk,_ts).md` → CDK synth/diff. Gate: OK.  
2) `02_common_package_(schemas_&_utils).md` → Build/Tests. Gate: OK.  
3) `03_ingestion_(social,_news_–_echte_quellen).md` → Live-Smoketests. Gate: OK.  
4) `04_scoring_&_fusion.md` → Live Checks. Gate: OK.  
5) `05_orchestrator_&_risiko.md` → Stress-Checks. Gate: OK.  
6) `06_decision_&_evaluation_(learning_loop).md` → Live-Preise. Gate: OK.  
7) `07_api_(openapi_&_client).md` → Smoke. Gate: OK.  
8) `08_admin‑ui_(dashboard_&_ux).md` → E2E live. Gate: OK.  
9) `09_streaming_(sse_ws).md` → Event‑Storm. Gate: OK.  
10) `10_observability,_sicherheit,_compliance.md` → Probealarme. Gate: OK.  
11) `11_tests_(live_only).md` + 12) `12_ci_cd_&_releases.md` → CI grün. Gate: OK.  
13) `13_dokumentation_&_runbooks.md` → Review. Gate: OK.  
14) `14_backtesting_(optional,_echte_historische_apis).md` → Beispiel‑Run. Gate: OK.

**Wenn ein Gate rot ist:**  
- **Fehleranalyse** durchführen (Logs/Stacks), **minimal‑invasiv fixen**, wiederholen.  
- Bei API/Infra‑Änderungen → Doku & OpenAPI synchronisieren.  
- Commit‑Nachricht erklärt **warum** (Root‑Cause).

**UX/Compliance:**  
- Admin‑UI: A11y, Shortcuts, Dark/Light, Europe/Zurich + UTC Tooltip.  
- Disclaimer Banner: „Research/Simulation, keine Anlageberatung“.  
- DSGVO: Pseudonymisierung, Export/Delete Flows.