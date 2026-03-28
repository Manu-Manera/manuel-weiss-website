/**
 * AWS Lambda: Snowflake / Blüten-Spiel Highscores
 * GET öffentlich: nur Name, Score, Datum (keine E-Mail).
 * GET mit Header X-Admin-Highscore-Secret + Env HIGHSCORE_ADMIN_SECRET: alle Einträge inkl. E-Mail (nur für Admin-Panel).
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Admin-Highscore-Secret',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Content-Type': 'application/json'
};

const dynamoClient = new DynamoDBClient({
    region: process.env.AWS_REGION || 'eu-central-1'
});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const TABLE_NAME = process.env.HIGHSCORES_TABLE || 'snowflake-highscores';

function getHeader(event, name) {
    const h = event.headers || {};
    const key = Object.keys(h).find((k) => k.toLowerCase() === name.toLowerCase());
    return key ? String(h[key]).trim() : '';
}

function sanitizeEmail(raw) {
    if (raw == null || typeof raw !== 'string') return '';
    const t = raw.trim().slice(0, 120);
    if (!t) return '';
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(t) ? t : '';
}

function isAdminRequest(event) {
    const secret = process.env.HIGHSCORE_ADMIN_SECRET;
    if (!secret || String(secret).length < 8) return false;
    const provided = getHeader(event, 'X-Admin-Highscore-Secret');
    return provided === secret;
}

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }

    try {
        if (event.httpMethod === 'GET') {
            const result = await docClient.send(new ScanCommand({
                TableName: TABLE_NAME
            }));

            const items = result.Items || [];
            const admin = isAdminRequest(event);

            let highscores = items.map((item) => {
                const base = {
                    name: item.name,
                    score: item.score,
                    date: item.date
                };
                if (admin) {
                    return {
                        ...base,
                        id: item.id,
                        timestamp: item.timestamp,
                        email: item.email || ''
                    };
                }
                return base;
            });

            highscores.sort((a, b) => b.score - a.score);

            if (!admin) {
                highscores = highscores.slice(0, 10);
            } else {
                highscores = highscores.slice(0, 500);
            }

            return {
                statusCode: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify({ highscores, adminView: admin })
            };
        }

        if (event.httpMethod === 'POST') {
            let body;
            try {
                body = JSON.parse(event.body);
            } catch (e) {
                return {
                    statusCode: 400,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({ error: 'Invalid JSON', message: e.message })
                };
            }

            const { name, score } = body;

            if (!name || typeof score !== 'number' || score < 0) {
                return {
                    statusCode: 400,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({
                        error: 'Invalid input',
                        message: 'Name and valid score (>= 0) required'
                    })
                };
            }

            const emailClean = sanitizeEmail(body.email);
            const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            const item = {
                id,
                name: String(name).substring(0, 20),
                score: Number(score),
                date: new Date().toLocaleDateString('de-DE'),
                timestamp: Date.now()
            };
            if (emailClean) {
                item.email = emailClean;
            }

            await docClient.send(new PutCommand({
                TableName: TABLE_NAME,
                Item: item
            }));

            console.log('Highscore saved:', { id, name: item.name, score: item.score, hasEmail: !!emailClean });

            const scan = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
            let highscores = (scan.Items || []).map((i) => ({
                name: i.name,
                score: i.score,
                date: i.date
            }));
            highscores.sort((a, b) => b.score - a.score);
            highscores = highscores.slice(0, 10);

            return {
                statusCode: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify({ success: true, highscores })
            };
        }

        if (event.httpMethod === 'DELETE') {
            const scanResult = await docClient.send(new ScanCommand({
                TableName: TABLE_NAME
            }));

            const items = scanResult.Items || [];
            console.log(`Deleting ${items.length} highscores...`);

            for (const item of items) {
                await docClient.send(new DeleteCommand({
                    TableName: TABLE_NAME,
                    Key: { id: item.id }
                }));
            }

            return {
                statusCode: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify({
                    success: true,
                    message: `${items.length} Highscores gelöscht`,
                    highscores: []
                })
            };
        }

        return {
            statusCode: 405,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    } catch (error) {
        console.error('Highscores Error:', error);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Internal server error', message: error.message })
        };
    }
};
