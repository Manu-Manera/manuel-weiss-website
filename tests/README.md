# AI Investment System Test Suite

## Overview

The AI Investment System Test Suite provides comprehensive testing coverage for all components of the AI Investment System. It includes unit tests, integration tests, end-to-end tests, performance tests, security tests, and accessibility tests.

## Test Structure

```
tests/
├── unit/                    # Unit tests
│   ├── test-common.ts      # Common package tests
│   ├── test-ingestion.ts   # Ingestion tests
│   ├── test-scoring.ts     # Scoring tests
│   ├── test-orchestrator.ts # Orchestrator tests
│   ├── test-decision.ts    # Decision tests
│   ├── test-streaming.ts   # Streaming tests
│   └── test-observability.ts # Observability tests
├── integration/            # Integration tests
│   ├── test-ingestion.ts   # Ingestion integration
│   ├── test-scoring.ts     # Scoring integration
│   ├── test-orchestrator.ts # Orchestrator integration
│   ├── test-decision.ts    # Decision integration
│   └── test-workflow.ts    # Workflow integration
├── e2e/                    # End-to-end tests
│   ├── test-workflow.ts    # Complete workflow tests
│   ├── test-api.ts         # API tests
│   └── test-dashboard.ts   # Dashboard tests
├── performance/            # Performance tests
│   ├── test-load.ts        # Load testing
│   ├── test-stress.ts      # Stress testing
│   └── test-benchmark.ts   # Benchmark testing
├── security/               # Security tests
│   ├── test-auth.ts        # Authentication tests
│   ├── test-authorization.ts # Authorization tests
│   ├── test-data-protection.ts # Data protection tests
│   └── test-vulnerabilities.ts # Vulnerability tests
├── accessibility/          # Accessibility tests
│   ├── test-wcag.ts        # WCAG compliance tests
│   ├── test-screen-reader.ts # Screen reader tests
│   └── test-keyboard.ts    # Keyboard navigation tests
├── live/                   # Live environment tests
│   ├── test-production.ts  # Production tests
│   ├── test-staging.ts     # Staging tests
│   └── test-monitoring.ts  # Monitoring tests
├── setup.ts               # Test setup and configuration
├── package.json           # Test dependencies
└── README.md              # This file
```

## Test Types

### Unit Tests
- **Purpose**: Test individual functions and classes in isolation
- **Coverage**: All common utilities, business logic, and data processing
- **Mocking**: Extensive mocking of external dependencies
- **Speed**: Fast execution (< 1 second per test)

### Integration Tests
- **Purpose**: Test interactions between components
- **Coverage**: API endpoints, database operations, external service integration
- **Mocking**: Limited mocking, focus on real interactions
- **Speed**: Medium execution (1-10 seconds per test)

### End-to-End Tests
- **Purpose**: Test complete user workflows
- **Coverage**: Full system functionality from user input to output
- **Mocking**: Minimal mocking, focus on real system behavior
- **Speed**: Slow execution (10-60 seconds per test)

### Performance Tests
- **Purpose**: Test system performance under load
- **Coverage**: Response times, throughput, resource usage
- **Tools**: Artillery, K6, custom performance scripts
- **Speed**: Variable execution (1-60 minutes per test)

### Security Tests
- **Purpose**: Test system security and vulnerability
- **Coverage**: Authentication, authorization, data protection, input validation
- **Tools**: OWASP ZAP, custom security scripts
- **Speed**: Medium execution (1-10 minutes per test)

### Accessibility Tests
- **Purpose**: Test system accessibility compliance
- **Coverage**: WCAG compliance, screen reader support, keyboard navigation
- **Tools**: Pa11y, Lighthouse, custom accessibility scripts
- **Speed**: Medium execution (1-5 minutes per test)

### Live Tests
- **Purpose**: Test system in production/staging environments
- **Coverage**: Real-world scenarios, monitoring, alerting
- **Mocking**: No mocking, real environment testing
- **Speed**: Variable execution (1-30 minutes per test)

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test Types
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# End-to-end tests
npm run test:e2e

