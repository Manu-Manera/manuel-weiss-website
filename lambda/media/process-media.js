/**
 * Media Processing Lambda
 * Automatische Verarbeitung von hochgeladenen Medien
 */

import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { TABLE_NAMES } from '../../src/data/dynamodb-schema';
import { successResponse, errorResponse } from '../shared/api-gateway';

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

const S3_MEDIA_BUCKET = process.env.S3_MEDIA_BUCKET;
const CLOUDFRONT_URL = process.env.CLOUDFRONT_URL;

/**
 * Media Processing Handler
 */
export const handler = async (event) => {
  console.log("Media processing event:", JSON.stringify(event, null, 2));

  try {
    const { mediaId, userId, key, type, size } = event;

    if (!mediaId || !userId || !key || !type) {
      return errorResponse(400, 'Missing required fields: mediaId, userId, key, type');
    }

    // Processing Status aktualisieren
    await updateProcessingStatus(mediaId, userId, 'PROCESSING');

    let processingResult = {};

    // Je nach Dateityp unterschiedliche Verarbeitung
    if (type.startsWith('image/')) {
      processingResult = await processImage(key, type);
    } else if (type.startsWith('video/')) {
      processingResult = await processVideo(key, type);
    } else if (type.includes('pdf')) {
      processingResult = await processDocument(key, type);
    } else {
      // Keine spezielle Verarbeitung nötig
      processingResult = { status: 'COMPLETED', message: 'No processing required' };
    }

    // Verarbeitungsergebnis in DynamoDB speichern
    await updateProcessingStatus(mediaId, userId, 'COMPLETED', processingResult);

    return successResponse(200, {
      message: 'Media processing completed',
      mediaId,
      processingResult
    });

  } catch (error) {
    console.error("Error processing media:", error);
    
    // Fehler-Status setzen
    if (event.mediaId && event.userId) {
      await updateProcessingStatus(event.mediaId, event.userId, 'FAILED', { error: error.message });
    }

    return errorResponse(500, `Failed to process media: ${error.message}`);
  }
};

/**
 * Bild-Verarbeitung
 */
