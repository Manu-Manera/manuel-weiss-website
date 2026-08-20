/**
 * Microsoft Graph API Client
 * 
 * Handhabt OAuth Token Refresh und API-Aufrufe für:
 * - Emails lesen
 * - Teams-Nachrichten lesen
 * - Kalender/Meetings lesen
 * - To-Do Tasks erstellen
 */

const https = require('https');
const { SecretsManagerClient, GetSecretValueCommand, PutSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

const secretsClient = new SecretsManagerClient({ region: 'eu-central-1' });
const SECRET_NAME = 'task-extractor/graph-credentials';

let credentials = null;
let accessToken = null;
let tokenExpiry = null;

async function loadCredentials() {
  if (credentials) return credentials;
  
  const command = new GetSecretValueCommand({ SecretId: SECRET_NAME });
  const response = await secretsClient.send(command);
  credentials = JSON.parse(response.SecretString);
  return credentials;
}

async function refreshAccessToken() {
  const creds = await loadCredentials();
  
  if (!creds.refreshToken) {
    throw new Error('Kein Refresh Token vorhanden. Führe OAuth-Flow durch.');
  }
  
  const params = new URLSearchParams({
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
    refresh_token: creds.refreshToken,
    grant_type: 'refresh_token',
    scope: 'offline_access Mail.Read Calendars.Read Tasks.ReadWrite User.Read ChannelMessage.Read.All'
  });

  const tenantPath = creds.userTenantId || 'organizations';

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'login.microsoftonline.com',
      path: `/${tenantPath}/oauth2/v2.0/token`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(params.toString())
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', async () => {
        try {
          const tokens = JSON.parse(data);
          
          if (tokens.error) {
            reject(new Error(`Token refresh failed: ${tokens.error_description}`));
            return;
          }
          
          accessToken = tokens.access_token;
          tokenExpiry = Date.now() + (tokens.expires_in * 1000) - 60000;
          
          if (tokens.refresh_token && tokens.refresh_token !== creds.refreshToken) {
            creds.refreshToken = tokens.refresh_token;
            await secretsClient.send(new PutSecretValueCommand({
              SecretId: SECRET_NAME,
              SecretString: JSON.stringify(creds)
            }));
          }
          
          resolve(accessToken);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(params.toString());
    req.end();
  });
}

async function getAccessToken() {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }
  return await refreshAccessToken();
}

