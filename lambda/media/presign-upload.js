/**
 * Lambda Function: Presign Media Upload
 * POST /media/presign
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse, RequestParser, RequestValidator, createHandler } from '../shared/api-gateway.js';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

/**
 * Presign Upload URL generieren
 */
async function presignUpload(event, context) {
  console.log('📤 Presign Upload Request:', JSON.stringify(event, null, 2));

  try {
    // Authorization validieren
    const userId = RequestValidator.validateAuth(event);
    
    // Request Body parsen
    const body = RequestParser.parseBody(event);
    
    // Validierung
    RequestValidator.validateRequired(body, ['filename', 'type', 'size']);
    
    const { filename, type, size } = body;
    
    // File Type validieren
    const allowedTypes = [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(type)) {
      return ApiResponse.validationError(['File type not allowed']);
    }
    
    // File Size validieren (15MB max)
    const maxSize = 15 * 1024 * 1024; // 15MB
    if (size > maxSize) {
      return ApiResponse.validationError(['File size exceeds 15MB limit']);
    }
    
    // S3 Key generieren
    const fileExtension = filename.split('.').pop();
    const mediaId = uuidv4();
    const s3Key = `users/${userId}/media/${mediaId}.${fileExtension}`;
    
    // Presigned URL generieren
    const command = new PutObjectCommand({
      Bucket: process.env.S3_MEDIA_BUCKET,
      Key: s3Key,
      ContentType: type,
      Metadata: {
        'user-id': userId,
        'media-id': mediaId,
        'original-filename': filename,
        'upload-timestamp': new Date().toISOString()
      }
    });
    
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600 // 1 Stunde
    });
    
    // CloudFront URL generieren
    const cloudFrontUrl = `${process.env.CLOUDFRONT_URL}/${s3Key}`;
    
    console.log('✅ Presigned URL generated:', s3Key);
    
    return ApiResponse.success({
      mediaId,
      s3Key,
      presignedUrl,
      cloudFrontUrl,
      expiresIn: 3600,
      uploadData: {
        key: s3Key,
        url: presignedUrl,
        fields: {}, // Für POST uploads
        headers: {
          'Content-Type': type
        }
      }
    });

  } catch (error) {
    console.error('❌ Error generating presigned URL:', error);
    throw error;
  }
}

/**
 * Multipart Upload für große Dateien
 */
async function presignMultipartUpload(event, context) {
  console.log('📤 Presign Multipart Upload Request:', JSON.stringify(event, null, 2));

  try {
    // Authorization validieren
    const userId = RequestValidator.validateAuth(event);
    
    // Request Body parsen
    const body = RequestParser.parseBody(event);
    
    // Validierung
    RequestValidator.validateRequired(body, ['filename', 'type', 'size']);
    
    const { filename, type, size } = body;
    
    // Nur für große Dateien (>5MB)
    const minSizeForMultipart = 5 * 1024 * 1024; // 5MB
    if (size < minSizeForMultipart) {
      return ApiResponse.validationError(['File too small for multipart upload']);
    }
    
    // File Type validieren
    const allowedTypes = [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(type)) {
      return ApiResponse.validationError(['File type not allowed']);
    }
    
    // File Size validieren (100MB max für multipart)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (size > maxSize) {
      return ApiResponse.validationError(['File size exceeds 100MB limit']);
    }
    
    // S3 Key generieren
    const fileExtension = filename.split('.').pop();
    const mediaId = uuidv4();
    const s3Key = `users/${userId}/media/${mediaId}.${fileExtension}`;
    
    // Multipart Upload initiieren
    const { createMultipartUpload } = await import('@aws-sdk/client-s3');
    const multipartCommand = new createMultipartUpload({
      Bucket: process.env.S3_MEDIA_BUCKET,
      Key: s3Key,
      ContentType: type,
      Metadata: {
        'user-id': userId,
        'media-id': mediaId,
        'original-filename': filename,
        'upload-timestamp': new Date().toISOString()
      }
    });
    
    const multipartResult = await s3Client.send(multipartCommand);
    const uploadId = multipartResult.UploadId;
    
    // CloudFront URL generieren
    const cloudFrontUrl = `${process.env.CLOUDFRONT_URL}/${s3Key}`;
    
    console.log('✅ Multipart upload initiated:', uploadId);
    
    return ApiResponse.success({
      mediaId,
      s3Key,
      uploadId,
      cloudFrontUrl,
      expiresIn: 86400, // 24 Stunden für multipart
      uploadData: {
        key: s3Key,
        uploadId,
        bucket: process.env.S3_MEDIA_BUCKET,
        region: process.env.AWS_REGION
      }
    });

  } catch (error) {
    console.error('❌ Error initiating multipart upload:', error);
    throw error;
  }
}

