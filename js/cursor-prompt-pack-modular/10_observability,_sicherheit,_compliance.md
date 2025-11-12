# Modul 10 — Observability, Sicherheit, Compliance (OPTIMIERT)
**Repo:** `Manu-Manera/manuel-weiss-website` • **Version:** 5.0 • **Zeitzone:** Europe/Zurich  
**Prinzip:** *Kein Test-/Demo-Daten-Einsatz. Nur echte Quellen/Provider. Serverseitige Secrets.*
**Ziel:** Production-ready Observability, Security und Compliance System mit umfassendem Monitoring

---
# Repo-Ausrichtung & Pfade (ERWEITERT)
- **CDK Stacks:** `infrastructure/observability/` mit CloudWatch, X-Ray, Alarms
- **Lambda Middleware:** `middleware/` mit Logging, Tracing, Security
- **UI Banner:** `ui/components/` mit Compliance-Banner und Disclaimer
- **Monitoring:** `monitoring/` mit Dashboards, Alerts, Runbooks
- **Security:** `security/` mit IAM, KMS, Secrets Manager, WAF

# Smart Prompt – Implementierung (FÜR CURSOR - OPTIMIERT)
> **An Cursor – Production Observability & Security System implementieren (Deutsch):**  

## PHASE 1: Structured Logging System (ERWEITERT)
### **Centralized Logging Infrastructure:**
```typescript
// middleware/logging/structured-logger.ts
import { CloudWatchLogs } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

export class StructuredLogger {
  private cloudWatch: CloudWatchLogs;
  private logGroup: string;
  private logStream: string;
  private traceId: string;
  private userId?: string;
  private sessionId?: string;

  constructor(
    logGroup: string = process.env.LOG_GROUP || '/aws/lambda/ai-investment',
    logStream?: string
  ) {
    this.cloudWatch = new CloudWatchLogs({ region: 'eu-central-1' });
    this.logGroup = logGroup;
    this.logStream = logStream || `stream-${Date.now()}`;
    this.traceId = uuidv4();
  }

  public setContext(userId?: string, sessionId?: string): void {
    this.userId = userId;
    this.sessionId = sessionId;
  }

  public info(message: string, data?: any): void {
    this.log('INFO', message, data);
  }

  public warn(message: string, data?: any): void {
    this.log('WARN', message, data);
  }

  public error(message: string, error?: Error, data?: any): void {
    this.log('ERROR', message, {
      ...data,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }

  public debug(message: string, data?: any): void {
    this.log('DEBUG', message, data);
  }

  private log(level: string, message: string, data?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      traceId: this.traceId,
      userId: this.userId,
      sessionId: this.sessionId,
      service: process.env.SERVICE_NAME || 'ai-investment',
      version: process.env.SERVICE_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'production',
      ...this.maskSensitiveData(data)
    };

    // Send to CloudWatch
    this.sendToCloudWatch(logEntry);
    
    // Also log to console for local development
    if (process.env.NODE_ENV === 'development') {
      console.log(JSON.stringify(logEntry, null, 2));
    }
  }

  private maskSensitiveData(data: any): any {
    if (!data) return data;
    
    const sensitiveFields = ['password', 'token', 'key', 'secret', 'auth', 'authorization'];
    const masked = { ...data };
    
    for (const field of sensitiveFields) {
      if (masked[field]) {
        masked[field] = '***MASKED***';
      }
    }
    
    return masked;
  }

  private async sendToCloudWatch(logEntry: any): Promise<void> {
    try {
      const params = {
        logGroupName: this.logGroup,
        logStreamName: this.logStream,
        logEvents: [{
          timestamp: Date.now(),
          message: JSON.stringify(logEntry)
        }]
      };
      
      await this.cloudWatch.putLogEvents(params).promise();
    } catch (error) {
      console.error('Failed to send log to CloudWatch:', error);
    }
  }
}

// Global logger instance
export const logger = new StructuredLogger();
```

