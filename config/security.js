/**
 * AI Investment System - Security Configuration
 * Umfassende Sicherheitsmaßnahmen
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

const securityConfig = {
    // JWT Configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this',
        expiresIn: '24h',
        algorithm: 'HS256',
        issuer: 'ai-investment-system',
        audience: 'ai-investment-users'
    },
    
    // Password Hashing
    password: {
        saltRounds: 12,
        minLength: 8,
        requireSpecialChars: true,
        requireNumbers: true,
        requireUppercase: true
    },
    
    // Rate Limiting
    rateLimiting: {
        general: rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
            message: 'Too many requests from this IP, please try again later.',
            standardHeaders: true,
            legacyHeaders: false
        }),
        
        api: rateLimit({
            windowMs: 1 * 60 * 1000, // 1 minute
            max: 20, // limit each IP to 20 API requests per minute
            message: 'API rate limit exceeded, please try again later.',
            standardHeaders: true,
            legacyHeaders: false
        }),
        
        auth: rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 5, // limit each IP to 5 auth requests per 15 minutes
            message: 'Too many authentication attempts, please try again later.',
            standardHeaders: true,
            legacyHeaders: false
        })
    },
    
    // CORS Configuration
    cors: {
        origin: process.env.ALLOWED_ORIGINS ? 
            process.env.ALLOWED_ORIGINS.split(',') : 
            ['https://mawps.netlify.app'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type', 
            'Authorization', 
            'X-Requested-With',
            'X-API-Key',
            'X-Client-Version'
        ],
        exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],
        maxAge: 86400 // 24 hours
    },
    
    // Helmet Configuration (Security Headers)
    helmet: {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                imgSrc: ["'self'", "data:", "https:"],
                scriptSrc: ["'self'"],
                connectSrc: ["'self'", "https://api.openai.com", "https://oauth.reddit.com", "https://newsapi.org"],
                frameSrc: ["'none'"],
                objectSrc: ["'none'"],
                upgradeInsecureRequests: []
            }
        },
        crossOriginEmbedderPolicy: false
    },
    
    // API Key Validation
    apiKeys: {
        required: ['OPENAI_API_KEY', 'REDDIT_CLIENT_ID', 'REDDIT_CLIENT_SECRET', 'NEWS_API_KEY'],
        validate: function() {
            const missing = this.required.filter(key => !process.env[key]);
            if (missing.length > 0) {
                throw new Error(`Missing required API keys: ${missing.join(', ')}`);
            }
            return true;
        }
    },
    
    // Input Validation
    validation: {
        sanitizeInput: function(input) {
            if (typeof input !== 'string') return input;
            
            // Remove potentially dangerous characters
            return input
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<[^>]*>/g, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '')
                .trim();
        },
        
        validateEmail: function(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },
        
        validatePassword: function(password) {
            if (password.length < 8) return false;
            if (!/[A-Z]/.test(password)) return false;
            if (!/[a-z]/.test(password)) return false;
            if (!/[0-9]/.test(password)) return false;
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
            return true;
        }
    },
    
    // Encryption
    encryption: {
        algorithm: 'aes-256-gcm',
        keyLength: 32,
        ivLength: 16,
        tagLength: 16
    },
    
    // Session Security
    session: {
        secret: process.env.SESSION_SECRET || 'your-super-secret-session-key',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            sameSite: 'strict'
        }
    }
};

// Security Middleware
const securityMiddleware = {
    // JWT Token Generation
    generateToken: function(payload) {
        return jwt.sign(payload, securityConfig.jwt.secret, {
            expiresIn: securityConfig.jwt.expiresIn,
            issuer: securityConfig.jwt.issuer,
            audience: securityConfig.jwt.audience
        });
    },
    
    // JWT Token Verification
    verifyToken: function(token) {
        try {
            return jwt.verify(token, securityConfig.jwt.secret, {
                issuer: securityConfig.jwt.issuer,
                audience: securityConfig.jwt.audience
            });
        } catch (error) {
            throw new Error('Invalid token');
        }
    },
    
    // Password Hashing
    hashPassword: async function(password) {
        return await bcrypt.hash(password, securityConfig.password.saltRounds);
    },
    
    // Password Verification
    verifyPassword: async function(password, hash) {
        return await bcrypt.compare(password, hash);
    },
    
    // Input Sanitization
    sanitize: function(input) {
        return securityConfig.validation.sanitizeInput(input);
    }
};

module.exports = {
    securityConfig,
    securityMiddleware
};
