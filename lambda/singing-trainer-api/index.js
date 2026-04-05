const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE = process.env.PROGRESS_TABLE || 'mawps-singing-progress';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-User-Id',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Content-Type': 'application/json'
};

function response(statusCode, body) {
    return { statusCode, headers: CORS_HEADERS, body: JSON.stringify(body) };
}

async function getProgress(event) {
    const userId = event.queryStringParameters?.userId;
    if (!userId) return response(400, { error: 'userId is required' });

    try {
        const result = await docClient.send(new GetCommand({
            TableName: TABLE,
            Key: { userId }
        }));
        return response(200, { progress: result.Item || null });
    } catch (err) {
        console.error('getProgress error:', err);
        return response(500, { error: err.message });
    }
}

async function saveProgress(event) {
    const body = JSON.parse(event.body || '{}');
    const { userId, currentLevel, totalXP, streak, lastSessionDate, sessionsCompleted, calibration, levelProgress } = body;

    if (!userId) return response(400, { error: 'userId is required' });

    const now = new Date().toISOString();

    try {
        await docClient.send(new PutCommand({
            TableName: TABLE,
            Item: {
                userId,
                currentLevel: currentLevel || 1,
                totalXP: totalXP || 0,
                streak: streak || 0,
                lastSessionDate: lastSessionDate || now,
                sessionsCompleted: sessionsCompleted || 0,
                calibration: calibration || null,
                levelProgress: levelProgress || {},
                updatedAt: now
            }
        }));
        return response(200, { success: true });
    } catch (err) {
        console.error('saveProgress error:', err);
        return response(500, { error: err.message });
    }
}

async function saveCalibration(event) {
    const body = JSON.parse(event.body || '{}');
    const { userId, calibration } = body;

    if (!userId || !calibration) return response(400, { error: 'userId and calibration are required' });

    try {
        await docClient.send(new UpdateCommand({
            TableName: TABLE,
            Key: { userId },
            UpdateExpression: 'SET calibration = :cal, updatedAt = :now',
            ExpressionAttributeValues: {
                ':cal': calibration,
                ':now': new Date().toISOString()
            }
        }));
        return response(200, { success: true });
    } catch (err) {
        console.error('saveCalibration error:', err);
        return response(500, { error: err.message });
    }
}

function getExercises(event) {
    const level = parseInt(event.queryStringParameters?.level || '1');
    try {
        const LEVEL_INFO = {
            1: { name: 'Atem & Summen', xp_required: 0 },
            2: { name: 'SOVT Basics', xp_required: 100 },
            3: { name: 'Tonleitern', xp_required: 300 },
            4: { name: 'Dynamik & Register', xp_required: 600 },
            5: { name: 'Melodie-Phrasen', xp_required: 1000 },
            6: { name: 'Song Performance', xp_required: 1500 }
        };
        return response(200, {
            level,
            levelInfo: LEVEL_INFO[level] || LEVEL_INFO[1],
            message: 'Exercises are loaded client-side from singing-exercises.js'
        });
    } catch (err) {
        return response(500, { error: err.message });
    }
}

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));

    if (event.httpMethod === 'OPTIONS') {
        return response(200, {});
    }

    const path = event.path || '';
    const method = event.httpMethod;

    try {
        if (path.includes('/singing-trainer/progress') && method === 'GET') {
            return await getProgress(event);
        }
        if (path.includes('/singing-trainer/progress') && method === 'POST') {
            return await saveProgress(event);
        }
        if (path.includes('/singing-trainer/calibrate') && method === 'POST') {
            return await saveCalibration(event);
        }
        if (path.includes('/singing-trainer/exercises') && method === 'GET') {
            return getExercises(event);
        }
        return response(404, { error: 'Route not found', path, method });
    } catch (err) {
        console.error('Handler error:', err);
        return response(500, { error: err.message });
    }
};