## PHASE 2: Metrics and Monitoring (ERWEITERT)
### **Custom Metrics System:**
```typescript
// monitoring/metrics/custom-metrics.ts
import { CloudWatch } from 'aws-sdk';

export class CustomMetrics {
  private cloudWatch: CloudWatch;
  private namespace: string;

  constructor(namespace: string = 'AI-Investment-System') {
    this.cloudWatch = new CloudWatch({ region: 'eu-central-1' });
    this.namespace = namespace;
  }

  public async putMetric(
    metricName: string,
    value: number,
    unit: string = 'Count',
    dimensions?: Record<string, string>
  ): Promise<void> {
    try {
      const params = {
        Namespace: this.namespace,
        MetricData: [{
          MetricName: metricName,
          Value: value,
          Unit: unit,
          Dimensions: dimensions ? Object.entries(dimensions).map(([Name, Value]) => ({
            Name,
            Value
          })) : undefined,
          Timestamp: new Date()
        }]
      };

      await this.cloudWatch.putMetricData(params).promise();
    } catch (error) {
      console.error('Failed to put metric:', error);
    }
  }

  // Business Metrics
  public async recordSignalProcessed(signalId: string, processingTime: number): Promise<void> {
    await this.putCounter('SignalsProcessed', 1, { signalId });
    await this.putGauge('SignalProcessingTime', processingTime, { signalId });
  }

  public async recordProposalCreated(proposalId: string, riskScore: number): Promise<void> {
    await this.putCounter('ProposalsCreated', 1, { proposalId });
    await this.putGauge('ProposalRiskScore', riskScore, { proposalId });
  }

  public async recordDecisionMade(decision: string, processingTime: number): Promise<void> {
    await this.putCounter('DecisionsMade', 1, { decision });
    await this.putGauge('DecisionProcessingTime', processingTime, { decision });
  }

  public async recordCostTokens(tokens: number, model: string): Promise<void> {
    await this.putCounter('CostTokens', tokens, { model });
  }
}

// Global metrics instance
export const metrics = new CustomMetrics();
```

### **Alarm Configuration:**
```typescript
// monitoring/alarms/cloudwatch-alarms.ts
export const createCloudWatchAlarms = async (): Promise<void> => {
  const alarms = [
    {
      AlarmName: 'AI-Investment-5xx-Spike',
      ComparisonOperator: 'GreaterThanThreshold',
      EvaluationPeriods: 2,
      MetricName: '5xxErrors',
      Namespace: 'AWS/Lambda',
      Period: 300,
      Statistic: 'Sum',
      Threshold: 10,
      ActionsEnabled: true,
      AlarmActions: [process.env.SNS_TOPIC_ARN],
      AlarmDescription: 'High 5xx error rate detected'
    },
    {
      AlarmName: 'AI-Investment-High-Latency',
      ComparisonOperator: 'GreaterThanThreshold',
      EvaluationPeriods: 3,
      MetricName: 'Duration',
      Namespace: 'AWS/Lambda',
      Period: 300,
      Statistic: 'Average',
      Threshold: 5000, // 5 seconds
      ActionsEnabled: true,
      AlarmActions: [process.env.SNS_TOPIC_ARN],
      AlarmDescription: 'High latency detected'
    },
    {
      AlarmName: 'AI-Investment-DLQ-Messages',
      ComparisonOperator: 'GreaterThanThreshold',
      EvaluationPeriods: 1,
      MetricName: 'ApproximateNumberOfVisibleMessages',
      Namespace: 'AWS/SQS',
      Period: 300,
      Statistic: 'Average',
      Threshold: 0,
      ActionsEnabled: true,
      AlarmActions: [process.env.SNS_TOPIC_ARN],
      AlarmDescription: 'Dead letter queue has messages'
    },
    {
      AlarmName: 'AI-Investment-Cost-Budget',
      ComparisonOperator: 'GreaterThanThreshold',
      EvaluationPeriods: 1,
      MetricName: 'CostTokens',
      Namespace: 'AI-Investment-System',
      Period: 3600, // 1 hour
      Statistic: 'Sum',
      Threshold: 1000, // 1000 tokens per hour
      ActionsEnabled: true,
      AlarmActions: [process.env.SNS_TOPIC_ARN],
      AlarmDescription: 'Cost budget exceeded'
    }
  ];

  for (const alarm of alarms) {
    await cloudWatch.putMetricAlarm(alarm).promise();
  }
};
```

