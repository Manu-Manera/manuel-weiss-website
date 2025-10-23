# AI Investment System - Common Package

## Übersicht

Das Common Package enthält wiederverwendbare Utilities, Schemas und Types für das AI Investment System. Es bietet Type-Safety, Performance und Security für alle Module.

## Installation

```bash
npm install @ai-investment/common
```

## Features

- **Zod Schemas**: Type-safe Validation für alle Datenstrukturen
- **Logger**: Strukturiertes Logging mit Context
- **Time Utils**: Zeitzone-spezifische Zeitoperationen
- **Hash Utils**: SimHash, MinHash, Konsistente Hashing
- **AWS Helpers**: DynamoDB, S3, Secrets Manager, CloudWatch
- **LLM Adapter**: OpenAI Integration mit Cost Tracking
- **Error Handling**: Spezialisierte Error Classes
- **Type Safety**: 100% TypeScript Coverage

## Verwendung

### Schemas

```typescript
import { SignalSchema, ProposalSchema, OutcomeSchema } from '@ai-investment/common';

// Signal validieren
const signal = SignalSchema.parse({
  id: 'uuid',
  asset: 'BTC',
  timestamp: new Date(),
  source: 'twitter',
  content: 'Bitcoin is going up!',
  sentiment: 0.8,
  relevance: 0.9,
  novelty: 0.7,
  credibility: 0.8,
  entities: ['Bitcoin', 'BTC'],
  language: 'en'
});

// Proposal validieren
const proposal = ProposalSchema.parse({
  id: 'uuid',
  thesis: 'Bitcoin will increase due to institutional adoption',
  assets: ['BTC'],
  size_pct: 0.1,
  horizon_days: 30,
  entry_price: 50000,
  explain: 'Based on recent institutional investments...',
  constraints_checked: true,
  status: 'proposed',
  created_at: new Date(),
  updated_at: new Date()
});
```

### Logger

```typescript
import { logger, createLoggerWithContext } from '@ai-investment/common';

// Basic logging
logger.info('Signal processed', { signalId: '123' });
logger.error('Processing failed', error, { context: 'ingestion' });

// Contextual logging
const contextualLogger = createLoggerWithContext({
  userId: 'user123',
  reqId: 'req456',
  module: 'scoring'
});

contextualLogger.info('Score calculated', { score: 0.85 });
```

### Time Utils

```typescript
import { TimeUtils } from '@ai-investment/common';

// Current time in Zurich timezone
const now = TimeUtils.now();
const zurichTime = TimeUtils.toZurich(now);

// Market hours
const isOpen = TimeUtils.isMarketOpen();
const nextOpen = TimeUtils.getNextMarketOpen();

// Business days
const businessDays = TimeUtils.getBusinessDays(startDate, endDate);
const nextBusinessDay = TimeUtils.addBusinessDays(today, 5);
```

### Hash Utils

```typescript
import { HashUtils } from '@ai-investment/common';

// Basic hashing
const hash = HashUtils.sha256('text');
const id = HashUtils.generateId();

// Near-duplicate detection
const isDuplicate = HashUtils.isNearDuplicate(text1, text2, 3);
const similarity = HashUtils.jaccardSimilarity(hash1, hash2);

// Cache keys
const cacheKey = HashUtils.cacheKey('signals', userId, timeframe);
```

### AWS Helpers

```typescript
import { AWSHelpers } from '@ai-investment/common';

const aws = new AWSHelpers({
  region: 'eu-central-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// DynamoDB operations
await aws.dynamoPut('signals', signal);
const signals = await aws.dynamoQuery('signals', 'asset = :asset', {
  ExpressionAttributeValues: { ':asset': 'BTC' }
});

// S3 operations
await aws.s3Upload('bucket', 'key', data);
const data = await aws.s3Download('bucket', 'key');

// Secrets Manager
const secrets = await aws.getSecret('ai-investment-secrets');
```

### LLM Adapter

