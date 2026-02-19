#!/usr/bin/env node
/**
 * Automatischer Test: HR-Prozessgeschichten an BPMN-API senden (oder Lambda direkt aufrufen) und prüfen.
 *
 * Aufruf:
 *   OPENAI_API_KEY=sk-... node scripts/test-bpmn-stories.js   # GPT-Integration (API oder Lambda)
 *   OPENAI_API_KEY=sk-... node scripts/test-bpmn-stories.js --lambda   # Nur Lambda direkt
 *   BPMN_API_BASE=https://... node scripts/test-bpmn-stories.js
 *
 * Ohne OPENAI_API_KEY schlägt der Test fehl (kein Fallback mehr).
 */

const path = require('path');
const API_BASE = process.env.BPMN_API_BASE || 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1';
const ENDPOINT = API_BASE.replace(/\/$/, '') + '/text-to-bpmn-gpt';
const USE_LAMBDA_DIRECT = process.argv.includes('--lambda');
const OPENAI_API_KEY = (process.env.OPENAI_API_KEY || '').trim();

const HR_STORIES = [
  { id: 'onboarding', title: 'Onboarding neuer Mitarbeiter', text: 'Der neue Mitarbeiter erhält den Arbeitsvertrag per E-Mail. Nach Unterzeichnung meldet sich HR im System an und erstellt den Benutzeraccount. IT richtet Laptop und Zugänge ein. Am ersten Tag findet die Einführungsveranstaltung statt. Anschliessend erhält der Mitarbeiter die Zugangsdaten und kann arbeiten.' },
  { id: 'urlaubsantrag', title: 'Urlaubsantrag', text: 'Der Mitarbeiter stellt einen Urlaubsantrag im System. Der Vorgesetzte prüft den Antrag und genehmigt oder lehnt ab. Bei Genehmigung wird der Urlaub in der Zeiterfassung gebucht und der Mitarbeiter erhält eine Bestätigung. Bei Ablehnung wird der Mitarbeiter benachrichtigt.' },
  { id: 'reisekosten', title: 'Reisekostenabrechnung', text: 'Mitarbeiter reicht Belege und Reisekostenformular ein. Die Abrechnung geht an den Vorgesetzten zur Freigabe. Nach Freigabe prüft Finanzbuchhaltung die Belege. Bei Unstimmigkeiten wird rückgefragt. Nach Prüfung wird die Zahlung ausgelöst.' },
  { id: 'bewerbung', title: 'Bewerbungsprozess', text: 'Bewerber sendet Lebenslauf und Anschreiben. HR prüft die Unterlagen und leitet sie an die Fachabteilung weiter. Bei Eignung wird zum Vorstellungsgespräch eingeladen. Nach dem Gespräch entscheidet die Abteilung. Bei Zusage erhält der Bewerber den Vertragsentwurf.' },
  { id: 'gehaltsabschluss', title: 'Gehaltsabschluss / Lohnrunden', text: 'HR bereitet die Lohnrunde vor und sammelt Vorschläge der Vorgesetzten. Die Vorschläge werden mit dem Budget abgeglichen. Nach Freigabe durch die Geschäftsleitung werden die Gehälter angepasst und die Mitarbeiter schriftlich informiert.' },
  { id: 'offboarding', title: 'Offboarding / Austritt', text: 'Mitarbeiter kündigt. HR bestätigt den Austrittstermin und startet die Checkliste. IT sperrt Zugänge zum Austrittsdatum. Rückgabe von Geräten und Ausweis. Letzte Lohnabrechnung und Arbeitszeugnis werden erstellt. Abschlussgespräch mit Vorgesetztem.' },
  { id: 'schulung', title: 'Schulungsanmeldung', text: 'Mitarbeiter meldet sich für eine Schulung an. Der Vorgesetzte genehmigt die Teilnahme. Nach Genehmigung wird die Anmeldung an den Schulungsanbieter übermittelt. Der Mitarbeiter erhält eine Bestätigung und erinnert sich selbst an den Termin.' }
];