## PHASE 3: Security Implementation (ERWEITERT)
### **IAM Least Privilege:**
```typescript
// security/iam/least-privilege-policies.ts
export const createLeastPrivilegePolicies = (): IAMPolicy[] => {
  return [
    {
      PolicyName: 'AI-Investment-Lambda-Basic',
      PolicyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: [
              'logs:CreateLogGroup',
              'logs:CreateLogStream',
              'logs:PutLogEvents'
            ],
            Resource: 'arn:aws:logs:*:*:*'
          }
        ]
      }
    },
    {
      PolicyName: 'AI-Investment-DynamoDB-ReadWrite',
      PolicyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: [
              'dynamodb:GetItem',
              'dynamodb:PutItem',
              'dynamodb:UpdateItem',
              'dynamodb:DeleteItem',
              'dynamodb:Query',
              'dynamodb:Scan'
            ],
            Resource: [
              'arn:aws:dynamodb:eu-central-1:*:table/signals',
              'arn:aws:dynamodb:eu-central-1:*:table/proposals',
              'arn:aws:dynamodb:eu-central-1:*:table/outcomes'
            ]
          }
        ]
      }
    }
  ];
};
```

### **Secrets Management:**
```typescript
// security/secrets/secrets-manager.ts
import { SecretsManager } from 'aws-sdk';

export class SecretsManagerService {
  private secretsManager: SecretsManager;

  constructor() {
    this.secretsManager = new SecretsManager({ region: 'eu-central-1' });
  }

  public async getSecret(secretName: string): Promise<string> {
    try {
      const result = await this.secretsManager.getSecretValue({
        SecretId: secretName
      }).promise();
      
      return result.SecretString!;
    } catch (error) {
      console.error(`Failed to get secret ${secretName}:`, error);
      throw error;
    }
  }

  public async rotateSecret(secretName: string): Promise<void> {
    try {
      await this.secretsManager.updateSecretVersionStage({
        SecretId: secretName,
        VersionStage: 'AWSCURRENT',
        MoveToVersionId: 'AWSPENDING'
      }).promise();
    } catch (error) {
      console.error(`Failed to rotate secret ${secretName}:`, error);
      throw error;
    }
  }
}
```

## PHASE 4: Compliance Framework (ERWEITERT)
### **DSGVO Compliance:**
```typescript
// compliance/dsgvo/data-protection.ts
export class DataProtectionService {
  private auditLogger: StructuredLogger;

  constructor() {
    this.auditLogger = new StructuredLogger('/aws/lambda/ai-investment-audit');
  }

  public async recordDataAccess(
    userId: string,
    dataType: string,
    action: string,
    purpose: string
  ): Promise<void> {
    await this.auditLogger.info('Data Access Recorded', {
      userId,
      dataType,
      action,
      purpose,
      timestamp: new Date().toISOString(),
      legalBasis: 'Legitimate Interest'
    });
  }

  public async recordDataDeletion(userId: string, dataType: string): Promise<void> {
    await this.auditLogger.info('Data Deletion Recorded', {
      userId,
      dataType,
      timestamp: new Date().toISOString(),
      legalBasis: 'Right to Erasure'
    });
  }

  public async anonymizeUserData(userId: string): Promise<void> {
    // Anonymize user data while preserving business value
    await this.auditLogger.info('User Data Anonymized', {
      userId,
      timestamp: new Date().toISOString(),
      legalBasis: 'Data Minimization'
    });
  }
}
```

### **UI Disclaimer Banner:**
```typescript
// ui/components/compliance-banner.tsx
export const ComplianceBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(true);
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    setAccepted(true);
    setShowBanner(false);
    localStorage.setItem('compliance-accepted', 'true');
  };

  const handleDecline = () => {
    window.location.href = '/privacy-policy';
  };

  if (!showBanner || accepted) {
    return null;
  }

  return (
    <div className="compliance-banner">
      <div className="banner-content">
        <h3>Datenschutz & Compliance</h3>
        <p>
          Diese Anwendung verarbeitet Daten gemäß DSGVO. 
          <strong>Wichtig:</strong> Dies ist ein Research/Simulation System, 
          keine Anlageberatung. Die Nutzung erfolgt auf eigenes Risiko.
        </p>
        <div className="banner-actions">
          <button onClick={handleAccept} className="btn btn-primary">
            Akzeptieren
          </button>
          <button onClick={handleDecline} className="btn btn-secondary">
            Datenschutz lesen
          </button>
        </div>
      </div>
    </div>
  );
};
```

