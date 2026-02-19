/**
 * AWS Lambda: User Data Storage
 * AWS Lambda
 * Speichert ALLE Benutzerdaten in DynamoDB
 */

const { DynamoDBClient, PutItemCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

// AWS Lambda verwendet automatisch IAM Role - keine Credentials nötig
const dynamoDB = new DynamoDBClient({
    region: process.env.AWS_REGION || 'eu-central-1'
});

// Tabellen-Konfiguration
const TABLE_NAME = process.env.USER_DATA_TABLE || 'mawps-user-profiles';
const LEGACY_TABLE = 'mawps-user-data';

// CORS Headers
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
};

/**
 * Lädt Benutzerdaten mit Fallbacks für alte Schemata
 */
async function loadUserDataWithFallback(userId) {
    console.log('📥 Lade Benutzerdaten für userId:', userId);
    
    // 1. Neues Schema { userId: string }
    let result = await dynamoDB.send(new GetItemCommand({
        TableName: TABLE_NAME,
        Key: marshall({ userId: userId })
    }));
    
    if (result.Item) {
        const data = unmarshall(result.Item);
        if (data.resumes || data.documents || data.coverLetters || data.applications || data.firstName || data.profession) {
            console.log('✅ Daten gefunden (userId-Schema)');
            return { data, source: 'userId-schema' };
        }
    }
    
    // 2. Fallback: pk/sk Schema
    try {
        result = await dynamoDB.send(new GetItemCommand({
            TableName: TABLE_NAME,
            Key: marshall({ pk: `USER#${userId}`, sk: 'DATA' })
        }));
        
        if (result.Item) {
            const data = unmarshall(result.Item);
            console.log('✅ Daten gefunden (pk/sk Schema)');
            return { data, source: 'pk-sk-profiles' };
        }
    } catch (err) {
        console.log('ℹ️ pk/sk Schema nicht gefunden');
    }
    
    // 3. Fallback: Legacy Tabelle mit pk/sk Schema
    try {
        result = await dynamoDB.send(new GetItemCommand({
            TableName: LEGACY_TABLE,
            Key: marshall({ pk: `USER#${userId}`, sk: 'DATA' })
        }));
        
        if (result.Item) {
            const data = unmarshall(result.Item);
            console.log('✅ Daten gefunden in Legacy-Tabelle (pk/sk)');
            return { data, source: 'mawps-user-data' };
        }
    } catch (err) {
        console.log('ℹ️ Legacy-Tabelle (pk/sk) nicht verfügbar');
    }
    
    // 4. Fallback: Legacy Tabelle mit userId Schema
    try {
        result = await dynamoDB.send(new GetItemCommand({
            TableName: LEGACY_TABLE,
            Key: marshall({ userId: userId })
        }));
        
        if (result.Item) {
            const data = unmarshall(result.Item);
            console.log('✅ Daten gefunden in Legacy-Tabelle (userId)');
            return { data, source: 'mawps-user-data-userId' };
        }
    } catch (err) {
        console.log('ℹ️ Legacy-Tabelle (userId) nicht verfügbar');
    }
    
    console.log('ℹ️ Keine Daten gefunden für userId:', userId);
    return { data: {}, source: 'none' };
}

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
    console.log('User Data Lambda:', event.httpMethod, event.path);
    
    // CORS Preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }
    
    try {
        // Get user ID from token or header
        const authHeader = event.headers?.authorization || event.headers?.Authorization;
        const headerUserId = event.headers?.['x-user-id'] || event.headers?.['X-User-Id'];
        const userId = getUserIdFromToken(authHeader) || headerUserId;
        const userEmail = getUserEmailFromToken(authHeader);
        
        if (!userId) {
            return {
                statusCode: 401,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Nicht autorisiert - Bitte anmelden' })
            };
        }
        
        const path = event.path || event.rawPath || '';
        const { httpMethod } = event;
        
        // Route handling
        if (path.includes('/profile')) {
            return await handleProfile(userId, userEmail, httpMethod, event);
        }
        
        if (path.includes('/resumes')) {
            return await handleResumes(userId, httpMethod, event);
        }
        
        if (path.includes('/documents')) {
            return await handleDocuments(userId, httpMethod, event);
        }
        
        if (path.includes('/cover-letters')) {
            return await handleCoverLetters(userId, httpMethod, event);
        }
        
        if (path.includes('/applications')) {
            return await handleApplications(userId, httpMethod, event);
        }
        
        if (path.includes('/photos')) {
            return await handlePhotos(userId, httpMethod, event);
        }
        
        if (path.includes('/workflows')) {
            return await handleWorkflows(userId, httpMethod, event, path);
        }
        
        // Default: Get all user data
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

async function getAllUserData(userId) {
    const { data, source } = await loadUserDataWithFallback(userId);
    
    if (!data || Object.keys(data).length === 0) {
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                profile: null,
                resumes: [],
                documents: [],
                coverLetters: [],
                applications: [],
                photos: [],
                _source: 'none'
            })
        };
    }
    
    const { resumes, documents, coverLetters, applications, photos, pk, sk, resume, ...profileData } = data;
    
    // Konvertiere altes 'resume' Feld
    let finalResumes = resumes || [];
    if (resume && finalResumes.length === 0) {
        try {
            const resumeData = typeof resume === 'string' ? JSON.parse(resume) : resume;
            if (resumeData) {
                finalResumes = [{
                    id: 'migrated_resume_1',
                    name: resumeData.personalInfo?.title || 'Migrierter Lebenslauf',
                    ...resumeData,
                    createdAt: data.createdAt || new Date().toISOString(),
                    isMigrated: true
                }];
            }
        } catch (e) {
            console.error('Fehler beim Parsen des resume Feldes:', e);
        }
    }
    
    return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
            profile: profileData,
            resumes: finalResumes,
            documents: documents || [],
            coverLetters: coverLetters || [],
            applications: applications || [],
            photos: photos || [],
            updatedAt: data.updatedAt,
            _source: source
        })
    };
}

