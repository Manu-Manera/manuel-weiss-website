/**
 * Netlify Function: User Data Storage
 * Speichert ALLE Benutzerdaten in DynamoDB:
 * - Profildaten
 * - Lebensläufe
 * - Zeugnisse/Dokumente
 * - Anschreiben
 * - Bewerbungen
 */

const { DynamoDBClient, PutItemCommand, GetItemCommand, UpdateItemCommand, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

// AWS Configuration
const awsRegion = process.env.NETLIFY_AWS_REGION || process.env.AWS_REGION || 'eu-central-1';
const accessKeyId = process.env.NETLIFY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.NETLIFY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

const dynamoDB = new DynamoDBClient({
    region: awsRegion,
    credentials: accessKeyId && secretAccessKey ? {
        accessKeyId,
        secretAccessKey
    } : undefined
});

const TABLE_NAME = process.env.USER_DATA_TABLE || 'mawps-user-data';

// CORS Headers
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
};

/**
 * Extract user ID from JWT token
 */
function getUserIdFromToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    
    try {
        const token = authHeader.substring(7);
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        return payload.sub || payload.username || payload.email;
    } catch (error) {
        console.error('Token parse error:', error);
        return null;
    }
}

/**
 * Get user email from token
 */
function getUserEmailFromToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    
    try {
        const token = authHeader.substring(7);
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        return payload.email;
    } catch (error) {
        return null;
    }
}

exports.handler = async (event) => {
    console.log('User Data Function:', event.httpMethod, event.path);
    
    // CORS Preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }
    
    try {
        // Check AWS credentials
        if (!accessKeyId || !secretAccessKey) {
            console.error('AWS credentials missing');
            return {
                statusCode: 500,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Server configuration error' })
            };
        }
        
        // Get user ID from token
        const authHeader = event.headers.authorization || event.headers.Authorization;
        const userId = getUserIdFromToken(authHeader);
        const userEmail = getUserEmailFromToken(authHeader);
        
        if (!userId) {
            return {
                statusCode: 401,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Nicht autorisiert - Bitte anmelden' })
            };
        }
        
        const path = event.path || '';
        const { httpMethod } = event;
        
        // Route: /user-data/profile - Profildaten
        if (path.includes('/profile')) {
            return await handleProfile(userId, userEmail, httpMethod, event);
        }
        
        // Route: /user-data/resumes - Lebensläufe
        if (path.includes('/resumes')) {
            return await handleResumes(userId, httpMethod, event);
        }
        
        // Route: /user-data/documents - Dokumente (Zeugnisse, etc.)
        if (path.includes('/documents')) {
            return await handleDocuments(userId, httpMethod, event);
        }
        
        // Route: /user-data/cover-letters - Anschreiben
        if (path.includes('/cover-letters')) {
            return await handleCoverLetters(userId, httpMethod, event);
        }
        
        // Route: /user-data/applications - Bewerbungen
        if (path.includes('/applications')) {
            return await handleApplications(userId, httpMethod, event);
        }
        
        // Route: /user-data - Alle Daten
        if (httpMethod === 'GET') {
            return await getAllUserData(userId);
        }
        
        return {
            statusCode: 404,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Route not found' })
        };
        
    } catch (error) {
        console.error('User Data Error:', error);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Interner Serverfehler', message: error.message })
        };
    }
};

/**
 * Get all user data
 */
async function getAllUserData(userId) {
    try {
        const result = await dynamoDB.send(new GetItemCommand({
            TableName: TABLE_NAME,
            Key: marshall({ pk: `USER#${userId}`, sk: 'DATA' })
        }));
        
        if (!result.Item) {
            return {
                statusCode: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify({
                    profile: null,
                    resumes: [],
                    documents: [],
                    coverLetters: [],
                    applications: []
                })
            };
        }
        
        const data = unmarshall(result.Item);
        
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                profile: data.profile || null,
                resumes: data.resumes || [],
                documents: data.documents || [],
                coverLetters: data.coverLetters || [],
                applications: data.applications || [],
                updatedAt: data.updatedAt
            })
        };
    } catch (error) {
        console.error('Get all user data error:', error);
        throw error;
    }
}

/**
 * Handle profile data
 */
