# Modul 06 — Decision & Evaluation (Learning Loop) (OPTIMIERT)
**Repo:** `Manu-Manera/manuel-weiss-website` • **Version:** 5.0 • **Zeitzone:** Europe/Zurich  
**Prinzip:** *Kein Test-/Demo-Daten-Einsatz. Nur echte Quellen/Provider. Serverseitige Secrets.*
**Ziel:** Production-ready Learning System mit kontinuierlicher Verbesserung und Performance-Tracking

---
# Repo-Ausrichtung & Pfade (ERWEITERT)
- **Lambda Functions:** `lambda/evaluation/` mit ML-basierten Learning Engines
- **API Routes:** `/v1/decision`, `/v1/evaluate` mit Zod-Validation
- **Database:** DynamoDB `outcomes`, `proposals` Tables mit GSI
- **ML Models:** S3 für Model Artifacts, DynamoDB für Model Metadata
- **Monitoring:** CloudWatch für Learning Metrics und Performance Tracking

# Smart Prompt – Implementierung (FÜR CURSOR - OPTIMIERT)
> **An Cursor – Learning & Evaluation System implementieren (Deutsch):**  

## PHASE 1: Decision Management System (ERWEITERT)
### **storeDecision Lambda Function:**
```typescript
export const storeDecision = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Input Validation
    const requestBody = DecisionRequestSchema.parse(JSON.parse(event.body || '{}'));
    
    // Load Proposal
    const proposal = await loadProposal(requestBody.proposalId);
    if (!proposal) {
      throw new Error('Proposal not found');
    }
    
    // Validate Decision
    const decision = await validateDecision(requestBody, proposal);
    
    // Generate Audit Trail
    const auditTrail = await generateAuditTrail({
      proposalId: requestBody.proposalId,
      decision: decision.action,
      userId: requestBody.userId,
      timestamp: new Date().toISOString(),
      comment: requestBody.comment,
      hash: await generateDecisionHash(decision),
      metadata: {
        userAgent: event.headers['User-Agent'],
        ipAddress: event.requestContext.identity.sourceIp,
        sessionId: requestBody.sessionId
      }
    });
    
    // Store Decision
    await storeDecisionRecord({
      proposalId: requestBody.proposalId,
      decision: decision.action,
      userId: requestBody.userId,
      timestamp: new Date().toISOString(),
      comment: requestBody.comment,
      auditHash: auditTrail.hash,
      status: 'recorded'
    });
    
    // Update Proposal Status
    await updateProposalStatus(requestBody.proposalId, decision.action);
    
    // Trigger Learning Pipeline
    await triggerLearningPipeline(proposal, decision);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        data: {
          decisionId: auditTrail.decisionId,
          status: 'recorded',
          timestamp: auditTrail.timestamp,
          hash: auditTrail.hash
        }
      })
    };
  } catch (error) {
    logger.error('Decision storage failed', error);
    return handleError(error);
  }
};
```

### **Advanced Decision Validation:**
```typescript
const validateDecision = async (request: DecisionRequest, proposal: Proposal): Promise<ValidatedDecision> => {
  // Business Rule Validation
  const businessRules = await loadBusinessRules();
  const ruleViolations = await checkBusinessRules(request, proposal, businessRules);
  
  if (ruleViolations.length > 0) {
    throw new Error(`Business rule violations: ${ruleViolations.join(', ')}`);
  }
  
  // Risk Validation
  const riskAssessment = await assessDecisionRisk(request, proposal);
  if (riskAssessment.riskLevel === 'high') {
    throw new Error('High risk decision requires additional approval');
  }
  
  // Compliance Check
  const complianceCheck = await checkCompliance(request, proposal);
  if (!complianceCheck.compliant) {
    throw new Error(`Compliance violation: ${complianceCheck.violation}`);
  }
  
  return {
    action: request.action,
    confidence: riskAssessment.confidence,
    riskLevel: riskAssessment.riskLevel,
    compliance: complianceCheck,
    timestamp: new Date().toISOString()
  };
};
```

