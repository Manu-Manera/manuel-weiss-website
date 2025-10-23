# AI Investment System - Infrastructure

## Übersicht

Dieses CDK-Projekt erstellt die komplette AWS-Infrastruktur für das AI Investment System. Die Infrastruktur ist in modulare Stacks aufgeteilt:

- **SecurityStack**: KMS Keys, Secrets Manager, IAM Roles
- **DataStack**: DynamoDB Tables, S3 Buckets, Timestream
- **AuthStack**: Cognito User Pool, Identity Pool, User Groups
- **ComputeStack**: Lambda Functions, SQS Queues, EventBridge Schedules
- **ApiStack**: API Gateway, WebSocket API, Usage Plans
- **ObservabilityStack**: CloudWatch Dashboard, Alarms, SNS Topics

## Voraussetzungen

- Node.js >= 18.0.0
- AWS CDK >= 2.100.0
- AWS CLI konfiguriert
- Docker (für Lambda Layers)

## Installation

```bash
# Dependencies installieren
npm install

# CDK Bootstrap (nur beim ersten Mal)
cdk bootstrap

# Infrastructure deployen
cdk deploy --all
```

## Stacks

### SecurityStack
- **KMS Key**: Verschlüsselung für alle Services
- **Secrets Manager**: API Keys und Credentials
- **IAM Roles**: Least Privilege Access

### DataStack
- **DynamoDB Tables**:
  - `ai-investment-signals`: Social Media und News Signale
  - `ai-investment-proposals`: Investment Proposals
  - `ai-investment-outcomes`: Evaluationsergebnisse
  - `ai-investment-agents-config`: Agent Konfigurationen
  - `ai-investment-tracked-entities`: Verfolgte Entitäten
- **S3 Buckets**:
  - `ai-investment-raw-data`: Rohdaten
  - `ai-investment-curated-data`: Aufbereitete Daten
  - `ai-investment-features`: ML Features
  - `ai-investment-backtests`: Backtesting Ergebnisse
  - `ai-investment-eval`: Evaluation Daten
- **Timestream**: Zeitreihen-Daten für Marktdaten

### AuthStack
- **Cognito User Pool**: Benutzerverwaltung
- **User Groups**: admin, analyst, approver, viewer
- **Identity Pool**: AWS Credentials für Benutzer
- **OAuth**: Authorization Code Grant, Implicit Grant

### ComputeStack
- **Lambda Functions**:
  - `ai-investment-ingest-social`: Social Media Ingestion
  - `ai-investment-ingest-news`: News Ingestion
  - `ai-investment-score`: ML Scoring
  - `ai-investment-orchestrator`: Investment Orchestration
  - `ai-investment-evaluation`: Outcome Evaluation
  - `ai-investment-streaming`: Real-time Streaming
- **SQS Queues**: Message Queues mit Dead Letter Queues
- **EventBridge**: Scheduled Events

### ApiStack
- **API Gateway**: REST API mit CORS, Authentication, Rate Limiting
- **WebSocket API**: Real-time Updates
- **Usage Plans**: API Key Management
- **Endpoints**:
  - `/health`: Health Check
  - `/metrics`: System Metrics
  - `/ingest/social`: Social Media Ingestion
  - `/ingest/news`: News Ingestion
  - `/score`: ML Scoring
  - `/propose`: Investment Proposals
  - `/risk/check`: Risk Assessment
  - `/decision`: Decision Management
  - `/evaluate`: Outcome Evaluation
  - `/dashboard/summary`: Dashboard Data
  - `/dashboard/stream`: Real-time Updates

### ObservabilityStack
- **CloudWatch Dashboard**: System Health, Performance, Costs
- **Alarms**: Error Rate, Latency, Throttling, DLQ, Cost Budget
- **SNS Topics**: Alert Notifications
- **Log Groups**: Lambda Logs mit Retention

## Konfiguration

### Environment Variables
```bash
export CDK_DEFAULT_ACCOUNT=123456789012
export CDK_DEFAULT_REGION=eu-central-1
```

