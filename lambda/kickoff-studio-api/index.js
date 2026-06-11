/**
 * Kick-off Studio API — session CRUD + Gamma export (API key server-side only).
 *
 * GET  /v1/kickoff-studio?sessionId=…
 * POST /v1/kickoff-studio  { action: 'save' | 'gamma-export', … }
 */

const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({ region: process.env.AWS_REGION || 'eu-central-1' });
const BUCKET = process.env.S3_BUCKET || 'manuel-weiss-website';
const EDIT_PW = process.env.EDIT_PASSWORD || 'tempus-demo-edit-2024';
const GAMMA_API = 'https://public-api.gamma.app/v1.0';
const POLL_MS = 5000;
const POLL_TIMEOUT_MS = 600000;

const ALLOWED_ORIGINS = [
  'https://manuel-weiss.ch',
  'https://www.manuel-weiss.ch',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
];

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  try {
    const host = new URL(origin).hostname.toLowerCase();
    if (host.endsWith('.manuel-weiss.ch') || host === 'manuel-weiss.ch') return true;
    if (
      host.endsWith('-kickoff-studio.ch') ||
      host.endsWith('.impl.manuel-weiss.ch') ||
      host.endsWith('.k.manuel-weiss.ch')
    ) {
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

function sessionKey(sessionId) {
  const safe = String(sessionId || 'default').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
  return `data/kickoff-studio/${safe}.json`;
}

function prepKey(prepId) {
  const safe = String(prepId || '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
  return `data/kickoff-prep/${safe}.json`;
}

function mapPrepAnswersToSession(prepAnswers) {
  const answers = {};
  const a = prepAnswers || {};
  if (a['purpose.goals'] || a['purpose.main']) {
    answers['success-metrics'] = {
      questionAnswers: ['', a['purpose.goals'] || '', a['purpose.challenges'] || '', ''],
    };
  }
  if (a['team.inner'] || a['team.champions'] || a['team.owner']) {
    const lines = [a['team.inner'], a['team.champions'], a['team.owner']].filter(Boolean);
    answers.team = {
      rows: lines.map((line) => {
        const parts = String(line).split('·').map((p) => p.trim());
        return [parts[0] || line, parts[1] || '', parts[2] || '', parts[3] || ''];
      }),
    };
  }
  if (a['data.migration.historical'] || a['data.migration.scope']) {
    answers['data-migration'] = {
      questionAnswers: [
        '',
        '',
        '',
        [a['data.migration.historical'], a['data.migration.scope']].filter(Boolean).join(' — '),
      ],
    };
  }
  if (a['state.current'] || a['state.future']) {
    answers['ways-of-working'] = {
      questionAnswers: [a['state.current'] || '', '', '', a['state.future'] || ''],
    };
  }
  return answers;
}

function publicPrepView(prep) {
  const accessPassword = prep.accessPassword || '';
  return {
    prepId: prep.prepId,
    customer: prep.customer,
    locale: prep.locale,
    tenantSlug: prep.tenantSlug,
    linkLabel: prep.linkLabel,
    logoUrl: prep.logoUrl || '',
    salutation: prep.salutation || 'sie',
    audience: prep.audience || 'team',
    includeIntegrations: !!prep.includeIntegrations,
    linkedSessionId: prep.linkedSessionId || '',
    answers: prep.answers || {},
    access: {
      status: prep.access?.status || 'draft',
      releasedAt: prep.access?.releasedAt || null,
      submittedAt: prep.access?.submittedAt || null,
      requiresPassword: !!accessPassword,
    },
    updatedAt: prep.updatedAt,
  };
}

function checkPrepPassword(prep, headerPw) {
  const expected = prep.accessPassword || '';
  if (!expected) return true;
  return String(headerPw || '') === expected;
}

function prepPasswordHeader(event) {
  return event.headers?.['x-kickoff-prep-password'] || event.headers?.['X-Kickoff-Prep-Password'] || '';
}

function portalPasswordHeader(event) {
  return event.headers?.['x-portal-password'] || event.headers?.['X-Portal-Password'] || '';
}

function checkPortalPassword(session, headerPw) {
  const expected = String(session?.portalPassword || '').trim();
  if (!expected) return true;
  return String(headerPw || '') === expected;
}

function sessionPortalReleased(session) {
  if (!session) return false;
  if (session.portalReleased === false) return false;
  return true;
}

function appendAuditLog(existing, entry) {
  const log = Array.isArray(existing) ? [...existing] : [];
  log.push({
    id: `audit-${Date.now()}`,
    at: new Date().toISOString(),
    ...entry,
  });
  return log.slice(-200);
}

function corsHeaders(origin) {
  const allowed = isAllowedOrigin(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers':
      'Content-Type,X-Demo-Password,X-Kickoff-Prep-Password,X-Portal-Password',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  };
}

function response(statusCode, body, origin) {
  return { statusCode, headers: corsHeaders(origin), body: JSON.stringify(body) };
}

async function loadState(key) {
  try {
    const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    return JSON.parse(await res.Body.transformToString());
  } catch (err) {
    if (err.name === 'NoSuchKey') return null;
    throw err;
  }
}

async function saveState(data, key) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: JSON.stringify(data),
      ContentType: 'application/json',
      CacheControl: 'no-cache, no-store, must-revalidate',
    })
  );
}

