/**
 * AWS Lambda: Training Admin API
 * Verwaltet Training-Inhalte (Texte, Screenshots, Logo, Tabs) für Tempus Training
 * Speichert in S3: manuel-weiss-website/training-admin/
 */

const { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3 = new S3Client({ region: process.env.AWS_REGION || 'eu-central-1' });

const BUCKET = process.env.TRAINING_BUCKET || 'manuel-weiss-website';
const PREFIX = 'training-admin/';
const CONFIG_KEY = `${PREFIX}config.json`;
const SCREENSHOTS_PREFIX = `${PREFIX}screenshots/`;
const REGION = process.env.AWS_REGION || 'eu-central-1';
const SITE_ORIGIN = 'https://manuel-weiss.ch';
const UPLOAD_EXPIRY = 60 * 10; // 10 Minuten

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  try {
    const path = (event.path || event.rawPath || '').replace(/\/v1/, '');
    const method = event.httpMethod;
    const isConfig = path.includes('training-admin/config');
    const isUploadUrl = path.includes('training-admin/upload-url');
    const isScreenshots = path.includes('training-admin/screenshots');

    if (method === 'GET' && isConfig) return await getConfig();
    if (method === 'PUT' && isConfig) return await putConfig(event);
    if (method === 'POST' && isUploadUrl) return await getUploadUrl(event);
    if (method === 'GET' && isScreenshots) return await listScreenshots();

    return {
      statusCode: 404,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Not found' })
    };
  } catch (error) {
    console.error('Training Admin API Error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Internal server error', message: error.message })
    };
  }
};

async function getConfig() {
  try {
    const result = await s3.send(new GetObjectCommand({
      Bucket: BUCKET,
      Key: CONFIG_KEY
    }));
    const body = await result.Body.transformToString();
    const config = JSON.parse(body);
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(config)
    };
  } catch (e) {
    if (e.name === 'NoSuchKey') {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({})
      };
    }
    throw e;
  }
}

async function putConfig(event) {
  const body = event.body || '{}';
  let config;
  try {
    config = JSON.parse(body);
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Invalid JSON' })
    };
  }

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: CONFIG_KEY,
    Body: JSON.stringify(config, null, 2),
    ContentType: 'application/json'
  }));

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ success: true })
  };
}

async function getUploadUrl(event) {
  const body = JSON.parse(event.body || '{}');
  const { fileName, contentType = 'image/png', editId } = body;

  if (!fileName && !editId) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'fileName oder editId erforderlich' })
    };
  }

  const ext = (fileName || editId).match(/\.(png|jpg|jpeg|gif|webp)$/i)
    ? ''
    : (contentType.includes('png') ? '.png' : contentType.includes('jpeg') || contentType.includes('jpg') ? '.jpg' : '.png');
  const safeName = (editId || fileName || `img_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_');
  const key = `${SCREENSHOTS_PREFIX}${safeName}${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: UPLOAD_EXPIRY });
  const publicUrl = `${SITE_ORIGIN}/${key}`;

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      uploadUrl,
      publicUrl,
      key,
      expiresIn: UPLOAD_EXPIRY
    })
  };
}

async function listScreenshots() {
  const result = await s3.send(new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: SCREENSHOTS_PREFIX,
    MaxKeys: 500
  }));

  const screenshots = (result.Contents || []).map(item => ({
    key: item.Key,
    url: `${SITE_ORIGIN}/${item.Key}`,
    lastModified: item.LastModified,
    size: item.Size
  }));

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ screenshots })
  };
}
