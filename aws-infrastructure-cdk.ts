import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export class ManuelWeissWebsiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 Bucket für Dokumenten-Speicherung
    const documentsBucket = new s3.Bucket(this, 'DocumentsBucket', {
      bucketName: 'manuel-weiss-documents',
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      cors: [{
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.POST, s3.HttpMethods.PUT, s3.HttpMethods.DELETE],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
        maxAge: 3000
      }],
      lifecycleRules: [{
        id: 'DeleteIncompleteMultipartUploads',
        abortIncompleteMultipartUploadAfter: cdk.Duration.days(1)
      }],
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    // DynamoDB Table für Metadaten
    const documentsTable = new dynamodb.Table(this, 'DocumentsTable', {
      tableName: 'manuel-weiss-documents',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    // DynamoDB Table für User-Management
    const usersTable = new dynamodb.Table(this, 'UsersTable', {
      tableName: 'manuel-weiss-users',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    // Cognito User Pool für Authentifizierung
    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'manuel-weiss-users',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
        username: false
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true
        },
        givenName: {
          required: true,
          mutable: true
        },
        familyName: {
          required: true,
          mutable: true
        }
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      autoVerify: {
        email: true
      },
      userVerification: {
        emailSubject: 'Bestätigen Sie Ihre E-Mail-Adresse',
        emailBody: 'Hallo {username}, bitte bestätigen Sie Ihre E-Mail-Adresse mit dem Code: {####}',
        emailStyle: cognito.VerificationEmailStyle.CODE
      }
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool,
      userPoolClientName: 'manuel-weiss-web-client',
      generateSecret: false,
      authFlows: {
        userPassword: true,
        userSrp: true
      },
      oAuth: {
        flows: {
          implicitCodeGrant: true
        },
        scopes: [cognito.OAuthScope.EMAIL, cognito.OAuthScope.OPENID, cognito.OAuthScope.PROFILE]
      }
    });

    // Lambda Function für Upload
    const uploadLambda = new lambda.Function(this, 'UploadFunction', {
      functionName: 'manuel-weiss-upload',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/upload'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        DOCUMENTS_TABLE: documentsTable.tableName,
        DOCUMENTS_BUCKET: documentsBucket.bucketName,
        USER_POOL_ID: userPool.userPoolId
      }
    });

    // Lambda Function für Download
    const downloadLambda = new lambda.Function(this, 'DownloadFunction', {
      functionName: 'manuel-weiss-download',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/download'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        DOCUMENTS_TABLE: documentsTable.tableName,
        DOCUMENTS_BUCKET: documentsBucket.bucketName
      }
    });

    // Lambda Function für User Management
    const userManagementLambda = new lambda.Function(this, 'UserManagementFunction', {
      functionName: 'manuel-weiss-user-management',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/user-management'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        USERS_TABLE: usersTable.tableName,
        USER_POOL_ID: userPool.userPoolId
      }
    });

    // IAM Permissions für Lambda Functions
    documentsBucket.grantReadWrite(uploadLambda);
    documentsBucket.grantRead(downloadLambda);
    documentsTable.grantReadWriteData(uploadLambda);
    documentsTable.grantReadWriteData(downloadLambda);
    usersTable.grantReadWriteData(userManagementLambda);

    // API Gateway
    const api = new apigateway.RestApi(this, 'ManuelWeissApi', {
      restApiName: 'Manuel Weiss API',
      description: 'API für Manuel Weiss Website',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization', 'X-Amz-Date', 'X-Api-Key', 'X-Amz-Security-Token']
      }
    });

    // Upload Endpoint
    const uploadResource = api.root.addResource('upload');
    uploadResource.addMethod('POST', new apigateway.LambdaIntegration(uploadLambda), {
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizer: new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
        cognitoUserPools: [userPool]
      })
    });

    // Download Endpoint
    const downloadResource = api.root.addResource('download').addResource('{id}');
    downloadResource.addMethod('GET', new apigateway.LambdaIntegration(downloadLambda), {
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizer: new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoDownloadAuthorizer', {
        cognitoUserPools: [userPool]
      })
    });

    // User Management Endpoints
    const usersResource = api.root.addResource('users');
    usersResource.addMethod('GET', new apigateway.LambdaIntegration(userManagementLambda));
    usersResource.addMethod('POST', new apigateway.LambdaIntegration(userManagementLambda));
    
    const userResource = usersResource.addResource('{userId}');
    userResource.addMethod('GET', new apigateway.LambdaIntegration(userManagementLambda));
    userResource.addMethod('PUT', new apigateway.LambdaIntegration(userManagementLambda));
    userResource.addMethod('DELETE', new apigateway.LambdaIntegration(userManagementLambda));

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL'
    });

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID'
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID'
    });

    new cdk.CfnOutput(this, 'DocumentsBucketName', {
      value: documentsBucket.bucketName,
      description: 'S3 Bucket für Dokumente'
    });

    new cdk.CfnOutput(this, 'DocumentsTableName', {
      value: documentsTable.tableName,
      description: 'DynamoDB Table für Dokumente'
    });

    new cdk.CfnOutput(this, 'UsersTableName', {
      value: usersTable.tableName,
      description: 'DynamoDB Table für User'
    });
  }
}
