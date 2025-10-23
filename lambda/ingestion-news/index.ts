import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AWSHelpers } from '@ai-investment/common';
import { NewsIngestionRequestSchema, SignalSchema } from '@ai-investment/common';
import { logger } from '@ai-investment/common';
import { TimeUtils } from '@ai-investment/common';
import { HashUtils } from '@ai-investment/common';

// AWS Configuration
const awsConfig = {
  region: process.env.AWS_REGION || 'eu-central-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};

const aws = new AWSHelpers(awsConfig);

// News API Client
class NewsAPIClient {
  private apiKey: string;
  private baseUrl = 'https://newsapi.org/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getTopHeadlines(category: string, country: string = 'us', pageSize: number = 100): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/top-headlines`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category,
          country,
          pageSize,
          sortBy: 'publishedAt'
        })
      });

      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`);
      }

      const data = await response.json();
      return data.articles || [];
    } catch (error) {
      logger.error('News API top headlines failed', error as Error, { category });
      throw error;
    }
  }

  async searchEverything(query: string, from: string, to: string, pageSize: number = 100): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/everything`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: query,
          from,
          to,
          pageSize,
          sortBy: 'publishedAt',
          language: 'en'
        })
      });

      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`);
      }

      const data = await response.json();
      return data.articles || [];
    } catch (error) {
      logger.error('News API search failed', error as Error, { query });
      throw error;
    }
  }
}

// Reuters API Client
class ReutersClient {
  private apiKey: string;
  private baseUrl = 'https://api.reuters.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getBusinessNews(limit: number = 100): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/news/business`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          limit,
          sort: 'newest'
        })
      });

      if (!response.ok) {
        throw new Error(`Reuters API error: ${response.status}`);
      }

      const data = await response.json();
      return data.articles || [];
    } catch (error) {
      logger.error('Reuters API business news failed', error as Error);
      throw error;
    }
  }
}

// Bloomberg API Client
class BloombergClient {
  private apiKey: string;
  private baseUrl = 'https://api.bloomberg.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getMarketNews(limit: number = 100): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/news/market`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          limit,
          sort: 'newest'
        })
      });

      if (!response.ok) {
        throw new Error(`Bloomberg API error: ${response.status}`);
      }

      const data = await response.json();
      return data.articles || [];
    } catch (error) {
      logger.error('Bloomberg API market news failed', error as Error);
      throw error;
    }
  }
}

// Financial Times API Client
class FinancialTimesClient {
  private apiKey: string;
  private baseUrl = 'https://api.ft.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getFinancialNews(limit: number = 100): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/content`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          limit,
          sort: 'newest',
          categories: ['financial', 'markets', 'economy']
        })
      });

      if (!response.ok) {
        throw new Error(`Financial Times API error: ${response.status}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      logger.error('Financial Times API financial news failed', error as Error);
      throw error;
    }
  }
}

// Wall Street Journal API Client
class WSJClient {
  private apiKey: string;
  private baseUrl = 'https://api.wsj.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getMarketNews(limit: number = 100): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/news/market`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          limit,
          sort: 'newest'
        })
      });

      if (!response.ok) {
        throw new Error(`WSJ API error: ${response.status}`);
      }

      const data = await response.json();
      return data.articles || [];
    } catch (error) {
      logger.error('WSJ API market news failed', error as Error);
      throw error;
    }
  }
}

// SEC Filings API Client
class SECClient {
  private baseUrl = 'https://api.sec.gov/v1';

  async getRecentFilings(limit: number = 100): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/filings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AI Investment System (contact@example.com)'
        },
        body: JSON.stringify({
          limit,
          sort: 'newest',
          formTypes: ['10-K', '10-Q', '8-K', 'DEF 14A']
        })
      });

      if (!response.ok) {
        throw new Error(`SEC API error: ${response.status}`);
      }

      const data = await response.json();
      return data.filings || [];
    } catch (error) {
      logger.error('SEC API recent filings failed', error as Error);
      throw error;
    }
  }
}

