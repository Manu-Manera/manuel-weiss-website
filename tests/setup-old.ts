// Test setup and configuration
import { jest } from '@jest/globals';

// Global test setup
beforeAll(async () => {
  // Setup test environment
  process.env.NODE_ENV = 'test';
  process.env.AWS_REGION = 'eu-central-1';
  process.env.AWS_ACCESS_KEY_ID = 'test-key';
  process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
  
  // Mock environment variables
  process.env.OPENAI_API_KEY = 'test-openai-key';
  process.env.TWITTER_API_KEY = 'test-twitter-key';
  process.env.REDDIT_API_KEY = 'test-reddit-key';
  process.env.REUTERS_API_KEY = 'test-reuters-key';
  process.env.BLOOMBERG_API_KEY = 'test-bloomberg-key';
  
  // Mock table names
  process.env.SIGNALS_TABLE_NAME = 'test-signals-table';
  process.env.PROPOSALS_TABLE_NAME = 'test-proposals-table';
  process.env.DECISIONS_TABLE_NAME = 'test-decisions-table';
  process.env.OUTCOMES_TABLE_NAME = 'test-outcomes-table';
  process.env.METRICS_TABLE_NAME = 'test-metrics-table';
  process.env.ALERTS_TABLE_NAME = 'test-alerts-table';
  process.env.COMPLIANCE_CHECKS_TABLE_NAME = 'test-compliance-checks-table';
  process.env.SECURITY_EVENTS_TABLE_NAME = 'test-security-events-table';
  process.env.STREAM_MESSAGES_TABLE_NAME = 'test-stream-messages-table';
  process.env.SECRETS_MANAGER_SECRET_ID = 'test-secrets-manager-secret';
});

afterAll(async () => {
  // Cleanup test environment
  jest.clearAllMocks();
});

// Global test utilities
global.testUtils = {
  // Generate test data
  generateTestSignal: (overrides = {}) => ({
    id: 'test-signal-123',
    source: 'twitter',
    content: 'Test signal content',
    timestamp: new Date().toISOString(),
    scores: {
      fused: 0.8,
      sentiment: 0.7,
      relevance: 0.9,
      novelty: 0.6,
      credibility: 0.8
    },
    confidences: {
      fused: 0.8
    },
    metadata: {
      author: 'test_author',
      language: 'en',
      entities: ['Bitcoin', 'BTC'],
      hashtags: ['#Bitcoin', '#Crypto']
    },
    ...overrides
  }),

  generateTestProposal: (overrides = {}) => ({
    id: 'test-proposal-123',
    thesis: 'Test investment thesis',
    assets: ['BTC', 'ETH'],
    size_pct: 0.05,
    horizon_days: 7,
    entry_price: { BTC: 50000, ETH: 3000 },
    stop_loss: 0.08,
    take_profit: 0.12,
    invalidate_if: ['Risk score exceeds 0.8'],
    explain: 'Test explanation',
    constraints_checked: true,
    status: 'proposed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    risk_score: 0.6,
    expected_return: 0.08,
    sharpe_ratio: 1.2,
    ...overrides
  }),

  generateTestDecision: (overrides = {}) => ({
    id: 'test-decision-123',
    proposal_id: 'test-proposal-123',
    action: 'approve',
    confidence: 0.8,
    size_adjustment: 1.0,
    rationale: 'Test decision rationale',
    rule_results: [
      {
        ruleId: 'risk_threshold',
        ruleName: 'Risk Threshold Rule',
        condition: 'proposal.risk_score > 0.8',
        result: false,
        action: 'reject',
        priority: 1
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  }),

  generateTestOutcome: (overrides = {}) => ({
    id: 'test-outcome-123',
    proposal_id: 'test-proposal-123',
    exit_price: { BTC: 52000, ETH: 3200 },
    return_pct: 0.04,
    volatility: 0.2,
    sharpe_ratio: 1.2,
    max_drawdown: 0.02,
    win_rate: 1.0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  }),

  // Generate test events
  generateAPIGatewayEvent: (overrides = {}) => ({
    body: JSON.stringify({}),
    headers: {
      'Content-Type': 'application/json'
    },
    requestContext: {
      requestId: 'test-request-id',
      connectionId: 'test-connection-id',
      routeKey: '$default'
    },
    queryStringParameters: null,
    pathParameters: null,
    ...overrides
  }),

  // Mock AWS responses
  mockDynamoDBResponse: (items = []) => ({
    Items: items,
    Count: items.length,
    ScannedCount: items.length
  }),

  mockS3Response: (body = 'test data') => ({
    Body: body
  }),

  // Test assertions
  expectValidSignal: (signal) => {
    expect(signal.id).toBeDefined();
    expect(signal.source).toBeDefined();
    expect(signal.content).toBeDefined();
    expect(signal.timestamp).toBeDefined();
    expect(signal.scores).toBeDefined();
    expect(signal.confidences).toBeDefined();
    expect(signal.scores.fused).toBeGreaterThanOrEqual(0);
    expect(signal.scores.fused).toBeLessThanOrEqual(1);
    expect(signal.confidences.fused).toBeGreaterThanOrEqual(0);
    expect(signal.confidences.fused).toBeLessThanOrEqual(1);
  },

  expectValidProposal: (proposal) => {
    expect(proposal.id).toBeDefined();
    expect(proposal.thesis).toBeDefined();
    expect(proposal.assets).toBeDefined();
    expect(proposal.size_pct).toBeGreaterThanOrEqual(0);
    expect(proposal.size_pct).toBeLessThanOrEqual(1);
    expect(proposal.horizon_days).toBeGreaterThan(0);
    expect(proposal.risk_score).toBeGreaterThanOrEqual(0);
    expect(proposal.risk_score).toBeLessThanOrEqual(1);
    expect(proposal.expected_return).toBeDefined();
    expect(proposal.sharpe_ratio).toBeDefined();
  },

  expectValidDecision: (decision) => {
    expect(decision.id).toBeDefined();
    expect(decision.proposal_id).toBeDefined();
    expect(decision.action).toBeDefined();
    expect(decision.confidence).toBeGreaterThanOrEqual(0);
    expect(decision.confidence).toBeLessThanOrEqual(1);
    expect(decision.size_adjustment).toBeGreaterThan(0);
    expect(decision.rationale).toBeDefined();
    expect(decision.rule_results).toBeDefined();
  },

  expectValidOutcome: (outcome) => {
    expect(outcome.id).toBeDefined();
    expect(outcome.proposal_id).toBeDefined();
    expect(outcome.exit_price).toBeDefined();
    expect(outcome.return_pct).toBeDefined();
    expect(outcome.volatility).toBeGreaterThanOrEqual(0);
    expect(outcome.sharpe_ratio).toBeDefined();
    expect(outcome.max_drawdown).toBeGreaterThanOrEqual(0);
    expect(outcome.win_rate).toBeGreaterThanOrEqual(0);
    expect(outcome.win_rate).toBeLessThanOrEqual(1);
  },

  // Performance testing utilities
  measureExecutionTime: async (fn) => {
    const start = Date.now();
    const result = await fn();
    const end = Date.now();
    return {
      result,
      executionTime: end - start
    };
  },

  // Mock external APIs
  mockTwitterAPI: () => {
    const mockAxios = require('axios');
    mockAxios.get.mockResolvedValue({
      data: {
        statuses: [
          {
            id: '1234567890',
            text: 'Bitcoin is going to the moon! 🚀',
            user: { screen_name: 'crypto_trader' },
            created_at: '2024-01-15T10:30:00Z',
            retweet_count: 100,
            favorite_count: 500
          }
        ]
      }
    });
  },

  mockRedditAPI: () => {
    const mockAxios = require('axios');
    mockAxios.get.mockResolvedValue({
      data: {
        data: {
          children: [
            {
              data: {
                id: 'abc123',
                title: 'Bitcoin discussion',
                selftext: 'Bitcoin is the future',
                author: 'reddit_user',
                created_utc: 1642248600,
                score: 100,
                num_comments: 50
              }
            }
          ]
        }
      }
    });
  },

  mockNewsAPI: () => {
    const mockAxios = require('axios');
    mockAxios.get.mockResolvedValue({
      data: {
        articles: [
          {
            title: 'Bitcoin reaches new high',
            description: 'Bitcoin price reaches new all-time high',
            url: 'https://example.com/bitcoin-news',
            publishedAt: '2024-01-15T10:30:00Z',
            source: { name: 'Reuters' }
          }
        ]
      }
    });
  },

  mockOpenAI: () => {
    const mockOpenAI = require('openai');
    mockOpenAI.OpenAI = jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: 'Test response' } }],
            usage: { total_tokens: 100 }
          } as any)
        }
      },
      embeddings: {
        create: jest.fn().mockResolvedValue({
          data: [{ embedding: [0.1, 0.2, 0.3] }]
        } as any)
      }
    }));
  }
};