# Performance tests
npm run test:performance

# Security tests
npm run test:security

# Accessibility tests
npm run test:accessibility

# Live tests
npm run test:live
```

### Test Modes
```bash
# Watch mode (development)
npm run test:watch

# Coverage report
npm run test:coverage

# CI mode
npm run test:ci

# All test types
npm run test:all
```

## Test Configuration

### Jest Configuration
```json
{
  "preset": "ts-jest",
  "testEnvironment": "node",
  "roots": ["<rootDir>/tests"],
  "testMatch": [
    "**/__tests__/**/*.ts",
    "**/?(*.)+(spec|test).ts"
  ],
  "transform": {
    "^.+\\.ts$": "ts-jest"
  },
  "collectCoverageFrom": [
    "**/*.ts",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/tests/**"
  ],
  "coverageDirectory": "coverage",
  "coverageReporters": ["text", "lcov", "html"],
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  },
  "setupFilesAfterEnv": ["<rootDir>/tests/setup.ts"],
  "testTimeout": 30000,
  "maxWorkers": 4,
  "verbose": true
}
```

### Environment Variables
```bash
# Test environment
NODE_ENV=test
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=test-key
AWS_SECRET_ACCESS_KEY=test-secret

# API keys (mocked in tests)
OPENAI_API_KEY=test-openai-key
TWITTER_API_KEY=test-twitter-key
REDDIT_API_KEY=test-reddit-key
REUTERS_API_KEY=test-reuters-key
BLOOMBERG_API_KEY=test-bloomberg-key

# Table names (mocked in tests)
SIGNALS_TABLE_NAME=test-signals-table
PROPOSALS_TABLE_NAME=test-proposals-table
DECISIONS_TABLE_NAME=test-decisions-table
OUTCOMES_TABLE_NAME=test-outcomes-table
METRICS_TABLE_NAME=test-metrics-table
ALERTS_TABLE_NAME=test-alerts-table
COMPLIANCE_CHECKS_TABLE_NAME=test-compliance-checks-table
SECURITY_EVENTS_TABLE_NAME=test-security-events-table
STREAM_MESSAGES_TABLE_NAME=test-stream-messages-table
SECRETS_MANAGER_SECRET_ID=test-secrets-manager-secret
```

## Test Utilities

### Global Test Utils
```typescript
// Generate test data
const signal = testUtils.generateTestSignal();
const proposal = testUtils.generateTestProposal();
const decision = testUtils.generateTestDecision();
const outcome = testUtils.generateTestOutcome();

// Generate test events
const event = testUtils.generateAPIGatewayEvent();

// Mock AWS responses
const dynamoResponse = testUtils.mockDynamoDBResponse([item1, item2]);
const s3Response = testUtils.mockS3Response('test data');

// Test assertions
testUtils.expectValidSignal(signal);
testUtils.expectValidProposal(proposal);
testUtils.expectValidDecision(decision);
testUtils.expectValidOutcome(outcome);

// Performance testing
const { result, executionTime } = await testUtils.measureExecutionTime(async () => {
  return await someAsyncFunction();
});

// Mock external APIs
testUtils.mockTwitterAPI();
testUtils.mockRedditAPI();
testUtils.mockNewsAPI();
testUtils.mockOpenAI();
```

### Custom Jest Matchers
```typescript
// Signal validation
expect(signal).toBeValidSignal();

// Proposal validation
expect(proposal).toBeValidProposal();

// Decision validation
expect(decision).toBeValidDecision();

// Outcome validation
expect(outcome).toBeValidOutcome();
```

## Test Data

### Test Signals
```typescript
{
  id: 'test-signal-123',
  source: 'twitter',
  content: 'Test signal content',
  timestamp: '2024-01-15T10:30:00Z',
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
  }
}
```

### Test Proposals
```typescript
{
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
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-15T10:30:00Z',
  risk_score: 0.6,
  expected_return: 0.08,
  sharpe_ratio: 1.2
}
```

### Test Decisions
```typescript
{
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
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-15T10:30:00Z'
}
```

### Test Outcomes
```typescript
{
  id: 'test-outcome-123',
  proposal_id: 'test-proposal-123',
  exit_price: { BTC: 52000, ETH: 3200 },
  return_pct: 0.04,
  volatility: 0.2,
  sharpe_ratio: 1.2,
  max_drawdown: 0.02,
  win_rate: 1.0,
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-15T10:30:00Z'
}
```

## Performance Testing

### Load Testing
```bash
# Run load tests
npm run test:performance

# Custom load test
artillery run tests/performance/load-test.yml
```

### Stress Testing
```bash
# Run stress tests
npm run test:stress

# Custom stress test
k6 run tests/performance/stress-test.js
```

### Benchmark Testing
```bash
# Run benchmark tests
npm run test:benchmark

# Custom benchmark test
node tests/performance/benchmark-test.js
```

## Security Testing

### Authentication Tests
```bash
# Run authentication tests
npm run test:security

# Custom security test
node tests/security/auth-test.js
```

### Vulnerability Tests
```bash
# Run vulnerability tests
npm run test:vulnerabilities

# Custom vulnerability test
node tests/security/vulnerability-test.js
```

## Accessibility Testing

### WCAG Compliance
```bash
# Run WCAG tests
npm run test:accessibility

# Custom accessibility test
pa11y http://localhost:3000
```

### Screen Reader Tests
```bash
# Run screen reader tests
npm run test:screen-reader

# Custom screen reader test
node tests/accessibility/screen-reader-test.js
```

## Live Testing

### Production Tests
```bash
# Run production tests
npm run test:live

# Custom production test
node tests/live/production-test.js
```

### Staging Tests
```bash
# Run staging tests
npm run test:staging

# Custom staging test
node tests/live/staging-test.js
```

## Test Coverage

### Coverage Requirements
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/index.html
```

## Continuous Integration

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:ci
      - run: npm run test:coverage
```

### Test Pipeline
1. **Unit Tests**: Fast, isolated tests
2. **Integration Tests**: Component interaction tests
3. **E2E Tests**: Complete workflow tests
4. **Performance Tests**: Load and stress tests
5. **Security Tests**: Security and vulnerability tests
6. **Accessibility Tests**: WCAG compliance tests
7. **Live Tests**: Production environment tests

## Best Practices

### Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests independent and isolated

### Test Data
- Use realistic test data
- Avoid hardcoded values
- Use factories for test data generation
- Clean up test data after tests

### Mocking
- Mock external dependencies
- Use consistent mocking patterns
- Avoid over-mocking
- Test real behavior when possible

### Assertions
- Use specific assertions
- Test both positive and negative cases
- Verify error conditions
- Check data structure and types

### Performance
- Keep tests fast
- Use parallel execution when possible
- Avoid unnecessary setup/teardown
- Monitor test execution time

## Troubleshooting

### Common Issues
1. **Test Timeouts**: Increase timeout values
2. **Mock Failures**: Check mock configurations
3. **Environment Issues**: Verify environment variables
4. **Coverage Issues**: Check coverage thresholds

### Debug Mode
```bash
# Run tests in debug mode
DEBUG=ai-investment:* npm test

# Run specific test in debug mode
DEBUG=ai-investment:* npm test -- --testNamePattern="specific test"
```

### Test Logs
```bash
# Enable verbose logging
npm test -- --verbose

# Enable debug logging
npm test -- --debug
```

## Contributing

### Adding New Tests
1. Create test file in appropriate directory
2. Follow naming convention: `test-*.ts`
3. Add test utilities if needed
4. Update test configuration if necessary
5. Add test documentation

### Test Review
1. Check test coverage
2. Verify test quality
3. Ensure test independence
4. Validate test data
5. Review test performance

## License

MIT License - see LICENSE file for details.