// Main Lambda Handler
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const startTime = Date.now();
  let processedSignals = 0;
  let errors = 0;

  try {
    // Input validation
    const requestBody = NewsIngestionRequestSchema.parse(JSON.parse(event.body || '{}'));
    
    logger.info('News ingestion started', {
      assets: requestBody.assets,
      timeframe: requestBody.timeframe,
      userId: requestBody.userId
    });

    // Load API credentials
    const secrets = await aws.getSecret(process.env.SECRETS_MANAGER_SECRET_ID || 'ai-investment-secrets');
    
    // Initialize API clients
    const newsAPIClient = new NewsAPIClient(secrets.news_api_key);
    const reutersClient = new ReutersClient(secrets.reuters_api_key);
    const bloombergClient = new BloombergClient(secrets.bloomberg_api_key);
    const ftClient = new FinancialTimesClient(secrets.ft_api_key);
    const wsjClient = new WSJClient(secrets.wsj_api_key);
    const secClient = new SECClient();

    // Process each asset
    const allSignals = [];
    
    for (const asset of requestBody.assets) {
      try {
        // News API - Top headlines
        const newsAPIArticles = await newsAPIClient.getTopHeadlines('business', 'us', 50);
        
        for (const article of newsAPIArticles) {
          const signal = await processNewsArticle(article, asset, 'newsapi');
          if (signal) {
            allSignals.push(signal);
            processedSignals++;
          }
        }

        // News API - Search everything
        const fromDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const toDate = new Date().toISOString().split('T')[0];
        const searchQuery = `${asset} OR ${asset} stock OR ${asset} market OR ${asset} price`;
        const searchArticles = await newsAPIClient.searchEverything(searchQuery, fromDate, toDate, 50);
        
        for (const article of searchArticles) {
          const signal = await processNewsArticle(article, asset, 'newsapi');
          if (signal) {
            allSignals.push(signal);
            processedSignals++;
          }
        }

        // Reuters API
        const reutersArticles = await reutersClient.getBusinessNews(50);
        
        for (const article of reutersArticles) {
          const signal = await processNewsArticle(article, asset, 'reuters');
          if (signal) {
            allSignals.push(signal);
            processedSignals++;
          }
        }

        // Bloomberg API
        const bloombergArticles = await bloombergClient.getMarketNews(50);
        
        for (const article of bloombergArticles) {
          const signal = await processNewsArticle(article, asset, 'bloomberg');
          if (signal) {
            allSignals.push(signal);
            processedSignals++;
          }
        }

        // Financial Times API
        const ftArticles = await ftClient.getFinancialNews(50);
        
        for (const article of ftArticles) {
          const signal = await processNewsArticle(article, asset, 'ft');
          if (signal) {
            allSignals.push(signal);
            processedSignals++;
          }
        }

        // Wall Street Journal API
        const wsjArticles = await wsjClient.getMarketNews(50);
        
        for (const article of wsjArticles) {
          const signal = await processNewsArticle(article, asset, 'wsj');
          if (signal) {
            allSignals.push(signal);
            processedSignals++;
          }
        }

        // SEC Filings
        const secFilings = await secClient.getRecentFilings(50);
        
        for (const filing of secFilings) {
          const signal = await processSECFiling(filing, asset);
          if (signal) {
            allSignals.push(signal);
            processedSignals++;
          }
        }

      } catch (error) {
        logger.error(`Failed to process asset ${asset}`, error as Error, { asset });
        errors++;
      }
    }

    // Store signals in DynamoDB
    if (allSignals.length > 0) {
      await aws.dynamoBatchWrite(process.env.SIGNALS_TABLE_NAME || 'ai-investment-signals', allSignals);
      
      // Store raw data in S3
      const rawData = {
        timestamp: TimeUtils.now().toISOString(),
        assets: requestBody.assets,
        signals: allSignals,
        metadata: {
          processedSignals,
          errors,
          duration: Date.now() - startTime
        }
      };
      
      const s3Key = `raw/news/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${new Date().getDate().toString().padStart(2, '0')}/${new Date().getHours().toString().padStart(2, '0')}/${HashUtils.generateId()}.json`;
      
      await aws.s3Upload(
        process.env.RAW_DATA_BUCKET || 'ai-investment-raw-data',
        s3Key,
        JSON.stringify(rawData)
      );
    }

    const duration = Date.now() - startTime;
    logger.info('News ingestion completed', {
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
    logger.error('News ingestion failed', error as Error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        ok: false,
        error: 'News ingestion failed',
        details: error.message
      })
    };
  }
};

// Process news article
async function processNewsArticle(article: any, asset: string, source: string): Promise<any | null> {
  try {
    const content = article.content || article.description || article.title || '';
    const timestamp = new Date(article.publishedAt || article.pubDate || Date.now());
    
    // Basic filtering
    if (content.length < 10) return null;
    
    // Extract entities
    const entities = extractEntities(content);
    if (!entities.includes(asset.toUpperCase())) return null;
    
    // Calculate basic scores
    const sentiment = calculateSentiment(content);
    const relevance = calculateRelevance(content, asset);
    const novelty = calculateNovelty(content);
    const credibility = calculateCredibility(article, source);
    
    return {
      id: HashUtils.generateId(),
      asset: asset.toUpperCase(),
      timestamp,
      source: 'news',
      content,
      sentiment,
      relevance,
      novelty,
      credibility,
      entities,
      language: detectLanguage(content),
      metadata: {
        articleId: article.id || article.url,
        title: article.title,
        url: article.url,
        source: source,
        author: article.author,
        publishedAt: article.publishedAt
      }
    };
  } catch (error) {
    logger.error('Failed to process news article', error as Error, { articleId: article.id });
    return null;
  }
}

