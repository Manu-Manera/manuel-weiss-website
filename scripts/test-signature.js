#!/usr/bin/env node
/**
 * Test Signature Validation
 * Validiert eine Signature lokal, um Probleme zu identifizieren
 * 
 * Usage: node scripts/test-signature.js <challenge> <signature> <public-key-path>
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const challenge = process.argv[2];
const signature = process.argv[3];
const publicKeyPath = process.argv[4];

if (!challenge || !signature || !publicKeyPath) {
    console.error('❌ Fehler: Parameter fehlen');
    console.log('');
    console.log('Usage: node scripts/test-signature.js <challenge> <signature> <public-key-path>');
    console.log('');
    console.log('Beispiel:');
    console.log('  node scripts/test-signature.js "abc123..." "xyz789..." "keys/apiKeyId-public-key.pem"');
    process.exit(1);
}

if (!fs.existsSync(publicKeyPath)) {
    console.error('❌ Fehler: Public Key Datei nicht gefunden:', publicKeyPath);
    process.exit(1);
}

console.log('🧪 Teste Signature-Validierung...');
console.log('');

// Lade Public Key
const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
console.log('📋 Public Key geladen:');
console.log('  Pfad:', publicKeyPath);
console.log('  Länge:', publicKey.length);
console.log('  Erste 100 Zeichen:', publicKey.substring(0, 100));
console.log('');

// Prüfe Public Key Format
try {
    const publicKeyObject = crypto.createPublicKey(publicKey);
    console.log('✅ Public Key Format valid:');
    console.log('  Typ:', publicKeyObject.asymmetricKeyType);
    console.log('  Größe:', publicKeyObject.asymmetricKeySize, 'bits');
    console.log('');
} catch (error) {
    console.error('❌ Public Key Format ungültig:', error.message);
    process.exit(1);
}

// Teste Signature-Validierung
console.log('🔐 Validiere Signature...');
console.log('  Challenge Länge:', challenge.length);
console.log('  Challenge (first 50):', challenge.substring(0, 50));
console.log('  Signature Länge:', signature.length);
console.log('  Signature (first 50):', signature.substring(0, 50));
console.log('');

try {
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(challenge);
    verify.end();
    
    const isValid = verify.verify(publicKey, signature, 'base64');
    
    console.log('📊 Ergebnis:');
    console.log('  Signature valid:', isValid ? '✅ JA' : '❌ NEIN');
    console.log('');
    
    if (!isValid) {
        console.log('❌ Signature-Validierung fehlgeschlagen!');
        console.log('');
        console.log('🔍 Mögliche Ursachen:');
        console.log('1. Challenge wurde falsch signiert');
        console.log('2. Public Key und Private Key passen nicht zusammen');
        console.log('3. Signature wurde nicht korrekt übertragen');
        console.log('4. Challenge wurde zwischen Signatur und Validierung geändert');
        console.log('');
        console.log('💡 Tipps:');
        console.log('- Prüfe ob Challenge exakt die ist, die signiert wurde');
        console.log('- Prüfe ob Public Key zu dem Private Key passt, der signiert hat');
        console.log('- Prüfe ob Signature Base64-encoded ist (keine Newlines)');
        process.exit(1);
    } else {
        console.log('✅ Signature ist gültig!');
        console.log('');
        console.log('💡 Wenn die Validierung hier funktioniert, aber im API nicht:');
        console.log('- Prüfe ob Challenge im API die gleiche ist');
        console.log('- Prüfe ob Public Key im API der gleiche ist');
        console.log('- Prüfe CloudWatch Logs für Details');
    }
} catch (error) {
    console.error('❌ Fehler bei Signature-Validierung:', error.message);
    console.error('  Stack:', error.stack);
    process.exit(1);
}

