#!/usr/bin/env node
/**
 * Test Complete Flow
 * Testet den kompletten Flow: Register → Challenge → Sign → Token
 * 
 * Usage: node scripts/test-complete-flow.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = 'https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod';
const KEYS_DIR = path.join(__dirname, '..', 'keys');

console.log('🧪 Test Complete Flow - API Key Authentication');
console.log('');

// Finde neuestes Key-Pair
const keyFiles = fs.readdirSync(KEYS_DIR).filter(f => f.endsWith('-private-key.pem'));
if (keyFiles.length === 0) {
    console.error('❌ Keine Private Keys gefunden!');
    console.error('💡 Generiere zuerst ein Key-Pair: node scripts/complete-api-key-setup.js');
    process.exit(1);
}

// Neuestes Key-Pair
const latestKeyFile = keyFiles.sort().reverse()[0];
const apiKeyId = latestKeyFile.replace('-private-key.pem', '');
const privateKeyPath = path.join(KEYS_DIR, `${apiKeyId}-private-key.pem`);
const publicKeyPath = path.join(KEYS_DIR, `${apiKeyId}-public-key.pem`);

console.log('📋 Gefundenes Key-Pair:');
console.log('  apiKeyId:', apiKeyId);
console.log('  Private Key:', privateKeyPath);
console.log('  Public Key:', publicKeyPath);
console.log('');

// Lade Keys
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

console.log('✅ Keys geladen');
console.log('');

// HTTP Request Helper
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

// Test 1: Register Public Key
console.log('📋 Test 1: Register Public Key...');
makeRequest('POST', '/auth/api-key/register', {
    apiKeyId: apiKeyId,
    publicKey: publicKey
}).then(result => {
    if (result.status === 200) {
        console.log('✅ Public Key registriert!');
        console.log('');
    } else {
        console.error('❌ Fehler beim Registrieren:', result.data);
        if (result.data.error && result.data.error.includes('already exists')) {
            console.log('⚠️  Public Key existiert bereits - das ist OK');
            console.log('');
        } else {
            process.exit(1);
        }
    }

    // Test 2: Get Challenge
    console.log('📋 Test 2: Get Challenge...');
    return makeRequest('POST', '/auth/api-key/challenge', {
        apiKeyId: apiKeyId
    });
}).then(result => {
    if (result.status === 200 && result.data.challenge) {
        const challenge = result.data.challenge;
        console.log('✅ Challenge erhalten!');
        console.log('  Challenge:', challenge.substring(0, 50) + '...');
        console.log('  Challenge length:', challenge.length);
        console.log('');

        // Test 3: Sign Challenge
        console.log('📋 Test 3: Sign Challenge...');
        const sign = crypto.createSign('RSA-SHA256');
        sign.update(challenge);
        sign.end();
        const signature = sign.sign(privateKey, 'base64');
        console.log('✅ Challenge signiert!');
        console.log('  Signature:', signature.substring(0, 50) + '...');
        console.log('  Signature length:', signature.length);
        console.log('');

        // Test 4: Verify Signature locally
        console.log('📋 Test 4: Verify Signature locally...');
        const verify = crypto.createVerify('RSA-SHA256');
        verify.update(challenge);
        verify.end();
        const publicKeyObject = crypto.createPublicKey(publicKey);
        const isValid = verify.verify(publicKeyObject, signature, 'base64');
        
        if (isValid) {
            console.log('✅ Local signature verification: VALID');
            console.log('');
        } else {
            console.error('❌ Local signature verification: INVALID');
            console.error('   Problem: Private Key passt nicht zu Public Key!');
            process.exit(1);
        }

        // Test 5: Get Token
        console.log('📋 Test 5: Get Token...');
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
        console.log('🎉 ALLE TESTS ERFOLGREICH!');
        console.log('');
        console.log('📋 Token:');
        console.log('  Token:', result.data.token.substring(0, 50) + '...');
        console.log('  Expires in:', result.data.expiresIn, 'Sekunden');
        console.log('');
    } else {
        console.error('❌ Fehler beim Token-Generieren:', result.data);
        console.error('');
        console.error('🔍 Mögliche Ursachen:');
        console.error('  1. Challenge ist abgelaufen (60 Sekunden)');
        console.error('  2. Challenge stimmt nicht überein');
        console.error('  3. Signature wird nicht korrekt übertragen');
        console.error('  4. Public Key wurde nicht korrekt registriert');
        console.error('');
        console.error('💡 Prüfe CloudWatch Logs für Details');
        process.exit(1);
    }
}).catch(error => {
    console.error('❌ Fehler:', error.message);
    console.error('');
    console.error('🔍 Mögliche Ursachen:');
    console.error('  1. Netzwerk-Problem');
    console.error('  2. API-Endpoint nicht erreichbar');
    console.error('  3. Challenge ist abgelaufen');
    console.error('');
    process.exit(1);
});

