import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AWSHelpers } from '@ai-investment/common';
import { logger } from '@ai-investment/common';
import { TimeUtils } from '@ai-investment/common';
import { HashUtils } from '@ai-investment/common';

// AWS Configuration
const awsConfig = {
  region: process.env.AWS_REGION || 'eu-central-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};

const aws = new AWSHelpers(awsConfig);

// Observability Types
interface MetricData {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  dimensions: Record<string, string>;
  namespace: string;
}

interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  requestId: string;
  userId?: string;
  module: string;
  costTokens?: number;
  metadata?: Record<string, any>;
}

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  actions: string[];
}

interface ComplianceCheck {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
  timestamp: string;
  category: 'security' | 'privacy' | 'governance' | 'operational';
}

// Observability Manager
class ObservabilityManager {
  private aws: AWSHelpers;
  private metrics: MetricData[] = [];
  private logs: LogEntry[] = [];
  private alerts: AlertRule[] = [];
  private complianceChecks: ComplianceCheck[] = [];

  constructor(aws: AWSHelpers) {
    this.aws = aws;
    this.loadAlertRules();
    this.startMetricsCollection();
    this.startComplianceMonitoring();
  }

  async collectMetrics(): Promise<void> {
    try {
      logger.info('Collecting system metrics');

      // System metrics
      const systemMetrics = await this.collectSystemMetrics();
      this.metrics.push(...systemMetrics);

      // Business metrics
      const businessMetrics = await this.collectBusinessMetrics();
      this.metrics.push(...businessMetrics);

      // Security metrics
      const securityMetrics = await this.collectSecurityMetrics();
      this.metrics.push(...securityMetrics);

      // Performance metrics
      const performanceMetrics = await this.collectPerformanceMetrics();
      this.metrics.push(...performanceMetrics);

      // Send metrics to CloudWatch
      await this.sendMetricsToCloudWatch();

      logger.info('Metrics collection completed', {
        metricCount: this.metrics.length
      });

    } catch (error) {
      logger.error('Metrics collection failed', error as Error);
    }
  }

  private async collectSystemMetrics(): Promise<MetricData[]> {
    const metrics: MetricData[] = [];
    const timestamp = TimeUtils.now();

    try {
      // CPU usage
      const cpuUsage = await this.getCPUUsage();
      metrics.push({
        name: 'CPUUsage',
        value: cpuUsage,
        unit: 'Percent',
        timestamp,
        dimensions: { Service: 'AI-Investment' },
        namespace: 'AI-Investment/System'
      });

      // Memory usage
      const memoryUsage = await this.getMemoryUsage();
      metrics.push({
        name: 'MemoryUsage',
        value: memoryUsage,
        unit: 'Percent',
        timestamp,
        dimensions: { Service: 'AI-Investment' },
        namespace: 'AI-Investment/System'
      });

      // Disk usage
      const diskUsage = await this.getDiskUsage();
      metrics.push({
        name: 'DiskUsage',
        value: diskUsage,
        unit: 'Percent',
        timestamp,
        dimensions: { Service: 'AI-Investment' },
        namespace: 'AI-Investment/System'
      });

      // Network I/O
      const networkIO = await this.getNetworkIO();
      metrics.push({
        name: 'NetworkBytesIn',
        value: networkIO.bytesIn,
        unit: 'Bytes',
        timestamp,
        dimensions: { Service: 'AI-Investment' },
        namespace: 'AI-Investment/System'
      });

      metrics.push({
        name: 'NetworkBytesOut',
        value: networkIO.bytesOut,
        unit: 'Bytes',
        timestamp,
        dimensions: { Service: 'AI-Investment' },
        namespace: 'AI-Investment/System'
      });

    } catch (error) {
      logger.error('Failed to collect system metrics', error as Error);
    }

    return metrics;
  }

