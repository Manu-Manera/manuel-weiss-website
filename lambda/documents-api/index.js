const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const { v4: uuidv4 } = require('uuid');

// Initialize AWS services
const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

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

// DynamoDB table names
const DOCUMENTS_TABLE = process.env.DOCUMENTS_TABLE || 'mawps-user-documents';
const S3_BUCKET = process.env.S3_BUCKET || 'mawps-user-files-1760106396';

// Helper function to create response
const createResponse = (statusCode, body, headers = {}) => {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
            ...headers
        },
        body: JSON.stringify(body)
    };
};

// Helper function to verify JWT and extract user ID
const verifyAndGetUserId = async (event) => {
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('No valid authorization header');
    }
    
    const token = authHeader.substring(7);
    const decoded = await verifyToken(token);
    return decoded.sub; // user ID
};

// Main Lambda handler
exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return createResponse(200, {});
    }
    
    try {
        // Verify JWT and get user ID
        const userId = await verifyAndGetUserId(event);
        
        // Route based on path and method
        const path = event.path;
        const method = event.httpMethod;
        
        // POST /documents/upload-url - Get presigned URL for upload
        if (path === '/documents/upload-url' && method === 'POST') {
            const body = JSON.parse(event.body);
            const { fileName, fileType, fileSize, documentType, s3Key } = body;
            
            // Validate input
            if (!fileName || !fileType || !fileSize) {
                return createResponse(400, { error: 'Missing required fields' });
            }
            
            // Generate document ID
            const documentId = uuidv4();
            
            // Create S3 key if not provided
            const finalS3Key = s3Key || `users/${userId}/documents/${documentType || 'general'}/${Date.now()}-${fileName}`;
            
            // Generate presigned URL for upload
            const params = {
                Bucket: S3_BUCKET,
                Key: finalS3Key,
                ContentType: fileType,
                Expires: 3600, // 1 hour
                Metadata: {
                    userId: userId,
                    documentId: documentId,
                    documentType: documentType || 'general'
                }
            };
            
            const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
            
            return createResponse(200, {
                uploadUrl,
                documentId,
                s3Key: finalS3Key
            });
        }
        
        // POST /documents - Save document metadata
        if (path === '/documents' && method === 'POST') {
            const documentData = JSON.parse(event.body);
            
            // Ensure user owns the document
            documentData.userId = userId;
            
            // Add timestamps
            if (!documentData.uploadedAt) {
                documentData.uploadedAt = new Date().toISOString();
            }
            documentData.lastModified = new Date().toISOString();
            
            // Save to DynamoDB
            const item = {
                userId: userId,
                documentId: documentData.documentId,
                fileName: documentData.fileName,
                fileType: documentData.fileType,
                fileSize: documentData.fileSize,
                documentType: documentData.documentType || 'general',
                s3Key: documentData.s3Key,
                uploadedAt: documentData.uploadedAt,
                lastModified: documentData.lastModified,
                metadata: documentData.metadata || {}
            };
            
            await dynamodb.put({
                TableName: DOCUMENTS_TABLE,
                Item: item
            }).promise();
            
            return createResponse(200, documentData);
        }
        
        // GET /documents - List user documents
        if (path === '/documents' && method === 'GET') {
            const result = await dynamodb.query({
                TableName: DOCUMENTS_TABLE,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId
                }
            }).promise();
            
            const documents = result.Items || [];
            
            // Sort by upload date (newest first)
            documents.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
            
            return createResponse(200, documents);
        }
        
        // GET /documents/{documentId}/download-url - Get presigned URL for download
        if (path.match(/^\/documents\/[^\/]+\/download-url$/) && method === 'GET') {
            const documentId = path.split('/')[2];
            
            // Get document metadata
            const result = await dynamodb.get({
                TableName: DOCUMENTS_TABLE,
                Key: {
                    userId: userId,
                    documentId: documentId
                }
            }).promise();
            
            if (!result.Item) {
                return createResponse(404, { error: 'Document not found' });
            }
            
            // Generate presigned URL for download
            const downloadUrl = await s3.getSignedUrlPromise('getObject', {
                Bucket: S3_BUCKET,
                Key: result.Item.s3Key,
                Expires: 3600 // 1 hour
            });
            
            return createResponse(200, { downloadUrl });
        }
        
        // DELETE /documents/{documentId} - Delete document
        if (path.match(/^\/documents\/[^\/]+$/) && method === 'DELETE') {
            const documentId = path.split('/')[2];
            
            // Get document metadata first
            const result = await dynamodb.get({
                TableName: DOCUMENTS_TABLE,
                Key: {
                    userId: userId,
                    documentId: documentId
                }
            }).promise();
            
            if (!result.Item) {
                return createResponse(404, { error: 'Document not found' });
            }
            
            // Delete from S3
            await s3.deleteObject({
                Bucket: S3_BUCKET,
                Key: result.Item.s3Key
            }).promise();
            
            // Delete from DynamoDB
            await dynamodb.delete({
                TableName: DOCUMENTS_TABLE,
                Key: {
                    userId: userId,
                    documentId: documentId
                }
            }).promise();
            
            return createResponse(200, { success: true });
        }
        
        // GET /documents/{documentId} - Get single document metadata
        if (path.match(/^\/documents\/[^\/]+$/) && method === 'GET') {
            const documentId = path.split('/')[2];
            
            const result = await dynamodb.get({
                TableName: DOCUMENTS_TABLE,
                Key: {
                    userId: userId,
                    documentId: documentId
                }
            }).promise();
            
            if (!result.Item) {
                return createResponse(404, { error: 'Document not found' });
            }
            
            return createResponse(200, result.Item);
        }
        
        return createResponse(404, { error: 'Not found' });
        
    } catch (error) {
        console.error('Error:', error);
        
        if (error.message === 'No valid authorization header' || error.message.includes('jwt')) {
            return createResponse(401, { error: 'Unauthorized' });
        }
        
        return createResponse(500, { error: 'Internal server error' });
    }
};
