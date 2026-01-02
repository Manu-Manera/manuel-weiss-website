#!/usr/bin/env node
/**
 * Formatiert einen Public/Private Key für Postman
 * Konvertiert Newlines zu escaped \n für JSON
 * 
 * Usage: 
 *   node scripts/format-key-for-postman.js <key-file>
 *   Oder: cat key.pem | node scripts/format-key-for-postman.js
 */

const fs = require('fs');
const path = require('path');

// Key aus Datei oder stdin lesen
let keyContent = '';

if (process.argv[2]) {
    // Key aus Datei lesen
    const keyPath = process.argv[2];
    if (!fs.existsSync(keyPath)) {
        console.error('❌ Datei nicht gefunden:', keyPath);
        process.exit(1);
    }
    keyContent = fs.readFileSync(keyPath, 'utf8');
} else {
    // Key aus stdin lesen
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });
    
    rl.on('line', (line) => {
        keyContent += line + '\n';
    });
    
    rl.on('close', () => {
        formatKey(keyContent.trim());
    });
    
    return;
}

// Key formatieren
formatKey(keyContent.trim());

function formatKey(key) {
    if (!key) {
        console.error('❌ Kein Key gefunden');
        process.exit(1);
    }
    
    // Entferne führende/abschließende Whitespace
    key = key.trim();
    
    // Ersetze Newlines durch escaped \n
    const formattedKey = key.replace(/\n/g, '\\n');
    
    console.log('');
    console.log('📋 Formatiert für Postman:');
    console.log('─'.repeat(60));
    console.log(formattedKey);
    console.log('─'.repeat(60));
    console.log('');
    console.log('💡 Kopiere den obigen Text und füge ihn in Postman Environment Variable ein');
    console.log('');
    
    // Versuche in Zwischenablage zu kopieren (macOS)
    try {
        const { execSync } = require('child_process');
        if (process.platform === 'darwin') {
            execSync(`echo "${formattedKey}" | pbcopy`);
            console.log('✅ In Zwischenablage kopiert (macOS)');
        } else if (process.platform === 'linux') {
            execSync(`echo "${formattedKey}" | xclip -selection clipboard`);
            console.log('✅ In Zwischenablage kopiert (Linux)');
        } else if (process.platform === 'win32') {
            execSync(`echo ${formattedKey} | clip`);
            console.log('✅ In Zwischenablage kopiert (Windows)');
        }
    } catch (error) {
        // Ignoriere Fehler beim Kopieren
    }
}

