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
        // Prüfe AWS Credentials
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
            console.error('AWS Credentials missing!');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'Server configuration error',
                    message: 'AWS credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in Netlify environment variables.'
                })
            };
        }

        if (event.httpMethod !== 'POST') {
            return {
                statusCode: 405,
                headers,
                body: JSON.stringify({ error: 'Method not allowed' })
            };
        }

        // Prüfe Request Body Größe (Netlify Functions Limit: 6MB für Request Body)
        const requestBodySize = event.body ? event.body.length : 0;
        const NETLIFY_FUNCTION_LIMIT = 6 * 1024 * 1024; // 6MB
        if (requestBodySize > NETLIFY_FUNCTION_LIMIT) {
            console.error('Request body too large:', requestBodySize, 'bytes');
            return {
                statusCode: 413,
                headers,
                body: JSON.stringify({ 
                    error: 'Request too large',
                    message: `Request body (${Math.round(requestBodySize / 1024 / 1024)}MB) exceeds Netlify Function limit (6MB). Please use a smaller video file or compress it.`
                })
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
        console.log('Decoding base64 file data, length:', fileData.length);
        let fileBuffer;
        try {
            fileBuffer = Buffer.from(fileData, 'base64');
        } catch (decodeError) {
            console.error('Error decoding base64:', decodeError);
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid base64 data', details: decodeError.message })
            };
        }
        
        const fileSize = fileBuffer.length;
        console.log('Decoded file size:', fileSize, 'bytes');

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

        console.log('Uploading to S3:', {
            bucket: BUCKET_NAME,
            key: key,
            size: fileSize,
            contentType: fileContentType || 'video/mp4'
        });

        // Upload to S3
        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: key,
            Body: fileBuffer,
            ContentType: fileContentType || 'video/mp4'
            // ServerSideEncryption entfernt - könnte Probleme verursachen
        };

        let s3Result;
        try {
            // Prüfe zuerst, ob der Bucket existiert
            try {
                await s3.headBucket({ Bucket: BUCKET_NAME }).promise();
                console.log('Bucket exists:', BUCKET_NAME);
            } catch (bucketError) {
                console.error('Bucket check failed:', bucketError);
                if (bucketError.code === 'NotFound' || bucketError.statusCode === 404) {
                    return {
                        statusCode: 500,
                        headers,
                        body: JSON.stringify({ 
                            error: 'S3 bucket not found',
                            message: `Bucket "${BUCKET_NAME}" does not exist. Please create it first.`,
                            bucket: BUCKET_NAME
                        })
                    };
                }
                // Wenn es ein Berechtigungsproblem ist, versuchen wir trotzdem den Upload
                console.warn('Bucket check failed, but continuing with upload:', bucketError.message);
            }

            console.log('Starting S3 upload...');
            s3Result = await s3.upload(uploadParams).promise();
            console.log('S3 upload successful:', s3Result.Location);
        } catch (s3Error) {
            console.error('S3 upload error:', s3Error);
            console.error('Error details:', {
                code: s3Error.code,
                statusCode: s3Error.statusCode,
                message: s3Error.message,
                bucket: BUCKET_NAME,
                key: key
            });
            
            // Spezifische Fehlermeldungen
            let errorMessage = 'S3 upload failed';
            if (s3Error.code === 'AccessDenied' || s3Error.statusCode === 403) {
                errorMessage = 'Access denied to S3 bucket. Please check AWS credentials and IAM permissions.';
            } else if (s3Error.code === 'NoSuchBucket' || s3Error.statusCode === 404) {
                errorMessage = `S3 bucket "${BUCKET_NAME}" not found. Please create it first.`;
            } else if (s3Error.code === 'InvalidAccessKeyId') {
                errorMessage = 'Invalid AWS Access Key. Please check AWS_ACCESS_KEY_ID in Netlify environment variables.';
            } else if (s3Error.code === 'SignatureDoesNotMatch') {
                errorMessage = 'AWS Secret Key mismatch. Please check AWS_SECRET_ACCESS_KEY in Netlify environment variables.';
            } else {
                errorMessage = s3Error.message || 'Unknown S3 error';
            }
            
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'S3 upload failed', 
                    message: errorMessage,
                    code: s3Error.code,
                    statusCode: s3Error.statusCode
                })
            };
        }

        // Generate public URL
        const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-central-1'}.amazonaws.com/${key}`;

        // Save URL to DynamoDB
        try {
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
        } catch (dbError) {
            console.error('DynamoDB save error:', dbError);
            // S3 Upload war erfolgreich, also geben wir trotzdem Erfolg zurück
            // aber loggen den DB-Fehler
            console.warn('Video uploaded to S3 but failed to save to DynamoDB:', dbError.message);
        }

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
        console.error('Error stack:', error.stack);
        console.error('Event:', JSON.stringify({
            httpMethod: event.httpMethod,
            headers: Object.keys(event.headers || {}),
            bodyLength: event.body ? event.body.length : 0,
            isBase64Encoded: event.isBase64Encoded
        }));
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message,
                type: error.constructor.name,
                // Nur in Development: Stack-Trace
                ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
            })
        };
    }
};