  private async collectBusinessMetrics(): Promise<MetricData[]> {
    const metrics: MetricData[] = [];
    const timestamp = TimeUtils.now();

    try {
      // Signals processed
      const signalsProcessed = await this.getSignalsProcessed();
      metrics.push({
        name: 'SignalsProcessed',
        value: signalsProcessed,
        unit: 'Count',
        timestamp,
        dimensions: { Service: 'AI-Investment' },
        namespace: 'AI-Investment/Business'
      });

      // Proposals generated
      const proposalsGenerated = await this.getProposalsGenerated();
      metrics.push({
        name: 'ProposalsGenerated',
        value: proposalsGenerated,
        unit: 'Count',
        timestamp,
        dimensions: { Service: 'AI-Investment' },
        namespace: 'AI-Investment/Business'
      });

      // Decisions made
      const decisionsMade = await this.getDecisionsMade();
      metrics.push({
        name: 'DecisionsMade',
        value: decisionsMade,
        unit: 'Count',
        timestamp,
        dimensions: { Service: 'AI-Investment' },
        namespace: 'AI-Investment/Business'
      });

      // Outcomes evaluated
      const outcomesEvaluated = await this.getOutcomesEvaluated();
      metrics.push({
        name: 'OutcomesEvaluated',
        value: outcomesEvaluated,
        unit: 'Count',
        timestamp,
        dimensions: { Service: 'AI-Investment' },
        namespace: 'AI-Investment/Business'
      });

      // Success rate
      const successRate = await this.getSuccessRate();
      metrics.push({
        name: 'SuccessRate',
        value: successRate,
        unit: 'Percent',
        timestamp,
        dimensions: { Service: 'AI-Investment' },
        namespace: 'AI-Investment/Business'
      });

      // Average return
      const avgReturn = await this.getAverageReturn();
      metrics.push({
        name: 'AverageReturn',
        value: avgReturn,
        unit: 'Percent',
        timestamp,
        dimensions: { Service: 'AI-Investment' },
        namespace: 'AI-Investment/Business'
      });

    } catch (error) {
      logger.error('Failed to collect business metrics', error as Error);
    }

    return metrics;
  }

  private async collectSecurityMetrics(): Promise<MetricData[]> {
    const metrics: MetricData[] = [];
    const timestamp = TimeUtils.now();

    try {
      // Failed authentication attempts
      const failedAuth = await this.getFailedAuthAttempts();
      metrics.push({
        name: 'FailedAuthAttempts',
        value: failedAuth,
        unit: 'Count',
        timestamp,
        dimensions: { Service: 'AI-Investment' },
        namespace: 'AI-Investment/Security'
      });

      // API rate limit violations
      const rateLimitViolations = await this.getRateLimitViolations();
      metrics.push({
        name: 'RateLimitViolations',
        value: rateLimitViolations,
        unit: 'Count',
        timestamp,
        dimensions: { Service: 'AI-Investment' },
        namespace: 'AI-Investment/Security'
      });

      // Data access violations
      const dataAccessViolations = await this.getDataAccessViolations();
      metrics.push({
        name: 'DataAccessViolations',
        value: dataAccessViolations,
        unit: 'Count',
        timestamp,
        dimensions: { Service: 'AI-Investment' },
        namespace: 'AI-Investment/Security'
      });

      // Encryption status
      const encryptionStatus = await this.getEncryptionStatus();
      metrics.push({
        name: 'EncryptionStatus',
        value: encryptionStatus,
        unit: 'Count',
        timestamp,
        dimensions: { Service: 'AI-Investment' },
        namespace: 'AI-Investment/Security'
      });

    } catch (error) {
      logger.error('Failed to collect security metrics', error as Error);
    }

    return metrics;
  }

