"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservabilityStack = void 0;
const cdk = require("aws-cdk-lib");
const cloudwatch = require("aws-cdk-lib/aws-cloudwatch");
const cloudwatch_actions = require("aws-cdk-lib/aws-cloudwatch-actions");
const sns = require("aws-cdk-lib/aws-sns");
class ObservabilityStack extends cdk.Stack {
    constructor(scope, id, props) {
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
            threshold: 10000,
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
            threshold: 100,
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
exports.ObservabilityStack = ObservabilityStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JzZXJ2YWJpbGl0eS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm9ic2VydmFiaWxpdHktc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLHlEQUF5RDtBQUN6RCx5RUFBeUU7QUFDekUsMkNBQTJDO0FBWTNDLE1BQWEsa0JBQW1CLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFJL0MsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUE4QjtRQUN0RSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4Qix1QkFBdUI7UUFDdkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRTtZQUNsRCxTQUFTLEVBQUUsc0JBQXNCO1lBQ2pDLFdBQVcsRUFBRSw2QkFBNkI7U0FDM0MsQ0FBQyxDQUFDO1FBRUgsdUJBQXVCO1FBQ3ZCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSx1QkFBdUIsRUFBRTtZQUN2RSxhQUFhLEVBQUUsc0JBQXNCO1NBQ3RDLENBQUMsQ0FBQztRQUVILHVCQUF1QjtRQUN2QixNQUFNLGtCQUFrQixHQUFHLElBQUksVUFBVSxDQUFDLFdBQVcsQ0FBQztZQUNwRCxLQUFLLEVBQUUsZUFBZTtZQUN0QixJQUFJLEVBQUU7Z0JBQ0osSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDO29CQUNwQixTQUFTLEVBQUUsWUFBWTtvQkFDdkIsVUFBVSxFQUFFLGFBQWE7b0JBQ3pCLGFBQWEsRUFBRTt3QkFDYixZQUFZLEVBQUUsS0FBSyxDQUFDLFlBQVksQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZO3FCQUN0RTtvQkFDRCxTQUFTLEVBQUUsS0FBSztvQkFDaEIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztp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Y0FBYyxFQUFFO1lBQ3RDLEtBQUssRUFBRSxRQUFRLENBQUMsU0FBUztZQUN6QixXQUFXLEVBQUUsOEJBQThCO1NBQzVDLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUU7WUFDN0MsS0FBSyxFQUFFLGVBQWUsQ0FBQyxTQUFTO1lBQ2hDLFdBQVcsRUFBRSx3QkFBd0I7U0FDdEMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBaFNELGdEQWdTQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBjbG91ZHdhdGNoIGZyb20gJ2F3cy1jZGstbGliL2F3cy1jbG91ZHdhdGNoJztcbmltcG9ydCAqIGFzIGNsb3Vkd2F0Y2hfYWN0aW9ucyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY2xvdWR3YXRjaC1hY3Rpb25zJztcbmltcG9ydCAqIGFzIHNucyBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtc25zJztcbmltcG9ydCAqIGFzIGxvZ3MgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxvZ3MnO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgeyBDb21wdXRlU3RhY2sgfSBmcm9tICcuL2NvbXB1dGUtc3RhY2snO1xuaW1wb3J0IHsgQXBpU3RhY2sgfSBmcm9tICcuL2FwaS1zdGFjayc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgT2JzZXJ2YWJpbGl0eVN0YWNrUHJvcHMgZXh0ZW5kcyBjZGsuU3RhY2tQcm9wcyB7XG4gIGNvbXB1dGVTdGFjazogQ29tcHV0ZVN0YWNrO1xuICBhcGlTdGFjazogQXBpU3RhY2s7XG59XG5cbmV4cG9ydCBjbGFzcyBPYnNlcnZhYmlsaXR5U3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBwdWJsaWMgcmVhZG9ubHkgZGFzaGJvYXJkOiBjbG91ZHdhdGNoLkRhc2hib2FyZDtcbiAgcHVibGljIHJlYWRvbmx5IGFsZXJ0VG9waWM6IHNucy5Ub3BpYztcblxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogT2JzZXJ2YWJpbGl0eVN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vIFNOUyBUb3BpYyBmb3IgYWxlcnRzXG4gICAgdGhpcy5hbGVydFRvcGljID0gbmV3IHNucy5Ub3BpYyh0aGlzLCAnQWxlcnRUb3BpYycsIHtcbiAgICAgIHRvcGljTmFtZTogJ2FpLWludmVzdG1lbnQtYWxlcnRzJyxcbiAgICAgIGRpc3BsYXlOYW1lOiAnQUkgSW52ZXN0bWVudCBTeXN0ZW0gQWxlcnRzJ1xuICAgIH0pO1xuXG4gICAgLy8gQ2xvdWRXYXRjaCBEYXNoYm9hcmRcbiAgICB0aGlzLmRhc2hib2FyZCA9IG5ldyBjbG91ZHdhdGNoLkRhc2hib2FyZCh0aGlzLCAnQUlJbnZlc3RtZW50RGFzaGJvYXJkJywge1xuICAgICAgZGFzaGJvYXJkTmFtZTogJ0FJLUludmVzdG1lbnQtU3lzdGVtJ1xuICAgIH0pO1xuXG4gICAgLy8gU3lzdGVtIEhlYWx0aCBXaWRnZXRcbiAgICBjb25zdCBzeXN0ZW1IZWFsdGhXaWRnZXQgPSBuZXcgY2xvdWR3YXRjaC5HcmFwaFdpZGdldCh7XG4gICAgICB0aXRsZTogJ1N5c3RlbSBIZWFsdGgnLFxuICAgICAgbGVmdDogW1xuICAgICAgICBuZXcgY2xvdWR3YXRjaC5NZXRyaWMoe1xuICAgICAgICAgIG5hbWVzcGFjZTogJ0FXUy9MYW1iZGEnLFxuICAgICAgICAgIG1ldHJpY05hbWU6ICdJbnZvY2F0aW9ucycsXG4gICAgICAgICAgZGltZW5zaW9uc01hcDoge1xuICAgICAgICAgICAgRnVuY3Rpb25OYW1lOiBwcm9wcy5jb21wdXRlU3RhY2suaW5nZXN0aW9uU29jaWFsRnVuY3Rpb24uZnVuY3Rpb25OYW1lXG4gICAgICAgICAgfSxcbiAgICAgICAgICBzdGF0aXN0aWM6ICdTdW0nLFxuICAgICAgICAgIHBlcmlvZDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoNSlcbiAgICAgICAgfSksXG4gICAgICAgIG5ldyBjbG91ZHdhdGNoLk1ldHJpYyh7XG4gICAgICAgICAgbmFtZXNwYWNlOiAnQVdTL0xhbWJkYScsXG4gICAgICAgICAgbWV0cmljTmFtZTogJ0Vycm9ycycsXG4gICAgICAgICAgZGltZW5zaW9uc01hcDoge1xuICAgICAgICAgICAgRnVuY3Rpb25OYW1lOiBwcm9wcy5jb21wdXRlU3RhY2suaW5nZXN0aW9uU29jaWFsRnVuY3Rpb24uZnVuY3Rpb25OYW1lXG4gICAgICAgICAgfSxcbiAgICAgICAgICBzdGF0aXN0aWM6ICdTdW0nLFxuICAgICAgICAgIHBlcmlvZDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoNSlcbiAgICAgICAgfSlcbiAgICAgIF0sXG4gICAgICB3aWR0aDogMTIsXG4gICAgICBoZWlnaHQ6IDZcbiAgICB9KTtcblxuICAgIC8vIFBlcmZvcm1hbmNlIE1ldHJpY3MgV2lkZ2V0XG4gICAgY29uc3QgcGVyZm9ybWFuY2VXaWRnZXQgPSBuZXcgY2xvdWR3YXRjaC5HcmFwaFdpZGdldCh7XG4gICAgICB0aXRsZTogJ1BlcmZvcm1hbmNlIE1ldHJpY3MnLFxuICAgICAgbGVmdDogW1xuICAgICAgICBuZXcgY2xvdWR3YXRjaC5NZXRyaWMoe1xuICAgICAgICAgIG5hbWVzcGFjZTogJ0FXUy9MYW1iZGEnLFxuICAgICAgICAgIG1ldHJpY05hbWU6ICdEdXJhdGlvbicsXG4gICAgICAgICAgZGltZW5zaW9uc01hcDoge1xuICAgICAgICAgICAgRnVuY3Rpb25OYW1lOiBwcm9wcy5jb21wdXRlU3RhY2suaW5nZXN0aW9uU29jaWFsRnVuY3Rpb24uZnVuY3Rpb25OYW1lXG4gICAgICAgICAgfSxcbiAgICAgICAgICBzdGF0aXN0aWM6ICdBdmVyYWdlJyxcbiAgICAgICAgICBwZXJpb2Q6IGNkay5EdXJhdGlvbi5taW51dGVzKDUpXG4gICAgICAgIH0pLFxuICAgICAgICBuZXcgY2xvdWR3YXRjaC5NZXRyaWMoe1xuICAgICAgICAgIG5hbWVzcGFjZTogJ0FXUy9MYW1iZGEnLFxuICAgICAgICAgIG1ldHJpY05hbWU6ICdEdXJhdGlvbicsXG4gICAgICAgICAgZGltZW5zaW9uc01hcDoge1xuICAgICAgICAgICAgRnVuY3Rpb25OYW1lOiBwcm9wcy5jb21wdXRlU3RhY2suc2NvcmluZ0Z1bmN0aW9uLmZ1bmN0aW9uTmFtZVxuICAgICAgICAgIH0sXG4gICAgICAgICAgc3RhdGlzdGljOiAnQXZlcmFnZScsXG4gICAgICAgICAgcGVyaW9kOiBjZGsuRHVyYXRpb24ubWludXRlcyg1KVxuICAgICAgICB9KVxuICAgICAgXSxcbiAgICAgIHdpZHRoOiAxMixcbiAgICAgIGhlaWdodDogNlxuICAgIH0pO1xuXG4gICAgLy8gRXJyb3IgUmF0ZSBXaWRnZXRcbiAgICBjb25zdCBlcnJvclJhdGVXaWRnZXQgPSBuZXcgY2xvdWR3YXRjaC5HcmFwaFdpZGdldCh7XG4gICAgICB0aXRsZTogJ0Vycm9yIFJhdGUnLFxuICAgICAgbGVmdDogW1xuICAgICAgICBuZXcgY2xvdWR3YXRjaC5NZXRyaWMoe1xuICAgICAgICAgIG5hbWVzcGFjZTogJ0FXUy9MYW1iZGEnLFxuICAgICAgICAgIG1ldHJpY05hbWU6ICdFcnJvcnMnLFxuICAgICAgICAgIGRpbWVuc2lvbnNNYXA6IHtcbiAgICAgICAgICAgIEZ1bmN0aW9uTmFtZTogcHJvcHMuY29tcHV0ZVN0YWNrLmluZ2VzdGlvblNvY2lhbEZ1bmN0aW9uLmZ1bmN0aW9uTmFtZVxuICAgICAgICAgIH0sXG4gICAgICAgICAgc3RhdGlzdGljOiAnU3VtJyxcbiAgICAgICAgICBwZXJpb2Q6IGNkay5EdXJhdGlvbi5taW51dGVzKDUpXG4gICAgICAgIH0pLFxuICAgICAgICBuZXcgY2xvdWR3YXRjaC5NZXRyaWMoe1xuICAgICAgICAgIG5hbWVzcGFjZTogJ0FXUy9MYW1iZGEnLFxuICAgICAgICAgIG1ldHJpY05hbWU6ICdFcnJvcnMnLFxuICAgICAgICAgIGRpbWVuc2lvbnNNYXA6IHtcbiAgICAgICAgICAgIEZ1bmN0aW9uTmFtZTogcHJvcHMuY29tcHV0ZVN0YWNrLnNjb3JpbmdGdW5jdGlvbi5mdW5jdGlvbk5hbWVcbiAgICAgICAgICB9LFxuICAgICAgICAgIHN0YXRpc3RpYzogJ1N1bScsXG4gICAgICAgICAgcGVyaW9kOiBjZGsuRHVyYXRpb24ubWludXRlcyg1KVxuICAgICAgICB9KVxuICAgICAgXSxcbiAgICAgIHdpZHRoOiAxMixcbiAgICAgIGhlaWdodDogNlxuICAgIH0pO1xuXG4gICAgLy8gQ29zdCBNZXRyaWNzIFdpZGdldFxuICAgIGNvbnN0IGNvc3RXaWRnZXQgPSBuZXcgY2xvdWR3YXRjaC5HcmFwaFdpZGdldCh7XG4gICAgICB0aXRsZTogJ0Nvc3QgTWV0cmljcycsXG4gICAgICBsZWZ0OiBbXG4gICAgICAgIG5ldyBjbG91ZHdhdGNoLk1ldHJpYyh7XG4gICAgICAgICAgbmFtZXNwYWNlOiAnQVdTL0JpbGxpbmcnLFxuICAgICAgICAgIG1ldHJpY05hbWU6ICdFc3RpbWF0ZWRDaGFyZ2VzJyxcbiAgICAgICAgICBkaW1lbnNpb25zTWFwOiB7XG4gICAgICAgICAgICBDdXJyZW5jeTogJ1VTRCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHN0YXRpc3RpYzogJ01heGltdW0nLFxuICAgICAgICAgIHBlcmlvZDogY2RrLkR1cmF0aW9uLmhvdXJzKDEpXG4gICAgICAgIH0pXG4gICAgICBdLFxuICAgICAgd2lkdGg6IDEyLFxuICAgICAgaGVpZ2h0OiA2XG4gICAgfSk7XG5cbiAgICAvLyBBZGQgd2lkZ2V0cyB0byBkYXNoYm9hcmRcbiAgICB0aGlzLmRhc2hib2FyZC5hZGRXaWRnZXRzKHN5c3RlbUhlYWx0aFdpZGdldCwgcGVyZm9ybWFuY2VXaWRnZXQpO1xuICAgIHRoaXMuZGFzaGJvYXJkLmFkZFdpZGdldHMoZXJyb3JSYXRlV2lkZ2V0LCBjb3N0V2lkZ2V0KTtcblxuICAgIC8vIENsb3VkV2F0Y2ggQWxhcm1zXG4gICAgLy8gSGlnaCBFcnJvciBSYXRlIEFsYXJtXG4gICAgY29uc3QgaGlnaEVycm9yUmF0ZUFsYXJtID0gbmV3IGNsb3Vkd2F0Y2guQWxhcm0odGhpcywgJ0hpZ2hFcnJvclJhdGVBbGFybScsIHtcbiAgICAgIGFsYXJtTmFtZTogJ0FJLUludmVzdG1lbnQtSGlnaC1FcnJvci1SYXRlJyxcbiAgICAgIG1ldHJpYzogbmV3IGNsb3Vkd2F0Y2guTWV0cmljKHtcbiAgICAgICAgbmFtZXNwYWNlOiAnQVdTL0xhbWJkYScsXG4gICAgICAgIG1ldHJpY05hbWU6ICdFcnJvcnMnLFxuICAgICAgICBkaW1lbnNpb25zTWFwOiB7XG4gICAgICAgICAgRnVuY3Rpb25OYW1lOiBwcm9wcy5jb21wdXRlU3RhY2suaW5nZXN0aW9uU29jaWFsRnVuY3Rpb24uZnVuY3Rpb25OYW1lXG4gICAgICAgIH0sXG4gICAgICAgIHN0YXRpc3RpYzogJ1N1bScsXG4gICAgICAgIHBlcmlvZDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoNSlcbiAgICAgIH0pLFxuICAgICAgdGhyZXNob2xkOiA1LFxuICAgICAgZXZhbHVhdGlvblBlcmlvZHM6IDIsXG4gICAgICB0cmVhdE1pc3NpbmdEYXRhOiBjbG91ZHdhdGNoLlRyZWF0TWlzc2luZ0RhdGEuTk9UX0JSRUFDSElOR1xuICAgIH0pO1xuXG4gICAgaGlnaEVycm9yUmF0ZUFsYXJtLmFkZEFsYXJtQWN0aW9uKG5ldyBjbG91ZHdhdGNoX2FjdGlvbnMuU25zQWN0aW9uKHRoaXMuYWxlcnRUb3BpYykpO1xuXG4gICAgLy8gSGlnaCBMYXRlbmN5IEFsYXJtXG4gICAgY29uc3QgaGlnaExhdGVuY3lBbGFybSA9IG5ldyBjbG91ZHdhdGNoLkFsYXJtKHRoaXMsICdIaWdoTGF0ZW5jeUFsYXJtJywge1xuICAgICAgYWxhcm1OYW1lOiAnQUktSW52ZXN0bWVudC1IaWdoLUxhdGVuY3knLFxuICAgICAgbWV0cmljOiBuZXcgY2xvdWR3YXRjaC5NZXRyaWMoe1xuICAgICAgICBuYW1lc3BhY2U6ICdBV1MvTGFtYmRhJyxcbiAgICAgICAgbWV0cmljTmFtZTogJ0R1cmF0aW9uJyxcbiAgICAgICAgZGltZW5zaW9uc01hcDoge1xuICAgICAgICAgIEZ1bmN0aW9uTmFtZTogcHJvcHMuY29tcHV0ZVN0YWNrLnNjb3JpbmdGdW5jdGlvbi5mdW5jdGlvbk5hbWVcbiAgICAgICAgfSxcbiAgICAgICAgc3RhdGlzdGljOiAnQXZlcmFnZScsXG4gICAgICAgIHBlcmlvZDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoNSlcbiAgICAgIH0pLFxuICAgICAgdGhyZXNob2xkOiAxMDAwMCwgLy8gMTAgc2Vjb25kc1xuICAgICAgZXZhbHVhdGlvblBlcmlvZHM6IDMsXG4gICAgICB0cmVhdE1pc3NpbmdEYXRhOiBjbG91ZHdhdGNoLlRyZWF0TWlzc2luZ0RhdGEuTk9UX0JSRUFDSElOR1xuICAgIH0pO1xuXG4gICAgaGlnaExhdGVuY3lBbGFybS5hZGRBbGFybUFjdGlvbihuZXcgY2xvdWR3YXRjaF9hY3Rpb25zLlNuc0FjdGlvbih0aGlzLmFsZXJ0VG9waWMpKTtcblxuICAgIC8vIFRocm90dGxpbmcgQWxhcm1cbiAgICBjb25zdCB0aHJvdHRsaW5nQWxhcm0gPSBuZXcgY2xvdWR3YXRjaC5BbGFybSh0aGlzLCAnVGhyb3R0bGluZ0FsYXJtJywge1xuICAgICAgYWxhcm1OYW1lOiAnQUktSW52ZXN0bWVudC1UaHJvdHRsaW5nJyxcbiAgICAgIG1ldHJpYzogbmV3IGNsb3Vkd2F0Y2guTWV0cmljKHtcbiAgICAgICAgbmFtZXNwYWNlOiAnQVdTL0xhbWJkYScsXG4gICAgICAgIG1ldHJpY05hbWU6ICdUaHJvdHRsZXMnLFxuICAgICAgICBkaW1lbnNpb25zTWFwOiB7XG4gICAgICAgICAgRnVuY3Rpb25OYW1lOiBwcm9wcy5jb21wdXRlU3RhY2suaW5nZXN0aW9uU29jaWFsRnVuY3Rpb24uZnVuY3Rpb25OYW1lXG4gICAgICAgIH0sXG4gICAgICAgIHN0YXRpc3RpYzogJ1N1bScsXG4gICAgICAgIHBlcmlvZDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoNSlcbiAgICAgIH0pLFxuICAgICAgdGhyZXNob2xkOiAxLFxuICAgICAgZXZhbHVhdGlvblBlcmlvZHM6IDEsXG4gICAgICB0cmVhdE1pc3NpbmdEYXRhOiBjbG91ZHdhdGNoLlRyZWF0TWlzc2luZ0RhdGEuTk9UX0JSRUFDSElOR1xuICAgIH0pO1xuXG4gICAgdGhyb3R0bGluZ0FsYXJtLmFkZEFsYXJtQWN0aW9uKG5ldyBjbG91ZHdhdGNoX2FjdGlvbnMuU25zQWN0aW9uKHRoaXMuYWxlcnRUb3BpYykpO1xuXG4gICAgLy8gRGVhZCBMZXR0ZXIgUXVldWUgQWxhcm1cbiAgICBjb25zdCBkbHFBbGFybSA9IG5ldyBjbG91ZHdhdGNoLkFsYXJtKHRoaXMsICdETFFBbGFybScsIHtcbiAgICAgIGFsYXJtTmFtZTogJ0FJLUludmVzdG1lbnQtRExRLU1lc3NhZ2VzJyxcbiAgICAgIG1ldHJpYzogbmV3IGNsb3Vkd2F0Y2guTWV0cmljKHtcbiAgICAgICAgbmFtZXNwYWNlOiAnQVdTL1NRUycsXG4gICAgICAgIG1ldHJpY05hbWU6ICdBcHByb3hpbWF0ZU51bWJlck9mVmlzaWJsZU1lc3NhZ2VzJyxcbiAgICAgICAgZGltZW5zaW9uc01hcDoge1xuICAgICAgICAgIFF1ZXVlTmFtZTogJ2FpLWludmVzdG1lbnQtc29jaWFsLWluZ2VzdGlvbi1kbHEnXG4gICAgICAgIH0sXG4gICAgICAgIHN0YXRpc3RpYzogJ0F2ZXJhZ2UnLFxuICAgICAgICBwZXJpb2Q6IGNkay5EdXJhdGlvbi5taW51dGVzKDUpXG4gICAgICB9KSxcbiAgICAgIHRocmVzaG9sZDogMSxcbiAgICAgIGV2YWx1YXRpb25QZXJpb2RzOiAxLFxuICAgICAgdHJlYXRNaXNzaW5nRGF0YTogY2xvdWR3YXRjaC5UcmVhdE1pc3NpbmdEYXRhLk5PVF9CUkVBQ0hJTkdcbiAgICB9KTtcblxuICAgIGRscUFsYXJtLmFkZEFsYXJtQWN0aW9uKG5ldyBjbG91ZHdhdGNoX2FjdGlvbnMuU25zQWN0aW9uKHRoaXMuYWxlcnRUb3BpYykpO1xuXG4gICAgLy8gQ29zdCBCdWRnZXQgQWxhcm1cbiAgICBjb25zdCBjb3N0QnVkZ2V0QWxhcm0gPSBuZXcgY2xvdWR3YXRjaC5BbGFybSh0aGlzLCAnQ29zdEJ1ZGdldEFsYXJtJywge1xuICAgICAgYWxhcm1OYW1lOiAnQUktSW52ZXN0bWVudC1Db3N0LUJ1ZGdldCcsXG4gICAgICBtZXRyaWM6IG5ldyBjbG91ZHdhdGNoLk1ldHJpYyh7XG4gICAgICAgIG5hbWVzcGFjZTogJ0FXUy9CaWxsaW5nJyxcbiAgICAgICAgbWV0cmljTmFtZTogJ0VzdGltYXRlZENoYXJnZXMnLFxuICAgICAgICBkaW1lbnNpb25zTWFwOiB7XG4gICAgICAgICAgQ3VycmVuY3k6ICdVU0QnXG4gICAgICAgIH0sXG4gICAgICAgIHN0YXRpc3RpYzogJ01heGltdW0nLFxuICAgICAgICBwZXJpb2Q6IGNkay5EdXJhdGlvbi5ob3VycygxKVxuICAgICAgfSksXG4gICAgICB0aHJlc2hvbGQ6IDEwMCwgLy8gJDEwMFxuICAgICAgZXZhbHVhdGlvblBlcmlvZHM6IDEsXG4gICAgICB0cmVhdE1pc3NpbmdEYXRhOiBjbG91ZHdhdGNoLlRyZWF0TWlzc2luZ0RhdGEuTk9UX0JSRUFDSElOR1xuICAgIH0pO1xuXG4gICAgY29zdEJ1ZGdldEFsYXJtLmFkZEFsYXJtQWN0aW9uKG5ldyBjbG91ZHdhdGNoX2FjdGlvbnMuU25zQWN0aW9uKHRoaXMuYWxlcnRUb3BpYykpO1xuXG4gICAgLy8gTG9nIEdyb3Vwc1xuICAgIGNvbnN0IGxvZ0dyb3VwcyA9IFtcbiAgICAgIHByb3BzLmNvbXB1dGVTdGFjay5pbmdlc3Rpb25Tb2NpYWxGdW5jdGlvbi5sb2dHcm91cCxcbiAgICAgIHByb3BzLmNvbXB1dGVTdGFjay5pbmdlc3Rpb25OZXdzRnVuY3Rpb24ubG9nR3JvdXAsXG4gICAgICBwcm9wcy5jb21wdXRlU3RhY2suc2NvcmluZ0Z1bmN0aW9uLmxvZ0dyb3VwLFxuICAgICAgcHJvcHMuY29tcHV0ZVN0YWNrLm9yY2hlc3RyYXRvckZ1bmN0aW9uLmxvZ0dyb3VwLFxuICAgICAgcHJvcHMuY29tcHV0ZVN0YWNrLmV2YWx1YXRpb25GdW5jdGlvbi5sb2dHcm91cCxcbiAgICAgIHByb3BzLmNvbXB1dGVTdGFjay5zdHJlYW1pbmdGdW5jdGlvbi5sb2dHcm91cFxuICAgIF07XG5cbiAgICAvLyBTZXQgbG9nIHJldGVudGlvbiBmb3IgYWxsIGxvZyBncm91cHNcbiAgICBsb2dHcm91cHMuZm9yRWFjaChsb2dHcm91cCA9PiB7XG4gICAgICBpZiAobG9nR3JvdXApIHtcbiAgICAgICAgLy8gTm90ZTogYWRkUmV0ZW50aW9uT3ZlcnJpZGUgaXMgbm90IGF2YWlsYWJsZSBpbiB0aGlzIENESyB2ZXJzaW9uXG4gICAgICAgIC8vIExvZyByZXRlbnRpb24gaXMgc2V0IHZpYSBDbG91ZFdhdGNoIExvZ3MgY29uZmlndXJhdGlvblxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gQ3VzdG9tIE1ldHJpY3NcbiAgICBjb25zdCBjdXN0b21NZXRyaWNzID0gbmV3IGNsb3Vkd2F0Y2guTWV0cmljKHtcbiAgICAgIG5hbWVzcGFjZTogJ0FJLUludmVzdG1lbnQnLFxuICAgICAgbWV0cmljTmFtZTogJ1NpZ25hbHNQcm9jZXNzZWQnLFxuICAgICAgc3RhdGlzdGljOiAnU3VtJyxcbiAgICAgIHBlcmlvZDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoNSlcbiAgICB9KTtcblxuICAgIGNvbnN0IHNpZ25hbHNQcm9jZXNzZWRXaWRnZXQgPSBuZXcgY2xvdWR3YXRjaC5HcmFwaFdpZGdldCh7XG4gICAgICB0aXRsZTogJ1NpZ25hbHMgUHJvY2Vzc2VkJyxcbiAgICAgIGxlZnQ6IFtjdXN0b21NZXRyaWNzXSxcbiAgICAgIHdpZHRoOiAxMixcbiAgICAgIGhlaWdodDogNlxuICAgIH0pO1xuXG4gICAgdGhpcy5kYXNoYm9hcmQuYWRkV2lkZ2V0cyhzaWduYWxzUHJvY2Vzc2VkV2lkZ2V0KTtcblxuICAgIC8vIE91dHB1dHNcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnRGFzaGJvYXJkVXJsJywge1xuICAgICAgdmFsdWU6IGBodHRwczovL2NvbnNvbGUuYXdzLmFtYXpvbi5jb20vY2xvdWR3YXRjaC9ob21lP3JlZ2lvbj0ke3RoaXMucmVnaW9ufSNkYXNoYm9hcmRzOm5hbWU9JHt0aGlzLmRhc2hib2FyZC5kYXNoYm9hcmROYW1lfWAsXG4gICAgICBkZXNjcmlwdGlvbjogJ0Nsb3VkV2F0Y2ggRGFzaGJvYXJkIFVSTCdcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdBbGVydFRvcGljQXJuJywge1xuICAgICAgdmFsdWU6IHRoaXMuYWxlcnRUb3BpYy50b3BpY0FybixcbiAgICAgIGRlc2NyaXB0aW9uOiAnU05TIEFsZXJ0IFRvcGljIEFSTidcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdIaWdoRXJyb3JSYXRlQWxhcm1OYW1lJywge1xuICAgICAgdmFsdWU6IGhpZ2hFcnJvclJhdGVBbGFybS5hbGFybU5hbWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ0hpZ2ggRXJyb3IgUmF0ZSBBbGFybSBOYW1lJ1xuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0hpZ2hMYXRlbmN5QWxhcm1OYW1lJywge1xuICAgICAgdmFsdWU6IGhpZ2hMYXRlbmN5QWxhcm0uYWxhcm1OYW1lLFxuICAgICAgZGVzY3JpcHRpb246ICdIaWdoIExhdGVuY3kgQWxhcm0gTmFtZSdcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdUaHJvdHRsaW5nQWxhcm1OYW1lJywge1xuICAgICAgdmFsdWU6IHRocm90dGxpbmdBbGFybS5hbGFybU5hbWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ1Rocm90dGxpbmcgQWxhcm0gTmFtZSdcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdETFFBbGFybU5hbWUnLCB7XG4gICAgICB2YWx1ZTogZGxxQWxhcm0uYWxhcm1OYW1lLFxuICAgICAgZGVzY3JpcHRpb246ICdEZWFkIExldHRlciBRdWV1ZSBBbGFybSBOYW1lJ1xuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0Nvc3RCdWRnZXRBbGFybU5hbWUnLCB7XG4gICAgICB2YWx1ZTogY29zdEJ1ZGdldEFsYXJtLmFsYXJtTmFtZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ29zdCBCdWRnZXQgQWxhcm0gTmFtZSdcbiAgICB9KTtcbiAgfVxufVxuIl19