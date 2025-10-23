import { z } from 'zod';

// Signal Schema
export const SignalSchema = z.object({
  id: z.string().uuid(),
  asset: z.string().min(1).max(10),
  timestamp: z.date(),
  source: z.enum(['twitter', 'reddit', 'news', 'youtube', 'linkedin']),
  content: z.string().min(1).max(10000),
  sentiment: z.number().min(-1).max(1),
  relevance: z.number().min(0).max(1),
  novelty: z.number().min(0).max(1),
  credibility: z.number().min(0).max(1),
  entities: z.array(z.string()),
  language: z.enum(['de', 'en', 'fr', 'es', 'it']),
  metadata: z.record(z.any()).optional()
});

// Proposal Schema
export const ProposalSchema = z.object({
  id: z.string().uuid(),
  thesis: z.string().min(10).max(1000),
  assets: z.array(z.string()).min(1).max(10),
  size_pct: z.number().min(0.01).max(1),
  horizon_days: z.number().min(1).max(365),
  entry_price: z.number().positive(),
  stop_loss: z.number().positive().optional(),
  take_profit: z.number().positive().optional(),
  invalidate_if: z.array(z.string()).optional(),
  explain: z.string().min(10).max(2000),
  constraints_checked: z.boolean(),
  status: z.enum(['proposed', 'approved', 'rejected', 'executed']),
  created_at: z.date(),
  updated_at: z.date(),
  risk_score: z.number().min(0).max(1).optional(),
  expected_return: z.number().optional(),
  sharpe_ratio: z.number().optional()
});

// Outcome Schema
export const OutcomeSchema = z.object({
  id: z.string().uuid(),
  proposal_id: z.string().uuid(),
  evaluated_at: z.date(),
  pnl_pct: z.number(),
  hit: z.boolean(),
  breaches: z.array(z.string()),
  actual_duration_days: z.number().positive(),
  final_price: z.number().positive(),
  max_drawdown: z.number(),
  sharpe_ratio: z.number().optional(),
  metadata: z.record(z.any()).optional()
});

// API Request/Response Schemas
export const SocialIngestionRequestSchema = z.object({
  assets: z.array(z.string()).min(1).max(10),
  timeframe: z.string(),
  sources: z.array(z.string()).optional(),
  userId: z.string().uuid(),
  sessionId: z.string().uuid().optional()
});

export const NewsIngestionRequestSchema = z.object({
  assets: z.array(z.string()).min(1).max(10),
  timeframe: z.string(),
  sources: z.array(z.string()).optional(),
  userId: z.string().uuid(),
  sessionId: z.string().uuid().optional()
});

export const ScoringRequestSchema = z.object({
  id: z.string().uuid(),
  signals: z.array(SignalSchema),
  agentId: z.string(),
  userId: z.string().uuid(),
  sessionId: z.string().uuid().optional()
});

export const ProposalRequestSchema = z.object({
  signals: z.array(SignalSchema),
  assets: z.array(z.string()).min(1).max(10),
  timeframe: z.string(),
  userId: z.string().uuid(),
  sessionId: z.string().uuid().optional()
});

export const RiskCheckRequestSchema = z.object({
  proposal: ProposalSchema,
  assets: z.array(z.string()).min(1).max(10),
  size_pct: z.number().min(0.01).max(1),
  userId: z.string().uuid(),
  sessionId: z.string().uuid().optional()
});

export const DecisionRequestSchema = z.object({
  proposalId: z.string().uuid(),
  action: z.enum(['approve', 'reject', 'comment']),
  comment: z.string().optional(),
  userId: z.string().uuid(),
  sessionId: z.string().uuid().optional()
});

export const EvaluationRequestSchema = z.object({
  timeframe: z.string(),
  userId: z.string().uuid(),
  sessionId: z.string().uuid().optional()
});

// API Response Schema
export const ApiResponseSchema = z.object({
  ok: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

// Pagination Schema
export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Filter Schema
export const FilterSchema = z.object({
  source: z.string().optional(),
  asset: z.string().optional(),
  timeframe: z.string().optional(),
  minScore: z.number().min(0).max(1).optional(),
  maxScore: z.number().min(0).max(1).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional()
});

// Error Response Schema
export const ErrorResponseSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
  details: z.record(z.any()).optional(),
  timestamp: z.date()
});

// Health Check Schema
export const HealthCheckSchema = z.object({
  ok: z.boolean(),
  timestamp: z.date(),
  service: z.string(),
  version: z.string(),
  uptime: z.number().optional(),
  memory: z.object({
    used: z.number(),
    total: z.number(),
    percentage: z.number()
  }).optional()
});

// Metrics Schema
export const MetricsSchema = z.object({
  timestamp: z.date(),
  signalsProcessed: z.number(),
  proposalsGenerated: z.number(),
  decisionsMade: z.number(),
  outcomesEvaluated: z.number(),
  errorRate: z.number(),
  averageLatency: z.number(),
  costPerRequest: z.number()
});

// WebSocket Message Schema
export const WebSocketMessageSchema = z.object({
  type: z.string(),
  data: z.any(),
  timestamp: z.date(),
  connectionId: z.string().optional()
});

// SSE Event Schema
export const SSEEventSchema = z.object({
  event: z.string(),
  data: z.any(),
  id: z.string().optional(),
  retry: z.number().optional()
});

// Export all schemas
export const Schemas = {
  Signal: SignalSchema,
  Proposal: ProposalSchema,
  Outcome: OutcomeSchema,
  SocialIngestionRequest: SocialIngestionRequestSchema,
  NewsIngestionRequest: NewsIngestionRequestSchema,
  ScoringRequest: ScoringRequestSchema,
  ProposalRequest: ProposalRequestSchema,
  RiskCheckRequest: RiskCheckRequestSchema,
  DecisionRequest: DecisionRequestSchema,
  EvaluationRequest: EvaluationRequestSchema,
  ApiResponse: ApiResponseSchema,
  Pagination: PaginationSchema,
  Filter: FilterSchema,
  ErrorResponse: ErrorResponseSchema,
  HealthCheck: HealthCheckSchema,
  Metrics: MetricsSchema,
  WebSocketMessage: WebSocketMessageSchema,
  SSEEvent: SSEEventSchema
} as const;
