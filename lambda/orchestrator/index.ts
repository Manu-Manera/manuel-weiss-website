import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AWSHelpers } from '@ai-investment/common';
import { ProposalRequestSchema, RiskCheckRequestSchema, ProposalSchema } from '@ai-investment/common';
import { logger } from '@ai-investment/common';
import { TimeUtils } from '@ai-investment/common';
import { HashUtils } from '@ai-investment/common';
import { LLMAdapter } from '@ai-investment/common';

// AWS Configuration
const awsConfig = {
  region: process.env.AWS_REGION || 'eu-central-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};

const aws = new AWSHelpers(awsConfig);

// Risk Management Classes
class RiskManager {
  private aws: AWSHelpers;

  constructor(aws: AWSHelpers) {
    this.aws = aws;
  }

  async assessRisk(proposal: any, marketContext: any): Promise<any> {
    try {
      // VaR Calculation
      const varResults = await this.calculateVaR(marketContext);
      
      // CVaR Calculation
      const cvarResults = await this.calculateCVaR(marketContext);
      
      // Volatility Assessment
      const volatility = await this.assessVolatility(proposal.assets, marketContext);
      
      // Correlation Analysis
      const correlation = await this.analyzeCorrelation(proposal.assets, marketContext);
      
      // Liquidity Assessment
      const liquidity = await this.assessLiquidity(proposal.assets, proposal.size_pct);
      
      // Overall Risk Score
      const overallRisk = this.calculateOverallRisk({
        var: varResults,
        cvar: cvarResults,
        volatility,
        correlation,
        liquidity
      });

      return {
        overall_risk: overallRisk,
        var: varResults,
        cvar: cvarResults,
        volatility,
        correlation,
        liquidity,
        recommendations: this.generateRiskRecommendations(overallRisk)
      };
    } catch (error) {
      logger.error('Risk assessment failed', error as Error);
      throw error;
    }
  }

  private async calculateVaR(marketContext: any): Promise<any> {
    // Historical VaR
    const historicalVaR = this.calculateHistoricalVaR(marketContext.returns, 0.95);
    
    // Parametric VaR
    const parametricVaR = this.calculateParametricVaR(marketContext.returns, 0.95);
    
    // Monte Carlo VaR
    const monteCarloVaR = await this.calculateMonteCarloVaR(marketContext.returns, 0.95);
    
    // Cornish-Fisher VaR
    const cornishFisherVaR = this.calculateCornishFisherVaR(marketContext.returns, 0.95);

    return {
      historical: historicalVaR,
      parametric: parametricVaR,
      monte_carlo: monteCarloVaR,
      cornish_fisher: cornishFisherVaR
    };
  }

  private async calculateCVaR(marketContext: any): Promise<any> {
    // Historical CVaR
    const historicalCVaR = this.calculateHistoricalCVaR(marketContext.returns, 0.95);
    
    // Monte Carlo CVaR
    const monteCarloCVaR = await this.calculateMonteCarloCVaR(marketContext.returns, 0.95);

    return {
      historical: historicalCVaR,
      monte_carlo: monteCarloCVaR
    };
  }

  private calculateHistoricalVaR(returns: number[], confidence: number): number {
    const sortedReturns = returns.sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * sortedReturns.length);
    return sortedReturns[index];
  }

  private calculateParametricVaR(returns: number[], confidence: number): number {
    const mean = returns.reduce((sum, x) => sum + x, 0) / returns.length;
    const variance = returns.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    const zScore = this.getZScore(confidence);
    return mean + zScore * stdDev;
  }

  private async calculateMonteCarloVaR(returns: number[], confidence: number): Promise<number> {
    const simulations = 10000;
    const mean = returns.reduce((sum, x) => sum + x, 0) / returns.length;
    const stdDev = Math.sqrt(returns.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / returns.length);
    
    const simulatedReturns = [];
    for (let i = 0; i < simulations; i++) {
      simulatedReturns.push(mean + stdDev * this.generateRandomNormal());
    }
    
    simulatedReturns.sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * simulatedReturns.length);
    return simulatedReturns[index];
  }

  private calculateCornishFisherVaR(returns: number[], confidence: number): number {
    const mean = returns.reduce((sum, x) => sum + x, 0) / returns.length;
    const variance = returns.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    const skewness = this.calculateSkewness(returns, mean, stdDev);
    const kurtosis = this.calculateKurtosis(returns, mean, stdDev);
    
    const zScore = this.getZScore(confidence);
    const cfAdjustment = (zScore * skewness) / 6 + (Math.pow(zScore, 2) - 1) * kurtosis / 24;
    
    return mean + (zScore + cfAdjustment) * stdDev;
  }

  private calculateHistoricalCVaR(returns: number[], confidence: number): number {
    const sortedReturns = returns.sort((a, b) => a - b);
    const varIndex = Math.floor((1 - confidence) * sortedReturns.length);
    const tailReturns = sortedReturns.slice(0, varIndex);
    return tailReturns.reduce((sum, x) => sum + x, 0) / tailReturns.length;
  }

  private async calculateMonteCarloCVaR(returns: number[], confidence: number): Promise<number> {
    const varValue = await this.calculateMonteCarloVaR(returns, confidence);
    const mean = returns.reduce((sum, x) => sum + x, 0) / returns.length;
    const stdDev = Math.sqrt(returns.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / returns.length);
    
    const simulations = 10000;
    const simulatedReturns = [];
    for (let i = 0; i < simulations; i++) {
      simulatedReturns.push(mean + stdDev * this.generateRandomNormal());
    }
    
    const tailReturns = simulatedReturns.filter(r => r <= varValue);
    return tailReturns.reduce((sum, x) => sum + x, 0) / tailReturns.length;
  }

  private async assessVolatility(assets: string[], marketContext: any): Promise<number> {
    // Calculate weighted average volatility
    let totalVolatility = 0;
    let assetCount = 0;
    
    for (const asset of assets) {
      if (marketContext.volatility[asset]) {
        totalVolatility += marketContext.volatility[asset];
        assetCount++;
      }
    }
    
    return assetCount > 0 ? totalVolatility / assetCount : 0;
  }

  private async analyzeCorrelation(assets: string[], marketContext: any): Promise<number[][]> {
    // Return correlation matrix for assets
    const correlationMatrix = [];
    
    for (let i = 0; i < assets.length; i++) {
      const row = [];
      for (let j = 0; j < assets.length; j++) {
        if (i === j) {
          row.push(1.0);
        } else {
          // Calculate correlation between assets
          const correlation = this.calculateCorrelation(
            marketContext.returns[assets[i]] || [],
            marketContext.returns[assets[j]] || []
          );
          row.push(correlation);
        }
      }
      correlationMatrix.push(row);
    }
    
    return correlationMatrix;
  }

  private async assessLiquidity(assets: string[], sizePct: number): Promise<number> {
    // Simple liquidity assessment based on asset type and size
    let liquidityScore = 1.0;
    
    for (const asset of assets) {
      // Major cryptocurrencies and stocks have higher liquidity
      if (['BTC', 'ETH', 'AAPL', 'GOOGL', 'MSFT'].includes(asset)) {
        liquidityScore *= 0.9;
      } else {
        liquidityScore *= 0.7;
      }
    }
    
    // Size impact on liquidity
    if (sizePct > 0.1) {
      liquidityScore *= 0.8;
    }
    
    return Math.max(0, liquidityScore);
  }

  private calculateOverallRisk(riskFactors: any): number {
    const weights = {
      var: 0.3,
      cvar: 0.2,
      volatility: 0.2,
      correlation: 0.2,
      liquidity: 0.1
    };
    
    let weightedRisk = 0;
    let totalWeight = 0;
    
    for (const [factor, weight] of Object.entries(weights)) {
      if (riskFactors[factor] !== undefined) {
        weightedRisk += riskFactors[factor] * weight;
        totalWeight += weight;
      }
    }
    
    return totalWeight > 0 ? weightedRisk / totalWeight : 0.5;
  }

  private generateRiskRecommendations(riskScore: number): string[] {
    const recommendations = [];
    
    if (riskScore > 0.8) {
      recommendations.push('High risk detected - consider reducing position size');
      recommendations.push('Implement strict stop-loss orders');
      recommendations.push('Monitor market conditions closely');
    } else if (riskScore > 0.6) {
      recommendations.push('Moderate risk - implement risk management measures');
      recommendations.push('Consider diversification');
    } else if (riskScore > 0.4) {
      recommendations.push('Low to moderate risk - standard risk management');
    } else {
      recommendations.push('Low risk - proceed with standard procedures');
    }
    
    return recommendations;
  }

  private getZScore(confidence: number): number {
    const zScores: Record<number, number> = {
      0.90: 1.28,
      0.95: 1.65,
      0.99: 2.33
    };
    return zScores[confidence] || 1.65;
  }

  private calculateSkewness(returns: number[], mean: number, stdDev: number): number {
    const n = returns.length;
    const skewness = returns.reduce((sum, x) => {
      const normalized = (x - mean) / stdDev;
      return sum + Math.pow(normalized, 3);
    }, 0) / n;
    return skewness;
  }

  private calculateKurtosis(returns: number[], mean: number, stdDev: number): number {
    const n = returns.length;
    const kurtosis = returns.reduce((sum, x) => {
      const normalized = (x - mean) / stdDev;
      return sum + Math.pow(normalized, 4);
    }, 0) / n;
    return kurtosis - 3; // Excess kurtosis
  }

  private generateRandomNormal(): number {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  private calculateCorrelation(returns1: number[], returns2: number[]): number {
    if (returns1.length !== returns2.length || returns1.length === 0) {
      return 0;
    }
    
    const mean1 = returns1.reduce((sum, x) => sum + x, 0) / returns1.length;
    const mean2 = returns2.reduce((sum, x) => sum + x, 0) / returns2.length;
    
    let numerator = 0;
    let sumSq1 = 0;
    let sumSq2 = 0;
    
    for (let i = 0; i < returns1.length; i++) {
      const diff1 = returns1[i] - mean1;
      const diff2 = returns2[i] - mean2;
      numerator += diff1 * diff2;
      sumSq1 += diff1 * diff1;
      sumSq2 += diff2 * diff2;
    }
    
    const denominator = Math.sqrt(sumSq1 * sumSq2);
    return denominator === 0 ? 0 : numerator / denominator;
  }
}

