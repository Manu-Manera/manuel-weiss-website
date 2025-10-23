import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as kms from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';
import { DataStack } from './data-stack';
import { AuthStack } from './auth-stack';
export interface ComputeStackProps extends cdk.StackProps {
    dataStack: DataStack;
    authStack: AuthStack;
    kmsKey: kms.Key;
}
export declare class ComputeStack extends cdk.Stack {
    readonly ingestionSocialFunction: lambda.Function;
    readonly ingestionNewsFunction: lambda.Function;
    readonly scoringFunction: lambda.Function;
    readonly orchestratorFunction: lambda.Function;
    readonly evaluationFunction: lambda.Function;
    readonly streamingFunction: lambda.Function;
    constructor(scope: Construct, id: string, props: ComputeStackProps);
}
