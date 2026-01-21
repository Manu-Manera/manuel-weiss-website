/**
 * AWS Lambda: Hero Video Upload Direct
 * Migrated from Netlify Function
 * Lädt Videos direkt über den Server zu S3 hoch (umgeht CORS-Probleme)
 * 
 * 🔒 ALLE Endpoints erfordern Authentifizierung (Admin-only)
 * 
 * Diese Function macht 3 Dinge:
 * 1. Base64 Video-Daten decodieren
 * 2. Video zu S3 hochladen
 * 3. Video-URL in DynamoDB speichern (automatisch!)
 */

const { S3Client, PutObjectCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');

// AWS Lambda verwendet automatisch IAM Role
const s3 = new S3Client({ region: process.env.AWS_REGION || 'eu-central-1' });
const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });

const VIDEO_BUCKET = process.env.HERO_VIDEO_BUCKET || 'manuel-weiss-hero-videos';
const SETTINGS_TABLE = process.env.SETTINGS_TABLE || 'manuel-weiss-settings';
const SETTINGS_KEY = 'hero-video-url';
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
};

// Auth Helper Functions
function authUser(event) {
    const token = (event.headers?.authorization || event.headers?.Authorization || '').replace(/^Bearer\s+/, '');
    if (!token) {
        console.error('❌ No token provided in headers');
        throw new Error('Unauthorized - No token provided');
    }
    
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid token format');
        }
        
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        console.log('✅ Token decoded successfully, user:', payload.email || payload['cognito:username']);
        
        return { 
            userId: payload.sub, 
            email: payload.email || payload['cognito:username'],
            username: payload['cognito:username'] || payload.email
        };
    } catch (error) {
        console.error('❌ Token decode error:', error.message);
        throw new Error('Unauthorized - Invalid token: ' + error.message);
    }
}

async function isAdmin(userId, email) {
    const adminEmails = [
        'manuel@manuel-weiss.com',
        'admin@manuel-weiss.com',
        'manumanera@gmail.com',
        'weiss-manuel@gmx.de'
    ];
    
    const isInList = adminEmails.includes(email?.toLowerCase());
    console.log(`🔐 Admin check for ${email}: ${isInList ? '✅ Admin' : '❌ Not Admin'}`);
    
    return isInList;
}

exports.handler = async (event) => {
    // CORS Preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }

    try {
        // 🔒 Auth ERFORDERLICH für ALLE Endpoints
        let user;
        try {
            user = authUser(event);
            if (!(await isAdmin(user.userId, user.email))) {
                return {
                    statusCode: 403,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({ error: 'Admin access required' })
                };
            }
        } catch (e) {
            return {
                statusCode: 401,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Unauthorized', message: e.message || 'Authentication required' })
            };
        }

        if (event.httpMethod !== 'POST') {
            return {
                statusCode: 405,
                headers: CORS_HEADERS,
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
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Invalid JSON in request body', details: parseError.message })
            };
        }

        const { fileData, fileName, contentType: fileContentType } = requestBody;

        if (!fileData || !fileName) {
            console.error('Missing required fields:', { hasFileData: !!fileData, hasFileName: !!fileName });
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
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
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Invalid base64 data', details: decodeError.message })
            };
        }
        
        const fileSize = fileBuffer.length;
        console.log('Decoded file size:', fileSize, 'bytes');

        // Validate file size
        if (fileSize > MAX_FILE_SIZE) {
            return {
                statusCode: 413,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` })
            };
        }

        // Generate unique key
        const timestamp = Date.now();
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const key = `hero-videos/${timestamp}-${sanitizedFileName}`;

        console.log('Uploading to S3:', {
            bucket: VIDEO_BUCKET,
            key: key,
            size: fileSize,
            contentType: fileContentType || 'video/mp4'
        });

        // Upload to S3
        const uploadParams = {
            Bucket: VIDEO_BUCKET,
            Key: key,
            Body: fileBuffer,
            ContentType: fileContentType || 'video/mp4'
        };

        let s3Result;
        try {
            // Prüfe zuerst, ob der Bucket existiert
            try {
                await s3.send(new HeadBucketCommand({ Bucket: VIDEO_BUCKET }));
                console.log('✅ Bucket exists:', VIDEO_BUCKET);
            } catch (bucketError) {
                console.error('❌ Bucket check failed:', bucketError);
                if (bucketError.name === 'NotFound' || bucketError.$metadata?.httpStatusCode === 404) {
                    return {
                        statusCode: 500,
                        headers: CORS_HEADERS,
                        body: JSON.stringify({ 
                            error: 'S3 bucket not found',
                            message: `Bucket "${VIDEO_BUCKET}" does not exist. Please create it first.`,
                            bucket: VIDEO_BUCKET
                        })
                    };
                }
                console.warn('⚠️ Bucket check failed, but continuing with upload:', bucketError.message);
            }

            console.log('Starting S3 upload...');
            s3Result = await s3.send(new PutObjectCommand(uploadParams));
            console.log('✅ S3 upload successful');
        } catch (s3Error) {
            console.error('❌ S3 upload error:', s3Error);
            
            let errorMessage = 'S3 upload failed';
            if (s3Error.name === 'AccessDenied' || s3Error.$metadata?.httpStatusCode === 403) {
                errorMessage = 'Access denied to S3 bucket. Please check IAM permissions.';
            } else if (s3Error.name === 'NoSuchBucket' || s3Error.$metadata?.httpStatusCode === 404) {
                errorMessage = `S3 bucket "${VIDEO_BUCKET}" not found. Please create it first.`;
            } else {
                errorMessage = s3Error.message || 'Unknown S3 error';
            }
            
            return {
                statusCode: 500,
                headers: CORS_HEADERS,
                body: JSON.stringify({ 
                    error: 'S3 upload failed', 
                    message: errorMessage
                })
            };
        }

        // Generate public URL
        const region = process.env.AWS_REGION || 'eu-central-1';
        const publicUrl = `https://${VIDEO_BUCKET}.s3.${region}.amazonaws.com/${key}`;

        // Save URL to DynamoDB (WICHTIG!)
        try {
            await dynamoDB.send(new PutItemCommand({
                TableName: SETTINGS_TABLE,
                Item: marshall({
                    settingKey: SETTINGS_KEY,
                    settingValue: publicUrl,
                    updatedAt: new Date().toISOString()
                })
            }));
            console.log('✅ Settings saved to DynamoDB');
        } catch (dbError) {
            console.error('❌ DynamoDB save error:', dbError);
            // DynamoDB-Speicherung ist kritisch - wir müssen den Fehler zurückgeben
            return {
                statusCode: 500,
                headers: CORS_HEADERS,
                body: JSON.stringify({
                    error: 'Failed to save video URL to settings',
                    message: dbError.message,
                    videoUrl: publicUrl // Gebe URL trotzdem zurück, falls Frontend sie direkt verwenden will
                })
            };
        }

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                success: true,
                videoUrl: publicUrl,
                key: key,
                size: fileSize
            })
        };

    } catch (error) {
        console.error('❌ Error in hero-video-upload-direct:', error);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};
