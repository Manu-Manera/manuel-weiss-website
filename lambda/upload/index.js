const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    console.log('Upload Lambda triggered:', JSON.stringify(event, null, 2));
    
    try {
        // Parse the request
        const { file, type, userId } = JSON.parse(event.body);
        
        if (!file || !userId) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                    'Access-Control-Allow-Methods': 'POST,OPTIONS'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'File and userId are required'
                })
            };
        }

        // Generate unique file ID
        const fileId = uuidv4();
        const fileExtension = file.name.split('.').pop();
        const s3Key = `documents/${userId}/${fileId}.${fileExtension}`;

        // Upload to S3
        const uploadParams = {
            Bucket: process.env.DOCUMENTS_BUCKET,
            Key: s3Key,
            Body: Buffer.from(file.data, 'base64'),
            ContentType: file.type,
            Metadata: {
                originalName: file.name,
                userId: userId,
                type: type || 'document'
            }
        };

        const s3Result = await s3.upload(uploadParams).promise();
        console.log('S3 upload successful:', s3Result);

        // Save metadata to DynamoDB
        const documentRecord = {
            id: fileId,
            userId: userId,
            originalName: file.name,
            s3Key: s3Key,
            s3Url: s3Result.Location,
            size: file.size,
            type: file.type,
            documentType: type || 'document',
            uploadedAt: new Date().toISOString(),
            status: 'active'
        };

        await dynamodb.put({
            TableName: process.env.DOCUMENTS_TABLE,
            Item: documentRecord
        }).promise();

        console.log('DynamoDB record created:', documentRecord);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'POST,OPTIONS'
            },
            body: JSON.stringify({
                success: true,
                id: fileId,
                name: file.name,
                size: file.size,
                type: file.type,
                uploadedAt: documentRecord.uploadedAt,
                storage: 'aws-s3',
                url: s3Result.Location,
                s3Key: s3Key
            })
        };

    } catch (error) {
        console.error('Upload error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'POST,OPTIONS'
            },
            body: JSON.stringify({
                success: false,
                message: 'Upload failed',
                error: error.message
            })
        };
    }
};
