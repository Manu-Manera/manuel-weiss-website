import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Logger } from '../../packages/common/src/logger';
import { TimeUtils } from '../../packages/common/src/time';
import { HashUtils } from '../../packages/common/src/hash';
import { AWSHelpers } from '../../packages/common/src/aws';
import { LLMAdapter } from '../../packages/common/src/llm';

// Mock AWS SDK
jest.mock('aws-sdk', () => ({
  DynamoDB: {
    DocumentClient: jest.fn(() => ({
      put: jest.fn().mockReturnValue({ promise: () => Promise.resolve({}) }),
      query: jest.fn().mockReturnValue({ promise: () => Promise.resolve({ Items: [] }) }),
      get: jest.fn().mockReturnValue({ promise: () => Promise.resolve({ Item: {} }) }),
      update: jest.fn().mockReturnValue({ promise: () => Promise.resolve({}) }),
      delete: jest.fn().mockReturnValue({ promise: () => Promise.resolve({}) })
    }))
  },
  S3: jest.fn(() => ({
    upload: jest.fn().mockReturnValue({ promise: () => Promise.resolve({}) }),
    getObject: jest.fn().mockReturnValue({ promise: () => Promise.resolve({ Body: 'test' }) }),
    deleteObject: jest.fn().mockReturnValue({ promise: () => Promise.resolve({}) })
  })),
  TimestreamWrite: jest.fn(() => ({
    writeRecords: jest.fn().mockReturnValue({ promise: () => Promise.resolve({}) })
  }))
}));

// Mock OpenAI
jest.mock('openai', () => ({
  OpenAI: jest.fn(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Test response' } }],
          usage: { total_tokens: 100 }
        })
      }
    },
    embeddings: {
      create: jest.fn().mockResolvedValue({
        data: [{ embedding: [0.1, 0.2, 0.3] }]
      })
    }
  }))
}));

describe('Common Package Tests', () => {
  describe('Logger', () => {
    let logger: Logger;

    beforeEach(() => {
      logger = new Logger('test-module');
    });

    it('should create logger instance', () => {
      expect(logger).toBeDefined();
      expect(logger.module).toBe('test-module');
    });

    it('should log info message', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      logger.info('Test message', { test: 'data' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test message')
      );
      
      consoleSpy.mockRestore();
    });

    it('should log error message', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      logger.error('Test error', new Error('Test error'));
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test error')
      );
      
      consoleSpy.mockRestore();
    });

    it('should log with context', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      logger.info('Test message', { userId: 'user123', requestId: 'req456' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('user123')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('TimeUtils', () => {
    it('should get current time', () => {
      const now = TimeUtils.now();
      expect(now).toBeDefined();
      expect(typeof now).toBe('string');
    });

    it('should format time', () => {
      const time = '2024-01-15T10:30:00Z';
      const formatted = TimeUtils.format(time, 'YYYY-MM-DD');
      expect(formatted).toBe('2024-01-15');
    });

    it('should check if market is open', () => {
      const isOpen = TimeUtils.isMarketOpen();
      expect(typeof isOpen).toBe('boolean');
    });

    it('should get business days', () => {
      const start = '2024-01-15T10:30:00Z';
      const end = '2024-01-20T10:30:00Z';
      const businessDays = TimeUtils.getBusinessDays(start, end);
      expect(businessDays).toBeGreaterThan(0);
    });

    it('should handle timezone conversion', () => {
      const time = '2024-01-15T10:30:00Z';
      const zurichTime = TimeUtils.toTimezone(time, 'Europe/Zurich');
      expect(zurichTime).toBeDefined();
    });
  });

  describe('HashUtils', () => {
    it('should generate ID', () => {
      const id = HashUtils.generateId();
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate unique IDs', () => {
      const id1 = HashUtils.generateId();
      const id2 = HashUtils.generateId();
      expect(id1).not.toBe(id2);
    });

    it('should hash string', () => {
      const text = 'test string';
      const hash = HashUtils.sha256(text);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64); // SHA256 hex length
    });

    it('should hash object', () => {
      const obj = { test: 'data', number: 123 };
      const hash = HashUtils.hashObject(obj);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });

    it('should generate simHash', () => {
      const text = 'test string for simhash';
      const hash = HashUtils.simHash(text);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });

    it('should generate minHash', () => {
      const text = 'test string for minhash';
      const hash = HashUtils.minHash(text);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });
  });

  describe('AWSHelpers', () => {
    let aws: AWSHelpers;

    beforeEach(() => {
      aws = new AWSHelpers({
        region: 'eu-central-1',
        accessKeyId: 'test-key',
        secretAccessKey: 'test-secret'
      });
    });

    it('should create AWS helpers instance', () => {
      expect(aws).toBeDefined();
    });

    it('should put item to DynamoDB', async () => {
      const item = { id: 'test-id', data: 'test-data' };
      const result = await aws.dynamoPut('test-table', item);
      expect(result).toBeDefined();
    });

    it('should query DynamoDB', async () => {
      const result = await aws.dynamoQuery('test-table', {
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: { ':id': 'test-id' }
      });
      expect(result).toBeDefined();
    });

    it('should upload to S3', async () => {
      const result = await aws.s3Upload('test-bucket', 'test-key', 'test-data');
      expect(result).toBeDefined();
    });

    it('should download from S3', async () => {
      const result = await aws.s3Download('test-bucket', 'test-key');
      expect(result).toBeDefined();
    });

    it('should write to Timestream', async () => {
      const records = [{
        Dimensions: [{ Name: 'test', Value: 'test' }],
        MeasureName: 'test',
        MeasureValue: '1',
        Time: Date.now().toString()
      }];
      const result = await aws.timestreamWrite('test-database', 'test-table', records);
      expect(result).toBeDefined();
    });
  });

  describe('LLMAdapter', () => {
    let llm: LLMAdapter;

    beforeEach(() => {
      llm = new LLMAdapter({
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000,
        timeout: 30,
        apiKey: 'test-key'
      });
    });

    it('should create LLM adapter instance', () => {
      expect(llm).toBeDefined();
    });

    it('should generate text', async () => {
      const result = await llm.generateText('Test prompt');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should generate embedding', async () => {
      const result = await llm.generateEmbedding('Test text');
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should analyze sentiment', async () => {
      const result = await llm.analyzeSentiment('This is a positive text');
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result.sentiment).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      // Mock OpenAI to throw error
      const mockOpenAI = require('openai').OpenAI;
      mockOpenAI.mockImplementationOnce(() => {
        throw new Error('API Error');
      });

      await expect(llm.generateText('Test prompt')).rejects.toThrow('API Error');
    });
  });
});
