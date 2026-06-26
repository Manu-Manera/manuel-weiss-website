/**
 * AWS Lambda: Highscores (Snowflake-Spiel + weitere "games" via ?game=)
 *
 * Mehrere Ranglisten in EINER Tabelle, getrennt über das Feld `game`:
 *   - Ohne `game`  → Snowflake-Spiel (Rückwärtskompatibel; Items ohne game-Feld).
 *   - game=sinnesschule → anonyme "Schule der Sinne"-Rangliste.
 *
 * Pro Nutzer EIN Eintrag, wenn `game` UND `userId` mitgegeben werden
 * (id = `${game}#${userId}` → PutCommand überschreibt / Upsert, Bestwert bleibt erhalten).
 *
 * GET öffentlich: nur name, score, title, date (keine E-Mail, keine userId).
 * GET mit Header X-Admin-Highscore-Secret + Env HIGHSCORE_ADMIN_SECRET: alle Felder.
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

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

// Welche "game"-Rangliste ist gemeint? Items ohne game-Feld zählen als 'snowflake'.
function gameOf(item) {
    return item.game || 'snowflake';
}

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }

    try {
        if (event.httpMethod === 'GET') {
            const qs = event.queryStringParameters || {};
            const game = qs.game ? String(qs.game).slice(0, 40) : null;
            const limit = Math.min(parseInt(qs.limit, 10) || (game ? 25 : 10), 100);

            const result = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
            const allItems = result.Items || [];
            const admin = isAdminRequest(event);

            const filtered = allItems.filter((it) => {
                const g = gameOf(it);
                return game ? g === game : g === 'snowflake';
            });

            let highscores = filtered.map((item) => {
                const base = { name: item.name, score: item.score, date: item.date };
                if (item.title) base.title = item.title;
                if (admin) {
                    return { ...base, id: item.id, timestamp: item.timestamp, email: item.email || '', game: gameOf(item) };
                }
                return base;
            });

            highscores.sort((a, b) => b.score - a.score);
            highscores = highscores.slice(0, admin ? 500 : limit);

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

            const game = body.game ? String(body.game).slice(0, 40) : null;
            const userId = body.userId ? String(body.userId).slice(0, 80) : null;
            const title = body.title ? String(body.title).slice(0, 40) : null;
            const emailClean = sanitizeEmail(body.email);

            // Upsert pro Nutzer, wenn game + userId vorhanden (sonst neuer Eintrag wie bisher)
            const upsert = !!(game && userId);
            const id = upsert
                ? `${game}#${userId}`
                : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            let finalScore = Number(score);

            // Bestwert behalten: bestehenden Eintrag lesen
            if (upsert) {
                try {
                    const existing = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { id } }));
                    if (existing.Item && typeof existing.Item.score === 'number' && existing.Item.score > finalScore) {
                        finalScore = existing.Item.score;
                    }
                } catch (e) { /* ignore */ }
            }

            const item = {
                id,
                name: String(name).substring(0, 24),
                score: finalScore,
                date: new Date().toLocaleDateString('de-DE'),
                timestamp: Date.now()
            };
            if (game) item.game = game;
            if (title) item.title = title;
            if (emailClean) item.email = emailClean;

            await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));

            console.log('Highscore saved:', { id, game: game || 'snowflake', name: item.name, score: item.score });

            // Rangliste der passenden game-Gruppe zurückgeben
            const scan = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
            let highscores = (scan.Items || [])
                .filter((it) => (game ? gameOf(it) === game : gameOf(it) === 'snowflake'))
                .map((i) => {
                    const b = { name: i.name, score: i.score, date: i.date };
                    if (i.title) b.title = i.title;
                    return b;
                });
            highscores.sort((a, b) => b.score - a.score);
            highscores = highscores.slice(0, game ? 25 : 10);

            return {
                statusCode: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify({ success: true, highscores })
            };
        }

        if (event.httpMethod === 'DELETE') {
            // Nur Admin darf löschen; optional auf eine game-Gruppe begrenzt
            if (!isAdminRequest(event)) {
                return { statusCode: 403, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Forbidden' }) };
            }
            const qs = event.queryStringParameters || {};
            const game = qs.game ? String(qs.game).slice(0, 40) : null;

            const scanResult = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
            const items = (scanResult.Items || []).filter((it) => (game ? gameOf(it) === game : true));
            console.log(`Deleting ${items.length} highscores (game=${game || 'all'})...`);

            for (const item of items) {
                await docClient.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { id: item.id } }));
            }

            return {
                statusCode: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify({ success: true, message: `${items.length} Highscores gelöscht`, highscores: [] })
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
