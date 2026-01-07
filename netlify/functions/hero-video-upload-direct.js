/**
 * Netlify Function: Hero Video Upload Direct
 * Lädt Videos direkt über den Server zu S3 hoch (umgeht CORS-Probleme)
 */

const AWS = require('aws-sdk');
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');

// S3 Client initialisieren
const s3 = new AWS.S3({
    region: process.env.AWS_REGION || 'eu-central-1',
});

const dynamoDB = new DynamoDBClient({ 
    region: process.env.AWS_REGION || 'eu-central-1' 
});

const BUCKET_NAME = process.env.AWS_S3_HERO_VIDEO_BUCKET || 'manuel-weiss-hero-videos';
const TABLE_NAME = process.env.DYNAMODB_SETTINGS_TABLE || 'manuel-weiss-settings';
const SETTINGS_KEY = 'hero-video-url';
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

exports.handler = async (event, context) => {
    // CORS Headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle CORS Preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        if (event.httpMethod !== 'POST') {
            return {
                statusCode: 405,
                headers,
                body: JSON.stringify({ error: 'Method not allowed' })
            };
        }

        // Parse multipart/form-data
        const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';
        
        if (!contentType.includes('multipart/form-data')) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Content-Type must be multipart/form-data' })
            };
        }

        // Parse the body (Netlify Functions receive base64-encoded body for binary data)
        let body;
        if (event.isBase64Encoded) {
            body = Buffer.from(event.body, 'base64');
        } else {
            body = event.body;
        }

        // For simplicity, we'll use a simpler approach: expect the file as base64 in JSON
        // This is easier to handle in Netlify Functions
        const requestBody = JSON.parse(event.body || '{}');
        const { fileData, fileName, contentType: fileContentType } = requestBody;

        if (!fileData || !fileName) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'fileData and fileName are required' })
            };
        }

        // Decode base64 file data
        const fileBuffer = Buffer.from(fileData, 'base64');
        const fileSize = fileBuffer.length;

        // Validate file size
        if (fileSize > MAX_FILE_SIZE) {
            return {
                statusCode: 413,
                headers,
                body: JSON.stringify({ error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` })
            };
        }

        // Generate unique key
        const timestamp = Date.now();
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const key = `hero-videos/${timestamp}-${sanitizedFileName}`;

        // Upload to S3
        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: key,
            Body: fileBuffer,
            ContentType: fileContentType || 'video/mp4',
            ServerSideEncryption: 'AES256'
        };

        console.log('Uploading to S3:', key, 'Size:', fileSize);
        const s3Result = await s3.upload(uploadParams).promise();
        console.log('S3 upload successful:', s3Result.Location);

        // Generate public URL
        const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-central-1'}.amazonaws.com/${key}`;

        // Save URL to DynamoDB
        const params = {
            TableName: TABLE_NAME,
            Item: marshall({
                settingKey: SETTINGS_KEY,
                settingValue: publicUrl,
                updatedAt: new Date().toISOString()
            })
        };

        await dynamoDB.send(new PutItemCommand(params));
        console.log('Settings saved to DynamoDB');

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                videoUrl: publicUrl,
                key: key,
                size: fileSize
            })
        };

    } catch (error) {
        console.error('Error in hero-video-upload-direct:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message 
            })
        };
    }
};

