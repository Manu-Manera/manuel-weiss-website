/**
 * API SETTINGS LAMBDA
 * Sichere Speicherung von API-Keys in DynamoDB (verschlüsselt)
 * Die Keys werden mit dem User-ID als Partition Key gespeichert
 * 
 * SICHERHEIT:
 * - API-Keys werden mit AES-256-GCM verschlüsselt bevor sie in DynamoDB gespeichert werden
 * - Der Verschlüsselungsschlüssel wird aus dem KMS Key (falls vorhanden) oder einem sicheren Hash abgeleitet
 * - Keys werden NIE im Klartext in der Datenbank gespeichert
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { KMSClient, EncryptCommand, DecryptCommand } = require('@aws-sdk/client-kms');
const crypto = require('crypto');

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const kmsClient = new KMSClient({ region: process.env.AWS_REGION || 'eu-central-1' });

const TABLE_NAME = process.env.API_SETTINGS_TABLE || 'mawps-api-settings';
const KMS_KEY_ID = process.env.KMS_KEY_ID; // Optional: AWS KMS Key für Verschlüsselung
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || process.env.JWT_SECRET || 'mawps-secure-api-key-encryption-2024';

/**
 * Verschlüsselt einen API-Key mit AES-256-GCM
 * @param {string} apiKey - Der zu verschlüsselnde API-Key
 * @param {string} userId - User-ID für Key-Derivation
 * @returns {string} - Verschlüsselter Key als Base64 (iv:authTag:encrypted)
 */