async function handleProfile(userId, userEmail, method, event) {
    if (method === 'GET') {
        const result = await dynamoDB.send(new GetItemCommand({
            TableName: TABLE_NAME,
            Key: marshall({ pk: `USER#${userId}`, sk: 'DATA' })
        }));
        
        const data = result.Item ? unmarshall(result.Item) : {};
        
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify(data.profile || { email: userEmail })
        };
    }
    
    if (method === 'PUT' || method === 'POST') {
        const body = JSON.parse(event.body || '{}');
        const now = new Date().toISOString();
        
        // Get existing data
        const existingResult = await dynamoDB.send(new GetItemCommand({
            TableName: TABLE_NAME,
            Key: marshall({ pk: `USER#${userId}`, sk: 'DATA' })
        }));
        
        const existingData = existingResult.Item ? unmarshall(existingResult.Item) : {};
        
        // Update profile
        const updatedData = {
            pk: `USER#${userId}`,
            sk: 'DATA',
            ...existingData,
            profile: {
                ...existingData.profile,
                ...body,
                email: body.email || userEmail,
                updatedAt: now
            },
            updatedAt: now
        };
        
        await dynamoDB.send(new PutItemCommand({
            TableName: TABLE_NAME,
            Item: marshall(updatedData, { removeUndefinedValues: true })
        }));
        
        console.log('✅ Profile saved to AWS');
        
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: true, profile: updatedData.profile })
        };
    }
    
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
}

/**
 * Handle resumes
 */
async function handleResumes(userId, method, event) {
    const existingResult = await dynamoDB.send(new GetItemCommand({
        TableName: TABLE_NAME,
        Key: marshall({ pk: `USER#${userId}`, sk: 'DATA' })
    }));
    
    const existingData = existingResult.Item ? unmarshall(existingResult.Item) : {};
    const resumes = existingData.resumes || [];
    
    if (method === 'GET') {
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify(resumes)
        };
    }
    
    if (method === 'POST') {
        const body = JSON.parse(event.body || '{}');
        const now = new Date().toISOString();
        
        // Add new resume
        const newResume = {
            id: body.id || `resume_${Date.now()}`,
            ...body,
            createdAt: body.createdAt || now,
            updatedAt: now
        };
        
        // Check if updating existing
        const existingIndex = resumes.findIndex(r => r.id === newResume.id);
        if (existingIndex >= 0) {
            resumes[existingIndex] = newResume;
        } else {
            resumes.push(newResume);
        }
        
        // Save
        const updatedData = {
            pk: `USER#${userId}`,
            sk: 'DATA',
            ...existingData,
            resumes,
            updatedAt: now
        };
        
        await dynamoDB.send(new PutItemCommand({
            TableName: TABLE_NAME,
            Item: marshall(updatedData, { removeUndefinedValues: true })
        }));
        
        console.log('✅ Resume saved to AWS');
        
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: true, resume: newResume, resumes })
        };
    }
    
    if (method === 'DELETE') {
        const params = event.queryStringParameters || {};
        const resumeId = params.id;
        
        if (!resumeId) {
            return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Resume ID required' }) };
        }
        
        const filteredResumes = resumes.filter(r => r.id !== resumeId);
        
        const updatedData = {
            pk: `USER#${userId}`,
            sk: 'DATA',
            ...existingData,
            resumes: filteredResumes,
            updatedAt: new Date().toISOString()
        };
        
        await dynamoDB.send(new PutItemCommand({
            TableName: TABLE_NAME,
            Item: marshall(updatedData, { removeUndefinedValues: true })
        }));
        
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: true })
        };
    }
    
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
}

/**
 * Handle documents (certificates, etc.)
 */
async function handleDocuments(userId, method, event) {
    const existingResult = await dynamoDB.send(new GetItemCommand({
        TableName: TABLE_NAME,
        Key: marshall({ pk: `USER#${userId}`, sk: 'DATA' })
    }));
    
    const existingData = existingResult.Item ? unmarshall(existingResult.Item) : {};
    const documents = existingData.documents || [];
    
    if (method === 'GET') {
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify(documents)
        };
    }
    
    if (method === 'POST') {
        const body = JSON.parse(event.body || '{}');
        const now = new Date().toISOString();
        
        const newDocument = {
            id: body.id || `doc_${Date.now()}`,
            ...body,
            createdAt: body.createdAt || now,
            updatedAt: now
        };
        
        // Check if updating existing
        const existingIndex = documents.findIndex(d => d.id === newDocument.id);
        if (existingIndex >= 0) {
            documents[existingIndex] = newDocument;
        } else {
            documents.push(newDocument);
        }
        
        const updatedData = {
            pk: `USER#${userId}`,
            sk: 'DATA',
            ...existingData,
            documents,
            updatedAt: now
        };
        
        await dynamoDB.send(new PutItemCommand({
            TableName: TABLE_NAME,
            Item: marshall(updatedData, { removeUndefinedValues: true })
        }));
        
        console.log('✅ Document saved to AWS');
        
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: true, document: newDocument, documents })
        };
    }
    
    if (method === 'DELETE') {
        const params = event.queryStringParameters || {};
        const docId = params.id;
        
        if (!docId) {
            return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Document ID required' }) };
        }
        
        const filteredDocs = documents.filter(d => d.id !== docId);
        
        const updatedData = {
            pk: `USER#${userId}`,
            sk: 'DATA',
            ...existingData,
            documents: filteredDocs,
            updatedAt: new Date().toISOString()
        };
        
        await dynamoDB.send(new PutItemCommand({
            TableName: TABLE_NAME,
            Item: marshall(updatedData, { removeUndefinedValues: true })
        }));
        
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: true })
        };
    }
    
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
}

