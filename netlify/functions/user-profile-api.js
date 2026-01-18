/**
 * User Profile API - API-First Architecture
 * Endpunkte für alle Profile-Tabs
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = new DynamoDBClient({
    region: process.env.NETLIFY_AWS_REGION || process.env.AWS_REGION || 'eu-central-1',
    credentials: {
        accessKeyId: process.env.NETLIFY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.NETLIFY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY
    }
});
const dynamoDB = DynamoDBDocumentClient.from(dynamoClient);

const PROFILES_TABLE = process.env.PROFILES_TABLE || 'mawps-user-profiles';
const APPLICATIONS_TABLE = process.env.APPLICATIONS_TABLE || 'mawps-applications';
const RESUMES_TABLE = process.env.RESUMES_TABLE || 'mawps-resumes';
const COVER_LETTERS_TABLE = process.env.COVER_LETTERS_TABLE || 'mawps-cover-letters';

const ALLOWED_ORIGINS = [
    'https://manuel-weiss.ch',
    'https://www.manuel-weiss.ch',
    'https://mawps.netlify.app',
    'http://localhost:3000',
    'http://localhost:5500'
];

const getCORSHeaders = (origin) => {
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    };
};

function extractUserId(event) {
    const authHeader = event.headers?.authorization || event.headers?.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    try {
        const token = authHeader.substring(7);
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        return payload.sub || payload.userId || payload['cognito:username'];
    } catch (e) {
        return null;
    }
}

exports.handler = async (event) => {
    const origin = event.headers?.origin || event.headers?.Origin || '';
    const headers = getCORSHeaders(origin);

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const userId = extractUserId(event);
        if (!userId) {
            return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
        }

        const path = event.path.replace('/.netlify/functions/user-profile-api', '') || '/';
        const method = event.httpMethod;

        // Route: GET /personal - Persönliche Daten
        if (method === 'GET' && path === '/personal') {
            const result = await dynamoDB.send(new GetCommand({
                TableName: PROFILES_TABLE,
                Key: { userId }
            }));

            const profile = result.Item || {};
            return {
                statusCode: 200,
                headers,
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
        }

        // Route: PUT /personal - Persönliche Daten speichern
        if (method === 'PUT' && path === '/personal') {
            const data = JSON.parse(event.body || '{}');
            
            await dynamoDB.send(new PutCommand({
                TableName: PROFILES_TABLE,
                Item: {
                    userId,
                    ...data,
                    updatedAt: new Date().toISOString()
                }
            }));

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, message: 'Profil gespeichert' })
            };
        }

        // Route: GET /applications - Bewerbungsmanager Daten
        if (method === 'GET' && path === '/applications') {
            // Lade Bewerbungen
            const applicationsResult = await dynamoDB.send(new QueryCommand({
                TableName: APPLICATIONS_TABLE,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: { ':userId': userId }
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
                headers,
                body: JSON.stringify({
                    applications,
                    stats
                })
            };
        }

        // Route: GET /applications/resumes - Lebensläufe
        if (method === 'GET' && path === '/applications/resumes') {
            const resumesResult = await dynamoDB.send(new QueryCommand({
                TableName: RESUMES_TABLE,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: { ':userId': userId }
            }));

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    resumes: resumesResult.Items || []
                })
            };
        }

        // Route: GET /applications/cover-letters - Anschreiben
        if (method === 'GET' && path === '/applications/cover-letters') {
            const lettersResult = await dynamoDB.send(new QueryCommand({
                TableName: COVER_LETTERS_TABLE,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: { ':userId': userId }
            }));

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    coverLetters: lettersResult.Items || []
                })
            };
        }

        // Route: GET /settings - Einstellungen
        if (method === 'GET' && path === '/settings') {
            const result = await dynamoDB.send(new GetCommand({
                TableName: PROFILES_TABLE,
                Key: { userId }
            }));

            const profile = result.Item || {};
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    emailNotifications: profile.emailNotifications !== false,
                    weeklySummary: profile.weeklySummary !== false,
                    reminders: profile.reminders || false,
                    theme: profile.theme || 'light',
                    language: profile.language || 'de',
                    dataSharing: profile.dataSharing || false
                })
            };
        }

        // Route: PUT /settings - Einstellungen speichern
        if (method === 'PUT' && path === '/settings') {
            const data = JSON.parse(event.body || '{}');
            
            await dynamoDB.send(new UpdateCommand({
                TableName: PROFILES_TABLE,
                Key: { userId },
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
                headers,
                body: JSON.stringify({ success: true, message: 'Einstellungen gespeichert' })
            };
        }

        // Route: GET /progress - Fortschritt
        if (method === 'GET' && path === '/progress') {
            // TODO: Implementiere Fortschritts-API
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    overallProgress: 0,
                    completedMethods: 0,
                    categories: []
                })
            };
        }

        // Route: GET /achievements - Erfolge
        if (method === 'GET' && path === '/achievements') {
            // TODO: Implementiere Erfolge-API
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    achievements: [],
                    level: 1,
                    points: 0
                })
            };
        }

        // Route: GET /training - Training
        if (method === 'GET' && path === '/training') {
            // TODO: Implementiere Training-API
            return {
                statusCode: 200,
                headers,
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
        if (method === 'GET' && path === '/nutrition') {
            // TODO: Implementiere Ernährung-API
            return {
                statusCode: 200,
                headers,
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
        if (method === 'GET' && path === '/coach') {
            // TODO: Implementiere Coach-API
            return {
                statusCode: 200,
                headers,
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
        if (method === 'GET' && path === '/journal') {
            // TODO: Implementiere Tagebuch-API
            return {
                statusCode: 200,
                headers,
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

        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Endpoint not found' }) };

    } catch (error) {
        console.error('User Profile API Error:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    }
};
