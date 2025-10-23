import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { handler as socialIngestionHandler } from '../../lambda/ingestion-social/index';
import { handler as newsIngestionHandler } from '../../lambda/ingestion-news/index';

// Mock AWS SDK
jest.mock('aws-sdk', () => ({
  DynamoDB: {
    DocumentClient: jest.fn(() => ({
      put: jest.fn().mockReturnValue({ promise: () => Promise.resolve({}) }),
      query: jest.fn().mockReturnValue({ promise: () => Promise.resolve({ Items: [] }) })
    }))
  },
  S3: jest.fn(() => ({
    upload: jest.fn().mockReturnValue({ promise: () => Promise.resolve({}) })
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

describe('Ingestion Integration Tests', () => {
  describe('Social Media Ingestion', () => {
    let mockEvent: any;

    beforeEach(() => {
      mockEvent = {
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
    });

    it('should ingest social media signals successfully', async () => {
      const result = await socialIngestionHandler(mockEvent);
      
      expect(result.statusCode).toBe(200);
      expect(result.body).toBeDefined();
      
      const response = JSON.parse(result.body);
      expect(response.ok).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data.signals).toBeDefined();
      expect(Array.isArray(response.data.signals)).toBe(true);
    });

    it('should handle invalid request body', async () => {
      mockEvent.body = JSON.stringify({
        sources: 'invalid',
        timeframe: '24h',
        userId: 'test-user'
      });

      const result = await socialIngestionHandler(mockEvent);
      
      expect(result.statusCode).toBe(400);
      expect(result.body).toBeDefined();
      
      const response = JSON.parse(result.body);
      expect(response.ok).toBe(false);
      expect(response.error).toBeDefined();
    });

    it('should handle missing request body', async () => {
      mockEvent.body = null;

      const result = await socialIngestionHandler(mockEvent);
      
      expect(result.statusCode).toBe(400);
      expect(result.body).toBeDefined();
      
      const response = JSON.parse(result.body);
      expect(response.ok).toBe(false);
      expect(response.error).toBeDefined();
    });

    it('should process signals with proper scoring', async () => {
      const result = await socialIngestionHandler(mockEvent);
      
      expect(result.statusCode).toBe(200);
      
      const response = JSON.parse(result.body);
      expect(response.data.signals.length).toBeGreaterThan(0);
      
      const signal = response.data.signals[0];
      expect(signal.scores).toBeDefined();
      expect(signal.scores.fused).toBeDefined();
      expect(signal.scores.sentiment).toBeDefined();
      expect(signal.scores.relevance).toBeDefined();
      expect(signal.scores.novelty).toBeDefined();
      expect(signal.scores.credibility).toBeDefined();
    });

    it('should handle rate limiting', async () => {
      // Mock rate limiting response
      const mockAxios = require('axios');
      mockAxios.get.mockRejectedValueOnce({
        response: {
          status: 429,
          data: { error: 'Rate limit exceeded' }
        }
      });

      const result = await socialIngestionHandler(mockEvent);
      
      expect(result.statusCode).toBe(200);
      
      const response = JSON.parse(result.body);
      expect(response.data.errors).toBeGreaterThan(0);
    });

    it('should handle API errors gracefully', async () => {
      // Mock API error
      const mockAxios = require('axios');
      mockAxios.get.mockRejectedValueOnce(new Error('API Error'));

      const result = await socialIngestionHandler(mockEvent);
      
      expect(result.statusCode).toBe(200);
      
      const response = JSON.parse(result.body);
      expect(response.data.errors).toBeGreaterThan(0);
    });
  });

  describe('News Ingestion', () => {
    let mockEvent: any;

    beforeEach(() => {
      mockEvent = {
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
    });

    it('should ingest news signals successfully', async () => {
      const result = await newsIngestionHandler(mockEvent);
      
      expect(result.statusCode).toBe(200);
      expect(result.body).toBeDefined();
      
      const response = JSON.parse(result.body);
      expect(response.ok).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data.signals).toBeDefined();
      expect(Array.isArray(response.data.signals)).toBe(true);
    });

    it('should handle invalid request body', async () => {
      mockEvent.body = JSON.stringify({
        sources: 'invalid',
        timeframe: '24h',
        userId: 'test-user'
      });

      const result = await newsIngestionHandler(mockEvent);
      
      expect(result.statusCode).toBe(400);
      expect(result.body).toBeDefined();
      
      const response = JSON.parse(result.body);
      expect(response.ok).toBe(false);
      expect(response.error).toBeDefined();
    });

    it('should process news with proper classification', async () => {
      const result = await newsIngestionHandler(mockEvent);
      
      expect(result.statusCode).toBe(200);
      
      const response = JSON.parse(result.body);
      expect(response.data.signals.length).toBeGreaterThan(0);
      
      const signal = response.data.signals[0];
      expect(signal.classification).toBeDefined();
      expect(signal.entities).toBeDefined();
      expect(signal.sentiment).toBeDefined();
    });

    it('should handle different news sources', async () => {
      const sources = ['reuters', 'bloomberg', 'ft', 'wsj'];
      
      for (const source of sources) {
        mockEvent.body = JSON.stringify({
          sources: [source],
          timeframe: '24h',
          userId: 'test-user'
        });

        const result = await newsIngestionHandler(mockEvent);
        
        expect(result.statusCode).toBe(200);
        
        const response = JSON.parse(result.body);
        expect(response.ok).toBe(true);
      }
    });

    it('should handle API errors gracefully', async () => {
      // Mock API error
      const mockAxios = require('axios');
      mockAxios.get.mockRejectedValueOnce(new Error('API Error'));

      const result = await newsIngestionHandler(mockEvent);
      
      expect(result.statusCode).toBe(200);
      
      const response = JSON.parse(result.body);
      expect(response.data.errors).toBeGreaterThan(0);
    });
  });

  describe('Data Quality Tests', () => {
    it('should validate signal data structure', async () => {
      const mockEvent = {
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

      const result = await socialIngestionHandler(mockEvent);
      
      expect(result.statusCode).toBe(200);
      
      const response = JSON.parse(result.body);
      const signal = response.data.signals[0];
      
      // Validate signal structure
      expect(signal.id).toBeDefined();
      expect(signal.source).toBeDefined();
      expect(signal.content).toBeDefined();
      expect(signal.timestamp).toBeDefined();
      expect(signal.scores).toBeDefined();
      expect(signal.confidences).toBeDefined();
    });

    it('should validate score ranges', async () => {
      const mockEvent = {
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

      const result = await socialIngestionHandler(mockEvent);
      
      expect(result.statusCode).toBe(200);
      
      const response = JSON.parse(result.body);
      const signal = response.data.signals[0];
      
      // Validate score ranges
      expect(signal.scores.fused).toBeGreaterThanOrEqual(0);
      expect(signal.scores.fused).toBeLessThanOrEqual(1);
      expect(signal.scores.sentiment).toBeGreaterThanOrEqual(0);
      expect(signal.scores.sentiment).toBeLessThanOrEqual(1);
      expect(signal.scores.relevance).toBeGreaterThanOrEqual(0);
      expect(signal.scores.relevance).toBeLessThanOrEqual(1);
      expect(signal.scores.novelty).toBeGreaterThanOrEqual(0);
      expect(signal.scores.novelty).toBeLessThanOrEqual(1);
      expect(signal.scores.credibility).toBeGreaterThanOrEqual(0);
      expect(signal.scores.credibility).toBeLessThanOrEqual(1);
    });

    it('should validate confidence ranges', async () => {
      const mockEvent = {
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

      const result = await socialIngestionHandler(mockEvent);
      
      expect(result.statusCode).toBe(200);
      
      const response = JSON.parse(result.body);
      const signal = response.data.signals[0];
      
      // Validate confidence ranges
      expect(signal.confidences.fused).toBeGreaterThanOrEqual(0);
      expect(signal.confidences.fused).toBeLessThanOrEqual(1);
    });
  });

  describe('Performance Tests', () => {
    it('should complete ingestion within timeout', async () => {
      const startTime = Date.now();
      
      const mockEvent = {
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

      const result = await socialIngestionHandler(mockEvent);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(result.statusCode).toBe(200);
      expect(duration).toBeLessThan(30000); // 30 seconds timeout
    });

    it('should handle concurrent requests', async () => {
      const mockEvent = {
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

      const promises = Array(5).fill(null).map(() => socialIngestionHandler(mockEvent));
      const results = await Promise.all(promises);
      
      results.forEach(result => {
        expect(result.statusCode).toBe(200);
      });
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle network timeouts', async () => {
      // Mock network timeout
      const mockAxios = require('axios');
      mockAxios.get.mockRejectedValueOnce({
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded'
      });

      const mockEvent = {
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

      const result = await socialIngestionHandler(mockEvent);
      
      expect(result.statusCode).toBe(200);
      
      const response = JSON.parse(result.body);
      expect(response.data.errors).toBeGreaterThan(0);
    });

    it('should handle malformed API responses', async () => {
      // Mock malformed response
      const mockAxios = require('axios');
      mockAxios.get.mockResolvedValueOnce({
        data: 'invalid json'
      });

      const mockEvent = {
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

      const result = await socialIngestionHandler(mockEvent);
      
      expect(result.statusCode).toBe(200);
      
      const response = JSON.parse(result.body);
      expect(response.data.errors).toBeGreaterThan(0);
    });

    it('should handle missing API keys', async () => {
      // Mock missing API key error
      const mockAxios = require('axios');
      mockAxios.get.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { error: 'Unauthorized' }
        }
      });

      const mockEvent = {
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

      const result = await socialIngestionHandler(mockEvent);
      
      expect(result.statusCode).toBe(200);
      
      const response = JSON.parse(result.body);
      expect(response.data.errors).toBeGreaterThan(0);
    });
  });
});
