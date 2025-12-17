/**
 * AWS Lambda Function for Rental Images API
 * API-First System für Rental-Bilder (wie Profilbilder)
 * 
 * Endpoints:
 * - GET /rentals/{rentalType}/images - Lade alle Bilder für einen Rental-Typ
 * - POST /rentals/{rentalType}/images/upload-url - Generiere Presigned URL für Upload
 * - POST /rentals/{rentalType}/images - Speichere Bild-Metadaten in DynamoDB
 * - PUT /rentals/{rentalType}/images/display - Setze Hauptbild
 * - DELETE /rentals/{rentalType}/images/{imageId} - Lösche Bild
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const dynamodbClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });
const dynamodb = DynamoDBDocumentClient.from(dynamodbClient);
const s3Client = new S3Client({ region: process.env.AWS_REGION || 'eu-central-1' });

const TABLE_NAME = process.env.PROFILE_TABLE || 'mawps-user-profiles';
const BUCKET_NAME = process.env.PROFILE_IMAGES_BUCKET || process.env.BUCKET_NAME || 'mawps-user-files-1760106396';
const ALLOWED_ORIGINS = [
    'https://mawps.netlify.app',
    'https://www.manuel-weiss.ch',
    'https://manuel-weiss.ch',
    'http://localhost:3000',
    'http://localhost:8888'
];

// Helper function to create CORS headers
function getCORSHeaders(origin) {
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    };
}

// Helper function to create response
function createResponse(statusCode, body, origin = '*') {
    return {
        statusCode,
        headers: getCORSHeaders(origin),
        body: JSON.stringify(body)
    };
}

// Helper function to verify JWT token (optional für owner)
async function verifyToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    
    // Für owner/website-images ist Auth optional
    // Hier könnte JWT-Verification implementiert werden
    const token = authHeader.substring(7);
    return { userId: 'owner', isOwner: true };
}

exports.handler = async (event) => {
    console.log('📸 Rental Images API Event:', JSON.stringify(event, null, 2));
    
    const origin = event.headers?.origin || event.headers?.Origin || '*';
    const method = event.httpMethod || event.requestContext?.http?.method || 'GET';
    
    // Handle CORS preflight
    if (method === 'OPTIONS') {
        return createResponse(200, { message: 'OK' }, origin);
    }
    
    try {
        // Parse path
        const path = event.path || event.rawPath || '';
        const pathParts = path.split('/').filter(p => p);
        
        console.log('📋 Path parts:', pathParts);
        
        // Route: /rentals/{rentalType}/images
        if (pathParts.length >= 3 && pathParts[0] === 'rentals' && pathParts[2] === 'images') {
            const rentalType = pathParts[1]; // z.B. 'fotobox', 'wohnmobil'
            
            // GET /rentals/{rentalType}/images - Lade alle Bilder
            if (method === 'GET') {
                return await getRentalImages(rentalType, origin);
            }
            
            // POST /rentals/{rentalType}/images/upload-url - Generiere Presigned URL
            if (method === 'POST' && pathParts.length === 4 && pathParts[3] === 'upload-url') {
                const body = JSON.parse(event.body || '{}');
                return await generateUploadUrl(rentalType, body, origin);
            }
            
            // POST /rentals/{rentalType}/images - Speichere Bild-Metadaten
            if (method === 'POST' && pathParts.length === 3) {
                const body = JSON.parse(event.body || '{}');
                return await saveRentalImage(rentalType, body, origin);
            }
            
            // PUT /rentals/{rentalType}/images/display - Setze Hauptbild
            if (method === 'PUT' && pathParts.length === 4 && pathParts[3] === 'display') {
                const body = JSON.parse(event.body || '{}');
                return await setDisplayImage(rentalType, body, origin);
            }
            
            // DELETE /rentals/{rentalType}/images/{imageId} - Lösche Bild
            if (method === 'DELETE' && pathParts.length === 4) {
                const imageId = pathParts[3];
                return await deleteRentalImage(rentalType, imageId, origin);
            }
        }
        
        return createResponse(404, { error: 'Not found' }, origin);
        
    } catch (error) {
        console.error('❌ Error:', error);
        return createResponse(
            500,
            { error: error.message || 'Internal server error' },
            origin
        );
    }
};

/**
 * GET /rentals/{rentalType}/images
 * Lade alle Bilder für einen Rental-Typ
 */
async function getRentalImages(rentalType, origin) {
    try {
        const userId = 'owner';
        const itemId = `rental-images-${rentalType}`;
        
        const result = await dynamodb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                userId: userId,
                itemId: itemId
            }
        }));
        
        if (result.Item && result.Item.type === 'rental-images') {
            const images = result.Item.images || [];
            const displayImage = result.Item.displayImage || null;
            
            return createResponse(200, {
                rentalType,
                images,
                displayImage,
                count: images.length
            }, origin);
        }
        
        return createResponse(200, {
            rentalType,
            images: [],
            displayImage: null,
            count: 0
        }, origin);
        
    } catch (error) {
        console.error('❌ Error getting rental images:', error);
        throw error;
    }
}

/**
 * POST /rentals/{rentalType}/images/upload-url
 * Generiere Presigned URL für S3 Upload
 */
async function generateUploadUrl(rentalType, body, origin) {
    try {
        const { fileName, contentType } = body;
        
        if (!fileName || !contentType) {
            return createResponse(400, { error: 'Missing fileName or contentType' }, origin);
        }
        
        const fileExtension = fileName.split('.').pop() || 'jpg';
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 9);
        const imageKey = `public/rental-images/${rentalType}/${timestamp}-${randomId}.${fileExtension}`;
        
        const { PutObjectCommand } = require('@aws-sdk/client-s3');
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: imageKey,
            ContentType: contentType,
            ACL: 'public-read'
        });
        
        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        const imageUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-central-1'}.amazonaws.com/${imageKey}`;
        
        return createResponse(200, {
            uploadUrl,
            imageUrl,
            imageKey,
            rentalType
        }, origin);
        
    } catch (error) {
        console.error('❌ Error generating upload URL:', error);
        throw error;
    }
}

