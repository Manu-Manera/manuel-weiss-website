# AI Investment System - API Dokumentation

## Übersicht

Das AI Investment System bietet eine umfassende REST API für die Verwaltung von Investment-Signalen, -Vorschlägen und -Entscheidungen.

## Base URL

```
Production: https://api.production.ai-investment.com
Staging:    https://api.staging.ai-investment.com
```

## Authentication

### JWT Token

Alle API-Aufrufe erfordern ein gültiges JWT Token im Authorization Header:

```http
Authorization: Bearer <jwt-token>
```

### Token abrufen

```http
POST /auth/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "user": {
    "id": "user-123",
    "username": "user@example.com",
    "role": "analyst"
  }
}
```

## API Endpoints

### 1. Signals

#### Signale abrufen

```http
GET /api/v1/signals
```

**Query Parameters:**
- `limit` (optional): Anzahl der Signale (default: 50, max: 100)
- `offset` (optional): Offset für Pagination (default: 0)
- `source` (optional): Signal-Quelle (twitter, reddit, news, etc.)
- `score_min` (optional): Mindest-Score (0.0-1.0)
- `date_from` (optional): Start-Datum (ISO 8601)
- `date_to` (optional): End-Datum (ISO 8601)

**Response:**
```json
{
  "signals": [
    {
      "id": "signal-123",
      "source": "twitter",
      "content": "Tesla stock showing strong momentum",
      "score": 0.85,
      "confidence": 0.92,
      "timestamp": "2024-01-15T10:30:00Z",
      "metadata": {
        "author": "@trader123",
        "followers": 5000,
        "verified": true
      }
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "has_more": true
  }
}
```

#### Signal Details

```http
GET /api/v1/signals/{signal_id}
```

**Response:**
```json
{
  "id": "signal-123",
  "source": "twitter",
  "content": "Tesla stock showing strong momentum",
  "score": 0.85,
  "confidence": 0.92,
  "timestamp": "2024-01-15T10:30:00Z",
  "metadata": {
    "author": "@trader123",
    "followers": 5000,
    "verified": true,
    "retweets": 25,
    "likes": 150
  },
  "analysis": {
    "sentiment": "positive",
    "relevance": 0.88,
    "novelty": 0.75,
    "credibility": 0.92
  }
}
```

### 2. Proposals

#### Investment-Vorschläge abrufen

```http
GET /api/v1/proposals
```

**Query Parameters:**
- `limit` (optional): Anzahl der Vorschläge (default: 20, max: 50)
- `offset` (optional): Offset für Pagination (default: 0)
- `status` (optional): Vorschlag-Status (pending, approved, rejected)
- `risk_level` (optional): Risiko-Level (low, medium, high)
- `date_from` (optional): Start-Datum (ISO 8601)
- `date_to` (optional): End-Datum (ISO 8601)

**Response:**
```json
{
  "proposals": [
    {
      "id": "proposal-123",
      "symbol": "TSLA",
      "action": "buy",
      "quantity": 100,
      "price": 250.50,
      "risk_score": 0.65,
      "expected_return": 0.15,
      "sharpe_ratio": 1.2,
      "status": "pending",
      "created_at": "2024-01-15T10:30:00Z",
      "signals": [
        {
          "id": "signal-123",
          "source": "twitter",
          "score": 0.85
        }
      ]
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

#### Vorschlag erstellen

```http
POST /api/v1/proposals
Content-Type: application/json

