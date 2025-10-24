# API Integration & Data Sources Improvements - Vollständige Spezifikation

## Additional Data Sources - Detaillierte Integration

### 1. Financial Data APIs - Vollständige Implementierung

#### Alpha Vantage Integration
```javascript
class AlphaVantageProvider {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://www.alphavantage.co/query';
        this.rateLimit = 5; // requests per minute for free tier
        this.requestQueue = [];
        this.isProcessing = false;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }
    
    async getRealTimeData(symbol) {
        const params = {
            function: 'GLOBAL_QUOTE',
            symbol: symbol,
            apikey: this.apiKey
        };
        
        return await this.makeRequest(params);
    }
    
    async getTechnicalIndicators(symbol, function_name, interval = 'daily', time_period = 14) {
        const cacheKey = `${symbol}_${function_name}_${interval}_${time_period}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        
        const params = {
            function: function_name,
            symbol: symbol,
            interval: interval,
            time_period: time_period,
            series_type: 'close',
            apikey: this.apiKey
        };
        
        const data = await this.makeRequest(params);
        
        this.cache.set(cacheKey, {
            data: data,
            timestamp: Date.now()
        });
        
        return data;
    }
    
    async getEconomicIndicators(function_name) {
        const params = {
            function: function_name,
            apikey: this.apiKey
        };
        
        return await this.makeRequest(params);
    }
    
    async makeRequest(params) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ params, resolve, reject });
            this.processQueue();
        });
    }
    
    async processQueue() {
        if (this.isProcessing || this.requestQueue.length === 0) return;
        
        this.isProcessing = true;
        
        while (this.requestQueue.length > 0) {
            const { params, resolve, reject } = this.requestQueue.shift();
            
            try {
                const url = new URL(this.baseUrl);
                Object.entries(params).forEach(([key, value]) => {
                    url.searchParams.append(key, value);
                });
                
                const response = await fetch(url);
                const data = await response.json();
                
                if (data['Error Message']) {
                    reject(new Error(data['Error Message']));
                } else if (data['Note']) {
                    reject(new Error('API call frequency limit exceeded'));
                } else {
                    resolve(data);
                }
                
                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 12000)); // 5 requests per minute
                
            } catch (error) {
                reject(error);
            }
        }
        
        this.isProcessing = false;
    }
}
```

#### Yahoo Finance Integration
```javascript
class YahooFinanceProvider {
    constructor() {
        this.baseUrl = 'https://query1.finance.yahoo.com/v8/finance/chart';
        this.rateLimit = 100; // requests per minute
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }
    
    async getRealTimeData(symbols) {
        const symbolsArray = Array.isArray(symbols) ? symbols : [symbols];
        const results = {};
        
        for (const symbol of symbolsArray) {
            try {
                const data = await this.getSymbolData(symbol);
                results[symbol] = data;
            } catch (error) {
                console.error(`Error fetching data for ${symbol}:`, error);
                results[symbol] = null;
            }
        }
        
        return results;
    }
    
    async getSymbolData(symbol) {
        const cacheKey = `realtime_${symbol}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        
        try {
            const url = `${this.baseUrl}/${symbol}`;
            const response = await fetch(url);
            const data = await response.json();
            
            const processedData = this.processYahooData(data);
            
            this.cache.set(cacheKey, {
                data: processedData,
                timestamp: Date.now()
            });
            
            return processedData;
        } catch (error) {
            console.error(`Yahoo Finance API error for ${symbol}:`, error);
            throw error;
        }
    }
    
    processYahooData(data) {
        const result = data.chart.result[0];
        const meta = result.meta;
        const quotes = result.indicators.quote[0];
        
        return {
            symbol: meta.symbol,
            currency: meta.currency,
            exchange: meta.exchangeName,
            timezone: meta.timezone,
            currentPrice: meta.regularMarketPrice,
            previousClose: meta.previousClose,
            open: meta.regularMarketOpen,
            high: meta.regularMarketDayHigh,
            low: meta.regularMarketDayLow,
            volume: meta.regularMarketVolume,
            marketCap: meta.marketCap,
            change: meta.regularMarketPrice - meta.previousClose,
            changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
            timestamp: new Date(meta.regularMarketTime * 1000)
        };
    }
}
```

#### CoinGecko Integration
```javascript
class CoinGeckoProvider {
    constructor() {
        this.baseUrl = 'https://api.coingecko.com/api/v3';
        this.rateLimit = 10; // requests per minute for free tier
        this.requestQueue = [];
        this.isProcessing = false;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }
    
    async getCryptoData(coinIds, vsCurrency = 'usd') {
        const cacheKey = `crypto_${coinIds.join(',')}_${vsCurrency}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        
        const params = {
            ids: Array.isArray(coinIds) ? coinIds.join(',') : coinIds,
            vs_currencies: vsCurrency,
            include_market_cap: true,
            include_24hr_vol: true,
            include_24hr_change: true,
            include_last_updated_at: true
        };
        
        const data = await this.makeRequest('simple/price', params);
        
        this.cache.set(cacheKey, {
            data: data,
            timestamp: Date.now()
        });
        
        return data;
    }
    
