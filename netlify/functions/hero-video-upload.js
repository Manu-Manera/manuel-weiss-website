/**
 * Netlify Function: Hero Video Upload
 * Generiert Pre-Signed URLs für direkten Upload zu AWS S3
 */

const AWS = require('aws-sdk');

// S3 Client initialisieren
const s3 = new AWS.S3({
    region: process.env.AWS_REGION || 'eu-central-1',
    // Credentials werden aus Environment Variables geladen
});

const BUCKET_NAME = process.env.AWS_S3_HERO_VIDEO_BUCKET || 'manuel-weiss-hero-videos';
const UPLOAD_EXPIRY = 60 * 5; // 5 Minuten für Upload-URL

exports.handler = async (event, context) => {
    // CORS Headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
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
        // POST: Generiere Pre-Signed URL für Upload
        if (event.httpMethod === 'POST') {
            const body = JSON.parse(event.body || '{}');
            const { fileName, contentType = 'video/mp4' } = body;

            if (!fileName) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'fileName is required' })
                };
            }

            // Generiere eindeutigen Key mit Timestamp
            const timestamp = Date.now();
            const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
            const key = `hero-videos/${timestamp}-${sanitizedFileName}`;

            // Generiere Pre-Signed URL für PUT
            // ACL entfernt, da moderne S3-Buckets oft ACL deaktiviert haben
            // Stattdessen sollte eine Bucket-Policy für öffentlichen Zugriff sorgen
            const params = {
                Bucket: BUCKET_NAME,
                Key: key,
                ContentType: contentType,
                Expires: UPLOAD_EXPIRY
                // ServerSideEncryption entfernt - könnte Probleme verursachen
            };

            const uploadUrl = s3.getSignedUrl('putObject', params);
            const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-central-1'}.amazonaws.com/${key}`;
            
            console.log('Generated pre-signed URL for:', key);
            console.log('Public URL will be:', publicUrl);
            console.log('Upload URL expires in:', UPLOAD_EXPIRY, 'seconds');

            return {
                statusCode: 200,
                headers,
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
            const params = {
                Bucket: BUCKET_NAME,
                Prefix: 'hero-videos/',
                MaxKeys: 10
            };

            const data = await s3.listObjectsV2(params).promise();
            const videos = (data.Contents || []).map(item => ({
                key: item.Key,
                url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-central-1'}.amazonaws.com/${item.Key}`,
                lastModified: item.LastModified,
                size: item.Size
            }));

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ videos })
            };
        }

        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };

    } catch (error) {
        console.error('Error in hero-video-upload:', error);
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

