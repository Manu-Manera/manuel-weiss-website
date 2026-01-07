const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

exports.handler = async (event) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: '',
        };
    }

    try {
        // Check for AWS credentials
        if (!process.env.NETLIFY_AWS_ACCESS_KEY_ID || !process.env.NETLIFY_AWS_SECRET_ACCESS_KEY) {
            console.error('Missing AWS credentials');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'Server configuration error',
                    message: 'AWS credentials not configured'
                }),
            };
        }

        // Initialize DynamoDB Client
        const dynamoClient = new DynamoDBClient({
            region: process.env.NETLIFY_AWS_REGION || 'eu-central-1',
            credentials: {
                accessKeyId: process.env.NETLIFY_AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.NETLIFY_AWS_SECRET_ACCESS_KEY,
            },
        });

        const docClient = DynamoDBDocumentClient.from(dynamoClient);
        const tableName = 'snowflake-highscores';

        // GET: Retrieve top 10 highscores
        if (event.httpMethod === 'GET') {
            const result = await docClient.send(new ScanCommand({
                TableName: tableName,
            }));

            let highscores = (result.Items || []).map(item => ({
                name: item.name,
                score: item.score,
                date: item.date,
            }));

            // Sort by score descending and take top 10
            highscores.sort((a, b) => b.score - a.score);
            highscores = highscores.slice(0, 10);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ highscores }),
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
                    headers,
                    body: JSON.stringify({ error: 'Invalid JSON', message: e.message }),
                };
            }

            const { name, score } = body;

            if (!name || typeof score !== 'number' || score < 0) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ 
                        error: 'Invalid input',
                        message: 'Name and valid score (>= 0) required'
                    }),
                };
            }

            const date = new Date().toISOString();
            const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            try {
                await docClient.send(new PutCommand({
                    TableName: tableName,
                    Item: {
                        id,
                        name: name.substring(0, 20), // Limit name length
                        score: Number(score),
                        date: new Date().toLocaleDateString('de-DE'),
                        timestamp: Date.now(),
                    },
                }));
            } catch (dbError) {
                console.error('DynamoDB PutItem error:', dbError);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ 
                        error: 'Database error',
                        message: dbError.message || 'Failed to save highscore'
                    }),
                };
            }

            // Get updated top 10
            const result = await docClient.send(new ScanCommand({
                TableName: tableName,
            }));

            let highscores = (result.Items || []).map(item => ({
                name: item.name,
                score: item.score,
                date: item.date,
            }));

            highscores.sort((a, b) => b.score - a.score);
            highscores = highscores.slice(0, 10);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: true,
                    highscores 
                }),
            };
        }

        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message 
            }),
        };
    }
};