    async getCryptoHistory(coinId, days = 7, vsCurrency = 'usd') {
        const params = {
            vs_currency: vsCurrency,
            days: days,
            interval: days <= 1 ? 'hourly' : 'daily'
        };
        
        return await this.makeRequest(`coins/${coinId}/market_chart`, params);
    }
    
    async getTrendingCoins() {
        return await this.makeRequest('search/trending');
    }
    
    async makeRequest(endpoint, params = {}) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ endpoint, params, resolve, reject });
            this.processQueue();
        });
    }
    
    async processQueue() {
        if (this.isProcessing || this.requestQueue.length === 0) return;
        
        this.isProcessing = true;
        
        while (this.requestQueue.length > 0) {
            const { endpoint, params, resolve, reject } = this.requestQueue.shift();
            
            try {
                const url = new URL(`${this.baseUrl}/${endpoint}`);
                Object.entries(params).forEach(([key, value]) => {
                    url.searchParams.append(key, value);
                });
                
                const response = await fetch(url);
                const data = await response.json();
                
                if (data.error) {
                    reject(new Error(data.error));
                } else {
                    resolve(data);
                }
                
                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 6000)); // 10 requests per minute
                
            } catch (error) {
                reject(error);
            }
        }
        
        this.isProcessing = false;
    }
}
```

### 2. Social Media APIs - Vollständige Implementierung

#### Twitter API v2 Integration
```javascript
class TwitterAPIv2Provider {
    constructor(bearerToken) {
        this.bearerToken = bearerToken;
        this.baseUrl = 'https://api.twitter.com/2';
        this.rateLimit = 300; // requests per 15 minutes
        this.requestQueue = [];
        this.isProcessing = false;
    }
    
    async searchTweets(query, maxResults = 100) {
        const params = {
            query: query,
            max_results: maxResults,
            tweet.fields: 'created_at,public_metrics,context_annotations,entities',
            user.fields: 'username,verified,public_metrics',
            expansions: 'author_id,referenced_tweets.id'
        };
        
        return await this.makeRequest('tweets/search/recent', params);
    }
    
    async getUserTweets(userId, maxResults = 100) {
        const params = {
            max_results: maxResults,
            tweet.fields: 'created_at,public_metrics,context_annotations,entities',
            user.fields: 'username,verified,public_metrics'
        };
        
        return await this.makeRequest(`users/${userId}/tweets`, params);
    }
    
    async getTrendingHashtags(woeid = 1) {
        return await this.makeRequest('trends/place', { id: woeid });
    }
    
    async makeRequest(endpoint, params = {}) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ endpoint, params, resolve, reject });
            this.processQueue();
        });
    }
    
    async processQueue() {
        if (this.isProcessing || this.requestQueue.length === 0) return;
        
        this.isProcessing = true;
        
        while (this.requestQueue.length > 0) {
            const { endpoint, params, resolve, reject } = this.requestQueue.shift();
            
            try {
                const url = new URL(`${this.baseUrl}/${endpoint}`);
                Object.entries(params).forEach(([key, value]) => {
                    url.searchParams.append(key, value);
                });
                
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${this.bearerToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                const data = await response.json();
                
                if (data.errors) {
                    reject(new Error(JSON.stringify(data.errors)));
                } else {
                    resolve(data);
                }
                
                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 3000)); // 300 requests per 15 minutes
                
            } catch (error) {
                reject(error);
            }
        }
        
        this.isProcessing = false;
    }
}
```

#### Discord API Integration
```javascript
class DiscordAPIProvider {
    constructor(botToken) {
        this.botToken = botToken;
        this.baseUrl = 'https://discord.com/api/v10';
        this.rateLimit = 50; // requests per second
        this.requestQueue = [];
        this.isProcessing = false;
    }
    
    async getChannelMessages(channelId, limit = 100) {
        const params = {
            limit: limit
        };
        
        return await this.makeRequest(`channels/${channelId}/messages`, params);
    }
    
    async searchMessages(channelId, query) {
        const params = {
            content: query,
            limit: 100
        };
        
        return await this.makeRequest(`channels/${channelId}/messages/search`, params);
    }
    
