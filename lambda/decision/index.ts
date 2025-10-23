import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AWSHelpers } from '@ai-investment/common';
import { DecisionRequestSchema, EvaluationRequestSchema, OutcomeSchema } from '@ai-investment/common';
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

// Decision Management Classes
class DecisionManager {
  private aws: AWSHelpers;
  private llm: LLMAdapter;

  constructor(aws: AWSHelpers, llm: LLMAdapter) {
    this.aws = aws;
    this.llm = llm;
  }

  async makeDecision(proposal: any, context: any): Promise<any> {
    try {
      logger.info('Decision process started', {
        proposalId: proposal.id,
        assets: proposal.assets,
        riskScore: proposal.risk_score
      });

      // Load decision rules
      const rules = await this.loadDecisionRules();
      
      // Apply decision rules
      const ruleResults = await this.applyDecisionRules(proposal, rules);
      
      // Generate decision rationale
      const rationale = await this.generateDecisionRationale(proposal, ruleResults, context);
      
      // Make final decision
      const decision = await this.makeFinalDecision(proposal, ruleResults, rationale);
      
      // Store decision
      await this.storeDecision(decision);
      
      logger.info('Decision completed', {
        proposalId: proposal.id,
        decision: decision.action,
        confidence: decision.confidence
      });

      return decision;
    } catch (error) {
      logger.error('Decision making failed', error as Error);
      throw error;
    }
  }

  private async loadDecisionRules(): Promise<any[]> {
    try {
      // Load rules from DynamoDB
      const rules = await aws.dynamoQuery(
        process.env.DECISION_RULES_TABLE_NAME || 'ai-investment-decision-rules',
        {
          KeyConditionExpression: 'active = :active',
          ExpressionAttributeValues: {
            ':active': true
          }
        }
      );
      
      return rules.Items || [];
    } catch (error) {
      logger.error('Failed to load decision rules', error as Error);
      return this.getDefaultRules();
    }
  }

  private getDefaultRules(): any[] {
    return [
      {
        id: 'risk_threshold',
        name: 'Risk Threshold Rule',
        condition: 'proposal.risk_score > 0.8',
        action: 'reject',
        priority: 1,
        description: 'Reject proposals with risk score > 0.8'
      },
      {
        id: 'position_size',
        name: 'Position Size Rule',
        condition: 'proposal.size_pct > 0.1',
        action: 'reduce_size',
        priority: 2,
        description: 'Reduce position size if > 10%'
      },
      {
        id: 'diversification',
        name: 'Diversification Rule',
        condition: 'context.portfolio_concentration > 0.5',
        action: 'diversify',
        priority: 3,
        description: 'Ensure portfolio diversification'
      },
      {
        id: 'liquidity',
        name: 'Liquidity Rule',
        condition: 'proposal.liquidity_score < 0.5',
        action: 'reject',
        priority: 4,
        description: 'Reject low liquidity proposals'
      }
    ];
  }