// Investment Orchestrator
class InvestmentOrchestrator {
  private aws: AWSHelpers;
  private llm: LLMAdapter;
  private riskManager: RiskManager;

  constructor(aws: AWSHelpers, llm: LLMAdapter) {
    this.aws = aws;
    this.llm = llm;
    this.riskManager = new RiskManager(aws);
  }

  async generateProposal(signals: any[], assets: string[], timeframe: string): Promise<any> {
    try {
      // Aggregate top signals
      const topSignals = await this.aggregateTopSignals(signals);
      
      // Load market context
      const marketContext = await this.loadMarketContext(assets);
      
      // Generate investment thesis
      const thesis = await this.generateInvestmentThesis(topSignals, marketContext);
      
      // Calculate position sizing
      const positionSizing = await this.calculatePositionSizing(topSignals, marketContext);
      
      // Risk assessment
      const riskAssessment = await this.riskManager.assessRisk({
        assets,
        size_pct: positionSizing.size_pct,
        horizon_days: positionSizing.horizon_days
      }, marketContext);
      
      // Generate proposal
      const proposal = {
        id: HashUtils.generateId(),
        thesis: thesis.main_thesis,
        assets,
        size_pct: positionSizing.size_pct,
        horizon_days: positionSizing.horizon_days,
        entry_price: marketContext.current_prices,
        stop_loss: riskAssessment.var.historical * 0.8, // 80% of VaR
        take_profit: riskAssessment.var.historical * 1.2, // 120% of VaR
        invalidate_if: this.generateInvalidationConditions(riskAssessment),
        explain: thesis.explanation,
        constraints_checked: true,
        status: 'proposed',
        created_at: TimeUtils.now(),
        updated_at: TimeUtils.now(),
        risk_score: riskAssessment.overall_risk,
        expected_return: this.calculateExpectedReturn(topSignals, marketContext),
        sharpe_ratio: this.calculateSharpeRatio(topSignals, marketContext)
      };
      
      return proposal;
    } catch (error) {
      logger.error('Proposal generation failed', error as Error);
      throw error;
    }
  }

