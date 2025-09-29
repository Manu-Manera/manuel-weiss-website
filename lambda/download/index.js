const AWS = require('aws-sdk');

const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    console.log('Download Lambda triggered:', JSON.stringify(event, null, 2));
    
    try {
        const { id } = event.pathParameters;
        const userId = event.requestContext.authorizer.claims.sub;
        
        if (!id) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                    'Access-Control-Allow-Methods': 'GET,OPTIONS'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'Document ID is required'
                })
            };
        }

        // Get document metadata from DynamoDB
        const documentResult = await dynamodb.get({
            TableName: process.env.DOCUMENTS_TABLE,
            Key: {
                id: id,
                userId: userId
            }
        }).promise();

        if (!documentResult.Item) {
            return {
                statusCode: 404,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                    'Access-Control-Allow-Methods': 'GET,OPTIONS'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'Document not found'
                })
            };
        }

        const document = documentResult.Item;

        // Generate presigned URL for download
        const downloadUrl = s3.getSignedUrl('getObject', {
            Bucket: process.env.DOCUMENTS_BUCKET,
            Key: document.s3Key,
            Expires: 3600 // 1 hour
        });

        console.log('Download URL generated for document:', id);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,OPTIONS'
            },
            body: JSON.stringify({
                success: true,
                id: document.id,
                name: document.originalName,
                size: document.size,
                type: document.type,
                uploadedAt: document.uploadedAt,
                downloadUrl: downloadUrl,
                expiresIn: 3600
            })
        };

    } catch (error) {
        console.error('Download error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,OPTIONS'
            },
            body: JSON.stringify({
                success: false,
                message: 'Download failed',
                error: error.message
            })
        };
    }
};