    async getGuildChannels(guildId) {
        return await this.makeRequest(`guilds/${guildId}/channels`);
    }
    
    async makeRequest(endpoint, params = {}) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ endpoint, params, resolve, reject });
            this.processQueue();
        });
    }
    
    async processQueue() {
        if (this.isProcessing || this.requestQueue.length === 0) return;
        
        this.isProcessing = true;
        
        while (this.requestQueue.length > 0) {
            const { endpoint, params, resolve, reject } = this.requestQueue.shift();
            
            try {
                const url = new URL(`${this.baseUrl}/${endpoint}`);
                Object.entries(params).forEach(([key, value]) => {
                    url.searchParams.append(key, value);
                });
                
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bot ${this.botToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                const data = await response.json();
                
                if (data.code) {
                    reject(new Error(data.message));
                } else {
                    resolve(data);
                }
                
                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 20)); // 50 requests per second
                
            } catch (error) {
                reject(error);
            }
        }
        
        this.isProcessing = false;
    }
}
```

#### Telegram API Integration
```javascript
class TelegramAPIProvider {
    constructor(botToken) {
        this.botToken = botToken;
        this.baseUrl = `https://api.telegram.org/bot${botToken}`;
        this.rateLimit = 30; // requests per second
        this.requestQueue = [];
        this.isProcessing = false;
    }
    
    async getChannelMessages(channelId, limit = 100) {
        const params = {
            chat_id: channelId,
            limit: limit
        };
        
        return await this.makeRequest('getUpdates', params);
    }
    
    async searchMessages(channelId, query) {
        const params = {
            chat_id: channelId,
            text: query
        };
        
        return await this.makeRequest('getUpdates', params);
    }
    
    async getChannelInfo(channelId) {
        const params = {
            chat_id: channelId
        };
        
        return await this.makeRequest('getChat', params);
    }
    
    async makeRequest(method, params = {}) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ method, params, resolve, reject });
            this.processQueue();
        });
    }
    
    async processQueue() {
        if (this.isProcessing || this.requestQueue.length === 0) return;
        
        this.isProcessing = true;
        
        while (this.requestQueue.length > 0) {
            const { method, params, resolve, reject } = this.requestQueue.shift();
            
            try {
                const url = new URL(`${this.baseUrl}/${method}`);
                Object.entries(params).forEach(([key, value]) => {
                    url.searchParams.append(key, value);
                });
                
                const response = await fetch(url);
                const data = await response.json();
                
                if (!data.ok) {
                    reject(new Error(data.description));
                } else {
                    resolve(data.result);
                }
                
                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 33)); // 30 requests per second
                
            } catch (error) {
                reject(error);
            }
        }
        
        this.isProcessing = false;
    }
}
```

### 3. News & Information APIs - Vollständige Implementierung

#### Google News API Integration
```javascript
class GoogleNewsAPIProvider {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://newsapi.org/v2';
        this.rateLimit = 1000; // requests per day for free tier
        this.requestQueue = [];
        this.isProcessing = false;
    }
    
    async searchNews(query, language = 'en', sortBy = 'publishedAt') {
        const params = {
            q: query,
            language: language,
            sortBy: sortBy,
            pageSize: 100,
            apiKey: this.apiKey
        };
        
        return await this.makeRequest('everything', params);
    }
    
    async getTopHeadlines(category = 'business', country = 'us') {
        const params = {
            category: category,
            country: country,
            pageSize: 100,
            apiKey: this.apiKey
        };
        
        return await this.makeRequest('top-headlines', params);
    }
    
    async getSources(category = 'business', language = 'en') {
        const params = {
            category: category,
            language: language,
            apiKey: this.apiKey
        };
        
        return await this.makeRequest('sources', params);
    }
    
    async makeRequest(endpoint, params = {}) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ endpoint, params, resolve, reject });
            this.processQueue();
        });
    }
    
    async processQueue() {
        if (this.isProcessing || this.requestQueue.length === 0) return;
        
        this.isProcessing = true;
        
        while (this.requestQueue.length > 0) {
            const { endpoint, params, resolve, reject } = this.requestQueue.shift();
            
            try {
                const url = new URL(`${this.baseUrl}/${endpoint}`);
                Object.entries(params).forEach(([key, value]) => {
                    url.searchParams.append(key, value);
                });
                
                const response = await fetch(url);
                const data = await response.json();
                
                if (data.status === 'error') {
                    reject(new Error(data.message));
                } else {
                    resolve(data);
                }
                
                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 100)); // 1000 requests per day
                
            } catch (error) {
                reject(error);
            }
        }
        
        this.isProcessing = false;
    }
}
```

## Implementation Features - Vollständige Spezifikation

### 1. Multi-Source Data Aggregation - Detaillierte Implementierung
```javascript
class AdvancedDataAggregator {
    constructor() {
        this.providers = {
            'reddit': new RedditAPIProvider(),
            'twitter': new TwitterAPIv2Provider(process.env.TWITTER_BEARER_TOKEN),
            'news': new GoogleNewsAPIProvider(process.env.NEWS_API_KEY),
            'discord': new DiscordAPIProvider(process.env.DISCORD_BOT_TOKEN),
            'telegram': new TelegramAPIProvider(process.env.TELEGRAM_BOT_TOKEN),
            'alpha_vantage': new AlphaVantageProvider(process.env.ALPHA_VANTAGE_API_KEY),
            'yahoo': new YahooFinanceProvider(),
            'coingecko': new CoinGeckoProvider()
        };
        
        this.sourceWeights = {
            'reddit': 0.3,
            'twitter': 0.25,
            'news': 0.2,
            'discord': 0.15,
            'telegram': 0.1
        };
        
        this.qualityThresholds = {
            'min_engagement': 10,
            'min_confidence': 0.6,
            'max_age_hours': 24
        };
    }
    
