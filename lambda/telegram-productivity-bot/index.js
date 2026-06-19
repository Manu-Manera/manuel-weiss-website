/**
 * Telegram Productivity Bot - Lambda Handler
 * 
 * Empfängt Nachrichten wie "2h Horizon Support" und speichert sie als Artefakte.
 * DSGVO/DSG-konform: Keine Chat-History, nur extrahierte Daten in eu-central-1.
 */

const https = require('https');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ALLOWED_CHAT_ID = process.env.ALLOWED_CHAT_ID;
const API_BASE = 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1';
const USER_ID = 'default-user';

const KNOWN_CUSTOMERS = [
  'Horizon', 'Cistec', 'Knauf', 'HR Campus', 'Akyurek', 'Lonza', 'Bayer', 'Intern', 'Valkeen'
];

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

async function parseWithOpenAI(message) {
  const systemPrompt = `Du bist ein Zeiterfassungs-Parser. Extrahiere aus der Nachricht:
- duration_hours: Dauer in Stunden (z.B. "2h" = 2, "30min" = 0.5, "1.5h" = 1.5)
- customer: Kunde aus dieser Liste: ${KNOWN_CUSTOMERS.join(', ')}
- type: Einer von: document, code, presentation, support, demo, meeting, training, other
- title: Kurze Beschreibung der Tätigkeit
- impact: Geschätzter Impact 1-5 (1=Routine, 3=Normal, 5=Strategisch wichtig)

Antworte NUR mit validem JSON, keine Erklärung. Beispiel:
{"duration_hours": 2, "customer": "Horizon", "type": "support", "title": "Support-Call Berechtigungen", "impact": 3}

Falls du etwas nicht erkennen kannst, setze null.`;

  const payload = JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ],
    temperature: 0.1,
    max_tokens: 200
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          const content = response.choices?.[0]?.message?.content || '{}';
          const parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
          resolve(parsed);
        } catch (e) {
          console.error('OpenAI parse error:', e, data);
          resolve(null);
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
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
      customers: KNOWN_CUSTOMERS,
      projects: []
    };
  }
  
  const artifact = {
    id: `tg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: parsed.type || 'other',
    title: parsed.title || originalMessage,
    description: `Via Telegram: "${originalMessage}"`,
    customer: parsed.customer || '',
    project: '',
    impact: parsed.impact || 3,
    durationHours: parsed.duration_hours,
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    source: 'telegram'
  };
  
  progress.productivityTracker.artifacts.push(artifact);
  
  if (parsed.customer && !progress.productivityTracker.customers.includes(parsed.customer)) {
    progress.productivityTracker.customers.push(parsed.customer);
  }
  
  const saved = await saveProgress(progress);
  return { artifact, saved };
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
  
  if (text.startsWith('/help')) {
    await sendTelegramMessage(chatId, `📖 <b>So funktioniert's:</b>

Schreib mir einfach was du gemacht hast. Ich erkenne:

<b>Zeit:</b> 2h, 30min, 1.5h
<b>Kunden:</b> Horizon, Cistec, Knauf, HR Campus, etc.
<b>Typen:</b> Meeting, Support, Doku, Code, Demo, Training

<b>Beispiele:</b>
<code>2h Horizon Support-Call</code>
<code>45min Knauf QRG erstellt</code>
<code>3h Cistec Workshop vorbereitet</code>

Alles wird automatisch im Tracker gespeichert! 🚀`);
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
  
  let parsed;
  if (OPENAI_API_KEY) {
    parsed = await parseWithOpenAI(text);
  }
  if (!parsed || !parsed.title) {
    parsed = parseSimple(text);
  }
  
  console.log('Parsed:', parsed);
  
  const { artifact, saved } = await addArtifact(parsed, text);
  
  if (saved) {
    await sendTelegramMessage(chatId, formatArtifactConfirmation(artifact));
  } else {
    await sendTelegramMessage(chatId, '❌ Fehler beim Speichern. Bitte später erneut versuchen.');
  }
  
  return { statusCode: 200, body: 'OK' };
};

exports.sendReminder = async (event) => {
  if (!TELEGRAM_BOT_TOKEN || !ALLOWED_CHAT_ID) {
    console.log('Missing config for reminder');
    return { statusCode: 200, body: 'Missing config' };
  }
  
  const progress = await loadCurrentProgress();
  const artifacts = progress.productivityTracker?.artifacts || [];
  const today = new Date().toISOString().split('T')[0];
  const todayArtifacts = artifacts.filter(a => a.date === today);
  
  let message;
  if (todayArtifacts.length === 0) {
    message = `🌅 <b>Feierabend-Check!</b>

Was hast du heute geschafft? Schreib mir z.B.:

<code>2h Horizon Support</code>
<code>1h Cistec Meeting</code>

Oder /heute um zu sehen was du schon erfasst hast.`;
  } else {
    const totalHours = todayArtifacts.reduce((sum, a) => sum + (a.durationHours || 0), 0);
    message = `🌅 <b>Feierabend-Check!</b>

Du hast heute schon <b>${todayArtifacts.length} Einträge</b> (${totalHours.toFixed(1)}h) erfasst.

Noch was vergessen? Einfach schreiben!`;
  }
  
  await sendTelegramMessage(ALLOWED_CHAT_ID, message);
  
  return { statusCode: 200, body: 'Reminder sent' };
};
