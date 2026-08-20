/**
 * Telegram Productivity Bot - Lambda Handler
 * 
 * Empfängt Nachrichten wie "2h Horizon Support" und speichert sie als Artefakte.
 * DSGVO/DSG-konform: AWS Bedrock Claude in Frankfurt (eu-central-1)
 */

const https = require('https');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ALLOWED_CHAT_ID = process.env.ALLOWED_CHAT_ID;

// AWS Bedrock Claude (EU Inference Profile - Frankfurt) - DSGVO-konform
const BEDROCK_REGION = process.env.BEDROCK_REGION || 'eu-central-1';
const BEDROCK_MODEL = process.env.BEDROCK_MODEL || 'eu.anthropic.claude-haiku-4-5-20251001-v1:0';

const bedrockClient = new BedrockRuntimeClient({ region: BEDROCK_REGION });
const lambdaClient = new LambdaClient({ region: BEDROCK_REGION });

async function invokeFeierabendCheck(source) {
  await lambdaClient.send(new InvokeCommand({
    FunctionName: 'task-extractor-summary',
    InvocationType: 'Event',
    Payload: JSON.stringify({ source })
  }));
}

const API_BASE = 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1';
const USER_ID = 'default-user';

const DEFAULT_CUSTOMERS = [
  'Horizon', 'SHS', 'Cistec', 'Knauf', 'HR Campus', 'Akyurek', 'Lonza', 'Bayer', 
  'UKG', 'Stardust', 'Roche', 'Novartis', 'Intern', 'Valkeen'
];

// Wird dynamisch aus den gespeicherten Daten geladen
let KNOWN_CUSTOMERS = [...DEFAULT_CUSTOMERS];

const ARTIFACT_TYPES = {
  'support': ['support', 'case', 'ticket', 'hilfe', 'problem', 'troubleshoot'],
  'meeting': ['meeting', 'call', 'termin', 'gespräch', 'besprechung', 'workshop', 'sync'],
  'document': ['doku', 'dokument', 'guide', 'qrg', 'faq', 'anleitung', 'readme'],
  'code': ['code', 'script', 'api', 'automation', 'python', 'lambda', 'entwicklung'],
  'presentation': ['präsentation', 'ppt', 'deck', 'slides', 'vortrag'],
  'demo': ['demo', 'walkthrough', 'storyboard', 'video', 'screencast'],
  'training': ['training', 'schulung', 'workshop', 'curriculum', 'onboarding'],
};

