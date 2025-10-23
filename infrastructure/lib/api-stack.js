"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiStack = void 0;
const cdk = require("aws-cdk-lib");
const apigateway = require("aws-cdk-lib/aws-apigateway");
const lambda = require("aws-cdk-lib/aws-lambda");
class ApiStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // Cognito Authorizer
        const cognitoAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
            cognitoUserPools: [props.authStack.userPool],
            authorizerName: 'CognitoAuthorizer',
            identitySource: 'method.request.header.Authorization'
        });
        // API Gateway
        this.apiGateway = new apigateway.RestApi(this, 'AIInvestmentAPI', {
            restApiName: 'AI Investment System API',
            description: 'API Gateway for AI Investment System',
            defaultCorsPreflightOptions: {
                allowOrigins: [
                    'http://localhost:3000',
                    'https://mawps.netlify.app'
                ],
                allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                allowHeaders: [
                    'Content-Type',
                    'Authorization',
                    'X-Amz-Date',
                    'X-Api-Key',
                    'X-Amz-Security-Token'
                ],
                allowCredentials: true
            },
            deployOptions: {
                stageName: 'v1',
                throttlingRateLimit: 1000,
                throttlingBurstLimit: 2000,
                loggingLevel: apigateway.MethodLoggingLevel.INFO,
                dataTraceEnabled: true,
                metricsEnabled: true
            }
        });
        // API Keys and Usage Plans
        const apiKey = new apigateway.ApiKey(this, 'APIKey', {
            apiKeyName: 'AI Investment API Key',
            description: 'API Key for AI Investment System'
        });
        const usagePlan = new apigateway.UsagePlan(this, 'UsagePlan', {
            name: 'AI Investment Usage Plan',
            description: 'Usage plan for AI Investment System',
            throttle: {
                rateLimit: 100,
                burstLimit: 200
            },
            quota: {
                limit: 10000,
                period: apigateway.Period.DAY
            }
        });
        usagePlan.addApiKey(apiKey);
        usagePlan.addApiStage({
            stage: this.apiGateway.deploymentStage,
            api: this.apiGateway
        });
        // Health Check Endpoint
        const healthCheckLambda = new lambda.Function(this, 'HealthCheckFunction', {
            functionName: 'ai-investment-health-check',
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
              ok: true,
              timestamp: new Date().toISOString(),
              service: 'AI Investment System',
              version: '1.0.0'
            })
          };
        };
      `),
            timeout: cdk.Duration.seconds(30)
        });
        const healthCheck = this.apiGateway.root.addResource('health');
        healthCheck.addMethod('GET', new apigateway.LambdaIntegration(healthCheckLambda));
        // Metrics Endpoint
        const metricsLambda = new lambda.Function(this, 'MetricsFunction', {
            functionName: 'ai-investment-metrics',
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
              ok: true,
              metrics: {
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                version: '1.0.0'
              }
            })
          };
        };
      `),
            timeout: cdk.Duration.seconds(30)
        });
        const metrics = this.apiGateway.root.addResource('metrics');
        metrics.addMethod('GET', new apigateway.LambdaIntegration(metricsLambda));
        // Ingestion Endpoints
        const ingestResource = this.apiGateway.root.addResource('ingest');
        const socialResource = ingestResource.addResource('social');
        socialResource.addMethod('POST', new apigateway.LambdaIntegration(props.computeStack.ingestionSocialFunction), {
            authorizer: cognitoAuthorizer,
            apiKeyRequired: true
        });
        const newsResource = ingestResource.addResource('news');
        newsResource.addMethod('POST', new apigateway.LambdaIntegration(props.computeStack.ingestionNewsFunction), {
            authorizer: cognitoAuthorizer,
            apiKeyRequired: true
        });
        // Scoring Endpoint
        const scoreResource = this.apiGateway.root.addResource('score');
        scoreResource.addMethod('POST', new apigateway.LambdaIntegration(props.computeStack.scoringFunction), {
            authorizer: cognitoAuthorizer,
            apiKeyRequired: true
        });
        // Orchestrator Endpoints
        const proposeResource = this.apiGateway.root.addResource('propose');
        proposeResource.addMethod('POST', new apigateway.LambdaIntegration(props.computeStack.orchestratorFunction), {
            authorizer: cognitoAuthorizer,
            apiKeyRequired: true
        });
        const riskResource = this.apiGateway.root.addResource('risk');
        const riskCheckResource = riskResource.addResource('check');
        riskCheckResource.addMethod('POST', new apigateway.LambdaIntegration(props.computeStack.orchestratorFunction), {
            authorizer: cognitoAuthorizer,
            apiKeyRequired: true
        });
        // Decision Endpoint
        const decisionResource = this.apiGateway.root.addResource('decision');
        decisionResource.addMethod('POST', new apigateway.LambdaIntegration(props.computeStack.evaluationFunction), {
            authorizer: cognitoAuthorizer,
            apiKeyRequired: true
        });
        // Evaluation Endpoint
        const evaluateResource = this.apiGateway.root.addResource('evaluate');
        evaluateResource.addMethod('POST', new apigateway.LambdaIntegration(props.computeStack.evaluationFunction), {
            authorizer: cognitoAuthorizer,
            apiKeyRequired: true
        });
        // Dashboard Endpoints
        const dashboardResource = this.apiGateway.root.addResource('dashboard');
        const summaryResource = dashboardResource.addResource('summary');
        summaryResource.addMethod('GET', new apigateway.LambdaIntegration(props.computeStack.streamingFunction), {
            authorizer: cognitoAuthorizer,
            apiKeyRequired: true
        });
        const streamResource = dashboardResource.addResource('stream');
        streamResource.addMethod('GET', new apigateway.LambdaIntegration(props.computeStack.streamingFunction), {
            authorizer: cognitoAuthorizer,
            apiKeyRequired: true
        });
        // WebSocket API - Using REST API with WebSocket-like functionality
        // Note: WebSocket API is not available in this CDK version
        // Using Server-Sent Events (SSE) instead for real-time updates
        // Grant Lambda functions permission to invoke each other
        props.computeStack.ingestionSocialFunction.grantInvoke(props.computeStack.scoringFunction);
        props.computeStack.ingestionNewsFunction.grantInvoke(props.computeStack.scoringFunction);
        props.computeStack.scoringFunction.grantInvoke(props.computeStack.orchestratorFunction);
        props.computeStack.orchestratorFunction.grantInvoke(props.computeStack.evaluationFunction);
        // Outputs
        new cdk.CfnOutput(this, 'ApiGatewayUrl', {
            value: this.apiGateway.url,
            description: 'API Gateway URL'
        });
        // WebSocket API removed - using SSE instead
        // new cdk.CfnOutput(this, 'WebSocketUrl', {
        //   value: this.webSocketApi.apiEndpoint,
        //   description: 'WebSocket API URL'
        // });
        new cdk.CfnOutput(this, 'ApiKeyId', {
            value: apiKey.keyId,
            description: 'API Key ID'
        });
        new cdk.CfnOutput(this, 'UsagePlanId', {
            value: usagePlan.usagePlanId,
            description: 'Usage Plan ID'
        });
    }
}
exports.ApiStack = ApiStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBpLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFtQztBQUNuQyx5REFBeUQ7QUFDekQsaURBQWlEO0FBWWpELE1BQWEsUUFBUyxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBR3JDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBb0I7UUFDNUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIscUJBQXFCO1FBQ3JCLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxVQUFVLENBQUMsMEJBQTBCLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFO1lBQzdGLGdCQUFnQixFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7WUFDNUMsY0FBYyxFQUFFLG1CQUFtQjtZQUNuQyxjQUFjLEVBQUUscUNBQXFDO1NBQ3RELENBQUMsQ0FBQztRQUVILGNBQWM7UUFDZCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUU7WUFDaEUsV0FBVyxFQUFFLDBCQUEwQjtZQUN2QyxXQUFXLEVBQUUsc0NBQXNDO1lBQ25ELDJCQUEyQixFQUFFO2dCQUMzQixZQUFZLEVBQUU7b0JBQ1osdUJBQXVCO29CQUN2QiwyQkFBMkI7aUJBQzVCO2dCQUNELFlBQVksRUFBRSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUM7Z0JBQ3pELFlBQVksRUFBRTtvQkFDWixjQUFjO29CQUNkLGVBQWU7b0JBQ2YsWUFBWTtvQkFDWixXQUFXO29CQUNYLHNCQUFzQjtpQkFDdkI7Z0JBQ0QsZ0JBQWdCLEVBQUUsSUFBSTthQUN2QjtZQUNELGFBQWEsRUFBRTtnQkFDYixTQUFTLEVBQUUsSUFBSTtnQkFDZixtQkFBbUIsRUFBRSxJ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QixDQUFDLENBQUM7UUFFSCw0Q0FBNEM7UUFDNUMsNENBQTRDO1FBQzVDLDBDQUEwQztRQUMxQyxxQ0FBcUM7UUFDckMsTUFBTTtRQUVOLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFO1lBQ2xDLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSztZQUNuQixXQUFXLEVBQUUsWUFBWTtTQUMxQixDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUNyQyxLQUFLLEVBQUUsU0FBUyxDQUFDLFdBQVc7WUFDNUIsV0FBVyxFQUFFLGVBQWU7U0FDN0IsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBL05ELDRCQStOQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBhcGlnYXRld2F5IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5JztcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCAqIGFzIGNvZ25pdG8gZnJvbSAnYXdzLWNkay1saWIvYXdzLWNvZ25pdG8nO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgeyBDb21wdXRlU3RhY2sgfSBmcm9tICcuL2NvbXB1dGUtc3RhY2snO1xuaW1wb3J0IHsgQXV0aFN0YWNrIH0gZnJvbSAnLi9hdXRoLXN0YWNrJztcblxuZXhwb3J0IGludGVyZmFjZSBBcGlTdGFja1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xuICBjb21wdXRlU3RhY2s6IENvbXB1dGVTdGFjaztcbiAgYXV0aFN0YWNrOiBBdXRoU3RhY2s7XG59XG5cbmV4cG9ydCBjbGFzcyBBcGlTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIHB1YmxpYyByZWFkb25seSBhcGlHYXRld2F5OiBhcGlnYXRld2F5LlJlc3RBcGk7XG5cbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IEFwaVN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vIENvZ25pdG8gQXV0aG9yaXplclxuICAgIGNvbnN0IGNvZ25pdG9BdXRob3JpemVyID0gbmV3IGFwaWdhdGV3YXkuQ29nbml0b1VzZXJQb29sc0F1dGhvcml6ZXIodGhpcywgJ0NvZ25pdG9BdXRob3JpemVyJywge1xuICAgICAgY29nbml0b1VzZXJQb29sczogW3Byb3BzLmF1dGhTdGFjay51c2VyUG9vbF0sXG4gICAgICBhdXRob3JpemVyTmFtZTogJ0NvZ25pdG9BdXRob3JpemVyJyxcbiAgICAgIGlkZW50aXR5U291cmNlOiAnbWV0aG9kLnJlcXVlc3QuaGVhZGVyLkF1dGhvcml6YXRpb24nXG4gICAgfSk7XG5cbiAgICAvLyBBUEkgR2F0ZXdheVxuICAgIHRoaXMuYXBpR2F0ZXdheSA9IG5ldyBhcGlnYXRld2F5LlJlc3RBcGkodGhpcywgJ0FJSW52ZXN0bWVudEFQSScsIHtcbiAgICAgIHJlc3RBcGlOYW1lOiAnQUkgSW52ZXN0bWVudCBTeXN0ZW0gQVBJJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQVBJIEdhdGV3YXkgZm9yIEFJIEludmVzdG1lbnQgU3lzdGVtJyxcbiAgICAgIGRlZmF1bHRDb3JzUHJlZmxpZ2h0T3B0aW9uczoge1xuICAgICAgICBhbGxvd09yaWdpbnM6IFtcbiAgICAgICAgICAnaHR0cDovL2xvY2FsaG9zdDozMDAwJyxcbiAgICAgICAgICAnaHR0cHM6Ly9tYXdwcy5uZXRsaWZ5LmFwcCdcbiAgICAgICAgXSxcbiAgICAgICAgYWxsb3dNZXRob2RzOiBbJ0dFVCcsICdQT1NUJywgJ1BVVCcsICdERUxFVEUnLCAnT1BUSU9OUyddLFxuICAgICAgICBhbGxvd0hlYWRlcnM6IFtcbiAgICAgICAgICAnQ29udGVudC1UeXBlJyxcbiAgICAgICAgICAnQXV0aG9yaXphdGlvbicsXG4gICAgICAgICAgJ1gtQW16LURhdGUnLFxuICAgICAgICAgICdYLUFwaS1LZXknLFxuICAgICAgICAgICdYLUFtei1TZWN1cml0eS1Ub2tlbidcbiAgICAgICAgXSxcbiAgICAgICAgYWxsb3dDcmVkZW50aWFsczogdHJ1ZVxuICAgICAgfSxcbiAgICAgIGRlcGxveU9wdGlvbnM6IHtcbiAgICAgICAgc3RhZ2VOYW1lOiAndjEnLFxuICAgICAgICB0aHJvdHRsaW5nUmF0ZUxpbWl0OiAxMDAwLFxuICAgICAgICB0aHJvdHRsaW5nQnVyc3RMaW1pdDogMjAwMCxcbiAgICAgICAgbG9nZ2luZ0xldmVsOiBhcGlnYXRld2F5Lk1ldGhvZExvZ2dpbmdMZXZlbC5JTkZPLFxuICAgICAgICBkYXRhVHJhY2VFbmFibGVkOiB0cnVlLFxuICAgICAgICBtZXRyaWNzRW5hYmxlZDogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gQVBJIEtleXMgYW5kIFVzYWdlIFBsYW5zXG4gICAgY29uc3QgYXBpS2V5ID0gbmV3IGFwaWdhdGV3YXkuQXBpS2V5KHRoaXMsICdBUElLZXknLCB7XG4gICAgICBhcGlLZXlOYW1lOiAnQUkgSW52ZXN0bWVudCBBUEkgS2V5JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQVBJIEtleSBmb3IgQUkgSW52ZXN0bWVudCBTeXN0ZW0nXG4gICAgfSk7XG5cbiAgICBjb25zdCB1c2FnZVBsYW4gPSBuZXcgYXBpZ2F0ZXdheS5Vc2FnZVBsYW4odGhpcywgJ1VzYWdlUGxhbicsIHtcbiAgICAgIG5hbWU6ICdBSSBJbnZlc3RtZW50IFVzYWdlIFBsYW4nLFxuICAgICAgZGVzY3JpcHRpb246ICdVc2FnZSBwbGFuIGZvciBBSSBJbnZlc3RtZW50IFN5c3RlbScsXG4gICAgICB0aHJvdHRsZToge1xuICAgICAgICByYXRlTGltaXQ6IDEwMCxcbiAgICAgICAgYnVyc3RMaW1pdDogMjAwXG4gICAgICB9LFxuICAgICAgcXVvdGE6IHtcbiAgICAgICAgbGltaXQ6IDEwMDAwLFxuICAgICAgICBwZXJpb2Q6IGFwaWdhdGV3YXkuUGVyaW9kLkRBWVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdXNhZ2VQbGFuLmFkZEFwaUtleShhcGlLZXkpO1xuICAgIHVzYWdlUGxhbi5hZGRBcGlTdGFnZSh7XG4gICAgICBzdGFnZTogdGhpcy5hcGlHYXRld2F5LmRlcGxveW1lbnRTdGFnZSxcbiAgICAgIGFwaTogdGhpcy5hcGlHYXRld2F5XG4gICAgfSk7XG5cbiAgICAvLyBIZWFsdGggQ2hlY2sgRW5kcG9pbnRcbiAgICBjb25zdCBoZWFsdGhDaGVja0xhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0hlYWx0aENoZWNrRnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICdhaS1pbnZlc3RtZW50LWhlYWx0aC1jaGVjaycsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21JbmxpbmUoYFxuICAgICAgICBleHBvcnRzLmhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+IHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RhdHVzQ29kZTogMjAwLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICBvazogdHJ1ZSxcbiAgICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICAgIHNlcnZpY2U6ICdBSSBJbnZlc3RtZW50IFN5c3RlbScsXG4gICAgICAgICAgICAgIHZlcnNpb246ICcxLjAuMCdcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICAgIGApLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApXG4gICAgfSk7XG5cbiAgICBjb25zdCBoZWFsdGhDaGVjayA9IHRoaXMuYXBpR2F0ZXdheS5yb290LmFkZFJlc291cmNlKCdoZWFsdGgnKTtcbiAgICBoZWFsdGhDaGVjay5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGhlYWx0aENoZWNrTGFtYmRhKSk7XG5cbiAgICAvLyBNZXRyaWNzIEVuZHBvaW50XG4gICAgY29uc3QgbWV0cmljc0xhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ01ldHJpY3NGdW5jdGlvbicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ2FpLWludmVzdG1lbnQtbWV0cmljcycsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21JbmxpbmUoYFxuICAgICAgICBleHBvcnRzLmhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+IHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RhdHVzQ29kZTogMjAwLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICBvazogdHJ1ZSxcbiAgICAgICAgICAgICAgbWV0cmljczoge1xuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICAgIHVwdGltZTogcHJvY2Vzcy51cHRpbWUoKSxcbiAgICAgICAgICAgICAgICBtZW1vcnk6IHByb2Nlc3MubWVtb3J5VXNhZ2UoKSxcbiAgICAgICAgICAgICAgICB2ZXJzaW9uOiAnMS4wLjAnXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICAgIGApLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApXG4gICAgfSk7XG5cbiAgICBjb25zdCBtZXRyaWNzID0gdGhpcy5hcGlHYXRld2F5LnJvb3QuYWRkUmVzb3VyY2UoJ21ldHJpY3MnKTtcbiAgICBtZXRyaWNzLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24obWV0cmljc0xhbWJkYSkpO1xuXG4gICAgLy8gSW5nZXN0aW9uIEVuZHBvaW50c1xuICAgIGNvbnN0IGluZ2VzdFJlc291cmNlID0gdGhpcy5hcGlHYXRld2F5LnJvb3QuYWRkUmVzb3VyY2UoJ2luZ2VzdCcpO1xuICAgIFxuICAgIGNvbnN0IHNvY2lhbFJlc291cmNlID0gaW5nZXN0UmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3NvY2lhbCcpO1xuICAgIHNvY2lhbFJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHByb3BzLmNvbXB1dGVTdGFjay5pbmdlc3Rpb25Tb2NpYWxGdW5jdGlvbiksIHtcbiAgICAgIGF1dGhvcml6ZXI6IGNvZ25pdG9BdXRob3JpemVyLFxuICAgICAgYXBpS2V5UmVxdWlyZWQ6IHRydWVcbiAgICB9KTtcblxuICAgIGNvbnN0IG5ld3NSZXNvdXJjZSA9IGluZ2VzdFJlc291cmNlLmFkZFJlc291cmNlKCduZXdzJyk7XG4gICAgbmV3c1Jlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHByb3BzLmNvbXB1dGVTdGFjay5pbmdlc3Rpb25OZXdzRnVuY3Rpb24pLCB7XG4gICAgICBhdXRob3JpemVyOiBjb2duaXRvQXV0aG9yaXplcixcbiAgICAgIGFwaUtleVJlcXVpcmVkOiB0cnVlXG4gICAgfSk7XG5cbiAgICAvLyBTY29yaW5nIEVuZHBvaW50XG4gICAgY29uc3Qgc2NvcmVSZXNvdXJjZSA9IHRoaXMuYXBpR2F0ZXdheS5yb290LmFkZFJlc291cmNlKCdzY29yZScpO1xuICAgIHNjb3JlUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24ocHJvcHMuY29tcHV0ZVN0YWNrLnNjb3JpbmdGdW5jdGlvbiksIHtcbiAgICAgIGF1dGhvcml6ZXI6IGNvZ25pdG9BdXRob3JpemVyLFxuICAgICAgYXBpS2V5UmVxdWlyZWQ6IHRydWVcbiAgICB9KTtcblxuICAgIC8vIE9yY2hlc3RyYXRvciBFbmRwb2ludHNcbiAgICBjb25zdCBwcm9wb3NlUmVzb3VyY2UgPSB0aGlzLmFwaUdhdGV3YXkucm9vdC5hZGRSZXNvdXJjZSgncHJvcG9zZScpO1xuICAgIHByb3Bvc2VSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihwcm9wcy5jb21wdXRlU3RhY2sub3JjaGVzdHJhdG9yRnVuY3Rpb24pLCB7XG4gICAgICBhdXRob3JpemVyOiBjb2duaXRvQXV0aG9yaXplcixcbiAgICAgIGFwaUtleVJlcXVpcmVkOiB0cnVlXG4gICAgfSk7XG5cbiAgICBjb25zdCByaXNrUmVzb3VyY2UgPSB0aGlzLmFwaUdhdGV3YXkucm9vdC5hZGRSZXNvdXJjZSgncmlzaycpO1xuICAgIGNvbnN0IHJpc2tDaGVja1Jlc291cmNlID0gcmlza1Jlc291cmNlLmFkZFJlc291cmNlKCdjaGVjaycpO1xuICAgIHJpc2tDaGVja1Jlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHByb3BzLmNvbXB1dGVTdGFjay5vcmNoZXN0cmF0b3JGdW5jdGlvbiksIHtcbiAgICAgIGF1dGhvcml6ZXI6IGNvZ25pdG9BdXRob3JpemVyLFxuICAgICAgYXBpS2V5UmVxdWlyZWQ6IHRydWVcbiAgICB9KTtcblxuICAgIC8vIERlY2lzaW9uIEVuZHBvaW50XG4gICAgY29uc3QgZGVjaXNpb25SZXNvdXJjZSA9IHRoaXMuYXBpR2F0ZXdheS5yb290LmFkZFJlc291cmNlKCdkZWNpc2lvbicpO1xuICAgIGRlY2lzaW9uUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24ocHJvcHMuY29tcHV0ZVN0YWNrLmV2YWx1YXRpb25GdW5jdGlvbiksIHtcbiAgICAgIGF1dGhvcml6ZXI6IGNvZ25pdG9BdXRob3JpemVyLFxuICAgICAgYXBpS2V5UmVxdWlyZWQ6IHRydWVcbiAgICB9KTtcblxuICAgIC8vIEV2YWx1YXRpb24gRW5kcG9pbnRcbiAgICBjb25zdCBldmFsdWF0ZVJlc291cmNlID0gdGhpcy5hcGlHYXRld2F5LnJvb3QuYWRkUmVzb3VyY2UoJ2V2YWx1YXRlJyk7XG4gICAgZXZhbHVhdGVSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihwcm9wcy5jb21wdXRlU3RhY2suZXZhbHVhdGlvbkZ1bmN0aW9uKSwge1xuICAgICAgYXV0aG9yaXplcjogY29nbml0b0F1dGhvcml6ZXIsXG4gICAgICBhcGlLZXlSZXF1aXJlZDogdHJ1ZVxuICAgIH0pO1xuXG4gICAgLy8gRGFzaGJvYXJkIEVuZHBvaW50c1xuICAgIGNvbnN0IGRhc2hib2FyZFJlc291cmNlID0gdGhpcy5hcGlHYXRld2F5LnJvb3QuYWRkUmVzb3VyY2UoJ2Rhc2hib2FyZCcpO1xuICAgIFxuICAgIGNvbnN0IHN1bW1hcnlSZXNvdXJjZSA9IGRhc2hib2FyZFJlc291cmNlLmFkZFJlc291cmNlKCdzdW1tYXJ5Jyk7XG4gICAgc3VtbWFyeVJlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24ocHJvcHMuY29tcHV0ZVN0YWNrLnN0cmVhbWluZ0Z1bmN0aW9uKSwge1xuICAgICAgYXV0aG9yaXplcjogY29nbml0b0F1dGhvcml6ZXIsXG4gICAgICBhcGlLZXlSZXF1aXJlZDogdHJ1ZVxuICAgIH0pO1xuXG4gICAgY29uc3Qgc3RyZWFtUmVzb3VyY2UgPSBkYXNoYm9hcmRSZXNvdXJjZS5hZGRSZXNvdXJjZSgnc3RyZWFtJyk7XG4gICAgc3RyZWFtUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihwcm9wcy5jb21wdXRlU3RhY2suc3RyZWFtaW5nRnVuY3Rpb24pLCB7XG4gICAgICBhdXRob3JpemVyOiBjb2duaXRvQXV0aG9yaXplcixcbiAgICAgIGFwaUtleVJlcXVpcmVkOiB0cnVlXG4gICAgfSk7XG5cbiAgICAvLyBXZWJTb2NrZXQgQVBJIC0gVXNpbmcgUkVTVCBBUEkgd2l0aCBXZWJTb2NrZXQtbGlrZSBmdW5jdGlvbmFsaXR5XG4gICAgLy8gTm90ZTogV2ViU29ja2V0IEFQSSBpcyBub3QgYXZhaWxhYmxlIGluIHRoaXMgQ0RLIHZlcnNpb25cbiAgICAvLyBVc2luZyBTZXJ2ZXItU2VudCBFdmVudHMgKFNTRSkgaW5zdGVhZCBmb3IgcmVhbC10aW1lIHVwZGF0ZXNcblxuICAgIC8vIEdyYW50IExhbWJkYSBmdW5jdGlvbnMgcGVybWlzc2lvbiB0byBpbnZva2UgZWFjaCBvdGhlclxuICAgIHByb3BzLmNvbXB1dGVTdGFjay5pbmdlc3Rpb25Tb2NpYWxGdW5jdGlvbi5ncmFudEludm9rZShwcm9wcy5jb21wdXRlU3RhY2suc2NvcmluZ0Z1bmN0aW9uKTtcbiAgICBwcm9wcy5jb21wdXRlU3RhY2suaW5nZXN0aW9uTmV3c0Z1bmN0aW9uLmdyYW50SW52b2tlKHByb3BzLmNvbXB1dGVTdGFjay5zY29yaW5nRnVuY3Rpb24pO1xuICAgIHByb3BzLmNvbXB1dGVTdGFjay5zY29yaW5nRnVuY3Rpb24uZ3JhbnRJbnZva2UocHJvcHMuY29tcHV0ZVN0YWNrLm9yY2hlc3RyYXRvckZ1bmN0aW9uKTtcbiAgICBwcm9wcy5jb21wdXRlU3RhY2sub3JjaGVzdHJhdG9yRnVuY3Rpb24uZ3JhbnRJbnZva2UocHJvcHMuY29tcHV0ZVN0YWNrLmV2YWx1YXRpb25GdW5jdGlvbik7XG5cbiAgICAvLyBPdXRwdXRzXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0FwaUdhdGV3YXlVcmwnLCB7XG4gICAgICB2YWx1ZTogdGhpcy5hcGlHYXRld2F5LnVybCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQVBJIEdhdGV3YXkgVVJMJ1xuICAgIH0pO1xuXG4gICAgLy8gV2ViU29ja2V0IEFQSSByZW1vdmVkIC0gdXNpbmcgU1NFIGluc3RlYWRcbiAgICAvLyBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnV2ViU29ja2V0VXJsJywge1xuICAgIC8vICAgdmFsdWU6IHRoaXMud2ViU29ja2V0QXBpLmFwaUVuZHBvaW50LFxuICAgIC8vICAgZGVzY3JpcHRpb246ICdXZWJTb2NrZXQgQVBJIFVSTCdcbiAgICAvLyB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdBcGlLZXlJZCcsIHtcbiAgICAgIHZhbHVlOiBhcGlLZXkua2V5SWQsXG4gICAgICBkZXNjcmlwdGlvbjogJ0FQSSBLZXkgSUQnXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnVXNhZ2VQbGFuSWQnLCB7XG4gICAgICB2YWx1ZTogdXNhZ2VQbGFuLnVzYWdlUGxhbklkLFxuICAgICAgZGVzY3JpcHRpb246ICdVc2FnZSBQbGFuIElEJ1xuICAgIH0pO1xuICB9XG59XG4iXX0=