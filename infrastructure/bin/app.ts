#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DataStack } from '../lib/data-stack';
import { ApiStack } from '../lib/api-stack';
import { ComputeStack } from '../lib/compute-stack';
import { AuthStack } from '../lib/auth-stack';
import { ObservabilityStack } from '../lib/observability-stack';
import { SecurityStack } from '../lib/security-stack';
import { WebsiteApiStack } from '../lib/website-api-stack';
import { WebSocketStack } from '../lib/websocket-stack';

const app = new cdk.App();

// Environment configuration
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'eu-central-1'
};

// Get context values
const projectName = app.node.tryGetContext('projectName') || 'ai-investment';
const environment = app.node.tryGetContext('environment') || 'dev';

// Default: Wir deployen in diesem Repo häufig nur die Website-API (Netlify-Migration).
// Die AI-Investment-Staples können optional via CDK Context aktiviert werden:
//   npx cdk deploy --context enableAiStacks=true
const enableAiStacks = app.node.tryGetContext('enableAiStacks') === 'true';

if (enableAiStacks) {
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

// ComputeStack temporär auskommentiert wegen fehlendem Asset (nicht Teil der Website-Migration)
// const computeStack = new ComputeStack(app, `${projectName}-compute-${environment}`, {
//   env,
//   description: 'Compute resources for AI Investment System',
//   dataStack,
//   authStack,
//   kmsKey: securityStack.kmsKey
// });
  const computeStack: ComputeStack | null = null; // Temporär deaktiviert

  // Diese Stacks hängen an ComputeStack. Wenn ComputeStack deaktiviert ist, dürfen wir sie nicht instanziieren.
  let apiStack: ApiStack | null = null;
  let observabilityStack: ObservabilityStack | null = null;

  if (computeStack) {
    apiStack = new ApiStack(app, `${projectName}-api-${environment}`, {
      env,
      description: 'API Gateway for AI Investment System',
      computeStack,
      authStack
    });

    observabilityStack = new ObservabilityStack(app, `${projectName}-observability-${environment}`, {
      env,
      description: 'Monitoring and observability for AI Investment System',
      computeStack,
      apiStack
    });
  }

  // Add dependencies
  dataStack.addDependency(securityStack);
  // computeStack.addDependency(dataStack);
  // computeStack.addDependency(authStack);
  // computeStack.addDependency(securityStack);
  // apiStack.addDependency(computeStack);
  if (apiStack) {
    apiStack.addDependency(authStack);
  }
  // observabilityStack.addDependency(computeStack);
  if (observabilityStack && apiStack) {
    observabilityStack.addDependency(apiStack);
  }

  // Outputs (diese Outputs existieren bereits in den Stacks selbst; hier nur bei Bedarf ergänzen)
  if (apiStack) {
    new cdk.CfnOutput(apiStack, 'ApiGatewayUrl', {
      value: apiStack.apiGateway.url,
      description: 'API Gateway URL'
    });
  }

  // WebSocket Stack für Echtzeit-Multiplayer-Spiele
  new WebSocketStack(app, `${projectName}-websocket-${environment}`, {
    env,
    environment,
    description: 'WebSocket API für Multiplayer-Spiele'
  });

  if (observabilityStack) {
    new cdk.CfnOutput(observabilityStack, 'DashboardUrl', {
      value: `https://console.aws.amazon.com/cloudwatch/home?region=${env.region}#dashboards:name=${observabilityStack.dashboard.dashboardName}`,
      description: 'CloudWatch Dashboard URL'
    });
  }
}

// ========================================
// WEBSITE API STACK (Netlify Migration)
// ========================================
const websiteApiStack = new WebsiteApiStack(app, 'manuel-weiss-website-api', {
  env,
  description: 'Website API für manuel-weiss.ch (ersetzt Netlify Functions)'
});

new cdk.CfnOutput(websiteApiStack, 'WebsiteApiEndpoint', {
  value: websiteApiStack.api.url,
  description: 'Website API URL - Ersetze /.netlify/functions/ mit dieser URL'
});

// Tags
cdk.Tags.of(app).add('Project', projectName);
cdk.Tags.of(app).add('Environment', environment);
cdk.Tags.of(app).add('ManagedBy', 'CDK');
cdk.Tags.of(app).add('CostCenter', 'AI-Investment');
