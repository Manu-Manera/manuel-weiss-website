# AI Investment System - Runbooks

## Übersicht

Dieses Dokument enthält detaillierte Runbooks für die Wartung, Fehlerbehebung und den Betrieb des AI Investment Systems.

## Inhaltsverzeichnis

1. [System-Startup](#system-startup)
2. [Fehlerbehebung](#fehlerbehebung)
3. [Wartungsaufgaben](#wartungsaufgaben)
4. [Notfallverfahren](#notfallverfahren)
5. [Performance-Optimierung](#performance-optimierung)
6. [Sicherheitsverfahren](#sicherheitsverfahren)

## System-Startup

### Vollständiger System-Start

```bash
#!/bin/bash
# System Startup Script

echo "Starting AI Investment System..."

# 1. Environment prüfen
echo "Checking environment..."
if [ -z "$AWS_REGION" ]; then
    export AWS_REGION="eu-central-1"
fi

if [ -z "$ENVIRONMENT" ]; then
    export ENVIRONMENT="staging"
fi

# 2. AWS Credentials prüfen
echo "Checking AWS credentials..."
aws sts get-caller-identity || {
    echo "ERROR: AWS credentials not configured"
    exit 1
}

# 3. Dependencies installieren
echo "Installing dependencies..."
npm ci

# 4. Infrastruktur deployen
echo "Deploying infrastructure..."
npm run cdk:deploy:$ENVIRONMENT

# 5. Lambda Functions deployen
echo "Deploying Lambda functions..."
npm run deploy:lambda:$ENVIRONMENT

# 6. API Gateway konfigurieren
echo "Configuring API Gateway..."
npm run deploy:api:$ENVIRONMENT

# 7. Admin UI deployen
echo "Deploying Admin UI..."
npm run deploy:admin:$ENVIRONMENT

# 8. Health Checks
echo "Running health checks..."
npm run health:check:$ENVIRONMENT

echo "System startup completed successfully!"
```

### Schritt-für-Schritt Startup

#### Schritt 1: Environment Setup

```bash
# Environment Variables setzen
export AWS_REGION="eu-central-1"
export ENVIRONMENT="production"
export NODE_ENV="production"

# AWS Profile konfigurieren
aws configure set region $AWS_REGION
aws configure set output json
```

#### Schritt 2: Dependencies

```bash
# Node.js Version prüfen
node --version  # Sollte >= 18.0.0 sein

# Dependencies installieren
npm ci

# CDK installieren
npm install -g aws-cdk@latest
```

#### Schritt 3: Infrastruktur

```bash
# CDK Bootstrap (nur beim ersten Mal)
cdk bootstrap aws://$AWS_ACCOUNT_ID/$AWS_REGION

# Infrastruktur deployen
npm run cdk:deploy:$ENVIRONMENT

# Status prüfen
aws cloudformation describe-stacks --stack-name ai-investment-$ENVIRONMENT
```

#### Schritt 4: Services

```bash
# Lambda Functions deployen
npm run deploy:lambda:$ENVIRONMENT

# API Gateway konfigurieren
npm run deploy:api:$ENVIRONMENT

# Admin UI deployen
npm run deploy:admin:$ENVIRONMENT
```

#### Schritt 5: Verification

```bash
# Health Check
curl -f https://api.$ENVIRONMENT.ai-investment.com/health || {
    echo "Health check failed"
    exit 1
}

# Smoke Tests
npm run test:smoke:$ENVIRONMENT
```

## Fehlerbehebung

### Häufige Probleme

#### 1. Lambda Timeout

**Symptome:**
- Lambda-Funktionen schlagen mit Timeout-Fehlern fehl
- CloudWatch Logs zeigen "Task timed out"

**Diagnose:**
```bash
# Lambda Configuration prüfen
aws lambda get-function-configuration --function-name ai-investment-ingestion

# Logs analysieren
aws logs filter-log-events \
  --log-group-name "/aws/lambda/ai-investment-ingestion" \
  --start-time $(date -d '1 hour ago' +%s)000 \
  --filter-pattern "ERROR"
```

**Lösung:**
```bash
# Memory und Timeout erhöhen
aws lambda update-function-configuration \
  --function-name ai-investment-ingestion \
  --timeout 300 \
  --memory-size 1024
```

#### 2. DynamoDB Throttling

**Symptome:**
- DynamoDB-Operationen schlagen fehl
- CloudWatch Metriken zeigen Throttling

**Diagnose:**
```bash
# DynamoDB Metriken prüfen
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ThrottledRequests \
  --dimensions Name=TableName,Value=ai-investment-signals \
  --start-time $(date -d '1 hour ago' -u +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum
```

**Lösung:**
```bash
# Auto Scaling konfigurieren
aws application-autoscaling register-scalable-target \
  --service-namespace dynamodb \
  --resource-id table/ai-investment-signals \
  --scalable-dimension dynamodb:table:ReadCapacityUnits \
  --min-capacity 5 \
  --max-capacity 100
```

#### 3. API Gateway 5xx Errors

**Symptome:**
- API-Aufrufe schlagen fehl
- 5xx HTTP Status Codes

**Diagnose:**
```bash
# API Gateway Logs prüfen
aws logs filter-log-events \
  --log-group-name "/aws/apigateway/ai-investment" \
  --start-time $(date -d '1 hour ago' +%s)000 \
  --filter-pattern "5xx"
```

**Lösung:**
```bash
# API Gateway Caching aktivieren
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name production \
  --cache-cluster-enabled \
  --cache-cluster-size 0.5
```

#### 4. S3 Access Denied

**Symptome:**
- S3-Operationen schlagen fehl
- "Access Denied" Fehler

**Diagnose:**
```bash
# S3 Bucket Policy prüfen
aws s3api get-bucket-policy --bucket ai-investment-raw-data

# IAM Permissions prüfen
aws iam get-role-policy \
  --role-name LambdaExecutionRole \
  --policy-name S3Access
```

**Lösung:**
```bash
# S3 Bucket Policy aktualisieren
aws s3api put-bucket-policy \
  --bucket ai-investment-raw-data \
  --policy file://s3-policy.json
```

### Debugging Commands

#### Lambda Debugging

```bash
# Lambda Logs in Echtzeit
aws logs tail /aws/lambda/ai-investment-ingestion --follow

# Lambda Metriken
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --dimensions Name=FunctionName,Value=ai-investment-ingestion \
  --start-time $(date -d '1 hour ago' -u +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average,Maximum
```

#### DynamoDB Debugging

```bash
# DynamoDB Items abrufen
aws dynamodb scan --table-name ai-investment-signals --limit 10

# DynamoDB Kapazität prüfen
aws dynamodb describe-table --table-name ai-investment-signals
```

#### S3 Debugging

```bash
# S3 Bucket Inhalt auflisten
aws s3 ls s3://ai-investment-raw-data/ --recursive

# S3 Bucket Größe
aws s3 ls s3://ai-investment-raw-data/ --recursive --human-readable --summarize
```

## Wartungsaufgaben

### Tägliche Wartung

#### 1. System Health Check

```bash
#!/bin/bash
# Daily Health Check Script

echo "Running daily health check..."

# API Health Check
curl -f https://api.production.ai-investment.com/health || {
    echo "API Health Check failed"
    exit 1
}

# Lambda Health Check
aws lambda invoke \
  --function-name ai-investment-health-check \
  --payload '{}' \
  response.json

# DynamoDB Health Check
aws dynamodb describe-table --table-name ai-investment-signals

# S3 Health Check
aws s3 ls s3://ai-investment-raw-data/

echo "Health check completed successfully!"
```

#### 2. Log Rotation

```bash
#!/bin/bash
# Log Rotation Script

echo "Starting log rotation..."

# CloudWatch Logs Retention
aws logs put-retention-policy \
  --log-group-name "/aws/lambda/ai-investment-ingestion" \
  --retention-in-days 30

aws logs put-retention-policy \
  --log-group-name "/aws/lambda/ai-investment-scoring" \
  --retention-in-days 30

aws logs put-retention-policy \
  --log-group-name "/aws/lambda/ai-investment-orchestrator" \
  --retention-in-days 30

echo "Log rotation completed!"
```

### Wöchentliche Wartung

#### 1. Performance Review

```bash
#!/bin/bash
# Weekly Performance Review

echo "Running weekly performance review..."

# Lambda Performance
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --start-time $(date -d '7 days ago' -u +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Average,Maximum

# DynamoDB Performance
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedReadCapacityUnits \
  --start-time $(date -d '7 days ago' -u +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Sum

# S3 Performance
aws cloudwatch get-metric-statistics \
  --namespace AWS/S3 \
  --metric-name BucketSizeBytes \
  --start-time $(date -d '7 days ago' -u +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Average

echo "Performance review completed!"
```

#### 2. Security Audit

```bash
#!/bin/bash
# Weekly Security Audit

echo "Running weekly security audit..."

# IAM Policy Review
aws iam list-attached-role-policies --role-name LambdaExecutionRole

# S3 Bucket Security
aws s3api get-bucket-encryption --bucket ai-investment-raw-data

# DynamoDB Encryption
aws dynamodb describe-table --table-name ai-investment-signals

# CloudTrail Logs
aws logs filter-log-events \
  --log-group-name "CloudTrail" \
  --start-time $(date -d '7 days ago' +%s)000 \
  --filter-pattern "ERROR"

echo "Security audit completed!"
```

### Monatliche Wartung

#### 1. Cost Optimization

```bash
#!/bin/bash
# Monthly Cost Optimization

echo "Running monthly cost optimization..."

# Lambda Cost Analysis
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE

# DynamoDB Cost Analysis
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE \
  --filter file://dynamodb-filter.json

# S3 Cost Analysis
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE \
  --filter file://s3-filter.json

echo "Cost optimization completed!"
```

#### 2. Backup Verification

```bash
#!/bin/bash
# Monthly Backup Verification

echo "Running monthly backup verification..."

# DynamoDB Backup Status
aws dynamodb describe-continuous-backups --table-name ai-investment-signals

# S3 Cross-Region Replication Status
aws s3api get-bucket-replication --bucket ai-investment-raw-data

# RDS Backup Status
aws rds describe-db-instances --db-instance-identifier ai-investment-db

echo "Backup verification completed!"
```

## Notfallverfahren

### System Downtime

#### 1. Sofortmaßnahmen

```bash
#!/bin/bash
# Emergency Response Script

echo "Emergency response initiated..."

# 1. System Status prüfen
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Errors \
  --start-time $(date -d '5 minutes ago' -u +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 60 \
  --statistics Sum

# 2. Critical Services prüfen
curl -f https://api.production.ai-investment.com/health || {
    echo "CRITICAL: API is down"
    # Alert team
    aws sns publish \
      --topic-arn arn:aws:sns:eu-central-1:123456789012:ai-investment-alerts \
      --message "CRITICAL: API is down" \
      --subject "System Down Alert"
}

# 3. Rollback vorbereiten
aws lambda list-versions-by-function --function-name ai-investment-ingestion

echo "Emergency response completed!"
```

#### 2. Rollback Procedure

```bash
#!/bin/bash
# Rollback Procedure

echo "Initiating rollback procedure..."

# 1. Previous Version identifizieren
PREVIOUS_VERSION=$(aws lambda list-versions-by-function \
  --function-name ai-investment-ingestion \
  --query 'Versions[-2].Version' \
  --output text)

# 2. Rollback durchführen
aws lambda update-alias \
  --function-name ai-investment-ingestion \
  --name production \
  --function-version $PREVIOUS_VERSION

# 3. Health Check nach Rollback
sleep 30
curl -f https://api.production.ai-investment.com/health || {
    echo "Rollback failed - manual intervention required"
    exit 1
}

echo "Rollback completed successfully!"
```

### Data Loss Prevention

#### 1. Backup Verification

```bash
#!/bin/bash
# Data Loss Prevention Script

echo "Checking data integrity..."

# DynamoDB Backup Status
aws dynamodb describe-continuous-backups --table-name ai-investment-signals

# S3 Cross-Region Replication
aws s3api get-bucket-replication --bucket ai-investment-raw-data

# RDS Backup Status
aws rds describe-db-snapshots \
  --db-instance-identifier ai-investment-db \
  --snapshot-type automated

echo "Data integrity check completed!"
```

#### 2. Recovery Procedure

```bash
#!/bin/bash
# Recovery Procedure

echo "Initiating recovery procedure..."

# 1. DynamoDB Point-in-Time Recovery
aws dynamodb restore-table-from-backup \
  --target-table-name ai-investment-signals-recovered \
  --backup-arn arn:aws:dynamodb:eu-central-1:123456789012:table/ai-investment-signals/backup/1234567890123-12345678

# 2. S3 Cross-Region Replication
aws s3 sync s3://ai-investment-raw-data s3://ai-investment-raw-data-backup

# 3. RDS Snapshot Restore
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier ai-investment-db-recovered \
  --db-snapshot-identifier ai-investment-db-snapshot-2024-01-15

echo "Recovery procedure completed!"
```

## Performance-Optimierung

### Lambda Optimization

#### 1. Memory Tuning

```bash
#!/bin/bash
# Lambda Memory Optimization

echo "Optimizing Lambda memory..."

# Current performance analysieren
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --dimensions Name=FunctionName,Value=ai-investment-ingestion \
  --start-time $(date -d '1 hour ago' -u +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average,Maximum

# Memory basierend auf Performance anpassen
aws lambda update-function-configuration \
  --function-name ai-investment-ingestion \
  --memory-size 1024
```

#### 2. Provisioned Concurrency

```bash
#!/bin/bash
# Provisioned Concurrency Setup

echo "Setting up provisioned concurrency..."

# Provisioned Concurrency konfigurieren
aws lambda put-provisioned-concurrency-config \
  --function-name ai-investment-ingestion \
  --provisioned-concurrency-config ProvisionedConcurrencyCount=10

# Status prüfen
aws lambda get-provisioned-concurrency-config \
  --function-name ai-investment-ingestion
```

### DynamoDB Optimization

#### 1. Capacity Planning

```bash
#!/bin/bash
# DynamoDB Capacity Optimization

echo "Optimizing DynamoDB capacity..."

# Current usage analysieren
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedReadCapacityUnits \
  --dimensions Name=TableName,Value=ai-investment-signals \
  --start-time $(date -d '1 hour ago' -u +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum

# Auto Scaling konfigurieren
aws application-autoscaling register-scalable-target \
  --service-namespace dynamodb \
  --resource-id table/ai-investment-signals \
  --scalable-dimension dynamodb:table:ReadCapacityUnits \
  --min-capacity 5 \
  --max-capacity 100
```

#### 2. DAX Caching

```bash
#!/bin/bash
# DAX Caching Setup

echo "Setting up DAX caching..."

# DAX Cluster erstellen
aws dax create-cluster \
  --cluster-name ai-investment-dax \
  --node-type dax.t3.small \
  --replication-factor 3 \
  --iam-role-arn arn:aws:iam::123456789012:role/DAXServiceRole

# DAX Endpoint abrufen
DAX_ENDPOINT=$(aws dax describe-clusters \
  --cluster-names ai-investment-dax \
  --query 'Clusters[0].ClusterDiscoveryEndpoint.Address' \
  --output text)

echo "DAX Endpoint: $DAX_ENDPOINT"
```

## Sicherheitsverfahren

### Access Control

#### 1. IAM Policy Review

```bash
#!/bin/bash
# IAM Policy Review

echo "Reviewing IAM policies..."

# Lambda Execution Role prüfen
aws iam list-attached-role-policies --role-name LambdaExecutionRole

# S3 Bucket Policy prüfen
aws s3api get-bucket-policy --bucket ai-investment-raw-data

# DynamoDB Access prüfen
aws iam get-role-policy \
  --role-name LambdaExecutionRole \
  --policy-name DynamoDBAccess
```

#### 2. Security Audit

```bash
#!/bin/bash
# Security Audit Script

echo "Running security audit..."

# S3 Bucket Encryption prüfen
aws s3api get-bucket-encryption --bucket ai-investment-raw-data

# DynamoDB Encryption prüfen
aws dynamodb describe-table --table-name ai-investment-signals

# KMS Key Status prüfen
aws kms describe-key --key-id alias/ai-investment-key

# CloudTrail Logs prüfen
aws logs filter-log-events \
  --log-group-name "CloudTrail" \
  --start-time $(date -d '1 hour ago' +%s)000 \
  --filter-pattern "ERROR"
```

### Incident Response

#### 1. Security Incident

```bash
#!/bin/bash
# Security Incident Response

echo "Security incident detected..."

# 1. System isolieren
aws lambda update-function-configuration \
  --function-name ai-investment-ingestion \
  --environment Variables='{"EMERGENCY_MODE":"true"}'

# 2. Access sperren
aws iam attach-role-policy \
  --role-name LambdaExecutionRole \
  --policy-arn arn:aws:iam::123456789012:policy/EmergencyLockdown

# 3. Alert senden
aws sns publish \
  --topic-arn arn:aws:sns:eu-central-1:123456789012:security-alerts \
  --message "Security incident detected - system isolated" \
  --subject "SECURITY ALERT"
```

#### 2. Data Breach Response

```bash
#!/bin/bash
# Data Breach Response

echo "Data breach response initiated..."

# 1. System isolieren
aws lambda update-function-configuration \
  --function-name ai-investment-ingestion \
  --environment Variables='{"EMERGENCY_MODE":"true"}'

# 2. Access sperren
aws iam attach-role-policy \
  --role-name LambdaExecutionRole \
  --policy-arn arn:aws:iam::123456789012:policy/EmergencyLockdown

# 3. Audit Logs sammeln
aws logs filter-log-events \
  --log-group-name "CloudTrail" \
  --start-time $(date -d '24 hours ago' +%s)000 \
  --filter-pattern "ERROR"

# 4. Incident Report erstellen
echo "Incident Report - $(date)" > incident-report.txt
echo "System isolated at $(date)" >> incident-report.txt
echo "Access locked down" >> incident-report.txt
echo "Audit logs collected" >> incident-report.txt
```

Diese Runbooks bieten eine umfassende Anleitung für die Wartung und den Betrieb des AI Investment Systems und sollten regelmäßig aktualisiert werden.