function slideToGammaCard(slide) {
  const layout = slide.layout || 'content';
  const lines = [`# ${slide.headline}`];
  if (slide.subline) lines.push(slide.subline);
  if (layout === 'capture' && slide.rows?.length) {
    const headers = slide.headers || [];
    if (headers.length) {
      lines.push('| ' + headers.join(' | ') + ' |');
      for (const row of slide.rows) {
        lines.push('| ' + row.map((c) => String(c ?? '')).join(' | ') + ' |');
      }
    }
  } else if (layout === 'workshop_qa') {
    for (const q of slide.questions || []) {
      const a = q.answer ?? '';
      lines.push(`- **${q.q}**${a ? `: ${a}` : ''}`);
    }
  } else if (layout === 'decisions') {
    for (const o of slide.options || []) {
      const mark = slide.selected_decision === o.id ? '✓ ' : '';
      lines.push(`- ${mark}${o.label}`);
    }
  } else if (layout === 'checklist') {
    const st = slide.items_status || [];
    (slide.items || []).forEach((item, i) => {
      lines.push(`- ${item}${st[i] ? ` [${st[i]}]` : ''}`);
    });
  } else {
    for (const b of slide.bullets || []) lines.push(`- ${b}`);
  }
  return lines.join('\n');
}

function deckToGammaInputText(exportDeck, locale) {
  const meta = exportDeck.meta || {};
  const isDe = locale === 'de';
  const parts = [];
  parts.push(
    isDe
      ? 'Erstelle eine professionelle Management-Präsentation aus dem Kick-off-Workshop:\n\n'
      : 'Create a professional management presentation from this kick-off workshop:\n\n'
  );
  parts.push(
    `${isDe ? 'Titel' : 'Title'}: ${meta.gamma_title || meta.title}\n` +
      `${isDe ? 'Untertitel' : 'Subtitle'}: ${(meta.subtitle || '').replace(/\n/g, ' · ')}\n\n` +
      (isDe
        ? 'Stil: Valkeen — Blau #0f4c81 / Türkis #00a878.\n'
        : 'Style: Valkeen — blue #0f4c81 / teal #00a878.\n')
  );
  for (const slide of exportDeck.slides || []) {
    parts.push(slideToGammaCard(slide));
  }
  const closing = exportDeck.closing;
  if (closing) {
    const cl = [`# ${closing.headline}`];
    if (closing.subline) cl.push(closing.subline);
    for (const b of closing.bullets || []) cl.push(`- ${b}`);
    parts.push(cl.join('\n'));
  }
  return parts.join('\n---\n\n');
}

