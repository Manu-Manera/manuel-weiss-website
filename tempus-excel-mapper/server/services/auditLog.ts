/**
 * Audit-Log – Protokolliert Verarbeitungsvorgänge OHNE personenbezogene Daten.
 *
 * DSGVO Art. 30: Verzeichnis der Verarbeitungstätigkeiten
 *
 * Grundsätze:
 * - Nur Metadaten loggen (Zeitpunkt, Aktion, Ergebnis)
 * - Niemals Dateiinhalte, Namen, E-Mails, API-Keys loggen
 * - Logs in-memory mit TTL (kein Disk-Schreiben)
 * - Export-Möglichkeit für Verantwortliche
 */

export interface AuditEntry {
  timestamp: string;
  action: string;
  sessionId?: string;
  details: Record<string, string | number | boolean>;
  result: 'success' | 'error';
  errorMessage?: string;
}

const MAX_ENTRIES = 1000;
const RETENTION_MS = 24 * 60 * 60 * 1000; // 24h

const entries: AuditEntry[] = [];

export function logAudit(
  action: string,
  sessionId: string | undefined,
  details: Record<string, string | number | boolean>,
  result: 'success' | 'error' = 'success',
  errorMessage?: string,
): void {
  const entry: AuditEntry = {
    timestamp: new Date().toISOString(),
    action,
    sessionId: sessionId ? maskSessionId(sessionId) : undefined,
    details: sanitizeDetails(details),
    result,
    errorMessage: errorMessage ? truncate(errorMessage, 100) : undefined,
  };

  entries.push(entry);

  if (entries.length > MAX_ENTRIES) {
    entries.splice(0, entries.length - MAX_ENTRIES);
  }
}

export function getAuditLog(): AuditEntry[] {
  cleanup();
  return [...entries];
}

export function clearAuditLog(): void {
  entries.length = 0;
}

function cleanup(): void {
  const cutoff = Date.now() - RETENTION_MS;
  while (entries.length > 0 && new Date(entries[0].timestamp).getTime() < cutoff) {
    entries.shift();
  }
}

function maskSessionId(id: string): string {
  if (id.length <= 8) return '***';
  return `${id.slice(0, 4)}...${id.slice(-4)}`;
}

function sanitizeDetails(details: Record<string, string | number | boolean>): Record<string, string | number | boolean> {
  const safe: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(details)) {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('key') || lowerKey.includes('token') || lowerKey.includes('password') || lowerKey.includes('secret')) {
      safe[key] = '***REDACTED***';
      continue;
    }
    if (typeof value === 'string' && value.length > 200) {
      safe[key] = truncate(value, 200);
      continue;
    }
    safe[key] = value;
  }
  return safe;
}

function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.slice(0, maxLen) + '...' : str;
}
