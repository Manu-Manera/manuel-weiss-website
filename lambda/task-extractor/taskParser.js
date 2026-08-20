/**
 * Task Parser - Bedrock Claude basierte Task-Extraktion
 * 
 * Analysiert Emails, Teams-Nachrichten und Meetings,
 * extrahiert potenzielle Tasks/Action Items.
 */

const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const bedrockClient = new BedrockRuntimeClient({ region: 'eu-central-1' });
const BEDROCK_MODEL = 'eu.anthropic.claude-sonnet-4-5-20250929-v1:0';

const TASK_EXTRACTION_PROMPT = `Du bist ein strenger persönlicher Assistent für Manuel Weiss (Valkeen / Tempus Implementation).

Extrahiere NUR echte, konkrete Action Items — keine Vermutungen.

REGELN (streng):
1. NUR explizite Aufgaben an Manuel / "ich": "Bitte …", "Könntest du …", "Manuel, …", "bis … erledigen", direkte Zusage von Manuel
2. KEINE impliziten Tasks aus reinen Infos, Status-Updates, Newslettern, CC-Mails, "FYI", "zur Info", Meeting-Einladungen ohne konkrete Aufgabe
3. KEIN Task aus Kalender-Einträgen wie "Meeting vorbereiten" oder "Teilnehmen an …" — nur wenn im Text eine explizite Vorbereitungsaufgabe steht
4. KEINE Tasks für andere Personen (assignee muss "ich" sein)
5. confidence >= 0.85 nur wenn eindeutig; sonst weglassen (lieber [] als Rauschen)
6. IGNORIERE: Marketing, automatische Mails, Teams-Reactions, Protokoll-Verteiler ohne persönliche Aktion

Für JEDEN gefundenen Task, extrahiere:
- title: Kurze, klare Beschreibung der Aufgabe
- assignee: "ich" wenn ICH es tun soll, sonst Name der Person
- deadline: ISO-Datum falls erkennbar, sonst null
- priority: "hoch" (dringend/wichtig), "mittel" (normal), "niedrig" (irgendwann)
- context: Kurzer Kontext (wer hat es geschrieben, worauf bezieht es sich)
- confidence: 0.0-1.0 wie sicher du bist dass es ein Task ist

Antworte NUR mit einem JSON-Array. Im Zweifel: [] (leeres Array ist korrekt).

BEISPIEL:
[
  {
    "title": "Präsentation für Montag fertigstellen",
    "assignee": "ich",
    "deadline": "2026-06-23",
    "priority": "hoch",
    "context": "Email von Marc bezüglich Kundenmeeting",
    "confidence": 0.95
  }
]`;

async function extractTasksFromContent(content, source, metadata = {}) {
  const userPrompt = `
QUELLE: ${source}
${metadata.from ? `VON: ${metadata.from}` : ''}
${metadata.subject ? `BETREFF: ${metadata.subject}` : ''}
${metadata.date ? `DATUM: ${metadata.date}` : ''}

INHALT:
${content.substring(0, 3000)}
`;

  try {
    const command = new InvokeModelCommand({
      modelId: BEDROCK_MODEL,
      contentType: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 1000,
        temperature: 0.1,
        system: TASK_EXTRACTION_PROMPT,
        messages: [
          { role: 'user', content: userPrompt }
        ]
      })
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const text = responseBody.content?.[0]?.text || '[]';
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    
    const tasks = JSON.parse(jsonMatch[0]);
    
    return tasks.map(task => ({
      ...task,
      source,
      sourceId: metadata.id,
      sourceMetadata: metadata,
      extractedAt: new Date().toISOString()
    }));
    
  } catch (error) {
    console.error('Task extraction error:', error);
    return [];
  }
}

async function extractTasksFromEmail(email) {
  const content = email.bodyPreview || email.body?.content || '';
  return await extractTasksFromContent(
    content.replace(/<[^>]*>/g, ''),
    'email',
    {
      id: email.id,
      from: email.from?.emailAddress?.name || email.from?.emailAddress?.address,
      subject: email.subject,
      date: email.receivedDateTime,
      importance: email.importance
    }
  );
}

async function extractTasksFromTeamsMessage(message) {
  return await extractTasksFromContent(
    message.content,
    'teams',
    {
      id: message.id,
      from: message.from,
      subject: `${message.teamName} > ${message.channelName}`,
      date: message.createdDateTime,
      importance: message.importance
    }
  );
}

async function extractTasksFromMeeting(meeting) {
  const content = `
Meeting: ${meeting.subject}
Organisator: ${meeting.organizer}
Teilnehmer: ${meeting.attendees?.join(', ')}
Zeit: ${meeting.start} - ${meeting.end}
${meeting.bodyPreview ? `Beschreibung: ${meeting.bodyPreview}` : ''}
  `;
  
  return await extractTasksFromContent(
    content,
    'meeting',
    {
      id: meeting.id,
      from: meeting.organizer,
      subject: meeting.subject,
      date: meeting.start
    }
  );
}

const NOISE_FROM_PATTERNS = [
  'noreply', 'no-reply', 'donotreply', 'newsletter', 'notifications@',
  'microsoftexchange', 'mailer-daemon', 'postmaster'
];

