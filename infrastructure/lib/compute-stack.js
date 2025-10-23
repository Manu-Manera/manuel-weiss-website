"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComputeStack = void 0;
const cdk = require("aws-cdk-lib");
const lambda = require("aws-cdk-lib/aws-lambda");
const sqs = require("aws-cdk-lib/aws-sqs");
const events = require("aws-cdk-lib/aws-events");
const targets = require("aws-cdk-lib/aws-events-targets");
const iam = require("aws-cdk-lib/aws-iam");
class ComputeStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // Lambda Layer for common dependencies
        const commonLayer = new lambda.LayerVersion(this, 'CommonLayer', {
            code: lambda.Code.fromAsset('lambda/layers/common'),
            compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
            description: 'Common dependencies for AI Investment System'
        });
        // SQS Queues
        const socialIngestionQueue = new sqs.Queue(this, 'SocialIngestionQueue', {
            queueName: 'ai-investment-social-ingestion',
            visibilityTimeout: cdk.Duration.minutes(5),
            retentionPeriod: cdk.Duration.days(14),
            deadLetterQueue: {
                queue: new sqs.Queue(this, 'SocialIngestionDLQ', {
                    queueName: 'ai-investment-social-ingestion-dlq',
                    retentionPeriod: cdk.Duration.days(14)
                }),
                maxReceiveCount: 3
            }
        });
        const newsIngestionQueue = new sqs.Queue(this, 'NewsIngestionQueue', {
            queueName: 'ai-investment-news-ingestion',
            visibilityTimeout: cdk.Duration.minutes(5),
            retentionPeriod: cdk.Duration.days(14),
            deadLetterQueue: {
                queue: new sqs.Queue(this, 'NewsIngestionDLQ', {
                    queueName: 'ai-investment-news-ingestion-dlq',
                    retentionPeriod: cdk.Duration.days(14)
                }),
                maxReceiveCount: 3
            }
        });
        const scoringQueue = new sqs.Queue(this, 'ScoringQueue', {
            queueName: 'ai-investment-scoring',
            visibilityTimeout: cdk.Duration.minutes(10),
            retentionPeriod: cdk.Duration.days(14),
            deadLetterQueue: {
                queue: new sqs.Queue(this, 'ScoringDLQ', {
                    queueName: 'ai-investment-scoring-dlq',
                    retentionPeriod: cdk.Duration.days(14)
                }),
                maxReceiveCount: 3
            }
        });
        // IAM Role for Lambda functions
        const lambdaExecutionRole = new iam.Role(this, 'LambdaExecutionRole', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
            ],
            inlinePolicies: {
                DynamoDBAccess: new iam.PolicyDocument({
                    statements: [
                        new iam.PolicyStatement({
                            effect: iam.Effect.ALLOW,
                            actions: [
                                'dynamodb:GetItem',
                                'dynamodb:PutItem',
                                'dynamodb:UpdateItem',
                                'dynamodb:DeleteItem',
                                'dynamodb:Query',
                                'dynamodb:Scan',
                                'dynamodb:BatchGetItem',
                                'dynamodb:BatchWriteItem'
                            ],
                            resources: [
                                props.dataStack.signalsTable.tableArn,
                                props.dataStack.proposalsTable.tableArn,
                                props.dataStack.outcomesTable.tableArn,
                                props.dataStack.agentsConfigTable.tableArn,
                                props.dataStack.trackedEntitiesTable.tableArn,
                                `${props.dataStack.signalsTable.tableArn}/index/*`,
                                `${props.dataStack.proposalsTable.tableArn}/index/*`,
                                `${props.dataStack.outcomesTable.tableArn}/index/*`
                            ]
                        })
                    ]
                }),
                S3Access: new iam.PolicyDocument({
                    statements: [
                        new iam.PolicyStatement({
                            effect: iam.Effect.ALLOW,
                            actions: [
                                's3:GetObject',
                                's3:PutObject',
                                's3:DeleteObject',
                                's3:ListBucket'
                            ],
                            resources: [
                                props.dataStack.rawDataBucket.bucketArn,
                                props.dataStack.curatedDataBucket.bucketArn,
                                props.dataStack.featuresBucket.bucketArn,
                                props.dataStack.backtestsBucket.bucketArn,
                                props.dataStack.evalBucket.bucketArn,
                                `${props.dataStack.rawDataBucket.bucketArn}/*`,
                                `${props.dataStack.curatedDataBucket.bucketArn}/*`,
                                `${props.dataStack.featuresBucket.bucketArn}/*`,
                                `${props.dataStack.backtestsBucket.bucketArn}/*`,
                                `${props.dataStack.evalBucket.bucketArn}/*`
                            ]
                        })
                    ]
                }),
                SecretsManagerAccess: new iam.PolicyDocument({
                    statements: [
                        new iam.PolicyStatement({
                            effect: iam.Effect.ALLOW,
                            actions: [
                                'secretsmanager:GetSecretValue',
                                'secretsmanager:DescribeSecret'
                            ],
                            resources: ['arn:aws:secretsmanager:*:*:secret:ai-investment-*']
                        })
                    ]
                }),
                SQSAccess: new iam.PolicyDocument({
                    statements: [
                        new iam.PolicyStatement({
                            effect: iam.Effect.ALLOW,
                            actions: [
                                'sqs:SendMessage',
                                'sqs:ReceiveMessage',
                                'sqs:DeleteMessage',
                                'sqs:GetQueueAttributes'
                            ],
                            resources: [
                                socialIngestionQueue.queueArn,
                                newsIngestionQueue.queueArn,
                                scoringQueue.queueArn
                            ]
                        })
                    ]
                })
            }
        });
        // Social Media Ingestion Function
        this.ingestionSocialFunction = new lambda.Function(this, 'IngestionSocialFunction', {
            functionName: 'ai-investment-ingest-social',
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('lambda/ingestion-social'),
            layers: [commonLayer],
            role: lambdaExecutionRole,
            timeout: cdk.Duration.minutes(5),
            memorySize: 1024,
            environment: {
                SIGNALS_TABLE_NAME: props.dataStack.signalsTable.tableName,
                RAW_DATA_BUCKET: props.dataStack.rawDataBucket.bucketName,
                SECRETS_MANAGER_SECRET_ID: 'ai-investment-secrets',
                NODE_ENV: 'production'
            },
        });
        // News Ingestion Function
        this.ingestionNewsFunction = new lambda.Function(this, 'IngestionNewsFunction', {
            functionName: 'ai-investment-ingest-news',
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('lambda/ingestion-news'),
            layers: [commonLayer],
            role: lambdaExecutionRole,
            timeout: cdk.Duration.minutes(5),
            memorySize: 1024,
            environment: {
                SIGNALS_TABLE_NAME: props.dataStack.signalsTable.tableName,
                RAW_DATA_BUCKET: props.dataStack.rawDataBucket.bucketName,
                SECRETS_MANAGER_SECRET_ID: 'ai-investment-secrets',
                NODE_ENV: 'production'
            },
        });
        // Scoring Function
        this.scoringFunction = new lambda.Function(this, 'ScoringFunction', {
            functionName: 'ai-investment-score',
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('lambda/scoring'),
            layers: [commonLayer],
            role: lambdaExecutionRole,
            timeout: cdk.Duration.minutes(10),
            memorySize: 2048,
            environment: {
                SIGNALS_TABLE_NAME: props.dataStack.signalsTable.tableName,
                FEATURES_BUCKET: props.dataStack.featuresBucket.bucketName,
                SECRETS_MANAGER_SECRET_ID: 'ai-investment-secrets',
                NODE_ENV: 'production'
            },
        });
        // Orchestrator Function
        this.orchestratorFunction = new lambda.Function(this, 'OrchestratorFunction', {
            functionName: 'ai-investment-orchestrator',
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('lambda/orchestrator'),
            layers: [commonLayer],
            role: lambdaExecutionRole,
            timeout: cdk.Duration.minutes(15),
            memorySize: 2048,
            environment: {
                SIGNALS_TABLE_NAME: props.dataStack.signalsTable.tableName,
                PROPOSALS_TABLE_NAME: props.dataStack.proposalsTable.tableName,
                AGENTS_CONFIG_TABLE_NAME: props.dataStack.agentsConfigTable.tableName,
                SECRETS_MANAGER_SECRET_ID: 'ai-investment-secrets',
                NODE_ENV: 'production'
            },
        });
        // Evaluation Function
        this.evaluationFunction = new lambda.Function(this, 'EvaluationFunction', {
            functionName: 'ai-investment-evaluation',
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('lambda/evaluation'),
            layers: [commonLayer],
            role: lambdaExecutionRole,
            timeout: cdk.Duration.minutes(20),
            memorySize: 2048,
            environment: {
                PROPOSALS_TABLE_NAME: props.dataStack.proposalsTable.tableName,
                OUTCOMES_TABLE_NAME: props.dataStack.outcomesTable.tableName,
                EVAL_BUCKET: props.dataStack.evalBucket.bucketName,
                SECRETS_MANAGER_SECRET_ID: 'ai-investment-secrets',
                NODE_ENV: 'production'
            },
        });
        // Streaming Function
        this.streamingFunction = new lambda.Function(this, 'StreamingFunction', {
            functionName: 'ai-investment-streaming',
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('lambda/streaming'),
            layers: [commonLayer],
            role: lambdaExecutionRole,
            timeout: cdk.Duration.minutes(5),
            memorySize: 1024,
            environment: {
                SIGNALS_TABLE_NAME: props.dataStack.signalsTable.tableName,
                PROPOSALS_TABLE_NAME: props.dataStack.proposalsTable.tableName,
                NODE_ENV: 'production'
            },
        });
        // EventBridge Schedules
        const socialIngestionSchedule = new events.Rule(this, 'SocialIngestionSchedule', {
            ruleName: 'ai-investment-social-ingestion-schedule',
            schedule: events.Schedule.rate(cdk.Duration.minutes(1)),
            description: 'Trigger social media ingestion every minute'
        });
        socialIngestionSchedule.addTarget(new targets.LambdaFunction(this.ingestionSocialFunction));
        const newsIngestionSchedule = new events.Rule(this, 'NewsIngestionSchedule', {
            ruleName: 'ai-investment-news-ingestion-schedule',
            schedule: events.Schedule.rate(cdk.Duration.minutes(5)),
            description: 'Trigger news ingestion every 5 minutes'
        });
        newsIngestionSchedule.addTarget(new targets.LambdaFunction(this.ingestionNewsFunction));
        const evaluationSchedule = new events.Rule(this, 'EvaluationSchedule', {
            ruleName: 'ai-investment-evaluation-schedule',
            schedule: events.Schedule.cron({
                minute: '0',
                hour: '2',
                day: '*',
                month: '*',
                year: '*'
            }),
            description: 'Trigger evaluation daily at 2 AM'
        });
        evaluationSchedule.addTarget(new targets.LambdaFunction(this.evaluationFunction));
        // Outputs
        new cdk.CfnOutput(this, 'IngestionSocialFunctionArn', {
            value: this.ingestionSocialFunction.functionArn,
            description: 'Social Ingestion Lambda Function ARN'
        });
        new cdk.CfnOutput(this, 'IngestionNewsFunctionArn', {
            value: this.ingestionNewsFunction.functionArn,
            description: 'News Ingestion Lambda Function ARN'
        });
        new cdk.CfnOutput(this, 'ScoringFunctionArn', {
            value: this.scoringFunction.functionArn,
            description: 'Scoring Lambda Function ARN'
        });
        new cdk.CfnOutput(this, 'OrchestratorFunctionArn', {
            value: this.orchestratorFunction.functionArn,
            description: 'Orchestrator Lambda Function ARN'
        });
        new cdk.CfnOutput(this, 'EvaluationFunctionArn', {
            value: this.evaluationFunction.functionArn,
            description: 'Evaluation Lambda Function ARN'
        });
        new cdk.CfnOutput(this, 'StreamingFunctionArn', {
            value: this.streamingFunction.functionArn,
            description: 'Streaming Lambda Function ARN'
        });
    }
}
exports.ComputeStack = ComputeStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcHV0ZS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvbXB1dGUtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLGlEQUFpRDtBQUNqRCwyQ0FBMkM7QUFDM0MsaURBQWlEO0FBQ2pELDBEQUEwRDtBQUMxRCwyQ0FBMkM7QUFZM0MsTUFBYSxZQUFhLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFRekMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUF3QjtRQUNoRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4Qix1Q0FBdUM7UUFDdkMsTUFBTSxXQUFXLEdBQUcsSUFBSSxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDL0QsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLHNCQUFzQixDQUFDO1lBQ25ELGtCQUFrQixFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUM7WUFDaEQsV0FBVyxFQUFFLDhDQUE4QztTQUM1RCxDQUFDLENBQUM7UUFFSCxhQUFhO1FBQ2IsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLHNCQUFzQixFQUFFO1lBQ3ZFLFNBQVMsRUFBRSxnQ0FBZ0M7WUFDM0MsaUJBQWlCLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQzFDLGVBQWUsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDdEMsZUFBZSxFQUFFO2dCQUNmLEtBQUssRUFBRSxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLG9CQUFvQixFQUFFO29CQUMvQyxTQUFTLEVBQUUsb0NBQW9DO29CQUMvQyxlQUFlLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJ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LENBQUMsSUFBSSxFQUFFLHVCQUF1QixFQUFFO1lBQy9DLEtBQUssRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsV0FBVztZQUMxQyxXQUFXLEVBQUUsZ0NBQWdDO1NBQzlDLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsc0JBQXNCLEVBQUU7WUFDOUMsS0FBSyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXO1lBQ3pDLFdBQVcsRUFBRSwrQkFBK0I7U0FDN0MsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBalVELG9DQWlVQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XG5pbXBvcnQgKiBhcyBzcXMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXNxcyc7XG5pbXBvcnQgKiBhcyBldmVudHMgZnJvbSAnYXdzLWNkay1saWIvYXdzLWV2ZW50cyc7XG5pbXBvcnQgKiBhcyB0YXJnZXRzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1ldmVudHMtdGFyZ2V0cyc7XG5pbXBvcnQgKiBhcyBpYW0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XG5pbXBvcnQgKiBhcyBrbXMgZnJvbSAnYXdzLWNkay1saWIvYXdzLWttcyc7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCB7IERhdGFTdGFjayB9IGZyb20gJy4vZGF0YS1zdGFjayc7XG5pbXBvcnQgeyBBdXRoU3RhY2sgfSBmcm9tICcuL2F1dGgtc3RhY2snO1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbXB1dGVTdGFja1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xuICBkYXRhU3RhY2s6IERhdGFTdGFjaztcbiAgYXV0aFN0YWNrOiBBdXRoU3RhY2s7XG4gIGttc0tleToga21zLktleTtcbn1cblxuZXhwb3J0IGNsYXNzIENvbXB1dGVTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIHB1YmxpYyByZWFkb25seSBpbmdlc3Rpb25Tb2NpYWxGdW5jdGlvbjogbGFtYmRhLkZ1bmN0aW9uO1xuICBwdWJsaWMgcmVhZG9ubHkgaW5nZXN0aW9uTmV3c0Z1bmN0aW9uOiBsYW1iZGEuRnVuY3Rpb247XG4gIHB1YmxpYyByZWFkb25seSBzY29yaW5nRnVuY3Rpb246IGxhbWJkYS5GdW5jdGlvbjtcbiAgcHVibGljIHJlYWRvbmx5IG9yY2hlc3RyYXRvckZ1bmN0aW9uOiBsYW1iZGEuRnVuY3Rpb247XG4gIHB1YmxpYyByZWFkb25seSBldmFsdWF0aW9uRnVuY3Rpb246IGxhbWJkYS5GdW5jdGlvbjtcbiAgcHVibGljIHJlYWRvbmx5IHN0cmVhbWluZ0Z1bmN0aW9uOiBsYW1iZGEuRnVuY3Rpb247XG5cbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IENvbXB1dGVTdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAvLyBMYW1iZGEgTGF5ZXIgZm9yIGNvbW1vbiBkZXBlbmRlbmNpZXNcbiAgICBjb25zdCBjb21tb25MYXllciA9IG5ldyBsYW1iZGEuTGF5ZXJWZXJzaW9uKHRoaXMsICdDb21tb25MYXllcicsIHtcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnbGFtYmRhL2xheWVycy9jb21tb24nKSxcbiAgICAgIGNvbXBhdGlibGVSdW50aW1lczogW2xhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YXSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ29tbW9uIGRlcGVuZGVuY2llcyBmb3IgQUkgSW52ZXN0bWVudCBTeXN0ZW0nXG4gICAgfSk7XG5cbiAgICAvLyBTUVMgUXVldWVzXG4gICAgY29uc3Qgc29jaWFsSW5nZXN0aW9uUXVldWUgPSBuZXcgc3FzLlF1ZXVlKHRoaXMsICdTb2NpYWxJbmdlc3Rpb25RdWV1ZScsIHtcbiAgICAgIHF1ZXVlTmFtZTogJ2FpLWludmVzdG1lbnQtc29jaWFsLWluZ2VzdGlvbicsXG4gICAgICB2aXNpYmlsaXR5VGltZW91dDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoNSksXG4gICAgICByZXRlbnRpb25QZXJpb2Q6IGNkay5EdXJhdGlvbi5kYXlzKDE0KSxcbiAgICAgIGRlYWRMZXR0ZXJRdWV1ZToge1xuICAgICAgICBxdWV1ZTogbmV3IHNxcy5RdWV1ZSh0aGlzLCAnU29jaWFsSW5nZXN0aW9uRExRJywge1xuICAgICAgICAgIHF1ZXVlTmFtZTogJ2FpLWludmVzdG1lbnQtc29jaWFsLWluZ2VzdGlvbi1kbHEnLFxuICAgICAgICAgIHJldGVudGlvblBlcmlvZDogY2RrLkR1cmF0aW9uLmRheXMoMTQpXG4gICAgICAgIH0pLFxuICAgICAgICBtYXhSZWNlaXZlQ291bnQ6IDNcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IG5ld3NJbmdlc3Rpb25RdWV1ZSA9IG5ldyBzcXMuUXVldWUodGhpcywgJ05ld3NJbmdlc3Rpb25RdWV1ZScsIHtcbiAgICAgIHF1ZXVlTmFtZTogJ2FpLWludmVzdG1lbnQtbmV3cy1pbmdlc3Rpb24nLFxuICAgICAgdmlzaWJpbGl0eVRpbWVvdXQ6IGNkay5EdXJhdGlvbi5taW51dGVzKDUpLFxuICAgICAgcmV0ZW50aW9uUGVyaW9kOiBjZGsuRHVyYXRpb24uZGF5cygxNCksXG4gICAgICBkZWFkTGV0dGVyUXVldWU6IHtcbiAgICAgICAgcXVldWU6IG5ldyBzcXMuUXVldWUodGhpcywgJ05ld3NJbmdlc3Rpb25ETFEnLCB7XG4gICAgICAgICAgcXVldWVOYW1lOiAnYWktaW52ZXN0bWVudC1uZXdzLWluZ2VzdGlvbi1kbHEnLFxuICAgICAgICAgIHJldGVudGlvblBlcmlvZDogY2RrLkR1cmF0aW9uLmRheXMoMTQpXG4gICAgICAgIH0pLFxuICAgICAgICBtYXhSZWNlaXZlQ291bnQ6IDNcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IHNjb3JpbmdRdWV1ZSA9IG5ldyBzcXMuUXVldWUodGhpcywgJ1Njb3JpbmdRdWV1ZScsIHtcbiAgICAgIHF1ZXVlTmFtZTogJ2FpLWludmVzdG1lbnQtc2NvcmluZycsXG4gICAgICB2aXNpYmlsaXR5VGltZW91dDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoMTApLFxuICAgICAgcmV0ZW50aW9uUGVyaW9kOiBjZGsuRHVyYXRpb24uZGF5cygxNCksXG4gICAgICBkZWFkTGV0dGVyUXVldWU6IHtcbiAgICAgICAgcXVldWU6IG5ldyBzcXMuUXVldWUodGhpcywgJ1Njb3JpbmdETFEnLCB7XG4gICAgICAgICAgcXVldWVOYW1lOiAnYWktaW52ZXN0bWVudC1zY29yaW5nLWRscScsXG4gICAgICAgICAgcmV0ZW50aW9uUGVyaW9kOiBjZGsuRHVyYXRpb24uZGF5cygxNClcbiAgICAgICAgfSksXG4gICAgICAgIG1heFJlY2VpdmVDb3VudDogM1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gSUFNIFJvbGUgZm9yIExhbWJkYSBmdW5jdGlvbnNcbiAgICBjb25zdCBsYW1iZGFFeGVjdXRpb25Sb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsICdMYW1iZGFFeGVjdXRpb25Sb2xlJywge1xuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoJ2xhbWJkYS5hbWF6b25hd3MuY29tJyksXG4gICAgICBtYW5hZ2VkUG9saWNpZXM6IFtcbiAgICAgICAgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKCdzZXJ2aWNlLXJvbGUvQVdTTGFtYmRhQmFzaWNFeGVjdXRpb25Sb2xlJylcbiAgICAgIF0sXG4gICAgICBpbmxpbmVQb2xpY2llczoge1xuICAgICAgICBEeW5hbW9EQkFjY2VzczogbmV3IGlhbS5Qb2xpY3lEb2N1bWVudCh7XG4gICAgICAgICAgc3RhdGVtZW50czogW1xuICAgICAgICAgICAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICAgICAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAnZHluYW1vZGI6R2V0SXRlbScsXG4gICAgICAgICAgICAgICAgJ2R5bmFtb2RiOlB1dEl0ZW0nLFxuICAgICAgICAgICAgICAgICdkeW5hbW9kYjpVcGRhdGVJdGVtJyxcbiAgICAgICAgICAgICAgICAnZHluYW1vZGI6RGVsZXRlSXRlbScsXG4gICAgICAgICAgICAgICAgJ2R5bmFtb2RiOlF1ZXJ5JyxcbiAgICAgICAgICAgICAgICAnZHluYW1vZGI6U2NhbicsXG4gICAgICAgICAgICAgICAgJ2R5bmFtb2RiOkJhdGNoR2V0SXRlbScsXG4gICAgICAgICAgICAgICAgJ2R5bmFtb2RiOkJhdGNoV3JpdGVJdGVtJ1xuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICByZXNvdXJjZXM6IFtcbiAgICAgICAgICAgICAgICBwcm9wcy5kYXRhU3RhY2suc2lnbmFsc1RhYmxlLnRhYmxlQXJuLFxuICAgICAgICAgICAgICAgIHByb3BzLmRhdGFTdGFjay5wcm9wb3NhbHNUYWJsZS50YWJsZUFybixcbiAgICAgICAgICAgICAgICBwcm9wcy5kYXRhU3RhY2sub3V0Y29tZXNUYWJsZS50YWJsZUFybixcbiAgICAgICAgICAgICAgICBwcm9wcy5kYXRhU3RhY2suYWdlbnRzQ29uZmlnVGFibGUudGFibGVBcm4sXG4gICAgICAgICAgICAgICAgcHJvcHMuZGF0YVN0YWNrLnRyYWNrZWRFbnRpdGllc1RhYmxlLnRhYmxlQXJuLFxuICAgICAgICAgICAgICAgIGAke3Byb3BzLmRhdGFTdGFjay5zaWduYWxzVGFibGUudGFibGVBcm59L2luZGV4LypgLFxuICAgICAgICAgICAgICAgIGAke3Byb3BzLmRhdGFTdGFjay5wcm9wb3NhbHNUYWJsZS50YWJsZUFybn0vaW5kZXgvKmAsXG4gICAgICAgICAgICAgICAgYCR7cHJvcHMuZGF0YVN0YWNrLm91dGNvbWVzVGFibGUudGFibGVBcm59L2luZGV4LypgXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgXVxuICAgICAgICB9KSxcbiAgICAgICAgUzNBY2Nlc3M6IG5ldyBpYW0uUG9saWN5RG9jdW1lbnQoe1xuICAgICAgICAgIHN0YXRlbWVudHM6IFtcbiAgICAgICAgICAgIG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAgJ3MzOkdldE9iamVjdCcsXG4gICAgICAgICAgICAgICAgJ3MzOlB1dE9iamVjdCcsXG4gICAgICAgICAgICAgICAgJ3MzOkRlbGV0ZU9iamVjdCcsXG4gICAgICAgICAgICAgICAgJ3MzOkxpc3RCdWNrZXQnXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIHJlc291cmNlczogW1xuICAgICAgICAgICAgICAgIHByb3BzLmRhdGFTdGFjay5yYXdEYXRhQnVja2V0LmJ1Y2tldEFybixcbiAgICAgICAgICAgICAgICBwcm9wcy5kYXRhU3RhY2suY3VyYXRlZERhdGFCdWNrZXQuYnVja2V0QXJuLFxuICAgICAgICAgICAgICAgIHByb3BzLmRhdGFTdGFjay5mZWF0dXJlc0J1Y2tldC5idWNrZXRBcm4sXG4gICAgICAgICAgICAgICAgcHJvcHMuZGF0YVN0YWNrLmJhY2t0ZXN0c0J1Y2tldC5idWNrZXRBcm4sXG4gICAgICAgICAgICAgICAgcHJvcHMuZGF0YVN0YWNrLmV2YWxCdWNrZXQuYnVja2V0QXJuLFxuICAgICAgICAgICAgICAgIGAke3Byb3BzLmRhdGFTdGFjay5yYXdEYXRhQnVja2V0LmJ1Y2tldEFybn0vKmAsXG4gICAgICAgICAgICAgICAgYCR7cHJvcHMuZGF0YVN0YWNrLmN1cmF0ZWREYXRhQnVja2V0LmJ1Y2tldEFybn0vKmAsXG4gICAgICAgICAgICAgICAgYCR7cHJvcHMuZGF0YVN0YWNrLmZlYXR1cmVzQnVja2V0LmJ1Y2tldEFybn0vKmAsXG4gICAgICAgICAgICAgICAgYCR7cHJvcHMuZGF0YVN0YWNrLmJhY2t0ZXN0c0J1Y2tldC5idWNrZXRBcm59LypgLFxuICAgICAgICAgICAgICAgIGAke3Byb3BzLmRhdGFTdGFjay5ldmFsQnVja2V0LmJ1Y2tldEFybn0vKmBcbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICBdXG4gICAgICAgIH0pLFxuICAgICAgICBTZWNyZXRzTWFuYWdlckFjY2VzczogbmV3IGlhbS5Qb2xpY3lEb2N1bWVudCh7XG4gICAgICAgICAgc3RhdGVtZW50czogW1xuICAgICAgICAgICAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICAgICAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAnc2VjcmV0c21hbmFnZXI6R2V0U2VjcmV0VmFsdWUnLFxuICAgICAgICAgICAgICAgICdzZWNyZXRzbWFuYWdlcjpEZXNjcmliZVNlY3JldCdcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgcmVzb3VyY2VzOiBbJ2Fybjphd3M6c2VjcmV0c21hbmFnZXI6KjoqOnNlY3JldDphaS1pbnZlc3RtZW50LSonXVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICBdXG4gICAgICAgIH0pLFxuICAgICAgICBTUVNBY2Nlc3M6IG5ldyBpYW0uUG9saWN5RG9jdW1lbnQoe1xuICAgICAgICAgIHN0YXRlbWVudHM6IFtcbiAgICAgICAgICAgIG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAgJ3NxczpTZW5kTWVzc2FnZScsXG4gICAgICAgICAgICAgICAgJ3NxczpSZWNlaXZlTWVzc2FnZScsXG4gICAgICAgICAgICAgICAgJ3NxczpEZWxldGVNZXNzYWdlJyxcbiAgICAgICAgICAgICAgICAnc3FzOkdldFF1ZXVlQXR0cmlidXRlcydcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgcmVzb3VyY2VzOiBbXG4gICAgICAgICAgICAgICAgc29jaWFsSW5nZXN0aW9uUXVldWUucXVldWVBcm4sXG4gICAgICAgICAgICAgICAgbmV3c0luZ2VzdGlvblF1ZXVlLnF1ZXVlQXJuLFxuICAgICAgICAgICAgICAgIHNjb3JpbmdRdWV1ZS5xdWV1ZUFyblxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIF1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFNvY2lhbCBNZWRpYSBJbmdlc3Rpb24gRnVuY3Rpb25cbiAgICB0aGlzLmluZ2VzdGlvblNvY2lhbEZ1bmN0aW9uID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnSW5nZXN0aW9uU29jaWFsRnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICdhaS1pbnZlc3RtZW50LWluZ2VzdC1zb2NpYWwnLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJ2xhbWJkYS9pbmdlc3Rpb24tc29jaWFsJyksXG4gICAgICBsYXllcnM6IFtjb21tb25MYXllcl0sXG4gICAgICByb2xlOiBsYW1iZGFFeGVjdXRpb25Sb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoNSksXG4gICAgICBtZW1vcnlTaXplOiAxMDI0LFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgU0lHTkFMU19UQUJMRV9OQU1FOiBwcm9wcy5kYXRhU3RhY2suc2lnbmFsc1RhYmxlLnRhYmxlTmFtZSxcbiAgICAgICAgUkFXX0RBVEFfQlVDS0VUOiBwcm9wcy5kYXRhU3RhY2sucmF3RGF0YUJ1Y2tldC5idWNrZXROYW1lLFxuICAgICAgICBTRUNSRVRTX01BTkFHRVJfU0VDUkVUX0lEOiAnYWktaW52ZXN0bWVudC1zZWNyZXRzJyxcbiAgICAgICAgTk9ERV9FTlY6ICdwcm9kdWN0aW9uJ1xuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIE5ld3MgSW5nZXN0aW9uIEZ1bmN0aW9uXG4gICAgdGhpcy5pbmdlc3Rpb25OZXdzRnVuY3Rpb24gPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdJbmdlc3Rpb25OZXdzRnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICdhaS1pbnZlc3RtZW50LWluZ2VzdC1uZXdzJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCdsYW1iZGEvaW5nZXN0aW9uLW5ld3MnKSxcbiAgICAgIGxheWVyczogW2NvbW1vbkxheWVyXSxcbiAgICAgIHJvbGU6IGxhbWJkYUV4ZWN1dGlvblJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24ubWludXRlcyg1KSxcbiAgICAgIG1lbW9yeVNpemU6IDEwMjQsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBTSUdOQUxTX1RBQkxFX05BTUU6IHByb3BzLmRhdGFTdGFjay5zaWduYWxzVGFibGUudGFibGVOYW1lLFxuICAgICAgICBSQVdfREFUQV9CVUNLRVQ6IHByb3BzLmRhdGFTdGFjay5yYXdEYXRhQnVja2V0LmJ1Y2tldE5hbWUsXG4gICAgICAgIFNFQ1JFVFNfTUFOQUdFUl9TRUNSRVRfSUQ6ICdhaS1pbnZlc3RtZW50LXNlY3JldHMnLFxuICAgICAgICBOT0RFX0VOVjogJ3Byb2R1Y3Rpb24nXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gU2NvcmluZyBGdW5jdGlvblxuICAgIHRoaXMuc2NvcmluZ0Z1bmN0aW9uID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnU2NvcmluZ0Z1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnYWktaW52ZXN0bWVudC1zY29yZScsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnbGFtYmRhL3Njb3JpbmcnKSxcbiAgICAgIGxheWVyczogW2NvbW1vbkxheWVyXSxcbiAgICAgIHJvbGU6IGxhbWJkYUV4ZWN1dGlvblJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24ubWludXRlcygxMCksXG4gICAgICBtZW1vcnlTaXplOiAyMDQ4LFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgU0lHTkFMU19UQUJMRV9OQU1FOiBwcm9wcy5kYXRhU3RhY2suc2lnbmFsc1RhYmxlLnRhYmxlTmFtZSxcbiAgICAgICAgRkVBVFVSRVNfQlVDS0VUOiBwcm9wcy5kYXRhU3RhY2suZmVhdHVyZXNCdWNrZXQuYnVja2V0TmFtZSxcbiAgICAgICAgU0VDUkVUU19NQU5BR0VSX1NFQ1JFVF9JRDogJ2FpLWludmVzdG1lbnQtc2VjcmV0cycsXG4gICAgICAgIE5PREVfRU5WOiAncHJvZHVjdGlvbidcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBPcmNoZXN0cmF0b3IgRnVuY3Rpb25cbiAgICB0aGlzLm9yY2hlc3RyYXRvckZ1bmN0aW9uID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnT3JjaGVzdHJhdG9yRnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICdhaS1pbnZlc3RtZW50LW9yY2hlc3RyYXRvcicsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnbGFtYmRhL29yY2hlc3RyYXRvcicpLFxuICAgICAgbGF5ZXJzOiBbY29tbW9uTGF5ZXJdLFxuICAgICAgcm9sZTogbGFtYmRhRXhlY3V0aW9uUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5taW51dGVzKDE1KSxcbiAgICAgIG1lbW9yeVNpemU6IDIwNDgsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBTSUdOQUxTX1RBQkxFX05BTUU6IHByb3BzLmRhdGFTdGFjay5zaWduYWxzVGFibGUudGFibGVOYW1lLFxuICAgICAgICBQUk9QT1NBTFNfVEFCTEVfTkFNRTogcHJvcHMuZGF0YVN0YWNrLnByb3Bvc2Fsc1RhYmxlLnRhYmxlTmFtZSxcbiAgICAgICAgQUdFTlRTX0NPTkZJR19UQUJMRV9OQU1FOiBwcm9wcy5kYXRhU3RhY2suYWdlbnRzQ29uZmlnVGFibGUudGFibGVOYW1lLFxuICAgICAgICBTRUNSRVRTX01BTkFHRVJfU0VDUkVUX0lEOiAnYWktaW52ZXN0bWVudC1zZWNyZXRzJyxcbiAgICAgICAgTk9ERV9FTlY6ICdwcm9kdWN0aW9uJ1xuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIEV2YWx1YXRpb24gRnVuY3Rpb25cbiAgICB0aGlzLmV2YWx1YXRpb25GdW5jdGlvbiA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0V2YWx1YXRpb25GdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ2FpLWludmVzdG1lbnQtZXZhbHVhdGlvbicsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnbGFtYmRhL2V2YWx1YXRpb24nKSxcbiAgICAgIGxheWVyczogW2NvbW1vbkxheWVyXSxcbiAgICAgIHJvbGU6IGxhbWJkYUV4ZWN1dGlvblJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24ubWludXRlcygyMCksXG4gICAgICBtZW1vcnlTaXplOiAyMDQ4LFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgUFJPUE9TQUxTX1RBQkxFX05BTUU6IHByb3BzLmRhdGFTdGFjay5wcm9wb3NhbHNUYWJsZS50YWJsZU5hbWUsXG4gICAgICAgIE9VVENPTUVTX1RBQkxFX05BTUU6IHByb3BzLmRhdGFTdGFjay5vdXRjb21lc1RhYmxlLnRhYmxlTmFtZSxcbiAgICAgICAgRVZBTF9CVUNLRVQ6IHByb3BzLmRhdGFTdGFjay5ldmFsQnVja2V0LmJ1Y2tldE5hbWUsXG4gICAgICAgIFNFQ1JFVFNfTUFOQUdFUl9TRUNSRVRfSUQ6ICdhaS1pbnZlc3RtZW50LXNlY3JldHMnLFxuICAgICAgICBOT0RFX0VOVjogJ3Byb2R1Y3Rpb24nXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gU3RyZWFtaW5nIEZ1bmN0aW9uXG4gICAgdGhpcy5zdHJlYW1pbmdGdW5jdGlvbiA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1N0cmVhbWluZ0Z1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnYWktaW52ZXN0bWVudC1zdHJlYW1pbmcnLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJ2xhbWJkYS9zdHJlYW1pbmcnKSxcbiAgICAgIGxheWVyczogW2NvbW1vbkxheWVyXSxcbiAgICAgIHJvbGU6IGxhbWJkYUV4ZWN1dGlvblJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24ubWludXRlcyg1KSxcbiAgICAgIG1lbW9yeVNpemU6IDEwMjQsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBTSUdOQUxTX1RBQkxFX05BTUU6IHByb3BzLmRhdGFTdGFjay5zaWduYWxzVGFibGUudGFibGVOYW1lLFxuICAgICAgICBQUk9QT1NBTFNfVEFCTEVfTkFNRTogcHJvcHMuZGF0YVN0YWNrLnByb3Bvc2Fsc1RhYmxlLnRhYmxlTmFtZSxcbiAgICAgICAgTk9ERV9FTlY6ICdwcm9kdWN0aW9uJ1xuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIEV2ZW50QnJpZGdlIFNjaGVkdWxlc1xuICAgIGNvbnN0IHNvY2lhbEluZ2VzdGlvblNjaGVkdWxlID0gbmV3IGV2ZW50cy5SdWxlKHRoaXMsICdTb2NpYWxJbmdlc3Rpb25TY2hlZHVsZScsIHtcbiAgICAgIHJ1bGVOYW1lOiAnYWktaW52ZXN0bWVudC1zb2NpYWwtaW5nZXN0aW9uLXNjaGVkdWxlJyxcbiAgICAgIHNjaGVkdWxlOiBldmVudHMuU2NoZWR1bGUucmF0ZShjZGsuRHVyYXRpb24ubWludXRlcygxKSksXG4gICAgICBkZXNjcmlwdGlvbjogJ1RyaWdnZXIgc29jaWFsIG1lZGlhIGluZ2VzdGlvbiBldmVyeSBtaW51dGUnXG4gICAgfSk7XG5cbiAgICBzb2NpYWxJbmdlc3Rpb25TY2hlZHVsZS5hZGRUYXJnZXQobmV3IHRhcmdldHMuTGFtYmRhRnVuY3Rpb24odGhpcy5pbmdlc3Rpb25Tb2NpYWxGdW5jdGlvbikpO1xuXG4gICAgY29uc3QgbmV3c0luZ2VzdGlvblNjaGVkdWxlID0gbmV3IGV2ZW50cy5SdWxlKHRoaXMsICdOZXdzSW5nZXN0aW9uU2NoZWR1bGUnLCB7XG4gICAgICBydWxlTmFtZTogJ2FpLWludmVzdG1lbnQtbmV3cy1pbmdlc3Rpb24tc2NoZWR1bGUnLFxuICAgICAgc2NoZWR1bGU6IGV2ZW50cy5TY2hlZHVsZS5yYXRlKGNkay5EdXJhdGlvbi5taW51dGVzKDUpKSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnVHJpZ2dlciBuZXdzIGluZ2VzdGlvbiBldmVyeSA1IG1pbnV0ZXMnXG4gICAgfSk7XG5cbiAgICBuZXdzSW5nZXN0aW9uU2NoZWR1bGUuYWRkVGFyZ2V0KG5ldyB0YXJnZXRzLkxhbWJkYUZ1bmN0aW9uKHRoaXMuaW5nZXN0aW9uTmV3c0Z1bmN0aW9uKSk7XG5cbiAgICBjb25zdCBldmFsdWF0aW9uU2NoZWR1bGUgPSBuZXcgZXZlbnRzLlJ1bGUodGhpcywgJ0V2YWx1YXRpb25TY2hlZHVsZScsIHtcbiAgICAgIHJ1bGVOYW1lOiAnYWktaW52ZXN0bWVudC1ldmFsdWF0aW9uLXNjaGVkdWxlJyxcbiAgICAgIHNjaGVkdWxlOiBldmVudHMuU2NoZWR1bGUuY3Jvbih7XG4gICAgICAgIG1pbnV0ZTogJzAnLFxuICAgICAgICBob3VyOiAnMicsXG4gICAgICAgIGRheTogJyonLFxuICAgICAgICBtb250aDogJyonLFxuICAgICAgICB5ZWFyOiAnKidcbiAgICAgIH0pLFxuICAgICAgZGVzY3JpcHRpb246ICdUcmlnZ2VyIGV2YWx1YXRpb24gZGFpbHkgYXQgMiBBTSdcbiAgICB9KTtcblxuICAgIGV2YWx1YXRpb25TY2hlZHVsZS5hZGRUYXJnZXQobmV3IHRhcmdldHMuTGFtYmRhRnVuY3Rpb24odGhpcy5ldmFsdWF0aW9uRnVuY3Rpb24pKTtcblxuICAgIC8vIE91dHB1dHNcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnSW5nZXN0aW9uU29jaWFsRnVuY3Rpb25Bcm4nLCB7XG4gICAgICB2YWx1ZTogdGhpcy5pbmdlc3Rpb25Tb2NpYWxGdW5jdGlvbi5mdW5jdGlvbkFybixcbiAgICAgIGRlc2NyaXB0aW9uOiAnU29jaWFsIEluZ2VzdGlvbiBMYW1iZGEgRnVuY3Rpb24gQVJOJ1xuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0luZ2VzdGlvbk5ld3NGdW5jdGlvbkFybicsIHtcbiAgICAgIHZhbHVlOiB0aGlzLmluZ2VzdGlvbk5ld3NGdW5jdGlvbi5mdW5jdGlvbkFybixcbiAgICAgIGRlc2NyaXB0aW9uOiAnTmV3cyBJbmdlc3Rpb24gTGFtYmRhIEZ1bmN0aW9uIEFSTidcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdTY29yaW5nRnVuY3Rpb25Bcm4nLCB7XG4gICAgICB2YWx1ZTogdGhpcy5zY29yaW5nRnVuY3Rpb24uZnVuY3Rpb25Bcm4sXG4gICAgICBkZXNjcmlwdGlvbjogJ1Njb3JpbmcgTGFtYmRhIEZ1bmN0aW9uIEFSTidcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdPcmNoZXN0cmF0b3JGdW5jdGlvbkFybicsIHtcbiAgICAgIHZhbHVlOiB0aGlzLm9yY2hlc3RyYXRvckZ1bmN0aW9uLmZ1bmN0aW9uQXJuLFxuICAgICAgZGVzY3JpcHRpb246ICdPcmNoZXN0cmF0b3IgTGFtYmRhIEZ1bmN0aW9uIEFSTidcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdFdmFsdWF0aW9uRnVuY3Rpb25Bcm4nLCB7XG4gICAgICB2YWx1ZTogdGhpcy5ldmFsdWF0aW9uRnVuY3Rpb24uZnVuY3Rpb25Bcm4sXG4gICAgICBkZXNjcmlwdGlvbjogJ0V2YWx1YXRpb24gTGFtYmRhIEZ1bmN0aW9uIEFSTidcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdTdHJlYW1pbmdGdW5jdGlvbkFybicsIHtcbiAgICAgIHZhbHVlOiB0aGlzLnN0cmVhbWluZ0Z1bmN0aW9uLmZ1bmN0aW9uQXJuLFxuICAgICAgZGVzY3JpcHRpb246ICdTdHJlYW1pbmcgTGFtYmRhIEZ1bmN0aW9uIEFSTidcbiAgICB9KTtcbiAgfVxufVxuIl19