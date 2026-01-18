/**
 * Netlify Function: API Settings
 * Sichere Speicherung von API-Keys in DynamoDB (verschlüsselt mit AES-256-GCM)
 */

const { DynamoDBClient, PutItemCommand, GetItemCommand, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const crypto = require('crypto');

// AWS Configuration
const awsRegion = process.env.NETLIFY_AWS_REGION || process.env.AWS_REGION || 'eu-central-1';
const accessKeyId = process.env.NETLIFY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.NETLIFY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

const dynamoDB = new DynamoDBClient({
    region: awsRegion,
    credentials: accessKeyId && secretAccessKey ? {
        accessKeyId,
        secretAccessKey
    } : undefined
});

const TABLE_NAME = process.env.API_SETTINGS_TABLE || 'mawps-api-settings';
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || process.env.JWT_SECRET || 'mawps-secure-api-key-encryption-2024';

// CORS Headers
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
};

/**
 * AES-256-GCM Verschlüsselung
 */
function encryptApiKey(apiKey, userId) {
    if (!apiKey || apiKey.length < 5) return apiKey;
    
    try {
        const salt = crypto.createHash('sha256').update(userId + ENCRYPTION_SECRET).digest();
        const key = crypto.pbkdf2Sync(ENCRYPTION_SECRET, salt, 100000, 32, 'sha256');
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
        
        let encrypted = cipher.update(apiKey, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        const authTag = cipher.getAuthTag();
        
        return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Encryption failed');
    }
}

/**
 * AES-256-GCM Entschlüsselung
 */
function decryptApiKey(encryptedData, userId) {
    if (!encryptedData || !encryptedData.includes(':')) return encryptedData;
    
    try {
        const parts = encryptedData.split(':');
        if (parts.length !== 3) return encryptedData;
        
        const [ivBase64, authTagBase64, encrypted] = parts;
        const iv = Buffer.from(ivBase64, 'base64');
        const authTag = Buffer.from(authTagBase64, 'base64');
        
        const salt = crypto.createHash('sha256').update(userId + ENCRYPTION_SECRET).digest();
        const key = crypto.pbkdf2Sync(ENCRYPTION_SECRET, salt, 100000, 32, 'sha256');
        
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encrypted, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        return encryptedData; // Return as-is if decryption fails (legacy data)
    }
}

function isEncrypted(value) {
    if (!value || typeof value !== 'string') return false;
    const parts = value.split(':');
    return parts.length === 3 && parts[0].length >= 20;
}

function maskApiKey(key) {
    if (!key || key.length < 8) return '****';
    return key.substring(0, 4) + '...' + key.substring(key.length - 4);
}

function isValidApiKey(key, provider) {
    if (!key || typeof key !== 'string') return false;
    switch (provider) {
        case 'openai': return key.startsWith('sk-') && key.length > 20;
        case 'anthropic': return key.startsWith('sk-ant-') && key.length > 20;
        case 'google': return key.length > 20;
        default: return key.length > 10;
    }
}

/**
 * Extract user ID from JWT token
 */
function getUserIdFromToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    
    try {
        const token = authHeader.substring(7);
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        return payload.sub || payload.username || payload.email;
    } catch (error) {
        console.error('Token parse error:', error);
        return null;
    }
}

exports.handler = async (event) => {
    console.log('API Settings Function:', event.httpMethod, event.path);
    
    // CORS Preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }
    
    try {
        // Check AWS credentials
        if (!accessKeyId || !secretAccessKey) {
            console.error('AWS credentials missing');
            return {
                statusCode: 500,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Server configuration error' })
            };
        }
        
        // Get user ID from token
        const userId = getUserIdFromToken(event.headers.authorization || event.headers.Authorization);
        
        if (!userId) {
            return {
                statusCode: 401,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Nicht autorisiert - Bitte anmelden' })
            };
        }
        
        const path = event.path || '';
        const { httpMethod } = event;
        const action = event.queryStringParameters?.action;
        
        // Route: /api-settings?action=key&provider=openai - Get full (decrypted) key
        if (httpMethod === 'GET' && (path.includes('/key') || action === 'key')) {
            const provider = event.queryStringParameters?.provider || 'openai';
            console.log(`🔑 Getting full API key for provider: ${provider}, userId: ${userId}`);
            return await getFullApiKey(userId, provider);
        }
        
        // Standard routes
        switch (httpMethod) {
            case 'GET':
                return await getApiSettings(userId);
            case 'POST':
            case 'PUT':
                const body = JSON.parse(event.body || '{}');
                return await saveApiSettings(userId, body);
            case 'DELETE':
                return await deleteApiSettings(userId);
            default:
                return {
                    statusCode: 405,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({ error: 'Method not allowed' })
                };
        }
    } catch (error) {
        console.error('API Settings Error:', error);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Interner Serverfehler', message: error.message })
        };
    }
};

/**
 * Get API settings (masked keys)
 */
