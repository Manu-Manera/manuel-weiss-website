# Modul 05 — Orchestrator & Risiko (OPTIMIERT)
**Repo:** `Manu-Manera/manuel-weiss-website` • **Version:** 5.0 • **Zeitzone:** Europe/Zurich  
**Prinzip:** *Kein Test-/Demo-Daten-Einsatz. Nur echte Quellen/Provider. Serverseitige Secrets.*
**Ziel:** Production-ready Investment Orchestration mit umfassendem Risk Management

---
# Repo-Ausrichtung & Pfade (ERWEITERT)
- **Lambda Functions:** `lambda/orchestrator/` mit ML-basierten Decision Engines
- **API Routes:** `/v1/propose`, `/v1/risk/check` mit Zod-Validation
- **Database:** DynamoDB `proposals` Table mit GSI für Performance
- **Monitoring:** CloudWatch für Risk Metrics und Performance
- **Caching:** Redis für Risk Calculations und Market Data

# Smart Prompt – Implementierung (FÜR CURSOR - OPTIMIERT)
> **An Cursor – Investment Orchestration System implementieren (Deutsch):**  

## PHASE 1: Trade Proposal Engine (ERWEITERT)
### **proposeTrades Lambda Function:**
```typescript
export const proposeTrades = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Input Validation
    const requestBody = ProposalRequestSchema.parse(JSON.parse(event.body || '{}'));
    
    // Load Market Context
    const marketContext = await loadMarketContext(requestBody.assets);
    
    // Aggregate Top Signals
    const topSignals = await aggregateTopSignals(requestBody.assets, requestBody.timeframe);
    
    // Generate Investment Thesis
    const thesis = await generateInvestmentThesis(topSignals, marketContext);
    
    // Calculate Position Sizing
    const positionSizing = await calculatePositionSizing(topSignals, marketContext);
    
    // Risk Assessment
    const riskAssessment = await assessRisk(topSignals, positionSizing);
    
    // Generate Proposal
    const proposal = await generateProposal({
      thesis,
      assets: requestBody.assets,
      size_pct: positionSizing.size_pct,
      horizon_days: positionSizing.horizon_days,
      entry_price: marketContext.current_prices,
      stop_loss: riskAssessment.stop_loss,
      take_profit: riskAssessment.take_profit,
      invalidate_if: riskAssessment.invalidation_conditions,
      explain: thesis.explanation,
      constraints_checked: true,
      status: 'proposed',
      risk_score: riskAssessment.overall_risk,
      expected_return: riskAssessment.expected_return,
      sharpe_ratio: riskAssessment.sharpe_ratio
    });
    
    // Store Proposal
    await storeProposal(proposal);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        data: proposal
      })
    };
  } catch (error) {
    logger.error('Trade proposal failed', error);
    return handleError(error);
  }
};
```

### **Advanced Signal Aggregation:**
```typescript
const aggregateTopSignals = async (assets: string[], timeframe: string): Promise<AggregatedSignals> => {
  // Load Signals from DynamoDB
  const signals = await loadSignalsForAssets(assets, timeframe);
  
  // Weight by Source Credibility
  const weightedSignals = signals.map(signal => ({
    ...signal,
    weight: calculateSourceWeight(signal.source, signal.credibility)
  }));
  
  // Cluster Similar Signals
  const clusteredSignals = await clusterSignals(weightedSignals);
  
  // Calculate Consensus
  const consensus = calculateConsensus(clusteredSignals);
  
  // Identify Outliers
  const outliers = identifyOutliers(clusteredSignals);
  
  return {
    consensus,
    outliers,
    confidence: calculateConfidence(clusteredSignals),
    diversity: calculateDiversity(clusteredSignals)
  };
};
```

