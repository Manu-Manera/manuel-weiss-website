import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { ComputeStack } from './compute-stack';
import { AuthStack } from './auth-stack';
export interface ApiStackProps extends cdk.StackProps {
    computeStack: ComputeStack;
    authStack: AuthStack;
}
export declare class ApiStack extends cdk.Stack {
    readonly apiGateway: apigateway.RestApi;
    constructor(scope: Construct, id: string, props: ApiStackProps);
}
