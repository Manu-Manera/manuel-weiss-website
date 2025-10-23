#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DataStack } from '../lib/data-stack';
import { ApiStack } from '../lib/api-stack';
import { ComputeStack } from '../lib/compute-stack';
import { AuthStack } from '../lib/auth-stack';
import { ObservabilityStack } from '../lib/observability-stack';
import { SecurityStack } from '../lib/security-stack';

const app = new cdk.App();

// Environment configuration
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'eu-central-1'
};

// Get context values
const projectName = app.node.tryGetContext('projectName') || 'ai-investment';
const environment = app.node.tryGetContext('environment') || 'dev';

// Create stacks
const securityStack = new SecurityStack(app, `${projectName}-security-${environment}`, {
  env,
  description: 'Security and KMS keys for AI Investment System'
});

const dataStack = new DataStack(app, `${projectName}-data-${environment}`, {
  env,
  description: 'Data storage for AI Investment System',
  kmsKey: securityStack.kmsKey
});

const authStack = new AuthStack(app, `${projectName}-auth-${environment}`, {
  env,
  description: 'Authentication and authorization for AI Investment System'
});

const computeStack = new ComputeStack(app, `${projectName}-compute-${environment}`, {
  env,
  description: 'Compute resources for AI Investment System',
  dataStack,
  authStack,
  kmsKey: securityStack.kmsKey
});

const apiStack = new ApiStack(app, `${projectName}-api-${environment}`, {
  env,
  description: 'API Gateway for AI Investment System',
  computeStack,
  authStack
});

const observabilityStack = new ObservabilityStack(app, `${projectName}-observability-${environment}`, {
  env,
  description: 'Monitoring and observability for AI Investment System',
  computeStack,
  apiStack
});

// Add dependencies
dataStack.addDependency(securityStack);
computeStack.addDependency(dataStack);
computeStack.addDependency(authStack);
computeStack.addDependency(securityStack);
apiStack.addDependency(computeStack);
apiStack.addDependency(authStack);
observabilityStack.addDependency(computeStack);
observabilityStack.addDependency(apiStack);

// Outputs
new cdk.CfnOutput(apiStack, 'ApiGatewayUrl', {
  value: apiStack.apiGateway.url,
  description: 'API Gateway URL'
});

// WebSocket API removed - using SSE instead
// new cdk.CfnOutput(apiStack, 'WebSocketUrl', {
//   value: apiStack.webSocketApi.apiEndpoint,
//   description: 'WebSocket API URL'
// });

new cdk.CfnOutput(dataStack, 'DynamoDbTableName', {
  value: dataStack.signalsTable.tableName,
  description: 'DynamoDB Signals Table Name'
});

new cdk.CfnOutput(dataStack, 'S3BucketName', {
  value: dataStack.rawDataBucket.bucketName,
  description: 'S3 Raw Data Bucket Name'
});

new cdk.CfnOutput(authStack, 'UserPoolId', {
  value: authStack.userPool.userPoolId,
  description: 'Cognito User Pool ID'
});

new cdk.CfnOutput(authStack, 'UserPoolClientId', {
  value: authStack.userPoolClient.userPoolClientId,
  description: 'Cognito User Pool Client ID'
});

new cdk.CfnOutput(observabilityStack, 'DashboardUrl', {
  value: `https://console.aws.amazon.com/cloudwatch/home?region=${env.region}#dashboards:name=${observabilityStack.dashboard.dashboardName}`,
  description: 'CloudWatch Dashboard URL'
});

// Tags
cdk.Tags.of(app).add('Project', projectName);
cdk.Tags.of(app).add('Environment', environment);
cdk.Tags.of(app).add('ManagedBy', 'CDK');
cdk.Tags.of(app).add('CostCenter', 'AI-Investment');