/**
 * Upload Part URL generieren
 */
async function presignUploadPart(event, context) {
  console.log('📤 Presign Upload Part Request:', JSON.stringify(event, null, 2));

  try {
    // Authorization validieren
    const userId = RequestValidator.validateAuth(event);
    
    // Request Body parsen
    const body = RequestParser.parseBody(event);
    
    // Validierung
    RequestValidator.validateRequired(body, ['s3Key', 'uploadId', 'partNumber']);
    
    const { s3Key, uploadId, partNumber } = body;
    
    // Part Number validieren
    if (partNumber < 1 || partNumber > 10000) {
      return ApiResponse.validationError(['Part number must be between 1 and 10000']);
    }
    
    // Upload Part URL generieren
    const { UploadPartCommand } = await import('@aws-sdk/client-s3');
    const command = new UploadPartCommand({
      Bucket: process.env.S3_MEDIA_BUCKET,
      Key: s3Key,
      UploadId: uploadId,
      PartNumber: partNumber
    });
    
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600 // 1 Stunde
    });
    
    console.log('✅ Upload part URL generated:', partNumber);
    
    return ApiResponse.success({
      partNumber,
      presignedUrl,
      expiresIn: 3600
    });

  } catch (error) {
    console.error('❌ Error generating upload part URL:', error);
    throw error;
  }
}

/**
 * Multipart Upload abschließen
 */
async function completeMultipartUpload(event, context) {
  console.log('📤 Complete Multipart Upload Request:', JSON.stringify(event, null, 2));

  try {
    // Authorization validieren
    const userId = RequestValidator.validateAuth(event);
    
    // Request Body parsen
    const body = RequestParser.parseBody(event);
    
    // Validierung
    RequestValidator.validateRequired(body, ['s3Key', 'uploadId', 'parts']);
    
    const { s3Key, uploadId, parts } = body;
    
    // Parts validieren
    if (!Array.isArray(parts) || parts.length === 0) {
      return ApiResponse.validationError(['Parts array is required and must not be empty']);
    }
    
    // Multipart Upload abschließen
    const { CompleteMultipartUploadCommand } = await import('@aws-sdk/client-s3');
    const command = new CompleteMultipartUploadCommand({
      Bucket: process.env.S3_MEDIA_BUCKET,
      Key: s3Key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.map(part => ({
          ETag: part.etag,
          PartNumber: part.partNumber
        }))
      }
    });
    
    const result = await s3Client.send(command);
    
    // CloudFront URL generieren
    const cloudFrontUrl = `${process.env.CLOUDFRONT_URL}/${s3Key}`;
    
    console.log('✅ Multipart upload completed:', s3Key);
    
    return ApiResponse.success({
      s3Key,
      cloudFrontUrl,
      etag: result.ETag,
      location: result.Location
    });

  } catch (error) {
    console.error('❌ Error completing multipart upload:', error);
    throw error;
  }
}

/**
 * Upload abbrechen
 */
async function abortMultipartUpload(event, context) {
  console.log('📤 Abort Multipart Upload Request:', JSON.stringify(event, null, 2));

  try {
    // Authorization validieren
    const userId = RequestValidator.validateAuth(event);
    
    // Request Body parsen
    const body = RequestParser.parseBody(event);
    
    // Validierung
    RequestValidator.validateRequired(body, ['s3Key', 'uploadId']);
    
    const { s3Key, uploadId } = body;
    
    // Multipart Upload abbrechen
    const { AbortMultipartUploadCommand } = await import('@aws-sdk/client-s3');
    const command = new AbortMultipartUploadCommand({
      Bucket: process.env.S3_MEDIA_BUCKET,
      Key: s3Key,
      UploadId: uploadId
    });
    
    await s3Client.send(command);
    
    console.log('✅ Multipart upload aborted:', uploadId);
    
    return ApiResponse.success({
      message: 'Multipart upload aborted successfully'
    });

  } catch (error) {
    console.error('❌ Error aborting multipart upload:', error);
    throw error;
  }
}

// Handler basierend auf HTTP Method
export const handler = createHandler(async (event, context) => {
  const method = event.httpMethod;
  const path = event.path;
  
  if (method === 'POST' && path === '/media/presign') {
    return await presignUpload(event, context);
  } else if (method === 'POST' && path === '/media/presign/multipart') {
    return await presignMultipartUpload(event, context);
  } else if (method === 'POST' && path === '/media/presign/part') {
    return await presignUploadPart(event, context);
  } else if (method === 'POST' && path === '/media/presign/complete') {
    return await completeMultipartUpload(event, context);
  } else if (method === 'POST' && path === '/media/presign/abort') {
    return await abortMultipartUpload(event, context);
  } else {
    return ApiResponse.methodNotAllowed(['POST']);
  }
});