async function gammaRequest(method, path, apiKey, body) {
  const res = await fetch(`${GAMMA_API}${path}`, {
    method,
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`Gamma HTTP ${res.status}: ${text.slice(0, 400)}`);
  }
  return data;
}

function gammaUrlFromStatus(st) {
  return (
    st.gammaUrl ||
    st.exportUrl ||
    st.url ||
    (st.generation && st.generation.gammaUrl) ||
    null
  );
}

/** Ein Poll-Schritt — Client ruft wiederholt gamma-poll auf (API-Gateway-Timeout vermeiden). */
async function pollGammaOnce(generationId, apiKey) {
  const st = await gammaRequest('GET', `/generations/${generationId}`, apiKey);
  const status = (st.status || st.generationStatus || 'pending').toLowerCase();
  if (status === 'completed' || status === 'complete') {
    return { status: 'completed', gammaUrl: gammaUrlFromStatus(st), generationId };
  }
  if (status === 'failed' || status === 'error') {
    return { status: 'failed', error: 'Gamma generation failed', generationId };
  }
  return { status: 'pending', generationId };
}

async function startGammaGeneration(inputTextOrBody, options = {}) {
  const apiKey = process.env.GAMMA_API_KEY || '';
  if (!apiKey) {
    return { error: 'Gamma API not configured (GAMMA_API_KEY)' };
  }
  const body =
    typeof inputTextOrBody === 'string'
      ? {
          inputText: inputTextOrBody,
          textMode: 'generate',
          format: 'presentation',
          ...options,
        }
      : { textMode: 'generate', format: 'presentation', ...inputTextOrBody };
  const themeId = process.env.VALKEEN_GAMMA_THEME_ID || '';
  if (themeId && !body.themeId) body.themeId = themeId;
  const created = await gammaRequest('POST', '/generations', apiKey, body);
  const genId = created.generationId || created.id;
  if (!genId) {
    return { error: 'Gamma: no generation id', detail: created };
  }
  return { generationId: genId, status: 'pending' };
}

async function runGammaExportStart(exportDeck, locale) {
  const inputText = deckToGammaInputText(exportDeck, locale || 'de');
  return startGammaGeneration(inputText);
}

