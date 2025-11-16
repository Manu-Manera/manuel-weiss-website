/**
 * AWS Lambda Function for User Profile API
 * Handles profile CRUD operations with DynamoDB
 */

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

const TABLE_NAME = process.env.PROFILE_TABLE || 'mawps-user-profiles';
const BUCKET_NAME = process.env.PROFILE_IMAGES_BUCKET || 'mawps-profile-images';
const ALLOWED_ORIGINS = [
    'https://mawps.netlify.app',
    'https://www.manuel-weiss.ch',
    'https://manuel-weiss.ch',
    'http://localhost:3000'
];

// Helper function to create CORS headers
const getCORSHeaders = (origin) => {
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS'
    };
};

// Helper function to verify JWT token
const verifyToken = (event) => {
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('No valid authorization header');
    }
    
    const token = authHeader.substring(7);
    // In production, you should verify the JWT token with AWS Cognito
    // For now, we'll decode it to get the user ID
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return {
        userId: payload.sub,
        email: payload.email
    };
};

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    const origin = event.headers.origin || event.headers.Origin;
    const headers = getCORSHeaders(origin);
    
    // Handle OPTIONS request for CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }
    
    try {
        const path = event.path || event.rawPath || '';
        const method = event.httpMethod || event.requestContext?.http?.method;
        
        // Website images endpoints don't require authentication
        let user = null;
        if (!path.includes('/website-images')) {
            user = verifyToken(event);
            console.log('Authenticated user:', user);
        }
        
        // Route based on HTTP method and path
        if (method === 'GET' && path.includes('/profile/')) {
            // Get user profile
            const userId = path.split('/').pop() || user.userId;
            
            // Ensure users can only access their own profile
            if (userId !== user.userId) {
                return {
                    statusCode: 403,
                    headers,
                    body: JSON.stringify({ error: 'Access denied' })
                };
            }
            
            const params = {
                TableName: TABLE_NAME,
                Key: { userId }
            };
            
            const result = await dynamoDB.get(params).promise();
            
            return {
                statusCode: result.Item ? 200 : 404,
                headers,
                body: JSON.stringify(result.Item || { message: 'Profile not found' })
            };
            
        } else if (method === 'PUT' && path.includes('/profile')) {
            // Update user profile
            const body = JSON.parse(event.body);
            
            // Ensure userId matches authenticated user
            body.userId = user.userId;
            body.updatedAt = new Date().toISOString();
            
            // Clean up undefined values
            Object.keys(body).forEach(key => {
                if (body[key] === undefined || body[key] === '') {
                    delete body[key];
                }
            });
            
            const params = {
                TableName: TABLE_NAME,
                Item: body
            };
            
            await dynamoDB.put(params).promise();
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: true, 
                    message: 'Profile updated successfully' 
                })
            };
            
        } else if (method === 'POST' && path.includes('/profile/upload-url')) {
            // Generate presigned URL for S3 upload
            const body = JSON.parse(event.body);
            const { fileName, fileType } = body;
            
            if (!fileName || !fileType) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Missing fileName or fileType' })
                };
            }
            
            const key = `profile-images/${user.userId}/avatar-${Date.now()}.${fileName.split('.').pop()}`;
            
            const params = {
                Bucket: BUCKET_NAME,
                Key: key,
                Expires: 300, // 5 minutes
                ContentType: fileType,
                ACL: 'public-read'
            };
            
            const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
            const imageUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ uploadUrl, imageUrl })
            };
            
        } else if (method === 'DELETE' && path.includes('/profile/image')) {
            // Delete profile image
            const params = {
                TableName: TABLE_NAME,
                Key: { userId: user.userId },
                UpdateExpression: 'REMOVE profileImageUrl',
                ReturnValues: 'ALL_NEW'
            };
            
            const result = await dynamoDB.update(params).promise();
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: true, 
                    message: 'Profile image removed' 
                })
            };
            
        } else if (method === 'POST' && path.includes('/website-images')) {
            // Save website images (owner only, no auth required for public website)
            const body = JSON.parse(event.body);
            console.log('Saving website images:', body);
            
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
            console.log('✅ Website images saved to DynamoDB');
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: true, 
                    message: 'Website images saved successfully',
                    data: item
                })
            };
            
        } else if (method === 'GET' && path.includes('/website-images/')) {
            // Get website images (owner only, no auth required)
            const userId = path.split('/').pop() || 'owner';
            
            if (userId !== 'owner') {
                return {
                    statusCode: 403,
                    headers,
                    body: JSON.stringify({ error: 'Access denied' })
                };
            }
            
            const params = {
                TableName: TABLE_NAME,
                Key: { userId: 'owner' }
            };
            
            const result = await dynamoDB.get(params).promise();
            
            if (result.Item && result.Item.type === 'website-images') {
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        userId: result.Item.userId,
                        profileImageDefault: result.Item.profileImageDefault || null,
                        profileImageHover: result.Item.profileImageHover || null,
                        updatedAt: result.Item.updatedAt
                    })
                };
            } else {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ message: 'No website images found' })
                };
            }
            
        } else {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Route not found' })
            };
        }
        
    } catch (error) {
        console.error('Error:', error);
        
        const statusCode = error.message === 'No valid authorization header' ? 401 : 500;
        
        return {
            statusCode,
            headers,
            body: JSON.stringify({ 
                error: error.message || 'Internal server error' 
            })
        };
    }
};
