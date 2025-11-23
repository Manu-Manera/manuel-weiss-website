'use strict';

// Lambda: returns a presigned PUT URL for uploading files to S3
// Also handles website-images DynamoDB operations
// Supports: profile images, CV documents (PDF/DOCX), certificates
// Env:
//   BUCKET_NAME: target S3 bucket
//   REGION: aws region (e.g. eu-central-1)
//   PROFILE_PREFIX: optional key prefix (default: public/profile-images/)
//   DOCUMENTS_PREFIX: optional key prefix for documents (default: public/documents/)
//   PROFILE_TABLE: DynamoDB table name (default: mawps-user-profiles)

const AWS = require('aws-sdk');

const REGION = process.env.REGION || process.env.AWS_REGION || 'eu-central-1';
AWS.config.update({ region: REGION });

const s3 = new AWS.S3({ signatureVersion: 'v4' });
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const PROFILE_TABLE = process.env.PROFILE_TABLE || 'mawps-user-profiles';

exports.handler = async (event) => {
  // Handle CORS preflight (OPTIONS)
  if (event.httpMethod === 'OPTIONS') {
    return json(200, { message: 'OK' });
  }
  
  try {
    // Path kann /prod/website-images oder /website-images sein
    let path = event.path || event.rawPath || '';
    // Entferne /prod prefix falls vorhanden
    if (path.startsWith('/prod/')) {
      path = path.substring(5);
    }
    const method = event.httpMethod || event.requestContext?.http?.method || 'POST';
    
    console.log('🔍 Lambda Event:', { path, method, hasBody: !!event.body });
    
    // Handle website-images endpoints (DynamoDB operations)
    if (path.includes('/website-images')) {
      console.log('📸 Handling website-images request:', { path, method });
      return await handleWebsiteImages(event, method, path);
    }
    
    // Handle presigned URL requests (S3 operations)
    const body = parseBody(event);
    const bucket = process.env.BUCKET_NAME;
    if (!bucket) {
      return json(500, { error: 'Missing BUCKET_NAME env' });
    }

    const contentType = (body && body.contentType) || 'image/jpeg';
    const fileType = (body && body.fileType) || 'profile'; // 'profile', 'cv', 'certificate', 'document'
    const userId = (body && (body.userId || body.owner || body.keyHint)) || 'anonymous';
    
    // Determine prefix and file extension based on file type
    let prefix, fileExt;
    if (fileType === 'cv' || fileType === 'certificate' || fileType === 'document') {
      prefix = process.env.DOCUMENTS_PREFIX || 'public/documents/';
      fileExt = getExtFromContentType(contentType, fileType);
    } else {
      prefix = process.env.PROFILE_PREFIX || 'public/profile-images/';
      fileExt = getExtFromContentType(contentType);
    }
    
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}${fileExt}`;
    // WICHTIG: Für Profile-Bilder verwenden wir nur userId, nicht userId/fileType
    // Das macht die URLs einfacher und kompatibler mit bestehenden Bildern
    let key;
    if (fileType === 'profile') {
      key = `${prefix}${userId}/${fileName}`;
    } else {
      key = `${prefix}${userId}/${fileType}/${fileName}`;
    }

    const expires = 60 * 2; // 2 minutes

    const params = {
      Bucket: bucket,
      Key: key,
      Expires: expires,
      ContentType: contentType,
      ACL: 'public-read',
    };

    const url = await s3.getSignedUrlPromise('putObject', params);

    // WICHTIG: publicUrl muss genau dem Key entsprechen (ohne Query-Parameter)
    // encodeURIComponent für jeden Teil des Pfads separat
    const keyParts = key.split('/');
    const encodedKey = keyParts.map(part => encodeURIComponent(part)).join('/');
    const publicUrl = `https://${bucket}.s3.${REGION}.amazonaws.com/${encodedKey}`;

    console.log('📤 Generated presigned URL:', { key, publicUrl, fileType, userId });

    return json(200, {
      url,
      publicUrl,
      bucket,
      key,
      expires,
      region: REGION,
      fileType,
    });
  } catch (error) {
    console.error('Error:', error);
    return json(500, { error: error.message });
  }
};

// Handle website-images DynamoDB operations
async function handleWebsiteImages(event, method, path) {
  try {
    if (method === 'POST' && path.includes('/website-images')) {
      // Save website images
      const body = parseBody(event);
      if (!body || !body.userId) {
        return json(400, { error: 'Missing userId' });
      }
      
      const item = {
        userId: body.userId,
        profileImageDefault: body.profileImageDefault || null,
        profileImageHover: body.profileImageHover || null,
        type: 'website-images',
        updatedAt: new Date().toISOString()
      };
      
      await dynamoDB.put({
        TableName: PROFILE_TABLE,
        Item: item
      }).promise();
      
      return json(200, { success: true, item });
      
    } else if (method === 'GET' && path.includes('/website-images/')) {
      // Get website images
      const userId = path.split('/').pop();
      if (!userId) {
        return json(400, { error: 'Missing userId in path' });
      }
      
      const result = await dynamoDB.get({
        TableName: PROFILE_TABLE,
        Key: { userId }
      }).promise();
      
      if (!result.Item || result.Item.type !== 'website-images') {
        return json(404, { error: 'Website images not found' });
      }
      
      return json(200, {
        userId: result.Item.userId,
        profileImageDefault: result.Item.profileImageDefault || null,
        profileImageHover: result.Item.profileImageHover || null,
        updatedAt: result.Item.updatedAt
      });
    } else {
      return json(405, { error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Website images error:', error);
    return json(500, { error: error.message });
  }
}

function parseBody(event) {
  try {
    if (!event || !event.body) return null;
    return typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch {
    return null;
  }
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    },
    body: JSON.stringify(body),
  };
}

function getExtFromContentType(ct, fileType) {
  if (!ct) {
    return fileType === 'cv' || fileType === 'certificate' || fileType === 'document' ? '.pdf' : '.jpg';
  }
  
  // Document types
  if (ct.includes('pdf') || ct === 'application/pdf') return '.pdf';
  if (ct.includes('msword') || ct.includes('wordprocessingml') || ct === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return '.docx';
  if (ct.includes('ms-excel') || ct.includes('spreadsheetml')) return '.xlsx';
  
  // Image types
  if (ct.includes('png')) return '.png';
  if (ct.includes('webp')) return '.webp';
  if (ct.includes('gif')) return '.gif';
  if (ct.includes('svg')) return '.svg';
  if (ct.includes('jpeg') || ct.includes('jpg')) return '.jpg';
  
  // Default based on file type
  return fileType === 'cv' || fileType === 'certificate' || fileType === 'document' ? '.pdf' : '.jpg';
}