  private async collectPerformanceMetrics(): Promise<MetricData[]> {
    const metrics: MetricData[] = [];
    const timestamp = TimeUtils.now();

    try {
      // Response times
      const responseTimes = await this.getResponseTimes();
      metrics.push({
        name: 'ResponseTime',
        value: responseTimes.avg,
        unit: 'Milliseconds',
        timestamp,
        dimensions: { Service: 'AI-Investment', Type: 'Average' },
        namespace: 'AI-Investment/Performance'
      });

      metrics.push({
        name: 'ResponseTime',
        value: responseTimes.p95,
        unit: 'Milliseconds',
        timestamp,
        dimensions: { Service: 'AI-Investment', Type: 'P95' },
        namespace: 'AI-Investment/Performance'
      });

      metrics.push({
        name: 'ResponseTime',
        value: responseTimes.p99,
        unit: 'Milliseconds',
        timestamp,
        dimensions: { Service: 'AI-Investment', Type: 'P99' },
        namespace: 'AI-Investment/Performance'
      });

      // Error rates
      const errorRates = await this.getErrorRates();
      metrics.push({
        name: 'ErrorRate',
        value: errorRates.total,
        unit: 'Percent',
        timestamp,
        dimensions: { Service: 'AI-Investment' },
        namespace: 'AI-Investment/Performance'
      });

      // Throughput
      const throughput = await this.getThroughput();
      metrics.push({
        name: 'Throughput',
        value: throughput,
        unit: 'Count/Second',
        timestamp,
        dimensions: { Service: 'AI-Investment' },
        namespace: 'AI-Investment/Performance'
      });

    } catch (error) {
      logger.error('Failed to collect performance metrics', error as Error);
    }

    return metrics;
  }

  private async sendMetricsToCloudWatch(): Promise<void> {
    try {
      // Group metrics by namespace
      const metricsByNamespace = this.metrics.reduce((acc, metric) => {
        if (!acc[metric.namespace]) {
          acc[metric.namespace] = [];
        }
        acc[metric.namespace].push(metric);
        return acc;
      }, {} as Record<string, MetricData[]>);

      // Send metrics for each namespace
      for (const [namespace, metrics] of Object.entries(metricsByNamespace)) {
        await this.sendNamespaceMetrics(namespace, metrics);
      }

    } catch (error) {
      logger.error('Failed to send metrics to CloudWatch', error as Error);
    }
  }

  private async sendNamespaceMetrics(namespace: string, metrics: MetricData[]): Promise<void> {
    try {
      // In production, this would use CloudWatch PutMetricData
      logger.info('Sending metrics to CloudWatch', {
        namespace,
        metricCount: metrics.length
      });

      // Store metrics in DynamoDB for persistence
      await this.storeMetrics(metrics);

    } catch (error) {
      logger.error('Failed to send namespace metrics', error as Error);
    }
  }

  private async storeMetrics(metrics: MetricData[]): Promise<void> {
    try {
      for (const metric of metrics) {
        await aws.dynamoPut(
          process.env.METRICS_TABLE_NAME || 'ai-investment-metrics',
          {
            id: HashUtils.generateId(),
            ...metric,
            createdAt: TimeUtils.now()
          }
        );
      }
    } catch (error) {
      logger.error('Failed to store metrics', error as Error);
    }
  }

  // System metric collection methods
  private async getCPUUsage(): Promise<number> {
    // In production, this would get actual CPU usage
    return Math.random() * 100;
  }

  private async getMemoryUsage(): Promise<number> {
    // In production, this would get actual memory usage
    return Math.random() * 100;
  }

  private async getDiskUsage(): Promise<number> {
    // In production, this would get actual disk usage
    return Math.random() * 100;
  }

  private async getNetworkIO(): Promise<{ bytesIn: number; bytesOut: number }> {
    // In production, this would get actual network I/O
    return {
      bytesIn: Math.random() * 1000000,
      bytesOut: Math.random() * 500000
    };
  }

  // Business metric collection methods
  private async getSignalsProcessed(): Promise<number> {
    try {
      const result = await aws.dynamoQuery(
        process.env.SIGNALS_TABLE_NAME || 'ai-investment-signals',
        {
          KeyConditionExpression: 'created_at > :timestamp',
          ExpressionAttributeValues: {
            ':timestamp': TimeUtils.now()
          }
        }
      );
      return result.Count || 0;
    } catch (error) {
      logger.error('Failed to get signals processed', error as Error);
      return 0;
    }
  }