## PHASE 2: Outcome Evaluation System (ERWEITERT)
### **evaluateOutcomes Lambda Function:**
```typescript
export const evaluateOutcomes = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    const requestBody = EvaluationRequestSchema.parse(JSON.parse(event.body || '{}'));
    
    // Load Executed Proposals
    const executedProposals = await loadExecutedProposals(requestBody.timeframe);
    
    // Evaluate Each Proposal
    const evaluations = await Promise.all(
      executedProposals.map(proposal => evaluateProposal(proposal))
    );
    
    // Calculate Performance Metrics
    const performanceMetrics = await calculatePerformanceMetrics(evaluations);
    
    // Update Learning Models
    await updateLearningModels(evaluations);
    
    // Generate Reports
    const reports = await generateEvaluationReports(evaluations, performanceMetrics);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        data: {
          evaluations: evaluations.length,
          performance: performanceMetrics,
          reports: reports
        }
      })
    };
  } catch (error) {
    logger.error('Outcome evaluation failed', error);
    return handleError(error);
  }
};
```

### **Advanced Proposal Evaluation:**
```typescript
const evaluateProposal = async (proposal: Proposal): Promise<EvaluationResult> => {
  // Load Market Data
  const marketData = await loadMarketData(proposal.assets, proposal.entry_date, proposal.horizon_days);
  
  // Calculate Performance Metrics
  const performance = {
    pnl_pct: calculatePnL(proposal.entry_price, marketData.final_price, proposal.size_pct),
    hit: calculateHit(proposal.expected_return, performance.pnl_pct),
    breaches: calculateBreaches(proposal.stop_loss, proposal.take_profit, marketData.price_series),
    actual_duration_days: calculateDuration(proposal.entry_date, marketData.final_date),
    max_drawdown: calculateMaxDrawdown(marketData.price_series),
    sharpe_ratio: calculateSharpeRatio(marketData.returns),
    volatility: calculateVolatility(marketData.returns)
  };
  
  // Risk-Adjusted Performance
  const riskAdjusted = {
    sortino_ratio: calculateSortinoRatio(performance.pnl_pct, marketData.returns),
    calmar_ratio: calculateCalmarRatio(performance.pnl_pct, performance.max_drawdown),
    information_ratio: calculateInformationRatio(performance.pnl_pct, marketData.benchmark_returns)
  };
  
  // Attribution Analysis
  const attribution = await analyzeAttribution(proposal, marketData);
  
  // Store Outcome
  const outcome = {
    id: generateOutcomeId(),
    proposal_id: proposal.id,
    evaluated_at: new Date().toISOString(),
    performance,
    risk_adjusted: riskAdjusted,
    attribution,
    metadata: {
      market_conditions: analyzeMarketConditions(marketData),
      signal_accuracy: calculateSignalAccuracy(proposal, marketData),
      model_performance: calculateModelPerformance(proposal, marketData)
    }
  };
  
  await storeOutcome(outcome);
  return outcome;
};
```

## PHASE 3: Auto-Tuning System (ERWEITERT)
### **autoTuning Lambda Function:**
```typescript
export const autoTuning = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Load Historical Outcomes
    const outcomes = await loadHistoricalOutcomes(90); // Last 90 days
    
    // Thompson Sampling for A/B Testing
    const thompsonResults = await thompsonSampling(outcomes);
    
    // Model Calibration
    const calibrationResults = await calibrateModels(outcomes);
    
    // Canary Testing
    const canaryResults = await runCanaryTests(thompsonResults, calibrationResults);
    
    // Update Model Weights
    if (canaryResults.success) {
      await updateModelWeights(thompsonResults.optimalWeights);
      await updateModelCalibration(calibrationResults.calibratedModels);
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        data: {
          thompson_sampling: thompsonResults,
          calibration: calibrationResults,
          canary: canaryResults,
          updated: canaryResults.success
        }
      })
    };
  } catch (error) {
    logger.error('Auto-tuning failed', error);
    return handleError(error);
  }
};
```

