# Modul 03 — Ingestion (Social, News – echte Quellen) (OPTIMIERT)
**Repo:** `Manu-Manera/manuel-weiss-website` • **Version:** 5.0 • **Zeitzone:** Europe/Zurich  
**Prinzip:** *Kein Test-/Demo-Daten-Einsatz. Nur echte Quellen/Provider. Serverseitige Secrets.*
**Ziel:** Production-ready Data Ingestion mit hoher Qualität, Performance und Compliance

---
# Repo-Ausrichtung & Pfade (ERWEITERT)
- **Lambda Functions:** `lambda/ingestion-social/`, `lambda/ingestion-news/`
- **API Routes:** `/v1/ingest/social`, `/v1/ingest/news` in ApiStack
- **Data Storage:** S3 (raw data), DynamoDB (processed signals)
- **Monitoring:** CloudWatch Logs, Metrics, Alarms
- **Security:** API Keys in Secrets Manager, Rate Limiting, Input Validation

# Smart Prompt – Implementierung (FÜR CURSOR - OPTIMIERT)
> **An Cursor – Data Ingestion System implementieren (Deutsch):**  

## PHASE 1: Social Media Ingestion (ERWEITERT)
### **ingestSocial Lambda Function:**
```typescript
// Vollständige Implementierung mit Error Handling, Rate Limiting, Quality Control
export const ingestSocial = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Input Validation mit Zod
    const requestBody = SocialIngestionSchema.parse(JSON.parse(event.body || '{}'));
    
    // Rate Limiting Check
    await checkRateLimit(requestBody.source, requestBody.userId);
    
    // Parallel Data Fetching von verschiedenen Quellen
    const socialData = await Promise.allSettled([
      fetchTwitterData(requestBody.assets, requestBody.timeframe),
      fetchRedditData(requestBody.assets, requestBody.timeframe),
      fetchYouTubeData(requestBody.assets, requestBody.timeframe),
      fetchLinkedInData(requestBody.assets, requestBody.timeframe)
    ]);
    
    // Data Processing Pipeline
    const processedSignals = await processSocialData(socialData);
    
    // Quality Control & Validation
    const validatedSignals = await validateSignals(processedSignals);
    
    // Storage mit Idempotency
    await storeSignals(validatedSignals);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        data: {
          signalsProcessed: validatedSignals.length,
          sources: requestBody.sources,
          timestamp: new Date().toISOString()
        }
      })
    };
  } catch (error) {
    logger.error('Social ingestion failed', error);
    return handleError(error);
  }
};
```

### **Offizielle APIs Integration:**
- **Twitter API v2:** 
  - Bearer Token Authentication
  - Rate Limiting: 300 requests/15min
  - Endpoints: Tweets, Users, Spaces
  - Compliance: GDPR, Terms of Service
  
- **Reddit API:**
  - OAuth 2.0 Authentication
  - Rate Limiting: 60 requests/minute
  - Endpoints: Subreddits, Posts, Comments
  - Compliance: Reddit API Terms
  
- **YouTube Data API v3:**
  - API Key Authentication
  - Rate Limiting: 10,000 requests/day
  - Endpoints: Videos, Channels, Transcripts
  - Compliance: YouTube Terms of Service
  
- **LinkedIn API:**
  - OAuth 2.0 Authentication
  - Rate Limiting: 100 requests/day
  - Endpoints: Posts, Articles, Company Updates
  - Compliance: LinkedIn API Terms

### **Data Processing Pipeline:**
```typescript
// NER (Named Entity Recognition)
const extractEntities = (text: string): Entity[] => {
  return [
    ...extractTickers(text),      // BTC, ETH, AAPL, etc.
    ...extractTokens(text),       // Crypto tokens
    ...extractPeople(text),       // Elon Musk, Warren Buffett
    ...extractCompanies(text),    // Tesla, Apple, Microsoft
    ...extractEvents(text)        // Earnings, M&A, IPO
  ];
};

// Language Normalization
const normalizeLanguage = (text: string): string => {
  const detectedLang = detectLanguage(text);
  return translateToEnglish(text, detectedLang);
};

// First-Pass Scoring
const calculateScores = (signal: RawSignal): SignalScores => {
  return {
    sentiment: analyzeSentiment(signal.content),
    relevance: calculateRelevance(signal),
    novelty: calculateNovelty(signal),
    credibility: calculateCredibility(signal),
    virality: calculateVirality(signal),
    authority: calculateAuthority(signal)
  };
};
```

