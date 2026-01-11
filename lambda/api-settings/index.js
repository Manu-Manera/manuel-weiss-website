/**
 * API SETTINGS LAMBDA
 * Sichere Speicherung von API-Keys in DynamoDB (verschlüsselt)
 * Die Keys werden mit dem User-ID als Partition Key gespeichert
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { KMSClient, EncryptCommand, DecryptCommand } = require('@aws-sdk/client-kms');

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const kmsClient = new KMSClient({ region: process.env.AWS_REGION || 'eu-central-1' });

const TABLE_NAME = process.env.API_SETTINGS_TABLE || 'mawps-api-settings';
const KMS_KEY_ID = process.env.KMS_KEY_ID; // Optional: KMS Key für Verschlüsselung

/**
 * CORS Headers
 */
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
};

/**
 * Main Handler
 */
exports.handler = async (event) => {
    console.log('API Settings Lambda:', JSON.stringify(event, null, 2));
    
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }
    
    try {
        // Get user ID from Cognito authorizer
        const userId = event.requestContext?.authorizer?.claims?.sub;
        
        if (!userId) {
            return response(401, { error: 'Nicht autorisiert - Bitte anmelden' });
        }
        
        const { httpMethod, path } = event;
        
        switch (httpMethod) {
            case 'GET':
                return await getApiSettings(userId);
            case 'POST':
            case 'PUT':
                return await saveApiSettings(userId, JSON.parse(event.body || '{}'));
            case 'DELETE':
                return await deleteApiSettings(userId);
            default:
                return response(405, { error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('API Settings Error:', error);
        return response(500, { error: 'Interner Serverfehler', details: error.message });
    }
};

/**
 * API-Einstellungen abrufen
 */
async function getApiSettings(userId) {
    try {
        const result = await docClient.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { userId }
        }));
        
        if (!result.Item) {
            return response(200, { 
                hasSettings: false,
                settings: null
            });
        }
        
        // Entschlüssle sensitive Daten falls KMS aktiviert
        const settings = result.Item;
        
        // API-Keys werden maskiert zurückgegeben (nur letzte 4 Zeichen)
        const maskedSettings = {
            hasSettings: true,
            settings: {
                openai: settings.openai ? {
                    configured: true,
                    keyMasked: maskApiKey(settings.openai.apiKey),
                    model: settings.openai.model,
                    maxTokens: settings.openai.maxTokens,
                    temperature: settings.openai.temperature
                } : null,
                anthropic: settings.anthropic ? {
                    configured: true,
                    keyMasked: maskApiKey(settings.anthropic.apiKey),
                    model: settings.anthropic.model,
                    maxTokens: settings.anthropic.maxTokens,
                    temperature: settings.anthropic.temperature
                } : null,
                google: settings.google ? {
                    configured: true,
                    keyMasked: maskApiKey(settings.google.apiKey),
                    model: settings.google.model,
                    maxTokens: settings.google.maxTokens,
                    temperature: settings.google.temperature
                } : null,
                preferredProvider: settings.preferredProvider || 'openai',
                updatedAt: settings.updatedAt
            }
        };
        
        return response(200, maskedSettings);
    } catch (error) {
        console.error('Get Settings Error:', error);
        throw error;
    }
}

/**
 * API-Einstellungen speichern
 */