    async collectAllSignals() {
        const sources = Object.keys(this.providers);
        const signalPromises = sources.map(source => 
            this.collectFromSource(source).catch(error => {
                console.error(`Error collecting from ${source}:`, error);
                return [];
            })
        );
        
        const results = await Promise.allSettled(signalPromises);
        const successfulResults = results
            .filter(result => result.status === 'fulfilled')
            .map(result => result.value)
            .flat();
        
        return this.processAndDeduplicate(successfulResults);
    }
    
    async collectFromSource(source) {
        const provider = this.providers[source];
        if (!provider) {
            throw new Error(`Provider for ${source} not found`);
        }
        
        switch(source) {
            case 'reddit':
                return await this.collectRedditSignals(provider);
            case 'twitter':
                return await this.collectTwitterSignals(provider);
            case 'news':
                return await this.collectNewsSignals(provider);
            case 'discord':
                return await this.collectDiscordSignals(provider);
            case 'telegram':
                return await this.collectTelegramSignals(provider);
            case 'alpha_vantage':
                return await this.collectAlphaVantageSignals(provider);
            case 'yahoo':
                return await this.collectYahooSignals(provider);
            case 'coingecko':
                return await this.collectCoinGeckoSignals(provider);
            default:
                throw new Error(`Unknown source: ${source}`);
        }
    }
    
    async collectRedditSignals(provider) {
        const subreddits = [
            'investing', 'stocks', 'SecurityAnalysis', 'ValueInvesting',
            'dividends', 'cryptocurrency', 'bitcoin', 'ethereum',
            'wallstreetbets', 'options', 'robinhood', 'pennystocks'
        ];
        
        const signals = [];
        
        for (const subreddit of subreddits) {
            try {
                const posts = await provider.getHotPosts(subreddit, 25);
                const processedSignals = posts.map(post => ({
                    id: `reddit_${post.id}`,
                    source: 'reddit',
                    subreddit: subreddit,
                    title: post.title,
                    content: post.selftext,
                    author: post.author,
                    score: post.score,
                    upvote_ratio: post.upvote_ratio,
                    num_comments: post.num_comments,
                    created_utc: post.created_utc,
                    url: `https://reddit.com${post.permalink}`,
                    engagement_score: this.calculateEngagementScore(post),
                    sentiment: null, // Will be calculated later
                    confidence: 0.5, // Default confidence
                    timestamp: new Date(post.created_utc * 1000)
                }));
                
                signals.push(...processedSignals);
            } catch (error) {
                console.error(`Error collecting Reddit signals from ${subreddit}:`, error);
            }
        }
        
        return signals;
    }
    
    async collectTwitterSignals(provider) {
        const queries = [
            '#stocks', '#investing', '#trading', '#crypto',
            '#bitcoin', '#ethereum', '#stockmarket', '#finance'
        ];
        
        const signals = [];
        
        for (const query of queries) {
            try {
                const tweets = await provider.searchTweets(query, 100);
                const processedSignals = tweets.data.map(tweet => ({
                    id: `twitter_${tweet.id}`,
                    source: 'twitter',
                    query: query,
                    text: tweet.text,
                    author: tweet.author_id,
                    public_metrics: tweet.public_metrics,
                    created_at: tweet.created_at,
                    url: `https://twitter.com/i/web/status/${tweet.id}`,
                    engagement_score: this.calculateTwitterEngagement(tweet),
                    sentiment: null, // Will be calculated later
                    confidence: 0.5, // Default confidence
                    timestamp: new Date(tweet.created_at)
                }));
                
                signals.push(...processedSignals);
            } catch (error) {
                console.error(`Error collecting Twitter signals for ${query}:`, error);
            }
        }
        
        return signals;
    }
    
