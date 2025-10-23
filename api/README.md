# AI Investment System API

## Overview

The AI Investment System API provides a comprehensive REST API for AI-powered investment management. It includes endpoints for data ingestion, signal scoring, proposal generation, risk management, decision making, and outcome evaluation.

## Features

### Core API Endpoints
- **Health Check**: System status and health monitoring
- **Data Ingestion**: Social media and news signal collection
- **Signal Scoring**: ML-based signal scoring and fusion
- **Investment Orchestration**: Proposal generation and risk assessment
- **Decision Management**: Investment decision making and evaluation
- **Dashboard**: System overview and monitoring
- **Metrics**: System and business performance metrics

### API Features
- **OpenAPI 3.1 Specification**: Complete API documentation
- **Multi-Language Client Generation**: TypeScript, Python, JavaScript, Java, C#
- **Comprehensive Documentation**: HTML documentation and Postman collection
- **Authentication**: JWT Bearer tokens and API keys
- **Rate Limiting**: Built-in rate limiting and throttling
- **Error Handling**: Structured error responses
- **Validation**: Request/response validation with Zod schemas

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate API Clients

```bash
# Generate all clients
npm run generate

# Generate specific client
npm run generate:typescript
npm run generate:python
npm run generate:javascript
npm run generate:java
npm run generate:csharp
```

### 3. Generate Documentation

```bash
# Generate HTML documentation
npm run generate:docs

# Generate Postman collection
npm run generate:postman
```

### 4. Validate API Specification

```bash
npm run validate
```

## API Endpoints

### System Endpoints

