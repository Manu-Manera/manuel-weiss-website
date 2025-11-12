# Modul 09 — Streaming (SSE/WS) (OPTIMIERT)
**Repo:** `Manu-Manera/manuel-weiss-website` • **Version:** 5.0 • **Zeitzone:** Europe/Zurich  
**Prinzip:** *Kein Test-/Demo-Daten-Einsatz. Nur echte Quellen/Provider. Serverseitige Secrets.*
**Ziel:** Production-ready Real-time Streaming System mit hoher Performance und Zuverlässigkeit

---
# Repo-Ausrichtung & Pfade (ERWEITERT)
- **Lambda Functions:** `lambda/streaming/` mit SSE und WebSocket Support
- **API Routes:** `/stream` (SSE), `/ws` (WebSocket) mit CORS und Authentication
- **WebSocket Gateway:** AWS API Gateway WebSocket für bidirektionale Kommunikation
- **Event Store:** DynamoDB für Event Persistence und Replay
- **Monitoring:** CloudWatch für Connection Metrics und Performance

# Smart Prompt – Implementierung (FÜR CURSOR - OPTIMIERT)
> **An Cursor – Production Streaming System implementieren (Deutsch):**  

## PHASE 1: Server-Sent Events (SSE) System (ERWEITERT)
### **SSE Endpoint Implementation:**
```typescript
// lambda/streaming/sse-handler.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBStreams } from 'aws-sdk';
import { EventEmitter } from 'events';

export const sseHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Validate Authentication
    const authResult = await validateAuth(event.headers.Authorization);
    if (!authResult.valid) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    // Extract Query Parameters
    const { eventTypes, userId, role } = extractQueryParams(event.queryStringParameters);
    
    // Create SSE Connection
    const connectionId = generateConnectionId();
    const sseConnection = new SSEConnection(connectionId, userId, role, eventTypes);
    
    // Register Connection
    await registerConnection(sseConnection);
    
    // Set SSE Headers
    const headers = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
      'X-Accel-Buffering': 'no' // Disable Nginx buffering
    };

    return {
      statusCode: 200,
      headers,
      body: createSSEStream(sseConnection)
    };
  } catch (error) {
    logger.error('SSE handler failed', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};

class SSEConnection extends EventEmitter {
  private connectionId: string;
  private userId: string;
  private role: string;
  private eventTypes: string[];
  private isConnected: boolean = true;
  private lastHeartbeat: Date = new Date();
  private eventBuffer: Event[] = [];
  private maxBufferSize: number = 100;

  constructor(connectionId: string, userId: string, role: string, eventTypes: string[]) {
    super();
    this.connectionId = connectionId;
    this.userId = userId;
    this.role = role;
    this.eventTypes = eventTypes;
    
    // Setup heartbeat
    this.setupHeartbeat();
    
    // Setup event filtering
    this.setupEventFiltering();
  }

  private setupHeartbeat(): void {
    setInterval(() => {
      if (this.isConnected) {
        this.emit('heartbeat', {
          type: 'heartbeat',
          timestamp: new Date().toISOString(),
          connectionId: this.connectionId
        });
        this.lastHeartbeat = new Date();
      }
    }, 30000); // 30 seconds
  }

  private setupEventFiltering(): void {
    // Role-based filtering
    const rolePermissions = {
      'admin': ['signal', 'proposal', 'decision', 'risk_alert', 'system_status'],
      'analyst': ['signal', 'proposal', 'decision'],
      'viewer': ['signal', 'proposal']
    };

    this.allowedEventTypes = rolePermissions[this.role] || [];
  }

  public sendEvent(event: Event): void {
    if (!this.isConnected) return;
    
    // Check if event type is allowed
    if (!this.allowedEventTypes.includes(event.type)) return;
    
    // Check if event type is in filter
    if (!this.eventTypes.includes(event.type)) return;
    
    // Add to buffer
    this.eventBuffer.push(event);
    
    // Maintain buffer size
    if (this.eventBuffer.length > this.maxBufferSize) {
      this.eventBuffer.shift();
    }
    
    // Emit event
    this.emit('event', event);
  }

  public getEventStream(): string {
    let stream = '';
    
    // Send initial connection event
    stream += `event: connection\n`;
    stream += `data: ${JSON.stringify({
      type: 'connection',
      connectionId: this.connectionId,
      timestamp: new Date().toISOString()
    })}\n\n`;
    
    // Send buffered events
    for (const event of this.eventBuffer) {
      stream += `event: ${event.type}\n`;
      stream += `data: ${JSON.stringify(event)}\n\n`;
    }
    
    return stream;
  }

  public disconnect(): void {
    this.isConnected = false;
    this.emit('disconnect');
  }
}
```

