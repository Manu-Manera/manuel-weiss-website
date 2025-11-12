# Modul 07 — API (OpenAPI & Client) (OPTIMIERT)
**Repo:** `Manu-Manera/manuel-weiss-website` • **Version:** 5.0 • **Zeitzone:** Europe/Zurich  
**Prinzip:** *Kein Test-/Demo-Daten-Einsatz. Nur echte Quellen/Provider. Serverseitige Secrets.*
**Ziel:** Production-ready API mit vollständiger OpenAPI-Spezifikation und TypeScript Client

---
# Repo-Ausrichtung & Pfade (ERWEITERT)
- **API Specification:** `api/openapi.yaml` mit vollständiger OpenAPI 3.1 Spezifikation
- **TypeScript Client:** `packages/api-client/` mit automatischem Codegen und Zod-Validation
- **API Gateway:** AWS API Gateway mit CORS, Rate-Limiting, Request/Response Logging
- **Documentation:** `api/docs/` mit interaktiver API-Dokumentation
- **Testing:** `api/tests/` mit Contract Tests und Integration Tests

# Smart Prompt – Implementierung (FÜR CURSOR - OPTIMIERT)
> **An Cursor – Production API System implementieren (Deutsch):**  

## PHASE 1: OpenAPI 3.1 Specification (ERWEITERT)
### **Vollständige OpenAPI Spezifikation:**
```yaml
openapi: 3.1.0
info:
  title: AI Investment System API
  version: 1.0.0
  description: Production-ready API für das AI Investment System
  contact:
    name: Manuel Weiss
    email: manuel@manuel-weiss.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT
servers:
  - url: https://api.manuel-weiss.com/v1
    description: Production Server
  - url: https://staging-api.manuel-weiss.com/v1
    description: Staging Server
  - url: http://localhost:3000/v1
    description: Development Server

security:
  - BearerAuth: []
  - ApiKeyAuth: []

paths:
  /signals:
    get:
      summary: Get Investment Signals
      description: Retrieve filtered investment signals with pagination
      operationId: getSignals
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
        - name: offset
          in: query
          schema:
            type: integer
            minimum: 0
            default: 0
        - name: source
          in: query
          schema:
            type: string
            enum: [social, news, both]
        - name: asset
          in: query
          schema:
            type: string
        - name: timeframe
          in: query
          schema:
            type: string
            enum: [1h, 4h, 1d, 1w]
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SignalsResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '429':
          $ref: '#/components/responses/TooManyRequests'
        '500':
          $ref: '#/components/responses/InternalServerError'

  /score:
    post:
      summary: Score Signals
      description: Calculate ML-based scores for investment signals
      operationId: scoreSignals
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ScoringRequest'
      responses:
        '200':
          description: Successful scoring
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ScoringResponse'

  /propose:
    post:
      summary: Propose Investment
      description: Generate investment proposals based on signals
      operationId: proposeInvestment
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ProposalRequest'
      responses:
        '200':
          description: Successful proposal
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProposalResponse'

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key

  schemas:
    Signal:
      type: object
      required:
        - id
        - content
        - source
        - timestamp
        - score
      properties:
        id:
          type: string
          format: uuid
        content:
          type: string
          maxLength: 1000
        source:
          type: string
          enum: [social, news]
        timestamp:
          type: string
          format: date-time
        score:
          type: number
          minimum: 0
          maximum: 1
        confidence:
          type: number
          minimum: 0
          maximum: 1
        assets:
          type: array
          items:
            type: string
        metadata:
          type: object

    ErrorResponse:
      type: object
      required:
        - ok
        - error
      properties:
        ok:
          type: boolean
          example: false
        error:
          type: object
          properties:
            code:
              type: string
            message:
              type: string
            details:
              type: object
            timestamp:
              type: string
              format: date-time

  responses:
    BadRequest:
      description: Bad Request
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
    Unauthorized:
      description: Unauthorized
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
    TooManyRequests:
      description: Too Many Requests
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
    InternalServerError:
      description: Internal Server Error
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
```

