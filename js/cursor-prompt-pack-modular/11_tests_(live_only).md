# Modul 11 — Tests (Live Only) (OPTIMIERT)
**Repo:** `Manu-Manera/manuel-weiss-website` • **Version:** 5.0 • **Zeitzone:** Europe/Zurich  
**Prinzip:** *Kein Test-/Demo-Daten-Einsatz. Nur echte Quellen/Provider. Serverseitige Secrets.*
**Ziel:** Production-ready Testing Framework mit umfassender Testabdeckung und Live-Testing

---
# Repo-Ausrichtung & Pfade (ERWEITERT)
- **Test Framework:** `tests/` mit Jest, Playwright, und Custom Test Utilities
- **Unit Tests:** `__tests__/` mit isolierten Komponenten-Tests
- **Integration Tests:** `tests/integration/` mit Service-Integration
- **E2E Tests:** `tests/e2e/` mit Playwright für UI-Flows
- **Live Tests:** `tests/live/` mit echten Provider-Calls
- **Test Data:** `tests/fixtures/` mit Test-Datensätzen

# Smart Prompt – Implementierung (FÜR CURSOR - OPTIMIERT)
> **An Cursor – Production Testing Framework implementieren (Deutsch):**  

## PHASE 1: Unit Testing Framework (ERWEITERT)
### **Jest Configuration:**
```typescript
// jest.config.ts
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 30000,
  maxWorkers: 4
};
```

### **Test Setup and Utilities:**
```typescript
// tests/setup.ts
import { jest } from '@jest/globals';
import { DynamoDB } from 'aws-sdk';
import { S3 } from 'aws-sdk';

// Mock AWS Services
jest.mock('aws-sdk', () => ({
  DynamoDB: {
    DocumentClient: jest.fn(() => ({
      get: jest.fn(),
      put: jest.fn(),
      query: jest.fn(),
      scan: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }))
  },
  S3: jest.fn(() => ({
    getObject: jest.fn(),
    putObject: jest.fn(),
    deleteObject: jest.fn()
  })),
  CloudWatch: jest.fn(() => ({
    putMetricData: jest.fn()
  }))
}));

// Global test utilities
global.testUtils = {
  createMockEvent: (overrides = {}) => ({
    httpMethod: 'POST',
    path: '/test',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token'
    },
    body: JSON.stringify({}),
    queryStringParameters: {},
    pathParameters: {},
    requestContext: {
      requestId: 'test-request-id',
      identity: {
        sourceIp: '127.0.0.1'
      }
    },
    ...overrides
  }),

  createMockContext: () => ({
    callbackWaitsForEmptyEventLoop: false,
    functionName: 'test-function',
    functionVersion: '1',
    invokedFunctionArn: 'arn:aws:lambda:eu-central-1:123456789012:function:test',
    memoryLimitInMB: '128',
    awsRequestId: 'test-request-id',
    logGroupName: '/aws/lambda/test',
    logStreamName: '2023/01/01/[$LATEST]test',
    getRemainingTimeInMillis: () => 30000
  }),

  createMockSignal: (overrides = {}) => ({
    id: 'test-signal-id',
    content: 'Test signal content',
    source: 'social',
    timestamp: new Date().toISOString(),
    score: 0.8,
    confidence: 0.9,
    assets: ['AAPL', 'GOOGL'],
    metadata: {},
    ...overrides
  }),

  createMockProposal: (overrides = {}) => ({
    id: 'test-proposal-id',
    assets: ['AAPL'],
    size_pct: 0.1,
    expected_return: 0.05,
    risk_score: 0.3,
    status: 'pending',
    created_at: new Date().toISOString(),
    ...overrides
  })
};

// Test database setup
beforeAll(async () => {
  // Setup test database
  await setupTestDatabase();
});

afterAll(async () => {
  // Cleanup test database
  await cleanupTestDatabase();
});

beforeEach(() => {
  // Reset mocks
  jest.clearAllMocks();
});
```

**Unit:** reine Logik (Parser/Scoring/Risk-Formeln) – ohne Datenmocks.
**Integration/E2E:** gegen echte Provider-APIs & echte Backend-Routen.
**Wenn Keys fehlen und `PRODUCTION_DATA_ONLY=1` → hart fail** mit klarer Meldung.

# Zusätzliche Verbesserungen (PRODUCTION-GRADE - OPTIMIERT)
- **Live‑Smoke Suites** mit striktem Call‑Budget (Rate‑Limits respektieren).  
- **Stabile Abfragen** (z. B. per Provider‑IDs bekannter Events).

# Fehlervermeidung – Was schiefgehen kann & Gegenmaßnahmen
- **Flaky durch Live‑Daten**.  
  **Fix:** Stabilere IDs/Zeiträume, Retries in Testclient.  
- **Kostenexplosion**.  
  **Fix:** Budget‑Limiter im Test‑Runner.

# Akzeptanzkriterien (Definition of Done)
- CI grün mit Live‑Keys; keine Mocks/Fixtures im Baum.

# Build/Test-Gates & Verifikation (ausführen)
`pnpm test:live` (mit ENV Keys); Coverage‑Report erzeugen.

# Artefakte & Deliverables
- Test‑Runner‑Skripte, README testing.md

