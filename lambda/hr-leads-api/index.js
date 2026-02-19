/**
 * AWS Lambda Function for HR-Leads API
 * Speichert und lädt HR-Selbsttest Leads aus S3
 * 
 * Endpoints:
 * - POST /hr-leads/save - Speichere neuen Lead
 * - GET /hr-leads/list - Liste alle Leads
 * - DELETE /hr-leads/delete - Lösche Lead (mit id Query-Parameter)
 * - DELETE /hr-leads/clear - Lösche alle Leads
 */

const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'eu-central-1' });

const BUCKET_NAME = process.env.S3_BUCKET || 'manuel-weiss-website';
const LEADS_FILE = 'data/hr-leads.json';

const ALLOWED_ORIGINS = [
    'https://manuel-weiss.ch',
    'https://www.manuel-weiss.ch',
    'http://localhost:3000',
    'http://localhost:8888'
];

// Admin-Passwort für geschützte Operationen (optional)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mw-admin-2024';

function getCORSHeaders(origin) {
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Admin-Password',
        'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS'
    };
}

function createResponse(statusCode, body, origin = '*') {
    return {
        statusCode,
        headers: getCORSHeaders(origin),
        body: JSON.stringify(body)
    };
}

// Leads aus S3 laden
async function loadLeads() {
    try {
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: LEADS_FILE
        });
        const response = await s3Client.send(command);
        const bodyStr = await response.Body.transformToString();
        return JSON.parse(bodyStr);
    } catch (error) {
        if (error.name === 'NoSuchKey') {
            return [];
        }
        console.error('Error loading leads:', error);
        return [];
    }
}

// Leads in S3 speichern
async function saveLeads(leads) {
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: LEADS_FILE,
        Body: JSON.stringify(leads, null, 2),
        ContentType: 'application/json'
    });
    await s3Client.send(command);
}

exports.handler = async (event) => {
    console.log('📊 HR-Leads API Event:', JSON.stringify(event, null, 2));
    
    const origin = event.headers?.origin || event.headers?.Origin || '*';
    const method = event.httpMethod || event.requestContext?.http?.method || 'GET';
    
    // Handle CORS preflight
    if (method === 'OPTIONS') {
        return createResponse(200, { message: 'OK' }, origin);
    }
    
    try {
        const path = event.path || event.rawPath || '';
        const pathParts = path.split('/').filter(p => p);
        
        console.log('📋 Path parts:', pathParts, 'Method:', method);
        
        // Route: POST /hr-leads/save
        if (pathParts.includes('save') && method === 'POST') {
            return await saveLead(event, origin);
        }
        
        // Route: GET /hr-leads/list
        if (pathParts.includes('list') && method === 'GET') {
            return await listLeads(event, origin);
        }
        
        // Route: DELETE /hr-leads/delete
        if (pathParts.includes('delete') && method === 'DELETE') {
            return await deleteLead(event, origin);
        }
        
        // Route: DELETE /hr-leads/clear
        if (pathParts.includes('clear') && method === 'DELETE') {
            return await clearLeads(event, origin);
        }
        
        return createResponse(404, { error: 'Not found' }, origin);
        
    } catch (error) {
        console.error('❌ Error:', error);
        return createResponse(500, { error: error.message || 'Internal server error' }, origin);
    }
};

// POST /hr-leads/save - Neuen Lead speichern
async function saveLead(event, origin) {
    try {
        const leadData = JSON.parse(event.body || '{}');
        
        // Validierung
        if (!leadData.name || !leadData.email) {
            return createResponse(400, { error: 'Name und E-Mail sind erforderlich' }, origin);
        }
        
        // Lead mit ALLEN Daten speichern
        const newLead = {
            id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: leadData.name,
            email: leadData.email,
            wantsConsultation: leadData.wantsConsultation || false,
            scores: leadData.scores || {},
            answers: leadData.answers || {},
            prozessDetails: leadData.prozessDetails || {},
            prozesseBewertet: leadData.prozesseBewertet || 0,
            prozesseGesamt: leadData.prozesseGesamt || 32,
            pdfBase64: leadData.pdfBase64 || null,
            timestamp: leadData.timestamp || new Date().toISOString(),
            userAgent: event.headers?.['user-agent'] || 'unknown',
            ip: event.requestContext?.identity?.sourceIp || 'unknown'
        };
        
        // Bestehende Leads laden und neuen hinzufügen
        const leads = await loadLeads();
        leads.unshift(newLead);
        
        // Max 500 Leads behalten
        const trimmedLeads = leads.slice(0, 500);
        await saveLeads(trimmedLeads);
        
        console.log('✅ Lead gespeichert:', newLead.id);
        
        return createResponse(200, {
            success: true,
            leadId: newLead.id,
            message: 'Lead erfolgreich gespeichert'
        }, origin);
        
    } catch (error) {
        console.error('❌ Fehler beim Speichern:', error);
        return createResponse(500, { error: error.message }, origin);
    }
}

// GET /hr-leads/list - Alle Leads laden
async function listLeads(event, origin) {
    try {
        const leads = await loadLeads();
        
        return createResponse(200, {
            success: true,
            count: leads.length,
            leads: leads
        }, origin);
        
    } catch (error) {
        console.error('❌ Fehler beim Laden:', error);
        return createResponse(500, { error: error.message }, origin);
    }
}

// DELETE /hr-leads/delete?id=xxx - Einzelnen Lead löschen
async function deleteLead(event, origin) {
    try {
        const adminPw = event.headers?.['x-admin-password'] || event.queryStringParameters?.adminPw;
        if (adminPw !== ADMIN_PASSWORD) {
            return createResponse(403, { error: 'Unauthorized' }, origin);
        }
        
        const leadId = event.queryStringParameters?.id;
        if (!leadId) {
            return createResponse(400, { error: 'Lead-ID erforderlich' }, origin);
        }
        
        const leads = await loadLeads();
        const filteredLeads = leads.filter(l => l.id !== leadId);
        
        if (leads.length === filteredLeads.length) {
            return createResponse(404, { error: 'Lead nicht gefunden' }, origin);
        }
        
        await saveLeads(filteredLeads);
        
        return createResponse(200, {
            success: true,
            message: 'Lead gelöscht'
        }, origin);
        
    } catch (error) {
        console.error('❌ Fehler beim Löschen:', error);
        return createResponse(500, { error: error.message }, origin);
    }
}

// DELETE /hr-leads/clear - Alle Leads löschen
async function clearLeads(event, origin) {
    try {
        const adminPw = event.headers?.['x-admin-password'] || event.queryStringParameters?.adminPw;
        if (adminPw !== ADMIN_PASSWORD) {
            return createResponse(403, { error: 'Unauthorized' }, origin);
        }
        
        await saveLeads([]);
        
        return createResponse(200, {
            success: true,
            message: 'Alle Leads gelöscht'
        }, origin);
        
    } catch (error) {
        console.error('❌ Fehler beim Löschen:', error);
        return createResponse(500, { error: error.message }, origin);
    }
}
