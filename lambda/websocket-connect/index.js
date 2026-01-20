/**
 * WebSocket Connect Handler
 * 
 * Wird aufgerufen, wenn ein Client sich verbindet.
 * Speichert die Verbindung in DynamoDB.
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE;

exports.handler = async (event) => {
    console.log('🔌 WebSocket Connect:', JSON.stringify(event, null, 2));
    
    const connectionId = event.requestContext.connectionId;
    const queryParams = event.queryStringParameters || {};
    const userId = queryParams.userId || 'anonymous-' + connectionId.substring(0, 8);
    const userName = queryParams.userName || 'Spieler';
    
    // TTL: Verbindung läuft nach 24 Stunden ab
    const ttl = Math.floor(Date.now() / 1000) + (24 * 60 * 60);
    
    try {
        // Prüfe ob User bereits verbunden ist (alte Verbindungen entfernen)
        const existingConnections = await docClient.send(new QueryCommand({
            TableName: CONNECTIONS_TABLE,
            IndexName: 'userId-index',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }));
        
        // Markiere alte Verbindungen als "replaced" (werden vom Client getrennt)
        // Die TTL wird sie automatisch aufräumen
        
        // Speichere neue Verbindung
        await docClient.send(new PutCommand({
            TableName: CONNECTIONS_TABLE,
            Item: {
                connectionId: connectionId,
                userId: userId,
                userName: userName,
                status: 'online',
                currentGame: null,
                connectedAt: new Date().toISOString(),
                lastActivity: new Date().toISOString(),
                ttl: ttl
            }
        }));
        
        console.log(`✅ User ${userName} (${userId}) connected with ${connectionId}`);
        
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Connected', connectionId })
        };
        
    } catch (error) {
        console.error('❌ Connect Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to connect' })
        };
    }
};