const NOISE_SUBJECT_PATTERNS = [
  'digest', 'newsletter', 'undeliverable', 'automatic reply', 'automatische antwort',
  'out of office', 'abwesenheit', 'delivery status', 'gelesen:', 'read:',
  'invitation:', 'einladung:', 'cancelled:', 'abgesagt'
];

function normalizeTitle(title = '') {
  return title.toLowerCase().replace(/\s+/g, ' ').trim();
}

function shouldSkipEmailMetadata(metadata = {}) {
  const from = (metadata.from || '').toLowerCase();
  const subject = (metadata.subject || '').toLowerCase();
  if (NOISE_FROM_PATTERNS.some(p => from.includes(p))) return true;
  if (NOISE_SUBJECT_PATTERNS.some(p => subject.includes(p))) return true;
  return false;
}

function dedupeTasks(tasks, knownTitles = new Set()) {
  const seen = new Set(knownTitles);
  const out = [];
  for (const task of tasks) {
    const key = normalizeTitle(task.title);
    if (!key || key.length < 8 || seen.has(key)) continue;
    seen.add(key);
    out.push(task);
  }
  return out;
}

async function processAllSources(emails, teamsMessages, meetings, options = {}) {
  const {
    minConfidence = 0.85,
    meetingsEnabled = false,
    teamsEnabled = true,
    emailsEnabled = true,
    knownTitles = new Set()
  } = options;

  const allTasks = [];
  
  console.log(`Processing ${emails.length} emails, ${teamsMessages.length} teams, ${meetings.length} meetings (meetings=${meetingsEnabled})`);
  
  if (emailsEnabled) {
    for (const email of emails) {
      const meta = {
        from: email.from?.emailAddress?.name || email.from?.emailAddress?.address,
        subject: email.subject
      };
      if (shouldSkipEmailMetadata(meta)) {
        console.log('Skip noisy email:', meta.subject);
        continue;
      }
      const tasks = await extractTasksFromEmail(email);
      allTasks.push(...tasks);
    }
  }
  
  if (teamsEnabled) {
    for (const message of teamsMessages) {
      const tasks = await extractTasksFromTeamsMessage(message);
      allTasks.push(...tasks);
    }
  }
  
  if (meetingsEnabled) {
    for (const meeting of meetings) {
      const tasks = await extractTasksFromMeeting(meeting);
      allTasks.push(...tasks);
    }
  }
  
  const filtered = allTasks.filter(t => {
    if (t.assignee !== 'ich') return false;
    if ((t.confidence || 0) < minConfidence) return false;
    const title = normalizeTitle(t.title);
    if (title.length < 8) return false;
    if (/teilnehmen|meeting vorbereiten|termin\b|einladung/.test(title) && (t.confidence || 0) < 0.95) return false;
    return true;
  });

  const myTasks = dedupeTasks(filtered, knownTitles)
    .sort((a, b) => {
      const priorityOrder = { hoch: 0, mittel: 1, niedrig: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  
  console.log(`Extracted ${allTasks.length} total tasks, ${myTasks.length} are for me with high confidence`);
  
  return {
    allTasks,
    myTasks,
    summary: {
      totalProcessed: emails.length + teamsMessages.length + meetings.length,
      totalTasksFound: allTasks.length,
      myTasksCount: myTasks.length,
      bySource: {
        email: allTasks.filter(t => t.source === 'email').length,
        teams: allTasks.filter(t => t.source === 'teams').length,
        meeting: allTasks.filter(t => t.source === 'meeting').length
      },
      byPriority: {
        hoch: myTasks.filter(t => t.priority === 'hoch').length,
        mittel: myTasks.filter(t => t.priority === 'mittel').length,
        niedrig: myTasks.filter(t => t.priority === 'niedrig').length
      }
    }
  };
}

async function generateDailySummary(pendingTasks, acceptedTasks, dismissedTasks) {
  const summaryPrompt = `
Erstelle eine kurze, motivierende Zusammenfassung für den Feierabend.

OFFENE VORSCHLÄGE (${pendingTasks.length}):
${pendingTasks.slice(0, 5).map(t => `- ${t.title} (${t.priority})`).join('\n')}

HEUTE AKZEPTIERT (${acceptedTasks.length}):
${acceptedTasks.slice(0, 5).map(t => `- ${t.title}`).join('\n')}

IGNORIERT (${dismissedTasks.length}):
${dismissedTasks.length} Tasks wurden als nicht relevant markiert.

Erstelle eine 2-3 Satz Zusammenfassung auf Deutsch. Sei konstruktiv und motivierend.
`;

  try {
    const command = new InvokeModelCommand({
      modelId: BEDROCK_MODEL,
      contentType: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 300,
        temperature: 0.7,
        messages: [
          { role: 'user', content: summaryPrompt }
        ]
      })
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    return responseBody.content?.[0]?.text || 'Keine Zusammenfassung verfügbar.';
    
  } catch (error) {
    console.error('Summary generation error:', error);
    return `Heute: ${acceptedTasks.length} Tasks akzeptiert, ${pendingTasks.length} offen, ${dismissedTasks.length} ignoriert.`;
  }
}

module.exports = {
  extractTasksFromEmail,
  extractTasksFromTeamsMessage,
  extractTasksFromMeeting,
  processAllSources,
  generateDailySummary,
  shouldSkipEmailMetadata,
  normalizeTitle,
  dedupeTasks
};
