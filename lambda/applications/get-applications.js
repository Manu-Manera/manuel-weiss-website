/**
 * Lambda Function: Get Applications
 * GET /applications
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

export const handler = async (event) => {
  console.log('📋 Get Applications Request:', JSON.stringify(event, null, 2));

  try {
    // JWT Token aus Header extrahieren
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify({
          error: 'Unauthorized',
          message: 'Valid JWT token required'
        })
      };
    }

    // User ID aus JWT Token extrahieren
    const token = authHeader.substring(7);
    const userId = extractUserIdFromToken(token);

    if (!userId) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Invalid Token',
          message: 'Could not extract user ID from token'
        })
      };
    }

    // Query Parameters
    const queryParams = event.queryStringParameters || {};
    const limit = Math.min(parseInt(queryParams.limit) || 20, 100); // Max 100
    const lastKey = queryParams.lastKey ? JSON.parse(decodeURIComponent(queryParams.lastKey)) : null;
    const status = queryParams.status;

    // DynamoDB Query
    const queryParams_ddb = {
      TableName: process.env.APPLICATIONS_TABLE,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`
      },
      ScanIndexForward: false, // Newest first
      Limit: limit
    };

    // Status Filter hinzufügen
    if (status) {
      queryParams_ddb.FilterExpression = '#status = :status';
      queryParams_ddb.ExpressionAttributeNames = {
        '#status': 'status'
      };
      queryParams_ddb.ExpressionAttributeValues[':status'] = status;
    }

    // Pagination
    if (lastKey) {
      queryParams_ddb.ExclusiveStartKey = lastKey;
    }

    const result = await docClient.send(new QueryCommand(queryParams_ddb));

    // Applications formatieren
    const applications = (result.Items || []).map(item => ({
      appId: item.appId,
      userId: item.userId,
      status: item.status,
      position: item.position,
      company: item.company,
      jobDescription: item.jobDescription,
      generatedCoverLetter: item.generatedCoverLetter,
      matchingScore: item.matchingScore,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      submittedAt: item.submittedAt,
      version: item.version,
      tags: item.tags || []
    }));

    // Response
    const response = {
      success: true,
      applications,
      pagination: {
        count: applications.length,
        hasMore: !!result.LastEvaluatedKey,
        lastKey: result.LastEvaluatedKey ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey)) : null
      }
    };

    console.log(`✅ Retrieved ${applications.length} applications for user ${userId}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('❌ Error getting applications:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: 'Failed to retrieve applications',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};

/**
 * User ID aus JWT Token extrahieren
 */
function extractUserIdFromToken(token) {
  try {
    // Vereinfachte Token-Parsing (in Produktion: proper JWT verification)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.user_id;
  } catch (error) {
    console.error('Token parsing error:', error);
    return null;
  }
}
