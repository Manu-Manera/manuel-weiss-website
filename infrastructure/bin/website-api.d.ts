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
