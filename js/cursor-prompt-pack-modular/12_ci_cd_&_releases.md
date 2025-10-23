# Modul 12 — CI/CD & Releases (OPTIMIERT)
**Repo:** `Manu-Manera/manuel-weiss-website` • **Version:** 5.0 • **Zeitzone:** Europe/Zurich  
**Prinzip:** *Kein Test-/Demo-Daten-Einsatz. Nur echte Quellen/Provider. Serverseitige Secrets.*
**Ziel:** Production-ready CI/CD Pipeline mit automatisierten Deployments und Release Management

---
# Repo-Ausrichtung & Pfade (ERWEITERT)
- **GitHub Workflows:** `.github/workflows/` mit CI, Deploy, Release
- **CI Pipeline:** `.github/workflows/ci.yml` für Lint, Build, Test
- **Deploy Pipeline:** `.github/workflows/deploy.yml` für Staging und Production
- **Release Pipeline:** `.github/workflows/release.yml` für Versioning und Changelog
- **Scripts:** `scripts/` mit Deployment-Helpers und Smoke-Tests

# Smart Prompt – Implementierung (FÜR CURSOR - OPTIMIERT)
> **An Cursor – Production CI/CD Pipeline implementieren (Deutsch):**  

## PHASE 1: CI Pipeline (ERWEITERT)
### **GitHub Actions CI Workflow:**
```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '18.x'
  PRODUCTION_DATA_ONLY: '1'

jobs:
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Run TypeScript type check
        run: npm run type-check
      
      - name: Run Prettier check
        run: npm run format:check

  security:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run npm audit
        run: npm audit --audit-level=moderate
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      
      - name: Run OWASP Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'AI-Investment-System'
          path: '.'
          format: 'HTML'

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, security]
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build project
        run: npm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: |
            dist/
            build/
          retention-days: 7

  test-unit:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: [build]
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-artifacts
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unit
          name: unit-tests

  test-integration:
    name: Integration Tests
    runs-on: ubuntu-latest
    needs: [build]
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-artifacts
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: eu-central-1
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: integration
          name: integration-tests

  test-e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: [build]
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-artifacts
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          BASE_URL: ${{ secrets.STAGING_URL }}
          API_KEY: ${{ secrets.STAGING_API_KEY }}
      
      - name: Upload Playwright report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

  cdk-synth:
    name: CDK Synth
    runs-on: ubuntu-latest
    needs: [test-unit, test-integration]
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: CDK Synth
        run: npx cdk synth
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: eu-central-1
      
      - name: Upload CDK artifacts
        uses: actions/upload-artifact@v3
        with:
          name: cdk-artifacts
          path: cdk.out/
          retention-days: 7
```

## PHASE 2: Deploy Pipeline (ERWEITERT)
### **GitHub Actions Deploy Workflow:**
```yaml
# .github/workflows/deploy.yml
name: Deploy Pipeline

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        type: choice
        options:
          - staging
          - production
      skip_tests:
        description: 'Skip tests (emergency only)'
        required: false
        type: boolean
        default: false

env:
  NODE_VERSION: '18.x'
  PRODUCTION_DATA_ONLY: '1'

jobs:
  pre-deploy-checks:
    name: Pre-Deploy Checks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Check secrets
        run: |
          if [ -z "${{ secrets.AWS_ACCESS_KEY_ID }}" ]; then
            echo "AWS_ACCESS_KEY_ID is not set"
            exit 1
          fi
          if [ -z "${{ secrets.AWS_SECRET_ACCESS_KEY }}" ]; then
            echo "AWS_SECRET_ACCESS_KEY is not set"
            exit 1
          fi
      
      - name: Validate environment
        run: |
          if [ "${{ github.event.inputs.environment }}" != "staging" ] && [ "${{ github.event.inputs.environment }}" != "production" ]; then
            echo "Invalid environment: ${{ github.event.inputs.environment }}"
            exit 1
          fi

  deploy-data-stack:
    name: Deploy Data Stack
    runs-on: ubuntu-latest
    needs: [pre-deploy-checks]
    environment:
      name: ${{ github.event.inputs.environment }}
      url: https://${{ github.event.inputs.environment }}.manuel-weiss.com
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Deploy Data Stack
        run: npx cdk deploy DataStack --require-approval never
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: eu-central-1
          ENVIRONMENT: ${{ github.event.inputs.environment }}

  deploy-auth-stack:
    name: Deploy Auth Stack
    runs-on: ubuntu-latest
    needs: [deploy-data-stack]
    environment:
      name: ${{ github.event.inputs.environment }}
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Deploy Auth Stack
        run: npx cdk deploy AuthStack --require-approval never
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: eu-central-1
          ENVIRONMENT: ${{ github.event.inputs.environment }}

  deploy-compute-stack:
    name: Deploy Compute Stack
    runs-on: ubuntu-latest
    needs: [deploy-auth-stack]
    environment:
      name: ${{ github.event.inputs.environment }}
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Deploy Compute Stack
        run: npx cdk deploy ComputeStack --require-approval never
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: eu-central-1
          ENVIRONMENT: ${{ github.event.inputs.environment }}

  deploy-api-stack:
    name: Deploy API Stack
    runs-on: ubuntu-latest
    needs: [deploy-compute-stack]
    environment:
      name: ${{ github.event.inputs.environment }}
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Deploy API Stack
        run: npx cdk deploy ApiStack --require-approval never
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: eu-central-1
          ENVIRONMENT: ${{ github.event.inputs.environment }}

  deploy-observability-stack:
    name: Deploy Observability Stack
    runs-on: ubuntu-latest
    needs: [deploy-api-stack]
    environment:
      name: ${{ github.event.inputs.environment }}
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Deploy Observability Stack
        run: npx cdk deploy ObservabilityStack --require-approval never
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: eu-central-1
          ENVIRONMENT: ${{ github.event.inputs.environment }}

  smoke-tests:
    name: Smoke Tests
    runs-on: ubuntu-latest
    needs: [deploy-observability-stack]
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run smoke tests
        run: npm run test:smoke
        env:
          BASE_URL: https://${{ github.event.inputs.environment }}.manuel-weiss.com
          API_KEY: ${{ secrets.API_KEY }}
      
      - name: Notify on failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Smoke tests failed for ${{ github.event.inputs.environment }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}

  rollback-on-failure:
    name: Rollback on Failure
    runs-on: ubuntu-latest
    needs: [smoke-tests]
    if: failure()
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Rollback deployment
        run: ./scripts/rollback.sh ${{ github.event.inputs.environment }}
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: eu-central-1
```

