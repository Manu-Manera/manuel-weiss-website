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
            integrationResponses: [{
                    statusCode: '200',
                    responseParameters: {
                        'method.response.header.Access-Control-Allow-Origin': "'*'",
                        'method.response.header.Access-Control-Allow-Headers': "'Content-Type,Authorization,X-User-Id'",
                        'method.response.header.Access-Control-Allow-Methods': "'GET,POST,OPTIONS'",
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vic2l0ZS1hcGktc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ3ZWJzaXRlLWFwaS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFDbkMseURBQXlEO0FBQ3pELGlEQUFpRDtBQUNqRCwyQ0FBMkM7QUFDM0MscURBQXFEO0FBQ3JELHlDQUF5QztBQUd6Qzs7O0dBR0c7QUFDSCxNQUFhLGVBQWdCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFJNUMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QiwyQ0FBMkM7UUFDM0Msc0NBQXNDO1FBQ3RDLDJDQUEyQztRQUUzQyx5Q0FBeUM7UUFDekMsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO1FBQ2pHLE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1FBQ3RHLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztRQUNuRyxNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBRXRHLGtDQUFrQztRQUNsQyxNQUFNLGtCQUFrQixHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1FBQ3hHLE1BQU0sZUFBZSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFD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QixrQkFBa0IsRUFBRTt3QkFDbEIsb0RBQW9ELEVBQUUsS0FBSzt3QkFDM0QscURBQXFELEVBQUUsd0NBQXdDO3dCQUMvRixxREFBcUQsRUFBRSxvQkFBb0I7cUJBQzVFO2lCQUNGLENBQUM7U0FDSCxDQUFDLENBQUM7UUFDSCxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLHVCQUF1QixFQUFFO1lBQzlELGVBQWUsRUFBRSxDQUFDO29CQUNoQixVQUFVLEVBQUUsS0FBSztvQkFDakIsa0JBQWtCLEVBQUU7d0JBQ2xCLG9EQUFvRCxFQUFFLElBQUk7d0JBQzFELHFEQUFxRCxFQUFFLElBQUk7d0JBQzNELHFEQUFxRCxFQUFFLElBQUk7cUJBQzVEO2lCQUNGLENBQUM7U0FDSCxDQUFDLENBQUM7UUFFSCwyQ0FBMkM7UUFDM0MsVUFBVTtRQUNWLDJDQUEyQztRQUMzQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO1lBQ3JELEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUc7WUFDbkIsV0FBVyxFQUFFLHlCQUF5QjtZQUN0QyxVQUFVLEVBQUUsZUFBZTtTQUM1QixDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtZQUN0QyxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTO1lBQ3pCLFdBQVcsRUFBRSx3QkFBd0I7U0FDdEMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBN2JELDBDQTZiQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBhcGlnYXRld2F5IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5JztcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCAqIGFzIGR5bmFtb2RiIGZyb20gJ2F3cy1jZGstbGliL2F3cy1keW5hbW9kYic7XG5pbXBvcnQgKiBhcyBzMyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtczMnO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5cbi8qKlxuICogV2Vic2l0ZSBBUEkgU3RhY2tcbiAqIEVyc2V0enQgYWxsZSBOZXRsaWZ5IEZ1bmN0aW9ucyBtaXQgQVdTIExhbWJkYSArIEFQSSBHYXRld2F5XG4gKi9cbmV4cG9ydCBjbGFzcyBXZWJzaXRlQXBpU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBwdWJsaWMgcmVhZG9ubHkgYXBpOiBhcGlnYXRld2F5LlJlc3RBcGk7XG4gIHB1YmxpYyByZWFkb25seSBhcGlVcmw6IGNkay5DZm5PdXRwdXQ7XG5cbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIEJFU1RFSEVOREUgUkVTU09VUkNFTiBSRUZFUkVOWklFUkVOXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIFxuICAgIC8vIER5bmFtb0RCIFRhYmVsbGVuIChleGlzdGllcmVuIGJlcmVpdHMpXG4gICAgY29uc3QgdXNlckRhdGFUYWJsZSA9IGR5bmFtb2RiLlRhYmxlLmZyb21UYWJsZU5hbWUodGhpcywgJ1VzZXJEYXRhVGFibGUnLCAnbWF3cHMtdXNlci1wcm9maWxlcycpO1xuICAgIGNvbnN0IGhpZ2hzY29yZXNUYWJsZSA9IGR5bmFtb2RiLlRhYmxlLmZyb21UYWJsZU5hbWUodGhpcywgJ0hpZ2hzY29yZXNUYWJsZScsICdzbm93Zmxha2UtaGlnaHNjb3JlcycpO1xuICAgIGNvbnN0IHNldHRpbmdzVGFibGUgPSBkeW5hbW9kYi5UYWJsZS5mcm9tVGFibGVOYW1lKHRoaXMsICdTZXR0aW5nc1RhYmxlJywgJ21hbnVlbC13ZWlzcy1zZXR0aW5ncycpO1xuICAgIGNvbnN0IGFwaVNldHRpbmdzVGFibGUgPSBkeW5hbW9kYi5UYWJsZS5mcm9tVGFibGVOYW1lKHRoaXMsICdBcGlTZXR0aW5nc1RhYmxlJywgJ21hd3BzLWFwaS1zZXR0aW5ncycpO1xuICAgIFxuICAgIC8vIFMzIEJ1Y2tldHMgKGV4aXN0aWVyZW4gYmVyZWl0cylcbiAgICBjb25zdCBwcm9maWxlSW1hZ2VCdWNrZXQgPSBzMy5CdWNrZXQuZnJvbUJ1Y2tldE5hbWUodGhpcywgJ1Byb2ZpbGVJbWFnZUJ1Y2tldCcsICdtYXdwcy1wcm9maWxlLWltYWdlcycpO1xuICAgIGNvbnN0IGhlcm9WaWRlb0J1Y2tldCA9IHMzLkJ1Y2tldC5mcm9tQnVja2V0TmFtZSh0aGlzLCAnSGVyb1ZpZGVvQnVja2V0JywgJ21hbnVlbC13ZWlzcy1oZXJvLXZpZGVvcycpO1xuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIElBTSBST0xMRSBGw5xSIExBTUJEQVNcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgY29uc3QgbGFtYmRhUm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCAnV2Vic2l0ZUxhbWJkYVJvbGUnLCB7XG4gICAgICBhc3N1bWVkQnk6IG5ldyBpYW0uU2VydmljZVByaW5jaXBhbCgnbGFtYmRhLmFtYXpvbmF3cy5jb20nKSxcbiAgICAgIG1hbmFnZWRQb2xpY2llczogW1xuICAgICAgICBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ3NlcnZpY2Utcm9sZS9BV1NMYW1iZGFCYXNpY0V4ZWN1dGlvblJvbGUnKVxuICAgICAgXVxuICAgIH0pO1xuXG4gICAgLy8gRHluYW1vREIgUGVybWlzc2lvbnNcbiAgICBsYW1iZGFSb2xlLmFkZFRvUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcbiAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgJ2R5bmFtb2RiOkdldEl0ZW0nLFxuICAgICAgICAnZHluYW1vZGI6UHV0SXRlbScsXG4gICAgICAgICdkeW5hbW9kYjpVcGRhdGVJdGVtJyxcbiAgICAgICAgJ2R5bmFtb2RiOkRlbGV0ZUl0ZW0nLFxuICAgICAgICAnZHluYW1vZGI6UXVlcnknLFxuICAgICAgICAnZHluYW1vZGI6U2NhbidcbiAgICAgIF0sXG4gICAgICByZXNvdXJjZXM6IFtcbiAgICAgICAgdXNlckRhdGFUYWJsZS50YWJsZUFybixcbiAgICAgICAgaGlnaHNjb3Jlc1RhYmxlLnRhYmxlQXJuLFxuICAgICAgICBzZXR0aW5nc1RhYmxlLnRhYmxlQXJuLFxuICAgICAgICBhcGlTZXR0aW5nc1RhYmxlLnRhYmxlQXJuLFxuICAgICAgICAnYXJuOmF3czpkeW5hbW9kYjpldS1jZW50cmFsLTE6Kjp0YWJsZS9tYXdwcy11c2VyLWRhdGEnXG4gICAgICBdXG4gICAgfSkpO1xuXG4gICAgLy8gUzMgUGVybWlzc2lvbnNcbiAgICBsYW1iZGFSb2xlLmFkZFRvUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcbiAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgJ3MzOkdldE9iamVjdCcsXG4gICAgICAgICdzMzpQdXRPYmplY3QnLFxuICAgICAgICAnczM6RGVsZXRlT2JqZWN0JyxcbiAgICAgICAgJ3MzOkxpc3RCdWNrZXQnXG4gICAgICBdLFxuICAgICAgcmVzb3VyY2VzOiBbXG4gICAgICAgIHByb2ZpbGVJbWFnZUJ1Y2tldC5idWNrZXRBcm4sXG4gICAgICAgIGAke3Byb2ZpbGVJbWFnZUJ1Y2tldC5idWNrZXRBcm59LypgLFxuICAgICAgICBoZXJvVmlkZW9CdWNrZXQuYnVja2V0QXJuLFxuICAgICAgICBgJHtoZXJvVmlkZW9CdWNrZXQuYnVja2V0QXJufS8qYFxuICAgICAgXVxuICAgIH0pKTtcblxuICAgIC8vIFNFUyBQZXJtaXNzaW9ucyAoZsO8ciBLb250YWt0LUUtTWFpbHMpXG4gICAgbGFtYmRhUm9sZS5hZGRUb1BvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICBhY3Rpb25zOiBbJ3NlczpTZW5kRW1haWwnLCAnc2VzOlNlbmRSYXdFbWFpbCddLFxuICAgICAgcmVzb3VyY2VzOiBbJyonXVxuICAgIH0pKTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBBUEkgR0FURVdBWVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICB0aGlzLmFwaSA9IG5ldyBhcGlnYXRld2F5LlJlc3RBcGkodGhpcywgJ1dlYnNpdGVBUEknLCB7XG4gICAgICByZXN0QXBpTmFtZTogJ01hbnVlbCBXZWlzcyBXZWJzaXRlIEFQSScsXG4gICAgICBkZXNjcmlwdGlvbjogJ0FQSSBmw7xyIG1hbnVlbC13ZWlzcy5jaCAoZXJzZXR6dCBOZXRsaWZ5IEZ1bmN0aW9ucyknLFxuICAgICAgZGVmYXVsdENvcnNQcmVmbGlnaHRPcHRpb25zOiB7XG4gICAgICAgIGFsbG93T3JpZ2luczogW1xuICAgICAgICAgICdodHRwczovL21hbnVlbC13ZWlzcy5jaCcsXG4gICAgICAgICAgJ2h0dHBzOi8vd3d3Lm1hbnVlbC13ZWlzcy5jaCcsXG4gICAgICAgICAgJ2h0dHBzOi8vbWF3cHMubmV0bGlmeS5hcHAnLFxuICAgICAgICAgICdodHRwOi8vbG9jYWxob3N0OjMwMDAnLFxuICAgICAgICAgICdodHRwOi8vbG9jYWxob3N0OjU1MDAnLFxuICAgICAgICAgICdodHRwOi8vMTI3LjAuMC4xOjU1MDAnXG4gICAgICAgIF0sXG4gICAgICAgIGFsbG93TWV0aG9kczogWydHRVQnLCAnUE9TVCcsICdQVVQnLCAnREVMRVRFJywgJ09QVElPTlMnXSxcbiAgICAgICAgYWxsb3dIZWFkZXJzOiBbXG4gICAgICAgICAgJ0NvbnRlbnQtVHlwZScsXG4gICAgICAgICAgJ0F1dGhvcml6YXRpb24nLFxuICAgICAgICAgICdYLVVzZXItSWQnLFxuICAgICAgICAgICdYLUFtei1EYXRlJyxcbiAgICAgICAgICAnWC1BcGktS2V5JyxcbiAgICAgICAgICAnWC1BbXotU2VjdXJpdHktVG9rZW4nXG4gICAgICAgIF0sXG4gICAgICAgIGFsbG93Q3JlZGVudGlhbHM6IHRydWVcbiAgICAgIH0sXG4gICAgICBkZXBsb3lPcHRpb25zOiB7XG4gICAgICAgIHN0YWdlTmFtZTogJ3YxJyxcbiAgICAgICAgdGhyb3R0bGluZ1JhdGVMaW1pdDogMTAwLFxuICAgICAgICB0aHJvdHRsaW5nQnVyc3RMaW1pdDogMjAwXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gTEFNQkRBIEZVTkNUSU9OU1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8vIFVzZXIgRGF0YSBMYW1iZGFcbiAgICBjb25zdCB1c2VyRGF0YUxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1VzZXJEYXRhRnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICd3ZWJzaXRlLXVzZXItZGF0YScsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL3VzZXItZGF0YScpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKSxcbiAgICAgIG1lbW9yeVNpemU6IDI1NixcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIFVTRVJfREFUQV9UQUJMRTogJ21hd3BzLXVzZXItcHJvZmlsZXMnXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBTbm93Zmxha2UgSGlnaHNjb3JlcyBMYW1iZGFcbiAgICBjb25zdCBoaWdoc2NvcmVzTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnSGlnaHNjb3Jlc0Z1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnd2Vic2l0ZS1zbm93Zmxha2UtaGlnaHNjb3JlcycsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL3Nub3dmbGFrZS1oaWdoc2NvcmVzJyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgSElHSFNDT1JFU19UQUJMRTogJ3Nub3dmbGFrZS1oaWdoc2NvcmVzJ1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gSGVybyBWaWRlbyBMYW1iZGFcbiAgICBjb25zdCBoZXJvVmlkZW9MYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdIZXJvVmlkZW9GdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtaGVyby12aWRlbycsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL2hlcm8tdmlkZW8nKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBEWU5BTU9EQl9TRVRUSU5HU19UQUJMRTogJ21hbnVlbC13ZWlzcy1zZXR0aW5ncycsXG4gICAgICAgIFMzX0hFUk9fVklERU9fQlVDS0VUOiAnbWFudWVsLXdlaXNzLWhlcm8tdmlkZW9zJ1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gT3BlbkFJIFByb3h5IExhbWJkYVxuICAgIGNvbnN0IG9wZW5haVByb3h5TGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnT3BlbkFJUHJveHlGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtb3BlbmFpLXByb3h5JyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvb3BlbmFpLXByb3h5JyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoNjApLFxuICAgICAgbWVtb3J5U2l6ZTogMjU2XG4gICAgfSk7XG5cbiAgICAvLyBKb2IgUGFyc2VyIExhbWJkYVxuICAgIGNvbnN0IGpvYlBhcnNlckxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0pvYlBhcnNlckZ1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnd2Vic2l0ZS1qb2ItcGFyc2VyJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvam9iLXBhcnNlcicpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKSxcbiAgICAgIG1lbW9yeVNpemU6IDI1NlxuICAgIH0pO1xuXG4gICAgLy8gQ1YgR2VuZXJhbCBMYW1iZGFcbiAgICBjb25zdCBjdkdlbmVyYWxMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdDVkdlbmVyYWxGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtY3YtZ2VuZXJhbCcsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL2N2LWdlbmVyYWwnKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygxMjApLFxuICAgICAgbWVtb3J5U2l6ZTogNTEyXG4gICAgfSk7XG5cbiAgICAvLyBDViBUYXJnZXQgTGFtYmRhXG4gICAgY29uc3QgY3ZUYXJnZXRMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdDVlRhcmdldEZ1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnd2Vic2l0ZS1jdi10YXJnZXQnLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS9jdi10YXJnZXQnKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygxMjApLFxuICAgICAgbWVtb3J5U2l6ZTogNTEyXG4gICAgfSk7XG5cbiAgICAvLyBDViBKb2IgUGFyc2UgTGFtYmRhXG4gICAgY29uc3QgY3ZKb2JQYXJzZUxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0NWSm9iUGFyc2VGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtY3Ytam9iLXBhcnNlJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvY3Ytam9iLXBhcnNlJyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoNjApLFxuICAgICAgbWVtb3J5U2l6ZTogMjU2XG4gICAgfSk7XG5cbiAgICAvLyBDViBGaWxlcyBQYXJzZSBMYW1iZGFcbiAgICBjb25zdCBjdkZpbGVzUGFyc2VMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdDVkZpbGVzUGFyc2VGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtY3YtZmlsZXMtcGFyc2UnLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS9jdi1maWxlcy1wYXJzZScpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDYwKSxcbiAgICAgIG1lbW9yeVNpemU6IDUxMlxuICAgIH0pO1xuXG4gICAgLy8gQ1YgRXhwb3J0IExhbWJkYVxuICAgIGNvbnN0IGN2RXhwb3J0TGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQ1ZFeHBvcnRGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtY3YtZXhwb3J0JyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvY3YtZXhwb3J0JyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxuICAgICAgbWVtb3J5U2l6ZTogMjU2XG4gICAgfSk7XG5cbiAgICAvLyBBUEkgU2V0dGluZ3MgTGFtYmRhICh2b2xsc3TDpG5kaWcgbWl0IFZlcnNjaGzDvHNzZWx1bmcpXG4gICAgY29uc3QgYXBpU2V0dGluZ3NMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdBcGlTZXR0aW5nc0Z1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnd2Vic2l0ZS1hcGktc2V0dGluZ3MnLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS9hcGktc2V0dGluZ3MnKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBBUElfU0VUVElOR1NfVEFCTEU6ICdtYXdwcy1hcGktc2V0dGluZ3MnLFxuICAgICAgICBFTkNSWVBUSU9OX1NFQ1JFVDogcHJvY2Vzcy5lbnYuRU5DUllQVElPTl9TRUNSRVQgfHwgJ21hd3BzLXNlY3VyZS1hcGkta2V5LWVuY3J5cHRpb24tMjAyNCdcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIENvbnRhY3QgRW1haWwgTGFtYmRhICh2b2xsc3TDpG5kaWcgbWl0IFNFUylcbiAgICBjb25zdCBjb250YWN0RW1haWxMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdDb250YWN0RW1haWxGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ3dlYnNpdGUtY29udGFjdC1lbWFpbCcsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL2NvbnRhY3QtZW1haWwnKSxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBGUk9NX0VNQUlMOiAnbm9yZXBseUBtYW51ZWwtd2Vpc3MuY2gnLFxuICAgICAgICBUT19FTUFJTDogJ2tvbnRha3RAbWFudWVsLXdlaXNzLmNoJ1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gUHJvZmlsZSBJbWFnZSBVcGxvYWQgTGFtYmRhICh2b2xsc3TDpG5kaWcgbWl0IFMzIFByZXNpZ25lZCBVUkxzKVxuICAgIGNvbnN0IHByb2ZpbGVJbWFnZUxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1Byb2ZpbGVJbWFnZUZ1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnd2Vic2l0ZS1wcm9maWxlLWltYWdlLXVwbG9hZCcsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL3Byb2ZpbGUtaW1hZ2UtdXBsb2FkJyksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgUzNfQlVDS0VUOiAnbWF3cHMtcHJvZmlsZS1pbWFnZXMnXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBQREYgR2VuZXJhdG9yIExhbWJkYSAoUHVwcGV0ZWVyIGbDvHIga29tcGxleGUgQ1NTLUZlYXR1cmVzKVxuICAgIGNvbnN0IHBkZkdlbmVyYXRvckxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1BkZkdlbmVyYXRvckZ1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnd2Vic2l0ZS1wZGYtZ2VuZXJhdG9yJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9sYW1iZGEvcGRmLWdlbmVyYXRvcicpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDYwKSwgLy8gTMOkbmdlcmVyIFRpbWVvdXQgZsO8ciBQREYtR2VuZXJpZXJ1bmdcbiAgICAgIG1lbW9yeVNpemU6IDIwNDgsIC8vIE1laHIgTWVtb3J5IGbDvHIgUHVwcGV0ZWVyL0Nocm9tZVxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgTk9ERV9FTlY6ICdwcm9kdWN0aW9uJ1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIEFQSSBST1VURVNcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAvLyAvdXNlci1kYXRhXG4gICAgY29uc3QgdXNlckRhdGFSZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ3VzZXItZGF0YScpO1xuICAgIHVzZXJEYXRhUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIHVzZXJEYXRhUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICB1c2VyRGF0YVJlc291cmNlLmFkZE1ldGhvZCgnUFVUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICB1c2VyRGF0YVJlc291cmNlLmFkZE1ldGhvZCgnREVMRVRFJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBcbiAgICAvLyAvdXNlci1kYXRhL3Byb2ZpbGVcbiAgICBjb25zdCBwcm9maWxlUmVzb3VyY2UgPSB1c2VyRGF0YVJlc291cmNlLmFkZFJlc291cmNlKCdwcm9maWxlJyk7XG4gICAgcHJvZmlsZVJlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBwcm9maWxlUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBwcm9maWxlUmVzb3VyY2UuYWRkTWV0aG9kKCdQVVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIFxuICAgIC8vIC91c2VyLWRhdGEvcmVzdW1lc1xuICAgIGNvbnN0IHJlc3VtZXNSZXNvdXJjZSA9IHVzZXJEYXRhUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3Jlc3VtZXMnKTtcbiAgICByZXN1bWVzUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIHJlc3VtZXNSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIHJlc3VtZXNSZXNvdXJjZS5hZGRNZXRob2QoJ0RFTEVURScsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJEYXRhTGFtYmRhKSk7XG4gICAgXG4gICAgLy8gL3VzZXItZGF0YS9kb2N1bWVudHNcbiAgICBjb25zdCBkb2N1bWVudHNSZXNvdXJjZSA9IHVzZXJEYXRhUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ2RvY3VtZW50cycpO1xuICAgIGRvY3VtZW50c1Jlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBkb2N1bWVudHNSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIGRvY3VtZW50c1Jlc291cmNlLmFkZE1ldGhvZCgnREVMRVRFJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBcbiAgICAvLyAvdXNlci1kYXRhL2NvdmVyLWxldHRlcnNcbiAgICBjb25zdCBjb3ZlckxldHRlcnNSZXNvdXJjZSA9IHVzZXJEYXRhUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ2NvdmVyLWxldHRlcnMnKTtcbiAgICBjb3ZlckxldHRlcnNSZXNvdXJjZS5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJEYXRhTGFtYmRhKSk7XG4gICAgY292ZXJMZXR0ZXJzUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBjb3ZlckxldHRlcnNSZXNvdXJjZS5hZGRNZXRob2QoJ0RFTEVURScsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJEYXRhTGFtYmRhKSk7XG4gICAgXG4gICAgLy8gL3VzZXItZGF0YS9hcHBsaWNhdGlvbnNcbiAgICBjb25zdCBhcHBsaWNhdGlvbnNSZXNvdXJjZSA9IHVzZXJEYXRhUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ2FwcGxpY2F0aW9ucycpO1xuICAgIGFwcGxpY2F0aW9uc1Jlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBhcHBsaWNhdGlvbnNSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIGFwcGxpY2F0aW9uc1Jlc291cmNlLmFkZE1ldGhvZCgnREVMRVRFJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlckRhdGFMYW1iZGEpKTtcbiAgICBcbiAgICAvLyAvdXNlci1kYXRhL3Bob3Rvc1xuICAgIGNvbnN0IHBob3Rvc1Jlc291cmNlID0gdXNlckRhdGFSZXNvdXJjZS5hZGRSZXNvdXJjZSgncGhvdG9zJyk7XG4gICAgcGhvdG9zUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIHBob3Rvc1Jlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJEYXRhTGFtYmRhKSk7XG4gICAgcGhvdG9zUmVzb3VyY2UuYWRkTWV0aG9kKCdERUxFVEUnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSkpO1xuICAgIFxuICAgIC8vIC91c2VyLWRhdGEvd29ya2Zsb3dzL3twcm94eSt9XG4gICAgY29uc3Qgd29ya2Zsb3dzUmVzb3VyY2UgPSB1c2VyRGF0YVJlc291cmNlLmFkZFJlc291cmNlKCd3b3JrZmxvd3MnKTtcbiAgICBjb25zdCB3b3JrZmxvd1Byb3h5ID0gd29ya2Zsb3dzUmVzb3VyY2UuYWRkUHJveHkoe1xuICAgICAgYW55TWV0aG9kOiB0cnVlLFxuICAgICAgZGVmYXVsdEludGVncmF0aW9uOiBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyRGF0YUxhbWJkYSlcbiAgICB9KTtcblxuICAgIC8vIC9zbm93Zmxha2UtaGlnaHNjb3Jlc1xuICAgIGNvbnN0IGhpZ2hzY29yZXNSZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ3Nub3dmbGFrZS1oaWdoc2NvcmVzJyk7XG4gICAgaGlnaHNjb3Jlc1Jlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaGlnaHNjb3Jlc0xhbWJkYSkpO1xuICAgIGhpZ2hzY29yZXNSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihoaWdoc2NvcmVzTGFtYmRhKSk7XG4gICAgaGlnaHNjb3Jlc1Jlc291cmNlLmFkZE1ldGhvZCgnREVMRVRFJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaGlnaHNjb3Jlc0xhbWJkYSkpO1xuXG4gICAgLy8gL2hlcm8tdmlkZW9cbiAgICBjb25zdCBoZXJvVmlkZW9SZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2hlcm8tdmlkZW8nKTtcbiAgICBcbiAgICAvLyAvaGVyby12aWRlby9zZXR0aW5nc1xuICAgIGNvbnN0IGhlcm9TZXR0aW5nc1Jlc291cmNlID0gaGVyb1ZpZGVvUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3NldHRpbmdzJyk7XG4gICAgaGVyb1NldHRpbmdzUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihoZXJvVmlkZW9MYW1iZGEpKTtcbiAgICBoZXJvU2V0dGluZ3NSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihoZXJvVmlkZW9MYW1iZGEpKTtcbiAgICBoZXJvU2V0dGluZ3NSZXNvdXJjZS5hZGRNZXRob2QoJ1BVVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGhlcm9WaWRlb0xhbWJkYSkpO1xuICAgIFxuICAgIC8vIC9oZXJvLXZpZGVvL3VwbG9hZFxuICAgIGNvbnN0IGhlcm9VcGxvYWRSZXNvdXJjZSA9IGhlcm9WaWRlb1Jlc291cmNlLmFkZFJlc291cmNlKCd1cGxvYWQnKTtcbiAgICBoZXJvVXBsb2FkUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaGVyb1ZpZGVvTGFtYmRhKSk7XG4gICAgaGVyb1VwbG9hZFJlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaGVyb1ZpZGVvTGFtYmRhKSk7XG5cbiAgICAvLyAvb3BlbmFpLXByb3h5XG4gICAgY29uc3Qgb3BlbmFpUmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCdvcGVuYWktcHJveHknKTtcbiAgICBvcGVuYWlSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihvcGVuYWlQcm94eUxhbWJkYSkpO1xuXG4gICAgLy8gL2pvYi1wYXJzZXJcbiAgICBjb25zdCBqb2JQYXJzZXJSZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2pvYi1wYXJzZXInKTtcbiAgICBqb2JQYXJzZXJSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihqb2JQYXJzZXJMYW1iZGEpKTtcblxuICAgIC8vIC9jdi1nZW5lcmFsXG4gICAgY29uc3QgY3ZHZW5lcmFsUmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCdjdi1nZW5lcmFsJyk7XG4gICAgY3ZHZW5lcmFsUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oY3ZHZW5lcmFsTGFtYmRhKSk7XG5cbiAgICAvLyAvY3YtdGFyZ2V0XG4gICAgY29uc3QgY3ZUYXJnZXRSZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2N2LXRhcmdldCcpO1xuICAgIGN2VGFyZ2V0UmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oY3ZUYXJnZXRMYW1iZGEpKTtcblxuICAgIC8vIC9jdi1qb2ItcGFyc2VcbiAgICBjb25zdCBjdkpvYlBhcnNlUmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCdjdi1qb2ItcGFyc2UnKTtcbiAgICBjdkpvYlBhcnNlUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oY3ZKb2JQYXJzZUxhbWJkYSkpO1xuXG4gICAgLy8gL2N2LWZpbGVzLXBhcnNlXG4gICAgY29uc3QgY3ZGaWxlc1BhcnNlUmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCdjdi1maWxlcy1wYXJzZScpO1xuICAgIGN2RmlsZXNQYXJzZVJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGN2RmlsZXNQYXJzZUxhbWJkYSkpO1xuXG4gICAgLy8gL2N2LWV4cG9ydFxuICAgIGNvbnN0IGN2RXhwb3J0UmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCdjdi1leHBvcnQnKTtcbiAgICBjdkV4cG9ydFJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGN2RXhwb3J0TGFtYmRhKSk7XG5cbiAgICAvLyAvYXBpLXNldHRpbmdzIChiZXN0ZWhlbmRlIExhbWJkYSlcbiAgICBjb25zdCBhcGlTZXR0aW5nc1Jlc291cmNlID0gdGhpcy5hcGkucm9vdC5hZGRSZXNvdXJjZSgnYXBpLXNldHRpbmdzJyk7XG4gICAgYXBpU2V0dGluZ3NSZXNvdXJjZS5hZGRQcm94eSh7XG4gICAgICBhbnlNZXRob2Q6IHRydWUsXG4gICAgICBkZWZhdWx0SW50ZWdyYXRpb246IG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGFwaVNldHRpbmdzTGFtYmRhKVxuICAgIH0pO1xuXG4gICAgLy8gL2NvbnRhY3QtZW1haWwgKGJlc3RlaGVuZGUgTGFtYmRhKVxuICAgIGNvbnN0IGNvbnRhY3RSZXNvdXJjZSA9IHRoaXMuYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2NvbnRhY3QtZW1haWwnKTtcbiAgICBjb250YWN0UmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oY29udGFjdEVtYWlsTGFtYmRhKSk7XG5cbiAgICAvLyAvcHJvZmlsZS1pbWFnZSAoYmVzdGVoZW5kZSBMYW1iZGEpXG4gICAgY29uc3QgcHJvZmlsZUltYWdlUmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCdwcm9maWxlLWltYWdlJyk7XG4gICAgY29uc3QgdXBsb2FkVXJsUmVzb3VyY2UgPSBwcm9maWxlSW1hZ2VSZXNvdXJjZS5hZGRSZXNvdXJjZSgndXBsb2FkLXVybCcpO1xuICAgIHVwbG9hZFVybFJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHByb2ZpbGVJbWFnZUxhbWJkYSkpO1xuXG4gICAgLy8gL3BkZi1nZW5lcmF0b3IgKFB1cHBldGVlciBQREYtR2VuZXJpZXJ1bmcpXG4gICAgY29uc3QgcGRmR2VuZXJhdG9yUmVzb3VyY2UgPSB0aGlzLmFwaS5yb290LmFkZFJlc291cmNlKCdwZGYtZ2VuZXJhdG9yJyk7XG4gICAgY29uc3QgcGRmR2VuZXJhdG9ySW50ZWdyYXRpb24gPSBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihwZGZHZW5lcmF0b3JMYW1iZGEsIHtcbiAgICAgIGludGVncmF0aW9uUmVzcG9uc2VzOiBbe1xuICAgICAgICBzdGF0dXNDb2RlOiAnMjAwJyxcbiAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogXCInKidcIixcbiAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogXCInQ29udGVudC1UeXBlLEF1dGhvcml6YXRpb24sWC1Vc2VyLUlkJ1wiLFxuICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiBcIidHRVQsUE9TVCxPUFRJT05TJ1wiLFxuICAgICAgICB9XG4gICAgICB9XVxuICAgIH0pO1xuICAgIHBkZkdlbmVyYXRvclJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIHBkZkdlbmVyYXRvckludGVncmF0aW9uLCB7XG4gICAgICBtZXRob2RSZXNwb25zZXM6IFt7XG4gICAgICAgIHN0YXR1c0NvZGU6ICcyMDAnLFxuICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiB0cnVlLFxuICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiB0cnVlLFxuICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiB0cnVlLFxuICAgICAgICB9XG4gICAgICB9XVxuICAgIH0pO1xuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIE9VVFBVVFNcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgdGhpcy5hcGlVcmwgPSBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnV2Vic2l0ZUFwaVVybCcsIHtcbiAgICAgIHZhbHVlOiB0aGlzLmFwaS51cmwsXG4gICAgICBkZXNjcmlwdGlvbjogJ1dlYnNpdGUgQVBJIEdhdGV3YXkgVVJMJyxcbiAgICAgIGV4cG9ydE5hbWU6ICdXZWJzaXRlQXBpVXJsJ1xuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1dlYnNpdGVBcGlJZCcsIHtcbiAgICAgIHZhbHVlOiB0aGlzLmFwaS5yZXN0QXBpSWQsXG4gICAgICBkZXNjcmlwdGlvbjogJ1dlYnNpdGUgQVBJIEdhdGV3YXkgSUQnXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==