/**
 * Handle cover letters
 */
async function handleCoverLetters(userId, method, event) {
    const existingResult = await dynamoDB.send(new GetItemCommand({
        TableName: TABLE_NAME,
        Key: marshall({ pk: `USER#${userId}`, sk: 'DATA' })
    }));
    
    const existingData = existingResult.Item ? unmarshall(existingResult.Item) : {};
    const coverLetters = existingData.coverLetters || [];
    
    if (method === 'GET') {
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify(coverLetters)
        };
    }
    
    if (method === 'POST') {
        const body = JSON.parse(event.body || '{}');
        const now = new Date().toISOString();
        
        const newCoverLetter = {
            id: body.id || `cl_${Date.now()}`,
            ...body,
            createdAt: body.createdAt || now,
            updatedAt: now
        };
        
        // Check if updating existing
        const existingIndex = coverLetters.findIndex(cl => cl.id === newCoverLetter.id);
        if (existingIndex >= 0) {
            coverLetters[existingIndex] = newCoverLetter;
        } else {
            coverLetters.push(newCoverLetter);
        }
        
        const updatedData = {
            pk: `USER#${userId}`,
            sk: 'DATA',
            ...existingData,
            coverLetters,
            updatedAt: now
        };
        
        await dynamoDB.send(new PutItemCommand({
            TableName: TABLE_NAME,
            Item: marshall(updatedData, { removeUndefinedValues: true })
        }));
        
        console.log('✅ Cover letter saved to AWS');
        
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: true, coverLetter: newCoverLetter, coverLetters })
        };
    }
    
    if (method === 'DELETE') {
        const params = event.queryStringParameters || {};
        const clId = params.id;
        
        if (!clId) {
            return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Cover letter ID required' }) };
        }
        
        const filteredCL = coverLetters.filter(cl => cl.id !== clId);
        
        const updatedData = {
            pk: `USER#${userId}`,
            sk: 'DATA',
            ...existingData,
            coverLetters: filteredCL,
            updatedAt: new Date().toISOString()
        };
        
        await dynamoDB.send(new PutItemCommand({
            TableName: TABLE_NAME,
            Item: marshall(updatedData, { removeUndefinedValues: true })
        }));
        
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: true })
        };
    }
    
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
}

/**
 * Handle applications (job applications tracking)
 */
async function handleApplications(userId, method, event) {
    const existingResult = await dynamoDB.send(new GetItemCommand({
        TableName: TABLE_NAME,
        Key: marshall({ pk: `USER#${userId}`, sk: 'DATA' })
    }));
    
    const existingData = existingResult.Item ? unmarshall(existingResult.Item) : {};
    const applications = existingData.applications || [];
    
    if (method === 'GET') {
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify(applications)
        };
    }
    
    if (method === 'POST') {
        const body = JSON.parse(event.body || '{}');
        const now = new Date().toISOString();
        
        const newApplication = {
            id: body.id || `app_${Date.now()}`,
            ...body,
            createdAt: body.createdAt || now,
            updatedAt: now
        };
        
        const existingIndex = applications.findIndex(a => a.id === newApplication.id);
        if (existingIndex >= 0) {
            applications[existingIndex] = newApplication;
        } else {
            applications.push(newApplication);
        }
        
        const updatedData = {
            pk: `USER#${userId}`,
            sk: 'DATA',
            ...existingData,
            applications,
            updatedAt: now
        };
        
        await dynamoDB.send(new PutItemCommand({
            TableName: TABLE_NAME,
            Item: marshall(updatedData, { removeUndefinedValues: true })
        }));
        
        console.log('✅ Application saved to AWS');
        
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: true, application: newApplication, applications })
        };
    }
    
    if (method === 'DELETE') {
        const params = event.queryStringParameters || {};
        const appId = params.id;
        
        if (!appId) {
            return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Application ID required' }) };
        }
        
        const filteredApps = applications.filter(a => a.id !== appId);
        
        const updatedData = {
            pk: `USER#${userId}`,
            sk: 'DATA',
            ...existingData,
            applications: filteredApps,
            updatedAt: new Date().toISOString()
        };
        
        await dynamoDB.send(new PutItemCommand({
            TableName: TABLE_NAME,
            Item: marshall(updatedData, { removeUndefinedValues: true })
        }));
        
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: true })
        };
    }
    
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
}
