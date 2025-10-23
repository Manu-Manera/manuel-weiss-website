import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { ComputeStack } from './compute-stack';
import { AuthStack } from './auth-stack';

export interface ApiStackProps extends cdk.StackProps {
  computeStack: ComputeStack;
  authStack: AuthStack;
}

export class ApiStack extends cdk.Stack {
  public readonly apiGateway: apigateway.RestApi;
  public readonly webSocketApi: apigateway.WebSocketApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
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
      runtime: lambda.Runtime.NODEJS_20_X,
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
      runtime: lambda.Runtime.NODEJS_20_X,
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

    // WebSocket API
    this.webSocketApi = new apigateway.WebSocketApi(this, 'AIInvestmentWebSocketAPI', {
      apiName: 'AI Investment WebSocket API',
      description: 'WebSocket API for real-time updates',
      connectRouteOptions: {
        integration: new apigateway.WebSocketLambdaIntegration('ConnectIntegration', props.computeStack.streamingFunction)
      },
      disconnectRouteOptions: {
        integration: new apigateway.WebSocketLambdaIntegration('DisconnectIntegration', props.computeStack.streamingFunction)
      },
      defaultRouteOptions: {
        integration: new apigateway.WebSocketLambdaIntegration('DefaultIntegration', props.computeStack.streamingFunction)
      }
    });

    const webSocketStage = new apigateway.WebSocketStage(this, 'WebSocketStage', {
      webSocketApi: this.webSocketApi,
      stageName: 'prod',
      autoDeploy: true
    });

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

    new cdk.CfnOutput(this, 'WebSocketUrl', {
      value: this.webSocketApi.apiEndpoint,
      description: 'WebSocket API URL'
    });

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