#### GET /health
Health check endpoint for system monitoring.

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "uptime": 3600
}
```

### Ingestion Endpoints

#### POST /ingestion/social
Ingest signals from social media platforms.

**Request Body**:
```json
{
  "sources": ["twitter", "reddit"],
  "timeframe": "24h",
  "userId": "user_123"
}
```

**Response**:
```json
{
  "ok": true,
  "data": {
    "signals": [
      {
        "id": "signal_123",
        "source": "twitter",
        "content": "Bitcoin adoption increasing",
        "timestamp": "2024-01-15T10:30:00Z",
        "scores": {
          "fused": 0.85,
          "sentiment": 0.8,
          "relevance": 0.9,
          "novelty": 0.7,
          "credibility": 0.8
        },
        "confidences": {
          "fused": 0.8
        }
      }
    ],
    "processed": 150,
    "errors": 5
  }
}
```

#### POST /ingestion/news
Ingest signals from news sources.

**Request Body**:
```json
{
  "sources": ["reuters", "bloomberg"],
  "timeframe": "24h",
  "userId": "user_123"
}
```

### Scoring Endpoints

#### POST /scoring/score
Score and fuse investment signals.

**Request Body**:
```json
{
  "signals": [
    {
      "id": "signal_123",
      "source": "twitter",
      "content": "Bitcoin adoption increasing",
      "scores": {
        "fused": 0.85,
        "sentiment": 0.8,
        "relevance": 0.9,
        "novelty": 0.7,
        "credibility": 0.8
      }
    }
  ],
  "userId": "user_123"
}
```

**Response**:
```json
{
  "ok": true,
  "data": {
    "scored_signals": [
      {
        "id": "signal_123",
        "source": "twitter",
        "content": "Bitcoin adoption increasing",
        "scores": {
          "fused": 0.85,
          "sentiment": 0.8,
          "relevance": 0.9,
          "novelty": 0.7,
          "credibility": 0.8
        }
      }
    ],
    "fusion_results": {
      "consensus": 0.75,
      "confidence": 0.8,
      "diversity": 0.6
    },
    "conflicts": []
  }
}
```

### Orchestrator Endpoints

#### POST /orchestrator/propose
Generate investment proposals.

**Request Body**:
```json
{
  "signals": [
    {
      "id": "signal_123",
      "source": "twitter",
      "content": "Bitcoin adoption increasing",
      "scores": {
        "fused": 0.85,
        "sentiment": 0.8,
        "relevance": 0.9,
        "novelty": 0.7,
        "credibility": 0.8
      }
    }
  ],
  "assets": ["BTC", "ETH"],
  "timeframe": "7d",
  "userId": "user_123"
}
```

**Response**:
```json
{
  "ok": true,
  "data": {
    "id": "proposal_456",
    "thesis": "Bitcoin adoption is increasing due to institutional interest",
    "assets": ["BTC", "ETH"],
    "size_pct": 0.05,
    "horizon_days": 7,
    "entry_price": {"BTC": 50000, "ETH": 3000},
    "stop_loss": 0.08,
    "take_profit": 0.12,
    "invalidate_if": ["Risk score exceeds 0.8"],
    "explain": "Detailed explanation of the investment thesis",
    "constraints_checked": true,
    "status": "proposed",
    "risk_score": 0.6,
    "expected_return": 0.08,
    "sharpe_ratio": 1.2
  }
}
```

#### POST /orchestrator/risk/check
Perform risk assessment.

**Request Body**:
```json
{
  "proposal": {
    "id": "proposal_456",
    "assets": ["BTC", "ETH"],
    "size_pct": 0.05,
    "horizon_days": 7
  },
  "assets": ["BTC", "ETH"],
  "userId": "user_123"
}
```

**Response**:
```json
{
  "ok": true,
  "data": {
    "risk_score": 0.6,
    "var": {
      "historical": 0.08,
      "parametric": 0.09,
      "monte_carlo": 0.085,
      "cornish_fisher": 0.087
    },
    "cvar": {
      "historical": 0.12,
      "monte_carlo": 0.125
    },
    "volatility": 0.2,
    "correlation": [[1.0, 0.7], [0.7, 1.0]],
    "liquidity": 0.9,
    "recommendations": [
      "Moderate risk - implement risk management measures"
    ]
  }
}
```

### Decision Endpoints

#### POST /decision/make
Make investment decisions.

**Request Body**:
```json
{
  "proposal": {
    "id": "proposal_456",
    "thesis": "Bitcoin adoption is increasing",
    "assets": ["BTC", "ETH"],
    "size_pct": 0.05,
    "horizon_days": 7,
    "risk_score": 0.6
  },
  "context": {
    "portfolio_concentration": 0.3,
    "market_conditions": "bullish",
    "user_risk_tolerance": "moderate"
  },
  "userId": "user_123"
}
```

**Response**:
```json
{
  "ok": true,
  "data": {
    "id": "decision_789",
    "proposal_id": "proposal_456",
    "action": "approve",
    "confidence": 0.8,
    "size_adjustment": 1.0,
    "rationale": "Proposal meets all decision criteria",
    "rule_results": [
      {
        "ruleId": "risk_threshold",
        "ruleName": "Risk Threshold Rule",
        "condition": "proposal.risk_score > 0.8",
        "result": false,
        "action": "reject",
        "priority": 1
      }
    ]
  }
}
```

#### POST /decision/evaluate
Evaluate investment outcomes.

**Request Body**:
```json
{
  "proposal": {
    "id": "proposal_456",
    "assets": ["BTC", "ETH"],
    "entry_price": {"BTC": 50000, "ETH": 3000},
    "size_pct": 0.05,
    "horizon_days": 7
  },
  "outcome": {
    "id": "outcome_789",
    "exit_price": {"BTC": 52000, "ETH": 3200},
    "volatility": 0.2,
    "price_history": [50000, 51000, 52000, 51500, 52000]
  },
  "userId": "user_123"
}
```

**Response**:
```json
{
  "ok": true,
  "data": {
    "id": "evaluation_101",
    "proposal_id": "proposal_456",
    "outcome_id": "outcome_789",
    "performance": {
      "return_pct": 0.04,
      "sharpe_ratio": 1.2,
      "max_drawdown": 0.02,
      "win_rate": 1.0,
      "overall_score": 0.8
    },
    "decision_quality": {
      "accuracy": "Good",
      "risk_management": "Effective",
      "timing": "Good",
      "position_sizing": "Appropriate",
      "overall_quality": "Good",
      "score": 0.8
    },
    "insights": [
      "Signal quality was accurate",
      "Risk management was effective"
    ]
  }
}
```

### Dashboard Endpoints

#### GET /dashboard/overview
Get system overview and key metrics.

**Response**:
```json
{
  "ok": true,
  "data": {
    "overview": {
      "total_signals": 1250,
      "total_proposals": 45,
      "total_outcomes": 38,
      "success_rate": 0.75
    },
    "metrics": {
      "system_health": "healthy",
      "avg_processing_time": 2.5,
      "error_rate": 0.02
    },
    "recent_activity": [
      {
        "type": "signal",
        "id": "signal_123",
        "timestamp": "2024-01-15T10:30:00Z",
        "description": "New signal from Twitter"
      }
    ]
  }
}
```

#### GET /dashboard/signals
Get recent signals with filtering.

**Query Parameters**:
- `limit`: Maximum number of signals (default: 50)
- `source`: Filter by signal source

**Response**:
```json
{
  "ok": true,
  "data": {
    "signals": [
      {
        "id": "signal_123",
        "source": "twitter",
        "content": "Bitcoin adoption increasing",
        "timestamp": "2024-01-15T10:30:00Z",
        "scores": {
          "fused": 0.85,
          "sentiment": 0.8,
          "relevance": 0.9,
          "novelty": 0.7,
          "credibility": 0.8
        }
      }
    ],
    "total": 1250,
    "page": 1,
    "limit": 50
  }
}
```

#### GET /dashboard/proposals
Get recent proposals with filtering.

**Query Parameters**:
- `limit`: Maximum number of proposals (default: 50)
- `status`: Filter by proposal status

**Response**:
```json
{
  "ok": true,
  "data": {
    "proposals": [
      {
        "id": "proposal_456",
        "thesis": "Bitcoin adoption is increasing",
        "assets": ["BTC", "ETH"],
        "size_pct": 0.05,
        "horizon_days": 7,
        "status": "proposed",
        "risk_score": 0.6,
        "expected_return": 0.08,
        "sharpe_ratio": 1.2
      }
    ],
    "total": 45,
    "page": 1,
    "limit": 50
  }
}
```

#### GET /dashboard/outcomes
Get recent outcomes with filtering.

**Query Parameters**:
- `limit`: Maximum number of outcomes (default: 50)
- `timeframe`: Time period for outcomes (default: 30d)

**Response**:
```json
{
  "ok": true,
  "data": {
    "outcomes": [
      {
        "id": "outcome_789",
        "proposal_id": "proposal_456",
        "exit_price": {"BTC": 52000, "ETH": 3200},
        "return_pct": 0.04,
        "volatility": 0.2,
        "sharpe_ratio": 1.2,
        "max_drawdown": 0.02,
        "win_rate": 1.0
      }
    ],
    "total": 38,
    "page": 1,
    "limit": 50
  }
}
```

### Metrics Endpoints

#### GET /metrics/system
Get system performance metrics.

**Response**:
```json
{
  "ok": true,
  "data": {
    "cpu_usage": 0.65,
    "memory_usage": 0.72,
    "disk_usage": 0.45,
    "network_io": {
      "bytes_in": 1024000,
      "bytes_out": 512000
    },
    "response_times": {
      "avg": 250,
      "p95": 500,
      "p99": 1000
    },
    "error_rates": {
      "total": 0.02,
      "by_endpoint": {
        "/ingestion/social": 0.01,
        "/scoring/score": 0.02
      }
    }
  }
}
```

#### GET /metrics/business
Get business performance metrics.

**Query Parameters**:
- `timeframe`: Time period for metrics (default: 24h)

**Response**:
```json
{
  "ok": true,
  "data": {
    "signals_processed": 1250,
    "proposals_generated": 45,
    "decisions_made": 42,
    "outcomes_evaluated": 38,
    "success_rate": 0.75,
    "avg_return": 0.08,
    "sharpe_ratio": 1.2
  }
}
```

## Authentication

### JWT Bearer Token

```bash
curl -H "Authorization: Bearer <jwt_token>" \
  https://api.ai-investment.com/v1/health
