# Modul 04 — Scoring & Fusion (OPTIMIERT)
**Repo:** `Manu-Manera/manuel-weiss-website` • **Version:** 5.0 • **Zeitzone:** Europe/Zurich  
**Prinzip:** *Kein Test-/Demo-Daten-Einsatz. Nur echte Quellen/Provider. Serverseitige Secrets.*
**Ziel:** Production-ready ML-Scoring System mit hoher Genauigkeit und Performance

---
# Repo-Ausrichtung & Pfade (ERWEITERT)
- **Lambda Function:** `lambda/scoring/` mit ML-Models und Ensemble-Methods
- **API Route:** `/v1/score` (POST) mit Zod-Validation
- **Model Storage:** S3 für ML-Models, DynamoDB für Configurations
- **Monitoring:** CloudWatch für Performance und Accuracy Metrics
- **Caching:** Redis für Model Predictions und Feature Cache

# Smart Prompt – Implementierung (FÜR CURSOR - OPTIMIERT)
> **An Cursor – ML-Scoring System implementieren (Deutsch):**  

## PHASE 1: Signal Scoring Engine (ERWEITERT)
### **scoreSignals Lambda Function:**
```typescript
export const scoreSignals = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Input Validation
    const requestBody = ScoringRequestSchema.parse(JSON.parse(event.body || '{}'));
    
    // Load Agent Configuration
    const agentConfig = await loadAgentConfig(requestBody.agentId);
    
    // Feature Engineering Pipeline
    const features = await extractFeatures(requestBody.signals);
    
    // Multi-Model Scoring
    const scores = await Promise.all([
      scoreWithSentimentModel(features),
      scoreWithRelevanceModel(features),
      scoreWithNoveltyModel(features),
      scoreWithCredibilityModel(features),
      scoreWithViralityModel(features)
    ]);
    
    // Ensemble Fusion
    const fusedScore = await fusionEnsemble(scores, agentConfig.weights);
    
    // Conflict Detection
    const conflictFlag = detectConflicts(requestBody.signals);
    
    // Store Results
    await storeScoringResults({
      requestId: requestBody.id,
      scores: fusedScore,
      conflictFlag,
      timestamp: new Date().toISOString()
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        data: {
          scores: fusedScore,
          conflictFlag,
          attribution: getFeatureAttribution(fusedScore),
          confidence: calculateConfidence(fusedScore)
        }
      })
    };
  } catch (error) {
    logger.error('Signal scoring failed', error);
    return handleError(error);
  }
};
```

### **Feature Engineering Pipeline:**
```typescript
// Advanced Feature Extraction
const extractFeatures = async (signals: Signal[]): Promise<FeatureVector> => {
  const features = {
    // Text Features
    sentiment: await analyzeSentiment(signals.map(s => s.content)),
    emotion: await analyzeEmotion(signals.map(s => s.content)),
    topic: await extractTopics(signals.map(s => s.content)),
    
    // Temporal Features
    recency: calculateRecency(signals),
    frequency: calculateFrequency(signals),
    volatility: calculateVolatility(signals),
    
    // Social Features
    engagement: calculateEngagement(signals),
    virality: calculateVirality(signals),
    authority: calculateAuthority(signals),
    
    // Market Features
    marketSentiment: await getMarketSentiment(signals),
    sectorCorrelation: await getSectorCorrelation(signals),
    volatilityIndex: await getVolatilityIndex(signals),
    
    // Cross-Source Features
    sourceDiversity: calculateSourceDiversity(signals),
    consensus: calculateConsensus(signals),
    disagreement: calculateDisagreement(signals)
  };
  
  return normalizeFeatures(features);
};
```

### **ML Models Implementation:**
```typescript
// Sentiment Analysis Model
const scoreWithSentimentModel = async (features: FeatureVector): Promise<ScoreResult> => {
  const model = await loadModel('sentiment-v2.1');
  const prediction = await model.predict(features);
  
  return {
    score: prediction.probability,
    confidence: prediction.confidence,
    attribution: prediction.attribution
  };
};

// Relevance Model
const scoreWithRelevanceModel = async (features: FeatureVector): Promise<ScoreResult> => {
  const model = await loadModel('relevance-v1.8');
  const prediction = await model.predict(features);
  
  return {
    score: prediction.probability,
    confidence: prediction.confidence,
    attribution: prediction.attribution
  };
};

// Novelty Model
const scoreWithNoveltyModel = async (features: FeatureVector): Promise<ScoreResult> => {
  const model = await loadModel('novelty-v1.5');
  const prediction = await model.predict(features);
  
  return {
    score: prediction.probability,
    confidence: prediction.confidence,
    attribution: prediction.attribution
  };
};
```

