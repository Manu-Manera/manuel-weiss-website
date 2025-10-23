// AI Investment System Streaming Client
class StreamingClient {
    constructor(options = {}) {
        this.baseUrl = options.baseUrl || 'wss://api.ai-investment.com/v1';
        this.sseUrl = options.sseUrl || 'https://api.ai-investment.com/v1/stream/sse';
        this.apiKey = options.apiKey || localStorage.getItem('ai_investment_api_key');
        this.userId = options.userId || 'anonymous';
        this.subscriptions = options.subscriptions || ['signal', 'proposal', 'decision', 'outcome', 'risk', 'system'];
        
        this.wsConnection = null;
        this.sseConnection = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.heartbeatInterval = null;
        this.isConnected = false;
        
        this.eventHandlers = new Map();
        this.messageQueue = [];
        
        this.init();
    }

    init() {
        console.log('🚀 Initializing Streaming Client...');
        
        // Setup event handlers
        this.setupEventHandlers();
        
        // Connect to WebSocket
        this.connectWebSocket();
        
        // Setup SSE as fallback
        this.setupSSE();
        
        console.log('✅ Streaming Client initialized');
    }

    setupEventHandlers() {
        // Default event handlers
        this.on('connection', (data) => {
            console.log('Connected to streaming service', data);
            this.isConnected = true;
            this.reconnectAttempts = 0;
        });

        this.on('disconnection', (data) => {
            console.log('Disconnected from streaming service', data);
            this.isConnected = false;
        });

        this.on('error', (error) => {
            console.error('Streaming error:', error);
        });

        this.on('signal', (data) => {
            console.log('New signal received:', data);
            this.handleSignalEvent(data);
        });

        this.on('proposal', (data) => {
            console.log('New proposal received:', data);
            this.handleProposalEvent(data);
        });

        this.on('decision', (data) => {
            console.log('New decision received:', data);
            this.handleDecisionEvent(data);
        });

        this.on('outcome', (data) => {
            console.log('New outcome received:', data);
            this.handleOutcomeEvent(data);
        });

        this.on('risk', (data) => {
            console.log('Risk update received:', data);
            this.handleRiskEvent(data);
        });

        this.on('system', (data) => {
            console.log('System update received:', data);
            this.handleSystemEvent(data);
        });
    }

    connectWebSocket() {
        try {
            const wsUrl = `${this.baseUrl}/stream/ws?userId=${this.userId}&apiKey=${this.apiKey}`;
            this.wsConnection = new WebSocket(wsUrl);
            
            this.wsConnection.onopen = (event) => {
                console.log('WebSocket connection established');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                
                // Send initial subscription
                this.sendMessage({
                    type: 'subscribe',
                    subscriptions: this.subscriptions
                });
                
                // Start heartbeat
                this.startHeartbeat();
                
                // Process queued messages
                this.processMessageQueue();
                
                this.emit('connection', { type: 'websocket', event });
            };
            
            this.wsConnection.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };
            
            this.wsConnection.onclose = (event) => {
                console.log('WebSocket connection closed', event);
                this.isConnected = false;
                this.stopHeartbeat();
                
                this.emit('disconnection', { type: 'websocket', event });
                
                // Attempt to reconnect
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.attemptReconnect();
                }
            };
            