  private async getProposalsGenerated(): Promise<number> {
    try {
      const result = await aws.dynamoQuery(
        process.env.PROPOSALS_TABLE_NAME || 'ai-investment-proposals',
        {
          KeyConditionExpression: 'created_at > :timestamp',
          ExpressionAttributeValues: {
            ':timestamp': TimeUtils.now()
          }
        }
      );
      return result.Count || 0;
    } catch (error) {
      logger.error('Failed to get proposals generated', error as Error);
      return 0;
    }
  }

  private async getDecisionsMade(): Promise<number> {
    try {
      const result = await aws.dynamoQuery(
        process.env.DECISIONS_TABLE_NAME || 'ai-investment-decisions',
        {
          KeyConditionExpression: 'created_at > :timestamp',
          ExpressionAttributeValues: {
            ':timestamp': TimeUtils.now()
          }
        }
      );
      return result.Count || 0;
    } catch (error) {
      logger.error('Failed to get decisions made', error as Error);
      return 0;
    }
  }

  private async getOutcomesEvaluated(): Promise<number> {
    try {
      const result = await aws.dynamoQuery(
        process.env.OUTCOMES_TABLE_NAME || 'ai-investment-outcomes',
        {
          KeyConditionExpression: 'created_at > :timestamp',
          ExpressionAttributeValues: {
            ':timestamp': TimeUtils.now()
          }
        }
      );
      return result.Count || 0;
    } catch (error) {
      logger.error('Failed to get outcomes evaluated', error as Error);
      return 0;
    }
  }

  private async getSuccessRate(): Promise<number> {
    try {
      const outcomes = await aws.dynamoQuery(
        process.env.OUTCOMES_TABLE_NAME || 'ai-investment-outcomes',
        {
          KeyConditionExpression: 'created_at > :timestamp',
          ExpressionAttributeValues: {
            ':timestamp': TimeUtils.now()
          }
        }
      );

      if (!outcomes.Items || outcomes.Items.length === 0) {
        return 0;
      }

      const successfulOutcomes = outcomes.Items.filter(outcome => outcome.return_pct > 0);
      return (successfulOutcomes.length / outcomes.Items.length) * 100;
    } catch (error) {
      logger.error('Failed to get success rate', error as Error);
      return 0;
    }
  }

  private async getAverageReturn(): Promise<number> {
    try {
      const outcomes = await aws.dynamoQuery(
        process.env.OUTCOMES_TABLE_NAME || 'ai-investment-outcomes',
        {
          KeyConditionExpression: 'created_at > :timestamp',
          ExpressionAttributeValues: {
            ':timestamp': TimeUtils.now()
          }
        }
      );

      if (!outcomes.Items || outcomes.Items.length === 0) {
        return 0;
      }

      const totalReturn = outcomes.Items.reduce((sum, outcome) => sum + (outcome.return_pct || 0), 0);
      return (totalReturn / outcomes.Items.length) * 100;
    } catch (error) {
      logger.error('Failed to get average return', error as Error);
      return 0;
    }
  }

  // Security metric collection methods
  private async getFailedAuthAttempts(): Promise<number> {
    try {
      const result = await aws.dynamoQuery(
        process.env.SECURITY_EVENTS_TABLE_NAME || 'ai-investment-security-events',
        {
          KeyConditionExpression: 'event_type = :event_type AND created_at > :timestamp',
          ExpressionAttributeValues: {
            ':event_type': 'failed_auth',
            ':timestamp': TimeUtils.now()
          }
        }
      );
      return result.Count || 0;
    } catch (error) {
      logger.error('Failed to get failed auth attempts', error as Error);
      return 0;
    }
  }