### **Investment Thesis Generation:**
```typescript
const generateInvestmentThesis = async (
  signals: AggregatedSignals, 
  marketContext: MarketContext
): Promise<InvestmentThesis> => {
  // LLM-based Thesis Generation
  const llmPrompt = `
    Basierend auf folgenden Signalen und Marktdaten, erstelle eine Investment-These:
    
    Signale: ${JSON.stringify(signals.consensus)}
    Marktdaten: ${JSON.stringify(marketContext)}
    
    Erstelle eine strukturierte These mit:
    1. Hauptargument
    2. Unterstützende Faktoren
    3. Risikofaktoren
    4. Zeitrahmen
    5. Erwartete Performance
  `;
  
  const llmResponse = await llmAdapter.generateText(llmPrompt);
  
  return {
    main_thesis: extractMainThesis(llmResponse),
    supporting_factors: extractSupportingFactors(llmResponse),
    risk_factors: extractRiskFactors(llmResponse),
    timeframe: extractTimeframe(llmResponse),
    expected_performance: extractExpectedPerformance(llmResponse),
    explanation: llmResponse
  };
};
```

## PHASE 2: Risk Management System (ERWEITERT)
### **riskCheck Lambda Function:**
```typescript
export const riskCheck = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    const requestBody = RiskCheckRequestSchema.parse(JSON.parse(event.body || '{}'));
    
    // Load Historical Data
    const historicalData = await loadHistoricalData(requestBody.assets, 252); // 1 year
    
    // Calculate Risk Metrics
    const riskMetrics = await calculateRiskMetrics(historicalData, requestBody.proposal);
    
    // VaR Calculation (Multiple Methods)
    const varResults = {
      historical: calculateHistoricalVaR(historicalData, 0.95),
      parametric: calculateParametricVaR(historicalData, 0.95),
      monte_carlo: await calculateMonteCarloVaR(historicalData, 0.95),
      cornish_fisher: calculateCornishFisherVaR(historicalData, 0.95)
    };
    
    // CVaR Calculation
    const cvarResults = {
      historical: calculateHistoricalCVaR(historicalData, 0.95),
      monte_carlo: await calculateMonteCarloCVaR(historicalData, 0.95)
    };
    
    // Volatility Targeting
    const volatilityTarget = await calculateVolatilityTarget(requestBody.assets);
    
    // Correlation Analysis
    const correlationMatrix = await calculateCorrelationMatrix(requestBody.assets);
    
    // Liquidity Assessment
    const liquidityAssessment = await assessLiquidity(requestBody.assets, requestBody.size_pct);
    
    // Risk Score
    const riskScore = calculateOverallRiskScore({
      var: varResults,
      cvar: cvarResults,
      volatility: volatilityTarget,
      correlation: correlationMatrix,
      liquidity: liquidityAssessment
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        data: {
          risk_score: riskScore,
          var: varResults,
          cvar: cvarResults,
          volatility: volatilityTarget,
          correlation: correlationMatrix,
          liquidity: liquidityAssessment,
          recommendations: generateRiskRecommendations(riskScore)
        }
      })
    };
  } catch (error) {
    logger.error('Risk check failed', error);
    return handleError(error);
  }
};
```

### **Advanced Risk Calculations:**
```typescript
// VaR Calculations
const calculateHistoricalVaR = (data: number[], confidence: number): number => {
  const sortedReturns = data.sort((a, b) => a - b);
  const index = Math.floor((1 - confidence) * sortedReturns.length);
  return sortedReturns[index];
};

const calculateParametricVaR = (data: number[], confidence: number): number => {
  const mean = data.reduce((sum, x) => sum + x, 0) / data.length;
  const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);
  const zScore = getZScore(confidence);
  return mean + zScore * stdDev;
};

const calculateMonteCarloVaR = async (data: number[], confidence: number): Promise<number> => {
  const simulations = 10000;
  const mean = data.reduce((sum, x) => sum + x, 0) / data.length;
  const stdDev = Math.sqrt(data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / data.length);
  
  const simulatedReturns = [];
  for (let i = 0; i < simulations; i++) {
    simulatedReturns.push(mean + stdDev * generateRandomNormal());
  }
  
  simulatedReturns.sort((a, b) => a - b);
  const index = Math.floor((1 - confidence) * simulatedReturns.length);
  return simulatedReturns[index];
};

// Cornish-Fisher VaR
const calculateCornishFisherVaR = (data: number[], confidence: number): number => {
  const mean = data.reduce((sum, x) => sum + x, 0) / data.length;
  const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);
  
  // Calculate skewness and kurtosis
  const skewness = calculateSkewness(data, mean, stdDev);
  const kurtosis = calculateKurtosis(data, mean, stdDev);
  
  const zScore = getZScore(confidence);
  const cfAdjustment = (zScore * skewness) / 6 + (Math.pow(zScore, 2) - 1) * kurtosis / 24;
  
  return mean + (zScore + cfAdjustment) * stdDev;
};
```

