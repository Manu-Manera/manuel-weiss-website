"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsiteApiStack = void 0;
const cdk = require("aws-cdk-lib");
const apigateway = require("aws-cdk-lib/aws-apigateway");
const lambda = require("aws-cdk-lib/aws-lambda");
const iam = require("aws-cdk-lib/aws-iam");
const dynamodb = require("aws-cdk-lib/aws-dynamodb");
const s3 = require("aws-cdk-lib/aws-s3");
/**
 * Website API Stack
 * Website API: AWS Lambda + API Gateway für manuel-weiss.ch
 */
class WebsiteApiStack extends cdk.Stack {
    constructor(scope, id, props) {
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
            description: 'API für manuel-weiss.ch',
            defaultCorsPreflightOptions: {
                allowOrigins: [
                    'https://manuel-weiss.ch',
                    'https://www.manuel-weiss.ch',
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
                PROFILE_TABLE: 'mawps-user-profiles',
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
        // PDF Generator Lambda (GPT-5.2 + Puppeteer für präzise PDF-Generierung)
        const pdfGeneratorLambda = new lambda.Function(this, 'PdfGeneratorFunction', {
            functionName: 'website-pdf-generator',
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('../lambda/pdf-generator-gpt52'),
            role: lambdaRole,
            timeout: cdk.Duration.seconds(120),
            memorySize: 2048,
            environment: {
                NODE_ENV: 'production'
                // OPENAI_API_KEY wird nicht als Umgebungsvariable gesetzt, sondern vom Frontend übergeben
            }
        });
        // ========================================
        // HERO VIDEO LAMBDAS (Phase 1 Migration)
        // ========================================
        // Hero Video Settings Lambda
        const heroVideoSettingsLambda = new lambda.Function(this, 'HeroVideoSettingsFunction', {
            functionName: 'website-hero-video-settings',
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('../lambda/hero-video-settings'),
            role: lambdaRole,
            timeout: cdk.Duration.seconds(30),
            memorySize: 256,
            environment: {
                SETTINGS_TABLE: 'manuel-weiss-settings',
                HERO_VIDEO_BUCKET: 'manuel-weiss-hero-videos'
                // AWS_REGION wird automatisch von Lambda gesetzt
            }
        });
        // Hero Video Upload Lambda
        const heroVideoUploadLambda = new lambda.Function(this, 'HeroVideoUploadFunction', {
            functionName: 'website-hero-video-upload',
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('../lambda/hero-video-upload'),
            role: lambdaRole,
            timeout: cdk.Duration.seconds(30),
            memorySize: 256,
            environment: {
                HERO_VIDEO_BUCKET: 'manuel-weiss-hero-videos'
                // AWS_REGION wird automatisch von Lambda gesetzt
            }
        });
        // Hero Video Upload Direct Lambda
        const heroVideoUploadDirectLambda = new lambda.Function(this, 'HeroVideoUploadDirectFunction', {
            functionName: 'website-hero-video-upload-direct',
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('../lambda/hero-video-upload-direct'),
            role: lambdaRole,
            timeout: cdk.Duration.seconds(120),
            memorySize: 1024,
            environment: {
                HERO_VIDEO_BUCKET: 'manuel-weiss-hero-videos',
                SETTINGS_TABLE: 'manuel-weiss-settings',
                SETTINGS_KEY: 'hero-video-url'
                // AWS_REGION wird automatisch von Lambda gesetzt
            }
        });
        // Text-to-BPMN Lambda (HR-Automation-Workflow)
        const textToBpmnLambda = new lambda.Function(this, 'TextToBpmnFunction', {
            functionName: 'website-text-to-bpmn',
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('../lambda/text-to-bpmn'),
            role: lambdaRole,
            timeout: cdk.Duration.seconds(30),
            memorySize: 256
        });
        // ========================================
        // BEWERBUNGSPROFIL LAMBDA (Phase 2 Migration)
        // ========================================
        // Bewerbungsprofil Lambda
        const bewerbungsprofilLambda = new lambda.Function(this, 'BewerbungsprofilFunction', {
            functionName: 'website-bewerbungsprofil',
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('../lambda/bewerbungsprofil'),
            role: lambdaRole,
            timeout: cdk.Duration.seconds(30),
            memorySize: 256,
            environment: {
                USER_DATA_TABLE: 'mawps-user-data'
                // AWS_REGION wird automatisch von Lambda gesetzt
            }
        });
        // ========================================
        // USER PROFILE API LAMBDA (Phase 3 Migration)
        // ========================================
        // User Profile API Lambda
        const userProfileApiLambda = new lambda.Function(this, 'UserProfileApiFunction', {
            functionName: 'website-user-profile-api',
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('../lambda/user-profile-api'),
            role: lambdaRole,
            timeout: cdk.Duration.seconds(30),
            memorySize: 256,
            environment: {
                PROFILES_TABLE: 'mawps-user-profiles',
                APPLICATIONS_TABLE: 'mawps-applications',
                RESUMES_TABLE: 'mawps-resumes',
                COVER_LETTERS_TABLE: 'mawps-cover-letters'
                // AWS_REGION wird automatisch von Lambda gesetzt
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
        // CORS explizit konfigurieren
        apiSettingsResource.addCorsPreflight({
            allowOrigins: ['*'],
            allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowHeaders: ['Content-Type', 'Authorization', 'X-Amz-Date', 'X-Api-Key', 'X-Amz-Security-Token'],
            maxAge: cdk.Duration.days(1)
        });
        // Methoden explizit erstellen (nicht Proxy, damit CORS funktioniert)
        const apiSettingsIntegration = new apigateway.LambdaIntegration(apiSettingsLambda, {
            proxy: true,
            integrationResponses: [{
                    statusCode: '200',
                    responseParameters: {
                        'method.response.header.Access-Control-Allow-Origin': "'*'",
                        'method.response.header.Access-Control-Allow-Headers': "'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token'",
                        'method.response.header.Access-Control-Allow-Methods': "'GET,POST,PUT,DELETE,OPTIONS'"
                    }
                }]
        });
        ['GET', 'POST', 'PUT', 'DELETE'].forEach(method => {
            apiSettingsResource.addMethod(method, apiSettingsIntegration, {
                methodResponses: [{
                        statusCode: '200',
                        responseParameters: {
                            'method.response.header.Access-Control-Allow-Origin': true,
                            'method.response.header.Access-Control-Allow-Headers': true,
                            'method.response.header.Access-Control-Allow-Methods': true
                        }
                    }]
            });
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
        // Bei AWS_PROXY werden Header automatisch von Lambda propagiert
        // Wir müssen sie nur in der Method-Response deklarieren
        pdfGeneratorResource.addMethod('POST', new apigateway.LambdaIntegration(pdfGeneratorLambda), {
            methodResponses: [{
                    statusCode: '200',
                    responseParameters: {
                        'method.response.header.Access-Control-Allow-Origin': true,
                        'method.response.header.Access-Control-Allow-Headers': true,
                        'method.response.header.Access-Control-Allow-Methods': true,
                    }
                }]
        });
        // ========================================
        // HERO VIDEO ROUTES (Phase 1 Migration)
        // ========================================
        // /hero-video-settings
        const heroVideoSettingsResource = this.api.root.addResource('hero-video-settings');
        heroVideoSettingsResource.addMethod('GET', new apigateway.LambdaIntegration(heroVideoSettingsLambda));
        heroVideoSettingsResource.addMethod('POST', new apigateway.LambdaIntegration(heroVideoSettingsLambda));
        heroVideoSettingsResource.addMethod('PUT', new apigateway.LambdaIntegration(heroVideoSettingsLambda));
        // /hero-video-upload
        const heroVideoUploadResource = this.api.root.addResource('hero-video-upload');
        heroVideoUploadResource.addMethod('POST', new apigateway.LambdaIntegration(heroVideoUploadLambda));
        heroVideoUploadResource.addMethod('GET', new apigateway.LambdaIntegration(heroVideoUploadLambda));
        // /hero-video-upload-direct
        const heroVideoUploadDirectResource = this.api.root.addResource('hero-video-upload-direct');
        heroVideoUploadDirectResource.addMethod('POST', new apigateway.LambdaIntegration(heroVideoUploadDirectLambda));
        // /text-to-bpmn (HR-Automation-Workflow)
        const textToBpmnResource = this.api.root.addResource('text-to-bpmn');
        textToBpmnResource.addMethod('POST', new apigateway.LambdaIntegration(textToBpmnLambda));
        // ========================================
        // BEWERBUNGSPROFIL ROUTES (Phase 2 Migration)
        // ========================================
        // /bewerbungsprofil
        const bewerbungsprofilResource = this.api.root.addResource('bewerbungsprofil');
        bewerbungsprofilResource.addMethod('GET', new apigateway.LambdaIntegration(bewerbungsprofilLambda));
        bewerbungsprofilResource.addMethod('POST', new apigateway.LambdaIntegration(bewerbungsprofilLambda));
        bewerbungsprofilResource.addMethod('PUT', new apigateway.LambdaIntegration(bewerbungsprofilLambda));
        bewerbungsprofilResource.addMethod('DELETE', new apigateway.LambdaIntegration(bewerbungsprofilLambda));
        // /bewerbungsprofil/section/{name}
        const bewerbungsprofilSectionResource = bewerbungsprofilResource.addResource('section');
        const bewerbungsprofilSectionNameResource = bewerbungsprofilSectionResource.addResource('{name}');
        bewerbungsprofilSectionNameResource.addMethod('GET', new apigateway.LambdaIntegration(bewerbungsprofilLambda));
        bewerbungsprofilSectionNameResource.addMethod('PUT', new apigateway.LambdaIntegration(bewerbungsprofilLambda));
        // ========================================
        // USER PROFILE API ROUTES (Phase 3 Migration)
        // ========================================
        // /user-profile-api (Proxy für alle Sub-Routes)
        const userProfileApiResource = this.api.root.addResource('user-profile-api');
        userProfileApiResource.addProxy({
            anyMethod: true,
            defaultIntegration: new apigateway.LambdaIntegration(userProfileApiLambda)
        });
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
exports.WebsiteApiStack = WebsiteApiStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vic2l0ZS1hcGktc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ3ZWJzaXRlLWFwaS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFDbkMseURBQXlEO0FBQ3pELGlEQUFpRDtBQUNqRCwyQ0FBMkM7QUFDM0MscURBQXFEO0FBQ3JELHlDQUF5QztBQUd6Qzs7O0dBR0c7QUFDSCxNQUFhLGVBQWdCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFJNUMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QiwyQ0FBMkM7UUFDM0Msc0NBQXNDO1FBQ3RDLDJDQUEyQztRQUUzQyx5Q0FBeUM7UUFDekMsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO1FBQ2pHLE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1FBQ3RHLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztRQUNuRyxNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBRXRHLGtDQUFrQztRQUNsQyxNQUFNLGtCQUFrQixHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1FBQ3hHLE1BQU0sZUFBZSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFD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QUF3QjtTQUN0QyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFqbUJELDBDQWltQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheSc7XG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XG5pbXBvcnQgKiBhcyBpYW0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XG5pbXBvcnQgKiBhcyBkeW5hbW9kYiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZHluYW1vZGInO1xuaW1wb3J0ICogYXMgczMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuXG4vKipcbiAqIFdlYnNpdGUgQVBJIFN0YWNrXG4gKiBFcnNldHp0IGFsbGUgTmV0bGlmeSBGdW5jdGlvbnMgbWl0IEFXUyBMYW1iZGEgKyBBUEkgR2F0ZXdheVxuICovXG5leHBvcnQgY2xhc3MgV2Vic2l0ZUFwaVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgcHVibGljIHJlYWRvbmx5IGFwaTogYXBpZ2F0ZXdheS5SZXN0QXBpO1xuICBwdWJsaWMgcmVhZG9ubHkgYXBpVXJsOiBjZGsuQ2ZuT3V0cHV0O1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBCRVNURUhFTkRFIFJFU1NPVVJDRU4gUkVGRVJFTlpJRVJFTlxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBcbiAgICAvLyBEeW5hbW9EQiBUYWJlbGxlbiAoZXhpc3RpZXJlbiBiZXJlaXRzKVxuICAgIGNvbnN0IHVzZXJEYXRhVGFibGUgPSBkeW5hbW9kYi5UYWJsZS5mcm9tVGFibGVOYW1lKHRoaXMsICdVc2VyRGF0YVRhYmxlJywgJ21hd3BzLXVzZXItcHJvZmlsZXMnKTtcbiAgICBjb25zdCBoaWdoc2NvcmVzVGFibGUgPSBkeW5hbW9kYi5UYWJsZS5mcm9tVGFibGVOYW1lKHRoaXMsICdIaWdoc2NvcmVzVGFibGUnLCAnc25vd2ZsYWtlLWhpZ2hzY29yZXMnKTtcbiAgICBjb25zdCBzZXR0aW5nc1RhYmxlID0gZHluYW1vZGIuVGFibGUuZnJvbVRhYmxlTmFtZSh0aGlzLCAnU2V0dGluZ3NUYWJsZScsICdtYW51ZWwtd2Vpc3Mtc2V0dGluZ3MnKTtcbiAgICBjb25zdCBhcGlTZXR0aW5nc1RhYmxlID0gZHluYW1vZGIuVGFibGUuZnJvbVRhYmxlTmFtZSh0aGlzLCAnQXBpU2V0dGluZ3NUYWJsZScsICdtYXdwcy1hcGktc2V0dGluZ3MnKTtcbiAgICBcbiAgICAvLyBTMyBCdWNrZXRzIChleGlzdGllcmVuIGJlcmVpdHMpXG4gICAgY29uc3QgcHJvZmlsZUltYWdlQnVja2V0ID0gczMuQnVja2V0LmZyb21CdWNrZXROYW1lKHRoaXMsICdQcm9maWxlSW1hZ2VCdWNrZXQnLCAnbWF3cHMtcHJvZmlsZS1pbWFnZXMnKTtcbiAgICBjb25zdCBoZXJvVmlkZW9CdWNrZXQgPSBzMy5CdWNrZXQuZnJvbUJ1Y2tldE5hbWUodGhpcywgJ0hlcm9WaWRlb0J1Y2tldCcsICdtYW51ZWwtd2Vpc3MtaGVyby12aWRlb3MnKTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBJQU0gUk9MTEUgRsOcUiBMQU1CREFTXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIGNvbnN0IGxhbWJkYVJvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgJ1dlYnNpdGVMYW1iZGFSb2xlJywge1xuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoJ2xhbWJkYS5hbWF6b25hd3MuY29tJyksXG4gICAgICBtYW5hZ2VkUG9saWNpZXM6IFtcbiAgICAgICAgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKCdzZXJ2aWNlLXJvbGUvQVdTTGFtYmRhQmFzaWNFeGVjdXRpb25Sb2xlJylcbiAgICAgIF1cbiAgICB9KTtcblxuICAgIC8vIER5bmFtb0RCIFBlcm1pc3Npb25zXG4gICAgbGFtYmRhUm9sZS5hZGRUb1BvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICBhY3Rpb25zOiBbXG4gICAgICAgICdkeW5hbW9kYjpHZXRJdGVtJyxcbiAgICAgICAgJ2R5bmFtb2RiOlB1dEl0ZW0nLFxuICAgICAgICAnZHluYW1vZGI6VXBkYXRlSXRlbScsXG4gICAgICAgICdkeW5hbW9kYjpEZWxldGVJdGVtJyxcbiAgICAgICAgJ2R5bmFtb2RiOlF1ZXJ5JyxcbiAgICAgICAgJ2R5bmFtb2RiOlNjYW4nXG4gICAgICBdLFxuICAgICAgcmVzb3VyY2VzOiBbXG4gICAgICAgIHVzZXJEYXRhVGFibGUudGFibGVBcm4sXG4gICAgICAgIGhpZ2hzY29yZXNUYWJsZS50YWJsZUFybixcbiAgICAgICAgc2V0dGluZ3NUYWJsZS50YWJsZUFybixcbiAgICAgICAgYXBpU2V0dGluZ3NUYWJsZS50YWJsZUFybixcbiAgICAgICAgJ2Fybjphd3M6ZHluYW1vZGI6ZXUtY2VudHJhbC0xOio6dGFibGUvbWF3cHMtdXNlci1kYXRhJ1xuICAgICAgXVxuICAgIH0pKTtcblxuICAgIC8vIFMzIFBlcm1pc3Npb25zXG4gICAgbGFtYmRhUm9sZS5hZGRUb1BvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICBhY3Rpb25zOiBbXG4gICAgICAgICdzMzpHZXRPYmplY3QnLFxuICAgICAgICAnczM6UHV0T2JqZWN0JyxcbiAgICAgICAgJ3MzOkRlbGV0ZU9iamVjdCcsXG4gICAgICAgICdzMzpMaXN0QnVja2V0J1xuICAgICAgXSxcbiAgICAgIHJlc291cmNlczogW1xuICAgICAgICBwcm9maWxlSW1hZ2VCdWNrZXQuYnVja2V0QXJuLFxuICAgICAgICBgJHtwcm9maWxlSW1hZ2VCdWNrZXQuYnVja2V0QXJufS8qYCxcbiAgICAgICAgaGVyb1ZpZGVvQnVja2V0LmJ1Y2tldEFybixcbiAgICAgICAgYCR7aGVyb1ZpZGVvQnVja2V0LmJ1Y2tldEFybn0vKmBcbiAgICAgIF1cbiAgICB9KSk7XG5cbiAgICAvLyBTRVMgUGVybWlzc2lvbnMgKGbDvHIgS29udGFrdC1FLU1haWxzKVxuICAgIGxhbWJkYVJvbGUuYWRkVG9Qb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgYWN0aW9uczogWydzZXM6U2VuZEVtYWlsJywgJ3NlczpTZW5kUmF3RW1haWwnXSxcbiAgICAgIHJlc291cmNlczogWycqJ11cbiAgICB9KSk7XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gQVBJIEdBVEVXQVlcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgdGhpcy5hcGkgPSBuZXcgYXBpZ2F0ZXdheS5SZXN0QXBpKHRoaXMsICdXZWJzaXRlQVBJJywge1xuICAgICAgcmVzdEFwaU5hbWU6ICdNYW51ZWwgV2Vpc3MgV2Vic2l0ZSBBUEknLFxuICAgICAgZGVzY3JpcHRpb246ICdBUEkgZsO8ciBtYW51ZWwtd2Vpc3MuY2ggKGVyc2V0enQgTmV0bGlmeSBGdW5jdGlvbnMpJyxcbiAgICAgIGRlZmF1bHRDb3JzUHJlZmxpZ2h0T3B0aW9uczoge1xuICAgICAgICBhbGxvd09yaWdpbnM6IFtcbiAgICAgICAgICAnaHR0cHM6Ly9tYW51ZWwtd2Vpc3MuY2gnLFxuICAgICAgICAgICdodHRwczovL3d3dy5tYW51ZWwtd2Vpc3MuY2gnLFxuICAgICAgICAgICdodHRwczovL21hd3BzLm5ldGxpZnkuYXBwJyxcbiAgICAgICAgICAnaHR0cDovL2xvY2FsaG9zdDozMDAwJyxcbiAgICAgICAgICAnaHR0cDovL2xvY2FsaG9zdDo1NTAwJyxcbiAgICAgICAgICAnaHR0cDovLzEyNy4wLjAuMTo1NTAwJ1xuICAgICAgICBdLFxuICAgICAgICBhbGxvd01ldGhvZHM6IFsnR0VUJywgJ1BPU1QnLCAnUFVUJywgJ0RFTEVURScsICdPUFRJT05TJ10sXG4gICAgICAgIGFsbG93SGVhZGVyczogW1xuICAgICAgICAgICdDb250ZW50LVR5cGUnLFxuICAgICAgICAgICdBdXRob3JpemF0aW9uJyxcbiAgICAgICAgICAnWC1Vc2VyLUlkJyxcbiAgICAgICAgICAnWC1BbXotRGF0ZScsXG4gICAgICAgICAgJ1gtQXBpLUtleScsXG4gICAgICAgICAgJ1gtQW16LVNlY3VyaXR5LVRva2VuJ1xuICAgICAgICBdLFxuICAgICAgICBhbGxvd0NyZWRlbnRpYWxzOiB0cnVlXG4gICAgICB9LFxuICAgICAgZGVwbG95T3B0aW9uczoge1xuICAgICAgICBzdGFnZU5hbWU6ICd2MScsXG4gICAgICAgIHRocm90dGxpbmdSYXRlTGltaXQ6IDEwMCxcbiAgICAgICAgdGhyb3R0bGluZ0J1cnN0TGltaXQ6IDIwMFxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIExBTUJEQSBGVU5DVElPTlNcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAvLyBVc2VyIERhdGEgTGFtYmRhXG4gICAgY29uc3QgdXNlckRhdGFMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdVc2VyRGF0YUZ1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnd2Vic2l0ZS11c2VyLWRhdGEnLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS91c2VyLWRhdGEnKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBVU0VSX0RBVEFfVEFCTEU6ICdtYXdwcy11c2VyLXByb2ZpbGVzJ1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gU25vd2ZsYWtlIEhpZ2hzY29yZXMgTGFtYmRhXG4gICAgY29uc3QgaGlnaHNjb3Jlc0xhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0hpZ2hzY29yZXNGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtc25vd2ZsYWtlLWhpZ2hzY29yZXMnLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS9zbm93Zmxha2UtaGlnaHNjb3JlcycpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKSxcbiAgICAgIG1lbW9yeVNpemU6IDI1NixcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIEhJR0hTQ09SRVNfVEFCTEU6ICdzbm93Zmxha2UtaGlnaHNjb3JlcydcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIEhlcm8gVmlkZW8gTGFtYmRhXG4gICAgY29uc3QgaGVyb1ZpZGVvTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnSGVyb1ZpZGVvRnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLWhlcm8tdmlkZW8nLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS9oZXJvLXZpZGVvJyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgRFlOQU1PREJfU0VUVElOR1NfVEFCTEU6ICdtYW51ZWwtd2Vpc3Mtc2V0dGluZ3MnLFxuICAgICAgICBTM19IRVJPX1ZJREVPX0JVQ0tFVDogJ21hbnVlbC13ZWlzcy1oZXJvLXZpZGVvcydcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIE9wZW5BSSBQcm94eSBMYW1iZGFcbiAgICBjb25zdCBvcGVuYWlQcm94eUxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ09wZW5BSVByb3h5RnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLW9wZW5haS1wcm94eScsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL29wZW5haS1wcm94eScpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDYwKSxcbiAgICAgIG1lbW9yeVNpemU6IDI1NlxuICAgIH0pO1xuXG4gICAgLy8gSm9iIFBhcnNlciBMYW1iZGFcbiAgICBjb25zdCBqb2JQYXJzZXJMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdKb2JQYXJzZXJGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtam9iLXBhcnNlcicsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL2pvYi1wYXJzZXInKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXG4gICAgICBtZW1vcnlTaXplOiAyNTZcbiAgICB9KTtcblxuICAgIC8vIENWIEdlbmVyYWwgTGFtYmRhXG4gICAgY29uc3QgY3ZHZW5lcmFsTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQ1ZHZW5lcmFsRnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLWN2LWdlbmVyYWwnLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS9jdi1nZW5lcmFsJyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMTIwKSxcbiAgICAgIG1lbW9yeVNpemU6IDUxMlxuICAgIH0pO1xuXG4gICAgLy8gQ1YgVGFyZ2V0IExhbWJkYVxuICAgIGNvbnN0IGN2VGFyZ2V0TGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQ1ZUYXJnZXRGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtY3YtdGFyZ2V0JyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvY3YtdGFyZ2V0JyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMTIwKSxcbiAgICAgIG1lbW9yeVNpemU6IDUxMlxuICAgIH0pO1xuXG4gICAgLy8gQ1YgSm9iIFBhcnNlIExhbWJkYVxuICAgIGNvbnN0IGN2Sm9iUGFyc2VMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdDVkpvYlBhcnNlRnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLWN2LWpvYi1wYXJzZScsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL2N2LWpvYi1wYXJzZScpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDYwKSxcbiAgICAgIG1lbW9yeVNpemU6IDI1NlxuICAgIH0pO1xuXG4gICAgLy8gQ1YgRmlsZXMgUGFyc2UgTGFtYmRhXG4gICAgY29uc3QgY3ZGaWxlc1BhcnNlTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQ1ZGaWxlc1BhcnNlRnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLWN2LWZpbGVzLXBhcnNlJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvY3YtZmlsZXMtcGFyc2UnKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcyg2MCksXG4gICAgICBtZW1vcnlTaXplOiA1MTJcbiAgICB9KTtcblxuICAgIC8vIENWIEV4cG9ydCBMYW1iZGFcbiAgICBjb25zdCBjdkV4cG9ydExhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0NWRXhwb3J0RnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLWN2LWV4cG9ydCcsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL2N2LWV4cG9ydCcpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKSxcbiAgICAgIG1lbW9yeVNpemU6IDI1NlxuICAgIH0pO1xuXG4gICAgLy8gQVBJIFNldHRpbmdzIExhbWJkYSAodm9sbHN0w6RuZGlnIG1pdCBWZXJzY2hsw7xzc2VsdW5nKVxuICAgIGNvbnN0IGFwaVNldHRpbmdzTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQXBpU2V0dGluZ3NGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtYXBpLXNldHRpbmdzJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvYXBpLXNldHRpbmdzJyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgQVBJX1NFVFRJTkdTX1RBQkxFOiAnbWF3cHMtYXBpLXNldHRpbmdzJyxcbiAgICAgICAgUFJPRklMRV9UQUJMRTogJ21hd3BzLXVzZXItcHJvZmlsZXMnLCAvLyBGw7xyIGdsb2JhbGUgQVBJIFNldHRpbmdzXG4gICAgICAgIEVOQ1JZUFRJT05fU0VDUkVUOiBwcm9jZXNzLmVudi5FTkNSWVBUSU9OX1NFQ1JFVCB8fCAnbWF3cHMtc2VjdXJlLWFwaS1rZXktZW5jcnlwdGlvbi0yMDI0J1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gQ29udGFjdCBFbWFpbCBMYW1iZGEgKHZvbGxzdMOkbmRpZyBtaXQgU0VTKVxuICAgIGNvbnN0IGNvbnRhY3RFbWFpbExhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0NvbnRhY3RFbWFpbEZ1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnd2Vic2l0ZS1jb250YWN0LWVtYWlsJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvY29udGFjdC1lbWFpbCcpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKSxcbiAgICAgIG1lbW9yeVNpemU6IDI1NixcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIEZST01fRU1BSUw6ICdub3JlcGx5QG1hbnVlbC13ZWlzcy5jaCcsXG4gICAgICAgIFRPX0VNQUlMOiAna29udGFrdEBtYW51ZWwtd2Vpc3MuY2gnXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBQcm9maWxlIEltYWdlIFVwbG9hZCBMYW1iZGEgKHZvbGxzdMOkbmRpZyBtaXQgUzMgUHJlc2lnbmVkIFVSTHMpXG4gICAgY29uc3QgcHJvZmlsZUltYWdlTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnUHJvZmlsZUltYWdlRnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLXByb2ZpbGUtaW1hZ2UtdXBsb2FkJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvcHJvZmlsZS1pbWFnZS11cGxvYWQnKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBTM19CVUNLRVQ6ICdtYXdwcy1wcm9maWxlLWltYWdlcydcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFBERiBHZW5lcmF0b3IgTGFtYmRhIChHUFQtNS4yICsgUHVwcGV0ZWVyIGbDvHIgcHLDpHppc2UgUERGLUdlbmVyaWVydW5nKVxuICAgIGNvbnN0IHBkZkdlbmVyYXRvckxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1BkZkdlbmVyYXRvckZ1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnd2Vic2l0ZS1wZGYtZ2VuZXJhdG9yJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvcGRmLWdlbmVyYXRvci1ncHQ1MicpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDEyMCksIC8vIEzDpG5nZXJlciBUaW1lb3V0IGbDvHIgR1BULTUuMiArIFBERi1HZW5lcmllcnVuZ1xuICAgICAgbWVtb3J5U2l6ZTogMjA0OCwgLy8gTWVociBNZW1vcnkgZsO8ciBQdXBwZXRlZXIvQ2hyb21lXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBOT0RFX0VOVjogJ3Byb2R1Y3Rpb24nXG4gICAgICAgIC8vIE9QRU5BSV9BUElfS0VZIHdpcmQgbmljaHQgYWxzIFVtZ2VidW5nc3ZhcmlhYmxlIGdlc2V0enQsIHNvbmRlcm4gdm9tIEZyb250ZW5kIMO8YmVyZ2ViZW5cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBIRVJPIFZJREVPIExBTUJEQVMgKFBoYXNlIDEgTWlncmF0aW9uKVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8vIEhlcm8gVmlkZW8gU2V0dGluZ3MgTGFtYmRhXG4gICAgY29uc3QgaGVyb1ZpZGVvU2V0dGluZ3NMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdIZXJvVmlkZW9TZXR0aW5nc0Z1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnd2Vic2l0ZS1oZXJvLXZpZGVvLXNldHRpbmdzJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvaGVyby12aWRlby1zZXR0aW5ncycpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKSxcbiAgICAgIG1lbW9yeVNpemU6IDI1NixcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIFNFVFRJTkdTX1RBQkxFOiAnbWFudWVsLXdlaXNzLXNldHRpbmdzJyxcbiAgICAgICAgSEVST19WSURFT19CVUNLRVQ6ICdtYW51ZWwtd2Vpc3MtaGVyby12aWRlb3MnXG4gICAgICAgIC8vIEFXU19SRUdJT04gd2lyZCBhdXRvbWF0aXNjaCB2b24gTGFtYmRhIGdlc2V0enRcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIEhlcm8gVmlkZW8gVXBsb2FkIExhbWJkYVxuICAgIGNvbnN0IGhlcm9WaWRlb1VwbG9hZExhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0hlcm9WaWRlb1VwbG9hZEZ1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnd2Vic2l0ZS1oZXJvLXZpZGVvLXVwbG9hZCcsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL2hlcm8tdmlkZW8tdXBsb2FkJyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgSEVST19WSURFT19CVUNLRVQ6ICdtYW51ZWwtd2Vpc3MtaGVyby12aWRlb3MnXG4gICAgICAgIC8vIEFXU19SRUdJT04gd2lyZCBhdXRvbWF0aXNjaCB2b24gTGFtYmRhIGdlc2V0enRcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIEhlcm8gVmlkZW8gVXBsb2FkIERpcmVjdCBMYW1iZGFcbiAgICBjb25zdCBoZXJvVmlkZW9VcGxvYWREaXJlY3RMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdIZXJvVmlkZW9VcGxvYWREaXJlY3RGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtaGVyby12aWRlby11cGxvYWQtZGlyZWN0JyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvaGVyby12aWRlby11cGxvYWQtZGlyZWN0JyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMTIwKSwgLy8gTMOkbmdlciBmw7xyIEJhc2U2NCBVcGxvYWQgKDEwME1CIG1heClcbiAgICAgIG1lbW9yeVNpemU6IDEwMjQsIC8vIE1laHIgTWVtb3J5IGbDvHIgQmFzZTY0IERlY29kaW5nICsgUzMgVXBsb2FkXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBIRVJPX1ZJREVPX0JVQ0tFVDogJ21hbnVlbC13ZWlzcy1oZXJvLXZpZGVvcycsXG4gICAgICAgIFNFVFRJTkdTX1RBQkxFOiAnbWFudWVsLXdlaXNzLXNldHRpbmdzJyxcbiAgICAgICAgU0VUVElOR1NfS0VZOiAnaGVyby12aWRlby11cmwnXG4gICAgICAgIC8vIEFXU19SRUdJT04gd2lyZCBhdXRvbWF0aXNjaCB2b24gTGFtYmRhIGdlc2V0enRcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBCRVdFUkJVTkdTUFJPRklMIExBTUJEQSAoUGhhc2UgMiBNaWdyYXRpb24pXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgLy8gQmV3ZXJidW5nc3Byb2ZpbCBMYW1iZGFcbiAgICBjb25zdCBiZXdlcmJ1bmdzcHJvZmlsTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQmV3ZXJidW5nc3Byb2ZpbEZ1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnd2Vic2l0ZS1iZXdlcmJ1bmdzcHJvZmlsJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvYmV3ZXJidW5nc3Byb2ZpbCcpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKSxcbiAgICAgIG1lbW9yeVNpemU6IDI1NixcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIFVTRVJfREFUQV9UQUJMRTogJ21hd3BzLXVzZXItZGF0YSdcbiAgICAgICAgLy8gQVdTX1JFR0lPTiB3aXJkIGF1dG9tYXRpc2NoIHZvbiBMYW1iZGEgZ2VzZXR6dFxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIFVTRVIgUFJPRklMRSBBUEkgTEFNQkRBIChQaGFzZSAzIE1pZ3JhdGlvbilcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAvLyBVc2VyIFByb2ZpbGUgQVBJIExhbWJkYVxuICAgIGNvbnN0IHVzZXJQcm9maWxlQXBpTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnVXNlclByb2ZpbGVBcGlGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtdXNlci1wcm9maWxlLWFwaScsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL3VzZXItcHJvZmlsZS1hcGknKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBQUk9GSUxFU19UQUJMRTogJ21hd3BzLXVzZXItcHJvZmlsZXMnLFxuICAgICAgICBBUFBMSUNBVElPTlNfVEFCTEU6ICdtYXdwcy1hcHBsaWNhdGlvbnMnLFxuICAgICAgICBSRVNVTUVTX1RBQkxFOiAnbWF3cHMtcmVzdW1lcycsXG4gICAgICAgIENPVkVSX0xFVFRFUlNfVEFCTEU6ICdtYXdwcy1jb3Zlci1sZXR0ZXJzJ1xuICAgICAgICAvLyBBV1NfUkVHSU9OIHdpcmQgYXV0b21hdGlzY2ggdm9uIExhbWJkYSBnZXNldHp0XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gQVBJIFJPVVRFU1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8vIC91c2VyLWRhdGFcbiAgICBjb25zdCB1c2VyRGF0YVJlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgndXNlci1kYXRhJyk7XG4gICAgdXNlckRhdGFSZXNvdXJjZS5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJEYXRhTGFtYmRhKSk7XG4gICAgdXNlckRhdGFSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIHVzZXJEYXRhUmVzb3VyY2UuYWRkTWV0aG9kKCdQVVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIHVzZXJEYXRhUmVzb3VyY2UuYWRkTWV0aG9kKCdERUxFVEUnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIFxuICAgIC8vIC91c2VyLWRhdGEvcHJvZmlsZVxuICAgIGNvbnN0IHByb2ZpbGVSZXNvdXJjZSA9IHVzZXJEYXRhUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3Byb2ZpbGUnKTtcbiAgICBwcm9maWxlUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIHByb2ZpbGVSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIHByb2ZpbGVSZXNvdXJjZS5hZGRNZXRob2QoJ1BVVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJEYXRhTGFtYmRhKSk7XG4gICAgXG4gICAgLy8gL3VzZXItZGF0YS9yZXN1bWVzXG4gICAgY29uc3QgcmVzdW1lc1Jlc291cmNlID0gdXNlckRhdGFSZXNvdXJjZS5hZGRSZXNvdXJjZSgncmVzdW1lcycpO1xuICAgIHJlc3VtZXNSZXNvdXJjZS5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJEYXRhTGFtYmRhKSk7XG4gICAgcmVzdW1lc1Jlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJEYXRhTGFtYmRhKSk7XG4gICAgcmVzdW1lc1Jlc291cmNlLmFkZE1ldGhvZCgnREVMRVRFJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBcbiAgICAvLyAvdXNlci1kYXRhL2RvY3VtZW50c1xuICAgIGNvbnN0IGRvY3VtZW50c1Jlc291cmNlID0gdXNlckRhdGFSZXNvdXJjZS5hZGRSZXNvdXJjZSgnZG9jdW1lbnRzJyk7XG4gICAgZG9jdW1lbnRzUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIGRvY3VtZW50c1Jlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJEYXRhTGFtYmRhKSk7XG4gICAgZG9jdW1lbnRzUmVzb3VyY2UuYWRkTWV0aG9kKCdERUxFVEUnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIFxuICAgIC8vIC91c2VyLWRhdGEvY292ZXItbGV0dGVyc1xuICAgIGNvbnN0IGNvdmVyTGV0dGVyc1Jlc291cmNlID0gdXNlckRhdGFSZXNvdXJjZS5hZGRSZXNvdXJjZSgnY292ZXItbGV0dGVycycpO1xuICAgIGNvdmVyTGV0dGVyc1Jlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBjb3ZlckxldHRlcnNSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIGNvdmVyTGV0dGVyc1Jlc291cmNlLmFkZE1ldGhvZCgnREVMRVRFJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBcbiAgICAvLyAvdXNlci1kYXRhL2FwcGxpY2F0aW9uc1xuICAgIGNvbnN0IGFwcGxpY2F0aW9uc1Jlc291cmNlID0gdXNlckRhdGFSZXNvdXJjZS5hZGRSZXNvdXJjZSgnYXBwbGljYXRpb25zJyk7XG4gICAgYXBwbGljYXRpb25zUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIGFwcGxpY2F0aW9uc1Jlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJEYXRhTGFtYmRhKSk7XG4gICAgYXBwbGljYXRpb25zUmVzb3VyY2UuYWRkTWV0aG9kKCdERUxFVEUnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIFxuICAgIC8vIC91c2VyLWRhdGEvcGhvdG9zXG4gICAgY29uc3QgcGhvdG9zUmVzb3VyY2UgPSB1c2VyRGF0YVJlc291cmNlLmFkZFJlc291cmNlKCdwaG90b3MnKTtcbiAgICBwaG90b3NSZXNvdXJjZS5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJEYXRhTGFtYmRhKSk7XG4gICAgcGhvdG9zUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBwaG90b3NSZXNvdXJjZS5hZGRNZXRob2QoJ0RFTEVURScsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJEYXRhTGFtYmRhKSk7XG4gICAgXG4gICAgLy8gL3VzZXItZGF0YS93b3JrZmxvd3Mve3Byb3h5K31cbiAgICBjb25zdCB3b3JrZmxvd3NSZXNvdXJjZSA9IHVzZXJEYXRhUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3dvcmtmbG93cycpO1xuICAgIGNvbnN0IHdvcmtmbG93UHJveHkgPSB3b3JrZmxvd3NSZXNvdXJjZS5hZGRQcm94eSh7XG4gICAgICBhbnlNZXRob2Q6IHRydWUsXG4gICAgICBkZWZhdWx0SW50ZWdyYXRpb246IG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJEYXRhTGFtYmRhKVxuICAgIH0pO1xuXG4gICAgLy8gL3Nub3dmbGFrZS1oaWdoc2NvcmVzXG4gICAgY29uc3QgaGlnaHNjb3Jlc1Jlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgnc25vd2ZsYWtlLWhpZ2hzY29yZXMnKTtcbiAgICBoaWdoc2NvcmVzUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihoaWdoc2NvcmVzTGFtYmRhKSk7XG4gICAgaGlnaHNjb3Jlc1Jlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGhpZ2hzY29yZXNMYW1iZGEpKTtcbiAgICBoaWdoc2NvcmVzUmVzb3VyY2UuYWRkTWV0aG9kKCdERUxFVEUnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihoaWdoc2NvcmVzTGFtYmRhKSk7XG5cbiAgICAvLyAvaGVyby12aWRlb1xuICAgIGNvbnN0IGhlcm9WaWRlb1Jlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgnaGVyby12aWRlbycpO1xuICAgIFxuICAgIC8vIC9oZXJvLXZpZGVvL3NldHRpbmdzXG4gICAgY29uc3QgaGVyb1NldHRpbmdzUmVzb3VyY2UgPSBoZXJvVmlkZW9SZXNvdXJjZS5hZGRSZXNvdXJjZSgnc2V0dGluZ3MnKTtcbiAgICBoZXJvU2V0dGluZ3NSZXNvdXJjZS5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGhlcm9WaWRlb0xhbWJkYSkpO1xuICAgIGhlcm9TZXR0aW5nc1Jlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGhlcm9WaWRlb0xhbWJkYSkpO1xuICAgIGhlcm9TZXR0aW5nc1Jlc291cmNlLmFkZE1ldGhvZCgnUFVUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaGVyb1ZpZGVvTGFtYmRhKSk7XG4gICAgXG4gICAgLy8gL2hlcm8tdmlkZW8vdXBsb2FkXG4gICAgY29uc3QgaGVyb1VwbG9hZFJlc291cmNlID0gaGVyb1ZpZGVvUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3VwbG9hZCcpO1xuICAgIGhlcm9VcGxvYWRSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihoZXJvVmlkZW9MYW1iZGEpKTtcbiAgICBoZXJvVXBsb2FkUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihoZXJvVmlkZW9MYW1iZGEpKTtcblxuICAgIC8vIC9vcGVuYWktcHJveHlcbiAgICBjb25zdCBvcGVuYWlSZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ29wZW5haS1wcm94eScpO1xuICAgIG9wZW5haVJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKG9wZW5haVByb3h5TGFtYmRhKSk7XG5cbiAgICAvLyAvam9iLXBhcnNlclxuICAgIGNvbnN0IGpvYlBhcnNlclJlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgnam9iLXBhcnNlcicpO1xuICAgIGpvYlBhcnNlclJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGpvYlBhcnNlckxhbWJkYSkpO1xuXG4gICAgLy8gL2N2LWdlbmVyYWxcbiAgICBjb25zdCBjdkdlbmVyYWxSZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2N2LWdlbmVyYWwnKTtcbiAgICBjdkdlbmVyYWxSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihjdkdlbmVyYWxMYW1iZGEpKTtcblxuICAgIC8vIC9jdi10YXJnZXRcbiAgICBjb25zdCBjdlRhcmdldFJlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgnY3YtdGFyZ2V0Jyk7XG4gICAgY3ZUYXJnZXRSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihjdlRhcmdldExhbWJkYSkpO1xuXG4gICAgLy8gL2N2LWpvYi1wYXJzZVxuICAgIGNvbnN0IGN2Sm9iUGFyc2VSZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2N2LWpvYi1wYXJzZScpO1xuICAgIGN2Sm9iUGFyc2VSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihjdkpvYlBhcnNlTGFtYmRhKSk7XG5cbiAgICAvLyAvY3YtZmlsZXMtcGFyc2VcbiAgICBjb25zdCBjdkZpbGVzUGFyc2VSZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2N2LWZpbGVzLXBhcnNlJyk7XG4gICAgY3ZGaWxlc1BhcnNlUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oY3ZGaWxlc1BhcnNlTGFtYmRhKSk7XG5cbiAgICAvLyAvY3YtZXhwb3J0XG4gICAgY29uc3QgY3ZFeHBvcnRSZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2N2LWV4cG9ydCcpO1xuICAgIGN2RXhwb3J0UmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oY3ZFeHBvcnRMYW1iZGEpKTtcblxuICAgIC8vIC9hcGktc2V0dGluZ3MgKGJlc3RlaGVuZGUgTGFtYmRhKVxuICAgIGNvbnN0IGFwaVNldHRpbmdzUmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCdhcGktc2V0dGluZ3MnKTtcbiAgICBcbiAgICAvLyBDT1JTIGV4cGxpeml0IGtvbmZpZ3VyaWVyZW5cbiAgICBhcGlTZXR0aW5nc1Jlc291cmNlLmFkZENvcnNQcmVmbGlnaHQoe1xuICAgICAgYWxsb3dPcmlnaW5zOiBbJyonXSxcbiAgICAgIGFsbG93TWV0aG9kczogWydHRVQnLCAnUE9TVCcsICdQVVQnLCAnREVMRVRFJywgJ09QVElPTlMnXSxcbiAgICAgIGFsbG93SGVhZGVyczogWydDb250ZW50LVR5cGUnLCAnQXV0aG9yaXphdGlvbicsICdYLUFtei1EYXRlJywgJ1gtQXBpLUtleScsICdYLUFtei1TZWN1cml0eS1Ub2tlbiddLFxuICAgICAgbWF4QWdlOiBjZGsuRHVyYXRpb24uZGF5cygxKVxuICAgIH0pO1xuICAgIFxuICAgIC8vIE1ldGhvZGVuIGV4cGxpeml0IGVyc3RlbGxlbiAobmljaHQgUHJveHksIGRhbWl0IENPUlMgZnVua3Rpb25pZXJ0KVxuICAgIGNvbnN0IGFwaVNldHRpbmdzSW50ZWdyYXRpb24gPSBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihhcGlTZXR0aW5nc0xhbWJkYSwge1xuICAgICAgcHJveHk6IHRydWUsXG4gICAgICBpbnRlZ3JhdGlvblJlc3BvbnNlczogW3tcbiAgICAgICAgc3RhdHVzQ29kZTogJzIwMCcsXG4gICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xuICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6IFwiJyonXCIsXG4gICAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6IFwiJ0NvbnRlbnQtVHlwZSxBdXRob3JpemF0aW9uLFgtQW16LURhdGUsWC1BcGktS2V5LFgtQW16LVNlY3VyaXR5LVRva2VuJ1wiLFxuICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiBcIidHRVQsUE9TVCxQVVQsREVMRVRFLE9QVElPTlMnXCJcbiAgICAgICAgfVxuICAgICAgfV1cbiAgICB9KTtcbiAgICBcbiAgICBbJ0dFVCcsICdQT1NUJywgJ1BVVCcsICdERUxFVEUnXS5mb3JFYWNoKG1ldGhvZCA9PiB7XG4gICAgICBhcGlTZXR0aW5nc1Jlc291cmNlLmFkZE1ldGhvZChtZXRob2QsIGFwaVNldHRpbmdzSW50ZWdyYXRpb24sIHtcbiAgICAgICAgbWV0aG9kUmVzcG9uc2VzOiBbe1xuICAgICAgICAgIHN0YXR1c0NvZGU6ICcyMDAnLFxuICAgICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xuICAgICAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogdHJ1ZSxcbiAgICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiB0cnVlLFxuICAgICAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIH1dXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIC9jb250YWN0LWVtYWlsIChiZXN0ZWhlbmRlIExhbWJkYSlcbiAgICBjb25zdCBjb250YWN0UmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCdjb250YWN0LWVtYWlsJyk7XG4gICAgY29udGFjdFJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGNvbnRhY3RFbWFpbExhbWJkYSkpO1xuXG4gICAgLy8gL3Byb2ZpbGUtaW1hZ2UgKGJlc3RlaGVuZGUgTGFtYmRhKVxuICAgIGNvbnN0IHByb2ZpbGVJbWFnZVJlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgncHJvZmlsZS1pbWFnZScpO1xuICAgIGNvbnN0IHVwbG9hZFVybFJlc291cmNlID0gcHJvZmlsZUltYWdlUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3VwbG9hZC11cmwnKTtcbiAgICB1cGxvYWRVcmxSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihwcm9maWxlSW1hZ2VMYW1iZGEpKTtcblxuICAgIC8vIC9wZGYtZ2VuZXJhdG9yIChQdXBwZXRlZXIgUERGLUdlbmVyaWVydW5nKVxuICAgIGNvbnN0IHBkZkdlbmVyYXRvclJlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgncGRmLWdlbmVyYXRvcicpO1xuICAgIC8vIEJlaSBBV1NfUFJPWFkgd2VyZGVuIEhlYWRlciBhdXRvbWF0aXNjaCB2b24gTGFtYmRhIHByb3BhZ2llcnRcbiAgICAvLyBXaXIgbcO8c3NlbiBzaWUgbnVyIGluIGRlciBNZXRob2QtUmVzcG9uc2UgZGVrbGFyaWVyZW5cbiAgICBwZGZHZW5lcmF0b3JSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihwZGZHZW5lcmF0b3JMYW1iZGEpLCB7XG4gICAgICBtZXRob2RSZXNwb25zZXM6IFt7XG4gICAgICAgIHN0YXR1c0NvZGU6ICcyMDAnLFxuICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiB0cnVlLFxuICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiB0cnVlLFxuICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiB0cnVlLFxuICAgICAgICB9XG4gICAgICB9XVxuICAgIH0pO1xuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIEhFUk8gVklERU8gUk9VVEVTIChQaGFzZSAxIE1pZ3JhdGlvbilcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAvLyAvaGVyby12aWRlby1zZXR0aW5nc1xuICAgIGNvbnN0IGhlcm9WaWRlb1NldHRpbmdzUmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCdoZXJvLXZpZGVvLXNldHRpbmdzJyk7XG4gICAgaGVyb1ZpZGVvU2V0dGluZ3NSZXNvdXJjZS5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGhlcm9WaWRlb1NldHRpbmdzTGFtYmRhKSk7XG4gICAgaGVyb1ZpZGVvU2V0dGluZ3NSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihoZXJvVmlkZW9TZXR0aW5nc0xhbWJkYSkpO1xuICAgIGhlcm9WaWRlb1NldHRpbmdzUmVzb3VyY2UuYWRkTWV0aG9kKCdQVVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihoZXJvVmlkZW9TZXR0aW5nc0xhbWJkYSkpO1xuXG4gICAgLy8gL2hlcm8tdmlkZW8tdXBsb2FkXG4gICAgY29uc3QgaGVyb1ZpZGVvVXBsb2FkUmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCdoZXJvLXZpZGVvLXVwbG9hZCcpO1xuICAgIGhlcm9WaWRlb1VwbG9hZFJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGhlcm9WaWRlb1VwbG9hZExhbWJkYSkpO1xuICAgIGhlcm9WaWRlb1VwbG9hZFJlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaGVyb1ZpZGVvVXBsb2FkTGFtYmRhKSk7XG5cbiAgICAvLyAvaGVyby12aWRlby11cGxvYWQtZGlyZWN0XG4gICAgY29uc3QgaGVyb1ZpZGVvVXBsb2FkRGlyZWN0UmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCdoZXJvLXZpZGVvLXVwbG9hZC1kaXJlY3QnKTtcbiAgICBoZXJvVmlkZW9VcGxvYWREaXJlY3RSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihoZXJvVmlkZW9VcGxvYWREaXJlY3RMYW1iZGEpKTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBCRVdFUkJVTkdTUFJPRklMIFJPVVRFUyAoUGhhc2UgMiBNaWdyYXRpb24pXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgLy8gL2Jld2VyYnVuZ3Nwcm9maWxcbiAgICBjb25zdCBiZXdlcmJ1bmdzcHJvZmlsUmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCdiZXdlcmJ1bmdzcHJvZmlsJyk7XG4gICAgYmV3ZXJidW5nc3Byb2ZpbFJlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oYmV3ZXJidW5nc3Byb2ZpbExhbWJkYSkpO1xuICAgIGJld2VyYnVuZ3Nwcm9maWxSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihiZXdlcmJ1bmdzcHJvZmlsTGFtYmRhKSk7XG4gICAgYmV3ZXJidW5nc3Byb2ZpbFJlc291cmNlLmFkZE1ldGhvZCgnUFVUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oYmV3ZXJidW5nc3Byb2ZpbExhbWJkYSkpO1xuICAgIGJld2VyYnVuZ3Nwcm9maWxSZXNvdXJjZS5hZGRNZXRob2QoJ0RFTEVURScsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGJld2VyYnVuZ3Nwcm9maWxMYW1iZGEpKTtcblxuICAgIC8vIC9iZXdlcmJ1bmdzcHJvZmlsL3NlY3Rpb24ve25hbWV9XG4gICAgY29uc3QgYmV3ZXJidW5nc3Byb2ZpbFNlY3Rpb25SZXNvdXJjZSA9IGJld2VyYnVuZ3Nwcm9maWxSZXNvdXJjZS5hZGRSZXNvdXJjZSgnc2VjdGlvbicpO1xuICAgIGNvbnN0IGJld2VyYnVuZ3Nwcm9maWxTZWN0aW9uTmFtZVJlc291cmNlID0gYmV3ZXJidW5nc3Byb2ZpbFNlY3Rpb25SZXNvdXJjZS5hZGRSZXNvdXJjZSgne25hbWV9Jyk7XG4gICAgYmV3ZXJidW5nc3Byb2ZpbFNlY3Rpb25OYW1lUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihiZXdlcmJ1bmdzcHJvZmlsTGFtYmRhKSk7XG4gICAgYmV3ZXJidW5nc3Byb2ZpbFNlY3Rpb25OYW1lUmVzb3VyY2UuYWRkTWV0aG9kKCdQVVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihiZXdlcmJ1bmdzcHJvZmlsTGFtYmRhKSk7XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gVVNFUiBQUk9GSUxFIEFQSSBST1VURVMgKFBoYXNlIDMgTWlncmF0aW9uKVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8vIC91c2VyLXByb2ZpbGUtYXBpIChQcm94eSBmw7xyIGFsbGUgU3ViLVJvdXRlcylcbiAgICBjb25zdCB1c2VyUHJvZmlsZUFwaVJlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgndXNlci1wcm9maWxlLWFwaScpO1xuICAgIHVzZXJQcm9maWxlQXBpUmVzb3VyY2UuYWRkUHJveHkoe1xuICAgICAgYW55TWV0aG9kOiB0cnVlLFxuICAgICAgZGVmYXVsdEludGVncmF0aW9uOiBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyUHJvZmlsZUFwaUxhbWJkYSlcbiAgICB9KTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBPVVRQVVRTXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIHRoaXMuYXBpVXJsID0gbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1dlYnNpdGVBcGlVcmwnLCB7XG4gICAgICB2YWx1ZTogdGhpcy5hcGkudXJsLFxuICAgICAgZGVzY3JpcHRpb246ICdXZWJzaXRlIEFQSSBHYXRld2F5IFVSTCcsXG4gICAgICBleHBvcnROYW1lOiAnV2Vic2l0ZUFwaVVybCdcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdXZWJzaXRlQXBpSWQnLCB7XG4gICAgICB2YWx1ZTogdGhpcy5hcGkucmVzdEFwaUlkLFxuICAgICAgZGVzY3JpcHRpb246ICdXZWJzaXRlIEFQSSBHYXRld2F5IElEJ1xuICAgIH0pO1xuICB9XG59XG4iXX0=