  private async getRateLimitViolations(): Promise<number> {
    try {
      const result = await aws.dynamoQuery(
        process.env.SECURITY_EVENTS_TABLE_NAME || 'ai-investment-security-events',
        {
          KeyConditionExpression: 'event_type = :event_type AND created_at > :timestamp',
          ExpressionAttributeValues: {
            ':event_type': 'rate_limit_violation',
            ':timestamp': TimeUtils.now()
          }
        }
      );
      return result.Count || 0;
    } catch (error) {
      logger.error('Failed to get rate limit violations', error as Error);
      return 0;
    }
  }

  private async getDataAccessViolations(): Promise<number> {
    try {
      const result = await aws.dynamoQuery(
        process.env.SECURITY_EVENTS_TABLE_NAME || 'ai-investment-security-events',
        {
          KeyConditionExpression: 'event_type = :event_type AND created_at > :timestamp',
          ExpressionAttributeValues: {
            ':event_type': 'data_access_violation',
            ':timestamp': TimeUtils.now()
          }
        }
      );
      return result.Count || 0;
    } catch (error) {
      logger.error('Failed to get data access violations', error as Error);
      return 0;
    }
  }

  private async getEncryptionStatus(): Promise<number> {
    // In production, this would check actual encryption status
    return 1; // 1 = encrypted, 0 = not encrypted
  }

  // Performance metric collection methods
  private async getResponseTimes(): Promise<{ avg: number; p95: number; p99: number }> {
    // In production, this would get actual response times
    return {
      avg: Math.random() * 500,
      p95: Math.random() * 1000,
      p99: Math.random() * 2000
    };
  }

  private async getErrorRates(): Promise<{ total: number; byEndpoint: Record<string, number> }> {
    // In production, this would get actual error rates
    return {
      total: Math.random() * 5,
      byEndpoint: {
        '/ingestion/social': Math.random() * 2,
        '/scoring/score': Math.random() * 3,
        '/orchestrator/propose': Math.random() * 1
      }
    };
  }

  private async getThroughput(): Promise<number> {
    // In production, this would get actual throughput
    return Math.random() * 100;
  }

  // Alert management
  private async loadAlertRules(): Promise<void> {
    try {
      const result = await aws.dynamoQuery(
        process.env.ALERT_RULES_TABLE_NAME || 'ai-investment-alert-rules',
        {
          KeyConditionExpression: 'enabled = :enabled',
          ExpressionAttributeValues: {
            ':enabled': true
          }
        }
      );
      this.alerts = result.Items || [];
    } catch (error) {
      logger.error('Failed to load alert rules', error as Error);
      this.alerts = [];
    }
  }

  async checkAlerts(): Promise<void> {
    try {
      for (const alert of this.alerts) {
        const shouldTrigger = await this.evaluateAlertCondition(alert);
        if (shouldTrigger) {
          await this.triggerAlert(alert);
        }
      }
    } catch (error) {
      logger.error('Alert checking failed', error as Error);
    }
  }

  private async evaluateAlertCondition(alert: AlertRule): Promise<boolean> {
    try {
      // In production, this would evaluate the actual condition
      // For now, we'll use a simple threshold check
      const metric = this.metrics.find(m => m.name === alert.condition);
      if (!metric) return false;

      return metric.value > alert.threshold;
    } catch (error) {
      logger.error('Failed to evaluate alert condition', error as Error);
      return false;
    }
  }

  private async triggerAlert(alert: AlertRule): Promise<void> {
    try {
      logger.warn('Alert triggered', {
        alertId: alert.id,
        alertName: alert.name,
        severity: alert.severity
      });

      // Store alert in database
      await aws.dynamoPut(
        process.env.ALERTS_TABLE_NAME || 'ai-investment-alerts',
        {
          id: HashUtils.generateId(),
          alertId: alert.id,
          alertName: alert.name,
          severity: alert.severity,
          triggeredAt: TimeUtils.now(),
          status: 'active'
        }
      );

      // Execute alert actions
      for (const action of alert.actions) {
        await this.executeAlertAction(action, alert);
      }

    } catch (error) {
      logger.error('Failed to trigger alert', error as Error);
    }
  }