### Context Values
```bash
# In cdk.json oder via CLI
cdk deploy --context projectName=ai-investment --context environment=prod
```

## Deployment

### Development
```bash
# Alle Stacks deployen
cdk deploy --all

# Einzelne Stacks deployen
cdk deploy ai-investment-security-dev
cdk deploy ai-investment-data-dev
cdk deploy ai-investment-auth-dev
cdk deploy ai-investment-compute-dev
cdk deploy ai-investment-api-dev
cdk deploy ai-investment-observability-dev
```

### Production
```bash
# Mit Production Context
cdk deploy --all --context environment=prod
```

## Monitoring

### CloudWatch Dashboard
- **URL**: Wird nach Deployment ausgegeben
- **Widgets**: System Health, Performance, Error Rate, Costs
- **Auto-Refresh**: 5 Minuten

### Alarms
- **High Error Rate**: > 5 Errors in 5 Minuten
- **High Latency**: > 10 Sekunden Average Duration
- **Throttling**: > 1 Throttle Event
- **DLQ Messages**: > 1 Message in Dead Letter Queue
- **Cost Budget**: > $100 Estimated Charges

### Logs
- **Retention**: 1 Monat
- **Log Groups**: Automatisch für alle Lambda Functions
- **Structured Logging**: JSON Format

## Security

### Encryption
- **KMS Key**: Customer Managed Key mit Rotation
- **S3**: Server-Side Encryption mit KMS
- **DynamoDB**: Encryption at Rest mit KMS
- **Secrets Manager**: Encrypted Secrets

### Access Control
- **IAM Roles**: Least Privilege Principle
- **Cognito**: Multi-Factor Authentication
- **API Gateway**: API Key + Cognito Authorization
- **VPC**: Private Subnets (falls konfiguriert)

### Compliance
- **GDPR**: Data Protection, Right to be Forgotten
- **SOC2**: Security, Availability, Processing Integrity
- **ISO27001**: Information Security Management

## Cost Optimization

### Lambda
- **Reserved Concurrency**: Für kritische Functions
- **Memory Optimization**: Basierend auf Usage
- **Timeout Optimization**: Minimale Timeouts

### DynamoDB
- **On-Demand**: Pay-per-Request
- **Auto-Scaling**: Automatische Kapazität
- **GSI**: Optimierte Indizes

### S3
- **Intelligent Tiering**: Automatische Storage-Klassen
- **Lifecycle Policies**: Glacier, Deep Archive
- **Compression**: Gzip für Text-Dateien

## Troubleshooting

### Häufige Probleme

1. **CDK Bootstrap fehlt**
   ```bash
   cdk bootstrap
   ```

2. **Permissions fehlen**
   ```bash
   aws sts get-caller-identity
   ```

3. **Stack Dependencies**
   ```bash
   cdk deploy --all
   ```

4. **Lambda Timeout**
   - Timeout in ComputeStack erhöhen
   - Memory Size optimieren

5. **API Gateway CORS**
   - CORS in ApiStack konfigurieren
   - Origins in defaultCorsPreflightOptions

### Debug Commands

```bash
# Stack Status
cdk list

# Diff anzeigen
cdk diff

# Synthesize
cdk synth

# Logs anzeigen
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/ai-investment

# Metrics anzeigen
aws cloudwatch get-metric-statistics --namespace AWS/Lambda --metric-name Duration
```

## Cleanup

```bash
# Alle Stacks löschen
cdk destroy --all

# Einzelne Stacks löschen
cdk destroy ai-investment-observability-dev
cdk destroy ai-investment-api-dev
cdk destroy ai-investment-compute-dev
cdk destroy ai-investment-auth-dev
cdk destroy ai-investment-data-dev
cdk destroy ai-investment-security-dev
```

**Warnung**: Einige Resources (S3 Buckets, DynamoDB Tables) haben `removalPolicy: RETAIN` und werden nicht automatisch gelöscht.

## Support

Bei Problemen:
1. CloudWatch Logs prüfen
2. CDK Diff ausführen
3. AWS Console prüfen
4. Documentation konsultieren
