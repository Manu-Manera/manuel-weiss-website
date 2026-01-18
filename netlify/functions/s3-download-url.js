/**
 * S3 Download URL Generator (Netlify Function)
 * Generiert frische presigned URLs für S3-Objekte
 */

const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// AWS Configuration
const s3Client = new S3Client({
  region: process.env.NETLIFY_AWS_REGION || process.env.AWS_REGION || 'eu-central-1',
  credentials: {
    accessKeyId: process.env.NETLIFY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NETLIFY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Allowed buckets
const ALLOWED_BUCKETS = [
  'mawps-user-files-1760106396',
  'mawps-profile-images',
  'manuel-weiss-public-media'
];

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
    'Access-Control-Allow-Methods': 'POST,OPTIONS'
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

  // Nur POST erlauben
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers, 
      body: JSON.stringify({ error: 'Method not allowed' }) 
    };
  }

  try {
    // Auth prüfen
    const userId = extractUserId(event);
    if (!userId) {
      return { 
        statusCode: 401, 
        headers, 
        body: JSON.stringify({ error: 'Unauthorized' }) 
      };
    }

    const body = JSON.parse(event.body || '{}');
    const { s3Key, bucket } = body;

    if (!s3Key) {
      return { 
        statusCode: 400, 
        headers, 
        body: JSON.stringify({ error: 'Missing s3Key parameter' }) 
      };
    }

    // Bucket validieren
    const targetBucket = bucket || 'mawps-user-files-1760106396';
    if (!ALLOWED_BUCKETS.includes(targetBucket)) {
      return { 
        statusCode: 400, 
        headers, 
        body: JSON.stringify({ error: 'Invalid bucket' }) 
      };
    }

    // Sicherheitsprüfung: User darf nur auf eigene Dateien zugreifen
    // Öffentliche Dateien und Admin-Dateien sind ausgenommen
    const isPublicFile = s3Key.startsWith('public/');
    const isUserFile = s3Key.includes(`/users/${userId}/`) || s3Key.includes(`/${userId}/`);
    const isOwnerFile = s3Key.includes('/owner/');
    
    if (!isPublicFile && !isUserFile && !isOwnerFile) {
      console.warn(`⚠️ Zugriff verweigert: User ${userId} versuchte auf ${s3Key} zuzugreifen`);
      return { 
        statusCode: 403, 
        headers, 
        body: JSON.stringify({ error: 'Access denied' }) 
      };
    }

    // Presigned URL generieren
    const command = new GetObjectCommand({
      Bucket: targetBucket,
      Key: s3Key
    });

    const downloadUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 3600 // 1 Stunde
    });

    console.log(`✅ Download URL generiert für: ${s3Key}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        downloadUrl,
        expiresIn: 3600,
        bucket: targetBucket,
        key: s3Key
      })
    };

  } catch (error) {
    console.error('S3 Download URL Error:', error);
    return { 
      statusCode: 500, 
      headers, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};