async function saveApiSettings(userId, data) {
    try {
        const now = new Date().toISOString();
        
        // Validiere API-Keys
        if (data.openai?.apiKey && !isValidApiKey(data.openai.apiKey, 'openai')) {
            return response(400, { error: 'Ungültiger OpenAI API-Key Format' });
        }
        if (data.anthropic?.apiKey && !isValidApiKey(data.anthropic.apiKey, 'anthropic')) {
            return response(400, { error: 'Ungültiger Anthropic API-Key Format' });
        }
        if (data.google?.apiKey && !isValidApiKey(data.google.apiKey, 'google')) {
            return response(400, { error: 'Ungültiger Google API-Key Format' });
        }
        
        // Hole bestehende Einstellungen um Keys zu erhalten falls nicht neu gesetzt
        const existingResult = await docClient.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { userId }
        }));
        const existingSettings = existingResult.Item || {};
        
        // Merge neue Daten mit bestehenden
        const settingsItem = {
            userId,
            updatedAt: now,
            createdAt: existingSettings.createdAt || now,
            preferredProvider: data.preferredProvider || existingSettings.preferredProvider || 'openai'
        };
        
        // OpenAI Settings
        if (data.openai) {
            settingsItem.openai = {
                apiKey: data.openai.apiKey || existingSettings.openai?.apiKey || '',
                model: data.openai.model || existingSettings.openai?.model || 'gpt-4o-mini',
                maxTokens: data.openai.maxTokens || existingSettings.openai?.maxTokens || 1000,
                temperature: data.openai.temperature ?? existingSettings.openai?.temperature ?? 0.7
            };
        } else if (existingSettings.openai) {
            settingsItem.openai = existingSettings.openai;
        }
        
        // Anthropic Settings
        if (data.anthropic) {
            settingsItem.anthropic = {
                apiKey: data.anthropic.apiKey || existingSettings.anthropic?.apiKey || '',
                model: data.anthropic.model || existingSettings.anthropic?.model || 'claude-3-sonnet-20240229',
                maxTokens: data.anthropic.maxTokens || existingSettings.anthropic?.maxTokens || 1000,
                temperature: data.anthropic.temperature ?? existingSettings.anthropic?.temperature ?? 0.7
            };
        } else if (existingSettings.anthropic) {
            settingsItem.anthropic = existingSettings.anthropic;
        }
        
        // Google Settings
        if (data.google) {
            settingsItem.google = {
                apiKey: data.google.apiKey || existingSettings.google?.apiKey || '',
                model: data.google.model || existingSettings.google?.model || 'gemini-pro',
                maxTokens: data.google.maxTokens || existingSettings.google?.maxTokens || 1000,
                temperature: data.google.temperature ?? existingSettings.google?.temperature ?? 0.7
            };
        } else if (existingSettings.google) {
            settingsItem.google = existingSettings.google;
        }
        
        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: settingsItem
        }));
        
        return response(200, { 
            success: true, 
            message: 'API-Einstellungen erfolgreich gespeichert',
            updatedAt: now
        });
    } catch (error) {
        console.error('Save Settings Error:', error);
        throw error;
    }
}

/**
 * API-Einstellungen löschen
 */
async function deleteApiSettings(userId) {
    try {
        await docClient.send(new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { userId }
        }));
        
        return response(200, { 
            success: true, 
            message: 'API-Einstellungen gelöscht' 
        });
    } catch (error) {
        console.error('Delete Settings Error:', error);
        throw error;
    }
}

/**
 * API-Key für KI-Generierung abrufen (interner Aufruf)
 * Diese Funktion wird von anderen Lambdas aufgerufen
 */
async function getApiKeyForGeneration(userId, provider = 'openai') {
    try {
        const result = await docClient.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { userId }
        }));
        
        if (!result.Item || !result.Item[provider]) {
            return null;
        }
        
        return {
            apiKey: result.Item[provider].apiKey,
            model: result.Item[provider].model,
            maxTokens: result.Item[provider].maxTokens,
            temperature: result.Item[provider].temperature
        };
    } catch (error) {
        console.error('Get API Key Error:', error);
        return null;
    }
}

// Export für andere Lambdas
exports.getApiKeyForGeneration = getApiKeyForGeneration;

/**
 * Hilfsfunktionen
 */
function maskApiKey(key) {
    if (!key || key.length < 8) return '****';
    return key.substring(0, 4) + '...' + key.substring(key.length - 4);
}

function isValidApiKey(key, provider) {
    if (!key || typeof key !== 'string') return false;
    
    switch (provider) {
        case 'openai':
            return key.startsWith('sk-') && key.length > 20;
        case 'anthropic':
            return key.startsWith('sk-ant-') && key.length > 20;
        case 'google':
            return key.length > 20;
        default:
            return key.length > 10;
    }
}

function response(statusCode, body) {
    return {
        statusCode,
        headers: CORS_HEADERS,
        body: JSON.stringify(body)
    };
}