  private async applyDecisionRules(proposal: any, rules: any[]): Promise<any> {
    const results = [];
    
    for (const rule of rules) {
      try {
        const result = await this.evaluateRule(proposal, rule);
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          condition: rule.condition,
          result: result,
          action: rule.action,
          priority: rule.priority
        });
      } catch (error) {
        logger.error(`Rule evaluation failed for ${rule.id}`, error as Error);
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          condition: rule.condition,
          result: false,
          action: 'skip',
          priority: rule.priority,
          error: error.message
        });
      }
    }
    
    return results;
  }

  private async evaluateRule(proposal: any, rule: any): Promise<boolean> {
    try {
      // Simple rule evaluation (in production, use a proper rule engine)
      const condition = rule.condition;
      
      if (condition.includes('proposal.risk_score > 0.8')) {
        return proposal.risk_score > 0.8;
      }
      
      if (condition.includes('proposal.size_pct > 0.1')) {
        return proposal.size_pct > 0.1;
      }
      
      if (condition.includes('context.portfolio_concentration > 0.5')) {
        return proposal.portfolio_concentration > 0.5;
      }
      
      if (condition.includes('proposal.liquidity_score < 0.5')) {
        return proposal.liquidity_score < 0.5;
      }
      
      return false;
    } catch (error) {
      logger.error(`Rule evaluation error for ${rule.id}`, error as Error);
      return false;
    }
  }

  private async generateDecisionRationale(proposal: any, ruleResults: any[], context: any): Promise<string> {
    try {
      const prompt = `Generate a decision rationale for an investment proposal:

Proposal: ${JSON.stringify(proposal)}
Rule Results: ${JSON.stringify(ruleResults)}
Context: ${JSON.stringify(context)}

Provide a structured rationale including:
1. Summary of the proposal
2. Rule evaluation results
3. Risk assessment
4. Final recommendation
5. Reasoning behind the decision

Return a JSON object with:
{
  "summary": "string",
  "rule_evaluation": "string",
  "risk_assessment": "string",
  "recommendation": "string",
  "reasoning": "string"
}`;

      const response = await this.llm.generateText(prompt);
      const rationale = JSON.parse(response);
      
      return rationale;
    } catch (error) {
      logger.error('Decision rationale generation failed', error as Error);
      return {
        summary: 'Proposal analysis completed',
        rule_evaluation: 'Rules applied successfully',
        risk_assessment: 'Risk within acceptable limits',
        recommendation: 'Proceed with caution',
        reasoning: 'Standard decision process applied'
      };
    }
  }

  private async makeFinalDecision(proposal: any, ruleResults: any[], rationale: any): Promise<any> {
    // Determine action based on rule results
    let action = 'approve';
    let confidence = 0.8;
    let sizeAdjustment = 1.0;
    
    // Check for rejections
    const rejections = ruleResults.filter(r => r.action === 'reject' && r.result);
    if (rejections.length > 0) {
      action = 'reject';
      confidence = 0.9;
    }
    
    // Check for size reductions
    const sizeReductions = ruleResults.filter(r => r.action === 'reduce_size' && r.result);
    if (sizeReductions.length > 0) {
      sizeAdjustment = 0.5; // Reduce size by 50%
    }
    
    // Check for diversification requirements
    const diversification = ruleResults.filter(r => r.action === 'diversify' && r.result);
    if (diversification.length > 0) {
      sizeAdjustment *= 0.8; // Further reduce size for diversification
    }
    
    // Calculate final confidence
    const ruleConfidence = this.calculateRuleConfidence(ruleResults);
    confidence = Math.min(confidence, ruleConfidence);
    
    return {
      id: HashUtils.generateId(),
      proposal_id: proposal.id,
      action,
      confidence,
      size_adjustment: sizeAdjustment,
      rationale: rationale.reasoning,
      rule_results: ruleResults,
      created_at: TimeUtils.now(),
      updated_at: TimeUtils.now()
    };
  }

  private calculateRuleConfidence(ruleResults: any[]): number {
    if (ruleResults.length === 0) return 0.5;
    
    const passedRules = ruleResults.filter(r => r.result === true).length;
    const totalRules = ruleResults.length;
    
    return passedRules / totalRules;
  }

  private async storeDecision(decision: any): Promise<void> {
    try {
      await aws.dynamoPut(
        process.env.DECISIONS_TABLE_NAME || 'ai-investment-decisions',
        decision
      );
    } catch (error) {
      logger.error('Failed to store decision', error as Error);
      throw error;
    }
  }
}

// Learning Loop Classes
class LearningLoop {
  private aws: AWSHelpers;
  private llm: LLMAdapter;

  constructor(aws: AWSHelpers, llm: LLMAdapter) {
    this.aws = aws;
    this.llm = llm;
  }

  async evaluateOutcome(proposal: any, outcome: any): Promise<any> {
    try {
      logger.info('Outcome evaluation started', {
        proposalId: proposal.id,
        outcomeId: outcome.id
      });

      // Calculate performance metrics
      const performance = await this.calculatePerformance(proposal, outcome);
      
      // Analyze decision quality
      const decisionQuality = await this.analyzeDecisionQuality(proposal, outcome);
      
      // Update learning models
      await this.updateLearningModels(proposal, outcome, performance);
      
      // Generate insights
      const insights = await this.generateInsights(proposal, outcome, performance);
      
      // Store evaluation
      const evaluation = {
        id: HashUtils.generateId(),
        proposal_id: proposal.id,
        outcome_id: outcome.id,
        performance,
        decision_quality: decisionQuality,
        insights,
        created_at: TimeUtils.now(),
        updated_at: TimeUtils.now()
      };
      
      await this.storeEvaluation(evaluation);
      
      logger.info('Outcome evaluation completed', {
        proposalId: proposal.id,
        performance: performance.overall_score
      });

      return evaluation;
    } catch (error) {
      logger.error('Outcome evaluation failed', error as Error);
      throw error;
    }
  }

