/**
 * Lambda Function: Complete Media Upload
 * POST /media/complete
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import { ApiResponse, RequestParser, RequestValidator, createHandler } from '../shared/api-gateway.js';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({ region: process.env.AWS_REGION });

/**
 * Media Upload abschließen
 */
async function completeUpload(event, context) {
  console.log('✅ Complete Upload Request:', JSON.stringify(event, null, 2));

  try {
    // Authorization validieren
    const userId = RequestValidator.validateAuth(event);
    
    // Request Body parsen
    const body = RequestParser.parseBody(event);
    
    // Validierung
    RequestValidator.validateRequired(body, ['s3Key', 'filename', 'type', 'size']);
    
    const { s3Key, filename, type, size, metadata = {} } = body;
    
    // S3 Object existiert prüfen
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: process.env.S3_MEDIA_BUCKET,
        Key: s3Key
      });
      
      const s3Object = await s3Client.send(headCommand);
      
      // Größe validieren
      if (s3Object.ContentLength !== size) {
        return ApiResponse.validationError(['File size mismatch']);
      }
      
      // Content-Type validieren
      if (s3Object.ContentType !== type) {
        return ApiResponse.validationError(['Content type mismatch']);
      }
      
    } catch (s3Error) {
      console.error('S3 Object not found:', s3Error);
      return ApiResponse.notFound('File not found in S3');
    }
    
    // Media ID aus S3 Key extrahieren
    const mediaId = s3Key.split('/').pop().split('.')[0];
    
    // CloudFront URL generieren
    const cloudFrontUrl = `${process.env.CLOUDFRONT_URL}/${s3Key}`;
    
    // Media Item erstellen
    const now = new Date().toISOString();
    const mediaItem = {
      PK: `USER#${userId}`,
      SK: `MEDIA#${mediaId}`,
      mediaId,
      userId,
      key: s3Key,
      filename,
      type,
      size,
      width: metadata.width || null,
      height: metadata.height || null,
      cdnUrl: cloudFrontUrl,
      thumbnailUrl: null, // Wird später generiert
      createdAt: now,
      updatedAt: now,
      tags: metadata.tags || [],
      metadata: {
        ...metadata,
        s3Bucket: process.env.S3_MEDIA_BUCKET,
        s3Region: process.env.AWS_REGION,
        uploadTimestamp: now,
        userAgent: event.headers['User-Agent'] || '',
        ipAddress: event.requestContext?.identity?.sourceIp || ''
      },
      virusStatus: 'scanning', // Wird von S3 Event verarbeitet
      derivatives: {} // Wird von Image Processing Lambda gefüllt
    };
    
    // In DynamoDB speichern
    await docClient.send(new PutCommand({
      TableName: process.env.MEDIA_TABLE,
      Item: mediaItem,
      ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)'
    }));
    
    console.log('✅ Media upload completed:', mediaId);
    
    // S3 Event für Processing triggern (optional)
    // Hier könnte ein SNS/SQS Event gesendet werden für Image Processing
    
    return ApiResponse.success({
      mediaId,
      s3Key,
      cdnUrl: cloudFrontUrl,
      filename,
      type,
      size,
      createdAt: now,
      message: 'Media upload completed successfully'
    });

  } catch (error) {
    console.error('❌ Error completing upload:', error);
    throw error;
  }
}

/**
 * Media Metadaten aktualisieren
 */
