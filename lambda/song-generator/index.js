/**
 * AWS Lambda: Personality Song Generator
 *
 * 5 Actions in einer Lambda (action-basiertes Routing):
 *   - "test_questions"   → 24 wissenschaftliche Test-Items
 *   - "interpret_input"  → externe Tests/Chats/Social → PERSONA_SIGNAL
 *   - "synthesize"       → Test + externe Signale → PERSONA_PROFILE
 *   - "compose"          → PERSONA_PROFILE → SONG_OBJECT
 *   - "reroll"           → einzelne Zeilen / Sektionen neu generieren
 *
 * Request:
 *   POST { action, payload, apiKey?, model? }
 *   apiKey ist optional; falls fehlend → process.env.OPENAI_API_KEY (Fallback).
 *
 * Response:
 *   { success: boolean, action, data?, error?, raw?, status? }
 */

'use strict';

const {
  SYSTEM_CORE,
  PROMPT_TEST_QUESTIONS,
  buildInputInterpreterUserPrompt,
  buildPersonaSynthesisUserPrompt,
  buildSongComposerUserPrompt
} = require('./prompts');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8'
};

// Fallback-Modelle (Lambda probiert in Reihenfolge bei 4xx Modellfehler)
const MODEL_FALLBACKS = ['gpt-5.2', 'gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'];

// ────────────────────────────────────────────────────────────
// Hilfsfunktionen
// ────────────────────────────────────────────────────────────

function ok(action, data, extra) {
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify(Object.assign({ success: true, action, data }, extra || {}))
  };
}

function fail(statusCode, error, extra) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(Object.assign({ success: false, error }, extra || {}))
  };
}

function isValidApiKey(k) {
  return typeof k === 'string' && k.startsWith('sk-') && k.length > 20;
}

/**
 * Robustes JSON-Parsing: GPT liefert manchmal ```json …``` Codefences trotz
 * response_format. Wir extrahieren den ersten { … } Block sauber.
 */
function safeJsonParse(text) {
  if (!text || typeof text !== 'string') return null;
  let candidate = text.trim();

  // Codefences entfernen
  candidate = candidate.replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();

  try {
    return JSON.parse(candidate);
  } catch (_e) {
    // Erstes balanciertes JSON-Objekt extrahieren
    const start = candidate.indexOf('{');
    if (start === -1) return null;
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = start; i < candidate.length; i += 1) {
      const ch = candidate[i];
      if (inString) {
        if (escape) { escape = false; continue; }
        if (ch === '\\') { escape = true; continue; }
        if (ch === '"') inString = false;
        continue;
      }
      if (ch === '"') { inString = true; continue; }
      if (ch === '{') depth += 1;
      else if (ch === '}') {
        depth -= 1;
        if (depth === 0) {
          const slice = candidate.slice(start, i + 1);
          try { return JSON.parse(slice); } catch (_err) { return null; }
        }
      }
    }
    return null;
  }
}

/**
 * Ruft OpenAI Chat Completions mit Model-Fallback und sinnvollem Retry.
 * Ergebnis ist immer geparstes JSON oder wirft.
 */
async function callOpenAI({ apiKey, system, user, temperature, top_p, model, maxTokens }) {
  const errors = [];
  const candidates = [];

  if (model) candidates.push(model);
  for (const m of MODEL_FALLBACKS) {
    if (!candidates.includes(m)) candidates.push(m);
  }

  for (const m of candidates) {
    const body = {
      model: m,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      temperature: typeof temperature === 'number' ? temperature : 0.7,
      top_p: typeof top_p === 'number' ? top_p : 0.95,
      max_tokens: typeof maxTokens === 'number' ? maxTokens : 4000,
      response_format: { type: 'json_object' }
    };

    let res;
    try {
      res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
      });
    } catch (err) {
      errors.push({ model: m, status: 0, message: err.message });
      continue;
    }

    if (res.ok) {
      let data;
      try { data = await res.json(); } catch (_e) {
        errors.push({ model: m, status: 200, message: 'response not json' });
        continue;
      }
      const text = data && data.choices && data.choices[0]
        && data.choices[0].message && data.choices[0].message.content;
      const parsed = safeJsonParse(text);
      if (parsed) return { json: parsed, model: m, raw: text };
      errors.push({ model: m, status: 200, message: 'parse failed', raw: (text || '').slice(0, 400) });
      continue;
    }

    let errText = '';
    try { errText = await res.text(); } catch (_e) {}
    errors.push({ model: m, status: res.status, message: errText.slice(0, 400) });

    // Bei 401/403/429 → kein Sinn weitere Modelle zu probieren
    if (res.status === 401 || res.status === 403) break;
  }

  const err = new Error('openai_call_failed');
  err.details = errors;
  throw err;
}

