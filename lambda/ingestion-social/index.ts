import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { 
  AWSHelpers, 
  SocialIngestionRequestSchema, 
  SignalSchema,
  Logger,
  TimeUtils,
  HashUtils
} from '/opt/nodejs/index.js';

// AWS Configuration
const awsConfig = {
  region: process.env.AWS_REGION || 'eu-central-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};

const aws = new AWSHelpers(awsConfig);

// Initialize logger
const logger = new Logger({ module: 'ingestion-social' });

// Twitter API Client
class TwitterClient {
  private bearerToken: string;
  private baseUrl = 'https://api.twitter.com/2';

  constructor(bearerToken: string) {
    this.bearerToken = bearerToken;
  }

  async searchTweets(query: string, maxResults: number = 100): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/tweets/search/recent`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          max_results: maxResults,
          'tweet.fields': 'created_at,public_metrics,context_annotations,entities',
          'user.fields': 'verified,public_metrics',
          expansions: 'author_id'
        })
      });

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status}`);
      }

      const data = await response.json() as any;
      return data.data || [];
    } catch (error) {
      logger.error('Twitter API search failed', error as Error, { query });
      throw error;
    }
  }

  async getUserTweets(userId: string, maxResults: number = 100): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/tweets`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          max_results: maxResults,
          'tweet.fields': 'created_at,public_metrics,context_annotations,entities'
        })
      });

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status}`);
      }

      const data = await response.json() as any;
      return data.data || [];
    } catch (error) {
      logger.error('Twitter API user tweets failed', error as Error, { userId });
      throw error;
    }
  }
}

// Reddit API Client
class RedditClient {
  private clientId: string;
  private clientSecret: string;
  private userAgent: string;
  private accessToken: string | null = null;

  constructor(clientId: string, clientSecret: string, userAgent: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.userAgent = userAgent;
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    try {
      const response = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': this.userAgent
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }

      const data = await response.json() as any;
      this.accessToken = data.access_token;
      return this.accessToken;
    } catch (error) {
      logger.error('Reddit API authentication failed', error as Error);
      throw error;
    }
  }

  async searchPosts(subreddit: string, query: string, limit: number = 100): Promise<any[]> {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(`https://oauth.reddit.com/r/${subreddit}/search`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': this.userAgent
        },
        body: JSON.stringify({
          q: query,
          limit,
          sort: 'new',
          t: 'day'
        })
      });

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }

      const data = await response.json() as any;
      return data.data?.children?.map((child: any) => child.data) || [];
    } catch (error) {
      logger.error('Reddit API search failed', error as Error, { subreddit, query });
      throw error;
    }
  }
}

// YouTube API Client
class YouTubeClient {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchVideos(query: string, maxResults: number = 50): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          part: 'snippet',
          q: query,
          maxResults,
          type: 'video',
          order: 'relevance',
          publishedAfter: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Last 24 hours
        })
      });

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json() as any;
      return data.items || [];
    } catch (error) {
      logger.error('YouTube API search failed', error as Error, { query });
      throw error;
    }
  }
}

