'use strict';

// Lambda: returns a presigned PUT URL for uploading files to S3
// Supports: profile images, CV documents (PDF/DOCX), certificates
// Env:
//   BUCKET_NAME: target S3 bucket
//   REGION: aws region (e.g. eu-central-1)
//   PROFILE_PREFIX: optional key prefix (default: public/profile-images/)
//   DOCUMENTS_PREFIX: optional key prefix for documents (default: public/documents/)

const AWS = require('aws-sdk');

const REGION = process.env.REGION || process.env.AWS_REGION || 'eu-central-1';
AWS.config.update({ region: REGION });

const s3 = new AWS.S3({ signatureVersion: 'v4' });

exports.handler = async (event) => {
  // Handle CORS preflight (OPTIONS)
  if (event.httpMethod === 'OPTIONS') {
    return json(200, { message: 'OK' });
  }
  
  try {
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
    const key = `${prefix}${userId}/${fileType}/${fileName}`;

    const expires = 60 * 2; // 2 minutes

    const params = {
      Bucket: bucket,
      Key: key,
      Expires: expires,
      ContentType: contentType,
      ACL: 'public-read',
    };

    const url = await s3.getSignedUrlPromise('putObject', params);

    const publicUrl = `https://${bucket}.s3.${REGION}.amazonaws.com/${encodeURI(key)}`;

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
    return json(500, { error: error.message });
  }
};

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
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
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


