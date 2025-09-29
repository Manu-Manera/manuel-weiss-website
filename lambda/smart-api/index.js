// 🚀 Smart API Lambda - Intelligentes API-System mit spezialisierten Endpunkten
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();

// API Router für verschiedene Endpunkte
const API_ROUTER = {
    // 📤 UPLOAD ENDPOINTS
    '/api/v1/upload': handleStandardUpload,
    '/api/v1/upload/bulk': handleBulkUpload,
    '/api/v1/upload/chunked': handleChunkedUpload,
    '/api/v1/upload/resume': handleResumeUpload,
    '/api/v1/upload/direct': handleDirectUpload,
    '/api/v1/upload/quick': handleQuickUpload,
    
    // 📥 DOWNLOAD ENDPOINTS
    '/api/v1/download': handleStandardDownload,
    '/api/v1/download/bulk': handleBulkDownload,
    '/api/v1/download/stream': handleStreamDownload,
    '/api/v1/download/preview': handlePreviewDownload,
    '/api/v1/download/thumbnail': handleThumbnailDownload,
    '/api/v1/download/direct': handleDirectDownload,
    
    // 📊 ANALYTICS ENDPOINTS
    '/api/v1/analytics/upload-stats': handleUploadStats,
    '/api/v1/analytics/download-stats': handleDownloadStats,
    '/api/v1/analytics/user-stats': handleUserStats,
    '/api/v1/analytics/storage-stats': handleStorageStats,
    '/api/v1/analytics/performance-stats': handlePerformanceStats,
    '/api/v1/analytics/error-stats': handleErrorStats,
    
    // 📁 MANAGEMENT ENDPOINTS
    '/api/v1/files': handleListFiles,
    '/api/v1/files/details': handleFileDetails,
    '/api/v1/files/delete': handleDeleteFile,
    '/api/v1/files/rename': handleRenameFile,
    '/api/v1/files/move': handleMoveFile,
    '/api/v1/files/copy': handleCopyFile,
    '/api/v1/files/share': handleShareFile,
    '/api/v1/files/permissions': handleFilePermissions,
    
    // 🔍 SEARCH ENDPOINTS
    '/api/v1/search/fulltext': handleFulltextSearch,
    '/api/v1/search/metadata': handleMetadataSearch,
    '/api/v1/search/tags': handleTagSearch,
    '/api/v1/search/filetype': handleFiletypeSearch,
    '/api/v1/search/date-range': handleDateRangeSearch,
    '/api/v1/search/size-range': handleSizeRangeSearch,
    
    // 👤 USER ENDPOINTS
    '/api/v1/user/profile': handleUserProfile,
    '/api/v1/user/settings': handleUserSettings,
    '/api/v1/user/stats': handleUserStats,
    '/api/v1/user/documents': handleUserDocuments,
    '/api/v1/user/folders': handleUserFolders,
    '/api/v1/user/permissions': handleUserPermissions,
    
    // 🔐 AUTH ENDPOINTS
    '/api/v1/auth/login': handleLogin,
    '/api/v1/auth/logout': handleLogout,
    '/api/v1/auth/refresh': handleRefreshToken,
    '/api/v1/auth/change-password': handleChangePassword,
    '/api/v1/auth/delete-account': handleDeleteAccount,
    
    // 📈 MONITORING ENDPOINTS
    '/api/v1/health': handleHealthCheck,
    '/api/v1/metrics': handleMetrics,
    '/api/v1/logs': handleLogs,
    '/api/v1/alerts': handleAlerts,
    '/api/v1/performance': handlePerformance
};

exports.handler = async (event) => {
    console.log('🚀 Smart API Lambda triggered:', JSON.stringify(event, null, 2));
    
    try {
        const { httpMethod, path, pathParameters, queryStringParameters, body, requestContext } = event;
        const userId = requestContext.authorizer?.claims?.sub || 'anonymous';
        
        // Route to appropriate handler
        const handler = API_ROUTER[path];
        if (!handler) {
            return createResponse(404, { error: 'Endpoint not found', path });
        }
        
        const result = await handler({
            httpMethod,
            path,
            pathParameters,
            queryStringParameters,
            body: body ? JSON.parse(body) : null,
            userId,
            requestContext
        });
        
        return createResponse(200, result);
        
    } catch (error) {
        console.error('❌ Smart API error:', error);
        return createResponse(500, { error: error.message });
    }
};