## PHASE 2: TypeScript Client Generation (ERWEITERT)
### **Automatisches Codegen Setup:**
```typescript
// packages/api-client/generator.ts
import { OpenAPIGenerator } from '@openapitools/openapi-generator-cli';
import { ZodSchemaGenerator } from 'openapi-zod-client';

export class APIClientGenerator {
  private generator: OpenAPIGenerator;
  private zodGenerator: ZodSchemaGenerator;

  constructor() {
    this.generator = new OpenAPIGenerator({
      inputSpec: './api/openapi.yaml',
      generatorName: 'typescript-fetch',
      outputDir: './packages/api-client/generated',
      additionalProperties: {
        npmName: '@manuel-weiss/ai-investment-api',
        npmVersion: '1.0.0',
        supportsES6: true,
        withInterfaces: true,
        typescriptThreePlus: true
      }
    });

    this.zodGenerator = new ZodSchemaGenerator({
      inputSpec: './api/openapi.yaml',
      outputDir: './packages/api-client/schemas',
      generateValidation: true
    });
  }

  async generateClient(): Promise<void> {
    // Generate TypeScript Client
    await this.generator.generate();
    
    // Generate Zod Schemas
    await this.zodGenerator.generate();
    
    // Generate Custom Client Wrapper
    await this.generateClientWrapper();
  }

  private async generateClientWrapper(): Promise<void> {
    const wrapperCode = `
import { Configuration, DefaultApi } from './generated';
import { z } from 'zod';
import { retry, exponentialBackoff } from './utils/retry';
import { logger } from './utils/logger';

export class AIInvestmentAPIClient {
  private api: DefaultApi;
  private config: Configuration;

  constructor(config: ClientConfig) {
    this.config = new Configuration({
      basePath: config.baseUrl,
      apiKey: config.apiKey,
      accessToken: config.accessToken,
      headers: {
        'User-Agent': 'AI-Investment-Client/1.0.0',
        'X-Client-Version': '1.0.0'
      }
    });
    
    this.api = new DefaultApi(this.config);
  }

  // Signals API
  async getSignals(params: GetSignalsParams): Promise<SignalsResponse> {
    return await retry(
      () => this.api.getSignals(params),
      { maxAttempts: 3, backoff: exponentialBackoff }
    );
  }

  // Scoring API
  async scoreSignals(request: ScoringRequest): Promise<ScoringResponse> {
    // Validate request with Zod
    const validatedRequest = ScoringRequestSchema.parse(request);
    
    return await retry(
      () => this.api.scoreSignals(validatedRequest),
      { maxAttempts: 3, backoff: exponentialBackoff }
    );
  }

  // Proposal API
  async proposeInvestment(request: ProposalRequest): Promise<ProposalResponse> {
    const validatedRequest = ProposalRequestSchema.parse(request);
    
    return await retry(
      () => this.api.proposeInvestment(validatedRequest),
      { maxAttempts: 3, backoff: exponentialBackoff }
    );
  }
}

export default AIInvestmentAPIClient;
    `;

    await fs.writeFile('./packages/api-client/AIInvestmentAPIClient.ts', wrapperCode);
  }
}
```

## PHASE 3: Advanced Client Features (NEU)
### **Retry Logic & Error Handling:**
```typescript
// packages/api-client/utils/retry.ts
export interface RetryConfig {
  maxAttempts: number;
  backoff: (attempt: number) => number;
  retryCondition: (error: Error) => boolean;
}

export const exponentialBackoff = (attempt: number): number => {
  return Math.min(1000 * Math.pow(2, attempt), 10000);
};

export const retry = async <T>(
  operation: () => Promise<T>,
  config: RetryConfig
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (!config.retryCondition(lastError) || attempt === config.maxAttempts - 1) {
        throw lastError;
      }
      
      const delay = config.backoff(attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};
```

