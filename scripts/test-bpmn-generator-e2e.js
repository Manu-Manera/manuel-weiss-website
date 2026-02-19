#!/usr/bin/env node
/**
 * E2E-Test: BPMN-Generator auf https://manuel-weiss.ch/bpmn-generator.html
 * - Frischer Browser-Kontext (Incognito)
 * - Text eingeben, Button klicken, Ergebnis dokumentieren
 */

const puppeteer = require('puppeteer');

const URL = 'https://manuel-weiss.ch/bpmn-generator.html';
const PROCESS_TEXT = `Mitarbeiter füllt Ferien Antrag aus
Teamleitung bestätigt oder lehnt ab
Bereichsleitung bestätigt oder lehnt ab
HR hinterlegt Urlaub in Zeitsystem und erstellt Bestätigung die im Dossier abgelegt wird
Payroll veranlasst Auszahlung Urlaubsgeld
Ende`;

async function main() {
  let browser;
  const results = {
    success: false,
    errorMessage: null,
    uiErrorTextExact: '',
    diagramErrorText: null,
    resultAreaWithXml: false,
    httpStatus: null,
    responseBody: null,
    responseBodyRaw: null,
    downloadStarted: false,
    bpmnDisplayed: false,
    diagramRendered: false,
    diagramAppearance: null,
    xmlTabFilled: false,
    bpmnImportFailed: false,
    containerPreview: '',
    consoleErrors: []
  };

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--incognito', '--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.createBrowserContext();
    const page = await context.newPage();

    const downloadDir = require('path').join(require('os').tmpdir(), 'bpmn-test-' + Date.now());
    require('fs').mkdirSync(downloadDir, { recursive: true });
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: downloadDir });

    // Warte explizit auf die text-to-bpmn-gpt Response
    const responsePromise = page.waitForResponse(
      res => res.url().includes('text-to-bpmn') && res.request().method() === 'POST',
      { timeout: 40000 }
    ).then(async res => {
      const body = await res.text();
      return { url: res.url(), status: res.status(), statusText: res.statusText(), body };
    }).catch(e => ({ error: e.message }));

    // Alle Konsolen-Ausgaben sammeln (Errors + Warnings für Kontext)
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') {
        results.consoleErrors.push({ type, text });
      } else if (type === 'warning' && (text.includes('CORS') || text.includes('Failed') || text.includes('JSON'))) {
        results.consoleErrors.push({ type, text });
      }
    });

    console.log('1. Navigiere zu', URL);
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });

    console.log('2. Warte auf Button "BPMN mit GPT 5.2 generieren"...');
    await page.waitForSelector('#bpmnGenerateBtn', { visible: true, timeout: 10000 });

    console.log('3. Fülle Prozessbeschreibung ein...');
    await page.click('#bpmnProcessText', { clickCount: 3 });
    await page.type('#bpmnProcessText', PROCESS_TEXT, { delay: 20 });

    console.log('4. Klicke auf "BPMN mit GPT 5.2 generieren"...');
    await page.click('#bpmnGenerateBtn');

    console.log('5. Warte auf API-Response (max 40s)...');
    const apiResponse = await responsePromise;

    console.log('6. Warte auf UI-Update (5s)...');
    await new Promise(r => setTimeout(r, 5000));

    // Ergebnis prüfen: Diagramm-Bereich, XML-Tab, Konsole
    const diagramState = await page.evaluate(() => {
      const container = document.getElementById('bpmnDiagramContainer');
      const xmlOutput = document.getElementById('bpmnXmlOutput');
      const errEl = document.getElementById('bpmnError');
      const resultArea = document.getElementById('bpmnResultArea');

      let diagramAppearance = 'unbekannt';
      if (container) {
        const html = container.innerHTML || '';
        if (html.includes('Diagramm konnte nicht geladen') || html.includes('Siehe Konsole') || html.includes('BPMN import')) {
          diagramAppearance = 'fehlermeldung';
        } else if (container.querySelector('.bjs-container') || container.querySelector('svg') || container.querySelector('canvas') || container.querySelector('.djs-container')) {
          diagramAppearance = 'diagramm_gerendert';
        } else if (container.textContent.trim().length > 0) {
          diagramAppearance = 'text_oder_meldung';
        } else {
          diagramAppearance = 'leer';
        }
      }

      return {
        resultAreaVisible: resultArea && getComputedStyle(resultArea).display !== 'none',
        diagramAppearance,
        xmlTabContent: xmlOutput ? xmlOutput.textContent.trim().length : 0,
        xmlHasBpmn: xmlOutput ? xmlOutput.textContent.includes('bpmn:definitions') : false,
        pageError: errEl && errEl.textContent.trim().length > 0 ? errEl.textContent.trim() : null,
        containerInnerText: container ? container.innerText.substring(0, 200) : ''
      };
    });

    results.diagramRendered = diagramState.diagramAppearance === 'diagramm_gerendert';
    results.diagramAppearance = diagramState.diagramAppearance;
    results.xmlTabFilled = diagramState.xmlHasBpmn && diagramState.xmlTabContent > 100;
    results.bpmnDisplayed = diagramState.resultAreaVisible;
    results.errorMessage = diagramState.pageError || null;
    results.containerPreview = diagramState.containerInnerText;

    if (apiResponse && !apiResponse.error) {
      results.httpStatus = apiResponse.status;
      results.apiUrl = apiResponse.url;
      results.responseBodyRaw = apiResponse.body;
      try {
        const parsed = JSON.parse(apiResponse.body);
        results.responseBody = parsed;
        if (parsed.error) results.errorMessage = results.errorMessage || parsed.error;
      } catch (_) {
        results.responseBody = { raw: (apiResponse.body || '').substring(0, 1500) };
      }
    } else if (apiResponse && apiResponse.error) {
      results.errorMessage = results.errorMessage || apiResponse.error;
    }

    // Fehlertext 1:1 aus dem roten Fehlerbereich (#bpmnError)
    const uiErrorEl = await page.$('#bpmnError');
    if (uiErrorEl) {
      results.uiErrorTextExact = await page.evaluate(el => el.textContent.trim(), uiErrorEl);
    }
    // Falls Fehler im Diagramm-Container (z. B. "Diagramm konnte nicht geladen")
    const diagramErr = await page.evaluate(() => {
      const c = document.getElementById('bpmnDiagramContainer');
      if (!c) return null;
      const t = c.textContent || '';
      if (t.includes('Diagramm konnte nicht') || t.includes('no diagram')) return t.trim().substring(0, 300);
      return null;
    });
    if (diagramErr) results.diagramErrorText = diagramErr;

    results.resultAreaWithXml = diagramState.resultAreaVisible && diagramState.xmlHasBpmn;

    const fs = require('fs');
    try {
      const files = fs.readdirSync(downloadDir);
      results.downloadStarted = files.some(f => f === 'prozess.bpmn' || f.includes('prozess'));
    } catch (_) {}

    results.success = results.bpmnDisplayed && results.diagramRendered && !results.errorMessage;
    results.bpmnImportFailed = results.consoleErrors.some(e => (e.text || '').includes('BPMN import failed'));

  } catch (err) {
    results.errorMessage = results.errorMessage || err.message;
    console.error('Fehler:', err.message);
  } finally {
    if (browser) await browser.close();
  }

  // Ausgabe (Stichpunkte wie vom User gewünscht)
  const diagramStatus = results.diagramRendered ? 'Diagramm gerendert' : (results.diagramErrorText ? 'Import-Fehlermeldung' : (results.diagramAppearance || 'nicht sichtbar'));
  console.log('\n========== ZUSAMMENFASSUNG ==========\n');
  console.log('• Roter Fehlertext im UI:', results.uiErrorTextExact || '(keiner)');
  console.log('• HTTP-Status:', results.httpStatus || '-');
  console.log('• Response-Body:', results.responseBodyRaw ? (results.responseBodyRaw.length > 250 ? results.responseBodyRaw.substring(0, 250) + '...' : results.responseBodyRaw) : '-');
  console.log('• Ergebnisbereich mit XML sichtbar:', results.resultAreaWithXml ? 'JA' : 'NEIN');
  console.log('• Download "prozess.bpmn" automatisch:', results.downloadStarted ? 'JA' : 'NEIN');
  console.log('• Diagramm-Tab:', diagramStatus);
  if (results.diagramErrorText) console.log('• Diagramm-Fehlermeldung (Auszug):', results.diagramErrorText.substring(0, 100));
  console.log('• Konsolen-Errors:', results.consoleErrors.length ? results.consoleErrors.map(e => e.text).join(' | ') : '(keine)');
  console.log('\n======================================\n');

  process.exit(results.success ? 0 : 1);
}

main();
