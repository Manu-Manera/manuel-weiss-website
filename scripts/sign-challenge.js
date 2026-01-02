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

// Challenge kann aus verschiedenen Quellen kommen:
// 1. Als Parameter: node scripts/sign-challenge.js "challenge"
// 2. Aus Datei: node scripts/sign-challenge.js --file challenge.txt
// 3. Aus Environment Variable: CHALLENGE="..." node scripts/sign-challenge.js
// 4. Aus Clipboard (macOS): node scripts/sign-challenge.js --clipboard

let challenge = process.argv[2];
const privateKeyPath = process.argv[3] || process.env.PRIVATE_KEY_PATH;

// Prüfe ob Challenge aus Datei gelesen werden soll
if (challenge === '--file' || challenge === '-f') {
    const challengeFile = process.argv[3];
    if (!challengeFile || !fs.existsSync(challengeFile)) {
        console.error('❌ Fehler: Challenge-Datei nicht gefunden:', challengeFile);
        process.exit(1);
    }
    challenge = fs.readFileSync(challengeFile, 'utf8').trim();
    console.log('📁 Challenge aus Datei gelesen:', challengeFile);
} else if (challenge === '--clipboard' || challenge === '-c') {
    // Versuche Challenge aus Clipboard zu lesen (macOS)
    try {
        const { execSync } = require('child_process');
        if (process.platform === 'darwin') {
            challenge = execSync('pbpaste', { encoding: 'utf8' }).trim();
            console.log('📋 Challenge aus Zwischenablage gelesen (macOS)');
        } else if (process.platform === 'linux') {
            challenge = execSync('xclip -selection clipboard -o', { encoding: 'utf8' }).trim();
            console.log('📋 Challenge aus Zwischenablage gelesen (Linux)');
        } else if (process.platform === 'win32') {
            challenge = execSync('powershell -command Get-Clipboard', { encoding: 'utf8' }).trim();
            console.log('📋 Challenge aus Zwischenablage gelesen (Windows)');
        } else {
            throw new Error('Clipboard nicht unterstützt auf diesem System');
        }
    } catch (error) {
        console.error('❌ Fehler beim Lesen aus Zwischenablage:', error.message);
        console.log('💡 Alternative: Kopiere Challenge in eine Datei und verwende --file');
        process.exit(1);
    }
} else if (process.env.CHALLENGE) {
    challenge = process.env.CHALLENGE;
    console.log('📋 Challenge aus Environment Variable gelesen');
}

if (!challenge) {
    console.error('❌ Fehler: Challenge fehlt');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/sign-challenge.js <challenge> [private-key-path]');
    console.log('  node scripts/sign-challenge.js --file <challenge-file> [private-key-path]');
    console.log('  node scripts/sign-challenge.js --clipboard [private-key-path]');
    console.log('  CHALLENGE="..." node scripts/sign-challenge.js [private-key-path]');
    console.log('');
    console.log('Beispiele:');
    console.log('  # Challenge als Parameter:');
    console.log('  node scripts/sign-challenge.js "abc123..."');
    console.log('');
    console.log('  # Challenge aus Datei (empfohlen):');
    console.log('  echo "abc123..." > challenge.txt');
    console.log('  node scripts/sign-challenge.js --file challenge.txt');
    console.log('');
    console.log('  # Challenge aus Zwischenablage:');
    console.log('  # (Kopiere Challenge in Zwischenablage, dann:)');
    console.log('  node scripts/sign-challenge.js --clipboard');
    console.log('');
    console.log('  # Challenge aus Environment Variable:');
    console.log('  CHALLENGE="abc123..." node scripts/sign-challenge.js');
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

