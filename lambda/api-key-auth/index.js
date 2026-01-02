/**
 * API Key Authentication Handler
 * Private/Public Key Pair Authentication mit Token-Generierung
 */

const AWS = require('aws-sdk');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.API_KEYS_TABLE || 'mawps-api-keys';
const TOKEN_SECRET = process.env.JWT_SECRET || process.env.TOKEN_SECRET || 'your-secret-key-change-in-production';
const TOKEN_EXPIRY = 4000; // 4000 Sekunden (ca. 66 Minuten)

const ALLOWED_ORIGINS = [
    'https://manuel-weiss.ch',
    'https://www.manuel-weiss.ch',
    'https://mawps.netlify.app',
    'http://localhost:3000',
    'http://localhost:8000'
];

// Helper function to create CORS headers
const getCORSHeaders = (origin) => {
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-API-Key',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    };
};

/**
 * Generiert eine Challenge für den Client
 */
async function generateChallenge(apiKeyId) {
    const challenge = crypto.randomBytes(32).toString('base64');
    const expiresAt = Date.now() + 60000; // 1 Minute Gültigkeit
    
    // Speichere Challenge in DynamoDB
    await dynamoDB.put({
        TableName: TABLE_NAME,
        Item: {
            pk: `challenge#${apiKeyId}`,
            sk: 'challenge',
            challenge: challenge,
            expiresAt: expiresAt,
            createdAt: new Date().toISOString()
        }
    }).promise();
    
    return challenge;
}

/**
 * Validiert die Signatur mit dem Public Key
 */
function verifySignature(publicKeyPem, challenge, signature) {
    try {
        const verify = crypto.createVerify('RSA-SHA256');
        verify.update(challenge);
        verify.end();
        return verify.verify(publicKeyPem, signature, 'base64');
    } catch (error) {
        console.error('Signature verification error:', error);
        return false;
    }
}

/**
 * Lädt Public Key aus DynamoDB
 */
async function getPublicKey(apiKeyId) {
    const result = await dynamoDB.get({
        TableName: TABLE_NAME,
        Key: {
            pk: `apikey#${apiKeyId}`,
            sk: 'publickey'
        }
    }).promise();
    
    if (!result.Item) {
        return null;
    }
    
    return result.Item.publicKey;
}

/**
 * Generiert JWT Token
 */
function generateToken(apiKeyId, metadata = {}) {
    const payload = {
        apiKeyId: apiKeyId,
        type: 'api-key',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY,
        ...metadata
    };
    
    return jwt.sign(payload, TOKEN_SECRET, { algorithm: 'HS256' });
}

/**
 * Registriert einen neuen Public Key
 */
async function registerPublicKey(apiKeyId, publicKeyPem, metadata = {}) {
    // Validiere Public Key Format
    try {
        crypto.createPublicKey(publicKeyPem);
    } catch (error) {
        throw new Error('Invalid public key format');
    }
    
    const item = {
        pk: `apikey#${apiKeyId}`,
        sk: 'publickey',
        apiKeyId: apiKeyId,
        publicKey: publicKeyPem,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true,
        ...metadata
    };
    
    await dynamoDB.put({
        TableName: TABLE_NAME,
        Item: item
    }).promise();
    
    return item;
}

