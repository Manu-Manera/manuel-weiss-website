import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';
import { DataStack } from './data-stack';
import { AuthStack } from './auth-stack';

export interface ComputeStackProps extends cdk.StackProps {
  dataStack: DataStack;
  authStack: AuthStack;
  kmsKey: kms.Key;
}

export class ComputeStack extends cdk.Stack {
  public readonly ingestionSocialFunction: lambda.Function;
  public readonly ingestionNewsFunction: lambda.Function;
  public readonly scoringFunction: lambda.Function;
  public readonly orchestratorFunction: lambda.Function;
  public readonly evaluationFunction: lambda.Function;
  public readonly streamingFunction: lambda.Function;

  constructor(scope: Construct, id: string, props: ComputeStackProps) {
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