### **Storage Strategy:**
```typescript
// Raw Data Storage (S3)
const storeRawData = async (data: RawData): Promise<void> => {
  const key = `raw/social/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${new Date().getDate().toString().padStart(2, '0')}/${new Date().getHours().toString().padStart(2, '0')}/${data.id}.json`;
  
  await s3.putObject({
    Bucket: process.env.RAW_DATA_BUCKET,
    Key: key,
    Body: JSON.stringify(data),
    ContentType: 'application/json',
    ServerSideEncryption: 'AES256'
  });
};

// Processed Signals Storage (DynamoDB)
const storeSignals = async (signals: ProcessedSignal[]): Promise<void> => {
  const tableName = `signals_${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}`;
  
  await Promise.all(signals.map(signal => 
    dynamodb.putItem({
      TableName: tableName,
      Item: {
        PK: `asset#${signal.asset}#${signal.date}`,
        SK: `ts#${signal.timestamp}#${signal.agent}#${signal.sourceId}`,
        ...signal
      }
    })
  ));
};
```

## PHASE 2: News Ingestion (ERWEITERT)
### **ingestNews Lambda Function:**
```typescript
export const ingestNews = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    const requestBody = NewsIngestionSchema.parse(JSON.parse(event.body || '{}'));
    
    // News Sources Configuration
    const newsSources = [
      { name: 'Reuters', type: 'RSS', url: 'https://feeds.reuters.com/reuters/businessNews' },
      { name: 'Bloomberg', type: 'API', endpoint: '/news/v1/articles' },
      { name: 'Financial Times', type: 'RSS', url: 'https://www.ft.com/rss/home' },
      { name: 'Wall Street Journal', type: 'API', endpoint: '/news/v1/articles' },
      { name: 'SEC Filings', type: 'API', endpoint: '/filings/v1/forms' },
      { name: 'FINMA', type: 'RSS', url: 'https://www.finma.ch/de/rss' },
      { name: 'ESMA', type: 'RSS', url: 'https://www.esma.europa.eu/rss' }
    ];
    
    // Parallel News Fetching
    const newsData = await Promise.allSettled(
      newsSources.map(source => fetchNewsFromSource(source, requestBody.assets))
    );
    
    // Event Classification
    const classifiedNews = await classifyNewsEvents(newsData);
    
    // Quality Assessment
    const qualityFilteredNews = await assessNewsQuality(classifiedNews);
    
    // Storage
    await storeNewsData(qualityFilteredNews);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        data: {
          newsProcessed: qualityFilteredNews.length,
          sources: newsSources.length,
          timestamp: new Date().toISOString()
        }
      })
    };
  } catch (error) {
    logger.error('News ingestion failed', error);
    return handleError(error);
  }
};
```

### **Event Ontology Classification:**
```typescript
const eventTypes = {
  earnings: {
    keywords: ['earnings', 'revenue', 'profit', 'quarterly', 'annual'],
    impact: 'high',
    timeframe: 'immediate'
  },
  guidance: {
    keywords: ['guidance', 'forecast', 'outlook', 'projection'],
    impact: 'medium',
    timeframe: 'short-term'
  },
  mna: {
    keywords: ['merger', 'acquisition', 'takeover', 'buyout'],
    impact: 'high',
    timeframe: 'medium-term'
  },
  downgrade: {
    keywords: ['downgrade', 'downgraded', 'rating cut', 'credit rating'],
    impact: 'high',
    timeframe: 'immediate'
  },
  lawsuit: {
    keywords: ['lawsuit', 'litigation', 'legal action', 'court'],
    impact: 'medium',
    timeframe: 'long-term'
  },
  regulatory: {
    keywords: ['sec', 'finma', 'esma', 'regulatory', 'compliance'],
    impact: 'high',
    timeframe: 'medium-term'
  },
  hack: {
    keywords: ['hack', 'breach', 'cyber attack', 'security'],
    impact: 'high',
    timeframe: 'immediate'
  },
  listing: {
    keywords: ['ipo', 'listing', 'public offering', 'stock exchange'],
    impact: 'high',
    timeframe: 'medium-term'
  }
};
```

## PHASE 3: Advanced Features (NEU)
### **Real-time Processing:**
- **Stream Processing** mit Kinesis Data Streams
- **Event-driven Architecture** mit EventBridge
- **Micro-batching** für Performance-Optimierung

### **Data Quality Assurance:**
- **Duplicate Detection** mit SimHash/MinHash
- **Content Validation** mit ML-Models
- **Source Credibility Scoring**
- **Bias Detection** für News Sources

### **Compliance & Security:**
- **GDPR Compliance** für EU-Daten
- **Data Retention Policies**
- **Audit Logging** für alle Operations
- **Encryption at Rest** und in Transit

**API Endpoints:** `/v1/ingest/social`, `/v1/ingest/news` (POST JSON) – Zod-Validation enforced.

# Zusätzliche Verbesserungen (PRODUCTION-GRADE - OPTIMIERT)
- **Publisher-Trust-Score** pro Quelle (historische Korrektheit, Latenz, Korrekturen)
- **Cross-Lingual Embeddings** (besseres Dedupe/Ähnlichkeit)
- **Rate-Limit-aware** Fetching (Jitter/Backoff); Paging & Partial Commits
- **Real-time Monitoring** mit CloudWatch Dashboards
- **Cost Optimization** mit Intelligent Tiering
- **Performance Metrics** für alle API Calls
- **Data Lineage Tracking** für Audit Trails
- **Automated Quality Scoring** mit ML-Models

# Fehlervermeidung – Was schiefgehen kann & Gegenmaßnahmen (ERWEITERT)
- **TOS-Verstoß** durch Scraping → Konto-Sperre.  
  **Fix:** Nur offizielle APIs, Verträge prüfen, Keys rotieren, Compliance Monitoring
- **Duplikate & Bot-Netze** verzerren Scores.  
  **Fix:** Dedupe + Bot-Indizien (Account-Alter, Retweet-Graph), ML-basierte Bot-Erkennung
- **Timezone-Drift** (published_at vs seen_at).  
  **Fix:** Beide Felder speichern; Bitemporalität strikt, UTC-Normalisierung
- **Rate-Limit-Exhaustion** → Service-Unterbrechung.  
  **Fix:** Intelligent Backoff, Queue-Management, Fallback-Sources
- **Data Quality Issues** → Falsche Investment-Entscheidungen.  
  **Fix:** Multi-Layer Validation, Human-in-the-Loop Review, Quality Metrics
- **API-Key-Compromise** → Security-Breach.  
  **Fix:** Key Rotation, Monitoring, Automated Alerts
- **Storage-Costs Explosion** → Budget-Überschreitung.  
  **Fix:** Lifecycle Policies, Compression, Intelligent Tiering

# Akzeptanzkriterien (Definition of Done - ERWEITERT)
- Live-Hits von echten Quellen (kleines Zeitfenster), keine Mocks
- S3/Dynamo Writes korrekt, Idempotenz nachweisbar
- **Performance Benchmarks** erreicht (< 5s Response Time)
- **Quality Metrics** erfüllt (> 90% Accuracy)
- **Security Tests** bestanden (Penetration Testing)
- **Compliance Checklist** erfüllt (GDPR, API Terms)
- **Monitoring & Alerting** funktional
- **Cost Budgets** eingehalten
- **Documentation** vollständig (API Docs, Runbooks)

# Build/Test-Gates & Verifikation (AUSFÜHREN - OPTIMIERT)
```bash
# Live-Smoke Tests
./scripts/test:ingestion:social
./scripts/test:ingestion:news

# Performance Tests
./scripts/test:performance:ingestion

# Quality Tests
./scripts/test:quality:data

# Security Tests
./scripts/test:security:ingestion

# Compliance Tests
./scripts/test:compliance:gdpr
```

# Artefakte & Deliverables (ERWEITERT)
- `lambda/ingestion-social/*` (vollständige Lambda Functions)
- `lambda/ingestion-news/*` (vollständige Lambda Functions)
- **API Documentation** (OpenAPI Spec, Postman Collection)
- **Data Pipeline Documentation** (Sequenzdiagramme, Architektur)
- **Quality Reports** (Data Quality Metrics, Accuracy Scores)
- **Performance Reports** (Response Times, Throughput)
- **Security Reports** (Vulnerability Assessment, Penetration Testing)
- **Compliance Reports** (GDPR, API Terms Compliance)
- **Monitoring Setup** (CloudWatch Dashboards, Alarms)
- **Cost Analysis** (Budget Projections, Optimization Recommendations)

