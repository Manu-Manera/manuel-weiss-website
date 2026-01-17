'use strict';

/**
 * Netlify Function: S3 Presigned URL Generator
 * Ersetzt die kaputte AWS Lambda für Datei-Uploads
 */

const AWS = require('aws-sdk');

// AWS Konfiguration - HARDCODED für Zuverlässigkeit
const REGION = 'eu-central-1';
const BUCKET_NAME = 'mawps-profile-images';
const DOCUMENTS_PREFIX = 'public/documents/';
const PROFILE_PREFIX = 'public/profile-images/';

// S3 Client initialisieren - verwendet NETLIFY_AWS_* Variablen
const s3 = new AWS.S3({
  region: REGION,
  signatureVersion: 'v4',
  accessKeyId: process.env.NETLIFY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NETLIFY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
  endpoint: `https://s3.${REGION}.amazonaws.com`,
  s3ForcePathStyle: false
});

// CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  console.log('📤 S3 Upload Function aufgerufen:', {
    method: event.httpMethod,
    path: event.path,
    hasBody: !!event.body
  });

  // CORS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'OK' })
    };
  }

  // Nur POST erlauben
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Request Body parsen
    const body = JSON.parse(event.body || '{}');
    const { contentType, userId, fileType } = body;

    console.log('📋 Upload-Anfrage:', { contentType, userId, fileType });

    // Validierung
    if (!contentType) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'contentType is required' })
      };
    }

    if (!userId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'userId is required' })
      };
    }

    // AWS Credentials prüfen (NETLIFY_AWS_* oder AWS_*)
    const accessKey = process.env.NETLIFY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
    const secretKey = process.env.NETLIFY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
    
    if (!accessKey || !secretKey) {
      console.error('❌ AWS Credentials fehlen!', {
        hasAccessKey: !!accessKey,
        hasSecretKey: !!secretKey,
        envKeys: Object.keys(process.env).filter(k => k.includes('AWS'))
      });
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'AWS credentials not configured' })
      };
    }
    
    console.log('🔑 AWS Credentials gefunden:', { accessKeyPrefix: accessKey.substring(0, 10) + '...' });

    // Prefix und Dateiendung bestimmen
    let prefix, fileExt;
    const type = fileType || 'document';
    
    if (type === 'cv' || type === 'certificate' || type === 'document') {
      prefix = DOCUMENTS_PREFIX;
      fileExt = getExtFromContentType(contentType, type);
    } else if (type === 'profile') {
      prefix = PROFILE_PREFIX;
      fileExt = getExtFromContentType(contentType);
    } else {
      prefix = DOCUMENTS_PREFIX;
      fileExt = getExtFromContentType(contentType, type);
    }

    // Eindeutigen Dateinamen generieren
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}${fileExt}`;
    
    // Key erstellen
    let key;
    if (type === 'profile') {
      key = `${prefix}${userId}/${fileName}`;
    } else {
      key = `${prefix}${userId}/${type}/${fileName}`;
    }

    console.log('🔑 Generierter S3 Key:', key);

    // Presigned URL Parameter
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Expires: 120, // 2 Minuten
      ContentType: contentType
    };

    // Presigned URL generieren
    const url = await s3.getSignedUrlPromise('putObject', params);

    // Public URL erstellen
    const keyParts = key.split('/');
    const encodedKey = keyParts.map(part => encodeURIComponent(part)).join('/');
    const publicUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${encodedKey}`;

    console.log('✅ Presigned URL generiert:', { key, publicUrl });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        url,
        publicUrl,
        bucket: BUCKET_NAME,
        key,
        expires: 120,
        region: REGION,
        fileType: type
      })
    };

  } catch (error) {
    console.error('❌ Fehler:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};

/**
 * Dateiendung aus Content-Type ermitteln
 */
function getExtFromContentType(ct, fileType) {
  if (!ct) {
    return fileType === 'cv' || fileType === 'certificate' || fileType === 'document' ? '.pdf' : '.jpg';
  }
  
  // Document types
  if (ct.includes('pdf') || ct === 'application/pdf') return '.pdf';
  if (ct.includes('msword') || ct.includes('wordprocessingml')) return '.docx';
  if (ct.includes('ms-excel') || ct.includes('spreadsheetml')) return '.xlsx';
  
  // Image types
  if (ct.includes('png')) return '.png';
  if (ct.includes('webp')) return '.webp';
  if (ct.includes('gif')) return '.gif';
  if (ct.includes('svg')) return '.svg';
  if (ct.includes('jpeg') || ct.includes('jpg')) return '.jpg';
  
  // Default
  return fileType === 'cv' || fileType === 'certificate' || fileType === 'document' ? '.pdf' : '.jpg';
}
// Updated: Sat Jan 17 12:36:54 CET 2026
