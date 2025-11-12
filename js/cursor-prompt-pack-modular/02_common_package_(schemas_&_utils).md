# Modul 02 — Common Package (Schemas & Utils) (OPTIMIERT)
**Repo:** `Manu-Manera/manuel-weiss-website` • **Version:** 5.0 • **Zeitzone:** Europe/Zurich  
**Prinzip:** *Kein Test-/Demo-Daten-Einsatz. Nur echte Quellen/Provider. Serverseitige Secrets.*
**Ziel:** Production-ready Common Package mit Type-Safety, Performance und Security

---
# Repo-Ausrichtung & Pfade (ERWEITERT)
- **Ziel:** `packages/common/` mit modularen Utilities
- **Core Files:** `zod-schemas.ts`, `types.ts`, `logger.ts`, `time.ts`, `hash.ts`, `aws.ts`, `llm.ts`
- **Additional:** `crypto.ts`, `validation.ts`, `cache.ts`, `metrics.ts`, `errors.ts`
- **Testing:** `__tests__/` mit Unit Tests für alle Utilities
- **Documentation:** `README.md`, `API.md`, `CHANGELOG.md`

# Smart Prompt – Implementierung (FÜR CURSOR - OPTIMIERT)
> **An Cursor – Common Package erstellen (Deutsch):**  

## PHASE 1: Core Schemas & Types
### **Zod-Schemas (ERWEITERT):**
- **Signal Schema:**
  ```typescript
  const SignalSchema = z.object({
    id: z.string().uuid(),
    asset: z.string().min(1).max(10),
    timestamp: z.date(),
    source: z.enum(['twitter', 'reddit', 'news', 'youtube']),
    content: z.string().min(1).max(10000),
    sentiment: z.number().min(-1).max(1),
    relevance: z.number().min(0).max(1),
    novelty: z.number().min(0).max(1),
    credibility: z.number().min(0).max(1),
    entities: z.array(z.string()),
    language: z.enum(['de', 'en', 'fr', 'es', 'it']),
    metadata: z.record(z.any()).optional()
  });
  ```

- **Proposal Schema:**
  ```typescript
  const ProposalSchema = z.object({
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
    updated_at: z.date()
  });
  ```

- **Outcome Schema:**
  ```typescript
  const OutcomeSchema = z.object({
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
  ```

- **API DTOs mit Validation:**
  - Request/Response Schemas für alle Endpoints
  - Error Response Schemas
  - Pagination Schemas
  - Filter/Query Schemas

- **JSON-Schema Exporter:**
  - Automatische Generierung für OpenAPI
  - Type-Safe API Documentation
  - Client-Side Validation

### **Types (ERWEITERT):**
```typescript
// Core Types
export type Signal = z.infer<typeof SignalSchema>;
export type Proposal = z.infer<typeof ProposalSchema>;
export type Outcome = z.infer<typeof OutcomeSchema>;

// API Types
export type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
};

// Configuration Types
export type LLMConfig = {
  model: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
};

export type AWSConfig = {
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
};

// Error Types
export class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class APIError extends Error {
  constructor(
    message: string, 
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}
```

## PHASE 2: Utility Functions
### **Logger (ERWEITERT):**
```typescript
export class Logger {
  private context: Record<string, any>;
  
  constructor(context: Record<string, any> = {}) {
    this.context = context;
  }
  
  info(message: string, data?: any): void {
    this.log('info', message, data);
  }
  
  error(message: string, error?: Error, data?: any): void {
    this.log('error', message, { error: error?.stack, ...data });
  }
  
  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }
  
  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }
  
  private log(level: string, message: string, data?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      data,
      reqId: this.context.reqId,
      userId: this.context.userId,
      module: this.context.module,
      costTokens: this.context.costTokens
    };
    
    console.log(JSON.stringify(logEntry));
  }
}
```

### **Time Utilities (ERWEITERT):**
```typescript
export class TimeUtils {
  static readonly TIMEZONE = 'Europe/Zurich';
  
  static now(): Date {
    return new Date();
  }
  
  static toZurich(date: Date): Date {
    return new Date(date.toLocaleString('en-US', { timeZone: this.TIMEZONE }));
  }
  
  static toUTC(date: Date): Date {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  }
  
  static formatForDisplay(date: Date): string {
    return date.toLocaleString('de-DE', { 
      timeZone: this.TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  static getBusinessDays(start: Date, end: Date): number {
    // Implementation for business days calculation
  }
  
  static isMarketOpen(date: Date): boolean {
    // Implementation for market hours check
  }
}
```

### **Hash Utilities (ERWEITERT):**
```typescript
export class HashUtils {
  static simHash(text: string): string {
    // SimHash implementation for near-duplicate detection
  }
  
  static minHash(text: string): string {
    // MinHash implementation for similarity
  }
  
  static sha256(text: string): string {
    // SHA256 hash
  }
  
  static generateId(): string {
    // UUID v4 generation
  }
  
  static hashObject(obj: any): string {
    // Hash for object comparison
  }
}
```