{
  "symbol": "TSLA",
  "action": "buy",
  "quantity": 100,
  "price": 250.50,
  "reasoning": "Strong momentum signals from social media",
  "signals": ["signal-123", "signal-456"]
}
```

**Response:**
```json
{
  "id": "proposal-123",
  "symbol": "TSLA",
  "action": "buy",
  "quantity": 100,
  "price": 250.50,
  "risk_score": 0.65,
  "expected_return": 0.15,
  "sharpe_ratio": 1.2,
  "status": "pending",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### 3. Decisions

#### Entscheidungen abrufen

```http
GET /api/v1/decisions
```

**Query Parameters:**
- `limit` (optional): Anzahl der Entscheidungen (default: 20, max: 50)
- `offset` (optional): Offset für Pagination (default: 0)
- `status` (optional): Entscheidungs-Status (approved, rejected, pending)
- `date_from` (optional): Start-Datum (ISO 8601)
- `date_to` (optional): End-Datum (ISO 8601)

**Response:**
```json
{
  "decisions": [
    {
      "id": "decision-123",
      "proposal_id": "proposal-123",
      "action": "approved",
      "reasoning": "Strong signals and acceptable risk",
      "approved_by": "user-123",
      "approved_at": "2024-01-15T10:35:00Z",
      "execution": {
        "order_id": "order-123",
        "executed_at": "2024-01-15T10:40:00Z",
        "executed_price": 250.75,
        "executed_quantity": 100
      }
    }
  ],
  "pagination": {
    "total": 30,
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

#### Entscheidung treffen

```http
POST /api/v1/decisions
Content-Type: application/json

{
  "proposal_id": "proposal-123",
  "action": "approved",
  "reasoning": "Strong signals and acceptable risk"
}
```

**Response:**
```json
{
  "id": "decision-123",
  "proposal_id": "proposal-123",
  "action": "approved",
  "reasoning": "Strong signals and acceptable risk",
  "approved_by": "user-123",
  "approved_at": "2024-01-15T10:35:00Z"
}
```

### 4. Outcomes

#### Ergebnisse abrufen

```http
GET /api/v1/outcomes
```

**Query Parameters:**
- `limit` (optional): Anzahl der Ergebnisse (default: 20, max: 50)
- `offset` (optional): Offset für Pagination (default: 0)
- `symbol` (optional): Symbol filtern
- `date_from` (optional): Start-Datum (ISO 8601)
- `date_to` (optional): End-Datum (ISO 8601)

**Response:**
```json
{
  "outcomes": [
    {
      "id": "outcome-123",
      "decision_id": "decision-123",
      "symbol": "TSLA",
      "action": "buy",
      "executed_price": 250.75,
      "current_price": 255.20,
      "quantity": 100,
      "pnl": 445.00,
      "pnl_percentage": 1.78,
      "created_at": "2024-01-15T10:40:00Z",
      "updated_at": "2024-01-15T15:30:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

### 5. Dashboard

#### Dashboard-Daten abrufen

```http
GET /api/v1/dashboard
```

**Response:**
```json
{
  "summary": {
    "total_signals": 1250,
    "active_proposals": 15,
    "pending_decisions": 3,
    "total_pnl": 12500.50,
    "success_rate": 0.78
  },
  "recent_signals": [
    {
      "id": "signal-123",
      "source": "twitter",
      "content": "Tesla stock showing strong momentum",
      "score": 0.85,
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "top_proposals": [
    {
      "id": "proposal-123",
      "symbol": "TSLA",
      "action": "buy",
      "risk_score": 0.65,
      "expected_return": 0.15
    }
  ],
  "performance_metrics": {
    "daily_pnl": 1250.50,
    "weekly_pnl": 8750.25,
    "monthly_pnl": 12500.50,
    "sharpe_ratio": 1.2,
    "max_drawdown": 0.05
  }
}
```

### 6. Health

#### System-Status abrufen

```http
GET /api/v1/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "lambda": "healthy",
    "api_gateway": "healthy",
    "s3": "healthy"
  },
  "metrics": {
    "response_time": 150,
    "throughput": 1000,
    "error_rate": 0.01
  }
}
```

### 7. Metrics

#### Performance-Metriken abrufen

```http
GET /api/v1/metrics
```

**Query Parameters:**
- `period` (optional): Zeitraum (1h, 24h, 7d, 30d)
- `metric` (optional): Metrik-Typ (performance, business, cost)

**Response:**
```json
{
  "period": "24h",
  "timestamp": "2024-01-15T10:30:00Z",
  "performance": {
    "api_response_time": 150,
    "lambda_duration": 800,
    "database_query_time": 50,
    "throughput": 1000
  },
  "business": {
    "signals_processed": 1250,
    "proposals_generated": 45,
    "decisions_made": 30,
    "success_rate": 0.78
  },
  "cost": {
    "lambda_cost": 25.50,
    "dynamodb_cost": 15.75,
    "s3_cost": 5.25,
    "total_cost": 46.50
  }
}
```

## WebSocket API

### Verbindung

```javascript
const ws = new WebSocket('wss://api.production.ai-investment.com/ws');

ws.onopen = function() {
    console.log('WebSocket connected');
};

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('Received:', data);
};
```

### Nachrichten

#### Signal Updates

```json
{
  "type": "signal_update",
  "data": {
    "id": "signal-123",
    "source": "twitter",
    "content": "Tesla stock showing strong momentum",
    "score": 0.85,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

#### Proposal Updates

```json
{
  "type": "proposal_update",
  "data": {
    "id": "proposal-123",
    "symbol": "TSLA",
    "action": "buy",
    "status": "pending",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Decision Updates

```json
{
  "type": "decision_update",
  "data": {
    "id": "decision-123",
    "proposal_id": "proposal-123",
    "action": "approved",
    "approved_at": "2024-01-15T10:35:00Z"
  }
}
```

## Error Handling

### HTTP Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "symbol",
      "reason": "Symbol is required"
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req-123"
  }
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTHENTICATION_ERROR` | Invalid or missing authentication |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded |
| `INTERNAL_ERROR` | Internal server error |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable |

## Rate Limiting

### Limits

- **Authenticated Users**: 1000 requests/hour
- **Anonymous Users**: 100 requests/hour
- **WebSocket Connections**: 10 per user

### Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248600
```

### Rate Limit Exceeded

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded",
    "retry_after": 3600
  }
}
```

## SDKs und Clients

### JavaScript/TypeScript

```bash
npm install @ai-investment/api-client
```

```typescript
import { AIIvestmentClient } from '@ai-investment/api-client';

const client = new AIIvestmentClient({
  baseUrl: 'https://api.production.ai-investment.com',
  apiKey: 'your-api-key'
});

// Signale abrufen
const signals = await client.signals.list({
  limit: 50,
  source: 'twitter'
});

// Vorschlag erstellen
const proposal = await client.proposals.create({
  symbol: 'TSLA',
  action: 'buy',
  quantity: 100,
  price: 250.50
});
```

### Python

```bash
pip install ai-investment-api
```

```python
from ai_investment import AIIvestmentClient

client = AIIvestmentClient(
    base_url='https://api.production.ai-investment.com',
    api_key='your-api-key'
)

# Signale abrufen
signals = client.signals.list(limit=50, source='twitter')

# Vorschlag erstellen
proposal = client.proposals.create(
    symbol='TSLA',
    action='buy',
    quantity=100,
    price=250.50
)
```

## Testing

### Postman Collection

```json
{
  "info": {
    "name": "AI Investment API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"user@example.com\",\n  \"password\": \"password123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "login"]
            }
          }
        }
      ]
    }
  ]
}
```

### cURL Examples

```bash
# Login
curl -X POST https://api.production.ai-investment.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "user@example.com", "password": "password123"}'

# Signale abrufen
curl -H "Authorization: Bearer <token>" \
  https://api.production.ai-investment.com/api/v1/signals

# Vorschlag erstellen
curl -X POST https://api.production.ai-investment.com/api/v1/proposals \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"symbol": "TSLA", "action": "buy", "quantity": 100, "price": 250.50}'
```

## Changelog

### v1.0.0 (2024-01-15)
- Initial API Release
- Basic CRUD Operations
- Authentication
- WebSocket Support

### v1.1.0 (2024-02-01)
- Enhanced Filtering
- Pagination Improvements
- Rate Limiting
- Error Handling

### v1.2.0 (2024-03-01)
- Real-time Updates
- Advanced Analytics
- Performance Metrics
- Cost Tracking

## Support

### API Support

- **Email**: api-support@ai-investment.com
- **Documentation**: https://docs.ai-investment.com
- **Status Page**: https://status.ai-investment.com

### Community

- **GitHub**: https://github.com/ai-investment/api
- **Discord**: https://discord.gg/ai-investment
- **Stack Overflow**: Tag: `ai-investment-api`
