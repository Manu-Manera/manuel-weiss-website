/**
 * AWS Lambda: Text-to-BPMN mit GPT-5.2
 * Generiert BPMN 2.0 XML aus Prozessbeschreibung (Text) per OpenAI GPT-5.2.
 * POST Body: { text: string, processId?: string, openaiApiKey: string }
 * Response: { success: true, bpmnXml: string, interpretation?: string, assumptions?: string } oder { success: false, error: string }
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

const SYSTEM_PROMPT = `DU BIST: sehr erfahrener BPMN-2.0-Trainer und Senior BPMN-Analyst & Prozessmodellierer.

DEINE ROLLE
- Du verhältst dich wie ein erfahrener Trainer, der Prozesse für Fachbereiche verständlich und nach Best Practices in BPMN 2.0 modelliert.
- Du erkennst eigenständig, wie viele Schritte/Aufgaben und Entscheidungen sinnvoll sind – oft mehr als im Rohtext explizit genannt.
- Du darfst die Geschichte intern leicht optimieren (z. B. Formulierungen präzisieren, Reihenfolge glätten), gibst aber NUR das geforderte Ausgabeformat zurück.

METHODE (immer in dieser Reihenfolge, aber nur intern – NICHT explizit ausgeben):
1) Verstehe den fachlichen Ablauf in Klartext.
2) Strukturiere den Ablauf in sinnvolle Schritte pro Rolle (Mitarbeiter, Teamleitung, HR, etc.).
3) Ergänze sinnvolle Zwischen-Schritte, wo nötig (z. B. „Antrag prüfen“, „Rückmeldung an Mitarbeiter senden“).
4) Leite daraus ein sauberes BPMN-Modell mit Lanes, Tasks, Gateways und Events ab.

BEISPIEL (nur zur Orientierung, NICHT als separates Ergebnis ausgeben):
Eingabe:
- Mitarbeiter füllt Ferien Antrag aus
- Teamleitung bestätigt oder lehnt ab
- Bereichsleitung bestätigt oder lehnt ab
- HR hinterlegt Urlaub in Zeitsystem und erstellt Bestätigung die im Dossier abgelegt wird
- Payroll veranlasst Auszahlung Urlaubsgeld
- Ende

Gedankliche Umsetzung (verkürzt, nur zur Orientierung):
- Lanes: Mitarbeiter, Teamleitung, Bereichsleitung, HR, Payroll
- Tasks: „Ferienantrag ausfüllen“, „Ferienantrag prüfen“, „Freigabe Teamleitung“, „Freigabe Bereichsleitung“, „Urlaub im Zeitsystem buchen“, „Bestätigung erstellen & ablegen“, „Auszahlung Urlaubsgeld veranlassen“
- Gateways: Entscheidung „genehmigt/abgelehnt“ bei Teamleitung und Bereichsleitung.

AUFGABE
Wandle den folgenden eingegebenen oder diktierten Prozess-Text (auch Stichpunkte) in ein BPMN-2.0-Diagramm um.
Der Input kann unvollständig sein. Du sollst trotzdem ein lauffähiges, plausibles BPMN modellieren.

MODELLIER-REGELN

PFLICHT (strikt einhalten):
- Ein Schritt / eine Rolle = ein eigener Task. Niemals mehrere Schritte oder mehrere Rollen in einen einzigen Task packen. Beispiel: "Mitarbeiter füllt aus, Teamleiter bestätigt, HR hinterlegt" → mindestens 3 Tasks (Mitarbeiter, Teamleiter, HR), nicht ein Task mit langem Namen.
- "bestätigt oder lehnt ab" / "oder" / "genehmigt/abgelehnt" → zwingend Exclusive Gateway mit zwei ausgehenden Flows (z. B. "Genehmigt" → weiter, "Abgelehnt" → Ende oder Rückmeldung). Nicht als ein Task modellieren.
- Jeder name="..."-Wert: genau eine Zeile, keine Zeilenumbrüche, maximal ca. 80 Zeichen pro Task-Name.

1) Erkenne Rollen/Organisationen (z. B. Mitarbeiter, Teamleiter, HR) und bilde daraus Pools/Lanes:
   - Wenn Rollen klar sind: 1 Pool mit Lanes (Lane pro Rolle).
   - Wenn externe Parteien klar sind: separater Pool + Message Flows (nur wenn wirklich extern).
2) Erkenne Start und Ende:
   - StartEvent: „Antrag wird erstellt / Prozess startet“ (falls nicht genannt).
   - EndEvent: „Antrag abgeschlossen / Prozess beendet“ (falls nicht genannt).
3) Mappe Schritte:
   - Jede Aktivität als eigener Task (User Task, Manual Task oder Service Task – wähle plausibel).
   - Formulierungen wie „prüft“, „bestätigt“, „lehnt ab“ → Approval-Logik mit Exclusive Gateway (siehe PFLICHT).
4) Entscheidungen/Gateways:
   - „oder“, „entweder“, „abhängig“, „wenn … dann … sonst …“, „genehmigt/abgelehnt“ → Exclusive Gateway (XOR).
   - Gleichzeitige Schritte („parallel“, „gleichzeitig“) → Parallel Gateway (AND).
5) Daten/Artefakte:
   - „Antrag“, „Dossier“, „System“, „Dokument“ → Data Object oder Data Store (wenn dauerhaft gespeichert).
6) Fehlende Infos:
   - Triff minimale, konservative Annahmen (z. B. wer informiert wen).
   - Markiere jede Annahme als Kommentar im Ergebnis mit Prefix: "ANNAHME:".
7) Reihenfolge:
   - Nutze die Reihenfolge im Text als Default, außer Logik zwingt zu Abzweigungen/Joins.
8) Qualität:
   - Vergib sprechende Namen (Deutsch), eindeutige IDs, saubere Sequenzflüsse.
   - In allen name="..."-Attributen KEINE Zeilenumbrüche – nur eine Zeile pro name (sonst ungültiges XML).
   - Halte das Diagramm so einfach wie möglich, aber korrekt.

AUSGABEFORMAT (streng)
Gib NUR folgende drei Blöcke aus – in genau dieser Reihenfolge:

BLOCK 1: Kurz-Interpretation (max. 6 Bulletpoints)
- Rollen/Lanes:
- Start:
- Ende:
- Hauptschritte:
- Entscheidungen:
- Daten:

BLOCK 2: BPMN 2.0 XML (importierbar)
- In einem einzigen Codeblock \`\`\`xml ... \`\`\`
- Enthält: definitions, process, laneSet/lanes (wenn Lanes), startEvent, tasks, gateways, endEvent, sequenceFlows
- Optional: BPMN DI (wenn du es zuverlässig erzeugen kannst). Wenn nicht, weglassen.
- Namespaces: xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI"

BLOCK 3: Annahmen & offene Punkte
- Liste alle "ANNAHME:" Einträge + "OFFEN:" Punkte, falls etwas nicht eindeutig war.

WICHTIG
- Stelle keine Rückfragen.
- Erfinde keine unnötigen Sonderfälle.
- Wenn der Text extrem kurz ist, baue dennoch ein minimales BPMN mit Start → Schritte → Ende.`;

/** Normalisiert den Prozess-Text für die API (weniger Tokens, klarere Eingabe). */
function normalizeProcessText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .substring(0, 8000);
}