  private async aggregateTopSignals(signals: any[]): Promise<any> {
    // Sort signals by fused score
    const sortedSignals = signals.sort((a, b) => (b.scores?.fused || 0) - (a.scores?.fused || 0));
    
    // Take top 10 signals
    const topSignals = sortedSignals.slice(0, 10);
    
    // Calculate consensus
    const consensus = this.calculateConsensus(topSignals);
    
    return {
      signals: topSignals,
      consensus,
      confidence: this.calculateConfidence(topSignals),
      diversity: this.calculateDiversity(topSignals)
    };
  }

  private async loadMarketContext(assets: string[]): Promise<any> {
    // Load current market data (simplified)
    const marketContext = {
      current_prices: {},
      volatility: {},
      correlation: [],
      volume: {},
      market_cap: {},
      sector: {},
      region: {},
      returns: {}
    };
    
    // In production, this would load real market data
    for (const asset of assets) {
      marketContext.current_prices[asset] = 50000; // Example price
      marketContext.volatility[asset] = 0.2; // Example volatility
      marketContext.volume[asset] = 1000000; // Example volume
      marketContext.market_cap[asset] = 1000000000; // Example market cap
      marketContext.returns[asset] = [0.01, -0.02, 0.03, -0.01, 0.02]; // Example returns
    }
    
    return marketContext;
  }

