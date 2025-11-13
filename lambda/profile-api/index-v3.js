// Profile API Lambda Function (CommonJS)

const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Initialize AWS services
const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

// Configuration
const TABLE_NAME = process.env.PROFILE_TABLE || 'mawps-user-profiles';
const BUCKET_NAME = process.env.S3_BUCKET || 'mawps-user-files-1760106396';

// JWT verification setup
const client = jwksClient({
    jwksUri: `https://cognito-idp.${process.env.AWS_REGION || 'eu-central-1'}.amazonaws.com/${process.env.USER_POOL_ID}/.well-known/jwks.json`
});

function getKey(header, callback) {
    client.getSigningKey(header.kid, function(err, key) {
        if (err) {
            callback(err);
        } else {
            const signingKey = key.publicKey || key.rsaPublicKey;
            callback(null, signingKey);
        }
    });
}

// Verify JWT token
const verifyToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, getKey, {
            algorithms: ['RS256']
        }, (err, decoded) => {
            if (err) {
                reject(err);
            } else {
                resolve(decoded);
            }
        });
    });
};

// Helper function to create response
const createResponse = (statusCode, body) => {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
        },
        body: JSON.stringify(body)
    };
};

// Lambda handler
exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return createResponse(200, {});
    }

    try {
        // Extract token from Authorization header
        const authHeader = event.headers.Authorization || event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error('No authorization token provided');
        }

        const token = authHeader.substring(7);
        const decodedJwt = await verifyToken(token);
        const userId = decodedJwt.sub;

        const path = event.path || event.rawPath || '';
        const method = event.httpMethod;

        // Route handling
        if (path.endsWith('/profile') && method === 'POST') {
            // Save profile data
            const profileData = JSON.parse(event.body || '{}');
            
            const item = {
                userId: userId,
                ...profileData,
                lastUpdated: new Date().toISOString()
            };

            await dynamodb.put({
                TableName: TABLE_NAME,
                Item: item
            }).promise();

            return createResponse(200, {
                message: 'Profile saved successfully',
                userId: userId
            });

        } else if (path.endsWith('/profile') && method === 'GET') {
            // Get profile data
            const result = await dynamodb.get({
                TableName: TABLE_NAME,
                Key: { userId: userId }
            }).promise();

            if (result.Item) {
                return createResponse(200, result.Item);
            } else {
                return createResponse(200, {
                    userId: userId,
                    message: 'No profile data found'
                });
            }

        } else if (path.endsWith('/profile/upload-url') && method === 'POST') {
            // Generate presigned URL for image upload
            const body = JSON.parse(event.body || '{}');
            const { fileName, contentType } = body;

            if (!fileName || !contentType) {
                return createResponse(400, { error: 'Missing fileName or contentType' });
            }

            const imageKey = `users/${userId}/profile-images/${Date.now()}-${fileName}`;
            
            const params = {
                Bucket: BUCKET_NAME,
                Key: imageKey,
                ContentType: contentType,
                Expires: 3600 // 1 hour
            };

            const uploadUrl = await s3.getSignedUrlPromise('putObject', params);

            return createResponse(200, {
                uploadUrl: uploadUrl,
                imageUrl: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageKey}`
            });

        } else {
            return createResponse(404, { error: 'Not found' });
        }

    } catch (error) {
        console.error('Error:', error);
        return createResponse(
            error.message === 'No authorization token provided' ? 401 : 500,
            { error: error.message || 'Internal server error' }
        );
    }
};
