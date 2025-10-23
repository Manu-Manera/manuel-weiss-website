import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AWSHelpers } from '@ai-investment/common';
import { logger } from '@ai-investment/common';
import { TimeUtils } from '@ai-investment/common';
import { HashUtils } from '@ai-investment/common';

// AWS Configuration
const awsConfig = {
  region: process.env.AWS_REGION || 'eu-central-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};

const aws = new AWSHelpers(awsConfig);

// Streaming Types
interface StreamEvent {
  id: string;
  type: 'signal' | 'proposal' | 'decision' | 'outcome' | 'risk' | 'system';
  data: any;
  timestamp: string;
  userId?: string;
}

interface StreamConnection {
  connectionId: string;
  userId: string;
  subscriptions: string[];
  lastActivity: number;
  createdAt: number;
}

// Streaming Manager
class StreamingManager {
  private aws: AWSHelpers;
  private connections: Map<string, StreamConnection> = new Map();
  private eventQueue: StreamEvent[] = [];
  private isProcessing: boolean = false;

  constructor(aws: AWSHelpers) {
    this.aws = aws;
    this.startEventProcessor();
  }

  async handleConnection(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
      const connectionId = event.requestContext.connectionId;
      const userId = event.queryStringParameters?.userId || 'anonymous';
      
      logger.info('WebSocket connection established', {
        connectionId,
        userId
      });

      // Store connection
      const connection: StreamConnection = {
        connectionId,
        userId,
        subscriptions: ['signal', 'proposal', 'decision', 'outcome', 'risk', 'system'],
        lastActivity: Date.now(),
        createdAt: Date.now()
      };

      this.connections.set(connectionId, connection);

      // Send welcome message
      await this.sendMessage(connectionId, {
        type: 'system',
        data: {
          message: 'Connected to AI Investment System',
          timestamp: TimeUtils.now(),
          subscriptions: connection.subscriptions
        }
      });

      return {
        statusCode: 200,
        body: 'Connected'
      };

    } catch (error) {
      logger.error('WebSocket connection failed', error as Error);
      return {
        statusCode: 500,
        body: 'Connection failed'
      };
    }
  }

  async handleDisconnection(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
      const connectionId = event.requestContext.connectionId;
      
      logger.info('WebSocket connection closed', {
        connectionId
      });

      // Remove connection
      this.connections.delete(connectionId);

      return {
        statusCode: 200,
        body: 'Disconnected'
      };

    } catch (error) {
      logger.error('WebSocket disconnection failed', error as Error);
      return {
        statusCode: 500,
        body: 'Disconnection failed'
      };
    }
  }

  async handleMessage(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
      const connectionId = event.requestContext.connectionId;
      const body = JSON.parse(event.body || '{}');
      
      logger.info('WebSocket message received', {
        connectionId,
        messageType: body.type
      });

      const connection = this.connections.get(connectionId);
      if (!connection) {
        return {
          statusCode: 400,
          body: 'Connection not found'
        };
      }

      // Update last activity
      connection.lastActivity = Date.now();

      // Handle different message types
      switch (body.type) {
        case 'subscribe':
          await this.handleSubscribe(connection, body.subscriptions);
          break;
        case 'unsubscribe':
          await this.handleUnsubscribe(connection, body.subscriptions);
          break;
        case 'ping':
          await this.sendMessage(connectionId, {
            type: 'pong',
            data: { timestamp: TimeUtils.now() }
          });
          break;
        default:
          logger.warn('Unknown message type', { type: body.type });
      }

      return {
        statusCode: 200,
        body: 'Message processed'
      };

    } catch (error) {
      logger.error('WebSocket message handling failed', error as Error);
      return {
        statusCode: 500,
        body: 'Message processing failed'
      };
    }
  }

  private async handleSubscribe(connection: StreamConnection, subscriptions: string[]) {
    if (subscriptions && Array.isArray(subscriptions)) {
      connection.subscriptions = [...new Set([...connection.subscriptions, ...subscriptions])];
      
      await this.sendMessage(connection.connectionId, {
        type: 'subscription_updated',
        data: {
          subscriptions: connection.subscriptions,
          timestamp: TimeUtils.now()
        }
      });
    }
  }

  private async handleUnsubscribe(connection: StreamConnection, subscriptions: string[]) {
    if (subscriptions && Array.isArray(subscriptions)) {
      connection.subscriptions = connection.subscriptions.filter(sub => !subscriptions.includes(sub));
      
      await this.sendMessage(connection.connectionId, {
        type: 'subscription_updated',
        data: {
          subscriptions: connection.subscriptions,
          timestamp: TimeUtils.now()
        }
      });
    }
  }

  async publishEvent(event: StreamEvent) {
    try {
      // Add to event queue
      this.eventQueue.push(event);
      
      // Process events if not already processing
      if (!this.isProcessing) {
        await this.processEventQueue();
      }

    } catch (error) {
      logger.error('Failed to publish event', error as Error);
    }
  }

  private async processEventQueue() {
    this.isProcessing = true;
    
    try {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift();
        if (!event) continue;

        // Find connections that should receive this event
        const targetConnections = Array.from(this.connections.values())
          .filter(conn => conn.subscriptions.includes(event.type));

        // Send event to all target connections
        for (const connection of targetConnections) {
          try {
            await this.sendMessage(connection.connectionId, event);
          } catch (error) {
            logger.error('Failed to send message to connection', {
              connectionId: connection.connectionId,
              error: error.message
            });
            
            // Remove failed connection
            this.connections.delete(connection.connectionId);
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async sendMessage(connectionId: string, event: StreamEvent) {
    try {
      const message = JSON.stringify(event);
      
      // In production, this would use API Gateway Management API
      // For now, we'll simulate the message sending
      logger.info('Sending message to connection', {
        connectionId,
        eventType: event.type,
        messageLength: message.length
      });

      // Store message in DynamoDB for persistence
      await this.storeMessage(connectionId, event);

    } catch (error) {
      logger.error('Failed to send message', {
        connectionId,
        error: error.message
      });
      throw error;
    }
  }

  private async storeMessage(connectionId: string, event: StreamEvent) {
    try {
      const messageRecord = {
        id: HashUtils.generateId(),
        connectionId,
        eventType: event.type,
        data: event.data,
        timestamp: event.timestamp,
        createdAt: TimeUtils.now()
      };

      await aws.dynamoPut(
        process.env.STREAM_MESSAGES_TABLE_NAME || 'ai-investment-stream-messages',
        messageRecord
      );

    } catch (error) {
      logger.error('Failed to store message', error as Error);
    }
  }

  private startEventProcessor() {
    // Process events every 100ms
    setInterval(() => {
      if (this.eventQueue.length > 0 && !this.isProcessing) {
        this.processEventQueue();
      }
    }, 100);

    // Clean up inactive connections every 5 minutes
    setInterval(() => {
      this.cleanupInactiveConnections();
    }, 5 * 60 * 1000);
  }

  private cleanupInactiveConnections() {
    const now = Date.now();
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutes

    for (const [connectionId, connection] of this.connections.entries()) {
      if (now - connection.lastActivity > inactiveThreshold) {
        logger.info('Removing inactive connection', { connectionId });
        this.connections.delete(connectionId);
      }
    }
  }
}

// Server-Sent Events Handler
class SSEHandler {
  private aws: AWSHelpers;
  private connections: Map<string, any> = new Map();

  constructor(aws: AWSHelpers) {
    this.aws = aws;
  }

  async handleSSE(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
      const userId = event.queryStringParameters?.userId || 'anonymous';
      const subscriptions = event.queryStringParameters?.subscriptions?.split(',') || ['signal', 'proposal'];
      
      logger.info('SSE connection established', {
        userId,
        subscriptions
      });

      // Create SSE response
      const headers = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      };

      // Send initial connection event
      const initialEvent = `data: ${JSON.stringify({
        type: 'connection',
        data: {
          message: 'SSE connection established',
          timestamp: TimeUtils.now(),
          subscriptions
        }
      })}\n\n`;

      return {
        statusCode: 200,
        headers,
        body: initialEvent
      };

    } catch (error) {
      logger.error('SSE connection failed', error as Error);
      return {
        statusCode: 500,
        body: 'SSE connection failed'
      };
    }
  }

  async publishSSEEvent(event: StreamEvent, userId?: string) {
    try {
      // Find connections that should receive this event
      const targetConnections = Array.from(this.connections.values())
        .filter(conn => {
          if (userId && conn.userId !== userId) return false;
          return conn.subscriptions.includes(event.type);
        });

      // Send event to all target connections
      for (const connection of targetConnections) {
        try {
          await this.sendSSEMessage(connection, event);
        } catch (error) {
          logger.error('Failed to send SSE message', {
            connectionId: connection.id,
            error: error.message
          });
        }
      }

    } catch (error) {
      logger.error('Failed to publish SSE event', error as Error);
    }
  }

  private async sendSSEMessage(connection: any, event: StreamEvent) {
    try {
      const message = `data: ${JSON.stringify(event)}\n\n`;
      
      // In production, this would send the message through the connection
      logger.info('Sending SSE message', {
        connectionId: connection.id,
        eventType: event.type
      });

    } catch (error) {
      logger.error('Failed to send SSE message', error as Error);
      throw error;
    }
  }
}

// Event Publishers
class EventPublisher {
  private streamingManager: StreamingManager;
  private sseHandler: SSEHandler;

  constructor(streamingManager: StreamingManager, sseHandler: SSEHandler) {
    this.streamingManager = streamingManager;
    this.sseHandler = sseHandler;
  }

  async publishSignalEvent(signal: any) {
    const event: StreamEvent = {
      id: HashUtils.generateId(),
      type: 'signal',
      data: {
        id: signal.id,
        source: signal.source,
        content: signal.content,
        scores: signal.scores,
        confidences: signal.confidences,
        timestamp: signal.timestamp
      },
      timestamp: TimeUtils.now()
    };

    await this.streamingManager.publishEvent(event);
    await this.sseHandler.publishSSEEvent(event);
  }

  async publishProposalEvent(proposal: any) {
    const event: StreamEvent = {
      id: HashUtils.generateId(),
      type: 'proposal',
      data: {
        id: proposal.id,
        thesis: proposal.thesis,
        assets: proposal.assets,
        size_pct: proposal.size_pct,
        risk_score: proposal.risk_score,
        expected_return: proposal.expected_return,
        status: proposal.status,
        timestamp: proposal.created_at
      },
      timestamp: TimeUtils.now()
    };

    await this.streamingManager.publishEvent(event);
    await this.sseHandler.publishSSEEvent(event);
  }

  async publishDecisionEvent(decision: any) {
    const event: StreamEvent = {
      id: HashUtils.generateId(),
      type: 'decision',
      data: {
        id: decision.id,
        proposal_id: decision.proposal_id,
        action: decision.action,
        confidence: decision.confidence,
        size_adjustment: decision.size_adjustment,
        timestamp: decision.created_at
      },
      timestamp: TimeUtils.now()
    };

    await this.streamingManager.publishEvent(event);
    await this.sseHandler.publishSSEEvent(event);
  }

  async publishOutcomeEvent(outcome: any) {
    const event: StreamEvent = {
      id: HashUtils.generateId(),
      type: 'outcome',
      data: {
        id: outcome.id,
        proposal_id: outcome.proposal_id,
        return_pct: outcome.return_pct,
        sharpe_ratio: outcome.sharpe_ratio,
        max_drawdown: outcome.max_drawdown,
        win_rate: outcome.win_rate,
        timestamp: outcome.created_at
      },
      timestamp: TimeUtils.now()
    };

    await this.streamingManager.publishEvent(event);
    await this.sseHandler.publishSSEEvent(event);
  }

  async publishRiskEvent(riskData: any) {
    const event: StreamEvent = {
      id: HashUtils.generateId(),
      type: 'risk',
      data: {
        risk_score: riskData.risk_score,
        var: riskData.var,
        cvar: riskData.cvar,
        volatility: riskData.volatility,
        correlation: riskData.correlation,
        recommendations: riskData.recommendations,
        timestamp: TimeUtils.now()
      },
      timestamp: TimeUtils.now()
    };

    await this.streamingManager.publishEvent(event);
    await this.sseHandler.publishSSEEvent(event);
  }

  async publishSystemEvent(systemData: any) {
    const event: StreamEvent = {
      id: HashUtils.generateId(),
      type: 'system',
      data: {
        health: systemData.health,
        metrics: systemData.metrics,
        alerts: systemData.alerts,
        timestamp: TimeUtils.now()
      },
      timestamp: TimeUtils.now()
    };

    await this.streamingManager.publishEvent(event);
    await this.sseHandler.publishSSEEvent(event);
  }
}

// Main Lambda Handler
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const startTime = Date.now();
  
  try {
    const routeKey = event.requestContext.routeKey;
    const connectionId = event.requestContext.connectionId;
    
    logger.info('Streaming request received', {
      routeKey,
      connectionId,
      requestId: event.requestContext.requestId
    });

    // Initialize streaming manager
    const streamingManager = new StreamingManager(aws);
    const sseHandler = new SSEHandler(aws);

    // Route to appropriate handler
    switch (routeKey) {
      case '$connect':
        return await streamingManager.handleConnection(event);
      
      case '$disconnect':
        return await streamingManager.handleDisconnection(event);
      
      case '$default':
        return await streamingManager.handleMessage(event);
      
      default:
        logger.warn('Unknown route key', { routeKey });
        return {
          statusCode: 400,
          body: 'Unknown route'
        };
    }

  } catch (error) {
    logger.error('Streaming handler failed', error as Error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        ok: false,
        error: 'Streaming handler failed',
        details: error.message
      })
    };
  }
};

