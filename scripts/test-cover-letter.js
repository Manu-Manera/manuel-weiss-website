#!/usr/bin/env node
/**
 * Automatischer Test für den KI-Anschreiben-Generator.
 *
 * Voraussetzungen:
 *   npm install puppeteer
 *
 * Verwendung:
 *   node scripts/test-cover-letter.js \
 *     --url https://mawps.netlify.app/applications/application-generator.html
 *
 * Hinweis:
 *   Das Skript öffnet einen sichtbaren Browser. Bitte melde dich manuell an,
 *   sobald der Login-Dialog erscheint. Danach übernimmt das Skript wieder.
 */

import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const DEFAULT_URL = 'https://mawps.netlify.app/applications/application-generator.html';
const args = process.argv.slice(2);

function getArg(name, fallback) {
    const prefix = `--${name}=`;
    const entry = args.find(arg => arg.startsWith(prefix));
    if (entry) return entry.replace(prefix, '');
    const index = args.indexOf(`--${name}`);
    if (index >= 0 && args[index + 1]) return args[index + 1];
    return fallback;
}

const targetUrl = getArg('url', DEFAULT_URL);
const timeout = parseInt(getArg('timeout', '600000'), 10); // 10 Minuten für manuellen Login

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();
    const logs = [];

    page.on('console', msg => {
        const text = msg.text();
        console.log(`[Browser] ${text}`);
        logs.push(`[${new Date().toISOString()}] ${text}`);
    });

    try {
        console.log(`🌐 Öffne ${targetUrl}`);
        await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 120000 });

        console.log('🔐 Bitte im sichtbaren Browser anmelden (max. 10 Minuten)...');
        await page.waitForFunction(
            () => window.realUserAuth && window.realUserAuth.isLoggedIn && window.realUserAuth.isLoggedIn(),
            { timeout }
        );
        console.log('✅ Login erkannt, fahre mit Test fort...');

        // Sicherheitshalber Seite neu laden, damit authentifizierte Daten vorhanden sind
        await page.reload({ waitUntil: 'networkidle2' });

        // Warte auf Buttons
        await page.waitForSelector('#generateBtn', { timeout: 60000 });

        // Ausfüllen nur falls leer
        await page.evaluate(() => {
            const fill = (selector, value) => {
                const el = document.querySelector(selector);
                if (el && !el.value) el.value = value;
            };
            fill('#jobTitle', 'Senior Transformation Consultant');
            fill('#companyName', 'Musterfirma AG');
            fill('#jobDescription', 'Wir suchen eine erfahrene Person mit Fokus auf Change Management, AI und digitale Transformation.');
        });

        console.log('🚀 Starte Generierung...');
        await page.click('#generateBtn');

        // Warte auf Resultat oder Fehlerhinweis
        const result = await Promise.race([
            page.waitForSelector('#generatedContent textarea', { timeout: 120000 }).then(() => 'success'),
            page.waitForFunction(
                () => !!document.querySelector('.notification.error'),
                { timeout: 120000 }
            ).then(() => 'error')
        ]);

        if (result === 'success') {
            const text = await page.$eval('#generatedText', el => el.value.trim());
            console.log(`✅ Anschreiben generiert (${text.length} Zeichen)`);
        } else {
            const errorText = await page.$eval('.notification.error', el => el.textContent.trim());
            console.error(`❌ Fehlermeldung im UI: ${errorText}`);
        }

        // Speichere Browser-Logs
        const logPath = path.join(process.cwd(), 'scripts', `cover-letter-test-${Date.now()}.log`);
        fs.writeFileSync(logPath, logs.join('\n'), 'utf8');
        console.log(`📝 Browser-Logs gespeichert unter ${logPath}`);

    } catch (error) {
        console.error('❌ Test fehlgeschlagen:', error);
    } finally {
        await browser.close();
    }
})();

