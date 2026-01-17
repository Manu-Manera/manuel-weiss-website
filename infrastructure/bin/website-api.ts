#!/usr/bin/env node
/**
 * CDK App für Website API Stack
 * Deployt nur den Website API Stack (ersetzt Netlify Functions)
 * Unabhängig vom AI Investment System
 * 
 * Deployment:
 *   cd infrastructure
 *   npx cdk deploy -a "npx ts-node bin/website-api.ts"
 */

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { WebsiteApiStack } from '../lib/website-api-stack';

const app = new cdk.App();

// Environment configuration
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'eu-central-1'
};

// Website API Stack
const websiteApiStack = new WebsiteApiStack(app, 'manuel-weiss-website-api', {
  env,
  description: 'Website API für manuel-weiss.ch (ersetzt Netlify Functions)'
});

// Tags
cdk.Tags.of(app).add('Project', 'manuel-weiss-website');
cdk.Tags.of(app).add('Purpose', 'Netlify-zu-AWS-Migration');
cdk.Tags.of(app).add('ManagedBy', 'CDK');
