/**
 * Lambda Function: Update Application
 * PUT /applications/{id}
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

export const handler = async (event) => {
  console.log('✏️ Update Application Request:', JSON.stringify(event, null, 2));

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

    // Application ID aus Path
    const appId = event.pathParameters?.id;
    if (!appId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'Application ID is required'
        })
      };
    }

    // Request Body parsen
    const body = JSON.parse(event.body || '{}');
    
    // Validierung
    const validation = validateUpdateData(body);
    if (!validation.isValid) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Validation Error',
          message: 'Invalid update data',
          details: validation.errors
        })
      };
    }

    // Bestehende Application laden
    const getResult = await docClient.send(new GetCommand({
      TableName: process.env.APPLICATIONS_TABLE,
      Key: {
        PK: `USER#${userId}`,
        SK: `APP#${appId}`
      }
    }));

    if (!getResult.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Not Found',
          message: 'Application not found'
        })
      };
    }

    // Optimistic Concurrency Check
    const expectedVersion = parseInt(event.headers['if-match'] || '0');
    if (getResult.Item.version !== expectedVersion) {
      return {
        statusCode: 409,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Conflict',
          message: 'Application was modified by another user',
          currentVersion: getResult.Item.version
        })
      };
    }

    // Application aktualisieren
    const now = new Date().toISOString();
    const updatedApplication = {
      ...getResult.Item,
      ...body,
      updatedAt: now,
      version: getResult.Item.version + 1,
      metadata: {
        ...getResult.Item.metadata,
        lastModifiedBy: 'web',
        lastModifiedAt: now,
        userAgent: event.headers['User-Agent'] || '',
        ipAddress: event.requestContext?.identity?.sourceIp || ''
      }
    };

    // In DynamoDB speichern
    await docClient.send(new PutCommand({
      TableName: process.env.APPLICATIONS_TABLE,
      Item: updatedApplication,
      ConditionExpression: 'PK = :pk AND SK = :sk AND version = :version',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': `APP#${appId}`,
        ':version': getResult.Item.version
      }
    }));

    console.log('✅ Application updated successfully:', appId);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'ETag': updatedApplication.version.toString()
      },
      body: JSON.stringify({
        success: true,
        application: {
          appId: updatedApplication.appId,
          userId: updatedApplication.userId,
          status: updatedApplication.status,
          position: updatedApplication.position,
          company: updatedApplication.company,
          jobDescription: updatedApplication.jobDescription,
          generatedCoverLetter: updatedApplication.generatedCoverLetter,
          matchingScore: updatedApplication.matchingScore,
          createdAt: updatedApplication.createdAt,
          updatedAt: updatedApplication.updatedAt,
          submittedAt: updatedApplication.submittedAt,
          version: updatedApplication.version,
          tags: updatedApplication.tags || []
        },
        message: 'Application updated successfully'
      })
    };

  } catch (error) {
    console.error('❌ Error updating application:', error);

    // Conditional Check Failed = Version Conflict
    if (error.name === 'ConditionalCheckFailedException') {
      return {
        statusCode: 409,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Conflict',
          message: 'Application was modified by another user'
        })
      };
    }

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: 'Failed to update application',
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

/**
 * Update Data validieren
 */
function validateUpdateData(data) {
  const errors = [];

  if (data.position && (typeof data.position !== 'string' || data.position.trim().length === 0)) {
    errors.push('Position must be a non-empty string');
  }

  if (data.company && (typeof data.company !== 'string' || data.company.trim().length === 0)) {
    errors.push('Company must be a non-empty string');
  }

  if (data.jobDescription && typeof data.jobDescription !== 'string') {
    errors.push('Job description must be a string');
  }

  if (data.status && !['DRAFT', 'ANALYZING', 'GENERATING_LETTER', 'REVIEW', 'READY', 'FAILED'].includes(data.status)) {
    errors.push('Status must be one of: DRAFT, ANALYZING, GENERATING_LETTER, REVIEW, READY, FAILED');
  }

  if (data.matchingScore && (typeof data.matchingScore !== 'number' || data.matchingScore < 0 || data.matchingScore > 100)) {
    errors.push('Matching score must be a number between 0 and 100');
  }

  if (data.fields && typeof data.fields !== 'object') {
    errors.push('Fields must be an object');
  }

  if (data.tags && !Array.isArray(data.tags)) {
    errors.push('Tags must be an array');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