// Extend Jest matchers
expect.extend({
  toBeValidSignal(received) {
    const pass = received &&
      received.id &&
      received.source &&
      received.content &&
      received.timestamp &&
      received.scores &&
      received.confidences &&
      received.scores.fused >= 0 &&
      received.scores.fused <= 1 &&
      received.confidences.fused >= 0 &&
      received.confidences.fused <= 1;

    return {
      message: () => `expected ${received} to be a valid signal`,
      pass
    };
  },

  toBeValidProposal(received) {
    const pass = received &&
      received.id &&
      received.thesis &&
      received.assets &&
      received.size_pct >= 0 &&
      received.size_pct <= 1 &&
      received.horizon_days > 0 &&
      received.risk_score >= 0 &&
      received.risk_score <= 1;

    return {
      message: () => `expected ${received} to be a valid proposal`,
      pass
    };
  },

  toBeValidDecision(received) {
    const pass = received &&
      received.id &&
      received.proposal_id &&
      received.action &&
      received.confidence >= 0 &&
      received.confidence <= 1 &&
      received.size_adjustment > 0;

    return {
      message: () => `expected ${received} to be a valid decision`,
      pass
    };
  },

  toBeValidOutcome(received) {
    const pass = received &&
      received.id &&
      received.proposal_id &&
      received.exit_price &&
      received.return_pct !== undefined &&
      received.volatility >= 0 &&
      received.sharpe_ratio !== undefined &&
      received.max_drawdown >= 0 &&
      received.win_rate >= 0 &&
      received.win_rate <= 1;

    return {
      message: () => `expected ${received} to be a valid outcome`,
      pass
    };
  }
});

// Global test types
declare global {
  var testUtils: {
    generateTestSignal: (overrides?: any) => any;
    generateTestProposal: (overrides?: any) => any;
    generateTestDecision: (overrides?: any) => any;
    generateTestOutcome: (overrides?: any) => any;
    generateAPIGatewayEvent: (overrides?: any) => any;
    mockDynamoDBResponse: (items?: any[]) => any;
    mockS3Response: (body?: string) => any;
    expectValidSignal: (signal: any) => void;
    expectValidProposal: (proposal: any) => void;
    expectValidDecision: (decision: any) => void;
    expectValidOutcome: (outcome: any) => void;
    measureExecutionTime: (fn: () => Promise<any>) => Promise<{ result: any; executionTime: number }>;
    mockTwitterAPI: () => void;
    mockRedditAPI: () => void;
    mockNewsAPI: () => void;
    mockOpenAI: () => void;
  };
}
