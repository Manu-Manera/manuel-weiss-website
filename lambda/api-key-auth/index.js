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
        console.log('🔐 verifySignature called:');
        console.log('  publicKeyPem length:', publicKeyPem?.length);
        console.log('  challenge length:', challenge?.length);
        console.log('  signature length:', signature?.length);
        console.log('  publicKeyPem (first 100):', publicKeyPem?.substring(0, 100));
        
        // Normalisiere Public Key (falls nötig)
        let normalizedPublicKey = publicKeyPem;
        if (publicKeyPem.includes('\\n')) {
            normalizedPublicKey = publicKeyPem.replace(/\\n/g, '\n');
            console.log('  Public Key normalisiert (\\n → \\n)');
        }
        
        // Erstelle Public Key Object
        const publicKeyObject = crypto.createPublicKey(normalizedPublicKey);
        console.log('  Public Key Object erstellt:', {
            type: publicKeyObject.asymmetricKeyType,
            size: publicKeyObject.asymmetricKeySize
        });
        
        // Validiere Signature
        const verify = crypto.createVerify('RSA-SHA256');
        verify.update(challenge);
        verify.end();
        
        const isValid = verify.verify(publicKeyObject, signature, 'base64');
        console.log('  Signature valid:', isValid);
        
        return isValid;
    } catch (error) {
        console.error('❌ Signature verification error:', error);
        console.error('  Error message:', error.message);
        console.error('  Error stack:', error.stack);
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
    
    let publicKey = result.Item.publicKey;
    
    // Normalisiere Public Key (falls nötig)
    // DynamoDB kann Newlines als \n speichern
    if (typeof publicKey === 'string' && publicKey.includes('\\n')) {
        publicKey = publicKey.replace(/\\n/g, '\n');
        console.log('🔑 Public Key normalisiert (\\n → \\n)');
    }
    
    console.log('🔑 Public Key geladen, Länge:', publicKey.length);
    console.log('🔑 Public Key (first 100):', publicKey.substring(0, 100));
    
    return publicKey;
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
    console.log('🔑 registerPublicKey called with:', { apiKeyId, publicKeyLength: publicKeyPem?.length });
    console.log('🔑 Public key (first 100 chars):', publicKeyPem?.substring(0, 100));
    
    // Normalisiere Public Key (entferne \n Escape-Sequenzen falls vorhanden)
    let normalizedKey = publicKeyPem.replace(/\\n/g, '\n');
    
    // Prüfe ob Public Key im PEM-Format ist (mit BEGIN/END)
    const hasPemHeaders = normalizedKey.includes('-----BEGIN') && normalizedKey.includes('-----END');
    
    if (!hasPemHeaders) {
        // Versuche Public Key zu konvertieren (falls nur Base64-String)
        console.log('⚠️ Public Key hat keine PEM-Header, versuche Konvertierung...');
        
        // Entferne Whitespace
        const base64Key = normalizedKey.trim().replace(/\s/g, '');
        
        // Prüfe ob es Base64 ist
        if (base64Key.match(/^[A-Za-z0-9+/=]+$/)) {
            try {
                // Konvertiere Base64 zu Buffer und dann zu PEM
                const keyBuffer = Buffer.from(base64Key, 'base64');
                const keyObject = crypto.createPublicKey({
                    key: keyBuffer,
                    format: 'der',
                    type: 'spki'
                });
                
                // Exportiere als PEM
                normalizedKey = keyObject.export({
                    format: 'pem',
                    type: 'spki'
                });
                
                console.log('✅ Public Key erfolgreich konvertiert (Base64 → PEM)');
            } catch (convertError) {
                console.error('❌ Konvertierung fehlgeschlagen:', convertError.message);
                // Versuche es als PEM ohne Header
                normalizedKey = `-----BEGIN PUBLIC KEY-----\n${base64Key.match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`;
                console.log('⚠️ Versuche manuelle PEM-Formatierung...');
            }
        }
    }
    
    console.log('🔑 Normalized key length:', normalizedKey.length);
    console.log('🔑 Normalized key (first 100 chars):', normalizedKey.substring(0, 100));
    
    // Validiere Public Key Format
    try {
        crypto.createPublicKey(normalizedKey);
        console.log('✅ Public key format valid');
    } catch (error) {
        console.error('❌ Invalid public key format:', error.message);
        console.error('❌ Public key (first 200 chars):', normalizedKey.substring(0, 200));
        throw new Error('Invalid public key format: ' + error.message);
    }
    
    const item = {
        pk: `apikey#${apiKeyId}`,
        sk: 'publickey',
        apiKeyId: apiKeyId,
        publicKey: normalizedKey, // Verwende normalisierten Key
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true,
        ...metadata
    };
    
    console.log('💾 Saving to DynamoDB:', { table: TABLE_NAME, pk: item.pk, sk: item.sk });
    
    try {
        await dynamoDB.put({
            TableName: TABLE_NAME,
            Item: item
        }).promise();
        console.log('✅ Public key saved to DynamoDB');
    } catch (dbError) {
        console.error('❌ DynamoDB error:', dbError);
        console.error('❌ DynamoDB error stack:', dbError.stack);
        throw new Error('Failed to save public key: ' + dbError.message);
    }
    
    return item;
}