```

### API Key

```bash
curl -H "X-API-Key: <api_key>" \
  https://api.ai-investment.com/v1/health
```

## Error Handling

### Error Response Format

```json
{
  "ok": false,
  "error": "ValidationError",
  "details": "Invalid request data provided",
  "timestamp": "2024-01-15T10:30:00Z",
  "request_id": "req_123"
}
```

### Common Error Codes

- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Rate Limiting

### Rate Limits

- **Ingestion**: 100 requests per minute
- **Scoring**: 50 requests per minute
- **Orchestrator**: 25 requests per minute
- **Decision**: 25 requests per minute
- **Dashboard**: 200 requests per minute
- **Metrics**: 100 requests per minute

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248600
```

## Client Generation

### Supported Languages

- **TypeScript**: `npm run generate:typescript`
- **Python**: `npm run generate:python`
- **JavaScript**: `npm run generate:javascript`
- **Java**: `npm run generate:java`
- **C#**: `npm run generate:csharp`

### Generated Clients

All generated clients are available in the `generated/` directory:

```
generated/
├── typescript/          # TypeScript client
├── python/             # Python client
├── javascript/         # JavaScript client
├── java/               # Java client
├── csharp/             # C# client
├── docs/               # HTML documentation
└── postman/            # Postman collection
```

