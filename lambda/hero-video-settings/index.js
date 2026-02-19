/**
 * AWS Lambda: Hero Video Settings
 * AWS Lambda
 * Speichert und lädt die aktuelle Hero-Video-URL aus DynamoDB
 * 
 * 🔓 GET: Öffentlich (für Startseite)
 * 🔒 POST/PUT: Erfordern Authentifizierung (Admin-only)
 */

const { DynamoDBClient, PutItemCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

// AWS Lambda verwendet automatisch IAM Role
const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });

const SETTINGS_TABLE = process.env.SETTINGS_TABLE || 'manuel-weiss-settings';
const SETTINGS_KEY = 'hero-video-url';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Content-Type': 'application/json'
};

// Auth Helper Functions (aus backend/admin-user-management/handler.mjs)
function authUser(event) {
    const token = (event.headers?.authorization || event.headers?.Authorization || '').replace(/^Bearer\s+/, '');
    if (!token) {
        console.error('❌ No token provided in headers');
        throw new Error('Unauthorized - No token provided');
    }
    
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid token format');
        }
        
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        console.log('✅ Token decoded successfully, user:', payload.email || payload['cognito:username']);
        
        return { 
            userId: payload.sub, 
            email: payload.email || payload['cognito:username'],
            username: payload['cognito:username'] || payload.email
        };
    } catch (error) {
        console.error('❌ Token decode error:', error.message);
        throw new Error('Unauthorized - Invalid token: ' + error.message);
    }
}

async function isAdmin(userId, email) {
    // Check admin email list (vereinfacht - in Produktion sollte Cognito Group geprüft werden)
    const adminEmails = [
        'manuel@manuel-weiss.com',
        'admin@manuel-weiss.com',
        'manumanera@gmail.com',
        'weiss-manuel@gmx.de'
    ];
    
    const isInList = adminEmails.includes(email?.toLowerCase());
    console.log(`🔐 Admin check for ${email}: ${isInList ? '✅ Admin' : '❌ Not Admin'}`);
    
    return isInList;
}

exports.handler = async (event) => {
    // CORS Preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }

    try {
        // 🔓 GET: Öffentlich (für Startseite - keine Auth erforderlich)
        if (event.httpMethod === 'GET') {
            try {
                const result = await dynamoDB.send(new GetItemCommand({
                    TableName: SETTINGS_TABLE,
                    Key: marshall({ settingKey: SETTINGS_KEY })
                }));
                
                if (result.Item) {
                    const item = unmarshall(result.Item);
                    console.log('✅ Hero video URL loaded:', item.settingValue);
                    return {
                        statusCode: 200,
                        headers: CORS_HEADERS,
                        body: JSON.stringify({
                            videoUrl: item.settingValue || null,
                            updatedAt: item.updatedAt || null
                        })
                    };
                }
                
                return {
                    statusCode: 200,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({ videoUrl: null, updatedAt: null })
                };
            } catch (dbError) {
                console.error('❌ DynamoDB error:', dbError);
                return {
                    statusCode: 500,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({
                        error: 'Database error',
                        message: dbError.message
                    })
                };
            }
        }

        // 🔒 POST/PUT: Settings speichern (erfordern Auth - nur für Admin)
        if (event.httpMethod === 'POST' || event.httpMethod === 'PUT') {
            // Auth-Prüfung für POST/PUT
            let user;
            try {
                user = authUser(event);
                if (!(await isAdmin(user.userId, user.email))) {
                    return {
                        statusCode: 403,
                        headers: CORS_HEADERS,
                        body: JSON.stringify({ error: 'Admin access required' })
                    };
                }
            } catch (e) {
                return {
                    statusCode: 401,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({ error: 'Unauthorized', message: e.message || 'Authentication required' })
                };
            }
            
            const body = JSON.parse(event.body || '{}');
            const { videoUrl } = body;

            if (!videoUrl || typeof videoUrl !== 'string') {
                return {
                    statusCode: 400,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({ error: 'videoUrl is required and must be a string' })
                };
            }

            const now = new Date().toISOString();
            
            try {
                await dynamoDB.send(new PutItemCommand({
                    TableName: SETTINGS_TABLE,
                    Item: marshall({
                        settingKey: SETTINGS_KEY,
                        settingValue: videoUrl,
                        updatedAt: now
                    })
                }));

                return {
                    statusCode: 200,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({
                        success: true,
                        videoUrl,
                        updatedAt: now
                    })
                };
            } catch (dbError) {
                console.error('❌ DynamoDB error:', dbError);
                return {
                    statusCode: 500,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({
                        error: 'Database error',
                        message: dbError.message
                    })
                };
            }
        }

        return {
            statusCode: 405,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Method not allowed' })
        };

    } catch (error) {
        console.error('❌ Error in hero-video-settings:', error);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message 
            })
        };
    }
};