async function updateMediaMetadata(event, context) {
  console.log('✏️ Update Media Metadata Request:', JSON.stringify(event, null, 2));

  try {
    // Authorization validieren
    const userId = RequestValidator.validateAuth(event);
    
    // Request Body parsen
    const body = RequestParser.parseBody(event);
    
    // Validierung
    RequestValidator.validateRequired(body, ['mediaId']);
    
    const { mediaId, metadata = {} } = body;
    
    // Bestehende Media Item laden
    const { GetCommand, UpdateCommand } = await import('@aws-sdk/lib-dynamodb');
    
    const getResult = await docClient.send(new GetCommand({
      TableName: process.env.MEDIA_TABLE,
      Key: {
        PK: `USER#${userId}`,
        SK: `MEDIA#${mediaId}`
      }
    }));
    
    if (!getResult.Item) {
      return ApiResponse.notFound('Media not found');
    }
    
    // Metadaten aktualisieren
    const now = new Date().toISOString();
    const updateExpression = 'SET updatedAt = :updatedAt, metadata = :metadata';
    const expressionAttributeValues = {
      ':updatedAt': now,
      ':metadata': {
        ...getResult.Item.metadata,
        ...metadata,
        lastModifiedAt: now
      }
    };
    
    // Zusätzliche Felder aktualisieren
    if (metadata.tags) {
      updateExpression += ', tags = :tags';
      expressionAttributeValues[':tags'] = metadata.tags;
    }
    
    if (metadata.width !== undefined) {
      updateExpression += ', #width = :width';
      expressionAttributeValues[':width'] = metadata.width;
    }
    
    if (metadata.height !== undefined) {
      updateExpression += ', #height = :height';
      expressionAttributeValues[':height'] = metadata.height;
    }
    
    const updateCommand = new UpdateCommand({
      TableName: process.env.MEDIA_TABLE,
      Key: {
        PK: `USER#${userId}`,
        SK: `MEDIA#${mediaId}`
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: {
        '#width': 'width',
        '#height': 'height'
      },
      ReturnValues: 'ALL_NEW'
    });
    
    const result = await docClient.send(updateCommand);
    
    console.log('✅ Media metadata updated:', mediaId);
    
    return ApiResponse.success({
      mediaId,
      metadata: result.Attributes.metadata,
      updatedAt: result.Attributes.updatedAt,
      message: 'Media metadata updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating media metadata:', error);
    throw error;
  }
}

/**
 * Media löschen
 */
async function deleteMedia(event, context) {
  console.log('🗑️ Delete Media Request:', JSON.stringify(event, null, 2));

  try {
    // Authorization validieren
    const userId = RequestValidator.validateAuth(event);
    
    // Media ID aus Path
    const mediaId = event.pathParameters?.id;
    if (!mediaId) {
      return ApiResponse.validationError(['Media ID is required']);
    }
    
    // Bestehende Media Item laden
    const { GetCommand, DeleteCommand } = await import('@aws-sdk/lib-dynamodb');
    
    const getResult = await docClient.send(new GetCommand({
      TableName: process.env.MEDIA_TABLE,
      Key: {
        PK: `USER#${userId}`,
        SK: `MEDIA#${mediaId}`
      }
    }));
    
    if (!getResult.Item) {
      return ApiResponse.notFound('Media not found');
    }
    
    // S3 Object löschen
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.S3_MEDIA_BUCKET,
      Key: getResult.Item.key
    });
    
    await s3Client.send(deleteCommand);
    
    // DynamoDB Item löschen
    await docClient.send(new DeleteCommand({
      TableName: process.env.MEDIA_TABLE,
      Key: {
        PK: `USER#${userId}`,
        SK: `MEDIA#${mediaId}`
      }
    }));
    
    console.log('✅ Media deleted:', mediaId);
    
    return ApiResponse.success({
      mediaId,
      message: 'Media deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting media:', error);
    throw error;
  }
}

// Handler basierend auf HTTP Method und Path
export const handler = createHandler(async (event, context) => {
  const method = event.httpMethod;
  const path = event.path;
  
  if (method === 'POST' && path === '/media/complete') {
    return await completeUpload(event, context);
  } else if (method === 'PUT' && path.startsWith('/media/')) {
    return await updateMediaMetadata(event, context);
  } else if (method === 'DELETE' && path.startsWith('/media/')) {
    return await deleteMedia(event, context);
  } else {
    return ApiResponse.methodNotAllowed(['POST', 'PUT', 'DELETE']);
  }
});
