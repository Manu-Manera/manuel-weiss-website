// Netlify Function für Aktivitätsbilder
const { MongoClient } = require('mongodb');

// MongoDB-Verbindung (optional - kann später hinzugefügt werden)
let mongoClient = null;

// Einfache In-Memory-Speicherung für den Anfang
const imageStorage = new Map();

exports.handler = async (event, context) => {
    // CORS-Header für Cross-Origin-Requests
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    // Handle OPTIONS request (CORS preflight)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        const { activity } = event.queryStringParameters || {};
        
        if (event.httpMethod === 'GET') {
            // GET: Bilder abrufen
            if (!activity) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Activity parameter required' })
                };
            }

            const images = imageStorage.get(activity) || [];
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    activity, 
                    images,
                    count: images.length,
                    timestamp: new Date().toISOString()
                })
            };
        }

        if (event.httpMethod === 'POST') {
            // POST: Bilder speichern
            const body = JSON.parse(event.body);
            const { activity: postActivity, images, timestamp } = body;

            if (!postActivity || !images) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Activity and images required' })
                };
            }

            // Speichere Bilder
            imageStorage.set(postActivity, images);
            
            console.log(`✅ ${images.length} Bilder für ${postActivity} gespeichert`);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: true,
                    message: `${images.length} Bilder für ${postActivity} gespeichert`,
                    activity: postActivity,
                    count: images.length,
                    timestamp: timestamp || new Date().toISOString()
                })
            };
        }

        // Unsupported method
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };

    } catch (error) {
        console.error('❌ Fehler in activity-images function:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message 
            })
        };
    }
};
