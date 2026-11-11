/**
 * Stellensuche für den Bewerbungsmanager (applications/dashboard.html, Tab «Stellensuche»).
 *
 * Läuft über eine Lambda Function URL, weil eine Suche über alle Quellen länger
 * dauert als die 29 s von API Gateway. Ein Endpunkt, Aktion im JSON-Body:
 *   state        → Kriterien, letzte Trefferliste, Anzahl gesehener Stellen
 *   search       → Quellen abfragen, scoren, gegen «gesehen» filtern, Liste speichern
 *   saveResults  → Liste mit KI-Bewertung (aus dem Browser) zurückschreiben
 *   saveCriteria → Suchkriterien speichern
 *   mark         → Stellen als applied / dismissed markieren (oder Markierung lösen)
 *   posting      → Volltext einer Stellenanzeige holen (für das Anschreiben)
 *
 * Portierung von bewerbungen/scripts/fetch_jobs.py (gleiche Quellen und Scoring-Logik).
 */

const crypto = require('crypto');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, BatchWriteCommand
} = require('@aws-sdk/lib-dynamodb');

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' }));
const TABLE = process.env.JOB_SEARCH_TABLE || 'mawps-job-search';
const USER_POOL_ID = process.env.USER_POOL_ID || 'eu-central-1_8gP4gLK9r';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';
const BA_UA = 'Jobsuche/2.9.2 (de.arbeitsagentur.jobboerse; build:1077; iOS 15.1.0)';
const REQUEST_TIMEOUT_MS = 9000;
const SEARCH_BUDGET_MS = 80000;
const MAX_RESULTS = 40;

// ─────────────────────────────────────────────────────────────── Defaults

const DEFAULT_CRITERIA = {
  terms: [
    'UKG', 'HR Service Delivery', 'HR Prozesse', 'HR Strategie', 'HR Transformation',
    'HRIS Consultant', 'HR Prozessberater', 'Projektleiter HR'
  ],
  termsEn: ['ukg consultant', 'hr service delivery', 'hr transformation consultant', 'hr process consultant'],
  focusKeywords: [
    'UKG', 'HRSD', 'HR Service Delivery', 'ServiceNow HR', 'Employee Service Center',
    'HR-Prozess', 'HR Prozess', 'HR Process', 'Personalprozess', 'HR Shared Service',
    'HR Excellence', 'HR Operating Model', 'HR-Strategie', 'HR Strategie', 'HR Strategy',
    'People Strategy', 'Personalstrategie', 'HR-Transformation', 'HR Transformation', 'People Advisory'
  ],
  keywords: [
    'hris', 'hcm', 'hr-it', 'hr it', 'hr-digitalisierung', 'hr digitalisierung', 'hr software', 'hr-software',
    'personio', 'workday', 'successfactors', 'sap hcm', 'hr operations', 'people operations', 'hr system',
    'hr-system', 'hr-projekt', 'hr projekt', 'prozessmanagement', 'prozessberat', 'prozessmanager',
    'business process', 'bpmn', 'process excellence', 'prozessoptimierung', 'prozessdigitalisierung',
    'adonis', 'signavio', 'celonis', 'camunda', 'workflow', 'implementation', 'implementierung',
    'einführung', 'rollout', 'go-live', 'customer success', 'onboarding', 'datenmigration', 'konfiguration',
    'resource management', 'portfoliomanagement', 'organisationsentwicklung', 'case management',
    'knowledge management', 'employee experience', 'deel', 'remote.com', 'oyster', 'rippling', 'hibob'
  ],
  excludeTitle: [],
  regions: { ch: true, chRemote: true, euRemote: true, de: true, at: true },
  maxAgeDays: 30,
  sources: { linkedin: true, jobsch: true, arbeitsagentur: true, remote: true, ats: true },
  atsSources: [
    { type: 'greenhouse', token: 'remotecom', company: 'Remote.com' },
    { type: 'greenhouse', token: 'celonis', company: 'Celonis' },
    { type: 'ashby', token: 'oyster', company: 'Oyster' },
    { type: 'personio', token: 'alliantis', company: 'alliantis' },
    { type: 'personio', token: 'timly-software-ag', company: 'Timly' },
    { type: 'workday', tenant: 'eraneos', wd: 'wd3', site: 'Eraneos_External_Career_Site', company: 'Eraneos' },
    { type: 'workday', tenant: 'zuehlke', wd: 'wd3', site: 'Zuhlke-Careers', company: 'Zühlke', search: 'Consultant' }
  ],
  candidateProfile: ''
};