async function handleProfile(userId, userEmail, method, event) {
    if (method === 'GET') {
        console.log('📥 Loading profile for userId:', userId);
        
        // 1. Versuche: Neues Schema { userId: string }
        let result = await dynamoDB.send(new GetItemCommand({
            TableName: TABLE_NAME,
            Key: marshall({ userId: userId })
        }));
        
        if (result.Item) {
            const data = unmarshall(result.Item);
            console.log('✅ Profil gefunden (userId-Schema):', Object.keys(data));
            return {
                statusCode: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify(data)
            };
        }
        
        // 2. Fallback: Altes pk/sk Schema in mawps-user-profiles
        console.log('📥 Versuche altes pk/sk Schema...');
        try {
            result = await dynamoDB.send(new GetItemCommand({
                TableName: TABLE_NAME,
                Key: marshall({ pk: `USER#${userId}`, sk: 'DATA' })
            }));
            
            if (result.Item) {
                const data = unmarshall(result.Item);
                console.log('✅ Profil gefunden (pk/sk Schema):', Object.keys(data));
                // Migriere Daten zum neuen Schema
                const migratedData = {
                    ...data,
                    ...data.profile, // Falls profile ein Unterfeld ist
                    userId: userId,
                    email: data.email || data.profile?.email || userEmail,
                    migratedAt: new Date().toISOString()
                };
                delete migratedData.pk;
                delete migratedData.sk;
                delete migratedData.profile;
                return {
                    statusCode: 200,
                    headers: CORS_HEADERS,
                    body: JSON.stringify(migratedData)
                };
            }
        } catch (err) {
            console.log('ℹ️ pk/sk Schema nicht gefunden:', err.message);
        }
        
        // 3. Fallback: Prüfe mawps-user-data Tabelle (falls dort gespeichert)
        console.log('📥 Versuche mawps-user-data Tabelle...');
        try {
            result = await dynamoDB.send(new GetItemCommand({
                TableName: LEGACY_TABLE,
                Key: marshall({ pk: `USER#${userId}`, sk: 'DATA' })
            }));
            
            if (result.Item) {
                const data = unmarshall(result.Item);
                console.log('✅ Profil gefunden in mawps-user-data:', Object.keys(data));
                // Migriere Daten zum neuen Schema
                const migratedData = {
                    ...data,
                    ...data.profile,
                    userId: userId,
                    email: data.email || data.profile?.email || userEmail,
                    migratedFrom: 'mawps-user-data',
                    migratedAt: new Date().toISOString()
                };
                delete migratedData.pk;
                delete migratedData.sk;
                delete migratedData.profile;
                return {
                    statusCode: 200,
                    headers: CORS_HEADERS,
                    body: JSON.stringify(migratedData)
                };
            }
        } catch (err) {
            console.log('ℹ️ mawps-user-data nicht gefunden:', err.message);
        }
        
        // 4. Fallback: mawps-user-data Tabelle mit userId Schema
        console.log('📥 Versuche mawps-user-data mit userId Schema...');
        try {
            result = await dynamoDB.send(new GetItemCommand({
                TableName: LEGACY_TABLE,
                Key: marshall({ userId: userId })
            }));
            
            if (result.Item) {
                const data = unmarshall(result.Item);
                console.log('✅ Profil gefunden in mawps-user-data (userId):', Object.keys(data));
                return {
                    statusCode: 200,
                    headers: CORS_HEADERS,
                    body: JSON.stringify(data)
                };
            }
        } catch (err) {
            console.log('ℹ️ mawps-user-data userId Schema nicht gefunden');
        }
        
        // Kein Profil gefunden - gebe Standard-Profil zurück
        console.log('ℹ️ Kein Profil gefunden, erstelle Standard-Profil');
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ 
                userId: userId,
                email: userEmail,
                createdAt: new Date().toISOString()
            })
        };
    }
    
    if (method === 'PUT' || method === 'POST') {
        const body = JSON.parse(event.body || '{}');
        const now = new Date().toISOString();
        
        const existingResult = await dynamoDB.send(new GetItemCommand({
            TableName: TABLE_NAME,
            Key: marshall({ userId: userId })
        }));
        
        const existingData = existingResult.Item ? unmarshall(existingResult.Item) : {};
        
        const updatedData = {
            ...existingData,
            ...body,
            userId: userId,
            email: body.email || existingData.email || userEmail,
            updatedAt: now
        };
        
        Object.keys(updatedData).forEach(key => {
            if (updatedData[key] === undefined) delete updatedData[key];
        });
        
        await dynamoDB.send(new PutItemCommand({
            TableName: TABLE_NAME,
            Item: marshall(updatedData, { removeUndefinedValues: true })
        }));
        
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: true, ...updatedData })
        };
    }
    
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
}