  private async generateInvestmentThesis(signals: any, marketContext: any): Promise<any> {
    try {
      const prompt = `Based on the following signals and market data, create an investment thesis:

Signals: ${JSON.stringify(signals.consensus)}
Market Data: ${JSON.stringify(marketContext)}

Create a structured thesis with:
1. Main argument
2. Supporting factors
3. Risk factors
4. Timeframe
5. Expected performance

Return a JSON object with:
{
  "main_thesis": "string",
  "supporting_factors": ["string"],
  "risk_factors": ["string"],
  "timeframe": "string",
  "expected_performance": "string",
  "explanation": "string"
}`;

      const response = await this.llm.generateText(prompt);
      const thesis = JSON.parse(response);
      
      return thesis;
    } catch (error) {
      logger.error('Investment thesis generation failed', error as Error);
      throw error;
    }
  }

  private async calculatePositionSizing(signals: any, marketContext: any): Promise<any> {
    // Kelly Criterion for position sizing
    const winRate = this.calculateWinRate(signals);
    const avgWin = this.calculateAverageWin(signals);
    const avgLoss = this.calculateAverageLoss(signals);
    
    const kellyFraction = (winRate * avgWin - (1 - winRate) * avgLoss) / avgWin;
    const positionSize = Math.max(0.01, Math.min(0.1, kellyFraction)); // Cap between 1% and 10%
    
    return {
      size_pct: positionSize,
      horizon_days: this.calculateHorizon(signals)
    };
  }

  private generateInvalidationConditions(riskAssessment: any): string[] {
    const conditions = [];
    
    if (riskAssessment.overall_risk > 0.8) {
      conditions.push('Risk score exceeds 0.8');
    }
    
    if (riskAssessment.volatility > 0.3) {
      conditions.push('Volatility exceeds 30%');
    }
    
    if (riskAssessment.correlation > 0.8) {
      conditions.push('Correlation exceeds 80%');
    }
    
    return conditions;
  }

  private calculateConsensus(signals: any[]): number {
    if (signals.length === 0) return 0;
    
    const totalScore = signals.reduce((sum, signal) => sum + (signal.scores?.fused || 0), 0);
    return totalScore / signals.length;
  }

  private calculateConfidence(signals: any[]): number {
    if (signals.length === 0) return 0;
    
    const totalConfidence = signals.reduce((sum, signal) => sum + (signal.confidences?.fused || 0), 0);
    return totalConfidence / signals.length;
  }

  private calculateDiversity(signals: any[]): number {
    const sources = new Set(signals.map(s => s.source));
    return sources.size / signals.length;
  }

  private calculateWinRate(signals: any[]): number {
    // Simplified win rate calculation
    return 0.6; // 60% win rate
  }

  private calculateAverageWin(signals: any[]): number {
    // Simplified average win calculation
    return 0.15; // 15% average win
  }

  private calculateAverageLoss(signals: any[]): number {
    // Simplified average loss calculation
    return 0.08; // 8% average loss
  }

  private calculateHorizon(signals: any[]): number {
    // Calculate investment horizon based on signal characteristics
    const avgNovelty = signals.reduce((sum, s) => sum + (s.scores?.novelty || 0), 0) / signals.length;
    
    if (avgNovelty > 0.8) {
      return 7; // 1 week for high novelty
    } else if (avgNovelty > 0.5) {
      return 30; // 1 month for medium novelty
    } else {
      return 90; // 3 months for low novelty
    }
  }

  private calculateExpectedReturn(signals: any, marketContext: any): number {
    // Simplified expected return calculation
    const consensus = this.calculateConsensus(signals.signals);
    const confidence = this.calculateConfidence(signals.signals);
    
    return consensus * confidence * 0.1; // 10% base return
  }

