#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { WebSocketStack } from '../lib/websocket-stack';

const app = new cdk.App();

// Environment configuration
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'eu-central-1'
};

// WebSocket Stack für Echtzeit-Multiplayer-Spiele
new WebSocketStack(app, 'game-websocket-prod', {
  env,
  environment: 'production',
  description: 'WebSocket API für Multiplayer-Spiele'
});

app.synth();