## PHASE 2: Ensemble Fusion (ERWEITERT)
### **fusionEnsemble Function:**
```typescript
const fusionEnsemble = async (
  scores: ScoreResult[], 
  weights: WeightConfig
): Promise<FusedScore> => {
  // Weighted Average
  const weightedScore = scores.reduce((sum, score, index) => {
    return sum + (score.score * weights[index]);
  }, 0);
  
  // Confidence Weighting
  const confidenceWeightedScore = scores.reduce((sum, score, index) => {
    const confidenceWeight = score.confidence * weights[index];
    return sum + (score.score * confidenceWeight);
  }, 0);
  
  // Bayesian Fusion
  const bayesianScore = await bayesianFusion(scores, weights);
  
  // Meta-Learning Ensemble
  const metaScore = await metaLearningEnsemble(scores, weights);
  
  // Final Fusion
  const finalScore = combineMethods([
    { method: 'weighted', score: weightedScore, weight: 0.3 },
    { method: 'confidence', score: confidenceWeightedScore, weight: 0.3 },
    { method: 'bayesian', score: bayesianScore, weight: 0.2 },
    { method: 'meta', score: metaScore, weight: 0.2 }
  ]);
  
  return {
    score: finalScore,
    confidence: calculateOverallConfidence(scores),
    attribution: getTopAttributions(scores),
    method: 'ensemble_fusion'
  };
};
```

### **Advanced Fusion Methods:**
```typescript
// Bayesian Fusion
const bayesianFusion = async (scores: ScoreResult[], weights: WeightConfig): Promise<number> => {
  const prior = 0.5; // Neutral prior
  const likelihood = scores.reduce((acc, score, index) => {
    return acc * Math.pow(score.score, weights[index]);
  }, 1);
  
  const posterior = (likelihood * prior) / 
    (likelihood * prior + (1 - likelihood) * (1 - prior));
  
  return posterior;
};

// Meta-Learning Ensemble
const metaLearningEnsemble = async (scores: ScoreResult[], weights: WeightConfig): Promise<number> => {
  const metaModel = await loadModel('meta-ensemble-v1.0');
  const metaFeatures = {
    scores: scores.map(s => s.score),
    confidences: scores.map(s => s.confidence),
    weights: Object.values(weights),
    timestamp: Date.now()
  };
  
  const prediction = await metaModel.predict(metaFeatures);
  return prediction.score;
};
```

## PHASE 3: Conflict Detection & Resolution (NEU)
### **Conflict Detection:**
```typescript
const detectConflicts = (signals: Signal[]): ConflictAnalysis => {
  const socialSignals = signals.filter(s => s.source === 'social');
  const newsSignals = signals.filter(s => s.source === 'news');
  
  const conflicts = {
    sentimentConflict: detectSentimentConflict(socialSignals, newsSignals),
    directionConflict: detectDirectionConflict(socialSignals, newsSignals),
    magnitudeConflict: detectMagnitudeConflict(socialSignals, newsSignals),
    temporalConflict: detectTemporalConflict(socialSignals, newsSignals)
  };
  
  return {
    hasConflicts: Object.values(conflicts).some(c => c),
    conflicts,
    resolution: generateConflictResolution(conflicts)
  };
};
```

### **Feature Attribution:**
```typescript
const getFeatureAttribution = (fusedScore: FusedScore): AttributionResult => {
  return {
    topFactors: [
      { factor: 'sentiment', contribution: 0.35, direction: 'positive' },
      { factor: 'relevance', contribution: 0.28, direction: 'positive' },
      { factor: 'novelty', contribution: 0.22, direction: 'neutral' },
      { factor: 'credibility', contribution: 0.15, direction: 'positive' }
    ],
    explanation: generateExplanation(fusedScore),
    confidence: fusedScore.confidence
  };
};
```

## PHASE 4: Performance Optimization (NEU)
### **Caching Strategy:**
```typescript
// Model Prediction Caching
const getCachedPrediction = async (features: FeatureVector): Promise<ScoreResult | null> => {
  const cacheKey = generateCacheKey(features);
  return await redis.get(cacheKey);
};

// Feature Cache
const cacheFeatures = async (signals: Signal[], features: FeatureVector): Promise<void> => {
  const cacheKey = generateFeatureCacheKey(signals);
  await redis.setex(cacheKey, 3600, JSON.stringify(features)); // 1 hour TTL
};
```

