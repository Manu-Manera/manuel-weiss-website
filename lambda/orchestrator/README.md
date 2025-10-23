# AI Investment Orchestrator

## Overview

The Investment Orchestrator is the core component of the AI Investment System, responsible for generating investment proposals and managing risk. It combines signals from multiple sources, applies advanced risk management techniques, and generates actionable investment recommendations.

## Features

### Investment Orchestration
- **Signal Aggregation**: Combines signals from multiple sources with weighted scoring
- **Investment Thesis Generation**: Uses LLM to create structured investment theses
- **Position Sizing**: Implements Kelly Criterion for optimal position sizing
- **Risk Assessment**: Comprehensive risk analysis with multiple metrics

### Risk Management
- **Value at Risk (VaR)**: Historical, Parametric, Monte Carlo, and Cornish-Fisher VaR
- **Conditional Value at Risk (CVaR)**: Expected shortfall calculations
- **Volatility Assessment**: Dynamic volatility analysis
- **Correlation Analysis**: Cross-asset correlation monitoring
- **Liquidity Assessment**: Market liquidity evaluation
- **Contra-Pass System**: Counter-argument analysis and dynamic size reduction

### Advanced Risk Metrics
- **VaR Calculations**:
  - Historical VaR (95%, 99% confidence levels)
  - Parametric VaR (normal distribution assumption)
  - Monte Carlo VaR (10,000 simulations)
  - Cornish-Fisher VaR (higher moments adjustment)

- **CVaR Calculations**:
  - Historical CVaR
  - Monte Carlo CVaR

- **Risk Scoring**:
  - Overall risk score (0-1 scale)
  - Risk recommendations
  - Dynamic position sizing

## Architecture

### Components

1. **InvestmentOrchestrator**: Main orchestrator class
2. **RiskManager**: Advanced risk management
3. **Lambda Functions**:
   - `proposeTrades`: Generate investment proposals
   - `riskCheck`: Advanced risk assessment

### Data Flow

```
Signals → Aggregation → Thesis Generation → Position Sizing → Risk Assessment → Proposal
```

### Risk Assessment Flow

```
Market Context → VaR Calculation → CVaR Calculation → Volatility Analysis → Correlation Analysis → Liquidity Assessment → Overall Risk Score
```

## API Endpoints

### POST /orchestrator/propose
Generate investment proposals based on signals.

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
      },
      "confidences": {
        "fused": 0.8
      }
    }
  ],
  "assets": ["BTC", "ETH"],
  "timeframe": "1w",
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

### POST /orchestrator/risk/check
Perform advanced risk assessment on a proposal.

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
      "Moderate risk - implement risk management measures",
      "Consider diversification"
    ]
  }
}
```

## Risk Management Details

### VaR Calculation Methods

1. **Historical VaR**: Based on historical return distribution
2. **Parametric VaR**: Assumes normal distribution
3. **Monte Carlo VaR**: Uses Monte Carlo simulation (10,000 iterations)
4. **Cornish-Fisher VaR**: Adjusts for skewness and kurtosis

### CVaR Calculation Methods

1. **Historical CVaR**: Average of returns below VaR threshold
2. **Monte Carlo CVaR**: Expected shortfall from simulations

### Risk Scoring

The overall risk score combines:
- VaR results (30% weight)
- CVaR results (20% weight)
- Volatility (20% weight)
- Correlation (20% weight)
- Liquidity (10% weight)

### Position Sizing

Uses Kelly Criterion:
```
f = (bp - q) / b
```
Where:
- f = fraction of capital to bet
- b = odds received on the wager
- p = probability of winning
- q = probability of losing (1-p)

## Configuration

### Environment Variables

- `AWS_REGION`: AWS region (default: eu-central-1)
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `SECRETS_MANAGER_SECRET_ID`: Secrets Manager secret ID
- `PROPOSALS_TABLE_NAME`: DynamoDB table for proposals
- `OPENAI_API_KEY`: OpenAI API key (from secrets)

### Secrets Manager

The orchestrator expects the following secrets:
- `openai_api_key`: OpenAI API key for LLM operations

## Error Handling

### Common Errors

1. **ValidationError**: Invalid request data
2. **APIError**: External API failures
3. **RiskAssessmentError**: Risk calculation failures
4. **ProposalGenerationError**: Proposal creation failures

### Error Response Format

```json
{
  "ok": false,
  "error": "Error type",
  "details": "Detailed error message"
}
```

## Monitoring

### CloudWatch Metrics

- `ProposalsGenerated`: Number of proposals created
- `RiskAssessmentsCompleted`: Number of risk assessments
- `AverageRiskScore`: Average risk score of proposals
- `ProposalGenerationTime`: Time to generate proposals
- `RiskAssessmentTime`: Time to complete risk assessments

### CloudWatch Logs

Structured logging with:
- Request ID
- User ID
- Module
- Cost tokens
- Performance metrics

## Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:integration
```

### Load Tests

```bash
npm run test:load
```

## Deployment

### CDK Deployment

```bash
npm run deploy
```

### Manual Deployment

```bash
# Build
npm run build

# Deploy to AWS
aws lambda update-function-code \
  --function-name ai-investment-orchestrator \
  --zip-file fileb://dist/index.js.zip
```

## Performance

### Benchmarks

- **Proposal Generation**: < 5 seconds
- **Risk Assessment**: < 3 seconds
- **VaR Calculation**: < 2 seconds
- **CVaR Calculation**: < 2 seconds

### Optimization

- Parallel risk calculations
- Cached market data
- Efficient correlation matrices
- Optimized Monte Carlo simulations

## Security

### Data Protection

- All data encrypted in transit and at rest
- PII anonymization
- Secure secret management
- Input validation and sanitization

### Access Control

- IAM least privilege
- JWT authentication
- Rate limiting
- CORS configuration

## Troubleshooting

### Common Issues

1. **High Risk Scores**: Check market volatility and correlation
2. **Slow Performance**: Monitor CloudWatch metrics
3. **API Failures**: Check external API status
4. **Memory Issues**: Monitor Lambda memory usage

### Debug Mode

Enable debug logging:
```bash
export DEBUG=ai-investment:orchestrator
```

## Contributing

1. Follow TypeScript best practices
2. Add comprehensive tests
3. Update documentation
4. Follow conventional commits

## License

MIT License - see LICENSE file for details.