## PHASE 2: WebSocket Gateway (ERWEITERT)
### **WebSocket Connection Handler:**
```typescript
// lambda/streaming/websocket-handler.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ApiGatewayManagementApi } from 'aws-sdk';

export const websocketHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { requestContext } = event;
  const { routeKey, connectionId } = requestContext;
  
  try {
    switch (routeKey) {
      case '$connect':
        return await handleConnect(event);
      case '$disconnect':
        return await handleDisconnect(event);
      case '$default':
        return await handleMessage(event);
      default:
        return await handleCustomRoute(event);
    }
  } catch (error) {
    logger.error('WebSocket handler failed', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};

const handleConnect = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { connectionId } = event.requestContext;
  const { userId, role, eventTypes } = extractConnectionParams(event);
  
  // Validate authentication
  const authResult = await validateWebSocketAuth(event);
  if (!authResult.valid) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }
  
  // Create connection record
  const connection = {
    connectionId,
    userId,
    role,
    eventTypes,
    connectedAt: new Date().toISOString(),
    lastActivity: new Date().toISOString()
  };
  
  await storeConnection(connection);
  
  // Send welcome message
  await sendMessage(connectionId, {
    type: 'connection_established',
    data: {
      connectionId,
      userId,
      role,
      timestamp: new Date().toISOString()
    }
  });
  
  return { statusCode: 200, body: 'Connected' };
};
```

## PHASE 3: Client-Side Implementation (ERWEITERT)
### **SSE Client:**
```typescript
// client/streaming/sse-client.ts
export class SSEClient {
  private eventSource: EventSource | null = null;
  private reconnectInterval: number = 5000;
  private maxReconnectAttempts: number = 10;
  private reconnectAttempts: number = 0;
  private eventHandlers: Map<string, Function[]> = new Map();
  private isConnected: boolean = false;
  
  constructor(
    private endpoint: string,
    private authToken: string,
    private eventTypes: string[] = []
  ) {}
  
  public connect(): void {
    try {
      const url = new URL(this.endpoint);
      url.searchParams.set('eventTypes', this.eventTypes.join(','));
      
      this.eventSource = new EventSource(url.toString(), {
        withCredentials: false,
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });
      
      this.setupEventListeners();
    } catch (error) {
      console.error('SSE connection failed:', error);
      this.scheduleReconnect();
    }
  }
  
  private setupEventListeners(): void {
    if (!this.eventSource) return;
    
    this.eventSource.onopen = () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected');
    };
    
    this.eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      this.isConnected = false;
      this.emit('error', error);
      this.scheduleReconnect();
    };
    
    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit('message', data);
        this.emit(data.type, data);
      } catch (error) {
        console.error('Failed to parse SSE message:', error);
      }
    };
  }
  
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('max_reconnect_attempts_reached');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);
      this.connect();
    }, delay);
  }
}
```

### **WebSocket Client:**
```typescript
// client/streaming/websocket-client.ts
export class WebSocketClient {
  private websocket: WebSocket | null = null;
  private reconnectInterval: number = 5000;
  private maxReconnectAttempts: number = 10;
  private reconnectAttempts: number = 0;
  private eventHandlers: Map<string, Function[]> = new Map();
  private isConnected: boolean = false;
  private messageQueue: any[] = [];
  
  constructor(
    private endpoint: string,
    private authToken: string,
    private eventTypes: string[] = []
  ) {}
  
  public connect(): void {
    try {
      const url = new URL(this.endpoint);
      url.searchParams.set('eventTypes', this.eventTypes.join(','));
      url.searchParams.set('auth', this.authToken);
      
      this.websocket = new WebSocket(url.toString());
      this.setupEventListeners();
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.scheduleReconnect();
    }
  }
  
  public send(message: any): void {
    if (this.isConnected && this.websocket) {
      this.websocket.send(JSON.stringify(message));
    } else {
      // Queue message for later
      this.messageQueue.push(message);
    }
  }
  
  public subscribe(eventTypes: string[]): void {
    this.send({
      type: 'subscribe',
      data: { eventTypes }
    });
  }
  
  public ping(): void {
    this.send({
      type: 'ping',
      data: { timestamp: new Date().toISOString() }
    });
  }
}
```

## PHASE 4: Advanced Features (NEU)
### **Event Batching and Throttling:**
```typescript
// lambda/streaming/event-batcher.ts
export class EventBatcher {
  private batchSize: number = 10;
  private batchTimeout: number = 1000; // 1 second
  private batches: Map<string, Event[]> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  
  public addEvent(connectionId: string, event: Event): void {
    if (!this.batches.has(connectionId)) {
      this.batches.set(connectionId, []);
    }
    
    const batch = this.batches.get(connectionId)!;
    batch.push(event);
    
    // Send batch if it reaches the size limit
    if (batch.length >= this.batchSize) {
      this.sendBatch(connectionId);
    } else {
      // Set timer for timeout-based batching
      this.scheduleBatch(connectionId);
    }
  }
  
  private scheduleBatch(connectionId: string): void {
    // Clear existing timer
    const existingTimer = this.timers.get(connectionId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Set new timer
    const timer = setTimeout(() => {
      this.sendBatch(connectionId);
    }, this.batchTimeout);
    
    this.timers.set(connectionId, timer);
  }
}
```

