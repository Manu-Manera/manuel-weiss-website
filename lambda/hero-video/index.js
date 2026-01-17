/**
 * AWS Lambda: Hero Video (Settings + Upload)
 * Migrated from Netlify Function
 * Kombiniert hero-video-settings und hero-video-upload
 */

const { DynamoDBClient, PutItemCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

// AWS Lambda verwendet automatisch IAM Role
const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });
const s3 = new S3Client({ region: process.env.AWS_REGION || 'eu-central-1' });

const SETTINGS_TABLE = process.env.DYNAMODB_SETTINGS_TABLE || 'manuel-weiss-settings';
const VIDEO_BUCKET = process.env.S3_HERO_VIDEO_BUCKET || 'manuel-weiss-hero-videos';
const SETTINGS_KEY = 'hero-video-url';
const UPLOAD_EXPIRY = 60 * 5; // 5 Minuten

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Content-Type': 'application/json'
};

exports.handler = async (event) => {
    const path = event.path || event.rawPath || '';
    
    // CORS Preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }

    try {
        // Route: /hero-video/settings
        if (path.includes('/settings')) {
            return await handleSettings(event);
        }
        
        // Route: /hero-video/upload
        if (path.includes('/upload')) {
            return await handleUpload(event);
        }
        
        // Route: /hero-video/list
        if (path.includes('/list')) {
            return await listVideos();
        }
        
        // Default: Settings GET
        if (event.httpMethod === 'GET') {
            return await handleSettings(event);
        }
        
        return {
            statusCode: 404,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Route not found' })
        };
        
    } catch (error) {
        console.error('Hero Video Error:', error);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Internal server error', message: error.message })
        };
    }
};

async function handleSettings(event) {
    // GET: Lade aktuelle Video-URL
    if (event.httpMethod === 'GET') {
        try {
            const result = await dynamoDB.send(new GetItemCommand({
                TableName: SETTINGS_TABLE,
                Key: marshall({ settingKey: SETTINGS_KEY })
            }));
            
            if (result.Item) {
                const item = unmarshall(result.Item);
                return {
                    statusCode: 200,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({
                        videoUrl: item.settingValue || null,
                        updatedAt: item.updatedAt || null
                    })
                };
            }
            
            return {
                statusCode: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify({ videoUrl: null, updatedAt: null })
            };
        } catch (error) {
            console.error('DynamoDB error:', error);
            return {
                statusCode: 500,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Database error', message: error.message })
            };
        }
    }

    // POST/PUT: Speichere Video-URL
    if (event.httpMethod === 'POST' || event.httpMethod === 'PUT') {
        const body = JSON.parse(event.body || '{}');
        const { videoUrl } = body;

        if (!videoUrl || typeof videoUrl !== 'string') {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'videoUrl is required and must be a string' })
            };
        }

        const now = new Date().toISOString();
        
        await dynamoDB.send(new PutItemCommand({
            TableName: SETTINGS_TABLE,
            Item: marshall({
                settingKey: SETTINGS_KEY,
                settingValue: videoUrl,
                updatedAt: now
            })
        }));

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: true, videoUrl, updatedAt: now })
        };
    }

    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
}

async function handleUpload(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const body = JSON.parse(event.body || '{}');
    const { fileName, contentType = 'video/mp4' } = body;

    if (!fileName) {
        return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'fileName is required' })
        };
    }

    // Generiere eindeutigen Key mit Timestamp
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `hero-videos/${timestamp}-${sanitizedFileName}`;

    // Generiere Pre-Signed URL für PUT
    const command = new PutObjectCommand({
        Bucket: VIDEO_BUCKET,
        Key: key,
        ContentType: contentType
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: UPLOAD_EXPIRY });
    const region = process.env.AWS_REGION || 'eu-central-1';
    const publicUrl = `https://${VIDEO_BUCKET}.s3.${region}.amazonaws.com/${key}`;

    console.log('Generated pre-signed URL for:', key);

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

async function listVideos() {
    const result = await s3.send(new ListObjectsV2Command({
        Bucket: VIDEO_BUCKET,
        Prefix: 'hero-videos/',
        MaxKeys: 10
    }));

    const region = process.env.AWS_REGION || 'eu-central-1';
    const videos = (result.Contents || []).map(item => ({
        key: item.Key,
        url: `https://${VIDEO_BUCKET}.s3.${region}.amazonaws.com/${item.Key}`,
        lastModified: item.LastModified,
        size: item.Size
    }));

    return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ videos })
    };
}