/**
 * POST /rentals/{rentalType}/images
 * Speichere Bild-Metadaten in DynamoDB
 */
async function saveRentalImage(rentalType, body, origin) {
    try {
        const { imageUrl, imageKey, filename, uploadedAt } = body;
        
        if (!imageUrl) {
            return createResponse(400, { error: 'Missing imageUrl' }, origin);
        }
        
        const userId = 'owner';
        const itemId = `rental-images-${rentalType}`;
        const imageId = `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        // Lade bestehende Bilder
        const existing = await dynamodb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { userId, itemId }
        }));
        
        const existingImages = existing.Item?.images || [];
        const newImage = {
            id: imageId,
            url: imageUrl,
            imageKey: imageKey || null,
            filename: filename || 'uploaded-image.jpg',
            uploadedAt: uploadedAt || new Date().toISOString(),
            rentalType
        };
        
        const updatedImages = [...existingImages, newImage];
        
        // Speichere in DynamoDB
        const item = {
            userId,
            type: 'rental-images',
            rentalType,
            images: updatedImages,
            displayImage: existing.Item?.displayImage || null,
            updatedAt: new Date().toISOString(),
            createdAt: existing.Item?.createdAt || new Date().toISOString()
        };
        
        // Füge itemId hinzu, falls Sort Key vorhanden
        if (existing.Item && existing.Item.itemId) {
            item.itemId = itemId;
        }
        
        await dynamodb.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: item
        }));
        
        console.log('✅ Rental image saved:', imageId);
        
        return createResponse(200, {
            success: true,
            image: newImage,
            message: 'Image saved successfully'
        }, origin);
        
    } catch (error) {
        console.error('❌ Error saving rental image:', error);
        throw error;
    }
}

/**
 * PUT /rentals/{rentalType}/images/display
 * Setze Hauptbild
 */
async function setDisplayImage(rentalType, body, origin) {
    try {
        const { imageUrl } = body;
        
        if (!imageUrl) {
            return createResponse(400, { error: 'Missing imageUrl' }, origin);
        }
        
        const userId = 'owner';
        const itemId = `rental-images-${rentalType}`;
        
        // Lade bestehende Daten
        const existing = await dynamodb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { userId }
        }));
        
        if (!existing.Item) {
            return createResponse(404, { error: 'Rental images not found' }, origin);
        }
        
        // Struktur wie website-images: rentalImages Objekt
        const existingRentalImages = existing.Item.rentalImages || {};
        const rentalData = existingRentalImages[rentalType] || { images: [] };
        
        // Prüfe ob Bild existiert
        const imageExists = rentalData.images.some(img => img.url === imageUrl);
        
        if (!imageExists) {
            return createResponse(400, { error: 'Image not found in rental images' }, origin);
        }
        
        // Aktualisiere Display Image
        const updatedRentalImages = {
            ...existingRentalImages,
            [rentalType]: {
                ...rentalData,
                displayImage: imageUrl
            }
        };
        
        const updatedItem = {
            ...existing.Item,
            rentalImages: updatedRentalImages,
            updatedAt: new Date().toISOString()
        };
        
        await dynamodb.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: updatedItem
        }));
        
        console.log('✅ Display image set:', imageUrl);
        
        return createResponse(200, {
            success: true,
            displayImage: imageUrl,
            message: 'Display image set successfully'
        }, origin);
        
    } catch (error) {
        console.error('❌ Error setting display image:', error);
        throw error;
    }
}

/**
 * DELETE /rentals/{rentalType}/images/{imageId}
 * Lösche Bild
 */
async function deleteRentalImage(rentalType, imageId, origin) {
    try {
        const userId = 'owner';
        const itemId = `rental-images-${rentalType}`;
        
        // Lade bestehende Bilder
        let existing;
        try {
            existing = await dynamodb.send(new GetCommand({
                TableName: TABLE_NAME,
                Key: { userId, itemId }
            }));
        } catch (error) {
            // Fallback: Nur userId
            existing = await dynamodb.send(new GetCommand({
                TableName: TABLE_NAME,
                Key: { userId }
            }));
        }
        
        if (!existing.Item) {
            return createResponse(404, { error: 'Rental images not found' }, origin);
        }
        
        const images = existing.Item.images || [];
        const filteredImages = images.filter(img => img.id !== imageId);
        
        // Wenn gelöschtes Bild das Display Image war, entferne es
        let displayImage = existing.Item.displayImage;
        const deletedImage = images.find(img => img.id === imageId);
        if (deletedImage && deletedImage.url === displayImage) {
            displayImage = filteredImages.length > 0 ? filteredImages[0].url : null;
        }
        
        // Aktualisiere in DynamoDB
        const updatedItem = {
            ...existing.Item,
            images: filteredImages,
            displayImage,
            updatedAt: new Date().toISOString()
        };
        
        // Stelle sicher, dass userId und itemId vorhanden sind
        if (!updatedItem.userId) updatedItem.userId = userId;
        if (existing.Item.itemId) updatedItem.itemId = itemId;
        
        await dynamodb.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: updatedItem
        }));
        
        console.log('✅ Rental image deleted:', imageId);
        
        return createResponse(200, {
            success: true,
            message: 'Image deleted successfully'
        }, origin);
        
    } catch (error) {
        console.error('❌ Error deleting rental image:', error);
        throw error;
    }
}