### **Connection Management:**
```typescript
// lambda/streaming/connection-manager.ts
export class ConnectionManager {
  private connections: Map<string, Connection> = new Map();
  private userConnections: Map<string, Set<string>> = new Map();
  
  public addConnection(connection: Connection): void {
    this.connections.set(connection.connectionId, connection);
    
    // Track user connections
    if (!this.userConnections.has(connection.userId)) {
      this.userConnections.set(connection.userId, new Set());
    }
    this.userConnections.get(connection.userId)!.add(connection.connectionId);
  }
  
  public getActiveConnections(): Connection[] {
    return Array.from(this.connections.values())
      .filter(conn => conn.isActive);
  }
  
  public getConnectionStats(): ConnectionStats {
    const total = this.connections.size;
    const byRole = Array.from(this.connections.values())
      .reduce((acc, conn) => {
        acc[conn.role] = (acc[conn.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    return {
      total,
      byRole,
      active: this.getActiveConnections().length
    };
  }
}
```

**Server:** SSE oder WebSocket Events: `signal.created`, `proposal.created|updated`, `risk.alert`, `eval.completed`.
**Client:** Backoff-Reconnect, Offline-Banner, Event-Debounce/Clustering, Replay-Window (letzte N).
**Rollenbasierte Filterung** (viewer/analyst/approver).

# Zusätzliche Verbesserungen (PRODUCTION-GRADE - OPTIMIERT)
- **Heartbeats** & Zeitdrift-Check
- **Event-Batching** bei hoher Frequenz
- **Connection Pooling** für bessere Performance
- **Event Persistence** für Replay-Funktionalität
- **Rate Limiting** pro Connection
- **Compression** für große Event-Payloads
- **Monitoring** mit detaillierten Metriken
- **Graceful Degradation** bei hoher Last

# Fehlervermeidung – Was schiefgehen kann & Gegenmaßnahmen (ERWEITERT)
- **Verbindungs-Flapping**.  
  **Fix:** Exponentielles Backoff, Max-Retries, Telemetrie, Connection Health Checks
- **Duplikate** bei Reconnect.  
  **Fix:** Replay-Window + de-dup IDs, Event Versioning
- **Memory Leaks** → Performance Degradation.  
  **Fix:** Connection Cleanup, Event Buffer Limits, Garbage Collection
- **Network Partitions** → Datenverlust.  
  **Fix:** Event Persistence, Replay Mechanism, Offline Support
- **High Load** → Connection Drops.  
  **Fix:** Load Balancing, Connection Pooling, Rate Limiting
- **Authentication Failures** → Security Issues.  
  **Fix:** Token Validation, Role-based Access, Audit Logging

# Akzeptanzkriterien (Definition of Done - ERWEITERT)
- Flüssig, stabil, keine Duplikate, UI bleibt performant
- **Connection Stability** erreicht (> 99% Uptime)
- **Event Delivery** zuverlässig (> 99.9% Success Rate)
- **Performance Benchmarks** erreicht (< 100ms Latency)
- **Reconnection Logic** funktional und getestet
- **Role-based Filtering** vollständig implementiert
- **Event Batching** funktional und optimiert
- **Monitoring & Alerting** vollständig eingerichtet

# Build/Test-Gates & Verifikation (AUSFÜHREN - OPTIMIERT)
```bash
# Connection Tests
./scripts/test:streaming:connections
./scripts/test:streaming:reconnect

# Event Tests
./scripts/test:streaming:events
./scripts/test:streaming:batching

# Performance Tests
./scripts/test:streaming:performance
./scripts/test:streaming:load

# Integration Tests
./scripts/test:streaming:integration
./scripts/test:streaming:e2e
```

# Artefakte & Deliverables (ERWEITERT)
- **Server-Code** (Lambda Functions, WebSocket Gateway, Event Handlers)
- **Client-Code** (SSE Client, WebSocket Client, Reconnection Logic)
- **README** (Setup Guide, API Documentation, Troubleshooting)
- **Connection Monitoring** (Metrics, Dashboards, Alerts)
- **Performance Reports** (Latency, Throughput, Connection Stats)
- **Event Documentation** (Event Types, Schemas, Examples)
- **Testing Suite** (Unit Tests, Integration Tests, Load Tests)
- **Deployment Guide** (Infrastructure, Configuration, Monitoring)