  private async calculatePerformance(proposal: any, outcome: any): Promise<any> {
    // Calculate return
    const returnPct = this.calculateReturn(proposal, outcome);
    
    // Calculate Sharpe ratio
    const sharpeRatio = this.calculateSharpeRatio(returnPct, outcome.volatility);
    
    // Calculate maximum drawdown
    const maxDrawdown = this.calculateMaxDrawdown(outcome.price_history);
    
    // Calculate win rate
    const winRate = this.calculateWinRate(proposal, outcome);
    
    // Calculate overall score
    const overallScore = this.calculateOverallScore({
      return: returnPct,
      sharpe: sharpeRatio,
      drawdown: maxDrawdown,
      winRate
    });

    return {
      return_pct: returnPct,
      sharpe_ratio: sharpeRatio,
      max_drawdown: maxDrawdown,
      win_rate: winRate,
      overall_score: overallScore
    };
  }

  private calculateReturn(proposal: any, outcome: any): number {
    const entryPrice = proposal.entry_price;
    const exitPrice = outcome.exit_price;
    
    if (!entryPrice || !exitPrice) return 0;
    
    return (exitPrice - entryPrice) / entryPrice;
  }

  private calculateSharpeRatio(returnPct: number, volatility: number): number {
    const riskFreeRate = 0.02; // 2% annual risk-free rate
    const annualizedReturn = returnPct * 365; // Annualize return
    const annualizedVolatility = volatility * Math.sqrt(365); // Annualize volatility
    
    return (annualizedReturn - riskFreeRate) / annualizedVolatility;
  }