            this.wsConnection.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.emit('error', { type: 'websocket', error });
            };
            
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            this.emit('error', { type: 'websocket', error });
        }
    }

    setupSSE() {
        try {
            const sseUrl = `${this.sseUrl}?userId=${this.userId}&subscriptions=${this.subscriptions.join(',')}`;
            this.sseConnection = new EventSource(sseUrl);
            
            this.sseConnection.onopen = (event) => {
                console.log('SSE connection established');
                this.emit('connection', { type: 'sse', event });
            };
            
            this.sseConnection.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('Failed to parse SSE message:', error);
                }
            };
            
            this.sseConnection.onerror = (error) => {
                console.error('SSE error:', error);
                this.emit('error', { type: 'sse', error });
            };
            
        } catch (error) {
            console.error('Failed to create SSE connection:', error);
            this.emit('error', { type: 'sse', error });
        }
    }

    handleMessage(message) {
        const { type, data, timestamp } = message;
        
        // Emit the event
        this.emit(type, data);
        
        // Handle specific message types
        switch (type) {
            case 'pong':
                this.handlePong(data);
                break;
            case 'subscription_updated':
                this.handleSubscriptionUpdate(data);
                break;
            default:
                // Event already emitted above
                break;
        }
    }

    handlePong(data) {
        console.log('Received pong:', data);
        // Reset heartbeat timer
        this.resetHeartbeat();
    }

    handleSubscriptionUpdate(data) {
        console.log('Subscription updated:', data);
        this.subscriptions = data.subscriptions;
    }

    handleSignalEvent(data) {
        // Update dashboard if available
        if (window.dashboard) {
            window.dashboard.handleSignalUpdate(data);
        }
        
        // Show notification
        this.showNotification('Neues Signal', `Signal von ${data.source} empfangen`, 'info');
    }

    handleProposalEvent(data) {
        // Update dashboard if available
        if (window.dashboard) {
            window.dashboard.handleProposalUpdate(data);
        }
        
        // Show notification
        this.showNotification('Neuer Vorschlag', `Vorschlag für ${data.assets.join(', ')} generiert`, 'success');
    }

    handleDecisionEvent(data) {
        // Update dashboard if available
        if (window.dashboard) {
            window.dashboard.handleDecisionUpdate(data);
        }
        
        // Show notification
        const actionText = this.getActionText(data.action);
        this.showNotification('Entscheidung', `Vorschlag ${actionText}`, 'info');
    }

    handleOutcomeEvent(data) {
        // Update dashboard if available
        if (window.dashboard) {
            window.dashboard.handleOutcomeUpdate(data);
        }
        
        // Show notification
        const returnText = (data.return_pct * 100).toFixed(2);
        this.showNotification('Ergebnis', `Rendite: ${returnText}%`, 'info');
    }

    handleRiskEvent(data) {
        // Update dashboard if available
        if (window.dashboard) {
            window.dashboard.handleRiskUpdate(data);
        }
        
        // Show notification for high risk
        if (data.risk_score > 0.8) {
            this.showNotification('Risiko Warnung', 'Hohes Risiko erkannt', 'warning');
        }
    }

    handleSystemEvent(data) {
        // Update dashboard if available
        if (window.dashboard) {
            window.dashboard.handleSystemUpdate(data);
        }
        
        // Show notification for alerts
        if (data.alerts && data.alerts.length > 0) {
            this.showNotification('System Alert', data.alerts[0].message, 'warning');
        }
    }

    getActionText(action) {
        const actions = {
            approve: 'genehmigt',
            reject: 'abgelehnt',
            reduce_size: 'Größe reduziert',
            diversify: 'diversifiziert',
            modify: 'modifiziert'
        };
        return actions[action] || action;
    }

    showNotification(title, message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `streaming-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-header">
                <h4>${title}</h4>
                <button class="notification-close">&times;</button>
            </div>
            <div class="notification-body">
                <p>${message}</p>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
        
        // Close button handler
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    sendMessage(message) {
        if (this.isConnected && this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
            this.wsConnection.send(JSON.stringify(message));
        } else {
            // Queue message for later
            this.messageQueue.push(message);
        }
    }

    processMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.sendMessage(message);
        }
    }

    subscribe(subscriptions) {
        this.subscriptions = [...new Set([...this.subscriptions, ...subscriptions])];
        this.sendMessage({
            type: 'subscribe',
            subscriptions: this.subscriptions
        });
    }

    unsubscribe(subscriptions) {
        this.subscriptions = this.subscriptions.filter(sub => !subscriptions.includes(sub));
        this.sendMessage({
            type: 'unsubscribe',
            subscriptions: this.subscriptions
        });
    }

    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            this.sendMessage({
                type: 'ping',
                data: { timestamp: Date.now() }
            });
        }, 30000); // Ping every 30 seconds
    }

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    resetHeartbeat() {
        // Reset heartbeat timer
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.startHeartbeat();
        }
    }

    attemptReconnect() {
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        
        console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
        
        setTimeout(() => {
            this.connectWebSocket();
        }, delay);
    }

    // Event handling
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            const handlers = this.eventHandlers.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error('Event handler error:', error);
                }
            });
        }
    }

    // Public methods
    connect() {
        this.connectWebSocket();
        this.setupSSE();
    }

    disconnect() {
        if (this.wsConnection) {
            this.wsConnection.close();
        }
        if (this.sseConnection) {
            this.sseConnection.close();
        }
        this.stopHeartbeat();
        this.isConnected = false;
    }

    getStatus() {
        return {
            isConnected: this.isConnected,
            subscriptions: this.subscriptions,
            reconnectAttempts: this.reconnectAttempts,
            wsState: this.wsConnection ? this.wsConnection.readyState : null,
            sseState: this.sseConnection ? this.sseConnection.readyState : null
        };
    }

    // Cleanup
    destroy() {
        this.disconnect();
        this.eventHandlers.clear();
        this.messageQueue = [];
    }
}

// SSE Client for fallback
class SSEClient {
    constructor(options = {}) {
        this.baseUrl = options.baseUrl || 'https://api.ai-investment.com/v1';
        this.apiKey = options.apiKey || localStorage.getItem('ai_investment_api_key');
        this.userId = options.userId || 'anonymous';
        this.subscriptions = options.subscriptions || ['signal', 'proposal', 'decision', 'outcome', 'risk', 'system'];
        
        this.connection = null;
        this.isConnected = false;
        this.eventHandlers = new Map();
        
        this.init();
    }

    init() {
        console.log('🚀 Initializing SSE Client...');
        this.connect();
        console.log('✅ SSE Client initialized');
    }

    connect() {
        try {
            const url = `${this.baseUrl}/stream/sse?userId=${this.userId}&subscriptions=${this.subscriptions.join(',')}&apiKey=${this.apiKey}`;
            this.connection = new EventSource(url);
            
            this.connection.onopen = (event) => {
                console.log('SSE connection established');
                this.isConnected = true;
                this.emit('connection', { type: 'sse', event });
            };
            
            this.connection.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('Failed to parse SSE message:', error);
                }
            };
            
            this.connection.onerror = (error) => {
                console.error('SSE error:', error);
                this.isConnected = false;
                this.emit('error', { type: 'sse', error });
            };
            
        } catch (error) {
            console.error('Failed to create SSE connection:', error);
            this.emit('error', { type: 'sse', error });
        }
    }

    handleMessage(message) {
        const { type, data, timestamp } = message;
        this.emit(type, data);
    }

    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            const handlers = this.eventHandlers.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error('SSE event handler error:', error);
                }
            });
        }
    }

    disconnect() {
        if (this.connection) {
            this.connection.close();
        }
        this.isConnected = false;
    }

    destroy() {
        this.disconnect();
        this.eventHandlers.clear();
    }
}

// Export for use
window.StreamingClient = StreamingClient;
window.SSEClient = SSEClient;

// Auto-initialize if API key is available
document.addEventListener('DOMContentLoaded', () => {
    const apiKey = localStorage.getItem('ai_investment_api_key');
    if (apiKey) {
        window.streamingClient = new StreamingClient({
            apiKey,
            userId: 'admin'
        });
    }
});
