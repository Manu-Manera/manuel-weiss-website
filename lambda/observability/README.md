# AI Investment System Observability

## Overview

The Observability module provides comprehensive monitoring, security, and compliance capabilities for the AI Investment System. It includes metrics collection, logging, alerting, and compliance monitoring.

## Features

### Metrics Collection
- **System Metrics**: CPU, memory, disk, network usage
- **Business Metrics**: Signals processed, proposals generated, decisions made, outcomes evaluated
- **Security Metrics**: Failed authentication, rate limit violations, data access violations
- **Performance Metrics**: Response times, error rates, throughput

### Logging
- **Structured Logging**: JSON-formatted logs with context
- **Log Levels**: Info, warn, error, debug
- **Log Aggregation**: Centralized log collection and analysis
- **Log Retention**: Configurable retention policies

### Alerting
- **Alert Rules**: Configurable alert conditions and thresholds
- **Alert Actions**: Email, Slack, webhook notifications
- **Alert Severity**: Low, medium, high, critical
- **Alert Management**: Alert lifecycle management

### Compliance Monitoring
- **Security Compliance**: Encryption, access controls, authentication
- **Privacy Compliance**: Data anonymization, retention, consent management
- **Governance Compliance**: Audit logging, change management
- **Operational Compliance**: Backup status, monitoring

## Architecture

### Components

1. **ObservabilityManager**: Main observability orchestrator
2. **MetricsCollector**: System and business metrics collection
3. **LogAggregator**: Centralized logging and analysis
4. **AlertManager**: Alert rule evaluation and notification
5. **ComplianceMonitor**: Compliance checking and reporting

### Data Flow

```
System Events → Metrics Collector → CloudWatch → Dashboards
Logs → Log Aggregator → CloudWatch Logs → Analysis
Alerts → Alert Manager → Notifications → Actions
Compliance → Compliance Monitor → Reports → Auditors
```

## API Endpoints

### GET /observability/metrics
Retrieve system and business metrics.

**Response**:
```json
{
  "ok": true,
  "data": {
    "metrics": [
      {
        "name": "CPUUsage",
        "value": 65.5,
        "unit": "Percent",
        "timestamp": "2024-01-15T10:30:00Z",
        "dimensions": {
          "Service": "AI-Investment"
        },
        "namespace": "AI-Investment/System"
      }
    ],
    "count": 1
  }
}
```

### GET /observability/logs
Retrieve system logs.

**Response**:
```json
{
  "ok": true,
  "data": {
    "logs": [
      {
        "level": "info",
        "message": "Signal processed successfully",
        "timestamp": "2024-01-15T10:30:00Z",
        "requestId": "req_123",
        "userId": "user_123",
        "module": "ingestion",
        "costTokens": 150
      }
    ],
    "count": 1
  }
}
```

### GET /observability/alerts
Retrieve active alerts.

**Response**:
```json
{
  "ok": true,
  "data": {
    "alerts": [
      {
        "id": "alert_123",
        "name": "High CPU Usage",
        "condition": "CPUUsage > 80",
        "threshold": 80,
        "severity": "high",
        "enabled": true,
        "actions": ["email", "slack"]
      }
    ],
    "count": 1
  }
}
```

### GET /observability/compliance
Retrieve compliance check results.

**Response**:
```json
{
  "ok": true,
  "data": {
    "complianceChecks": [
      {
        "id": "check_123",
        "name": "Data Encryption",
        "status": "pass",
        "details": "All data encrypted",
        "timestamp": "2024-01-15T10:30:00Z",
        "category": "security"
      }
    ],
    "count": 1
  }
}
```

## Metrics

### System Metrics

#### CPU Usage
- **Name**: `CPUUsage`
- **Unit**: Percent
- **Namespace**: `AI-Investment/System`
- **Description**: CPU utilization percentage

#### Memory Usage
- **Name**: `MemoryUsage`
- **Unit**: Percent
- **Namespace**: `AI-Investment/System`
- **Description**: Memory utilization percentage

#### Disk Usage
- **Name**: `DiskUsage`
- **Unit**: Percent
- **Namespace**: `AI-Investment/System`
- **Description**: Disk utilization percentage