  private calculateMaxDrawdown(priceHistory: number[]): number {
    if (!priceHistory || priceHistory.length === 0) return 0;
    
    let maxDrawdown = 0;
    let peak = priceHistory[0];
    
    for (const price of priceHistory) {
      if (price > peak) {
        peak = price;
      }
      const drawdown = (peak - price) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
    
    return maxDrawdown;
  }

  private calculateWinRate(proposal: any, outcome: any): number {
    // Simple win rate calculation
    const returnPct = this.calculateReturn(proposal, outcome);
    return returnPct > 0 ? 1 : 0;
  }

  private calculateOverallScore(metrics: any): number {
    const weights = {
      return: 0.4,
      sharpe: 0.3,
      drawdown: 0.2,
      winRate: 0.1
    };
    
    let weightedScore = 0;
    let totalWeight = 0;
    
    for (const [metric, weight] of Object.entries(weights)) {
      if (metrics[metric] !== undefined) {
        weightedScore += metrics[metric] * weight;
        totalWeight += weight;
      }
    }
    
    return totalWeight > 0 ? weightedScore / totalWeight : 0.5;
  }

  private async analyzeDecisionQuality(proposal: any, outcome: any): Promise<any> {
    try {
      const prompt = `Analyze the quality of an investment decision:

Proposal: ${JSON.stringify(proposal)}
Outcome: ${JSON.stringify(outcome)}

Evaluate:
1. Decision accuracy
2. Risk management effectiveness
3. Timing quality
4. Position sizing appropriateness
5. Overall decision quality

Return a JSON object with:
{
  "accuracy": "string",
  "risk_management": "string",
  "timing": "string",
  "position_sizing": "string",
  "overall_quality": "string",
  "score": 0.8
}`;

      const response = await this.llm.generateText(prompt);
      const quality = JSON.parse(response);
      
      return quality;
    } catch (error) {
      logger.error('Decision quality analysis failed', error as Error);
      return {
        accuracy: 'Standard',
        risk_management: 'Adequate',
        timing: 'Good',
        position_sizing: 'Appropriate',
        overall_quality: 'Good',
        score: 0.7
      };
    }
  }

  private async updateLearningModels(proposal: any, outcome: any, performance: any): Promise<void> {
    try {
      // Update signal scoring models
      await this.updateSignalScoringModels(proposal, outcome, performance);
      
      // Update risk models
      await this.updateRiskModels(proposal, outcome, performance);
      
      // Update decision rules
      await this.updateDecisionRules(proposal, outcome, performance);
      
    } catch (error) {
      logger.error('Model update failed', error as Error);
      throw error;
    }
  }

  private async updateSignalScoringModels(proposal: any, outcome: any, performance: any): Promise<void> {
    // Update signal scoring weights based on performance
    const signalWeights = await this.loadSignalWeights();
    
    for (const signal of proposal.signals || []) {
      const signalPerformance = this.calculateSignalPerformance(signal, outcome);
      const weightAdjustment = this.calculateWeightAdjustment(signalPerformance);
      
      signalWeights[signal.source] = (signalWeights[signal.source] || 1.0) * weightAdjustment;
    }
    
    await this.saveSignalWeights(signalWeights);
  }

  private async updateRiskModels(proposal: any, outcome: any, performance: any): Promise<void> {
    // Update risk model parameters based on actual outcomes
    const riskParams = await this.loadRiskParameters();
    
    const actualRisk = this.calculateActualRisk(proposal, outcome);
    const predictedRisk = proposal.risk_score;
    
    const riskAdjustment = this.calculateRiskAdjustment(actualRisk, predictedRisk);
    
    for (const param of Object.keys(riskParams)) {
      riskParams[param] *= riskAdjustment;
    }
    
    await this.saveRiskParameters(riskParams);
  }

  private async updateDecisionRules(proposal: any, outcome: any, performance: any): Promise<void> {
    // Update decision rule effectiveness
    const rules = await this.loadDecisionRules();
    
    for (const rule of rules) {
      const ruleEffectiveness = this.calculateRuleEffectiveness(rule, proposal, outcome);
      rule.effectiveness = (rule.effectiveness || 0.5) * 0.9 + ruleEffectiveness * 0.1; // Exponential moving average
    }
    
    await this.saveDecisionRules(rules);
  }

  private async generateInsights(proposal: any, outcome: any, performance: any): Promise<string[]> {
    try {
      const prompt = `Generate insights from an investment outcome:

Proposal: ${JSON.stringify(proposal)}
Outcome: ${JSON.stringify(outcome)}
Performance: ${JSON.stringify(performance)}

Generate actionable insights for:
1. Signal quality improvement
2. Risk management optimization
3. Decision rule refinement
4. Model performance enhancement

Return a JSON array of insight strings.`;

      const response = await this.llm.generateText(prompt);
      const insights = JSON.parse(response);
      
      return insights;
    } catch (error) {
      logger.error('Insight generation failed', error as Error);
      return [
        'Monitor signal quality trends',
        'Review risk management parameters',
        'Analyze decision rule effectiveness',
        'Update model weights based on performance'
      ];
    }
  }

  private calculateSignalPerformance(signal: any, outcome: any): number {
    // Calculate how well the signal predicted the outcome
    const signalScore = signal.scores?.fused || 0;
    const actualReturn = this.calculateReturn({ entry_price: signal.price }, outcome);
    
    return signalScore * actualReturn;
  }

  private calculateWeightAdjustment(performance: number): number {
    // Adjust signal weights based on performance
    if (performance > 0.1) return 1.1; // Increase weight for good performance
    if (performance < -0.1) return 0.9; // Decrease weight for poor performance
    return 1.0; // No change
  }

  private calculateActualRisk(proposal: any, outcome: any): number {
    // Calculate actual risk from outcome
    const returnPct = this.calculateReturn(proposal, outcome);
    const volatility = outcome.volatility || 0.2;
    
    return Math.abs(returnPct) / volatility;
  }

  private calculateRiskAdjustment(actualRisk: number, predictedRisk: number): number {
    // Adjust risk model parameters
    const ratio = actualRisk / predictedRisk;
    return Math.max(0.5, Math.min(2.0, ratio)); // Clamp between 0.5 and 2.0
  }

  private calculateRuleEffectiveness(rule: any, proposal: any, outcome: any): number {
    // Calculate how effective the rule was
    const ruleResult = this.evaluateRule(proposal, rule);
    const outcomeSuccess = this.calculateReturn(proposal, outcome) > 0;
    
    if (ruleResult && outcomeSuccess) return 1.0; // Rule passed and outcome was good
    if (!ruleResult && !outcomeSuccess) return 1.0; // Rule failed and outcome was bad
    return 0.0; // Rule was wrong
  }

  private async loadSignalWeights(): Promise<any> {
    try {
      const weights = await aws.dynamoQuery(
        process.env.SIGNAL_WEIGHTS_TABLE_NAME || 'ai-investment-signal-weights',
        { KeyConditionExpression: 'id = :id', ExpressionAttributeValues: { ':id': 'default' } }
      );
      return weights.Items?.[0]?.weights || {};
    } catch (error) {
      logger.error('Failed to load signal weights', error as Error);
      return {};
    }
  }

  private async saveSignalWeights(weights: any): Promise<void> {
    try {
      await aws.dynamoPut(
        process.env.SIGNAL_WEIGHTS_TABLE_NAME || 'ai-investment-signal-weights',
        { id: 'default', weights, updated_at: TimeUtils.now() }
      );
    } catch (error) {
      logger.error('Failed to save signal weights', error as Error);
    }
  }

  private async loadRiskParameters(): Promise<any> {
    try {
      const params = await aws.dynamoQuery(
        process.env.RISK_PARAMS_TABLE_NAME || 'ai-investment-risk-params',
        { KeyConditionExpression: 'id = :id', ExpressionAttributeValues: { ':id': 'default' } }
      );
      return params.Items?.[0]?.parameters || {};
    } catch (error) {
      logger.error('Failed to load risk parameters', error as Error);
      return {};
    }
  }

  private async saveRiskParameters(params: any): Promise<void> {
    try {
      await aws.dynamoPut(
        process.env.RISK_PARAMS_TABLE_NAME || 'ai-investment-risk-params',
        { id: 'default', parameters: params, updated_at: TimeUtils.now() }
      );
    } catch (error) {
      logger.error('Failed to save risk parameters', error as Error);
    }
  }

  private async loadDecisionRules(): Promise<any[]> {
    try {
      const rules = await aws.dynamoQuery(
        process.env.DECISION_RULES_TABLE_NAME || 'ai-investment-decision-rules',
        { KeyConditionExpression: 'active = :active', ExpressionAttributeValues: { ':active': true } }
      );
      return rules.Items || [];
    } catch (error) {
      logger.error('Failed to load decision rules', error as Error);
      return [];
    }
  }

  private async saveDecisionRules(rules: any[]): Promise<void> {
    try {
      for (const rule of rules) {
        await aws.dynamoPut(
          process.env.DECISION_RULES_TABLE_NAME || 'ai-investment-decision-rules',
          { ...rule, updated_at: TimeUtils.now() }
        );
      }
    } catch (error) {
      logger.error('Failed to save decision rules', error as Error);
    }
  }

  private async storeEvaluation(evaluation: any): Promise<void> {
    try {
      await aws.dynamoPut(
        process.env.EVALUATIONS_TABLE_NAME || 'ai-investment-evaluations',
        evaluation
      );
    } catch (error) {
      logger.error('Failed to store evaluation', error as Error);
      throw error;
    }
  }
}

// Main Lambda Handler
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const startTime = Date.now();
  let processedDecisions = 0;
  let errors = 0;