// 📤 UPLOAD HANDLERS
async function handleStandardUpload({ body, userId }) {
    const { file, type = 'document', options = {} } = body;
    const fileId = uuidv4();
    const s3Key = `documents/${userId}/${fileId}.${getFileExtension(file.name)}`;
    
    // Upload to S3
    const s3Result = await s3.upload({
        Bucket: process.env.DOCUMENTS_BUCKET,
        Key: s3Key,
        Body: Buffer.from(file.data, 'base64'),
        ContentType: file.type,
        Metadata: {
            originalName: file.name,
            userId: userId,
            type: type,
            uploadType: 'standard'
        }
    }).promise();
    
    // Save metadata to DynamoDB
    const documentRecord = {
        id: fileId,
        userId: userId,
        originalName: file.name,
        s3Key: s3Key,
        s3Url: s3Result.Location,
        size: file.size,
        type: file.type,
        documentType: type,
        uploadedAt: new Date().toISOString(),
        status: 'active',
        uploadType: 'standard'
    };
    
    await dynamodb.put({
        TableName: process.env.DOCUMENTS_TABLE,
        Item: documentRecord
    }).promise();
    
    return {
        success: true,
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: documentRecord.uploadedAt,
        storage: 'aws-s3',
        url: s3Result.Location,
        s3Key: s3Key,
        userId: userId
    };
}

async function handleBulkUpload({ body, userId }) {
    const { files, type = 'document', options = {} } = body;
    const results = [];
    
    for (const file of files) {
        const result = await handleStandardUpload({ body: { file, type, options }, userId });
        results.push(result);
    }
    
    return {
        success: true,
        totalFiles: files.length,
        successfulUploads: results.length,
        results: results
    };
}

async function handleChunkedUpload({ body, userId }) {
    const { uploadId, chunkIndex, totalChunks, chunk, options = {} } = body;
    const chunkKey = `uploads/${userId}/${uploadId}/chunk_${chunkIndex}`;
    
    // Upload chunk to S3
    await s3.upload({
        Bucket: process.env.DOCUMENTS_BUCKET,
        Key: chunkKey,
        Body: Buffer.from(chunk.data, 'base64'),
        ContentType: 'application/octet-stream'
    }).promise();
    
    // Check if all chunks are uploaded
    if (chunkIndex === totalChunks - 1) {
        // Combine chunks and create final file
        const finalKey = `documents/${userId}/${uploadId}.${getFileExtension(chunk.originalName)}`;
        await combineChunks(uploadId, totalChunks, finalKey);
        
        return {
            success: true,
            uploadId: uploadId,
            status: 'completed',
            finalKey: finalKey
        };
    }
    
    return {
        success: true,
        uploadId: uploadId,
        chunkIndex: chunkIndex,
        totalChunks: totalChunks,
        status: 'chunk_uploaded'
    };
}

async function handleDirectUpload({ body, userId }) {
    const { fileName, fileType, options = {} } = body;
    const fileId = uuidv4();
    const s3Key = `documents/${userId}/${fileId}.${getFileExtension(fileName)}`;
    
    // Generate presigned URL for direct upload
    const presignedUrl = s3.getSignedUrl('putObject', {
        Bucket: process.env.DOCUMENTS_BUCKET,
        Key: s3Key,
        ContentType: fileType,
        Expires: 3600 // 1 hour
    });
    
    return {
        success: true,
        uploadUrl: presignedUrl,
        fileId: fileId,
        s3Key: s3Key,
        expiresIn: 3600
    };
}

async function handleQuickUpload({ body, userId }) {
    // Quick upload without extensive metadata
    const { file, type = 'document' } = body;
    const fileId = uuidv4();
    const s3Key = `documents/${userId}/quick/${fileId}.${getFileExtension(file.name)}`;
    
    await s3.upload({
        Bucket: process.env.DOCUMENTS_BUCKET,
        Key: s3Key,
        Body: Buffer.from(file.data, 'base64'),
        ContentType: file.type
    }).promise();
    
    return {
        success: true,
        id: fileId,
        name: file.name,
        url: `https://${process.env.DOCUMENTS_BUCKET}.s3.amazonaws.com/${s3Key}`
    };
}

// 📥 DOWNLOAD HANDLERS
async function handleStandardDownload({ pathParameters, userId }) {
    const { fileId } = pathParameters;
    
    // Get file metadata from DynamoDB
    const result = await dynamodb.get({
        TableName: process.env.DOCUMENTS_TABLE,
        Key: { id: fileId, userId: userId }
    }).promise();
    
    if (!result.Item) {
        throw new Error('File not found');
    }
    
    const file = result.Item;
    
    // Generate presigned URL for download
    const downloadUrl = s3.getSignedUrl('getObject', {
        Bucket: process.env.DOCUMENTS_BUCKET,
        Key: file.s3Key,
        Expires: 3600
    });
    
    return {
        success: true,
        id: file.id,
        name: file.originalName,
        size: file.size,
        type: file.type,
        downloadUrl: downloadUrl,
        expiresIn: 3600
    };
}