## PHASE 3: Contra-Pass System (NEU)
### **Contra-Pass Analysis:**
```typescript
const contraPass = async (proposal: Proposal): Promise<ContraAnalysis> => {
  // Load Counter-Signals
  const counterSignals = await loadCounterSignals(proposal.assets);
  
  // Generate Counter-Arguments
  const counterArguments = await generateCounterArguments(proposal, counterSignals);
  
  // Rank by Strength
  const rankedArguments = counterArguments
    .map(arg => ({
      ...arg,
      strength: calculateArgumentStrength(arg)
    }))
    .sort((a, b) => b.strength - a.strength);
  
  // Top 3 Counter-Arguments
  const topCounterArguments = rankedArguments.slice(0, 3);
  
  // Decision Logic
  const decision = makeContraDecision(proposal, topCounterArguments);
  
  return {
    counter_arguments: topCounterArguments,
    decision: decision,
    confidence: calculateContraConfidence(topCounterArguments),
    recommendation: generateContraRecommendation(decision)
  };
};
```

### **Size Reduction Logic:**
```typescript
const makeContraDecision = (proposal: Proposal, counterArgs: CounterArgument[]): ContraDecision => {
  const totalCounterStrength = counterArgs.reduce((sum, arg) => sum + arg.strength, 0);
  
  if (totalCounterStrength > 0.8) {
    return {
      action: 'reject',
      reason: 'Strong counter-arguments detected',
      confidence: totalCounterStrength
    };
  } else if (totalCounterStrength > 0.5) {
    return {
      action: 'reduce_size',
      reason: 'Moderate counter-arguments, reducing position size',
      confidence: totalCounterStrength,
      new_size_pct: proposal.size_pct * 0.5
    };
  } else {
    return {
      action: 'proceed',
      reason: 'Counter-arguments not strong enough',
      confidence: 1 - totalCounterStrength
    };
  }
};
```

## PHASE 4: Advanced Risk Features (NEU)
### **Portfolio Risk Management:**
```typescript
// Portfolio-level Risk Assessment
const assessPortfolioRisk = async (proposals: Proposal[]): Promise<PortfolioRisk> => {
  const portfolioMetrics = {
    total_exposure: proposals.reduce((sum, p) => sum + p.size_pct, 0),
    sector_concentration: calculateSectorConcentration(proposals),
    correlation_risk: calculateCorrelationRisk(proposals),
    liquidity_risk: calculateLiquidityRisk(proposals),
    tail_risk: calculateTailRisk(proposals)
  };
  
  return {
    overall_risk: calculateOverallPortfolioRisk(portfolioMetrics),
    recommendations: generatePortfolioRecommendations(portfolioMetrics),
    limits: checkPortfolioLimits(portfolioMetrics)
  };
};
```

### **Dynamic Risk Adjustments:**
```typescript
// Real-time Risk Monitoring
const monitorRisk = async (proposal: Proposal): Promise<RiskAlert[]> => {
  const alerts = [];
  
  // Market Volatility Check
  const currentVolatility = await getCurrentVolatility(proposal.assets);
  if (currentVolatility > proposal.volatility_threshold) {
    alerts.push({
      type: 'volatility_spike',
      severity: 'high',
      message: 'Market volatility exceeds threshold'
    });
  }
  
  // Correlation Check
  const correlation = await getCurrentCorrelation(proposal.assets);
  if (correlation > 0.8) {
    alerts.push({
      type: 'high_correlation',
      severity: 'medium',
      message: 'Assets show high correlation'
    });
  }
  
  return alerts;
};
```