  try {
    // Determine if this is a decision request or evaluation request
    const path = event.path;
    
    if (path.includes('/decision')) {
      return await handleDecisionRequest(event);
    } else if (path.includes('/evaluation')) {
      return await handleEvaluationRequest(event);
    } else {
      throw new Error('Invalid endpoint');
    }

  } catch (error) {
    logger.error('Decision management failed', error as Error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        ok: false,
        error: 'Decision management failed',
        details: error.message
      })
    };
  }
};

// Handle decision request
async function handleDecisionRequest(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const requestBody = DecisionRequestSchema.parse(JSON.parse(event.body || '{}'));
    
    logger.info('Decision request started', {
      proposalId: requestBody.proposal.id,
      assets: requestBody.proposal.assets,
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

    // Initialize decision manager
    const decisionManager = new DecisionManager(aws, llm);

    // Make decision
    const decision = await decisionManager.makeDecision(requestBody.proposal, requestBody.context);

    logger.info('Decision completed', {
      proposalId: requestBody.proposal.id,
      decision: decision.action,
      confidence: decision.confidence
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        ok: true,
        data: decision
      })
    };

  } catch (error) {
    logger.error('Decision making failed', error as Error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        ok: false,
        error: 'Decision making failed',
        details: error.message
      })
    };
  }
}

// Handle evaluation request
async function handleEvaluationRequest(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const requestBody = EvaluationRequestSchema.parse(JSON.parse(event.body || '{}'));
    
    logger.info('Evaluation request started', {
      proposalId: requestBody.proposal.id,
      outcomeId: requestBody.outcome.id,
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

    // Initialize learning loop
    const learningLoop = new LearningLoop(aws, llm);

    // Evaluate outcome
    const evaluation = await learningLoop.evaluateOutcome(requestBody.proposal, requestBody.outcome);

    logger.info('Evaluation completed', {
      proposalId: requestBody.proposal.id,
      performance: evaluation.performance.overall_score
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        ok: true,
        data: evaluation
      })
    };

  } catch (error) {
    logger.error('Evaluation failed', error as Error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        ok: false,
        error: 'Evaluation failed',
        details: error.message
      })
    };
  }
}
