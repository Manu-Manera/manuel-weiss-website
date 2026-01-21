import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
/**
 * Website API Stack
 * Ersetzt alle Netlify Functions mit AWS Lambda + API Gateway
 */
export declare class WebsiteApiStack extends cdk.Stack {
    readonly api: apigateway.RestApi;
    readonly apiUrl: cdk.CfnOutput;
    constructor(scope: Construct, id: string, props?: cdk.StackProps);
}