// ────────────────────────────────────────────────────────────
// Action-Handler
// ────────────────────────────────────────────────────────────

async function handleTestQuestions({ apiKey, model }) {
  const result = await callOpenAI({
    apiKey,
    system: SYSTEM_CORE,
    user: PROMPT_TEST_QUESTIONS,
    temperature: 0.6,
    top_p: 0.9,
    model,
    maxTokens: 6000
  });
  return ok('test_questions', result.json, { model: result.model });
}

async function handleInterpretInput({ apiKey, payload, model }) {
  const { source_type, raw, lang } = payload || {};
  if (!source_type || !raw) {
    return fail(400, 'payload.source_type und payload.raw sind erforderlich');
  }
  const result = await callOpenAI({
    apiKey,
    system: SYSTEM_CORE,
    user: buildInputInterpreterUserPrompt({ source_type, raw, lang }),
    temperature: 0.3,
    top_p: 0.9,
    model,
    maxTokens: 3000
  });
  return ok('interpret_input', result.json, { model: result.model });
}

async function handleSynthesize({ apiKey, payload, model }) {
  const { test_results, external_signals, user_meta } = payload || {};
  const result = await callOpenAI({
    apiKey,
    system: SYSTEM_CORE,
    user: buildPersonaSynthesisUserPrompt({ test_results, external_signals, user_meta }),
    temperature: 0.4,
    top_p: 0.9,
    model,
    maxTokens: 3000
  });
  return ok('synthesize', result.json, { model: result.model });
}

async function handleCompose({ apiKey, payload, model }) {
  const { persona, creativity } = payload || {};
  if (!persona) return fail(400, 'payload.persona ist erforderlich');
  const result = await callOpenAI({
    apiKey,
    system: SYSTEM_CORE,
    user: buildSongComposerUserPrompt({
      persona,
      mode: 'full',
      edit_targets: [],
      previous_song: null,
      creativity
    }),
    temperature: 0.85,
    top_p: 0.95,
    model,
    maxTokens: 4500
  });
  return ok('compose', result.json, { model: result.model });
}

async function handleReroll({ apiKey, payload, model }) {
  const { persona, previous_song, edit_targets, mode, creativity } = payload || {};
  if (!persona) return fail(400, 'payload.persona ist erforderlich');
  if (!previous_song) return fail(400, 'payload.previous_song ist erforderlich');
  if (!Array.isArray(edit_targets) || edit_targets.length === 0) {
    return fail(400, 'payload.edit_targets[] ist erforderlich');
  }
  const result = await callOpenAI({
    apiKey,
    system: SYSTEM_CORE,
    user: buildSongComposerUserPrompt({
      persona,
      mode: mode || 'regenerate_lines',
      edit_targets,
      previous_song,
      creativity: typeof creativity === 'number' ? creativity : 0.95
    }),
    temperature: 0.95,
    top_p: 0.98,
    model: model || 'gpt-4o-mini',
    maxTokens: 2500
  });
  return ok('reroll', result.json, { model: result.model });
}

// ────────────────────────────────────────────────────────────
// Lambda Handler
// ────────────────────────────────────────────────────────────

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return fail(405, 'Method not allowed');
  }

  let body;
  try {
    body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {});
  } catch (_e) {
    return fail(400, 'Body ist kein gültiges JSON');
  }

  const { action, payload, model } = body;
  const apiKey = body.apiKey || process.env.OPENAI_API_KEY;

  if (!action) return fail(400, 'action ist erforderlich');
  if (!isValidApiKey(apiKey)) return fail(401, 'Gültiger OpenAI API Key fehlt (sk-...)');

  try {
    switch (action) {
      case 'test_questions':  return await handleTestQuestions({ apiKey, model });
      case 'interpret_input': return await handleInterpretInput({ apiKey, payload, model });
      case 'synthesize':      return await handleSynthesize({ apiKey, payload, model });
      case 'compose':         return await handleCompose({ apiKey, payload, model });
      case 'reroll':          return await handleReroll({ apiKey, payload, model });
      case 'health':          return ok('health', { ok: true, ts: new Date().toISOString() });
      default:
        return fail(400, `Unbekannte action: ${action}`);
    }
  } catch (err) {
    console.error('SongGenerator Error:', err && (err.message || err), err && err.details);
    return fail(502, err && err.message || 'Unbekannter Fehler', {
      details: (err && err.details) ? err.details.slice(0, 4) : undefined
    });
  }
};
