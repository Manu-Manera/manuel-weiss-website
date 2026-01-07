/**
 * Netlify Function: Hero Video Settings
 * Speichert und lädt die aktuelle Hero-Video-URL aus DynamoDB
 */

const { DynamoDBClient, PutItemCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

const dynamoDB = new DynamoDBClient({ 
    region: process.env.AWS_REGION || 'eu-central-1' 
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
            const params = {
                TableName: TABLE_NAME,
                Key: marshall({
                    settingKey: SETTINGS_KEY
                })
            };

            try {
                const result = await dynamoDB.send(new GetItemCommand(params));
                
                if (result.Item) {
                    const item = unmarshall(result.Item);
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
                // Falls Tabelle nicht existiert, gib null zurück
                console.warn('Settings table not found or error:', dbError);
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
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

