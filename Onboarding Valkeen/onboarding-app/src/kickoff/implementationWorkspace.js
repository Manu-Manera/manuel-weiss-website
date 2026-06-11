/**
 * Workspace-Index: alle Kundenprojekte (sessionId + Metadaten) für Switcher.
 * Sessions selbst bleiben in kickoff_studio_session_v1 (kickoffStudioService).
 */
import { suggestLinkLabelFromCustomer } from './kickoffLinkLabel';
import { newSessionId } from './kickoffStudioService';

export const WORKSPACE_INDEX_KEY = 'implementation_workspace_index_v1';

export function readWorkspaceIndex() {
  try {
    const raw = localStorage.getItem(WORKSPACE_INDEX_KEY);
    if (!raw) return { workspaces: [] };
    const parsed = JSON.parse(raw);
    return { workspaces: Array.isArray(parsed.workspaces) ? parsed.workspaces : [] };
  } catch {
    return { workspaces: [] };
  }
}

export function writeWorkspaceIndex(workspaces) {
  try {
    localStorage.setItem(WORKSPACE_INDEX_KEY, JSON.stringify({ workspaces }));
  } catch {
    /* quota */
  }
}

/** Metadaten aus Session → Index (ohne Session-Body). */
export function workspaceFromSession(session) {
  if (!session?.sessionId) return null;
  const customer = String(session.customer || '').trim();
  return {
    sessionId: session.sessionId,
    customer,
    tenantSlug: session.tenantSlug || '',
    linkLabel: session.linkLabel || suggestLinkLabelFromCustomer(customer),
    locale: session.locale || 'de',
    updatedAt: session.updatedAt || Date.now(),
    createdAt: session.createdAt || session.updatedAt || Date.now(),
  };
}

export function upsertWorkspace(meta) {
  if (!meta?.sessionId) return;
  const { workspaces } = readWorkspaceIndex();
  const i = workspaces.findIndex((w) => w.sessionId === meta.sessionId);
  const next = { ...meta, updatedAt: meta.updatedAt || Date.now() };
  if (i >= 0) workspaces[i] = { ...workspaces[i], ...next };
  else workspaces.push({ ...next, createdAt: next.createdAt || Date.now() });
  writeWorkspaceIndex(workspaces);
}

export function removeWorkspace(sessionId) {
  const { workspaces } = readWorkspaceIndex();
  writeWorkspaceIndex(workspaces.filter((w) => w.sessionId !== sessionId));
}

export function listWorkspaces() {
  return [...readWorkspaceIndex().workspaces].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export function createWorkspace({ customer = '', tenantSlug = '', locale = 'de' } = {}) {
  const sessionId = newSessionId();
  const trimmed = String(customer).trim();
  const meta = {
    sessionId,
    customer: trimmed,
    tenantSlug,
    linkLabel: suggestLinkLabelFromCustomer(trimmed),
    locale,
    updatedAt: Date.now(),
    createdAt: Date.now(),
  };
  upsertWorkspace(meta);
  return meta;
}
