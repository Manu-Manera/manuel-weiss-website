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

// EINZIGE Tabelle für alle Benutzerdaten - konsistent mit allen anderen Stellen
const TABLE_NAME = process.env.USER_DATA_TABLE || 'mawps-user-profiles';
const LEGACY_TABLE = 'mawps-user-data'; // Fallback für alte Daten

// CORS Headers
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
};

/**
 * UNIVERSELLE FUNKTION: Lädt alle Benutzerdaten mit Fallbacks für alte Schemata
 * Prüft: 1. Neues Schema (userId), 2. Altes pk/sk Schema, 3. mawps-user-data Tabelle
 */
async function loadUserDataWithFallback(userId) {
    console.log('📥 Lade Benutzerdaten für userId:', userId);
    
    // 1. Versuche neues Schema { userId: string }
    let result = await dynamoDB.send(new GetItemCommand({
        TableName: TABLE_NAME,
        Key: marshall({ userId: userId })
    }));
    
    if (result.Item) {
        const data = unmarshall(result.Item);
        // Prüfe ob es echte Daten sind (nicht nur userId)
        if (data.resumes || data.documents || data.coverLetters || data.applications || data.firstName || data.profession) {
            console.log('✅ Daten gefunden (userId-Schema):', Object.keys(data));
            return { data, source: 'userId-schema' };
        }
    }
    
    // 2. Fallback: Altes pk/sk Schema in mawps-user-profiles
    console.log('📥 Versuche altes pk/sk Schema in mawps-user-profiles...');
    try {
        result = await dynamoDB.send(new GetItemCommand({
            TableName: TABLE_NAME,
            Key: marshall({ pk: `USER#${userId}`, sk: 'DATA' })
        }));
        
        if (result.Item) {
            const data = unmarshall(result.Item);
            console.log('✅ Daten gefunden (pk/sk Schema in mawps-user-profiles):', Object.keys(data));
            return { data, source: 'pk-sk-profiles' };
        }
    } catch (err) {
        console.log('ℹ️ pk/sk Schema nicht gefunden in mawps-user-profiles');
    }
    
    // 3. Fallback: mawps-user-data Tabelle mit pk/sk Schema
    console.log('📥 Versuche mawps-user-data Tabelle...');
    try {
        result = await dynamoDB.send(new GetItemCommand({
            TableName: LEGACY_TABLE,
            Key: marshall({ pk: `USER#${userId}`, sk: 'DATA' })
        }));
        
        if (result.Item) {
            const data = unmarshall(result.Item);
            console.log('✅ Daten gefunden in mawps-user-data:', Object.keys(data));
            return { data, source: 'mawps-user-data' };
        }
    } catch (err) {
        console.log('ℹ️ mawps-user-data Tabelle nicht gefunden oder leer');
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
            console.log('✅ Daten gefunden in mawps-user-data (userId):', Object.keys(data));
            return { data, source: 'mawps-user-data-userId' };
        }
    } catch (err) {
        console.log('ℹ️ mawps-user-data userId Schema nicht gefunden');
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
        
        // Route: /user-data/photos - Bewerbungsfotos
        if (path.includes('/photos')) {
            return await handlePhotos(userId, httpMethod, event);
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
 * Get all user data - Mit Fallback für alte Schemata
 */
async function getAllUserData(userId) {
    try {
        // Verwende die universelle Fallback-Funktion
        const { data, source } = await loadUserDataWithFallback(userId);
        console.log('📥 Alle Benutzerdaten geladen von:', source);
        
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
        
        // Profildaten sind direkt im Hauptobjekt, nicht in einem 'profile' Unterfeld
        const { resumes, documents, coverLetters, applications, photos, pk, sk, ...profileData } = data;
        
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                profile: profileData,
                resumes: resumes || [],
                documents: documents || [],
                coverLetters: coverLetters || [],
                applications: applications || [],
                photos: photos || [],
                updatedAt: data.updatedAt,
                _source: source
            })
        };
    } catch (error) {
        console.error('Get all user data error:', error);
        throw error;
    }
}

