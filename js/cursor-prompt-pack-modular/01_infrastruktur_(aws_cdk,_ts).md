# Modul 01 — Infrastruktur (AWS CDK, TS) (OPTIMIERT)
**Repo:** `Manu-Manera/manuel-weiss-website` • **Version:** 5.0 • **Zeitzone:** Europe/Zurich  
**Prinzip:** *Kein Test-/Demo-Daten-Einsatz. Nur echte Quellen/Provider. Serverseitige Secrets.*
**Ziel:** Production-ready AWS-Infrastruktur für AI Investment System mit optimaler Performance und Sicherheit

---
# Repo-Ausrichtung & Pfade (ERWEITERT)
- **Ziel:** `infrastructure/` mit modularen Stacks: `DataStack`, `ApiStack`, `ComputeStack`, `AuthStack`, `ObservabilityStack`, `SecurityStack`
- **Outputs:** `cdk-outputs.json`, `infrastructure-outputs.json`
- **Dokumentation:** `docs/infrastructure.md`, `docs/security.md`, `docs/deployment.md`
- **Monitoring:** CloudWatch Dashboards, Alarme, Cost-Budgets
- **Compliance:** DSGVO, SOC2, ISO27001 Vorbereitung

# Smart Prompt – Implementierung (FÜR CURSOR - OPTIMIERT)
> **An Cursor – CDK erstellen und härten (Deutsch):**  

