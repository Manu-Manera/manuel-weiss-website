#!/usr/bin/env node
/**
 * Auto Sign Challenge
 * Liest Challenge und apiKeyId aus Postman Environment File und signiert automatisch
 * 
 * Usage: 
 *   node scripts/auto-sign-challenge.js [apiKeyId] [postman-env-file]
 *   node scripts/auto-sign-challenge.js <apiKeyId>
 *   export apiKeyId="..." && node scripts/auto-sign-challenge.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Postman Environment File (optional)
const envFile = process.argv[2] || path.join(__dirname, '..', 'postman', 'Manuel-Weiss-API.postman_environment.json');
const keysDir = path.join(__dirname, '..', 'keys');

console.log('🔍 Suche Challenge und apiKeyId...');
console.log('');

// Versuche aus verschiedenen Quellen zu lesen
let challenge = null;
let apiKeyId = process.argv[3] || process.env.apiKeyId || null; // Kann als Parameter übergeben werden

// 1. Aus Command-Line Parameter
if (process.argv[2] && process.argv[2] !== '--file' && !process.argv[2].endsWith('.json')) {
    // Erster Parameter könnte apiKeyId sein
    if (!apiKeyId && process.argv[2].length > 10) {
        apiKeyId = process.argv[2];
        console.log('✅ apiKeyId aus Parameter gelesen');
    }
}

// 2. Aus Environment File
if (fs.existsSync(envFile)) {
    try {
        const envData = JSON.parse(fs.readFileSync(envFile, 'utf8'));
        const values = envData.values || [];
        
        for (const item of values) {
            if (item.key === 'challenge' && item.value && item.value !== 'Enter value' && !challenge) {
                challenge = item.value;
                console.log('✅ Challenge gefunden in Environment File');
            }
            if (item.key === 'apiKeyId' && item.value && item.value !== 'Enter value' && !apiKeyId) {
                apiKeyId = item.value;
                console.log('✅ apiKeyId gefunden in Environment File');
            }
        }
    } catch (error) {
        console.log('⚠️  Konnte Environment File nicht lesen:', error.message);
    }
}

// 2. Aus challenge.txt (falls vorhanden)
if (!challenge) {
    const challengeFile = path.join(__dirname, '..', 'challenge.txt');
    if (fs.existsSync(challengeFile)) {
        challenge = fs.readFileSync(challengeFile, 'utf8').trim();
        console.log('✅ Challenge gefunden in challenge.txt');
    }
}

// 3. Aus Zwischenablage (macOS) - für Challenge
if (!challenge && process.platform === 'darwin') {
    try {
        const { execSync } = require('child_process');
        const clipboard = execSync('pbpaste', { encoding: 'utf8' }).trim();
        // Prüfe ob es eine Challenge ist (Base64, lang)
        if (clipboard && clipboard.length > 20 && clipboard.match(/^[A-Za-z0-9+/=]+$/)) {
            challenge = clipboard;
            console.log('✅ Challenge gefunden in Zwischenablage');
        }
    } catch (error) {
        // Ignoriere
    }
}

// 4. Aus Zwischenablage (macOS) - für apiKeyId (falls noch nicht gefunden)
if (!apiKeyId && process.platform === 'darwin') {
    try {
        const { execSync } = require('child_process');
        const clipboard = execSync('pbpaste', { encoding: 'utf8' }).trim();
        // Prüfe ob es eine UUID/API Key ID ist (Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
        if (clipboard && clipboard.match(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i)) {
            apiKeyId = clipboard;
            console.log('✅ apiKeyId gefunden in Zwischenablage');
        }
    } catch (error) {
        // Ignoriere
    }
}

// Prüfe ob alles vorhanden ist
if (!challenge) {
    console.error('❌ Challenge nicht gefunden!');
    console.log('');
    console.log('Optionen:');
    console.log('1. Kopiere Challenge in challenge.txt:');
    console.log('   echo "<challenge>" > challenge.txt');
    console.log('');
    console.log('2. Kopiere Challenge in Zwischenablage (macOS)');
    console.log('');
    console.log('3. Stelle sicher, dass challenge in Postman Environment Variable gesetzt ist');
    process.exit(1);
}

if (!apiKeyId) {
    console.error('❌ apiKeyId nicht gefunden!');
    console.log('');
    console.log('Optionen:');
    console.log('1. Als Parameter übergeben:');
    console.log('   node scripts/auto-sign-challenge.js <apiKeyId>');
    console.log('');
    console.log('2. In Zwischenablage kopieren (UUID-Format)');
    console.log('   Dann Script erneut ausführen');
    console.log('');
    console.log('3. In Postman Environment Variable setzen');
    console.log('   Dann Script erneut ausführen');
    console.log('');
    console.log('4. Als Environment Variable:');
    console.log('   export apiKeyId="your-api-key-id"');
    console.log('   node scripts/auto-sign-challenge.js');
    process.exit(1);
}

console.log('');
console.log('📋 Gefunden:');
console.log('  apiKeyId:', apiKeyId);
console.log('  challenge:', challenge.substring(0, 50) + '...');
console.log('');

// Lade Private Key
const privateKeyPath = path.join(keysDir, `${apiKeyId}-private-key.pem`);

if (!fs.existsSync(privateKeyPath)) {
    console.error('❌ Private Key nicht gefunden:', privateKeyPath);
    console.log('');
    console.log('Prüfe ob apiKeyId korrekt ist und Private Key existiert');
    process.exit(1);
}

const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
console.log('✅ Private Key geladen');
console.log('');

// Signiere Challenge
console.log('🔐 Signiere Challenge...');
const sign = crypto.createSign('RSA-SHA256');
sign.update(challenge);
sign.end();

const signature = sign.sign(privateKey, 'base64');

console.log('');
console.log('✅ Signatur generiert!');
console.log('');
console.log('📋 Signatur (wird automatisch in Postman Environment File gespeichert):');
console.log('─'.repeat(60));
console.log(signature);
console.log('─'.repeat(60));
console.log('');

// Speichere in Environment File
if (fs.existsSync(envFile)) {
    try {
        const envData = JSON.parse(fs.readFileSync(envFile, 'utf8'));
        const values = envData.values || [];
        
        // Finde oder erstelle signature Variable
        let found = false;
        for (const item of values) {
            if (item.key === 'signature') {
                item.value = signature;
                found = true;
                break;
            }
        }
        
        if (!found) {
            values.push({
                key: 'signature',
                value: signature,
                type: 'default',
                enabled: true
            });
        }
        
        fs.writeFileSync(envFile, JSON.stringify(envData, null, 2));
        console.log('✅ Signature in Environment File gespeichert:', envFile);
    } catch (error) {
        console.log('⚠️  Konnte nicht in Environment File speichern:', error.message);
        console.log('💡 Kopiere Signature manuell in Postman Environment Variable');
    }
}

// Kopiere in Zwischenablage
try {
    const { execSync } = require('child_process');
    if (process.platform === 'darwin') {
        execSync(`echo "${signature}" | pbcopy`);
        console.log('✅ Signature in Zwischenablage kopiert (macOS)');
    } else if (process.platform === 'linux') {
        execSync(`echo "${signature}" | xclip -selection clipboard`);
        console.log('✅ Signature in Zwischenablage kopiert (Linux)');
    } else if (process.platform === 'win32') {
        execSync(`echo ${signature} | clip`);
        console.log('✅ Signature in Zwischenablage kopiert (Windows)');
    }
} catch (error) {
    // Ignoriere
}

console.log('');
console.log('🎉 Fertig! Signature ist bereit für Postman.');

