/**
 * AWS Lambda: Bewerbungsprofil API
 * AWS Lambda
 * Verwaltet Bewerbungsprofile (Lebenslauf, Anschreiben, etc.)
 * 
 * 🔒 ALLE Endpoints erfordern Authentifizierung
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

// AWS Lambda verwendet automatisch IAM Role
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });
const dynamoDB = DynamoDBDocumentClient.from(dynamoClient);

const TABLE_NAME = process.env.USER_DATA_TABLE || 'mawps-user-data';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
};

// Auth Helper Functions
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
            userId: payload.sub || payload.userId || payload['cognito:username'],
            email: payload.email || payload['cognito:username'],
            username: payload['cognito:username'] || payload.email
        };
    } catch (error) {
        console.error('❌ Token decode error:', error.message);
        throw new Error('Unauthorized - Invalid token: ' + error.message);
    }
}

exports.handler = async (event) => {
    // CORS Preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }

    try {
        // 🔒 Auth ERFORDERLICH für ALLE Endpoints
        let user;
        try {
            user = authUser(event);
        } catch (e) {
            return {
                statusCode: 401,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Unauthorized', message: e.message || 'Authentication required' })
            };
        }

        // Parse path (API Gateway format)
        const path = event.path || event.resource || '/';
        const method = event.httpMethod || event.requestContext?.http?.method;
        
        // Remove API Gateway stage prefix if present
        let cleanPath = path;
        if (cleanPath.startsWith('/prod/') || cleanPath.startsWith('/v1/')) {
            cleanPath = cleanPath.replace(/^\/(prod|v1)\//, '/');
        }
        if (cleanPath.startsWith('/bewerbungsprofil')) {
            cleanPath = cleanPath.replace('/bewerbungsprofil', '') || '/';
        }
        if (!cleanPath.startsWith('/')) {
            cleanPath = '/' + cleanPath;
        }

        console.log(`📋 Bewerbungsprofil API: ${method} ${cleanPath} - User: ${user.userId}`);

        // GET / - Komplettes Profil laden
        if (method === 'GET' && cleanPath === '/') {
            try {
                const result = await dynamoDB.send(new GetCommand({
                    TableName: TABLE_NAME,
                    Key: { userId: user.userId, sk: 'bewerbungsprofil' }
                }));

                if (!result.Item) {
                    // Leeres Profil zurückgeben
                    return {
                        statusCode: 200,
                        headers: CORS_HEADERS,
                        body: JSON.stringify({
                            userId: user.userId,
                            personalInfo: {},
                            education: [],
                            experience: [],
                            skills: [],
                            languages: [],
                            certificates: [],
                            documents: [],
                            settings: {}
                        })
                    };
                }

                return { 
                    statusCode: 200, 
                    headers: CORS_HEADERS, 
                    body: JSON.stringify(result.Item) 
                };
            } catch (dbError) {
                console.error('❌ DynamoDB error:', dbError);
                return {
                    statusCode: 500,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({ error: 'Database error', message: dbError.message })
                };
            }
        }

        // GET /section/{name} - Einzelne Sektion laden
        if (method === 'GET' && cleanPath.match(/^\/section\/[^\/]+$/)) {
            const sectionName = cleanPath.split('/')[2];

            try {
                const result = await dynamoDB.send(new GetCommand({
                    TableName: TABLE_NAME,
                    Key: { userId: user.userId, sk: 'bewerbungsprofil' }
                }));

                if (!result.Item || !result.Item[sectionName]) {
                    return { 
                        statusCode: 200, 
                        headers: CORS_HEADERS, 
                        body: JSON.stringify([]) 
                    };
                }

                return { 
                    statusCode: 200, 
                    headers: CORS_HEADERS, 
                    body: JSON.stringify(result.Item[sectionName]) 
                };
            } catch (dbError) {
                console.error('❌ DynamoDB error:', dbError);
                return {
                    statusCode: 500,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({ error: 'Database error', message: dbError.message })
                };
            }
        }

        // POST / - Profil speichern/aktualisieren
        if (method === 'POST' || method === 'PUT') {
            const profileData = JSON.parse(event.body || '{}');
            
            const item = {
                userId: user.userId,
                sk: 'bewerbungsprofil',
                ...profileData,
                lastModified: new Date().toISOString()
            };

            try {
                await dynamoDB.send(new PutCommand({
                    TableName: TABLE_NAME,
                    Item: item
                }));

                return { 
                    statusCode: 200, 
                    headers: CORS_HEADERS, 
                    body: JSON.stringify(item) 
                };
            } catch (dbError) {
                console.error('❌ DynamoDB error:', dbError);
                return {
                    statusCode: 500,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({ error: 'Database error', message: dbError.message })
                };
            }
        }

        // PUT /section/{name} - Einzelne Sektion aktualisieren
        if (method === 'PUT' && cleanPath.match(/^\/section\/[^\/]+$/)) {
            const sectionName = cleanPath.split('/')[2];
            const sectionData = JSON.parse(event.body || '{}');

            try {
                // Erst Profil laden
                const existing = await dynamoDB.send(new GetCommand({
                    TableName: TABLE_NAME,
                    Key: { userId: user.userId, sk: 'bewerbungsprofil' }
                }));

                const item = {
                    ...(existing.Item || { userId: user.userId, sk: 'bewerbungsprofil' }),
                    [sectionName]: sectionData,
                    lastModified: new Date().toISOString()
                };

                await dynamoDB.send(new PutCommand({
                    TableName: TABLE_NAME,
                    Item: item
                }));

                return { 
                    statusCode: 200, 
                    headers: CORS_HEADERS, 
                    body: JSON.stringify({ success: true, section: sectionName }) 
                };
            } catch (dbError) {
                console.error('❌ DynamoDB error:', dbError);
                return {
                    statusCode: 500,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({ error: 'Database error', message: dbError.message })
                };
            }
        }

        // DELETE / - Profil löschen
        if (method === 'DELETE' && cleanPath === '/') {
            try {
                await dynamoDB.send(new DeleteCommand({
                    TableName: TABLE_NAME,
                    Key: { userId: user.userId, sk: 'bewerbungsprofil' }
                }));

                return { 
                    statusCode: 200, 
                    headers: CORS_HEADERS, 
                    body: JSON.stringify({ success: true }) 
                };
            } catch (dbError) {
                console.error('❌ DynamoDB error:', dbError);
                return {
                    statusCode: 500,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({ error: 'Database error', message: dbError.message })
                };
            }
        }

        return { 
            statusCode: 404, 
            headers: CORS_HEADERS, 
            body: JSON.stringify({ error: 'Endpoint not found', path: cleanPath, method }) 
        };

    } catch (error) {
        console.error('❌ Bewerbungsprofil API Error:', error);
        return { 
            statusCode: 500, 
            headers: CORS_HEADERS, 
            body: JSON.stringify({ error: error.message || 'Internal server error' }) 
        };
    }
};
