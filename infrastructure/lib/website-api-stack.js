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
                    'X-Customer-Id',
                    'X-Amz-Date',
                    'X-Api-Key',
                    'X-Amz-Security-Token',
                    'X-Demo-Password'
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
        // Snowflake Highscores Lambda (optional: HIGHSCORE_ADMIN_SECRET in AWS Console, mind. 8 Zeichen)
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
        // ────────────────────────────────────────────────────────────
        // SONG GENERATOR (Persoenlichkeits-Song-Generator)
        // 5 Actions in einer Lambda: test_questions / interpret_input /
        // synthesize / compose / reroll
        // ────────────────────────────────────────────────────────────
        const songGeneratorLambda = new lambda.Function(this, 'SongGeneratorFunction', {
            functionName: 'website-song-generator',
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('../lambda/song-generator'),
            role: lambdaRole,
            // Composer-Calls können bei gpt-5.2 + 4500 max_tokens 20-25s dauern
            timeout: cdk.Duration.seconds(60),
            memorySize: 512
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
        // /song-generator (Persoenlichkeits-Song-Generator)
        const songGeneratorResource = this.api.root.addResource('song-generator');
        songGeneratorResource.addMethod('POST', new apigateway.LambdaIntegration(songGeneratorLambda));
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
        // TRAINING ADMIN (Tempus Training Inhalte bearbeiten)
        // ========================================
        const trainingAdminLambda = new lambda.Function(this, 'TrainingAdminFunction', {
            functionName: 'website-training-admin-api',
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('../lambda/training-admin-api'),
            role: lambdaRole,
            timeout: cdk.Duration.seconds(30),
            memorySize: 256,
            environment: {
                TRAINING_BUCKET: 'manuel-weiss-website',
                TRAINING_JWT_SECRET: process.env.TRAINING_JWT_SECRET || 'change-me-locally-set-in-cdk-deploy',
                TRAINING_ADMIN_PASSWORD: process.env.TRAINING_ADMIN_PASSWORD || ''
            }
        });
        trainingAdminLambda.addToRolePolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject', 's3:ListBucket'],
            resources: [
                'arn:aws:s3:::manuel-weiss-website',
                'arn:aws:s3:::manuel-weiss-website/training-admin/*'
            ]
        }));
        const trainingAdminResource = this.api.root.addResource('training-admin');
        const trainingAdminIntegration = new apigateway.LambdaIntegration(trainingAdminLambda);
        // Legacy-Routen explizit (für Backwards-Compat)
        const trainingAdminConfigResource = trainingAdminResource.addResource('config');
        trainingAdminConfigResource.addMethod('GET', trainingAdminIntegration);
        trainingAdminConfigResource.addMethod('PUT', trainingAdminIntegration);
        const trainingAdminUploadResource = trainingAdminResource.addResource('upload-url');
        trainingAdminUploadResource.addMethod('POST', trainingAdminIntegration);
        const trainingAdminScreenshotsResource = trainingAdminResource.addResource('screenshots');
        trainingAdminScreenshotsResource.addMethod('GET', trainingAdminIntegration);
        // Neue Multi-Tenant-Routen via Greedy Proxy unter /training-admin/customers/{proxy+}
        // (matcht customers/index, customers/<cid>/branding, .../tours/..., .../slides/..., .../progress/...)
        const trainingAdminCustomersResource = trainingAdminResource.addResource('customers');
        trainingAdminCustomersResource.addMethod('GET', trainingAdminIntegration);
        const trainingAdminCustomersProxy = trainingAdminCustomersResource.addResource('{proxy+}');
        trainingAdminCustomersProxy.addMethod('ANY', trainingAdminIntegration);
        // Auth-Routen (Magic-Link + Direkt-Token)
        const authResource = this.api.root.addResource('auth');
        const authMagicLink = authResource.addResource('magic-link');
        authMagicLink.addMethod('POST', trainingAdminIntegration);
        const authToken = authResource.addResource('token');
        authToken.addMethod('POST', trainingAdminIntegration);
        // ========================================
        // DEMO SCRIPT (PM + RM Bearbeitungsstand in S3)
        // ========================================
        const demoScriptLambda = new lambda.Function(this, 'DemoScriptFunction', {
            functionName: 'website-demo-script-api',
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('../lambda/demo-script-api'),
            role: lambdaRole,
            timeout: cdk.Duration.seconds(15),
            memorySize: 128,
            environment: {
                S3_BUCKET: 'manuel-weiss-website',
                EDIT_PASSWORD: 'tempus-demo-edit-2024'
            }
        });
        demoScriptLambda.addToRolePolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['s3:GetObject', 's3:PutObject'],
            resources: [
                'arn:aws:s3:::manuel-weiss-website/data/tempus-demo-pm-state.json',
                'arn:aws:s3:::manuel-weiss-website/data/tempus-demo-rm-state.json',
                'arn:aws:s3:::manuel-weiss-website/data/tempus-demo-bpafg-state.json'
            ]
        }));
        const demoScriptIntegration = new apigateway.LambdaIntegration(demoScriptLambda);
        const demoScriptResource = this.api.root.addResource('demo-script');
        demoScriptResource.addMethod('GET', demoScriptIntegration);
        demoScriptResource.addMethod('POST', demoScriptIntegration);
        const demoScriptRmResource = demoScriptResource.addResource('rm');
        demoScriptRmResource.addMethod('GET', demoScriptIntegration);
        demoScriptRmResource.addMethod('POST', demoScriptIntegration);
        const demoScriptBpafgResource = demoScriptResource.addResource('bpafg');
        demoScriptBpafgResource.addMethod('GET', demoScriptIntegration);
        demoScriptBpafgResource.addMethod('POST', demoScriptIntegration);
        // ========================================
        // TEMPUS LOGIN MAILER
        // ========================================
        // Läuft aktuell OHNE Lambda: Templates werden als einzelner State
        // (s3://manuel-weiss-website/data/tempus-mailer-state.json) abgelegt,
        // öffentlich gelesen und per Presigned PUT-URL geschrieben.
        // Grund: `lambda:CreateFunction` ist im Konto geblockt (siehe
        // docs/RECOVERY_demo-script-lambda.md). Sobald das wieder geht, kann
        // hier analog zur demo-script-Lambda eine eigene Route angelegt werden.
        //
        // Presigned-URL alle 7 Tage via `./refresh-mailer-state-url.sh` neu
        // erzeugen.
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
        // SINGING TRAINER (Gesangstraining App)
        // ========================================
        // Tabelle existiert in AWS (u. a. nach fehlgeschlagenem Rollback); Referenz statt Create vermeidet ResourceExistenceCheck-Konflikt
        const singingProgressTable = dynamodb.Table.fromTableName(this, 'SingingProgressTable', 'mawps-singing-progress');
        const singingTrainerLambda = new lambda.Function(this, 'SingingTrainerFunction', {
            functionName: 'website-singing-trainer-api',
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('../lambda/singing-trainer-api'),
            role: lambdaRole,
            timeout: cdk.Duration.seconds(10),
            memorySize: 128,
            environment: {
                PROGRESS_TABLE: singingProgressTable.tableName
            }
        });
        singingProgressTable.grantReadWriteData(singingTrainerLambda);
        const singingTrainerResource = this.api.root.addResource('singing-trainer');
        const singingProgressResource = singingTrainerResource.addResource('progress');
        singingProgressResource.addMethod('GET', new apigateway.LambdaIntegration(singingTrainerLambda));
        singingProgressResource.addMethod('POST', new apigateway.LambdaIntegration(singingTrainerLambda));
        const singingExercisesResource = singingTrainerResource.addResource('exercises');
        singingExercisesResource.addMethod('GET', new apigateway.LambdaIntegration(singingTrainerLambda));
        const singingCalibrateResource = singingTrainerResource.addResource('calibrate');
        singingCalibrateResource.addMethod('POST', new apigateway.LambdaIntegration(singingTrainerLambda));
        // ========================================
        // FOKUS-TAGEBUCH (Tagesvertrag / 20-Min-Training, Cognito JWT)
        // ========================================
        // Tabelle kann bereits in AWS existieren (Create vor fehlgeschlagenem Deploy); Referenz vermeidet ResourceExistenceCheck
        const fokusTagebuchTable = dynamodb.Table.fromTableName(this, 'FokusTagebuchTable', 'mawps-fokus-tagebuch');
        const fokusTagebuchLambda = new lambda.Function(this, 'FokusTagebuchFunction', {
            functionName: 'website-fokus-tagebuch-api',
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('../lambda/fokus-tagebuch-api'),
            role: lambdaRole,
            timeout: cdk.Duration.seconds(15),
            memorySize: 256,
            environment: {
                FOKUS_TABLE: fokusTagebuchTable.tableName
            }
        });
        fokusTagebuchTable.grantReadWriteData(fokusTagebuchLambda);
        const fokusTagebuchResource = this.api.root.addResource('fokus-tagebuch');
        const fokusDayResource = fokusTagebuchResource.addResource('day');
        fokusDayResource.addMethod('GET', new apigateway.LambdaIntegration(fokusTagebuchLambda));
        fokusDayResource.addMethod('PUT', new apigateway.LambdaIntegration(fokusTagebuchLambda));
        const fokusWeekResource = fokusTagebuchResource.addResource('week');
        fokusWeekResource.addMethod('GET', new apigateway.LambdaIntegration(fokusTagebuchLambda));
        fokusWeekResource.addMethod('PUT', new apigateway.LambdaIntegration(fokusTagebuchLambda));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vic2l0ZS1hcGktc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ3ZWJzaXRlLWFwaS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFDbkMseURBQXlEO0FBQ3pELGlEQUFpRDtBQUNqRCwyQ0FBMkM7QUFDM0MscURBQXFEO0FBQ3JELHlDQUF5QztBQUd6Qzs7O0dBR0c7QUFDSCxNQUFhLGVBQWdCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFJNUMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QiwyQ0FBMkM7UUFDM0Msc0NBQXNDO1FBQ3RDLDJDQUEyQztRQUUzQyx5Q0FBeUM7UUFDekMsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO1FBQ2pHLE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1FBQ3RHLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztRQUNuRyxNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBRXRHLGtDQUFrQztRQUNsQyxNQUFNLGtCQUFrQixHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1FBQ3hHLE1BQU0sZUFBZSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFD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c0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIGFwaWdhdGV3YXkgZnJvbSAnYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXknO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0ICogYXMgZHluYW1vZGIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWR5bmFtb2RiJztcbmltcG9ydCAqIGFzIHMzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zMyc7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcblxuLyoqXG4gKiBXZWJzaXRlIEFQSSBTdGFja1xuICogV2Vic2l0ZSBBUEk6IEFXUyBMYW1iZGEgKyBBUEkgR2F0ZXdheSBmw7xyIG1hbnVlbC13ZWlzcy5jaFxuICovXG5leHBvcnQgY2xhc3MgV2Vic2l0ZUFwaVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgcHVibGljIHJlYWRvbmx5IGFwaTogYXBpZ2F0ZXdheS5SZXN0QXBpO1xuICBwdWJsaWMgcmVhZG9ubHkgYXBpVXJsOiBjZGsuQ2ZuT3V0cHV0O1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBCRVNURUhFTkRFIFJFU1NPVVJDRU4gUkVGRVJFTlpJRVJFTlxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBcbiAgICAvLyBEeW5hbW9EQiBUYWJlbGxlbiAoZXhpc3RpZXJlbiBiZXJlaXRzKVxuICAgIGNvbnN0IHVzZXJEYXRhVGFibGUgPSBkeW5hbW9kYi5UYWJsZS5mcm9tVGFibGVOYW1lKHRoaXMsICdVc2VyRGF0YVRhYmxlJywgJ21hd3BzLXVzZXItcHJvZmlsZXMnKTtcbiAgICBjb25zdCBoaWdoc2NvcmVzVGFibGUgPSBkeW5hbW9kYi5UYWJsZS5mcm9tVGFibGVOYW1lKHRoaXMsICdIaWdoc2NvcmVzVGFibGUnLCAnc25vd2ZsYWtlLWhpZ2hzY29yZXMnKTtcbiAgICBjb25zdCBzZXR0aW5nc1RhYmxlID0gZHluYW1vZGIuVGFibGUuZnJvbVRhYmxlTmFtZSh0aGlzLCAnU2V0dGluZ3NUYWJsZScsICdtYW51ZWwtd2Vpc3Mtc2V0dGluZ3MnKTtcbiAgICBjb25zdCBhcGlTZXR0aW5nc1RhYmxlID0gZHluYW1vZGIuVGFibGUuZnJvbVRhYmxlTmFtZSh0aGlzLCAnQXBpU2V0dGluZ3NUYWJsZScsICdtYXdwcy1hcGktc2V0dGluZ3MnKTtcbiAgICBcbiAgICAvLyBTMyBCdWNrZXRzIChleGlzdGllcmVuIGJlcmVpdHMpXG4gICAgY29uc3QgcHJvZmlsZUltYWdlQnVja2V0ID0gczMuQnVja2V0LmZyb21CdWNrZXROYW1lKHRoaXMsICdQcm9maWxlSW1hZ2VCdWNrZXQnLCAnbWF3cHMtcHJvZmlsZS1pbWFnZXMnKTtcbiAgICBjb25zdCBoZXJvVmlkZW9CdWNrZXQgPSBzMy5CdWNrZXQuZnJvbUJ1Y2tldE5hbWUodGhpcywgJ0hlcm9WaWRlb0J1Y2tldCcsICdtYW51ZWwtd2Vpc3MtaGVyby12aWRlb3MnKTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBJQU0gUk9MTEUgRsOcUiBMQU1CREFTXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIGNvbnN0IGxhbWJkYVJvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgJ1dlYnNpdGVMYW1iZGFSb2xlJywge1xuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoJ2xhbWJkYS5hbWF6b25hd3MuY29tJyksXG4gICAgICBtYW5hZ2VkUG9saWNpZXM6IFtcbiAgICAgICAgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKCdzZXJ2aWNlLXJvbGUvQVdTTGFtYmRhQmFzaWNFeGVjdXRpb25Sb2xlJylcbiAgICAgIF1cbiAgICB9KTtcblxuICAgIC8vIER5bmFtb0RCIFBlcm1pc3Npb25zXG4gICAgbGFtYmRhUm9sZS5hZGRUb1BvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICBhY3Rpb25zOiBbXG4gICAgICAgICdkeW5hbW9kYjpHZXRJdGVtJyxcbiAgICAgICAgJ2R5bmFtb2RiOlB1dEl0ZW0nLFxuICAgICAgICAnZHluYW1vZGI6VXBkYXRlSXRlbScsXG4gICAgICAgICdkeW5hbW9kYjpEZWxldGVJdGVtJyxcbiAgICAgICAgJ2R5bmFtb2RiOlF1ZXJ5JyxcbiAgICAgICAgJ2R5bmFtb2RiOlNjYW4nXG4gICAgICBdLFxuICAgICAgcmVzb3VyY2VzOiBbXG4gICAgICAgIHVzZXJEYXRhVGFibGUudGFibGVBcm4sXG4gICAgICAgIGhpZ2hzY29yZXNUYWJsZS50YWJsZUFybixcbiAgICAgICAgc2V0dGluZ3NUYWJsZS50YWJsZUFybixcbiAgICAgICAgYXBpU2V0dGluZ3NUYWJsZS50YWJsZUFybixcbiAgICAgICAgJ2Fybjphd3M6ZHluYW1vZGI6ZXUtY2VudHJhbC0xOio6dGFibGUvbWF3cHMtdXNlci1kYXRhJ1xuICAgICAgXVxuICAgIH0pKTtcblxuICAgIC8vIFMzIFBlcm1pc3Npb25zXG4gICAgbGFtYmRhUm9sZS5hZGRUb1BvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICBhY3Rpb25zOiBbXG4gICAgICAgICdzMzpHZXRPYmplY3QnLFxuICAgICAgICAnczM6UHV0T2JqZWN0JyxcbiAgICAgICAgJ3MzOkRlbGV0ZU9iamVjdCcsXG4gICAgICAgICdzMzpMaXN0QnVja2V0J1xuICAgICAgXSxcbiAgICAgIHJlc291cmNlczogW1xuICAgICAgICBwcm9maWxlSW1hZ2VCdWNrZXQuYnVja2V0QXJuLFxuICAgICAgICBgJHtwcm9maWxlSW1hZ2VCdWNrZXQuYnVja2V0QXJufS8qYCxcbiAgICAgICAgaGVyb1ZpZGVvQnVja2V0LmJ1Y2tldEFybixcbiAgICAgICAgYCR7aGVyb1ZpZGVvQnVja2V0LmJ1Y2tldEFybn0vKmBcbiAgICAgIF1cbiAgICB9KSk7XG5cbiAgICAvLyBTRVMgUGVybWlzc2lvbnMgKGbDvHIgS29udGFrdC1FLU1haWxzKVxuICAgIGxhbWJkYVJvbGUuYWRkVG9Qb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgYWN0aW9uczogWydzZXM6U2VuZEVtYWlsJywgJ3NlczpTZW5kUmF3RW1haWwnXSxcbiAgICAgIHJlc291cmNlczogWycqJ11cbiAgICB9KSk7XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gQVBJIEdBVEVXQVlcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgdGhpcy5hcGkgPSBuZXcgYXBpZ2F0ZXdheS5SZXN0QXBpKHRoaXMsICdXZWJzaXRlQVBJJywge1xuICAgICAgcmVzdEFwaU5hbWU6ICdNYW51ZWwgV2Vpc3MgV2Vic2l0ZSBBUEknLFxuICAgICAgZGVzY3JpcHRpb246ICdBUEkgZsO8ciBtYW51ZWwtd2Vpc3MuY2gnLFxuICAgICAgZGVmYXVsdENvcnNQcmVmbGlnaHRPcHRpb25zOiB7XG4gICAgICAgIGFsbG93T3JpZ2luczogW1xuICAgICAgICAgICdodHRwczovL21hbnVlbC13ZWlzcy5jaCcsXG4gICAgICAgICAgJ2h0dHBzOi8vd3d3Lm1hbnVlbC13ZWlzcy5jaCcsXG4gICAgICAgICAgJ2h0dHBzOi8vbWFudWVsLXdlaXNzLmNoJyxcbiAgICAgICAgICAnaHR0cDovL2xvY2FsaG9zdDozMDAwJyxcbiAgICAgICAgICAnaHR0cDovL2xvY2FsaG9zdDo1NTAwJyxcbiAgICAgICAgICAnaHR0cDovLzEyNy4wLjAuMTo1NTAwJ1xuICAgICAgICBdLFxuICAgICAgICBhbGxvd01ldGhvZHM6IFsnR0VUJywgJ1BPU1QnLCAnUFVUJywgJ0RFTEVURScsICdPUFRJT05TJ10sXG4gICAgICAgIGFsbG93SGVhZGVyczogW1xuICAgICAgICAgICdDb250ZW50LVR5cGUnLFxuICAgICAgICAgICdBdXRob3JpemF0aW9uJyxcbiAgICAgICAgICAnWC1Vc2VyLUlkJyxcbiAgICAgICAgICAnWC1DdXN0b21lci1JZCcsXG4gICAgICAgICAgJ1gtQW16LURhdGUnLFxuICAgICAgICAgICdYLUFwaS1LZXknLFxuICAgICAgICAgICdYLUFtei1TZWN1cml0eS1Ub2tlbicsXG4gICAgICAgICAgJ1gtRGVtby1QYXNzd29yZCdcbiAgICAgICAgXSxcbiAgICAgICAgYWxsb3dDcmVkZW50aWFsczogdHJ1ZVxuICAgICAgfSxcbiAgICAgIGRlcGxveU9wdGlvbnM6IHtcbiAgICAgICAgc3RhZ2VOYW1lOiAndjEnLFxuICAgICAgICB0aHJvdHRsaW5nUmF0ZUxpbWl0OiAxMDAsXG4gICAgICAgIHRocm90dGxpbmdCdXJzdExpbWl0OiAyMDBcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBHQVRFV0FZLUxFVkVMIENPUlMgKFdJQ0hUSUcgZsO8ciBGZWhsZXJmw6RsbGUpXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIFdlbm4gTGFtYmRhL0ludGVncmF0aW9uIGluIGVpbmVuIEVycm9yLVBmYWQgbMOkdWZ0ICh6LkIuIDUwMi81MDQvNDEzKSxcbiAgICAvLyBsaWVmZXJ0IEFQSSBHYXRld2F5IHRlaWxzIFwiREVGQVVMVF80WFgvNVhYXCIgUmVzcG9uc2VzIE9ITkUgQ09SUy1IZWFkZXIuXG4gICAgLy8gRGFzIGVyc2NoZWludCBpbSBCcm93c2VyIGFscyBcIkNPUlMgYmxvY2tlZFwiIHVuZCB2ZXJzY2hsZWllcnQgZGllIGVjaHRlIFVyc2FjaGUuXG4gICAgY29uc3QgZ2F0ZXdheUNvcnNIZWFkZXJzID0ge1xuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6IFwiJyonXCIsXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6IFwiJ0NvbnRlbnQtVHlwZSxBdXRob3JpemF0aW9uLFgtVXNlci1JZCxYLUFtei1EYXRlLFgtQXBpLUtleSxYLUFtei1TZWN1cml0eS1Ub2tlbidcIixcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogXCInR0VULFBPU1QsUFVULERFTEVURSxPUFRJT05TJ1wiXG4gICAgfTtcblxuICAgIHRoaXMuYXBpLmFkZEdhdGV3YXlSZXNwb25zZSgnRGVmYXVsdDR4eENvcnMnLCB7XG4gICAgICB0eXBlOiBhcGlnYXRld2F5LlJlc3BvbnNlVHlwZS5ERUZBVUxUXzRYWCxcbiAgICAgIHJlc3BvbnNlSGVhZGVyczogZ2F0ZXdheUNvcnNIZWFkZXJzXG4gICAgfSk7XG5cbiAgICB0aGlzLmFwaS5hZGRHYXRld2F5UmVzcG9uc2UoJ0RlZmF1bHQ1eHhDb3JzJywge1xuICAgICAgdHlwZTogYXBpZ2F0ZXdheS5SZXNwb25zZVR5cGUuREVGQVVMVF81WFgsXG4gICAgICByZXNwb25zZUhlYWRlcnM6IGdhdGV3YXlDb3JzSGVhZGVyc1xuICAgIH0pO1xuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIExBTUJEQSBGVU5DVElPTlNcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAvLyBVc2VyIERhdGEgTGFtYmRhXG4gICAgY29uc3QgdXNlckRhdGFMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdVc2VyRGF0YUZ1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnd2Vic2l0ZS11c2VyLWRhdGEnLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS91c2VyLWRhdGEnKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBVU0VSX0RBVEFfVEFCTEU6ICdtYXdwcy11c2VyLXByb2ZpbGVzJ1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gU25vd2ZsYWtlIEhpZ2hzY29yZXMgTGFtYmRhIChvcHRpb25hbDogSElHSFNDT1JFX0FETUlOX1NFQ1JFVCBpbiBBV1MgQ29uc29sZSwgbWluZC4gOCBaZWljaGVuKVxuICAgIGNvbnN0IGhpZ2hzY29yZXNMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdIaWdoc2NvcmVzRnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLXNub3dmbGFrZS1oaWdoc2NvcmVzJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvc25vd2ZsYWtlLWhpZ2hzY29yZXMnKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBISUdIU0NPUkVTX1RBQkxFOiAnc25vd2ZsYWtlLWhpZ2hzY29yZXMnXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBIZXJvIFZpZGVvIExhbWJkYVxuICAgIGNvbnN0IGhlcm9WaWRlb0xhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0hlcm9WaWRlb0Z1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnd2Vic2l0ZS1oZXJvLXZpZGVvJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvaGVyby12aWRlbycpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKSxcbiAgICAgIG1lbW9yeVNpemU6IDI1NixcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIERZTkFNT0RCX1NFVFRJTkdTX1RBQkxFOiAnbWFudWVsLXdlaXNzLXNldHRpbmdzJyxcbiAgICAgICAgUzNfSEVST19WSURFT19CVUNLRVQ6ICdtYW51ZWwtd2Vpc3MtaGVyby12aWRlb3MnXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBPcGVuQUkgUHJveHkgTGFtYmRhXG4gICAgY29uc3Qgb3BlbmFpUHJveHlMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdPcGVuQUlQcm94eUZ1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnd2Vic2l0ZS1vcGVuYWktcHJveHknLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS9vcGVuYWktcHJveHknKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcyg2MCksXG4gICAgICBtZW1vcnlTaXplOiAyNTZcbiAgICB9KTtcblxuICAgIC8vIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuICAgIC8vIFNPTkcgR0VORVJBVE9SIChQZXJzb2VubGljaGtlaXRzLVNvbmctR2VuZXJhdG9yKVxuICAgIC8vIDUgQWN0aW9ucyBpbiBlaW5lciBMYW1iZGE6IHRlc3RfcXVlc3Rpb25zIC8gaW50ZXJwcmV0X2lucHV0IC9cbiAgICAvLyBzeW50aGVzaXplIC8gY29tcG9zZSAvIHJlcm9sbFxuICAgIC8vIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuICAgIGNvbnN0IHNvbmdHZW5lcmF0b3JMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdTb25nR2VuZXJhdG9yRnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLXNvbmctZ2VuZXJhdG9yJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvc29uZy1nZW5lcmF0b3InKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICAvLyBDb21wb3Nlci1DYWxscyBrw7ZubmVuIGJlaSBncHQtNS4yICsgNDUwMCBtYXhfdG9rZW5zIDIwLTI1cyBkYXVlcm5cbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDYwKSxcbiAgICAgIG1lbW9yeVNpemU6IDUxMlxuICAgIH0pO1xuXG4gICAgLy8gSm9iIFBhcnNlciBMYW1iZGFcbiAgICBjb25zdCBqb2JQYXJzZXJMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdKb2JQYXJzZXJGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtam9iLXBhcnNlcicsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL2pvYi1wYXJzZXInKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXG4gICAgICBtZW1vcnlTaXplOiAyNTZcbiAgICB9KTtcblxuICAgIC8vIENWIEdlbmVyYWwgTGFtYmRhXG4gICAgY29uc3QgY3ZHZW5lcmFsTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQ1ZHZW5lcmFsRnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLWN2LWdlbmVyYWwnLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS9jdi1nZW5lcmFsJyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMTIwKSxcbiAgICAgIG1lbW9yeVNpemU6IDUxMlxuICAgIH0pO1xuXG4gICAgLy8gQ1YgVGFyZ2V0IExhbWJkYVxuICAgIGNvbnN0IGN2VGFyZ2V0TGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQ1ZUYXJnZXRGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtY3YtdGFyZ2V0JyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvY3YtdGFyZ2V0JyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMTIwKSxcbiAgICAgIG1lbW9yeVNpemU6IDUxMlxuICAgIH0pO1xuXG4gICAgLy8gQ1YgSm9iIFBhcnNlIExhbWJkYVxuICAgIGNvbnN0IGN2Sm9iUGFyc2VMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdDVkpvYlBhcnNlRnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLWN2LWpvYi1wYXJzZScsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL2N2LWpvYi1wYXJzZScpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDYwKSxcbiAgICAgIG1lbW9yeVNpemU6IDI1NlxuICAgIH0pO1xuXG4gICAgLy8gQ1YgRmlsZXMgUGFyc2UgTGFtYmRhXG4gICAgY29uc3QgY3ZGaWxlc1BhcnNlTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQ1ZGaWxlc1BhcnNlRnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLWN2LWZpbGVzLXBhcnNlJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvY3YtZmlsZXMtcGFyc2UnKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcyg2MCksXG4gICAgICBtZW1vcnlTaXplOiA1MTJcbiAgICB9KTtcblxuICAgIC8vIENWIEV4cG9ydCBMYW1iZGFcbiAgICBjb25zdCBjdkV4cG9ydExhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0NWRXhwb3J0RnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLWN2LWV4cG9ydCcsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL2N2LWV4cG9ydCcpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKSxcbiAgICAgIG1lbW9yeVNpemU6IDI1NlxuICAgIH0pO1xuXG4gICAgLy8gQVBJIFNldHRpbmdzIExhbWJkYSAodm9sbHN0w6RuZGlnIG1pdCBWZXJzY2hsw7xzc2VsdW5nKVxuICAgIGNvbnN0IGFwaVNldHRpbmdzTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQXBpU2V0dGluZ3NGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtYXBpLXNldHRpbmdzJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvYXBpLXNldHRpbmdzJyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgQVBJX1NFVFRJTkdTX1RBQkxFOiAnbWF3cHMtYXBpLXNldHRpbmdzJyxcbiAgICAgICAgUFJPRklMRV9UQUJMRTogJ21hd3BzLXVzZXItcHJvZmlsZXMnLCAvLyBGw7xyIGdsb2JhbGUgQVBJIFNldHRpbmdzXG4gICAgICAgIEVOQ1JZUFRJT05fU0VDUkVUOiBwcm9jZXNzLmVudi5FTkNSWVBUSU9OX1NFQ1JFVCB8fCAnbWF3cHMtc2VjdXJlLWFwaS1rZXktZW5jcnlwdGlvbi0yMDI0J1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gQ29udGFjdCBFbWFpbCBMYW1iZGEgKHZvbGxzdMOkbmRpZyBtaXQgU0VTKVxuICAgIGNvbnN0IGNvbnRhY3RFbWFpbExhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0NvbnRhY3RFbWFpbEZ1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnd2Vic2l0ZS1jb250YWN0LWVtYWlsJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvY29udGFjdC1lbWFpbCcpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKSxcbiAgICAgIG1lbW9yeVNpemU6IDI1NixcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIEZST01fRU1BSUw6ICdub3JlcGx5QG1hbnVlbC13ZWlzcy5jaCcsXG4gICAgICAgIFRPX0VNQUlMOiAna29udGFrdEBtYW51ZWwtd2Vpc3MuY2gnXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBQcm9maWxlIEltYWdlIFVwbG9hZCBMYW1iZGEgKHZvbGxzdMOkbmRpZyBtaXQgUzMgUHJlc2lnbmVkIFVSTHMpXG4gICAgY29uc3QgcHJvZmlsZUltYWdlTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnUHJvZmlsZUltYWdlRnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLXByb2ZpbGUtaW1hZ2UtdXBsb2FkJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvcHJvZmlsZS1pbWFnZS11cGxvYWQnKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBTM19CVUNLRVQ6ICdtYXdwcy1wcm9maWxlLWltYWdlcydcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFBERiBHZW5lcmF0b3IgTGFtYmRhIChHUFQtNS4yICsgUHVwcGV0ZWVyIGbDvHIgcHLDpHppc2UgUERGLUdlbmVyaWVydW5nKVxuICAgIGNvbnN0IHBkZkdlbmVyYXRvckxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1BkZkdlbmVyYXRvckZ1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnd2Vic2l0ZS1wZGYtZ2VuZXJhdG9yJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvcGRmLWdlbmVyYXRvci1ncHQ1MicpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDEyMCksIC8vIEzDpG5nZXJlciBUaW1lb3V0IGbDvHIgR1BULTUuMiArIFBERi1HZW5lcmllcnVuZ1xuICAgICAgbWVtb3J5U2l6ZTogMjA0OCwgLy8gTWVociBNZW1vcnkgZsO8ciBQdXBwZXRlZXIvQ2hyb21lXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBOT0RFX0VOVjogJ3Byb2R1Y3Rpb24nXG4gICAgICAgIC8vIE9QRU5BSV9BUElfS0VZIHdpcmQgbmljaHQgYWxzIFVtZ2VidW5nc3ZhcmlhYmxlIGdlc2V0enQsIHNvbmRlcm4gdm9tIEZyb250ZW5kIMO8YmVyZ2ViZW5cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBIRVJPIFZJREVPIExBTUJEQVMgKFBoYXNlIDEgTWlncmF0aW9uKVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8vIEhlcm8gVmlkZW8gU2V0dGluZ3MgTGFtYmRhXG4gICAgY29uc3QgaGVyb1ZpZGVvU2V0dGluZ3NMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdIZXJvVmlkZW9TZXR0aW5nc0Z1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnd2Vic2l0ZS1oZXJvLXZpZGVvLXNldHRpbmdzJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvaGVyby12aWRlby1zZXR0aW5ncycpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKSxcbiAgICAgIG1lbW9yeVNpemU6IDI1NixcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIFNFVFRJTkdTX1RBQkxFOiAnbWFudWVsLXdlaXNzLXNldHRpbmdzJyxcbiAgICAgICAgSEVST19WSURFT19CVUNLRVQ6ICdtYW51ZWwtd2Vpc3MtaGVyby12aWRlb3MnXG4gICAgICAgIC8vIEFXU19SRUdJT04gd2lyZCBhdXRvbWF0aXNjaCB2b24gTGFtYmRhIGdlc2V0enRcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIEhlcm8gVmlkZW8gVXBsb2FkIExhbWJkYVxuICAgIGNvbnN0IGhlcm9WaWRlb1VwbG9hZExhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0hlcm9WaWRlb1VwbG9hZEZ1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnd2Vic2l0ZS1oZXJvLXZpZGVvLXVwbG9hZCcsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL2hlcm8tdmlkZW8tdXBsb2FkJyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgSEVST19WSURFT19CVUNLRVQ6ICdtYW51ZWwtd2Vpc3MtaGVyby12aWRlb3MnXG4gICAgICAgIC8vIEFXU19SRUdJT04gd2lyZCBhdXRvbWF0aXNjaCB2b24gTGFtYmRhIGdlc2V0enRcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIEhlcm8gVmlkZW8gVXBsb2FkIERpcmVjdCBMYW1iZGFcbiAgICBjb25zdCBoZXJvVmlkZW9VcGxvYWREaXJlY3RMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdIZXJvVmlkZW9VcGxvYWREaXJlY3RGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtaGVyby12aWRlby11cGxvYWQtZGlyZWN0JyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvaGVyby12aWRlby11cGxvYWQtZGlyZWN0JyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMTIwKSwgLy8gTMOkbmdlciBmw7xyIEJhc2U2NCBVcGxvYWQgKDEwME1CIG1heClcbiAgICAgIG1lbW9yeVNpemU6IDEwMjQsIC8vIE1laHIgTWVtb3J5IGbDvHIgQmFzZTY0IERlY29kaW5nICsgUzMgVXBsb2FkXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBIRVJPX1ZJREVPX0JVQ0tFVDogJ21hbnVlbC13ZWlzcy1oZXJvLXZpZGVvcycsXG4gICAgICAgIFNFVFRJTkdTX1RBQkxFOiAnbWFudWVsLXdlaXNzLXNldHRpbmdzJyxcbiAgICAgICAgU0VUVElOR1NfS0VZOiAnaGVyby12aWRlby11cmwnXG4gICAgICAgIC8vIEFXU19SRUdJT04gd2lyZCBhdXRvbWF0aXNjaCB2b24gTGFtYmRhIGdlc2V0enRcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFRleHQtdG8tQlBNTiBMYW1iZGEgKEhSLUF1dG9tYXRpb24tV29ya2Zsb3cpXG4gICAgY29uc3QgdGV4dFRvQnBtbkxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1RleHRUb0JwbW5GdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtdGV4dC10by1icG1uJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvdGV4dC10by1icG1uJyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxuICAgICAgbWVtb3J5U2l6ZTogMjU2XG4gICAgfSk7XG5cbiAgICAvLyBUZXh0LXRvLUJQTU4gbWl0IEdQVC01LjIgKEFkbWluOiBLSS1CUE1OLUdlbmVyaWVydW5nKVxuICAgIGNvbnN0IHRleHRUb0JwbW5HcHQ1MkxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1RleHRUb0JwbW5HcHQ1MkZ1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnd2Vic2l0ZS10ZXh0LXRvLWJwbW4tZ3B0NTInLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS90ZXh0LXRvLWJwbW4tZ3B0NTInKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMDApLCAvLyA1IE1pbiBmw7xyIGxhbmdlIFByb3plc3NlIChBUEkgR2F0ZXdheSBtYXggMjlzIOKGkiBGdW5jdGlvbiBVUkwpXG4gICAgICBtZW1vcnlTaXplOiAxMDI0IC8vIE1laHIgTWVtb3J5ID0gc2NobmVsbGVyZXIgQ1BVIGbDvHIgQW5hbHlzZSAoQVBJIEdhdGV3YXkgbWF4IDI5cylcbiAgICB9KTtcblxuICAgIC8vIEhSLUxlYWRzIEFQSSBMYW1iZGEgKEhSLVNlbGJzdHRlc3QgTGVhZC1FcmZhc3N1bmcpXG4gICAgY29uc3QgaHJMZWFkc0xhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0hyTGVhZHNGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtaHItbGVhZHMnLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS9oci1sZWFkcy1hcGknKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBTM19CVUNLRVQ6ICdtYW51ZWwtd2Vpc3Mtd2Vic2l0ZScsXG4gICAgICAgIEFETUlOX1BBU1NXT1JEOiAnbXctYWRtaW4tMjAyNCdcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFMzIFBlcm1pc3Npb25zIGbDvHIgSFItTGVhZHMgKG1hbnVlbC13ZWlzcy13ZWJzaXRlIGJ1Y2tldClcbiAgICBockxlYWRzTGFtYmRhLmFkZFRvUm9sZVBvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICBhY3Rpb25zOiBbJ3MzOkdldE9iamVjdCcsICdzMzpQdXRPYmplY3QnXSxcbiAgICAgIHJlc291cmNlczogWydhcm46YXdzOnMzOjo6bWFudWVsLXdlaXNzLXdlYnNpdGUvZGF0YS8qJ11cbiAgICB9KSk7XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gQkVXRVJCVU5HU1BST0ZJTCBMQU1CREEgKFBoYXNlIDIgTWlncmF0aW9uKVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8vIEJld2VyYnVuZ3Nwcm9maWwgTGFtYmRhXG4gICAgY29uc3QgYmV3ZXJidW5nc3Byb2ZpbExhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0Jld2VyYnVuZ3Nwcm9maWxGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtYmV3ZXJidW5nc3Byb2ZpbCcsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL2Jld2VyYnVuZ3Nwcm9maWwnKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBVU0VSX0RBVEFfVEFCTEU6ICdtYXdwcy11c2VyLWRhdGEnXG4gICAgICAgIC8vIEFXU19SRUdJT04gd2lyZCBhdXRvbWF0aXNjaCB2b24gTGFtYmRhIGdlc2V0enRcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBVU0VSIFBST0ZJTEUgQVBJIExBTUJEQSAoUGhhc2UgMyBNaWdyYXRpb24pXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgLy8gVXNlciBQcm9maWxlIEFQSSBMYW1iZGFcbiAgICBjb25zdCB1c2VyUHJvZmlsZUFwaUxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1VzZXJQcm9maWxlQXBpRnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLXVzZXItcHJvZmlsZS1hcGknLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS91c2VyLXByb2ZpbGUtYXBpJyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgUFJPRklMRVNfVEFCTEU6ICdtYXdwcy11c2VyLXByb2ZpbGVzJyxcbiAgICAgICAgQVBQTElDQVRJT05TX1RBQkxFOiAnbWF3cHMtYXBwbGljYXRpb25zJyxcbiAgICAgICAgUkVTVU1FU19UQUJMRTogJ21hd3BzLXJlc3VtZXMnLFxuICAgICAgICBDT1ZFUl9MRVRURVJTX1RBQkxFOiAnbWF3cHMtY292ZXItbGV0dGVycydcbiAgICAgICAgLy8gQVdTX1JFR0lPTiB3aXJkIGF1dG9tYXRpc2NoIHZvbiBMYW1iZGEgZ2VzZXR6dFxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIEFQSSBST1VURVNcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAvLyAvdXNlci1kYXRhXG4gICAgY29uc3QgdXNlckRhdGFSZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ3VzZXItZGF0YScpO1xuICAgIHVzZXJEYXRhUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIHVzZXJEYXRhUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICB1c2VyRGF0YVJlc291cmNlLmFkZE1ldGhvZCgnUFVUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICB1c2VyRGF0YVJlc291cmNlLmFkZE1ldGhvZCgnREVMRVRFJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBcbiAgICAvLyAvdXNlci1kYXRhL3Byb2ZpbGVcbiAgICBjb25zdCBwcm9maWxlUmVzb3VyY2UgPSB1c2VyRGF0YVJlc291cmNlLmFkZFJlc291cmNlKCdwcm9maWxlJyk7XG4gICAgcHJvZmlsZVJlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBwcm9maWxlUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBwcm9maWxlUmVzb3VyY2UuYWRkTWV0aG9kKCdQVVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIFxuICAgIC8vIC91c2VyLWRhdGEvcmVzdW1lc1xuICAgIGNvbnN0IHJlc3VtZXNSZXNvdXJjZSA9IHVzZXJEYXRhUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3Jlc3VtZXMnKTtcbiAgICByZXN1bWVzUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIHJlc3VtZXNSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIHJlc3VtZXNSZXNvdXJjZS5hZGRNZXRob2QoJ0RFTEVURScsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJEYXRhTGFtYmRhKSk7XG4gICAgXG4gICAgLy8gL3VzZXItZGF0YS9kb2N1bWVudHNcbiAgICBjb25zdCBkb2N1bWVudHNSZXNvdXJjZSA9IHVzZXJEYXRhUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ2RvY3VtZW50cycpO1xuICAgIGRvY3VtZW50c1Jlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBkb2N1bWVudHNSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIGRvY3VtZW50c1Jlc291cmNlLmFkZE1ldGhvZCgnREVMRVRFJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBcbiAgICAvLyAvdXNlci1kYXRhL2NvdmVyLWxldHRlcnNcbiAgICBjb25zdCBjb3ZlckxldHRlcnNSZXNvdXJjZSA9IHVzZXJEYXRhUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ2NvdmVyLWxldHRlcnMnKTtcbiAgICBjb3ZlckxldHRlcnNSZXNvdXJjZS5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJEYXRhTGFtYmRhKSk7XG4gICAgY292ZXJMZXR0ZXJzUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBjb3ZlckxldHRlcnNSZXNvdXJjZS5hZGRNZXRob2QoJ0RFTEVURScsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJEYXRhTGFtYmRhKSk7XG4gICAgXG4gICAgLy8gL3VzZXItZGF0YS9hcHBsaWNhdGlvbnNcbiAgICBjb25zdCBhcHBsaWNhdGlvbnNSZXNvdXJjZSA9IHVzZXJEYXRhUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ2FwcGxpY2F0aW9ucycpO1xuICAgIGFwcGxpY2F0aW9uc1Jlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBhcHBsaWNhdGlvbnNSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIGFwcGxpY2F0aW9uc1Jlc291cmNlLmFkZE1ldGhvZCgnREVMRVRFJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBcbiAgICAvLyAvdXNlci1kYXRhL3Bob3Rvc1xuICAgIGNvbnN0IHBob3Rvc1Jlc291cmNlID0gdXNlckRhdGFSZXNvdXJjZS5hZGRSZXNvdXJjZSgncGhvdG9zJyk7XG4gICAgcGhvdG9zUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIHBob3Rvc1Jlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJEYXRhTGFtYmRhKSk7XG4gICAgcGhvdG9zUmVzb3VyY2UuYWRkTWV0aG9kKCdERUxFVEUnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIFxuICAgIC8vIC91c2VyLWRhdGEvd29ya2Zsb3dzL3twcm94eSt9XG4gICAgY29uc3Qgd29ya2Zsb3dzUmVzb3VyY2UgPSB1c2VyRGF0YVJlc291cmNlLmFkZFJlc291cmNlKCd3b3JrZmxvd3MnKTtcbiAgICBjb25zdCB3b3JrZmxvd1Byb3h5ID0gd29ya2Zsb3dzUmVzb3VyY2UuYWRkUHJveHkoe1xuICAgICAgYW55TWV0aG9kOiB0cnVlLFxuICAgICAgZGVmYXVsdEludGVncmF0aW9uOiBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSlcbiAgICB9KTtcblxuICAgIC8vIC9zbm93Zmxha2UtaGlnaHNjb3Jlc1xuICAgIGNvbnN0IGhpZ2hzY29yZXNSZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ3Nub3dmbGFrZS1oaWdoc2NvcmVzJyk7XG4gICAgaGlnaHNjb3Jlc1Jlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaGlnaHNjb3Jlc0xhbWJkYSkpO1xuICAgIGhpZ2hzY29yZXNSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihoaWdoc2NvcmVzTGFtYmRhKSk7XG4gICAgaGlnaHNjb3Jlc1Jlc291cmNlLmFkZE1ldGhvZCgnREVMRVRFJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaGlnaHNjb3Jlc0xhbWJkYSkpO1xuXG4gICAgLy8gL2hlcm8tdmlkZW9cbiAgICBjb25zdCBoZXJvVmlkZW9SZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2hlcm8tdmlkZW8nKTtcbiAgICBcbiAgICAvLyAvaGVyby12aWRlby9zZXR0aW5nc1xuICAgIGNvbnN0IGhlcm9TZXR0aW5nc1Jlc291cmNlID0gaGVyb1ZpZGVvUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3NldHRpbmdzJyk7XG4gICAgaGVyb1NldHRpbmdzUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihoZXJvVmlkZW9MYW1iZGEpKTtcbiAgICBoZXJvU2V0dGluZ3NSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihoZXJvVmlkZW9MYW1iZGEpKTtcbiAgICBoZXJvU2V0dGluZ3NSZXNvdXJjZS5hZGRNZXRob2QoJ1BVVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGhlcm9WaWRlb0xhbWJkYSkpO1xuICAgIFxuICAgIC8vIC9oZXJvLXZpZGVvL3VwbG9hZFxuICAgIGNvbnN0IGhlcm9VcGxvYWRSZXNvdXJjZSA9IGhlcm9WaWRlb1Jlc291cmNlLmFkZFJlc291cmNlKCd1cGxvYWQnKTtcbiAgICBoZXJvVXBsb2FkUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaGVyb1ZpZGVvTGFtYmRhKSk7XG4gICAgaGVyb1VwbG9hZFJlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaGVyb1ZpZGVvTGFtYmRhKSk7XG5cbiAgICAvLyAvb3BlbmFpLXByb3h5XG4gICAgY29uc3Qgb3BlbmFpUmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCdvcGVuYWktcHJveHknKTtcbiAgICBvcGVuYWlSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihvcGVuYWlQcm94eUxhbWJkYSkpO1xuXG4gICAgLy8gL3NvbmctZ2VuZXJhdG9yIChQZXJzb2VubGljaGtlaXRzLVNvbmctR2VuZXJhdG9yKVxuICAgIGNvbnN0IHNvbmdHZW5lcmF0b3JSZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ3NvbmctZ2VuZXJhdG9yJyk7XG4gICAgc29uZ0dlbmVyYXRvclJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHNvbmdHZW5lcmF0b3JMYW1iZGEpKTtcblxuICAgIC8vIC9qb2ItcGFyc2VyXG4gICAgY29uc3Qgam9iUGFyc2VyUmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCdqb2ItcGFyc2VyJyk7XG4gICAgam9iUGFyc2VyUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oam9iUGFyc2VyTGFtYmRhKSk7XG5cbiAgICAvLyAvY3YtZ2VuZXJhbFxuICAgIGNvbnN0IGN2R2VuZXJhbFJlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgnY3YtZ2VuZXJhbCcpO1xuICAgIGN2R2VuZXJhbFJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGN2R2VuZXJhbExhbWJkYSkpO1xuXG4gICAgLy8gL2N2LXRhcmdldFxuICAgIGNvbnN0IGN2VGFyZ2V0UmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCdjdi10YXJnZXQnKTtcbiAgICBjdlRhcmdldFJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGN2VGFyZ2V0TGFtYmRhKSk7XG5cbiAgICAvLyAvY3Ytam9iLXBhcnNlXG4gICAgY29uc3QgY3ZKb2JQYXJzZVJlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgnY3Ytam9iLXBhcnNlJyk7XG4gICAgY3ZKb2JQYXJzZVJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGN2Sm9iUGFyc2VMYW1iZGEpKTtcblxuICAgIC8vIC9jdi1maWxlcy1wYXJzZVxuICAgIGNvbnN0IGN2RmlsZXNQYXJzZVJlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgnY3YtZmlsZXMtcGFyc2UnKTtcbiAgICBjdkZpbGVzUGFyc2VSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihjdkZpbGVzUGFyc2VMYW1iZGEpKTtcblxuICAgIC8vIC9jdi1leHBvcnRcbiAgICBjb25zdCBjdkV4cG9ydFJlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgnY3YtZXhwb3J0Jyk7XG4gICAgY3ZFeHBvcnRSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihjdkV4cG9ydExhbWJkYSkpO1xuXG4gICAgLy8gL2FwaS1zZXR0aW5ncyAoYmVzdGVoZW5kZSBMYW1iZGEpXG4gICAgY29uc3QgYXBpU2V0dGluZ3NSZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2FwaS1zZXR0aW5ncycpO1xuICAgIFxuICAgIC8vIExhbWJkYSBJbnRlZ3JhdGlvbiBtaXQgQ09SUyBIZWFkZXJzXG4gICAgY29uc3QgYXBpU2V0dGluZ3NJbnRlZ3JhdGlvbiA9IG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGFwaVNldHRpbmdzTGFtYmRhLCB7XG4gICAgICBwcm94eTogdHJ1ZSxcbiAgICAgIGludGVncmF0aW9uUmVzcG9uc2VzOiBbe1xuICAgICAgICBzdGF0dXNDb2RlOiAnMjAwJyxcbiAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogXCInKidcIixcbiAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogXCInQ29udGVudC1UeXBlLEF1dGhvcml6YXRpb24sWC1BbXotRGF0ZSxYLUFwaS1LZXksWC1BbXotU2VjdXJpdHktVG9rZW4nXCIsXG4gICAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6IFwiJ0dFVCxQT1NULFBVVCxERUxFVEUsT1BUSU9OUydcIlxuICAgICAgICB9XG4gICAgICB9XVxuICAgIH0pO1xuICAgIFxuICAgIC8vIE1ldGhvZGVuIGV4cGxpeml0IGVyc3RlbGxlbiBtaXQgQ09SUyBIZWFkZXJzIChPUFRJT05TIHdpcmQgdm9uIExhbWJkYSBiZWhhbmRlbHQpXG4gICAgWydHRVQnLCAnUE9TVCcsICdQVVQnLCAnREVMRVRFJ10uZm9yRWFjaChtZXRob2QgPT4ge1xuICAgICAgYXBpU2V0dGluZ3NSZXNvdXJjZS5hZGRNZXRob2QobWV0aG9kLCBhcGlTZXR0aW5nc0ludGVncmF0aW9uLCB7XG4gICAgICAgIG1ldGhvZFJlc3BvbnNlczogW3tcbiAgICAgICAgICBzdGF0dXNDb2RlOiAnMjAwJyxcbiAgICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6IHRydWUsXG4gICAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogdHJ1ZSxcbiAgICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICB9XVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgXG4gICAgLy8gTk9URTogL2FwaS1zZXR0aW5ncz9hY3Rpb249a2V5JnByb3ZpZGVyPS4uLiB3aXJkIHByb2R1a3RpdiBnZW51dHp0LlxuICAgIC8vIEVpbiB6dXPDpHR6bGljaGVzIFN1Yi1SZXNvdXJjZSBgL2FwaS1zZXR0aW5ncy9rZXlgIGV4aXN0aWVydCBpbiBtYW5jaGVuIFVtZ2VidW5nZW4gYmVyZWl0cyAoT3V0LW9mLWJhbmQpLFxuICAgIC8vIHdhcyB6dSBDbG91ZEZvcm1hdGlvbi1Db25mbGljdHMgZsO8aHJlbiBrYW5uLiBEYWhlciBoaWVyIGJld3Vzc3QgTklDSFQgbWVociBhbmxlZ2VuLlxuXG4gICAgLy8gL2NvbnRhY3QtZW1haWwgKGJlc3RlaGVuZGUgTGFtYmRhKVxuICAgIGNvbnN0IGNvbnRhY3RSZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2NvbnRhY3QtZW1haWwnKTtcbiAgICBjb250YWN0UmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oY29udGFjdEVtYWlsTGFtYmRhKSk7XG5cbiAgICAvLyAvcHJvZmlsZS1pbWFnZSAoYmVzdGVoZW5kZSBMYW1iZGEpXG4gICAgY29uc3QgcHJvZmlsZUltYWdlUmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCdwcm9maWxlLWltYWdlJyk7XG4gICAgY29uc3QgdXBsb2FkVXJsUmVzb3VyY2UgPSBwcm9maWxlSW1hZ2VSZXNvdXJjZS5hZGRSZXNvdXJjZSgndXBsb2FkLXVybCcpO1xuICAgIHVwbG9hZFVybFJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHByb2ZpbGVJbWFnZUxhbWJkYSkpO1xuXG4gICAgLy8gL3BkZi1nZW5lcmF0b3IgKFB1cHBldGVlciBQREYtR2VuZXJpZXJ1bmcpXG4gICAgY29uc3QgcGRmR2VuZXJhdG9yUmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCdwZGYtZ2VuZXJhdG9yJyk7XG4gICAgLy8gQmVpIEFXU19QUk9YWSB3ZXJkZW4gSGVhZGVyIGF1dG9tYXRpc2NoIHZvbiBMYW1iZGEgcHJvcGFnaWVydFxuICAgIC8vIFdpciBtw7xzc2VuIHNpZSBudXIgaW4gZGVyIE1ldGhvZC1SZXNwb25zZSBkZWtsYXJpZXJlblxuICAgIHBkZkdlbmVyYXRvclJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHBkZkdlbmVyYXRvckxhbWJkYSksIHtcbiAgICAgIG1ldGhvZFJlc3BvbnNlczogW3tcbiAgICAgICAgc3RhdHVzQ29kZTogJzIwMCcsXG4gICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xuICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6IHRydWUsXG4gICAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6IHRydWUsXG4gICAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6IHRydWUsXG4gICAgICAgIH1cbiAgICAgIH1dXG4gICAgfSk7XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gSEVSTyBWSURFTyBST1VURVMgKFBoYXNlIDEgTWlncmF0aW9uKVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8vIC9oZXJvLXZpZGVvLXNldHRpbmdzXG4gICAgY29uc3QgaGVyb1ZpZGVvU2V0dGluZ3NSZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2hlcm8tdmlkZW8tc2V0dGluZ3MnKTtcbiAgICBoZXJvVmlkZW9TZXR0aW5nc1Jlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaGVyb1ZpZGVvU2V0dGluZ3NMYW1iZGEpKTtcbiAgICBoZXJvVmlkZW9TZXR0aW5nc1Jlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGhlcm9WaWRlb1NldHRpbmdzTGFtYmRhKSk7XG4gICAgaGVyb1ZpZGVvU2V0dGluZ3NSZXNvdXJjZS5hZGRNZXRob2QoJ1BVVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGhlcm9WaWRlb1NldHRpbmdzTGFtYmRhKSk7XG5cbiAgICAvLyAvaGVyby12aWRlby11cGxvYWRcbiAgICBjb25zdCBoZXJvVmlkZW9VcGxvYWRSZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2hlcm8tdmlkZW8tdXBsb2FkJyk7XG4gICAgaGVyb1ZpZGVvVXBsb2FkUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaGVyb1ZpZGVvVXBsb2FkTGFtYmRhKSk7XG4gICAgaGVyb1ZpZGVvVXBsb2FkUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihoZXJvVmlkZW9VcGxvYWRMYW1iZGEpKTtcblxuICAgIC8vIC9oZXJvLXZpZGVvLXVwbG9hZC1kaXJlY3RcbiAgICBjb25zdCBoZXJvVmlkZW9VcGxvYWREaXJlY3RSZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2hlcm8tdmlkZW8tdXBsb2FkLWRpcmVjdCcpO1xuICAgIGhlcm9WaWRlb1VwbG9hZERpcmVjdFJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGhlcm9WaWRlb1VwbG9hZERpcmVjdExhbWJkYSkpO1xuXG4gICAgLy8gL3RleHQtdG8tYnBtbiAoSFItQXV0b21hdGlvbi1Xb3JrZmxvdylcbiAgICBjb25zdCB0ZXh0VG9CcG1uUmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCd0ZXh0LXRvLWJwbW4nKTtcbiAgICB0ZXh0VG9CcG1uUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odGV4dFRvQnBtbkxhbWJkYSkpO1xuXG4gICAgLy8gL3RleHQtdG8tYnBtbi1ncHQgKEFkbWluOiBCUE1OLUdlbmVyaWVydW5nIG1pdCBHUFQtNS4yKVxuICAgIGNvbnN0IHRleHRUb0JwbW5HcHRSZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ3RleHQtdG8tYnBtbi1ncHQnKTtcbiAgICB0ZXh0VG9CcG1uR3B0UmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odGV4dFRvQnBtbkdwdDUyTGFtYmRhKSk7XG5cbiAgICAvLyBMYW1iZGEgRnVuY3Rpb24gVVJMIGbDvHIgdGV4dC10by1icG1uLWdwdDUyIChsw6RuZ2VyZXIgVGltZW91dCBhbHMgQVBJIEdhdGV3YXkgMjlzKVxuICAgIC8vIE51dHp0IExhbWJkYSBkaXJla3Qg4oaSIDEyMHMgVGltZW91dCBzdGF0dCAyOXMgYmVpIEFQSSBHYXRld2F5XG4gICAgY29uc3QgdGV4dFRvQnBtbkdwdDUyTGFtYmRhVXJsID0gdGV4dFRvQnBtbkdwdDUyTGFtYmRhLmFkZEZ1bmN0aW9uVXJsKHtcbiAgICAgIGF1dGhUeXBlOiBsYW1iZGEuRnVuY3Rpb25VcmxBdXRoVHlwZS5OT05FLFxuICAgICAgY29yczoge1xuICAgICAgICBhbGxvd2VkT3JpZ2luczogWycqJ10sXG4gICAgICAgIGFsbG93ZWRNZXRob2RzOiBbbGFtYmRhLkh0dHBNZXRob2QuUE9TVF0sXG4gICAgICAgIGFsbG93ZWRIZWFkZXJzOiBbJ0NvbnRlbnQtVHlwZScsICdBdXRob3JpemF0aW9uJ10sXG4gICAgICB9LFxuICAgIH0pO1xuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdUZXh0VG9CcG1uR3B0NTJGdW5jdGlvblVybCcsIHtcbiAgICAgIHZhbHVlOiB0ZXh0VG9CcG1uR3B0NTJMYW1iZGFVcmwudXJsLFxuICAgICAgZGVzY3JpcHRpb246ICdMYW1iZGEgRnVuY3Rpb24gVVJMIGbDvHIgQlBNTiAoQW5hbHlzZS9Uby1CZSkgLSBsw6RuZ2VyZXIgVGltZW91dCcsXG4gICAgICBleHBvcnROYW1lOiAnVGV4dFRvQnBtbkdwdDUyRnVuY3Rpb25VcmwnLFxuICAgIH0pO1xuXG4gICAgLy8gL2hyLWxlYWRzIChIUi1TZWxic3R0ZXN0IExlYWQtRXJmYXNzdW5nKVxuICAgIGNvbnN0IGhyTGVhZHNSZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2hyLWxlYWRzJyk7XG4gICAgY29uc3QgaHJMZWFkc1NhdmVSZXNvdXJjZSA9IGhyTGVhZHNSZXNvdXJjZS5hZGRSZXNvdXJjZSgnc2F2ZScpO1xuICAgIGhyTGVhZHNTYXZlUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaHJMZWFkc0xhbWJkYSkpO1xuICAgIGNvbnN0IGhyTGVhZHNMaXN0UmVzb3VyY2UgPSBockxlYWRzUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ2xpc3QnKTtcbiAgICBockxlYWRzTGlzdFJlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaHJMZWFkc0xhbWJkYSkpO1xuICAgIGNvbnN0IGhyTGVhZHNEZWxldGVSZXNvdXJjZSA9IGhyTGVhZHNSZXNvdXJjZS5hZGRSZXNvdXJjZSgnZGVsZXRlJyk7XG4gICAgaHJMZWFkc0RlbGV0ZVJlc291cmNlLmFkZE1ldGhvZCgnREVMRVRFJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaHJMZWFkc0xhbWJkYSkpO1xuICAgIGNvbnN0IGhyTGVhZHNDbGVhclJlc291cmNlID0gaHJMZWFkc1Jlc291cmNlLmFkZFJlc291cmNlKCdjbGVhcicpO1xuICAgIGhyTGVhZHNDbGVhclJlc291cmNlLmFkZE1ldGhvZCgnREVMRVRFJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaHJMZWFkc0xhbWJkYSkpO1xuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIEJFV0VSQlVOR1NQUk9GSUwgUk9VVEVTIChQaGFzZSAyIE1pZ3JhdGlvbilcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAvLyAvYmV3ZXJidW5nc3Byb2ZpbFxuICAgIGNvbnN0IGJld2VyYnVuZ3Nwcm9maWxSZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2Jld2VyYnVuZ3Nwcm9maWwnKTtcbiAgICBiZXdlcmJ1bmdzcHJvZmlsUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihiZXdlcmJ1bmdzcHJvZmlsTGFtYmRhKSk7XG4gICAgYmV3ZXJidW5nc3Byb2ZpbFJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGJld2VyYnVuZ3Nwcm9maWxMYW1iZGEpKTtcbiAgICBiZXdlcmJ1bmdzcHJvZmlsUmVzb3VyY2UuYWRkTWV0aG9kKCdQVVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihiZXdlcmJ1bmdzcHJvZmlsTGFtYmRhKSk7XG4gICAgYmV3ZXJidW5nc3Byb2ZpbFJlc291cmNlLmFkZE1ldGhvZCgnREVMRVRFJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oYmV3ZXJidW5nc3Byb2ZpbExhbWJkYSkpO1xuXG4gICAgLy8gL2Jld2VyYnVuZ3Nwcm9maWwvc2VjdGlvbi97bmFtZX1cbiAgICBjb25zdCBiZXdlcmJ1bmdzcHJvZmlsU2VjdGlvblJlc291cmNlID0gYmV3ZXJidW5nc3Byb2ZpbFJlc291cmNlLmFkZFJlc291cmNlKCdzZWN0aW9uJyk7XG4gICAgY29uc3QgYmV3ZXJidW5nc3Byb2ZpbFNlY3Rpb25OYW1lUmVzb3VyY2UgPSBiZXdlcmJ1bmdzcHJvZmlsU2VjdGlvblJlc291cmNlLmFkZFJlc291cmNlKCd7bmFtZX0nKTtcbiAgICBiZXdlcmJ1bmdzcHJvZmlsU2VjdGlvbk5hbWVSZXNvdXJjZS5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGJld2VyYnVuZ3Nwcm9maWxMYW1iZGEpKTtcbiAgICBiZXdlcmJ1bmdzcHJvZmlsU2VjdGlvbk5hbWVSZXNvdXJjZS5hZGRNZXRob2QoJ1BVVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGJld2VyYnVuZ3Nwcm9maWxMYW1iZGEpKTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBVU0VSIFBST0ZJTEUgQVBJIFJPVVRFUyAoUGhhc2UgMyBNaWdyYXRpb24pXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgLy8gL3VzZXItcHJvZmlsZS1hcGkgKFByb3h5IGbDvHIgYWxsZSBTdWItUm91dGVzKVxuICAgIGNvbnN0IHVzZXJQcm9maWxlQXBpUmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCd1c2VyLXByb2ZpbGUtYXBpJyk7XG4gICAgdXNlclByb2ZpbGVBcGlSZXNvdXJjZS5hZGRQcm94eSh7XG4gICAgICBhbnlNZXRob2Q6IHRydWUsXG4gICAgICBkZWZhdWx0SW50ZWdyYXRpb246IG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJQcm9maWxlQXBpTGFtYmRhKVxuICAgIH0pO1xuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIE9OQk9BUkRJTkcgUFJPR1JFU1MgKFZhbGtlZW4gT25ib2FyZGluZyBIdWIpXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgLy8gRHluYW1vREIgVGFiZWxsZSBmw7xyIE9uYm9hcmRpbmctRm9ydHNjaHJpdHRcbiAgICBjb25zdCBvbmJvYXJkaW5nUHJvZ3Jlc3NUYWJsZSA9IG5ldyBkeW5hbW9kYi5UYWJsZSh0aGlzLCAnT25ib2FyZGluZ1Byb2dyZXNzVGFibGUnLCB7XG4gICAgICB0YWJsZU5hbWU6ICdtYXdwcy1vbmJvYXJkaW5nLXByb2dyZXNzJyxcbiAgICAgIHBhcnRpdGlvbktleTogeyBuYW1lOiAndXNlcklkJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbiAgICAgIGJpbGxpbmdNb2RlOiBkeW5hbW9kYi5CaWxsaW5nTW9kZS5QQVlfUEVSX1JFUVVFU1QsXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5SRVRBSU4sXG4gICAgfSk7XG5cbiAgICAvLyBMYW1iZGEgZsO8ciBPbmJvYXJkaW5nLUZvcnRzY2hyaXR0XG4gICAgY29uc3Qgb25ib2FyZGluZ1Byb2dyZXNzTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnT25ib2FyZGluZ1Byb2dyZXNzRnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLW9uYm9hcmRpbmctcHJvZ3Jlc3MnLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS9vbmJvYXJkaW5nLXByb2dyZXNzJyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMTApLFxuICAgICAgbWVtb3J5U2l6ZTogMTI4LFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgT05CT0FSRElOR19UQUJMRTogb25ib2FyZGluZ1Byb2dyZXNzVGFibGUudGFibGVOYW1lXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBEeW5hbW9EQiBQZXJtaXNzaW9ucyBmw7xyIE9uYm9hcmRpbmcgTGFtYmRhXG4gICAgb25ib2FyZGluZ1Byb2dyZXNzVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKG9uYm9hcmRpbmdQcm9ncmVzc0xhbWJkYSk7XG5cbiAgICAvLyAvb25ib2FyZGluZy1wcm9ncmVzcyBSb3V0ZVxuICAgIGNvbnN0IG9uYm9hcmRpbmdQcm9ncmVzc1Jlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgnb25ib2FyZGluZy1wcm9ncmVzcycpO1xuICAgIG9uYm9hcmRpbmdQcm9ncmVzc1Jlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24ob25ib2FyZGluZ1Byb2dyZXNzTGFtYmRhKSk7XG4gICAgb25ib2FyZGluZ1Byb2dyZXNzUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24ob25ib2FyZGluZ1Byb2dyZXNzTGFtYmRhKSk7XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gVFJBSU5JTkcgQURNSU4gKFRlbXB1cyBUcmFpbmluZyBJbmhhbHRlIGJlYXJiZWl0ZW4pXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgY29uc3QgdHJhaW5pbmdBZG1pbkxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1RyYWluaW5nQWRtaW5GdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtdHJhaW5pbmctYWRtaW4tYXBpJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvdHJhaW5pbmctYWRtaW4tYXBpJyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgVFJBSU5JTkdfQlVDS0VUOiAnbWFudWVsLXdlaXNzLXdlYnNpdGUnLFxuICAgICAgICBUUkFJTklOR19KV1RfU0VDUkVUOiBwcm9jZXNzLmVudi5UUkFJTklOR19KV1RfU0VDUkVUIHx8ICdjaGFuZ2UtbWUtbG9jYWxseS1zZXQtaW4tY2RrLWRlcGxveScsXG4gICAgICAgIFRSQUlOSU5HX0FETUlOX1BBU1NXT1JEOiBwcm9jZXNzLmVudi5UUkFJTklOR19BRE1JTl9QQVNTV09SRCB8fCAnJ1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdHJhaW5pbmdBZG1pbkxhbWJkYS5hZGRUb1JvbGVQb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgYWN0aW9uczogWydzMzpHZXRPYmplY3QnLCAnczM6UHV0T2JqZWN0JywgJ3MzOkRlbGV0ZU9iamVjdCcsICdzMzpMaXN0QnVja2V0J10sXG4gICAgICByZXNvdXJjZXM6IFtcbiAgICAgICAgJ2Fybjphd3M6czM6OjptYW51ZWwtd2Vpc3Mtd2Vic2l0ZScsXG4gICAgICAgICdhcm46YXdzOnMzOjo6bWFudWVsLXdlaXNzLXdlYnNpdGUvdHJhaW5pbmctYWRtaW4vKidcbiAgICAgIF1cbiAgICB9KSk7XG5cbiAgICBjb25zdCB0cmFpbmluZ0FkbWluUmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCd0cmFpbmluZy1hZG1pbicpO1xuICAgIGNvbnN0IHRyYWluaW5nQWRtaW5JbnRlZ3JhdGlvbiA9IG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHRyYWluaW5nQWRtaW5MYW1iZGEpO1xuXG4gICAgLy8gTGVnYWN5LVJvdXRlbiBleHBsaXppdCAoZsO8ciBCYWNrd2FyZHMtQ29tcGF0KVxuICAgIGNvbnN0IHRyYWluaW5nQWRtaW5Db25maWdSZXNvdXJjZSA9IHRyYWluaW5nQWRtaW5SZXNvdXJjZS5hZGRSZXNvdXJjZSgnY29uZmlnJyk7XG4gICAgdHJhaW5pbmdBZG1pbkNvbmZpZ1Jlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgdHJhaW5pbmdBZG1pbkludGVncmF0aW9uKTtcbiAgICB0cmFpbmluZ0FkbWluQ29uZmlnUmVzb3VyY2UuYWRkTWV0aG9kKCdQVVQnLCB0cmFpbmluZ0FkbWluSW50ZWdyYXRpb24pO1xuICAgIGNvbnN0IHRyYWluaW5nQWRtaW5VcGxvYWRSZXNvdXJjZSA9IHRyYWluaW5nQWRtaW5SZXNvdXJjZS5hZGRSZXNvdXJjZSgndXBsb2FkLXVybCcpO1xuICAgIHRyYWluaW5nQWRtaW5VcGxvYWRSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCB0cmFpbmluZ0FkbWluSW50ZWdyYXRpb24pO1xuICAgIGNvbnN0IHRyYWluaW5nQWRtaW5TY3JlZW5zaG90c1Jlc291cmNlID0gdHJhaW5pbmdBZG1pblJlc291cmNlLmFkZFJlc291cmNlKCdzY3JlZW5zaG90cycpO1xuICAgIHRyYWluaW5nQWRtaW5TY3JlZW5zaG90c1Jlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgdHJhaW5pbmdBZG1pbkludGVncmF0aW9uKTtcblxuICAgIC8vIE5ldWUgTXVsdGktVGVuYW50LVJvdXRlbiB2aWEgR3JlZWR5IFByb3h5IHVudGVyIC90cmFpbmluZy1hZG1pbi9jdXN0b21lcnMve3Byb3h5K31cbiAgICAvLyAobWF0Y2h0IGN1c3RvbWVycy9pbmRleCwgY3VzdG9tZXJzLzxjaWQ+L2JyYW5kaW5nLCAuLi4vdG91cnMvLi4uLCAuLi4vc2xpZGVzLy4uLiwgLi4uL3Byb2dyZXNzLy4uLilcbiAgICBjb25zdCB0cmFpbmluZ0FkbWluQ3VzdG9tZXJzUmVzb3VyY2UgPSB0cmFpbmluZ0FkbWluUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ2N1c3RvbWVycycpO1xuICAgIHRyYWluaW5nQWRtaW5DdXN0b21lcnNSZXNvdXJjZS5hZGRNZXRob2QoJ0dFVCcsIHRyYWluaW5nQWRtaW5JbnRlZ3JhdGlvbik7XG4gICAgY29uc3QgdHJhaW5pbmdBZG1pbkN1c3RvbWVyc1Byb3h5ID0gdHJhaW5pbmdBZG1pbkN1c3RvbWVyc1Jlc291cmNlLmFkZFJlc291cmNlKCd7cHJveHkrfScpO1xuICAgIHRyYWluaW5nQWRtaW5DdXN0b21lcnNQcm94eS5hZGRNZXRob2QoJ0FOWScsIHRyYWluaW5nQWRtaW5JbnRlZ3JhdGlvbik7XG5cbiAgICAvLyBBdXRoLVJvdXRlbiAoTWFnaWMtTGluayArIERpcmVrdC1Ub2tlbilcbiAgICBjb25zdCBhdXRoUmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCdhdXRoJyk7XG4gICAgY29uc3QgYXV0aE1hZ2ljTGluayA9IGF1dGhSZXNvdXJjZS5hZGRSZXNvdXJjZSgnbWFnaWMtbGluaycpO1xuICAgIGF1dGhNYWdpY0xpbmsuYWRkTWV0aG9kKCdQT1NUJywgdHJhaW5pbmdBZG1pbkludGVncmF0aW9uKTtcbiAgICBjb25zdCBhdXRoVG9rZW4gPSBhdXRoUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3Rva2VuJyk7XG4gICAgYXV0aFRva2VuLmFkZE1ldGhvZCgnUE9TVCcsIHRyYWluaW5nQWRtaW5JbnRlZ3JhdGlvbik7XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gREVNTyBTQ1JJUFQgKFBNICsgUk0gQmVhcmJlaXR1bmdzc3RhbmQgaW4gUzMpXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgY29uc3QgZGVtb1NjcmlwdExhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0RlbW9TY3JpcHRGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtZGVtby1zY3JpcHQtYXBpJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvZGVtby1zY3JpcHQtYXBpJyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMTUpLFxuICAgICAgbWVtb3J5U2l6ZTogMTI4LFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgUzNfQlVDS0VUOiAnbWFudWVsLXdlaXNzLXdlYnNpdGUnLFxuICAgICAgICBFRElUX1BBU1NXT1JEOiAndGVtcHVzLWRlbW8tZWRpdC0yMDI0J1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgZGVtb1NjcmlwdExhbWJkYS5hZGRUb1JvbGVQb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgYWN0aW9uczogWydzMzpHZXRPYmplY3QnLCAnczM6UHV0T2JqZWN0J10sXG4gICAgICByZXNvdXJjZXM6IFtcbiAgICAgICAgJ2Fybjphd3M6czM6OjptYW51ZWwtd2Vpc3Mtd2Vic2l0ZS9kYXRhL3RlbXB1cy1kZW1vLXBtLXN0YXRlLmpzb24nLFxuICAgICAgICAnYXJuOmF3czpzMzo6Om1hbnVlbC13ZWlzcy13ZWJzaXRlL2RhdGEvdGVtcHVzLWRlbW8tcm0tc3RhdGUuanNvbicsXG4gICAgICAgICdhcm46YXdzOnMzOjo6bWFudWVsLXdlaXNzLXdlYnNpdGUvZGF0YS90ZW1wdXMtZGVtby1icGFmZy1zdGF0ZS5qc29uJ1xuICAgICAgXVxuICAgIH0pKTtcblxuICAgIGNvbnN0IGRlbW9TY3JpcHRJbnRlZ3JhdGlvbiA9IG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGRlbW9TY3JpcHRMYW1iZGEpO1xuICAgIGNvbnN0IGRlbW9TY3JpcHRSZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2RlbW8tc2NyaXB0Jyk7XG4gICAgZGVtb1NjcmlwdFJlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgIGRlbW9TY3JpcHRJbnRlZ3JhdGlvbik7XG4gICAgZGVtb1NjcmlwdFJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIGRlbW9TY3JpcHRJbnRlZ3JhdGlvbik7XG4gICAgY29uc3QgZGVtb1NjcmlwdFJtUmVzb3VyY2UgPSBkZW1vU2NyaXB0UmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3JtJyk7XG4gICAgZGVtb1NjcmlwdFJtUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCAgZGVtb1NjcmlwdEludGVncmF0aW9uKTtcbiAgICBkZW1vU2NyaXB0Um1SZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBkZW1vU2NyaXB0SW50ZWdyYXRpb24pO1xuICAgIGNvbnN0IGRlbW9TY3JpcHRCcGFmZ1Jlc291cmNlID0gZGVtb1NjcmlwdFJlc291cmNlLmFkZFJlc291cmNlKCdicGFmZycpO1xuICAgIGRlbW9TY3JpcHRCcGFmZ1Jlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgIGRlbW9TY3JpcHRJbnRlZ3JhdGlvbik7XG4gICAgZGVtb1NjcmlwdEJwYWZnUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgZGVtb1NjcmlwdEludGVncmF0aW9uKTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBURU1QVVMgTE9HSU4gTUFJTEVSXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIEzDpHVmdCBha3R1ZWxsIE9ITkUgTGFtYmRhOiBUZW1wbGF0ZXMgd2VyZGVuIGFscyBlaW56ZWxuZXIgU3RhdGVcbiAgICAvLyAoczM6Ly9tYW51ZWwtd2Vpc3Mtd2Vic2l0ZS9kYXRhL3RlbXB1cy1tYWlsZXItc3RhdGUuanNvbikgYWJnZWxlZ3QsXG4gICAgLy8gw7ZmZmVudGxpY2ggZ2VsZXNlbiB1bmQgcGVyIFByZXNpZ25lZCBQVVQtVVJMIGdlc2NocmllYmVuLlxuICAgIC8vIEdydW5kOiBgbGFtYmRhOkNyZWF0ZUZ1bmN0aW9uYCBpc3QgaW0gS29udG8gZ2VibG9ja3QgKHNpZWhlXG4gICAgLy8gZG9jcy9SRUNPVkVSWV9kZW1vLXNjcmlwdC1sYW1iZGEubWQpLiBTb2JhbGQgZGFzIHdpZWRlciBnZWh0LCBrYW5uXG4gICAgLy8gaGllciBhbmFsb2cgenVyIGRlbW8tc2NyaXB0LUxhbWJkYSBlaW5lIGVpZ2VuZSBSb3V0ZSBhbmdlbGVndCB3ZXJkZW4uXG4gICAgLy9cbiAgICAvLyBQcmVzaWduZWQtVVJMIGFsbGUgNyBUYWdlIHZpYSBgLi9yZWZyZXNoLW1haWxlci1zdGF0ZS11cmwuc2hgIG5ldVxuICAgIC8vIGVyemV1Z2VuLlxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIEZMQVNIQ0FSRFMgKEtJLUxlcm5rYXJ0ZW4gbWl0IExlaXRuZXItU3lzdGVtKVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8vIER5bmFtb0RCIFRhYmVsbGUgZsO8ciBGbGFzaGNhcmQtRGVja3NcbiAgICBjb25zdCBmbGFzaGNhcmREZWNrc1RhYmxlID0gbmV3IGR5bmFtb2RiLlRhYmxlKHRoaXMsICdGbGFzaGNhcmREZWNrc1RhYmxlJywge1xuICAgICAgdGFibGVOYW1lOiAnbWF3cHMtZmxhc2hjYXJkLWRlY2tzJyxcbiAgICAgIHBhcnRpdGlvbktleTogeyBuYW1lOiAndXNlcklkJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbiAgICAgIHNvcnRLZXk6IHsgbmFtZTogJ2RlY2tJZCcsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXG4gICAgICBiaWxsaW5nTW9kZTogZHluYW1vZGIuQmlsbGluZ01vZGUuUEFZX1BFUl9SRVFVRVNULFxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuUkVUQUlOLFxuICAgIH0pO1xuXG4gICAgLy8gRHluYW1vREIgVGFiZWxsZSBmw7xyIEZsYXNoY2FyZHNcbiAgICBjb25zdCBmbGFzaGNhcmRzVGFibGUgPSBuZXcgZHluYW1vZGIuVGFibGUodGhpcywgJ0ZsYXNoY2FyZHNUYWJsZScsIHtcbiAgICAgIHRhYmxlTmFtZTogJ21hd3BzLWZsYXNoY2FyZHMnLFxuICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICd1c2VySWQnLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxuICAgICAgc29ydEtleTogeyBuYW1lOiAnY2FyZElkJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbiAgICAgIGJpbGxpbmdNb2RlOiBkeW5hbW9kYi5CaWxsaW5nTW9kZS5QQVlfUEVSX1JFUVVFU1QsXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5SRVRBSU4sXG4gICAgfSk7XG5cbiAgICAvLyBMYW1iZGEgZsO8ciBGbGFzaGNhcmRzIEFQSVxuICAgIGNvbnN0IGZsYXNoY2FyZHNMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdGbGFzaGNhcmRzRnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLWZsYXNoY2FyZHMtYXBpJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvZmxhc2hjYXJkcy1hcGknKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygxMjApLFxuICAgICAgbWVtb3J5U2l6ZTogNTEyLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgREVDS1NfVEFCTEU6IGZsYXNoY2FyZERlY2tzVGFibGUudGFibGVOYW1lLFxuICAgICAgICBDQVJEU19UQUJMRTogZmxhc2hjYXJkc1RhYmxlLnRhYmxlTmFtZSxcbiAgICAgICAgQVBJX1NFVFRJTkdTX1RBQkxFOiAnbWF3cHMtYXBpLXNldHRpbmdzJ1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gRHluYW1vREIgUGVybWlzc2lvbnMgZsO8ciBGbGFzaGNhcmRzIExhbWJkYVxuICAgIGZsYXNoY2FyZERlY2tzVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKGZsYXNoY2FyZHNMYW1iZGEpO1xuICAgIGZsYXNoY2FyZHNUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEoZmxhc2hjYXJkc0xhbWJkYSk7XG5cbiAgICAvLyAvZmxhc2hjYXJkcyBSb3V0ZXNcbiAgICBjb25zdCBmbGFzaGNhcmRzUmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCdmbGFzaGNhcmRzJyk7XG4gICAgXG4gICAgLy8gL2ZsYXNoY2FyZHMvZGVja3NcbiAgICBjb25zdCBmbGFzaGNhcmRzRGVja3NSZXNvdXJjZSA9IGZsYXNoY2FyZHNSZXNvdXJjZS5hZGRSZXNvdXJjZSgnZGVja3MnKTtcbiAgICBmbGFzaGNhcmRzRGVja3NSZXNvdXJjZS5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGZsYXNoY2FyZHNMYW1iZGEpKTtcbiAgICBmbGFzaGNhcmRzRGVja3NSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihmbGFzaGNhcmRzTGFtYmRhKSk7XG4gICAgZmxhc2hjYXJkc0RlY2tzUmVzb3VyY2UuYWRkTWV0aG9kKCdERUxFVEUnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihmbGFzaGNhcmRzTGFtYmRhKSk7XG5cbiAgICAvLyAvZmxhc2hjYXJkcy9jYXJkc1xuICAgIGNvbnN0IGZsYXNoY2FyZHNDYXJkc1Jlc291cmNlID0gZmxhc2hjYXJkc1Jlc291cmNlLmFkZFJlc291cmNlKCdjYXJkcycpO1xuICAgIGZsYXNoY2FyZHNDYXJkc1Jlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oZmxhc2hjYXJkc0xhbWJkYSkpO1xuXG4gICAgLy8gL2ZsYXNoY2FyZHMvc3R1ZHlcbiAgICBjb25zdCBmbGFzaGNhcmRzU3R1ZHlSZXNvdXJjZSA9IGZsYXNoY2FyZHNSZXNvdXJjZS5hZGRSZXNvdXJjZSgnc3R1ZHknKTtcbiAgICBmbGFzaGNhcmRzU3R1ZHlSZXNvdXJjZS5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGZsYXNoY2FyZHNMYW1iZGEpKTtcblxuICAgIC8vIC9mbGFzaGNhcmRzL3Jldmlld1xuICAgIGNvbnN0IGZsYXNoY2FyZHNSZXZpZXdSZXNvdXJjZSA9IGZsYXNoY2FyZHNSZXNvdXJjZS5hZGRSZXNvdXJjZSgncmV2aWV3Jyk7XG4gICAgZmxhc2hjYXJkc1Jldmlld1Jlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGZsYXNoY2FyZHNMYW1iZGEpKTtcblxuICAgIC8vIC9mbGFzaGNhcmRzL3N0YXRzXG4gICAgY29uc3QgZmxhc2hjYXJkc1N0YXRzUmVzb3VyY2UgPSBmbGFzaGNhcmRzUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3N0YXRzJyk7XG4gICAgZmxhc2hjYXJkc1N0YXRzUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihmbGFzaGNhcmRzTGFtYmRhKSk7XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gU0lOR0lORyBUUkFJTkVSIChHZXNhbmdzdHJhaW5pbmcgQXBwKVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8vIFRhYmVsbGUgZXhpc3RpZXJ0IGluIEFXUyAodS4gYS4gbmFjaCBmZWhsZ2VzY2hsYWdlbmVtIFJvbGxiYWNrKTsgUmVmZXJlbnogc3RhdHQgQ3JlYXRlIHZlcm1laWRldCBSZXNvdXJjZUV4aXN0ZW5jZUNoZWNrLUtvbmZsaWt0XG4gICAgY29uc3Qgc2luZ2luZ1Byb2dyZXNzVGFibGUgPSBkeW5hbW9kYi5UYWJsZS5mcm9tVGFibGVOYW1lKFxuICAgICAgdGhpcyxcbiAgICAgICdTaW5naW5nUHJvZ3Jlc3NUYWJsZScsXG4gICAgICAnbWF3cHMtc2luZ2luZy1wcm9ncmVzcydcbiAgICApO1xuXG4gICAgY29uc3Qgc2luZ2luZ1RyYWluZXJMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdTaW5naW5nVHJhaW5lckZ1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnd2Vic2l0ZS1zaW5naW5nLXRyYWluZXItYXBpJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvc2luZ2luZy10cmFpbmVyLWFwaScpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDEwKSxcbiAgICAgIG1lbW9yeVNpemU6IDEyOCxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIFBST0dSRVNTX1RBQkxFOiBzaW5naW5nUHJvZ3Jlc3NUYWJsZS50YWJsZU5hbWVcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHNpbmdpbmdQcm9ncmVzc1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShzaW5naW5nVHJhaW5lckxhbWJkYSk7XG5cbiAgICBjb25zdCBzaW5naW5nVHJhaW5lclJlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgnc2luZ2luZy10cmFpbmVyJyk7XG4gICAgY29uc3Qgc2luZ2luZ1Byb2dyZXNzUmVzb3VyY2UgPSBzaW5naW5nVHJhaW5lclJlc291cmNlLmFkZFJlc291cmNlKCdwcm9ncmVzcycpO1xuICAgIHNpbmdpbmdQcm9ncmVzc1Jlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oc2luZ2luZ1RyYWluZXJMYW1iZGEpKTtcbiAgICBzaW5naW5nUHJvZ3Jlc3NSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihzaW5naW5nVHJhaW5lckxhbWJkYSkpO1xuXG4gICAgY29uc3Qgc2luZ2luZ0V4ZXJjaXNlc1Jlc291cmNlID0gc2luZ2luZ1RyYWluZXJSZXNvdXJjZS5hZGRSZXNvdXJjZSgnZXhlcmNpc2VzJyk7XG4gICAgc2luZ2luZ0V4ZXJjaXNlc1Jlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oc2luZ2luZ1RyYWluZXJMYW1iZGEpKTtcblxuICAgIGNvbnN0IHNpbmdpbmdDYWxpYnJhdGVSZXNvdXJjZSA9IHNpbmdpbmdUcmFpbmVyUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ2NhbGlicmF0ZScpO1xuICAgIHNpbmdpbmdDYWxpYnJhdGVSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihzaW5naW5nVHJhaW5lckxhbWJkYSkpO1xuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIEZPS1VTLVRBR0VCVUNIIChUYWdlc3ZlcnRyYWcgLyAyMC1NaW4tVHJhaW5pbmcsIENvZ25pdG8gSldUKVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8vIFRhYmVsbGUga2FubiBiZXJlaXRzIGluIEFXUyBleGlzdGllcmVuIChDcmVhdGUgdm9yIGZlaGxnZXNjaGxhZ2VuZW0gRGVwbG95KTsgUmVmZXJlbnogdmVybWVpZGV0IFJlc291cmNlRXhpc3RlbmNlQ2hlY2tcbiAgICBjb25zdCBmb2t1c1RhZ2VidWNoVGFibGUgPSBkeW5hbW9kYi5UYWJsZS5mcm9tVGFibGVOYW1lKFxuICAgICAgdGhpcyxcbiAgICAgICdGb2t1c1RhZ2VidWNoVGFibGUnLFxuICAgICAgJ21hd3BzLWZva3VzLXRhZ2VidWNoJ1xuICAgICk7XG5cbiAgICBjb25zdCBmb2t1c1RhZ2VidWNoTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnRm9rdXNUYWdlYnVjaEZ1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnd2Vic2l0ZS1mb2t1cy10YWdlYnVjaC1hcGknLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS9mb2t1cy10YWdlYnVjaC1hcGknKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygxNSksXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBGT0tVU19UQUJMRTogZm9rdXNUYWdlYnVjaFRhYmxlLnRhYmxlTmFtZVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgZm9rdXNUYWdlYnVjaFRhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShmb2t1c1RhZ2VidWNoTGFtYmRhKTtcblxuICAgIGNvbnN0IGZva3VzVGFnZWJ1Y2hSZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2Zva3VzLXRhZ2VidWNoJyk7XG4gICAgY29uc3QgZm9rdXNEYXlSZXNvdXJjZSA9IGZva3VzVGFnZWJ1Y2hSZXNvdXJjZS5hZGRSZXNvdXJjZSgnZGF5Jyk7XG4gICAgZm9rdXNEYXlSZXNvdXJjZS5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGZva3VzVGFnZWJ1Y2hMYW1iZGEpKTtcbiAgICBmb2t1c0RheVJlc291cmNlLmFkZE1ldGhvZCgnUFVUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oZm9rdXNUYWdlYnVjaExhbWJkYSkpO1xuICAgIGNvbnN0IGZva3VzV2Vla1Jlc291cmNlID0gZm9rdXNUYWdlYnVjaFJlc291cmNlLmFkZFJlc291cmNlKCd3ZWVrJyk7XG4gICAgZm9rdXNXZWVrUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihmb2t1c1RhZ2VidWNoTGFtYmRhKSk7XG4gICAgZm9rdXNXZWVrUmVzb3VyY2UuYWRkTWV0aG9kKCdQVVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihmb2t1c1RhZ2VidWNoTGFtYmRhKSk7XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gT1VUUFVUU1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICB0aGlzLmFwaVVybCA9IG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdXZWJzaXRlQXBpVXJsJywge1xuICAgICAgdmFsdWU6IHRoaXMuYXBpLnVybCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnV2Vic2l0ZSBBUEkgR2F0ZXdheSBVUkwnLFxuICAgICAgZXhwb3J0TmFtZTogJ1dlYnNpdGVBcGlVcmwnXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnV2Vic2l0ZUFwaUlkJywge1xuICAgICAgdmFsdWU6IHRoaXMuYXBpLnJlc3RBcGlJZCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnV2Vic2l0ZSBBUEkgR2F0ZXdheSBJRCdcbiAgICB9KTtcbiAgfVxufVxuIl19