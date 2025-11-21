// =================== BEWERBUNGSPROFIL API BACKEND ===================
// Lambda Function für Bewerbungsprofil-Management

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

const TABLE_NAME = process.env.BEWERBUNGSPROFIL_TABLE || 'bewerbungsprofile';
const USER_POOL_ID = process.env.USER_POOL_ID;

/**
 * CORS Headers
 */
function getCorsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Max-Age': '86400'
    };
}

/**
 * JSON Response Helper
 */
function jsonResponse(statusCode, body, headers = {}) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(),
            ...headers
        },
        body: JSON.stringify(body)
    };
}

/**
 * User aus Token extrahieren
 */
async function getUserFromToken(authHeader) {
    try {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error('Invalid authorization header');
        }

        const token = authHeader.substring(7);
        
        const command = new GetUserCommand({
            AccessToken: token
        });

        const response = await cognitoClient.send(command);
        
        return {
            userId: response.Username,
            email: response.UserAttributes.find(attr => attr.Name === 'email')?.Value,
            name: response.UserAttributes.find(attr => attr.Name === 'name')?.Value,
            attributes: response.UserAttributes
        };
    } catch (error) {
        console.error('❌ Token validation error:', error);
        throw new Error('Invalid token');
    }
}

/**
 * Bewerbungsprofil erstellen oder aktualisieren
 */
