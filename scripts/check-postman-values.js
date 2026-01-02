#!/usr/bin/env node
/**
 * Check Postman Values
 * Prüft ob die Werte in Postman korrekt sind
 * 
 * Usage: 
 * 1. Kopiere Werte aus Postman Environment Variables
 * 2. node scripts/check-postman-values.js <apiKeyId> "<challenge>" "<signature>"
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const apiKeyId = process.argv[2];
const challenge = process.argv[3];
const signature = process.argv[4];

if (!apiKeyId || !challenge || !signature) {
    console.error('❌ Usage: node scripts/check-postman-values.js <apiKeyId> "<challenge>" "<signature>"');
    console.error('');
    console.error('💡 Hole die Werte aus Postman:');
    console.error('   1. Öffne Postman Environment Variables');
    console.error('   2. Kopiere apiKeyId, challenge, signature');
    console.error('   3. Führe Script aus');
    process.exit(1);
}

console.log('🔍 Check Postman Values');
console.log('');
console.log('📋 Input:');
console.log('  apiKeyId:', apiKeyId);
console.log('  challenge length:', challenge.length);
console.log('  challenge:', challenge.substring(0, 50) + '...');
console.log('  signature length:', signature.length);
console.log('  signature:', signature.substring(0, 50) + '...');
console.log('');

// Lade Keys
const KEYS_DIR = path.join(__dirname, '..', 'keys');
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

// Test 1: Generiere neue Signature mit dieser Challenge
console.log('📋 Test 1: Generiere neue Signature mit dieser Challenge...');
const sign = crypto.createSign('RSA-SHA256');
sign.update(challenge);
sign.end();
const newSignature = sign.sign(privateKey, 'base64');

console.log('  Neue Signature:', newSignature.substring(0, 50) + '...');
console.log('  Postman Signature:', signature.substring(0, 50) + '...');
console.log('  Stimmen überein:', newSignature === signature);
console.log('');

if (newSignature !== signature) {
    console.error('❌ PROBLEM GEFUNDEN!');
    console.error('   Die Signature in Postman wurde NICHT mit dieser Challenge generiert!');
    console.error('');
    console.error('🔍 Mögliche Ursachen:');
    console.error('  1. Challenge wurde zwischen Request 2 und Request 2.5 geändert');
    console.error('  2. Signature wurde mit einer anderen Challenge generiert');
    console.error('  3. Private Key passt nicht zu Public Key');
    console.error('');
    console.error('💡 Lösung:');
    console.error('  1. Führe Request 2 (Get Challenge) erneut aus');
    console.error('  2. Kopiere die Challenge SOFORT');
    console.error('  3. Führe Request 2.5 (Generate Signature) SOFORT aus');
    console.error('  4. Prüfe ob Challenge zwischen Request 2 und 2.5 gleich bleibt');
    process.exit(1);
}

// Test 2: Verifiziere Signature
console.log('📋 Test 2: Verifiziere Signature...');
const verify = crypto.createVerify('RSA-SHA256');
verify.update(challenge);
verify.end();
const publicKeyObject = crypto.createPublicKey(publicKey);
const isValid = verify.verify(publicKeyObject, signature, 'base64');

if (isValid) {
    console.log('✅ Signature-Verifizierung: VALID');
    console.log('');
    console.log('✅ Alle Checks erfolgreich!');
    console.log('');
    console.log('💡 Das Problem liegt NICHT in den Postman-Werten.');
    console.log('   Mögliche Ursachen:');
    console.log('   1. Challenge ist in Lambda abgelaufen');
    console.log('   2. Challenge stimmt nicht überein (wurde zwischen Request 2 und 3 geändert)');
    console.log('   3. Public Key in Lambda passt nicht zu diesem Private Key');
    console.log('');
} else {
    console.error('❌ Signature-Verifizierung: INVALID');
    console.error('');
    console.error('🔍 Problem: Signature kann nicht verifiziert werden!');
    process.exit(1);
}