function isValidBpmnXml(xml) {
  if (!xml || typeof xml !== 'string') return { ok: false, reason: 'Kein XML' };
  const s = xml.trim();
  const hasDefinitions = /bpmn:definitions|definitions\s+xmlns:bpmn/.test(s);
  const hasProcess = /bpmn:process|bpmn:process\s+id=/.test(s);
  const hasStart = /bpmn:startEvent|startEvent/.test(s);
  const hasEnd = /bpmn:endEvent|endEvent/.test(s);
  const hasFlow = /bpmn:sequenceFlow|sequenceFlow/.test(s);
  const taskCount = (s.match(/bpmn:task\s+id=/g) || []).length;
  const flowCount = (s.match(/bpmn:sequenceFlow\s+id=/g) || []).length;
  if (!hasDefinitions || !hasProcess) return { ok: false, reason: 'Fehlende definitions/process' };
  if (!hasStart || !hasEnd) return { ok: false, reason: 'Fehlendes startEvent oder endEvent' };
  if (!hasFlow) return { ok: false, reason: 'Keine sequenceFlow' };
  return { ok: true, tasks: taskCount, flows: flowCount };
}

async function testViaApi(story) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: story.text, openaiApiKey: OPENAI_API_KEY })
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (_) {
    return { story, ok: false, reason: 'Ungültige JSON-Antwort', raw: text.slice(0, 200) };
  }
  if (!res.ok) {
    return { story, ok: false, reason: data.error || data.message || `HTTP ${res.status}` };
  }
  if (!data.success || !data.bpmnXml) {
    return { story, ok: false, reason: data.error || 'Kein bpmnXml in der Antwort' };
  }
  const valid = isValidBpmnXml(data.bpmnXml);
  if (!valid.ok) return { story, ok: false, reason: valid.reason };
  return { story, ok: true, tasks: valid.tasks, flows: valid.flows };
}

async function testViaLambda(story) {
  const lambdaPath = path.join(__dirname, '..', 'lambda', 'text-to-bpmn-gpt52', 'index.js');
  const handler = require(lambdaPath).handler;
  const event = {
    httpMethod: 'POST',
    body: JSON.stringify({ text: story.text, openaiApiKey: OPENAI_API_KEY })
  };
  const result = await handler(event, {});
  const body = JSON.parse(result.body || '{}');
  if (result.statusCode !== 200) {
    return { story, ok: false, reason: body.error || `HTTP ${result.statusCode}` };
  }
  if (!body.success || !body.bpmnXml) {
    return { story, ok: false, reason: body.error || 'Kein bpmnXml in der Antwort' };
  }
  const valid = isValidBpmnXml(body.bpmnXml);
  if (!valid.ok) return { story, ok: false, reason: valid.reason };
  return { story, ok: true, tasks: valid.tasks, flows: valid.flows };
}

async function main() {
  const useLambda = USE_LAMBDA_DIRECT;
  console.log('BPMN-Stories automatischer Test (GPT-Integration, kein Fallback)');
  if (!OPENAI_API_KEY) {
    console.error('Fehler: OPENAI_API_KEY fehlt. Aufruf: OPENAI_API_KEY=sk-... node scripts/test-bpmn-stories.js');
    process.exit(1);
  }
  if (useLambda) {
    console.log('Modus: Lambda direkt (ohne API Gateway)');
  } else {
    console.log('Modus: API');
    console.log('Endpoint:', ENDPOINT);
  }
  console.log('Stories:', HR_STORIES.length);
  console.log('---');

  let testFn = useLambda ? testViaLambda : testViaApi;
  const results = [];

  for (const story of HR_STORIES) {
    process.stdout.write(`  ${story.id} … `);
    try {
      let r = await testFn(story);
      if (!useLambda && !r.ok && (r.reason === 'Missing Authentication Token' || (r.reason && r.reason.includes('403')))) {
        console.log('API nicht erreichbar, wechsle zu Lambda direkt.');
        testFn = testViaLambda;
        r = await testViaLambda(story);
      }
      results.push(r);
      if (r.ok) {
        console.log(`OK (Tasks: ${r.tasks}, Flows: ${r.flows})`);
      } else {
        console.log(`FAIL: ${r.reason}`);
      }
    } catch (err) {
      if (!useLambda && testFn === testViaApi) {
        console.log('Fehler, wechsle zu Lambda direkt …');
        testFn = testViaLambda;
        try {
          const r = await testViaLambda(story);
          results.push(r);
          console.log(r.ok ? `OK (Tasks: ${r.tasks}, Flows: ${r.flows})` : `FAIL: ${r.reason}`);
        } catch (e2) {
          results.push({ story, ok: false, reason: e2.message });
          console.log(`ERROR: ${e2.message}`);
        }
      } else {
        results.push({ story, ok: false, reason: err.message });
        console.log(`ERROR: ${err.message}`);
      }
    }
  }

  console.log('---');
  const passed = results.filter(r => r.ok).length;
  const failed = results.length - passed;
  console.log(`Ergebnis: ${passed}/${results.length} bestanden, ${failed} fehlgeschlagen`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