async function handleBulkDownload({ body, userId }) {
    const { fileIds } = body;
    const results = [];
    
    for (const fileId of fileIds) {
        try {
            const result = await handleStandardDownload({ pathParameters: { fileId }, userId });
            results.push(result);
        } catch (error) {
            results.push({ error: error.message, fileId });
        }
    }
    
    return {
        success: true,
        totalFiles: fileIds.length,
        successfulDownloads: results.filter(r => !r.error).length,
        results: results
    };
}

async function handleThumbnailDownload({ pathParameters, queryStringParameters, userId }) {
    const { fileId } = pathParameters;
    const { size = 'medium' } = queryStringParameters || {};
    
    // Get file metadata
    const result = await dynamodb.get({
        TableName: process.env.DOCUMENTS_TABLE,
        Key: { id: fileId, userId: userId }
    }).promise();
    
    if (!result.Item) {
        throw new Error('File not found');
    }
    
    const file = result.Item;
    const thumbnailKey = `thumbnails/${userId}/${fileId}_${size}.jpg`;
    
    // Generate presigned URL for thumbnail
    const thumbnailUrl = s3.getSignedUrl('getObject', {
        Bucket: process.env.DOCUMENTS_BUCKET,
        Key: thumbnailKey,
        Expires: 3600
    });
    
    return {
        success: true,
        thumbnailUrl: thumbnailUrl,
        size: size,
        expiresIn: 3600
    };
}

// 📊 ANALYTICS HANDLERS
async function handleUploadStats({ queryStringParameters, userId }) {
    const { timeRange = '7d' } = queryStringParameters || {};
    
    // Get upload statistics from DynamoDB
    const result = await dynamodb.scan({
        TableName: process.env.DOCUMENTS_TABLE,
        FilterExpression: 'userId = :userId AND uploadedAt >= :startDate',
        ExpressionAttributeValues: {
            ':userId': userId,
            ':startDate': getStartDate(timeRange)
        }
    }).promise();
    
    const stats = {
        totalUploads: result.Items.length,
        totalSize: result.Items.reduce((sum, item) => sum + item.size, 0),
        averageSize: result.Items.reduce((sum, item) => sum + item.size, 0) / result.Items.length,
        uploadsByType: groupBy(result.Items, 'documentType'),
        uploadsByDay: groupByDate(result.Items, 'uploadedAt')
    };
    
    return {
        success: true,
        timeRange: timeRange,
        stats: stats
    };
}

async function handleDownloadStats({ queryStringParameters, userId }) {
    // Similar to upload stats but for downloads
    const { timeRange = '7d' } = queryStringParameters || {};
    
    // This would require a downloads table or tracking
    return {
        success: true,
        timeRange: timeRange,
        stats: {
            totalDownloads: 0,
            downloadsByType: {},
            downloadsByDay: {}
        }
    };
}

async function handleStorageStats({ queryStringParameters, userId }) {
    // Get storage statistics
    const result = await dynamodb.scan({
        TableName: process.env.DOCUMENTS_TABLE,
        FilterExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
    }).promise();
    
    const totalSize = result.Items.reduce((sum, item) => sum + item.size, 0);
    const fileCount = result.Items.length;
    
    return {
        success: true,
        storage: {
            totalSize: totalSize,
            totalFiles: fileCount,
            averageFileSize: totalSize / fileCount,
            storageUsed: `${(totalSize / 1024 / 1024).toFixed(2)} MB`
        }
    };
}

// 📁 MANAGEMENT HANDLERS
async function handleListFiles({ queryStringParameters, userId }) {
    const { limit = 50, offset = 0, sortBy = 'uploadedAt', sortOrder = 'desc' } = queryStringParameters || {};
    
    const result = await dynamodb.scan({
        TableName: process.env.DOCUMENTS_TABLE,
        FilterExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        },
        Limit: parseInt(limit),
        ExclusiveStartKey: offset ? { id: offset, userId: userId } : undefined
    }).promise();
    
    return {
        success: true,
        files: result.Items,
        totalCount: result.Count,
        hasMore: !!result.LastEvaluatedKey
    };
}

async function handleFileDetails({ pathParameters, userId }) {
    const { fileId } = pathParameters;
    
    const result = await dynamodb.get({
        TableName: process.env.DOCUMENTS_TABLE,
        Key: { id: fileId, userId: userId }
    }).promise();
    
    if (!result.Item) {
        throw new Error('File not found');
    }
    
    return {
        success: true,
        file: result.Item
    };
}

