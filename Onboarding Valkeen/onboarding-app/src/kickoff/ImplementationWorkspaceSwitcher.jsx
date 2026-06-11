import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ChevronDown, Plus } from 'lucide-react';
import {
  createWorkspace,
  listWorkspaces,
  removeWorkspace,
} from './implementationWorkspace';
import { defaultSession, mergeSession } from './kickoffStudioMerge';
import { saveLocalSession } from './kickoffStudioService';

export default function ImplementationWorkspaceSwitcher({ session, locale = 'de', basePath = '/implementation-studio' }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState(() => listWorkspaces());
  const [newName, setNewName] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    setWorkspaces(listWorkspaces());
  }, [session.sessionId, session.customer, session.updatedAt]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const switchTo = (sessionId) => {
    setOpen(false);
    const p = new URLSearchParams();
    p.set('s', sessionId);
    navigate(`${basePath}?${p.toString()}`);
  };

  const addProject = () => {
    const name = newName.trim();
    const meta = createWorkspace({ customer: name, tenantSlug: session.tenantSlug, locale: session.locale });
    const fresh = mergeSession(defaultSession(meta.sessionId, meta.tenantSlug), meta.tenantSlug);
    fresh.customer = meta.customer;
    fresh.linkLabel = meta.linkLabel;
    fresh.locale = meta.locale;
    fresh.createdAt = meta.createdAt;
    saveLocalSession(fresh);
    setNewName('');
    setOpen(false);
    switchTo(meta.sessionId);
  };

  const currentLabel =
    session.customer?.trim() ||
    workspaces.find((w) => w.sessionId === session.sessionId)?.customer ||
    (locale === 'en' ? 'Select project' : 'Projekt wählen');

  return (
    <div className="impl-workspace" ref={ref}>
      <button className="impl-workspace-btn" onClick={() => setOpen((o) => !o)} type="button">
        <Building2 className="w-4 h-4" />
        <span className="impl-workspace-label">{currentLabel}</span>
        <ChevronDown className="w-4 h-4" style={{ opacity: 0.7 }} />
      </button>
      {open && (
        <div className="impl-workspace-menu impl-glass">
          <div className="impl-workspace-new">
            <input
              className="impl-input"
              placeholder={locale === 'en' ? 'New customer / project' : 'Neuer Kunde / Projekt'}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addProject()}
            />
            <button className="impl-btn impl-btn--primary" onClick={addProject} type="button">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <ul className="impl-workspace-list">
            {workspaces.length === 0 && (
              <li className="impl-workspace-empty">
                {locale === 'en' ? 'No projects yet' : 'Noch keine Projekte'}
              </li>
            )}
            {workspaces.map((w) => (
              <li key={w.sessionId}>
                <button
                  className={`impl-workspace-item ${w.sessionId === session.sessionId ? 'is-active' : ''}`}
                  onClick={() => switchTo(w.sessionId)}
                  type="button"
                >
                  <span>{w.customer || w.sessionId}</span>
                  <span className="impl-workspace-meta">{w.linkLabel || '—'}</span>
                </button>
                {w.sessionId !== session.sessionId && (
                  <button
                    className="impl-workspace-remove"
                    title={locale === 'en' ? 'Remove from list' : 'Aus Liste entfernen'}
                    onClick={() => {
                      removeWorkspace(w.sessionId);
                      setWorkspaces(listWorkspaces());
                    }}
                    type="button"
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
