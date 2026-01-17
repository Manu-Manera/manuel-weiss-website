/**
 * AWS Lambda: Profile Image Upload
 * Generiert Pre-Signed URLs für direkten Upload zu S3
 * Unterstützt: Profilbilder, Dokumente (Zeugnisse), Lebensläufe
 */

const { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3 = new S3Client({ region: process.env.AWS_REGION || 'eu-central-1' });

const BUCKET_NAME = process.env.S3_BUCKET || 'mawps-profile-images';
const REGION = process.env.AWS_REGION || 'eu-central-1';
const URL_EXPIRY = 300; // 5 Minuten

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Content-Type': 'application/json'
};

// Erlaubte MIME-Types
const ALLOWED_TYPES = {
    profile: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    document: ['application/pdf', 'image/jpeg', 'image/png'],
    resume: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// Maximale Dateigrößen (in Bytes)
const MAX_SIZES = {
    profile: 5 * 1024 * 1024,    // 5 MB
    document: 10 * 1024 * 1024,  // 10 MB
    resume: 10 * 1024 * 1024     // 10 MB
};

exports.handler = async (event) => {
    console.log('Profile Image Upload Lambda:', event.httpMethod, event.path);
    
    // CORS Preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }

    try {
        const path = event.path || event.rawPath || '';
        
        // POST: Generate presigned URL for upload
        if (event.httpMethod === 'POST') {
            return await generateUploadUrl(event);
        }
        
        // GET: List user's files
        if (event.httpMethod === 'GET') {
            return await listUserFiles(event);
        }
        
        // DELETE: Delete a file
        if (event.httpMethod === 'DELETE') {
            return await deleteFile(event);
        }

        return {
            statusCode: 405,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Method not allowed' })
        };

    } catch (error) {
        console.error('Profile Image Upload Error:', error);
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

/**
 * Generiert eine Pre-Signed URL für den Upload
 */
async function generateUploadUrl(event) {
    const body = JSON.parse(event.body || '{}');
    const { contentType, userId, fileType = 'profile', fileName } = body;

    // Validierung
    if (!contentType) {
        return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'contentType ist erforderlich' })
        };
    }

    // User ID aus Header oder Body
    const user = userId 
        || event.headers?.['x-user-id'] 
        || event.headers?.['X-User-Id']
        || 'anonymous';

    // Prüfe erlaubten MIME-Type
    const allowedTypes = ALLOWED_TYPES[fileType] || ALLOWED_TYPES.profile;
    if (!allowedTypes.includes(contentType)) {
        return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ 
                error: `Nicht erlaubter Dateityp: ${contentType}`,
                allowed: allowedTypes
            })
        };
    }

    // Generiere eindeutigen Key
    const timestamp = Date.now();
    const extension = getExtension(contentType);
    const sanitizedName = fileName 
        ? fileName.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 50)
        : `file_${timestamp}`;
    
    const key = `${fileType}/${user}/${timestamp}-${sanitizedName}${extension}`;

    console.log('📤 Generating presigned URL:', {
        bucket: BUCKET_NAME,
        key,
        contentType,
        userId: user,
        fileType
    });

    // Pre-Signed URL generieren
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: URL_EXPIRY });
    const publicUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;

    console.log('✅ Presigned URL generated:', key);

    return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
            uploadUrl,
            publicUrl,
            key,
            bucket: BUCKET_NAME,
            region: REGION,
            expiresIn: URL_EXPIRY,
            maxSize: MAX_SIZES[fileType] || MAX_SIZES.profile
        })
    };
}

/**
 * Listet alle Dateien eines Benutzers auf
 */
async function listUserFiles(event) {
    const userId = event.queryStringParameters?.userId 
        || event.headers?.['x-user-id']
        || event.headers?.['X-User-Id'];
    
    const fileType = event.queryStringParameters?.fileType || 'profile';

    if (!userId || userId === 'anonymous') {
        return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'userId ist erforderlich' })
        };
    }

    const prefix = `${fileType}/${userId}/`;

    const result = await s3.send(new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: prefix,
        MaxKeys: 100
    }));

    const files = (result.Contents || []).map(item => ({
        key: item.Key,
        url: `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${item.Key}`,
        size: item.Size,
        lastModified: item.LastModified,
        fileName: item.Key.split('/').pop()
    }));

    return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ files, count: files.length })
    };
}

/**
 * Löscht eine Datei
 */
async function deleteFile(event) {
    const key = event.queryStringParameters?.key;
    const userId = event.headers?.['x-user-id'] || event.headers?.['X-User-Id'];

    if (!key) {
        return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'key ist erforderlich' })
        };
    }

    // Sicherheitscheck: User darf nur eigene Dateien löschen
    if (userId && !key.includes(`/${userId}/`)) {
        return {
            statusCode: 403,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Keine Berechtigung zum Löschen dieser Datei' })
        };
    }

    await s3.send(new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
    }));

    console.log('🗑️ File deleted:', key);

    return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, deleted: key })
    };
}

/**
 * Gibt die Dateierweiterung basierend auf dem MIME-Type zurück
 */
function getExtension(contentType) {
    const map = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp',
        'application/pdf': '.pdf',
        'application/msword': '.doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx'
    };
    return map[contentType] || '';
}