### **AWS Helpers (ERWEITERT):**
```typescript
export class AWSHelpers {
  static async dynamoPut(
    tableName: string, 
    item: any, 
    options?: any
  ): Promise<void> {
    // DynamoDB put operation with error handling
  }
  
  static async dynamoQuery(
    tableName: string, 
    keyCondition: string, 
    options?: any
  ): Promise<any[]> {
    // DynamoDB query operation
  }
  
  static async s3Upload(
    bucket: string, 
    key: string, 
    body: Buffer | string
  ): Promise<string> {
    // S3 upload with error handling
  }
  
  static async s3Download(
    bucket: string, 
    key: string
  ): Promise<Buffer> {
    // S3 download with error handling
  }
  
  static async timestreamWrite(
    database: string, 
    table: string, 
    records: any[]
  ): Promise<void> {
    // Timestream write operation
  }
}
```

### **LLM Adapter (ERWEITERT):**
```typescript
export class LLMAdapter {
  private client: OpenAI;
  private config: LLMConfig;
  
  constructor(config: LLMConfig) {
    this.config = config;
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: config.timeout
    });
  }
  
  async generateText(prompt: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      });
      
      return response.choices[0]?.message?.content || '';
    } catch (error) {
      throw new APIError('LLM generation failed', 500, 'LLM_ERROR');
    }
  }
  
  async generateEmbedding(text: string): Promise<number[]> {
    // Embedding generation
  }
  
  async analyzeSentiment(text: string): Promise<number> {
    // Sentiment analysis
  }
}
```

## PHASE 3: Advanced Features
### **Crypto Utilities:**
- **Encryption/Decryption** für sensitive Daten
- **Digital Signatures** für Audit Trails
- **Key Management** für verschiedene Environments

### **Validation Utilities:**
- **Input Sanitization** für alle User Inputs
- **Schema Validation** mit detaillierten Error Messages
- **Business Rule Validation** für Investment Logic

### **Cache Utilities:**
- **In-Memory Cache** für häufige Queries
- **Redis Integration** für distributed Caching
- **Cache Invalidation** Strategies

### **Metrics Utilities:**
- **Performance Metrics** Collection
- **Business Metrics** Tracking
- **Cost Metrics** für LLM Usage

**Env-Guard:** Wenn `PRODUCTION_DATA_ONLY=1` & fehlende Provider-Keys → **throw** (harte Abbruchlogik).

# Zusätzliche Verbesserungen (PRODUCTION-GRADE - OPTIMIERT)
- **Envelope-Standard** `{ ok, data?, error? }` für jede Handler-Antwort
- **Idempotency-Key** Utility für Write-Ops
- **Cost-Accounting**: Tokenzählung/Preis-Schätzung pro LLM-Call
- **Type-Safety** mit strict TypeScript Konfiguration
- **Performance Monitoring** für alle Utility Functions
- **Memory Management** für große Datensätze
- **Error Recovery** mit Retry-Logic
- **Internationalization** (i18n) Support für deutsche/englische Texte
- **Security Hardening** mit Input Validation und Sanitization

# Fehlervermeidung – Was schiefgehen kann & Gegenmaßnahmen (ERWEITERT)
- **any-Leaks** im Public API.  
  **Fix:** TS `--noImplicitAny`, Lint-Regeln, CI Blocker, Type Guards
- **LLM-Key im FE** genutzt.  
  **Fix:** Adapter nur im Serverpack nutzbar; FE-Bundles scannen auf „openai"; Build-time Checks
- **Memory Leaks** bei großen Datensätzen.  
  **Fix:** Streaming APIs, Memory Monitoring, Garbage Collection Hints
- **Type-Safety Issues** bei Runtime.  
  **Fix:** Runtime Validation, Schema Guards, Type Assertions
- **Performance Degradation** bei häufigen Calls.  
  **Fix:** Caching, Connection Pooling, Batch Operations
- **Security Vulnerabilities** in Input Processing.  
  **Fix:** Input Sanitization, XSS Prevention, SQL Injection Protection
- **Error Handling** unvollständig.  
  **Fix:** Comprehensive Error Types, Error Recovery, User-friendly Messages

# Akzeptanzkriterien (Definition of Done - ERWEITERT)
- Build grün; Tests grün; keine `any` in Public APIs
- LLM-Adapter lädt Keys nur serverseitig
- **Type-Safety** vollständig implementiert (100% TypeScript Coverage)
- **Performance Tests** erfolgreich (Response Times < 100ms)
- **Security Tests** bestanden (OWASP Top 10)
- **Memory Tests** erfolgreich (keine Leaks)
- **Error Handling** vollständig (alle Edge Cases abgedeckt)
- **Documentation** vollständig (API Docs, Examples, Troubleshooting)
- **Internationalization** implementiert (Deutsch/Englisch)

# Build/Test-Gates & Verifikation (AUSFÜHREN - OPTIMIERT)
```bash
# Core Build & Test
pnpm -w build && pnpm -w test

# Type Safety
pnpm -w type-check
pnpm -w lint:types

# Performance Testing
pnpm -w test:performance

# Security Testing
pnpm -w test:security

# Memory Testing
pnpm -w test:memory

# Integration Testing
pnpm -w test:integration

# Documentation Generation
pnpm -w docs:generate
```

# Artefakte & Deliverables (ERWEITERT)
- `packages/common/*` (vollständiges Package)
- `README.md` (Setup, Usage, Examples)
- `API.md` (vollständige API Dokumentation)
- `CHANGELOG.md` (Version History)
- `__tests__/` (Unit Tests für alle Utilities)
- **Type Definitions** (`.d.ts` Files)
- **Performance Benchmarks** (Benchmark Results)
- **Security Report** (Vulnerability Assessment)
- **Memory Profile** (Memory Usage Analysis)
- **Error Documentation** (Error Codes, Messages, Recovery)

