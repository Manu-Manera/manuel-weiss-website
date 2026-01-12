/**
 * Netlify Function: Hero Video Settings
 * Speichert und lädt die aktuelle Hero-Video-URL aus DynamoDB
 */

const { DynamoDBClient, PutItemCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

// Verwende alternative Variablennamen, da AWS_REGION reserviert ist
const awsRegion = process.env.NETLIFY_AWS_REGION || process.env.AWS_REGION || 'eu-central-1';
const accessKeyId = process.env.NETLIFY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.NETLIFY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

// DynamoDB Client mit expliziten Credentials initialisieren
const dynamoDB = new DynamoDBClient({ 
    region: awsRegion,
    credentials: accessKeyId && secretAccessKey ? {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
    } : undefined // Falls keine Credentials, verwendet SDK die IAM-Rolle
});

const TABLE_NAME = process.env.DYNAMODB_SETTINGS_TABLE || 'manuel-weiss-settings';
const SETTINGS_KEY = 'hero-video-url';

exports.handler = async (event, context) => {
    // CORS Headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle CORS Preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // Prüfe AWS Credentials (nur für POST/PUT notwendig, GET kann auch ohne funktionieren)
        // Unterstütze alternative Variablennamen, da AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY reserviert sind
        if (event.httpMethod === 'POST' || event.httpMethod === 'PUT') {
            const accessKeyId = process.env.NETLIFY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
            const secretAccessKey = process.env.NETLIFY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
            
            if (!accessKeyId || !secretAccessKey) {
                console.error('AWS Credentials missing!');
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ 
                        error: 'Server configuration error',
                        message: 'AWS credentials not configured. Please set NETLIFY_AWS_ACCESS_KEY_ID and NETLIFY_AWS_SECRET_ACCESS_KEY in Netlify environment variables.'
                    })
                };
            }
        }

        // GET: Lade aktuelle Video-URL
        if (event.httpMethod === 'GET') {
            // Prüfe AWS Credentials auch für GET
            const accessKeyId = process.env.NETLIFY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
            const secretAccessKey = process.env.NETLIFY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
            
            if (!accessKeyId || !secretAccessKey) {
                console.error('❌ AWS Credentials missing for GET request!');
                console.error('NETLIFY_AWS_ACCESS_KEY_ID:', accessKeyId ? 'SET' : 'MISSING');
                console.error('NETLIFY_AWS_SECRET_ACCESS_KEY:', secretAccessKey ? 'SET' : 'MISSING');
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ 
                        error: 'Server configuration error',
                        message: 'AWS credentials not configured. Please set NETLIFY_AWS_ACCESS_KEY_ID and NETLIFY_AWS_SECRET_ACCESS_KEY in Netlify environment variables.',
                        videoUrl: null,
                        updatedAt: null
                    })
                };
            }
            
            const params = {
                TableName: TABLE_NAME,
                Key: marshall({
                    settingKey: SETTINGS_KEY
                })
            };

            try {
                console.log('🔍 Attempting to load hero video from DynamoDB:', {
                    table: TABLE_NAME,
                    key: SETTINGS_KEY,
                    region: awsRegion
                });
                
                const result = await dynamoDB.send(new GetItemCommand(params));
                
                console.log('📥 DynamoDB result:', {
                    hasItem: !!result.Item,
                    itemKeys: result.Item ? Object.keys(unmarshall(result.Item)) : []
                });
                
                if (result.Item) {
                    const item = unmarshall(result.Item);
                    console.log('✅ Hero video URL loaded:', item.settingValue);
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            videoUrl: item.settingValue || null,
                            updatedAt: item.updatedAt || null
                        })
                    };
                } else {
                    // Keine Einstellung vorhanden
                    console.log('ℹ️ No hero video setting found in DynamoDB');
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            videoUrl: null,
                            updatedAt: null
                        })
                    };
                }
            } catch (dbError) {
                // Logge den Fehler detailliert
                console.error('❌ DynamoDB error:', {
                    message: dbError.message,
                    code: dbError.code,
                    name: dbError.name,
                    stack: dbError.stack
                });
                
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({
                        error: 'Database error',
                        message: dbError.message,
                        code: dbError.code,
                        videoUrl: null,
                        updatedAt: null
                    })
                };
            }
        }

        // POST/PUT: Speichere Video-URL
        if (event.httpMethod === 'POST' || event.httpMethod === 'PUT') {
            const body = JSON.parse(event.body || '{}');
            const { videoUrl } = body;

            if (!videoUrl || typeof videoUrl !== 'string') {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'videoUrl is required and must be a string' })
                };
            }

            const params = {
                TableName: TABLE_NAME,
                Item: marshall({
                    settingKey: SETTINGS_KEY,
                    settingValue: videoUrl,
                    updatedAt: new Date().toISOString()
                })
            };

            await dynamoDB.send(new PutItemCommand(params));

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    videoUrl,
                    updatedAt: params.Item.updatedAt
                })
            };
        }

        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };

    } catch (error) {
        console.error('Error in hero-video-settings:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message 
            })
        };
    }
};