### Using Generated Clients

#### TypeScript

```typescript
import { DefaultApi, Configuration } from './generated/typescript';

const config = new Configuration({
  basePath: 'https://api.ai-investment.com/v1',
  apiKey: 'your-api-key'
});

const api = new DefaultApi(config);

// Get health status
const health = await api.healthGet();

// Ingest social signals
const signals = await api.ingestionSocialPost({
  socialIngestionRequest: {
    sources: ['twitter', 'reddit'],
    timeframe: '24h',
    userId: 'user_123'
  }
});
```

#### Python

```python
from generated.python import DefaultApi, Configuration

config = Configuration(
    host="https://api.ai-investment.com/v1",
    api_key={"X-API-Key": "your-api-key"}
)

api = DefaultApi(config)

# Get health status
health = api.health_get()

# Ingest social signals
signals = api.ingestion_social_post(
    social_ingestion_request={
        "sources": ["twitter", "reddit"],
        "timeframe": "24h",
        "userId": "user_123"
    }
)
```

## Testing

### Unit Tests

```bash
npm test
```

### API Validation

```bash
npm run validate
```

### Postman Testing

1. Import the generated Postman collection
2. Set environment variables for API endpoints
3. Run the collection tests

## Deployment

### Production Deployment

```bash
npm run deploy
```

### Staging Deployment

```bash
npm run generate
npm run validate
```

## Monitoring

### Health Checks

- **GET /health**: Basic health status
- **GET /metrics/system**: System performance
- **GET /metrics/business**: Business metrics

### Logging

All API requests are logged with:
- Request ID
- User ID
- Endpoint
- Response time
- Status code
- Error details

## Security

### Data Protection

- All data encrypted in transit (TLS 1.3)
- All data encrypted at rest (AES-256)
- PII anonymization
- Secure secret management

### Access Control

- JWT authentication
- API key authentication
- Role-based access control
- Rate limiting
- CORS configuration

## Contributing

1. Follow OpenAPI 3.1 specification
2. Update API documentation
3. Regenerate clients
4. Run validation tests
5. Follow conventional commits

## License

MIT License - see LICENSE file for details.
