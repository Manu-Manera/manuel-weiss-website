import * as cdk from 'aws-cdk-lib';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
export declare class SecurityStack extends cdk.Stack {
    readonly kmsKey: kms.Key;
    readonly secretsManager: secretsmanager.Secret;
    constructor(scope: Construct, id: string, props?: cdk.StackProps);
}
