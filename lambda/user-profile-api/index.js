/**
 * AWS Lambda: User Profile API
 * AWS Lambda
 * Endpunkte für alle Profile-Tabs
 * 
 * 🔒 ALLE Endpoints erfordern Authentifizierung
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

// AWS Lambda verwendet automatisch IAM Role
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });
const dynamoDB = DynamoDBDocumentClient.from(dynamoClient);

const PROFILES_TABLE = process.env.PROFILES_TABLE || 'mawps-user-profiles';
const APPLICATIONS_TABLE = process.env.APPLICATIONS_TABLE || 'mawps-applications';
const RESUMES_TABLE = process.env.RESUMES_TABLE || 'mawps-resumes';
const COVER_LETTERS_TABLE = process.env.COVER_LETTERS_TABLE || 'mawps-cover-letters';

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
        if (cleanPath.startsWith('/user-profile-api')) {
            cleanPath = cleanPath.replace('/user-profile-api', '') || '/';
        }
        if (!cleanPath.startsWith('/')) {
            cleanPath = '/' + cleanPath;
        }

        console.log(`👤 User Profile API: ${method} ${cleanPath} - User: ${user.userId}`);

        // Route: GET /personal - Persönliche Daten
        if (method === 'GET' && cleanPath === '/personal') {
            try {
                const result = await dynamoDB.send(new GetCommand({
                    TableName: PROFILES_TABLE,
                    Key: { userId: user.userId }
                }));

                const profile = result.Item || {};
                return {
                    statusCode: 200,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({
                        firstName: profile.firstName || '',
                        lastName: profile.lastName || '',
                        email: profile.email || '',
                        phone: profile.phone || '',
                        birthDate: profile.birthDate || '',
                        location: profile.location || '',
                        profession: profile.profession || '',
                        company: profile.company || '',
                        experience: profile.experience || '',
                        industry: profile.industry || '',
                        goals: profile.goals || '',
                        interests: profile.interests || ''
                    })
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

        // Route: PUT /personal - Persönliche Daten speichern
        if (method === 'PUT' && cleanPath === '/personal') {
            try {
                const data = JSON.parse(event.body || '{}');
                
                await dynamoDB.send(new PutCommand({
                    TableName: PROFILES_TABLE,
                    Item: {
                        userId: user.userId,
                        ...data,
                        updatedAt: new Date().toISOString()
                    }
                }));

                return {
                    statusCode: 200,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({ success: true, message: 'Profil gespeichert' })
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

        // Route: GET /applications - Bewerbungsmanager Daten
        if (method === 'GET' && cleanPath === '/applications') {
            try {
                // Lade Bewerbungen
                const applicationsResult = await dynamoDB.send(new QueryCommand({
                    TableName: APPLICATIONS_TABLE,
                    KeyConditionExpression: 'userId = :userId',
                    ExpressionAttributeValues: { ':userId': user.userId }
                }));

                const applications = applicationsResult.Items || [];

                // Statistiken berechnen
                const stats = {
                    total: applications.length,
                    active: applications.filter(a => ['preparation', 'sent', 'confirmed', 'interview'].includes(a.status)).length,
                    successRate: applications.length > 0 
                        ? Math.round((applications.filter(a => a.status === 'offer').length / applications.length) * 100)
                        : 0,
                    interviewsScheduled: applications.filter(a => a.status === 'interview').length
                };

                return {
                    statusCode: 200,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({
                        applications,
                        stats
                    })
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

        // Route: GET /applications/resumes - Lebensläufe
        if (method === 'GET' && cleanPath === '/applications/resumes') {
            try {
                const resumesResult = await dynamoDB.send(new QueryCommand({
                    TableName: RESUMES_TABLE,
                    KeyConditionExpression: 'userId = :userId',
                    ExpressionAttributeValues: { ':userId': user.userId }
                }));

                return {
                    statusCode: 200,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({
                        resumes: resumesResult.Items || []
                    })
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

        // Route: GET /applications/cover-letters - Anschreiben
        if (method === 'GET' && cleanPath === '/applications/cover-letters') {
            try {
                const lettersResult = await dynamoDB.send(new QueryCommand({
                    TableName: COVER_LETTERS_TABLE,
                    KeyConditionExpression: 'userId = :userId',
                    ExpressionAttributeValues: { ':userId': user.userId }
                }));

                return {
                    statusCode: 200,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({
                        coverLetters: lettersResult.Items || []
                    })
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

        // Route: GET /settings - Einstellungen
        if (method === 'GET' && cleanPath === '/settings') {
            try {
                const result = await dynamoDB.send(new GetCommand({
                    TableName: PROFILES_TABLE,
                    Key: { userId: user.userId }
                }));

                const profile = result.Item || {};
                return {
                    statusCode: 200,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({
                        emailNotifications: profile.emailNotifications !== false,
                        weeklySummary: profile.weeklySummary !== false,
                        reminders: profile.reminders || false,
                        theme: profile.theme || 'light',
                        language: profile.language || 'de',
                        dataSharing: profile.dataSharing || false
                    })
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

        // Route: PUT /settings - Einstellungen speichern
        if (method === 'PUT' && cleanPath === '/settings') {
            try {
                const data = JSON.parse(event.body || '{}');
                
                await dynamoDB.send(new UpdateCommand({
                    TableName: PROFILES_TABLE,
                    Key: { userId: user.userId },
                    UpdateExpression: 'SET emailNotifications = :en, weeklySummary = :ws, reminders = :r, theme = :t, language = :l, dataSharing = :ds, updatedAt = :ua',
                    ExpressionAttributeValues: {
                        ':en': data.emailNotifications,
                        ':ws': data.weeklySummary,
                        ':r': data.reminders,
                        ':t': data.theme,
                        ':l': data.language,
                        ':ds': data.dataSharing,
                        ':ua': new Date().toISOString()
                    }
                }));

                return {
                    statusCode: 200,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({ success: true, message: 'Einstellungen gespeichert' })
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

        // Route: GET /progress - Fortschritt
        if (method === 'GET' && cleanPath === '/progress') {
            return {
                statusCode: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify({
                    overallProgress: 0,
                    completedMethods: 0,
                    categories: []
                })
            };
        }

        // Route: GET /achievements - Erfolge
        if (method === 'GET' && cleanPath === '/achievements') {
            return {
                statusCode: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify({
                    achievements: [],
                    level: 1,
                    points: 0
                })
            };
        }

        // Route: GET /training - Training
        if (method === 'GET' && cleanPath === '/training') {
            return {
                statusCode: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify({
                    stats: {
                        totalWorkouts: 0,
                        currentStreak: 0,
                        totalMinutes: 0,
                        longestStreak: 0
                    },
                    currentPlan: null,
                    recentWorkouts: []
                })
            };
        }

        // Route: GET /nutrition - Ernährung
        if (method === 'GET' && cleanPath === '/nutrition') {
            return {
                statusCode: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify({
                    todaySummary: {
                        calories: 0,
                        goal: 2000,
                        macros: { protein: 0, carbs: 0, fat: 0 }
                    },
                    stats: {
                        mealsLogged: 0,
                        avgCaloriesPerDay: 0
                    }
                })
            };
        }

        // Route: GET /coach - Coach
        if (method === 'GET' && cleanPath === '/coach') {
            return {
                statusCode: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify({
                    level: 1,
                    points: 0,
                    categories: {},
                    recentAchievements: [],
                    recommendations: []
                })
            };
        }

        // Route: GET /journal - Tagebuch
        if (method === 'GET' && cleanPath === '/journal') {
            return {
                statusCode: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify({
                    stats: {
                        totalEntries: 0,
                        streak: 0,
                        thisMonth: 0,
                        avgMood: null
                    },
                    entries: []
                })
            };
        }

        return { 
            statusCode: 404, 
            headers: CORS_HEADERS, 
            body: JSON.stringify({ error: 'Endpoint not found', path: cleanPath, method }) 
        };

    } catch (error) {
        console.error('❌ User Profile API Error:', error);
        return { 
            statusCode: 500, 
            headers: CORS_HEADERS, 
            body: JSON.stringify({ error: error.message || 'Internal server error' }) 
        };
    }
};
