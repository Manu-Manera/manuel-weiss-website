/**
 * WebSocket Disconnect Handler
 * 
 * Wird aufgerufen, wenn ein Client die Verbindung trennt.
 * Entfernt die Verbindung aus DynamoDB und informiert Mitspieler.
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, DeleteCommand, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { ApiGatewayManagementApiClient, PostToConnectionCommand } = require('@aws-sdk/client-apigatewaymanagementapi');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE;
const GAMES_TABLE = process.env.GAMES_TABLE;
const WEBSOCKET_ENDPOINT = process.env.WEBSOCKET_ENDPOINT;

exports.handler = async (event) => {
    console.log('🔌 WebSocket Disconnect:', JSON.stringify(event, null, 2));
    
    const connectionId = event.requestContext.connectionId;
    
    try {
        // Hole Verbindungsinfo
        const connectionResult = await docClient.send(new GetCommand({
            TableName: CONNECTIONS_TABLE,
            Key: { connectionId }
        }));
        
        const connection = connectionResult.Item;
        
        if (connection) {
            console.log(`👋 User ${connection.userName} (${connection.userId}) disconnecting`);
            
            // Falls in einem Spiel, informiere Gegner
            if (connection.currentGame) {
                await notifyGameOpponent(connection, 'opponent_disconnected');
            }
            
            // Aktualisiere Status auf "offline" (für kurze Reconnect-Möglichkeit)
            // oder lösche direkt
            await docClient.send(DeleteCommand({
                TableName: CONNECTIONS_TABLE,
                Key: { connectionId }
            }));
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Disconnected' })
        };
        
    } catch (error) {
        console.error('❌ Disconnect Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to disconnect cleanly' })
        };
    }
};

async function notifyGameOpponent(connection, messageType) {
    if (!WEBSOCKET_ENDPOINT || !connection.currentGame) return;
    
    try {
        const apiClient = new ApiGatewayManagementApiClient({
            endpoint: `https://${WEBSOCKET_ENDPOINT}`
        });
        
        // Finde das Spiel
        const gameResult = await docClient.send(new GetCommand({
            TableName: GAMES_TABLE,
            Key: { gameId: connection.currentGame }
        }));
        
        const game = gameResult.Item;
        if (!game) return;
        
        // Finde Gegner
        const opponentId = game.player1Id === connection.userId ? game.player2Id : game.player1Id;
        
        // Finde Gegner-Verbindung
        const opponentConnections = await docClient.send(new QueryCommand({
            TableName: CONNECTIONS_TABLE,
            IndexName: 'userId-index',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': opponentId
            }
        }));
        
        // Sende Nachricht an Gegner
        for (const oppConn of opponentConnections.Items || []) {
            try {
                await apiClient.send(new PostToConnectionCommand({
                    ConnectionId: oppConn.connectionId,
                    Data: JSON.stringify({
                        type: messageType,
                        gameId: connection.currentGame,
                        player: {
                            id: connection.userId,
                            name: connection.userName
                        },
                        timestamp: new Date().toISOString()
                    })
                }));
            } catch (e) {
                console.log(`Could not notify opponent connection ${oppConn.connectionId}:`, e.message);
            }
        }
        
    } catch (error) {
        console.error('Error notifying opponent:', error);
    }
}
