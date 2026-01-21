import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

/**
 * Website API Stack
 * Ersetzt alle Netlify Functions mit AWS Lambda + API Gateway
 */
export class WebsiteApiStack extends cdk.Stack {
  public readonly api: apigateway.RestApi;
  public readonly apiUrl: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ========================================
    // BESTEHENDE RESSOURCEN REFERENZIEREN
    // ========================================
    
    // DynamoDB Tabellen (existieren bereits)
    const userDataTable = dynamodb.Table.fromTableName(this, 'UserDataTable', 'mawps-user-profiles');
    const highscoresTable = dynamodb.Table.fromTableName(this, 'HighscoresTable', 'snowflake-highscores');
    const settingsTable = dynamodb.Table.fromTableName(this, 'SettingsTable', 'manuel-weiss-settings');
    const apiSettingsTable = dynamodb.Table.fromTableName(this, 'ApiSettingsTable', 'mawps-api-settings');
    
    // S3 Buckets (existieren bereits)
    const profileImageBucket = s3.Bucket.fromBucketName(this, 'ProfileImageBucket', 'mawps-profile-images');
    const heroVideoBucket = s3.Bucket.fromBucketName(this, 'HeroVideoBucket', 'manuel-weiss-hero-videos');

    // ========================================
    // IAM ROLLE FÜR LAMBDAS
    // ========================================
    const lambdaRole = new iam.Role(this, 'WebsiteLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
      ]
    });

    // DynamoDB Permissions
    lambdaRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'dynamodb:GetItem',
        'dynamodb:PutItem',
        'dynamodb:UpdateItem',
        'dynamodb:DeleteItem',
        'dynamodb:Query',
        'dynamodb:Scan'
      ],
      resources: [
        userDataTable.tableArn,
        highscoresTable.tableArn,
        settingsTable.tableArn,
        apiSettingsTable.tableArn,
        'arn:aws:dynamodb:eu-central-1:*:table/mawps-user-data'
      ]
    }));

    // S3 Permissions
    lambdaRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        's3:GetObject',
        's3:PutObject',
        's3:DeleteObject',
        's3:ListBucket'
      ],
      resources: [
        profileImageBucket.bucketArn,
        `${profileImageBucket.bucketArn}/*`,
        heroVideoBucket.bucketArn,
        `${heroVideoBucket.bucketArn}/*`
      ]
    }));

    // SES Permissions (für Kontakt-E-Mails)
    lambdaRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['ses:SendEmail', 'ses:SendRawEmail'],
      resources: ['*']
    }));

    // ========================================
    // API GATEWAY
    // ========================================
    this.api = new apigateway.RestApi(this, 'WebsiteAPI', {
      restApiName: 'Manuel Weiss Website API',
      description: 'API für manuel-weiss.ch (ersetzt Netlify Functions)',
      defaultCorsPreflightOptions: {
        allowOrigins: [
          'https://manuel-weiss.ch',
          'https://www.manuel-weiss.ch',
          'https://mawps.netlify.app',
          'http://localhost:3000',
          'http://localhost:5500',
          'http://127.0.0.1:5500'
        ],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: [
          'Content-Type',
          'Authorization',
          'X-User-Id',
          'X-Amz-Date',
          'X-Api-Key',
          'X-Amz-Security-Token'
        ],
        allowCredentials: true
      },
      deployOptions: {
        stageName: 'v1',
        throttlingRateLimit: 100,
        throttlingBurstLimit: 200
      }
    });

    // ========================================
    // LAMBDA FUNCTIONS
    // ========================================

    // User Data Lambda
    const userDataLambda = new lambda.Function(this, 'UserDataFunction', {
      functionName: 'website-user-data',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda/user-data'),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        USER_DATA_TABLE: 'mawps-user-profiles'
      }
    });

    // Snowflake Highscores Lambda
    const highscoresLambda = new lambda.Function(this, 'HighscoresFunction', {
      functionName: 'website-snowflake-highscores',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda/snowflake-highscores'),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        HIGHSCORES_TABLE: 'snowflake-highscores'
      }
    });

    // Hero Video Lambda
    const heroVideoLambda = new lambda.Function(this, 'HeroVideoFunction', {
      functionName: 'website-hero-video',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda/hero-video'),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        DYNAMODB_SETTINGS_TABLE: 'manuel-weiss-settings',
        S3_HERO_VIDEO_BUCKET: 'manuel-weiss-hero-videos'
      }
    });

    // OpenAI Proxy Lambda
    const openaiProxyLambda = new lambda.Function(this, 'OpenAIProxyFunction', {
      functionName: 'website-openai-proxy',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda/openai-proxy'),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(60),
      memorySize: 256
    });

    // Job Parser Lambda
    const jobParserLambda = new lambda.Function(this, 'JobParserFunction', {
      functionName: 'website-job-parser',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda/job-parser'),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256
    });

    // CV General Lambda
    const cvGeneralLambda = new lambda.Function(this, 'CVGeneralFunction', {
      functionName: 'website-cv-general',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda/cv-general'),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(120),
      memorySize: 512
    });

    // CV Target Lambda
    const cvTargetLambda = new lambda.Function(this, 'CVTargetFunction', {
      functionName: 'website-cv-target',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda/cv-target'),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(120),
      memorySize: 512
    });

    // CV Job Parse Lambda
    const cvJobParseLambda = new lambda.Function(this, 'CVJobParseFunction', {
      functionName: 'website-cv-job-parse',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda/cv-job-parse'),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(60),
      memorySize: 256
    });

    // CV Files Parse Lambda
    const cvFilesParseLambda = new lambda.Function(this, 'CVFilesParseFunction', {
      functionName: 'website-cv-files-parse',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda/cv-files-parse'),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(60),
      memorySize: 512
    });

    // CV Export Lambda
    const cvExportLambda = new lambda.Function(this, 'CVExportFunction', {
      functionName: 'website-cv-export',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda/cv-export'),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256
    });

    // API Settings Lambda (vollständig mit Verschlüsselung)
    const apiSettingsLambda = new lambda.Function(this, 'ApiSettingsFunction', {
      functionName: 'website-api-settings',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda/api-settings'),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        API_SETTINGS_TABLE: 'mawps-api-settings',
        ENCRYPTION_SECRET: process.env.ENCRYPTION_SECRET || 'mawps-secure-api-key-encryption-2024'
      }
    });

    // Contact Email Lambda (vollständig mit SES)
    const contactEmailLambda = new lambda.Function(this, 'ContactEmailFunction', {
      functionName: 'website-contact-email',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda/contact-email'),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        FROM_EMAIL: 'noreply@manuel-weiss.ch',
        TO_EMAIL: 'kontakt@manuel-weiss.ch'
      }
    });

    // Profile Image Upload Lambda (vollständig mit S3 Presigned URLs)
    const profileImageLambda = new lambda.Function(this, 'ProfileImageFunction', {
      functionName: 'website-profile-image-upload',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda/profile-image-upload'),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        S3_BUCKET: 'mawps-profile-images'
      }
    });

    // PDF Generator Lambda (Puppeteer für komplexe CSS-Features)
    const pdfGeneratorLambda = new lambda.Function(this, 'PdfGeneratorFunction', {
      functionName: 'website-pdf-generator',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda/pdf-generator'),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(60), // Längerer Timeout für PDF-Generierung
      memorySize: 2048, // Mehr Memory für Puppeteer/Chrome
      environment: {
        NODE_ENV: 'production'
      }
    });

    // ========================================
    // API ROUTES
    // ========================================

    // /user-data
    const userDataResource = this.api.root.addResource('user-data');
    userDataResource.addMethod('GET', new apigateway.LambdaIntegration(userDataLambda));
    userDataResource.addMethod('POST', new apigateway.LambdaIntegration(userDataLambda));
    userDataResource.addMethod('PUT', new apigateway.LambdaIntegration(userDataLambda));
    userDataResource.addMethod('DELETE', new apigateway.LambdaIntegration(userDataLambda));
    
    // /user-data/profile
    const profileResource = userDataResource.addResource('profile');
    profileResource.addMethod('GET', new apigateway.LambdaIntegration(userDataLambda));
    profileResource.addMethod('POST', new apigateway.LambdaIntegration(userDataLambda));
    profileResource.addMethod('PUT', new apigateway.LambdaIntegration(userDataLambda));
    
    // /user-data/resumes
    const resumesResource = userDataResource.addResource('resumes');
    resumesResource.addMethod('GET', new apigateway.LambdaIntegration(userDataLambda));
    resumesResource.addMethod('POST', new apigateway.LambdaIntegration(userDataLambda));
    resumesResource.addMethod('DELETE', new apigateway.LambdaIntegration(userDataLambda));
    
    // /user-data/documents
    const documentsResource = userDataResource.addResource('documents');
    documentsResource.addMethod('GET', new apigateway.LambdaIntegration(userDataLambda));
    documentsResource.addMethod('POST', new apigateway.LambdaIntegration(userDataLambda));
    documentsResource.addMethod('DELETE', new apigateway.LambdaIntegration(userDataLambda));
    
    // /user-data/cover-letters
    const coverLettersResource = userDataResource.addResource('cover-letters');
    coverLettersResource.addMethod('GET', new apigateway.LambdaIntegration(userDataLambda));
    coverLettersResource.addMethod('POST', new apigateway.LambdaIntegration(userDataLambda));
    coverLettersResource.addMethod('DELETE', new apigateway.LambdaIntegration(userDataLambda));
    
    // /user-data/applications
    const applicationsResource = userDataResource.addResource('applications');
    applicationsResource.addMethod('GET', new apigateway.LambdaIntegration(userDataLambda));
    applicationsResource.addMethod('POST', new apigateway.LambdaIntegration(userDataLambda));
    applicationsResource.addMethod('DELETE', new apigateway.LambdaIntegration(userDataLambda));
    
    // /user-data/photos
    const photosResource = userDataResource.addResource('photos');
    photosResource.addMethod('GET', new apigateway.LambdaIntegration(userDataLambda));
    photosResource.addMethod('POST', new apigateway.LambdaIntegration(userDataLambda));
    photosResource.addMethod('DELETE', new apigateway.LambdaIntegration(userDataLambda));
    
    // /user-data/workflows/{proxy+}
    const workflowsResource = userDataResource.addResource('workflows');
    const workflowProxy = workflowsResource.addProxy({
      anyMethod: true,
      defaultIntegration: new apigateway.LambdaIntegration(userDataLambda)
    });

    // /snowflake-highscores
    const highscoresResource = this.api.root.addResource('snowflake-highscores');
    highscoresResource.addMethod('GET', new apigateway.LambdaIntegration(highscoresLambda));
    highscoresResource.addMethod('POST', new apigateway.LambdaIntegration(highscoresLambda));
    highscoresResource.addMethod('DELETE', new apigateway.LambdaIntegration(highscoresLambda));

    // /hero-video
    const heroVideoResource = this.api.root.addResource('hero-video');
    
    // /hero-video/settings
    const heroSettingsResource = heroVideoResource.addResource('settings');
    heroSettingsResource.addMethod('GET', new apigateway.LambdaIntegration(heroVideoLambda));
    heroSettingsResource.addMethod('POST', new apigateway.LambdaIntegration(heroVideoLambda));
    heroSettingsResource.addMethod('PUT', new apigateway.LambdaIntegration(heroVideoLambda));
    
    // /hero-video/upload
    const heroUploadResource = heroVideoResource.addResource('upload');
    heroUploadResource.addMethod('POST', new apigateway.LambdaIntegration(heroVideoLambda));
    heroUploadResource.addMethod('GET', new apigateway.LambdaIntegration(heroVideoLambda));

    // /openai-proxy
    const openaiResource = this.api.root.addResource('openai-proxy');
    openaiResource.addMethod('POST', new apigateway.LambdaIntegration(openaiProxyLambda));

    // /job-parser
    const jobParserResource = this.api.root.addResource('job-parser');
    jobParserResource.addMethod('POST', new apigateway.LambdaIntegration(jobParserLambda));

    // /cv-general
    const cvGeneralResource = this.api.root.addResource('cv-general');
    cvGeneralResource.addMethod('POST', new apigateway.LambdaIntegration(cvGeneralLambda));

    // /cv-target
    const cvTargetResource = this.api.root.addResource('cv-target');
    cvTargetResource.addMethod('POST', new apigateway.LambdaIntegration(cvTargetLambda));

    // /cv-job-parse
    const cvJobParseResource = this.api.root.addResource('cv-job-parse');
    cvJobParseResource.addMethod('POST', new apigateway.LambdaIntegration(cvJobParseLambda));

    // /cv-files-parse
    const cvFilesParseResource = this.api.root.addResource('cv-files-parse');
    cvFilesParseResource.addMethod('POST', new apigateway.LambdaIntegration(cvFilesParseLambda));

    // /cv-export
    const cvExportResource = this.api.root.addResource('cv-export');
    cvExportResource.addMethod('POST', new apigateway.LambdaIntegration(cvExportLambda));

    // /api-settings (bestehende Lambda)
    const apiSettingsResource = this.api.root.addResource('api-settings');
    apiSettingsResource.addProxy({
      anyMethod: true,
      defaultIntegration: new apigateway.LambdaIntegration(apiSettingsLambda)
    });

    // /contact-email (bestehende Lambda)
    const contactResource = this.api.root.addResource('contact-email');
    contactResource.addMethod('POST', new apigateway.LambdaIntegration(contactEmailLambda));

    // /profile-image (bestehende Lambda)
    const profileImageResource = this.api.root.addResource('profile-image');
    const uploadUrlResource = profileImageResource.addResource('upload-url');
    uploadUrlResource.addMethod('POST', new apigateway.LambdaIntegration(profileImageLambda));

    // /pdf-generator (Puppeteer PDF-Generierung)
    const pdfGeneratorResource = this.api.root.addResource('pdf-generator');
    pdfGeneratorResource.addMethod('POST', new apigateway.LambdaIntegration(pdfGeneratorLambda));

    // ========================================
    // OUTPUTS
    // ========================================
    this.apiUrl = new cdk.CfnOutput(this, 'WebsiteApiUrl', {
      value: this.api.url,
      description: 'Website API Gateway URL',
      exportName: 'WebsiteApiUrl'
    });

    new cdk.CfnOutput(this, 'WebsiteApiId', {
      value: this.api.restApiId,
      description: 'Website API Gateway ID'
    });
  }
}