### **Thompson Sampling Implementation:**
```typescript
const thompsonSampling = async (outcomes: Outcome[]): Promise<ThompsonResults> => {
  // Define A/B Test Arms
  const arms = [
    { id: 'conservative', weights: { sentiment: 0.3, relevance: 0.4, novelty: 0.3 } },
    { id: 'balanced', weights: { sentiment: 0.4, relevance: 0.3, novelty: 0.3 } },
    { id: 'aggressive', weights: { sentiment: 0.5, relevance: 0.2, novelty: 0.3 } }
  ];
  
  // Calculate Beta Distribution Parameters
  const armPerformance = arms.map(arm => {
    const armOutcomes = outcomes.filter(o => o.arm_id === arm.id);
    const successes = armOutcomes.filter(o => o.hit).length;
    const failures = armOutcomes.length - successes;
    
    return {
      arm: arm.id,
      alpha: successes + 1,
      beta: failures + 1,
      performance: successes / (successes + failures)
    };
  });
  
  // Sample from Beta Distributions
  const samples = armPerformance.map(arm => ({
    arm: arm.arm,
    sample: sampleFromBeta(arm.alpha, arm.beta),
    confidence: calculateConfidence(arm.alpha, arm.beta)
  }));
  
  // Select Best Arm
  const bestArm = samples.reduce((best, current) => 
    current.sample > best.sample ? current : best
  );
  
  return {
    arms: armPerformance,
    samples,
    bestArm,
    optimalWeights: arms.find(a => a.id === bestArm.arm)?.weights
  };
};
```

### **Model Calibration:**
```typescript
const calibrateModels = async (outcomes: Outcome[]): Promise<CalibrationResults> => {
  const models = ['sentiment', 'relevance', 'novelty', 'credibility'];
  const calibrationResults = {};
  
  for (const model of models) {
    // Platt Scaling
    const plattResults = await plattScaling(outcomes, model);
    
    // Isotonic Regression
    const isotonicResults = await isotonicRegression(outcomes, model);
    
    // Compare Methods
    const bestMethod = plattResults.auc > isotonicResults.auc ? 'platt' : 'isotonic';
    
    calibrationResults[model] = {
      platt: plattResults,
      isotonic: isotonicResults,
      best_method: bestMethod,
      improvement: Math.max(plattResults.auc, isotonicResults.auc) - 0.5
    };
  }
  
  return {
    models: calibrationResults,
    overall_improvement: Object.values(calibrationResults).reduce((sum, result) => 
      sum + result.improvement, 0) / Object.keys(calibrationResults).length
  };
};
```

## PHASE 4: Advanced Learning Features (NEU)
### **Multi-Armed Bandit Optimization:**
```typescript
// Contextual Bandits for Dynamic Weight Adjustment
const contextualBandits = async (context: MarketContext, outcomes: Outcome[]): Promise<BanditResults> => {
  const features = extractContextFeatures(context);
  const banditModel = await loadBanditModel('contextual_bandit_v1.0');
  
  const prediction = await banditModel.predict(features);
  const confidence = calculateBanditConfidence(prediction);
  
  return {
    recommended_weights: prediction.weights,
    confidence,
    exploration_rate: calculateExplorationRate(outcomes),
    exploitation_rate: 1 - calculateExplorationRate(outcomes)
  };
};
```

### **Transfer Learning:**
```typescript
// Transfer Learning between Assets
const transferLearning = async (sourceAsset: string, targetAsset: string): Promise<TransferResults> => {
  const sourceOutcomes = await loadOutcomesForAsset(sourceAsset);
  const targetOutcomes = await loadOutcomesForAsset(targetAsset);
  
  // Calculate Transferability
  const transferability = calculateTransferability(sourceOutcomes, targetOutcomes);
  
  if (transferability > 0.7) {
    // Apply Transfer Learning
    const transferredWeights = await transferWeights(sourceOutcomes, targetOutcomes);
    return {
      transferable: true,
      transferability,
      transferred_weights: transferredWeights,
      expected_improvement: calculateExpectedImprovement(transferredWeights, targetOutcomes)
    };
  }
  
  return {
    transferable: false,
    transferability,
    reason: 'Insufficient similarity between assets'
  };
};
```

