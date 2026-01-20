/**
 * Game WebSocket Service
 * 
 * Echtzeit-Kommunikation für Multiplayer-Spiele
 * 
 * Features:
 * - Automatische Verbindung und Reconnect
 * - Online-Spieler-Liste
 * - Spieleinladungen senden/empfangen
 * - Spielzüge in Echtzeit
 * - Chat während des Spiels
 */

class GameWebSocketService {
    constructor() {
        // WebSocket URL - wird nach dem Deploy eingetragen
        this.wsUrl = localStorage.getItem('game_websocket_url') || 
                     'wss://YOUR_WEBSOCKET_ID.execute-api.eu-central-1.amazonaws.com/prod';
        
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 2000;
        this.heartbeatInterval = null;
        
        // Event Callbacks
        this.callbacks = {
            onConnect: [],
            onDisconnect: [],
            onOnlinePlayers: [],
            onGameInvite: [],
            onInviteSent: [],
            onInviteDeclined: [],
            onInviteError: [],
            onGameStart: [],
            onGameMove: [],
            onChatMessage: [],
            onOpponentDisconnected: [],
            onOpponentLeft: [],
            onError: []
        };
        
        // User Info
        this.userId = null;
        this.userName = null;
        this.currentGameId = null;
    }
    
    /**
     * Verbindung herstellen
     */
    connect(userId, userName) {
        if (this.isConnected) {
            console.log('🔌 Already connected');
            return Promise.resolve();
        }
        
        this.userId = userId;
        this.userName = userName;
        
        return new Promise((resolve, reject) => {
            try {
                const url = `${this.wsUrl}?userId=${encodeURIComponent(userId)}&userName=${encodeURIComponent(userName)}`;
                
                console.log('🔌 Connecting to WebSocket...', url);
                this.socket = new WebSocket(url);
                
                this.socket.onopen = () => {
                    console.log('✅ WebSocket connected');
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    this.startHeartbeat();
                    this.emit('onConnect', { userId, userName });
                    resolve();
                };
                
                this.socket.onclose = (event) => {
                    console.log('🔌 WebSocket closed:', event.code, event.reason);
                    this.isConnected = false;
                    this.stopHeartbeat();
                    this.emit('onDisconnect', { code: event.code, reason: event.reason });
                    
                    // Automatischer Reconnect
                    if (this.reconnectAttempts < this.maxReconnectAttempts) {
                        this.scheduleReconnect();
                    }
                };
                
                this.socket.onerror = (error) => {
                    console.error('❌ WebSocket error:', error);
                    this.emit('onError', { error });
                    reject(error);
                };
                
                this.socket.onmessage = (event) => {
                    this.handleMessage(event);
                };
                
            } catch (error) {
                console.error('❌ WebSocket connection failed:', error);
                reject(error);
            }
        });
    }
    
    /**
     * Verbindung trennen
     */
    disconnect() {
        if (this.socket) {
            this.stopHeartbeat();
            this.socket.close(1000, 'User disconnected');
            this.socket = null;
            this.isConnected = false;
        }
    }
    
    /**
     * Automatischer Reconnect
     */
    scheduleReconnect() {
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        
        console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        setTimeout(() => {
            if (!this.isConnected && this.userId) {
                this.connect(this.userId, this.userName);
            }
        }, delay);
    }
    
    /**
     * Heartbeat für Keep-Alive
     */
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.isConnected) {
                this.send({ action: 'heartbeat' });
            }
        }, 30000); // Alle 30 Sekunden
    }
    
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
    
    /**
     * Nachricht senden
     */
    send(data) {
        if (!this.isConnected || !this.socket) {
            console.warn('⚠️ WebSocket not connected');
            return false;
        }
        
        try {
            this.socket.send(JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('❌ Send error:', error);
            return false;
        }
    }
    
    /**
     * Eingehende Nachrichten verarbeiten
     */
    handleMessage(event) {
        try {
            const data = JSON.parse(event.data);
            console.log('📨 Received:', data.type, data);
            
            switch (data.type) {
                case 'online_players':
                    this.emit('onOnlinePlayers', data);
                    break;
                    
                case 'game_invite':
                    this.emit('onGameInvite', data);
                    break;
                    
                case 'invite_sent':
                    this.emit('onInviteSent', data);
                    break;
                    
                case 'invite_declined':
                    this.emit('onInviteDeclined', data);
                    break;
                    
                case 'invite_error':
                    this.emit('onInviteError', data);
                    break;
                    
                case 'game_start':
                    this.currentGameId = data.gameId;
                    this.emit('onGameStart', data);
                    break;
                    
                case 'game_move':
                    this.emit('onGameMove', data);
                    break;
                    
                case 'chat_message':
                    this.emit('onChatMessage', data);
                    break;
                    
                case 'opponent_disconnected':
                    this.emit('onOpponentDisconnected', data);
                    break;
                    
                case 'opponent_left':
                    this.emit('onOpponentLeft', data);
                    break;
                    
                case 'heartbeat_ack':
                    // Heartbeat bestätigt, nichts zu tun
                    break;
                    
                default:
                    console.log('Unknown message type:', data.type);
            }
            
        } catch (error) {
            console.error('❌ Error parsing message:', error);
        }
    }
    
    // =====================================================
    // API Methods
    // =====================================================
    
    /**
     * Online-Spieler abrufen
     */
    getOnlinePlayers() {
        return this.send({ action: 'get_online_players' });
    }
    
    /**
     * Spieler einladen
     */
    invitePlayer(targetUserId, gameType) {
        return this.send({
            action: 'invite_player',
            targetUserId,
            gameType
        });
    }
    
    /**
     * Einladung annehmen
     */
    acceptInvite(inviteId, fromUserId, gameType) {
        return this.send({
            action: 'accept_invite',
            inviteId,
            fromUserId,
            gameType
        });
    }
    
    /**
     * Einladung ablehnen
     */
    declineInvite(inviteId, fromUserId) {
        return this.send({
            action: 'decline_invite',
            inviteId,
            fromUserId
        });
    }
    
    /**
     * Spielzug senden
     */
    sendMove(gameId, move) {
        return this.send({
            action: 'game_move',
            gameId,
            move
        });
    }
    
    /**
     * Chat-Nachricht senden
     */
    sendChatMessage(gameId, message) {
        return this.send({
            action: 'chat_message',
            gameId,
            message
        });
    }
    
    /**
     * Spiel verlassen
     */
    leaveGame(gameId) {
        this.currentGameId = null;
        return this.send({
            action: 'leave_game',
            gameId
        });
    }
    
    // =====================================================
    // Event System
    // =====================================================
    
    /**
     * Event Listener hinzufügen
     */
    on(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event].push(callback);
        }
        return this; // Für Chaining
    }
    
    /**
     * Event Listener entfernen
     */
    off(event, callback) {
        if (this.callbacks[event]) {
            const index = this.callbacks[event].indexOf(callback);
            if (index > -1) {
                this.callbacks[event].splice(index, 1);
            }
        }
        return this;
    }
    
    /**
     * Event auslösen
     */
    emit(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} callback:`, error);
                }
            });
        }
    }
}

// Singleton Instance
window.gameWebSocket = new GameWebSocketService();

// Convenience Functions
window.connectGameWebSocket = (userId, userName) => window.gameWebSocket.connect(userId, userName);
window.disconnectGameWebSocket = () => window.gameWebSocket.disconnect();

console.log('🎮 GameWebSocketService loaded');
