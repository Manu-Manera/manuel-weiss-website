/**
 * AI Investment System - Database Configuration
 * Multi-Database Setup (MongoDB + DynamoDB)
 */

const mongoose = require('mongoose');
const AWS = require('aws-sdk');

const databaseConfig = {
    // MongoDB Configuration
    mongodb: {
        url: process.env.DATABASE_URL || 'mongodb://localhost:27017/ai-investment',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            bufferMaxEntries: 0,
            bufferCommands: false
        },
        
        // Collections
        collections: {
            users: 'users',
            signals: 'signals',
            proposals: 'proposals',
            decisions: 'decisions',
            analytics: 'analytics',
            sessions: 'sessions',
            logs: 'logs'
        }
    },
    
    // DynamoDB Configuration
    dynamodb: {
        region: process.env.AWS_REGION || 'eu-central-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        tablePrefix: process.env.DYNAMODB_TABLE_PREFIX || 'ai-investment-prod',
        
        // Tables
        tables: {
            signals: {
                name: 'signals',
                keySchema: [
                    { AttributeName: 'id', KeyType: 'HASH' },
                    { AttributeName: 'timestamp', KeyType: 'RANGE' }
                ],
                attributeDefinitions: [
                    { AttributeName: 'id', AttributeType: 'S' },
                    { AttributeName: 'timestamp', AttributeType: 'S' }
                ],
                billingMode: 'PAY_PER_REQUEST'
            },
            
            proposals: {
                name: 'proposals',
                keySchema: [
                    { AttributeName: 'id', KeyType: 'HASH' },
                    { AttributeName: 'created_at', KeyType: 'RANGE' }
                ],
                attributeDefinitions: [
                    { AttributeName: 'id', AttributeType: 'S' },
                    { AttributeName: 'created_at', AttributeType: 'S' }
                ],
                billingMode: 'PAY_PER_REQUEST'
            },
            
            decisions: {
                name: 'decisions',
                keySchema: [
                    { AttributeName: 'id', KeyType: 'HASH' },
                    { AttributeName: 'timestamp', KeyType: 'RANGE' }
                ],
                attributeDefinitions: [
                    { AttributeName: 'id', AttributeType: 'S' },
                    { AttributeName: 'timestamp', AttributeType: 'S' }
                ],
                billingMode: 'PAY_PER_REQUEST'
            },
            
            analytics: {
                name: 'analytics',
                keySchema: [
                    { AttributeName: 'id', KeyType: 'HASH' },
                    { AttributeName: 'date', KeyType: 'RANGE' }
                ],
                attributeDefinitions: [
                    { AttributeName: 'id', AttributeType: 'S' },
                    { AttributeName: 'date', AttributeType: 'S' }
                ],
                billingMode: 'PAY_PER_REQUEST'
            }
        }
    },
    
    // S3 Configuration
    s3: {
        region: process.env.AWS_REGION || 'eu-central-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        bucketPrefix: process.env.S3_BUCKET_PREFIX || 'ai-investment-prod',
        
        // Buckets
        buckets: {
            data: 'ai-investment-prod-data',
            logs: 'ai-investment-prod-logs',
            exports: 'ai-investment-prod-exports',
            backups: 'ai-investment-prod-backups'
        }
    }
};

// Database Connection Manager
class DatabaseManager {
    constructor() {
        this.mongodb = null;
        this.dynamodb = null;
        this.s3 = null;
    }
    
    // MongoDB Connection
    async connectMongoDB() {
        try {
            this.mongodb = await mongoose.connect(
                databaseConfig.mongodb.url,
                databaseConfig.mongodb.options
            );
            
            console.log('✅ MongoDB connected successfully');
            return this.mongodb;
        } catch (error) {
            console.error('❌ MongoDB connection failed:', error.message);
            throw error;
        }
    }
    
    // DynamoDB Connection
    async connectDynamoDB() {
        try {
            AWS.config.update({
                region: databaseConfig.dynamodb.region,
                accessKeyId: databaseConfig.dynamodb.accessKeyId,
                secretAccessKey: databaseConfig.dynamodb.secretAccessKey
            });
            
            this.dynamodb = new AWS.DynamoDB.DocumentClient();
            
            console.log('✅ DynamoDB connected successfully');
            return this.dynamodb;
        } catch (error) {
            console.error('❌ DynamoDB connection failed:', error.message);
            throw error;
        }
    }
    
    // S3 Connection
    async connectS3() {
        try {
            AWS.config.update({
                region: databaseConfig.s3.region,
                accessKeyId: databaseConfig.s3.accessKeyId,
                secretAccessKey: databaseConfig.s3.secretAccessKey
            });
            
            this.s3 = new AWS.S3();
            
            console.log('✅ S3 connected successfully');
            return this.s3;
        } catch (error) {
            console.error('❌ S3 connection failed:', error.message);
            throw error;
        }
    }
    
    // Initialize all connections
    async initialize() {
        try {
            await this.connectMongoDB();
            await this.connectDynamoDB();
            await this.connectS3();
            
            console.log('🎉 All database connections established');
            return true;
        } catch (error) {
            console.error('❌ Database initialization failed:', error.message);
            throw error;
        }
    }
    
    // Close all connections
    async close() {
        try {
            if (this.mongodb) {
                await mongoose.connection.close();
                console.log('✅ MongoDB connection closed');
            }
            
            console.log('✅ All database connections closed');
        } catch (error) {
            console.error('❌ Error closing database connections:', error.message);
        }
    }
}

// Database Models (MongoDB)
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    preferences: {
        riskTolerance: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
        investmentHorizon: { type: String, enum: ['short', 'medium', 'long'], default: 'medium' },
        notifications: { type: Boolean, default: true }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const signalSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    source: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String },
    url: { type: String },
    score: { type: Number, default: 0 },
    sentiment: { type: String, enum: ['positive', 'negative', 'neutral'], default: 'neutral' },
    relevanceScore: { type: Number, default: 0 },
    keywords: [{ type: String }],
    timestamp: { type: Date, default: Date.now },
    metadata: { type: mongoose.Schema.Types.Mixed }
});

const proposalSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    confidence: { type: Number, min: 0, max: 1, required: true },
    riskLevel: { type: String, enum: ['low', 'medium', 'high'], required: true },
    expectedReturn: { type: Number },
    timeHorizon: { type: String, enum: ['short', 'medium', 'long'], required: true },
    signals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Signal' }],
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const decisionSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    proposalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal', required: true },
    action: { type: String, enum: ['buy', 'sell', 'hold'], required: true },
    amount: { type: Number },
    reasoning: { type: String, required: true },
    confidence: { type: Number, min: 0, max: 1, required: true },
    executedAt: { type: Date, default: Date.now },
    outcome: { type: String, enum: ['pending', 'success', 'failure'] },
    result: { type: Number } // Actual return/result
});

// Create models
const User = mongoose.model('User', userSchema);
const Signal = mongoose.model('Signal', signalSchema);
const Proposal = mongoose.model('Proposal', proposalSchema);
const Decision = mongoose.model('Decision', decisionSchema);

module.exports = {
    databaseConfig,
    DatabaseManager,
    models: {
        User,
        Signal,
        Proposal,
        Decision
    }
};
