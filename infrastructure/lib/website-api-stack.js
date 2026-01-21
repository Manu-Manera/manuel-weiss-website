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
 * Ersetzt alle Netlify Functions mit AWS Lambda + API Gateway
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
            timeout: cdk.Duration.seconds(60),
            memorySize: 2048,
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
        const pdfGeneratorIntegration = new apigateway.LambdaIntegration(pdfGeneratorLambda, {
            proxy: false,
            integrationResponses: [{
                    statusCode: '200',
                    responseParameters: {
                        'method.response.header.Access-Control-Allow-Origin': 'integration.response.header.Access-Control-Allow-Origin',
                        'method.response.header.Access-Control-Allow-Headers': 'integration.response.header.Access-Control-Allow-Headers',
                        'method.response.header.Access-Control-Allow-Methods': 'integration.response.header.Access-Control-Allow-Methods',
                    }
                }]
        });
        pdfGeneratorResource.addMethod('POST', pdfGeneratorIntegration, {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vic2l0ZS1hcGktc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ3ZWJzaXRlLWFwaS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFDbkMseURBQXlEO0FBQ3pELGlEQUFpRDtBQUNqRCwyQ0FBMkM7QUFDM0MscURBQXFEO0FBQ3JELHlDQUF5QztBQUd6Qzs7O0dBR0c7QUFDSCxNQUFhLGVBQWdCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFJNUMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QiwyQ0FBMkM7UUFDM0Msc0NBQXNDO1FBQ3RDLDJDQUEyQztRQUUzQyx5Q0FBeUM7UUFDekMsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO1FBQ2pHLE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1FBQ3RHLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztRQUNuRyxNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBRXRHLGtDQUFrQztRQUNsQyxNQUFNLGtCQUFrQixHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1FBQ3hHLE1BQU0sZUFBZSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFD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VUFBVSxFQUFFLEtBQUs7b0JBQ2pCLGtCQUFrQixFQUFFO3dCQUNsQixvREFBb0QsRUFBRSx5REFBeUQ7d0JBQy9HLHFEQUFxRCxFQUFFLDBEQUEwRDt3QkFDakgscURBQXFELEVBQUUsMERBQTBEO3FCQUNsSDtpQkFDRixDQUFDO1NBQ0gsQ0FBQyxDQUFDO1FBQ0gsb0JBQW9CLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSx1QkFBdUIsRUFBRTtZQUM5RCxlQUFlLEVBQUUsQ0FBQztvQkFDaEIsVUFBVSxFQUFFLEtBQUs7b0JBQ2pCLGtCQUFrQixFQUFFO3dCQUNsQixvREFBb0QsRUFBRSxJQUFJO3dCQUMxRCxxREFBcUQsRUFBRSxJQUFJO3dCQUMzRCxxREFBcUQsRUFBRSxJQUFJO3FCQUM1RDtpQkFDRixDQUFDO1NBQ0gsQ0FBQyxDQUFDO1FBRUgsMkNBQTJDO1FBQzNDLFVBQVU7UUFDViwyQ0FBMkM7UUFDM0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUNyRCxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHO1lBQ25CLFdBQVcsRUFBRSx5QkFBeUI7WUFDdEMsVUFBVSxFQUFFLGVBQWU7U0FDNUIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDdEMsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUztZQUN6QixXQUFXLEVBQUUsd0JBQXdCO1NBQ3RDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQTliRCwwQ0E4YkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheSc7XG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XG5pbXBvcnQgKiBhcyBpYW0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XG5pbXBvcnQgKiBhcyBkeW5hbW9kYiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZHluYW1vZGInO1xuaW1wb3J0ICogYXMgczMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuXG4vKipcbiAqIFdlYnNpdGUgQVBJIFN0YWNrXG4gKiBFcnNldHp0IGFsbGUgTmV0bGlmeSBGdW5jdGlvbnMgbWl0IEFXUyBMYW1iZGEgKyBBUEkgR2F0ZXdheVxuICovXG5leHBvcnQgY2xhc3MgV2Vic2l0ZUFwaVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgcHVibGljIHJlYWRvbmx5IGFwaTogYXBpZ2F0ZXdheS5SZXN0QXBpO1xuICBwdWJsaWMgcmVhZG9ubHkgYXBpVXJsOiBjZGsuQ2ZuT3V0cHV0O1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBCRVNURUhFTkRFIFJFU1NPVVJDRU4gUkVGRVJFTlpJRVJFTlxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBcbiAgICAvLyBEeW5hbW9EQiBUYWJlbGxlbiAoZXhpc3RpZXJlbiBiZXJlaXRzKVxuICAgIGNvbnN0IHVzZXJEYXRhVGFibGUgPSBkeW5hbW9kYi5UYWJsZS5mcm9tVGFibGVOYW1lKHRoaXMsICdVc2VyRGF0YVRhYmxlJywgJ21hd3BzLXVzZXItcHJvZmlsZXMnKTtcbiAgICBjb25zdCBoaWdoc2NvcmVzVGFibGUgPSBkeW5hbW9kYi5UYWJsZS5mcm9tVGFibGVOYW1lKHRoaXMsICdIaWdoc2NvcmVzVGFibGUnLCAnc25vd2ZsYWtlLWhpZ2hzY29yZXMnKTtcbiAgICBjb25zdCBzZXR0aW5nc1RhYmxlID0gZHluYW1vZGIuVGFibGUuZnJvbVRhYmxlTmFtZSh0aGlzLCAnU2V0dGluZ3NUYWJsZScsICdtYW51ZWwtd2Vpc3Mtc2V0dGluZ3MnKTtcbiAgICBjb25zdCBhcGlTZXR0aW5nc1RhYmxlID0gZHluYW1vZGIuVGFibGUuZnJvbVRhYmxlTmFtZSh0aGlzLCAnQXBpU2V0dGluZ3NUYWJsZScsICdtYXdwcy1hcGktc2V0dGluZ3MnKTtcbiAgICBcbiAgICAvLyBTMyBCdWNrZXRzIChleGlzdGllcmVuIGJlcmVpdHMpXG4gICAgY29uc3QgcHJvZmlsZUltYWdlQnVja2V0ID0gczMuQnVja2V0LmZyb21CdWNrZXROYW1lKHRoaXMsICdQcm9maWxlSW1hZ2VCdWNrZXQnLCAnbWF3cHMtcHJvZmlsZS1pbWFnZXMnKTtcbiAgICBjb25zdCBoZXJvVmlkZW9CdWNrZXQgPSBzMy5CdWNrZXQuZnJvbUJ1Y2tldE5hbWUodGhpcywgJ0hlcm9WaWRlb0J1Y2tldCcsICdtYW51ZWwtd2Vpc3MtaGVyby12aWRlb3MnKTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBJQU0gUk9MTEUgRsOcUiBMQU1CREFTXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIGNvbnN0IGxhbWJkYVJvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgJ1dlYnNpdGVMYW1iZGFSb2xlJywge1xuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoJ2xhbWJkYS5hbWF6b25hd3MuY29tJyksXG4gICAgICBtYW5hZ2VkUG9saWNpZXM6IFtcbiAgICAgICAgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKCdzZXJ2aWNlLXJvbGUvQVdTTGFtYmRhQmFzaWNFeGVjdXRpb25Sb2xlJylcbiAgICAgIF1cbiAgICB9KTtcblxuICAgIC8vIER5bmFtb0RCIFBlcm1pc3Npb25zXG4gICAgbGFtYmRhUm9sZS5hZGRUb1BvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICBhY3Rpb25zOiBbXG4gICAgICAgICdkeW5hbW9kYjpHZXRJdGVtJyxcbiAgICAgICAgJ2R5bmFtb2RiOlB1dEl0ZW0nLFxuICAgICAgICAnZHluYW1vZGI6VXBkYXRlSXRlbScsXG4gICAgICAgICdkeW5hbW9kYjpEZWxldGVJdGVtJyxcbiAgICAgICAgJ2R5bmFtb2RiOlF1ZXJ5JyxcbiAgICAgICAgJ2R5bmFtb2RiOlNjYW4nXG4gICAgICBdLFxuICAgICAgcmVzb3VyY2VzOiBbXG4gICAgICAgIHVzZXJEYXRhVGFibGUudGFibGVBcm4sXG4gICAgICAgIGhpZ2hzY29yZXNUYWJsZS50YWJsZUFybixcbiAgICAgICAgc2V0dGluZ3NUYWJsZS50YWJsZUFybixcbiAgICAgICAgYXBpU2V0dGluZ3NUYWJsZS50YWJsZUFybixcbiAgICAgICAgJ2Fybjphd3M6ZHluYW1vZGI6ZXUtY2VudHJhbC0xOio6dGFibGUvbWF3cHMtdXNlci1kYXRhJ1xuICAgICAgXVxuICAgIH0pKTtcblxuICAgIC8vIFMzIFBlcm1pc3Npb25zXG4gICAgbGFtYmRhUm9sZS5hZGRUb1BvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICBhY3Rpb25zOiBbXG4gICAgICAgICdzMzpHZXRPYmplY3QnLFxuICAgICAgICAnczM6UHV0T2JqZWN0JyxcbiAgICAgICAgJ3MzOkRlbGV0ZU9iamVjdCcsXG4gICAgICAgICdzMzpMaXN0QnVja2V0J1xuICAgICAgXSxcbiAgICAgIHJlc291cmNlczogW1xuICAgICAgICBwcm9maWxlSW1hZ2VCdWNrZXQuYnVja2V0QXJuLFxuICAgICAgICBgJHtwcm9maWxlSW1hZ2VCdWNrZXQuYnVja2V0QXJufS8qYCxcbiAgICAgICAgaGVyb1ZpZGVvQnVja2V0LmJ1Y2tldEFybixcbiAgICAgICAgYCR7aGVyb1ZpZGVvQnVja2V0LmJ1Y2tldEFybn0vKmBcbiAgICAgIF1cbiAgICB9KSk7XG5cbiAgICAvLyBTRVMgUGVybWlzc2lvbnMgKGbDvHIgS29udGFrdC1FLU1haWxzKVxuICAgIGxhbWJkYVJvbGUuYWRkVG9Qb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgYWN0aW9uczogWydzZXM6U2VuZEVtYWlsJywgJ3NlczpTZW5kUmF3RW1haWwnXSxcbiAgICAgIHJlc291cmNlczogWycqJ11cbiAgICB9KSk7XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gQVBJIEdBVEVXQVlcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgdGhpcy5hcGkgPSBuZXcgYXBpZ2F0ZXdheS5SZXN0QXBpKHRoaXMsICdXZWJzaXRlQVBJJywge1xuICAgICAgcmVzdEFwaU5hbWU6ICdNYW51ZWwgV2Vpc3MgV2Vic2l0ZSBBUEknLFxuICAgICAgZGVzY3JpcHRpb246ICdBUEkgZsO8ciBtYW51ZWwtd2Vpc3MuY2ggKGVyc2V0enQgTmV0bGlmeSBGdW5jdGlvbnMpJyxcbiAgICAgIGRlZmF1bHRDb3JzUHJlZmxpZ2h0T3B0aW9uczoge1xuICAgICAgICBhbGxvd09yaWdpbnM6IFtcbiAgICAgICAgICAnaHR0cHM6Ly9tYW51ZWwtd2Vpc3MuY2gnLFxuICAgICAgICAgICdodHRwczovL3d3dy5tYW51ZWwtd2Vpc3MuY2gnLFxuICAgICAgICAgICdodHRwczovL21hd3BzLm5ldGxpZnkuYXBwJyxcbiAgICAgICAgICAnaHR0cDovL2xvY2FsaG9zdDozMDAwJyxcbiAgICAgICAgICAnaHR0cDovL2xvY2FsaG9zdDo1NTAwJyxcbiAgICAgICAgICAnaHR0cDovLzEyNy4wLjAuMTo1NTAwJ1xuICAgICAgICBdLFxuICAgICAgICBhbGxvd01ldGhvZHM6IFsnR0VUJywgJ1BPU1QnLCAnUFVUJywgJ0RFTEVURScsICdPUFRJT05TJ10sXG4gICAgICAgIGFsbG93SGVhZGVyczogW1xuICAgICAgICAgICdDb250ZW50LVR5cGUnLFxuICAgICAgICAgICdBdXRob3JpemF0aW9uJyxcbiAgICAgICAgICAnWC1Vc2VyLUlkJyxcbiAgICAgICAgICAnWC1BbXotRGF0ZScsXG4gICAgICAgICAgJ1gtQXBpLUtleScsXG4gICAgICAgICAgJ1gtQW16LVNlY3VyaXR5LVRva2VuJ1xuICAgICAgICBdLFxuICAgICAgICBhbGxvd0NyZWRlbnRpYWxzOiB0cnVlXG4gICAgICB9LFxuICAgICAgZGVwbG95T3B0aW9uczoge1xuICAgICAgICBzdGFnZU5hbWU6ICd2MScsXG4gICAgICAgIHRocm90dGxpbmdSYXRlTGltaXQ6IDEwMCxcbiAgICAgICAgdGhyb3R0bGluZ0J1cnN0TGltaXQ6IDIwMFxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIExBTUJEQSBGVU5DVElPTlNcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAvLyBVc2VyIERhdGEgTGFtYmRhXG4gICAgY29uc3QgdXNlckRhdGFMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdVc2VyRGF0YUZ1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnd2Vic2l0ZS11c2VyLWRhdGEnLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS91c2VyLWRhdGEnKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBVU0VSX0RBVEFfVEFCTEU6ICdtYXdwcy11c2VyLXByb2ZpbGVzJ1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gU25vd2ZsYWtlIEhpZ2hzY29yZXMgTGFtYmRhXG4gICAgY29uc3QgaGlnaHNjb3Jlc0xhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0hpZ2hzY29yZXNGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtc25vd2ZsYWtlLWhpZ2hzY29yZXMnLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS9zbm93Zmxha2UtaGlnaHNjb3JlcycpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKSxcbiAgICAgIG1lbW9yeVNpemU6IDI1NixcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIEhJR0hTQ09SRVNfVEFCTEU6ICdzbm93Zmxha2UtaGlnaHNjb3JlcydcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIEhlcm8gVmlkZW8gTGFtYmRhXG4gICAgY29uc3QgaGVyb1ZpZGVvTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnSGVyb1ZpZGVvRnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLWhlcm8tdmlkZW8nLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS9oZXJvLXZpZGVvJyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgRFlOQU1PREJfU0VUVElOR1NfVEFCTEU6ICdtYW51ZWwtd2Vpc3Mtc2V0dGluZ3MnLFxuICAgICAgICBTM19IRVJPX1ZJREVPX0JVQ0tFVDogJ21hbnVlbC13ZWlzcy1oZXJvLXZpZGVvcydcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIE9wZW5BSSBQcm94eSBMYW1iZGFcbiAgICBjb25zdCBvcGVuYWlQcm94eUxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ09wZW5BSVByb3h5RnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLW9wZW5haS1wcm94eScsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL29wZW5haS1wcm94eScpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDYwKSxcbiAgICAgIG1lbW9yeVNpemU6IDI1NlxuICAgIH0pO1xuXG4gICAgLy8gSm9iIFBhcnNlciBMYW1iZGFcbiAgICBjb25zdCBqb2JQYXJzZXJMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdKb2JQYXJzZXJGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtam9iLXBhcnNlcicsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL2pvYi1wYXJzZXInKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXG4gICAgICBtZW1vcnlTaXplOiAyNTZcbiAgICB9KTtcblxuICAgIC8vIENWIEdlbmVyYWwgTGFtYmRhXG4gICAgY29uc3QgY3ZHZW5lcmFsTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQ1ZHZW5lcmFsRnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLWN2LWdlbmVyYWwnLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS9jdi1nZW5lcmFsJyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMTIwKSxcbiAgICAgIG1lbW9yeVNpemU6IDUxMlxuICAgIH0pO1xuXG4gICAgLy8gQ1YgVGFyZ2V0IExhbWJkYVxuICAgIGNvbnN0IGN2VGFyZ2V0TGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQ1ZUYXJnZXRGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtY3YtdGFyZ2V0JyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvY3YtdGFyZ2V0JyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMTIwKSxcbiAgICAgIG1lbW9yeVNpemU6IDUxMlxuICAgIH0pO1xuXG4gICAgLy8gQ1YgSm9iIFBhcnNlIExhbWJkYVxuICAgIGNvbnN0IGN2Sm9iUGFyc2VMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdDVkpvYlBhcnNlRnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLWN2LWpvYi1wYXJzZScsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL2N2LWpvYi1wYXJzZScpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDYwKSxcbiAgICAgIG1lbW9yeVNpemU6IDI1NlxuICAgIH0pO1xuXG4gICAgLy8gQ1YgRmlsZXMgUGFyc2UgTGFtYmRhXG4gICAgY29uc3QgY3ZGaWxlc1BhcnNlTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQ1ZGaWxlc1BhcnNlRnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLWN2LWZpbGVzLXBhcnNlJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvY3YtZmlsZXMtcGFyc2UnKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcyg2MCksXG4gICAgICBtZW1vcnlTaXplOiA1MTJcbiAgICB9KTtcblxuICAgIC8vIENWIEV4cG9ydCBMYW1iZGFcbiAgICBjb25zdCBjdkV4cG9ydExhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0NWRXhwb3J0RnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLWN2LWV4cG9ydCcsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL2N2LWV4cG9ydCcpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKSxcbiAgICAgIG1lbW9yeVNpemU6IDI1NlxuICAgIH0pO1xuXG4gICAgLy8gQVBJIFNldHRpbmdzIExhbWJkYSAodm9sbHN0w6RuZGlnIG1pdCBWZXJzY2hsw7xzc2VsdW5nKVxuICAgIGNvbnN0IGFwaVNldHRpbmdzTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQXBpU2V0dGluZ3NGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtYXBpLXNldHRpbmdzJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvYXBpLXNldHRpbmdzJyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgQVBJX1NFVFRJTkdTX1RBQkxFOiAnbWF3cHMtYXBpLXNldHRpbmdzJyxcbiAgICAgICAgRU5DUllQVElPTl9TRUNSRVQ6IHByb2Nlc3MuZW52LkVOQ1JZUFRJT05fU0VDUkVUIHx8ICdtYXdwcy1zZWN1cmUtYXBpLWtleS1lbmNyeXB0aW9uLTIwMjQnXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBDb250YWN0IEVtYWlsIExhbWJkYSAodm9sbHN0w6RuZGlnIG1pdCBTRVMpXG4gICAgY29uc3QgY29udGFjdEVtYWlsTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQ29udGFjdEVtYWlsRnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLWNvbnRhY3QtZW1haWwnLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS9jb250YWN0LWVtYWlsJyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgRlJPTV9FTUFJTDogJ25vcmVwbHlAbWFudWVsLXdlaXNzLmNoJyxcbiAgICAgICAgVE9fRU1BSUw6ICdrb250YWt0QG1hbnVlbC13ZWlzcy5jaCdcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFByb2ZpbGUgSW1hZ2UgVXBsb2FkIExhbWJkYSAodm9sbHN0w6RuZGlnIG1pdCBTMyBQcmVzaWduZWQgVVJMcylcbiAgICBjb25zdCBwcm9maWxlSW1hZ2VMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdQcm9maWxlSW1hZ2VGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtcHJvZmlsZS1pbWFnZS11cGxvYWQnLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS9wcm9maWxlLWltYWdlLXVwbG9hZCcpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKSxcbiAgICAgIG1lbW9yeVNpemU6IDI1NixcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIFMzX0JVQ0tFVDogJ21hd3BzLXByb2ZpbGUtaW1hZ2VzJ1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gUERGIEdlbmVyYXRvciBMYW1iZGEgKFB1cHBldGVlciBmw7xyIGtvbXBsZXhlIENTUy1GZWF0dXJlcylcbiAgICBjb25zdCBwZGZHZW5lcmF0b3JMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdQZGZHZW5lcmF0b3JGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtcGRmLWdlbmVyYXRvcicsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL3BkZi1nZW5lcmF0b3InKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcyg2MCksIC8vIEzDpG5nZXJlciBUaW1lb3V0IGbDvHIgUERGLUdlbmVyaWVydW5nXG4gICAgICBtZW1vcnlTaXplOiAyMDQ4LCAvLyBNZWhyIE1lbW9yeSBmw7xyIFB1cHBldGVlci9DaHJvbWVcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIE5PREVfRU5WOiAncHJvZHVjdGlvbidcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBBUEkgUk9VVEVTXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgLy8gL3VzZXItZGF0YVxuICAgIGNvbnN0IHVzZXJEYXRhUmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCd1c2VyLWRhdGEnKTtcbiAgICB1c2VyRGF0YVJlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICB1c2VyRGF0YVJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJEYXRhTGFtYmRhKSk7XG4gICAgdXNlckRhdGFSZXNvdXJjZS5hZGRNZXRob2QoJ1BVVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJEYXRhTGFtYmRhKSk7XG4gICAgdXNlckRhdGFSZXNvdXJjZS5hZGRNZXRob2QoJ0RFTEVURScsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJEYXRhTGFtYmRhKSk7XG4gICAgXG4gICAgLy8gL3VzZXItZGF0YS9wcm9maWxlXG4gICAgY29uc3QgcHJvZmlsZVJlc291cmNlID0gdXNlckRhdGFSZXNvdXJjZS5hZGRSZXNvdXJjZSgncHJvZmlsZScpO1xuICAgIHByb2ZpbGVSZXNvdXJjZS5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJEYXRhTGFtYmRhKSk7XG4gICAgcHJvZmlsZVJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJEYXRhTGFtYmRhKSk7XG4gICAgcHJvZmlsZVJlc291cmNlLmFkZE1ldGhvZCgnUFVUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBcbiAgICAvLyAvdXNlci1kYXRhL3Jlc3VtZXNcbiAgICBjb25zdCByZXN1bWVzUmVzb3VyY2UgPSB1c2VyRGF0YVJlc291cmNlLmFkZFJlc291cmNlKCdyZXN1bWVzJyk7XG4gICAgcmVzdW1lc1Jlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICByZXN1bWVzUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICByZXN1bWVzUmVzb3VyY2UuYWRkTWV0aG9kKCdERUxFVEUnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIFxuICAgIC8vIC91c2VyLWRhdGEvZG9jdW1lbnRzXG4gICAgY29uc3QgZG9jdW1lbnRzUmVzb3VyY2UgPSB1c2VyRGF0YVJlc291cmNlLmFkZFJlc291cmNlKCdkb2N1bWVudHMnKTtcbiAgICBkb2N1bWVudHNSZXNvdXJjZS5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJEYXRhTGFtYmRhKSk7XG4gICAgZG9jdW1lbnRzUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBkb2N1bWVudHNSZXNvdXJjZS5hZGRNZXRob2QoJ0RFTEVURScsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJEYXRhTGFtYmRhKSk7XG4gICAgXG4gICAgLy8gL3VzZXItZGF0YS9jb3Zlci1sZXR0ZXJzXG4gICAgY29uc3QgY292ZXJMZXR0ZXJzUmVzb3VyY2UgPSB1c2VyRGF0YVJlc291cmNlLmFkZFJlc291cmNlKCdjb3Zlci1sZXR0ZXJzJyk7XG4gICAgY292ZXJMZXR0ZXJzUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIGNvdmVyTGV0dGVyc1Jlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJEYXRhTGFtYmRhKSk7XG4gICAgY292ZXJMZXR0ZXJzUmVzb3VyY2UuYWRkTWV0aG9kKCdERUxFVEUnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIFxuICAgIC8vIC91c2VyLWRhdGEvYXBwbGljYXRpb25zXG4gICAgY29uc3QgYXBwbGljYXRpb25zUmVzb3VyY2UgPSB1c2VyRGF0YVJlc291cmNlLmFkZFJlc291cmNlKCdhcHBsaWNhdGlvbnMnKTtcbiAgICBhcHBsaWNhdGlvbnNSZXNvdXJjZS5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJEYXRhTGFtYmRhKSk7XG4gICAgYXBwbGljYXRpb25zUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBhcHBsaWNhdGlvbnNSZXNvdXJjZS5hZGRNZXRob2QoJ0RFTEVURScsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJEYXRhTGFtYmRhKSk7XG4gICAgXG4gICAgLy8gL3VzZXItZGF0YS9waG90b3NcbiAgICBjb25zdCBwaG90b3NSZXNvdXJjZSA9IHVzZXJEYXRhUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3Bob3RvcycpO1xuICAgIHBob3Rvc1Jlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBwaG90b3NSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIHBob3Rvc1Jlc291cmNlLmFkZE1ldGhvZCgnREVMRVRFJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBcbiAgICAvLyAvdXNlci1kYXRhL3dvcmtmbG93cy97cHJveHkrfVxuICAgIGNvbnN0IHdvcmtmbG93c1Jlc291cmNlID0gdXNlckRhdGFSZXNvdXJjZS5hZGRSZXNvdXJjZSgnd29ya2Zsb3dzJyk7XG4gICAgY29uc3Qgd29ya2Zsb3dQcm94eSA9IHdvcmtmbG93c1Jlc291cmNlLmFkZFByb3h5KHtcbiAgICAgIGFueU1ldGhvZDogdHJ1ZSxcbiAgICAgIGRlZmF1bHRJbnRlZ3JhdGlvbjogbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpXG4gICAgfSk7XG5cbiAgICAvLyAvc25vd2ZsYWtlLWhpZ2hzY29yZXNcbiAgICBjb25zdCBoaWdoc2NvcmVzUmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCdzbm93Zmxha2UtaGlnaHNjb3JlcycpO1xuICAgIGhpZ2hzY29yZXNSZXNvdXJjZS5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGhpZ2hzY29yZXNMYW1iZGEpKTtcbiAgICBoaWdoc2NvcmVzUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaGlnaHNjb3Jlc0xhbWJkYSkpO1xuICAgIGhpZ2hzY29yZXNSZXNvdXJjZS5hZGRNZXRob2QoJ0RFTEVURScsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGhpZ2hzY29yZXNMYW1iZGEpKTtcblxuICAgIC8vIC9oZXJvLXZpZGVvXG4gICAgY29uc3QgaGVyb1ZpZGVvUmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCdoZXJvLXZpZGVvJyk7XG4gICAgXG4gICAgLy8gL2hlcm8tdmlkZW8vc2V0dGluZ3NcbiAgICBjb25zdCBoZXJvU2V0dGluZ3NSZXNvdXJjZSA9IGhlcm9WaWRlb1Jlc291cmNlLmFkZFJlc291cmNlKCdzZXR0aW5ncycpO1xuICAgIGhlcm9TZXR0aW5nc1Jlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaGVyb1ZpZGVvTGFtYmRhKSk7XG4gICAgaGVyb1NldHRpbmdzUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaGVyb1ZpZGVvTGFtYmRhKSk7XG4gICAgaGVyb1NldHRpbmdzUmVzb3VyY2UuYWRkTWV0aG9kKCdQVVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihoZXJvVmlkZW9MYW1iZGEpKTtcbiAgICBcbiAgICAvLyAvaGVyby12aWRlby91cGxvYWRcbiAgICBjb25zdCBoZXJvVXBsb2FkUmVzb3VyY2UgPSBoZXJvVmlkZW9SZXNvdXJjZS5hZGRSZXNvdXJjZSgndXBsb2FkJyk7XG4gICAgaGVyb1VwbG9hZFJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGhlcm9WaWRlb0xhbWJkYSkpO1xuICAgIGhlcm9VcGxvYWRSZXNvdXJjZS5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGhlcm9WaWRlb0xhbWJkYSkpO1xuXG4gICAgLy8gL29wZW5haS1wcm94eVxuICAgIGNvbnN0IG9wZW5haVJlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgnb3BlbmFpLXByb3h5Jyk7XG4gICAgb3BlbmFpUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24ob3BlbmFpUHJveHlMYW1iZGEpKTtcblxuICAgIC8vIC9qb2ItcGFyc2VyXG4gICAgY29uc3Qgam9iUGFyc2VyUmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCdqb2ItcGFyc2VyJyk7XG4gICAgam9iUGFyc2VyUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oam9iUGFyc2VyTGFtYmRhKSk7XG5cbiAgICAvLyAvY3YtZ2VuZXJhbFxuICAgIGNvbnN0IGN2R2VuZXJhbFJlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgnY3YtZ2VuZXJhbCcpO1xuICAgIGN2R2VuZXJhbFJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGN2R2VuZXJhbExhbWJkYSkpO1xuXG4gICAgLy8gL2N2LXRhcmdldFxuICAgIGNvbnN0IGN2VGFyZ2V0UmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCdjdi10YXJnZXQnKTtcbiAgICBjdlRhcmdldFJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGN2VGFyZ2V0TGFtYmRhKSk7XG5cbiAgICAvLyAvY3Ytam9iLXBhcnNlXG4gICAgY29uc3QgY3ZKb2JQYXJzZVJlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgnY3Ytam9iLXBhcnNlJyk7XG4gICAgY3ZKb2JQYXJzZVJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGN2Sm9iUGFyc2VMYW1iZGEpKTtcblxuICAgIC8vIC9jdi1maWxlcy1wYXJzZVxuICAgIGNvbnN0IGN2RmlsZXNQYXJzZVJlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgnY3YtZmlsZXMtcGFyc2UnKTtcbiAgICBjdkZpbGVzUGFyc2VSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihjdkZpbGVzUGFyc2VMYW1iZGEpKTtcblxuICAgIC8vIC9jdi1leHBvcnRcbiAgICBjb25zdCBjdkV4cG9ydFJlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgnY3YtZXhwb3J0Jyk7XG4gICAgY3ZFeHBvcnRSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihjdkV4cG9ydExhbWJkYSkpO1xuXG4gICAgLy8gL2FwaS1zZXR0aW5ncyAoYmVzdGVoZW5kZSBMYW1iZGEpXG4gICAgY29uc3QgYXBpU2V0dGluZ3NSZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2FwaS1zZXR0aW5ncycpO1xuICAgIGFwaVNldHRpbmdzUmVzb3VyY2UuYWRkUHJveHkoe1xuICAgICAgYW55TWV0aG9kOiB0cnVlLFxuICAgICAgZGVmYXVsdEludGVncmF0aW9uOiBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihhcGlTZXR0aW5nc0xhbWJkYSlcbiAgICB9KTtcblxuICAgIC8vIC9jb250YWN0LWVtYWlsIChiZXN0ZWhlbmRlIExhbWJkYSlcbiAgICBjb25zdCBjb250YWN0UmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCdjb250YWN0LWVtYWlsJyk7XG4gICAgY29udGFjdFJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGNvbnRhY3RFbWFpbExhbWJkYSkpO1xuXG4gICAgLy8gL3Byb2ZpbGUtaW1hZ2UgKGJlc3RlaGVuZGUgTGFtYmRhKVxuICAgIGNvbnN0IHByb2ZpbGVJbWFnZVJlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgncHJvZmlsZS1pbWFnZScpO1xuICAgIGNvbnN0IHVwbG9hZFVybFJlc291cmNlID0gcHJvZmlsZUltYWdlUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3VwbG9hZC11cmwnKTtcbiAgICB1cGxvYWRVcmxSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihwcm9maWxlSW1hZ2VMYW1iZGEpKTtcblxuICAgIC8vIC9wZGYtZ2VuZXJhdG9yIChQdXBwZXRlZXIgUERGLUdlbmVyaWVydW5nKVxuICAgIGNvbnN0IHBkZkdlbmVyYXRvclJlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgncGRmLWdlbmVyYXRvcicpO1xuICAgIGNvbnN0IHBkZkdlbmVyYXRvckludGVncmF0aW9uID0gbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24ocGRmR2VuZXJhdG9yTGFtYmRhLCB7XG4gICAgICBwcm94eTogZmFsc2UsXG4gICAgICBpbnRlZ3JhdGlvblJlc3BvbnNlczogW3tcbiAgICAgICAgc3RhdHVzQ29kZTogJzIwMCcsXG4gICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xuICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICdpbnRlZ3JhdGlvbi5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJyxcbiAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogJ2ludGVncmF0aW9uLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJyxcbiAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ2ludGVncmF0aW9uLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJyxcbiAgICAgICAgfVxuICAgICAgfV1cbiAgICB9KTtcbiAgICBwZGZHZW5lcmF0b3JSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBwZGZHZW5lcmF0b3JJbnRlZ3JhdGlvbiwge1xuICAgICAgbWV0aG9kUmVzcG9uc2VzOiBbe1xuICAgICAgICBzdGF0dXNDb2RlOiAnMjAwJyxcbiAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogdHJ1ZSxcbiAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogdHJ1ZSxcbiAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogdHJ1ZSxcbiAgICAgICAgfVxuICAgICAgfV1cbiAgICB9KTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBPVVRQVVRTXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIHRoaXMuYXBpVXJsID0gbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1dlYnNpdGVBcGlVcmwnLCB7XG4gICAgICB2YWx1ZTogdGhpcy5hcGkudXJsLFxuICAgICAgZGVzY3JpcHRpb246ICdXZWJzaXRlIEFQSSBHYXRld2F5IFVSTCcsXG4gICAgICBleHBvcnROYW1lOiAnV2Vic2l0ZUFwaVVybCdcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdXZWJzaXRlQXBpSWQnLCB7XG4gICAgICB2YWx1ZTogdGhpcy5hcGkucmVzdEFwaUlkLFxuICAgICAgZGVzY3JpcHRpb246ICdXZWJzaXRlIEFQSSBHYXRld2F5IElEJ1xuICAgIH0pO1xuICB9XG59XG4iXX0=