    async collectNewsSignals(provider) {
        const queries = [
            'stock market', 'cryptocurrency', 'bitcoin', 'ethereum',
            'trading', 'investment', 'finance', 'economy'
        ];
        
        const signals = [];
        
        for (const query of queries) {
            try {
                const articles = await provider.searchNews(query);
                const processedSignals = articles.articles.map(article => ({
                    id: `news_${this.generateId(article.url)}`,
                    source: 'news',
                    query: query,
                    title: article.title,
                    description: article.description,
                    content: article.content,
                    author: article.author,
                    source_name: article.source.name,
                    url: article.url,
                    published_at: article.publishedAt,
                    engagement_score: this.calculateNewsEngagement(article),
                    sentiment: null, // Will be calculated later
                    confidence: 0.5, // Default confidence
                    timestamp: new Date(article.publishedAt)
                }));
                
                signals.push(...processedSignals);
            } catch (error) {
                console.error(`Error collecting news signals for ${query}:`, error);
            }
        }
        
        return signals;
    }
    
    processAndDeduplicate(signals) {
        // Remove duplicates based on content similarity
        const deduplicated = this.removeDuplicates(signals);
        
        // Filter by quality thresholds
        const filtered = this.filterByQuality(deduplicated);
        
        // Calculate sentiment for each signal
        const withSentiment = this.calculateSentiment(filtered);
        
        // Calculate confidence scores
        const withConfidence = this.calculateConfidence(withSentiment);
        
        // Sort by relevance and confidence
        const sorted = this.sortByRelevance(withConfidence);
        
        return sorted;
    }
    
    removeDuplicates(signals) {
        const seen = new Set();
        const deduplicated = [];
        
        for (const signal of signals) {
            const contentHash = this.hashContent(signal.title + ' ' + signal.content);
            
            if (!seen.has(contentHash)) {
                seen.add(contentHash);
                deduplicated.push(signal);
            }
        }
        
        return deduplicated;
    }
    
    filterByQuality(signals) {
        return signals.filter(signal => {
            const ageHours = (Date.now() - signal.timestamp.getTime()) / (1000 * 60 * 60);
            
            return signal.engagement_score >= this.qualityThresholds.min_engagement &&
                   signal.confidence >= this.qualityThresholds.min_confidence &&
                   ageHours <= this.qualityThresholds.max_age_hours;
        });
    }
    
    calculateSentiment(signals) {
        // This would integrate with the sentiment analysis system
        return signals.map(signal => ({
            ...signal,
            sentiment: this.analyzeSentiment(signal.title + ' ' + signal.content)
        }));
    }
    
    calculateConfidence(signals) {
        return signals.map(signal => ({
            ...signal,
            confidence: this.calculateSignalConfidence(signal)
        }));
    }
    
    calculateSignalConfidence(signal) {
        let confidence = 0.5; // Base confidence
        
        // Source reliability
        const sourceReliability = this.getSourceReliability(signal.source);
        confidence += sourceReliability * 0.3;
        
        // Engagement score
        const engagementFactor = Math.min(signal.engagement_score / 100, 1);
        confidence += engagementFactor * 0.2;
        
        // Content quality
        const contentQuality = this.assessContentQuality(signal);
        confidence += contentQuality * 0.2;
        
        // Recency
        const ageHours = (Date.now() - signal.timestamp.getTime()) / (1000 * 60 * 60);
        const recencyFactor = Math.max(0, 1 - (ageHours / 24));
        confidence += recencyFactor * 0.1;
        
        return Math.min(confidence, 1.0);
    }
    
    sortByRelevance(signals) {
        return signals.sort((a, b) => {
            const scoreA = a.confidence * a.engagement_score;
            const scoreB = b.confidence * b.engagement_score;
            return scoreB - scoreA;
        });
    }
}
```

### 2. Data Quality & Validation - Vollständige Implementierung
```javascript
class DataQualityValidator {
    constructor() {
        this.qualityMetrics = {
            'completeness': 0.3,
            'accuracy': 0.25,
            'consistency': 0.2,
            'timeliness': 0.15,
            'relevance': 0.1
        };
        
        this.validationRules = {
            'required_fields': ['id', 'source', 'title', 'timestamp'],
            'field_types': {
                'id': 'string',
                'source': 'string',
                'title': 'string',
                'timestamp': 'date',
                'engagement_score': 'number',
                'confidence': 'number'
            },
            'field_constraints': {
                'engagement_score': { min: 0, max: 1000 },
                'confidence': { min: 0, max: 1 },
                'title': { min_length: 10, max_length: 500 }
            }
        };
    }
    