export const handler = async (event) => {
    console.log('🔧 Bewerbungsprofil API - Event:', JSON.stringify(event, null, 2));
    
    const headers = getCorsHeaders();
    
    // CORS Preflight
    if (event.httpMethod === 'OPTIONS') {
        return jsonResponse(200, {}, headers);
    }

    try {
        // User authentifizieren
        const user = await getUserFromToken(event.headers.Authorization);
        console.log('👤 Authentifizierter User:', user.userId);

        const path = event.path || event.resource || '';
        const method = event.httpMethod;
        
        console.log(`📋 API: ${method} ${path} - User: ${user.email}`);

        // === BEWERBUNGSPROFIL ENDPOINTS ===
        
        // POST /api/applications/profile - Profil erstellen/aktualisieren
        if (path.includes('/profile') && method === 'POST') {
            const profileData = JSON.parse(event.body || '{}');
            
            const profile = {
                userId: user.userId,
                email: user.email,
                name: user.name,
                ...profileData,
                createdAt: profileData.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: (profileData.version || 0) + 1
            };

            const command = new PutCommand({
                TableName: TABLE_NAME,
                Item: profile
            });

            await docClient.send(command);
            
            console.log('✅ Profil gespeichert:', profile.userId);
            
            return jsonResponse(201, {
                success: true,
                profile: profile,
                message: 'Profil erfolgreich gespeichert'
            }, headers);
        }

        // GET /api/applications/profile/{userId} - Profil abrufen
        if (path.includes('/profile/') && method === 'GET') {
            const userId = path.split('/').pop();
            
            // Sicherheitscheck: User kann nur sein eigenes Profil abrufen
            if (userId !== user.userId) {
                return jsonResponse(403, {
                    success: false,
                    error: 'Zugriff verweigert'
                }, headers);
            }

            const command = new GetCommand({
                TableName: TABLE_NAME,
                Key: { userId: userId }
            });

            const response = await docClient.send(command);
            
            if (response.Item) {
                console.log('✅ Profil gefunden:', userId);
                return jsonResponse(200, {
                    success: true,
                    profile: response.Item
                }, headers);
            } else {
                console.log('ℹ️ Kein Profil gefunden:', userId);
                return jsonResponse(404, {
                    success: false,
                    error: 'Profil nicht gefunden'
                }, headers);
            }
        }

        // PUT /api/applications/profile/{userId} - Profil aktualisieren
        if (path.includes('/profile/') && method === 'PUT') {
            const userId = path.split('/').pop();
            
            // Sicherheitscheck: User kann nur sein eigenes Profil aktualisieren
            if (userId !== user.userId) {
                return jsonResponse(403, {
                    success: false,
                    error: 'Zugriff verweigert'
                }, headers);
            }

            const updateData = JSON.parse(event.body || '{}');
            
            const command = new UpdateCommand({
                TableName: TABLE_NAME,
                Key: { userId: userId },
                UpdateExpression: 'SET #data = :data, updatedAt = :updatedAt, version = version + :inc',
                ExpressionAttributeNames: {
                    '#data': 'data'
                },
                ExpressionAttributeValues: {
                    ':data': updateData,
                    ':updatedAt': new Date().toISOString(),
                    ':inc': 1
                },
                ReturnValues: 'ALL_NEW'
            });

            const response = await docClient.send(command);
            
            console.log('✅ Profil aktualisiert:', userId);
            
            return jsonResponse(200, {
                success: true,
                profile: response.Attributes,
                message: 'Profil erfolgreich aktualisiert'
            }, headers);
        }

        // DELETE /api/applications/profile/{userId} - Profil löschen
        if (path.includes('/profile/') && method === 'DELETE') {
            const userId = path.split('/').pop();
            
            // Sicherheitscheck: User kann nur sein eigenes Profil löschen
            if (userId !== user.userId) {
                return jsonResponse(403, {
                    success: false,
                    error: 'Zugriff verweigert'
                }, headers);
            }

            const command = new DeleteCommand({
                TableName: TABLE_NAME,
                Key: { userId: userId }
            });

            await docClient.send(command);
            
            console.log('✅ Profil gelöscht:', userId);
            
            return jsonResponse(200, {
                success: true,
                message: 'Profil erfolgreich gelöscht'
            }, headers);
        }

        // GET /api/applications/profiles - Alle Profile abrufen (Admin)
        if (path.includes('/profiles') && method === 'GET') {
            // Admin-Check (vereinfacht - in Produktion sollte das über Cognito Groups erfolgen)
            const isAdmin = user.attributes?.find(attr => attr.Name === 'custom:role')?.Value === 'admin';
            
            if (!isAdmin) {
                return jsonResponse(403, {
                    success: false,
                    error: 'Admin-Zugriff erforderlich'
                }, headers);
            }

            const queryParams = event.queryStringParameters || {};
            const limit = parseInt(queryParams.limit || '50');
            const lastKey = queryParams.lastKey;

            const command = new ScanCommand({
                TableName: TABLE_NAME,
                Limit: Math.min(limit, 100),
                ExclusiveStartKey: lastKey ? JSON.parse(decodeURIComponent(lastKey)) : undefined
            });

            const response = await docClient.send(command);
            
            console.log('✅ Alle Profile abgerufen:', response.Items?.length);
            
            return jsonResponse(200, {
                success: true,
                profiles: response.Items || [],
                total: response.Count || 0,
                lastKey: response.LastEvaluatedKey ? encodeURIComponent(JSON.stringify(response.LastEvaluatedKey)) : null
            }, headers);
        }

        // GET /api/applications/profile/{userId}/stats - Statistiken abrufen
        if (path.includes('/profile/') && path.includes('/stats') && method === 'GET') {
            const userId = path.split('/')[path.split('/').length - 2];
            
            // Sicherheitscheck: User kann nur seine eigenen Statistiken abrufen
            if (userId !== user.userId) {
                return jsonResponse(403, {
                    success: false,
                    error: 'Zugriff verweigert'
                }, headers);
            }

            // Mock-Statistiken (in Produktion würde hier eine echte Berechnung erfolgen)
            const stats = {
                profileCompleteness: 85,
                lastUpdated: new Date().toISOString(),
                applicationsCount: 12,
                successRate: 75,
                averageResponseTime: '3.2 Tage',
                topSkills: ['JavaScript', 'React', 'Node.js', 'Python'],
                improvementSuggestions: [
                    'Erweitern Sie Ihre Cloud-Kenntnisse',
                    'Fügen Sie mehr Soft Skills hinzu',
                    'Aktualisieren Sie Ihre Projektreferenzen'
                ]
            };
            
            console.log('✅ Statistiken abgerufen für:', userId);
            
            return jsonResponse(200, {
                success: true,
                stats: stats
            }, headers);
        }

        // GET /api/applications/profile/{userId}/export - Profil exportieren
        if (path.includes('/profile/') && path.includes('/export') && method === 'GET') {
            const userId = path.split('/')[path.split('/').length - 2];
            const format = event.queryStringParameters?.format || 'json';
            
            // Sicherheitscheck: User kann nur sein eigenes Profil exportieren
            if (userId !== user.userId) {
                return jsonResponse(403, {
                    success: false,
                    error: 'Zugriff verweigert'
                }, headers);
            }

            const command = new GetCommand({
                TableName: TABLE_NAME,
                Key: { userId: userId }
            });

            const response = await docClient.send(command);
            
            if (!response.Item) {
                return jsonResponse(404, {
                    success: false,
                    error: 'Profil nicht gefunden'
                }, headers);
            }

            let exportData;
            let contentType;
            let filename;

            switch (format) {
                case 'json':
                    exportData = JSON.stringify(response.Item, null, 2);
                    contentType = 'application/json';
                    filename = `bewerbungsprofil-${userId}.json`;
                    break;
                case 'pdf':
                    // In Produktion würde hier PDF-Generierung erfolgen
                    exportData = `PDF Export für ${userId} - ${new Date().toISOString()}`;
                    contentType = 'application/pdf';
                    filename = `bewerbungsprofil-${userId}.pdf`;
                    break;
                default:
                    return jsonResponse(400, {
                        success: false,
                        error: 'Unsupported export format'
                    }, headers);
            }

            console.log('✅ Profil exportiert:', userId, format);
            
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': contentType,
                    'Content-Disposition': `attachment; filename="${filename}"`,
                    ...getCorsHeaders()
                },
                body: exportData
            };
        }

        // 404 für unbekannte Endpoints
        return jsonResponse(404, {
            success: false,
            error: 'Endpoint nicht gefunden'
        }, headers);

    } catch (error) {
        console.error('❌ API Error:', error);
        
        if (error.message === 'Invalid token') {
            return jsonResponse(401, {
                success: false,
                error: 'Ungültiger oder abgelaufener Token'
            }, headers);
        }
        
        return jsonResponse(500, {
            success: false,
            error: error.message || 'Interner Serverfehler'
        }, headers);
    }
};




