async function handleResumes(userId, method, event) {
    const { data: existingData } = await loadUserDataWithFallback(userId);
    let resumes = existingData.resumes || [];
    
    // Konvertiere altes resume Feld
    if (existingData.resume && resumes.length === 0) {
        try {
            const resumeData = typeof existingData.resume === 'string' 
                ? JSON.parse(existingData.resume) : existingData.resume;
            if (resumeData) {
                resumes = [{
                    id: 'migrated_resume_1',
                    ...resumeData,
                    isMigrated: true
                }];
            }
        } catch (e) {}
    }
    
    if (method === 'GET') {
        return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(resumes) };
    }
    
    if (method === 'POST') {
        const body = JSON.parse(event.body || '{}');
        const now = new Date().toISOString();
        
        const newResume = {
            id: body.id || `resume_${Date.now()}`,
            ...body,
            createdAt: body.createdAt || now,
            updatedAt: now
        };
        
        const existingIndex = resumes.findIndex(r => r.id === newResume.id);
        if (existingIndex >= 0) {
            resumes[existingIndex] = newResume;
        } else {
            resumes.push(newResume);
        }
        
        const updatedData = { ...existingData, userId, resumes, updatedAt: now };
        
        await dynamoDB.send(new PutItemCommand({
            TableName: TABLE_NAME,
            Item: marshall(updatedData, { removeUndefinedValues: true })
        }));
        
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
        const updatedData = { ...existingData, userId, resumes: filteredResumes, updatedAt: new Date().toISOString() };
        
        await dynamoDB.send(new PutItemCommand({
            TableName: TABLE_NAME,
            Item: marshall(updatedData, { removeUndefinedValues: true })
        }));
        
        return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ success: true }) };
    }
    
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
}