async function sendTelegramMessage(chatId, text, options = {}) {
  const payload = JSON.stringify({
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    ...options
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function parseWithBedrock(message, existingCustomers = []) {
  const allCustomers = [...new Set([...KNOWN_CUSTOMERS, ...existingCustomers])];
  
  const systemPrompt = `Du bist ein Zeiterfassungs-Parser. Parse die Nachricht EXAKT.

DURATION_HOURS - Erkenne ALLE Zeitformate:
- "2 stunden", "2 Stunden", "zwei stunden" = 2
- "2h", "2H" = 2  
- "1.5h", "1,5h", "eineinhalb stunden" = 1.5
- "30 min", "30min", "30 minuten" = 0.5
- "45 min" = 0.75

CUSTOMER - Der ERSTE genannte Kunde/Firma:
- Bekannt: ${allCustomers.join(', ')}
- "SHS, Horizon Projekt" → customer = "SHS" (der ERSTE!)
- "Horizon Projekt" → customer = "Horizon"
- Unbekannte Firmen: Nimm sie trotzdem! ("Acme Corp" → customer = "Acme Corp")
- Typische Positionen: Am Anfang, nach Komma, vor "Projekt"

TYPE - Nach Tätigkeit:
- document: Dokumentation, QRG, Guide, FAQ, Anleitung erstellen/schreiben
- code: Script, API, Automation, Entwicklung, Lambda
- meeting: Call, Meeting, Workshop, Termin, Sync
- support: Support, Ticket, Troubleshooting
- demo: Demo zeigen, Walkthrough
- training: Schulung, Training
- presentation: PowerPoint, Slides, Deck erstellen
- other: Alles andere

TITLE - Kurze, saubere Beschreibung (ohne Dauer, ohne den ersten Kundennamen)

BEISPIELE:
Input: "SHS, Horizon Projekt 2 stunden dokumentation für zeiterfassung erstellen"
Output: {"duration_hours":2,"customer":"SHS","type":"document","title":"Horizon Projekt - Dokumentation für Zeiterfassung erstellen","impact":3}

Input: "45 min HR Campus support call"
Output: {"duration_hours":0.75,"customer":"HR Campus","type":"meeting","title":"Support Call","impact":3}

Input: "3h Neukunde ABC onboarding workshop"
Output: {"duration_hours":3,"customer":"Neukunde ABC","type":"training","title":"Onboarding Workshop","impact":3}

NUR JSON ausgeben, keine Erklärung!`;

  try {
    const command = new InvokeModelCommand({
      modelId: BEDROCK_MODEL,
      contentType: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 200,
        temperature: 0.1,
        system: systemPrompt,
        messages: [
          { role: 'user', content: message }
        ]
      })
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const content = responseBody.content?.[0]?.text || '{}';
    const parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
    return parsed;
  } catch (error) {
    console.error('Bedrock error:', error);
    return null;
  }
}

function parseSimple(message) {
  const text = message.toLowerCase();
  let duration_hours = null;
  let customer = null;
  let type = 'other';
  
  const hourMatch = text.match(/(\d+(?:[.,]\d+)?)\s*h(?:ours?|r)?/i);
  const minMatch = text.match(/(\d+)\s*min(?:uten?)?/i);
  
  if (hourMatch) {
    duration_hours = parseFloat(hourMatch[1].replace(',', '.'));
  } else if (minMatch) {
    duration_hours = parseInt(minMatch[1]) / 60;
  }
  
  for (const c of KNOWN_CUSTOMERS) {
    if (text.includes(c.toLowerCase())) {
      customer = c;
      break;
    }
  }
  
  for (const [typeName, keywords] of Object.entries(ARTIFACT_TYPES)) {
    if (keywords.some(k => text.includes(k))) {
      type = typeName;
      break;
    }
  }
  
  return { duration_hours, customer, type, title: message, impact: 3 };
}

async function loadCurrentProgress() {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: '6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com',
      path: `/v1/onboarding-progress?userId=${encodeURIComponent(USER_ID)}`,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response.progress || {});
        } catch (e) {
          resolve({});
        }
      });
    });
    req.on('error', () => resolve({}));
    req.end();
  });
}

async function saveProgress(progress) {
  const payload = JSON.stringify({ userId: USER_ID, progress });
  
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: '6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com',
      path: '/v1/onboarding-progress',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(true));
    });
    req.on('error', () => resolve(false));
    req.write(payload);
    req.end();
  });
}

