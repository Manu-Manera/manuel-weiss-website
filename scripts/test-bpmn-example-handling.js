#!/usr/bin/env node
/**
 * E2E-Test: Beispiel-Handling + BPMN-Qualität auf bpmn-generator.html
 * - Frischer Inkognito-Kontext
 * - Prüft Vorausfüllung, Focus-Clear, Generierung mit Beispieltext
 */

const puppeteer = require('puppeteer');

const URL = 'https://manuel-weiss.ch/bpmn-generator.html';
const EXPECTED_EXAMPLE = `Mitarbeiter füllt Ferien Antrag aus
Teamleitung bestätigt oder lehnt ab
Bereichsleitung bestätigt oder lehnt ab
HR hinterlegt Urlaub in Zeitsystem und erstellt Bestätigung die im Dossier abgelegt wird
Payroll veranlasst Auszahlung Urlaubsgeld
Ende`;

async function main() {
  let browser;
  const results = {};

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

    const responsePromise = page.waitForResponse(
      res => res.url().includes('text-to-bpmn') && res.request().method() === 'POST',
      { timeout: 45000 }
    ).then(async res => ({ status: res.status(), body: await res.text() })).catch(e => ({ error: e.message }));

    console.log('1. Lade Seite...');
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForSelector('#bpmnProcessText', { visible: true, timeout: 5000 });

    // Schritt 2: Prüfe Vorausfüllung
    const initialValue = await page.evaluate(() => document.getElementById('bpmnProcessText').value);
    results.preFilled = initialValue.trim().replace(/\r\n/g, '\n') === EXPECTED_EXAMPLE.trim();
    console.log('2. Vorausfüllung beim Laden:', results.preFilled ? 'JA' : 'NEIN');

    // Schritt 3: Klick ins Feld – wird geleert?
    await page.click('#bpmnProcessText');
    await new Promise(r => setTimeout(r, 100));
    const afterClick = await page.evaluate(() => document.getElementById('bpmnProcessText').value);
    results.clearsOnClick = afterClick === '';
    console.log('3. Nach Klick ins Feld geleert:', results.clearsOnClick ? 'JA' : 'NEIN');

    // Schritt 4: Seite neu laden, Beispieltext stehen lassen, direkt generieren
    console.log('4. Lade Seite neu...');
    await page.reload({ waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForSelector('#bpmnGenerateBtn', { visible: true, timeout: 5000 });

    const textAfterReload = await page.evaluate(() => document.getElementById('bpmnProcessText').value);
    if (textAfterReload.trim() !== EXPECTED_EXAMPLE.trim()) {
      console.log('   Beispieltext fehlt nach Reload – fülle manuell ein');
      await page.click('#bpmnProcessText', { clickCount: 3 });
      await page.type('#bpmnProcessText', EXPECTED_EXAMPLE, { delay: 15 });
    }

    console.log('5. Klicke direkt auf "BPMN mit GPT 5.2 generieren"...');
    await page.click('#bpmnGenerateBtn');

    const apiResponse = await responsePromise;
    console.log('6. Warte auf UI-Update...');
    await new Promise(r => setTimeout(r, 6000));

    if (apiResponse.error) {
      results.httpStatus = null;
      results.success = false;
    } else {
      results.httpStatus = apiResponse.status;
      try {
        const data = JSON.parse(apiResponse.body);
        results.success = data.success === true;
      } catch (_) {
        results.success = false;
      }
    }

    const pageState = await page.evaluate(() => {
      const container = document.getElementById('bpmnDiagramContainer');
      const interpretation = document.getElementById('bpmnInterpretation');
      const assumptions = document.getElementById('bpmnAssumptions');
      const xmlOutput = document.getElementById('bpmnXmlOutput');
      const resultArea = document.getElementById('bpmnResultArea');

      let taskCount = 0, gatewayCount = 0;
      if (container) {
        const svg = container.querySelector('svg');
        if (svg) {
          taskCount = (svg.querySelectorAll('[data-element-id]') || []).length;
          const all = container.querySelectorAll('.djs-element, [data-element-id], [class*="task"], [class*="gateway"]');
          taskCount = container.querySelectorAll('[class*="bpmn-task"], .djs-shape[data-element-id]').length;
          if (taskCount === 0) {
            taskCount = (container.innerHTML.match(/Task|task/g) || []).length;
          }
        }
      }
      if (xmlOutput && xmlOutput.textContent) {
        const xml = xmlOutput.textContent;
        taskCount = (xml.match(/<[^:>]*:(task|userTask|serviceTask|manualTask)[\s>]/gi) || []).length;
        gatewayCount = (xml.match(/<[^:>]*:(exclusiveGateway|parallelGateway)[\s>]/gi) || []).length;
      }

      return {
        resultVisible: resultArea && getComputedStyle(resultArea).display !== 'none',
        interpretationText: interpretation ? interpretation.textContent.trim().substring(0, 200) : '',
        assumptionsText: assumptions ? assumptions.textContent.trim().substring(0, 200) : '',
        interpretationVisible: interpretation && getComputedStyle(interpretation.closest('div') || interpretation).display !== 'none',
        assumptionsVisible: assumptions && getComputedStyle(assumptions.closest('div') || assumptions).display !== 'none',
        taskCount,
        gatewayCount,
        diagramRendered: container && (container.querySelector('svg') || container.querySelector('.bjs-container') || container.querySelector('.djs-container')),
        diagramError: container && container.textContent.includes('Diagramm konnte nicht') ? container.textContent.trim().substring(0, 80) : null
      };
    });

    results.multipleTasksGateways = pageState.taskCount >= 3 && (pageState.gatewayCount >= 1 || pageState.taskCount >= 5);
    results.taskCount = pageState.taskCount;
    results.gatewayCount = pageState.gatewayCount;
    results.interpretationSensible = pageState.interpretationText.length > 50 && (pageState.interpretationText.includes('Rolle') || pageState.interpretationText.includes('Lane') || pageState.interpretationText.includes('Task') || pageState.interpretationText.includes('Schritt'));
    results.assumptionsSensible = pageState.assumptionsText.length > 20;
    results.interpretationVisible = pageState.interpretationVisible;
    results.assumptionsVisible = pageState.assumptionsVisible;
    results.diagramRendered = !!pageState.diagramRendered;
    results.diagramError = pageState.diagramError;

    const files = require('fs').readdirSync(downloadDir).filter(f => f.includes('prozess') || f === 'prozess.bpmn');
    results.autoDownload = files.length > 0;

  } catch (err) {
    results.error = err.message;
    console.error('Fehler:', err.message);
  } finally {
    if (browser) await browser.close();
  }

  console.log('\n========== ZUSAMMENFASSUNG ==========\n');
  console.log('• Beispieltext beim Laden vorausgefüllt:', results.preFilled ? 'JA' : 'NEIN');
  console.log('• Klick ins Feld leert sofort:', results.clearsOnClick ? 'JA' : 'NEIN');
  console.log('• HTTP-Status:', results.httpStatus || '-');
  console.log('• success:true:', results.success ? 'JA' : 'NEIN');
  console.log('• Diagramm: mehrere Tasks + Gateways:', results.multipleTasksGateways ? 'JA' : 'NEIN', `(Tasks: ${results.taskCount}, Gateways: ${results.gatewayCount})`);
  console.log('• Kurz-Interpretation sinnvoll (Rollen/Entscheidungen):', results.interpretationSensible ? 'JA' : 'NEIN');
  console.log('• Annahmen sinnvoll:', results.assumptionsSensible ? 'JA' : 'NEIN');
  console.log('• Download "prozess.bpmn" automatisch:', results.autoDownload ? 'JA' : 'NEIN');
  if (results.diagramError) console.log('• Diagramm-Fehler:', results.diagramError);
  if (results.error) console.log('• Fehler:', results.error);
  console.log('\n======================================\n');
}

main();
