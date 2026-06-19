import { getOpenAIApiKey } from './awsService';

const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4.1';

export async function resolveOpenAIApiKey() {
  const awsKey = await getOpenAIApiKey();
  if (awsKey?.startsWith('sk-')) return awsKey;
  try {
    const local = localStorage.getItem('openai-api-key');
    if (local?.startsWith('sk-')) return local;
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * @param {{ system: string, user: string, model?: string, temperature?: number, maxTokens?: number }} opts
 */
export async function chatCompletion(opts) {
  const apiKey = await resolveOpenAIApiKey();
  if (!apiKey) {
    throw new Error('Kein OpenAI API-Key — bitte im Admin-Panel oder lokal hinterlegen (wie KI Coach).');
  }

  const res = await fetch(OPENAI_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model || DEFAULT_MODEL,
      messages: [
        { role: 'system', content: opts.system },
        { role: 'user', content: opts.user },
      ],
      temperature: opts.temperature ?? 0.35,
      max_tokens: opts.maxTokens ?? 8000,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error?.message || `OpenAI HTTP ${res.status}`);
  }
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Leere KI-Antwort');
  return text;
}

/**
 * @param {{ system: string, user: string, maxTokens?: number }} opts
 */
export async function chatJson(opts) {
  const apiKey = await resolveOpenAIApiKey();
  if (!apiKey) {
    throw new Error('Kein OpenAI API-Key — bitte im Admin-Panel oder lokal hinterlegen (wie KI Coach).');
  }

  const res = await fetch(OPENAI_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: opts.system },
        { role: 'user', content: opts.user },
      ],
      temperature: 0.3,
      max_tokens: opts.maxTokens ?? 12000,
      response_format: { type: 'json_object' },
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error?.message || `OpenAI HTTP ${res.status}`);
  }
  const raw = data.choices?.[0]?.message?.content || '{}';
  const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error('KI-Antwort ist kein gültiges JSON: ' + (e.message || ''));
  }
}