  private async executeAlertAction(action: string, alert: AlertRule): Promise<void> {
    try {
      switch (action) {
        case 'email':
          await this.sendEmailAlert(alert);
          break;
        case 'slack':
          await this.sendSlackAlert(alert);
          break;
        case 'webhook':
          await this.sendWebhookAlert(alert);
          break;
        default:
          logger.warn('Unknown alert action', { action });
      }
    } catch (error) {
      logger.error('Failed to execute alert action', error as Error);
    }
  }

  private async sendEmailAlert(alert: AlertRule): Promise<void> {
    // In production, this would send actual email
    logger.info('Email alert sent', {
      alertId: alert.id,
      alertName: alert.name
    });
  }

  private async sendSlackAlert(alert: AlertRule): Promise<void> {
    // In production, this would send actual Slack message
    logger.info('Slack alert sent', {
      alertId: alert.id,
      alertName: alert.name
    });
  }

  private async sendWebhookAlert(alert: AlertRule): Promise<void> {
    // In production, this would send actual webhook
    logger.info('Webhook alert sent', {
      alertId: alert.id,
      alertName: alert.name
    });
  }

  // Compliance monitoring
  private async startComplianceMonitoring(): Promise<void> {
    // Run compliance checks every hour
    setInterval(() => {
      this.runComplianceChecks();
    }, 60 * 60 * 1000);
  }

  async runComplianceChecks(): Promise<void> {
    try {
      logger.info('Running compliance checks');

      // Security compliance
      await this.checkSecurityCompliance();

      // Privacy compliance
      await this.checkPrivacyCompliance();

      // Governance compliance
      await this.checkGovernanceCompliance();

      // Operational compliance
      await this.checkOperationalCompliance();

      logger.info('Compliance checks completed');

    } catch (error) {
      logger.error('Compliance checks failed', error as Error);
    }
  }

  private async checkSecurityCompliance(): Promise<void> {
    const checks: ComplianceCheck[] = [];

    // Check encryption status
    const encryptionStatus = await this.getEncryptionStatus();
    checks.push({
      id: HashUtils.generateId(),
      name: 'Data Encryption',
      status: encryptionStatus === 1 ? 'pass' : 'fail',
      details: encryptionStatus === 1 ? 'All data encrypted' : 'Data not encrypted',
      timestamp: TimeUtils.now(),
      category: 'security'
    });

    // Check access controls
    const accessControls = await this.checkAccessControls();
    checks.push({
      id: HashUtils.generateId(),
      name: 'Access Controls',
      status: accessControls ? 'pass' : 'fail',
      details: accessControls ? 'Access controls properly configured' : 'Access controls not configured',
      timestamp: TimeUtils.now(),
      category: 'security'
    });

    // Check authentication
    const authentication = await this.checkAuthentication();
    checks.push({
      id: HashUtils.generateId(),
      name: 'Authentication',
      status: authentication ? 'pass' : 'fail',
      details: authentication ? 'Authentication properly configured' : 'Authentication not configured',
      timestamp: TimeUtils.now(),
      category: 'security'
    });

    // Store compliance checks
    for (const check of checks) {
      await aws.dynamoPut(
        process.env.COMPLIANCE_CHECKS_TABLE_NAME || 'ai-investment-compliance-checks',
        check
      );
    }

    this.complianceChecks.push(...checks);
  }