async function handleDocuments(userId, method, event) {
    const { data: existingData } = await loadUserDataWithFallback(userId);
    const documents = existingData.documents || [];
    
    if (method === 'GET') {
        return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(documents) };
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
        
        const existingIndex = documents.findIndex(d => d.id === newDocument.id);
        if (existingIndex >= 0) {
            documents[existingIndex] = newDocument;
        } else {
            documents.push(newDocument);
        }
        
        const updatedData = { ...existingData, userId, documents, updatedAt: now };
        
        await dynamoDB.send(new PutItemCommand({
            TableName: TABLE_NAME,
            Item: marshall(updatedData, { removeUndefinedValues: true })
        }));
        
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
        const updatedData = { ...existingData, userId, documents: filteredDocs, updatedAt: new Date().toISOString() };
        
        await dynamoDB.send(new PutItemCommand({
            TableName: TABLE_NAME,
            Item: marshall(updatedData, { removeUndefinedValues: true })
        }));
        
        return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ success: true }) };
    }
    
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
}

async function handleCoverLetters(userId, method, event) {
    const { data: existingData } = await loadUserDataWithFallback(userId);
    const coverLetters = existingData.coverLetters || [];
    
    if (method === 'GET') {
        return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(coverLetters) };
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
        
        const existingIndex = coverLetters.findIndex(cl => cl.id === newCoverLetter.id);
        if (existingIndex >= 0) {
            coverLetters[existingIndex] = newCoverLetter;
        } else {
            coverLetters.push(newCoverLetter);
        }
        
        const updatedData = { ...existingData, userId, coverLetters, updatedAt: now };
        
        await dynamoDB.send(new PutItemCommand({
            TableName: TABLE_NAME,
            Item: marshall(updatedData, { removeUndefinedValues: true })
        }));
        
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
        const updatedData = { ...existingData, userId, coverLetters: filteredCL, updatedAt: new Date().toISOString() };
        
        await dynamoDB.send(new PutItemCommand({
            TableName: TABLE_NAME,
            Item: marshall(updatedData, { removeUndefinedValues: true })
        }));
        
        return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ success: true }) };
    }
    
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
}

async function handleApplications(userId, method, event) {
    const { data: existingData } = await loadUserDataWithFallback(userId);
    const applications = existingData.applications || [];
    
    if (method === 'GET') {
        return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(applications) };
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
        
        const updatedData = { ...existingData, userId, applications, updatedAt: now };
        
        await dynamoDB.send(new PutItemCommand({
            TableName: TABLE_NAME,
            Item: marshall(updatedData, { removeUndefinedValues: true })
        }));
        
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
        const updatedData = { ...existingData, userId, applications: filteredApps, updatedAt: new Date().toISOString() };
        
        await dynamoDB.send(new PutItemCommand({
            TableName: TABLE_NAME,
            Item: marshall(updatedData, { removeUndefinedValues: true })
        }));
        
        return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ success: true }) };
    }
    
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
}

async function handlePhotos(userId, method, event) {
    const { data: existingData } = await loadUserDataWithFallback(userId);
    const photos = existingData.photos || [];
    
    if (method === 'GET') {
        return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(photos) };
    }
    
    if (method === 'POST') {
        const body = JSON.parse(event.body || '{}');
        const now = new Date().toISOString();
        
        const newPhoto = {
            id: body.id || `photo_${Date.now()}`,
            name: body.name,
            type: body.type,
            size: body.size,
            dataUrl: body.dataUrl,
            url: body.url,
            storage: body.storage || (body.url ? 's3' : 'inline'),
            createdAt: body.createdAt || now,
            updatedAt: now
        };
        
        const existingIndex = photos.findIndex(p => p.id === newPhoto.id);
        if (existingIndex >= 0) {
            photos[existingIndex] = newPhoto;
        } else {
            photos.push(newPhoto);
        }
        
        const updatedData = { ...existingData, userId, photos, updatedAt: now };
        
        await dynamoDB.send(new PutItemCommand({
            TableName: TABLE_NAME,
            Item: marshall(updatedData, { removeUndefinedValues: true })
        }));
        
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: true, photo: newPhoto, photos })
        };
    }
    
    if (method === 'DELETE') {
        const params = event.queryStringParameters || {};
        const photoId = params.id;
        
        if (!photoId) {
            return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Photo ID required' }) };
        }
        
        const filteredPhotos = photos.filter(p => p.id !== photoId);
        const updatedData = { ...existingData, userId, photos: filteredPhotos, updatedAt: new Date().toISOString() };
        
        await dynamoDB.send(new PutItemCommand({
            TableName: TABLE_NAME,
            Item: marshall(updatedData, { removeUndefinedValues: true })
        }));
        
        return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ success: true }) };
    }
    
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
}