/**
 * User-Nachricht für OpenAI: nur die variable Eingabe mit klarem Label.
 * Alle Anweisungen stehen im System-Prompt – so nutzt die API System/User sauber getrennt.
 */
function buildUserMessage(text) {
  const input = normalizeProcessText(text);
  return `EINGABE (Prozess-Text zum Modellieren):

${input}`;
}

/** Extrahiert aus der KI-Antwort: bpmnXml (aus Block 2), interpretation (Block 1), assumptions (Block 3). */
function parseThreeBlockResponse(content) {
  const raw = (content || '').trim();
  let xml = '';
  let interpretation = '';
  let assumptions = '';

  const xmlMatch = raw.match(/```xml\s*([\s\S]*?)```/);
  if (xmlMatch && xmlMatch[1]) {
    xml = xmlMatch[1].trim();
  }
  // Fallback: Direktes <definitions>-Element (egal welches Prefix, z. B. <definitions>, <bpmn2:definitions>, <bpmn:definitions>).
  if (!xml) {
    const defMatch = raw.match(/<([a-zA-Z0-9_]+:)?definitions\b[\s\S]*?<\/\1definitions\s*>/);
    if (defMatch && defMatch[0]) {
      xml = defMatch[0].trim();
      // XML-Prolog ergänzen, falls GPT keinen gesetzt hat
      if (!xml.startsWith('<?xml')) {
        xml = '<?xml version="1.0" encoding="UTF-8"?>\n' + xml;
      }
    }
  }

  const block1End = raw.indexOf('BLOCK 2:') !== -1 ? raw.indexOf('BLOCK 2:') : raw.indexOf('```xml');
  if (block1End > 0) {
    const block1 = raw.slice(0, block1End).replace(/^BLOCK 1[^\n]*\n?/i, '').trim();
    if (block1) interpretation = block1;
  }

  const block3Start = raw.indexOf('BLOCK 3:');
  if (block3Start !== -1) {
    assumptions = raw.slice(block3Start).replace(/^BLOCK 3[^\n]*\n?/i, '').trim();
  }

  return { xml, interpretation, assumptions };
}