```typescript
import { LLMAdapter } from '@ai-investment/common';

const llm = new LLMAdapter({
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 1000,
  timeout: 30
});

// Text generation
const text = await llm.generateText('Analyze this market signal...');

// Sentiment analysis
const sentiment = await llm.analyzeSentiment('Bitcoin is going up!');

// Entity extraction
const entities = await llm.extractEntities('Elon Musk tweeted about Bitcoin');

// Cost tracking
const totalCost = llm.getTotalCost();
const costSummary = llm.getCostSummary();
```

## API Reference

### Schemas

- `SignalSchema`: Social Media und News Signale
- `ProposalSchema`: Investment Proposals
- `OutcomeSchema`: Evaluationsergebnisse
- `ApiResponseSchema`: Standard API Responses
- `PaginationSchema`: Pagination für Listen
- `FilterSchema`: Filter für Queries

### Types

- `Signal`, `Proposal`, `Outcome`: Core Business Types
- `ApiResponse<T>`: Generic API Response
- `LLMConfig`: LLM Konfiguration
- `AWSConfig`: AWS Konfiguration
- `FeatureVector`: ML Feature Vektor
- `ScoreResult`: ML Scoring Ergebnis

### Logger

- `Logger`: Hauptlogger Klasse
- `ModuleLogger`: Modul-spezifischer Logger
- `createLoggerWithContext()`: Logger mit Context
- `logger`: Default Logger Instanz

### Time Utils

- `TimeUtils.now()`: Aktuelle Zeit
- `TimeUtils.toZurich()`: Zurich Zeitzone
- `TimeUtils.isMarketOpen()`: Markt geöffnet
- `TimeUtils.getBusinessDays()`: Geschäftstage
- `TimeUtils.formatForDisplay()`: Anzeige Format

### Hash Utils

- `HashUtils.sha256()`: SHA256 Hash
- `HashUtils.generateId()`: UUID v4
- `HashUtils.simHash()`: SimHash für Duplikate
- `HashUtils.minHash()`: MinHash für Ähnlichkeit
- `HashUtils.cacheKey()`: Cache Key Generator

### AWS Helpers

- `dynamoPut()`, `dynamoGet()`, `dynamoQuery()`: DynamoDB Ops
- `s3Upload()`, `s3Download()`, `s3List()`: S3 Ops
- `getSecret()`, `putSecret()`: Secrets Manager
- `putMetric()`, `getMetricStatistics()`: CloudWatch
- `sqsSendMessage()`, `sqsReceiveMessage()`: SQS

### LLM Adapter

- `generateText()`: Text Generation
- `generateTextWithSystem()`: Mit System Prompt
- `generateEmbedding()`: Embeddings
- `analyzeSentiment()`: Sentiment Analysis
- `extractEntities()`: Entity Extraction
- `classifyText()`: Text Classification

## Error Handling

```typescript
import { 
  ValidationError, 
  APIError, 
  DatabaseError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  ConfigurationError,
  NetworkError,
  TimeoutError,
  BusinessLogicError,
  ExternalServiceError
} from '@ai-investment/common';

try {
  // Business logic
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation errors
  } else if (error instanceof APIError) {
    // Handle API errors
  } else if (error instanceof DatabaseError) {
    // Handle database errors
  }
}
```

## Performance

- **Type Safety**: 100% TypeScript Coverage
- **Memory Efficient**: Optimierte Datenstrukturen
- **Caching**: Intelligente Cache-Strategien
- **Error Recovery**: Graceful Error Handling
- **Cost Tracking**: LLM Cost Monitoring

## Security

- **Input Validation**: Zod Schema Validation
- **Error Sanitization**: Sichere Error Messages
- **Secret Management**: AWS Secrets Manager
- **Audit Logging**: Vollständige Audit Trails
- **Rate Limiting**: Built-in Rate Limiting

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Build

```bash
# Build package
npm run build

# Watch mode
npm run watch

# Clean build
npm run clean && npm run build
```

## Linting

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check
```

## Changelog

### v1.0.0
- Initial release
- Core schemas and types
- Logger with context
- Time utilities
- Hash utilities
- AWS helpers
- LLM adapter
- Error handling

## License

MIT License - siehe LICENSE Datei für Details.
