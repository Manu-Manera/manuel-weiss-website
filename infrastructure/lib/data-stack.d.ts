import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as timestream from 'aws-cdk-lib/aws-timestream';
import * as kms from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';
export interface DataStackProps extends cdk.StackProps {
    kmsKey: kms.Key;
}
export declare class DataStack extends cdk.Stack {
    readonly signalsTable: dynamodb.Table;
    readonly proposalsTable: dynamodb.Table;
    readonly outcomesTable: dynamodb.Table;
    readonly agentsConfigTable: dynamodb.Table;
    readonly trackedEntitiesTable: dynamodb.Table;
    readonly rawDataBucket: s3.Bucket;
    readonly curatedDataBucket: s3.Bucket;
    readonly featuresBucket: s3.Bucket;
    readonly backtestsBucket: s3.Bucket;
    readonly evalBucket: s3.Bucket;
    readonly timestreamDatabase: timestream.CfnDatabase;
    readonly timestreamTable: timestream.CfnTable;
    constructor(scope: Construct, id: string, props: DataStackProps);
}
