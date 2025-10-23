# AI Investment Decision Management

## Overview

The Decision Management system is responsible for making investment decisions based on proposals and implementing a continuous learning loop. It combines rule-based decision making with machine learning to improve decision quality over time.

## Features

### Decision Management
- **Rule-Based Decisions**: Configurable decision rules with priority-based evaluation
- **Risk-Based Filtering**: Automatic rejection of high-risk proposals
- **Position Sizing**: Dynamic position size adjustments based on risk
- **Diversification**: Portfolio concentration monitoring and adjustment
- **Liquidity Checks**: Automatic rejection of low-liquidity proposals

### Learning Loop
- **Performance Evaluation**: Comprehensive outcome analysis
- **Model Updates**: Continuous improvement of scoring and risk models
- **Rule Refinement**: Dynamic adjustment of decision rules
- **Insight Generation**: AI-powered insights for system improvement

### Decision Rules
- **Risk Threshold**: Reject proposals with risk score > 0.8
- **Position Size**: Reduce position size if > 10%
- **Diversification**: Ensure portfolio diversification
- **Liquidity**: Reject low liquidity proposals

## Architecture

### Components

1. **DecisionManager**: Main decision-making class
2. **LearningLoop**: Continuous learning and improvement
3. **Lambda Functions**:
   - `makeDecision`: Process investment decisions
   - `evaluateOutcome`: Analyze investment outcomes

### Decision Flow

```
Proposal → Rule Evaluation → Decision Rationale → Final Decision → Storage
```

### Learning Flow

```
Outcome → Performance Analysis → Model Updates → Rule Refinement → Insights
```

## API Endpoints

### POST /decision/make
Make an investment decision based on a proposal.

**Request Body**:
```json
{
  "proposal": {
    "id": "proposal_456",
    "thesis": "Bitcoin adoption is increasing",
    "assets": ["BTC", "ETH"],
    "size_pct": 0.05,
    "horizon_days": 7,
    "risk_score": 0.6,
    "expected_return": 0.08,
    "sharpe_ratio": 1.2
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
    ],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### POST /decision/evaluate
Evaluate the outcome of an investment decision.

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
      "Risk management was effective",
      "Position sizing was appropriate",
      "Timing was good"
    ],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

## Decision Rules

### Default Rules

1. **Risk Threshold Rule**
   - Condition: `proposal.risk_score > 0.8`
   - Action: `reject`
   - Priority: 1
   - Description: Reject proposals with risk score > 0.8

2. **Position Size Rule**
   - Condition: `proposal.size_pct > 0.1`
   - Action: `reduce_size`
   - Priority: 2
   - Description: Reduce position size if > 10%

3. **Diversification Rule**
   - Condition: `context.portfolio_concentration > 0.5`
   - Action: `diversify`
   - Priority: 3
   - Description: Ensure portfolio diversification

4. **Liquidity Rule**
   - Condition: `proposal.liquidity_score < 0.5`
   - Action: `reject`
   - Priority: 4
   - Description: Reject low liquidity proposals

### Rule Evaluation

Rules are evaluated in priority order:
1. High priority rules (1-2) can reject proposals
2. Medium priority rules (3-4) can adjust proposals
3. Low priority rules (5+) provide recommendations

### Decision Actions

- **approve**: Accept the proposal as-is
- **reject**: Reject the proposal
- **reduce_size**: Reduce position size
- **diversify**: Add diversification requirements
- **modify**: Modify proposal parameters

## Learning Loop

### Performance Metrics

1. **Return Percentage**: Actual vs expected return
2. **Sharpe Ratio**: Risk-adjusted return
3. **Maximum Drawdown**: Worst peak-to-trough decline
4. **Win Rate**: Percentage of profitable trades
5. **Overall Score**: Weighted combination of metrics

### Model Updates

1. **Signal Scoring Models**: Update weights based on performance
2. **Risk Models**: Adjust parameters based on actual outcomes
3. **Decision Rules**: Refine effectiveness based on results

### Learning Algorithms

1. **Exponential Moving Average**: For rule effectiveness
2. **Weight Adjustment**: Based on signal performance
3. **Parameter Tuning**: Based on risk prediction accuracy
4. **Insight Generation**: AI-powered improvement suggestions

## Configuration

### Environment Variables

- `AWS_REGION`: AWS region (default: eu-central-1)
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `SECRETS_MANAGER_SECRET_ID`: Secrets Manager secret ID
- `DECISIONS_TABLE_NAME`: DynamoDB table for decisions
- `EVALUATIONS_TABLE_NAME`: DynamoDB table for evaluations
- `DECISION_RULES_TABLE_NAME`: DynamoDB table for decision rules
- `SIGNAL_WEIGHTS_TABLE_NAME`: DynamoDB table for signal weights
- `RISK_PARAMS_TABLE_NAME`: DynamoDB table for risk parameters

### Secrets Manager

The decision system expects the following secrets:
- `openai_api_key`: OpenAI API key for LLM operations

## Error Handling

### Common Errors

1. **ValidationError**: Invalid request data
2. **DecisionError**: Decision making failures
3. **EvaluationError**: Outcome evaluation failures
4. **ModelUpdateError**: Learning model update failures

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

- `DecisionsMade`: Number of decisions processed
- `EvaluationsCompleted`: Number of evaluations completed
- `AverageDecisionConfidence`: Average decision confidence
- `DecisionProcessingTime`: Time to process decisions
- `EvaluationProcessingTime`: Time to complete evaluations

### CloudWatch Logs

Structured logging with:
- Request ID
- User ID
- Module
- Decision/Evaluation ID
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

### Decision Quality Tests

```bash
npm run test:decision-quality
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
  --function-name ai-investment-decision \
  --zip-file fileb://dist/index.js.zip
```

## Performance

### Benchmarks

- **Decision Processing**: < 3 seconds
- **Evaluation Processing**: < 5 seconds
- **Model Updates**: < 2 seconds
- **Rule Evaluation**: < 1 second

### Optimization

- Parallel rule evaluation
- Cached decision rules
- Efficient model updates
- Optimized learning algorithms

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

1. **High Rejection Rate**: Check decision rules and risk thresholds
2. **Slow Performance**: Monitor CloudWatch metrics
3. **Model Drift**: Check learning loop effectiveness
4. **Rule Conflicts**: Review rule priorities and conditions

### Debug Mode

Enable debug logging:
```bash
export DEBUG=ai-investment:decision
```

## Contributing

1. Follow TypeScript best practices
2. Add comprehensive tests
3. Update documentation
4. Follow conventional commits

## License

MIT License - see LICENSE file for details.