// Process SEC filing
async function processSECFiling(filing: any, asset: string): Promise<any | null> {
  try {
    const content = filing.description || filing.title || '';
    const timestamp = new Date(filing.filingDate || Date.now());
    
    // Basic filtering
    if (content.length < 10) return null;
    
    // Extract entities
    const entities = extractEntities(content);
    if (!entities.includes(asset.toUpperCase())) return null;
    
    // Calculate basic scores
    const sentiment = calculateSentiment(content);
    const relevance = calculateRelevance(content, asset);
    const novelty = calculateNovelty(content);
    const credibility = 0.9; // SEC filings are highly credible
    
    return {
      id: HashUtils.generateId(),
      asset: asset.toUpperCase(),
      timestamp,
      source: 'news',
      content,
      sentiment,
      relevance,
      novelty,
      credibility,
      entities,
      language: 'en',
      metadata: {
        filingId: filing.id,
        formType: filing.formType,
        companyName: filing.companyName,
        filingDate: filing.filingDate,
        url: filing.url
      }
    };
  } catch (error) {
    logger.error('Failed to process SEC filing', error as Error, { filingId: filing.id });
    return null;
  }
}

// Helper functions
function extractEntities(text: string): string[] {
  const entities: string[] = [];
  const words = text.toUpperCase().split(/\s+/);
  
  // Common crypto symbols
  const cryptoSymbols = ['BTC', 'ETH', 'ADA', 'DOT', 'LINK', 'UNI', 'AAVE', 'COMP', 'MKR', 'SNX'];
  const stockSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'INTC'];
  
  for (const word of words) {
    if (cryptoSymbols.includes(word) || stockSymbols.includes(word)) {
      entities.push(word);
    }
  }
  
  return [...new Set(entities)];
}

function calculateSentiment(text: string): number {
  // Simple sentiment analysis based on keywords
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'bullish', 'up', 'rise', 'gain', 'profit', 'success', 'positive', 'strong', 'growth'];
  const negativeWords = ['bad', 'terrible', 'awful', 'bearish', 'down', 'fall', 'loss', 'crash', 'fail', 'danger', 'negative', 'weak', 'decline'];
  
  const words = text.toLowerCase().split(/\s+/);
  let score = 0;
  
  for (const word of words) {
    if (positiveWords.includes(word)) score += 0.1;
    if (negativeWords.includes(word)) score -= 0.1;
  }
  
  return Math.max(-1, Math.min(1, score));
}

function calculateRelevance(text: string, asset: string): number {
  const assetLower = asset.toLowerCase();
  const textLower = text.toLowerCase();
  
  let relevance = 0;
  if (textLower.includes(assetLower)) relevance += 0.3;
  if (textLower.includes(`$${assetLower}`)) relevance += 0.2;
  if (textLower.includes('price') || textLower.includes('market')) relevance += 0.1;
  if (textLower.includes('analysis') || textLower.includes('prediction')) relevance += 0.1;
  if (textLower.includes('news') || textLower.includes('update')) relevance += 0.1;
  if (textLower.includes('earnings') || textLower.includes('revenue')) relevance += 0.1;
  if (textLower.includes('merger') || textLower.includes('acquisition')) relevance += 0.1;
  
  return Math.min(1, relevance);
}

function calculateNovelty(text: string): number {
  // Simple novelty calculation based on text length and uniqueness
  const words = text.split(/\s+/);
  const uniqueWords = new Set(words);
  const uniqueness = uniqueWords.size / words.length;
  
  return Math.min(1, uniqueness * 0.5 + (text.length > 100 ? 0.3 : 0.1));
}

function calculateCredibility(article: any, source: string): number {
  let credibility = 0.5; // Base credibility
  
  // Source credibility
  const sourceCredibility: Record<string, number> = {
    'reuters': 0.9,
    'bloomberg': 0.9,
    'ft': 0.9,
    'wsj': 0.9,
    'newsapi': 0.7,
    'sec': 0.95
  };
  
  credibility = sourceCredibility[source] || 0.5;
  
  // Article credibility factors
  if (article.author && article.author.length > 0) credibility += 0.1;
  if (article.url && article.url.includes('reuters.com')) credibility += 0.1;
  if (article.url && article.url.includes('bloomberg.com')) credibility += 0.1;
  if (article.url && article.url.includes('ft.com')) credibility += 0.1;
  if (article.url && article.url.includes('wsj.com')) credibility += 0.1;
  
  return Math.min(1, credibility);
}

function detectLanguage(text: string): string {
  // Simple language detection based on common words
  const germanWords = ['der', 'die', 'das', 'und', 'oder', 'aber', 'nicht', 'ist', 'sind', 'haben'];
  const frenchWords = ['le', 'la', 'les', 'et', 'ou', 'mais', 'pas', 'est', 'sont', 'avoir'];
  const spanishWords = ['el', 'la', 'los', 'y', 'o', 'pero', 'no', 'es', 'son', 'tener'];
  const italianWords = ['il', 'la', 'i', 'e', 'o', 'ma', 'non', 'è', 'sono', 'avere'];
  
  const words = text.toLowerCase().split(/\s+/);
  
  let maxCount = 0;
  let detectedLang = 'en';
  
  const langCounts = {
    de: germanWords.filter(word => words.includes(word)).length,
    fr: frenchWords.filter(word => words.includes(word)).length,
    es: spanishWords.filter(word => words.includes(word)).length,
    it: italianWords.filter(word => words.includes(word)).length
  };
  
  for (const [lang, count] of Object.entries(langCounts)) {
    if (count > maxCount) {
      maxCount = count;
      detectedLang = lang;
    }
  }
  
  return detectedLang;
}