async function getApiSettings(userId) {
    try {
        const result = await dynamoDB.send(new GetItemCommand({
            TableName: TABLE_NAME,
            Key: marshall({ userId })
        }));
        
        if (!result.Item) {
            return {
                statusCode: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify({ hasSettings: false, settings: null })
            };
        }
        
        const settings = unmarshall(result.Item);
        
        const decryptAndMask = (providerSettings) => {
            if (!providerSettings || !providerSettings.apiKey) return null;
            const decryptedKey = decryptApiKey(providerSettings.apiKey, userId);
            return {
                configured: true,
                keyMasked: maskApiKey(decryptedKey),
                model: providerSettings.model,
                maxTokens: providerSettings.maxTokens,
                temperature: providerSettings.temperature
            };
        };
        
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                hasSettings: true,
                settings: {
                    openai: decryptAndMask(settings.openai),
                    anthropic: decryptAndMask(settings.anthropic),
                    google: decryptAndMask(settings.google),
                    preferredProvider: settings.preferredProvider || 'openai',
                    updatedAt: settings.updatedAt
                }
            })
        };
    } catch (error) {
        console.error('Get Settings Error:', error);
        throw error;
    }
}

/**
 * Save API settings (encrypted)
 */
async function saveApiSettings(userId, data) {
    try {
        const now = new Date().toISOString();
        
        // Validate keys
        if (data.openai?.apiKey && !isValidApiKey(data.openai.apiKey, 'openai')) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Ungültiger OpenAI API-Key Format' })
            };
        }
        
        // Get existing settings
        let existingSettings = {};
        try {
            const existingResult = await dynamoDB.send(new GetItemCommand({
                TableName: TABLE_NAME,
                Key: marshall({ userId })
            }));
            if (existingResult.Item) {
                existingSettings = unmarshall(existingResult.Item);
            }
        } catch (e) {
            console.log('No existing settings found');
        }
        
        const settingsItem = {
            userId,
            updatedAt: now,
            createdAt: existingSettings.createdAt || now,
            preferredProvider: data.preferredProvider || existingSettings.preferredProvider || 'openai',
            encrypted: true
        };
        
        // Encrypt and save each provider
        const providers = ['openai', 'anthropic', 'google'];
        const defaultModels = {
            openai: 'gpt-5.2',
            anthropic: 'claude-3-sonnet-20240229',
            google: 'gemini-pro'
        };
        
        for (const provider of providers) {
            if (data[provider]) {
                let apiKey = data[provider].apiKey;
                
                // Encrypt if new and not already encrypted
                if (apiKey && apiKey.length > 10 && !isEncrypted(apiKey)) {
                    apiKey = encryptApiKey(apiKey, userId);
                    console.log(`🔐 ${provider} Key encrypted`);
                } else if (!apiKey && existingSettings[provider]?.apiKey) {
                    apiKey = existingSettings[provider].apiKey;
                }
                
                settingsItem[provider] = {
                    apiKey: apiKey || '',
                    model: data[provider].model || existingSettings[provider]?.model || defaultModels[provider],
                    maxTokens: data[provider].maxTokens || existingSettings[provider]?.maxTokens || 1000,
                    temperature: data[provider].temperature ?? existingSettings[provider]?.temperature ?? 0.7
                };
            } else if (existingSettings[provider]) {
                settingsItem[provider] = existingSettings[provider];
            }
        }
        
        await dynamoDB.send(new PutItemCommand({
            TableName: TABLE_NAME,
            Item: marshall(settingsItem, { removeUndefinedValues: true })
        }));
        
        console.log('✅ API Settings saved (encrypted)');
        
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                success: true,
                message: 'API-Einstellungen sicher gespeichert (verschlüsselt)',
                encrypted: true,
                updatedAt: now
            })
        };
    } catch (error) {
        console.error('Save Settings Error:', error);
        throw error;
    }
}

/**
 * Get full (decrypted) API key for a provider
 */
async function getFullApiKey(userId, provider) {
    try {
        const result = await dynamoDB.send(new GetItemCommand({
            TableName: TABLE_NAME,
            Key: marshall({ userId })
        }));
        
        if (!result.Item) {
            return {
                statusCode: 404,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: `Keine ${provider} Konfiguration gefunden` })
            };
        }
        
        const settings = unmarshall(result.Item);
        
        if (!settings[provider] || !settings[provider].apiKey) {
            return {
                statusCode: 404,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: `${provider} API-Key nicht konfiguriert` })
            };
        }
        
        const decryptedKey = decryptApiKey(settings[provider].apiKey, userId);
        
        console.log(`🔓 Full API key retrieved for ${provider}`);
        
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                apiKey: decryptedKey,
                provider,
                model: settings[provider].model,
                maxTokens: settings[provider].maxTokens,
                temperature: settings[provider].temperature
            })
        };
    } catch (error) {
        console.error('Get Full API Key Error:', error);
        throw error;
    }
}

/**
 * Delete API settings
 */
async function deleteApiSettings(userId) {
    try {
        await dynamoDB.send(new DeleteItemCommand({
            TableName: TABLE_NAME,
            Key: marshall({ userId })
        }));
        
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: true, message: 'API-Einstellungen gelöscht' })
        };
    } catch (error) {
        console.error('Delete Settings Error:', error);
        throw error;
    }
}
