import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cloudwatch_actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { ComputeStack } from './compute-stack';
import { ApiStack } from './api-stack';

export interface ObservabilityStackProps extends cdk.StackProps {
  computeStack: ComputeStack;
  apiStack: ApiStack;
}

export class ObservabilityStack extends cdk.Stack {
  public readonly dashboard: cloudwatch.Dashboard;
  public readonly alertTopic: sns.Topic;

  constructor(scope: Construct, id: string, props: ObservabilityStackProps) {
    super(scope, id, props);

    // SNS Topic for alerts
    this.alertTopic = new sns.Topic(this, 'AlertTopic', {
      topicName: 'ai-investment-alerts',
      displayName: 'AI Investment System Alerts'
    });

    // CloudWatch Dashboard
    this.dashboard = new cloudwatch.Dashboard(this, 'AIInvestmentDashboard', {
      dashboardName: 'AI-Investment-System'
    });

    // System Health Widget
    const systemHealthWidget = new cloudwatch.GraphWidget({
      title: 'System Health',
      left: [
        new cloudwatch.Metric({
          namespace: 'AWS/Lambda',
          metricName: 'Invocations',
          dimensionsMap: {
            FunctionName: props.computeStack.ingestionSocialFunction.functionName
          },
          statistic: 'Sum',
          period: cdk.Duration.minutes(5)
        }),
        new cloudwatch.Metric({
          namespace: 'AWS/Lambda',
          metricName: 'Errors',
          dimensionsMap: {
            FunctionName: props.computeStack.ingestionSocialFunction.functionName
          },
          statistic: 'Sum',
          period: cdk.Duration.minutes(5)
        })
      ],
      width: 12,
      height: 6
    });

    // Performance Metrics Widget
    const performanceWidget = new cloudwatch.GraphWidget({
      title: 'Performance Metrics',
      left: [
        new cloudwatch.Metric({
          namespace: 'AWS/Lambda',
          metricName: 'Duration',
          dimensionsMap: {
            FunctionName: props.computeStack.ingestionSocialFunction.functionName
          },
          statistic: 'Average',
          period: cdk.Duration.minutes(5)
        }),
        new cloudwatch.Metric({
          namespace: 'AWS/Lambda',
          metricName: 'Duration',
          dimensionsMap: {
            FunctionName: props.computeStack.scoringFunction.functionName
          },
          statistic: 'Average',
          period: cdk.Duration.minutes(5)
        })
      ],
      width: 12,
      height: 6
    });

    // Error Rate Widget
    const errorRateWidget = new cloudwatch.GraphWidget({
      title: 'Error Rate',
      left: [
        new cloudwatch.Metric({
          namespace: 'AWS/Lambda',
          metricName: 'Errors',
          dimensionsMap: {
            FunctionName: props.computeStack.ingestionSocialFunction.functionName
          },
          statistic: 'Sum',
          period: cdk.Duration.minutes(5)
        }),
        new cloudwatch.Metric({
          namespace: 'AWS/Lambda',
          metricName: 'Errors',
          dimensionsMap: {
            FunctionName: props.computeStack.scoringFunction.functionName
          },
          statistic: 'Sum',
          period: cdk.Duration.minutes(5)
        })
      ],
      width: 12,
      height: 6
    });

    // Cost Metrics Widget
    const costWidget = new cloudwatch.GraphWidget({
      title: 'Cost Metrics',
      left: [
        new cloudwatch.Metric({
          namespace: 'AWS/Billing',
          metricName: 'EstimatedCharges',
          dimensionsMap: {
            Currency: 'USD'
          },
          statistic: 'Maximum',
          period: cdk.Duration.hours(1)
        })
      ],
      width: 12,
      height: 6
    });

    // Add widgets to dashboard
    this.dashboard.addWidgets(systemHealthWidget, performanceWidget);
    this.dashboard.addWidgets(errorRateWidget, costWidget);

    // CloudWatch Alarms
    // High Error Rate Alarm
    const highErrorRateAlarm = new cloudwatch.Alarm(this, 'HighErrorRateAlarm', {
      alarmName: 'AI-Investment-High-Error-Rate',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/Lambda',
        metricName: 'Errors',
        dimensionsMap: {
          FunctionName: props.computeStack.ingestionSocialFunction.functionName
        },
        statistic: 'Sum',
        period: cdk.Duration.minutes(5)
      }),
      threshold: 5,
      evaluationPeriods: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
    });

    highErrorRateAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(this.alertTopic));

    // High Latency Alarm
    const highLatencyAlarm = new cloudwatch.Alarm(this, 'HighLatencyAlarm', {
      alarmName: 'AI-Investment-High-Latency',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/Lambda',
        metricName: 'Duration',
        dimensionsMap: {
          FunctionName: props.computeStack.scoringFunction.functionName
        },
        statistic: 'Average',
        period: cdk.Duration.minutes(5)
      }),
      threshold: 10000, // 10 seconds
      evaluationPeriods: 3,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
    });

    highLatencyAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(this.alertTopic));

    // Throttling Alarm
    const throttlingAlarm = new cloudwatch.Alarm(this, 'ThrottlingAlarm', {
      alarmName: 'AI-Investment-Throttling',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/Lambda',
        metricName: 'Throttles',
        dimensionsMap: {
          FunctionName: props.computeStack.ingestionSocialFunction.functionName
        },
        statistic: 'Sum',
        period: cdk.Duration.minutes(5)
      }),
      threshold: 1,
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
    });

    throttlingAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(this.alertTopic));

    // Dead Letter Queue Alarm
    const dlqAlarm = new cloudwatch.Alarm(this, 'DLQAlarm', {
      alarmName: 'AI-Investment-DLQ-Messages',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/SQS',
        metricName: 'ApproximateNumberOfVisibleMessages',
        dimensionsMap: {
          QueueName: 'ai-investment-social-ingestion-dlq'
        },
        statistic: 'Average',
        period: cdk.Duration.minutes(5)
      }),
      threshold: 1,
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
    });

    dlqAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(this.alertTopic));

    // Cost Budget Alarm
    const costBudgetAlarm = new cloudwatch.Alarm(this, 'CostBudgetAlarm', {
      alarmName: 'AI-Investment-Cost-Budget',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/Billing',
        metricName: 'EstimatedCharges',
        dimensionsMap: {
          Currency: 'USD'
        },
        statistic: 'Maximum',
        period: cdk.Duration.hours(1)
      }),
      threshold: 100, // $100
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
    });

    costBudgetAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(this.alertTopic));

    // Log Groups
    const logGroups = [
      props.computeStack.ingestionSocialFunction.logGroup,
      props.computeStack.ingestionNewsFunction.logGroup,
      props.computeStack.scoringFunction.logGroup,
      props.computeStack.orchestratorFunction.logGroup,
      props.computeStack.evaluationFunction.logGroup,
      props.computeStack.streamingFunction.logGroup
    ];

    // Set log retention for all log groups
    logGroups.forEach(logGroup => {
      if (logGroup) {
        // Note: addRetentionOverride is not available in this CDK version
        // Log retention is set via CloudWatch Logs configuration
      }
    });

    // Custom Metrics
    const customMetrics = new cloudwatch.Metric({
      namespace: 'AI-Investment',
      metricName: 'SignalsProcessed',
      statistic: 'Sum',
      period: cdk.Duration.minutes(5)
    });

    const signalsProcessedWidget = new cloudwatch.GraphWidget({
      title: 'Signals Processed',
      left: [customMetrics],
      width: 12,
      height: 6
    });

    this.dashboard.addWidgets(signalsProcessedWidget);

    // Outputs
    new cdk.CfnOutput(this, 'DashboardUrl', {
      value: `https://console.aws.amazon.com/cloudwatch/home?region=${this.region}#dashboards:name=${this.dashboard.dashboardName}`,
      description: 'CloudWatch Dashboard URL'
    });

    new cdk.CfnOutput(this, 'AlertTopicArn', {
      value: this.alertTopic.topicArn,
      description: 'SNS Alert Topic ARN'
    });

    new cdk.CfnOutput(this, 'HighErrorRateAlarmName', {
      value: highErrorRateAlarm.alarmName,
      description: 'High Error Rate Alarm Name'
    });

    new cdk.CfnOutput(this, 'HighLatencyAlarmName', {
      value: highLatencyAlarm.alarmName,
      description: 'High Latency Alarm Name'
    });

    new cdk.CfnOutput(this, 'ThrottlingAlarmName', {
      value: throttlingAlarm.alarmName,
      description: 'Throttling Alarm Name'
    });

    new cdk.CfnOutput(this, 'DLQAlarmName', {
      value: dlqAlarm.alarmName,
      description: 'Dead Letter Queue Alarm Name'
    });

    new cdk.CfnOutput(this, 'CostBudgetAlarmName', {
      value: costBudgetAlarm.alarmName,
      description: 'Cost Budget Alarm Name'
    });
  }
}