exports.handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || '';
  const method = event.httpMethod;

  if (method === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(origin), body: '' };
  }

  try {
    if (method === 'GET') {
      const prepId = event.queryStringParameters?.prepId;
      if (prepId) {
        const prep = await loadState(prepKey(prepId));
        if (!prep) return response(204, { message: 'No prep' }, origin);
        const isAdmin =
          event.queryStringParameters?.admin === '1' &&
          (event.headers?.['x-demo-password'] || event.headers?.['X-Demo-Password'] || '') ===
            EDIT_PW;
        if (isAdmin) return response(200, prep, origin);
        if ((prep.access?.status || 'draft') === 'draft') {
          return response(403, { error: 'not released' }, origin);
        }
        if (!checkPrepPassword(prep, prepPasswordHeader(event))) {
          return response(401, { error: 'prep password required' }, origin);
        }
        return response(200, publicPrepView(prep), origin);
      }

      const sessionId =
        event.queryStringParameters?.sessionId ||
        event.queryStringParameters?.session;
      if (!sessionId) {
        return response(400, { error: 'sessionId or prepId required' }, origin);
      }
      const state = await loadState(sessionKey(sessionId));
      if (!state) return response(204, { message: 'No session' }, origin);
      const demoPw =
        event.headers?.['x-demo-password'] || event.headers?.['X-Demo-Password'] || '';
      if (String(state.portalPassword || '').trim()) {
        const okPortal = checkPortalPassword(state, portalPasswordHeader(event));
        const okFacilitator = demoPw === EDIT_PW;
        if (!okPortal && !okFacilitator) {
          return response(401, { error: 'portal password required' }, origin);
        }
      }
      return response(200, state, origin);
    }

    if (method === 'POST') {
      const pw = event.headers?.['x-demo-password'] || event.headers?.['X-Demo-Password'] || '';
      const prepPw = prepPasswordHeader(event);

      let body;
      try {
        body = JSON.parse(event.body || '{}');
      } catch {
        return response(400, { error: 'Invalid JSON' }, origin);
      }

      const action = body.action || 'save';

      if (action === 'prep-save' || action === 'prep-submit') {
        const prepId = body.prepId;
        if (!prepId) return response(400, { error: 'prepId required' }, origin);
        const prep = await loadState(prepKey(prepId));
        if (!prep) return response(404, { error: 'prep not found' }, origin);
        if ((prep.access?.status || 'draft') === 'draft') {
          return response(403, { error: 'not released' }, origin);
        }
        if (!checkPrepPassword(prep, prepPw)) {
          return response(403, { error: 'invalid prep password' }, origin);
        }

        if (action === 'prep-save') {
          prep.answers = { ...(prep.answers || {}), ...(body.answers || {}) };
          prep.updatedAt = Date.now();
          await saveState(prep, prepKey(prepId));
          return response(200, { ok: true, updatedAt: prep.updatedAt }, origin);
        }

        prep.answers = { ...(prep.answers || {}), ...(body.answers || {}) };
        prep.access = {
          ...(prep.access || {}),
          status: 'submitted',
          submittedAt: new Date().toISOString(),
        };
        prep.updatedAt = Date.now();
        await saveState(prep, prepKey(prepId));

        const sessionId = prep.linkedSessionId;
        if (sessionId) {
          const session = (await loadState(sessionKey(sessionId))) || { sessionId };
          session.answers = {
            ...(session.answers || {}),
            ...mapPrepAnswersToSession(prep.answers),
          };
          session.prepId = prepId;
          session.prepStatus = 'submitted';
          session.prepSalutation = prep.salutation;
          session.prepAudience = prep.audience;
          session.updatedAt = Date.now();
          await saveState(session, sessionKey(sessionId));
        }

        return response(200, {
          ok: true,
          submittedAt: prep.access.submittedAt,
          linkedSessionId: sessionId || null,
        }, origin);
      }

      if (action === 'prep-admin-upsert') {
        if (pw !== EDIT_PW) return response(403, { error: 'Invalid password' }, origin);
        const prepId = body.prepId;
        if (!prepId) return response(400, { error: 'prepId required' }, origin);
        const existing = (await loadState(prepKey(prepId))) || {};
        const accessPassword =
          body.accessPassword !== undefined
            ? body.accessPassword
            : existing.accessPassword || '';
        const prep = {
          ...existing,
          ...body,
          prepId,
          accessPassword,
          access: { ...(existing.access || {}), ...(body.access || {}) },
          answers: body.answers !== undefined ? body.answers : existing.answers || {},
          updatedAt: Date.now(),
        };
        delete prep.action;
        await saveState(prep, prepKey(prepId));

        if (prep.linkedSessionId) {
          const session = (await loadState(sessionKey(prep.linkedSessionId))) || {
            sessionId: prep.linkedSessionId,
          };
          session.prepId = prepId;
          session.prepSalutation = prep.salutation || 'sie';
          session.prepAudience = prep.audience || 'team';
          session.prepStatus = prep.access?.status || 'draft';
          session.updatedAt = Date.now();
          await saveState(session, sessionKey(prep.linkedSessionId));
        }

        return response(200, { ok: true, prepId, updatedAt: prep.updatedAt }, origin);
      }

      if (action === 'portal-save') {
        const sessionId = body.sessionId;
        if (!sessionId) return response(400, { error: 'sessionId required' }, origin);
        const existing = (await loadState(sessionKey(sessionId))) || {};
        if (!sessionPortalReleased(existing)) {
          return response(403, { error: 'portal not released' }, origin);
        }
        if (!checkPortalPassword(existing, portalPasswordHeader(event))) {
          return response(403, { error: 'invalid portal password' }, origin);
        }
        const { action: _a, exportDeck: _e, actor, ...rest } = body;
        const state = {
          ...existing,
          ...rest,
          sessionId,
          updatedAt: Date.now(),
          auditLog: appendAuditLog(existing.auditLog, {
            actor: actor || 'customer',
            action: 'portal-save',
          }),
        };
        await saveState(state, sessionKey(sessionId));
        return response(200, { ok: true, updatedAt: state.updatedAt }, origin);
      }

      if (pw !== EDIT_PW) {
        return response(403, { error: 'Invalid password' }, origin);
      }

      if (action === 'gamma-poll') {
        const generationId = body.generationId;
        if (!generationId) {
          return response(400, { error: 'generationId required' }, origin);
        }
        const apiKey = process.env.GAMMA_API_KEY || '';
        if (!apiKey) {
          return response(503, { error: 'Gamma API not configured (GAMMA_API_KEY)' }, origin);
        }
        try {
          const result = await pollGammaOnce(generationId, apiKey);
          return response(200, result, origin);
        } catch (err) {
          return response(503, { error: err.message || 'Gamma poll failed' }, origin);
        }
      }

      if (action === 'gamma-export') {
        const session = body.session || body;
        const exportDeck = body.exportDeck || session.exportDeck;
        if (!exportDeck?.slides?.length) {
          return response(400, { error: 'exportDeck required' }, origin);
        }
        try {
          const result = await runGammaExportStart(exportDeck, session.locale);
          if (result.error) return response(503, result, origin);
          return response(200, result, origin);
        } catch (err) {
          return response(503, { error: err.message || 'Gamma start failed' }, origin);
        }
      }

      if (action === 'gamma-slide') {
        const inputText = (body.inputText || '').trim();
        if (!inputText) {
          return response(400, { error: 'inputText required' }, origin);
        }
        try {
          const result = await startGammaGeneration(inputText, {
            numCards: 1,
            cardSplit: 'inputTextBreaks',
            additionalInstructions: (body.additionalInstructions || '').slice(0, 5000),
          });
          if (result.error) return response(503, result, origin);
          return response(200, result, origin);
        } catch (err) {
          return response(503, { error: err.message || 'Gamma start failed' }, origin);
        }
      }

      if (action === 'gamma-valkeen-master') {
        const gammaBody = body.gammaBody;
        if (!gammaBody?.inputText?.trim()) {
          return response(400, { error: 'gammaBody.inputText required' }, origin);
        }
        try {
          const result = await startGammaGeneration(gammaBody);
          if (result.error) return response(503, result, origin);
          return response(200, result, origin);
        } catch (err) {
          return response(503, { error: err.message || 'Gamma Valkeen master failed' }, origin);
        }
      }

      const sessionId = body.sessionId;
      if (!sessionId) {
        return response(400, { error: 'sessionId required' }, origin);
      }

      const existing = (await loadState(sessionKey(sessionId))) || {};
      const { action: _a, exportDeck: _e, actor, ...rest } = body;
      const state = {
        ...existing,
        ...rest,
        sessionId,
        updatedAt: Date.now(),
        auditLog: appendAuditLog(existing.auditLog, {
          actor: actor || 'facilitator',
          action: 'save',
        }),
      };
      await saveState(state, sessionKey(sessionId));
      return response(200, { ok: true, updatedAt: state.updatedAt }, origin);
    }

    return response(405, { error: 'Method not allowed' }, origin);
  } catch (err) {
    console.error('kickoff-studio-api:', err);
    return response(500, { error: err.message || 'Internal error' }, origin);
  }
};
