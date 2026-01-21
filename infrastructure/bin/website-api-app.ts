#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { WebsiteApiStack } from '../lib/website-api-stack';

const app = new cdk.App();

// Environment configuration
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'eu-central-1'
};

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
cdk.Tags.of(app).add('Project', 'manuel-weiss-website');
cdk.Tags.of(app).add('Environment', 'production');
cdk.Tags.of(app).add('ManagedBy', 'CDK');