#### Network I/O
- **Name**: `NetworkBytesIn` / `NetworkBytesOut`
- **Unit**: Bytes
- **Namespace**: `AI-Investment/System`
- **Description**: Network input/output bytes

### Business Metrics

#### Signals Processed
- **Name**: `SignalsProcessed`
- **Unit**: Count
- **Namespace**: `AI-Investment/Business`
- **Description**: Number of signals processed

#### Proposals Generated
- **Name**: `ProposalsGenerated`
- **Unit**: Count
- **Namespace**: `AI-Investment/Business`
- **Description**: Number of proposals generated

#### Decisions Made
- **Name**: `DecisionsMade`
- **Unit**: Count
- **Namespace**: `AI-Investment/Business`
- **Description**: Number of decisions made

#### Outcomes Evaluated
- **Name**: `OutcomesEvaluated`
- **Unit**: Count
- **Namespace**: `AI-Investment/Business`
- **Description**: Number of outcomes evaluated

#### Success Rate
- **Name**: `SuccessRate`
- **Unit**: Percent
- **Namespace**: `AI-Investment/Business`
- **Description**: Investment success rate

#### Average Return
- **Name**: `AverageReturn`
- **Unit**: Percent
- **Namespace**: `AI-Investment/Business`
- **Description**: Average investment return

### Security Metrics

#### Failed Authentication Attempts
- **Name**: `FailedAuthAttempts`
- **Unit**: Count
- **Namespace**: `AI-Investment/Security`
- **Description**: Number of failed authentication attempts

#### Rate Limit Violations
- **Name**: `RateLimitViolations`
- **Unit**: Count
- **Namespace**: `AI-Investment/Security`
- **Description**: Number of rate limit violations

#### Data Access Violations
- **Name**: `DataAccessViolations`
- **Unit**: Count
- **Namespace**: `AI-Investment/Security`
- **Description**: Number of data access violations

#### Encryption Status
- **Name**: `EncryptionStatus`
- **Unit**: Count
- **Namespace**: `AI-Investment/Security`
- **Description**: Data encryption status (1 = encrypted, 0 = not encrypted)

### Performance Metrics

#### Response Time
- **Name**: `ResponseTime`
- **Unit**: Milliseconds
- **Namespace**: `AI-Investment/Performance`
- **Description**: API response times (avg, p95, p99)

#### Error Rate
- **Name**: `ErrorRate`
- **Unit**: Percent
- **Namespace**: `AI-Investment/Performance`
- **Description**: API error rates

#### Throughput
- **Name**: `Throughput`
- **Unit**: Count/Second
- **Namespace**: `AI-Investment/Performance`
- **Description**: API throughput

## Alert Rules

### System Alerts

#### High CPU Usage
- **Condition**: `CPUUsage > 80`
- **Severity**: High
- **Actions**: Email, Slack

#### High Memory Usage
- **Condition**: `MemoryUsage > 90`
- **Severity**: High
- **Actions**: Email, Slack

#### High Disk Usage
- **Condition**: `DiskUsage > 85`
- **Severity**: Medium
- **Actions**: Email

### Business Alerts

#### Low Success Rate
- **Condition**: `SuccessRate < 50`
- **Severity**: High
- **Actions**: Email, Slack, Webhook

#### High Error Rate
- **Condition**: `ErrorRate > 5`
- **Severity**: High
- **Actions**: Email, Slack

### Security Alerts

#### Failed Authentication
- **Condition**: `FailedAuthAttempts > 10`
- **Severity**: High
- **Actions**: Email, Slack, Webhook

#### Rate Limit Violations
- **Condition**: `RateLimitViolations > 5`
- **Severity**: Medium
- **Actions**: Email

## Compliance Checks

### Security Compliance

#### Data Encryption
- **Check**: Verify all data is encrypted
- **Status**: Pass/Fail
- **Category**: Security

#### Access Controls
- **Check**: Verify access controls are properly configured
- **Status**: Pass/Fail
- **Category**: Security

#### Authentication
- **Check**: Verify authentication is properly configured
- **Status**: Pass/Fail
- **Category**: Security

### Privacy Compliance