async function handleWorkflows(userId, method, event, path) {
    const { data: existingData } = await loadUserDataWithFallback(userId);
    const workflows = existingData.workflows || {};
    
    // Parse workflow path
    const workflowsIndex = path.indexOf('/workflows/');
    const workflowPath = workflowsIndex >= 0 ? path.substring(workflowsIndex + 11) : '';
    const pathParts = workflowPath.split('/').filter(Boolean);
    const workflowName = pathParts[0];
    const action = pathParts[1];
    const stepName = pathParts[2];
    
    if (!workflowName) {
        if (method === 'GET') {
            return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(workflows) };
        }
    }
    
    if (!workflows[workflowName]) {
        workflows[workflowName] = { steps: {}, results: null, progress: { currentStep: 0 } };
    }
    
    if (action === 'steps') {
        if (method === 'GET') {
            const stepData = stepName ? workflows[workflowName].steps?.[stepName] : workflows[workflowName].steps;
            return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(stepData || {}) };
        }
        
        if (method === 'POST' || method === 'PUT') {
            const body = JSON.parse(event.body || '{}');
            const now = new Date().toISOString();
            
            if (stepName) {
                workflows[workflowName].steps[stepName] = { ...body, updatedAt: now };
            } else {
                workflows[workflowName].steps = { ...workflows[workflowName].steps, ...body };
            }
            
            const updatedData = { ...existingData, userId, workflows, updatedAt: now };
            
            await dynamoDB.send(new PutItemCommand({
                TableName: TABLE_NAME,
                Item: marshall(updatedData, { removeUndefinedValues: true })
            }));
            
            return {
                statusCode: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify({ success: true, data: workflows[workflowName].steps[stepName] })
            };
        }
    }
    
    if (action === 'results') {
        if (method === 'GET') {
            return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(workflows[workflowName].results || null) };
        }
        
        if (method === 'POST' || method === 'PUT') {
            const body = JSON.parse(event.body || '{}');
            const now = new Date().toISOString();
            
            workflows[workflowName].results = { ...body, updatedAt: now };
            const updatedData = { ...existingData, userId, workflows, updatedAt: now };
            
            await dynamoDB.send(new PutItemCommand({
                TableName: TABLE_NAME,
                Item: marshall(updatedData, { removeUndefinedValues: true })
            }));
            
            return {
                statusCode: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify({ success: true, data: workflows[workflowName].results })
            };
        }
    }
    
    if (action === 'progress') {
        if (method === 'GET') {
            return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(workflows[workflowName].progress || { currentStep: 0 }) };
        }
        
        if (method === 'POST' || method === 'PUT') {
            const body = JSON.parse(event.body || '{}');
            const now = new Date().toISOString();
            
            workflows[workflowName].progress = { ...workflows[workflowName].progress, ...body, updatedAt: now };
            const updatedData = { ...existingData, userId, workflows, updatedAt: now };
            
            await dynamoDB.send(new PutItemCommand({
                TableName: TABLE_NAME,
                Item: marshall(updatedData, { removeUndefinedValues: true })
            }));
            
            return {
                statusCode: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify({ success: true, data: workflows[workflowName].progress })
            };
        }
    }
    
    return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Workflow action not found' }) };
}