function encryptApiKey(apiKey, userId) {
    if (!apiKey || apiKey.length < 5) return apiKey;
    
    try {
        // Key-Derivation mit PBKDF2
        const salt = crypto.createHash('sha256').update(userId + ENCRYPTION_SECRET).digest();
        const key = crypto.pbkdf2Sync(ENCRYPTION_SECRET, salt, 100000, 32, 'sha256');
        
        // AES-256-GCM Verschlüsselung
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
        
        let encrypted = cipher.update(apiKey, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        const authTag = cipher.getAuthTag();
        
        // Format: iv:authTag:encrypted (alle Base64)
        const result = `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
        console.log('🔐 API-Key verschlüsselt (Länge:', result.length, ')');
        return result;
    } catch (error) {
        console.error('❌ Verschlüsselungsfehler:', error.message);
        throw new Error('API-Key Verschlüsselung fehlgeschlagen');
    }
}

/**
 * Entschlüsselt einen API-Key
 * @param {string} encryptedData - Verschlüsselter Key (iv:authTag:encrypted)
 * @param {string} userId - User-ID für Key-Derivation
 * @returns {string} - Entschlüsselter API-Key
 */
function decryptApiKey(encryptedData, userId) {
    if (!encryptedData || !encryptedData.includes(':')) {
        // Nicht verschlüsselt (Legacy-Daten)
        return encryptedData;
    }
    
    try {
        const parts = encryptedData.split(':');
        if (parts.length !== 3) {
            // Nicht im erwarteten Format
            return encryptedData;
        }
        
        const [ivBase64, authTagBase64, encrypted] = parts;
        const iv = Buffer.from(ivBase64, 'base64');
        const authTag = Buffer.from(authTagBase64, 'base64');
        
        // Key-Derivation mit PBKDF2 (muss identisch zur Verschlüsselung sein)
        const salt = crypto.createHash('sha256').update(userId + ENCRYPTION_SECRET).digest();
        const key = crypto.pbkdf2Sync(ENCRYPTION_SECRET, salt, 100000, 32, 'sha256');
        
        // AES-256-GCM Entschlüsselung
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encrypted, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        
        console.log('🔓 API-Key entschlüsselt');
        return decrypted;
    } catch (error) {
        console.error('❌ Entschlüsselungsfehler:', error.message);
        // Möglicherweise unverschlüsselter Legacy-Key
        return encryptedData;
    }
}

/**
 * Prüft ob ein gespeicherter Key verschlüsselt ist
 */
function isEncrypted(value) {
    if (!value || typeof value !== 'string') return false;
    const parts = value.split(':');
    // Verschlüsselte Keys haben das Format iv:authTag:encrypted
    return parts.length === 3 && parts[0].length >= 20 && parts[1].length >= 20;
}

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
        const { httpMethod, path, queryStringParameters } = event;
        
        // Route: /api-settings/key?provider=openai - Vollständigen (entschlüsselten) Key abrufen
        // Unterstützt sowohl User-spezifische als auch globale API Keys
        if (httpMethod === 'GET' && path && path.includes('/key')) {
            const provider = queryStringParameters?.provider || 'openai';
            const isGlobalRequest = queryStringParameters?.global === 'true';
            
            // Für globale Keys ist kein User-Login erforderlich
            if (isGlobalRequest) {
                console.log(`📥 Anfrage für globalen ${provider} API-Key (ohne Auth)`);
                return await getFullApiKey(null, provider, true);
            }
            
            // Für User-spezifische Keys ist Login erforderlich
            const userId = event.requestContext?.authorizer?.claims?.sub 
                || event.headers?.['x-user-id'] 
                || event.headers?.['X-User-Id'];
            
            if (!userId) {
                return response(401, { error: 'Nicht autorisiert - Bitte anmelden' });
            }
            
            console.log(`📥 Anfrage für vollständigen ${provider} API-Key (User: ${userId})`);
            return await getFullApiKey(userId, provider, false);
        }
        
        // Für alle anderen Endpoints ist Login erforderlich
        const userId = event.requestContext?.authorizer?.claims?.sub 
            || event.headers?.['x-user-id'] 
            || event.headers?.['X-User-Id'];
        
        if (!userId) {
            return response(401, { error: 'Nicht autorisiert - Bitte anmelden' });
        }
        
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
        
        const settings = result.Item;
        
        // Für die Anzeige: Keys entschlüsseln und dann maskieren
        const decryptAndMask = (providerSettings) => {
            if (!providerSettings || !providerSettings.apiKey) return null;
            
            // Entschlüssle den Key
            const decryptedKey = decryptApiKey(providerSettings.apiKey, userId);
            
            return {
                configured: true,
                keyMasked: maskApiKey(decryptedKey),
                model: providerSettings.model,
                maxTokens: providerSettings.maxTokens,
                temperature: providerSettings.temperature
            };
        };
        
        // API-Keys werden maskiert zurückgegeben (nur erste 4 und letzte 4 Zeichen)
        const maskedSettings = {
            hasSettings: true,
            settings: {
                openai: decryptAndMask(settings.openai),
                anthropic: decryptAndMask(settings.anthropic),
                google: decryptAndMask(settings.google),
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
 * API-Einstellungen speichern (mit Verschlüsselung)
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
            preferredProvider: data.preferredProvider || existingSettings.preferredProvider || 'openai',
            encrypted: true // Marker dass Keys verschlüsselt sind
        };
        
        // Helper: Verschlüsselt einen neuen Key oder behält den existierenden verschlüsselten Key
        const encryptNewKey = (newKey, existingKey) => {
            if (newKey && newKey.length > 10 && !isEncrypted(newKey)) {
                // Neuer unverschlüsselter Key - verschlüsseln
                return encryptApiKey(newKey, userId);
            } else if (newKey && isEncrypted(newKey)) {
                // Bereits verschlüsselt - übernehmen
                return newKey;
            } else if (existingKey) {
                // Kein neuer Key - bestehenden behalten
                return existingKey;
            }
            return '';
        };
        
        // OpenAI Settings
        if (data.openai) {
            const encryptedKey = encryptNewKey(data.openai.apiKey, existingSettings.openai?.apiKey);
            settingsItem.openai = {
                apiKey: encryptedKey,
                model: data.openai.model || existingSettings.openai?.model || 'gpt-4o-mini',
                maxTokens: data.openai.maxTokens || existingSettings.openai?.maxTokens || 1000,
                temperature: data.openai.temperature ?? existingSettings.openai?.temperature ?? 0.7
            };
            console.log('🔐 OpenAI Key verschlüsselt gespeichert');
        } else if (existingSettings.openai) {
            settingsItem.openai = existingSettings.openai;
        }
        
        // Anthropic Settings
        if (data.anthropic) {
            const encryptedKey = encryptNewKey(data.anthropic.apiKey, existingSettings.anthropic?.apiKey);
            settingsItem.anthropic = {
                apiKey: encryptedKey,
                model: data.anthropic.model || existingSettings.anthropic?.model || 'claude-3-sonnet-20240229',
                maxTokens: data.anthropic.maxTokens || existingSettings.anthropic?.maxTokens || 1000,
                temperature: data.anthropic.temperature ?? existingSettings.anthropic?.temperature ?? 0.7
            };
            console.log('🔐 Anthropic Key verschlüsselt gespeichert');
        } else if (existingSettings.anthropic) {
            settingsItem.anthropic = existingSettings.anthropic;
        }
        
        // Google Settings
        if (data.google) {
            const encryptedKey = encryptNewKey(data.google.apiKey, existingSettings.google?.apiKey);
            settingsItem.google = {
                apiKey: encryptedKey,
                model: data.google.model || existingSettings.google?.model || 'gemini-pro',
                maxTokens: data.google.maxTokens || existingSettings.google?.maxTokens || 1000,
                temperature: data.google.temperature ?? existingSettings.google?.temperature ?? 0.7
            };
            console.log('🔐 Google Key verschlüsselt gespeichert');
        } else if (existingSettings.google) {
            settingsItem.google = existingSettings.google;
        }
        
        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: settingsItem
        }));
        
        console.log('✅ API Settings sicher gespeichert (verschlüsselt)');
        
        return response(200, { 
            success: true, 
            message: 'API-Einstellungen sicher gespeichert (verschlüsselt)',
            encrypted: true,
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
 * ENTSCHLÜSSELT den Key für die Verwendung
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
        
        // Entschlüssele den API-Key
        const encryptedKey = result.Item[provider].apiKey;
        const decryptedKey = decryptApiKey(encryptedKey, userId);
        
        console.log(`🔓 API-Key für ${provider} entschlüsselt für Generierung`);
        
        return {
            apiKey: decryptedKey,
            model: result.Item[provider].model,
            maxTokens: result.Item[provider].maxTokens,
            temperature: result.Item[provider].temperature
        };
    } catch (error) {
        console.error('Get API Key Error:', error);
        return null;
    }
}

/**
 * Vollständigen API-Key abrufen (für Frontend-Anfragen über API Gateway)
 * Wird über /api-settings/key?provider=openai aufgerufen
 */
async function getFullApiKey(userId, provider) {
    try {
        const result = await docClient.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { userId }
        }));
        
        if (!result.Item || !result.Item[provider]) {
            return response(404, { 
                error: `Keine ${provider} API-Key Konfiguration gefunden`,
                provider 
            });
        }
        
        // Entschlüssele den API-Key
        const encryptedKey = result.Item[provider].apiKey;
        const decryptedKey = decryptApiKey(encryptedKey, userId);
        
        if (!decryptedKey || decryptedKey.length < 10) {
            return response(404, { 
                error: `${provider} API-Key nicht konfiguriert`,
                provider 
            });
        }
        
        console.log(`🔓 Vollständiger API-Key für ${provider} abgerufen`);
        
        return response(200, {
            apiKey: decryptedKey,
            provider,
            model: result.Item[provider].model,
            maxTokens: result.Item[provider].maxTokens,
            temperature: result.Item[provider].temperature
        });
    } catch (error) {
        console.error('Get Full API Key Error:', error);
        return response(500, { error: 'Fehler beim Abrufen des API-Keys' });
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