**Database:** Persistiere in `proposals` (DynamoDB) mit GSI für Performance.

# Zusätzliche Verbesserungen (PRODUCTION-GRADE - OPTIMIERT)
- **Cluster-Risiko** (Sektoren/Styles) deckeln
- **Szenario-Engine** (Base/Bull/Bear) → gleiche Inputs wie Orchestrator
- **Exit-Regeln verpflichtend** (`invalidate_if`), Disziplin sichern
- **Real-time Risk Monitoring** mit automatischen Anpassungen
- **Portfolio Optimization** mit Modern Portfolio Theory
- **Stress Testing** mit historischen und synthetischen Szenarien
- **Regime Detection** für Marktregime-Wechsel
- **Liquidity Risk Management** mit bid-ask Spread Monitoring

# Fehlervermeidung – Was schiefgehen kann & Gegenmaßnahmen (ERWEITERT)
- **Zu große Positionen** bei Vol-Spike.  
  **Fix:** Vol-Targeting + Kelly-Clip + Dynamic Sizing
- **Korrelations-Sprünge** (Regimewechsel).  
  **Fix:** Rolling-Betas + Regime-Flags, Caps + Real-time Monitoring
- **Model Overfitting** → Falsche Risk-Schätzungen.  
  **Fix:** Cross-Validation, Out-of-Sample Testing, Regularization
- **Data Quality Issues** → Fehlerhafte Risk-Berechnungen.  
  **Fix:** Data Validation, Outlier Detection, Quality Metrics
- **Liquidity Crunch** → Unmöglichkeit zu liquidieren.  
  **Fix:** Liquidity Monitoring, Position Limits, Stress Testing
- **Correlation Breakdown** → Diversifikation versagt.  
  **Fix:** Dynamic Correlation Monitoring, Regime Detection
- **Tail Risk** → Extreme Verluste.  
  **Fix:** Tail Risk Models, Extreme Value Theory, Stress Testing

# Akzeptanzkriterien (Definition of Done - ERWEITERT)
- Vollständige Proposals; korrekte Risk-Brüche; Explain-Felder sinnvoll ausgefüllt
- **Risk Models** validiert und getestet (> 95% Backtesting Accuracy)
- **VaR/CVaR Calculations** korrekt implementiert und getestet
- **Portfolio Risk** vollständig bewertet und dokumentiert
- **Stress Testing** erfolgreich durchgeführt
- **Performance Benchmarks** erreicht (< 3s Response Time)
- **Risk Limits** implementiert und überwacht
- **Documentation** vollständig (Risk Models, Decision Logic)
- **Monitoring & Alerting** funktional

# Build/Test-Gates & Verifikation (AUSFÜHREN - OPTIMIERT)
```bash
# Risk Model Tests
./scripts/test:risk:models
./scripts/test:risk:calculations

# Stress Testing
./scripts/test:stress:crypto
./scripts/test:stress:correlation
./scripts/test:stress:liquidity

# Portfolio Tests
./scripts/test:portfolio:risk
./scripts/test:portfolio:optimization

# Performance Tests
./scripts/test:performance:orchestrator
./scripts/test:performance:risk

# Integration Tests
./scripts/test:integration:risk
./scripts/test:integration:orchestrator
```

# Artefakte & Deliverables (ERWEITERT)
- `lambda/orchestrator/*` (vollständige Lambda Functions)
- **README** (Entscheidungslogik, Risk Models, API Documentation)
- **Risk Model Documentation** (VaR/CVaR, Volatility, Correlation Models)
- **Stress Testing Reports** (Historical Scenarios, Synthetic Scenarios)
- **Performance Reports** (Response Times, Throughput, Accuracy)
- **Risk Monitoring Setup** (Dashboards, Alerts, Metrics)
- **Portfolio Optimization** (Modern Portfolio Theory Implementation)
- **Regime Detection** (Market Regime Classification, Transition Detection)
- **Liquidity Management** (Bid-Ask Monitoring, Position Limits)
- **Compliance Reports** (Risk Limits, Regulatory Requirements)