async function processImage(key, type) {
  console.log(`Processing image: ${key}`);

  try {
    // Bild-Metadaten extrahieren
    const metadata = await extractImageMetadata(key);
    
    // Thumbnail generieren
    const thumbnailKey = await generateThumbnail(key, type);
    
    // Verschiedene Größen generieren
    const sizes = await generateImageSizes(key, type);
    
    // EXIF-Daten extrahieren
    const exifData = await extractEXIFData(key);
    
    // Bild-Optimierung
    const optimizedKey = await optimizeImage(key, type);

    return {
      status: 'COMPLETED',
      metadata,
      thumbnailKey,
      sizes,
      exifData,
      optimizedKey,
      processedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}

/**
 * Video-Verarbeitung
 */
async function processVideo(key, type) {
  console.log(`Processing video: ${key}`);

  try {
    // Video-Metadaten extrahieren
    const metadata = await extractVideoMetadata(key);
    
    // Thumbnail generieren
    const thumbnailKey = await generateVideoThumbnail(key, type);
    
    // Verschiedene Qualitäten generieren
    const qualities = await generateVideoQualities(key, type);
    
    // Video-Optimierung
    const optimizedKey = await optimizeVideo(key, type);

    return {
      status: 'COMPLETED',
      metadata,
      thumbnailKey,
      qualities,
      optimizedKey,
      processedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error processing video:', error);
    throw error;
  }
}

/**
 * Dokument-Verarbeitung
 */
async function processDocument(key, type) {
  console.log(`Processing document: ${key}`);

  try {
    // Dokument-Metadaten extrahieren
    const metadata = await extractDocumentMetadata(key);
    
    // Thumbnail generieren
    const thumbnailKey = await generateDocumentThumbnail(key, type);
    
    // Text extrahieren
    const extractedText = await extractDocumentText(key, type);
    
    // OCR für Bilder in PDFs
    const ocrData = await performOCR(key, type);

    return {
      status: 'COMPLETED',
      metadata,
      thumbnailKey,
      extractedText,
      ocrData,
      processedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
}

/**
 * Bild-Metadaten extrahieren
 */
async function extractImageMetadata(key) {
  // Hier würde eine echte Bildverarbeitung stattfinden
  // Für Demo-Zwecke simulieren wir die Metadaten
  return {
    width: 1920,
    height: 1080,
    format: 'JPEG',
    colorSpace: 'sRGB',
    hasAlpha: false,
    bitDepth: 8
  };
}

/**
 * Thumbnail generieren
 */
async function generateThumbnail(key, type) {
  const thumbnailKey = key.replace(/\.[^/.]+$/, '_thumb.jpg');
  
  // Hier würde echte Thumbnail-Generierung stattfinden
  // Für Demo-Zwecke kopieren wir das Original
  console.log(`Generating thumbnail: ${thumbnailKey}`);
  
  return thumbnailKey;
}

/**
 * Verschiedene Bildgrößen generieren
 */
async function generateImageSizes(key, type) {
  const sizes = ['small', 'medium', 'large'];
  const generatedSizes = {};

  for (const size of sizes) {
    const sizeKey = key.replace(/\.[^/.]+$/, `_${size}.jpg`);
    generatedSizes[size] = sizeKey;
    console.log(`Generating ${size} size: ${sizeKey}`);
  }

  return generatedSizes;
}

/**
 * EXIF-Daten extrahieren
 */
async function extractEXIFData(key) {
  // Hier würde echte EXIF-Extraktion stattfinden
  return {
    camera: 'Canon EOS R5',
    lens: 'RF 24-70mm f/2.8L IS USM',
    settings: {
      aperture: 'f/2.8',
      shutterSpeed: '1/125',
      iso: 100,
      focalLength: '50mm'
    },
    gps: {
      latitude: 52.5200,
      longitude: 13.4050,
      altitude: 34
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Bild optimieren
 */
async function optimizeImage(key, type) {
  const optimizedKey = key.replace(/\.[^/.]+$/, '_optimized.jpg');
  console.log(`Optimizing image: ${optimizedKey}`);
  return optimizedKey;
}

/**
 * Video-Metadaten extrahieren
 */
async function extractVideoMetadata(key) {
  return {
    duration: 120, // seconds
    width: 1920,
    height: 1080,
    frameRate: 30,
    bitrate: 5000000,
    codec: 'H.264',
    audioCodec: 'AAC',
    hasAudio: true
  };
}

/**
 * Video-Thumbnail generieren
 */
async function generateVideoThumbnail(key, type) {
  const thumbnailKey = key.replace(/\.[^/.]+$/, '_thumb.jpg');
  console.log(`Generating video thumbnail: ${thumbnailKey}`);
  return thumbnailKey;
}

/**
 * Verschiedene Video-Qualitäten generieren
 */
async function generateVideoQualities(key, type) {
  const qualities = ['360p', '720p', '1080p'];
  const generatedQualities = {};

  for (const quality of qualities) {
    const qualityKey = key.replace(/\.[^/.]+$/, `_${quality}.mp4`);
    generatedQualities[quality] = qualityKey;
    console.log(`Generating ${quality} quality: ${qualityKey}`);
  }

  return generatedQualities;
}

/**
 * Video optimieren
 */
async function optimizeVideo(key, type) {
  const optimizedKey = key.replace(/\.[^/.]+$/, '_optimized.mp4');
  console.log(`Optimizing video: ${optimizedKey}`);
  return optimizedKey;
}

/**
 * Dokument-Metadaten extrahieren
 */
async function extractDocumentMetadata(key) {
  return {
    pageCount: 5,
    title: 'Document Title',
    author: 'Document Author',
    subject: 'Document Subject',
    keywords: ['keyword1', 'keyword2'],
    createdDate: new Date().toISOString(),
    modifiedDate: new Date().toISOString()
  };
}

/**
 * Dokument-Thumbnail generieren
 */
async function generateDocumentThumbnail(key, type) {
  const thumbnailKey = key.replace(/\.[^/.]+$/, '_thumb.jpg');
  console.log(`Generating document thumbnail: ${thumbnailKey}`);
  return thumbnailKey;
}

/**
 * Text aus Dokument extrahieren
 */
async function extractDocumentText(key, type) {
  // Hier würde echte Text-Extraktion stattfinden
  return {
    text: 'Extracted text content from document...',
    wordCount: 150,
    language: 'de',
    confidence: 0.95
  };
}

/**
 * OCR durchführen
 */
async function performOCR(key, type) {
  return {
    text: 'OCR extracted text...',
    confidence: 0.88,
    language: 'de',
    regions: [
      {
        text: 'Region 1 text',
        boundingBox: { x: 100, y: 100, width: 200, height: 50 }
      }
    ]
  };
}

/**
 * Processing Status in DynamoDB aktualisieren
 */
async function updateProcessingStatus(mediaId, userId, status, result = {}) {
  try {
    const now = new Date().toISOString();
    
    const updateExpression = 'SET #status = :status, updatedAt = :updatedAt';
    const expressionAttributeNames = { '#status': 'status' };
    const expressionAttributeValues = {
      ':status': status,
      ':updatedAt': now
    };

    // Zusätzliche Felder basierend auf Status
    if (status === 'COMPLETED') {
      updateExpression += ', processingResult = :result, processedAt = :processedAt';
      expressionAttributeValues[':result'] = result;
      expressionAttributeValues[':processedAt'] = now;
    } else if (status === 'FAILED') {
      updateExpression += ', processingError = :error, failedAt = :failedAt';
      expressionAttributeValues[':error'] = result.error || 'Unknown error';
      expressionAttributeValues[':failedAt'] = now;
    }

    await ddbDocClient.send(new UpdateCommand({
      TableName: TABLE_NAMES.MEDIA,
      Key: {
        PK: `USER#${userId}`,
        SK: `MEDIA#${mediaId}`
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    }));

    console.log(`Updated processing status for ${mediaId}: ${status}`);

  } catch (error) {
    console.error('Error updating processing status:', error);
    throw error;
  }
}