## PHASE 4: API Gateway Integration (ERWEITERT)
### **AWS API Gateway Configuration:**
```typescript
// api/gateway-config.ts
export const apiGatewayConfig = {
  restApi: {
    name: 'AI-Investment-API',
    description: 'Production API for AI Investment System',
    version: '1.0.0',
    binaryMediaTypes: ['application/octet-stream'],
    minimumCompressionSize: 1024,
    endpointConfiguration: {
      types: ['REGIONAL']
    }
  },
  
  cors: {
    allowOrigins: ['https://manuel-weiss.com', 'https://admin.manuel-weiss.com'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    allowCredentials: true,
    maxAge: 86400
  },
  
  rateLimiting: {
    burstLimit: 100,
    rateLimit: 50,
    quotaLimit: 10000,
    quotaPeriod: 'DAY'
  }
};
```

**Frontend nutzt nur diesen Client; keine direkten OpenAI-Calls.**

# Zusätzliche Verbesserungen (PRODUCTION-GRADE - OPTIMIERT)
- **Idempotency-Key** Header für alle POST/PUT Requests
- Einheitliche Fehlerobjekte (code, message, details, timestamp)
- API-Versionierung & Deprecation-Policy
- **Request/Response Logging** mit strukturierten Logs
- **Rate Limiting** mit intelligenten Backoff-Strategien
- **Circuit Breaker** für Resilience
- **Request Deduplication** für Performance
- **API Documentation** mit interaktiven Beispielen

# Fehlervermeidung – Was schiefgehen kann & Gegenmaßnahmen (ERWEITERT)
- **Drift** zwischen Zod und OpenAPI.  
  **Fix:** JSON-Schema direkt aus Zod exportieren; CI-Check mit Schema-Validation
- **CORS/Auth-Fehler**.  
  **Fix:** Contract-Tests mit Cognito-JWT, CORS-Preflight-Tests
- **Rate Limit Exhaustion** → Service-Unterbrechung.  
  **Fix:** Intelligent Backoff, Queue-Management, Fallback-Strategien
- **Client-Server Version Mismatch** → Kompatibilitätsprobleme.  
  **Fix:** Versioning Strategy, Backward Compatibility, Migration Guides
- **Network Timeouts** → Unzuverlässige API-Calls.  
  **Fix:** Timeout Configuration, Retry Logic, Circuit Breaker
- **API Key Compromise** → Security-Breach.  
  **Fix:** Key Rotation, Monitoring, Automated Alerts

# Akzeptanzkriterien (Definition of Done - ERWEITERT)
- Lint-freies OpenAPI; Client baut; Smoke gegen jede Route grün
- **API Documentation** vollständig und interaktiv
- **TypeScript Client** funktional mit Zod-Validation
- **Error Handling** robust und benutzerfreundlich
- **Performance Benchmarks** erreicht (< 2s Response Time)
- **Security Tests** bestanden (Authentication, Authorization)
- **Contract Tests** erfolgreich (Client-Server Compatibility)
- **Rate Limiting** funktional und getestet
- **CORS Configuration** korrekt und getestet

# Build/Test-Gates & Verifikation (AUSFÜHREN - OPTIMIERT)
```bash
# OpenAPI Validation
./scripts/validate:openapi
./scripts/lint:openapi

# Client Generation
./scripts/generate:client
./scripts/build:client

# Contract Tests
./scripts/test:contracts
./scripts/test:integration

# Performance Tests
./scripts/test:performance:api
./scripts/test:performance:client

# Security Tests
./scripts/test:security:api
./scripts/test:security:client
```

# Artefakte & Deliverables (ERWEITERT)
- `api/openapi.yaml` (vollständige OpenAPI 3.1 Spezifikation)
- `packages/api-client/*` (TypeScript Client mit Codegen)
- **API Documentation** (Interaktive Docs, Postman Collection)
- **Client Documentation** (Usage Examples, Migration Guides)
- **Contract Tests** (Client-Server Compatibility)
- **Performance Reports** (Response Times, Throughput)
- **Security Reports** (Authentication, Authorization, CORS)
- **Integration Tests** (End-to-End API Testing)
- **Monitoring Setup** (API Metrics, Error Tracking)