// Harte Ablehnung im Titel (wie fetch_jobs.py, gekürzt um Rauschen aus Aggregatoren)
const REJECT_TITLE = [
  'sales', 'vertrieb', 'account executive', 'business development', 'bdr', 'sdr',
  'marketing', 'growth', 'demand generation', 'recruiter', 'recruiting', 'talent acquisition', 'sourcing',
  'personalberater', 'developer', 'entwickler', 'software engineer', 'devops', 'frontend', 'backend',
  'full-stack', 'fullstack', 'data engineer', 'qa engineer', 'cloud engineer', 'platform engineer',
  'site reliability', 'security engineer', 'ml engineer', 'machine learning engineer', 'data scientist',
  'system engineer', 'systems engineer', 'ai engineer', 'principal architect', 'senior solution architect',
  'senior architect', 'lead architect', 'enterprise architect', 'chief ', 'field cto',
  'pflege', 'nurse', 'arzt', 'koch', 'fahrer', 'elektro', 'praktik', 'intern ', 'internship',
  'werkstudent', 'working student', 'designer', 'copywriter', 'account manager', 'key account',
  'writer', 'editor', 'assistant', 'assistenz', 'assistent', 'controller', 'accountant', 'buchhalt',
  'payroll', 'lohnbuchhalt', 'lohnadministrat', 'teacher', 'tutor', 'translator', 'service desk',
  'help desk', 'helpdesk', 'system administrator', 'systemadministrator', 'ausbildung', 'trainee',
  'auszubildende', 'head of', 'director', 'vice president', 'vp ', 'geschäftsführ', 'teamleiter',
  'teamleitung', 'abteilungsleit', 'team lead', 'sachbearbeit'
];

// Stufe-1-Rollen (Track Entwicklung) umgehen den Titel-Reject
const ALLOW_TITLE = [
  'solutions engineer', 'solution engineer', 'solutions consultant', 'solution consultant', 'presales',
  'pre-sales', 'sales engineer', 'customer engineer', 'technical account manager', 'implementation engineer',
  'integration consultant', 'integration specialist', 'technical consultant', 'associate solution architect'
];

