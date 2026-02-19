/**
 * AWS Lambda: Hero Video Upload
 * AWS Lambda
 * Generiert Pre-Signed URLs für direkten Upload zu AWS S3
 * 
 * 🔒 ALLE Endpoints erfordern Authentifizierung (Admin-only)
 */

const { S3Client, PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// AWS Lambda verwendet automatisch IAM Role
const s3 = new S3Client({ region: process.env.AWS_REGION || 'eu-central-1' });

const VIDEO_BUCKET = process.env.HERO_VIDEO_BUCKET || 'manuel-weiss-hero-videos';
const UPLOAD_EXPIRY = 60 * 5; // 5 Minuten

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
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

        // POST: Generiere Pre-Signed URL für Upload
        if (event.httpMethod === 'POST') {
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

            console.log('✅ Generated pre-signed URL for:', key);

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

        // GET: Liste vorhandene Videos (optional)
        if (event.httpMethod === 'GET') {
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

        return {
            statusCode: 405,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Method not allowed' })
        };

    } catch (error) {
        console.error('❌ Error in hero-video-upload:', error);
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