exports.handler = async (event) => {
    console.log('🔑 API Key Auth Handler - Event:', JSON.stringify(event, null, 2));
    
    const origin = event.headers?.origin || event.headers?.Origin || (event.multiValueHeaders && event.multiValueHeaders.origin && event.multiValueHeaders.origin[0]);
    const headers = getCORSHeaders(origin);
    
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS' || (event.requestContext && event.requestContext.http && event.requestContext.http.method === 'OPTIONS')) {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }
    
    try {
        const path = event.path || event.rawPath || (event.requestContext && (event.requestContext.path || event.requestContext.resourcePath)) || '';
        const method = event.httpMethod || (event.requestContext && (event.requestContext.http?.method || event.requestContext.httpMethod)) || '';
        
        // Parse body safely
        let body = {};
        if (event.body) {
            try {
                body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
            } catch (parseError) {
                console.error('❌ Body parse error:', parseError);
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Invalid JSON in request body' })
                };
            }
        }
        
        console.log('📋 Parsed:', { path, method, bodyKeys: Object.keys(body), queryParams: event.queryStringParameters });
        
        // POST /auth/api-key/register - Public Key registrieren
        if (method === 'POST' && path.includes('/auth/api-key/register')) {
            const { apiKeyId, publicKey, metadata } = body;
            
            if (!apiKeyId || !publicKey) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ 
                        error: 'Missing required fields: apiKeyId, publicKey' 
                    })
                };
            }
            
            const keyData = await registerPublicKey(apiKeyId, publicKey, metadata);
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Public key registered successfully',
                    apiKeyId: keyData.apiKeyId,
                    createdAt: keyData.createdAt
                })
            };
        }
        
        // POST /auth/api-key/challenge - Challenge generieren
        if (method === 'POST' && (path.includes('/auth/api-key/challenge') || path === '/challenge' || path.endsWith('/challenge'))) {
            const { apiKeyId } = body;
            
            if (!apiKeyId) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Missing apiKeyId' })
                };
            }
            
            // Prüfe ob Public Key existiert
            const publicKey = await getPublicKey(apiKeyId);
            if (!publicKey) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'API Key not found. Please register your public key first.' })
                };
            }
            
            const challenge = await generateChallenge(apiKeyId);
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    challenge: challenge,
                    expiresIn: 60 // 60 Sekunden
                })
            };
        }
        
        // POST /auth/api-key/token - Token generieren mit Signatur
        if (method === 'POST' && (path.includes('/auth/api-key/token') || path === '/token' || path.endsWith('/token'))) {
            const { apiKeyId, challenge, signature } = body;
            
            if (!apiKeyId || !challenge || !signature) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ 
                        error: 'Missing required fields: apiKeyId, challenge, signature' 
                    })
                };
            }
            
            // Lade Challenge aus DynamoDB
            const challengeData = await dynamoDB.get({
                TableName: TABLE_NAME,
                Key: {
                    pk: `challenge#${apiKeyId}`,
                    sk: 'challenge'
                }
            }).promise();
            
            if (!challengeData.Item) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'Challenge not found or expired' })
                };
            }
            
            // Prüfe Ablaufzeit
            if (Date.now() > challengeData.Item.expiresAt) {
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({ error: 'Challenge expired' })
                };
            }
            
            // Prüfe ob Challenge übereinstimmt
            if (challengeData.Item.challenge !== challenge) {
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({ error: 'Invalid challenge' })
                };
            }
            
            // Lade Public Key
            const publicKey = await getPublicKey(apiKeyId);
            if (!publicKey) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'API Key not found' })
                };
            }
            
            // Validiere Signatur
            const isValid = verifySignature(publicKey, challenge, signature);
            if (!isValid) {
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({ error: 'Invalid signature' })
                };
            }
            
            // Lösche Challenge (einmalige Verwendung)
            await dynamoDB.delete({
                TableName: TABLE_NAME,
                Key: {
                    pk: `challenge#${apiKeyId}`,
                    sk: 'challenge'
                }
            }).promise();
            
            // Generiere Token
            const token = generateToken(apiKeyId);
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    token: token,
                    expiresIn: TOKEN_EXPIRY,
                    tokenType: 'Bearer'
                })
            };
        }
        
        // GET /auth/api-key/status - API Key Status prüfen
        if (method === 'GET' && (path.includes('/auth/api-key/status') || path === '/status' || path.endsWith('/status'))) {
            // Parse query string parameters from different event formats
            const queryParams = event.queryStringParameters || 
                               (event.multiValueQueryStringParameters && 
                                Object.keys(event.multiValueQueryStringParameters).reduce((acc, key) => {
                                    acc[key] = event.multiValueQueryStringParameters[key][0];
                                    return acc;
                                }, {})) || {};
            
            const apiKeyId = queryParams.apiKeyId || queryParams['apiKeyId'];
            
            console.log('📋 Query Params:', JSON.stringify(queryParams));
            console.log('🔑 API Key ID:', apiKeyId);
            
            if (!apiKeyId) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Missing apiKeyId query parameter' })
                };
            }
            
            const publicKey = await getPublicKey(apiKeyId);
            
            if (!publicKey) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ 
                        registered: false,
                        message: 'API Key not registered' 
                    })
                };
            }
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    registered: true,
                    apiKeyId: apiKeyId,
                    active: true
                })
            };
        }
        
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Endpoint not found' })
        };
        
    } catch (error) {
        console.error('❌ API Key Auth Error:', error);
        console.error('❌ Error Stack:', error.stack);
        console.error('❌ Event:', JSON.stringify(event, null, 2));
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: error.message || 'Internal server error',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
};

