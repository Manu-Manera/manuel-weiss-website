// AWS CDK Example - TypeScript
// npm install -g aws-cdk
// cdk init app --language typescript
// npm install @aws-cdk/aws-s3 @aws-cdk/aws-dynamodb @aws-cdk/aws-cognito @aws-cdk/aws-lambda @aws-cdk/aws-apigateway

import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

interface UserFilesStackProps extends cdk.StackProps {
  projectName: string;
  domainName: string;
  allowedOrigins: string[];
}

export class UserFilesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: UserFilesStackProps) {
    super(scope, id, props);

    const { projectName, domainName, allowedOrigins } = props;

    // S3 Bucket
    const filesBucket = new s3.Bucket(this, 'UserFilesBucket', {
      bucketName: `${projectName}-files-${this.account}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [{
        allowedHeaders: ['*'],
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
        allowedOrigins: allowedOrigins,
        maxAge: 300,
      }],
      lifecycleRules: [{
        id: 'DeleteIncompleteMultipartUploads',
        abortIncompleteMultipartUploadAfter: cdk.Duration.days(1),
      }],
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Produktionsschutz
    });

    // DynamoDB Table
    const documentsTable = new dynamodb.Table(this, 'DocumentsTable', {
      tableName: `${projectName}-documents`,
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Cognito User Pool
    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: `${projectName}-users`,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        fullname: {
          required: true,
          mutable: true,
        },
      },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const userPoolClient = userPool.addClient('UserPoolClient', {
      userPoolClientName: `${projectName}-client`,
      generateSecret: false,
      authFlows: {
        userSrp: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [cognito.OAuthScope.EMAIL, cognito.OAuthScope.OPENID, cognito.OAuthScope.PROFILE],
        callbackUrls: [
          `https://${domainName}/bewerbung.html`,
          `https://${domainName}/admin.html`,
          'http://localhost:8000/bewerbung.html',
          'http://localhost:8000/admin.html',
        ],
        logoutUrls: [
          `https://${domainName}`,
          'http://localhost:8000',
        ],
      },
    });

    const userPoolDomain = userPool.addDomain('UserPoolDomain', {
      cognitoDomain: {
        domainPrefix: `${projectName}-auth-${this.account}`,
      },
    });

    // Lambda Execution Role
    const lambdaRole = new iam.Role(this, 'LambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
      inlinePolicies: {
        UserFilesAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                's3:GetObject',
                's3:PutObject',
                's3:DeleteObject',
                's3:GetObjectVersion',
              ],
              resources: [`${filesBucket.bucketArn}/*`],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['s3:ListBucket'],
              resources: [filesBucket.bucketArn],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'dynamodb:GetItem',
                'dynamodb:PutItem',
                'dynamodb:UpdateItem',
                'dynamodb:DeleteItem',
                'dynamodb:Query',
                'dynamodb:Scan',
              ],
              resources: [documentsTable.tableArn],
            }),
          ],
        }),
      },
    });

    // Lambda Functions
    const uploadUrlFunction = new lambda.Function(this, 'UploadUrlFunction', {
      functionName: `${projectName}-upload-url`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler.handler',
      code: lambda.Code.fromAsset('backend/upload-url'),
      role: lambdaRole,
      environment: {
        BUCKET: filesBucket.bucketName,
        ALLOWED_ORIGIN: allowedOrigins.join(','),
        MAX_UPLOAD_BYTES: '15728640',
        ALLOWED_TYPES: 'application/pdf,image/jpeg,image/png',
      },
      timeout: cdk.Duration.seconds(30),
    });

    const docsFunction = new lambda.Function(this, 'DocsFunction', {
      functionName: `${projectName}-docs`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler.handler',
      code: lambda.Code.fromAsset('backend/docs'),
      role: lambdaRole,
      environment: {
        TABLE: documentsTable.tableName,
        BUCKET: filesBucket.bucketName,
        ALLOWED_ORIGIN: allowedOrigins.join(','),
      },
      timeout: cdk.Duration.seconds(30),
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'UserFilesApi', {
      restApiName: `${projectName}-api`,
      description: 'API for multi-user file management',
      defaultCorsPreflightOptions: {
        allowOrigins: allowedOrigins,
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
      },
    });

    const cognitoAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
      cognitoUserPools: [userPool],
    });

    // API Resources
    const uploadUrlResource = api.root.addResource('upload-url');
    uploadUrlResource.addMethod('POST', new apigateway.LambdaIntegration(uploadUrlFunction), {
      authorizer: cognitoAuthorizer,
    });

    const docsResource = api.root.addResource('docs');
    docsResource.addMethod('ANY', new apigateway.LambdaIntegration(docsFunction), {
      authorizer: cognitoAuthorizer,
    });

    const docsProxyResource = docsResource.addResource('{proxy+}');
    docsProxyResource.addMethod('ANY', new apigateway.LambdaIntegration(docsFunction), {
      authorizer: cognitoAuthorizer,
    });

    const downloadUrlResource = api.root.addResource('download-url');
    downloadUrlResource.addMethod('GET', new apigateway.LambdaIntegration(docsFunction), {
      authorizer: cognitoAuthorizer,
    });

    // Outputs
    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'CognitoUserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });

    new cdk.CfnOutput(this, 'CognitoUserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
    });

    new cdk.CfnOutput(this, 'CognitoHostedUIUrl', {
      value: `https://${userPoolDomain.domainName}.auth.${this.region}.amazoncognito.com`,
      description: 'Cognito Hosted UI Base URL',
    });

    new cdk.CfnOutput(this, 'S3BucketName', {
      value: filesBucket.bucketName,
      description: 'S3 Bucket Name',
    });
  }
}

// Usage in app.ts:
// const app = new cdk.App();
// new UserFilesStack(app, 'UserFilesStack', {
//   projectName: 'manuel-weiss-userfiles',
//   domainName: 'manuel-weiss.com',
//   allowedOrigins: ['https://manuel-weiss.com', 'http://localhost:8000'],
//   env: {
//     account: process.env.CDK_DEFAULT_ACCOUNT,
//     region: 'eu-central-1',
//   },
// });
