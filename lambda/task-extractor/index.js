/**
 * Task Extractor - Lambda Handler
 * 
 * Verarbeitet Emails, Teams-Nachrichten und Meetings,
 * extrahiert Tasks und sendet Vorschläge per Telegram.
 */

const https = require('https');
const { DynamoDBClient, PutItemCommand, GetItemCommand, QueryCommand, UpdateItemCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { unmarshall, marshall } = require('@aws-sdk/util-dynamodb');

const graphClient = require('./graphClient');
const taskParser = require('./taskParser');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const DYNAMODB_TABLE = process.env.DYNAMODB_TABLE || 'task-suggestions';

const dynamoClient = new DynamoDBClient({ region: 'eu-central-1' });

async function sendTelegramMessage(text, replyMarkup = null) {
  const payload = {
    chat_id: TELEGRAM_CHAT_ID,
    text,
    parse_mode: 'HTML'
  };
  
  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }
  
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function saveTaskSuggestion(task) {
  const taskId = `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  
  const item = {
    pk: { S: 'TASK' },
    sk: { S: taskId },
    taskId: { S: taskId },
    title: { S: task.title },
    assignee: { S: task.assignee },
    priority: { S: task.priority },
    context: { S: task.context || '' },
    source: { S: task.source },
    sourceId: { S: task.sourceId || '' },
    confidence: { N: String(task.confidence) },
    status: { S: 'pending' },
    createdAt: { S: new Date().toISOString() },
    ...(task.deadline && { deadline: { S: task.deadline } })
  };
  
  await dynamoClient.send(new PutItemCommand({
    TableName: DYNAMODB_TABLE,
    Item: item
  }));
  
  return taskId;
}

async function updateTaskStatus(taskId, status, todoId = null) {
  const updateExpression = todoId 
    ? 'SET #status = :status, todoId = :todoId, updatedAt = :updatedAt'
    : 'SET #status = :status, updatedAt = :updatedAt';
  
  const expressionValues = {
    ':status': { S: status },
    ':updatedAt': { S: new Date().toISOString() }
  };
  
  if (todoId) {
    expressionValues[':todoId'] = { S: todoId };
  }
  
  await dynamoClient.send(new UpdateItemCommand({
    TableName: DYNAMODB_TABLE,
    Key: {
      pk: { S: 'TASK' },
      sk: { S: taskId }
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: expressionValues
  }));
}

async function getPendingTasks() {
  const result = await dynamoClient.send(new ScanCommand({
    TableName: DYNAMODB_TABLE,
    FilterExpression: '#status = :status',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: { ':status': { S: 'pending' } }
  }));
  
  return (result.Items || []).map(item => unmarshall(item));
}

async function getTodaysTasks() {
  const today = new Date().toISOString().split('T')[0];
  
  const result = await dynamoClient.send(new ScanCommand({
    TableName: DYNAMODB_TABLE,
    FilterExpression: 'begins_with(createdAt, :today)',
    ExpressionAttributeValues: { ':today': { S: today } }
  }));
  
  return (result.Items || []).map(item => unmarshall(item));
}

async function getKnownTaskTitles() {
  const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const result = await dynamoClient.send(new ScanCommand({
    TableName: DYNAMODB_TABLE,
    FilterExpression: 'pk = :pk AND createdAt >= :cutoff',
    ExpressionAttributeValues: {
      ':pk': { S: 'TASK' },
      ':cutoff': { S: cutoff }
    }
  }));

  const titles = new Set();
  for (const item of result.Items || []) {
    const t = unmarshall(item);
    if (t.title) titles.add(taskParser.normalizeTitle(t.title));
  }
  return titles;
}

async function loadSettings() {
  try {
    const result = await dynamoClient.send(new QueryCommand({
      TableName: DYNAMODB_TABLE,
      KeyConditionExpression: 'pk = :pk AND sk = :sk',
      ExpressionAttributeValues: {
        ':pk': { S: 'META' },
        ':sk': { S: 'settings' }
      }
    }));

    if (result.Items?.[0]) {
      return unmarshall(result.Items[0]);
    }
  } catch (e) {
    console.log('No settings found, using defaults');
  }

  return {
    checkInterval: 120,
    summaryTime: '18:00',
    emailsEnabled: true,
    teamsEnabled: false,
    meetingsEnabled: false,
    minConfidence: 0.88,
    dailySummaryEnabled: false,
    maxSuggestionsPerRun: 3,
    notifyMode: 'digest'
  };
}

async function getLastCheckTimestamp() {
  try {
    const result = await dynamoClient.send(new QueryCommand({
      TableName: DYNAMODB_TABLE,
      KeyConditionExpression: 'pk = :pk AND sk = :sk',
      ExpressionAttributeValues: {
        ':pk': { S: 'META' },
        ':sk': { S: 'lastCheck' }
      }
    }));
    
    if (result.Items && result.Items.length > 0) {
      return unmarshall(result.Items[0]).timestamp;
    }
  } catch (e) {
    console.log('No last check timestamp found');
  }
  
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  return oneHourAgo;
}

async function setLastCheckTimestamp() {
  await dynamoClient.send(new PutItemCommand({
    TableName: DYNAMODB_TABLE,
    Item: {
      pk: { S: 'META' },
      sk: { S: 'lastCheck' },
      timestamp: { S: new Date().toISOString() }
    }
  }));
}

function formatTaskForTelegram(task, taskId) {
  const priorityEmoji = {
    hoch: '🔴',
    mittel: '🟡',
    niedrig: '🟢'
  };
  
  const sourceEmoji = {
    email: '📧',
    teams: '💬',
    meeting: '📅'
  };
  
  let text = `${sourceEmoji[task.source] || '📋'} <b>Neuer Task erkannt</b>\n\n`;
  text += `${priorityEmoji[task.priority] || '⚪'} <b>${task.title}</b>\n`;
  text += `\n📍 <i>${task.context}</i>\n`;
  
  if (task.deadline) {
    text += `\n⏰ Deadline: ${new Date(task.deadline).toLocaleDateString('de-DE')}`;
  }
  
  text += `\n\n<code>${taskId}</code>`;
  
  return text;
}

async function sendTaskSuggestion(task) {
  const taskId = await saveTaskSuggestion(task);
  const text = formatTaskForTelegram(task, taskId);
  
  const keyboard = {
    inline_keyboard: [[
      { text: '✅ Erstellen', callback_data: `task_accept:${taskId}` },
      { text: '❌ Ignorieren', callback_data: `task_dismiss:${taskId}` },
      { text: '⏰ Später', callback_data: `task_later:${taskId}` }
    ]]
  };
  
  await sendTelegramMessage(text, keyboard);
  return taskId;
}

async function sendTaskDigest(tasks, maxInline = 2) {
  if (tasks.length === 0) return;

  const saved = [];
  for (const task of tasks) {
    const taskId = await saveTaskSuggestion(task);
    saved.push({ task, taskId });
  }

  const priorityEmoji = { hoch: '🔴', mittel: '🟡', niedrig: '🟢' };
  let text = `📬 <b>${saved.length} mögliche Task(s)</b>\n\n`;

  for (const { task } of saved) {
    text += `${priorityEmoji[task.priority] || '⚪'} ${task.title}\n`;
    if (task.context) {
      text += `   <i>${task.context.slice(0, 100)}</i>\n`;
    }
    text += '\n';
  }

  text += 'Nutze /tasks für alle Vorschläge mit Annehmen/Ignorieren.';

  const keyboard = saved.length <= maxInline ? {
    inline_keyboard: saved.map(({ taskId, task }) => ([
      { text: `✅ ${task.title.slice(0, 28)}`, callback_data: `task_accept:${taskId}` },
      { text: '❌', callback_data: `task_dismiss:${taskId}` }
    ]))
  } : null;

  await sendTelegramMessage(text, keyboard);
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS'
};

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event));
  
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }
  
  const path = event.path || event.rawPath || '';
  
  if (path.endsWith('/oauth-callback')) {
    return await handleOAuthCallback(event);
  }
  
  if (path.endsWith('/status')) {
    return await handleStatusRequest();
  }
  
  if (path.endsWith('/settings')) {
    if (event.httpMethod === 'PUT') {
      return await handleSaveSettings(event);
    }
    return await handleGetSettings();
  }
  
  if (path.endsWith('/test')) {
    return await handleTestExtraction();
  }
  
  if (event.source === 'aws.events') {
    return await processScheduledCheck();
  }
  
  if (event.body) {
    const body = JSON.parse(event.body);
    
    if (body.callback_query) {
      return await handleCallbackQuery(body.callback_query);
    }
    
    if (body.message?.text) {
      return await handleCommand(body.message);
    }
  }
  
  return { statusCode: 200, body: 'OK' };
};

async function handleOAuthCallback(event) {
  try {
    const body = JSON.parse(event.body || '{}');
    const { code, redirectUri } = body;
    
    if (!code) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Missing authorization code' })
      };
    }
    
    const tokenResponse = await graphClient.exchangeCodeForTokens(code, redirectUri);
    
    if (tokenResponse.refresh_token) {
      await graphClient.saveRefreshToken(tokenResponse.refresh_token, tokenResponse.userTenantId);
    }
    
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: true })
    };
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: error.message })
    };
  }
}

async function handleStatusRequest() {
  try {
    const isConnected = await graphClient.checkConnection();
    
    if (!isConnected) {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ connected: false })
      };
    }
    
    const userInfo = await graphClient.getCurrentUser();
    
    const todaysTasks = await getTodaysTasks();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const result = await dynamoClient.send(new ScanCommand({
      TableName: DYNAMODB_TABLE,
      FilterExpression: 'createdAt >= :weekAgo',
      ExpressionAttributeValues: { ':weekAgo': { S: sevenDaysAgo } }
    }));
    
    const weekTasks = (result.Items || []).map(item => unmarshall(item));
    
    const stats = {
      tasksExtracted: weekTasks.length,
      tasksAccepted: weekTasks.filter(t => t.status === 'accepted').length,
      tasksDismissed: weekTasks.filter(t => t.status === 'dismissed').length,
      tasksPending: weekTasks.filter(t => t.status === 'pending').length
    };
    
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        connected: true,
        user: userInfo,
        stats
      })
    };
    
  } catch (error) {
    console.error('Status check error:', error);
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ connected: false, error: error.message })
    };
  }
}

async function handleGetSettings() {
  try {
    const result = await dynamoClient.send(new QueryCommand({
      TableName: DYNAMODB_TABLE,
      KeyConditionExpression: 'pk = :pk AND sk = :sk',
      ExpressionAttributeValues: {
        ':pk': { S: 'META' },
        ':sk': { S: 'settings' }
      }
    }));
    
    const settings = result.Items?.[0] ? unmarshall(result.Items[0]) : {
      checkInterval: 120,
      summaryTime: '18:00',
      emailsEnabled: true,
      teamsEnabled: false,
      meetingsEnabled: false,
      minConfidence: 0.88,
      dailySummaryEnabled: false,
      maxSuggestionsPerRun: 3,
      notifyMode: 'digest'
    };
    
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(settings)
    };
    
  } catch (error) {
    console.error('Get settings error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: error.message })
    };
  }
}

async function handleSaveSettings(event) {
  try {
    const settings = JSON.parse(event.body || '{}');
    
    await dynamoClient.send(new PutItemCommand({
      TableName: DYNAMODB_TABLE,
      Item: {
        pk: { S: 'META' },
        sk: { S: 'settings' },
        checkInterval: { N: String(settings.checkInterval || 120) },
        summaryTime: { S: settings.summaryTime || '18:00' },
        emailsEnabled: { BOOL: settings.emailsEnabled !== false },
        teamsEnabled: { BOOL: settings.teamsEnabled === true },
        meetingsEnabled: { BOOL: settings.meetingsEnabled === true },
        minConfidence: { N: String(settings.minConfidence || 0.88) },
        dailySummaryEnabled: { BOOL: settings.dailySummaryEnabled === true },
        maxSuggestionsPerRun: { N: String(settings.maxSuggestionsPerRun || 3) },
        notifyMode: { S: settings.notifyMode || 'digest' },
        updatedAt: { S: new Date().toISOString() }
      }
    }));
    
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: true })
    };
    
  } catch (error) {
    console.error('Save settings error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: error.message })
    };
  }
}

async function handleTestExtraction() {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const emails = await graphClient.getNewEmails(oneHourAgo);
    
    let tasksFound = 0;
    if (emails.length > 0) {
      const { myTasks } = await taskParser.processAllSources(emails.slice(0, 3), [], []);
      tasksFound = myTasks.length;
    }
    
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        emailsProcessed: Math.min(emails.length, 3),
        tasksFound
      })
    };
    
  } catch (error) {
    console.error('Test extraction error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: error.message })
    };
  }
}

async function processScheduledCheck() {
  console.log('Running scheduled check...');

  const settings = await loadSettings();
  const knownTitles = await getKnownTaskTitles();
  const lastCheck = await getLastCheckTimestamp();
  console.log('Last check:', lastCheck, 'Settings:', settings);

  try {
    const [emails, teamsMessages, meetings] = await Promise.all([
      settings.emailsEnabled ? graphClient.getNewEmails(lastCheck) : Promise.resolve([]),
      settings.teamsEnabled ? graphClient.getTeamsMessages(lastCheck) : Promise.resolve([]),
      settings.meetingsEnabled ? graphClient.getUpcomingMeetings(24) : Promise.resolve([])
    ]);

    console.log(`Fetched: ${emails.length} emails, ${teamsMessages.length} teams, ${meetings.length} meetings`);

    if (emails.length === 0 && teamsMessages.length === 0 && meetings.length === 0) {
      console.log('No new content to process');
      await setLastCheckTimestamp();
      return { statusCode: 200, body: 'No new content' };
    }

    const { myTasks, summary } = await taskParser.processAllSources(emails, teamsMessages, meetings, {
      minConfidence: Number(settings.minConfidence) || 0.88,
      meetingsEnabled: settings.meetingsEnabled === true,
      teamsEnabled: settings.teamsEnabled === true,
      emailsEnabled: settings.emailsEnabled !== false,
      knownTitles
    });

    console.log('Task extraction summary:', summary);

    if (myTasks.length === 0) {
      console.log('No high-confidence tasks — no Telegram ping');
      await setLastCheckTimestamp();
      return { statusCode: 200, body: JSON.stringify(summary) };
    }

    const maxPerRun = Number(settings.maxSuggestionsPerRun) || 3;
    const toNotify = myTasks.slice(0, maxPerRun);

    if (settings.notifyMode === 'single' && toNotify.length === 1) {
      await sendTaskSuggestion(toNotify[0]);
    } else {
      await sendTaskDigest(toNotify);
    }

    await setLastCheckTimestamp();

    return { statusCode: 200, body: JSON.stringify(summary) };

  } catch (error) {
    console.error('Processing error:', error);
    await sendTelegramMessage(`❌ Fehler beim Verarbeiten: ${error.message}`);
    return { statusCode: 500, body: error.message };
  }
}

async function handleCallbackQuery(query) {
  const [action, taskId] = query.data.split(':');
  
  try {
    if (action === 'task_accept') {
      const tasks = await getPendingTasks();
      const task = tasks.find(t => t.taskId === taskId);
      
      if (task) {
        const todoResult = await graphClient.createTodoTask(
          task.title,
          task.deadline,
          `Quelle: ${task.source}\nKontext: ${task.context}`
        );
        
        await updateTaskStatus(taskId, 'accepted', todoResult.id);
        await sendTelegramMessage(`✅ Task erstellt in Microsoft To-Do:\n<b>${task.title}</b>`);
      }
      
    } else if (action === 'task_dismiss') {
      await updateTaskStatus(taskId, 'dismissed');
      await sendTelegramMessage(`❌ Task ignoriert.`);
      
    } else if (action === 'task_later') {
      await sendTelegramMessage(`⏰ Task bleibt offen. Nutze /tasks um alle offenen Tasks zu sehen.`);
    }
    
  } catch (error) {
    console.error('Callback error:', error);
    await sendTelegramMessage(`❌ Fehler: ${error.message}`);
  }
  
  return { statusCode: 200, body: 'OK' };
}

async function handleCommand(message) {
  const text = message.text?.trim().toLowerCase();
  
  if (text === '/tasks') {
    const pending = await getPendingTasks();
    
    if (pending.length === 0) {
      await sendTelegramMessage('📭 Keine offenen Task-Vorschläge.');
      return { statusCode: 200, body: 'OK' };
    }
    
    let response = `📋 <b>Offene Task-Vorschläge (${pending.length})</b>\n\n`;
    
    for (const task of pending.slice(0, 10)) {
      const priorityEmoji = { hoch: '🔴', mittel: '🟡', niedrig: '🟢' };
      response += `${priorityEmoji[task.priority] || '⚪'} ${task.title}\n`;
      response += `   <i>${task.context}</i>\n\n`;
    }
    
    if (pending.length > 10) {
      response += `<i>... und ${pending.length - 10} weitere</i>`;
    }
    
    await sendTelegramMessage(response);
    
  } else if (text === '/today') {
    const todaysTasks = await getTodaysTasks();
    
    const accepted = todaysTasks.filter(t => t.status === 'accepted');
    const dismissed = todaysTasks.filter(t => t.status === 'dismissed');
    const pending = todaysTasks.filter(t => t.status === 'pending');
    
    let response = `📊 <b>Heute</b>\n\n`;
    response += `✅ Akzeptiert: ${accepted.length}\n`;
    response += `❌ Ignoriert: ${dismissed.length}\n`;
    response += `⏳ Offen: ${pending.length}\n`;
    
    if (accepted.length > 0) {
      response += `\n<b>Erstellt:</b>\n`;
      for (const task of accepted.slice(0, 5)) {
        response += `• ${task.title}\n`;
      }
    }
    
    await sendTelegramMessage(response);
    
  } else if (text === '/dismissall') {
    const pending = await getPendingTasks();
    for (const task of pending) {
      await updateTaskStatus(task.taskId, 'dismissed');
    }
    await sendTelegramMessage(`🧹 ${pending.length} offene Vorschläge ignoriert.`);

  } else if (text === '/digest' || text === '/summary') {
    const todaysTasks = await getTodaysTasks();
    
    const accepted = todaysTasks.filter(t => t.status === 'accepted');
    const dismissed = todaysTasks.filter(t => t.status === 'dismissed');
    const pending = todaysTasks.filter(t => t.status === 'pending');
    
    const summary = await taskParser.generateDailySummary(pending, accepted, dismissed);
    
    await sendTelegramMessage(`🌅 <b>Tages-Zusammenfassung</b>\n\n${summary}`);

  } else if (text === '/offen') {
    await sendUnansweredMailMessage();

  } else if (text === '/feierabend') {
    return await exports.feierabendCheck({ source: 'command' });
    
  } else if (text === '/help') {
    const helpText = `🤖 <b>Task Extractor</b>

<b>Automatisch:</b>
Periodisch werden Emails geprüft (Teams/Kalender standardmäßig aus).
Nur echte Action Items → max. 3 pro Lauf als Digest.

<b>Befehle:</b>
/tasks - Offene Vorschläge anzeigen
/today - Heutige Übersicht
/digest - Tages-Zusammenfassung
/offen - Unbeantwortete Mails
/feierabend - Feierabend-Check jetzt
/dismissall - Alle offenen Vorschläge verwerfen

<b>Bei Vorschlägen:</b>
✅ Erstellen → Task in To-Do anlegen
❌ Ignorieren → Verwerfen
⏰ Später → Offen lassen`;
    
    await sendTelegramMessage(helpText);
  }
  
  return { statusCode: 200, body: 'OK' };
}

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function zurichDate() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Zurich' });
}

function formatDurationLabel(hours) {
  const q = Math.round(Number(hours) * 4) / 4;
  if (!q || q < 0.25) return null;
  if (q === 0.25) return '15min';
  if (q === 0.5) return '30min';
  if (q === 0.75) return '45min';
  return Number.isInteger(q) ? `${q}h` : `${q}h`;
}

const SKIP_CALENDAR_TITLE = /^(lunch|mittag(essen)?|focus time|fokuszeit|ooo|abwesend|urlaub|vacation|private)$/i;

function normalizeTitle(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9äöüàéè]+/gi, ' ')
    .trim();
}

function eventAlreadyLogged(event, artifacts) {
  const evWords = normalizeTitle(event.title).split(' ').filter((w) => w.length > 3);
  if (!evWords.length) {
    return artifacts.some((a) => normalizeTitle(a.title) === normalizeTitle(event.title));
  }
  return artifacts.some((a) => {
    const logged = normalizeTitle(`${a.title} ${a.customer || ''}`);
    const hits = evWords.filter((w) => logged.includes(w)).length;
    return hits >= Math.min(2, evWords.length);
  });
}

async function loadTodaysCalendarEvents() {
  const day = zurichDate();
  const result = await dynamoClient.send(new GetItemCommand({
    TableName: DYNAMODB_TABLE,
    Key: { pk: { S: 'CALENDAR' }, sk: { S: day } }
  }));
  if (!result.Item) return [];
  const item = unmarshall(result.Item);
  try {
    return typeof item.events === 'string' ? JSON.parse(item.events) : (item.events || []);
  } catch {
    return [];
  }
}

function formatCalendarSuggestions(events, artifacts) {
  const open = (events || [])
    .filter((ev) => ev?.title && !SKIP_CALENDAR_TITLE.test(ev.title.trim()))
    .filter((ev) => formatDurationLabel(ev.hours))
    .filter((ev) => !eventAlreadyLogged(ev, artifacts));

  if (!open.length) {
    if (events?.length) {
      return '📅 <b>Kalender</b>\nAlle heutigen Termine sind erfasst.';
    }
    return '';
  }

  const lines = ['📅 <b>Vorschläge aus dem Kalender</b>\nSchreib den Text zum Übernehmen:'];
  for (const ev of open.slice(0, 8)) {
    const dur = formatDurationLabel(ev.hours);
    const title = ev.title.replace(/\s+/g, ' ').trim();
    const cmd = `${dur} ${title}`;
    const window = ev.start && ev.end ? ` (${ev.start}–${ev.end})` : '';
    lines.push(`• <code>${escapeHtml(cmd)}</code>${escapeHtml(window)}`);
  }
  return lines.join('\n');
}

async function loadTodaysTimeEntries() {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: '6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com',
      path: '/v1/onboarding-progress?userId=default-user',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const progress = JSON.parse(data).progress || {};
          const artifacts = progress.productivityTracker?.artifacts || [];
          const today = new Date().toISOString().split('T')[0];
          resolve(artifacts.filter(a => a.date === today));
        } catch (e) {
          resolve([]);
        }
      });
    });
    req.on('error', () => resolve([]));
    req.end();
  });
}

function formatExchangeError(message) {
  const text = String(message || '');
  if (text.includes('AADSTS65001') || text.includes('has not consented') || text.includes('Kein Refresh Token')) {
    return 'Exchange-Zugang einmal freigeben:\nhttps://manuel-weiss.ch/onboarding/task-extractor';
  }
  return 'Exchange-Check gerade nicht möglich. Später /feierabend.';
}

function formatUnansweredSection(unanswered, limit = 8) {
  if (!unanswered.length) {
    return '✉️ <b>Unbeantwortete Mails</b>\nKeine offenen Mails älter als 4 Stunden.';
  }

  const lines = [`✉️ <b>Unbeantwortete Mails (${unanswered.length})</b>`];
  let currentLabel = null;
  for (const mail of unanswered.slice(0, limit)) {
    if (mail.label !== currentLabel) {
      currentLabel = mail.label;
      lines.push(`\n<b>${mail.label}</b>`);
    }
    const sender = escapeHtml(mail.senderName || mail.sender);
    const subject = escapeHtml(mail.subject).slice(0, 50);
    if (mail.webLink) {
      lines.push(`• <a href="${mail.webLink}">${subject}</a> (${sender}) – vor ${mail.ageHuman}`);
    } else {
      lines.push(`• ${subject} (${sender}) – vor ${mail.ageHuman}`);
    }
  }
  if (unanswered.length > limit) {
    lines.push(`\n<i>… und ${unanswered.length - limit} weitere. /offen für die volle Liste.</i>`);
  }
  return lines.join('\n');
}

async function sendUnansweredMailMessage() {
  try {
    const unanswered = await graphClient.getUnansweredEmails();
    await sendTelegramMessage(formatUnansweredSection(unanswered, 25));
  } catch (error) {
    console.error('Unanswered mail check failed:', error);
    await sendTelegramMessage(`✉️ Mail-Check fehlgeschlagen.\n${formatExchangeError(error.message)}`);
  }
}

exports.feierabendCheck = async (event) => {
  console.log('Feierabend-Check', event?.source || 'schedule');

  if (event?.source === 'offen') {
    await sendUnansweredMailMessage();
    return { statusCode: 200, body: 'Unanswered mail check sent' };
  }

  const [todayArtifacts, unanswered, todaysTasks, calendarEvents] = await Promise.all([
    loadTodaysTimeEntries(),
    graphClient.getUnansweredEmails().catch((err) => {
      console.error('Exchange unanswered failed:', err);
      return { error: err.message };
    }),
    getTodaysTasks().catch(() => []),
    loadTodaysCalendarEvents().catch((err) => {
      console.error('Calendar snapshot failed:', err);
      return [];
    })
  ]);

  const totalHours = todayArtifacts.reduce((sum, a) => sum + (a.durationHours || 0), 0);
  let timeBlock;
  if (todayArtifacts.length === 0) {
    timeBlock = `⏱ <b>Zeiterfassung</b>\nNoch nichts erfasst.\nSchreib z.B. <code>2h Horizon Support</code>`;
  } else {
    timeBlock = `⏱ <b>Zeiterfassung</b>\n${todayArtifacts.length} Einträge, ${totalHours.toFixed(1)}h\nNoch was vergessen? Einfach schreiben.`;
  }

  let mailBlock;
  if (unanswered?.error) {
    mailBlock = `✉️ <b>Unbeantwortete Mails</b>\n${formatExchangeError(unanswered.error)}`;
  } else {
    mailBlock = formatUnansweredSection(unanswered || []);
  }

  const pending = todaysTasks.filter(t => t.status === 'pending');
  const accepted = todaysTasks.filter(t => t.status === 'accepted');
  let taskBlock = '';
  if (pending.length || accepted.length) {
    taskBlock = `\n\n📋 <b>Tasks heute</b>\n✅ ${accepted.length} erstellt · ⏳ ${pending.length} offen`;
    if (pending.length) taskBlock += `\n<i>/tasks für die offenen Vorschläge</i>`;
  }

  const calendarBlock = formatCalendarSuggestions(calendarEvents, todayArtifacts);
  const message = `🌅 <b>Feierabend-Check</b>\n\n${timeBlock}${calendarBlock ? `\n\n${calendarBlock}` : ''}\n\n${mailBlock}${taskBlock}`;
  await sendTelegramMessage(message);

  return { statusCode: 200, body: 'Feierabend-Check sent' };
};

exports.dailySummary = exports.feierabendCheck;
