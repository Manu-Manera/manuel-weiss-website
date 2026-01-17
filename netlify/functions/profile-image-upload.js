/**
 * Profile Image Upload API (Netlify Function)
 * Speziell für Profilbilder und Bewerbungsfotos
 */

const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

// AWS Configuration
const s3Client = new S3Client({
  region: process.env.NETLIFY_AWS_REGION || process.env.AWS_REGION || 'eu-central-1',
  credentials: {
    accessKeyId: process.env.NETLIFY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NETLIFY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY
  }
});

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
    // Fallback auf X-User-Id Header
    return event.headers?.['x-user-id'] || event.headers?.['X-User-Id'] || null;
  }
  
  try {
    const token = authHeader.substring(7);
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.sub || payload.userId || payload['cognito:username'];
  } catch (e) {
    return event.headers?.['x-user-id'] || null;
  }
}

// Erlaubte Bildtypen
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif'
];

exports.handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || '';
  const headers = getCORSHeaders(origin);

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const path = event.path.replace('/.netlify/functions/profile-image-upload', '') || '/';
    const method = event.httpMethod;

    // POST /upload-url oder POST / - Presigned URL generieren
    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { contentType, userId: bodyUserId, fileType, fileName } = body;

      // User ID ermitteln
      const userId = extractUserId(event) || bodyUserId;
      if (!userId) {
        return { 
          statusCode: 401, 
          headers, 
          body: JSON.stringify({ error: 'User ID required' }) 
        };
      }

      // Content Type validieren
      const imageContentType = contentType || 'image/jpeg';
      if (!ALLOWED_IMAGE_TYPES.includes(imageContentType)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'Invalid content type', 
            allowed: ALLOWED_IMAGE_TYPES 
          })
        };
      }

      // Dateiname und S3 Key generieren
      const imageId = uuidv4();
      const extension = imageContentType.split('/')[1] || 'jpg';
      const type = fileType || 'profile'; // profile, application, document
      
      let s3Key;
      if (type === 'profile') {
        s3Key = `users/${userId}/profile/${imageId}.${extension}`;
      } else if (type === 'application') {
        s3Key = `users/${userId}/applications/${imageId}.${extension}`;
      } else {
        s3Key = `users/${userId}/images/${imageId}.${extension}`;
      }

      // Presigned URL generieren
      const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: s3Key,
        ContentType: imageContentType,
        Metadata: {
          userId,
          imageId,
          type,
          uploadedAt: new Date().toISOString()
        }
      });

      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      
      // Public URL (nach Upload)
      const publicUrl = `https://${S3_BUCKET}.s3.eu-central-1.amazonaws.com/${s3Key}`;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          uploadUrl,
          publicUrl,
          key: s3Key,
          imageId,
          expiresIn: 3600
        })
      };
    }

    // DELETE /{imageId} - Bild löschen
    if (method === 'DELETE' && path.match(/^\/[^\/]+$/)) {
      const imageId = path.split('/')[1];
      const userId = extractUserId(event);
      
      if (!userId) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
      }

      // Versuche Bild in verschiedenen Pfaden zu löschen
      const possibleKeys = [
        `users/${userId}/profile/${imageId}`,
        `users/${userId}/applications/${imageId}`,
        `users/${userId}/images/${imageId}`
      ];

      for (const key of possibleKeys) {
        try {
          await s3Client.send(new DeleteObjectCommand({
            Bucket: S3_BUCKET,
            Key: key
          }));
        } catch (e) {
          // Ignoriere Fehler für nicht existierende Keys
        }
      }

      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Endpoint not found' }) };

  } catch (error) {
    console.error('Profile Image Upload Error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
