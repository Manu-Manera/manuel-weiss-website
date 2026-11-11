#!/usr/bin/env node
/**
 * CDK App für die Stellensuche im Bewerbungsmanager.
 *
 * Deployment:
 *   cd infrastructure
 *   npx cdk deploy manuel-weiss-job-search -a "npx ts-node --prefer-ts-exts bin/job-search.ts" --require-approval never
 */

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { JobSearchStack } from '../lib/job-search-stack';

const app = new cdk.App();

new JobSearchStack(app, 'manuel-weiss-job-search', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'eu-central-1'
  },
  description: 'Stellensuche für den Bewerbungsmanager auf manuel-weiss.ch'
});

cdk.Tags.of(app).add('Project', 'manuel-weiss-website');
cdk.Tags.of(app).add('ManagedBy', 'CDK');
