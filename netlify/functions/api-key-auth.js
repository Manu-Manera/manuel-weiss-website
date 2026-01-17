/**
 * API Key Authentication Handler (Netlify Function)
 * Private/Public Key Pair Authentication mit Token-Generierung
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// AWS Configuration
const client = new DynamoDBClient({
  region: process.env.NETLIFY_AWS_REGION || process.env.AWS_REGION || 'eu-central-1',
  credentials: {
    accessKeyId: process.env.NETLIFY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NETLIFY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY
  }
});
const dynamoDB = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.API_KEYS_TABLE || 'mawps-api-keys';
const TOKEN_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TOKEN_EXPIRY = 4000; // ca. 66 Minuten

const ALLOWED_ORIGINS = [
  'https://manuel-weiss.ch',
  'https://www.manuel-weiss.ch',
  'https://mawps.netlify.app',
  'http://localhost:3000',
  'http://localhost:8000',
  'http://localhost:5500'
];

const getCORSHeaders = (origin) => {
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-API-Key',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  };
};

// Challenge generieren
async function generateChallenge(apiKeyId) {
  const challenge = crypto.randomBytes(32).toString('base64');
  const expiresAt = Date.now() + 60000; // 1 Minute

  await dynamoDB.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      pk: `challenge#${apiKeyId}`,
      sk: 'challenge',
      challenge,
      expiresAt,
      createdAt: new Date().toISOString()
    }
  }));

  return challenge;
}

// Signatur validieren
function verifySignature(publicKeyPem, challenge, signature) {
  try {
    let normalizedPublicKey = publicKeyPem.replace(/\\n/g, '\n');
    const publicKeyObject = crypto.createPublicKey(normalizedPublicKey);
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(challenge);
    verify.end();
    return verify.verify(publicKeyObject, signature, 'base64');
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

// Public Key laden
async function getPublicKey(apiKeyId) {
  const result = await dynamoDB.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { pk: `apikey#${apiKeyId}`, sk: 'publickey' }
  }));

  if (!result.Item) return null;
  return result.Item.publicKey.replace(/\\n/g, '\n');
}

// JWT Token generieren
function generateToken(apiKeyId, metadata = {}) {
  return jwt.sign({
    apiKeyId,
    type: 'api-key',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY,
    ...metadata
  }, TOKEN_SECRET, { algorithm: 'HS256' });
}

// Public Key registrieren
async function registerPublicKey(apiKeyId, publicKeyPem, metadata = {}) {
  let normalizedKey = publicKeyPem.replace(/\\n/g, '\n');
  
  // Validiere Public Key Format
  try {
    crypto.createPublicKey(normalizedKey);
  } catch (error) {
    throw new Error('Invalid public key format: ' + error.message);
  }

  const item = {
    pk: `apikey#${apiKeyId}`,
    sk: 'publickey',
    apiKeyId,
    publicKey: normalizedKey,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    active: true,
    ...metadata
  };

  await dynamoDB.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: item
  }));

  return item;
}

exports.handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || '';
  const headers = getCORSHeaders(origin);

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const path = event.path.replace('/.netlify/functions/api-key-auth', '') || '/';
    const method = event.httpMethod;
    let body = {};
    
    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch (e) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
      }
    }

    // POST /register - Public Key registrieren
    if (method === 'POST' && (path === '/register' || path === '')) {
      const { apiKeyId, publicKey, metadata } = body;
      
      if (!apiKeyId || !publicKey) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing apiKeyId or publicKey' }) };
      }

      const keyData = await registerPublicKey(apiKeyId, publicKey, metadata);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, apiKeyId: keyData.apiKeyId, createdAt: keyData.createdAt })
      };
    }

    // POST /challenge - Challenge generieren
    if (method === 'POST' && path === '/challenge') {
      const { apiKeyId } = body;
      if (!apiKeyId) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing apiKeyId' }) };
      }

      const publicKey = await getPublicKey(apiKeyId);
      if (!publicKey) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'API Key not found' }) };
      }

      const challenge = await generateChallenge(apiKeyId);
      return { statusCode: 200, headers, body: JSON.stringify({ challenge, expiresIn: 60 }) };
    }

    // POST /token - Token generieren
    if (method === 'POST' && path === '/token') {
      const { apiKeyId, challenge, signature } = body;
      
      if (!apiKeyId || !challenge || !signature) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required fields' }) };
      }

      // Lade Challenge
      const challengeData = await dynamoDB.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { pk: `challenge#${apiKeyId}`, sk: 'challenge' }
      }));

      if (!challengeData.Item || Date.now() > challengeData.Item.expiresAt) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Challenge expired' }) };
      }

      if (challengeData.Item.challenge !== challenge) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid challenge' }) };
      }

      // Validiere Signatur
      const publicKey = await getPublicKey(apiKeyId);
      if (!publicKey || !verifySignature(publicKey, challenge, signature)) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid signature' }) };
      }

      // Lösche Challenge
      await dynamoDB.send(new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { pk: `challenge#${apiKeyId}`, sk: 'challenge' }
      }));

      // Generiere Token
      const token = generateToken(apiKeyId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, token, expiresIn: TOKEN_EXPIRY, tokenType: 'Bearer' })
      };
    }

    // GET /status - Status prüfen
    if (method === 'GET' && path === '/status') {
      const apiKeyId = event.queryStringParameters?.apiKeyId;
      if (!apiKeyId) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing apiKeyId' }) };
      }

      const publicKey = await getPublicKey(apiKeyId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ registered: !!publicKey, apiKeyId, active: !!publicKey })
      };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Endpoint not found' }) };

  } catch (error) {
    console.error('API Key Auth Error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
