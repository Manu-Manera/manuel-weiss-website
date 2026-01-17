'use strict';

/**
 * Netlify Function: S3 Presigned URL Generator
 * Verwendet AWS SDK v3 für bessere Kompatibilität
 */

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// AWS Konfiguration
const REGION = 'eu-central-1';
const BUCKET_NAME = 'mawps-profile-images';
const DOCUMENTS_PREFIX = 'public/documents/';
const PROFILE_PREFIX = 'public/profile-images/';

// CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
  'Content-Type': 'application/json'
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

exports.handler = async (event) => {
  console.log('📤 S3 Upload Function v3 aufgerufen:', {
    method: event.httpMethod,
    path: event.path
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
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (parseError) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid JSON', details: parseError.message })
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

    // AWS Credentials prüfen
    const accessKeyId = process.env.NETLIFY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.NETLIFY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
    
    if (!accessKeyId || !secretAccessKey) {
      console.error('❌ AWS Credentials fehlen!');
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'AWS credentials not configured',
          hint: 'Set NETLIFY_AWS_ACCESS_KEY_ID and NETLIFY_AWS_SECRET_ACCESS_KEY'
        })
      };
    }

    // S3 Client erstellen (SDK v3)
    const s3Client = new S3Client({
      region: REGION,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
      }
    });

    // Prefix und Dateiendung bestimmen
    let prefix;
    const type = fileType || 'document';
    const fileExt = getExtFromContentType(contentType, type);
    
    if (type === 'profile') {
      prefix = PROFILE_PREFIX;
    } else {
      prefix = DOCUMENTS_PREFIX;
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

    console.log('🔑 S3 Key:', key);

    // PutObject Command erstellen
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType
    });

    // Presigned URL generieren (2 Minuten gültig)
    const url = await getSignedUrl(s3Client, command, { expiresIn: 120 });

    // Public URL erstellen
    const keyParts = key.split('/');
    const encodedKey = keyParts.map(part => encodeURIComponent(part)).join('/');
    const publicUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${encodedKey}`;

    console.log('✅ Presigned URL generiert');

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
    console.error('❌ Fehler:', error.message, error.stack);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        name: error.name
      })
    };
  }
};
