#!/usr/bin/env node
/**
 * Register Correct Public Key
 * Registriert automatisch den korrekten Public Key für eine apiKeyId
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const apiKeyId = process.argv[2] || '9eadacab-bc87-4dff-8d01-e4862c654b45';
const BASE_URL = 'https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod';

// Lade Public Key
const KEYS_DIR = path.join(__dirname, '..', 'keys');
const publicKeyPath = path.join(KEYS_DIR, `${apiKeyId}-public-key.pem`);

if (!fs.existsSync(publicKeyPath)) {
    console.error('❌ Public Key nicht gefunden:', publicKeyPath);
    process.exit(1);
}

const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
console.log('✅ Public Key geladen');
console.log('   Erste Zeile:', publicKey.split('\n')[1].substring(0, 50) + '...');
console.log('   Länge:', publicKey.length);
console.log('');

// Konvertiere Public Key für JSON (escaped newlines)
const publicKeyJson = publicKey.replace(/\n/g, '\\n');

// Request Body
const body = JSON.stringify({
    apiKeyId: apiKeyId,
    publicKey: publicKeyJson
});

console.log('📤 Registriere Public Key...');
console.log('   URL:', `${BASE_URL}/auth/api-key/register`);
console.log('   apiKeyId:', apiKeyId);
console.log('');

const url = new URL(`${BASE_URL}/auth/api-key/register`);
const options = {
    hostname: url.hostname,
    port: 443,
    path: url.pathname,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
    }
};

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('📥 Response Status:', res.statusCode);
        console.log('📥 Response Body:', data);
        console.log('');

        if (res.statusCode === 200) {
            const response = JSON.parse(data);
            if (response.success) {
                console.log('✅ Public Key erfolgreich registriert!');
                console.log('');
                console.log('💡 Nächste Schritte:');
                console.log('   1. Führe Request 2 (Get Challenge) in Postman aus');
                console.log('   2. Führe Request 2.5 (Generate Signature) in Postman aus');
                console.log('   3. Führe Request 3 (Get Token) in Postman aus');
            } else {
                console.error('❌ Fehler:', response.error);
                if (response.details) {
                    console.error('   Details:', response.details);
                }
            }
        } else {
            console.error('❌ Request fehlgeschlagen:', res.statusCode);
            try {
                const error = JSON.parse(data);
                console.error('   Error:', error.error);
                if (error.details) {
                    console.error('   Details:', error.details);
                }
            } catch (e) {
                console.error('   Response:', data);
            }
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request Error:', error.message);
    process.exit(1);
});

req.write(body);
req.end();

