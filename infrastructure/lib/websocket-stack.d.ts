import * as cdk from 'aws-cdk-lib';
import * as apigatewayv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
export interface WebSocketStackProps extends cdk.StackProps {
    environment?: string;
    description?: string;
}
/**
 * WebSocket Stack für Echtzeit-Multiplayer-Spiele
 *
 * Features:
 * - WebSocket API Gateway für bidirektionale Kommunikation
 * - DynamoDB für Verbindungen und Spielstände
 * - Lambda Functions für connect/disconnect/message
 */
export declare class WebSocketStack extends cdk.Stack {
    readonly webSocketApi: apigatewayv2.WebSocketApi;
    readonly webSocketStage: apigatewayv2.WebSocketStage;
    readonly connectionsTable: dynamodb.Table;
    readonly gamesTable: dynamodb.Table;
    constructor(scope: Construct, id: string, props?: WebSocketStackProps);
}
