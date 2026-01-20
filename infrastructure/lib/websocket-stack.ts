import * as cdk from 'aws-cdk-lib';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayv2_integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface WebSocketStackProps extends cdk.StackProps {
  environment?: string;
}

/**
 * WebSocket Stack für Echtzeit-Multiplayer-Spiele
 * 
 * Features:
 * - WebSocket API Gateway für bidirektionale Kommunikation
 * - DynamoDB für Verbindungen und Spielstände
 * - Lambda Functions für connect/disconnect/message
 */
export class WebSocketStack extends cdk.Stack {
  public readonly webSocketApi: apigatewayv2.WebSocketApi;
  public readonly webSocketStage: apigatewayv2.WebSocketStage;
  public readonly connectionsTable: dynamodb.Table;
  public readonly gamesTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: WebSocketStackProps) {
    super(scope, id, props);

    const environment = props?.environment || 'production';

    // =====================================================
    // DynamoDB Tabellen
    // =====================================================

    // Tabelle für WebSocket-Verbindungen
    this.connectionsTable = new dynamodb.Table(this, 'GameConnections', {
      tableName: `game-connections-${environment}`,
      partitionKey: { name: 'connectionId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Für Entwicklung
      timeToLiveAttribute: 'ttl', // Automatisches Cleanup
    });

    // GSI für User-ID Lookups
    this.connectionsTable.addGlobalSecondaryIndex({
      indexName: 'userId-index',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Tabelle für aktive Spiele
    this.gamesTable = new dynamodb.Table(this, 'ActiveGames', {
      tableName: `active-games-${environment}`,
      partitionKey: { name: 'gameId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      timeToLiveAttribute: 'ttl',
    });

    // GSI für Spieler-Lookups
    this.gamesTable.addGlobalSecondaryIndex({
      indexName: 'player1-index',
      partitionKey: { name: 'player1Id', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    this.gamesTable.addGlobalSecondaryIndex({
      indexName: 'player2-index',
      partitionKey: { name: 'player2Id', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // =====================================================
    // Lambda Functions
    // =====================================================

    // Gemeinsame Lambda-Konfiguration
    const lambdaEnvironment = {
      CONNECTIONS_TABLE: this.connectionsTable.tableName,
      GAMES_TABLE: this.gamesTable.tableName,
      ENVIRONMENT: environment,
    };

    // Connect Handler
    const connectHandler = new lambda.Function(this, 'ConnectHandler', {
      functionName: `game-ws-connect-${environment}`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/websocket-connect'),
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
    });

    // Disconnect Handler
    const disconnectHandler = new lambda.Function(this, 'DisconnectHandler', {
      functionName: `game-ws-disconnect-${environment}`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/websocket-disconnect'),
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
    });

    // Message Handler (Default Route)
    const messageHandler = new lambda.Function(this, 'MessageHandler', {
      functionName: `game-ws-message-${environment}`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/websocket-message'),
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
    });

    // DynamoDB Berechtigungen
    this.connectionsTable.grantReadWriteData(connectHandler);
    this.connectionsTable.grantReadWriteData(disconnectHandler);
    this.connectionsTable.grantReadWriteData(messageHandler);
    this.gamesTable.grantReadWriteData(messageHandler);

    // =====================================================
    // WebSocket API Gateway
    // =====================================================

    this.webSocketApi = new apigatewayv2.WebSocketApi(this, 'GameWebSocketApi', {
      apiName: `game-websocket-${environment}`,
      description: 'WebSocket API für Echtzeit-Multiplayer-Spiele',
      connectRouteOptions: {
        integration: new apigatewayv2_integrations.WebSocketLambdaIntegration(
          'ConnectIntegration',
          connectHandler
        ),
      },
      disconnectRouteOptions: {
        integration: new apigatewayv2_integrations.WebSocketLambdaIntegration(
          'DisconnectIntegration',
          disconnectHandler
        ),
      },
      defaultRouteOptions: {
        integration: new apigatewayv2_integrations.WebSocketLambdaIntegration(
          'MessageIntegration',
          messageHandler
        ),
      },
    });

    // WebSocket Stage
    this.webSocketStage = new apigatewayv2.WebSocketStage(this, 'GameWebSocketStage', {
      webSocketApi: this.webSocketApi,
      stageName: environment === 'production' ? 'prod' : 'dev',
      autoDeploy: true,
    });

    // Berechtigung für Lambda, Nachrichten an Clients zu senden
    const apiArn = `arn:aws:execute-api:${this.region}:${this.account}:${this.webSocketApi.apiId}/${this.webSocketStage.stageName}/*`;
    
    messageHandler.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['execute-api:ManageConnections'],
      resources: [apiArn],
    }));

    // Auch für disconnect (cleanup)
    disconnectHandler.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['execute-api:ManageConnections'],
      resources: [apiArn],
    }));

    // Environment Variable für WebSocket Endpoint
    const wsEndpoint = `${this.webSocketApi.apiId}.execute-api.${this.region}.amazonaws.com/${this.webSocketStage.stageName}`;
    
    messageHandler.addEnvironment('WEBSOCKET_ENDPOINT', wsEndpoint);
    disconnectHandler.addEnvironment('WEBSOCKET_ENDPOINT', wsEndpoint);

    // =====================================================
    // Outputs
    // =====================================================

    new cdk.CfnOutput(this, 'WebSocketUrl', {
      value: `wss://${wsEndpoint}`,
      description: 'WebSocket URL für Spiele',
      exportName: `GameWebSocketUrl-${environment}`,
    });

    new cdk.CfnOutput(this, 'WebSocketApiId', {
      value: this.webSocketApi.apiId,
      description: 'WebSocket API ID',
    });

    new cdk.CfnOutput(this, 'ConnectionsTableName', {
      value: this.connectionsTable.tableName,
      description: 'DynamoDB Connections Table',
    });

    new cdk.CfnOutput(this, 'GamesTableName', {
      value: this.gamesTable.tableName,
      description: 'DynamoDB Games Table',
    });
  }
}
