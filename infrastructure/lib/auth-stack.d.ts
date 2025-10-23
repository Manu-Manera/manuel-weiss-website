import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
export declare class AuthStack extends cdk.Stack {
    readonly userPool: cognito.UserPool;
    readonly userPoolClient: cognito.UserPoolClient;
    readonly userPoolDomain: cognito.UserPoolDomain;
    readonly identityPool: cognito.CfnIdentityPool;
    constructor(scope: Construct, id: string, props?: cdk.StackProps);
}