## PHASE 1: Core Infrastructure Setup
### **DataStack (ERWEITERT):**
- **DynamoDB Tables:**
  - `signals_yyyymm` (Partition: asset#yyyymmdd, Sort: ts#agent#sourceId)
  - `proposals` (Partition: proposal_id, Sort: created_at)
  - `outcomes` (Partition: outcome_id, Sort: evaluated_at)
  - `agents_config` (Partition: agent_id, Sort: version)
  - `tracked_entities` (Partition: entity_type, Sort: entity_id)
  - **Global Secondary Indexes** für effiziente Queries
  - **Point-in-Time Recovery** aktiviert
  - **Encryption at Rest** mit KMS

- **S3 Buckets (Multi-Purpose):**
  - `raw-data/` (yyyy/mm/dd/HH Struktur)
  - `curated-data/` (processed/validated data)
  - `features/` (ML features, embeddings)
  - `backtests/` (historical analysis results)
  - `eval/` (model evaluation data)
  - **Lifecycle Policies:** Intelligent Tiering, Glacier, Deep Archive
  - **Block Public Access:** Strict
  - **Server-Side Encryption:** SSE-S3/KMS
  - **Versioning:** Enabled mit MFA Delete
  - **Access Logging:** CloudTrail Integration

- **Optional Timestream:**
  - Für Zeitreihen-Daten (Preise, Metriken)
  - **Retention Policies** für Cost-Optimierung
  - **Multi-Measure Records** für komplexe Daten

### **ApiStack (ERWEITERT):**
- **API Gateway REST v1:**
  - **Base Path:** `/v1`
  - **CORS:** Strict für Production
  - **Request/Response Validation**
  - **API Keys** für Rate Limiting
  - **Usage Plans** mit Quotas

- **Routen (Vollständig):**
  - `/ingest/social` (POST) - Social Media Data Ingestion
  - `/ingest/news` (POST) - News Data Ingestion
  - `/score` (POST) - Signal Scoring & Fusion
  - `/propose` (POST) - Trade Proposal Generation
  - `/risk/check` (POST) - Risk Assessment
  - `/decision` (POST) - Decision Management
  - `/evaluate` (POST) - Outcome Evaluation
  - `/dashboard/summary` (GET) - Dashboard Data
  - `/dashboard/stream` (GET) - Real-time Updates
  - `/health` (GET) - Health Check
  - `/metrics` (GET) - System Metrics

- **WebSocket Support:**
  - Real-time Updates für Dashboard
  - Connection Management
  - Message Broadcasting

### **ComputeStack (ERWEITERT):**
- **Lambda Functions (Node20/TypeScript/esbuild):**
  - **Reserved Concurrency** für Performance
  - **Provisioned Concurrency** für kritische Functions
  - **Memory/Timeout Optimization**
  - **Environment Variables** aus Secrets Manager
  - **VPC Configuration** für Database Access

- **SQS Queues mit DLQs:**
  - **Dead Letter Queues** für Error Handling
  - **Visibility Timeout** konfiguriert
  - **Message Retention** optimiert
  - **FIFO Queues** für kritische Messages

- **EventBridge Schedules:**
  - **Social Ingestion:** Minütlich (Rate: 1/minute)
  - **News Ingestion:** 5-Minuten (Rate: 1/5 minutes)
  - **Evaluation:** Täglich (Cron: 0 2 * * ? *)
  - **Cleanup Jobs:** Wöchentlich
  - **Backup Jobs:** Täglich

### **AuthStack (ERWEITERT):**
- **Cognito UserPool:**
  - **Multi-Factor Authentication** (MFA)
  - **Password Policy** (Komplexität, Rotation)
  - **Account Recovery** (Email/SMS)
  - **Admin Create User** für Onboarding

- **User Groups:**
  - `viewer` (Read-only Access)
  - `analyst` (Read/Write, Limited Admin)
  - `approver` (Full Access, Decision Rights)
  - `admin` (System Administration)

- **JWT Authorizer:**
  - **Token Validation** (Signature, Expiry)
  - **Role-based Access Control** (RBAC)
  - **API Gateway Integration**
  - **Custom Claims** für User Context

### **ObservabilityStack (ERWEITERT):**
- **CloudWatch Logs:**
  - **Structured Logging** (JSON Format)
  - **Log Retention** (30/90/365 Tage)
  - **Log Aggregation** für Analysis
  - **Log Insights** Queries

- **CloudWatch Metrics:**
  - **Custom Metrics** für Business Logic
  - **Performance Metrics** (Latency, Throughput)
  - **Error Rates** und **Success Rates**
  - **Cost Metrics** (Token Usage, API Calls)

- **Dashboards:**
  - **System Health** Dashboard
  - **Business Metrics** Dashboard
  - **Cost Analysis** Dashboard
  - **Security Events** Dashboard

- **Alarme (Erweitert):**
  - **5xx Error Spike** (>5% für 5 Minuten)
  - **p95 Latency** (>2s für 10 Minuten)
  - **DLQ Messages** (>0 für 1 Minute)
  - **Cost Budget** (>80% des Monatsbudgets)
  - **Security Events** (Failed Logins, Unauthorized Access)

### **SecurityStack (NEU):**
- **KMS Keys:**
  - **Data Encryption** für S3/DynamoDB
  - **Key Rotation** (jährlich)
  - **Cross-Region Replication**
  - **Access Policies** (Least Privilege)

- **Secrets Manager:**
  - **API Keys** (OpenAI, Twitter, Reddit, News APIs)
  - **Database Credentials**
  - **Third-party Tokens**
  - **Automatic Rotation** wo möglich

- **IAM Policies:**
  - **Least Privilege Principle**
  - **Resource-specific Permissions**
  - **Condition-based Access**
  - **Cross-account Access** (falls nötig)

## PHASE 2: Advanced Configuration
### **Performance Optimization:**
- **Lambda Layers** für gemeinsame Dependencies
- **Connection Pooling** für Database Access
- **Caching Strategy** (ElastiCache optional)
- **CDN Integration** (CloudFront)

### **Security Hardening:**
- **VPC Configuration** mit Private Subnets
- **Security Groups** (Minimal Open Ports)
- **Network ACLs** für zusätzliche Sicherheit
- **WAF Rules** für API Protection

### **Cost Optimization:**
- **Reserved Instances** für predictable workloads
- **Spot Instances** für batch processing
- **S3 Intelligent Tiering**
- **Lambda Cost Monitoring**

**Dokumentation erzeugen** → `docs/infrastructure.md`: 
- **Architektur-Diagramme** (Mermaid)
- **Deploy-Schritte** (`cdk bootstrap/deploy/diff/destroy`)
- **Environment Variables** und **Secrets**
- **Troubleshooting Guide**
- **Cost Estimation**
- **Security Checklist**

# Zusätzliche Verbesserungen (PRODUCTION-GRADE - OPTIMIERT)
- **Throttling/Burst Limits** auf API Routen (Cost Guard, Rate Limiting)
- **KMS-Key** zentral für S3 und Secrets (Rotation aktiviert, Cross-Region)
- **CORS** eng einstellen; API-Versionierung `/v1` zementieren
- **Multi-Region Deployment** für Disaster Recovery
- **Auto-Scaling** für Lambda Functions basierend auf Metriken
- **Cost Budgets** mit automatischen Alarmen
- **Security Scanning** (AWS Config, Security Hub)
- **Compliance Monitoring** (DSGVO, SOC2)

# Fehlervermeidung – Was schiefgehen kann & Gegenmaßnahmen (ERWEITERT)
- **Offene S3-Buckets** -> Datenschutzverletzung.  
  **Fix:** Block Public Access + SSE + Lifecycle + Access Logging + MFA Delete
- **Zu breite IAM-Policies** -> Sicherheitsrisiko.  
  **Fix:** Ressourcen-spezifische Rechte; Policy-Linter in CI; Least Privilege Audits
- **Fehlkonfigurierte CORS/Authorizer** -> UI kann API nicht nutzen.  
  **Fix:** Enge CORS; Postman-Smoke mit Cognito-JWT; Integration Tests
- **Lambda Cold Starts** -> Performance-Probleme.  
  **Fix:** Provisioned Concurrency; Lambda Layers; Connection Pooling
- **DynamoDB Throttling** -> Datenverlust.  
  **Fix:** Auto-Scaling; Reserved Capacity; Batch Operations
- **Cost Explosion** -> Budget-Überschreitung.  
  **Fix:** Cost Budgets; Resource Tagging; Automated Scaling
- **Security Vulnerabilities** -> Datenkompromittierung.  
  **Fix:** Regular Security Scans; Dependency Updates; Vulnerability Monitoring

# Akzeptanzkriterien (Definition of Done - ERWEITERT)
- `cdk synth` & `cdk diff` ohne Fehler
- Stacks getrennt & nachvollziehbar, Policies minimal
- `docs/infrastructure.md` vollständig mit Diagrammen
- **Security Audit** durchgeführt (AWS Config, Security Hub)
- **Performance Tests** erfolgreich (Load Testing, Stress Testing)
- **Cost Analysis** erstellt mit Budget-Projektionen
- **Disaster Recovery Plan** dokumentiert
- **Compliance Checklist** erfüllt (DSGVO, SOC2)
- **Monitoring & Alerting** vollständig konfiguriert

# Build/Test-Gates & Verifikation (AUSFÜHREN - OPTIMIERT)
```bash
# Infrastructure Validation
cdk synth && cdk diff

# Security Scanning
aws config describe-compliance-by-config-rule
aws securityhub get-findings

# Performance Testing
./scripts/test:performance:infrastructure

# Cost Analysis
./scripts/analyze:costs

# Compliance Check
./scripts/check:compliance
```

# Artefakte & Deliverables (ERWEITERT)
- `infrastructure/*` (CDK Stacks)
- `cdk-outputs.json`, `infrastructure-outputs.json`
- `docs/infrastructure.md` (Architektur, Deploy-Schritte)
- `docs/security.md` (Security Configuration)
- `docs/deployment.md` (Deployment Guide)
- **Security Report** (Vulnerability Assessment)
- **Performance Report** (Load Testing Results)
- **Cost Analysis** (Budget Projections)
- **Compliance Report** (DSGVO, SOC2)

# Empfohlene Projekt-Kommandos (OPTIMIERT)
```bash
# Development & Testing
pnpm -w build && npx cdk synth && npx cdk diff

# Security & Compliance
./scripts/security:audit
./scripts/compliance:check

# Performance & Cost
./scripts/performance:test
./scripts/cost:analyze

# Deployment
./scripts/deploy:staging
./scripts/deploy:production

# Monitoring
./scripts/monitoring:setup
./scripts/alerts:configure
```