exports.handler = async (event) => {
    try {
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
        // Normalize path: Remove stage prefix (/prod/, /dev/, etc.)
        let rawPath = event.path || event.rawPath || (event.requestContext && (event.requestContext.path || event.requestContext.resourcePath)) || '';
        // Remove stage prefix if present (e.g., /prod/auth/api-key/status -> /auth/api-key/status)
        const path = rawPath.replace(/^\/[^\/]+\//, '/').replace(/^\/prod\//, '/').replace(/^\/dev\//, '/') || rawPath;
        const method = event.httpMethod || (event.requestContext && (event.requestContext.http?.method || event.requestContext.httpMethod)) || '';
        
        console.log('🔍 Path normalization:', { rawPath, normalizedPath: path });
        
        // Parse body safely
        let body = {};
        if (event.body) {
            try {
                if (typeof event.body === 'string') {
                    // API Gateway kann Body als String oder bereits geparstes Objekt senden
                    // Versuche zuerst zu parsen
                    try {
                        body = JSON.parse(event.body);
                    } catch (parseError) {
                        // Falls Parsing fehlschlägt, könnte es Base64 encoded sein (bei binary content)
                        if (event.isBase64Encoded) {
                            const decodedBody = Buffer.from(event.body, 'base64').toString('utf-8');
                            body = JSON.parse(decodedBody);
                        } else {
                            // Versuche Body als String zu behandeln (falls es kein JSON ist)
                            throw parseError;
                        }
                    }
                } else {
                    body = event.body;
                }
                console.log('✅ Body parsed successfully');
                console.log('📋 Body keys:', Object.keys(body));
            } catch (parseError) {
                console.error('❌ Body parse error:', parseError);
                console.error('❌ Body type:', typeof event.body);
                console.error('❌ Body (first 300 chars):', event.body?.substring(0, 300));
                console.error('❌ isBase64Encoded:', event.isBase64Encoded);
                
                // Versuche Body manuell zu bereinigen (entferne ungültige Newlines)
                if (typeof event.body === 'string') {
                    try {
                        // Ersetze unescaped Newlines in JSON-Strings
                        // Finde JSON-String-Werte und escape Newlines darin
                        let cleanedBody = event.body;
                        
                        // Ersetze Newlines in String-Werten (zwischen Anführungszeichen)
                        cleanedBody = cleanedBody.replace(/("(?:[^"\\]|\\.)*")\s*\n\s*(")/g, '$1\\n$2');
                        cleanedBody = cleanedBody.replace(/([^\\])\n([^"])/g, function(match, before, after) {
                            // Prüfe ob wir in einem String sind (ungerade Anzahl von " vor dem \n)
                            const beforeStr = event.body.substring(0, event.body.indexOf(match));
                            const quoteCount = (beforeStr.match(/"/g) || []).length;
                            if (quoteCount % 2 === 1) {
                                // Wir sind in einem String
                                return before + '\\n' + after;
                            }
                            return match;
                        });
                        
                        // Einfacherer Ansatz: Ersetze alle Newlines die nicht escaped sind
                        cleanedBody = cleanedBody.replace(/([^\\])\n/g, '$1\\n').replace(/^\n/g, '\\n');
                        
                        body = JSON.parse(cleanedBody);
                        console.log('✅ Body nach Bereinigung geparst');
                    } catch (cleanError) {
                        console.error('❌ Body-Bereinigung fehlgeschlagen:', cleanError);
                        console.error('❌ Versuche alternativen Ansatz...');
                        
                        // Alternativer Ansatz: Versuche Body als Text zu parsen und manuell JSON zu erstellen
                        try {
                            // Extrahiere apiKeyId und publicKey manuell
                            const apiKeyIdMatch = event.body.match(/"apiKeyId"\s*:\s*"([^"]+)"/);
                            const publicKeyMatch = event.body.match(/"publicKey"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/s) || 
                                                   event.body.match(/"publicKey"\s*:\s*"([\s\S]*?)"/);
                            
                            if (apiKeyIdMatch && publicKeyMatch) {
                                body = {
                                    apiKeyId: apiKeyIdMatch[1],
                                    publicKey: publicKeyMatch[1].replace(/\\n/g, '\n')
                                };
                                console.log('✅ Body manuell geparst (Alternative)');
                            } else {
                                throw cleanError;
                            }
                        } catch (altError) {
                            return {
                                statusCode: 400,
                                headers,
                                body: JSON.stringify({ 
                                    error: 'Invalid JSON in request body',
                                    details: parseError.message,
                                    hint: 'Postman sollte Newlines automatisch escaped haben. Falls nicht, verwende format-key-for-postman.js Script.'
                                })
                            };
                        }
                    }
                } else {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({ 
                            error: 'Invalid JSON in request body',
                            details: parseError.message
                        })
                    };
                }
            }
        }
        
        console.log('📋 Parsed:', { path, method, bodyKeys: Object.keys(body), queryParams: event.queryStringParameters });
        
        // POST /auth/api-key/register - Public Key registrieren
        if (method === 'POST' && (path.includes('/auth/api-key/register') || path.includes('/register') || path.endsWith('/register'))) {
            console.log('✅ POST /register matched!');
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
            
            try {
                const keyData = await registerPublicKey(apiKeyId, publicKey, metadata);
                console.log('✅ Public key registered:', keyData.apiKeyId);
                
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
            } catch (registerError) {
                console.error('❌ Register error:', registerError);
                console.error('❌ Register error stack:', registerError.stack);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({
                        error: 'Failed to register public key',
                        details: registerError.message
                    })
                };
            }
        }
        
        // POST /auth/api-key/challenge - Challenge generieren
        if (method === 'POST' && (path.includes('/auth/api-key/challenge') || path.includes('/challenge') || path.endsWith('/challenge'))) {
            console.log('✅ POST /challenge matched!');
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
        if (method === 'POST' && (path.includes('/auth/api-key/token') || path.includes('/token') || path.endsWith('/token'))) {
            console.log('✅ POST /token matched!');
            console.log('📋 Body:', JSON.stringify(body, null, 2));
            console.log('📋 Body keys:', Object.keys(body));
            
            const { apiKeyId, challenge, signature } = body;
            
            console.log('🔍 Extracted values:', { 
                apiKeyId: apiKeyId ? 'present' : 'missing',
                challenge: challenge ? 'present' : 'missing',
                signature: signature ? 'present' : 'missing',
                apiKeyIdValue: apiKeyId,
                challengeLength: challenge?.length,
                signatureLength: signature?.length
            });
            
            if (!apiKeyId || !challenge || !signature) {
                console.error('❌ Missing fields:', {
                    apiKeyId: !apiKeyId,
                    challenge: !challenge,
                    signature: !signature,
                    bodyKeys: Object.keys(body),
                    bodyString: JSON.stringify(body)
                });
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ 
                        error: 'Missing required fields: apiKeyId, challenge, signature',
                        received: {
                            apiKeyId: !!apiKeyId,
                            challenge: !!challenge,
                            signature: !!signature,
                            bodyKeys: Object.keys(body)
                        }
                    })
                };
            }
            
            // Lade Challenge aus DynamoDB
            console.log('🔍 Lade Challenge aus DynamoDB für:', apiKeyId);
            const challengeData = await dynamoDB.get({
                TableName: TABLE_NAME,
                Key: {
                    pk: `challenge#${apiKeyId}`,
                    sk: 'challenge'
                }
            }).promise();
            
            console.log('📋 Challenge Data aus DynamoDB:', {
                found: !!challengeData.Item,
                challenge: challengeData.Item?.challenge?.substring(0, 50) + '...',
                expiresAt: challengeData.Item?.expiresAt,
                now: Date.now(),
                expired: challengeData.Item ? Date.now() > challengeData.Item.expiresAt : null
            });
            
            if (!challengeData.Item) {
                console.error('❌ Challenge nicht gefunden in DynamoDB');
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'Challenge not found or expired' })
                };
            }
            
            // Prüfe Ablaufzeit
            if (Date.now() > challengeData.Item.expiresAt) {
                console.error('❌ Challenge abgelaufen:', {
                    expiresAt: challengeData.Item.expiresAt,
                    now: Date.now(),
                    diff: Date.now() - challengeData.Item.expiresAt
                });
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({ error: 'Challenge expired' })
                };
            }
            
            // Prüfe ob Challenge übereinstimmt
            if (challengeData.Item.challenge !== challenge) {
                console.error('❌ Challenge stimmt nicht überein:', {
                    stored: challengeData.Item.challenge?.substring(0, 50) + '...',
                    received: challenge?.substring(0, 50) + '...',
                    match: challengeData.Item.challenge === challenge,
                    storedLength: challengeData.Item.challenge?.length,
                    receivedLength: challenge?.length
                });
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({ error: 'Invalid challenge' })
                };
            }
            
            console.log('✅ Challenge validiert');
            
            // Lade Public Key
            const publicKey = await getPublicKey(apiKeyId);
            if (!publicKey) {
                console.error('❌ Public Key nicht gefunden für:', apiKeyId);
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'API Key not found' })
                };
            }
            
            console.log('✅ Public Key geladen, Länge:', publicKey.length);
            console.log('🔐 Validiere Signature...');
            console.log('📋 Input für Verifizierung:');
            console.log('  apiKeyId:', apiKeyId);
            console.log('  challenge (first 50):', challenge.substring(0, 50) + '...');
            console.log('  challenge length:', challenge.length);
            console.log('  signature (first 50):', signature.substring(0, 50) + '...');
            console.log('  signature length:', signature.length);
            console.log('  publicKey (first 100):', publicKey.substring(0, 100) + '...');
            console.log('  publicKey length:', publicKey.length);
            
            // Validiere Signatur
            const isValid = verifySignature(publicKey, challenge, signature);
            
            console.log('🔍 Signature Validation Result:', {
                isValid: isValid,
                challengeLength: challenge.length,
                signatureLength: signature.length,
                publicKeyLength: publicKey.length
            });
            
            if (!isValid) {
                console.error('❌ Signature-Validierung fehlgeschlagen');
                console.error('  Challenge (first 50):', challenge.substring(0, 50));
                console.error('  Signature (first 50):', signature.substring(0, 50));
                console.error('  Public Key (first 100):', publicKey.substring(0, 100));
                
                // Versuche erneut mit normalisiertem Public Key
                const normalizedPublicKey = publicKey.replace(/\\n/g, '\n');
                const isValidRetry = verifySignature(normalizedPublicKey, challenge, signature);
                console.log('🔍 Retry mit normalisiertem Public Key:', isValidRetry);
                
                if (!isValidRetry) {
                    return {
                        statusCode: 401,
                        headers,
                        body: JSON.stringify({ 
                            error: 'Invalid signature',
                            hint: 'Prüfe ob Challenge, Signature und Private Key korrekt sind. Challenge ist 60 Sekunden gültig.'
                        })
                    };
                }
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
            
            const apiKeyId = queryParams?.apiKeyId || queryParams?.['apiKeyId'];
            
            console.log('📋 Query Params:', JSON.stringify(queryParams));
            console.log('🔑 API Key ID:', apiKeyId);
            console.log('🔍 Full event.queryStringParameters:', JSON.stringify(event.queryStringParameters));
            console.log('🔍 Full event.multiValueQueryStringParameters:', JSON.stringify(event.multiValueQueryStringParameters));
            
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

