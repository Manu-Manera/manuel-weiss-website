/**
 * WebSocket Message Handler
 * 
 * Verarbeitet alle eingehenden Nachrichten:
 * - get_online_players: Liste der Online-Spieler
 * - invite_player: Spieleinladung senden
 * - accept_invite: Einladung annehmen
 * - decline_invite: Einladung ablehnen
 * - game_move: Spielzug senden
 * - chat_message: Chat-Nachricht senden
 * - heartbeat: Keep-alive
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { ApiGatewayManagementApiClient, PostToConnectionCommand } = require('@aws-sdk/client-apigatewaymanagementapi');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE;
const GAMES_TABLE = process.env.GAMES_TABLE;
const WEBSOCKET_ENDPOINT = process.env.WEBSOCKET_ENDPOINT;

let apiClient = null;

function getApiClient() {
    if (!apiClient) {
        apiClient = new ApiGatewayManagementApiClient({
            endpoint: `https://${WEBSOCKET_ENDPOINT}`
        });
    }
    return apiClient;
}

exports.handler = async (event) => {
    console.log('📨 WebSocket Message:', JSON.stringify(event, null, 2));
    
    const connectionId = event.requestContext.connectionId;
    let body;
    
    try {
        body = JSON.parse(event.body);
    } catch (e) {
        return respond(400, 'Invalid JSON');
    }
    
    const action = body.action;
    
    try {
        // Aktualisiere lastActivity
        await updateLastActivity(connectionId);
        
        switch (action) {
            case 'get_online_players':
                return await handleGetOnlinePlayers(connectionId, body);
                
            case 'invite_player':
                return await handleInvitePlayer(connectionId, body);
                
            case 'accept_invite':
                return await handleAcceptInvite(connectionId, body);
                
            case 'decline_invite':
                return await handleDeclineInvite(connectionId, body);
                
            case 'game_move':
                return await handleGameMove(connectionId, body);
                
            case 'chat_message':
                return await handleChatMessage(connectionId, body);
                
            case 'heartbeat':
                return await handleHeartbeat(connectionId);
                
            case 'leave_game':
                return await handleLeaveGame(connectionId, body);
                
            default:
                console.log(`Unknown action: ${action}`);
                return respond(400, `Unknown action: ${action}`);
        }
        
    } catch (error) {
        console.error('❌ Message Handler Error:', error);
        return respond(500, 'Internal server error');
    }
};

// =====================================================
// Handler Functions
// =====================================================

async function handleGetOnlinePlayers(connectionId, body) {
    // Hole alle aktiven Verbindungen
    const result = await docClient.send(new ScanCommand({
        TableName: CONNECTIONS_TABLE,
        FilterExpression: '#status = :online',
        ExpressionAttributeNames: {
            '#status': 'status'
        },
        ExpressionAttributeValues: {
            ':online': 'online'
        }
    }));
    
    // Hole eigene User-ID
    const myConnection = await docClient.send(new GetCommand({
        TableName: CONNECTIONS_TABLE,
        Key: { connectionId }
    }));
    
    const myUserId = myConnection.Item?.userId;
    
    // Filtere und formatiere Spieler
    const players = (result.Items || [])
        .filter(conn => conn.userId !== myUserId) // Nicht sich selbst anzeigen
        .map(conn => ({
            id: conn.userId,
            name: conn.userName,
            status: conn.currentGame ? 'in_game' : 'online',
            currentGame: conn.currentGame,
            lastActivity: conn.lastActivity
        }));
    
    // Sende an Client
    await sendToConnection(connectionId, {
        type: 'online_players',
        players: players,
        count: players.length
    });
    
    return respond(200, 'OK');
}

async function handleInvitePlayer(connectionId, body) {
    const { targetUserId, gameType } = body;
    
    if (!targetUserId || !gameType) {
        return respond(400, 'Missing targetUserId or gameType');
    }
    
    // Hole Absender-Info
    const senderResult = await docClient.send(new GetCommand({
        TableName: CONNECTIONS_TABLE,
        Key: { connectionId }
    }));
    
    const sender = senderResult.Item;
    if (!sender) return respond(400, 'Sender not found');
    
    // Finde Empfänger-Verbindung
    const targetConnections = await docClient.send(new QueryCommand({
        TableName: CONNECTIONS_TABLE,
        IndexName: 'userId-index',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': targetUserId
        }
    }));
    
    if (!targetConnections.Items || targetConnections.Items.length === 0) {
        await sendToConnection(connectionId, {
            type: 'invite_error',
            error: 'player_offline',
            message: 'Spieler ist nicht mehr online'
        });
        return respond(200, 'Player offline');
    }
    
    const target = targetConnections.Items[0];
    
    // Prüfe ob Spieler bereits in einem Spiel ist
    if (target.currentGame) {
        await sendToConnection(connectionId, {
            type: 'invite_error',
            error: 'player_in_game',
            message: 'Spieler ist bereits in einem Spiel'
        });
        return respond(200, 'Player in game');
    }
    
    // Erstelle Einladungs-ID
    const inviteId = `invite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Sende Einladung an Ziel
    await sendToConnection(target.connectionId, {
        type: 'game_invite',
        inviteId: inviteId,
        from: {
            id: sender.userId,
            name: sender.userName
        },
        gameType: gameType,
        timestamp: new Date().toISOString()
    });
    
    // Bestätigung an Absender
    await sendToConnection(connectionId, {
        type: 'invite_sent',
        inviteId: inviteId,
        to: {
            id: target.userId,
            name: target.userName
        },
        gameType: gameType
    });
    
    console.log(`📨 Invite sent: ${sender.userName} -> ${target.userName} for ${gameType}`);
    
    return respond(200, 'Invite sent');
}

async function handleAcceptInvite(connectionId, body) {
    const { inviteId, fromUserId, gameType } = body;
    
    // Hole Annehmenden
    const accepterResult = await docClient.send(new GetCommand({
        TableName: CONNECTIONS_TABLE,
        Key: { connectionId }
    }));
    
    const accepter = accepterResult.Item;
    if (!accepter) return respond(400, 'Accepter not found');
    
    // Finde Einladenden
    const inviterConnections = await docClient.send(new QueryCommand({
        TableName: CONNECTIONS_TABLE,
        IndexName: 'userId-index',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': fromUserId
        }
    }));
    
    if (!inviterConnections.Items || inviterConnections.Items.length === 0) {
        await sendToConnection(connectionId, {
            type: 'invite_error',
            error: 'inviter_offline',
            message: 'Einladender ist nicht mehr online'
        });
        return respond(200, 'Inviter offline');
    }
    
    const inviter = inviterConnections.Items[0];
    
    // Erstelle neues Spiel
    const gameId = `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const ttl = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24h
    
    // Zufällige Farbe für Schach
    const inviterColor = Math.random() < 0.5 ? 'white' : 'black';
    const accepterColor = inviterColor === 'white' ? 'black' : 'white';
    
    const gameData = {
        gameId: gameId,
        gameType: gameType,
        player1Id: inviter.userId,
        player1Name: inviter.userName,
        player1Color: inviterColor,
        player2Id: accepter.userId,
        player2Name: accepter.userName,
        player2Color: accepterColor,
        status: 'active',
        currentTurn: 'white',
        moves: [],
        createdAt: new Date().toISOString(),
        ttl: ttl
    };
    
    // Speichere Spiel
    await docClient.send(new PutCommand({
        TableName: GAMES_TABLE,
        Item: gameData
    }));
    
    // Aktualisiere beide Spieler
    await Promise.all([
        docClient.send(new UpdateCommand({
            TableName: CONNECTIONS_TABLE,
            Key: { connectionId: inviter.connectionId },
            UpdateExpression: 'SET currentGame = :gameId',
            ExpressionAttributeValues: { ':gameId': gameId }
        })),
        docClient.send(new UpdateCommand({
            TableName: CONNECTIONS_TABLE,
            Key: { connectionId: connectionId },
            UpdateExpression: 'SET currentGame = :gameId',
            ExpressionAttributeValues: { ':gameId': gameId }
        }))
    ]);
    
    // Benachrichtige beide Spieler
    const gameStartMessage = {
        type: 'game_start',
        gameId: gameId,
        gameType: gameType,
        opponent: null, // Wird pro Spieler angepasst
        yourColor: null // Wird pro Spieler angepasst
    };
    
    // An Einladenden
    await sendToConnection(inviter.connectionId, {
        ...gameStartMessage,
        opponent: { id: accepter.userId, name: accepter.userName },
        yourColor: inviterColor
    });
    
    // An Annehmenden
    await sendToConnection(connectionId, {
        ...gameStartMessage,
        opponent: { id: inviter.userId, name: inviter.userName },
        yourColor: accepterColor
    });
    
    console.log(`🎮 Game started: ${gameId} (${inviter.userName} vs ${accepter.userName})`);
    
    return respond(200, 'Game started');
}

async function handleDeclineInvite(connectionId, body) {
    const { inviteId, fromUserId } = body;
    
    // Hole Ablehnenden
    const declinerResult = await docClient.send(new GetCommand({
        TableName: CONNECTIONS_TABLE,
        Key: { connectionId }
    }));
    
    const decliner = declinerResult.Item;
    
    // Finde Einladenden
    const inviterConnections = await docClient.send(new QueryCommand({
        TableName: CONNECTIONS_TABLE,
        IndexName: 'userId-index',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': fromUserId
        }
    }));
    
    if (inviterConnections.Items && inviterConnections.Items.length > 0) {
        const inviter = inviterConnections.Items[0];
        
        // Benachrichtige Einladenden
        await sendToConnection(inviter.connectionId, {
            type: 'invite_declined',
            inviteId: inviteId,
            by: {
                id: decliner?.userId,
                name: decliner?.userName || 'Spieler'
            }
        });
    }
    
    return respond(200, 'Invite declined');
}

async function handleGameMove(connectionId, body) {
    const { gameId, move } = body;
    
    if (!gameId || !move) {
        return respond(400, 'Missing gameId or move');
    }
    
    // Hole Spiel
    const gameResult = await docClient.send(new GetCommand({
        TableName: GAMES_TABLE,
        Key: { gameId }
    }));
    
    const game = gameResult.Item;
    if (!game) return respond(400, 'Game not found');
    
    // Hole Absender
    const senderResult = await docClient.send(new GetCommand({
        TableName: CONNECTIONS_TABLE,
        Key: { connectionId }
    }));
    
    const sender = senderResult.Item;
    if (!sender) return respond(400, 'Sender not found');
    
    // Prüfe ob Absender im Spiel ist
    if (game.player1Id !== sender.userId && game.player2Id !== sender.userId) {
        return respond(403, 'Not in this game');
    }
    
    // Finde Gegner
    const opponentId = game.player1Id === sender.userId ? game.player2Id : game.player1Id;
    
    // Füge Zug hinzu
    const updatedMoves = [...(game.moves || []), {
        ...move,
        playerId: sender.userId,
        timestamp: new Date().toISOString()
    }];
    
    // Aktualisiere Spiel
    await docClient.send(new UpdateCommand({
        TableName: GAMES_TABLE,
        Key: { gameId },
        UpdateExpression: 'SET moves = :moves, currentTurn = :turn, lastMoveAt = :now',
        ExpressionAttributeValues: {
            ':moves': updatedMoves,
            ':turn': game.currentTurn === 'white' ? 'black' : 'white',
            ':now': new Date().toISOString()
        }
    }));
    
    // Finde Gegner-Verbindung
    const opponentConnections = await docClient.send(new QueryCommand({
        TableName: CONNECTIONS_TABLE,
        IndexName: 'userId-index',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': opponentId
        }
    }));
    
    // Sende Zug an Gegner
    for (const oppConn of opponentConnections.Items || []) {
        await sendToConnection(oppConn.connectionId, {
            type: 'game_move',
            gameId: gameId,
            move: move,
            from: {
                id: sender.userId,
                name: sender.userName
            }
        });
    }
    
    console.log(`♟️ Move in ${gameId}: ${JSON.stringify(move)}`);
    
    return respond(200, 'Move sent');
}

async function handleChatMessage(connectionId, body) {
    const { gameId, message } = body;
    
    if (!gameId || !message) {
        return respond(400, 'Missing gameId or message');
    }
    
    // Hole Spiel
    const gameResult = await docClient.send(new GetCommand({
        TableName: GAMES_TABLE,
        Key: { gameId }
    }));
    
    const game = gameResult.Item;
    if (!game) return respond(400, 'Game not found');
    
    // Hole Absender
    const senderResult = await docClient.send(new GetCommand({
        TableName: CONNECTIONS_TABLE,
        Key: { connectionId }
    }));
    
    const sender = senderResult.Item;
    if (!sender) return respond(400, 'Sender not found');
    
    // Finde Gegner
    const opponentId = game.player1Id === sender.userId ? game.player2Id : game.player1Id;
    
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
        await sendToConnection(oppConn.connectionId, {
            type: 'chat_message',
            gameId: gameId,
            message: message,
            from: {
                id: sender.userId,
                name: sender.userName
            },
            timestamp: new Date().toISOString()
        });
    }
    
    return respond(200, 'Message sent');
}

async function handleHeartbeat(connectionId) {
    await updateLastActivity(connectionId);
    
    await sendToConnection(connectionId, {
        type: 'heartbeat_ack',
        timestamp: new Date().toISOString()
    });
    
    return respond(200, 'OK');
}

async function handleLeaveGame(connectionId, body) {
    const { gameId } = body;
    
    // Hole Spieler
    const playerResult = await docClient.send(new GetCommand({
        TableName: CONNECTIONS_TABLE,
        Key: { connectionId }
    }));
    
    const player = playerResult.Item;
    if (!player) return respond(400, 'Player not found');
    
    // Entferne currentGame
    await docClient.send(new UpdateCommand({
        TableName: CONNECTIONS_TABLE,
        Key: { connectionId },
        UpdateExpression: 'REMOVE currentGame'
    }));
    
    // Benachrichtige Gegner
    if (gameId) {
        const gameResult = await docClient.send(new GetCommand({
            TableName: GAMES_TABLE,
            Key: { gameId }
        }));
        
        const game = gameResult.Item;
        if (game) {
            const opponentId = game.player1Id === player.userId ? game.player2Id : game.player1Id;
            
            const opponentConnections = await docClient.send(new QueryCommand({
                TableName: CONNECTIONS_TABLE,
                IndexName: 'userId-index',
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': opponentId
                }
            }));
            
            for (const oppConn of opponentConnections.Items || []) {
                await sendToConnection(oppConn.connectionId, {
                    type: 'opponent_left',
                    gameId: gameId,
                    player: {
                        id: player.userId,
                        name: player.userName
                    }
                });
            }
        }
    }
    
    return respond(200, 'Left game');
}

// =====================================================
// Helper Functions
// =====================================================

async function sendToConnection(connectionId, data) {
    try {
        await getApiClient().send(new PostToConnectionCommand({
            ConnectionId: connectionId,
            Data: JSON.stringify(data)
        }));
    } catch (error) {
        if (error.statusCode === 410) {
            // Connection is gone, clean up
            console.log(`Connection ${connectionId} is gone, cleaning up...`);
            await docClient.send(new DeleteCommand({
                TableName: CONNECTIONS_TABLE,
                Key: { connectionId }
            }));
        } else {
            console.error(`Error sending to ${connectionId}:`, error);
        }
    }
}

async function updateLastActivity(connectionId) {
    try {
        await docClient.send(new UpdateCommand({
            TableName: CONNECTIONS_TABLE,
            Key: { connectionId },
            UpdateExpression: 'SET lastActivity = :now',
            ExpressionAttributeValues: {
                ':now': new Date().toISOString()
            }
        }));
    } catch (error) {
        console.log('Could not update lastActivity:', error.message);
    }
}

function respond(statusCode, message) {
    return {
        statusCode,
        body: JSON.stringify({ message })
    };
}
