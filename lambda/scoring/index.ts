import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AWSHelpers } from '@ai-investment/common';
import { ScoringRequestSchema, SignalSchema, ScoreResult, FeatureVector, FusedScore } from '@ai-investment/common';
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

// ML Model Classes
class SentimentModel {
  private llm: LLMAdapter;

  constructor(llm: LLMAdapter) {
    this.llm = llm;
  }

  async predict(features: FeatureVector): Promise<ScoreResult> {
    try {
      const prompt = `Analyze the sentiment of the following text and return a score between -1 (very negative) and 1 (very positive):

Text: "${features.content}"

Consider these factors:
- Overall tone and emotion
- Market sentiment indicators
- Confidence level
- Context relevance

Return a JSON object with:
{
  "score": number between -1 and 1,
  "confidence": number between 0 and 1,
  "attribution": {
    "tone": number,
    "emotion": number,
    "market_sentiment": number
  }
}`;

      const response = await this.llm.generateText(prompt);
      const result = JSON.parse(response);
      
      return {
        score: result.score,
        confidence: result.confidence,
        attribution: {
          topFactors: [
            { factor: 'tone', contribution: result.attribution.tone, direction: 'positive' },
            { factor: 'emotion', contribution: result.attribution.emotion, direction: 'positive' },
            { factor: 'market_sentiment', contribution: result.attribution.market_sentiment, direction: 'positive' }
          ],
          explanation: `Sentiment analysis based on tone, emotion, and market sentiment`,
          confidence: result.confidence
        },
        method: 'sentiment_model'
      };
    } catch (error) {
      logger.error('Sentiment model prediction failed', error as Error);
      throw error;
    }
  }
}

class RelevanceModel {
  private llm: LLMAdapter;

  constructor(llm: LLMAdapter) {
    this.llm = llm;
  }

  async predict(features: FeatureVector): Promise<ScoreResult> {
    try {
      const prompt = `Analyze the relevance of the following text to the asset "${features.asset}" and return a relevance score between 0 (not relevant) and 1 (highly relevant):

Text: "${features.content}"

Consider these factors:
- Direct mentions of the asset
- Market context and implications
- Investment relevance
- Time sensitivity

Return a JSON object with:
{
  "score": number between 0 and 1,
  "confidence": number between 0 and 1,
  "attribution": {
    "direct_mention": number,
    "market_context": number,
    "investment_relevance": number,
    "time_sensitivity": number
  }
}`;

      const response = await this.llm.generateText(prompt);
      const result = JSON.parse(response);
      
      return {
        score: result.score,
        confidence: result.confidence,
        attribution: {
          topFactors: [
            { factor: 'direct_mention', contribution: result.attribution.direct_mention, direction: 'positive' },
            { factor: 'market_context', contribution: result.attribution.market_context, direction: 'positive' },
            { factor: 'investment_relevance', contribution: result.attribution.investment_relevance, direction: 'positive' },
            { factor: 'time_sensitivity', contribution: result.attribution.time_sensitivity, direction: 'positive' }
          ],
          explanation: `Relevance analysis based on direct mentions, market context, and investment relevance`,
          confidence: result.confidence
        },
        method: 'relevance_model'
      };
    } catch (error) {
      logger.error('Relevance model prediction failed', error as Error);
      throw error;
    }
  }
}

class NoveltyModel {
  private llm: LLMAdapter;

  constructor(llm: LLMAdapter) {
    this.llm = llm;
  }

  async predict(features: FeatureVector): Promise<ScoreResult> {
    try {
      const prompt = `Analyze the novelty of the following text and return a novelty score between 0 (not novel) and 1 (highly novel):

Text: "${features.content}"

Consider these factors:
- Information uniqueness
- Breaking news potential
- Market impact potential
- Surprise factor

Return a JSON object with:
{
  "score": number between 0 and 1,
  "confidence": number between 0 and 1,
  "attribution": {
    "uniqueness": number,
    "breaking_news": number,
    "market_impact": number,
    "surprise_factor": number
  }
}`;

      const response = await this.llm.generateText(prompt);
      const result = JSON.parse(response);
      
      return {
        score: result.score,
        confidence: result.confidence,
        attribution: {
          topFactors: [
            { factor: 'uniqueness', contribution: result.attribution.uniqueness, direction: 'positive' },
            { factor: 'breaking_news', contribution: result.attribution.breaking_news, direction: 'positive' },
            { factor: 'market_impact', contribution: result.attribution.market_impact, direction: 'positive' },
            { factor: 'surprise_factor', contribution: result.attribution.surprise_factor, direction: 'positive' }
          ],
          explanation: `Novelty analysis based on uniqueness, breaking news potential, and market impact`,
          confidence: result.confidence
        },
        method: 'novelty_model'
      };
    } catch (error) {
      logger.error('Novelty model prediction failed', error as Error);
      throw error;
    }
  }
}