/**
 * Handle profile data
 * WICHTIG: Prüft mehrere Key-Schemata für Abwärtskompatibilität
 */
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
                TableName: 'mawps-user-data',
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
        
        // Get existing data mit dem GLEICHEN Key-Schema
        const existingResult = await dynamoDB.send(new GetItemCommand({
            TableName: TABLE_NAME,
            Key: marshall({ userId: userId })
        }));
        
        const existingData = existingResult.Item ? unmarshall(existingResult.Item) : {};
        
        // Merge und speichere - behalte bestehendes Datenformat bei
        const updatedData = {
            ...existingData,
            ...body,
            userId: userId, // Immer beibehalten
            email: body.email || existingData.email || userEmail,
            updatedAt: now
        };
        
        // Entferne undefined Werte
        Object.keys(updatedData).forEach(key => {
            if (updatedData[key] === undefined) {
                delete updatedData[key];
            }
        });
        
        await dynamoDB.send(new PutItemCommand({
            TableName: TABLE_NAME,
            Item: marshall(updatedData, { removeUndefinedValues: true })
        }));
        
        console.log('✅ Profil gespeichert für userId:', userId);
        
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: true, ...updatedData })
        };
    }
    
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
}

/**
 * Handle resumes
 * WICHTIG: Verwendet loadUserDataWithFallback für Abwärtskompatibilität
 */
async function handleResumes(userId, method, event) {
    // Lade alle Daten mit Fallback für alte Schemata
    const { data: existingData, source } = await loadUserDataWithFallback(userId);
    console.log('📥 Resumes geladen von:', source);
    
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
        
        // Save mit gleichem Key-Schema wie Backend
        const updatedData = {
            ...existingData,
            userId: userId,
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
            ...existingData,
            userId: userId,
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
    // Lade alle Daten mit Fallback für alte Schemata
    const { data: existingData, source } = await loadUserDataWithFallback(userId);
    console.log('📥 Documents geladen von:', source);
    
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
            ...existingData,
            userId: userId,
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
            ...existingData,
            userId: userId,
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
    // Lade alle Daten mit Fallback für alte Schemata
    const { data: existingData, source } = await loadUserDataWithFallback(userId);
    console.log('📥 CoverLetters geladen von:', source);
    
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
            ...existingData,
            userId: userId,
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
            ...existingData,
            userId: userId,
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
    // Lade alle Daten mit Fallback für alte Schemata
    const { data: existingData, source } = await loadUserDataWithFallback(userId);
    console.log('📥 Applications geladen von:', source);
    
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
            ...existingData,
            userId: userId,
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
            ...existingData,
            userId: userId,
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

/**
 * Handle photos (application photos / Bewerbungsfotos)
 */
async function handlePhotos(userId, method, event) {
    // Lade alle Daten mit Fallback für alte Schemata
    const { data: existingData, source } = await loadUserDataWithFallback(userId);
    console.log('📥 Photos geladen von:', source);
    const photos = existingData.photos || [];
    
    if (method === 'GET') {
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify(photos)
        };
    }
    
    if (method === 'POST') {
        const body = JSON.parse(event.body || '{}');
        const now = new Date().toISOString();
        
        const newPhoto = {
            id: body.id || `photo_${Date.now()}`,
            name: body.name,
            type: body.type,
            size: body.size,
            dataUrl: body.dataUrl, // Base64 encoded image
            createdAt: body.createdAt || now,
            updatedAt: now
        };
        
        // Check if updating existing photo
        const existingIndex = photos.findIndex(p => p.id === newPhoto.id);
        if (existingIndex >= 0) {
            photos[existingIndex] = newPhoto;
        } else {
            photos.push(newPhoto);
        }
        
        const updatedData = {
            ...existingData,
            userId: userId,
            photos,
            updatedAt: now
        };
        
        await dynamoDB.send(new PutItemCommand({
            TableName: TABLE_NAME,
            Item: marshall(updatedData, { removeUndefinedValues: true })
        }));
        
        console.log('✅ Photo saved to AWS');
        
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
        
        const updatedData = {
            ...existingData,
            userId: userId,
            photos: filteredPhotos,
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
