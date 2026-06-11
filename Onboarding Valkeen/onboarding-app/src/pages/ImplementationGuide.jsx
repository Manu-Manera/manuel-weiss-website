import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Cloud,
  Copy,
  Flag,
  GanttChartSquare,
  ClipboardList,
  Users,
  Info,
  Loader2,
  Palette,
  Sparkles,
  FileText,
  GitBranch,
  Activity,
  X,
} from 'lucide-react';
import { useImplementationPortal } from '../context/ImplementationPortalContext';
import { getArtifact, resolveArtifactHref } from '../kickoff/implementationWorkshopCatalog';
import WorkshopCatalogDrawer from '../kickoff/WorkshopCatalogDrawer';
import '../styles/implementation-workshop-shell.css';
import { downloadTextReport, buildStatusReport } from '../kickoff/implementationReport';
import '../styles/implementation-guide.css';
import {
  IMPL_PHASES,
  STEP_STATUSES,
  STEP_STATUS_LABEL,
  allRightsModuleKeys,
  tx,
} from '../kickoff/implementationTemplate';
import ImplementationWorkspaceSwitcher from '../kickoff/ImplementationWorkspaceSwitcher';
import { upsertWorkspace, workspaceFromSession } from '../kickoff/implementationWorkspace';
import { useImplPermissions, useImplPortal } from '../kickoff/useImplPermissions';
import {
  BG_PRESETS,
  FONT_PRESETS,
  DEFAULT_BRANDING,
  brandingCssVars,
  normalizeBranding,
} from '../kickoff/implementationBranding';
import { defaultSession, mergeSession } from '../kickoff/kickoffStudioMerge';
import {
  EDIT_PASSWORD_STORAGE_KEY,
  fetchCloudSession,
  loadLocalSession,
  newSessionId,
  resolveEditPassword,
  saveImplementationSession,
  saveLocalSession,
} from '../kickoff/kickoffStudioService';
import { kickoffCustomerShareHref } from '../kickoff/kickoffTenantUrls';
import { suggestLinkLabelFromCustomer } from '../kickoff/kickoffLinkLabel';

const RIGHTS = ['edit', 'view', 'hidden'];
const RIGHTS_LABEL = { edit: 'Bearbeiten', view: 'Nur ansehen', hidden: 'Versteckt' };

function initSession(searchParams) {
  const sid = searchParams.get('s') || searchParams.get('session');
  if (sid) {
    const local = loadLocalSession(sid);
    if (local) return mergeSession(local, local.tenantSlug);
    return mergeSession(defaultSession(sid), '');
  }
  return mergeSession(defaultSession(newSessionId()), '');
}

