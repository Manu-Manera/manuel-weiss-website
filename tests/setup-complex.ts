// Test Setup for AI Investment System
import { jest } from '@jest/globals';

// Mock AWS SDK
jest.mock('aws-sdk', () => ({
  DynamoDB: {
    DocumentClient: jest.fn().mockImplementation(() => ({
      put: jest.fn().mockReturnValue({ promise: jest.fn().mockResolvedValue({}) }),
      get: jest.fn().mockReturnValue({ promise: jest.fn().mockResolvedValue({}) }),
      query: jest.fn().mockReturnValue({ promise: jest.fn().mockResolvedValue({ Items: [] }) }),
      scan: jest.fn().mockReturnValue({ promise: jest.fn().mockResolvedValue({ Items: [] }) }),
      update: jest.fn().mockReturnValue({ promise: jest.fn().mockResolvedValue({}) }),
      delete: jest.fn().mockReturnValue({ promise: jest.fn().mockResolvedValue({}) })
    }))
  },
  S3: jest.fn().mockImplementation(() => ({
    upload: jest.fn().mockReturnValue({ promise: jest.fn().mockResolvedValue({}) }),
    getObject: jest.fn().mockReturnValue({ promise: jest.fn().mockResolvedValue({ Body: Buffer.from('test') }) }),
    deleteObject: jest.fn().mockReturnValue({ promise: jest.fn().mockResolvedValue({}) })
  })),
  SecretsManager: jest.fn().mockImplementation(() => ({
    getSecretValue: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        SecretString: JSON.stringify({ apiKey: 'test-key' })
      })
    })
  })),
  KMS: jest.fn().mockImplementation(() => ({
    encrypt: jest.fn().mockReturnValue({ promise: jest.fn().mockResolvedValue({ CiphertextBlob: Buffer.from('encrypted') }) }),
    decrypt: jest.fn().mockReturnValue({ promise: jest.fn().mockResolvedValue({ Plaintext: Buffer.from('decrypted') }) })
  }))
}));

// Mock OpenAI
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
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

// Mock Axios
jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue({ data: {} }),
  post: jest.fn().mockResolvedValue({ data: {} }),
  put: jest.fn().mockResolvedValue({ data: {} }),
  delete: jest.fn().mockResolvedValue({ data: {} })
}));

// Mock UUID
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid-123')
}));

// Mock Day.js
jest.mock('dayjs', () => {
  const originalDayjs = jest.requireActual('dayjs');
  return jest.fn(() => originalDayjs('2024-01-15T10:30:00Z'));
});

// Global test utilities
global.testUtils = {
  mockAWS: () => {
    const AWS = require('aws-sdk');
    return AWS;
  },

  mockOpenAI: () => {
    const OpenAI = require('openai');
    return OpenAI;
  },

  createMockSignal: (overrides = {}) => ({
    id: 'signal-123',
    source: 'twitter',
    content: 'Test signal content',
    score: 0.85,
    confidence: 0.92,
    timestamp: '2024-01-15T10:30:00Z',
    metadata: {
      author: '@testuser',
      followers: 1000,
      verified: false
    },
    ...overrides
  }),

  createMockProposal: (overrides = {}) => ({
    id: 'proposal-123',
    symbol: 'TSLA',
    action: 'buy',
    quantity: 100,
    price: 250.50,
    risk_score: 0.65,
    expected_return: 0.15,
    sharpe_ratio: 1.2,
    status: 'pending',
    created_at: '2024-01-15T10:30:00Z',
    signals: ['signal-123'],
    ...overrides
  }),

  createMockDecision: (overrides = {}) => ({
    id: 'decision-123',
    proposal_id: 'proposal-123',
    action: 'approved',
    reasoning: 'Strong signals and acceptable risk',
    approved_by: 'user-123',
    approved_at: '2024-01-15T10:35:00Z',
    ...overrides
  }),

  createMockOutcome: (overrides = {}) => ({
    id: 'outcome-123',
    decision_id: 'decision-123',
    symbol: 'TSLA',
    action: 'buy',
    executed_price: 250.75,
    current_price: 255.20,
    quantity: 100,
    pnl: 445.00,
    pnl_percentage: 1.78,
    created_at: '2024-01-15T10:40:00Z',
    updated_at: '2024-01-15T15:30:00Z',
    ...overrides
  })
};

// Extend Jest matchers
expect.extend({
  toBeValidSignal(received) {
    const pass = received &&
      typeof received.id === 'string' &&
      typeof received.source === 'string' &&
      typeof received.content === 'string' &&
      typeof received.score === 'number' &&
      received.score >= 0 && received.score <= 1 &&
      typeof received.timestamp === 'string';

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid signal`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid signal`,
        pass: false
      };
    }
  },

  toBeValidProposal(received) {
    const pass = received &&
      typeof received.id === 'string' &&
      typeof received.symbol === 'string' &&
      ['buy', 'sell'].includes(received.action) &&
      typeof received.quantity === 'number' &&
      typeof received.price === 'number' &&
      typeof received.risk_score === 'number' &&
      received.risk_score >= 0 && received.risk_score <= 1;

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid proposal`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid proposal`,
        pass: false
      };
    }
  },

  toBeValidDecision(received) {
    const pass = received &&
      typeof received.id === 'string' &&
      typeof received.proposal_id === 'string' &&
      ['approved', 'rejected', 'pending'].includes(received.action) &&
      typeof received.reasoning === 'string';

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid decision`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid decision`,
        pass: false
      };
    }
  }
});

// Setup before each test
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset environment variables
  process.env.NODE_ENV = 'test';
  process.env.AWS_REGION = 'eu-central-1';
  process.env.DYNAMODB_TABLE_PREFIX = 'ai-investment-test';
  process.env.S3_BUCKET_PREFIX = 'ai-investment-test';
  process.env.OPENAI_API_KEY = 'test-openai-key';
  process.env.TWITTER_API_KEY = 'test-twitter-key';
  process.env.REDDIT_API_KEY = 'test-reddit-key';
});

// Cleanup after each test
afterEach(() => {
  // Clean up any resources
  jest.restoreAllMocks();
});

// Global test timeout
jest.setTimeout(30000);

// Console setup for tests
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Export for use in tests
export {};