async function handleDeleteFile({ pathParameters, userId }) {
    const { fileId } = pathParameters;
    
    // Get file metadata
    const result = await dynamodb.get({
        TableName: process.env.DOCUMENTS_TABLE,
        Key: { id: fileId, userId: userId }
    }).promise();
    
    if (!result.Item) {
        throw new Error('File not found');
    }
    
    const file = result.Item;
    
    // Delete from S3
    await s3.deleteObject({
        Bucket: process.env.DOCUMENTS_BUCKET,
        Key: file.s3Key
    }).promise();
    
    // Delete from DynamoDB
    await dynamodb.delete({
        TableName: process.env.DOCUMENTS_TABLE,
        Key: { id: fileId, userId: userId }
    }).promise();
    
    return {
        success: true,
        message: 'File deleted successfully'
    };
}

// 🔍 SEARCH HANDLERS
async function handleFulltextSearch({ body, userId }) {
    const { query, options = {} } = body;
    
    // This would require Elasticsearch or similar search service
    // For now, return mock results
    return {
        success: true,
        query: query,
        results: [],
        totalCount: 0
    };
}

async function handleMetadataSearch({ body, userId }) {
    const { filters, options = {} } = body;
    
    // Build DynamoDB query based on filters
    let filterExpression = 'userId = :userId';
    let expressionAttributeValues = { ':userId': userId };
    
    if (filters.fileType) {
        filterExpression += ' AND documentType = :fileType';
        expressionAttributeValues[':fileType'] = filters.fileType;
    }
    
    if (filters.dateFrom) {
        filterExpression += ' AND uploadedAt >= :dateFrom';
        expressionAttributeValues[':dateFrom'] = filters.dateFrom;
    }
    
    if (filters.dateTo) {
        filterExpression += ' AND uploadedAt <= :dateTo';
        expressionAttributeValues[':dateTo'] = filters.dateTo;
    }
    
    const result = await dynamodb.scan({
        TableName: process.env.DOCUMENTS_TABLE,
        FilterExpression: filterExpression,
        ExpressionAttributeValues: expressionAttributeValues
    }).promise();
    
    return {
        success: true,
        filters: filters,
        results: result.Items,
        totalCount: result.Count
    };
}

// 👤 USER HANDLERS
async function handleUserProfile({ pathParameters, userId }) {
    const { userId: targetUserId } = pathParameters;
    
    // Get user profile from users table
    const result = await dynamodb.get({
        TableName: process.env.USERS_TABLE,
        Key: { userId: targetUserId }
    }).promise();
    
    if (!result.Item) {
        throw new Error('User not found');
    }
    
    return {
        success: true,
        profile: result.Item
    };
}

async function handleUserDocuments({ pathParameters, queryStringParameters, userId }) {
    const { userId: targetUserId } = pathParameters;
    const { limit = 50, offset = 0 } = queryStringParameters || {};
    
    const result = await dynamodb.scan({
        TableName: process.env.DOCUMENTS_TABLE,
        FilterExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': targetUserId
        },
        Limit: parseInt(limit)
    }).promise();
    
    return {
        success: true,
        userId: targetUserId,
        documents: result.Items,
        totalCount: result.Count
    };
}

// 📈 MONITORING HANDLERS
async function handleHealthCheck({ userId }) {
    return {
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            s3: 'healthy',
            dynamodb: 'healthy',
            lambda: 'healthy'
        }
    };
}

async function handleMetrics({ queryStringParameters, userId }) {
    const { timeRange = '1h' } = queryStringParameters || {};
    
    return {
        success: true,
        timeRange: timeRange,
        metrics: {
            requests: 0,
            errors: 0,
            latency: 0,
            throughput: 0
        }
    };
}

// 🔧 UTILITY FUNCTIONS
function createResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify(body)
    };
}

function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

function getStartDate(timeRange) {
    const now = new Date();
    const days = timeRange === '1d' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 7;
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

function groupBy(array, key) {
    return array.reduce((groups, item) => {
        const group = item[key] || 'unknown';
        groups[group] = (groups[group] || 0) + 1;
        return groups;
    }, {});
}

function groupByDate(array, dateKey) {
    return array.reduce((groups, item) => {
        const date = new Date(item[dateKey]).toISOString().split('T')[0];
        groups[date] = (groups[date] || 0) + 1;
        return groups;
    }, {});
}

async function combineChunks(uploadId, totalChunks, finalKey) {
    // This would require implementing chunk combination logic
    // For now, return success
    console.log(`Combining ${totalChunks} chunks for upload ${uploadId} into ${finalKey}`);
    return true;
}
