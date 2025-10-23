import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as timestream from 'aws-cdk-lib/aws-timestream';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';

export interface DataStackProps extends cdk.StackProps {
  kmsKey: kms.Key;
}

export class DataStack extends cdk.Stack {
  public readonly signalsTable: dynamodb.Table;
  public readonly proposalsTable: dynamodb.Table;
  public readonly outcomesTable: dynamodb.Table;
  public readonly agentsConfigTable: dynamodb.Table;
  public readonly trackedEntitiesTable: dynamodb.Table;
  public readonly rawDataBucket: s3.Bucket;
  public readonly curatedDataBucket: s3.Bucket;
  public readonly featuresBucket: s3.Bucket;
  public readonly backtestsBucket: s3.Bucket;
  public readonly evalBucket: s3.Bucket;
  public readonly timestreamDatabase: timestream.CfnDatabase;
  public readonly timestreamTable: timestream.CfnTable;

  constructor(scope: Construct, id: string, props: DataStackProps) {
    super(scope, id, props);

    // DynamoDB Tables
    this.signalsTable = new dynamodb.Table(this, 'SignalsTable', {
      tableName: 'ai-investment-signals',
      partitionKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'SK',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.CUSTOMER_MANAGED,
      encryptionKey: props.kmsKey,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    // GSI for signals by asset and timestamp
    this.signalsTable.addGlobalSecondaryIndex({
      indexName: 'AssetTimestampIndex',
      partitionKey: {
        name: 'asset',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'timestamp',
        type: dynamodb.AttributeType.NUMBER
      }
    });

    // GSI for signals by source
    this.signalsTable.addGlobalSecondaryIndex({
      indexName: 'SourceIndex',
      partitionKey: {
        name: 'source',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'timestamp',
        type: dynamodb.AttributeType.NUMBER
      }
    });

    this.proposalsTable = new dynamodb.Table(this, 'ProposalsTable', {
      tableName: 'ai-investment-proposals',
      partitionKey: {
        name: 'proposal_id',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'created_at',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.CUSTOMER_MANAGED,
      encryptionKey: props.kmsKey,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    // GSI for proposals by status
    this.proposalsTable.addGlobalSecondaryIndex({
      indexName: 'StatusIndex',
      partitionKey: {
        name: 'status',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'created_at',
        type: dynamodb.AttributeType.STRING
      }
    });

    this.outcomesTable = new dynamodb.Table(this, 'OutcomesTable', {
      tableName: 'ai-investment-outcomes',
      partitionKey: {
        name: 'outcome_id',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'evaluated_at',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.CUSTOMER_MANAGED,
      encryptionKey: props.kmsKey,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    // GSI for outcomes by proposal
    this.outcomesTable.addGlobalSecondaryIndex({
      indexName: 'ProposalIndex',
      partitionKey: {
        name: 'proposal_id',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'evaluated_at',
        type: dynamodb.AttributeType.STRING
      }
    });

    this.agentsConfigTable = new dynamodb.Table(this, 'AgentsConfigTable', {
      tableName: 'ai-investment-agents-config',
      partitionKey: {
        name: 'agent_id',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'version',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.CUSTOMER_MANAGED,
      encryptionKey: props.kmsKey,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    this.trackedEntitiesTable = new dynamodb.Table(this, 'TrackedEntitiesTable', {
      tableName: 'ai-investment-tracked-entities',
      partitionKey: {
        name: 'entity_type',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'entity_id',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.CUSTOMER_MANAGED,
      encryptionKey: props.kmsKey,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    // S3 Buckets
    this.rawDataBucket = new s3.Bucket(this, 'RawDataBucket', {
      bucketName: `ai-investment-raw-data-${this.account}-${this.region}`,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: props.kmsKey,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      lifecycleRules: [
        {
          id: 'RawDataLifecycle',
          enabled: true,
          transitions: [
            {
              storageClass: s3.StorageClass.INTELLIGENT_TIERING,
              transitionAfter: cdk.Duration.days(30)
            },
            {
              storageClass: s3.StorageClass.GLACIER,
              transitionAfter: cdk.Duration.days(90)
            },
            {
              storageClass: s3.StorageClass.DEEP_ARCHIVE,
              transitionAfter: cdk.Duration.days(365)
            }
          ],
          expiration: cdk.Duration.days(2555) // 7 years
        }
      ],
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    this.curatedDataBucket = new s3.Bucket(this, 'CuratedDataBucket', {
      bucketName: `ai-investment-curated-data-${this.account}-${this.region}`,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: props.kmsKey,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      lifecycleRules: [
        {
          id: 'CuratedDataLifecycle',
          enabled: true,
          transitions: [
            {
              storageClass: s3.StorageClass.INTELLIGENT_TIERING,
              transitionAfter: cdk.Duration.days(30)
            }
          ]
        }
      ],
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    this.featuresBucket = new s3.Bucket(this, 'FeaturesBucket', {
      bucketName: `ai-investment-features-${this.account}-${this.region}`,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: props.kmsKey,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    this.backtestsBucket = new s3.Bucket(this, 'BacktestsBucket', {
      bucketName: `ai-investment-backtests-${this.account}-${this.region}`,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: props.kmsKey,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    this.evalBucket = new s3.Bucket(this, 'EvalBucket', {
      bucketName: `ai-investment-eval-${this.account}-${this.region}`,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: props.kmsKey,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    // Timestream Database
    this.timestreamDatabase = new timestream.CfnDatabase(this, 'TimestreamDatabase', {
      databaseName: 'ai-investment-timeseries'
    });

    this.timestreamTable = new timestream.CfnTable(this, 'TimestreamTable', {
      databaseName: this.timestreamDatabase.databaseName!,
      tableName: 'market-data',
      retentionProperties: {
        memoryStoreRetentionPeriodInHours: 24,
        magneticStoreRetentionPeriodInDays: 365
      }
    });

    this.timestreamTable.addDependency(this.timestreamDatabase);

    // Outputs
    new cdk.CfnOutput(this, 'SignalsTableName', {
      value: this.signalsTable.tableName,
      description: 'DynamoDB Signals Table Name'
    });

    new cdk.CfnOutput(this, 'ProposalsTableName', {
      value: this.proposalsTable.tableName,
      description: 'DynamoDB Proposals Table Name'
    });

    new cdk.CfnOutput(this, 'OutcomesTableName', {
      value: this.outcomesTable.tableName,
      description: 'DynamoDB Outcomes Table Name'
    });

    new cdk.CfnOutput(this, 'RawDataBucketName', {
      value: this.rawDataBucket.bucketName,
      description: 'S3 Raw Data Bucket Name'
    });

    new cdk.CfnOutput(this, 'CuratedDataBucketName', {
      value: this.curatedDataBucket.bucketName,
      description: 'S3 Curated Data Bucket Name'
    });

    new cdk.CfnOutput(this, 'TimestreamDatabaseName', {
      value: this.timestreamDatabase.databaseName!,
      description: 'Timestream Database Name'
    });
  }
}