    validateSignal(signal) {
        const validation = {
            isValid: true,
            errors: [],
            warnings: [],
            qualityScore: 0
        };
        
        // Required fields validation
        for (const field of this.validationRules.required_fields) {
            if (!signal[field]) {
                validation.errors.push(`Missing required field: ${field}`);
                validation.isValid = false;
            }
        }
        
        // Field type validation
        for (const [field, expectedType] of Object.entries(this.validationRules.field_types)) {
            if (signal[field] && typeof signal[field] !== expectedType) {
                validation.errors.push(`Invalid type for field ${field}: expected ${expectedType}`);
                validation.isValid = false;
            }
        }
        
        // Field constraints validation
        for (const [field, constraints] of Object.entries(this.validationRules.field_constraints)) {
            if (signal[field] !== undefined) {
                if (constraints.min !== undefined && signal[field] < constraints.min) {
                    validation.errors.push(`Field ${field} below minimum value: ${constraints.min}`);
                    validation.isValid = false;
                }
                if (constraints.max !== undefined && signal[field] > constraints.max) {
                    validation.errors.push(`Field ${field} above maximum value: ${constraints.max}`);
                    validation.isValid = false;
                }
                if (constraints.min_length !== undefined && signal[field].length < constraints.min_length) {
                    validation.errors.push(`Field ${field} below minimum length: ${constraints.min_length}`);
                    validation.isValid = false;
                }
                if (constraints.max_length !== undefined && signal[field].length > constraints.max_length) {
                    validation.errors.push(`Field ${field} above maximum length: ${constraints.max_length}`);
                    validation.isValid = false;
                }
            }
        }
        
        // Calculate quality score
        validation.qualityScore = this.calculateQualityScore(signal);
        
        return validation;
    }
    
    calculateQualityScore(signal) {
        let score = 0;
        
        // Completeness score
        const requiredFields = this.validationRules.required_fields;
        const presentFields = requiredFields.filter(field => signal[field] !== undefined);
        const completenessScore = presentFields.length / requiredFields.length;
        score += completenessScore * this.qualityMetrics.completeness;
        
        // Accuracy score (based on data consistency)
        const accuracyScore = this.assessAccuracy(signal);
        score += accuracyScore * this.qualityMetrics.accuracy;
        
        // Consistency score
        const consistencyScore = this.assessConsistency(signal);
        score += consistencyScore * this.qualityMetrics.consistency;
        
        // Timeliness score
        const timelinessScore = this.assessTimeliness(signal);
        score += timelinessScore * this.qualityMetrics.timeliness;
        
        // Relevance score
        const relevanceScore = this.assessRelevance(signal);
        score += relevanceScore * this.qualityMetrics.relevance;
        
        return Math.min(score, 1.0);
    }
    
    assessAccuracy(signal) {
        // Check for data consistency
        let accuracyScore = 1.0;
        
        // Check if engagement score is reasonable
        if (signal.engagement_score > 1000) {
            accuracyScore -= 0.2;
        }
        
        // Check if confidence is reasonable
        if (signal.confidence > 1.0 || signal.confidence < 0.0) {
            accuracyScore -= 0.3;
        }
        
        // Check if timestamp is reasonable
        const now = Date.now();
        const signalTime = signal.timestamp.getTime();
        const ageDays = (now - signalTime) / (1000 * 60 * 60 * 24);
        
        if (ageDays > 30) {
            accuracyScore -= 0.1;
        }
        
        return Math.max(accuracyScore, 0.0);
    }
    
    assessConsistency(signal) {
        // Check for consistent data patterns
        let consistencyScore = 1.0;
        
        // Check if source is consistent with content
        if (signal.source === 'reddit' && !signal.subreddit) {
            consistencyScore -= 0.2;
        }
        
        if (signal.source === 'twitter' && !signal.public_metrics) {
            consistencyScore -= 0.2;
        }
        
        if (signal.source === 'news' && !signal.source_name) {
            consistencyScore -= 0.2;
        }
        
        return Math.max(consistencyScore, 0.0);
    }
    
    assessTimeliness(signal) {
        const now = Date.now();
        const signalTime = signal.timestamp.getTime();
        const ageHours = (now - signalTime) / (1000 * 60 * 60);
        
        // Fresh content gets higher score
        if (ageHours <= 1) return 1.0;
        if (ageHours <= 6) return 0.8;
        if (ageHours <= 24) return 0.6;
        if (ageHours <= 72) return 0.4;
        return 0.2;
    }
    
