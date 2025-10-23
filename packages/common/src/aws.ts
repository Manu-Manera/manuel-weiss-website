import { DynamoDB, S3, SecretsManager, CloudWatch, SQS } from 'aws-sdk';
import { AWSConfig } from './types';

export class AWSHelpers {
  private dynamoDB: DynamoDB;
  private s3: S3;
  private secretsManager: SecretsManager;
  private cloudWatch: CloudWatch;
  private sqs: SQS;

  constructor(config: AWSConfig) {
    const awsConfig = {
      region: config.region,
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      sessionToken: config.sessionToken
    };

    this.dynamoDB = new DynamoDB(awsConfig);
    this.s3 = new S3(awsConfig);
    this.secretsManager = new SecretsManager(awsConfig);
    this.cloudWatch = new CloudWatch(awsConfig);
    this.sqs = new SQS(awsConfig);
  }

  // DynamoDB Operations
  async dynamoPut(tableName: string, item: any, options?: any): Promise<void> {
    try {
      await this.dynamoDB.putItem({
        TableName: tableName,
        Item: this.convertToDynamoDBItem(item),
        ...options
      }).promise();
    } catch (error) {
      throw new Error(`DynamoDB put failed: ${error.message}`);
    }
  }

  async dynamoGet(tableName: string, key: any): Promise<any> {
    try {
      const result = await this.dynamoDB.getItem({
        TableName: tableName,
        Key: this.convertToDynamoDBItem(key)
      }).promise();
      
      return result.Item ? this.convertFromDynamoDBItem(result.Item) : null;
    } catch (error) {
      throw new Error(`DynamoDB get failed: ${error.message}`);
    }
  }

  async dynamoQuery(tableName: string, keyCondition: string, options?: any): Promise<any[]> {
    try {
      const result = await this.dynamoDB.query({
        TableName: tableName,
        KeyConditionExpression: keyCondition,
        ...options
      }).promise();
      
      return result.Items?.map(item => this.convertFromDynamoDBItem(item)) || [];
    } catch (error) {
      throw new Error(`DynamoDB query failed: ${error.message}`);
    }
  }

  async dynamoScan(tableName: string, options?: any): Promise<any[]> {
    try {
      const result = await this.dynamoDB.scan({
        TableName: tableName,
        ...options
      }).promise();
      
      return result.Items?.map(item => this.convertFromDynamoDBItem(item)) || [];
    } catch (error) {
      throw new Error(`DynamoDB scan failed: ${error.message}`);
    }
  }

  async dynamoUpdate(tableName: string, key: any, updateExpression: string, options?: any): Promise<any> {
    try {
      const result = await this.dynamoDB.updateItem({
        TableName: tableName,
        Key: this.convertToDynamoDBItem(key),
        UpdateExpression: updateExpression,
        ReturnValues: 'ALL_NEW',
        ...options
      }).promise();
      
      return this.convertFromDynamoDBItem(result.Attributes);
    } catch (error) {
      throw new Error(`DynamoDB update failed: ${error.message}`);
    }
  }

  async dynamoDelete(tableName: string, key: any): Promise<void> {
    try {
      await this.dynamoDB.deleteItem({
        TableName: tableName,
        Key: this.convertToDynamoDBItem(key)
      }).promise();
    } catch (error) {
      throw new Error(`DynamoDB delete failed: ${error.message}`);
    }
  }