const FOCUS_TITLE_RX = /\bukg\b|\bhrsd\b|hr[\s-]?service[\s-]?(delivery|center|centre)|servicenow\s+hr|employee\s+service|hr[\s-]?prozess\w*|personalprozess\w*|hr[\s-]?process\w*|hr[\s-]?shared[\s-]?service\w*|hr[\s-]?(operations[\s-]?)?excellence|operating[\s-]?model|hr[\s-]?strateg\w*|people[\s-]?strateg\w*|personalstrateg\w*|hr[\s-]?transformation|people[\s-]?advisory|hr[\s-]?organisation\w*/i;
const HR_TITLE_RX = /\b(hr|hris|hcm|hrsd|hr-it|people|personal\w*|prozess\w*|process\w*|bpm|bpmn|workflow\w*|organisationsentwicklung|digitalisierung)\b/i;
const CH_LOCATION_RX = /schweiz|switzerland|suisse|zürich|zuerich|zurich|\bbern\b|basel|luzern|lucerne|st\.?\s?gallen|winterthur|\bzug\b|aarau|olten|solothurn|thun|chur|(?:^|[\s,])ch(?:$|[\s,)])/i;
const DACH_RX = /german|deutsch|dach|schweiz|switzerland|zürich|zurich|österreich|austria|deutschland|germany/i;
const WFA_RX = /work from anywhere|anywhere in the world|worldwide|global(?:ly)? remote|weltweit/i;
const REGION_MISMATCH_RX = /\((?:us|usa|uk|ca|canada|au|apac|latam|india)\)|\busa?\b|united states|canada|americas?\b|north america|latam|\bamer\b|apac|australia|india\b|philippines|singapore|brazil|mexico|latin america|\b(?:est|pst|cst)\b|\(uk/i;
const REMOTE_AGG = new Set(['remotive', 'himalayas', 'jobicy', 'workingnomads', 'arbeitnow', 'ats']);

const LI_GEOS = {
  ch: ['Switzerland', '106693272', ''],
  chRemote: ['Switzerland', '106693272', '&f_WT=2'],
  euRemote: ['European Union', '91000000', '&f_WT=2'],
  de: ['Germany', '101282230', ''],
  at: ['Austria', '103883259', '']
};

// ─────────────────────────────────────────────────────────────── HTTP-Helfer

const CORS_HEADERS = { 'Content-Type': 'application/json' };

function respond(statusCode, body) {
  return { statusCode, headers: CORS_HEADERS, body: JSON.stringify(body) };
}

const ISSUER = `https://cognito-idp.eu-central-1.amazonaws.com/${USER_POOL_ID}`;
const ADMIN_GROUP = process.env.ADMIN_GROUP || 'admin';
let jwksCache = null;

async function signingKey(kid) {
  if (!jwksCache || !jwksCache.has(kid)) {
    const res = await fetch(`${ISSUER}/.well-known/jwks.json`);
    const { keys = [] } = await res.json();
    jwksCache = new Map(keys.map((k) => [k.kid, crypto.createPublicKey({ key: k, format: 'jwk' })]));
  }
  return jwksCache.get(kid) || null;
}

async function getUser(event) {
  const h = event.headers || {};
  const auth = h.authorization || h.Authorization || '';
  if (!auth.startsWith('Bearer ')) return { error: 401 };
  try {
    const [head, body, sig] = auth.slice(7).split('.');
    const header = JSON.parse(Buffer.from(head, 'base64url').toString());
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    const key = header.alg === 'RS256' ? await signingKey(header.kid) : null;
    if (!key || !crypto.verify('RSA-SHA256', Buffer.from(`${head}.${body}`), key, Buffer.from(sig, 'base64url'))) return { error: 401 };
    if (payload.iss !== ISSUER || !payload.exp || payload.exp * 1000 < Date.now()) return { error: 401 };
    const groups = payload['cognito:groups'] || [];
    if (!Array.isArray(groups) || !groups.includes(ADMIN_GROUP)) return { error: 403 };
    return { userId: payload.sub, email: payload.email || '' };
  } catch {
    return { error: 401 };
  }
}

async function httpText(url, { headers = {}, method = 'GET', body } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method, body, signal: ctrl.signal,
      headers: { 'User-Agent': UA, 'Accept-Language': 'de-CH,de;q=0.9,en;q=0.8', ...headers }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

async function httpJson(url, opts = {}) {
  return JSON.parse(await httpText(url, opts));
}

async function postJson(url, payload) {
  return httpJson(url, {
    method: 'POST', body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
  });
}

/** Führt Aufgaben mit begrenzter Parallelität aus und bricht nach Ablauf des Budgets ab. */
async function runPool(tasks, concurrency, deadline) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < tasks.length && Date.now() < deadline) {
      const task = tasks[i++];
      try {
        results.push(...(await task()));
      } catch (e) {
        console.warn('source task failed:', e.message);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, worker));
  return results;
}

