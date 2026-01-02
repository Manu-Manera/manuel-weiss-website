#!/usr/bin/env node
/**
 * Update Postman Environment
 * Schreibt Keys automatisch in das Environment-File
 * 
 * Usage: node scripts/update-postman-environment.js [apiKeyId]
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const KEYS_DIR = path.join(__dirname, '..', 'keys');
const ENV_FILE = path.join(__dirname, '..', 'postman', 'API-Key-Authentication.postman_environment.json');

console.log('📝 Update Postman Environment');
console.log('');

// Finde neuestes Key-Pair oder verwende angegebenes
let apiKeyId = process.argv[2];

if (!apiKeyId) {
    // Prüfe ob apiKeyId im Environment-File ist
    if (fs.existsSync(ENV_FILE)) {
        try {
            const envData = JSON.parse(fs.readFileSync(ENV_FILE, 'utf8'));
            const apiKeyIdVar = envData.values.find(v => v.key === 'apiKeyId');
            if (apiKeyIdVar && apiKeyIdVar.value && apiKeyIdVar.value !== '') {
                apiKeyId = apiKeyIdVar.value;
                console.log('📋 Verwende apiKeyId aus Environment-File:', apiKeyId);
            }
        } catch (e) {
            // Ignore
        }
    }
    
    // Falls immer noch nicht gefunden, finde neuestes Key-Pair
    if (!apiKeyId) {
        if (!fs.existsSync(KEYS_DIR)) {
            console.error('❌ Keys-Verzeichnis nicht gefunden!');
            console.error('💡 Generiere zuerst ein Key-Pair: node scripts/complete-api-key-setup.js');
            process.exit(1);
        }

        const keyFiles = fs.readdirSync(KEYS_DIR).filter(f => f.endsWith('-private-key.pem'));
        if (keyFiles.length === 0) {
            console.error('❌ Keine Private Keys gefunden!');
            console.error('💡 Generiere zuerst ein Key-Pair: node scripts/complete-api-key-setup.js');
            process.exit(1);
        }

        // Neuestes Key-Pair
        const latestKeyFile = keyFiles.sort().reverse()[0];
        apiKeyId = latestKeyFile.replace('-private-key.pem', '');
        console.log('📋 Verwende neuestes Key-Pair:', apiKeyId);
    }
}

const privateKeyPath = path.join(KEYS_DIR, `${apiKeyId}-private-key.pem`);
const publicKeyPath = path.join(KEYS_DIR, `${apiKeyId}-public-key.pem`);

if (!fs.existsSync(privateKeyPath) || !fs.existsSync(publicKeyPath)) {
    console.error('❌ Keys nicht gefunden für:', apiKeyId);
    process.exit(1);
}

console.log('📋 Gefundenes Key-Pair:');
console.log('  apiKeyId:', apiKeyId);
console.log('  Private Key:', privateKeyPath);
console.log('  Public Key:', publicKeyPath);
console.log('');

// Lade Keys
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

// Formatiere Keys für Postman (mit \n statt echten Newlines)
const publicKeyFormatted = publicKey.replace(/\n/g, '\\n');
const privateKeyFormatted = privateKey.replace(/\n/g, '\\n');

console.log('✅ Keys geladen');
console.log('');

// Lade Environment-File
if (!fs.existsSync(ENV_FILE)) {
    console.error('❌ Environment-File nicht gefunden:', ENV_FILE);
    process.exit(1);
}

const envData = JSON.parse(fs.readFileSync(ENV_FILE, 'utf8'));

// Update Values
let updated = false;
for (const variable of envData.values) {
    if (variable.key === 'apiKeyId') {
        if (variable.value !== apiKeyId) {
            variable.value = apiKeyId;
            updated = true;
            console.log('✅ apiKeyId aktualisiert');
        }
    } else if (variable.key === 'publicKey') {
        if (variable.value !== publicKeyFormatted) {
            variable.value = publicKeyFormatted;
            updated = true;
            console.log('✅ publicKey aktualisiert');
        }
    } else if (variable.key === 'privateKey') {
        if (variable.value !== privateKeyFormatted) {
            variable.value = privateKeyFormatted;
            updated = true;
            console.log('✅ privateKey aktualisiert');
        }
    }
}

if (updated) {
    // Speichere Environment-File
    fs.writeFileSync(ENV_FILE, JSON.stringify(envData, null, '\t'));
    console.log('');
    console.log('✅ Environment-File aktualisiert!');
    console.log('');
    console.log('📋 Nächste Schritte:');
    console.log('1. Importiere das Environment in Postman:');
    console.log('   postman/API-Key-Authentication.postman_environment.json');
    console.log('2. Aktiviere das Environment (Dropdown oben rechts)');
    console.log('3. Fertig! Keys sind jetzt gespeichert und bleiben erhalten!');
    console.log('');
} else {
    console.log('ℹ️  Alle Werte sind bereits aktuell');
    console.log('');
}

