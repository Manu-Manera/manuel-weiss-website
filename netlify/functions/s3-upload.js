'use strict';

/**
 * Netlify Function: S3 Presigned URL Generator
 * Ersetzt die kaputte AWS Lambda für Datei-Uploads
 */

let AWS;
try {
  AWS = require('aws-sdk');
} catch (err) {
  console.error('❌ aws-sdk konnte nicht geladen werden:', err.message);
}

// AWS Konfiguration - HARDCODED für Zuverlässigkeit
const REGION = 'eu-central-1';
const BUCKET_NAME = 'mawps-profile-images';
const DOCUMENTS_PREFIX = 'public/documents/';
const PROFILE_PREFIX = 'public/profile-images/';

// S3 Client wird lazy initialisiert
let s3 = null;

function getS3Client() {
  if (s3) return s3;
  
  if (!AWS) {
    throw new Error('aws-sdk not available');
  }
  
  const accessKeyId = process.env.NETLIFY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.NETLIFY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
  
  if (!accessKeyId || !secretAccessKey) {
    throw new Error('AWS credentials not configured');
  }
  
  s3 = new AWS.S3({
    region: REGION,
    signatureVersion: 'v4',
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    endpoint: `https://s3.${REGION}.amazonaws.com`,
    s3ForcePathStyle: false
  });
  
  return s3;
}

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
    // Prüfe ob AWS SDK verfügbar ist
    if (!AWS) {
      console.error('❌ AWS SDK nicht verfügbar!');
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'AWS SDK not available', details: 'The aws-sdk module could not be loaded' })
      };
    }

    // Request Body parsen
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError.message);
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid JSON in request body', details: parseError.message })
      };
    }
    
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

    // S3 Client initialisieren (mit Credential-Prüfung)
    let s3Client;
    try {
      s3Client = getS3Client();
    } catch (credError) {
      console.error('❌ S3 Client Fehler:', credError.message);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'AWS configuration error', 
          details: credError.message,
          hint: 'Please check NETLIFY_AWS_ACCESS_KEY_ID and NETLIFY_AWS_SECRET_ACCESS_KEY environment variables'
        })
      };
    }

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
    const url = await s3Client.getSignedUrlPromise('putObject', params);

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
    console.error('❌ Unerwarteter Fehler:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        stack: error.stack
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
// Updated: Sat Jan 17 14:00:00 CET 2026 - Improved error handling
