/**
 * AWS Lambda: Snowflake Game Highscores
 * AWS Lambda
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Content-Type': 'application/json'
};

// AWS Lambda verwendet automatisch IAM Role
const dynamoClient = new DynamoDBClient({
    region: process.env.AWS_REGION || 'eu-central-1'
});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const TABLE_NAME = process.env.HIGHSCORES_TABLE || 'snowflake-highscores';

exports.handler = async (event) => {
    // CORS Preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }

    try {
        // GET: Retrieve top 10 highscores
        if (event.httpMethod === 'GET') {
            const result = await docClient.send(new ScanCommand({
                TableName: TABLE_NAME
            }));

            let highscores = (result.Items || []).map(item => ({
                name: item.name,
                score: item.score,
                date: item.date
            }));

            // Sort by score descending and take top 10
            highscores.sort((a, b) => b.score - a.score);
            highscores = highscores.slice(0, 10);

            return {
                statusCode: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify({ highscores })
            };
        }

        // POST: Save new highscore
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

            const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            await docClient.send(new PutCommand({
                TableName: TABLE_NAME,
                Item: {
                    id,
                    name: name.substring(0, 20),
                    score: Number(score),
                    date: new Date().toLocaleDateString('de-DE'),
                    timestamp: Date.now()
                }
            }));

            console.log('Highscore saved:', { id, name, score });

            // Get updated top 10
            const result = await docClient.send(new ScanCommand({
                TableName: TABLE_NAME
            }));

            let highscores = (result.Items || []).map(item => ({
                name: item.name,
                score: item.score,
                date: item.date
            }));

            highscores.sort((a, b) => b.score - a.score);
            highscores = highscores.slice(0, 10);

            return {
                statusCode: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify({ success: true, highscores })
            };
        }

        // DELETE: Alle Highscores löschen (Admin)
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
