#!/usr/bin/env node
/**
 * Test: Abwesenheit-Geschichte (19 Zeilen) - analysiert warum es fehlschlägt
 * Aufruf: OPENAI_API_KEY=sk-... node scripts/test-bpmn-abwesenheit.js [--lambda]
 */

const path = require('path');
const API_BASE = process.env.BPMN_API_BASE || 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1';
const ENDPOINT = API_BASE.replace(/\/$/, '') + '/text-to-bpmn-gpt';
const USE_LAMBDA = process.argv.includes('--lambda');
const OPENAI_API_KEY = (process.env.OPENAI_API_KEY || '').trim();

const ABWESENHEIT_TEXT = `Mitarbeitende:r: Abwesenheit im System erfassen (Ferien/UL/krank). Zeitraum wählen. Kommentar hinzufügen.
Vorgesetzte:r: Prüft Teamplanung. Genehmigt oder lehnt ab. Alternativtermin vorschlagen.
HR Admin: Kontrolliert Regeln im System (Ferienkonto, Sperrfristen, Berechtigung). Unterstützt bei Fehlern.
Ferien (Urlaub): Mitarbeitende:r: Antrag einreichen. Vertretung klären. Übergabe kurz dokumentieren.
Ferien: Vorgesetzte:r: Abgleich mit Peaks/Schichtplan. Genehmigt. Info ans Team.
Ferien: Payroll/HR Admin: Ferienbezug läuft automatisch. Reporting/Saldo aktuell halten.
Unbezahlter Urlaub: Mitarbeitende:r: Antrag mit Grund & Dauer einreichen. Start/Ende klar.
Unbezahlter Urlaub: HRBP: Klärt Auswirkungen (Lohn, BVG/UVG, Versicherungen, Dienstalter, Bewilligung).
Unbezahlter Urlaub: Vorgesetzte:r: Prüft Machbarkeit. Plant Ersatz/Übergabe. Gibt fachliche Freigabe.
Unbezahlter Urlaub: HR Admin/Payroll: Vertragliche Zusatzvereinbarung erstellen. Lohnstop/Abzüge umsetzen. Versicherungs-/BVG-Meldungen machen.
Krankmeldung (kurz): Mitarbeitende:r: Meldet sich sofort bei Linie (Telefon/Chat). Erfasst Abwesenheit im System.
Krankmeldung: Vorgesetzte:r: Bestätigt Erfassung. Sichert Vertretung. Hält Kontakt in angemessenen Abständen.
Krankmeldung: HR Admin: Prüft Attestpflicht ab Tag X gemäss Reglement. Fordert Attest an, wenn nötig.
Krankmeldung (lang): Mitarbeitende:r: Reicht Arztzeugnis ein. Updates bei Verlängerung.
Krankmeldung (lang): HRBP: Case-Management starten. Krankentaggeld-Prozess anstossen. Wiedereingliederung planen.
Krankmeldung (lang): Payroll/HR Admin: KTg-Meldung, Koordination mit Versicherung. Lohnfortzahlung/Taggeld korrekt abrechnen.
Rückkehr: Mitarbeitende:r: Rückkehrdatum im System erfassen. Arbeitsfähigkeit bestätigen.
Vorgesetzte:r: Return-to-Work Gespräch. Aufgabenaufbau planen. Belastung steuern.
HRBP: Bei Bedarf Anpassungen (Pensum, Arbeitsfähigkeit, ärztliche Auflagen, BEM/Integration). Dokumentation sauber halten.`;

async function testViaLambda() {
  const lambdaPath = path.join(__dirname, '..', 'lambda', 'text-to-bpmn-gpt52', 'index.js');
  const handler = require(lambdaPath).handler;
  const event = {
    httpMethod: 'POST',
    body: JSON.stringify({ text: ABWESENHEIT_TEXT, openaiApiKey: OPENAI_API_KEY })
  };
  const result = await handler(event, {});
  const body = JSON.parse(result.body || '{}');
  return { statusCode: result.statusCode, body };
}

async function main() {
  if (!OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY fehlt');
    process.exit(1);
  }
  console.log('Test: Abwesenheit-Geschichte (19 Zeilen)');
  console.log('Modus:', USE_LAMBDA ? 'Lambda direkt' : 'API');
  console.log('---');

  const res = USE_LAMBDA ? await testViaLambda() : await (async () => {
    const r = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: ABWESENHEIT_TEXT, openaiApiKey: OPENAI_API_KEY })
    });
    const text = await r.text();
    let body;
    try { body = JSON.parse(text); } catch (_) { body = { error: 'Invalid JSON', raw: text.slice(0, 500) }; }
    return { statusCode: r.status, body };
  })();

  console.log('Status:', res.statusCode);
  console.log('success:', res.body.success);
  if (res.body.error) console.log('error:', res.body.error);
  if (res.body.assumptions) console.log('assumptions:', res.body.assumptions);
  if (res.body.bpmnXml) {
    const taskCount = (res.body.bpmnXml.match(/bpmn:task\s+id=/g) || []).length;
    console.log('Tasks im BPMN:', taskCount);
  }
  if (res.statusCode !== 200 || !res.body.success) {
    console.log('\n--- Vollständige Antwort ---');
    console.log(JSON.stringify(res.body, null, 2).slice(0, 3000));
  }
}

main().catch(e => { console.error(e); process.exit(1); });