## PHASE 3: Release Pipeline (ERWEITERT)
### **GitHub Actions Release Workflow:**
```yaml
# .github/workflows/release.yml
name: Release Pipeline

on:
  push:
    tags:
      - 'v*.*.*'

env:
  NODE_VERSION: '18.x'

jobs:
  create-release:
    name: Create Release
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Generate changelog
        run: npx conventional-changelog-cli -p angular -i CHANGELOG.md -s
      
      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          body_path: CHANGELOG.md
          draft: false
          prerelease: false
      
      - name: Notify team
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'New release ${{ github.ref }} created'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

**`ci.yml`:** Lint → Build → Live Tests → CDK Synth → Artifacts.
**`deploy.yml`:** Manuell/Tag, Reihenfolge Data→Auth→Compute→Api→Observability, Approval Gate.
**Conventional Commits,** Auto-Changelog, Release Notes.
**Smoke-Tests** nach Deploy (echte Endpoints).

# Zusätzliche Verbesserungen (PRODUCTION-GRADE - OPTIMIERT)
- **Canary Deploy** für Orchestrator-Änderungen
- **Rollback-Plan** (Tag/Release) dokumentieren
- **Blue-Green Deployment** für Zero-Downtime
- **Feature Flags** für graduelle Rollouts
- **Automated Rollback** bei Fehler-Schwellwerten
- **Performance Monitoring** während Deployment
- **Cost Tracking** für Deployment-Kosten
- **Deployment Notifications** über Slack/Email

# Fehlervermeidung – Was schiefgehen kann & Gegenmaßnahmen (ERWEITERT)
- **Secrets fehlen** in CI.  
  **Fix:** Vor Job Start prüfen & failen, nicht mocken, Secret Validation
- **Race Conditions** zwischen Stacks.  
  **Fix:** Sequenz & `needs` in Workflows, Dependency Management
- **Deployment Failures** → System Downtime.  
  **Fix:** Automated Rollback, Health Checks, Canary Deployment
- **Configuration Drift** → Inconsistent State.  
  **Fix:** Infrastructure as Code, State Management, Drift Detection
- **Cost Explosions** → Budget Overruns.  
  **Fix:** Cost Monitoring, Budget Alerts, Resource Tagging
- **Security Vulnerabilities** → Compromised System.  
  **Fix:** Security Scanning, Dependency Audits, Penetration Testing

# Akzeptanzkriterien (Definition of Done - ERWEITERT)
- Deterministische Builds; Smoke grün; Approval aktiv
- **CI Pipeline** vollständig implementiert und getestet
- **Deploy Pipeline** mit Approval Gates und Rollback
- **Release Pipeline** mit automatischer Changelog-Generierung
- **Security Scanning** in CI integriert
- **Performance Tests** vor Production Deploy
- **Smoke Tests** nach jedem Deployment
- **Monitoring & Alerting** für Deployments
- **Documentation** vollständig und aktuell

# Build/Test-Gates & Verifikation (AUSFÜHREN - OPTIMIERT)
```bash
# CI Pipeline Tests
./scripts/ci:lint
./scripts/ci:build
./scripts/ci:test

# Deploy Pipeline Tests
./scripts/deploy:staging
./scripts/deploy:production

# Release Pipeline Tests
./scripts/release:create
./scripts/release:publish

# Smoke Tests
./scripts/test:smoke:staging
./scripts/test:smoke:production

# Rollback Tests
./scripts/deploy:rollback:staging
./scripts/deploy:rollback:production
```

# Artefakte & Deliverables (ERWEITERT)
- **CI-YAMLs** (ci.yml, deploy.yml, release.yml)
- **CHANGELOG.md Setup** mit Conventional Commits
- **Deployment Scripts** (deploy.sh, rollback.sh, smoke-tests.sh)
- **Documentation** (CI/CD Guide, Deployment Procedures, Rollback Procedures)
- **Monitoring Setup** (Deployment Metrics, Alerts, Dashboards)
- **Security Reports** (Vulnerability Scans, Dependency Audits)
- **Performance Reports** (Deployment Performance, Resource Usage)
- **Cost Analysis** (Deployment Costs, Resource Costs)