  private calculateSharpeRatio(signals: any, marketContext: any): number {
    // Simplified Sharpe ratio calculation
    const expectedReturn = this.calculateExpectedReturn(signals, marketContext);
    const riskFreeRate = 0.02; // 2% risk-free rate
    const volatility = 0.2; // 20% volatility
    
    return (expectedReturn - riskFreeRate) / volatility;
  }
}

// Main Lambda Handler
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const startTime = Date.now();
  let processedProposals = 0;
  let errors = 0;

  try {
    // Determine if this is a proposal request or risk check
    const path = event.path;
    
    if (path.includes('/propose')) {
      return await handleProposalRequest(event);
    } else if (path.includes('/risk/check')) {
      return await handleRiskCheckRequest(event);
    } else {
      throw new Error('Invalid endpoint');
    }

  } catch (error) {
    logger.error('Orchestrator failed', error as Error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        ok: false,
        error: 'Orchestrator failed',
        details: error.message
      })
    };
  }
};

// Handle proposal request
async function handleProposalRequest(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const requestBody = ProposalRequestSchema.parse(JSON.parse(event.body || '{}'));
    
    logger.info('Proposal request started', {
      signalCount: requestBody.signals.length,
      assets: requestBody.assets,
      userId: requestBody.userId
    });

    // Load API credentials
    const secrets = await aws.getSecret(process.env.SECRETS_MANAGER_SECRET_ID || 'ai-investment-secrets');
    
    // Initialize LLM adapter
    const llm = new LLMAdapter({
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      timeout: 60,
      apiKey: secrets.openai_api_key
    });

    // Initialize orchestrator
    const orchestrator = new InvestmentOrchestrator(aws, llm);

    // Generate proposal
    const proposal = await orchestrator.generateProposal(
      requestBody.signals,
      requestBody.assets,
      requestBody.timeframe
    );

    // Store proposal in DynamoDB
    await aws.dynamoPut(process.env.PROPOSALS_TABLE_NAME || 'ai-investment-proposals', proposal);

    logger.info('Proposal generated', {
      proposalId: proposal.id,
      assets: proposal.assets,
      sizePct: proposal.size_pct,
      riskScore: proposal.risk_score
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        ok: true,
        data: proposal
      })
    };

  } catch (error) {
    logger.error('Proposal generation failed', error as Error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        ok: false,
        error: 'Proposal generation failed',
        details: error.message
      })
    };
  }
}

// Handle risk check request
async function handleRiskCheckRequest(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const requestBody = RiskCheckRequestSchema.parse(JSON.parse(event.body || '{}'));
    
    logger.info('Risk check started', {
      proposalId: requestBody.proposal.id,
      assets: requestBody.assets,
      userId: requestBody.userId
    });

    // Initialize risk manager
    const riskManager = new RiskManager(aws);

    // Load market context
    const marketContext = await loadMarketContext(requestBody.assets);

    // Assess risk
    const riskAssessment = await riskManager.assessRisk(requestBody.proposal, marketContext);

    logger.info('Risk assessment completed', {
      proposalId: requestBody.proposal.id,
      overallRisk: riskAssessment.overall_risk,
      recommendations: riskAssessment.recommendations.length
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        ok: true,
        data: {
          risk_score: riskAssessment.overall_risk,
          var: riskAssessment.var,
          cvar: riskAssessment.cvar,
          volatility: riskAssessment.volatility,
          correlation: riskAssessment.correlation,
          liquidity: riskAssessment.liquidity,
          recommendations: riskAssessment.recommendations
        }
      })
    };

  } catch (error) {
    logger.error('Risk check failed', error as Error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        ok: false,
        error: 'Risk check failed',
        details: error.message
      })
    };
  }
}

// Load market context
async function loadMarketContext(assets: string[]): Promise<any> {
  const marketContext = {
    current_prices: {},
    volatility: {},
    correlation: [],
    volume: {},
    market_cap: {},
    sector: {},
    region: {},
    returns: {}
  };
  
  // In production, this would load real market data
  for (const asset of assets) {
    marketContext.current_prices[asset] = 50000; // Example price
    marketContext.volatility[asset] = 0.2; // Example volatility
    marketContext.volume[asset] = 1000000; // Example volume
    marketContext.market_cap[asset] = 1000000000; // Example market cap
    marketContext.returns[asset] = [0.01, -0.02, 0.03, -0.01, 0.02]; // Example returns
  }
  
  return marketContext;
}