**Structured JSON Logs** (reqId, userId, module, costTokens).
**Metriken** (Latency/Error/Cost) + CloudWatch Dashboards.
**Alarme:** 5xx Spike, p95 Latenz, DLQ>0, Kostenbudget.
**IAM Least Privilege;** Secrets-Rotation (KMS/Secrets Manager).
**DSGVO:** Pseudonymisierung, Export/Delete-Flow; UI-Disclaimer.
**API-Edge:** Schema-Validation, Rate-Limits, Auth.

# Zusätzliche Verbesserungen (PRODUCTION-GRADE - OPTIMIERT)
- **Trace-IDs** über alle Ebenen propagieren
- **Cost-Guard** pro Route, Hard-Cap + Soft-Warnungen
- **Real-time Monitoring** mit Live-Dashboards
- **Automated Incident Response** mit Runbooks
- **Security Scanning** mit Vulnerability Assessment
- **Compliance Auditing** mit automatischen Reports
- **Performance Optimization** mit Bottleneck Detection
- **Cost Optimization** mit Resource Right-sizing

# Fehlervermeidung – Was schiefgehen kann & Gegenmaßnahmen (ERWEITERT)
- **Übersehenes PII** in Logs.  
  **Fix:** Redaction-Middleware; Log-Sampler; Automated PII Detection
- **Alarm-Flut**.  
  **Fix:** Deduplication & Quiet-Hours; Intelligent Alerting
- **Security Vulnerabilities** → Data Breach.  
  **Fix:** Regular Security Scans; Penetration Testing; Vulnerability Management
- **Compliance Violations** → Legal Issues.  
  **Fix:** Automated Compliance Checks; Audit Trails; Legal Review
- **Cost Overruns** → Budget Exceeded.  
  **Fix:** Cost Monitoring; Budget Alerts; Resource Optimization
- **Performance Degradation** → Poor User Experience.  
  **Fix:** Performance Monitoring; Bottleneck Detection; Auto-scaling

# Akzeptanzkriterien (Definition of Done - ERWEITERT)
- Alarme auslösbar; Logs vollständig; Policies minimal; Banner aktiv
- **Security Standards** erfüllt (ISO27001, SOC2)
- **Compliance Requirements** erfüllt (DSGVO, GDPR)
- **Performance Benchmarks** erreicht (< 2s Response Time)
- **Cost Budgets** eingehalten (< 1000€/Monat)
- **Monitoring Coverage** vollständig (100% System Coverage)
- **Alerting System** funktional und getestet
- **Audit Trails** vollständig und nachvollziehbar

# Build/Test-Gates & Verifikation (AUSFÜHREN - OPTIMIERT)
```bash
# Security Tests
./scripts/test:security:iam
./scripts/test:security:secrets
./scripts/test:security:compliance

# Monitoring Tests
./scripts/test:monitoring:alarms
./scripts/test:monitoring:metrics
./scripts/test:monitoring:dashboards

# Compliance Tests
./scripts/test:compliance:dsgvo
./scripts/test:compliance:audit
./scripts/test:compliance:data-protection

# Performance Tests
./scripts/test:performance:logging
./scripts/test:performance:metrics
./scripts/test:performance:alarms
```

# Artefakte & Deliverables (ERWEITERT)
- **CDK/Code** (Infrastructure as Code, Lambda Functions, Monitoring)
- **docs/operations.md** (Alarme & Runbooks, Troubleshooting Guides)
- **Security Reports** (Vulnerability Assessment, Penetration Testing)
- **Compliance Reports** (DSGVO Compliance, Audit Trails)
- **Monitoring Setup** (Dashboards, Alarms, Metrics)
- **Cost Analysis** (Budget Projections, Optimization Recommendations)
- **Performance Reports** (System Performance, Bottleneck Analysis)
- **Documentation** (Security Policies, Compliance Procedures, Runbooks)

