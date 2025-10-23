import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { handler as socialIngestionHandler } from '../../lambda/ingestion-social/index';
import { handler as newsIngestionHandler } from '../../lambda/ingestion-news/index';
import { handler as scoringHandler } from '../../lambda/scoring/index';
import { handler as orchestratorHandler } from '../../lambda/orchestrator/index';
import { handler as decisionHandler } from '../../lambda/decision/index';

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
    getObject: jest.fn().mockReturnValue({ promise: () => Promise.resolve({ Body: 'test' }) })
  }))
}));

// Mock external APIs
jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue({
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
  }),
  post: jest.fn().mockResolvedValue({
    data: {
      access_token: 'mock_access_token'
    }
  })
}));

// Mock OpenAI
jest.mock('openai', () => ({
  OpenAI: jest.fn(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Positive sentiment' } }],
          usage: { total_tokens: 100 }
        })
      }
    }
  }))
}));

describe('End-to-End Workflow Tests', () => {
  let testSignals: any[] = [];
  let testProposals: any[] = [];
  let testDecisions: any[] = [];
  let testOutcomes: any[] = [];

  beforeEach(() => {
    // Reset test data
    testSignals = [];
    testProposals = [];
    testDecisions = [];
    testOutcomes = [];
  });

  describe('Complete Investment Workflow', () => {
    it('should execute complete investment workflow from signals to outcomes', async () => {
      // Step 1: Ingest social media signals
      const socialEvent = {
        body: JSON.stringify({
          sources: ['twitter', 'reddit'],
          timeframe: '24h',
          userId: 'test-user'
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        requestContext: {
          requestId: 'test-request-id'
        }
      };

      const socialResult = await socialIngestionHandler(socialEvent);
      expect(socialResult.statusCode).toBe(200);
      
      const socialResponse = JSON.parse(socialResult.body);
      expect(socialResponse.ok).toBe(true);
      expect(socialResponse.data.signals.length).toBeGreaterThan(0);
      
      testSignals = socialResponse.data.signals;

      // Step 2: Ingest news signals
      const newsEvent = {
        body: JSON.stringify({
          sources: ['reuters', 'bloomberg'],
          timeframe: '24h',
          userId: 'test-user'
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        requestContext: {
          requestId: 'test-request-id'
        }
      };

      const newsResult = await newsIngestionHandler(newsEvent);
      expect(newsResult.statusCode).toBe(200);
      
      const newsResponse = JSON.parse(newsResult.body);
      expect(newsResponse.ok).toBe(true);
      expect(newsResponse.data.signals.length).toBeGreaterThan(0);
      
      testSignals = [...testSignals, ...newsResponse.data.signals];

      // Step 3: Score and fuse signals
      const scoringEvent = {
        body: JSON.stringify({
          signals: testSignals,
          userId: 'test-user'
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        requestContext: {
          requestId: 'test-request-id'
        }
      };

      const scoringResult = await scoringHandler(scoringEvent);
      expect(scoringResult.statusCode).toBe(200);
      
      const scoringResponse = JSON.parse(scoringResult.body);
      expect(scoringResponse.ok).toBe(true);
      expect(scoringResponse.data.scored_signals.length).toBeGreaterThan(0);

      // Step 4: Generate investment proposal
      const proposalEvent = {
        body: JSON.stringify({
          signals: scoringResponse.data.scored_signals,
          assets: ['BTC', 'ETH'],
          timeframe: '7d',
          userId: 'test-user'
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        requestContext: {
          requestId: 'test-request-id'
        }
      };

      const proposalResult = await orchestratorHandler(proposalEvent);
      expect(proposalResult.statusCode).toBe(200);
      
      const proposalResponse = JSON.parse(proposalResult.body);
      expect(proposalResponse.ok).toBe(true);
      expect(proposalResponse.data).toBeDefined();
      expect(proposalResponse.data.id).toBeDefined();
      expect(proposalResponse.data.assets).toBeDefined();
      expect(proposalResponse.data.risk_score).toBeDefined();
      
      testProposals = [proposalResponse.data];

      // Step 5: Make investment decision
      const decisionEvent = {
        body: JSON.stringify({
          proposal: proposalResponse.data,
          context: {
            portfolio_concentration: 0.3,
            market_conditions: 'bullish',
            user_risk_tolerance: 'moderate'
          },
          userId: 'test-user'
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        requestContext: {
          requestId: 'test-request-id'
        }
      };

      const decisionResult = await decisionHandler(decisionEvent);
      expect(decisionResult.statusCode).toBe(200);
      
      const decisionResponse = JSON.parse(decisionResult.body);
      expect(decisionResponse.ok).toBe(true);
      expect(decisionResponse.data).toBeDefined();
      expect(decisionResponse.data.action).toBeDefined();
      expect(decisionResponse.data.confidence).toBeDefined();
      
      testDecisions = [decisionResponse.data];

      // Step 6: Simulate outcome (if decision was approve)
      if (decisionResponse.data.action === 'approve') {
        const outcome = {
          id: 'outcome-123',
          proposal_id: proposalResponse.data.id,
          exit_price: { BTC: 52000, ETH: 3200 },
          return_pct: 0.04,
          volatility: 0.2,
          sharpe_ratio: 1.2,
          max_drawdown: 0.02,
          win_rate: 1.0,
          created_at: new Date().toISOString()
        };

        testOutcomes = [outcome];

        // Step 7: Evaluate outcome
        const evaluationEvent = {
          body: JSON.stringify({
            proposal: proposalResponse.data,
            outcome: outcome,
            userId: 'test-user'
          }),
          headers: {
            'Content-Type': 'application/json'
          },
          requestContext: {
            requestId: 'test-request-id'
          }
        };

        const evaluationResult = await decisionHandler(evaluationEvent);
        expect(evaluationResult.statusCode).toBe(200);
        
        const evaluationResponse = JSON.parse(evaluationResult.body);
        expect(evaluationResponse.ok).toBe(true);
        expect(evaluationResponse.data).toBeDefined();
        expect(evaluationResponse.data.performance).toBeDefined();
        expect(evaluationResponse.data.decision_quality).toBeDefined();
      }

      // Verify complete workflow
      expect(testSignals.length).toBeGreaterThan(0);
      expect(testProposals.length).toBeGreaterThan(0);
      expect(testDecisions.length).toBeGreaterThan(0);
    });

    it('should handle workflow with risk rejection', async () => {
      // Create high-risk proposal
      const highRiskProposal = {
        id: 'proposal-high-risk',
        thesis: 'High risk investment',
        assets: ['BTC'],
        size_pct: 0.2,
        horizon_days: 7,
        risk_score: 0.9, // High risk
        expected_return: 0.15,
        sharpe_ratio: 0.5,
        status: 'proposed',
        created_at: new Date().toISOString()
      };

      const decisionEvent = {
        body: JSON.stringify({
          proposal: highRiskProposal,
          context: {
            portfolio_concentration: 0.8,
            market_conditions: 'bearish',
            user_risk_tolerance: 'conservative'
          },
          userId: 'test-user'
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        requestContext: {
          requestId: 'test-request-id'
        }
      };

      const decisionResult = await decisionHandler(decisionEvent);
      expect(decisionResult.statusCode).toBe(200);
      
      const decisionResponse = JSON.parse(decisionResult.body);
      expect(decisionResponse.ok).toBe(true);
      expect(decisionResponse.data.action).toBe('reject');
      expect(decisionResponse.data.confidence).toBeGreaterThan(0.8);
    });

    it('should handle workflow with position size reduction', async () => {
      // Create large position proposal
      const largePositionProposal = {
        id: 'proposal-large-position',
        thesis: 'Large position investment',
        assets: ['BTC'],
        size_pct: 0.15, // Large position
        horizon_days: 7,
        risk_score: 0.6,
        expected_return: 0.10,
        sharpe_ratio: 1.0,
        status: 'proposed',
        created_at: new Date().toISOString()
      };

      const decisionEvent = {
        body: JSON.stringify({
          proposal: largePositionProposal,
          context: {
            portfolio_concentration: 0.7,
            market_conditions: 'neutral',
            user_risk_tolerance: 'moderate'
          },
          userId: 'test-user'
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        requestContext: {
          requestId: 'test-request-id'
        }
      };

      const decisionResult = await decisionHandler(decisionEvent);
      expect(decisionResult.statusCode).toBe(200);
      
      const decisionResponse = JSON.parse(decisionResult.body);
      expect(decisionResponse.ok).toBe(true);
      expect(decisionResponse.data.action).toBe('reduce_size');
      expect(decisionResponse.data.size_adjustment).toBeLessThan(1.0);
    });
  });

  describe('Data Flow Validation', () => {
    it('should maintain data consistency across workflow', async () => {
      // Start with signals
      const socialEvent = {
        body: JSON.stringify({
          sources: ['twitter'],
          timeframe: '24h',
          userId: 'test-user'
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        requestContext: {
          requestId: 'test-request-id'
        }
      };

      const socialResult = await socialIngestionHandler(socialEvent);
      const socialResponse = JSON.parse(socialResult.body);
      const signals = socialResponse.data.signals;

      // Score signals
      const scoringEvent = {
        body: JSON.stringify({
          signals: signals,
          userId: 'test-user'
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        requestContext: {
          requestId: 'test-request-id'
        }
      };

      const scoringResult = await scoringHandler(scoringEvent);
      const scoringResponse = JSON.parse(scoringResult.body);
      const scoredSignals = scoringResponse.data.scored_signals;

      // Verify signal data consistency
      expect(scoredSignals.length).toBe(signals.length);
      scoredSignals.forEach((scoredSignal, index) => {
        expect(scoredSignal.id).toBe(signals[index].id);
        expect(scoredSignal.source).toBe(signals[index].source);
        expect(scoredSignal.content).toBe(signals[index].content);
        expect(scoredSignal.scores).toBeDefined();
        expect(scoredSignal.confidences).toBeDefined();
      });

      // Generate proposal
      const proposalEvent = {
        body: JSON.stringify({
          signals: scoredSignals,
          assets: ['BTC'],
          timeframe: '7d',
          userId: 'test-user'
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        requestContext: {
          requestId: 'test-request-id'
        }
      };

      const proposalResult = await orchestratorHandler(proposalEvent);
      const proposalResponse = JSON.parse(proposalResult.body);
      const proposal = proposalResponse.data;

      // Verify proposal data consistency
      expect(proposal.id).toBeDefined();
      expect(proposal.assets).toBeDefined();
      expect(proposal.risk_score).toBeGreaterThanOrEqual(0);
      expect(proposal.risk_score).toBeLessThanOrEqual(1);
      expect(proposal.expected_return).toBeDefined();
      expect(proposal.sharpe_ratio).toBeDefined();
    });

    it('should handle error propagation correctly', async () => {
      // Test with invalid signals
      const invalidSignals = [
        {
          id: 'invalid-signal',
          source: 'twitter',
          content: '',
          scores: { fused: 0.5 },
          confidences: { fused: 0.5 }
        }
      ];

      const scoringEvent = {
        body: JSON.stringify({
          signals: invalidSignals,
          userId: 'test-user'
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        requestContext: {
          requestId: 'test-request-id'
        }
      };

      const scoringResult = await scoringHandler(scoringEvent);
      expect(scoringResult.statusCode).toBe(200);
      
      const scoringResponse = JSON.parse(scoringResult.body);
      expect(scoringResponse.ok).toBe(true);
      expect(scoringResponse.data.conflicts.length).toBeGreaterThan(0);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large signal volumes', async () => {
      // Generate large number of signals
      const largeSignalSet = Array(100).fill(null).map((_, index) => ({
        id: `signal-${index}`,
        source: 'twitter',
        content: `Test signal ${index}`,
        scores: { fused: Math.random() },
        confidences: { fused: Math.random() }
      }));

      const scoringEvent = {
        body: JSON.stringify({
          signals: largeSignalSet,
          userId: 'test-user'
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        requestContext: {
          requestId: 'test-request-id'
        }
      };

      const startTime = Date.now();
      const scoringResult = await scoringHandler(scoringEvent);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(scoringResult.statusCode).toBe(200);
      expect(duration).toBeLessThan(30000); // 30 seconds timeout
      
      const scoringResponse = JSON.parse(scoringResult.body);
      expect(scoringResponse.data.scored_signals.length).toBe(100);
    });

    it('should handle concurrent workflow executions', async () => {
      const workflowPromises = Array(5).fill(null).map(async (_, index) => {
        const socialEvent = {
          body: JSON.stringify({
            sources: ['twitter'],
            timeframe: '24h',
            userId: `test-user-${index}`
          }),
          headers: {
            'Content-Type': 'application/json'
          },
          requestContext: {
            requestId: `test-request-id-${index}`
          }
        };

        return await socialIngestionHandler(socialEvent);
      });

      const results = await Promise.all(workflowPromises);
      
      results.forEach(result => {
        expect(result.statusCode).toBe(200);
      });
    });
  });

  describe('Error Recovery', () => {
    it('should recover from partial failures', async () => {
      // Mock partial API failure
      const mockAxios = require('axios');
      mockAxios.get
        .mockResolvedValueOnce({
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
        })
        .mockRejectedValueOnce(new Error('API Error'));

      const socialEvent = {
        body: JSON.stringify({
          sources: ['twitter', 'reddit'],
          timeframe: '24h',
          userId: 'test-user'
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        requestContext: {
          requestId: 'test-request-id'
        }
      };

      const result = await socialIngestionHandler(socialEvent);
      expect(result.statusCode).toBe(200);
      
      const response = JSON.parse(result.body);
      expect(response.ok).toBe(true);
      expect(response.data.signals.length).toBeGreaterThan(0);
      expect(response.data.errors).toBeGreaterThan(0);
    });

    it('should handle timeout scenarios', async () => {
      // Mock timeout
      const mockAxios = require('axios');
      mockAxios.get.mockImplementation(() => 
        new Promise((resolve, reject) => {
          setTimeout(() => reject(new Error('timeout')), 100);
        })
      );

      const socialEvent = {
        body: JSON.stringify({
          sources: ['twitter'],
          timeframe: '24h',
          userId: 'test-user'
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        requestContext: {
          requestId: 'test-request-id'
        }
      };

      const result = await socialIngestionHandler(socialEvent);
      expect(result.statusCode).toBe(200);
      
      const response = JSON.parse(result.body);
      expect(response.data.errors).toBeGreaterThan(0);
    });
  });
});
