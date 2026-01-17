/**
 * Documents API (Netlify Function)
 * Verwaltet Dokumente (Zeugnisse, Zertifikate) in DynamoDB und S3
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

// AWS Configuration
const dynamoClient = new DynamoDBClient({
  region: process.env.NETLIFY_AWS_REGION || process.env.AWS_REGION || 'eu-central-1',
  credentials: {
    accessKeyId: process.env.NETLIFY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NETLIFY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY
  }
});
const dynamoDB = DynamoDBDocumentClient.from(dynamoClient);

const s3Client = new S3Client({
  region: process.env.NETLIFY_AWS_REGION || process.env.AWS_REGION || 'eu-central-1',
  credentials: {
    accessKeyId: process.env.NETLIFY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NETLIFY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY
  }
});

const DOCUMENTS_TABLE = process.env.DOCUMENTS_TABLE || 'mawps-user-documents';
const S3_BUCKET = process.env.S3_BUCKET || 'mawps-profile-images';

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

    const path = event.path.replace('/.netlify/functions/documents-api', '') || '/';
    const method = event.httpMethod;

    // POST /upload-url - Presigned URL für Upload
    if (method === 'POST' && path === '/upload-url') {
      const body = JSON.parse(event.body || '{}');
      const { fileName, fileType, fileSize, documentType } = body;

      if (!fileName || !fileType) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing fileName or fileType' }) };
      }

      const documentId = uuidv4();
      const s3Key = `users/${userId}/documents/${documentType || 'general'}/${Date.now()}-${fileName}`;

      const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: s3Key,
        ContentType: fileType,
        Metadata: { userId, documentId, documentType: documentType || 'general' }
      });

      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ uploadUrl, documentId, s3Key })
      };
    }

    // POST / - Dokument-Metadaten speichern
    if (method === 'POST' && path === '/') {
      const documentData = JSON.parse(event.body || '{}');
      
      const item = {
        userId,
        documentId: documentData.documentId || uuidv4(),
        fileName: documentData.fileName,
        fileType: documentData.fileType,
        fileSize: documentData.fileSize,
        documentType: documentData.documentType || 'general',
        s3Key: documentData.s3Key,
        uploadedAt: documentData.uploadedAt || new Date().toISOString(),
        lastModified: new Date().toISOString(),
        metadata: documentData.metadata || {}
      };

      await dynamoDB.send(new PutCommand({
        TableName: DOCUMENTS_TABLE,
        Item: item
      }));

      return { statusCode: 200, headers, body: JSON.stringify(item) };
    }

    // GET / - Alle Dokumente laden
    if (method === 'GET' && path === '/') {
      const result = await dynamoDB.send(new QueryCommand({
        TableName: DOCUMENTS_TABLE,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId }
      }));

      const documents = (result.Items || []).sort((a, b) => 
        new Date(b.uploadedAt) - new Date(a.uploadedAt)
      );

      return { statusCode: 200, headers, body: JSON.stringify(documents) };
    }

    // GET /{id}/download-url - Download URL
    if (method === 'GET' && path.match(/^\/[^\/]+\/download-url$/)) {
      const documentId = path.split('/')[1];

      const result = await dynamoDB.send(new GetCommand({
        TableName: DOCUMENTS_TABLE,
        Key: { userId, documentId }
      }));

      if (!result.Item) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Document not found' }) };
      }

      const command = new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: result.Item.s3Key
      });

      const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      return { statusCode: 200, headers, body: JSON.stringify({ downloadUrl }) };
    }

    // DELETE /{id} - Dokument löschen
    if (method === 'DELETE' && path.match(/^\/[^\/]+$/)) {
      const documentId = path.split('/')[1];

      const result = await dynamoDB.send(new GetCommand({
        TableName: DOCUMENTS_TABLE,
        Key: { userId, documentId }
      }));

      if (!result.Item) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Document not found' }) };
      }

      // S3 löschen
      await s3Client.send(new DeleteObjectCommand({
        Bucket: S3_BUCKET,
        Key: result.Item.s3Key
      }));

      // DynamoDB löschen
      await dynamoDB.send(new DeleteCommand({
        TableName: DOCUMENTS_TABLE,
        Key: { userId, documentId }
      }));

      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Endpoint not found' }) };

  } catch (error) {
    console.error('Documents API Error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