    assessRelevance(signal) {
        // Check if content is relevant to financial markets
        const financialKeywords = [
            'stock', 'crypto', 'bitcoin', 'ethereum', 'trading', 'investment',
            'market', 'price', 'buy', 'sell', 'hold', 'portfolio', 'finance'
        ];
        
        const content = (signal.title + ' ' + signal.content).toLowerCase();
        const keywordMatches = financialKeywords.filter(keyword => 
            content.includes(keyword)
        ).length;
        
        return Math.min(keywordMatches / financialKeywords.length, 1.0);
    }
}
```

### 3. Real-time Data Streaming - Vollständige Implementierung
```javascript
class RealTimeDataStreamer {
    constructor() {
        this.connections = new Map();
        this.eventHandlers = new Map();
        this.dataCache = new Map();
        this.cacheTimeout = 30 * 1000; // 30 seconds
    }
    
    async startStreaming(connectionId, sources) {
        const connection = {
            id: connectionId,
            sources: sources,
            isActive: true,
            lastUpdate: Date.now()
        };
        
        this.connections.set(connectionId, connection);
        
        // Start streaming for each source
        for (const source of sources) {
            await this.startSourceStream(source, connectionId);
        }
        
        return connection;
    }
    
    async startSourceStream(source, connectionId) {
        switch(source) {
            case 'reddit':
                await this.streamRedditData(connectionId);
                break;
            case 'twitter':
                await this.streamTwitterData(connectionId);
                break;
            case 'news':
                await this.streamNewsData(connectionId);
                break;
            case 'market':
                await this.streamMarketData(connectionId);
                break;
        }
    }
    
    async streamRedditData(connectionId) {
        const interval = setInterval(async () => {
            try {
                const newPosts = await this.getNewRedditPosts();
                if (newPosts.length > 0) {
                    await this.sendToConnection(connectionId, {
                        type: 'reddit_update',
                        data: newPosts,
                        timestamp: new Date().toISOString()
                    });
                }
            } catch (error) {
                console.error('Error streaming Reddit data:', error);
            }
        }, 60000); // Update every minute
        
        // Store interval for cleanup
        const connection = this.connections.get(connectionId);
        if (connection) {
            connection.redditInterval = interval;
        }
    }
    
    async streamTwitterData(connectionId) {
        const interval = setInterval(async () => {
            try {
                const newTweets = await this.getNewTwitterPosts();
                if (newTweets.length > 0) {
                    await this.sendToConnection(connectionId, {
                        type: 'twitter_update',
                        data: newTweets,
                        timestamp: new Date().toISOString()
                    });
                }
            } catch (error) {
                console.error('Error streaming Twitter data:', error);
            }
        }, 30000); // Update every 30 seconds
        
        // Store interval for cleanup
        const connection = this.connections.get(connectionId);
        if (connection) {
            connection.twitterInterval = interval;
        }
    }
    
