#!/usr/bin/env node
/**
 * Test mit Postman Werten
 * Testet ob Challenge und Signature aus Postman korrekt sind
 * 
 * Usage: node scripts/test-with-postman-values.js <apiKeyId> <challenge> <signature>
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = 'https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod';
const KEYS_DIR = path.join(__dirname, '..', 'keys');

const apiKeyId = process.argv[2];
const challenge = process.argv[3];
const signature = process.argv[4];

if (!apiKeyId || !challenge || !signature) {
    console.error('❌ Usage: node scripts/test-with-postman-values.js <apiKeyId> <challenge> <signature>');
    console.error('');
    console.error('💡 Hole die Werte aus Postman:');
    console.error('   - apiKeyId: Environment Variable');
    console.error('   - challenge: Environment Variable (nach Request 2)');
    console.error('   - signature: Environment Variable (nach Request 2.5)');
    process.exit(1);
}

console.log('🧪 Test mit Postman Werten');
console.log('');
console.log('📋 Input:');
console.log('  apiKeyId:', apiKeyId);
console.log('  challenge length:', challenge.length);
console.log('  challenge:', challenge.substring(0, 50) + '...');
console.log('  signature length:', signature.length);
console.log('  signature:', signature.substring(0, 50) + '...');
console.log('');

// Lade Keys
const privateKeyPath = path.join(KEYS_DIR, `${apiKeyId}-private-key.pem`);
const publicKeyPath = path.join(KEYS_DIR, `${apiKeyId}-public-key.pem`);

if (!fs.existsSync(privateKeyPath) || !fs.existsSync(publicKeyPath)) {
    console.error('❌ Keys nicht gefunden für:', apiKeyId);
    console.error('  Private Key:', privateKeyPath);
    console.error('  Public Key:', publicKeyPath);
    process.exit(1);
}

const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

console.log('✅ Keys geladen');
console.log('');

// Test 1: Lokale Verifizierung
console.log('📋 Test 1: Lokale Signature-Verifizierung...');
const verify = crypto.createVerify('RSA-SHA256');
verify.update(challenge);
verify.end();
const publicKeyObject = crypto.createPublicKey(publicKey);
const isValid = verify.verify(publicKeyObject, signature, 'base64');

if (isValid) {
    console.log('✅ Lokale Verifizierung: VALID');
    console.log('');
} else {
    console.error('❌ Lokale Verifizierung: INVALID');
    console.error('');
    console.error('🔍 Mögliche Ursachen:');
    console.error('  1. Challenge stimmt nicht überein');
    console.error('  2. Signature wurde nicht korrekt generiert');
    console.error('  3. Private Key passt nicht zu Public Key');
    console.error('');
    
    // Versuche Signature neu zu generieren
    console.log('🔄 Versuche Signature neu zu generieren...');
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(challenge);
    sign.end();
    const newSignature = sign.sign(privateKey, 'base64');
    
    console.log('  Neue Signature:', newSignature.substring(0, 50) + '...');
    console.log('  Alte Signature:', signature.substring(0, 50) + '...');
    console.log('  Stimmen überein:', newSignature === signature);
    console.log('');
    
    if (newSignature !== signature) {
        console.error('❌ Signature stimmt nicht überein!');
        console.error('   Die Signature in Postman wurde nicht mit diesem Private Key generiert!');
        console.error('');
        console.error('💡 Lösung:');
        console.error('  1. Stelle sicher, dass Request 2.5 den richtigen Private Key verwendet');
        console.error('  2. Prüfe ob apiKeyId in Request 2.5 korrekt ist');
        console.error('  3. Führe Request 2.5 erneut aus');
    }
    
    process.exit(1);
}

// Test 2: Token Request
console.log('📋 Test 2: Token Request an Lambda...');
const url = new URL(BASE_URL + '/auth/api-key/token');
const options = {
    hostname: url.hostname,
    port: url.port || 443,
    path: url.pathname,
    method: 'POST',
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
            
            if (res.statusCode === 200 && json.token) {
                console.log('✅ Token erfolgreich generiert!');
                console.log('');
                console.log('📋 Token:');
                console.log('  Token:', json.token.substring(0, 50) + '...');
                console.log('  Expires in:', json.expiresIn, 'Sekunden');
                console.log('');
            } else {
                console.error('❌ Token konnte nicht generiert werden');
                console.error('  Status:', res.statusCode);
                console.error('  Response:', JSON.stringify(json, null, 2));
                console.error('');
                
                if (json.error === 'Invalid signature') {
                    console.error('🔍 Debug Info:');
                    console.error('  Lokale Verifizierung: VALID ✅');
                    console.error('  Lambda Verifizierung: INVALID ❌');
                    console.error('');
                    console.error('💡 Mögliche Ursachen:');
                    console.error('  1. Challenge ist abgelaufen (60 Sekunden)');
                    console.error('  2. Challenge stimmt nicht überein (wurde zwischen Request 2 und 3 geändert)');
                    console.error('  3. Public Key wurde nicht korrekt registriert');
                    console.error('  4. Lambda verwendet anderen Public Key');
                    console.error('');
                    console.error('🔧 Lösung:');
                    console.error('  1. Führe Request 2 (Get Challenge) erneut aus');
                    console.error('  2. Führe Request 2.5 (Generate Signature) SOFORT aus');
                    console.error('  3. Führe Request 3 (Get Token) SOFORT aus');
                    console.error('  4. Prüfe CloudWatch Logs für Details');
                }
            }
        } catch (e) {
            console.error('❌ Response parse error:', e);
            console.error('  Raw response:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request error:', error);
});

req.write(JSON.stringify({
    apiKeyId: apiKeyId,
    challenge: challenge,
    signature: signature
}));
req.end();