class CredibilityModel {
  private llm: LLMAdapter;

  constructor(llm: LLMAdapter) {
    this.llm = llm;
  }

  async predict(features: FeatureVector): Promise<ScoreResult> {
    try {
      const prompt = `Analyze the credibility of the following text and return a credibility score between 0 (not credible) and 1 (highly credible):

Text: "${features.content}"

Consider these factors:
- Source reliability
- Information accuracy
- Author expertise
- Factual consistency

Return a JSON object with:
{
  "score": number between 0 and 1,
  "confidence": number between 0 and 1,
  "attribution": {
    "source_reliability": number,
    "information_accuracy": number,
    "author_expertise": number,
    "factual_consistency": number
  }
}`;

      const response = await this.llm.generateText(prompt);
      const result = JSON.parse(response);
      
      return {
        score: result.score,
        confidence: result.confidence,
        attribution: {
          topFactors: [
            { factor: 'source_reliability', contribution: result.attribution.source_reliability, direction: 'positive' },
            { factor: 'information_accuracy', contribution: result.attribution.information_accuracy, direction: 'positive' },
            { factor: 'author_expertise', contribution: result.attribution.author_expertise, direction: 'positive' },
            { factor: 'factual_consistency', contribution: result.attribution.factual_consistency, direction: 'positive' }
          ],
          explanation: `Credibility analysis based on source reliability, information accuracy, and author expertise`,
          confidence: result.confidence
        },
        method: 'credibility_model'
      };
    } catch (error) {
      logger.error('Credibility model prediction failed', error as Error);
      throw error;
    }
  }
}

class ViralityModel {
  private llm: LLMAdapter;

  constructor(llm: LLMAdapter) {
    this.llm = llm;
  }

  async predict(features: FeatureVector): Promise<ScoreResult> {
    try {
      const prompt = `Analyze the virality potential of the following text and return a virality score between 0 (not viral) and 1 (highly viral):

Text: "${features.content}"

Consider these factors:
- Shareability
- Engagement potential
- Controversy level
- Meme potential

Return a JSON object with:
{
  "score": number between 0 and 1,
  "confidence": number between 0 and 1,
  "attribution": {
    "shareability": number,
    "engagement_potential": number,
    "controversy_level": number,
    "meme_potential": number
  }
}`;

      const response = await this.llm.generateText(prompt);
      const result = JSON.parse(response);
      
      return {
        score: result.score,
        confidence: result.confidence,
        attribution: {
          topFactors: [
            { factor: 'shareability', contribution: result.attribution.shareability, direction: 'positive' },
            { factor: 'engagement_potential', contribution: result.attribution.engagement_potential, direction: 'positive' },
            { factor: 'controversy_level', contribution: result.attribution.controversy_level, direction: 'positive' },
            { factor: 'meme_potential', contribution: result.attribution.meme_potential, direction: 'positive' }
          ],
          explanation: `Virality analysis based on shareability, engagement potential, and controversy level`,
          confidence: result.confidence
        },
        method: 'virality_model'
      };
    } catch (error) {
      logger.error('Virality model prediction failed', error as Error);
      throw error;
    }
  }
}

