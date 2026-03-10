const BASE = '/api';

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const opts: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body && (method === 'POST' || method === 'PUT')) {
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || `Request failed: ${res.status}`);
  }

  return data as T;
}

// ── Config ───────────────────────────────────────────────────────────

export async function getConfig() {
  return request<{ tempusBaseUrl: string; hasTempusKey: boolean; hasAnthropicKey: boolean }>('GET', '/config');
}

export async function saveConfig(config: {
  tempusBaseUrl?: string;
  tempusApiKey?: string;
  anthropicApiKey?: string;
}) {
  return request<{ ok: boolean; tempusBaseUrl: string; hasTempusKey: boolean; hasAnthropicKey: boolean }>(
    'POST', '/config', config
  );
}

export async function testTempus() {
  return request<{ ok: boolean; message: string }>('GET', '/config/test-tempus');
}

export async function testAnthropic() {
  return request<{ ok: boolean; message: string }>('GET', '/config/test-anthropic');
}

// ── Upload ───────────────────────────────────────────────────────────

export async function uploadExcel(file: File, consentSessionId = 'pre-session') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('consentSessionId', consentSessionId);

  const res = await fetch(`${BASE}/upload`, { method: 'POST', body: formData });
  const data = await res.json();

  if (!res.ok) throw new Error(data?.error || 'Upload fehlgeschlagen');
  return data as { sessionId: string; analysis: unknown; tempusSyncSummary?: Record<string, number> };
}

// ── Tempus Sync ──────────────────────────────────────────────────────

export async function syncTempus(sessionId: string) {
  return request<{ ok: boolean; summary: unknown; tempusData: unknown }>('POST', `/sessions/${sessionId}/sync-tempus`);
}

// ── Mappings ─────────────────────────────────────────────────────────

export async function generateMappings(sessionId: string) {
  return request<unknown>('POST', `/sessions/${sessionId}/generate-mappings`);
}

export async function updateMapping(sessionId: string, mappingId: string, update: { status?: string; matchedId?: number }) {
  return request<{ ok: boolean }>('PUT', `/sessions/${sessionId}/mappings/${mappingId}`, update);
}

export async function bulkMappingAction(
  sessionId: string,
  action: 'confirm_all' | 'confirm_suggested' | 'reject_all',
  filter?: { sheet?: string; entity?: string; minConfidence?: number },
) {
  return request<{ ok: boolean; updatedCount: number }>(
    'POST', `/sessions/${sessionId}/mappings/bulk-action`, { action, filter }
  );
}

// ── Validation ───────────────────────────────────────────────────────

export async function getValidation(sessionId: string) {
  return request<unknown>('GET', `/sessions/${sessionId}/validation`);
}

// ── Export ────────────────────────────────────────────────────────────

export async function generateExport(sessionId: string) {
  return request<{ ok: boolean; message: string }>('POST', `/sessions/${sessionId}/export`);
}

export function getDownloadUrl(sessionId: string) {
  return `${BASE}/sessions/${sessionId}/download`;
}

export function getReportDownloadUrl(sessionId: string) {
  return `${BASE}/sessions/${sessionId}/download-report`;
}
