"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketStack = void 0;
const cdk = require("aws-cdk-lib");
const apigatewayv2 = require("@aws-cdk/aws-apigatewayv2-alpha");
const apigatewayv2_integrations = require("@aws-cdk/aws-apigatewayv2-integrations-alpha");
const lambda = require("aws-cdk-lib/aws-lambda");
const dynamodb = require("aws-cdk-lib/aws-dynamodb");
const iam = require("aws-cdk-lib/aws-iam");
/**
 * WebSocket Stack für Echtzeit-Multiplayer-Spiele
 *
 * Features:
 * - WebSocket API Gateway für bidirektionale Kommunikation
 * - DynamoDB für Verbindungen und Spielstände
 * - Lambda Functions für connect/disconnect/message
 */
class WebSocketStack extends cdk.Stack {
    constructor(scope, id, props) {
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
            removalPolicy: cdk.RemovalPolicy.DESTROY,
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
            code: lambda.Code.fromAsset('../lambda/websocket-connect'),
            environment: lambdaEnvironment,
            timeout: cdk.Duration.seconds(10),
            memorySize: 256,
        });
        // Disconnect Handler
        const disconnectHandler = new lambda.Function(this, 'DisconnectHandler', {
            functionName: `game-ws-disconnect-${environment}`,
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('../lambda/websocket-disconnect'),
            environment: lambdaEnvironment,
            timeout: cdk.Duration.seconds(10),
            memorySize: 256,
        });
        // Message Handler (Default Route)
        const messageHandler = new lambda.Function(this, 'MessageHandler', {
            functionName: `game-ws-message-${environment}`,
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('../lambda/websocket-message'),
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
                integration: new apigatewayv2_integrations.WebSocketLambdaIntegration('ConnectIntegration', connectHandler),
            },
            disconnectRouteOptions: {
                integration: new apigatewayv2_integrations.WebSocketLambdaIntegration('DisconnectIntegration', disconnectHandler),
            },
            defaultRouteOptions: {
                integration: new apigatewayv2_integrations.WebSocketLambdaIntegration('MessageIntegration', messageHandler),
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
exports.WebSocketStack = WebSocketStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vic29ja2V0LXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsid2Vic29ja2V0LXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFtQztBQUNuQyxnRUFBZ0U7QUFDaEUsMEZBQTBGO0FBQzFGLGlEQUFpRDtBQUNqRCxxREFBcUQ7QUFDckQsMkNBQTJDO0FBUTNDOzs7Ozs7O0dBT0c7QUFDSCxNQUFhLGNBQWUsU0FBUSxHQUFHLENBQUMsS0FBSztJQU0zQyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQTJCO1FBQ25FLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sV0FBVyxHQUFHLEtBQUssRUFBRSxXQUFXLElBQUksWUFBWSxDQUFDO1FBRXZELHdEQUF3RDtRQUN4RCxvQkFBb0I7UUFDcEIsd0RBQXdEO1FBRXhELHFDQUFxQztRQUNyQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRTtZQUNsRSxTQUFTLEVBQUUsb0JBQW9CLFdBQVcsRUFBRTtZQUM1QyxZQUFZLEVBQUUsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRTtZQUMzRSxXQUFXLEVBQUUsUUFBUSxDQUFDLFdBQVcsQ0FBQyxlQUFlO1lBQ2pELGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE9BQU87WUFDeEMsbUJBQW1CLEVBQUUsS0FBSyxFQUFFLHdCQUF3QjtTQUNyRCxDQUFDLENBQUM7UUFFSCwwQkFBMEI7UUFDMUIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLHVCQUF1QixDQUFDO1lBQzVDLFNBQVMsRUFBRSxjQUFjO1lBQ3pCLFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENB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QUFjLENBQUMsY0FBYyxDQUFDLG9CQUFvQixFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ2hFLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUVuRSx3REFBd0Q7UUFDeEQsVUFBVTtRQUNWLHdEQUF3RDtRQUV4RCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtZQUN0QyxLQUFLLEVBQUUsU0FBUyxVQUFVLEVBQUU7WUFDNUIsV0FBVyxFQUFFLDBCQUEwQjtZQUN2QyxVQUFVLEVBQUUsb0JBQW9CLFdBQVcsRUFBRTtTQUM5QyxDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFO1lBQ3hDLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUs7WUFDOUIsV0FBVyxFQUFFLGtCQUFrQjtTQUNoQyxDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLHNCQUFzQixFQUFFO1lBQzlDLEtBQUssRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUztZQUN0QyxXQUFXLEVBQUUsNEJBQTRCO1NBQzFDLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7WUFDeEMsS0FBSyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUztZQUNoQyxXQUFXLEVBQUUsc0JBQXNCO1NBQ3BDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQXhMRCx3Q0F3TEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheXYyIGZyb20gJ0Bhd3MtY2RrL2F3cy1hcGlnYXRld2F5djItYWxwaGEnO1xuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheXYyX2ludGVncmF0aW9ucyBmcm9tICdAYXdzLWNkay9hd3MtYXBpZ2F0ZXdheXYyLWludGVncmF0aW9ucy1hbHBoYSc7XG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XG5pbXBvcnQgKiBhcyBkeW5hbW9kYiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZHluYW1vZGInO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgV2ViU29ja2V0U3RhY2tQcm9wcyBleHRlbmRzIGNkay5TdGFja1Byb3BzIHtcbiAgZW52aXJvbm1lbnQ/OiBzdHJpbmc7XG4gIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIFdlYlNvY2tldCBTdGFjayBmw7xyIEVjaHR6ZWl0LU11bHRpcGxheWVyLVNwaWVsZVxuICogXG4gKiBGZWF0dXJlczpcbiAqIC0gV2ViU29ja2V0IEFQSSBHYXRld2F5IGbDvHIgYmlkaXJla3Rpb25hbGUgS29tbXVuaWthdGlvblxuICogLSBEeW5hbW9EQiBmw7xyIFZlcmJpbmR1bmdlbiB1bmQgU3BpZWxzdMOkbmRlXG4gKiAtIExhbWJkYSBGdW5jdGlvbnMgZsO8ciBjb25uZWN0L2Rpc2Nvbm5lY3QvbWVzc2FnZVxuICovXG5leHBvcnQgY2xhc3MgV2ViU29ja2V0U3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBwdWJsaWMgcmVhZG9ubHkgd2ViU29ja2V0QXBpOiBhcGlnYXRld2F5djIuV2ViU29ja2V0QXBpO1xuICBwdWJsaWMgcmVhZG9ubHkgd2ViU29ja2V0U3RhZ2U6IGFwaWdhdGV3YXl2Mi5XZWJTb2NrZXRTdGFnZTtcbiAgcHVibGljIHJlYWRvbmx5IGNvbm5lY3Rpb25zVGFibGU6IGR5bmFtb2RiLlRhYmxlO1xuICBwdWJsaWMgcmVhZG9ubHkgZ2FtZXNUYWJsZTogZHluYW1vZGIuVGFibGU7XG5cbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBXZWJTb2NrZXRTdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICBjb25zdCBlbnZpcm9ubWVudCA9IHByb3BzPy5lbnZpcm9ubWVudCB8fCAncHJvZHVjdGlvbic7XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIER5bmFtb0RCIFRhYmVsbGVuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8vIFRhYmVsbGUgZsO8ciBXZWJTb2NrZXQtVmVyYmluZHVuZ2VuXG4gICAgdGhpcy5jb25uZWN0aW9uc1RhYmxlID0gbmV3IGR5bmFtb2RiLlRhYmxlKHRoaXMsICdHYW1lQ29ubmVjdGlvbnMnLCB7XG4gICAgICB0YWJsZU5hbWU6IGBnYW1lLWNvbm5lY3Rpb25zLSR7ZW52aXJvbm1lbnR9YCxcbiAgICAgIHBhcnRpdGlvbktleTogeyBuYW1lOiAnY29ubmVjdGlvbklkJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbiAgICAgIGJpbGxpbmdNb2RlOiBkeW5hbW9kYi5CaWxsaW5nTW9kZS5QQVlfUEVSX1JFUVVFU1QsXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLCAvLyBGw7xyIEVudHdpY2tsdW5nXG4gICAgICB0aW1lVG9MaXZlQXR0cmlidXRlOiAndHRsJywgLy8gQXV0b21hdGlzY2hlcyBDbGVhbnVwXG4gICAgfSk7XG5cbiAgICAvLyBHU0kgZsO8ciBVc2VyLUlEIExvb2t1cHNcbiAgICB0aGlzLmNvbm5lY3Rpb25zVGFibGUuYWRkR2xvYmFsU2Vjb25kYXJ5SW5kZXgoe1xuICAgICAgaW5kZXhOYW1lOiAndXNlcklkLWluZGV4JyxcbiAgICAgIHBhcnRpdGlvbktleTogeyBuYW1lOiAndXNlcklkJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbiAgICAgIHByb2plY3Rpb25UeXBlOiBkeW5hbW9kYi5Qcm9qZWN0aW9uVHlwZS5BTEwsXG4gICAgfSk7XG5cbiAgICAvLyBUYWJlbGxlIGbDvHIgYWt0aXZlIFNwaWVsZVxuICAgIHRoaXMuZ2FtZXNUYWJsZSA9IG5ldyBkeW5hbW9kYi5UYWJsZSh0aGlzLCAnQWN0aXZlR2FtZXMnLCB7XG4gICAgICB0YWJsZU5hbWU6IGBhY3RpdmUtZ2FtZXMtJHtlbnZpcm9ubWVudH1gLFxuICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICdnYW1lSWQnLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxuICAgICAgYmlsbGluZ01vZGU6IGR5bmFtb2RiLkJpbGxpbmdNb2RlLlBBWV9QRVJfUkVRVUVTVCxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgICB0aW1lVG9MaXZlQXR0cmlidXRlOiAndHRsJyxcbiAgICB9KTtcblxuICAgIC8vIEdTSSBmw7xyIFNwaWVsZXItTG9va3Vwc1xuICAgIHRoaXMuZ2FtZXNUYWJsZS5hZGRHbG9iYWxTZWNvbmRhcnlJbmRleCh7XG4gICAgICBpbmRleE5hbWU6ICdwbGF5ZXIxLWluZGV4JyxcbiAgICAgIHBhcnRpdGlvbktleTogeyBuYW1lOiAncGxheWVyMUlkJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbiAgICAgIHByb2plY3Rpb25UeXBlOiBkeW5hbW9kYi5Qcm9qZWN0aW9uVHlwZS5BTEwsXG4gICAgfSk7XG5cbiAgICB0aGlzLmdhbWVzVGFibGUuYWRkR2xvYmFsU2Vjb25kYXJ5SW5kZXgoe1xuICAgICAgaW5kZXhOYW1lOiAncGxheWVyMi1pbmRleCcsXG4gICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogJ3BsYXllcjJJZCcsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXG4gICAgICBwcm9qZWN0aW9uVHlwZTogZHluYW1vZGIuUHJvamVjdGlvblR5cGUuQUxMLFxuICAgIH0pO1xuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBMYW1iZGEgRnVuY3Rpb25zXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8vIEdlbWVpbnNhbWUgTGFtYmRhLUtvbmZpZ3VyYXRpb25cbiAgICBjb25zdCBsYW1iZGFFbnZpcm9ubWVudCA9IHtcbiAgICAgIENPTk5FQ1RJT05TX1RBQkxFOiB0aGlzLmNvbm5lY3Rpb25zVGFibGUudGFibGVOYW1lLFxuICAgICAgR0FNRVNfVEFCTEU6IHRoaXMuZ2FtZXNUYWJsZS50YWJsZU5hbWUsXG4gICAgICBFTlZJUk9OTUVOVDogZW52aXJvbm1lbnQsXG4gICAgfTtcblxuICAgIC8vIENvbm5lY3QgSGFuZGxlclxuICAgIGNvbnN0IGNvbm5lY3RIYW5kbGVyID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQ29ubmVjdEhhbmRsZXInLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6IGBnYW1lLXdzLWNvbm5lY3QtJHtlbnZpcm9ubWVudH1gLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2xhbWJkYS93ZWJzb2NrZXQtY29ubmVjdCcpLFxuICAgICAgZW52aXJvbm1lbnQ6IGxhbWJkYUVudmlyb25tZW50LFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMTApLFxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxuICAgIH0pO1xuXG4gICAgLy8gRGlzY29ubmVjdCBIYW5kbGVyXG4gICAgY29uc3QgZGlzY29ubmVjdEhhbmRsZXIgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdEaXNjb25uZWN0SGFuZGxlcicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogYGdhbWUtd3MtZGlzY29ubmVjdC0ke2Vudmlyb25tZW50fWAsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL3dlYnNvY2tldC1kaXNjb25uZWN0JyksXG4gICAgICBlbnZpcm9ubWVudDogbGFtYmRhRW52aXJvbm1lbnQsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygxMCksXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXG4gICAgfSk7XG5cbiAgICAvLyBNZXNzYWdlIEhhbmRsZXIgKERlZmF1bHQgUm91dGUpXG4gICAgY29uc3QgbWVzc2FnZUhhbmRsZXIgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdNZXNzYWdlSGFuZGxlcicsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogYGdhbWUtd3MtbWVzc2FnZS0ke2Vudmlyb25tZW50fWAsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi4vbGFtYmRhL3dlYnNvY2tldC1tZXNzYWdlJyksXG4gICAgICBlbnZpcm9ubWVudDogbGFtYmRhRW52aXJvbm1lbnQsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXG4gICAgICBtZW1vcnlTaXplOiA1MTIsXG4gICAgfSk7XG5cbiAgICAvLyBEeW5hbW9EQiBCZXJlY2h0aWd1bmdlblxuICAgIHRoaXMuY29ubmVjdGlvbnNUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEoY29ubmVjdEhhbmRsZXIpO1xuICAgIHRoaXMuY29ubmVjdGlvbnNUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEoZGlzY29ubmVjdEhhbmRsZXIpO1xuICAgIHRoaXMuY29ubmVjdGlvbnNUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEobWVzc2FnZUhhbmRsZXIpO1xuICAgIHRoaXMuZ2FtZXNUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEobWVzc2FnZUhhbmRsZXIpO1xuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBXZWJTb2NrZXQgQVBJIEdhdGV3YXlcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgdGhpcy53ZWJTb2NrZXRBcGkgPSBuZXcgYXBpZ2F0ZXdheXYyLldlYlNvY2tldEFwaSh0aGlzLCAnR2FtZVdlYlNvY2tldEFwaScsIHtcbiAgICAgIGFwaU5hbWU6IGBnYW1lLXdlYnNvY2tldC0ke2Vudmlyb25tZW50fWAsXG4gICAgICBkZXNjcmlwdGlvbjogJ1dlYlNvY2tldCBBUEkgZsO8ciBFY2h0emVpdC1NdWx0aXBsYXllci1TcGllbGUnLFxuICAgICAgY29ubmVjdFJvdXRlT3B0aW9uczoge1xuICAgICAgICBpbnRlZ3JhdGlvbjogbmV3IGFwaWdhdGV3YXl2Ml9pbnRlZ3JhdGlvbnMuV2ViU29ja2V0TGFtYmRhSW50ZWdyYXRpb24oXG4gICAgICAgICAgJ0Nvbm5lY3RJbnRlZ3JhdGlvbicsXG4gICAgICAgICAgY29ubmVjdEhhbmRsZXJcbiAgICAgICAgKSxcbiAgICAgIH0sXG4gICAgICBkaXNjb25uZWN0Um91dGVPcHRpb25zOiB7XG4gICAgICAgIGludGVncmF0aW9uOiBuZXcgYXBpZ2F0ZXdheXYyX2ludGVncmF0aW9ucy5XZWJTb2NrZXRMYW1iZGFJbnRlZ3JhdGlvbihcbiAgICAgICAgICAnRGlzY29ubmVjdEludGVncmF0aW9uJyxcbiAgICAgICAgICBkaXNjb25uZWN0SGFuZGxlclxuICAgICAgICApLFxuICAgICAgfSxcbiAgICAgIGRlZmF1bHRSb3V0ZU9wdGlvbnM6IHtcbiAgICAgICAgaW50ZWdyYXRpb246IG5ldyBhcGlnYXRld2F5djJfaW50ZWdyYXRpb25zLldlYlNvY2tldExhbWJkYUludGVncmF0aW9uKFxuICAgICAgICAgICdNZXNzYWdlSW50ZWdyYXRpb24nLFxuICAgICAgICAgIG1lc3NhZ2VIYW5kbGVyXG4gICAgICAgICksXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gV2ViU29ja2V0IFN0YWdlXG4gICAgdGhpcy53ZWJTb2NrZXRTdGFnZSA9IG5ldyBhcGlnYXRld2F5djIuV2ViU29ja2V0U3RhZ2UodGhpcywgJ0dhbWVXZWJTb2NrZXRTdGFnZScsIHtcbiAgICAgIHdlYlNvY2tldEFwaTogdGhpcy53ZWJTb2NrZXRBcGksXG4gICAgICBzdGFnZU5hbWU6IGVudmlyb25tZW50ID09PSAncHJvZHVjdGlvbicgPyAncHJvZCcgOiAnZGV2JyxcbiAgICAgIGF1dG9EZXBsb3k6IHRydWUsXG4gICAgfSk7XG5cbiAgICAvLyBCZXJlY2h0aWd1bmcgZsO8ciBMYW1iZGEsIE5hY2hyaWNodGVuIGFuIENsaWVudHMgenUgc2VuZGVuXG4gICAgY29uc3QgYXBpQXJuID0gYGFybjphd3M6ZXhlY3V0ZS1hcGk6JHt0aGlzLnJlZ2lvbn06JHt0aGlzLmFjY291bnR9OiR7dGhpcy53ZWJTb2NrZXRBcGkuYXBpSWR9LyR7dGhpcy53ZWJTb2NrZXRTdGFnZS5zdGFnZU5hbWV9LypgO1xuICAgIFxuICAgIG1lc3NhZ2VIYW5kbGVyLmFkZFRvUm9sZVBvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICBhY3Rpb25zOiBbJ2V4ZWN1dGUtYXBpOk1hbmFnZUNvbm5lY3Rpb25zJ10sXG4gICAgICByZXNvdXJjZXM6IFthcGlBcm5dLFxuICAgIH0pKTtcblxuICAgIC8vIEF1Y2ggZsO8ciBkaXNjb25uZWN0IChjbGVhbnVwKVxuICAgIGRpc2Nvbm5lY3RIYW5kbGVyLmFkZFRvUm9sZVBvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICBhY3Rpb25zOiBbJ2V4ZWN1dGUtYXBpOk1hbmFnZUNvbm5lY3Rpb25zJ10sXG4gICAgICByZXNvdXJjZXM6IFthcGlBcm5dLFxuICAgIH0pKTtcblxuICAgIC8vIEVudmlyb25tZW50IFZhcmlhYmxlIGbDvHIgV2ViU29ja2V0IEVuZHBvaW50XG4gICAgY29uc3Qgd3NFbmRwb2ludCA9IGAke3RoaXMud2ViU29ja2V0QXBpLmFwaUlkfS5leGVjdXRlLWFwaS4ke3RoaXMucmVnaW9ufS5hbWF6b25hd3MuY29tLyR7dGhpcy53ZWJTb2NrZXRTdGFnZS5zdGFnZU5hbWV9YDtcbiAgICBcbiAgICBtZXNzYWdlSGFuZGxlci5hZGRFbnZpcm9ubWVudCgnV0VCU09DS0VUX0VORFBPSU5UJywgd3NFbmRwb2ludCk7XG4gICAgZGlzY29ubmVjdEhhbmRsZXIuYWRkRW52aXJvbm1lbnQoJ1dFQlNPQ0tFVF9FTkRQT0lOVCcsIHdzRW5kcG9pbnQpO1xuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBPdXRwdXRzXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdXZWJTb2NrZXRVcmwnLCB7XG4gICAgICB2YWx1ZTogYHdzczovLyR7d3NFbmRwb2ludH1gLFxuICAgICAgZGVzY3JpcHRpb246ICdXZWJTb2NrZXQgVVJMIGbDvHIgU3BpZWxlJyxcbiAgICAgIGV4cG9ydE5hbWU6IGBHYW1lV2ViU29ja2V0VXJsLSR7ZW52aXJvbm1lbnR9YCxcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdXZWJTb2NrZXRBcGlJZCcsIHtcbiAgICAgIHZhbHVlOiB0aGlzLndlYlNvY2tldEFwaS5hcGlJZCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnV2ViU29ja2V0IEFQSSBJRCcsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQ29ubmVjdGlvbnNUYWJsZU5hbWUnLCB7XG4gICAgICB2YWx1ZTogdGhpcy5jb25uZWN0aW9uc1RhYmxlLnRhYmxlTmFtZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnRHluYW1vREIgQ29ubmVjdGlvbnMgVGFibGUnLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0dhbWVzVGFibGVOYW1lJywge1xuICAgICAgdmFsdWU6IHRoaXMuZ2FtZXNUYWJsZS50YWJsZU5hbWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ0R5bmFtb0RCIEdhbWVzIFRhYmxlJyxcbiAgICB9KTtcbiAgfVxufVxuIl19