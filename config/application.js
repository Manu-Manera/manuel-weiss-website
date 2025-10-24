/**
 * AI Investment System - Application Configuration
 * Zentrale Konfiguration für alle Umgebungen
 */

require('dotenv').config();

const config = {
    // Application Settings
    app: {
        name: 'AI Investment System',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        port: parseInt(process.env.PORT) || 3001,
        logLevel: process.env.LOG_LEVEL || 'info'
    },
    
    // API Configuration
    apis: {
        openai: {
            apiKey: process.env.OPENAI_API_KEY,
            model: 'gpt-3.5-turbo',
            maxTokens: 1000,
            temperature: 0.7
        },
        reddit: {
            clientId: process.env.REDDIT_CLIENT_ID,
            clientSecret: process.env.REDDIT_CLIENT_SECRET,
            username: process.env.REDDIT_USERNAME,
            password: process.env.REDDIT_PASSWORD,
            userAgent: 'AI Investment System v1.0'
        },
        newsapi: {
            apiKey: process.env.NEWS_API_KEY,
            baseUrl: 'https://newsapi.org/v2',
            rateLimit: 1000, // Requests per day
            timeout: 30000 // 30 seconds
        },
        twitter: {
            apiKey: process.env.TWITTER_API_KEY,
            apiSecret: process.env.TWITTER_API_SECRET,
            bearerToken: process.env.TWITTER_BEARER_TOKEN
        }
    },
    
    // AWS Configuration
    aws: {
        region: process.env.AWS_REGION || 'eu-central-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        dynamoDB: {
            tablePrefix: process.env.DYNAMODB_TABLE_PREFIX || 'ai-investment-prod',
            tables: {
                signals: 'signals',
                proposals: 'proposals',
                decisions: 'decisions',
                analytics: 'analytics'
            }
        },
        s3: {
            bucketPrefix: process.env.S3_BUCKET_PREFIX || 'ai-investment-prod',
            buckets: {
                data: 'data',
                logs: 'logs',
                exports: 'exports'
            }
        }
    },
    
    // Security Configuration
    security: {
        jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this',
        jwtExpiresIn: '24h',
        allowedOrigins: process.env.ALLOWED_ORIGINS ? 
            process.env.ALLOWED_ORIGINS.split(',') : 
            ['https://mawps.netlify.app'],
        rateLimiting: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // limit each IP to 100 requests per windowMs
        },
        cors: {
            origin: process.env.ALLOWED_ORIGINS ? 
                process.env.ALLOWED_ORIGINS.split(',') : 
                ['https://mawps.netlify.app'],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
        }
    },
    
    // Database Configuration
    database: {
        url: process.env.DATABASE_URL || 'mongodb://localhost:27017/ai-investment',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        }
    },
    
    // Investment System Configuration
    investment: {
        analysisInterval: 5 * 60 * 1000, // 5 minutes
        signalRetentionDays: 30,
        proposalRetentionDays: 7,
        decisionRetentionDays: 90,
        maxSignalsPerAnalysis: 100,
        minRelevanceScore: 0.3,
        aiAnalysisTimeout: 30000 // 30 seconds
    },
    
    // Logging Configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: 'combined',
        file: {
            enabled: true,
            filename: 'logs/ai-investment.log',
            maxSize: '10MB',
            maxFiles: 5
        },
        console: {
            enabled: true,
            colorize: true
        }
    }
};

// Validation
function validateConfig() {
    const required = [
        'OPENAI_API_KEY',
        'REDDIT_CLIENT_ID',
        'REDDIT_CLIENT_SECRET',
        'NEWS_API_KEY'
    ];
    
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:', missing.join(', '));
        console.error('💡 Please check your .env file');
        process.exit(1);
    }
    
    console.log('✅ Configuration validated successfully');
}

// Export configuration
module.exports = {
    config,
    validateConfig
};
