#!/usr/bin/env node
/**
 * Challenge Signing Server
 * Lokaler Server für Postman, um Challenges zu signieren
 * 
 * Usage: 
 *   node scripts/sign-challenge-server.js [port]
 * 
 * Dann in Postman Pre-request Script:
 *   pm.sendRequest({
 *     url: 'http://localhost:3001/sign',
 *     method: 'POST',
 *     body: { challenge: pm.environment.get('challenge'), apiKeyId: pm.environment.get('apiKeyId') }
 *   }, function(err, res) {
 *     if (!err) {
 *       pm.environment.set('signature', res.json().signature);
 *     }
 *   });
 */

const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.argv[2] || 3001;
const KEYS_DIR = path.join(__dirname, '..', 'keys');

console.log('🔐 Challenge Signing Server');
console.log('📁 Keys-Verzeichnis:', KEYS_DIR);
console.log('');

// CORS Headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
};

const server = http.createServer((req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200, corsHeaders);
        res.end();
        return;
    }

    // Parse URL
    const parsedUrl = url.parse(req.url, true);
    
    // Only allow POST /sign
    if (req.method !== 'POST' || parsedUrl.pathname !== '/sign') {
        res.writeHead(404, corsHeaders);
        res.end(JSON.stringify({ error: 'Not found. Use POST /sign' }));
        return;
    }

    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            const { challenge, apiKeyId } = data;

            if (!challenge || !apiKeyId) {
                res.writeHead(400, corsHeaders);
                res.end(JSON.stringify({ 
                    error: 'Missing required fields: challenge, apiKeyId' 
                }));
                return;
            }

            // Load private key
            const privateKeyPath = path.join(KEYS_DIR, `${apiKeyId}-private-key.pem`);
            
            console.log('📋 Signing Request:', {
                apiKeyId: apiKeyId,
                challengeLength: challenge.length,
                privateKeyPath: privateKeyPath
            });
            
            if (!fs.existsSync(privateKeyPath)) {
                console.error('❌ Private Key nicht gefunden:', privateKeyPath);
                res.writeHead(404, corsHeaders);
                res.end(JSON.stringify({ 
                    error: `Private key not found: ${privateKeyPath}`,
                    hint: 'Prüfe ob apiKeyId korrekt ist und Private Key existiert'
                }));
                return;
            }

            const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
            console.log('✅ Private Key geladen');

            // Sign challenge
            const sign = crypto.createSign('RSA-SHA256');
            sign.update(challenge);
            sign.end();

            const signature = sign.sign(privateKey, 'base64');
            
            console.log('✅ Signature generiert, Länge:', signature.length);
            console.log('📤 Sende Response...');

            res.writeHead(200, corsHeaders);
            res.end(JSON.stringify({
                success: true,
                signature: signature,
                message: 'Challenge signed successfully'
            }));

        } catch (error) {
            console.error('Error:', error);
            res.writeHead(500, corsHeaders);
            res.end(JSON.stringify({ 
                error: 'Internal server error',
                details: error.message 
            }));
        }
    });
});

server.listen(PORT, () => {
    console.log(`🔐 Challenge Signing Server läuft auf http://localhost:${PORT}`);
    console.log('');
    console.log('📋 Für Postman:');
    console.log('1. Pre-request Script in Request 3 verwenden');
    console.log('2. Server muss während Postman-Tests laufen');
    console.log('');
    console.log('⚠️  WICHTIG: Server nur lokal verwenden!');
    console.log('   Stoppe Server mit Ctrl+C wenn nicht benötigt');
});

