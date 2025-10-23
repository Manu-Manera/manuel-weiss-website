import OpenAI from 'openai';
import { LLMConfig } from './types';
import { logger } from './logger';

export class LLMAdapter {
  private client: OpenAI;
  private config: LLMConfig;
  private costTracker: Map<string, number> = new Map();

  constructor(config: LLMConfig) {
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.apiKey || process.env['OPENAI_API_KEY'],
      timeout: config.timeout * 1000 // Convert to milliseconds
    });
  }

  /**
   * Generate text using LLM
   */
  async generateText(prompt: string, options?: Partial<LLMConfig>): Promise<string> {
    const startTime = Date.now();
    let tokensUsed = 0;
    let cost = 0;

    try {
      const response = await this.client.chat.completions.create({
        model: options?.model || this.config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature || this.config.temperature,
        max_tokens: options?.maxTokens || this.config.maxTokens
      });

      const content = response.choices[0]?.message?.content || '';
      tokensUsed = response.usage?.total_tokens || 0;
      cost = this.calculateCost(tokensUsed, this.config.model);

      // Track cost
      this.trackCost('generateText', tokensUsed, cost);

      const duration = Date.now() - startTime;
      logger.performanceMeasured('llm_generate_text', duration, process.memoryUsage().heapUsed);

      return content;
    } catch (error) {
      logger.error('LLM generation failed', error as Error, {
        prompt: prompt.substring(0, 100),
        model: this.config.model,
        tokensUsed,
        cost
      });
      throw new Error(`LLM generation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Generate text with system prompt
   */
  async generateTextWithSystem(systemPrompt: string, userPrompt: string, options?: Partial<LLMConfig>): Promise<string> {
    const startTime = Date.now();
    let tokensUsed = 0;
    let cost = 0;

    try {
      const response = await this.client.chat.completions.create({
        model: options?.model || this.config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: options?.temperature || this.config.temperature,
        max_tokens: options?.maxTokens || this.config.maxTokens
      });

      const content = response.choices[0]?.message?.content || '';
      tokensUsed = response.usage?.total_tokens || 0;
      cost = this.calculateCost(tokensUsed, this.config.model);

      this.trackCost('generateTextWithSystem', tokensUsed, cost);

      const duration = Date.now() - startTime;
      logger.performanceMeasured('llm_generate_text_with_system', duration, process.memoryUsage().heapUsed);

      return content;
    } catch (error) {
      logger.error('LLM generation with system failed', error as Error, {
        systemPrompt: systemPrompt.substring(0, 100),
        userPrompt: userPrompt.substring(0, 100),
        model: this.config.model,
        tokensUsed,
        cost
      });
      throw new Error(`LLM generation with system failed: ${(error as Error).message}`);
    }
  }

  /**
   * Generate embedding
   */
  async generateEmbedding(text: string, model: string = 'text-embedding-ada-002'): Promise<number[]> {
    const startTime = Date.now();
    let tokensUsed = 0;
    let cost = 0;

    try {
      const response = await this.client.embeddings.create({
        model,
        input: text
      });

      const embedding = response.data[0]?.embedding || [];
      tokensUsed = response.usage?.total_tokens || 0;
      cost = this.calculateCost(tokensUsed, model);

      this.trackCost('generateEmbedding', tokensUsed, cost);

      const duration = Date.now() - startTime;
      logger.performanceMeasured('llm_generate_embedding', duration, process.memoryUsage().heapUsed);

      return embedding;
    } catch (error) {
      logger.error('LLM embedding generation failed', error as Error, {
        text: text.substring(0, 100),
        model,
        tokensUsed,
        cost
      });
      throw new Error(`LLM embedding generation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Analyze sentiment
   */
  async analyzeSentiment(text: string): Promise<number> {
    const prompt = `Analyze the sentiment of the following text and return only a number between -1 (very negative) and 1 (very positive):

Text: "${text}"

Sentiment score:`;

    try {
      const response = await this.generateText(prompt);
      const score = parseFloat(response.trim());
      
      if (isNaN(score) || score < -1 || score > 1) {
        throw new Error('Invalid sentiment score');
      }
      
      return score;
    } catch (error) {
      logger.error('Sentiment analysis failed', error as Error, {
        text: text.substring(0, 100)
      });
      throw new Error(`Sentiment analysis failed: ${(error as Error).message}`);
    }
  }

  /**
   * Extract entities
   */
  async extractEntities(text: string): Promise<string[]> {
    const prompt = `Extract all relevant entities (people, companies, cryptocurrencies, stocks, etc.) from the following text. Return only a comma-separated list of entities:

Text: "${text}"

Entities:`;

    try {
      const response = await this.generateText(prompt);
      return response.split(',').map(entity => entity.trim()).filter(entity => entity.length > 0);
    } catch (error) {
      logger.error('Entity extraction failed', error as Error, {
        text: text.substring(0, 100)
      });
      throw new Error(`Entity extraction failed: ${(error as Error).message}`);
    }
  }

  /**
   * Classify text
   */
  async classifyText(text: string, categories: string[]): Promise<string> {
    const prompt = `Classify the following text into one of these categories: ${categories.join(', ')}

Text: "${text}"

Category:`;

    try {
      const response = await this.generateText(prompt);
      const category = response.trim();
      
      if (!categories.includes(category)) {
        throw new Error('Invalid category');
      }
      
      return category;
    } catch (error) {
      logger.error('Text classification failed', error as Error, {
        text: text.substring(0, 100),
        categories
      });
      throw new Error(`Text classification failed: ${(error as Error).message}`);
    }
  }

  /**
   * Summarize text
   */
  async summarizeText(text: string, maxLength: number = 200): Promise<string> {
    const prompt = `Summarize the following text in maximum ${maxLength} characters:

Text: "${text}"

Summary:`;

    try {
      const response = await this.generateText(prompt);
      return response.trim();
    } catch (error) {
      logger.error('Text summarization failed', error as Error, {
        text: text.substring(0, 100),
        maxLength
      });
      throw new Error(`Text summarization failed: ${(error as Error).message}`);
    }
  }

  /**
   * Translate text
   */
  async translateText(text: string, targetLanguage: string): Promise<string> {
    const prompt = `Translate the following text to ${targetLanguage}:

Text: "${text}"

Translation:`;

    try {
      const response = await this.generateText(prompt);
      return response.trim();
    } catch (error) {
      logger.error('Text translation failed', error as Error, {
        text: text.substring(0, 100),
        targetLanguage
      });
      throw new Error(`Text translation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Generate structured data
   */
  async generateStructuredData<T>(prompt: string, schema: any): Promise<T> {
    const systemPrompt = `You are a helpful assistant that generates structured data. Always return valid JSON that matches the provided schema.`;
    const userPrompt = `${prompt}

Return the data as JSON that matches this schema:
${JSON.stringify(schema, null, 2)}`;

    try {
      const response = await this.generateTextWithSystem(systemPrompt, userPrompt);
      const data = JSON.parse(response);
      
      // Validate against schema (basic validation)
      if (typeof data !== 'object' || data === null) {
        throw new Error('Invalid JSON response');
      }
      
      return data as T;
    } catch (error) {
      logger.error('Structured data generation failed', error as Error, {
        prompt: prompt.substring(0, 100),
        schema
      });
      throw new Error(`Structured data generation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Calculate cost based on tokens and model
   */
  private calculateCost(tokens: number, model: string): number {
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-3.5-turbo': { input: 0.001, output: 0.002 },
      'text-embedding-ada-002': { input: 0.0001, output: 0 }
    };

    const modelPricing = pricing[model] || pricing['gpt-3.5-turbo'] || { input: 0.0015, output: 0.002 };
    return tokens * modelPricing.input / 1000; // Cost per 1K tokens
  }

  /**
   * Track cost for operations
   */
  private trackCost(operation: string, tokens: number, cost: number): void {
    const key = `${operation}_${new Date().toISOString().split('T')[0]}`;
    const currentCost = this.costTracker.get(key) || 0;
    this.costTracker.set(key, currentCost + cost);
    
    logger.costTracked(operation, tokens, cost);
  }

  /**
   * Get cost summary
   */
  getCostSummary(): Record<string, number> {
    const summary: Record<string, number> = {};
    for (const [key, cost] of this.costTracker.entries()) {
      summary[key] = cost;
    }
    return summary;
  }

  /**
   * Reset cost tracking
   */
  resetCostTracking(): void {
    this.costTracker.clear();
  }

  /**
   * Get total cost
   */
  getTotalCost(): number {
    return Array.from(this.costTracker.values()).reduce((sum, cost) => sum + cost, 0);
  }
}
