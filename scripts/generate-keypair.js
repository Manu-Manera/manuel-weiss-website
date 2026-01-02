#!/usr/bin/env node
/**
 * RSA Key Pair Generator
 * Generiert ein Private/Public Key Pair für API Key Authentifizierung
 * 
 * Usage: node scripts/generate-keypair.js [apiKeyId]
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// API Key ID (optional, wird als UUID generiert wenn nicht angegeben)
const apiKeyId = process.argv[2] || crypto.randomUUID();

console.log('🔑 Generiere RSA Key Pair...');
console.log('📋 API Key ID:', apiKeyId);
console.log('');

// Generiere Key Pair
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

// Speichere Keys in Dateien
const keysDir = path.join(__dirname, '..', 'keys');
if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir, { recursive: true });
}

const privateKeyPath = path.join(keysDir, `${apiKeyId}-private-key.pem`);
const publicKeyPath = path.join(keysDir, `${apiKeyId}-public-key.pem`);

fs.writeFileSync(privateKeyPath, privateKey, { mode: 0o600 }); // Nur für Owner lesbar
fs.writeFileSync(publicKeyPath, publicKey);

console.log('✅ Keys generiert!');
console.log('');
console.log('📁 Private Key gespeichert:', privateKeyPath);
console.log('📁 Public Key gespeichert:', publicKeyPath);
console.log('');
console.log('🔐 Private Key (NICHT TEILEN!):');
console.log('─'.repeat(60));
console.log(privateKey);
console.log('─'.repeat(60));
console.log('');
console.log('🔓 Public Key (für Server-Registrierung):');
console.log('─'.repeat(60));
console.log(publicKey);
console.log('─'.repeat(60));
console.log('');
console.log('📋 Für Postman:');
console.log('1. Setze apiKeyId:', apiKeyId);
console.log('2. Setze publicKey: (siehe oben)');
console.log('3. Setze privateKey: (siehe oben)');
console.log('');
console.log('⚠️  WICHTIG: Private Key niemals teilen oder committen!');
console.log('   Keys sind in .gitignore eingetragen.');

