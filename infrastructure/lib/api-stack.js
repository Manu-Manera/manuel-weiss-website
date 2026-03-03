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
                    'https://manuel-weiss.ch'
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBpLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFtQztBQUNuQyx5REFBeUQ7QUFDekQsaURBQWlEO0FBWWpELE1BQWEsUUFBUyxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBR3JDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBb0I7UUFDNUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIscUJBQXFCO1FBQ3JCLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxVQUFVLENBQUMsMEJBQTBCLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFO1lBQzdGLGdCQUFnQixFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7WUFDNUMsY0FBYyxFQUFFLG1CQUFtQjtZQUNuQyxjQUFjLEVBQUUscUNBQXFDO1NBQ3RELENBQUMsQ0FBQztRQUVILGNBQWM7UUFDZCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUU7WUFDaEUsV0FBVyxFQUFFLDBCQUEwQjtZQUN2QyxXQUFXLEVBQUUsc0NBQXNDO1lBQ25ELDJCQUEyQixFQUFFO2dCQUMzQixZQUFZLEVBQUU7b0JBQ1osdUJBQXVCO29CQUN2Qix5QkFBeUI7aUJBQzFCO2dCQUNELFlBQVksRUFBRSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUM7Z0JBQ3pELFlBQVksRUFBRTtvQkFDWixjQUFjO29CQUNkLGVBQWU7b0JBQ2YsWUFBWTtvQkFDWixXQUFXO29CQUNYLHNCQUFzQjtpQkFDdkI7Z0JBQ0QsZ0JBQWdCLEVBQUUsSUFBSTthQUN2QjtZQUNELGFBQWEsRUFBRTtnQkFDYixTQUFTLEVBQUUsSUFBSTtnQkFDZixtQkFBbUIsRUFBRSxJ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QixDQUFDLENBQUM7UUFFSCw0Q0FBNEM7UUFDNUMsNENBQTRDO1FBQzVDLDBDQUEwQztRQUMxQyxxQ0FBcUM7UUFDckMsTUFBTTtRQUVOLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFO1lBQ2xDLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSztZQUNuQixXQUFXLEVBQUUsWUFBWTtTQUMxQixDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUNyQyxLQUFLLEVBQUUsU0FBUyxDQUFDLFdBQVc7WUFDNUIsV0FBVyxFQUFFLGVBQWU7U0FDN0IsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBL05ELDRCQStOQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBhcGlnYXRld2F5IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5JztcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCAqIGFzIGNvZ25pdG8gZnJvbSAnYXdzLWNkay1saWIvYXdzLWNvZ25pdG8nO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgeyBDb21wdXRlU3RhY2sgfSBmcm9tICcuL2NvbXB1dGUtc3RhY2snO1xuaW1wb3J0IHsgQXV0aFN0YWNrIH0gZnJvbSAnLi9hdXRoLXN0YWNrJztcblxuZXhwb3J0IGludGVyZmFjZSBBcGlTdGFja1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xuICBjb21wdXRlU3RhY2s6IENvbXB1dGVTdGFjaztcbiAgYXV0aFN0YWNrOiBBdXRoU3RhY2s7XG59XG5cbmV4cG9ydCBjbGFzcyBBcGlTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIHB1YmxpYyByZWFkb25seSBhcGlHYXRld2F5OiBhcGlnYXRld2F5LlJlc3RBcGk7XG5cbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IEFwaVN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vIENvZ25pdG8gQXV0aG9yaXplclxuICAgIGNvbnN0IGNvZ25pdG9BdXRob3JpemVyID0gbmV3IGFwaWdhdGV3YXkuQ29nbml0b1VzZXJQb29sc0F1dGhvcml6ZXIodGhpcywgJ0NvZ25pdG9BdXRob3JpemVyJywge1xuICAgICAgY29nbml0b1VzZXJQb29sczogW3Byb3BzLmF1dGhTdGFjay51c2VyUG9vbF0sXG4gICAgICBhdXRob3JpemVyTmFtZTogJ0NvZ25pdG9BdXRob3JpemVyJyxcbiAgICAgIGlkZW50aXR5U291cmNlOiAnbWV0aG9kLnJlcXVlc3QuaGVhZGVyLkF1dGhvcml6YXRpb24nXG4gICAgfSk7XG5cbiAgICAvLyBBUEkgR2F0ZXdheVxuICAgIHRoaXMuYXBpR2F0ZXdheSA9IG5ldyBhcGlnYXRld2F5LlJlc3RBcGkodGhpcywgJ0FJSW52ZXN0bWVudEFQSScsIHtcbiAgICAgIHJlc3RBcGlOYW1lOiAnQUkgSW52ZXN0bWVudCBTeXN0ZW0gQVBJJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQVBJIEdhdGV3YXkgZm9yIEFJIEludmVzdG1lbnQgU3lzdGVtJyxcbiAgICAgIGRlZmF1bHRDb3JzUHJlZmxpZ2h0T3B0aW9uczoge1xuICAgICAgICBhbGxvd09yaWdpbnM6IFtcbiAgICAgICAgICAnaHR0cDovL2xvY2FsaG9zdDozMDAwJyxcbiAgICAgICAgICAnaHR0cHM6Ly9tYW51ZWwtd2Vpc3MuY2gnXG4gICAgICAgIF0sXG4gICAgICAgIGFsbG93TWV0aG9kczogWydHRVQnLCAnUE9TVCcsICdQVVQnLCAnREVMRVRFJywgJ09QVElPTlMnXSxcbiAgICAgICAgYWxsb3dIZWFkZXJzOiBbXG4gICAgICAgICAgJ0NvbnRlbnQtVHlwZScsXG4gICAgICAgICAgJ0F1dGhvcml6YXRpb24nLFxuICAgICAgICAgICdYLUFtei1EYXRlJyxcbiAgICAgICAgICAnWC1BcGktS2V5JyxcbiAgICAgICAgICAnWC1BbXotU2VjdXJpdHktVG9rZW4nXG4gICAgICAgIF0sXG4gICAgICAgIGFsbG93Q3JlZGVudGlhbHM6IHRydWVcbiAgICAgIH0sXG4gICAgICBkZXBsb3lPcHRpb25zOiB7XG4gICAgICAgIHN0YWdlTmFtZTogJ3YxJyxcbiAgICAgICAgdGhyb3R0bGluZ1JhdGVMaW1pdDogMTAwMCxcbiAgICAgICAgdGhyb3R0bGluZ0J1cnN0TGltaXQ6IDIwMDAsXG4gICAgICAgIGxvZ2dpbmdMZXZlbDogYXBpZ2F0ZXdheS5NZXRob2RMb2dnaW5nTGV2ZWwuSU5GTyxcbiAgICAgICAgZGF0YVRyYWNlRW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgbWV0cmljc0VuYWJsZWQ6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIEFQSSBLZXlzIGFuZCBVc2FnZSBQbGFuc1xuICAgIGNvbnN0IGFwaUtleSA9IG5ldyBhcGlnYXRld2F5LkFwaUtleSh0aGlzLCAnQVBJS2V5Jywge1xuICAgICAgYXBpS2V5TmFtZTogJ0FJIEludmVzdG1lbnQgQVBJIEtleScsXG4gICAgICBkZXNjcmlwdGlvbjogJ0FQSSBLZXkgZm9yIEFJIEludmVzdG1lbnQgU3lzdGVtJ1xuICAgIH0pO1xuXG4gICAgY29uc3QgdXNhZ2VQbGFuID0gbmV3IGFwaWdhdGV3YXkuVXNhZ2VQbGFuKHRoaXMsICdVc2FnZVBsYW4nLCB7XG4gICAgICBuYW1lOiAnQUkgSW52ZXN0bWVudCBVc2FnZSBQbGFuJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnVXNhZ2UgcGxhbiBmb3IgQUkgSW52ZXN0bWVudCBTeXN0ZW0nLFxuICAgICAgdGhyb3R0bGU6IHtcbiAgICAgICAgcmF0ZUxpbWl0OiAxMDAsXG4gICAgICAgIGJ1cnN0TGltaXQ6IDIwMFxuICAgICAgfSxcbiAgICAgIHF1b3RhOiB7XG4gICAgICAgIGxpbWl0OiAxMDAwMCxcbiAgICAgICAgcGVyaW9kOiBhcGlnYXRld2F5LlBlcmlvZC5EQVlcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHVzYWdlUGxhbi5hZGRBcGlLZXkoYXBpS2V5KTtcbiAgICB1c2FnZVBsYW4uYWRkQXBpU3RhZ2Uoe1xuICAgICAgc3RhZ2U6IHRoaXMuYXBpR2F0ZXdheS5kZXBsb3ltZW50U3RhZ2UsXG4gICAgICBhcGk6IHRoaXMuYXBpR2F0ZXdheVxuICAgIH0pO1xuXG4gICAgLy8gSGVhbHRoIENoZWNrIEVuZHBvaW50XG4gICAgY29uc3QgaGVhbHRoQ2hlY2tMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdIZWFsdGhDaGVja0Z1bmN0aW9uJywge1xuICAgICAgZnVuY3Rpb25OYW1lOiAnYWktaW52ZXN0bWVudC1oZWFsdGgtY2hlY2snLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tSW5saW5lKGBcbiAgICAgICAgZXhwb3J0cy5oYW5kbGVyID0gYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6IDIwMCxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgb2s6IHRydWUsXG4gICAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICBzZXJ2aWNlOiAnQUkgSW52ZXN0bWVudCBTeXN0ZW0nLFxuICAgICAgICAgICAgICB2ZXJzaW9uOiAnMS4wLjAnXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgICBgKSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKVxuICAgIH0pO1xuXG4gICAgY29uc3QgaGVhbHRoQ2hlY2sgPSB0aGlzLmFwaUdhdGV3YXkucm9vdC5hZGRSZXNvdXJjZSgnaGVhbHRoJyk7XG4gICAgaGVhbHRoQ2hlY2suYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihoZWFsdGhDaGVja0xhbWJkYSkpO1xuXG4gICAgLy8gTWV0cmljcyBFbmRwb2ludFxuICAgIGNvbnN0IG1ldHJpY3NMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdNZXRyaWNzRnVuY3Rpb24nLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6ICdhaS1pbnZlc3RtZW50LW1ldHJpY3MnLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tSW5saW5lKGBcbiAgICAgICAgZXhwb3J0cy5oYW5kbGVyID0gYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6IDIwMCxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgb2s6IHRydWUsXG4gICAgICAgICAgICAgIG1ldHJpY3M6IHtcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICB1cHRpbWU6IHByb2Nlc3MudXB0aW1lKCksXG4gICAgICAgICAgICAgICAgbWVtb3J5OiBwcm9jZXNzLm1lbW9yeVVzYWdlKCksXG4gICAgICAgICAgICAgICAgdmVyc2lvbjogJzEuMC4wJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgICBgKSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKVxuICAgIH0pO1xuXG4gICAgY29uc3QgbWV0cmljcyA9IHRoaXMuYXBpR2F0ZXdheS5yb290LmFkZFJlc291cmNlKCdtZXRyaWNzJyk7XG4gICAgbWV0cmljcy5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKG1ldHJpY3NMYW1iZGEpKTtcblxuICAgIC8vIEluZ2VzdGlvbiBFbmRwb2ludHNcbiAgICBjb25zdCBpbmdlc3RSZXNvdXJjZSA9IHRoaXMuYXBpR2F0ZXdheS5yb290LmFkZFJlc291cmNlKCdpbmdlc3QnKTtcbiAgICBcbiAgICBjb25zdCBzb2NpYWxSZXNvdXJjZSA9IGluZ2VzdFJlc291cmNlLmFkZFJlc291cmNlKCdzb2NpYWwnKTtcbiAgICBzb2NpYWxSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihwcm9wcy5jb21wdXRlU3RhY2suaW5nZXN0aW9uU29jaWFsRnVuY3Rpb24pLCB7XG4gICAgICBhdXRob3JpemVyOiBjb2duaXRvQXV0aG9yaXplcixcbiAgICAgIGFwaUtleVJlcXVpcmVkOiB0cnVlXG4gICAgfSk7XG5cbiAgICBjb25zdCBuZXdzUmVzb3VyY2UgPSBpbmdlc3RSZXNvdXJjZS5hZGRSZXNvdXJjZSgnbmV3cycpO1xuICAgIG5ld3NSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihwcm9wcy5jb21wdXRlU3RhY2suaW5nZXN0aW9uTmV3c0Z1bmN0aW9uKSwge1xuICAgICAgYXV0aG9yaXplcjogY29nbml0b0F1dGhvcml6ZXIsXG4gICAgICBhcGlLZXlSZXF1aXJlZDogdHJ1ZVxuICAgIH0pO1xuXG4gICAgLy8gU2NvcmluZyBFbmRwb2ludFxuICAgIGNvbnN0IHNjb3JlUmVzb3VyY2UgPSB0aGlzLmFwaUdhdGV3YXkucm9vdC5hZGRSZXNvdXJjZSgnc2NvcmUnKTtcbiAgICBzY29yZVJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHByb3BzLmNvbXB1dGVTdGFjay5zY29yaW5nRnVuY3Rpb24pLCB7XG4gICAgICBhdXRob3JpemVyOiBjb2duaXRvQXV0aG9yaXplcixcbiAgICAgIGFwaUtleVJlcXVpcmVkOiB0cnVlXG4gICAgfSk7XG5cbiAgICAvLyBPcmNoZXN0cmF0b3IgRW5kcG9pbnRzXG4gICAgY29uc3QgcHJvcG9zZVJlc291cmNlID0gdGhpcy5hcGlHYXRld2F5LnJvb3QuYWRkUmVzb3VyY2UoJ3Byb3Bvc2UnKTtcbiAgICBwcm9wb3NlUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24ocHJvcHMuY29tcHV0ZVN0YWNrLm9yY2hlc3RyYXRvckZ1bmN0aW9uKSwge1xuICAgICAgYXV0aG9yaXplcjogY29nbml0b0F1dGhvcml6ZXIsXG4gICAgICBhcGlLZXlSZXF1aXJlZDogdHJ1ZVxuICAgIH0pO1xuXG4gICAgY29uc3Qgcmlza1Jlc291cmNlID0gdGhpcy5hcGlHYXRld2F5LnJvb3QuYWRkUmVzb3VyY2UoJ3Jpc2snKTtcbiAgICBjb25zdCByaXNrQ2hlY2tSZXNvdXJjZSA9IHJpc2tSZXNvdXJjZS5hZGRSZXNvdXJjZSgnY2hlY2snKTtcbiAgICByaXNrQ2hlY2tSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihwcm9wcy5jb21wdXRlU3RhY2sub3JjaGVzdHJhdG9yRnVuY3Rpb24pLCB7XG4gICAgICBhdXRob3JpemVyOiBjb2duaXRvQXV0aG9yaXplcixcbiAgICAgIGFwaUtleVJlcXVpcmVkOiB0cnVlXG4gICAgfSk7XG5cbiAgICAvLyBEZWNpc2lvbiBFbmRwb2ludFxuICAgIGNvbnN0IGRlY2lzaW9uUmVzb3VyY2UgPSB0aGlzLmFwaUdhdGV3YXkucm9vdC5hZGRSZXNvdXJjZSgnZGVjaXNpb24nKTtcbiAgICBkZWNpc2lvblJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHByb3BzLmNvbXB1dGVTdGFjay5ldmFsdWF0aW9uRnVuY3Rpb24pLCB7XG4gICAgICBhdXRob3JpemVyOiBjb2duaXRvQXV0aG9yaXplcixcbiAgICAgIGFwaUtleVJlcXVpcmVkOiB0cnVlXG4gICAgfSk7XG5cbiAgICAvLyBFdmFsdWF0aW9uIEVuZHBvaW50XG4gICAgY29uc3QgZXZhbHVhdGVSZXNvdXJjZSA9IHRoaXMuYXBpR2F0ZXdheS5yb290LmFkZFJlc291cmNlKCdldmFsdWF0ZScpO1xuICAgIGV2YWx1YXRlUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24ocHJvcHMuY29tcHV0ZVN0YWNrLmV2YWx1YXRpb25GdW5jdGlvbiksIHtcbiAgICAgIGF1dGhvcml6ZXI6IGNvZ25pdG9BdXRob3JpemVyLFxuICAgICAgYXBpS2V5UmVxdWlyZWQ6IHRydWVcbiAgICB9KTtcblxuICAgIC8vIERhc2hib2FyZCBFbmRwb2ludHNcbiAgICBjb25zdCBkYXNoYm9hcmRSZXNvdXJjZSA9IHRoaXMuYXBpR2F0ZXdheS5yb290LmFkZFJlc291cmNlKCdkYXNoYm9hcmQnKTtcbiAgICBcbiAgICBjb25zdCBzdW1tYXJ5UmVzb3VyY2UgPSBkYXNoYm9hcmRSZXNvdXJjZS5hZGRSZXNvdXJjZSgnc3VtbWFyeScpO1xuICAgIHN1bW1hcnlSZXNvdXJjZS5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHByb3BzLmNvbXB1dGVTdGFjay5zdHJlYW1pbmdGdW5jdGlvbiksIHtcbiAgICAgIGF1dGhvcml6ZXI6IGNvZ25pdG9BdXRob3JpemVyLFxuICAgICAgYXBpS2V5UmVxdWlyZWQ6IHRydWVcbiAgICB9KTtcblxuICAgIGNvbnN0IHN0cmVhbVJlc291cmNlID0gZGFzaGJvYXJkUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3N0cmVhbScpO1xuICAgIHN0cmVhbVJlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24ocHJvcHMuY29tcHV0ZVN0YWNrLnN0cmVhbWluZ0Z1bmN0aW9uKSwge1xuICAgICAgYXV0aG9yaXplcjogY29nbml0b0F1dGhvcml6ZXIsXG4gICAgICBhcGlLZXlSZXF1aXJlZDogdHJ1ZVxuICAgIH0pO1xuXG4gICAgLy8gV2ViU29ja2V0IEFQSSAtIFVzaW5nIFJFU1QgQVBJIHdpdGggV2ViU29ja2V0LWxpa2UgZnVuY3Rpb25hbGl0eVxuICAgIC8vIE5vdGU6IFdlYlNvY2tldCBBUEkgaXMgbm90IGF2YWlsYWJsZSBpbiB0aGlzIENESyB2ZXJzaW9uXG4gICAgLy8gVXNpbmcgU2VydmVyLVNlbnQgRXZlbnRzIChTU0UpIGluc3RlYWQgZm9yIHJlYWwtdGltZSB1cGRhdGVzXG5cbiAgICAvLyBHcmFudCBMYW1iZGEgZnVuY3Rpb25zIHBlcm1pc3Npb24gdG8gaW52b2tlIGVhY2ggb3RoZXJcbiAgICBwcm9wcy5jb21wdXRlU3RhY2suaW5nZXN0aW9uU29jaWFsRnVuY3Rpb24uZ3JhbnRJbnZva2UocHJvcHMuY29tcHV0ZVN0YWNrLnNjb3JpbmdGdW5jdGlvbik7XG4gICAgcHJvcHMuY29tcHV0ZVN0YWNrLmluZ2VzdGlvbk5ld3NGdW5jdGlvbi5ncmFudEludm9rZShwcm9wcy5jb21wdXRlU3RhY2suc2NvcmluZ0Z1bmN0aW9uKTtcbiAgICBwcm9wcy5jb21wdXRlU3RhY2suc2NvcmluZ0Z1bmN0aW9uLmdyYW50SW52b2tlKHByb3BzLmNvbXB1dGVTdGFjay5vcmNoZXN0cmF0b3JGdW5jdGlvbik7XG4gICAgcHJvcHMuY29tcHV0ZVN0YWNrLm9yY2hlc3RyYXRvckZ1bmN0aW9uLmdyYW50SW52b2tlKHByb3BzLmNvbXB1dGVTdGFjay5ldmFsdWF0aW9uRnVuY3Rpb24pO1xuXG4gICAgLy8gT3V0cHV0c1xuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdBcGlHYXRld2F5VXJsJywge1xuICAgICAgdmFsdWU6IHRoaXMuYXBpR2F0ZXdheS51cmwsXG4gICAgICBkZXNjcmlwdGlvbjogJ0FQSSBHYXRld2F5IFVSTCdcbiAgICB9KTtcblxuICAgIC8vIFdlYlNvY2tldCBBUEkgcmVtb3ZlZCAtIHVzaW5nIFNTRSBpbnN0ZWFkXG4gICAgLy8gbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1dlYlNvY2tldFVybCcsIHtcbiAgICAvLyAgIHZhbHVlOiB0aGlzLndlYlNvY2tldEFwaS5hcGlFbmRwb2ludCxcbiAgICAvLyAgIGRlc2NyaXB0aW9uOiAnV2ViU29ja2V0IEFQSSBVUkwnXG4gICAgLy8gfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQXBpS2V5SWQnLCB7XG4gICAgICB2YWx1ZTogYXBpS2V5LmtleUlkLFxuICAgICAgZGVzY3JpcHRpb246ICdBUEkgS2V5IElEJ1xuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1VzYWdlUGxhbklkJywge1xuICAgICAgdmFsdWU6IHVzYWdlUGxhbi51c2FnZVBsYW5JZCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnVXNhZ2UgUGxhbiBJRCdcbiAgICB9KTtcbiAgfVxufVxuIl19