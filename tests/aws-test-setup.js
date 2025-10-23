#!/usr/bin/env node

/**
 * AWS Test Environment Setup
 * Creates real AWS resources for testing
 */

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION || 'eu-central-1'
});

const dynamodb = new AWS.DynamoDB();
const s3 = new AWS.S3();
const cloudwatch = new AWS.CloudWatch();

async function createTestResources() {
  console.log('🚀 Setting up AWS test environment...');
  
  const timestamp = Date.now();
  const testPrefix = `ai-investment-test-${timestamp}`;
  
  try {
    // 1. Create DynamoDB Table
    console.log('📊 Creating DynamoDB test table...');
    const tableName = `${testPrefix}-signals`;
    
    await dynamodb.createTable({
      TableName: tableName,
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    }).promise();
    
    console.log(`✅ DynamoDB table created: ${tableName}`);
    
    // 2. Create S3 Bucket
    console.log('🪣 Creating S3 test bucket...');
    const bucketName = `${testPrefix}-bucket`;
    
    await s3.createBucket({
      Bucket: bucketName,
      CreateBucketConfiguration: {
        LocationConstraint: 'eu-central-1'
      }
    }).promise();
    
    console.log(`✅ S3 bucket created: ${bucketName}`);
    
    // 3. Create CloudWatch Log Group
    console.log('📝 Creating CloudWatch log group...');
    const logGroupName = `/aws/lambda/${testPrefix}-test`;
    
    try {
      await new AWS.CloudWatchLogs().createLogGroup({
        logGroupName: logGroupName
      }).promise();
      console.log(`✅ CloudWatch log group created: ${logGroupName}`);
    } catch (error) {
      if (error.code !== 'ResourceAlreadyExistsException') {
        throw error;
      }
      console.log(`ℹ️ CloudWatch log group already exists: ${logGroupName}`);
    }
    
    // 4. Write test configuration
    const testConfig = {
      timestamp: new Date().toISOString(),
      resources: {
        dynamoTable: tableName,
        s3Bucket: bucketName,
        logGroup: logGroupName
      },
      aws: {
        region: process.env.AWS_REGION || 'eu-central-1',
        profile: process.env.AWS_PROFILE || 'default'
      }
    };
    
    await s3.putObject({
      Bucket: bucketName,
      Key: 'test-config.json',
      Body: JSON.stringify(testConfig, null, 2),
      ContentType: 'application/json'
    }).promise();
    
    console.log('✅ Test configuration written to S3');
    
    // 5. Output environment variables
    console.log('\n🔧 Environment variables for testing:');
    console.log(`export DYNAMODB_TABLE_PREFIX="${testPrefix}"`);
    console.log(`export S3_BUCKET_PREFIX="${testPrefix}"`);
    console.log(`export AWS_REGION="eu-central-1"`);
    console.log(`export TEST_DYNAMO_TABLE="${tableName}"`);
    console.log(`export TEST_S3_BUCKET="${bucketName}"`);
    
    console.log('\n✅ AWS test environment setup complete!');
    console.log('📋 Test resources created:');
    console.log(`   - DynamoDB Table: ${tableName}`);
    console.log(`   - S3 Bucket: ${bucketName}`);
    console.log(`   - CloudWatch Log Group: ${logGroupName}`);
    
    return testConfig;
    
  } catch (error) {
    console.error('❌ Error setting up AWS test environment:', error.message);
    throw error;
  }
}

async function cleanupTestResources() {
  console.log('🧹 Cleaning up AWS test resources...');
  
  const timestamp = process.env.DYNAMODB_TABLE_PREFIX?.replace('ai-investment-test-', '');
  if (!timestamp) {
    console.log('ℹ️ No test resources to clean up');
    return;
  }
  
  try {
    // Delete DynamoDB Table
    const tableName = process.env.TEST_DYNAMO_TABLE;
    if (tableName) {
      await dynamodb.deleteTable({ TableName: tableName }).promise();
      console.log(`✅ DynamoDB table deleted: ${tableName}`);
    }
    
    // Delete S3 Bucket and contents
    const bucketName = process.env.TEST_S3_BUCKET;
    if (bucketName) {
      // List and delete all objects
      const objects = await s3.listObjectsV2({ Bucket: bucketName }).promise();
      if (objects.Contents && objects.Contents.length > 0) {
        await s3.deleteObjects({
          Bucket: bucketName,
          Delete: {
            Objects: objects.Contents.map(obj => ({ Key: obj.Key }))
          }
        }).promise();
      }
      
      await s3.deleteBucket({ Bucket: bucketName }).promise();
      console.log(`✅ S3 bucket deleted: ${bucketName}`);
    }
    
    console.log('✅ AWS test resources cleaned up');
    
  } catch (error) {
    console.error('❌ Error cleaning up AWS test resources:', error.message);
    throw error;
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'setup') {
    createTestResources().catch(console.error);
  } else if (command === 'cleanup') {
    cleanupTestResources().catch(console.error);
  } else {
    console.log('Usage: node aws-test-setup.js [setup|cleanup]');
    process.exit(1);
  }
}

module.exports = {
  createTestResources,
  cleanupTestResources
};
