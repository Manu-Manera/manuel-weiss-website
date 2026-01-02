#!/usr/bin/env node
/**
 * Challenge Signer
 * Signiert eine Challenge mit einem Private Key
 * 
 * Usage: node scripts/sign-challenge.js <challenge> [private-key-path]
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const challenge = process.argv[2];
const privateKeyPath = process.argv[3] || process.env.PRIVATE_KEY_PATH;

if (!challenge) {
    console.error('❌ Fehler: Challenge fehlt');
    console.log('');
    console.log('Usage: node scripts/sign-challenge.js <challenge> [private-key-path]');
    console.log('');
    console.log('Beispiel:');
    console.log('  node scripts/sign-challenge.js "abc123..."');
    console.log('  node scripts/sign-challenge.js "abc123..." ./keys/my-key-private-key.pem');
    process.exit(1);
}

// Lade Private Key
let privateKey;
if (privateKeyPath && fs.existsSync(privateKeyPath)) {
    privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    console.log('📁 Private Key geladen von:', privateKeyPath);
} else if (process.env.PRIVATE_KEY) {
    privateKey = process.env.PRIVATE_KEY;
    console.log('📁 Private Key geladen von Environment Variable');
} else {
    console.error('❌ Fehler: Private Key nicht gefunden');
    console.log('');
    console.log('Optionen:');
    console.log('1. Private Key als Datei angeben: node scripts/sign-challenge.js <challenge> <private-key-path>');
    console.log('2. Private Key als Environment Variable: PRIVATE_KEY="..." node scripts/sign-challenge.js <challenge>');
    process.exit(1);
}

// Validiere Private Key Format
try {
    crypto.createPrivateKey(privateKey);
} catch (error) {
    console.error('❌ Fehler: Ungültiges Private Key Format');
    console.error('   Stelle sicher, dass der Key im PEM Format ist (mit BEGIN/END)');
    process.exit(1);
}

// Signiere Challenge
console.log('🔐 Signiere Challenge...');
const sign = crypto.createSign('RSA-SHA256');
sign.update(challenge);
sign.end();

const signature = sign.sign(privateKey, 'base64');

console.log('');
console.log('✅ Signatur generiert!');
console.log('');
console.log('📋 Signatur (für Postman Environment Variable "signature"):');
console.log('─'.repeat(60));
console.log(signature);
console.log('─'.repeat(60));
console.log('');
console.log('💡 Tipp: Signatur wurde automatisch in Zwischenablage kopiert (falls möglich)');

// Versuche in Zwischenablage zu kopieren (nur wenn verfügbar)
try {
    const { execSync } = require('child_process');
    if (process.platform === 'darwin') {
        execSync(`echo "${signature}" | pbcopy`);
        console.log('✅ Signatur in Zwischenablage kopiert (macOS)');
    } else if (process.platform === 'linux') {
        execSync(`echo "${signature}" | xclip -selection clipboard`);
        console.log('✅ Signatur in Zwischenablage kopiert (Linux)');
    } else if (process.platform === 'win32') {
        execSync(`echo ${signature} | clip`);
        console.log('✅ Signatur in Zwischenablage kopiert (Windows)');
    }
} catch (error) {
    // Ignoriere Fehler beim Kopieren
}