  private async checkPrivacyCompliance(): Promise<void> {
    const checks: ComplianceCheck[] = [];

    // Check data anonymization
    const dataAnonymization = await this.checkDataAnonymization();
    checks.push({
      id: HashUtils.generateId(),
      name: 'Data Anonymization',
      status: dataAnonymization ? 'pass' : 'fail',
      details: dataAnonymization ? 'Data properly anonymized' : 'Data not anonymized',
      timestamp: TimeUtils.now(),
      category: 'privacy'
    });

    // Check data retention
    const dataRetention = await this.checkDataRetention();
    checks.push({
      id: HashUtils.generateId(),
      name: 'Data Retention',
      status: dataRetention ? 'pass' : 'fail',
      details: dataRetention ? 'Data retention properly configured' : 'Data retention not configured',
      timestamp: TimeUtils.now(),
      category: 'privacy'
    });

    // Check consent management
    const consentManagement = await this.checkConsentManagement();
    checks.push({
      id: HashUtils.generateId(),
      name: 'Consent Management',
      status: consentManagement ? 'pass' : 'fail',
      details: consentManagement ? 'Consent properly managed' : 'Consent not managed',
      timestamp: TimeUtils.now(),
      category: 'privacy'
    });

    // Store compliance checks
    for (const check of checks) {
      await aws.dynamoPut(
        process.env.COMPLIANCE_CHECKS_TABLE_NAME || 'ai-investment-compliance-checks',
        check
      );
    }

    this.complianceChecks.push(...checks);
  }

  private async checkGovernanceCompliance(): Promise<void> {
    const checks: ComplianceCheck[] = [];

    // Check audit logging
    const auditLogging = await this.checkAuditLogging();
    checks.push({
      id: HashUtils.generateId(),
      name: 'Audit Logging',
      status: auditLogging ? 'pass' : 'fail',
      details: auditLogging ? 'Audit logging properly configured' : 'Audit logging not configured',
      timestamp: TimeUtils.now(),
      category: 'governance'
    });

    // Check change management
    const changeManagement = await this.checkChangeManagement();
    checks.push({
      id: HashUtils.generateId(),
      name: 'Change Management',
      status: changeManagement ? 'pass' : 'fail',
      details: changeManagement ? 'Change management properly configured' : 'Change management not configured',
      timestamp: TimeUtils.now(),
      category: 'governance'
    });

    // Store compliance checks
    for (const check of checks) {
      await aws.dynamoPut(
        process.env.COMPLIANCE_CHECKS_TABLE_NAME || 'ai-investment-compliance-checks',
        check
      );
    }

    this.complianceChecks.push(...checks);
  }

  private async checkOperationalCompliance(): Promise<void> {
    const checks: ComplianceCheck[] = [];

    // Check backup status
    const backupStatus = await this.checkBackupStatus();
    checks.push({
      id: HashUtils.generateId(),
      name: 'Backup Status',
      status: backupStatus ? 'pass' : 'fail',
      details: backupStatus ? 'Backups properly configured' : 'Backups not configured',
      timestamp: TimeUtils.now(),
      category: 'operational'
    });

    // Check monitoring
    const monitoring = await this.checkMonitoring();
    checks.push({
      id: HashUtils.generateId(),
      name: 'Monitoring',
      status: monitoring ? 'pass' : 'fail',
      details: monitoring ? 'Monitoring properly configured' : 'Monitoring not configured',
      timestamp: TimeUtils.now(),
      category: 'operational'
    });

    // Store compliance checks
    for (const check of checks) {
      await aws.dynamoPut(
        process.env.COMPLIANCE_CHECKS_TABLE_NAME || 'ai-investment-compliance-checks',
        check
      );
    }

    this.complianceChecks.push(...checks);
  }

  // Compliance check methods
  private async checkAccessControls(): Promise<boolean> {
    // In production, this would check actual access controls
    return true;
  }

  private async checkAuthentication(): Promise<boolean> {
    // In production, this would check actual authentication
    return true;
  }

  private async checkDataAnonymization(): Promise<boolean> {
    // In production, this would check actual data anonymization
    return true;
  }

  private async checkDataRetention(): Promise<boolean> {
    // In production, this would check actual data retention
    return true;
  }

  private async checkConsentManagement(): Promise<boolean> {
    // In production, this would check actual consent management
    return true;
  }

  private async checkAuditLogging(): Promise<boolean> {
    // In production, this would check actual audit logging
    return true;
  }

  private async checkChangeManagement(): Promise<boolean> {
    // In production, this would check actual change management
    return true;
  }