export default function ImplementationGuide() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [session, setSession] = useState(() => initSession(searchParams));
  const [drawer, setDrawer] = useState(null); // 'branding' | 'rights' | 'portal' | 'report' | null
  const portalFromHost = useImplPortal();
  const { portalMode: portalFromCtx, portalPassword } = useImplementationPortal();
  const [password, setPassword] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);

  const locale = session.locale || 'de';
  const branding = useMemo(() => normalizeBranding(session.branding), [session.branding]);
  const cssVars = useMemo(() => brandingCssVars(branding), [branding]);
  const stepStatus = session.stepStatus || {};
  const permissions = session.modulePermissions || {};
  const portalMode = portalFromCtx || portalFromHost;
  const perms = useImplPermissions(session, portalMode);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(EDIT_PASSWORD_STORAGE_KEY);
      if (stored) setPassword(stored);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const sid = searchParams.get('s') || searchParams.get('session');
    if (!sid) return;
    const opts = portalMode
      ? { portalPassword }
      : { facilitatorPassword: resolveEditPassword(password) };
    fetchCloudSession(sid, opts)
      .then((cloud) => {
        if (cloud) setSession((prev) => mergeSession({ ...prev, ...cloud }, prev.tenantSlug));
      })
      .catch(() => {});
  }, [searchParams, portalMode, portalPassword, password]);

  useEffect(() => {
    saveLocalSession(session);
    const meta = workspaceFromSession({ ...session, updatedAt: Date.now() });
    if (meta) upsertWorkspace(meta);
  }, [session]);

  const patch = useCallback((p) => setSession((s) => ({ ...s, ...p })), []);
  const patchBranding = useCallback(
    (p) => setSession((s) => ({ ...s, branding: { ...normalizeBranding(s.branding), ...p } })),
    []
  );

  const allSteps = useMemo(() => IMPL_PHASES.flatMap((ph) => ph.steps), []);
  const doneCount = allSteps.filter((s) => stepStatus[s.id] === 'done').length;
  const progress = Math.round((doneCount / allSteps.length) * 100);

  const cycleStatus = (stepId) => {
    const cur = stepStatus[stepId] || 'open';
    const next = STEP_STATUSES[(STEP_STATUSES.indexOf(cur) + 1) % STEP_STATUSES.length];
    patch({ stepStatus: { ...stepStatus, [stepId]: next } });
  };

  const openStep = (step) => {
    if (!perms.canView(step.module)) return;
    const artifact = getArtifact(step.id);
    const href = resolveArtifactHref(
      artifact || {
        id: step.id,
        route: step.to,
        shell: step.to ? undefined : 'ChecklistWorkshop',
        kind: step.kind,
      },
      session.sessionId,
      { portalMode }
    );
    navigate(href);
  };

  const navParams = () => {
    const p = new URLSearchParams();
    if (session.sessionId) p.set('s', session.sessionId);
    if (portalMode) p.set('portal', '1');
    return p;
  };

  const linkOpts = {
    tenantSlug: session.tenantSlug,
    linkLabel: session.linkLabel || suggestLinkLabelFromCustomer(session.customer),
    sessionId: session.sessionId,
    customer: session.customer,
    locale: session.locale,
  };

  const copyCustomerLink = () => {
    navigator.clipboard.writeText(kickoffCustomerShareHref(linkOpts));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveCloud = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      await saveImplementationSession(session, {
        portalMode,
        portalPassword,
        facilitatorPassword: password,
        actor: portalMode ? 'customer' : 'facilitator',
      });
      setSyncMsg(locale === 'en' ? 'Saved' : 'Gespeichert');
      try {
        const trimmed = String(password || '').trim();
        if (trimmed) localStorage.setItem(EDIT_PASSWORD_STORAGE_KEY, trimmed);
      } catch {
        /* ignore */
      }
      setTimeout(() => setSyncMsg(''), 2500);
    } catch (e) {
      const msg = e.message || '';
      setSyncMsg(
        msg.includes('Invalid password')
          ? locale === 'en'
            ? 'Wrong facilitator password (leave empty for default)'
            : 'Falsches Facilitator-Passwort (leer = Standard)'
          : msg || 'Fehler'
      );
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className={`impl-guide ${portalMode ? 'impl-guide--portal' : ''}`} style={cssVars}>
      <header className="impl-header">
        <div className="impl-brandline">
          {branding.logoUrl ? (
            <img className="impl-logo" src={branding.logoUrl} alt="" />
          ) : (
            <Sparkles className="w-7 h-7" style={{ color: 'var(--impl-primary)' }} />
          )}
          <div>
            {!portalMode && (
              <ImplementationWorkspaceSwitcher session={session} locale={locale} />
            )}
            {portalMode && (
              <span className="impl-portal-badge">
                {locale === 'en' ? 'Customer portal' : 'Kundenportal'}
              </span>
            )}
            <h1 className="impl-title">
              {session.customer
                ? `${session.customer} — Implementation`
                : 'Implementation Workspace'}
            </h1>
            <p className="impl-subtitle">
              {locale === 'en'
                ? 'Guided software implementation — every workshop & milestone in one place'
                : 'Geführte Software-Implementierung — jeder Workshop & Meilenstein an einem Ort'}
            </p>
          </div>
        </div>
        <div className="impl-header-actions">
          {branding.customerLogoUrl && (
            <img className="impl-logo impl-logo--customer" src={branding.customerLogoUrl} alt="" />
          )}
          {(perms.canView('scorecard') || perms.canView('plan')) && (
            <button
              className="impl-btn impl-btn--nav"
              onClick={() => navigate(`/implementation-scorecard?${navParams().toString()}`)}
              type="button"
            >
              <Activity className="w-4 h-4" />
              {locale === 'en' ? 'Scorecard' : 'Scorecard'}
            </button>
          )}
          {perms.canView('plan') && (
            <button
              className="impl-btn impl-btn--nav"
              onClick={() => navigate(`/implementation-plan?${navParams().toString()}`)}
              type="button"
            >
              <GanttChartSquare className="w-4 h-4" />
              {locale === 'en' ? 'Project plan' : 'Projektplan'}
            </button>
          )}
          {perms.canView('log') && (
            <button
              className="impl-btn impl-btn--nav"
              onClick={() => navigate(`/implementation-log?${navParams().toString()}`)}
              type="button"
            >
              <ClipboardList className="w-4 h-4" />
              {locale === 'en' ? 'Project log' : 'Projekt-Log'}
            </button>
          )}
          {(perms.canView('stakeholders') ||
            perms.canView('uat') ||
            perms.canView('risks') ||
            perms.canView('roles')) && (
            <button
              className="impl-btn impl-btn--nav"
              onClick={() => navigate(`/implementation-registers?${navParams().toString()}`)}
              type="button"
            >
              <Users className="w-4 h-4" />
              {locale === 'en' ? 'Registers' : 'Register'}
            </button>
          )}
          <button
            className="impl-btn impl-btn--nav"
            onClick={() => setCatalogOpen(true)}
            type="button"
          >
            <GitBranch className="w-4 h-4" />
            {locale === 'en' ? 'All workshops' : 'Alle Workshops'}
          </button>
          {!portalMode && (
            <button className="impl-btn" onClick={() => setDrawer('portal')} type="button">
              {locale === 'en' ? 'Portal' : 'Kundenportal'}
            </button>
          )}
          {!portalMode && (
            <button className="impl-btn" onClick={() => setDrawer('report')} type="button">
              <FileText className="w-4 h-4" />
              {locale === 'en' ? 'Status report' : 'Status-Report'}
            </button>
          )}
          {!portalMode && (
            <button className="impl-btn" onClick={() => setDrawer('rights')} type="button">
              {locale === 'en' ? 'Rights' : 'Rechte'}
            </button>
          )}
          {!portalMode && (
            <button className="impl-btn" onClick={() => setDrawer('branding')} type="button">
              <Palette className="w-4 h-4" />
              {locale === 'en' ? 'Branding' : 'Branding'}
            </button>
          )}
          {!portalMode && (
            <button className="impl-btn" onClick={copyCustomerLink} type="button">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {locale === 'en' ? 'Customer link' : 'Kunden-Link'}
            </button>
          )}
          {!portalMode && (
            <button className="impl-btn impl-btn--primary" onClick={saveCloud} type="button" disabled={syncing}>
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
              {locale === 'en' ? 'Save' : 'Speichern'}
            </button>
          )}
          {portalMode && (
            <button className="impl-btn impl-btn--primary" onClick={saveCloud} type="button" disabled={syncing}>
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
              {locale === 'en' ? 'Save' : 'Speichern'}
            </button>
          )}
        </div>
      </header>

      {!portalMode && (
        <div className="impl-meta impl-glass">
          <div>
            <label>{locale === 'en' ? 'Customer' : 'Kunde'}</label>
            <input
              className="impl-input"
              value={session.customer || ''}
              placeholder={locale === 'en' ? 'Customer name' : 'Kundenname'}
              onChange={(e) => patch({ customer: e.target.value })}
            />
          </div>
          <div>
            <label>{locale === 'en' ? 'Link short name' : 'Link-Kurzname'}</label>
            <input
              className="impl-input"
              value={session.linkLabel || ''}
              placeholder={suggestLinkLabelFromCustomer(session.customer) || 'kunde'}
              onChange={(e) => patch({ linkLabel: e.target.value })}
            />
          </div>
          <div>
            <label>{locale === 'en' ? 'Language' : 'Sprache'}</label>
            <select
              className="impl-select"
              value={locale}
              onChange={(e) => patch({ locale: e.target.value })}
            >
              <option value="de">Deutsch</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label>{locale === 'en' ? 'Kick-off date' : 'Kick-off Datum'}</label>
            <input
              type="date"
              className="impl-input"
              value={session.kickoffDate || ''}
              onChange={(e) => patch({ kickoffDate: e.target.value })}
            />
          </div>
          <div>
            <label>Go-Live</label>
            <input
              type="date"
              className="impl-input"
              value={session.goLiveDate || ''}
              onChange={(e) => patch({ goLiveDate: e.target.value })}
            />
          </div>
          {syncMsg && (
            <div style={{ alignSelf: 'end', fontSize: 13, color: 'var(--impl-accent)' }}>{syncMsg}</div>
          )}
        </div>
      )}
      {portalMode && syncMsg && (
        <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--impl-accent)' }}>{syncMsg}</div>
      )}

      <div className="impl-progress-wrap">
        <div className="impl-progress">
          <div className="impl-progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <span className="impl-progress-label">
          {progress}% · {doneCount}/{allSteps.length}
        </span>
      </div>

      <div className="impl-phases">
        {IMPL_PHASES.map((phase, i) => (
          <section key={phase.id} className="impl-phase impl-glass">
            <div className="impl-phase-head">
              <div className="impl-phase-index">{i + 1}</div>
              <div>
                <h2 className="impl-phase-title">{tx(phase.title, locale)}</h2>
                <p className="impl-phase-goal">{tx(phase.goal, locale)}</p>
              </div>
            </div>
            <div className="impl-steps">
              {phase.steps.map((step) => {
                if (perms.isHidden(step.module)) return null;
                const st = stepStatus[step.id] || 'open';
                const isInfo = step.kind === 'info';
                const isMilestone = step.kind === 'milestone';
                const canEditStep = perms.canEdit(step.module);
                const canOpen = perms.canView(step.module);
                return (
                  <div
                    key={step.id}
                    className={`impl-step ${isInfo || isMilestone ? 'impl-step--info' : ''}`}
                    onClick={() => canOpen && openStep(step)}
                    role={canOpen ? 'button' : undefined}
                    tabIndex={canOpen ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (canOpen && (e.key === 'Enter' || e.key === ' ')) openStep(step);
                    }}
                  >
                    <button
                      type="button"
                      className={`impl-step-dot impl-step-dot--${st}`}
                      title={STEP_STATUS_LABEL[locale][st]}
                      disabled={!canEditStep}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (canEditStep) cycleStatus(step.id);
                      }}
                      aria-label="Status"
                    />
                    <div className="impl-step-body">
                      <div className="impl-step-title">
                        {isMilestone && <Flag className="w-3.5 h-3.5" style={{ color: 'var(--impl-accent)' }} />}
                        {isInfo && <Info className="w-3.5 h-3.5" style={{ opacity: 0.7 }} />}
                        {tx(step.title, locale)}
                      </div>
                      <div className="impl-step-desc">{tx(step.desc, locale)}</div>
                      <div className="impl-step-meta">
                        {step.owner && <span className="impl-chip">{step.owner}</span>}
                        {isMilestone && (
                          <span className="impl-chip impl-chip--milestone">
                            {locale === 'en' ? 'Milestone' : 'Meilenstein'}
                          </span>
                        )}
                        {step.to && portalMode && (
                          <span className="impl-chip impl-chip--rights">{perms.rightLabel(step.module)}</span>
                        )}
                      </div>
                    </div>
                    {canOpen && <ArrowRight className="w-4 h-4 impl-step-go" />}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <p style={{ marginTop: 32, fontSize: 12, color: 'var(--impl-text-soft)', textAlign: 'center' }}>
        {branding.footerText}
      </p>

      {drawer === 'branding' && (
        <BrandingDrawer
          branding={branding}
          onChange={patchBranding}
          onReset={() => patch({ branding: { ...DEFAULT_BRANDING } })}
          onClose={() => setDrawer(null)}
        />
      )}
      {drawer === 'rights' && (
        <RightsDrawer
          permissions={permissions}
          onChange={(moduleKey, value) =>
            patch({ modulePermissions: { ...permissions, [moduleKey]: value } })
          }
          onClose={() => setDrawer(null)}
        />
      )}
      {drawer === 'portal' && (
        <PortalDrawer
          session={session}
          onPatch={patch}
          onClose={() => setDrawer(null)}
          locale={locale}
        />
      )}
      {drawer === 'report' && (
        <ReportDrawer session={session} locale={locale} onClose={() => setDrawer(null)} />
      )}
      <WorkshopCatalogDrawer
        open={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        locale={locale}
        sessionId={session.sessionId}
        portalMode={portalMode}
      />
    </div>
  );
}

function PortalDrawer({ session, onPatch, onClose, locale }) {
  return (
    <div className="impl-drawer-backdrop" onClick={onClose}>
      <div className="impl-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="impl-header" style={{ marginBottom: 4 }}>
          <h2 className="impl-title" style={{ fontSize: 20 }}>
            {locale === 'en' ? 'Customer portal' : 'Kundenportal'}
          </h2>
          <button className="impl-btn impl-btn--ghost" onClick={onClose} type="button">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--impl-text-soft)', margin: '0 0 12px' }}>
          {locale === 'en'
            ? 'Set portal password and release — customers log in at impl subdomain.'
            : 'Portal-Passwort setzen und freigeben — Kunden loggen sich auf der impl-Subdomain ein.'}
        </p>
        <div className="impl-field">
          <span>{locale === 'en' ? 'Portal password' : 'Portal-Passwort'}</span>
          <input
            className="impl-input"
            type="password"
            value={session.portalPassword || ''}
            placeholder={locale === 'en' ? 'Optional — recommended' : 'Optional — empfohlen'}
            onChange={(e) => onPatch({ portalPassword: e.target.value })}
          />
        </div>
        <div className="impl-field">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <input
              type="checkbox"
              checked={session.portalReleased !== false}
              onChange={(e) => onPatch({ portalReleased: e.target.checked })}
            />
            {locale === 'en' ? 'Portal released for customer' : 'Portal für Kunden freigegeben'}
          </label>
        </div>
      </div>
    </div>
  );
}

function ReportDrawer({ session, locale, onClose }) {
  const report = buildStatusReport(session, locale);
  const audit = (session.auditLog || []).slice().reverse().slice(0, 30);
  return (
    <div className="impl-drawer-backdrop" onClick={onClose}>
      <div className="impl-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="impl-header" style={{ marginBottom: 4 }}>
          <h2 className="impl-title" style={{ fontSize: 20 }}>
            {locale === 'en' ? 'Status report' : 'Status-Report'}
          </h2>
          <button className="impl-btn impl-btn--ghost" onClick={onClose} type="button">
            <X className="w-4 h-4" />
          </button>
        </div>
        <button
          className="impl-btn impl-btn--primary"
          type="button"
          onClick={() => downloadTextReport(session, locale)}
          style={{ marginBottom: 12 }}
        >
          <FileText className="w-4 h-4" />
          {locale === 'en' ? 'Download Markdown' : 'Markdown herunterladen'}
        </button>
        <pre
          className="impl-glass"
          style={{
            fontSize: 12,
            padding: 12,
            whiteSpace: 'pre-wrap',
            maxHeight: 200,
            overflow: 'auto',
            marginBottom: 12,
          }}
        >
          {report}
        </pre>
        {audit.length > 0 && (
          <>
            <h3 style={{ fontSize: 14, margin: '0 0 8px' }}>
              {locale === 'en' ? 'Audit log' : 'Audit-Log'}
            </h3>
            <ul style={{ fontSize: 12, margin: 0, paddingLeft: 18, color: 'var(--impl-text-soft)' }}>
              {audit.map((a) => (
                <li key={a.id}>
                  {a.at} · {a.actor || '—'} · {a.action}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function BrandingDrawer({ branding, onChange, onReset, onClose }) {
  return (
    <div className="impl-drawer-backdrop" onClick={onClose}>
      <div className="impl-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="impl-header" style={{ marginBottom: 4 }}>
          <h2 className="impl-title" style={{ fontSize: 20 }}>
            Branding
          </h2>
          <button className="impl-btn impl-btn--ghost" onClick={onClose} type="button">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="impl-field">
          <span>Primärfarbe</span>
          <div className="impl-row">
            <input
              type="color"
              className="impl-color"
              value={branding.primaryColor}
              onChange={(e) => onChange({ primaryColor: e.target.value })}
            />
            <input
              className="impl-input"
              value={branding.primaryColor}
              onChange={(e) => onChange({ primaryColor: e.target.value })}
            />
          </div>
        </div>

        <div className="impl-field">
          <span>Akzentfarbe</span>
          <div className="impl-row">
            <input
              type="color"
              className="impl-color"
              value={branding.accentColor}
              onChange={(e) => onChange({ accentColor: e.target.value })}
            />
            <input
              className="impl-input"
              value={branding.accentColor}
              onChange={(e) => onChange({ accentColor: e.target.value })}
            />
          </div>
        </div>

        <div className="impl-field">
          <span>Hintergrund</span>
          <select
            className="impl-select"
            value={branding.bgPreset}
            onChange={(e) => onChange({ bgPreset: e.target.value })}
          >
            {Object.entries(BG_PRESETS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        <div className="impl-field">
          <span>Schrift</span>
          <select
            className="impl-select"
            value={branding.font}
            onChange={(e) => onChange({ font: e.target.value })}
          >
            {Object.entries(FONT_PRESETS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        <div className="impl-field">
          <span>Glas-Intensität: {branding.glassAlpha}%</span>
          <input
            type="range"
            className="impl-range"
            min="0"
            max="20"
            value={branding.glassAlpha}
            onChange={(e) => onChange({ glassAlpha: Number(e.target.value) })}
          />
        </div>

        <div className="impl-field">
          <span>Eckenradius: {branding.radius}px</span>
          <input
            type="range"
            className="impl-range"
            min="0"
            max="36"
            value={branding.radius}
            onChange={(e) => onChange({ radius: Number(e.target.value) })}
          />
        </div>

        <div className="impl-field">
          <span>Logo-URL (Valkeen/Partner)</span>
          <input
            className="impl-input"
            value={branding.logoUrl}
            placeholder="https://…/logo.png"
            onChange={(e) => onChange({ logoUrl: e.target.value })}
          />
        </div>

        <div className="impl-field">
          <span>Kundenlogo-URL</span>
          <input
            className="impl-input"
            value={branding.customerLogoUrl}
            placeholder="https://…/kunde.png"
            onChange={(e) => onChange({ customerLogoUrl: e.target.value })}
          />
        </div>

        <div className="impl-field">
          <span>Footer-Text</span>
          <input
            className="impl-input"
            value={branding.footerText}
            onChange={(e) => onChange({ footerText: e.target.value })}
          />
        </div>

        <button className="impl-btn impl-btn--ghost" onClick={onReset} type="button">
          Zurücksetzen
        </button>
      </div>
    </div>
  );
}

function RightsDrawer({ permissions, onChange, onClose }) {
  const modules = allRightsModuleKeys();
  return (
    <div className="impl-drawer-backdrop" onClick={onClose}>
      <div className="impl-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="impl-header" style={{ marginBottom: 4 }}>
          <h2 className="impl-title" style={{ fontSize: 20 }}>
            Kunden-Rechte
          </h2>
          <button className="impl-btn impl-btn--ghost" onClick={onClose} type="button">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--impl-text-soft)', margin: 0 }}>
          Lege pro Modul fest, was der Kunde im eigenen Portal darf.
        </p>
        {modules.map((m) => {
          const value = permissions[m] || 'view';
          return (
            <div className="impl-field" key={m}>
              <span style={{ textTransform: 'capitalize' }}>{m}</span>
              <select
                className="impl-select"
                value={value}
                onChange={(e) => onChange(m, e.target.value)}
              >
                {RIGHTS.map((r) => (
                  <option key={r} value={r}>
                    {RIGHTS_LABEL[r]}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