// LinkedIn API Client
class LinkedInClient {
  private accessToken: string;
  private baseUrl = 'https://api.linkedin.com/v2';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async searchPosts(query: string, maxResults: number = 50): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/posts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: query,
          count: maxResults,
          sort: 'recent'
        })
      });

      if (!response.ok) {
        throw new Error(`LinkedIn API error: ${response.status}`);
      }

      const data = await response.json() as any;
      return data.elements || [];
    } catch (error) {
      logger.error('LinkedIn API search failed', error as Error, { query });
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
    const requestBody = SocialIngestionRequestSchema.parse(JSON.parse(event.body || '{}'));
    
    logger.info('Social ingestion started', {
      assets: requestBody.assets,
      timeframe: requestBody.timeframe,
      userId: requestBody.userId
    });

    // Load API credentials
    const secrets = await aws.getSecret(process.env.SECRETS_MANAGER_SECRET_ID || 'ai-investment-secrets');
    
    // Initialize API clients
    const twitterClient = new TwitterClient(secrets.twitter_bearer_token);
    const redditClient = new RedditClient(
      secrets.reddit_client_id,
      secrets.reddit_client_secret,
      secrets.reddit_user_agent
    );
    const youtubeClient = new YouTubeClient(secrets.youtube_api_key);
    const linkedinClient = new LinkedInClient(secrets.linkedin_access_token);

    // Process each asset
    const allSignals = [];
    
    for (const asset of requestBody.assets) {
      try {
        // Twitter data
        const twitterQuery = `${asset} OR #${asset} OR $${asset}`;
        const twitterTweets = await twitterClient.searchTweets(twitterQuery, 100);
        
        for (const tweet of twitterTweets) {
          const signal = await processTwitterTweet(tweet, asset);
          if (signal) {
            allSignals.push(signal);
            processedSignals++;
          }
        }

        // Reddit data
        const redditSubreddits = ['cryptocurrency', 'bitcoin', 'ethereum', 'investing', 'stocks'];
        for (const subreddit of redditSubreddits) {
          const redditPosts = await redditClient.searchPosts(subreddit, asset, 50);
          
          for (const post of redditPosts) {
            const signal = await processRedditPost(post, asset);
            if (signal) {
              allSignals.push(signal);
              processedSignals++;
            }
          }
        }

        // YouTube data
        const youtubeQuery = `${asset} analysis OR ${asset} news OR ${asset} price`;
        const youtubeVideos = await youtubeClient.searchVideos(youtubeQuery, 25);
        
        for (const video of youtubeVideos) {
          const signal = await processYouTubeVideo(video, asset);
          if (signal) {
            allSignals.push(signal);
            processedSignals++;
          }
        }

        // LinkedIn data
        const linkedinQuery = `${asset} investment OR ${asset} market`;
        const linkedinPosts = await linkedinClient.searchPosts(linkedinQuery, 25);
        
        for (const post of linkedinPosts) {
          const signal = await processLinkedInPost(post, asset);
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
      
      const s3Key = `raw/social/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${new Date().getDate().toString().padStart(2, '0')}/${new Date().getHours().toString().padStart(2, '0')}/${HashUtils.generateId()}.json`;
      
      await aws.s3Upload(
        process.env.RAW_DATA_BUCKET || 'ai-investment-raw-data',
        s3Key,
        JSON.stringify(rawData)
      );
    }

    const duration = Date.now() - startTime;
    logger.info('Social ingestion completed', {
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
    logger.error('Social ingestion failed', error as Error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        ok: false,
        error: 'Social ingestion failed',
        details: error.message
      })
    };
  }
};

// Process Twitter tweet
async function processTwitterTweet(tweet: any, asset: string): Promise<any | null> {
  try {
    const content = tweet.text || '';
    const timestamp = new Date(tweet.created_at);
    
    // Basic filtering
    if (content.length < 10) return null;
    
    // Extract entities
    const entities = extractEntities(content);
    if (!entities.includes(asset.toUpperCase())) return null;
    
    // Calculate basic scores
    const sentiment = calculateSentiment(content);
    const relevance = calculateRelevance(content, asset);
    const novelty = calculateNovelty(content);
    const credibility = calculateCredibility(tweet);
    
    return {
      id: HashUtils.generateId(),
      asset: asset.toUpperCase(),
      timestamp,
      source: 'twitter',
      content,
      sentiment,
      relevance,
      novelty,
      credibility,
      entities,
      language: detectLanguage(content),
      metadata: {
        tweetId: tweet.id,
        authorId: tweet.author_id,
        publicMetrics: tweet.public_metrics,
        contextAnnotations: tweet.context_annotations
      }
    };
  } catch (error) {
    logger.error('Failed to process Twitter tweet', error as Error, { tweetId: tweet.id });
    return null;
  }
}

// Process Reddit post
async function processRedditPost(post: any, asset: string): Promise<any | null> {
  try {
    const content = post.selftext || post.title || '';
    const timestamp = new Date(post.created_utc * 1000);
    
    // Basic filtering
    if (content.length < 10) return null;
    
    // Extract entities
    const entities = extractEntities(content);
    if (!entities.includes(asset.toUpperCase())) return null;
    
    // Calculate basic scores
    const sentiment = calculateSentiment(content);
    const relevance = calculateRelevance(content, asset);
    const novelty = calculateNovelty(content);
    const credibility = calculateCredibility(post);
    
    return {
      id: HashUtils.generateId(),
      asset: asset.toUpperCase(),
      timestamp,
      source: 'reddit',
      content,
      sentiment,
      relevance,
      novelty,
      credibility,
      entities,
      language: detectLanguage(content),
      metadata: {
        postId: post.id,
        subreddit: post.subreddit,
        author: post.author,
        score: post.score,
        numComments: post.num_comments
      }
    };
  } catch (error) {
    logger.error('Failed to process Reddit post', error as Error, { postId: post.id });
    return null;
  }
}

// Process YouTube video
async function processYouTubeVideo(video: any, asset: string): Promise<any | null> {
  try {
    const content = video.snippet?.description || video.snippet?.title || '';
    const timestamp = new Date(video.snippet?.publishedAt);
    
    // Basic filtering
    if (content.length < 10) return null;
    
    // Extract entities
    const entities = extractEntities(content);
    if (!entities.includes(asset.toUpperCase())) return null;
    
    // Calculate basic scores
    const sentiment = calculateSentiment(content);
    const relevance = calculateRelevance(content, asset);
    const novelty = calculateNovelty(content);
    const credibility = calculateCredibility(video);
    
    return {
      id: HashUtils.generateId(),
      asset: asset.toUpperCase(),
      timestamp,
      source: 'youtube',
      content,
      sentiment,
      relevance,
      novelty,
      credibility,
      entities,
      language: detectLanguage(content),
      metadata: {
        videoId: video.id?.videoId,
        channelId: video.snippet?.channelId,
        channelTitle: video.snippet?.channelTitle,
        viewCount: video.statistics?.viewCount,
        likeCount: video.statistics?.likeCount
      }
    };
  } catch (error) {
    logger.error('Failed to process YouTube video', error as Error, { videoId: video.id?.videoId });
    return null;
  }
}

// Process LinkedIn post
async function processLinkedInPost(post: any, asset: string): Promise<any | null> {
  try {
    const content = post.text || '';
    const timestamp = new Date(post.createdAt);
    
    // Basic filtering
    if (content.length < 10) return null;
    
    // Extract entities
    const entities = extractEntities(content);
    if (!entities.includes(asset.toUpperCase())) return null;
    
    // Calculate basic scores
    const sentiment = calculateSentiment(content);
    const relevance = calculateRelevance(content, asset);
    const novelty = calculateNovelty(content);
    const credibility = calculateCredibility(post);
    
    return {
      id: HashUtils.generateId(),
      asset: asset.toUpperCase(),
      timestamp,
      source: 'linkedin',
      content,
      sentiment,
      relevance,
      novelty,
      credibility,
      entities,
      language: detectLanguage(content),
      metadata: {
        postId: post.id,
        authorId: post.author,
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        shareCount: post.shareCount
      }
    };
  } catch (error) {
    logger.error('Failed to process LinkedIn post', error as Error, { postId: post.id });
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
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'bullish', 'up', 'rise', 'gain', 'profit', 'success'];
  const negativeWords = ['bad', 'terrible', 'awful', 'bearish', 'down', 'fall', 'loss', 'crash', 'fail', 'danger'];
  
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
  if (textLower.includes(`#${assetLower}`)) relevance += 0.2;
  if (textLower.includes('price') || textLower.includes('market')) relevance += 0.1;
  if (textLower.includes('analysis') || textLower.includes('prediction')) relevance += 0.1;
  if (textLower.includes('news') || textLower.includes('update')) relevance += 0.1;
  
  return Math.min(1, relevance);
}

function calculateNovelty(text: string): number {
  // Simple novelty calculation based on text length and uniqueness
  const words = text.split(/\s+/);
  const uniqueWords = new Set(words);
  const uniqueness = uniqueWords.size / words.length;
  
  return Math.min(1, uniqueness * 0.5 + (text.length > 100 ? 0.3 : 0.1));
}

function calculateCredibility(source: any): number {
  let credibility = 0.5; // Base credibility
  
  // Twitter credibility
  if (source.public_metrics) {
    const followers = source.public_metrics.followers_count || 0;
    const verified = source.verified || false;
    
    if (verified) credibility += 0.2;
    if (followers > 10000) credibility += 0.1;
    if (followers > 100000) credibility += 0.1;
  }
  
  // Reddit credibility
  if (source.score !== undefined) {
    const score = source.score || 0;
    if (score > 10) credibility += 0.1;
    if (score > 100) credibility += 0.1;
  }
  
  // YouTube credibility
  if (source.statistics) {
    const viewCount = parseInt(source.statistics.viewCount || '0');
    const likeCount = parseInt(source.statistics.likeCount || '0');
    
    if (viewCount > 1000) credibility += 0.1;
    if (likeCount > 100) credibility += 0.1;
  }
  
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
