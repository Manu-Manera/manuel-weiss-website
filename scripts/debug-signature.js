#!/usr/bin/env node
/**
 * Debug Signature Verification
 * Testet ob Signature korrekt generiert und verifiziert werden kann
 * 
 * Usage: node scripts/debug-signature.js <apiKeyId> <challenge>
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const apiKeyId = process.argv[2];
const challenge = process.argv[3];

if (!apiKeyId || !challenge) {
    console.error('❌ Usage: node scripts/debug-signature.js <apiKeyId> <challenge>');
    process.exit(1);
}

const KEYS_DIR = path.join(__dirname, '..', 'keys');
const privateKeyPath = path.join(KEYS_DIR, `${apiKeyId}-private-key.pem`);
const publicKeyPath = path.join(KEYS_DIR, `${apiKeyId}-public-key.pem`);

console.log('🔍 Debug Signature Verification');
console.log('');
console.log('📋 Input:');
console.log('  apiKeyId:', apiKeyId);
console.log('  challenge length:', challenge.length);
console.log('  challenge (first 50):', challenge.substring(0, 50) + '...');
console.log('');

// Prüfe ob Keys existieren
if (!fs.existsSync(privateKeyPath)) {
    console.error('❌ Private Key nicht gefunden:', privateKeyPath);
    process.exit(1);
}

if (!fs.existsSync(publicKeyPath)) {
    console.error('❌ Public Key nicht gefunden:', publicKeyPath);
    process.exit(1);
}

console.log('✅ Keys gefunden');
console.log('');

// Lade Keys
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

console.log('📋 Keys:');
console.log('  Private Key length:', privateKey.length);
console.log('  Public Key length:', publicKey.length);
console.log('  Private Key (first 50):', privateKey.substring(0, 50) + '...');
console.log('  Public Key (first 50):', publicKey.substring(0, 50) + '...');
console.log('');

// Generiere Signature
console.log('🔐 Generiere Signature...');
const sign = crypto.createSign('RSA-SHA256');
sign.update(challenge);
sign.end();
const signature = sign.sign(privateKey, 'base64');

console.log('✅ Signature generiert');
console.log('  Signature length:', signature.length);
console.log('  Signature (first 50):', signature.substring(0, 50) + '...');
console.log('');

// Verifiziere Signature
console.log('🔍 Verifiziere Signature...');
const verify = crypto.createVerify('RSA-SHA256');
verify.update(challenge);
verify.end();

const publicKeyObject = crypto.createPublicKey(publicKey);
const isValid = verify.verify(publicKeyObject, signature, 'base64');

console.log('📋 Ergebnis:');
console.log('  Signature valid:', isValid ? '✅ JA' : '❌ NEIN');
console.log('');

if (isValid) {
    console.log('✅ Signature ist korrekt!');
    console.log('');
    console.log('📋 Für Postman:');
    console.log('  signature:', signature);
    console.log('');
} else {
    console.error('❌ Signature ist NICHT korrekt!');
    console.error('');
    console.error('🔍 Mögliche Ursachen:');
    console.error('  1. Challenge stimmt nicht überein');
    console.error('  2. Private Key passt nicht zu Public Key');
    console.error('  3. Challenge ist abgelaufen (60 Sekunden)');
    console.error('');
    process.exit(1);
}

