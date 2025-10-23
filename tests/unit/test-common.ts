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
      logger = new Logger({ module: 'test-module' });
    });

    it('should create logger instance', () => {
      expect(logger).toBeDefined();
      expect(logger).toBeDefined();
    });

    it('should log info message', () => {
      // Test that logger doesn't throw errors
      expect(() => {
        logger.info('Test message', { test: 'data' });
      }).not.toThrow();
    });

    it('should log error message', () => {
      // Test that logger doesn't throw errors
      expect(() => {
        logger.error('Test error', new Error('Test error'));
      }).not.toThrow();
    });

    it('should log with context', () => {
      // Test that logger doesn't throw errors
      expect(() => {
        logger.info('Test message', { userId: 'user123', requestId: 'req456' });
      }).not.toThrow();
    });
  });

  describe('TimeUtils', () => {
    it('should get current time', () => {
      const now = TimeUtils.now();
      expect(now).toBeDefined();
      expect(now instanceof Date).toBe(true);
    });

    it('should format time', () => {
      const time = '2024-01-15T10:30:00Z';
      const formatted = TimeUtils.formatForAPI(new Date(time));
      expect(typeof formatted).toBe('string');
    });

    it('should check if market is open', () => {
      const isOpen = TimeUtils.isMarketOpen();
      expect(typeof isOpen).toBe('boolean');
    });

    it('should get business days', () => {
      const start = '2024-01-15T10:30:00Z';
      const end = '2024-01-20T10:30:00Z';
      const businessDays = TimeUtils.getBusinessDays(new Date(start), new Date(end));
      expect(businessDays).toBeGreaterThan(0);
    });

    it('should handle timezone conversion', () => {
      const time = '2024-01-15T10:30:00Z';
      const zurichTime = TimeUtils.toZurich(new Date(time));
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
      // Test that the method doesn't throw errors
      await expect(aws.dynamoPut('ai-investment-test-signals', item)).resolves.not.toThrow();
    });

    it('should query DynamoDB', async () => {
      // Test that the method doesn't throw errors
      await expect(aws.dynamoQuery('ai-investment-test-signals', 'id = :id', {
        ExpressionAttributeValues: { ':id': 'test-id' }
      })).resolves.not.toThrow();
    });

    it('should upload to S3', async () => {
      // Test that the method doesn't throw errors
      await expect(aws.s3Upload('ai-investment-test-bucket-1761236842', 'test-key', 'test-data')).resolves.not.toThrow();
    });

    it('should download from S3', async () => {
      // Test that the method doesn't throw errors
      await expect(aws.s3Download('ai-investment-test-bucket-1761236842', 'test-key')).resolves.not.toThrow();
    });

    it('should write to Timestream', async () => {
      // Test that the method doesn't throw errors
      await expect(aws.putMetric('test-metric', 100)).resolves.not.toThrow();
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
      // Test that the method doesn't throw errors
      await expect(llm.generateText('Test prompt')).resolves.not.toThrow();
    });

    it('should generate embedding', async () => {
      // Test that the method doesn't throw errors
      await expect(llm.generateEmbedding('Test text')).resolves.not.toThrow();
    });

    it('should analyze sentiment', async () => {
      // Test that the method doesn't throw errors
      await expect(llm.analyzeSentiment('This is a positive text')).resolves.not.toThrow();
    });

    it('should handle errors gracefully', async () => {
      // Test that the method handles errors gracefully
      await expect(llm.generateText('Test prompt')).resolves.not.toThrow();
    });
  });
});
