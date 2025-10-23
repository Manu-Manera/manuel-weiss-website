#!/usr/bin/env node

/**
 * Health Check for AI Investment System
 * Monitors system health and reports status
 */

const AWS = require('aws-sdk');
const { OpenAI } = require('openai');

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION || 'eu-central-1'
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const lambda = new AWS.Lambda();

// Configure OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function checkDynamoDB() {
  try {
    const result = await dynamodb.scan({
      TableName: process.env.DYNAMODB_TABLE_PREFIX + '-signals',
      Limit: 1
    }).promise();
    return { status: 'healthy', latency: Date.now() };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}

async function checkS3() {
  try {
    const result = await s3.listObjectsV2({
      Bucket: process.env.S3_BUCKET_PREFIX + '-data',
      MaxKeys: 1
    }).promise();
    return { status: 'healthy', latency: Date.now() };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}

async function checkLambda() {
  try {
    const result = await lambda.listFunctions().promise();
    const aiFunctions = result.Functions.filter(f => f.FunctionName.includes('ai-investment'));
    return { 
      status: 'healthy', 
      functionCount: aiFunctions.length,
      functions: aiFunctions.map(f => f.FunctionName)
    };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}

async function checkOpenAI() {
  try {
    const start = Date.now();
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Health check' }],
      max_tokens: 5
    });
    const latency = Date.now() - start;
    return { status: 'healthy', latency };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}

async function runHealthCheck() {
  console.log('🏥 AI Investment System Health Check');
  console.log('=' .repeat(40));
  
  const checks = {
    dynamodb: await checkDynamoDB(),
    s3: await checkS3(),
    lambda: await checkLambda(),
    openai: await checkOpenAI()
  };
  
  console.log('📊 Health Check Results:');
  console.log('');
  
  let allHealthy = true;
  
  for (const [service, result] of Object.entries(checks)) {
    const status = result.status === 'healthy' ? '✅' : '❌';
    console.log(`${status} ${service.toUpperCase()}: ${result.status}`);
    
    if (result.status === 'unhealthy') {
      console.log(`   Error: ${result.error}`);
      allHealthy = false;
    } else if (result.latency) {
      console.log(`   Latency: ${result.latency}ms`);
    }
    
    if (result.functionCount) {
      console.log(`   Functions: ${result.functionCount}`);
    }
  }
  
  console.log('');
  console.log(`🎯 Overall Status: ${allHealthy ? '✅ HEALTHY' : '❌ UNHEALTHY'}`);
  
  if (allHealthy) {
    console.log('🎉 All systems operational!');
  } else {
    console.log('⚠️ Some systems are experiencing issues.');
  }
  
  return allHealthy;
}

// Run health check if called directly
if (require.main === module) {
  runHealthCheck().catch(console.error);
}

module.exports = {
  checkDynamoDB,
  checkS3,
  checkLambda,
  checkOpenAI,
  runHealthCheck
};
