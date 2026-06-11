import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  GraduationCap,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  Loader2,
  AlertTriangle,
  Play,
  ArrowRight,
} from 'lucide-react';
import '../styles/implementation-guide.css';
import '../styles/implementation-plan.css';
import { brandingCssVars, normalizeBranding } from '../kickoff/implementationBranding';
import { fetchCloudSession } from '../kickoff/kickoffStudioService';
import { mergeSession } from '../kickoff/kickoffStudioMerge';
import { getProgress, setAuth } from '../services/trainingAdminService';
import { tx } from '../kickoff/implementationTemplate';
import {
  personalPlanItems,
  personalLearningProgress,
  dueLearningItems,
  sanitizeLearningEmail,
} from '../kickoff/implementationLearningAccess';

const BASE = import.meta.env.BASE_URL || '/onboarding/';

function trainerHref() {
  if (typeof window === 'undefined') return `${BASE}tempus-trainer`;
  return new URL('tempus-trainer', window.location.origin + BASE).href;
}

export default function LearnHub() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('s') || searchParams.get('session') || '';
  const customerId = searchParams.get('cid') || '';
  const userIdParam = searchParams.get('u') || '';
  const bootstrapToken = searchParams.get('lt') || '';

  const [session, setSession] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Bootstrap-Token in Training-Auth übernehmen, dann aus der URL entfernen.
  useEffect(() => {
    if (!bootstrapToken || !customerId) return;
    setAuth({
      token: bootstrapToken,
      customerId,
      userId: userIdParam,
      role: 'trainee',
      expiresAt: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
    });
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('lt');
      window.history.replaceState({}, '', url.toString());
    } catch {
      /* ignore */
    }
  }, [bootstrapToken, customerId, userIdParam]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    if (!sessionId) {
      setError('missing_session');
      setLoading(false);
      return;
    }
    fetchCloudSession(sessionId)
      .then((cloud) => {
        if (cancelled) return;
        if (!cloud) {
          setError('not_found');
          return;
        }
        setSession(mergeSession(cloud, cloud.tenantSlug));
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'load_error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  useEffect(() => {
    if (!customerId || !userIdParam) return;
    let cancelled = false;
    getProgress(customerId, userIdParam)
      .then((p) => {
        if (!cancelled) setProgress(p);
      })
      .catch(() => {
        if (!cancelled) setProgress(null);
      });
    return () => {
      cancelled = true;
    };
  }, [customerId, userIdParam]);

  const locale = session?.locale || 'de';
  const branding = useMemo(() => normalizeBranding(session?.branding), [session?.branding]);
  const cssVars = useMemo(() => brandingCssVars(branding), [branding]);

  const user = useMemo(() => {
    if (!session?.users?.length) return null;
    const needle = sanitizeLearningEmail(userIdParam);
    return (
      session.users.find(
        (u) =>
          u.learningUserId === userIdParam ||
          sanitizeLearningEmail(u.email) === needle ||
          u.id === userIdParam
      ) || null
    );
  }, [session, userIdParam]);

  const items = useMemo(
    () => (session && user ? personalPlanItems(session, user, progress, locale) : []),
    [session, user, progress, locale]
  );
  const overall = personalLearningProgress(items);
  const due = useMemo(() => dueLearningItems(items), [items]);

  if (loading) {
    return (
      <div className="impl-guide" style={{ ...cssVars, minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--impl-primary)' }} />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="impl-guide" style={{ ...cssVars, minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div className="impl-glass" style={{ padding: 28, maxWidth: 420, textAlign: 'center' }}>
          <AlertTriangle className="w-8 h-8" style={{ color: '#fbbf24', margin: '0 auto 12px' }} />
          <h2 style={{ margin: '0 0 8px' }}>
            {locale === 'en' ? 'Learning hub unavailable' : 'Learning-Hub nicht verfügbar'}
          </h2>
          <p style={{ color: 'var(--impl-text-soft)', fontSize: 14 }}>
            {error === 'missing_session'
              ? locale === 'en'
                ? 'This link is incomplete. Please use the personal link from your facilitator.'
                : 'Dieser Link ist unvollständig. Bitte den persönlichen Link vom Facilitator nutzen.'
              : locale === 'en'
                ? 'Project not found or not released.'
                : 'Projekt nicht gefunden oder nicht freigegeben.'}
          </p>
        </div>
      </div>
    );
  }

  const displayName = user?.name || user?.email || userIdParam || (locale === 'en' ? 'Team member' : 'Teammitglied');

  return (
    <div className="impl-guide" style={{ ...cssVars, minHeight: '100vh' }}>
      <header className="impl-header">
        <div className="impl-brandline">
          {branding.logoUrl ? (
            <img className="impl-logo" src={branding.logoUrl} alt="" />
          ) : (
            <GraduationCap className="w-7 h-7" style={{ color: 'var(--impl-primary)' }} />
          )}
          <div>
            <span className="impl-portal-badge">
              {locale === 'en' ? 'My learning hub' : 'Mein Learning-Hub'}
            </span>
            <h1 className="impl-title">
              {displayName}
              {user?.role ? ` · ${user.role}` : ''}
            </h1>
            <p className="impl-subtitle">
              {session.customer
                ? `${session.customer} — ${locale === 'en' ? 'Software implementation' : 'Software-Einführung'}`
                : locale === 'en'
                  ? 'Software implementation'
                  : 'Software-Einführung'}
            </p>
          </div>
        </div>
        <div className="impl-header-actions">
          <a className="impl-btn impl-btn--primary" href={trainerHref()} target="_blank" rel="noopener noreferrer">
            <Play className="w-4 h-4" />
            {locale === 'en' ? 'Open Tempus trainer' : 'Tempus-Trainer öffnen'}
          </a>
        </div>
      </header>

      {!user && (
        <div className="impl-glass" style={{ padding: 16, marginBottom: 16 }}>
          <p style={{ margin: 0, color: 'var(--impl-text-soft)' }}>
            {locale === 'en'
              ? 'Your profile was not found in this project. Please ask your facilitator to re-send your learning access.'
              : 'Dein Profil wurde in diesem Projekt nicht gefunden. Bitte den Facilitator um einen neuen Learning-Zugang bitten.'}
          </p>
        </div>
      )}

      <div className="impl-progress-wrap">
        <div className="impl-progress">
          <div className="impl-progress-bar" style={{ width: `${overall}%` }} />
        </div>
        <span className="impl-progress-label">
          {overall}% · {items.filter((i) => i.progress >= 100).length}/{items.length}{' '}
          {locale === 'en' ? 'modules' : 'Module'}
        </span>
      </div>

      {due.length > 0 && (
        <section className="impl-phase impl-glass" style={{ marginBottom: 16 }}>
          <div className="impl-phase-head">
            <Clock className="w-5 h-5" style={{ color: 'var(--impl-accent)' }} />
            <div>
              <h2 className="impl-phase-title">{locale === 'en' ? 'Due now' : 'Jetzt dran'}</h2>
              <p className="impl-phase-goal">
                {locale === 'en'
                  ? 'Spaced practice — small steps tied to your project plan.'
                  : 'Verteiltes Lernen — kleine Schritte entlang deines Projektplans.'}
              </p>
            </div>
          </div>
          <div className="impl-steps">
            {due.slice(0, 5).map((it) => (
              <LearnItemRow key={it.taskId} item={it} locale={locale} highlight />
            ))}
          </div>
        </section>
      )}

      <section className="impl-phase impl-glass">
        <div className="impl-phase-head">
          <GraduationCap className="w-5 h-5" style={{ color: 'var(--impl-primary)' }} />
          <div>
            <h2 className="impl-phase-title">{locale === 'en' ? 'My learning path' : 'Mein Lernpfad'}</h2>
            <p className="impl-phase-goal">
              {locale === 'en'
                ? 'Everything assigned to your role across the project.'
                : 'Alles, was deiner Rolle im Projekt zugeordnet ist.'}
            </p>
          </div>
        </div>
        {items.length === 0 ? (
          <p style={{ color: 'var(--impl-text-soft)', fontSize: 14, padding: '8px 4px' }}>
            {locale === 'en'
              ? 'No learning modules assigned yet.'
              : 'Noch keine Lernmodule zugeordnet.'}
          </p>
        ) : (
          <div className="impl-steps">
            {items.map((it) => (
              <LearnItemRow key={it.taskId} item={it} locale={locale} />
            ))}
          </div>
        )}
      </section>

      <p style={{ marginTop: 28, fontSize: 12, color: 'var(--impl-text-soft)', textAlign: 'center' }}>
        {branding.footerText}
      </p>
    </div>
  );
}