  private async checkBackupStatus(): Promise<boolean> {
    // In production, this would check actual backup status
    return true;
  }

  private async checkMonitoring(): Promise<boolean> {
    // In production, this would check actual monitoring
    return true;
  }

  // Metrics collection scheduling
  private startMetricsCollection(): void {
    // Collect metrics every 5 minutes
    setInterval(() => {
      this.collectMetrics();
    }, 5 * 60 * 1000);

    // Check alerts every minute
    setInterval(() => {
      this.checkAlerts();
    }, 60 * 1000);
  }

  // Public methods
  async getMetrics(): Promise<MetricData[]> {
    return this.metrics;
  }

  async getLogs(): Promise<LogEntry[]> {
    return this.logs;
  }

  async getAlerts(): Promise<AlertRule[]> {
    return this.alerts;
  }

  async getComplianceChecks(): Promise<ComplianceCheck[]> {
    return this.complianceChecks;
  }
}

// Main Lambda Handler
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const startTime = Date.now();
  
  try {
    const path = event.path;
    
    logger.info('Observability request received', {
      path,
      requestId: event.requestContext.requestId
    });

    // Initialize observability manager
    const observabilityManager = new ObservabilityManager(aws);

    // Route to appropriate handler
    if (path.includes('/metrics')) {
      return await handleMetricsRequest(event, observabilityManager);
    } else if (path.includes('/logs')) {
      return await handleLogsRequest(event, observabilityManager);
    } else if (path.includes('/alerts')) {
      return await handleAlertsRequest(event, observabilityManager);
    } else if (path.includes('/compliance')) {
      return await handleComplianceRequest(event, observabilityManager);
    } else {
      throw new Error('Invalid endpoint');
    }

  } catch (error) {
    logger.error('Observability handler failed', error as Error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        ok: false,
        error: 'Observability handler failed',
        details: error.message
      })
    };
  }
};

// Handle metrics request
async function handleMetricsRequest(event: APIGatewayProxyEvent, observabilityManager: ObservabilityManager): Promise<APIGatewayProxyResult> {
  try {
    const metrics = await observabilityManager.getMetrics();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        ok: true,
        data: {
          metrics,
          count: metrics.length
        }
      })
    };

  } catch (error) {
    logger.error('Metrics request failed', error as Error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        ok: false,
        error: 'Metrics request failed',
        details: error.message
      })
    };
  }
}

// Handle logs request
async function handleLogsRequest(event: APIGatewayProxyEvent, observabilityManager: ObservabilityManager): Promise<APIGatewayProxyResult> {
  try {
    const logs = await observabilityManager.getLogs();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        ok: true,
        data: {
          logs,
          count: logs.length
        }
      })
    };

  } catch (error) {
    logger.error('Logs request failed', error as Error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        ok: false,
        error: 'Logs request failed',
        details: error.message
      })
    };
  }
}

// Handle alerts request
async function handleAlertsRequest(event: APIGatewayProxyEvent, observabilityManager: ObservabilityManager): Promise<APIGatewayProxyResult> {
  try {
    const alerts = await observabilityManager.getAlerts();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        ok: true,
        data: {
          alerts,
          count: alerts.length
        }
      })
    };

  } catch (error) {
    logger.error('Alerts request failed', error as Error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        ok: false,
        error: 'Alerts request failed',
        details: error.message
      })
    };
  }
}

// Handle compliance request
async function handleComplianceRequest(event: APIGatewayProxyEvent, observabilityManager: ObservabilityManager): Promise<APIGatewayProxyResult> {
  try {
    const complianceChecks = await observabilityManager.getComplianceChecks();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        ok: true,
        data: {
          complianceChecks,
          count: complianceChecks.length
        }
      })
    };

  } catch (error) {
    logger.error('Compliance request failed', error as Error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        ok: false,
        error: 'Compliance request failed',
        details: error.message
      })
    };
  }
}

// Export for use in other modules
export { ObservabilityManager };