const decode = (s) => String(s || '')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&#39;|&#x27;/g, "'").replace(/&nbsp;/g, ' ').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n));
const stripTags = (s) => decode(String(s || '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

function job(source, title, company, location, url, { remote = false, published = '', snippet = '', watch = false } = {}) {
  const t = decode(title).trim();
  const loc = decode(location).trim();
  const snip = stripTags(snippet).slice(0, 400);
  return {
    id: crypto.createHash('sha1').update(normUrl(url) || `${company}|${t}`).digest('hex').slice(0, 16),
    source, title: t, company: decode(company).trim(), location: loc, url: url || '',
    remote: !!remote, wfa: WFA_RX.test(`${t} ${loc} ${snip}`),
    published: String(published || '').slice(0, 10), snippet: snip, watchCompany: watch
  };
}

const normUrl = (u) => String(u || '').toLowerCase().split('?')[0].replace(/\/$/, '');

// ─────────────────────────────────────────────────────────────── Quellen

function linkedinTasks(c) {
  const geos = Object.entries(LI_GEOS).filter(([k]) => c.regions?.[k] !== false).map(([, g]) => g);
  const terms = [...c.terms.slice(0, 8), ...c.termsEn.slice(0, 2)];
  const tasks = [];
  for (const term of terms) {
    for (const [loc, geo, extra] of geos) {
      tasks.push(async () => {
        await new Promise((r) => setTimeout(r, 350));
        const url = 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search'
          + `?keywords=${encodeURIComponent(term)}&location=${encodeURIComponent(loc)}&geoId=${geo}${extra}&f_TPR=r1209600&start=0`;
        const html = await httpText(url);
        const out = [];
        for (const card of html.match(/<li>[\s\S]*?<\/li>/g) || []) {
          const title = card.match(/base-search-card__title[^>]*>\s*([\s\S]*?)\s*</);
          const comp = card.match(/base-search-card__subtitle[^>]*>[\s\S]*?>\s*([\s\S]*?)\s*</);
          const ort = card.match(/job-search-card__location[^>]*>\s*([\s\S]*?)\s*</);
          const link = card.match(/href="(https:\/\/[^"]*linkedin\.com\/jobs\/view\/[^"?]*)/);
          const dt = card.match(/datetime="([0-9-]+)"/);
          if (!title || !link) continue;
          out.push(job('linkedin', title[1], comp?.[1], ort?.[1] || loc, link[1].replace(/^https:\/\/\w+\./, 'https://www.'),
            { remote: extra.includes('f_WT=2'), published: dt?.[1] }));
        }
        return out;
      });
    }
  }
  return tasks;
}

function jobschTasks(c) {
  return c.terms.map((term) => async () => {
    const out = [];
    for (const page of [1, 2]) {
      const data = await httpJson(`https://www.jobs.ch/api/v1/public/search?query=${encodeURIComponent(term)}&rows=20&page=${page}`);
      for (const d of data.documents || []) {
        out.push(job('jobs.ch', d.title, d.company_name, d.place || 'Schweiz', d._links?.detail_de?.href || '',
          { remote: /remote|home\s*office/i.test(d.title || ''), published: d.publication_date, snippet: d.preview }));
      }
      if (page >= Number(data.num_pages || 1)) break;
    }
    return out;
  });
}

function arbeitsagenturTasks(c) {
  if (c.regions?.de === false) return [];
  return c.terms.map((term) => async () => {
    const url = 'https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v6/jobs'
      + `?was=${encodeURIComponent(term)}&size=50&page=1&angebotsart=1&pav=false&veroeffentlichtseit=21`;
    const data = await httpJson(url, { headers: { 'X-API-Key': 'jobboerse-jobsuche', 'User-Agent': BA_UA } });
    return (data.ergebnisliste || []).map((s) => {
      const lok = (s.stellenlokationen || [{}])[0].adresse || {};
      const ref = s.referenznummer || '';
      return job('arbeitsagentur', s.stellenangebotsTitel || s.hauptberuf, s.firma,
        [lok.ort, lok.land].filter(Boolean).join(', '),
        s.externeURL || (ref ? `https://www.arbeitsagentur.de/jobsuche/jobdetail/${encodeURIComponent(ref)}` : ''),
        { remote: !!s.homeofficemoeglich, published: s.datumErsteVeroeffentlichung });
    });
  });
}

function remoteTasks(c) {
  const tasks = c.termsEn.map((term) => async () => {
    const data = await httpJson(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(term)}&limit=30`);
    return (data.jobs || []).map((j) => job('remotive', j.title, j.company_name, j.candidate_required_location || 'Remote',
      j.url, { remote: true, published: j.publication_date, snippet: j.description }));
  });
  tasks.push(async () => {
    const data = await httpJson('https://himalayas.app/jobs/api?limit=100');
    return (data.jobs || []).map((j) => job('himalayas', j.title, j.companyName,
      (j.locationRestrictions || []).join(', ') || 'Worldwide', j.applicationLink || j.guid,
      { remote: true, published: j.pubDate, snippet: j.excerpt }));
  });
  for (const geo of ['switzerland', 'germany', 'austria', 'europe']) {
    tasks.push(async () => {
      const data = await httpJson(`https://jobicy.com/api/v2/remote-jobs?count=50&geo=${geo}`);
      return (data.jobs || []).map((j) => job('jobicy', j.jobTitle, j.companyName, `Remote (${j.jobGeo || geo})`, j.url,
        { remote: true, published: j.pubDate, snippet: `${j.jobIndustry || ''} ${j.jobExcerpt || ''}` }));
    });
  }
  tasks.push(async () => {
    const out = [];
    for (let page = 1; page <= 3; page++) {
      const data = await httpJson(`https://www.arbeitnow.com/api/job-board-api?page=${page}`);
      for (const j of data.data || []) {
        out.push(job('arbeitnow', j.title, j.company_name, j.location, j.url,
          { remote: j.remote, snippet: `${(j.tags || []).join(' ')} ${j.description || ''}` }));
      }
      if (!data.links?.next) break;
    }
    return out;
  });
  return tasks;
}

const ATS = {
  async greenhouse(s) {
    const data = await httpJson(`https://boards-api.greenhouse.io/v1/boards/${s.token}/jobs`);
    return (data.jobs || []).map((j) => job('ats', j.title, s.company, j.location?.name, j.absolute_url,
      { remote: /remote/i.test(j.location?.name || ''), published: j.first_published || j.updated_at, watch: true }));
  },
  async ashby(s) {
    const data = await httpJson(`https://api.ashbyhq.com/posting-api/job-board/${s.token}`);
    return (data.jobs || []).filter((j) => j.isListed !== false).map((j) => job('ats', j.title, s.company, j.location, j.jobUrl,
      { remote: !!j.isRemote, published: j.publishedAt, snippet: `${j.department || ''} ${(j.descriptionPlain || '').slice(0, 300)}`, watch: true }));
  },
  async lever(s) {
    const data = await httpJson(`https://api.lever.co/v0/postings/${s.token}?mode=json`);
    return (Array.isArray(data) ? data : []).map((j) => job('ats', j.text, s.company, j.categories?.location, j.hostedUrl,
      { remote: /remote/i.test(j.categories?.location || '') || j.workplaceType === 'remote', snippet: j.descriptionPlain, watch: true }));
  },
  async workable(s) {
    const data = await postJson(`https://apply.workable.com/api/v3/accounts/${s.token}/jobs`, {});
    return (data.results || []).map((j) => job('ats', j.title, s.company, [j.location?.city, j.location?.country].filter(Boolean).join(', '),
      `https://apply.workable.com/${s.token}/j/${j.shortcode}/`, { remote: !!j.remote, published: j.published, watch: true }));
  },
  async personio(s) {
    const xml = await httpText(`https://${s.token}.jobs.personio.de/xml`);
    const out = [];
    for (const pos of xml.match(/<position>[\s\S]*?<\/position>/g) || []) {
      const tag = (n) => decode((pos.match(new RegExp(`<${n}>([\\s\\S]*?)</${n}>`)) || [])[1] || '').trim();
      const id = tag('id');
      const name = tag('name');
      if (!id || !name || /initiativ/i.test(name)) continue;
      out.push(job('ats', name, s.company, tag('office'), `https://${s.token}.jobs.personio.de/job/${id}`,
        { remote: /remote/i.test(tag('office') + tag('schedule')), published: tag('createdAt'), watch: true }));
    }
    return out;
  },
  async workday(s) {
    const base = `https://${s.tenant}.${s.wd || 'wd3'}.myworkdayjobs.com`;
    const data = await postJson(`${base}/wday/cxs/${s.tenant}/${s.site}/jobs`, { limit: 20, offset: 0, searchText: s.search || '' });
    return (data.jobPostings || []).map((j) => job('ats', j.title, s.company, j.locationsText,
      j.externalPath ? `${base}/${s.site}${j.externalPath}` : base, { remote: /remote/i.test(j.locationsText || ''), watch: true }));
  },
  async smartrecruiters(s) {
    const data = await httpJson(`https://api.smartrecruiters.com/v1/companies/${s.token}/postings?limit=100`);
    return (data.content || []).map((j) => job('ats', j.name, s.company, [j.location?.city, j.location?.country].filter(Boolean).join(', '),
      `https://jobs.smartrecruiters.com/${s.token}/${j.id}`, { remote: !!j.location?.remote, published: j.releasedDate, watch: true }));
  }
};

function atsTasks(c) {
  return (c.atsSources || []).filter((s) => ATS[s.type]).map((s) => () => ATS[s.type](s));
}

// ─────────────────────────────────────────────────────────────── Scoring

function scoreJob(j, c) {
  const title = j.title.toLowerCase();
  const text = `${title} ${j.snippet.toLowerCase()}`;
  const allowed = ALLOW_TITLE.some((a) => title.includes(a));
  const rejects = [...REJECT_TITLE, ...(c.excludeTitle || []).map((x) => String(x).toLowerCase())];
  if (!allowed && rejects.some((r) => r && title.includes(r))) return null;
  if (REMOTE_AGG.has(j.source) && REGION_MISMATCH_RX.test(`${j.title} ${j.location}`)) return null;

  const focusRx = buildFocusRx(c.focusKeywords);
  const keywords = [...new Set([...(c.keywords || []), ...(c.focusKeywords || [])].map((k) => String(k).toLowerCase()))];
  let score = 0;
  let titleHits = 0;
  let textHits = 0;
  for (const kw of keywords) {
    if (!kw) continue;
    if (title.includes(kw)) { score += 3; titleHits++; } else if (text.includes(kw)) { score += 1; textHits++; }
  }
  if (!titleHits && textHits < 2 && !allowed) return null;

  const focus = focusRx.test(j.title);
  if (focus) score += 6;
  else if (focusRx.test(j.snippet)) score += 1;
  if (HR_TITLE_RX.test(j.title)) score += 2;
  if (j.remote) score += 2;
  if (j.wfa) score += 3;
  if (j.watchCompany) score += 2;
  if (DACH_RX.test(text + j.location)) score += 2;
  if (CH_LOCATION_RX.test(j.location)) score += 3;
  return { score, focus, track: allowed ? 'entwicklung' : 'kern' };
}

function buildFocusRx(list) {
  const extra = (list || []).filter(Boolean).map((k) => String(k).toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return extra.length ? new RegExp(`${FOCUS_TITLE_RX.source}|${extra.join('|')}`, 'i') : FOCUS_TITLE_RX;
}

function tooOld(j, maxAgeDays) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(j.published)) return false;
  return (Date.now() - Date.parse(j.published)) / 86400000 > maxAgeDays;
}

// ─────────────────────────────────────────────────────────────── Speicher

async function getItem(userId, sk) {
  const r = await ddb.send(new GetCommand({ TableName: TABLE, Key: { userId, sk } }));
  return r.Item || null;
}

async function putItem(userId, sk, data) {
  await ddb.send(new PutCommand({ TableName: TABLE, Item: { userId, sk, ...data, updatedAt: new Date().toISOString() } }));
}

async function loadSeen(userId) {
  const seen = new Map();
  let ExclusiveStartKey;
  do {
    const r = await ddb.send(new QueryCommand({
      TableName: TABLE, ExclusiveStartKey,
      KeyConditionExpression: 'userId = :u AND begins_with(sk, :p)',
      ExpressionAttributeValues: { ':u': userId, ':p': 'seen#' },
      ProjectionExpression: 'sk, #s', ExpressionAttributeNames: { '#s': 'status' }
    }));
    for (const it of r.Items || []) seen.set(it.sk.slice(5), it.status);
    ExclusiveStartKey = r.LastEvaluatedKey;
  } while (ExclusiveStartKey);
  return seen;
}

const seenKey = (url) => crypto.createHash('sha1').update(normUrl(url)).digest('hex');
const postingKey = (company, title) => `t${crypto.createHash('sha1')
  .update(`${company}|${title}`.toLowerCase().replace(/\s+/g, ' ')).digest('hex')}`;

function mergeCriteria(saved) {
  const c = { ...DEFAULT_CRITERIA, ...(saved || {}) };
  c.regions = { ...DEFAULT_CRITERIA.regions, ...(saved?.regions || {}) };
  c.sources = { ...DEFAULT_CRITERIA.sources, ...(saved?.sources || {}) };
  for (const k of ['terms', 'termsEn', 'focusKeywords', 'keywords', 'excludeTitle', 'atsSources']) {
    if (!Array.isArray(c[k])) c[k] = DEFAULT_CRITERIA[k];
  }
  return c;
}

// ─────────────────────────────────────────────────────────────── Aktionen

async function actionState(user) {
  const [crit, results, seen] = await Promise.all([
    getItem(user.userId, 'criteria'), getItem(user.userId, 'results'), loadSeen(user.userId)
  ]);
  return {
    criteria: mergeCriteria(crit?.criteria),
    results: results?.jobs || [],
    lastRun: results?.lastRun || null,
    stats: results?.stats || null,
    seenCount: [...seen.keys()].filter((k) => !k.startsWith('t')).length
  };
}

async function actionSearch(user, body) {
  const started = Date.now();
  const deadline = started + SEARCH_BUDGET_MS;
  const saved = await getItem(user.userId, 'criteria');
  const c = mergeCriteria(body.criteria || saved?.criteria);
  if (body.criteria) await putItem(user.userId, 'criteria', { criteria: c });

  const groups = [];
  if (c.sources.linkedin) groups.push(['LinkedIn', linkedinTasks(c), 2]);
  if (c.sources.jobsch && (c.regions.ch || c.regions.chRemote)) groups.push(['jobs.ch', jobschTasks(c), 4]);
  if (c.sources.arbeitsagentur) groups.push(['Arbeitsagentur', arbeitsagenturTasks(c), 3]);
  if (c.sources.remote) groups.push(['Remote-Börsen', remoteTasks(c), 4]);
  if (c.sources.ats) groups.push(['Firmen-Feeds', atsTasks(c), 4]);

  const perSource = {};
  const all = (await Promise.all(groups.map(async ([name, tasks, conc]) => {
    const jobs = await runPool(tasks, conc, deadline);
    perSource[name] = jobs.length;
    return jobs;
  }))).flat();

  const seen = await loadSeen(user.userId);
  const keys = new Set();
  const byPosting = new Map();
  const scored = [];
  let unique = 0;
  let staleCount = 0;
  let seenCount = 0;
  for (const j of all) {
    if (!j.title || !j.url) continue;
    const k1 = normUrl(j.url);
    const k2 = `${j.company}|${j.title}`.toLowerCase().replace(/\s+/g, ' ');
    if (keys.has(k1)) continue;
    keys.add(k1);
    const twin = byPosting.get(k2);
    if (twin) {
      if (j.location && !twin.location.includes(j.location)) twin.location = `${twin.location} · ${j.location}`.slice(0, 160);
      twin.remote = twin.remote || j.remote;
      continue;
    }
    unique++;
    if (seen.has(seenKey(j.url)) || seen.has(postingKey(j.company, j.title))) { seenCount++; continue; }
    if (tooOld(j, c.maxAgeDays || 30)) { staleCount++; continue; }
    const s = scoreJob(j, c);
    if (!s || s.score < 5) continue;
    const entry = { ...j, baseScore: s.score, focus: s.focus, track: s.track, status: 'offen' };
    byPosting.set(k2, entry);
    scored.push(entry);
  }
  scored.sort((a, b) => (b.focus - a.focus) || (b.baseScore - a.baseScore));
  const jobs = scored.slice(0, MAX_RESULTS);

  const stats = {
    loaded: all.length, unique, alreadySeen: seenCount, tooOld: staleCount,
    relevant: scored.length, shown: jobs.length, perSource, durationMs: Date.now() - started
  };
  const lastRun = new Date().toISOString();
  await putItem(user.userId, 'results', { jobs, lastRun, stats });
  return { results: jobs, lastRun, stats, criteria: c };
}

async function actionSaveResults(user, body) {
  if (!Array.isArray(body.results)) return respond(400, { error: 'results fehlt' });
  const current = await getItem(user.userId, 'results');
  const jobs = body.results.slice(0, MAX_RESULTS).map((j) => ({
    ...j, why: String(j.why || '').slice(0, 600), snippet: String(j.snippet || '').slice(0, 400)
  }));
  await putItem(user.userId, 'results', { jobs, lastRun: current?.lastRun || null, stats: current?.stats || null });
  return respond(200, { ok: true });
}

async function actionMark(user, body) {
  const items = (body.items || []).filter((i) => i && i.url).slice(0, 100);
  const now = new Date().toISOString();
  const bySk = new Map();
  items.forEach((it) => {
    const sks = [`seen#${seenKey(it.url)}`];
    if (it.company && it.title) sks.push(`seen#${postingKey(it.company, it.title)}`);
    sks.forEach((sk) => bySk.set(sk, it.status === 'open'
      ? { DeleteRequest: { Key: { userId: user.userId, sk } } }
      : {
        PutRequest: {
          Item: {
            userId: user.userId, sk, status: it.status === 'applied' ? 'applied' : 'dismissed',
            url: it.url, title: String(it.title || '').slice(0, 200), company: String(it.company || '').slice(0, 120), at: now
          }
        }
      }));
  });
  const requests = [...bySk.values()];
  for (let i = 0; i < requests.length; i += 25) {
    await ddb.send(new BatchWriteCommand({ RequestItems: { [TABLE]: requests.slice(i, i + 25) } }));
  }
  const results = await getItem(user.userId, 'results');
  if (results?.jobs) {
    const byUrl = new Map(items.map((i) => [normUrl(i.url), i.status]));
    const jobs = results.jobs.map((j) => (byUrl.has(normUrl(j.url))
      ? { ...j, status: { applied: 'beworben', dismissed: 'ausgeblendet', open: 'offen' }[byUrl.get(normUrl(j.url))] || j.status }
      : j));
    await putItem(user.userId, 'results', { ...results, jobs });
  }
  return respond(200, { ok: true, marked: items.length });
}

async function actionPosting(body) {
  const url = String(body.url || '');
  if (!/^https?:\/\//.test(url)) return respond(400, { error: 'URL fehlt' });
  let fetchUrl = url;
  const li = url.match(/linkedin\.com\/jobs\/view\/(?:[^/]*-)?(\d+)/);
  if (li) fetchUrl = `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${li[1]}`;
  try {
    const html = await httpText(fetchUrl, { headers: { Accept: 'text/html,application/xhtml+xml' } });
    let text = '';
    for (const m of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
      try {
        const data = JSON.parse(m[1]);
        const posting = [data, ...(data['@graph'] || [])].find((d) => d && d['@type'] === 'JobPosting');
        if (posting?.description) { text = stripTags(posting.description); break; }
      } catch { /* kein gültiges JSON-LD */ }
    }
    if (!text) {
      const desc = html.match(/class="[^"]*(?:show-more-less-html__markup|description__text|job-description|jobad|job-ad)[^"]*"[^>]*>([\s\S]*?)<\/(?:div|section)>/i);
      text = stripTags(desc ? desc[1] : html.replace(/<(script|style|nav|header|footer)[\s\S]*?<\/\1>/gi, ' '));
    }
    return respond(200, { ok: true, text: text.slice(0, 7000) });
  } catch (e) {
    return respond(200, { ok: false, text: '', error: e.message });
  }
}

// ─────────────────────────────────────────────────────────────── Handler

exports.handler = async (event) => {
  const method = event.requestContext?.http?.method || event.httpMethod;
  if (method === 'OPTIONS') return { statusCode: 204, headers: CORS_HEADERS, body: '' };

  const user = await getUser(event);
  if (user.error === 403) return respond(403, { error: 'Die Stellensuche ist nur im Admin Panel verfügbar' });
  if (user.error) return respond(401, { error: 'Bitte anmelden' });

  let body = {};
  try {
    body = JSON.parse(event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString() : (event.body || '{}'));
  } catch {
    return respond(400, { error: 'Ungültiges JSON' });
  }

  try {
    switch (body.action) {
      case 'state': return respond(200, await actionState(user));
      case 'search': return respond(200, await actionSearch(user, body));
      case 'saveResults': return await actionSaveResults(user, body);
      case 'saveCriteria': {
        const c = mergeCriteria(body.criteria);
        await putItem(user.userId, 'criteria', { criteria: c });
        return respond(200, { ok: true, criteria: c });
      }
      case 'mark': return await actionMark(user, body);
      case 'posting': return await actionPosting(body);
      default: return respond(400, { error: `Unbekannte Aktion: ${body.action}` });
    }
  } catch (e) {
    console.error('job-search error:', e);
    return respond(500, { error: e.message });
  }
};

exports._test = { scoreJob, mergeCriteria, linkedinTasks, jobschTasks, remoteTasks, atsTasks, arbeitsagenturTasks, runPool };