// Ensemble Fusion
class EnsembleFusion {
  async fuse(scores: ScoreResult[], weights: Record<string, number>): Promise<FusedScore> {
    try {
      // Weighted Average
      const weightedScore = scores.reduce((sum, score, index) => {
        const weight = weights[score.method] || 1 / scores.length;
        return sum + (score.score * weight);
      }, 0);

      // Confidence Weighting
      const confidenceWeightedScore = scores.reduce((sum, score, index) => {
        const weight = weights[score.method] || 1 / scores.length;
        const confidenceWeight = score.confidence * weight;
        return sum + (score.score * confidenceWeight);
      }, 0);

      // Bayesian Fusion
      const bayesianScore = await this.bayesianFusion(scores, weights);

      // Meta-Learning Ensemble
      const metaScore = await this.metaLearningEnsemble(scores, weights);

      // Final Fusion
      const finalScore = this.combineMethods([
        { method: 'weighted', score: weightedScore, weight: 0.3 },
        { method: 'confidence', score: confidenceWeightedScore, weight: 0.3 },
        { method: 'bayesian', score: bayesianScore, weight: 0.2 },
        { method: 'meta', score: metaScore, weight: 0.2 }
      ]);

      return {
        score: finalScore,
        confidence: this.calculateOverallConfidence(scores),
        attribution: this.getTopAttributions(scores),
        method: 'ensemble_fusion'
      };
    } catch (error) {
      logger.error('Ensemble fusion failed', error as Error);
      throw error;
    }
  }

  private async bayesianFusion(scores: ScoreResult[], weights: Record<string, number>): Promise<number> {
    const prior = 0.5; // Neutral prior
    const likelihood = scores.reduce((acc, score) => {
      const weight = weights[score.method] || 1 / scores.length;
      return acc * Math.pow(score.score, weight);
    }, 1);

    const posterior = (likelihood * prior) / 
      (likelihood * prior + (1 - likelihood) * (1 - prior));

    return posterior;
  }

  private async metaLearningEnsemble(scores: ScoreResult[], weights: Record<string, number>): Promise<number> {
    // Simple meta-learning based on historical performance
    const metaFeatures = {
      scores: scores.map(s => s.score),
      confidences: scores.map(s => s.confidence),
      weights: Object.values(weights),
      timestamp: Date.now()
    };

    // Simple meta-model (in production, this would be a trained model)
    const metaScore = scores.reduce((sum, score, index) => {
      const weight = weights[score.method] || 1 / scores.length;
      const confidenceWeight = score.confidence * weight;
      return sum + (score.score * confidenceWeight);
    }, 0);

    return metaScore;
  }

  private combineMethods(methods: Array<{ method: string; score: number; weight: number }>): number {
    const totalWeight = methods.reduce((sum, method) => sum + method.weight, 0);
    const weightedSum = methods.reduce((sum, method) => sum + (method.score * method.weight), 0);
    
    return weightedSum / totalWeight;
  }

  private calculateOverallConfidence(scores: ScoreResult[]): number {
    const totalConfidence = scores.reduce((sum, score) => sum + score.confidence, 0);
    return totalConfidence / scores.length;
  }

  private getTopAttributions(scores: ScoreResult[]): any {
    const allFactors = scores.flatMap(score => score.attribution.topFactors);
    const factorMap = new Map<string, number>();

    for (const factor of allFactors) {
      const key = factor.factor;
      const current = factorMap.get(key) || 0;
      factorMap.set(key, current + factor.contribution);
    }

    const topFactors = Array.from(factorMap.entries())
      .map(([factor, contribution]) => ({ factor, contribution, direction: 'positive' }))
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, 5);

    return {
      topFactors,
      explanation: `Ensemble fusion based on ${scores.length} models`,
      confidence: this.calculateOverallConfidence(scores)
    };
  }
}

