'use strict';

// Lambda: returns a presigned PUT URL for uploading a profile image to S3
// Env:
//   BUCKET_NAME: target S3 bucket
//   REGION: aws region (e.g. eu-central-1)
//   PROFILE_PREFIX: optional key prefix (default: public/profile-images/)

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
    const fileExt = getExtFromContentType(contentType);
    const userId = (body && (body.userId || body.owner || body.keyHint)) || 'anonymous';
    const prefix = process.env.PROFILE_PREFIX || 'public/profile-images/';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}${fileExt}`;
    const key = `${prefix}${userId}/${fileName}`;

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

function getExtFromContentType(ct) {
  if (!ct) return '.jpg';
  if (ct.includes('png')) return '.png';
  if (ct.includes('webp')) return '.webp';
  if (ct.includes('gif')) return '.gif';
  if (ct.includes('svg')) return '.svg';
  return '.jpg';
}


