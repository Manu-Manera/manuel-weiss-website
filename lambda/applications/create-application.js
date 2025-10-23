/**
 * Lambda Function: Create Application
 * POST /applications
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

export const handler = async (event) => {
  console.log('📝 Create Application Request:', JSON.stringify(event, null, 2));

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

    // User ID aus JWT Token extrahieren (vereinfacht)
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

    // Request Body parsen
    const body = JSON.parse(event.body || '{}');
    
    // Validierung
    const validation = validateApplicationData(body);
    if (!validation.isValid) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Validation Error',
          message: 'Invalid application data',
          details: validation.errors
        })
      };
    }

    // Application ID generieren
    const appId = uuidv4();
    const now = new Date().toISOString();

    // Application Item erstellen
    const application = {
      PK: `USER#${userId}`,
      SK: `APP#${appId}`,
      appId,
      userId,
      status: 'DRAFT',
      position: body.position,
      company: body.company,
      jobDescription: body.jobDescription || '',
      generatedCoverLetter: null,
      matchingScore: 0,
      createdAt: now,
      updatedAt: now,
      submittedAt: null,
      version: 1,
      fields: body.fields || {},
      metadata: {
        source: 'web',
        userAgent: event.headers['User-Agent'] || '',
        ipAddress: event.requestContext?.identity?.sourceIp || ''
      },
      tags: body.tags || []
    };

    // In DynamoDB speichern
    await docClient.send(new PutCommand({
      TableName: process.env.APPLICATIONS_TABLE,
      Item: application,
      ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)'
    }));

    console.log('✅ Application created successfully:', appId);

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        application: {
          appId: application.appId,
          userId: application.userId,
          status: application.status,
          position: application.position,
          company: application.company,
          createdAt: application.createdAt,
          version: application.version
        },
        message: 'Application created successfully'
      })
    };

  } catch (error) {
    console.error('❌ Error creating application:', error);

    // Conditional Check Failed = Duplicate
    if (error.name === 'ConditionalCheckFailedException') {
      return {
        statusCode: 409,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Conflict',
          message: 'Application already exists'
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
        message: 'Failed to create application',
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
 * Application Data validieren
 */
function validateApplicationData(data) {
  const errors = [];

  if (!data.position || typeof data.position !== 'string' || data.position.trim().length === 0) {
    errors.push('Position is required and must be a non-empty string');
  }

  if (!data.company || typeof data.company !== 'string' || data.company.trim().length === 0) {
    errors.push('Company is required and must be a non-empty string');
  }

  if (data.jobDescription && typeof data.jobDescription !== 'string') {
    errors.push('Job description must be a string');
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
