import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

/**
 * Stellensuche für den Bewerbungsmanager (applications/dashboard.html, Tab «Stellensuche»).
 * Eigener Stack, weil manuel-weiss-website-api am CloudFormation-Limit von 500 Ressourcen liegt.
 */
export class JobSearchStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, 'JobSearchTable', {
      tableName: 'mawps-job-search',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    const fn = new lambda.Function(this, 'JobSearchFunction', {
      functionName: 'website-job-search',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda/job-search'),
      timeout: cdk.Duration.seconds(110),
      memorySize: 512,
      environment: {
        JOB_SEARCH_TABLE: table.tableName,
        USER_POOL_ID: 'eu-central-1_8gP4gLK9r'
      }
    });
    table.grantReadWriteData(fn);

    // Function URL statt API Gateway: eine Suche über alle Quellen dauert länger als 29 s
    const url = fn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ['https://manuel-weiss.ch', 'https://www.manuel-weiss.ch', 'http://localhost:8000', 'http://127.0.0.1:8000'],
        allowedMethods: [lambda.HttpMethod.POST],
        allowedHeaders: ['Content-Type', 'Authorization'],
        maxAge: cdk.Duration.hours(1)
      }
    });

    new cdk.CfnOutput(this, 'JobSearchFunctionUrl', {
      value: url.url,
      description: 'Stellensuche (Bewerbungsmanager) - in js/aws-app-config.js als JOB_SEARCH_URL eintragen'
    });
  }
}