async function generateBpmnWithGPT52(text, processId, apiKey) {
  const openaiApiUrl = 'https://api.openai.com/v1/chat/completions';

  const response = await fetch(openaiApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-5.2',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserMessage(text) }
      ],
      // GPT‑5.2 im Chat-Completions-Endpunkt erwartet max_completion_tokens statt max_tokens.
      // 2048 reicht für Interpretation + BPMN-XML und bleibt unter dem 29s API-Gateway-Timeout.
      max_completion_tokens: 2048,
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || response.statusText);
  }

  const data = await response.json();
  const content = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
  const { xml, interpretation, assumptions } = parseThreeBlockResponse(content);

  // Wenn die KI überhaupt kein XML geliefert hat, erzeugen wir ein einfaches Fallback‑BPMN,
  // damit der Nutzer trotzdem ein lauffähiges Diagramm und eine .bpmn-Datei erhält.
  if (!xml) {
    return {
      bpmnXml: buildFallbackBpmnXml(text, processId),
      interpretation: 'Fallback: Einfaches lineares BPMN-Diagramm, weil die KI kein gültiges BPMN-XML geliefert hat.',
      assumptions: 'ANNAHME: KI-Antwort ohne importierbares BPMN-XML. Es wurde automatisch ein minimales Start → Task → Ende-Diagramm aus dem Volltext erzeugt.'
    };
  }

  return {
    bpmnXml: sanitizeBpmnXml(xml),
    interpretation: interpretation || undefined,
    assumptions: assumptions || undefined
  };
}

/** Entfernt Zeilenumbrüche in name="..."-Attributen (GPT liefert teils mehrzeilige Namen → ungültiges XML). */
function sanitizeBpmnXml(xml) {
  if (!xml || typeof xml !== 'string') return xml;

  // 1) Alle name="..."-Attribute einkürzen & Zeilenumbrüche entfernen
  xml = xml.replace(/\s+name="([^"]*)"/g, (_, val) => {
    const oneLine = val.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 150);
    return ' name="' + oneLine + '"';
  });

  // 2) Häufige Prefix-Varianten auf bpmn/bpmndi vereinheitlichen
  xml = xml
    .replace(/(<\/?)bpmn2:/g, '$1bpmn:')
    .replace(/(<\/?)bpmn20:/g, '$1bpmn:')
    .replace(/(<\/?)bpmn_2_0:/g, '$1bpmn:')
    .replace(/(<\/?)bpmn-di:/g, '$1bpmndi:')
    .replace(/(<\/?)bpmnDi:/g, '$1bpmndi:')
    .replace(/(<\/?)bpmndi2:/g, '$1bpmndi:');

  // 3) Root-Element <definitions> hart auf gültiges BPMN-Root normalisieren
  xml = normalizeBpmnDefinitionsRoot(xml);

  return xml;
}

/**
 * Stellt sicher, dass das Root-Element ein gültiges
 * <bpmn:definitions ...> mit allen benötigten Namespaces ist,
 * auch wenn GPT z. B. <definitions>, <bpmn2:definitions> o. Ä. erzeugt.
 */