  // S3 Operations
  async s3Upload(bucket: string, key: string, body: Buffer | string, options?: any): Promise<string> {
    try {
      const result = await this.s3.upload({
        Bucket: bucket,
        Key: key,
        Body: body,
        ...options
      }).promise();
      
      return result.Location;
    } catch (error) {
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }

  async s3Download(bucket: string, key: string): Promise<Buffer> {
    try {
      const result = await this.s3.getObject({
        Bucket: bucket,
        Key: key
      }).promise();
      
      return result.Body as Buffer;
    } catch (error) {
      throw new Error(`S3 download failed: ${error.message}`);
    }
  }

  async s3Delete(bucket: string, key: string): Promise<void> {
    try {
      await this.s3.deleteObject({
        Bucket: bucket,
        Key: key
      }).promise();
    } catch (error) {
      throw new Error(`S3 delete failed: ${error.message}`);
    }
  }

  async s3List(bucket: string, prefix?: string): Promise<string[]> {
    try {
      const result = await this.s3.listObjectsV2({
        Bucket: bucket,
        Prefix: prefix
      }).promise();
      
      return result.Contents?.map(obj => obj.Key) || [];
    } catch (error) {
      throw new Error(`S3 list failed: ${error.message}`);
    }
  }

  async s3Exists(bucket: string, key: string): Promise<boolean> {
    try {
      await this.s3.headObject({
        Bucket: bucket,
        Key: key
      }).promise();
      return true;
    } catch (error) {
      if (error.code === 'NotFound') {
        return false;
      }
      throw new Error(`S3 exists check failed: ${error.message}`);
    }
  }

  // Secrets Manager Operations
  async getSecret(secretId: string): Promise<any> {
    try {
      const result = await this.secretsManager.getSecretValue({
        SecretId: secretId
      }).promise();
      
      return JSON.parse(result.SecretString || '{}');
    } catch (error) {
      throw new Error(`Secrets Manager get failed: ${error.message}`);
    }
  }

  async putSecret(secretId: string, secretValue: any): Promise<void> {
    try {
      await this.secretsManager.putSecretValue({
        SecretId: secretId,
        SecretString: JSON.stringify(secretValue)
      }).promise();
    } catch (error) {
      throw new Error(`Secrets Manager put failed: ${error.message}`);
    }
  }

  // CloudWatch Operations
  async putMetric(metricName: string, value: number, unit: string = 'Count', dimensions?: any[]): Promise<void> {
    try {
      await this.cloudWatch.putMetricData({
        Namespace: 'AI-Investment',
        MetricData: [{
          MetricName: metricName,
          Value: value,
          Unit: unit,
          Dimensions: dimensions
        }]
      }).promise();
    } catch (error) {
      throw new Error(`CloudWatch put metric failed: ${error.message}`);
    }
  }

  async getMetricStatistics(metricName: string, startTime: Date, endTime: Date, period: number = 300): Promise<any> {
    try {
      const result = await this.cloudWatch.getMetricStatistics({
        Namespace: 'AI-Investment',
        MetricName: metricName,
        StartTime: startTime,
        EndTime: endTime,
        Period: period,
        Statistics: ['Average', 'Sum', 'Maximum', 'Minimum']
      }).promise();
      
      return result.Datapoints;
    } catch (error) {
      throw new Error(`CloudWatch get metric statistics failed: ${error.message}`);
    }
  }

  // SQS Operations
  async sqsSendMessage(queueUrl: string, message: any, options?: any): Promise<void> {
    try {
      await this.sqs.sendMessage({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(message),
        ...options
      }).promise();
    } catch (error) {
      throw new Error(`SQS send message failed: ${error.message}`);
    }
  }

  async sqsReceiveMessage(queueUrl: string, maxMessages: number = 1): Promise<any[]> {
    try {
      const result = await this.sqs.receiveMessage({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: maxMessages
      }).promise();
      
      return result.Messages || [];
    } catch (error) {
      throw new Error(`SQS receive message failed: ${error.message}`);
    }
  }

  async sqsDeleteMessage(queueUrl: string, receiptHandle: string): Promise<void> {
    try {
      await this.sqs.deleteMessage({
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle
      }).promise();
    } catch (error) {
      throw new Error(`SQS delete message failed: ${error.message}`);
    }
  }

  // Utility Methods
  private convertToDynamoDBItem(item: any): any {
    const converted: any = {};
    
    for (const [key, value] of Object.entries(item)) {
      if (value === null || value === undefined) {
        continue;
      }
      
      if (typeof value === 'string') {
        converted[key] = { S: value };
      } else if (typeof value === 'number') {
        converted[key] = { N: value.toString() };
      } else if (typeof value === 'boolean') {
        converted[key] = { BOOL: value };
      } else if (value instanceof Date) {
        converted[key] = { S: value.toISOString() };
      } else if (Array.isArray(value)) {
        converted[key] = { L: value.map(v => this.convertToDynamoDBItem({ item: v }).item) };
      } else if (typeof value === 'object') {
        converted[key] = { M: this.convertToDynamoDBItem(value) };
      }
    }
    
    return converted;
  }

  private convertFromDynamoDBItem(item: any): any {
    const converted: any = {};
    
    for (const [key, value] of Object.entries(item)) {
      if (value.S) {
        converted[key] = value.S;
      } else if (value.N) {
        converted[key] = parseFloat(value.N);
      } else if (value.BOOL !== undefined) {
        converted[key] = value.BOOL;
      } else if (value.L) {
        converted[key] = value.L.map((v: any) => this.convertFromDynamoDBItem({ item: v }).item);
      } else if (value.M) {
        converted[key] = this.convertFromDynamoDBItem(value.M);
      }
    }
    
    return converted;
  }

  // Batch Operations
  async dynamoBatchWrite(tableName: string, items: any[]): Promise<void> {
    try {
      const chunks = this.chunkArray(items, 25);
      
      for (const chunk of chunks) {
        const requestItems: any = {};
        requestItems[tableName] = chunk.map(item => ({
          PutRequest: {
            Item: this.convertToDynamoDBItem(item)
          }
        }));
        
        await this.dynamoDB.batchWriteItem({
          RequestItems: requestItems
        }).promise();
      }
    } catch (error) {
      throw new Error(`DynamoDB batch write failed: ${error.message}`);
    }
  }

  async dynamoBatchGet(tableName: string, keys: any[]): Promise<any[]> {
    try {
      const chunks = this.chunkArray(keys, 100);
      const results: any[] = [];
      
      for (const chunk of chunks) {
        const result = await this.dynamoDB.batchGetItem({
          RequestItems: {
            [tableName]: {
              Keys: chunk.map(key => this.convertToDynamoDBItem(key))
            }
          }
        }).promise();
        
        if (result.Responses && result.Responses[tableName]) {
          results.push(...result.Responses[tableName].map(item => this.convertFromDynamoDBItem(item)));
        }
      }
      
      return results;
    } catch (error) {
      throw new Error(`DynamoDB batch get failed: ${error.message}`);
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
