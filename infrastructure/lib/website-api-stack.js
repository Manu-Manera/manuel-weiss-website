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
                    'https://manuel-weiss.ch',
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
        // GATEWAY-LEVEL CORS (WICHTIG für Fehlerfälle)
        // ========================================
        // Wenn Lambda/Integration in einen Error-Pfad läuft (z.B. 502/504/413),
        // liefert API Gateway teils "DEFAULT_4XX/5XX" Responses OHNE CORS-Header.
        // Das erscheint im Browser als "CORS blocked" und verschleiert die echte Ursache.
        const gatewayCorsHeaders = {
            'Access-Control-Allow-Origin': "'*'",
            'Access-Control-Allow-Headers': "'Content-Type,Authorization,X-User-Id,X-Amz-Date,X-Api-Key,X-Amz-Security-Token'",
            'Access-Control-Allow-Methods': "'GET,POST,PUT,DELETE,OPTIONS'"
        };
        this.api.addGatewayResponse('Default4xxCors', {
            type: apigateway.ResponseType.DEFAULT_4XX,
            responseHeaders: gatewayCorsHeaders
        });
        this.api.addGatewayResponse('Default5xxCors', {
            type: apigateway.ResponseType.DEFAULT_5XX,
            responseHeaders: gatewayCorsHeaders
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
        // Text-to-BPMN mit GPT-5.2 (Admin: KI-BPMN-Generierung)
        const textToBpmnGpt52Lambda = new lambda.Function(this, 'TextToBpmnGpt52Function', {
            functionName: 'website-text-to-bpmn-gpt52',
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('../lambda/text-to-bpmn-gpt52'),
            role: lambdaRole,
            timeout: cdk.Duration.seconds(300),
            memorySize: 1024 // Mehr Memory = schnellerer CPU für Analyse (API Gateway max 29s)
        });
        // HR-Leads API Lambda (HR-Selbsttest Lead-Erfassung)
        const hrLeadsLambda = new lambda.Function(this, 'HrLeadsFunction', {
            functionName: 'website-hr-leads',
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('../lambda/hr-leads-api'),
            role: lambdaRole,
            timeout: cdk.Duration.seconds(30),
            memorySize: 256,
            environment: {
                S3_BUCKET: 'manuel-weiss-website',
                ADMIN_PASSWORD: 'mw-admin-2024'
            }
        });
        // S3 Permissions für HR-Leads (manuel-weiss-website bucket)
        hrLeadsLambda.addToRolePolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['s3:GetObject', 's3:PutObject'],
            resources: ['arn:aws:s3:::manuel-weiss-website/data/*']
        }));
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
        // Lambda Integration mit CORS Headers
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
        // Methoden explizit erstellen mit CORS Headers (OPTIONS wird von Lambda behandelt)
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
        // NOTE: /api-settings?action=key&provider=... wird produktiv genutzt.
        // Ein zusätzliches Sub-Resource `/api-settings/key` existiert in manchen Umgebungen bereits (Out-of-band),
        // was zu CloudFormation-Conflicts führen kann. Daher hier bewusst NICHT mehr anlegen.
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
        // /text-to-bpmn-gpt (Admin: BPMN-Generierung mit GPT-5.2)
        const textToBpmnGptResource = this.api.root.addResource('text-to-bpmn-gpt');
        textToBpmnGptResource.addMethod('POST', new apigateway.LambdaIntegration(textToBpmnGpt52Lambda));
        // Lambda Function URL für text-to-bpmn-gpt52 (längerer Timeout als API Gateway 29s)
        // Nutzt Lambda direkt → 120s Timeout statt 29s bei API Gateway
        const textToBpmnGpt52LambdaUrl = textToBpmnGpt52Lambda.addFunctionUrl({
            authType: lambda.FunctionUrlAuthType.NONE,
            cors: {
                allowedOrigins: ['*'],
                allowedMethods: [lambda.HttpMethod.POST],
                allowedHeaders: ['Content-Type', 'Authorization'],
            },
        });
        new cdk.CfnOutput(this, 'TextToBpmnGpt52FunctionUrl', {
            value: textToBpmnGpt52LambdaUrl.url,
            description: 'Lambda Function URL für BPMN (Analyse/To-Be) - längerer Timeout',
            exportName: 'TextToBpmnGpt52FunctionUrl',
        });
        // /hr-leads (HR-Selbsttest Lead-Erfassung)
        const hrLeadsResource = this.api.root.addResource('hr-leads');
        const hrLeadsSaveResource = hrLeadsResource.addResource('save');
        hrLeadsSaveResource.addMethod('POST', new apigateway.LambdaIntegration(hrLeadsLambda));
        const hrLeadsListResource = hrLeadsResource.addResource('list');
        hrLeadsListResource.addMethod('GET', new apigateway.LambdaIntegration(hrLeadsLambda));
        const hrLeadsDeleteResource = hrLeadsResource.addResource('delete');
        hrLeadsDeleteResource.addMethod('DELETE', new apigateway.LambdaIntegration(hrLeadsLambda));
        const hrLeadsClearResource = hrLeadsResource.addResource('clear');
        hrLeadsClearResource.addMethod('DELETE', new apigateway.LambdaIntegration(hrLeadsLambda));
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
        // ONBOARDING PROGRESS (Valkeen Onboarding Hub)
        // ========================================
        // DynamoDB Tabelle für Onboarding-Fortschritt
        const onboardingProgressTable = new dynamodb.Table(this, 'OnboardingProgressTable', {
            tableName: 'mawps-onboarding-progress',
            partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });
        // Lambda für Onboarding-Fortschritt
        const onboardingProgressLambda = new lambda.Function(this, 'OnboardingProgressFunction', {
            functionName: 'website-onboarding-progress',
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('../lambda/onboarding-progress'),
            role: lambdaRole,
            timeout: cdk.Duration.seconds(10),
            memorySize: 128,
            environment: {
                ONBOARDING_TABLE: onboardingProgressTable.tableName
            }
        });
        // DynamoDB Permissions für Onboarding Lambda
        onboardingProgressTable.grantReadWriteData(onboardingProgressLambda);
        // /onboarding-progress Route
        const onboardingProgressResource = this.api.root.addResource('onboarding-progress');
        onboardingProgressResource.addMethod('GET', new apigateway.LambdaIntegration(onboardingProgressLambda));
        onboardingProgressResource.addMethod('POST', new apigateway.LambdaIntegration(onboardingProgressLambda));
        // ========================================
        // FLASHCARDS (KI-Lernkarten mit Leitner-System)
        // ========================================
        // DynamoDB Tabelle für Flashcard-Decks
        const flashcardDecksTable = new dynamodb.Table(this, 'FlashcardDecksTable', {
            tableName: 'mawps-flashcard-decks',
            partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'deckId', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });
        // DynamoDB Tabelle für Flashcards
        const flashcardsTable = new dynamodb.Table(this, 'FlashcardsTable', {
            tableName: 'mawps-flashcards',
            partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'cardId', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });
        // Lambda für Flashcards API
        const flashcardsLambda = new lambda.Function(this, 'FlashcardsFunction', {
            functionName: 'website-flashcards-api',
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('../lambda/flashcards-api'),
            role: lambdaRole,
            timeout: cdk.Duration.seconds(120),
            memorySize: 512,
            environment: {
                DECKS_TABLE: flashcardDecksTable.tableName,
                CARDS_TABLE: flashcardsTable.tableName,
                API_SETTINGS_TABLE: 'mawps-api-settings'
            }
        });
        // DynamoDB Permissions für Flashcards Lambda
        flashcardDecksTable.grantReadWriteData(flashcardsLambda);
        flashcardsTable.grantReadWriteData(flashcardsLambda);
        // /flashcards Routes
        const flashcardsResource = this.api.root.addResource('flashcards');
        // /flashcards/decks
        const flashcardsDecksResource = flashcardsResource.addResource('decks');
        flashcardsDecksResource.addMethod('GET', new apigateway.LambdaIntegration(flashcardsLambda));
        flashcardsDecksResource.addMethod('POST', new apigateway.LambdaIntegration(flashcardsLambda));
        flashcardsDecksResource.addMethod('DELETE', new apigateway.LambdaIntegration(flashcardsLambda));
        // /flashcards/cards
        const flashcardsCardsResource = flashcardsResource.addResource('cards');
        flashcardsCardsResource.addMethod('GET', new apigateway.LambdaIntegration(flashcardsLambda));
        // /flashcards/study
        const flashcardsStudyResource = flashcardsResource.addResource('study');
        flashcardsStudyResource.addMethod('GET', new apigateway.LambdaIntegration(flashcardsLambda));
        // /flashcards/review
        const flashcardsReviewResource = flashcardsResource.addResource('review');
        flashcardsReviewResource.addMethod('POST', new apigateway.LambdaIntegration(flashcardsLambda));
        // /flashcards/stats
        const flashcardsStatsResource = flashcardsResource.addResource('stats');
        flashcardsStatsResource.addMethod('GET', new apigateway.LambdaIntegration(flashcardsLambda));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vic2l0ZS1hcGktc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ3ZWJzaXRlLWFwaS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFDbkMseURBQXlEO0FBQ3pELGlEQUFpRDtBQUNqRCwyQ0FBMkM7QUFDM0MscURBQXFEO0FBQ3JELHlDQUF5QztBQUd6Qzs7O0dBR0c7QUFDSCxNQUFhLGVBQWdCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFJNUMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QiwyQ0FBMkM7UUFDM0Msc0NBQXNDO1FBQ3RDLDJDQUEyQztRQUUzQyx5Q0FBeUM7UUFDekMsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO1FBQ2pHLE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1FBQ3RHLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztRQUNuRyxNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBRXRHLGtDQUFrQztRQUNsQyxNQUFNLGtCQUFrQixHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1FBQ3hHLE1BQU0sZUFBZSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFD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QUFjLEVBQUU7WUFDdEMsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUztZQUN6QixXQUFXLEVBQUUsd0JBQXdCO1NBQ3RDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQXh5QkQsMENBd3lCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBhcGlnYXRld2F5IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5JztcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCAqIGFzIGR5bmFtb2RiIGZyb20gJ2F3cy1jZGstbGliL2F3cy1keW5hbW9kYic7XG5pbXBvcnQgKiBhcyBzMyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtczMnO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5cbi8qKlxuICogV2Vic2l0ZSBBUEkgU3RhY2tcbiAqIFdlYnNpdGUgQVBJOiBBV1MgTGFtYmRhICsgQVBJIEdhdGV3YXkgZsO8ciBtYW51ZWwtd2Vpc3MuY2hcbiAqL1xuZXhwb3J0IGNsYXNzIFdlYnNpdGVBcGlTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIHB1YmxpYyByZWFkb25seSBhcGk6IGFwaWdhdGV3YXkuUmVzdEFwaTtcbiAgcHVibGljIHJlYWRvbmx5IGFwaVVybDogY2RrLkNmbk91dHB1dDtcblxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gQkVTVEVIRU5ERSBSRVNTT1VSQ0VOIFJFRkVSRU5aSUVSRU5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgXG4gICAgLy8gRHluYW1vREIgVGFiZWxsZW4gKGV4aXN0aWVyZW4gYmVyZWl0cylcbiAgICBjb25zdCB1c2VyRGF0YVRhYmxlID0gZHluYW1vZGIuVGFibGUuZnJvbVRhYmxlTmFtZSh0aGlzLCAnVXNlckRhdGFUYWJsZScsICdtYXdwcy11c2VyLXByb2ZpbGVzJyk7XG4gICAgY29uc3QgaGlnaHNjb3Jlc1RhYmxlID0gZHluYW1vZGIuVGFibGUuZnJvbVRhYmxlTmFtZSh0aGlzLCAnSGlnaHNjb3Jlc1RhYmxlJywgJ3Nub3dmbGFrZS1oaWdoc2NvcmVzJyk7XG4gICAgY29uc3Qgc2V0dGluZ3NUYWJsZSA9IGR5bmFtb2RiLlRhYmxlLmZyb21UYWJsZU5hbWUodGhpcywgJ1NldHRpbmdzVGFibGUnLCAnbWFudWVsLXdlaXNzLXNldHRpbmdzJyk7XG4gICAgY29uc3QgYXBpU2V0dGluZ3NUYWJsZSA9IGR5bmFtb2RiLlRhYmxlLmZyb21UYWJsZU5hbWUodGhpcywgJ0FwaVNldHRpbmdzVGFibGUnLCAnbWF3cHMtYXBpLXNldHRpbmdzJyk7XG4gICAgXG4gICAgLy8gUzMgQnVja2V0cyAoZXhpc3RpZXJlbiBiZXJlaXRzKVxuICAgIGNvbnN0IHByb2ZpbGVJbWFnZUJ1Y2tldCA9IHMzLkJ1Y2tldC5mcm9tQnVja2V0TmFtZSh0aGlzLCAnUHJvZmlsZUltYWdlQnVja2V0JywgJ21hd3BzLXByb2ZpbGUtaW1hZ2VzJyk7XG4gICAgY29uc3QgaGVyb1ZpZGVvQnVja2V0ID0gczMuQnVja2V0LmZyb21CdWNrZXROYW1lKHRoaXMsICdIZXJvVmlkZW9CdWNrZXQnLCAnbWFudWVsLXdlaXNzLWhlcm8tdmlkZW9zJyk7XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gSUFNIFJPTExFIEbDnFIgTEFNQkRBU1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBjb25zdCBsYW1iZGFSb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsICdXZWJzaXRlTGFtYmRhUm9sZScsIHtcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdsYW1iZGEuYW1hem9uYXdzLmNvbScpLFxuICAgICAgbWFuYWdlZFBvbGljaWVzOiBbXG4gICAgICAgIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnc2VydmljZS1yb2xlL0FXU0xhbWJkYUJhc2ljRXhlY3V0aW9uUm9sZScpXG4gICAgICBdXG4gICAgfSk7XG5cbiAgICAvLyBEeW5hbW9EQiBQZXJtaXNzaW9uc1xuICAgIGxhbWJkYVJvbGUuYWRkVG9Qb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgYWN0aW9uczogW1xuICAgICAgICAnZHluYW1vZGI6R2V0SXRlbScsXG4gICAgICAgICdkeW5hbW9kYjpQdXRJdGVtJyxcbiAgICAgICAgJ2R5bmFtb2RiOlVwZGF0ZUl0ZW0nLFxuICAgICAgICAnZHluYW1vZGI6RGVsZXRlSXRlbScsXG4gICAgICAgICdkeW5hbW9kYjpRdWVyeScsXG4gICAgICAgICdkeW5hbW9kYjpTY2FuJ1xuICAgICAgXSxcbiAgICAgIHJlc291cmNlczogW1xuICAgICAgICB1c2VyRGF0YVRhYmxlLnRhYmxlQXJuLFxuICAgICAgICBoaWdoc2NvcmVzVGFibGUudGFibGVBcm4sXG4gICAgICAgIHNldHRpbmdzVGFibGUudGFibGVBcm4sXG4gICAgICAgIGFwaVNldHRpbmdzVGFibGUudGFibGVBcm4sXG4gICAgICAgICdhcm46YXdzOmR5bmFtb2RiOmV1LWNlbnRyYWwtMToqOnRhYmxlL21hd3BzLXVzZXItZGF0YSdcbiAgICAgIF1cbiAgICB9KSk7XG5cbiAgICAvLyBTMyBQZXJtaXNzaW9uc1xuICAgIGxhbWJkYVJvbGUuYWRkVG9Qb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgYWN0aW9uczogW1xuICAgICAgICAnczM6R2V0T2JqZWN0JyxcbiAgICAgICAgJ3MzOlB1dE9iamVjdCcsXG4gICAgICAgICdzMzpEZWxldGVPYmplY3QnLFxuICAgICAgICAnczM6TGlzdEJ1Y2tldCdcbiAgICAgIF0sXG4gICAgICByZXNvdXJjZXM6IFtcbiAgICAgICAgcHJvZmlsZUltYWdlQnVja2V0LmJ1Y2tldEFybixcbiAgICAgICAgYCR7cHJvZmlsZUltYWdlQnVja2V0LmJ1Y2tldEFybn0vKmAsXG4gICAgICAgIGhlcm9WaWRlb0J1Y2tldC5idWNrZXRBcm4sXG4gICAgICAgIGAke2hlcm9WaWRlb0J1Y2tldC5idWNrZXRBcm59LypgXG4gICAgICBdXG4gICAgfSkpO1xuXG4gICAgLy8gU0VTIFBlcm1pc3Npb25zIChmw7xyIEtvbnRha3QtRS1NYWlscylcbiAgICBsYW1iZGFSb2xlLmFkZFRvUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcbiAgICAgIGFjdGlvbnM6IFsnc2VzOlNlbmRFbWFpbCcsICdzZXM6U2VuZFJhd0VtYWlsJ10sXG4gICAgICByZXNvdXJjZXM6IFsnKiddXG4gICAgfSkpO1xuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIEFQSSBHQVRFV0FZXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIHRoaXMuYXBpID0gbmV3IGFwaWdhdGV3YXkuUmVzdEFwaSh0aGlzLCAnV2Vic2l0ZUFQSScsIHtcbiAgICAgIHJlc3RBcGlOYW1lOiAnTWFudWVsIFdlaXNzIFdlYnNpdGUgQVBJJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQVBJIGbDvHIgbWFudWVsLXdlaXNzLmNoJyxcbiAgICAgIGRlZmF1bHRDb3JzUHJlZmxpZ2h0T3B0aW9uczoge1xuICAgICAgICBhbGxvd09yaWdpbnM6IFtcbiAgICAgICAgICAnaHR0cHM6Ly9tYW51ZWwtd2Vpc3MuY2gnLFxuICAgICAgICAgICdodHRwczovL3d3dy5tYW51ZWwtd2Vpc3MuY2gnLFxuICAgICAgICAgICdodHRwczovL21hbnVlbC13ZWlzcy5jaCcsXG4gICAgICAgICAgJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcsXG4gICAgICAgICAgJ2h0dHA6Ly9sb2NhbGhvc3Q6NTUwMCcsXG4gICAgICAgICAgJ2h0dHA6Ly8xMjcuMC4wLjE6NTUwMCdcbiAgICAgICAgXSxcbiAgICAgICAgYWxsb3dNZXRob2RzOiBbJ0dFVCcsICdQT1NUJywgJ1BVVCcsICdERUxFVEUnLCAnT1BUSU9OUyddLFxuICAgICAgICBhbGxvd0hlYWRlcnM6IFtcbiAgICAgICAgICAnQ29udGVudC1UeXBlJyxcbiAgICAgICAgICAnQXV0aG9yaXphdGlvbicsXG4gICAgICAgICAgJ1gtVXNlci1JZCcsXG4gICAgICAgICAgJ1gtQW16LURhdGUnLFxuICAgICAgICAgICdYLUFwaS1LZXknLFxuICAgICAgICAgICdYLUFtei1TZWN1cml0eS1Ub2tlbidcbiAgICAgICAgXSxcbiAgICAgICAgYWxsb3dDcmVkZW50aWFsczogdHJ1ZVxuICAgICAgfSxcbiAgICAgIGRlcGxveU9wdGlvbnM6IHtcbiAgICAgICAgc3RhZ2VOYW1lOiAndjEnLFxuICAgICAgICB0aHJvdHRsaW5nUmF0ZUxpbWl0OiAxMDAsXG4gICAgICAgIHRocm90dGxpbmdCdXJzdExpbWl0OiAyMDBcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBHQVRFV0FZLUxFVkVMIENPUlMgKFdJQ0hUSUcgZsO8ciBGZWhsZXJmw6RsbGUpXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIFdlbm4gTGFtYmRhL0ludGVncmF0aW9uIGluIGVpbmVuIEVycm9yLVBmYWQgbMOkdWZ0ICh6LkIuIDUwMi81MDQvNDEzKSxcbiAgICAvLyBsaWVmZXJ0IEFQSSBHYXRld2F5IHRlaWxzIFwiREVGQVVMVF80WFgvNVhYXCIgUmVzcG9uc2VzIE9ITkUgQ09SUy1IZWFkZXIuXG4gICAgLy8gRGFzIGVyc2NoZWludCBpbSBCcm93c2VyIGFscyBcIkNPUlMgYmxvY2tlZFwiIHVuZCB2ZXJzY2hsZWllcnQgZGllIGVjaHRlIFVyc2FjaGUuXG4gICAgY29uc3QgZ2F0ZXdheUNvcnNIZWFkZXJzID0ge1xuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6IFwiJyonXCIsXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6IFwiJ0NvbnRlbnQtVHlwZSxBdXRob3JpemF0aW9uLFgtVXNlci1JZCxYLUFtei1EYXRlLFgtQXBpLUtleSxYLUFtei1TZWN1cml0eS1Ub2tlbidcIixcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogXCInR0VULFBPU1QsUFVULERFTEVURSxPUFRJT05TJ1wiXG4gICAgfTtcblxuICAgIHRoaXMuYXBpLmFkZEdhdGV3YXlSZXNwb25zZSgnRGVmYXVsdDR4eENvcnMnLCB7XG4gICAgICB0eXBlOiBhcGlnYXRld2F5LlJlc3BvbnNlVHlwZS5ERUZBVUxUXzRYWCxcbiAgICAgIHJlc3BvbnNlSGVhZGVyczogZ2F0ZXdheUNvcnNIZWFkZXJzXG4gICAgfSk7XG5cbiAgICB0aGlzLmFwaS5hZGRHYXRld2F5UmVzcG9uc2UoJ0RlZmF1bHQ1eHhDb3JzJywge1xuICAgICAgdHlwZTogYXBpZ2F0ZXdheS5SZXNwb25zZVR5cGUuREVGQVVMVF81WFgsXG4gICAgICByZXNwb25zZUhlYWRlcnM6IGdhdGV3YXlDb3JzSGVhZGVyc1xuICAgIH0pO1xuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIExBTUJEQSBGVU5DVElPTlNcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAvLyBVc2VyIERhdGEgTGFtYmRhXG4gICAgY29uc3QgdXNlckRhdGFMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdVc2VyRGF0YUZ1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnd2Vic2l0ZS11c2VyLWRhdGEnLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS91c2VyLWRhdGEnKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBVU0VSX0RBVEFfVEFCTEU6ICdtYXdwcy11c2VyLXByb2ZpbGVzJ1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gU25vd2ZsYWtlIEhpZ2hzY29yZXMgTGFtYmRhXG4gICAgY29uc3QgaGlnaHNjb3Jlc0xhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0hpZ2hzY29yZXNGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtc25vd2ZsYWtlLWhpZ2hzY29yZXMnLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS9zbm93Zmxha2UtaGlnaHNjb3JlcycpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKSxcbiAgICAgIG1lbW9yeVNpemU6IDI1NixcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIEhJR0hTQ09SRVNfVEFCTEU6ICdzbm93Zmxha2UtaGlnaHNjb3JlcydcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIEhlcm8gVmlkZW8gTGFtYmRhXG4gICAgY29uc3QgaGVyb1ZpZGVvTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnSGVyb1ZpZGVvRnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLWhlcm8tdmlkZW8nLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS9oZXJvLXZpZGVvJyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgRFlOQU1PREJfU0VUVElOR1NfVEFCTEU6ICdtYW51ZWwtd2Vpc3Mtc2V0dGluZ3MnLFxuICAgICAgICBTM19IRVJPX1ZJREVPX0JVQ0tFVDogJ21hbnVlbC13ZWlzcy1oZXJvLXZpZGVvcydcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIE9wZW5BSSBQcm94eSBMYW1iZGFcbiAgICBjb25zdCBvcGVuYWlQcm94eUxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ09wZW5BSVByb3h5RnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLW9wZW5haS1wcm94eScsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL29wZW5haS1wcm94eScpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDYwKSxcbiAgICAgIG1lbW9yeVNpemU6IDI1NlxuICAgIH0pO1xuXG4gICAgLy8gSm9iIFBhcnNlciBMYW1iZGFcbiAgICBjb25zdCBqb2JQYXJzZXJMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdKb2JQYXJzZXJGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtam9iLXBhcnNlcicsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL2pvYi1wYXJzZXInKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXG4gICAgICBtZW1vcnlTaXplOiAyNTZcbiAgICB9KTtcblxuICAgIC8vIENWIEdlbmVyYWwgTGFtYmRhXG4gICAgY29uc3QgY3ZHZW5lcmFsTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQ1ZHZW5lcmFsRnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLWN2LWdlbmVyYWwnLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS9jdi1nZW5lcmFsJyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMTIwKSxcbiAgICAgIG1lbW9yeVNpemU6IDUxMlxuICAgIH0pO1xuXG4gICAgLy8gQ1YgVGFyZ2V0IExhbWJkYVxuICAgIGNvbnN0IGN2VGFyZ2V0TGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQ1ZUYXJnZXRGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtY3YtdGFyZ2V0JyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvY3YtdGFyZ2V0JyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMTIwKSxcbiAgICAgIG1lbW9yeVNpemU6IDUxMlxuICAgIH0pO1xuXG4gICAgLy8gQ1YgSm9iIFBhcnNlIExhbWJkYVxuICAgIGNvbnN0IGN2Sm9iUGFyc2VMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdDVkpvYlBhcnNlRnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLWN2LWpvYi1wYXJzZScsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL2N2LWpvYi1wYXJzZScpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDYwKSxcbiAgICAgIG1lbW9yeVNpemU6IDI1NlxuICAgIH0pO1xuXG4gICAgLy8gQ1YgRmlsZXMgUGFyc2UgTGFtYmRhXG4gICAgY29uc3QgY3ZGaWxlc1BhcnNlTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQ1ZGaWxlc1BhcnNlRnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLWN2LWZpbGVzLXBhcnNlJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvY3YtZmlsZXMtcGFyc2UnKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcyg2MCksXG4gICAgICBtZW1vcnlTaXplOiA1MTJcbiAgICB9KTtcblxuICAgIC8vIENWIEV4cG9ydCBMYW1iZGFcbiAgICBjb25zdCBjdkV4cG9ydExhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0NWRXhwb3J0RnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLWN2LWV4cG9ydCcsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL2N2LWV4cG9ydCcpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKSxcbiAgICAgIG1lbW9yeVNpemU6IDI1NlxuICAgIH0pO1xuXG4gICAgLy8gQVBJIFNldHRpbmdzIExhbWJkYSAodm9sbHN0w6RuZGlnIG1pdCBWZXJzY2hsw7xzc2VsdW5nKVxuICAgIGNvbnN0IGFwaVNldHRpbmdzTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQXBpU2V0dGluZ3NGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtYXBpLXNldHRpbmdzJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvYXBpLXNldHRpbmdzJyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgQVBJX1NFVFRJTkdTX1RBQkxFOiAnbWF3cHMtYXBpLXNldHRpbmdzJyxcbiAgICAgICAgUFJPRklMRV9UQUJMRTogJ21hd3BzLXVzZXItcHJvZmlsZXMnLCAvLyBGw7xyIGdsb2JhbGUgQVBJIFNldHRpbmdzXG4gICAgICAgIEVOQ1JZUFRJT05fU0VDUkVUOiBwcm9jZXNzLmVudi5FTkNSWVBUSU9OX1NFQ1JFVCB8fCAnbWF3cHMtc2VjdXJlLWFwaS1rZXktZW5jcnlwdGlvbi0yMDI0J1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gQ29udGFjdCBFbWFpbCBMYW1iZGEgKHZvbGxzdMOkbmRpZyBtaXQgU0VTKVxuICAgIGNvbnN0IGNvbnRhY3RFbWFpbExhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0NvbnRhY3RFbWFpbEZ1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnd2Vic2l0ZS1jb250YWN0LWVtYWlsJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvY29udGFjdC1lbWFpbCcpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKSxcbiAgICAgIG1lbW9yeVNpemU6IDI1NixcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIEZST01fRU1BSUw6ICdub3JlcGx5QG1hbnVlbC13ZWlzcy5jaCcsXG4gICAgICAgIFRPX0VNQUlMOiAna29udGFrdEBtYW51ZWwtd2Vpc3MuY2gnXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBQcm9maWxlIEltYWdlIFVwbG9hZCBMYW1iZGEgKHZvbGxzdMOkbmRpZyBtaXQgUzMgUHJlc2lnbmVkIFVSTHMpXG4gICAgY29uc3QgcHJvZmlsZUltYWdlTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnUHJvZmlsZUltYWdlRnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLXByb2ZpbGUtaW1hZ2UtdXBsb2FkJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvcHJvZmlsZS1pbWFnZS11cGxvYWQnKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBTM19CVUNLRVQ6ICdtYXdwcy1wcm9maWxlLWltYWdlcydcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFBERiBHZW5lcmF0b3IgTGFtYmRhIChHUFQtNS4yICsgUHVwcGV0ZWVyIGbDvHIgcHLDpHppc2UgUERGLUdlbmVyaWVydW5nKVxuICAgIGNvbnN0IHBkZkdlbmVyYXRvckxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1BkZkdlbmVyYXRvckZ1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnd2Vic2l0ZS1wZGYtZ2VuZXJhdG9yJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvcGRmLWdlbmVyYXRvci1ncHQ1MicpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDEyMCksIC8vIEzDpG5nZXJlciBUaW1lb3V0IGbDvHIgR1BULTUuMiArIFBERi1HZW5lcmllcnVuZ1xuICAgICAgbWVtb3J5U2l6ZTogMjA0OCwgLy8gTWVociBNZW1vcnkgZsO8ciBQdXBwZXRlZXIvQ2hyb21lXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBOT0RFX0VOVjogJ3Byb2R1Y3Rpb24nXG4gICAgICAgIC8vIE9QRU5BSV9BUElfS0VZIHdpcmQgbmljaHQgYWxzIFVtZ2VidW5nc3ZhcmlhYmxlIGdlc2V0enQsIHNvbmRlcm4gdm9tIEZyb250ZW5kIMO8YmVyZ2ViZW5cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBIRVJPIFZJREVPIExBTUJEQVMgKFBoYXNlIDEgTWlncmF0aW9uKVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8vIEhlcm8gVmlkZW8gU2V0dGluZ3MgTGFtYmRhXG4gICAgY29uc3QgaGVyb1ZpZGVvU2V0dGluZ3NMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdIZXJvVmlkZW9TZXR0aW5nc0Z1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnd2Vic2l0ZS1oZXJvLXZpZGVvLXNldHRpbmdzJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvaGVyby12aWRlby1zZXR0aW5ncycpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKSxcbiAgICAgIG1lbW9yeVNpemU6IDI1NixcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIFNFVFRJTkdTX1RBQkxFOiAnbWFudWVsLXdlaXNzLXNldHRpbmdzJyxcbiAgICAgICAgSEVST19WSURFT19CVUNLRVQ6ICdtYW51ZWwtd2Vpc3MtaGVyby12aWRlb3MnXG4gICAgICAgIC8vIEFXU19SRUdJT04gd2lyZCBhdXRvbWF0aXNjaCB2b24gTGFtYmRhIGdlc2V0enRcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIEhlcm8gVmlkZW8gVXBsb2FkIExhbWJkYVxuICAgIGNvbnN0IGhlcm9WaWRlb1VwbG9hZExhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0hlcm9WaWRlb1VwbG9hZEZ1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnd2Vic2l0ZS1oZXJvLXZpZGVvLXVwbG9hZCcsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL2hlcm8tdmlkZW8tdXBsb2FkJyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgSEVST19WSURFT19CVUNLRVQ6ICdtYW51ZWwtd2Vpc3MtaGVyby12aWRlb3MnXG4gICAgICAgIC8vIEFXU19SRUdJT04gd2lyZCBhdXRvbWF0aXNjaCB2b24gTGFtYmRhIGdlc2V0enRcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIEhlcm8gVmlkZW8gVXBsb2FkIERpcmVjdCBMYW1iZGFcbiAgICBjb25zdCBoZXJvVmlkZW9VcGxvYWREaXJlY3RMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdIZXJvVmlkZW9VcGxvYWREaXJlY3RGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtaGVyby12aWRlby11cGxvYWQtZGlyZWN0JyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvaGVyby12aWRlby11cGxvYWQtZGlyZWN0JyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMTIwKSwgLy8gTMOkbmdlciBmw7xyIEJhc2U2NCBVcGxvYWQgKDEwME1CIG1heClcbiAgICAgIG1lbW9yeVNpemU6IDEwMjQsIC8vIE1laHIgTWVtb3J5IGbDvHIgQmFzZTY0IERlY29kaW5nICsgUzMgVXBsb2FkXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBIRVJPX1ZJREVPX0JVQ0tFVDogJ21hbnVlbC13ZWlzcy1oZXJvLXZpZGVvcycsXG4gICAgICAgIFNFVFRJTkdTX1RBQkxFOiAnbWFudWVsLXdlaXNzLXNldHRpbmdzJyxcbiAgICAgICAgU0VUVElOR1NfS0VZOiAnaGVyby12aWRlby11cmwnXG4gICAgICAgIC8vIEFXU19SRUdJT04gd2lyZCBhdXRvbWF0aXNjaCB2b24gTGFtYmRhIGdlc2V0enRcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFRleHQtdG8tQlBNTiBMYW1iZGEgKEhSLUF1dG9tYXRpb24tV29ya2Zsb3cpXG4gICAgY29uc3QgdGV4dFRvQnBtbkxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1RleHRUb0JwbW5GdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtdGV4dC10by1icG1uJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvdGV4dC10by1icG1uJyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxuICAgICAgbWVtb3J5U2l6ZTogMjU2XG4gICAgfSk7XG5cbiAgICAvLyBUZXh0LXRvLUJQTU4gbWl0IEdQVC01LjIgKEFkbWluOiBLSS1CUE1OLUdlbmVyaWVydW5nKVxuICAgIGNvbnN0IHRleHRUb0JwbW5HcHQ1MkxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1RleHRUb0JwbW5HcHQ1MkZ1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnd2Vic2l0ZS10ZXh0LXRvLWJwbW4tZ3B0NTInLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS90ZXh0LXRvLWJwbW4tZ3B0NTInKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMDApLCAvLyA1IE1pbiBmw7xyIGxhbmdlIFByb3plc3NlIChBUEkgR2F0ZXdheSBtYXggMjlzIOKGkiBGdW5jdGlvbiBVUkwpXG4gICAgICBtZW1vcnlTaXplOiAxMDI0IC8vIE1laHIgTWVtb3J5ID0gc2NobmVsbGVyZXIgQ1BVIGbDvHIgQW5hbHlzZSAoQVBJIEdhdGV3YXkgbWF4IDI5cylcbiAgICB9KTtcblxuICAgIC8vIEhSLUxlYWRzIEFQSSBMYW1iZGEgKEhSLVNlbGJzdHRlc3QgTGVhZC1FcmZhc3N1bmcpXG4gICAgY29uc3QgaHJMZWFkc0xhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0hyTGVhZHNGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtaHItbGVhZHMnLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS9oci1sZWFkcy1hcGknKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBTM19CVUNLRVQ6ICdtYW51ZWwtd2Vpc3Mtd2Vic2l0ZScsXG4gICAgICAgIEFETUlOX1BBU1NXT1JEOiAnbXctYWRtaW4tMjAyNCdcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFMzIFBlcm1pc3Npb25zIGbDvHIgSFItTGVhZHMgKG1hbnVlbC13ZWlzcy13ZWJzaXRlIGJ1Y2tldClcbiAgICBockxlYWRzTGFtYmRhLmFkZFRvUm9sZVBvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICBhY3Rpb25zOiBbJ3MzOkdldE9iamVjdCcsICdzMzpQdXRPYmplY3QnXSxcbiAgICAgIHJlc291cmNlczogWydhcm46YXdzOnMzOjo6bWFudWVsLXdlaXNzLXdlYnNpdGUvZGF0YS8qJ11cbiAgICB9KSk7XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gQkVXRVJCVU5HU1BST0ZJTCBMQU1CREEgKFBoYXNlIDIgTWlncmF0aW9uKVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8vIEJld2VyYnVuZ3Nwcm9maWwgTGFtYmRhXG4gICAgY29uc3QgYmV3ZXJidW5nc3Byb2ZpbExhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0Jld2VyYnVuZ3Nwcm9maWxGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtYmV3ZXJidW5nc3Byb2ZpbCcsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL2Jld2VyYnVuZ3Nwcm9maWwnKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBVU0VSX0RBVEFfVEFCTEU6ICdtYXdwcy11c2VyLWRhdGEnXG4gICAgICAgIC8vIEFXU19SRUdJT04gd2lyZCBhdXRvbWF0aXNjaCB2b24gTGFtYmRhIGdlc2V0enRcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBVU0VSIFBST0ZJTEUgQVBJIExBTUJEQSAoUGhhc2UgMyBNaWdyYXRpb24pXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgLy8gVXNlciBQcm9maWxlIEFQSSBMYW1iZGFcbiAgICBjb25zdCB1c2VyUHJvZmlsZUFwaUxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1VzZXJQcm9maWxlQXBpRnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLXVzZXItcHJvZmlsZS1hcGknLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS91c2VyLXByb2ZpbGUtYXBpJyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgUFJPRklMRVNfVEFCTEU6ICdtYXdwcy11c2VyLXByb2ZpbGVzJyxcbiAgICAgICAgQVBQTElDQVRJT05TX1RBQkxFOiAnbWF3cHMtYXBwbGljYXRpb25zJyxcbiAgICAgICAgUkVTVU1FU19UQUJMRTogJ21hd3BzLXJlc3VtZXMnLFxuICAgICAgICBDT1ZFUl9MRVRURVJTX1RBQkxFOiAnbWF3cHMtY292ZXItbGV0dGVycydcbiAgICAgICAgLy8gQVdTX1JFR0lPTiB3aXJkIGF1dG9tYXRpc2NoIHZvbiBMYW1iZGEgZ2VzZXR6dFxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIEFQSSBST1VURVNcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAvLyAvdXNlci1kYXRhXG4gICAgY29uc3QgdXNlckRhdGFSZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ3VzZXItZGF0YScpO1xuICAgIHVzZXJEYXRhUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIHVzZXJEYXRhUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICB1c2VyRGF0YVJlc291cmNlLmFkZE1ldGhvZCgnUFVUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICB1c2VyRGF0YVJlc291cmNlLmFkZE1ldGhvZCgnREVMRVRFJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBcbiAgICAvLyAvdXNlci1kYXRhL3Byb2ZpbGVcbiAgICBjb25zdCBwcm9maWxlUmVzb3VyY2UgPSB1c2VyRGF0YVJlc291cmNlLmFkZFJlc291cmNlKCdwcm9maWxlJyk7XG4gICAgcHJvZmlsZVJlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBwcm9maWxlUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBwcm9maWxlUmVzb3VyY2UuYWRkTWV0aG9kKCdQVVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIFxuICAgIC8vIC91c2VyLWRhdGEvcmVzdW1lc1xuICAgIGNvbnN0IHJlc3VtZXNSZXNvdXJjZSA9IHVzZXJEYXRhUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3Jlc3VtZXMnKTtcbiAgICByZXN1bWVzUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIHJlc3VtZXNSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIHJlc3VtZXNSZXNvdXJjZS5hZGRNZXRob2QoJ0RFTEVURScsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJEYXRhTGFtYmRhKSk7XG4gICAgXG4gICAgLy8gL3VzZXItZGF0YS9kb2N1bWVudHNcbiAgICBjb25zdCBkb2N1bWVudHNSZXNvdXJjZSA9IHVzZXJEYXRhUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ2RvY3VtZW50cycpO1xuICAgIGRvY3VtZW50c1Jlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBkb2N1bWVudHNSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIGRvY3VtZW50c1Jlc291cmNlLmFkZE1ldGhvZCgnREVMRVRFJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBcbiAgICAvLyAvdXNlci1kYXRhL2NvdmVyLWxldHRlcnNcbiAgICBjb25zdCBjb3ZlckxldHRlcnNSZXNvdXJjZSA9IHVzZXJEYXRhUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ2NvdmVyLWxldHRlcnMnKTtcbiAgICBjb3ZlckxldHRlcnNSZXNvdXJjZS5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJEYXRhTGFtYmRhKSk7XG4gICAgY292ZXJMZXR0ZXJzUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBjb3ZlckxldHRlcnNSZXNvdXJjZS5hZGRNZXRob2QoJ0RFTEVURScsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJEYXRhTGFtYmRhKSk7XG4gICAgXG4gICAgLy8gL3VzZXItZGF0YS9hcHBsaWNhdGlvbnNcbiAgICBjb25zdCBhcHBsaWNhdGlvbnNSZXNvdXJjZSA9IHVzZXJEYXRhUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ2FwcGxpY2F0aW9ucycpO1xuICAgIGFwcGxpY2F0aW9uc1Jlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBhcHBsaWNhdGlvbnNSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIGFwcGxpY2F0aW9uc1Jlc291cmNlLmFkZE1ldGhvZCgnREVMRVRFJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBcbiAgICAvLyAvdXNlci1kYXRhL3Bob3Rvc1xuICAgIGNvbnN0IHBob3Rvc1Jlc291cmNlID0gdXNlckRhdGFSZXNvdXJjZS5hZGRSZXNvdXJjZSgncGhvdG9zJyk7XG4gICAgcGhvdG9zUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIHBob3Rvc1Jlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJEYXRhTGFtYmRhKSk7XG4gICAgcGhvdG9zUmVzb3VyY2UuYWRkTWV0aG9kKCdERUxFVEUnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIFxuICAgIC8vIC91c2VyLWRhdGEvd29ya2Zsb3dzL3twcm94eSt9XG4gICAgY29uc3Qgd29ya2Zsb3dzUmVzb3VyY2UgPSB1c2VyRGF0YVJlc291cmNlLmFkZFJlc291cmNlKCd3b3JrZmxvd3MnKTtcbiAgICBjb25zdCB3b3JrZmxvd1Byb3h5ID0gd29ya2Zsb3dzUmVzb3VyY2UuYWRkUHJveHkoe1xuICAgICAgYW55TWV0aG9kOiB0cnVlLFxuICAgICAgZGVmYXVsdEludGVncmF0aW9uOiBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSlcbiAgICB9KTtcblxuICAgIC8vIC9zbm93Zmxha2UtaGlnaHNjb3Jlc1xuICAgIGNvbnN0IGhpZ2hzY29yZXNSZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ3Nub3dmbGFrZS1oaWdoc2NvcmVzJyk7XG4gICAgaGlnaHNjb3Jlc1Jlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaGlnaHNjb3Jlc0xhbWJkYSkpO1xuICAgIGhpZ2hzY29yZXNSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihoaWdoc2NvcmVzTGFtYmRhKSk7XG4gICAgaGlnaHNjb3Jlc1Jlc291cmNlLmFkZE1ldGhvZCgnREVMRVRFJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaGlnaHNjb3Jlc0xhbWJkYSkpO1xuXG4gICAgLy8gL2hlcm8tdmlkZW9cbiAgICBjb25zdCBoZXJvVmlkZW9SZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2hlcm8tdmlkZW8nKTtcbiAgICBcbiAgICAvLyAvaGVyby12aWRlby9zZXR0aW5nc1xuICAgIGNvbnN0IGhlcm9TZXR0aW5nc1Jlc291cmNlID0gaGVyb1ZpZGVvUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3NldHRpbmdzJyk7XG4gICAgaGVyb1NldHRpbmdzUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihoZXJvVmlkZW9MYW1iZGEpKTtcbiAgICBoZXJvU2V0dGluZ3NSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihoZXJvVmlkZW9MYW1iZGEpKTtcbiAgICBoZXJvU2V0dGluZ3NSZXNvdXJjZS5hZGRNZXRob2QoJ1BVVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGhlcm9WaWRlb0xhbWJkYSkpO1xuICAgIFxuICAgIC8vIC9oZXJvLXZpZGVvL3VwbG9hZFxuICAgIGNvbnN0IGhlcm9VcGxvYWRSZXNvdXJjZSA9IGhlcm9WaWRlb1Jlc291cmNlLmFkZFJlc291cmNlKCd1cGxvYWQnKTtcbiAgICBoZXJvVXBsb2FkUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaGVyb1ZpZGVvTGFtYmRhKSk7XG4gICAgaGVyb1VwbG9hZFJlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaGVyb1ZpZGVvTGFtYmRhKSk7XG5cbiAgICAvLyAvb3BlbmFpLXByb3h5XG4gICAgY29uc3Qgb3BlbmFpUmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCdvcGVuYWktcHJveHknKTtcbiAgICBvcGVuYWlSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihvcGVuYWlQcm94eUxhbWJkYSkpO1xuXG4gICAgLy8gL2pvYi1wYXJzZXJcbiAgICBjb25zdCBqb2JQYXJzZXJSZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2pvYi1wYXJzZXInKTtcbiAgICBqb2JQYXJzZXJSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihqb2JQYXJzZXJMYW1iZGEpKTtcblxuICAgIC8vIC9jdi1nZW5lcmFsXG4gICAgY29uc3QgY3ZHZW5lcmFsUmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCdjdi1nZW5lcmFsJyk7XG4gICAgY3ZHZW5lcmFsUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oY3ZHZW5lcmFsTGFtYmRhKSk7XG5cbiAgICAvLyAvY3YtdGFyZ2V0XG4gICAgY29uc3QgY3ZUYXJnZXRSZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2N2LXRhcmdldCcpO1xuICAgIGN2VGFyZ2V0UmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oY3ZUYXJnZXRMYW1iZGEpKTtcblxuICAgIC8vIC9jdi1qb2ItcGFyc2VcbiAgICBjb25zdCBjdkpvYlBhcnNlUmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCdjdi1qb2ItcGFyc2UnKTtcbiAgICBjdkpvYlBhcnNlUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oY3ZKb2JQYXJzZUxhbWJkYSkpO1xuXG4gICAgLy8gL2N2LWZpbGVzLXBhcnNlXG4gICAgY29uc3QgY3ZGaWxlc1BhcnNlUmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCdjdi1maWxlcy1wYXJzZScpO1xuICAgIGN2RmlsZXNQYXJzZVJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGN2RmlsZXNQYXJzZUxhbWJkYSkpO1xuXG4gICAgLy8gL2N2LWV4cG9ydFxuICAgIGNvbnN0IGN2RXhwb3J0UmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCdjdi1leHBvcnQnKTtcbiAgICBjdkV4cG9ydFJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGN2RXhwb3J0TGFtYmRhKSk7XG5cbiAgICAvLyAvYXBpLXNldHRpbmdzIChiZXN0ZWhlbmRlIExhbWJkYSlcbiAgICBjb25zdCBhcGlTZXR0aW5nc1Jlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgnYXBpLXNldHRpbmdzJyk7XG4gICAgXG4gICAgLy8gTGFtYmRhIEludGVncmF0aW9uIG1pdCBDT1JTIEhlYWRlcnNcbiAgICBjb25zdCBhcGlTZXR0aW5nc0ludGVncmF0aW9uID0gbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oYXBpU2V0dGluZ3NMYW1iZGEsIHtcbiAgICAgIHByb3h5OiB0cnVlLFxuICAgICAgaW50ZWdyYXRpb25SZXNwb25zZXM6IFt7XG4gICAgICAgIHN0YXR1c0NvZGU6ICcyMDAnLFxuICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiBcIicqJ1wiLFxuICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiBcIidDb250ZW50LVR5cGUsQXV0aG9yaXphdGlvbixYLUFtei1EYXRlLFgtQXBpLUtleSxYLUFtei1TZWN1cml0eS1Ub2tlbidcIixcbiAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogXCInR0VULFBPU1QsUFVULERFTEVURSxPUFRJT05TJ1wiXG4gICAgICAgIH1cbiAgICAgIH1dXG4gICAgfSk7XG4gICAgXG4gICAgLy8gTWV0aG9kZW4gZXhwbGl6aXQgZXJzdGVsbGVuIG1pdCBDT1JTIEhlYWRlcnMgKE9QVElPTlMgd2lyZCB2b24gTGFtYmRhIGJlaGFuZGVsdClcbiAgICBbJ0dFVCcsICdQT1NUJywgJ1BVVCcsICdERUxFVEUnXS5mb3JFYWNoKG1ldGhvZCA9PiB7XG4gICAgICBhcGlTZXR0aW5nc1Jlc291cmNlLmFkZE1ldGhvZChtZXRob2QsIGFwaVNldHRpbmdzSW50ZWdyYXRpb24sIHtcbiAgICAgICAgbWV0aG9kUmVzcG9uc2VzOiBbe1xuICAgICAgICAgIHN0YXR1c0NvZGU6ICcyMDAnLFxuICAgICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xuICAgICAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogdHJ1ZSxcbiAgICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiB0cnVlLFxuICAgICAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIH1dXG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBcbiAgICAvLyBOT1RFOiAvYXBpLXNldHRpbmdzP2FjdGlvbj1rZXkmcHJvdmlkZXI9Li4uIHdpcmQgcHJvZHVrdGl2IGdlbnV0enQuXG4gICAgLy8gRWluIHp1c8OkdHpsaWNoZXMgU3ViLVJlc291cmNlIGAvYXBpLXNldHRpbmdzL2tleWAgZXhpc3RpZXJ0IGluIG1hbmNoZW4gVW1nZWJ1bmdlbiBiZXJlaXRzIChPdXQtb2YtYmFuZCksXG4gICAgLy8gd2FzIHp1IENsb3VkRm9ybWF0aW9uLUNvbmZsaWN0cyBmw7xocmVuIGthbm4uIERhaGVyIGhpZXIgYmV3dXNzdCBOSUNIVCBtZWhyIGFubGVnZW4uXG5cbiAgICAvLyAvY29udGFjdC1lbWFpbCAoYmVzdGVoZW5kZSBMYW1iZGEpXG4gICAgY29uc3QgY29udGFjdFJlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgnY29udGFjdC1lbWFpbCcpO1xuICAgIGNvbnRhY3RSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihjb250YWN0RW1haWxMYW1iZGEpKTtcblxuICAgIC8vIC9wcm9maWxlLWltYWdlIChiZXN0ZWhlbmRlIExhbWJkYSlcbiAgICBjb25zdCBwcm9maWxlSW1hZ2VSZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ3Byb2ZpbGUtaW1hZ2UnKTtcbiAgICBjb25zdCB1cGxvYWRVcmxSZXNvdXJjZSA9IHByb2ZpbGVJbWFnZVJlc291cmNlLmFkZFJlc291cmNlKCd1cGxvYWQtdXJsJyk7XG4gICAgdXBsb2FkVXJsUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24ocHJvZmlsZUltYWdlTGFtYmRhKSk7XG5cbiAgICAvLyAvcGRmLWdlbmVyYXRvciAoUHVwcGV0ZWVyIFBERi1HZW5lcmllcnVuZylcbiAgICBjb25zdCBwZGZHZW5lcmF0b3JSZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ3BkZi1nZW5lcmF0b3InKTtcbiAgICAvLyBCZWkgQVdTX1BST1hZIHdlcmRlbiBIZWFkZXIgYXV0b21hdGlzY2ggdm9uIExhbWJkYSBwcm9wYWdpZXJ0XG4gICAgLy8gV2lyIG3DvHNzZW4gc2llIG51ciBpbiBkZXIgTWV0aG9kLVJlc3BvbnNlIGRla2xhcmllcmVuXG4gICAgcGRmR2VuZXJhdG9yUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24ocGRmR2VuZXJhdG9yTGFtYmRhKSwge1xuICAgICAgbWV0aG9kUmVzcG9uc2VzOiBbe1xuICAgICAgICBzdGF0dXNDb2RlOiAnMjAwJyxcbiAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogdHJ1ZSxcbiAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogdHJ1ZSxcbiAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogdHJ1ZSxcbiAgICAgICAgfVxuICAgICAgfV1cbiAgICB9KTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBIRVJPIFZJREVPIFJPVVRFUyAoUGhhc2UgMSBNaWdyYXRpb24pXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgLy8gL2hlcm8tdmlkZW8tc2V0dGluZ3NcbiAgICBjb25zdCBoZXJvVmlkZW9TZXR0aW5nc1Jlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgnaGVyby12aWRlby1zZXR0aW5ncycpO1xuICAgIGhlcm9WaWRlb1NldHRpbmdzUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihoZXJvVmlkZW9TZXR0aW5nc0xhbWJkYSkpO1xuICAgIGhlcm9WaWRlb1NldHRpbmdzUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaGVyb1ZpZGVvU2V0dGluZ3NMYW1iZGEpKTtcbiAgICBoZXJvVmlkZW9TZXR0aW5nc1Jlc291cmNlLmFkZE1ldGhvZCgnUFVUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaGVyb1ZpZGVvU2V0dGluZ3NMYW1iZGEpKTtcblxuICAgIC8vIC9oZXJvLXZpZGVvLXVwbG9hZFxuICAgIGNvbnN0IGhlcm9WaWRlb1VwbG9hZFJlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgnaGVyby12aWRlby11cGxvYWQnKTtcbiAgICBoZXJvVmlkZW9VcGxvYWRSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihoZXJvVmlkZW9VcGxvYWRMYW1iZGEpKTtcbiAgICBoZXJvVmlkZW9VcGxvYWRSZXNvdXJjZS5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGhlcm9WaWRlb1VwbG9hZExhbWJkYSkpO1xuXG4gICAgLy8gL2hlcm8tdmlkZW8tdXBsb2FkLWRpcmVjdFxuICAgIGNvbnN0IGhlcm9WaWRlb1VwbG9hZERpcmVjdFJlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgnaGVyby12aWRlby11cGxvYWQtZGlyZWN0Jyk7XG4gICAgaGVyb1ZpZGVvVXBsb2FkRGlyZWN0UmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaGVyb1ZpZGVvVXBsb2FkRGlyZWN0TGFtYmRhKSk7XG5cbiAgICAvLyAvdGV4dC10by1icG1uIChIUi1BdXRvbWF0aW9uLVdvcmtmbG93KVxuICAgIGNvbnN0IHRleHRUb0JwbW5SZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ3RleHQtdG8tYnBtbicpO1xuICAgIHRleHRUb0JwbW5SZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih0ZXh0VG9CcG1uTGFtYmRhKSk7XG5cbiAgICAvLyAvdGV4dC10by1icG1uLWdwdCAoQWRtaW46IEJQTU4tR2VuZXJpZXJ1bmcgbWl0IEdQVC01LjIpXG4gICAgY29uc3QgdGV4dFRvQnBtbkdwdFJlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgndGV4dC10by1icG1uLWdwdCcpO1xuICAgIHRleHRUb0JwbW5HcHRSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih0ZXh0VG9CcG1uR3B0NTJMYW1iZGEpKTtcblxuICAgIC8vIExhbWJkYSBGdW5jdGlvbiBVUkwgZsO8ciB0ZXh0LXRvLWJwbW4tZ3B0NTIgKGzDpG5nZXJlciBUaW1lb3V0IGFscyBBUEkgR2F0ZXdheSAyOXMpXG4gICAgLy8gTnV0enQgTGFtYmRhIGRpcmVrdCDihpIgMTIwcyBUaW1lb3V0IHN0YXR0IDI5cyBiZWkgQVBJIEdhdGV3YXlcbiAgICBjb25zdCB0ZXh0VG9CcG1uR3B0NTJMYW1iZGFVcmwgPSB0ZXh0VG9CcG1uR3B0NTJMYW1iZGEuYWRkRnVuY3Rpb25Vcmwoe1xuICAgICAgYXV0aFR5cGU6IGxhbWJkYS5GdW5jdGlvblVybEF1dGhUeXBlLk5PTkUsXG4gICAgICBjb3JzOiB7XG4gICAgICAgIGFsbG93ZWRPcmlnaW5zOiBbJyonXSxcbiAgICAgICAgYWxsb3dlZE1ldGhvZHM6IFtsYW1iZGEuSHR0cE1ldGhvZC5QT1NUXSxcbiAgICAgICAgYWxsb3dlZEhlYWRlcnM6IFsnQ29udGVudC1UeXBlJywgJ0F1dGhvcml6YXRpb24nXSxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1RleHRUb0JwbW5HcHQ1MkZ1bmN0aW9uVXJsJywge1xuICAgICAgdmFsdWU6IHRleHRUb0JwbW5HcHQ1MkxhbWJkYVVybC51cmwsXG4gICAgICBkZXNjcmlwdGlvbjogJ0xhbWJkYSBGdW5jdGlvbiBVUkwgZsO8ciBCUE1OIChBbmFseXNlL1RvLUJlKSAtIGzDpG5nZXJlciBUaW1lb3V0JyxcbiAgICAgIGV4cG9ydE5hbWU6ICdUZXh0VG9CcG1uR3B0NTJGdW5jdGlvblVybCcsXG4gICAgfSk7XG5cbiAgICAvLyAvaHItbGVhZHMgKEhSLVNlbGJzdHRlc3QgTGVhZC1FcmZhc3N1bmcpXG4gICAgY29uc3QgaHJMZWFkc1Jlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgnaHItbGVhZHMnKTtcbiAgICBjb25zdCBockxlYWRzU2F2ZVJlc291cmNlID0gaHJMZWFkc1Jlc291cmNlLmFkZFJlc291cmNlKCdzYXZlJyk7XG4gICAgaHJMZWFkc1NhdmVSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihockxlYWRzTGFtYmRhKSk7XG4gICAgY29uc3QgaHJMZWFkc0xpc3RSZXNvdXJjZSA9IGhyTGVhZHNSZXNvdXJjZS5hZGRSZXNvdXJjZSgnbGlzdCcpO1xuICAgIGhyTGVhZHNMaXN0UmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihockxlYWRzTGFtYmRhKSk7XG4gICAgY29uc3QgaHJMZWFkc0RlbGV0ZVJlc291cmNlID0gaHJMZWFkc1Jlc291cmNlLmFkZFJlc291cmNlKCdkZWxldGUnKTtcbiAgICBockxlYWRzRGVsZXRlUmVzb3VyY2UuYWRkTWV0aG9kKCdERUxFVEUnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihockxlYWRzTGFtYmRhKSk7XG4gICAgY29uc3QgaHJMZWFkc0NsZWFyUmVzb3VyY2UgPSBockxlYWRzUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ2NsZWFyJyk7XG4gICAgaHJMZWFkc0NsZWFyUmVzb3VyY2UuYWRkTWV0aG9kKCdERUxFVEUnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihockxlYWRzTGFtYmRhKSk7XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gQkVXRVJCVU5HU1BST0ZJTCBST1VURVMgKFBoYXNlIDIgTWlncmF0aW9uKVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8vIC9iZXdlcmJ1bmdzcHJvZmlsXG4gICAgY29uc3QgYmV3ZXJidW5nc3Byb2ZpbFJlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgnYmV3ZXJidW5nc3Byb2ZpbCcpO1xuICAgIGJld2VyYnVuZ3Nwcm9maWxSZXNvdXJjZS5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGJld2VyYnVuZ3Nwcm9maWxMYW1iZGEpKTtcbiAgICBiZXdlcmJ1bmdzcHJvZmlsUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oYmV3ZXJidW5nc3Byb2ZpbExhbWJkYSkpO1xuICAgIGJld2VyYnVuZ3Nwcm9maWxSZXNvdXJjZS5hZGRNZXRob2QoJ1BVVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGJld2VyYnVuZ3Nwcm9maWxMYW1iZGEpKTtcbiAgICBiZXdlcmJ1bmdzcHJvZmlsUmVzb3VyY2UuYWRkTWV0aG9kKCdERUxFVEUnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihiZXdlcmJ1bmdzcHJvZmlsTGFtYmRhKSk7XG5cbiAgICAvLyAvYmV3ZXJidW5nc3Byb2ZpbC9zZWN0aW9uL3tuYW1lfVxuICAgIGNvbnN0IGJld2VyYnVuZ3Nwcm9maWxTZWN0aW9uUmVzb3VyY2UgPSBiZXdlcmJ1bmdzcHJvZmlsUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3NlY3Rpb24nKTtcbiAgICBjb25zdCBiZXdlcmJ1bmdzcHJvZmlsU2VjdGlvbk5hbWVSZXNvdXJjZSA9IGJld2VyYnVuZ3Nwcm9maWxTZWN0aW9uUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3tuYW1lfScpO1xuICAgIGJld2VyYnVuZ3Nwcm9maWxTZWN0aW9uTmFtZVJlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oYmV3ZXJidW5nc3Byb2ZpbExhbWJkYSkpO1xuICAgIGJld2VyYnVuZ3Nwcm9maWxTZWN0aW9uTmFtZVJlc291cmNlLmFkZE1ldGhvZCgnUFVUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oYmV3ZXJidW5nc3Byb2ZpbExhbWJkYSkpO1xuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIFVTRVIgUFJPRklMRSBBUEkgUk9VVEVTIChQaGFzZSAzIE1pZ3JhdGlvbilcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAvLyAvdXNlci1wcm9maWxlLWFwaSAoUHJveHkgZsO8ciBhbGxlIFN1Yi1Sb3V0ZXMpXG4gICAgY29uc3QgdXNlclByb2ZpbGVBcGlSZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ3VzZXItcHJvZmlsZS1hcGknKTtcbiAgICB1c2VyUHJvZmlsZUFwaVJlc291cmNlLmFkZFByb3h5KHtcbiAgICAgIGFueU1ldGhvZDogdHJ1ZSxcbiAgICAgIGRlZmF1bHRJbnRlZ3JhdGlvbjogbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlclByb2ZpbGVBcGlMYW1iZGEpXG4gICAgfSk7XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gT05CT0FSRElORyBQUk9HUkVTUyAoVmFsa2VlbiBPbmJvYXJkaW5nIEh1YilcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAvLyBEeW5hbW9EQiBUYWJlbGxlIGbDvHIgT25ib2FyZGluZy1Gb3J0c2Nocml0dFxuICAgIGNvbnN0IG9uYm9hcmRpbmdQcm9ncmVzc1RhYmxlID0gbmV3IGR5bmFtb2RiLlRhYmxlKHRoaXMsICdPbmJvYXJkaW5nUHJvZ3Jlc3NUYWJsZScsIHtcbiAgICAgIHRhYmxlTmFtZTogJ21hd3BzLW9uYm9hcmRpbmctcHJvZ3Jlc3MnLFxuICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICd1c2VySWQnLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxuICAgICAgYmlsbGluZ01vZGU6IGR5bmFtb2RiLkJpbGxpbmdNb2RlLlBBWV9QRVJfUkVRVUVTVCxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LlJFVEFJTixcbiAgICB9KTtcblxuICAgIC8vIExhbWJkYSBmw7xyIE9uYm9hcmRpbmctRm9ydHNjaHJpdHRcbiAgICBjb25zdCBvbmJvYXJkaW5nUHJvZ3Jlc3NMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdPbmJvYXJkaW5nUHJvZ3Jlc3NGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtb25ib2FyZGluZy1wcm9ncmVzcycsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL29uYm9hcmRpbmctcHJvZ3Jlc3MnKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygxMCksXG4gICAgICBtZW1vcnlTaXplOiAxMjgsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBPTkJPQVJESU5HX1RBQkxFOiBvbmJvYXJkaW5nUHJvZ3Jlc3NUYWJsZS50YWJsZU5hbWVcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIER5bmFtb0RCIFBlcm1pc3Npb25zIGbDvHIgT25ib2FyZGluZyBMYW1iZGFcbiAgICBvbmJvYXJkaW5nUHJvZ3Jlc3NUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEob25ib2FyZGluZ1Byb2dyZXNzTGFtYmRhKTtcblxuICAgIC8vIC9vbmJvYXJkaW5nLXByb2dyZXNzIFJvdXRlXG4gICAgY29uc3Qgb25ib2FyZGluZ1Byb2dyZXNzUmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCdvbmJvYXJkaW5nLXByb2dyZXNzJyk7XG4gICAgb25ib2FyZGluZ1Byb2dyZXNzUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihvbmJvYXJkaW5nUHJvZ3Jlc3NMYW1iZGEpKTtcbiAgICBvbmJvYXJkaW5nUHJvZ3Jlc3NSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihvbmJvYXJkaW5nUHJvZ3Jlc3NMYW1iZGEpKTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBGTEFTSENBUkRTIChLSS1MZXJua2FydGVuIG1pdCBMZWl0bmVyLVN5c3RlbSlcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAvLyBEeW5hbW9EQiBUYWJlbGxlIGbDvHIgRmxhc2hjYXJkLURlY2tzXG4gICAgY29uc3QgZmxhc2hjYXJkRGVja3NUYWJsZSA9IG5ldyBkeW5hbW9kYi5UYWJsZSh0aGlzLCAnRmxhc2hjYXJkRGVja3NUYWJsZScsIHtcbiAgICAgIHRhYmxlTmFtZTogJ21hd3BzLWZsYXNoY2FyZC1kZWNrcycsXG4gICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogJ3VzZXJJZCcsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXG4gICAgICBzb3J0S2V5OiB7IG5hbWU6ICdkZWNrSWQnLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxuICAgICAgYmlsbGluZ01vZGU6IGR5bmFtb2RiLkJpbGxpbmdNb2RlLlBBWV9QRVJfUkVRVUVTVCxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LlJFVEFJTixcbiAgICB9KTtcblxuICAgIC8vIER5bmFtb0RCIFRhYmVsbGUgZsO8ciBGbGFzaGNhcmRzXG4gICAgY29uc3QgZmxhc2hjYXJkc1RhYmxlID0gbmV3IGR5bmFtb2RiLlRhYmxlKHRoaXMsICdGbGFzaGNhcmRzVGFibGUnLCB7XG4gICAgICB0YWJsZU5hbWU6ICdtYXdwcy1mbGFzaGNhcmRzJyxcbiAgICAgIHBhcnRpdGlvbktleTogeyBuYW1lOiAndXNlcklkJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbiAgICAgIHNvcnRLZXk6IHsgbmFtZTogJ2NhcmRJZCcsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXG4gICAgICBiaWxsaW5nTW9kZTogZHluYW1vZGIuQmlsbGluZ01vZGUuUEFZX1BFUl9SRVFVRVNULFxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuUkVUQUlOLFxuICAgIH0pO1xuXG4gICAgLy8gTGFtYmRhIGbDvHIgRmxhc2hjYXJkcyBBUElcbiAgICBjb25zdCBmbGFzaGNhcmRzTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnRmxhc2hjYXJkc0Z1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnd2Vic2l0ZS1mbGFzaGNhcmRzLWFwaScsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL2ZsYXNoY2FyZHMtYXBpJyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMTIwKSxcbiAgICAgIG1lbW9yeVNpemU6IDUxMixcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIERFQ0tTX1RBQkxFOiBmbGFzaGNhcmREZWNrc1RhYmxlLnRhYmxlTmFtZSxcbiAgICAgICAgQ0FSRFNfVEFCTEU6IGZsYXNoY2FyZHNUYWJsZS50YWJsZU5hbWUsXG4gICAgICAgIEFQSV9TRVRUSU5HU19UQUJMRTogJ21hd3BzLWFwaS1zZXR0aW5ncydcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIER5bmFtb0RCIFBlcm1pc3Npb25zIGbDvHIgRmxhc2hjYXJkcyBMYW1iZGFcbiAgICBmbGFzaGNhcmREZWNrc1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShmbGFzaGNhcmRzTGFtYmRhKTtcbiAgICBmbGFzaGNhcmRzVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKGZsYXNoY2FyZHNMYW1iZGEpO1xuXG4gICAgLy8gL2ZsYXNoY2FyZHMgUm91dGVzXG4gICAgY29uc3QgZmxhc2hjYXJkc1Jlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgnZmxhc2hjYXJkcycpO1xuICAgIFxuICAgIC8vIC9mbGFzaGNhcmRzL2RlY2tzXG4gICAgY29uc3QgZmxhc2hjYXJkc0RlY2tzUmVzb3VyY2UgPSBmbGFzaGNhcmRzUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ2RlY2tzJyk7XG4gICAgZmxhc2hjYXJkc0RlY2tzUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihmbGFzaGNhcmRzTGFtYmRhKSk7XG4gICAgZmxhc2hjYXJkc0RlY2tzUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oZmxhc2hjYXJkc0xhbWJkYSkpO1xuICAgIGZsYXNoY2FyZHNEZWNrc1Jlc291cmNlLmFkZE1ldGhvZCgnREVMRVRFJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oZmxhc2hjYXJkc0xhbWJkYSkpO1xuXG4gICAgLy8gL2ZsYXNoY2FyZHMvY2FyZHNcbiAgICBjb25zdCBmbGFzaGNhcmRzQ2FyZHNSZXNvdXJjZSA9IGZsYXNoY2FyZHNSZXNvdXJjZS5hZGRSZXNvdXJjZSgnY2FyZHMnKTtcbiAgICBmbGFzaGNhcmRzQ2FyZHNSZXNvdXJjZS5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGZsYXNoY2FyZHNMYW1iZGEpKTtcblxuICAgIC8vIC9mbGFzaGNhcmRzL3N0dWR5XG4gICAgY29uc3QgZmxhc2hjYXJkc1N0dWR5UmVzb3VyY2UgPSBmbGFzaGNhcmRzUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3N0dWR5Jyk7XG4gICAgZmxhc2hjYXJkc1N0dWR5UmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihmbGFzaGNhcmRzTGFtYmRhKSk7XG5cbiAgICAvLyAvZmxhc2hjYXJkcy9yZXZpZXdcbiAgICBjb25zdCBmbGFzaGNhcmRzUmV2aWV3UmVzb3VyY2UgPSBmbGFzaGNhcmRzUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3JldmlldycpO1xuICAgIGZsYXNoY2FyZHNSZXZpZXdSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihmbGFzaGNhcmRzTGFtYmRhKSk7XG5cbiAgICAvLyAvZmxhc2hjYXJkcy9zdGF0c1xuICAgIGNvbnN0IGZsYXNoY2FyZHNTdGF0c1Jlc291cmNlID0gZmxhc2hjYXJkc1Jlc291cmNlLmFkZFJlc291cmNlKCdzdGF0cycpO1xuICAgIGZsYXNoY2FyZHNTdGF0c1Jlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oZmxhc2hjYXJkc0xhbWJkYSkpO1xuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIE9VVFBVVFNcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgdGhpcy5hcGlVcmwgPSBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnV2Vic2l0ZUFwaVVybCcsIHtcbiAgICAgIHZhbHVlOiB0aGlzLmFwaS51cmwsXG4gICAgICBkZXNjcmlwdGlvbjogJ1dlYnNpdGUgQVBJIEdhdGV3YXkgVVJMJyxcbiAgICAgIGV4cG9ydE5hbWU6ICdXZWJzaXRlQXBpVXJsJ1xuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1dlYnNpdGVBcGlJZCcsIHtcbiAgICAgIHZhbHVlOiB0aGlzLmFwaS5yZXN0QXBpSWQsXG4gICAgICBkZXNjcmlwdGlvbjogJ1dlYnNpdGUgQVBJIEdhdGV3YXkgSUQnXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==