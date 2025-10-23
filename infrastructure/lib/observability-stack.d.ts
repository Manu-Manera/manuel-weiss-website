import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';
import { ComputeStack } from './compute-stack';
import { ApiStack } from './api-stack';
export interface ObservabilityStackProps extends cdk.StackProps {
    computeStack: ComputeStack;
    apiStack: ApiStack;
}
export declare class ObservabilityStack extends cdk.Stack {
    readonly dashboard: cloudwatch.Dashboard;
    readonly alertTopic: sns.Topic;
    constructor(scope: Construct, id: string, props: ObservabilityStackProps);
}
