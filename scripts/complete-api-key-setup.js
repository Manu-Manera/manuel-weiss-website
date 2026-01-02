#!/usr/bin/env node
/**
 * Complete API Key Setup
 * Macht alles automatisch: Keys generieren, registrieren, Challenge holen, signieren, Token generieren
 * 
 * Usage: node scripts/complete-api-key-setup.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const BASE_URL = 'https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod';
const KEYS_DIR = path.join(__dirname, '..', 'keys');

console.log('🚀 Complete API Key Setup - Automatisch');
console.log('');

// Schritt 1: Key Pair generieren
console.log('📋 Schritt 1: Generiere Key Pair...');
const apiKeyId = crypto.randomUUID();
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
    }
});

// Speichere Keys
if (!fs.existsSync(KEYS_DIR)) {
    fs.mkdirSync(KEYS_DIR, { recursive: true });
}

const privateKeyPath = path.join(KEYS_DIR, `${apiKeyId}-private-key.pem`);
const publicKeyPath = path.join(KEYS_DIR, `${apiKeyId}-public-key.pem`);

fs.writeFileSync(privateKeyPath, privateKey, { mode: 0o600 });
fs.writeFileSync(publicKeyPath, publicKey);

console.log('✅ Keys generiert!');
console.log('  apiKeyId:', apiKeyId);
console.log('  Private Key:', privateKeyPath);
console.log('  Public Key:', publicKeyPath);
console.log('');

// Schritt 2: Public Key registrieren
console.log('📋 Schritt 2: Registriere Public Key...');
const publicKeyForRequest = publicKey.replace(/\n/g, '\\n');

function makeRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(BASE_URL + path);
        const options = {
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ status: res.statusCode, data: json });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

makeRequest('POST', '/auth/api-key/register', {
    apiKeyId: apiKeyId,
    publicKey: publicKey
}).then(result => {
    if (result.status === 200) {
        console.log('✅ Public Key registriert!');
        console.log('');
    } else {
        console.error('❌ Fehler beim Registrieren:', result.data);
        process.exit(1);
    }

    // Schritt 3: Challenge anfordern
    console.log('📋 Schritt 3: Hole Challenge...');
    return makeRequest('POST', '/auth/api-key/challenge', {
        apiKeyId: apiKeyId
    });
}).then(result => {
    if (result.status === 200 && result.data.challenge) {
        const challenge = result.data.challenge;
        console.log('✅ Challenge erhalten!');
        console.log('  Challenge:', challenge.substring(0, 50) + '...');
        console.log('');

        // Schritt 4: Challenge signieren
        console.log('📋 Schritt 4: Signiere Challenge...');
        const sign = crypto.createSign('RSA-SHA256');
        sign.update(challenge);
        sign.end();
        const signature = sign.sign(privateKey, 'base64');
        console.log('✅ Challenge signiert!');
        console.log('');

        // Schritt 5: Token generieren
        console.log('📋 Schritt 5: Generiere Token...');
        return makeRequest('POST', '/auth/api-key/token', {
            apiKeyId: apiKeyId,
            challenge: challenge,
            signature: signature
        });
    } else {
        throw new Error('Challenge konnte nicht geholt werden: ' + JSON.stringify(result.data));
    }
}).then(result => {
    if (result.status === 200 && result.data.token) {
        console.log('✅ Token generiert!');
        console.log('');
        console.log('🎉 Alles fertig!');
        console.log('');
        console.log('📋 Für Postman:');
        console.log('1. Setze apiKeyId:', apiKeyId);
        console.log('2. Setze publicKey: (siehe keys/' + apiKeyId + '-public-key.pem)');
        console.log('3. Setze privateKey: (siehe keys/' + apiKeyId + '-private-key.pem)');
        console.log('4. Token ist bereits generiert und kann verwendet werden!');
        console.log('');
        console.log('💡 Oder verwende das Auto-Sign Script:');
        console.log('   node scripts/auto-sign-challenge.js ' + apiKeyId);
    } else {
        console.error('❌ Fehler beim Token-Generieren:', result.data);
        process.exit(1);
    }
}).catch(error => {
    console.error('❌ Fehler:', error.message);
    process.exit(1);
});

