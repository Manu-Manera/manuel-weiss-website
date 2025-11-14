/**
 * Combined Lambda Function for Profile Media & Website Images
 * Handles:
 * - S3 Presigned URLs for image uploads
 * - DynamoDB storage for website images
 */

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Configuration from environment or defaults
const BUCKET_NAME = process.env.BUCKET_NAME || 'manuel-weiss-public-media';
const TABLE_NAME = process.env.TABLE_NAME || 'mawps-user-profiles';
const REGION = process.env.AWS_REGION || 'eu-central-1';

// CORS headers
const CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

exports.handler = async (event) => {
    console.log('📥 Event received:', JSON.stringify(event, null, 2));
    
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: ''
        };
    }
    
    try {
        const path = event.path || event.rawPath || '';
        const method = event.httpMethod || event.requestContext?.http?.method;
        const body = event.body ? JSON.parse(event.body) : {};
        
        console.log('📍 Request:', method, path);
        
        // ===== WEBSITE IMAGES ENDPOINTS =====
        
        if (method === 'POST' && path.includes('/website-images')) {
            // Save website images to DynamoDB
            console.log('💾 Saving website images to DynamoDB...');
            
            const item = {
                userId: 'owner',
                profileImageDefault: body.profileImageDefault || null,
                profileImageHover: body.profileImageHover || null,
                updatedAt: new Date().toISOString(),
                type: 'website-images'
            };
            
            const params = {
                TableName: TABLE_NAME,
                Item: item
            };
            
            await dynamoDB.put(params).promise();
            console.log('✅ Website images saved:', item);
            
            return {
                statusCode: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify({ 
                    success: true,
                    message: 'Website images saved successfully',
                    data: item
                })
            };
        }
        
        if (method === 'GET' && path.includes('/website-images/')) {
            // Load website images from DynamoDB
            const userId = path.split('/').pop() || 'owner';
            console.log('📥 Loading website images for:', userId);
            
            const params = {
                TableName: TABLE_NAME,
                Key: { userId }
            };
            
            const result = await dynamoDB.get(params).promise();
            console.log('✅ Website images loaded:', result.Item);
            
            if (!result.Item) {
                return {
                    statusCode: 404,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({ 
                        message: 'Website images not found',
                        userId: userId
                    })
                };
            }
            
            return {
                statusCode: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify(result.Item)
            };
        }
        
        // ===== S3 PRESIGNED URL ENDPOINTS =====
        
        if (method === 'POST' && path.includes('/profile-image/upload-url')) {
            // Generate presigned URL for S3 upload
            console.log('🔐 Generating presigned URL...');
            
            const { contentType, userId } = body;
            
            if (!contentType) {
                return {
                    statusCode: 400,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({ error: 'contentType is required' })
                };
            }
            
            const userIdSafe = userId || 'anonymous';
            const timestamp = Date.now();
            const extension = contentType.split('/')[1] || 'jpg';
            const key = `public/profile-images/${userIdSafe}/${timestamp}-image.${extension}`;
            
            const params = {
                Bucket: BUCKET_NAME,
                Key: key,
                Expires: 300, // 5 minutes
                ContentType: contentType,
                ACL: 'public-read'
            };
            
            const url = await s3.getSignedUrlPromise('putObject', params);
            const publicUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
            
            console.log('✅ Presigned URL generated:', { key, publicUrl });
            
            return {
                statusCode: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify({
                    url,
                    publicUrl,
                    key,
                    bucket: BUCKET_NAME,
                    region: REGION
                })
            };
        }
        
        // Unknown route
        return {
            statusCode: 404,
            headers: CORS_HEADERS,
            body: JSON.stringify({ 
                error: 'Route not found',
                path,
                method
            })
        };
        
    } catch (error) {
        console.error('❌ Error:', error);
        
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ 
                error: error.message,
                details: error.stack
            })
        };
    }
};

