import { z } from 'zod';
import { 
  SignalSchema, 
  ProposalSchema, 
  OutcomeSchema,
  ApiResponseSchema,
  PaginationSchema,
  FilterSchema,
  HealthCheckSchema,
  MetricsSchema,
  WebSocketMessageSchema,
  SSEEventSchema
} from './schemas';

// Core Types
export type Signal = z.infer<typeof SignalSchema>;
export type Proposal = z.infer<typeof ProposalSchema>;
export type Outcome = z.infer<typeof OutcomeSchema>;

// API Types
export type ApiResponse<T = any> = z.infer<typeof ApiResponseSchema> & {
  data?: T;
};

export type Pagination = z.infer<typeof PaginationSchema>;
export type Filter = z.infer<typeof FilterSchema>;
export type HealthCheck = z.infer<typeof HealthCheckSchema>;
export type Metrics = z.infer<typeof MetricsSchema>;

// WebSocket Types
export type WebSocketMessage = z.infer<typeof WebSocketMessageSchema>;
export type SSEEvent = z.infer<typeof SSEEventSchema>;

// Configuration Types
export interface LLMConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
  apiKey?: string;
}

export interface AWSConfig {
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
}

export interface DatabaseConfig {
  tableName: string;
  region: string;
  endpoint?: string;
}

export interface CacheConfig {
  ttl: number;
  maxSize: number;
  strategy: 'lru' | 'lfu' | 'fifo';
}

// Feature Types
export interface FeatureVector {
  sentiment: number;
  emotion: number;
  topic: string[];
  recency: number;
  frequency: number;
  volatility: number;
  engagement: number;
  virality: number;
  authority: number;
  marketSentiment: number;
  sectorCorrelation: number;
  volatilityIndex: number;
  sourceDiversity: number;
  consensus: number;
  disagreement: number;
}

export interface ScoreResult {
  score: number;
  confidence: number;
  attribution: AttributionResult;
  method: string;
}

export interface AttributionResult {
  topFactors: Array<{
    factor: string;
    contribution: number;
    direction: 'positive' | 'negative' | 'neutral';
  }>;
  explanation: string;
  confidence: number;
}

export interface FusedScore {
  score: number;
  confidence: number;
  attribution: AttributionResult;
  method: string;
}

// Risk Types
export interface RiskAssessment {
  overall_risk: number;
  var: {
    historical: number;
    parametric: number;
    monte_carlo: number;
    cornish_fisher: number;
  };
  cvar: {
    historical: number;
    monte_carlo: number;
  };
  volatility: number;
  correlation: number[][];
  liquidity: number;
  recommendations: string[];
}

export interface PortfolioRisk {
  overall_risk: number;
  recommendations: string[];
  limits: {
    max_exposure: number;
    max_correlation: number;
    max_volatility: number;
  };
}

// Learning Types
export interface LearningMetrics {
  hitRate: {
    '7d': number;
    '30d': number;
    '90d': number;
  };
  sharpeRatio: number;
  reliability: number;
  abTests: Array<{
    name: string;
    variant: string;
    performance: number;
    confidence: number;
  }>;
}

export interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  confusionMatrix: number[][];
}

// Market Types
export interface MarketContext {
  current_prices: Record<string, number>;
  volatility: Record<string, number>;
  correlation: number[][];
  volume: Record<string, number>;
  market_cap: Record<string, number>;
  sector: Record<string, string>;
  region: Record<string, string>;
}

export interface MarketData {
  asset: string;
  price: number;
  volume: number;
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
  changePercent: number;
}

// Event Types
export interface Event {
  id: string;
  type: string;
  data: any;
  timestamp: Date;
  source: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  timestamp: Date;
  source: string;
  acknowledged: boolean;
  resolved: boolean;
}

// Connection Types
export interface Connection {
  connectionId: string;
  userId: string;
  role: string;
  eventTypes: string[];
  connectedAt: Date;
  lastActivity: Date;
  isActive: boolean;
}

export interface ConnectionStats {
  total: number;
  byRole: Record<string, number>;
  active: number;
}

// Cache Types
export interface CacheEntry<T = any> {
  key: string;
  value: T;
  ttl: number;
  createdAt: Date;
  accessedAt: Date;
  accessCount: number;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
  evictions: number;
  memoryUsage: number;
}

// Export all types - removed Types object as it causes TypeScript issues
// All types are already exported individually above