async function graphRequest(endpoint, method = 'GET', body = null) {
  const token = await getAccessToken();
  
  const url = new URL(endpoint.startsWith('http') ? endpoint : `https://graph.microsoft.com/v1.0${endpoint}`);
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (body) {
      const bodyStr = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode === 204) {
            resolve(null);
            return;
          }
          if (res.statusCode === 401 || res.statusCode === 403) {
            reject(new Error(`Graph API ${res.statusCode} auf ${url.pathname} – Microsoft-Login evtl. abgelaufen. Bitte unter https://manuel-weiss.ch/onboarding/task-extractor neu verbinden.`));
            return;
          }
          if (!data) {
            reject(new Error(`Graph API Error: empty response (${res.statusCode})`));
            return;
          }
          const result = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`Graph API Error: ${result.error?.message || data}`));
            return;
          }
          resolve(result);
        } catch (e) {
          reject(new Error(`Graph API parse error (${res.statusCode}): ${e.message}`));
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function getNewEmails(sinceDateTime) {
  const filter = sinceDateTime 
    ? `receivedDateTime ge ${sinceDateTime}` 
    : '';
  const endpoint = `/me/mailFolders/inbox/messages?$filter=${encodeURIComponent(filter)}&$top=50&$select=id,subject,from,receivedDateTime,bodyPreview,importance&$orderby=receivedDateTime desc`;
  
  try {
    const result = await graphRequest(endpoint);
    return result.value || [];
  } catch (error) {
    console.error('Error fetching emails:', error);
    return [];
  }
}

async function getEmail(emailId) {
  const endpoint = `/me/messages/${emailId}?$select=id,subject,from,receivedDateTime,body,importance`;
  return await graphRequest(endpoint);
}

async function getTeamsMessages(sinceDateTime) {
  try {
    const teamsResponse = await graphRequest('/me/joinedTeams');
    const teams = teamsResponse.value || [];
    
    const messages = [];
    
    for (const team of teams.slice(0, 5)) {
      try {
        const channelsResponse = await graphRequest(`/teams/${team.id}/channels`);
        const channels = channelsResponse.value || [];
        
        for (const channel of channels.slice(0, 3)) {
          try {
            let endpoint = `/teams/${team.id}/channels/${channel.id}/messages?$top=20`;
            const msgResponse = await graphRequest(endpoint);
            
            for (const msg of (msgResponse.value || [])) {
              if (msg.body?.content && msg.from?.user) {
                const msgDate = new Date(msg.createdDateTime);
                const sinceDate = sinceDateTime ? new Date(sinceDateTime) : new Date(0);
                
                if (msgDate > sinceDate) {
                  messages.push({
                    id: msg.id,
                    teamName: team.displayName,
                    channelName: channel.displayName,
                    from: msg.from.user.displayName,
                    content: msg.body.content.replace(/<[^>]*>/g, '').substring(0, 500),
                    createdDateTime: msg.createdDateTime,
                    importance: msg.importance
                  });
                }
              }
            }
          } catch (channelError) {
            console.log(`Skipping channel ${channel.displayName}:`, channelError.message);
          }
        }
      } catch (teamError) {
        console.log(`Skipping team ${team.displayName}:`, teamError.message);
      }
    }
    
    return messages;
  } catch (error) {
    console.error('Error fetching Teams messages:', error);
    return [];
  }
}

async function getUpcomingMeetings(hoursAhead = 24) {
  const now = new Date();
  const end = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
  
  const endpoint = `/me/calendarView?startDateTime=${now.toISOString()}&endDateTime=${end.toISOString()}&$select=id,subject,start,end,organizer,attendees,bodyPreview&$top=20`;
  
  try {
    const result = await graphRequest(endpoint);
    return (result.value || []).map(event => ({
      id: event.id,
      subject: event.subject,
      start: event.start.dateTime,
      end: event.end.dateTime,
      organizer: event.organizer?.emailAddress?.name,
      attendees: (event.attendees || []).map(a => a.emailAddress?.name).filter(Boolean),
      bodyPreview: event.bodyPreview
    }));
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return [];
  }
}

async function createTodoTask(title, dueDateTime = null, notes = null) {
  const listsResponse = await graphRequest('/me/todo/lists');
  const defaultList = listsResponse.value?.find(l => l.isDefaultList) || listsResponse.value?.[0];
  
  if (!defaultList) {
    throw new Error('Keine To-Do Liste gefunden');
  }
  
  const taskBody = {
    title,
    importance: 'normal'
  };
  
  if (dueDateTime) {
    taskBody.dueDateTime = {
      dateTime: dueDateTime,
      timeZone: 'Europe/Zurich'
    };
  }
  
  if (notes) {
    taskBody.body = {
      content: notes,
      contentType: 'text'
    };
  }
  
  const result = await graphRequest(`/me/todo/lists/${defaultList.id}/tasks`, 'POST', taskBody);
  return result;
}

async function getCurrentUser() {
  return await graphRequest('/me?$select=displayName,mail,userPrincipalName');
}

const SKIP_SENDER_RE = /(no-?reply|do-?not-?reply|newsletter|notification|mailer-daemon|postmaster|automated|kein-antwort|noreply)/i;
const SKIP_SENDER_DOMAIN_RE = /@(.*\.)?(microsoft\.com|sharepoint\.com|office365\.com)$/i;
const SKIP_SUBJECT_RE = /(abwesenheit|out\s+of\s+office|automatische\s+antwort|automatic\s+reply|unzustellbar|undeliverable|zur[uü]ckgerufen|recall|^accepted:\s|^zugesagt:\s|^mit\s+vorbehalt:\s|^declined:\s|^abgelehnt:\s|^tentatively\s+accepted:\s|organize\s+your\s+day\s+with|hat (einen |auf einen )?Kommentar in |replied to a comment in|wants to access )/i;
const SUBJECT_PREFIX_RE = /^\s*(re|aw|wg|fw|fwd)\s*:\s*/i;

function normalizeSubject(subject) {
  let s = String(subject || '');
  while (true) {
    const cleaned = s.replace(SUBJECT_PREFIX_RE, '').trim();
    if (cleaned === s) break;
    s = cleaned;
  }
  return s.replace(/\[.*?\]\s*/g, '').toLowerCase().trim();
}

function addrOf(obj) {
  return (obj?.emailAddress?.address || obj?.address || '').toLowerCase();
}

function humanAge(seconds) {
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
  const hours = seconds / 3600;
  if (hours < 48) return `${Math.floor(hours)}h`;
  return `${Math.floor(hours / 24)} Tagen`;
}

function escalation(ageSeconds) {
  if (ageSeconds >= 48 * 3600) return { level: 3, label: 'KRITISCH' };
  if (ageSeconds >= 24 * 3600) return { level: 2, label: 'DRINGEND' };
  if (ageSeconds >= 4 * 3600) return { level: 1, label: 'OFFEN' };
  return { level: 0, label: '' };
}

async function getUnansweredEmails({ inboxLimit = 50, sentLimit = 80, minAgeHours = 4 } = {}) {
  const me = await getCurrentUser();
  const self = new Set(
    [me.mail, me.userPrincipalName, 'weiss@valkeen.com']
      .filter(Boolean)
      .map((e) => e.toLowerCase())
  );

  const inboxSelect = 'id,subject,from,toRecipients,receivedDateTime,conversationId,webLink';
  const sentSelect = 'id,subject,toRecipients,sentDateTime,conversationId';
  const inboxRes = await graphRequest(
    `/me/mailFolders/inbox/messages?$top=${inboxLimit}&$select=${inboxSelect}&$orderby=receivedDateTime%20desc`
  );
  const sentRes = await graphRequest(
    `/me/mailFolders/sentitems/messages?$top=${sentLimit}&$select=${sentSelect}&$orderby=sentDateTime%20desc`
  );

  const inbox = inboxRes.value || [];
  const sent = sentRes.value || [];
  const answeredConversations = new Set(sent.map((m) => m.conversationId).filter(Boolean));
  const sentBySubjectTo = sent.map((m) => ({
    subject: normalizeSubject(m.subject),
    to: (m.toRecipients || []).map(addrOf),
    sentAt: m.sentDateTime ? new Date(m.sentDateTime).getTime() : 0
  }));

  const now = Date.now();
  const minAgeMs = minAgeHours * 3600 * 1000;
  const unanswered = [];

  for (const mail of inbox) {
    const sender = addrOf(mail.from);
    const senderName = mail.from?.emailAddress?.name || sender;
    const toAddrs = (mail.toRecipients || []).map(addrOf);
    const received = mail.receivedDateTime ? new Date(mail.receivedDateTime).getTime() : now;
    const age = now - received;

    if (!sender) continue;
    if (self.has(sender)) continue;
    if (SKIP_SENDER_RE.test(sender) || SKIP_SENDER_RE.test(senderName)) continue;
    if (SKIP_SENDER_DOMAIN_RE.test(sender)) continue;
    if (SKIP_SUBJECT_RE.test(mail.subject || '')) continue;
    if (toAddrs.length && !toAddrs.some((a) => self.has(a))) continue;
    if (age < minAgeMs) continue;

    if (mail.conversationId && answeredConversations.has(mail.conversationId)) continue;

    const inboxSubj = normalizeSubject(mail.subject);
    const replied = sentBySubjectTo.some((s) => {
      if (!s.to.includes(sender)) return false;
      if (!inboxSubj || !s.subject) return false;
      if (s.sentAt < received) return false;
      return s.subject === inboxSubj || s.subject.includes(inboxSubj) || inboxSubj.includes(s.subject);
    });
    if (replied) continue;

    const esc = escalation(age / 1000);
    unanswered.push({
      id: mail.id,
      subject: mail.subject || '(kein Betreff)',
      sender,
      senderName,
      ageSeconds: age / 1000,
      ageHuman: humanAge(age / 1000),
      level: esc.level,
      label: esc.label,
      webLink: mail.webLink || ''
    });
  }

  unanswered.sort((a, b) => b.level - a.level || b.ageSeconds - a.ageSeconds);
  return unanswered;
}

async function exchangeCodeForTokens(code, redirectUri) {
  const creds = await loadCredentials();
  
  const params = new URLSearchParams({
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
    code,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
    scope: 'offline_access Mail.Read Calendars.Read Tasks.ReadWrite User.Read ChannelMessage.Read.All'
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'login.microsoftonline.com',
      path: '/organizations/oauth2/v2.0/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(params.toString())
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', async () => {
        try {
          const tokens = JSON.parse(data);
          if (tokens.error) {
            reject(new Error(`Token exchange failed: ${tokens.error_description}`));
            return;
          }
          
          if (tokens.id_token) {
            try {
              const payload = JSON.parse(Buffer.from(tokens.id_token.split('.')[1], 'base64').toString());
              tokens.userTenantId = payload.tid;
              console.log('User tenant ID:', payload.tid);
            } catch (e) {
              console.log('Could not extract tenant from id_token');
            }
          }
          
          resolve(tokens);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(params.toString());
    req.end();
  });
}

async function saveRefreshToken(refreshToken, userTenantId = null) {
  const creds = await loadCredentials();
  creds.refreshToken = refreshToken;
  if (userTenantId) {
    creds.userTenantId = userTenantId;
  }
  
  await secretsClient.send(new PutSecretValueCommand({
    SecretId: SECRET_NAME,
    SecretString: JSON.stringify(creds)
  }));
  
  credentials = creds;
  accessToken = null;
  tokenExpiry = null;
}

async function checkConnection() {
  try {
    const creds = await loadCredentials();
    if (!creds.refreshToken) {
      return false;
    }
    await getAccessToken();
    return true;
  } catch (error) {
    console.log('Connection check failed:', error.message);
    return false;
  }
}

module.exports = {
  getNewEmails,
  getEmail,
  getTeamsMessages,
  getUpcomingMeetings,
  createTodoTask,
  getCurrentUser,
  getUnansweredEmails,
  graphRequest,
  exchangeCodeForTokens,
  saveRefreshToken,
  checkConnection
};
