/**
 * Bewerbungsprofil API (Netlify Function)
 * Verwaltet Bewerbungsprofile (Lebenslauf, Anschreiben, etc.)
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

// AWS Configuration
const dynamoClient = new DynamoDBClient({
  region: process.env.NETLIFY_AWS_REGION || process.env.AWS_REGION || 'eu-central-1',
  credentials: {
    accessKeyId: process.env.NETLIFY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NETLIFY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY
  }
});
const dynamoDB = DynamoDBDocumentClient.from(dynamoClient);

const TABLE_NAME = process.env.USER_DATA_TABLE || 'mawps-user-data';

const ALLOWED_ORIGINS = [
  'https://manuel-weiss.ch',
  'https://www.manuel-weiss.ch',
  'https://mawps.netlify.app',
  'http://localhost:3000',
  'http://localhost:5500'
];

const getCORSHeaders = (origin) => {
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  };
};

// User ID aus JWT extrahieren
function extractUserId(event) {
  const authHeader = event.headers?.authorization || event.headers?.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    const token = authHeader.substring(7);
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.sub || payload.userId || payload['cognito:username'];
  } catch (e) {
    return null;
  }
}

exports.handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || '';
  const headers = getCORSHeaders(origin);

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const userId = extractUserId(event);
    if (!userId) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const path = event.path.replace('/.netlify/functions/bewerbungsprofil-api', '') || '/';
    const method = event.httpMethod;

    // GET / - Komplettes Profil laden
    if (method === 'GET' && path === '/') {
      const result = await dynamoDB.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { userId, sk: 'bewerbungsprofil' }
      }));

      if (!result.Item) {
        // Leeres Profil zurückgeben
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            userId,
            personalInfo: {},
            education: [],
            experience: [],
            skills: [],
            languages: [],
            certificates: [],
            documents: [],
            settings: {}
          })
        };
      }

      return { statusCode: 200, headers, body: JSON.stringify(result.Item) };
    }

    // POST / - Profil speichern/aktualisieren
    if (method === 'POST' || method === 'PUT') {
      const profileData = JSON.parse(event.body || '{}');
      
      const item = {
        userId,
        sk: 'bewerbungsprofil',
        ...profileData,
        lastModified: new Date().toISOString()
      };

      await dynamoDB.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: item
      }));

      return { statusCode: 200, headers, body: JSON.stringify(item) };
    }

    // GET /section/{name} - Einzelne Sektion laden
    if (method === 'GET' && path.match(/^\/section\/[^\/]+$/)) {
      const sectionName = path.split('/')[2];

      const result = await dynamoDB.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { userId, sk: 'bewerbungsprofil' }
      }));

      if (!result.Item || !result.Item[sectionName]) {
        return { statusCode: 200, headers, body: JSON.stringify([]) };
      }

      return { statusCode: 200, headers, body: JSON.stringify(result.Item[sectionName]) };
    }

    // PUT /section/{name} - Einzelne Sektion aktualisieren
    if (method === 'PUT' && path.match(/^\/section\/[^\/]+$/)) {
      const sectionName = path.split('/')[2];
      const sectionData = JSON.parse(event.body || '{}');

      // Erst Profil laden
      const existing = await dynamoDB.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { userId, sk: 'bewerbungsprofil' }
      }));

      const item = {
        ...(existing.Item || { userId, sk: 'bewerbungsprofil' }),
        [sectionName]: sectionData,
        lastModified: new Date().toISOString()
      };

      await dynamoDB.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: item
      }));

      return { statusCode: 200, headers, body: JSON.stringify({ success: true, section: sectionName }) };
    }

    // DELETE / - Profil löschen
    if (method === 'DELETE' && path === '/') {
      await dynamoDB.send(new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { userId, sk: 'bewerbungsprofil' }
      }));

      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Endpoint not found' }) };

  } catch (error) {
    console.error('Bewerbungsprofil API Error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