## PHASE 5: Export & Reporting (NEU)
### **Data Export System:**
```typescript
const exportEvaluationData = async (format: 'csv' | 'parquet', timeframe: string): Promise<ExportResult> => {
  const outcomes = await loadOutcomesForTimeframe(timeframe);
  
  if (format === 'csv') {
    const csvData = await generateCSV(outcomes);
    const s3Key = `exports/evaluations/${timeframe}/outcomes.csv`;
    await s3.putObject({
      Bucket: process.env.EXPORT_BUCKET,
      Key: s3Key,
      Body: csvData,
      ContentType: 'text/csv'
    });
    
    return { format: 'csv', s3Key, size: csvData.length };
  }
  
  if (format === 'parquet') {
    const parquetData = await generateParquet(outcomes);
    const s3Key = `exports/evaluations/${timeframe}/outcomes.parquet`;
    await s3.putObject({
      Bucket: process.env.EXPORT_BUCKET,
      Key: s3Key,
      Body: parquetData,
      ContentType: 'application/octet-stream'
    });
    
    return { format: 'parquet', s3Key, size: parquetData.length };
  }
};
```

**Database:** Tabellen `outcomes`, `proposals` mit GSI für Performance.

# Zusätzliche Verbesserungen (PRODUCTION-GRADE - OPTIMIERT)
- **Bitemporalität** strikt: `published_at` vs `seen_at`
- **Do-Not-Learn-Liste** (Fehlerfälle/Outages ausschließen)
- **Kostenbereinigung** (Fees/Slippage/LLM-Kosten)
- **Continuous Learning** mit Online Learning Algorithms
- **Model Versioning** mit A/B Testing für neue Modelle
- **Performance Tracking** mit detaillierten Metriken
- **Anomaly Detection** für ungewöhnliche Outcomes
- **Feature Drift Monitoring** für Model Performance

# Fehlervermeidung – Was schiefgehen kann & Gegenmaßnahmen (ERWEITERT)
- **Leakage** (falsche Zeitachsen).  
  **Fix:** Bitemporal validation & Purge windows, Temporal Isolation
- **Autotuning verschlechtert Qualität**.  
  **Fix:** Canary-Quota, Rollback bei KPI-Drop, A/B Testing
- **Model Overfitting** → Performance Degradation.  
  **Fix:** Cross-Validation, Regularization, Early Stopping
- **Data Quality Issues** → Falsche Learning Results.  
  **Fix:** Data Validation, Outlier Detection, Quality Metrics
- **Concept Drift** → Model wird obsolet.  
  **Fix:** Drift Detection, Model Retraining, Performance Monitoring
- **Selection Bias** → Verzerrte Learning Results.  
  **Fix:** Random Sampling, Stratified Sampling, Bias Detection
- **Temporal Leakage** → Future Information in Training.  
  **Fix:** Strict Temporal Validation, Walk-Forward Analysis

# Akzeptanzkriterien (Definition of Done - ERWEITERT)
- Outcome-Labels korrekt; Autotuning sicher; Exporte vorhanden
- **Learning Models** validiert und getestet (> 80% Accuracy)
- **Performance Metrics** vollständig implementiert und dokumentiert
- **Auto-Tuning** funktional und sicher (Canary Testing)
- **Data Export** funktional (CSV/Parquet)
- **Bitemporal Validation** implementiert und getestet
- **Cost Tracking** vollständig implementiert
- **Model Versioning** funktional mit Rollback-Capability
- **Performance Monitoring** vollständig eingerichtet

# Build/Test-Gates & Verifikation (AUSFÜHREN - OPTIMIERT)
```bash
# Learning System Tests
./scripts/test:learning:models
./scripts/test:learning:performance

# Auto-Tuning Tests
./scripts/test:autotuning:thompson
./scripts/test:autotuning:calibration

# Data Export Tests
./scripts/test:export:csv
./scripts/test:export:parquet

# Performance Tests
./scripts/test:performance:evaluation
./scripts/test:performance:learning

# Integration Tests
./scripts/test:integration:learning
./scripts/test:integration:evaluation
```

# Artefakte & Deliverables (ERWEITERT)
- `lambda/evaluation/*` (vollständige Lambda Functions)
- **README** (Zeitachsen/Labels, Learning Algorithms, API Documentation)
- **Learning Models** (Trained Models, Configurations, Performance Metrics)
- **Performance Reports** (Accuracy, Latency, Throughput)
- **Auto-Tuning Documentation** (Thompson Sampling, Calibration Methods)
- **Data Export Tools** (CSV/Parquet Export, S3 Integration)
- **Monitoring Setup** (Learning Metrics, Performance Alerts)
- **Model Versioning** (A/B Testing Framework, Rollback Procedures)
- **Cost Tracking** (LLM Costs, Infrastructure Costs, Performance per Dollar)