    async streamMarketData(connectionId) {
        const interval = setInterval(async () => {
            try {
                const marketData = await this.getMarketData();
                await this.sendToConnection(connectionId, {
                    type: 'market_update',
                    data: marketData,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error streaming market data:', error);
            }
        }, 5000); // Update every 5 seconds
        
        // Store interval for cleanup
        const connection = this.connections.get(connectionId);
        if (connection) {
            connection.marketInterval = interval;
        }
    }
    
    async sendToConnection(connectionId, data) {
        const connection = this.connections.get(connectionId);
        if (!connection || !connection.isActive) {
            return;
        }
        
        // Check if data is cached
        const cacheKey = `${connectionId}_${data.type}`;
        const cached = this.dataCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return; // Skip if data is too recent
        }
        
        // Cache the data
        this.dataCache.set(cacheKey, {
            data: data,
            timestamp: Date.now()
        });
        
        // Send to connection (this would integrate with WebSocket or SSE)
        await this.emitToConnection(connectionId, data);
    }
    
    async emitToConnection(connectionId, data) {
        // This would integrate with the actual WebSocket or SSE implementation
        console.log(`Sending to connection ${connectionId}:`, data);
    }
    
    stopStreaming(connectionId) {
        const connection = this.connections.get(connectionId);
        if (!connection) return;
        
        // Clear all intervals
        if (connection.redditInterval) {
            clearInterval(connection.redditInterval);
        }
        if (connection.twitterInterval) {
            clearInterval(connection.twitterInterval);
        }
        if (connection.marketInterval) {
            clearInterval(connection.marketInterval);
        }
        
        // Mark connection as inactive
        connection.isActive = false;
        
        // Remove from connections
        this.connections.delete(connectionId);
    }
    
    getActiveConnections() {
        return Array.from(this.connections.values()).filter(conn => conn.isActive);
    }
    
    getConnectionStats() {
        const stats = {
            totalConnections: this.connections.size,
            activeConnections: this.getActiveConnections().length,
            dataCacheSize: this.dataCache.size,
            averageUpdateFrequency: this.calculateAverageUpdateFrequency()
        };
        
        return stats;
    }
    
    calculateAverageUpdateFrequency() {
        const connections = this.getActiveConnections();
        if (connections.length === 0) return 0;
        
        const totalSources = connections.reduce((sum, conn) => sum + conn.sources.length, 0);
        return totalSources / connections.length;
    }
}
```

## Integration mit bestehendem System

### API Endpoints
```javascript
// Data Aggregation API
app.post('/api/data/collect-signals', async (req, res) => {
    try {
        const { sources, filters } = req.body;
        
        const aggregator = new AdvancedDataAggregator();
        const signals = await aggregator.collectAllSignals();
        
        res.json({
            success: true,
            signals: signals,
            count: signals.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Real-time Streaming API
app.get('/api/stream/start', async (req, res) => {
    try {
        const { sources } = req.query;
        const connectionId = generateConnectionId();
        
        const streamer = new RealTimeDataStreamer();
        await streamer.startStreaming(connectionId, sources.split(','));
        
        res.json({
            success: true,
            connectionId: connectionId,
            sources: sources.split(',')
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Data Quality API
app.post('/api/data/validate', async (req, res) => {
    try {
        const { signals } = req.body;
        
        const validator = new DataQualityValidator();
        const validationResults = signals.map(signal => 
            validator.validateSignal(signal)
        );
        
        res.json({
            success: true,
            validations: validationResults,
            summary: this.calculateValidationSummary(validationResults)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
```

### Database Schema
```sql
-- Data Sources Table
CREATE TABLE data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    api_endpoint VARCHAR(255),
    rate_limit INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Signal Data Table
CREATE TABLE signal_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES data_sources(id),
    external_id VARCHAR(255) NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    author VARCHAR(255),
    engagement_score INTEGER,
    confidence DECIMAL(5,4),
    sentiment_score DECIMAL(5,4),
    sentiment_magnitude DECIMAL(5,4),
    quality_score DECIMAL(5,4),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Data Quality Metrics Table
CREATE TABLE data_quality_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES data_sources(id),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,6) NOT NULL,
    measurement_date TIMESTAMP DEFAULT NOW()
);

-- Real-time Connections Table
CREATE TABLE real_time_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id VARCHAR(255) NOT NULL,
    sources TEXT[] NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_activity TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Performance Monitoring
```javascript
class DataIntegrationPerformanceMonitor {
    constructor() {
        this.metrics = {
            'api_calls': new Map(),
            'response_times': new Map(),
            'error_rates': new Map(),
            'data_quality': new Map()
        };
    }
    
    trackAPICall(source, endpoint, startTime, success, error = null) {
        const duration = Date.now() - startTime;
        
        // Track API calls
        if (!this.metrics.api_calls.has(source)) {
            this.metrics.api_calls.set(source, 0);
        }
        this.metrics.api_calls.get(source)++;
        
        // Track response times
        if (!this.metrics.response_times.has(source)) {
            this.metrics.response_times.set(source, []);
        }
        this.metrics.response_times.get(source).push(duration);
        
        // Track errors
        if (error) {
            if (!this.metrics.error_rates.has(source)) {
                this.metrics.error_rates.set(source, []);
            }
            this.metrics.error_rates.get(source).push({
                error: error.message,
                endpoint: endpoint,
                timestamp: new Date()
            });
        }
    }
    
    trackDataQuality(source, qualityScore) {
        if (!this.metrics.data_quality.has(source)) {
            this.metrics.data_quality.set(source, []);
        }
        this.metrics.data_quality.get(source).push({
            score: qualityScore,
            timestamp: new Date()
        });
    }
    
    getPerformanceReport() {
        const report = {};
        
        for (const [source, calls] of this.metrics.api_calls) {
            const responseTimes = this.metrics.response_times.get(source) || [];
            const errors = this.metrics.error_rates.get(source) || [];
            const qualityScores = this.metrics.data_quality.get(source) || [];
            
            report[source] = {
                total_calls: calls,
                avg_response_time: this.calculateAverage(responseTimes),
                error_rate: errors.length / calls,
                avg_quality_score: this.calculateAverage(qualityScores.map(q => q.score)),
                last_error: errors.length > 0 ? errors[errors.length - 1] : null
            };
        }
        
        return report;
    }
}
```
