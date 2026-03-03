/**
 * Onboarding Progress Lambda
 * Speichert und lädt den Fortschritt für das Valkeen Onboarding
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const TABLE_NAME = process.env.ONBOARDING_TABLE || 'mawps-onboarding-progress';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  console.log('Onboarding Progress Lambda:', JSON.stringify(event, null, 2));

  const httpMethod = event.httpMethod || event.requestContext?.http?.method;

  // CORS Preflight
  if (httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  try {
    switch (httpMethod) {
      case 'GET':
        return await getProgress(event);
      case 'POST':
        return await saveProgress(event);
      default:
        return response(405, { error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    return response(500, { error: 'Interner Serverfehler', details: error.message });
  }
};

async function getProgress(event) {
  const queryParams = event.queryStringParameters || {};
  const userId = queryParams.userId || 'default-user';

  console.log(`📥 Lade Fortschritt für User: ${userId}`);

  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { userId }
    }));

    if (!result.Item) {
      return response(404, { error: 'Kein Fortschritt gefunden', userId });
    }

    console.log('✅ Fortschritt geladen');
    return response(200, {
      userId: result.Item.userId,
      progress: result.Item.progress,
      updatedAt: result.Item.updatedAt
    });
  } catch (error) {
    console.error('Get Progress Error:', error);
    throw error;
  }
}

async function saveProgress(event) {
  const body = JSON.parse(event.body || '{}');
  const userId = body.userId || 'default-user';
  const progress = body.progress;

  if (!progress) {
    return response(400, { error: 'Progress data required' });
  }

  console.log(`📤 Speichere Fortschritt für User: ${userId}`);

  try {
    const item = {
      userId,
      progress,
      updatedAt: new Date().toISOString(),
      createdAt: body.createdAt || new Date().toISOString()
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item
    }));

    console.log('✅ Fortschritt gespeichert');
    return response(200, {
      success: true,
      userId,
      updatedAt: item.updatedAt
    });
  } catch (error) {
    console.error('Save Progress Error:', error);
    throw error;
  }
}

function response(statusCode, body) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body)
  };
}