// Main Lambda Handler
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const startTime = Date.now();
  let processedSignals = 0;
  let errors = 0;

  try {
    // Input validation
    const requestBody = ScoringRequestSchema.parse(JSON.parse(event.body || '{}'));
    
    logger.info('Scoring started', {
      signalCount: requestBody.signals.length,
      agentId: requestBody.agentId,
      userId: requestBody.userId
    });

    // Load API credentials
    const secrets = await aws.getSecret(process.env.SECRETS_MANAGER_SECRET_ID || 'ai-investment-secrets');
    
    // Initialize LLM adapter
    const llm = new LLMAdapter({
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 1000,
      timeout: 30,
      apiKey: secrets.openai_api_key
    });

    // Initialize models
    const sentimentModel = new SentimentModel(llm);
    const relevanceModel = new RelevanceModel(llm);
    const noveltyModel = new NoveltyModel(llm);
    const credibilityModel = new CredibilityModel(llm);
    const viralityModel = new ViralityModel(llm);
    const ensembleFusion = new EnsembleFusion();

    // Process each signal
    const scoredSignals = [];
    
    for (const signal of requestBody.signals) {
      try {
        // Extract features
        const features = await extractFeatures(signal);
        
        // Run models in parallel
        const [sentimentResult, relevanceResult, noveltyResult, credibilityResult, viralityResult] = await Promise.all([
          sentimentModel.predict(features),
          relevanceModel.predict(features),
          noveltyModel.predict(features),
          credibilityModel.predict(features),
          viralityModel.predict(features)
        ]);

        // Ensemble fusion
        const weights = {
          sentiment_model: 0.25,
          relevance_model: 0.25,
          novelty_model: 0.2,
          credibility_model: 0.2,
          virality_model: 0.1
        };

        const fusedScore = await ensembleFusion.fuse([
          sentimentResult,
          relevanceResult,
          noveltyResult,
          credibilityResult,
          viralityResult
        ], weights);

        // Create scored signal
        const scoredSignal = {
          ...signal,
          scores: {
            sentiment: sentimentResult.score,
            relevance: relevanceResult.score,
            novelty: noveltyResult.score,
            credibility: credibilityResult.score,
            virality: viralityResult.score,
            fused: fusedScore.score
          },
          confidences: {
            sentiment: sentimentResult.confidence,
            relevance: relevanceResult.confidence,
            novelty: noveltyResult.confidence,
            credibility: credibilityResult.confidence,
            virality: viralityResult.confidence,
            fused: fusedScore.confidence
          },
          attributions: {
            sentiment: sentimentResult.attribution,
            relevance: relevanceResult.attribution,
            novelty: noveltyResult.attribution,
            credibility: credibilityResult.attribution,
            virality: viralityResult.attribution,
            fused: fusedScore.attribution
          },
          scoredAt: TimeUtils.now().toISOString(),
          agentId: requestBody.agentId
        };

        scoredSignals.push(scoredSignal);
        processedSignals++;

      } catch (error) {
        logger.error(`Failed to score signal ${signal.id}`, error as Error, { signalId: signal.id });
        errors++;
      }
    }

    // Store scored signals in DynamoDB
    if (scoredSignals.length > 0) {
      await aws.dynamoBatchWrite(process.env.SIGNALS_TABLE_NAME || 'ai-investment-signals', scoredSignals);
      
      // Store features in S3
      const featuresData = {
        timestamp: TimeUtils.now().toISOString(),
        agentId: requestBody.agentId,
        signals: scoredSignals,
        metadata: {
          processedSignals,
          errors,
          duration: Date.now() - startTime
        }
      };
      
      const s3Key = `features/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${new Date().getDate().toString().padStart(2, '0')}/${new Date().getHours().toString().padStart(2, '0')}/${HashUtils.generateId()}.json`;
      
      await aws.s3Upload(
        process.env.FEATURES_BUCKET || 'ai-investment-features',
        s3Key,
        JSON.stringify(featuresData)
      );
    }

    const duration = Date.now() - startTime;
    logger.info('Scoring completed', {
      processedSignals,
      errors,
      duration,
      userId: requestBody.userId
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
          signalsProcessed: processedSignals,
          errors,
          duration,
          timestamp: TimeUtils.now().toISOString()
        }
      })
    };

  } catch (error) {
    logger.error('Scoring failed', error as Error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        ok: false,
        error: 'Scoring failed',
        details: error.message
      })
    };
  }
};

// Extract features from signal
async function extractFeatures(signal: any): Promise<FeatureVector> {
  return {
    asset: signal.asset,
    content: signal.content,
    source: signal.source,
    timestamp: signal.timestamp,
    sentiment: signal.sentiment || 0,
    relevance: signal.relevance || 0,
    novelty: signal.novelty || 0,
    credibility: signal.credibility || 0,
    entities: signal.entities || [],
    language: signal.language || 'en',
    metadata: signal.metadata || {}
  };
}