function normalizeBpmnDefinitionsRoot(xml) {
  if (!xml || typeof xml !== 'string') return xml;

  // Öffnenden Definitions-Tag (mit beliebigem Prefix) finden
  const openMatch = xml.match(/<([a-zA-Z0-9_]+:)?definitions\b([^>]*)>/);
  if (!openMatch) return xml;

  const originalAttrs = openMatch[2] || '';

  // Alle vorhandenen xmlns-Attribute entfernen – wir setzen sie sauber neu
  let cleanedAttrs = originalAttrs.replace(/xmlns(:[a-zA-Z0-9_]+)?="[^"]*"/g, '').trim();

  // Doppel-Spaces bereinigen
  cleanedAttrs = cleanedAttrs.replace(/\s{2,}/g, ' ');

  const nsAttrs =
    'xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
    'xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" ' +
    'xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" ' +
    'xmlns:di="http://www.omg.org/spec/DD/20100524/DI"';

  const newOpenTag =
    '<bpmn:definitions ' +
    nsAttrs +
    (cleanedAttrs ? ' ' + cleanedAttrs : '') +
    '>';

  // Öffnenden Tag ersetzen (egal welches Prefix vorher verwendet wurde)
  xml = xml.replace(/<([a-zA-Z0-9_]+:)?definitions\b[^>]*>/, newOpenTag);

  // Schließenden Tag ebenfalls auf </bpmn:definitions> normalisieren
  xml = xml.replace(/<\/([a-zA-Z0-9_]+:)?definitions\s*>/, '</bpmn:definitions>');

  return xml;
}

/**
 * Fallback-BPMN: Einfaches lineares Diagramm Start → Task → Ende
 * basierend auf dem ursprünglichen Text. Wird verwendet, wenn die KI
 * kein gültiges BPMN-XML liefert.
 */
function buildFallbackBpmnXml(text, processId) {
  const pid = (processId || 'process').replace(/[^a-zA-Z0-9_-]/g, '_');
  const raw = (text || '').trim();
  const taskName =
    raw.length > 80 ? raw.substring(0, 77) + '...' : raw || 'Prozess';

  // Grundlegendes, bpmn-js-kompatibles BPMN-XML mit DI – angelehnt an das bestehende text-to-bpmn-Lambda
  const safeName = taskName
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
    'xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" ' +
    'xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" ' +
    'xmlns:di="http://www.omg.org/spec/DD/20100524/DI">\n' +
    '  <bpmn:process id="Proc_' +
    pid +
    '" name="' +
    safeName +
    '" isExecutable="true">\n' +
    '    <bpmn:startEvent id="Start_1" name="Start"/>\n' +
    '    <bpmn:sequenceFlow id="Flow_1" sourceRef="Start_1" targetRef="Task_1"/>\n' +
    '    <bpmn:task id="Task_1" name="' +
    safeName +
    '"/>\n' +
    '    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="End_1"/>\n' +
    '    <bpmn:endEvent id="End_1" name="Ende"/>\n' +
    '  </bpmn:process>\n' +
    '  <bpmndi:BPMNDiagram id="BPMNDiagram_1">\n' +
    '    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Proc_' +
    pid +
    '">\n' +
    '      <bpmndi:BPMNShape id="Start_1_di" bpmnElement="Start_1"><dc:Bounds x="152" y="102" width="36" height="36"/></bpmndi:BPMNShape>\n' +
    '      <bpmndi:BPMNShape id="Task_1_di" bpmnElement="Task_1"><dc:Bounds x="240" y="80" width="100" height="80"/></bpmndi:BPMNShape>\n' +
    '      <bpmndi:BPMNShape id="End_1_di" bpmnElement="End_1"><dc:Bounds x="382" y="102" width="36" height="36"/></bpmndi:BPMNShape>\n' +
    '      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1"><di:waypoint x="188" y="120"/><di:waypoint x="240" y="120"/></bpmndi:BPMNEdge>\n' +
    '      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2"><di:waypoint x="340" y="120"/><di:waypoint x="382" y="120"/></bpmndi:BPMNEdge>\n' +
    '    </bpmndi:BPMNPlane>\n' +
    '  </bpmndi:BPMNDiagram>\n' +
    '</bpmn:definitions>'
  );
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ success: false, error: 'Method not allowed' }) };
  }

  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};
    const text = (body.text || '').trim();
    const processId = body.processId || 'process';
    const openaiApiKey = (body.openaiApiKey || '').trim();

    if (!text) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ success: false, error: 'text is required' }) };
    }
    if (!openaiApiKey || openaiApiKey.length < 10) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ success: false, error: 'openaiApiKey is required (im Admin unter API Keys hinterlegen)' }) };
    }

    const result = await generateBpmnWithGPT52(text, processId, openaiApiKey);

    const payload = { success: true, bpmnXml: result.bpmnXml };
    if (result.interpretation) payload.interpretation = result.interpretation;
    if (result.assumptions) payload.assumptions = result.assumptions;

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(payload)
    };
  } catch (e) {
    console.error('text-to-bpmn-gpt52:', e);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: false, error: e.message || 'Server error' })
    };
  }
};