// SSE Handler
export const sseHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const sseHandler = new SSEHandler(aws);
    return await sseHandler.handleSSE(event);
  } catch (error) {
    logger.error('SSE handler failed', error as Error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        ok: false,
        error: 'SSE handler failed',
        details: error.message
      })
    };
  }
};

// Event Publisher Handler
export const eventPublisher = async (event: any): Promise<void> => {
  try {
    const streamingManager = new StreamingManager(aws);
    const sseHandler = new SSEHandler(aws);
    const publisher = new EventPublisher(streamingManager, sseHandler);

    // Parse the event
    const eventData = JSON.parse(event.Records[0].body);
    const eventType = eventData.eventType;
    const data = eventData.data;

    // Publish based on event type
    switch (eventType) {
      case 'signal':
        await publisher.publishSignalEvent(data);
        break;
      case 'proposal':
        await publisher.publishProposalEvent(data);
        break;
      case 'decision':
        await publisher.publishDecisionEvent(data);
        break;
      case 'outcome':
        await publisher.publishOutcomeEvent(data);
        break;
      case 'risk':
        await publisher.publishRiskEvent(data);
        break;
      case 'system':
        await publisher.publishSystemEvent(data);
        break;
      default:
        logger.warn('Unknown event type', { eventType });
    }

  } catch (error) {
    logger.error('Event publisher failed', error as Error);
    throw error;
  }
};

// Export for use in other modules
export { StreamingManager, SSEHandler, EventPublisher };