function LearnItemRow({ item, locale, highlight }) {
  return (
    <div className={`impl-step ${highlight ? '' : 'impl-step--info'}`}>
      <div className="impl-step-body">
        <div className="impl-step-title">
          {item.progress >= 100 ? (
            <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--impl-accent)' }} />
          ) : (
            <Circle className="w-4 h-4" style={{ opacity: 0.6 }} />
          )}
          {item.title}
          {item.required && (
            <span className="impl-chip impl-chip--milestone" style={{ marginLeft: 6 }}>
              {locale === 'en' ? 'Required' : 'Pflicht'}
            </span>
          )}
        </div>
        <div className="impl-step-desc">
          {item.modules.map((m, i) => (
            <span key={i} style={{ marginRight: 12, opacity: m.done ? 0.6 : 1 }}>
              {m.done ? '✓ ' : '○ '}
              {m.type === 'checkpoint'
                ? tx(m.label, locale)
                : m.type === 'tour'
                  ? `${locale === 'en' ? 'Tour' : 'Tour'}${m.roleHint ? ` (${m.roleHint})` : ''}`
                  : m.type === 'artifact'
                    ? m.artifactId
                    : m.type}
            </span>
          ))}
        </div>
        <div className="impl-step-meta">
          <span className="impl-chip">
            {item.start} → {item.end}
          </span>
          <span className="impl-chip">{item.progress}%</span>
        </div>
      </div>
      {item.modules.some((m) => m.type === 'tour') && (
        <a className="impl-btn impl-btn--nav" href={trainerHref()} target="_blank" rel="noopener noreferrer">
          <ArrowRight className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}
