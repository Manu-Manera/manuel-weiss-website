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

        // Parse JSON body (we send JSON with base64-encoded file)
        let requestBody;
        try {
            requestBody = JSON.parse(event.body || '{}');
        } catch (parseError) {
            console.error('Error parsing request body:', parseError);
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid JSON in request body', details: parseError.message })
            };
        }

        const { fileData, fileName, contentType: fileContentType } = requestBody;

        if (!fileData || !fileName) {
            console.error('Missing required fields:', { hasFileData: !!fileData, hasFileName: !!fileName });
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'fileData and fileName are required',
                    received: {
                        hasFileData: !!fileData,
                        hasFileName: !!fileName,
                        fileName: fileName || 'missing'
                    }
                })
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