#### Data Anonymization
- **Check**: Verify data is properly anonymized
- **Status**: Pass/Fail
- **Category**: Privacy

#### Data Retention
- **Check**: Verify data retention policies are configured
- **Status**: Pass/Fail
- **Category**: Privacy

#### Consent Management
- **Check**: Verify consent is properly managed
- **Status**: Pass/Fail
- **Category**: Privacy

### Governance Compliance

#### Audit Logging
- **Check**: Verify audit logging is configured
- **Status**: Pass/Fail
- **Category**: Governance

#### Change Management
- **Check**: Verify change management is configured
- **Status**: Pass/Fail
- **Category**: Governance

### Operational Compliance

#### Backup Status
- **Check**: Verify backups are properly configured
- **Status**: Pass/Fail
- **Category**: Operational

#### Monitoring
- **Check**: Verify monitoring is properly configured
- **Status**: Pass/Fail
- **Category**: Operational

## Configuration

### Environment Variables

- `AWS_REGION`: AWS region (default: eu-central-1)
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `METRICS_TABLE_NAME`: DynamoDB table for metrics
- `ALERT_RULES_TABLE_NAME`: DynamoDB table for alert rules
- `ALERTS_TABLE_NAME`: DynamoDB table for alerts
- `COMPLIANCE_CHECKS_TABLE_NAME`: DynamoDB table for compliance checks
- `SECURITY_EVENTS_TABLE_NAME`: DynamoDB table for security events

### CloudWatch Configuration

- **Metrics Namespace**: `AI-Investment`
- **Log Group**: `/aws/lambda/ai-investment-observability`
- **Retention**: 30 days (configurable)
- **Alarms**: Automatic alarm creation for critical metrics

## Monitoring

### Dashboards

#### System Health Dashboard
- CPU, memory, disk usage
- Network I/O
- Response times
- Error rates

#### Business Metrics Dashboard
- Signals processed
- Proposals generated
- Decisions made
- Success rates
- Average returns

#### Security Dashboard
- Failed authentication attempts
- Rate limit violations
- Data access violations
- Encryption status

#### Compliance Dashboard
- Security compliance status
- Privacy compliance status
- Governance compliance status
- Operational compliance status

### Alerts

#### Critical Alerts
- System down
- High error rates
- Security breaches
- Compliance failures

#### Warning Alerts
- High resource usage
- Performance degradation
- Security violations
- Compliance warnings

## Security

### Data Protection

- **Encryption**: All data encrypted in transit and at rest
- **Access Control**: IAM-based access control
- **Audit Logging**: Comprehensive audit trail
- **Data Anonymization**: PII anonymization

### Compliance

- **GDPR**: Data protection and privacy compliance
- **SOC 2**: Security and availability compliance
- **ISO 27001**: Information security management
- **PCI DSS**: Payment card industry compliance

## Troubleshooting

### Common Issues

1. **Metrics Not Appearing**: Check CloudWatch permissions
2. **Alerts Not Triggering**: Verify alert rules and thresholds
3. **Compliance Failures**: Review compliance check configurations
4. **High Costs**: Optimize metric collection frequency

### Debug Mode

Enable debug logging:
```bash
export DEBUG=ai-investment:observability
```

## Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:integration
```

### Load Tests

```bash
npm run test:load
```

## Deployment

### CDK Deployment

```bash
npm run deploy
```

### Manual Deployment

```bash
# Build
npm run build

# Deploy to AWS
aws lambda update-function-code \
  --function-name ai-investment-observability \
  --zip-file fileb://dist/index.js.zip
```

## Performance

### Optimization

- **Metric Batching**: Batch multiple metrics into single requests
- **Log Compression**: Compress logs for storage efficiency
- **Alert Throttling**: Prevent alert spam
- **Compliance Caching**: Cache compliance check results

### Scaling

- **Auto-scaling**: Automatic scaling based on load
- **Resource Limits**: Configurable resource limits
- **Cost Optimization**: Cost-effective monitoring

## Contributing

1. Follow TypeScript best practices
2. Add comprehensive tests
3. Update documentation
4. Follow conventional commits

## License

MIT License - see LICENSE file for details.