async function addArtifact(parsed, originalMessage) {
  const progress = await loadCurrentProgress();
  
  if (!progress.productivityTracker) {
    progress.productivityTracker = {
      artifacts: [],
      customers: [...DEFAULT_CUSTOMERS],
      projects: [],
      taskTypes: [] // Für benutzerdefinierte Task-Typen
    };
  }
  
  // Stelle sicher dass customers Array existiert
  if (!progress.productivityTracker.customers) {
    progress.productivityTracker.customers = [...DEFAULT_CUSTOMERS];
  }
  
  const artifact = {
    id: `tg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: parsed.type || 'other',
    title: parsed.title || originalMessage,
    description: `Via Telegram: "${originalMessage}"`,
    customer: parsed.customer || '',
    project: parsed.project || '',
    impact: parsed.impact || 3,
    durationHours: parsed.duration_hours,
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    source: 'telegram'
  };
  
  progress.productivityTracker.artifacts.push(artifact);
  
  // NEUEN Kunden automatisch speichern
  if (parsed.customer && !progress.productivityTracker.customers.includes(parsed.customer)) {
    progress.productivityTracker.customers.push(parsed.customer);
    console.log('Neuer Kunde hinzugefügt:', parsed.customer);
  }
  
  // NEUES Projekt speichern (falls vorhanden)
  if (parsed.project && !progress.productivityTracker.projects?.includes(parsed.project)) {
    if (!progress.productivityTracker.projects) {
      progress.productivityTracker.projects = [];
    }
    progress.productivityTracker.projects.push(parsed.project);
    console.log('Neues Projekt hinzugefügt:', parsed.project);
  }
  
  const saved = await saveProgress(progress);
  return { artifact, saved, isNewCustomer: parsed.customer && !DEFAULT_CUSTOMERS.includes(parsed.customer) };
}

function formatArtifactConfirmation(artifact) {
  const stars = '⭐'.repeat(artifact.impact);
  const duration = artifact.durationHours ? `${artifact.durationHours}h` : '';
  
  return `✅ <b>Erfasst!</b>

📝 <b>${artifact.title}</b>
${artifact.customer ? `🏢 ${artifact.customer}` : ''}
${duration ? `⏱ ${duration}` : ''}
📁 ${artifact.type}
${stars}

<i>Synced mit Produktivitäts-Tracker</i>`;
}

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event));
  
  let body;
  try {
    body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch (e) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }
  
  if (body?.callback_query) {
    const data = String(body.callback_query.data || '');
    if (data.startsWith('calok:') || data.startsWith('calno:')) {
      try {
        await lambdaClient.send(new InvokeCommand({
          FunctionName: 'task-extractor-summary',
          InvocationType: 'RequestResponse',
          Payload: JSON.stringify({ source: 'cal-callback', callback: body.callback_query })
        }));
      } catch (err) {
        console.error('Calendar callback failed:', err);
      }
    }
    return { statusCode: 200, body: 'OK' };
  }

  if (!body?.message) {
    if (body?.edited_message) {
      return { statusCode: 200, body: 'OK - edited messages ignored' };
    }
    return { statusCode: 200, body: 'OK - no message' };
  }
  
  const message = body.message;
  const chatId = message.chat.id;
  const text = message.text || '';
  const fromId = message.from?.id;
  
  if (ALLOWED_CHAT_ID && String(chatId) !== String(ALLOWED_CHAT_ID)) {
    console.log(`Unauthorized chat: ${chatId}`);
    await sendTelegramMessage(chatId, '🚫 Nicht autorisiert. Dieser Bot ist privat.');
    return { statusCode: 200, body: 'Unauthorized' };
  }
  
  if (text.startsWith('/start')) {
    await sendTelegramMessage(chatId, `👋 <b>Hallo!</b>

Ich bin dein Produktivitäts-Bot. Schreib mir einfach was du gemacht hast:

<code>2h Horizon Support-Call</code>
<code>30min Cistec Doku</code>
<code>1.5h Knauf Training vorbereitet</code>

Ich parse deine Nachricht und speichere sie im Tracker.

<b>Befehle:</b>
/heute - Was du heute erfasst hast
/offen - Unbeantwortete Mails
/feierabend - Feierabend-Check jetzt
/help - Diese Hilfe`);
    return { statusCode: 200, body: 'OK' };
  }
  
  if (text.startsWith('/heute') || text.startsWith('/today')) {
    const progress = await loadCurrentProgress();
    const artifacts = progress.productivityTracker?.artifacts || [];
    const today = new Date().toISOString().split('T')[0];
    const todayArtifacts = artifacts.filter(a => a.date === today);
    
    if (todayArtifacts.length === 0) {
      await sendTelegramMessage(chatId, '📭 Heute noch nichts erfasst.\n\nSchreib mir z.B.: <code>2h Horizon Meeting</code>');
    } else {
      const totalHours = todayArtifacts.reduce((sum, a) => sum + (a.durationHours || 0), 0);
      const list = todayArtifacts.map(a => 
        `• ${a.durationHours ? a.durationHours + 'h ' : ''}${a.title}${a.customer ? ' (' + a.customer + ')' : ''}`
      ).join('\n');
      
      await sendTelegramMessage(chatId, `📊 <b>Heute erfasst:</b>\n\n${list}\n\n⏱ <b>Gesamt: ${totalHours.toFixed(1)}h</b>`);
    }
    return { statusCode: 200, body: 'OK' };
  }
  
  if (text.startsWith('/offen') || text.startsWith('/feierabend')) {
    await sendTelegramMessage(chatId, 'Prüfe Posteingang und Zeiterfassung…');
    try {
      await invokeFeierabendCheck(text.startsWith('/offen') ? 'offen' : 'command');
    } catch (err) {
      console.error('Feierabend invoke failed:', err);
      await sendTelegramMessage(chatId, 'Check konnte nicht gestartet werden. Bitte später erneut versuchen.');
    }
    return { statusCode: 200, body: 'OK' };
  }

  if (text.startsWith('/help')) {
    await sendTelegramMessage(chatId, `📖 <b>So funktioniert's:</b>

Schreib mir einfach was du gemacht hast. Ich erkenne:

<b>Zeit:</b> 2h, 30min, 1.5h
<b>Kunden:</b> Beliebige Namen! Neue Kunden werden automatisch gespeichert.
<b>Typen:</b> Meeting, Support, Doku, Code, Demo, Training, Präsentation

<b>Beispiele:</b>
<code>2h Horizon Support-Call</code>
<code>45min Knauf QRG erstellt</code>
<code>3h Neuer Kunde ABC Kickoff Meeting</code>
<code>1.5h SHS Dokumentation schreiben</code>

✨ Neue Kunden/Projekte werden automatisch gelernt! 🚀`);
    return { statusCode: 200, body: 'OK' };
  }
  
  if (text.startsWith('/')) {
    await sendTelegramMessage(chatId, '❓ Unbekannter Befehl. Schreib /help für Hilfe.');
    return { statusCode: 200, body: 'OK' };
  }
  
  if (text.length < 3) {
    return { statusCode: 200, body: 'OK - too short' };
  }
  
  await sendTelegramMessage(chatId, '⏳ Verarbeite...');
  
  // Lade existierende Kunden für besseres Parsing
  const progress = await loadCurrentProgress();
  const existingCustomers = progress.productivityTracker?.customers || [];
  
  let parsed;
  if (bedrockClient) {
    parsed = await parseWithBedrock(text, existingCustomers);
  }
  if (!parsed || !parsed.title) {
    parsed = parseSimple(text);
  }
  
  console.log('Parsed:', parsed);
  
  const { artifact, saved, isNewCustomer } = await addArtifact(parsed, text);
  
  if (saved) {
    let confirmation = formatArtifactConfirmation(artifact);
    if (isNewCustomer) {
      confirmation += `\n\n🆕 <i>Neuer Kunde "${artifact.customer}" wurde gespeichert!</i>`;
    }
    await sendTelegramMessage(chatId, confirmation);
  } else {
    await sendTelegramMessage(chatId, '❌ Fehler beim Speichern. Bitte später erneut versuchen.');
  }
  
  return { statusCode: 200, body: 'OK' };
};

// Siri Shortcut Handler - einfacher GET-Request mit ?text=...
exports.siriCapture = async (event) => {
  console.log('Siri Event:', JSON.stringify(event));
  
  // Text aus Query-String oder Body
  let text = event.queryStringParameters?.text || '';
  if (!text && event.body) {
    try {
      const body = JSON.parse(event.body);
      text = body.text || '';
    } catch (e) {}
  }
  
  text = decodeURIComponent(text).trim();
  
  if (!text || text.length < 3) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: 'Fehler: Kein Text angegeben'
    };
  }
  
  console.log('Siri text:', text);
  
  // Lade existierende Kunden für besseres Parsing
  const progress = await loadCurrentProgress();
  const existingCustomers = progress.productivityTracker?.customers || [];
  
  let parsed;
  if (bedrockClient) {
    parsed = await parseWithBedrock(text, existingCustomers);
  }
  if (!parsed || !parsed.title) {
    parsed = parseSimple(text);
  }
  
  console.log('Parsed:', parsed);
  
  const { artifact, saved, isNewCustomer } = await addArtifact(parsed, text);
  
  if (saved) {
    const duration = artifact.durationHours ? `${artifact.durationHours} Stunden` : '';
    const customer = artifact.customer || '';
    const newCustomerNote = isNewCustomer ? ` (neuer Kunde)` : '';
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: `Erfasst: ${duration} ${customer}${newCustomerNote} - ${artifact.title}`.trim()
    };
  } else {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: 'Fehler beim Speichern'
    };
  }
};

exports.sendReminder = async (event) => {
  try {
    await invokeFeierabendCheck('schedule');
    return { statusCode: 200, body: 'Feierabend-Check triggered' };
  } catch (err) {
    console.error('Feierabend invoke failed:', err);
    return { statusCode: 500, body: 'Invoke failed' };
  }
};