### **Batch Processing:**
```typescript
// Batch Scoring for Performance
const batchScoreSignals = async (signalBatches: Signal[][]): Promise<ScoreResult[]> => {
  const results = await Promise.all(
    signalBatches.map(batch => scoreSignalsBatch(batch))
  );
  
  return results.flat();
};
```

**API Endpoint:** `/v1/score` (POST), Input/Output per Zod validieren.

# Zusätzliche Verbesserungen (PRODUCTION-GRADE - OPTIMIERT)
- Spätere **Kalibrierung** (Platt/Isotonic) toggelbar
- **Drift-Check**: Score-Verteilungen vs Vorwoche; Alarm bei Shift
- **Model Versioning** mit A/B Testing für neue Modelle
- **Automated Retraining** basierend auf Performance Metrics
- **Feature Importance Analysis** für Model Interpretability
- **Cross-Validation** für Model Performance Assessment
- **Hyperparameter Optimization** mit Bayesian Methods
- **Model Monitoring** mit Data Drift Detection

# Fehlervermeidung – Was schiefgehen kann & Gegenmaßnahmen (ERWEITERT)
- **Overfitting** bei harten Heuristiken.  
  **Fix:** Parametrisierte Gewichte, später Bandit-Tuning, Cross-Validation
- **Nicht-Determinismus**.  
  **Fix:** Seeds + pure Functions, Deterministic Algorithms
- **Model Bias** → Diskriminierung.  
  **Fix:** Bias Detection, Fairness Metrics, Diverse Training Data
- **Data Leakage** → Overoptimistic Performance.  
  **Fix:** Temporal Validation, Strict Train/Test Split
- **Model Drift** → Performance Degradation.  
  **Fix:** Continuous Monitoring, Automated Retraining, Alerting
- **Feature Engineering Errors** → Garbage In, Garbage Out.  
  **Fix:** Feature Validation, Automated Testing, Documentation
- **Ensemble Overfitting** → Komplexität ohne Nutzen.  
  **Fix:** Model Selection, Complexity Penalties, Validation

# Akzeptanzkriterien (Definition of Done - ERWEITERT)
- Deterministische Scores, nachvollziehbare Attribution, Konfliktflag greift
- **Model Performance** erfüllt (> 85% Accuracy, > 0.8 AUC)
- **Feature Attribution** vollständig und verständlich
- **Conflict Detection** funktional und getestet
- **Performance Benchmarks** erreicht (< 2s Response Time)
- **Model Interpretability** dokumentiert und validiert
- **Bias Assessment** durchgeführt und dokumentiert
- **Cross-Validation** erfolgreich (> 80% Consistency)
- **Production Readiness** bestätigt (Load Testing, Monitoring)

# Build/Test-Gates & Verifikation (AUSFÜHREN - OPTIMIERT)
```bash
# Model Performance Tests
./scripts/test:model:performance
./scripts/test:model:accuracy

# Feature Engineering Tests
./scripts/test:features:extraction
./scripts/test:features:validation

# Ensemble Tests
./scripts/test:ensemble:fusion
./scripts/test:ensemble:consistency

# Conflict Detection Tests
./scripts/test:conflicts:detection
./scripts/test:conflicts:resolution

# Performance Tests
./scripts/test:performance:scoring
./scripts/test:performance:latency

# Bias & Fairness Tests
./scripts/test:bias:detection
./scripts/test:fairness:metrics
```

# Artefakte & Deliverables (ERWEITERT)
- `lambda/scoring/*` (vollständige Lambda Functions)
- **Model Artifacts** (Trained Models, Configurations, Metadata)
- **README** (Formeln/Beispiele, API Documentation)
- **Performance Reports** (Accuracy, Latency, Throughput)
- **Bias Assessment** (Fairness Metrics, Bias Detection)
- **Feature Documentation** (Feature Engineering, Attribution)
- **Model Cards** (Model Descriptions, Performance, Limitations)
- **Validation Reports** (Cross-Validation, Holdout Testing)
- **Monitoring Setup** (Model Drift, Performance Alerts)
- **A/B Testing Framework** (Model Comparison, Statistical Significance)

