// Simple Test Setup for AI Investment System
import { jest } from '@jest/globals';

// Basic environment setup
process.env.NODE_ENV = 'test';
process.env.AWS_REGION = 'eu-central-1';
process.env.DYNAMODB_TABLE_PREFIX = 'ai-investment-test';
process.env.S3_BUCKET_PREFIX = 'ai-investment-test';
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-openai-key';
process.env.TWITTER_API_KEY = 'test-twitter-key';
process.env.REDDIT_API_KEY = 'test-reddit-key';

// Use real console for live testing
// Keep original console for real output

// Global test utilities
(global as any).testUtils = {
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

// Setup before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Cleanup after each test
afterEach(() => {
  jest.restoreAllMocks();
});

// Global test timeout
jest.setTimeout(30000);

export {};
