import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Cloud,
  Copy,
  Check,
  FileDown,
  Loader2,
  Settings,
  Sparkles,
  ExternalLink,
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import '../styles/kickoff-studio.css';
import '../styles/kickoff-brand.css';
import KickoffBrandLogo from './KickoffBrandLogo';
import { ui, LOCALES } from './kickoffStudioI18n';
import {
  CHAPTERS,
  chapterLabel,
  chapterForSlideId,
  chapterThemeClass,
  slideKindTheme,
  visibleChapters,
  getPresentationSlides,
} from './kickoffStudioCatalog';
import { getDeckSlides, localizeSlide } from './kickoffDeckLocale';
import {
  buildExportDeck,
  defaultSession,
  emptyAnswersForSlide,
  mergeSession,
} from './kickoffStudioMerge';
import { applyTenantModulePreset, normalizeVizConfig } from './kickoffVizConfig';
import { exportKickoffPdf } from './kickoffStudioPdf';
import {
  DEFAULT_EDIT_PASSWORD,
  fetchCloudSession,
  loadLocalSession,
  newSessionId,
  requestGammaExport,
  saveCloudSession,
  saveLocalSession,
} from './kickoffStudioService';
import { suggestLinkLabelFromCustomer } from './kickoffLinkLabel';
import {
  kickoffPresenterFallbackHref,
  kickoffSubdomainHref,
  kickoffSubdomainPreviewHost,
} from './kickoffTenantUrls';
import { getTenantByHost, getTenantBySlug } from './kickoffTenants';
import KickoffTenantLinksPanel from './KickoffTenantLinksPanel';
import SlideBody from './SlideBody';

const fieldClass = 'kickoff-input';

function sessionFromSearchParams(searchParams, tenant, hostOnly) {
  const sid =
    searchParams.get('s') || searchParams.get('session') || newSessionId();
  const tenantSlug = hostOnly
    ? tenant?.slug || ''
    : searchParams.get('tenant') || tenant?.slug || '';
  const base = defaultSession(sid, tenantSlug || tenant);
  return {
    ...base,
    customer:
      searchParams.get('c') ||
      searchParams.get('customer') ||
      (hostOnly ? tenant?.customer : '') ||
      base.customer,
    locale: searchParams.get('locale') || tenant?.localeDefault || base.locale,
    includeIntegrations:
      searchParams.get('integrations') === '1'
        ? true
        : searchParams.get('integrations') === '0'
          ? false
          : hostOnly
            ? (tenant?.includeIntegrationsDefault ?? base.includeIntegrations)
            : base.includeIntegrations,
    tenantSlug: hostOnly ? tenant?.slug || '' : searchParams.get('tenant') || '',
    workshopCaptureEnabled: searchParams.get('capture') === '1',
  };
}

export default function KickoffStudioCore({
  viewMode = 'facilitator',
  tenantSlug: tenantSlugProp,
}) {
  const [searchParams] = useSearchParams();
  const hostTenant = useMemo(() => getTenantByHost(window.location.hostname), []);
  const routeTenant = useMemo(
    () => getTenantBySlug(tenantSlugProp) || getTenantBySlug(searchParams.get('tenant')),
    [tenantSlugProp, searchParams]
  );
  const tenant = routeTenant || hostTenant;
  const isPresenter = viewMode === 'presenter';

  const [session, setSession] = useState(() =>
    mergeSession(sessionFromSearchParams(searchParams, tenant, !!hostTenant), tenant)
  );
  const [password, setPassword] = useState('');
  const [slideIndex, setSlideIndex] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [gammaUrl, setGammaUrl] = useState('');
  const [gammaLoading, setGammaLoading] = useState(false);
  const [gammaError, setGammaError] = useState('');
  const [copied, setCopied] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [browserFullscreen, setBrowserFullscreen] = useState(false);

  const locale = session.locale || 'de';
  const t = (key) => ui(locale, key);

  const slideById = useMemo(() => {
    const m = new Map();
    for (const s of getDeckSlides()) m.set(s.id, s);
    return m;
  }, []);

  const deckSlides = useMemo(() => getDeckSlides(), []);

  const chapters = useMemo(
    () => visibleChapters(session.includeIntegrations),
    [session.includeIntegrations]
  );

  /** Strikte Reihenfolge wie kickoff-deck.json — Weiter/Zurück = ±1 Folie */
  const visibleSlideList = useMemo(
    () => getPresentationSlides(deckSlides, session.includeIntegrations),
    [deckSlides, session.includeIntegrations]
  );

  const slideRailRef = useRef(null);
  const activeSlideIdRef = useRef(visibleSlideList[0]?.id);

  const currentSlide = visibleSlideList[slideIndex];
  const localizedCurrent = useMemo(
    () =>
      currentSlide
        ? localizeSlide(currentSlide, locale, session.customer)
        : null,
    [currentSlide, locale, session.customer]
  );

  const currentChapter = useMemo(() => {
    if (!currentSlide) return null;
    return chapterForSlideId(chapters, currentSlide.id);
  }, [currentSlide, chapters]);

  const goToSlide = useCallback(
    (index) => {
      if (!visibleSlideList.length) return;
      const i = Math.max(0, Math.min(index, visibleSlideList.length - 1));
      setSlideIndex(i);
      activeSlideIdRef.current = visibleSlideList[i]?.id;
    },
    [visibleSlideList]
  );

  useEffect(() => {
    if (!visibleSlideList.length) return;
    const id = activeSlideIdRef.current;
    const idx = id ? visibleSlideList.findIndex((s) => s.id === id) : -1;
    if (idx >= 0 && idx !== slideIndex) {
      setSlideIndex(idx);
    } else if (slideIndex >= visibleSlideList.length) {
      setSlideIndex(visibleSlideList.length - 1);
    }
  }, [visibleSlideList, session.includeIntegrations]);

  useEffect(() => {
    activeSlideIdRef.current = visibleSlideList[slideIndex]?.id;
    const el = slideRailRef.current?.querySelector('[data-slide-active="true"]');
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [slideIndex, visibleSlideList]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest('input, textarea, select')) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        goToSlide(slideIndex + 1);
      }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goToSlide(slideIndex - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [slideIndex, goToSlide]);

  const customerLine =
    session.customer?.trim() || t('customerLabelFallback');

  const setAnswer = useCallback((slideId, patch) => {
    setSession((s) => ({
      ...s,
      answers: {
        ...s.answers,
        [slideId]: { ...(s.answers[slideId] || {}), ...patch },
      },
    }));
  }, []);

  const setVizConfig = useCallback(
    (patch) => {
      setSession((s) => ({
        ...s,
        vizConfig: normalizeVizConfig(
          { ...s.vizConfig, ...patch },
          s.tenantSlug || tenant
        ),
      }));
    },
    [tenant]
  );

  const ensureAnswers = useCallback(
    (slide) => {
      if (!slide || session.answers[slide.id]) return;
      setSession((s) => ({
        ...s,
        answers: {
          ...s.answers,
          [slide.id]: emptyAnswersForSlide(
            localizeSlide(slide, locale, s.customer)
          ),
        },
      }));
    },
    [session.answers, locale]
  );

  useEffect(() => {
    ensureAnswers(currentSlide);
  }, [currentSlide?.id]);

  useEffect(() => {
    if (!hostTenant) return;
    setSession((s) => ({
      ...s,
      customer: s.customer || hostTenant.customer,
      tenantSlug: hostTenant.slug,
      locale: s.locale || hostTenant.localeDefault,
      includeIntegrations:
        s.includeIntegrations ?? hostTenant.includeIntegrationsDefault,
    }));
  }, [hostTenant?.slug]);

  useEffect(() => {
    const sid = searchParams.get('s') || searchParams.get('session');
    if (!sid) return;
    setSession((s) => ({ ...s, sessionId: sid }));
    const local = loadLocalSession(sid);
    if (local) setSession((prev) => mergeSession({ ...prev, ...local }, prev.tenantSlug || tenant));
    fetchCloudSession(sid)
      .then((cloud) => {
        if (cloud)
          setSession((prev) =>
            mergeSession({ ...prev, ...cloud }, prev.tenantSlug || tenant)
          );
      })
      .catch(() => {});
  }, [searchParams]);

  useEffect(() => {
    saveLocalSession(session);
  }, [session]);

  useEffect(() => {
    const onFs = () => setBrowserFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const toggleBrowserFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      document.documentElement.requestFullscreen?.();
    }
  };

  const persistCloud = async () => {
    setSyncing(true);
    setSyncError('');
    try {
      const pw = password || DEFAULT_EDIT_PASSWORD;
      await saveCloudSession(session, pw);
      setLastSaved(Date.now());
    } catch (e) {
      setSyncError(e.message || t('cloudError'));
    } finally {
      setSyncing(false);
    }
  };

  const runGamma = async () => {
    setGammaLoading(true);
    setGammaError('');
    setGammaUrl('');
    try {
      const pw = password || DEFAULT_EDIT_PASSWORD;
      const exportDeck = buildExportDeck(session);
      const res = await requestGammaExport({ ...session, exportDeck }, pw);
      if (res.gammaUrl) setGammaUrl(res.gammaUrl);
      else if (res.error) setGammaError(res.error);
    } catch (e) {
      setGammaError(e.message || t('gammaUnavailable'));
    } finally {
      setGammaLoading(false);
    }
  };

  const exportPdf = () => {
    exportKickoffPdf(buildExportDeck(session), locale);
  };

  const linkOpts = {
    tenantSlug: session.tenantSlug || tenant?.slug,
    linkLabel: session.linkLabel,
    sessionId: session.sessionId,
    customer: session.customer,
    locale: session.locale,
    includeIntegrations: session.includeIntegrations,
    workshopCaptureEnabled: session.workshopCaptureEnabled,
  };

  const copyPresenterLink = (useShortSubdomain = true) => {
    const href = useShortSubdomain
      ? kickoffSubdomainHref(linkOpts)
      : kickoffPresenterFallbackHref(linkOpts);
    navigator.clipboard.writeText(href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const progressPct =
    visibleSlideList.length > 0
      ? Math.round(((slideIndex + 1) / visibleSlideList.length) * 100)
      : 0;

  const shellClass = [
    'kickoff-shell',
    isPresenter ? 'kickoff-shell--presenter' : 'kickoff-shell--facilitator',
    browserFullscreen ? 'kickoff-shell--browser-fs' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={shellClass}>
      <header className="kickoff-topbar">
        <div className="kickoff-topbar-brand">
          <KickoffBrandLogo compact={isPresenter} />
          <div className="min-w-0">
            <h1 className="kickoff-topbar-title">{t('title')}</h1>
            <p className="kickoff-topbar-sub">{customerLine}</p>
          </div>
        </div>

        <div className="kickoff-topbar-actions">
          <select
            className="kickoff-topbar-select"
            value={locale}
            onChange={(e) =>
              setSession((s) => ({ ...s, locale: e.target.value }))
            }
            aria-label={t('locale')}
          >
            {LOCALES.map((l) => (
              <option key={l} value={l}>
                {l === 'de' ? 'DE' : 'EN'}
              </option>
            ))}
          </select>

          {!isPresenter && (
            <>
              <button type="button" className="kickoff-btn-secondary" onClick={exportPdf}>
                <FileDown className="w-4 h-4" />
                <span className="hidden sm:inline">{t('exportPdf')}</span>
              </button>
              <button
                type="button"
                className="kickoff-btn-primary"
                onClick={runGamma}
                disabled={gammaLoading}
              >
                {gammaLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {gammaLoading ? t('gammaRunning') : t('exportGamma')}
                </span>
              </button>
            </>
          )}

          <button
            type="button"
            className="kickoff-btn-secondary"
            onClick={() => setSettingsOpen((v) => !v)}
            aria-expanded={settingsOpen}
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            type="button"
            className="kickoff-btn-secondary"
            onClick={toggleBrowserFullscreen}
            title={browserFullscreen ? t('exitFullscreen') : t('enterFullscreen')}
          >
            {browserFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          {!isPresenter && (
            <a
              href={kickoffSubdomainHref({
                sessionId: session.sessionId,
                customer: session.customer,
                locale: session.locale,
                includeIntegrations: session.includeIntegrations,
                tenantSlug: session.tenantSlug,
                linkLabel: session.linkLabel,
                workshopCaptureEnabled: session.workshopCaptureEnabled,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="kickoff-btn-secondary"
              title={t('openPresenter')}
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden lg:inline">{t('openPresenter')}</span>
            </a>
          )}
        </div>
      </header>

      {gammaUrl && (
        <div className="kickoff-gamma-banner">
          <a href={gammaUrl} target="_blank" rel="noreferrer">
            {t('gammaDone')} <ExternalLink className="w-4 h-4 inline" />
          </a>
        </div>
      )}
      {gammaError && <div className="kickoff-gamma-banner kickoff-gamma-banner--err">{gammaError}</div>}

      <aside className="kickoff-slide-rail" aria-label={t('slidesNav')} ref={slideRailRef}>
        {chapters.map((ch) => {
          const slidesInChapter = ch.slideIds
            .map((id) => visibleSlideList.find((s) => s.id === id))
            .filter(Boolean);
          if (!slidesInChapter.length) return null;
          return (
            <div key={ch.id} className={`kickoff-slide-group ${chapterThemeClass(ch)}`}>
              <div className="kickoff-slide-group-label">{chapterLabel(ch, locale)}</div>
              {slidesInChapter.map((slide) => {
                const idx = visibleSlideList.findIndex((s) => s.id === slide.id);
                const loc = localizeSlide(slide, locale, session.customer);
                const isActive = idx === slideIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    data-slide-active={isActive ? 'true' : 'false'}
                    className={`kickoff-slide-item ${isActive ? 'is-active' : ''} ${
                      idx < slideIndex ? 'is-past' : ''
                    }`}
                    onClick={() => goToSlide(idx)}
                  >
                    <span className="kickoff-slide-item-num">
                      {idx + 1}
                    </span>
                    <span className="kickoff-slide-item-title">{loc.headline}</span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </aside>

      <main className="kickoff-stage">
        {settingsOpen && (
          <div className="kickoff-settings-drawer">
            <div className="kickoff-settings-drawer-head">
              <strong>{isPresenter ? t('settings') : t('facilitatorSetup')}</strong>
              <button
                type="button"
                className="kickoff-icon-btn"
                onClick={() => setSettingsOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="kickoff-settings-grid">
              <label className="kickoff-settings-toggle-row">
                <input
                  type="checkbox"
                  checked={session.workshopCaptureEnabled}
                  onChange={(e) =>
                    setSession((s) => ({
                      ...s,
                      workshopCaptureEnabled: e.target.checked,
                    }))
                  }
                />
                <span>
                  {session.workshopCaptureEnabled
                    ? t('workshopCapture')
                    : t('workshopCaptureOff')}
                </span>
              </label>
              <p className="kickoff-settings-hint">{t('workshopCaptureHint')}</p>

              <label className="kickoff-settings-toggle-row">
                <input
                  type="checkbox"
                  checked={session.includeIntegrations}
                  onChange={(e) =>
                    setSession((s) => ({
                      ...s,
                      includeIntegrations: e.target.checked,
                    }))
                  }
                />
                <span>{t('includeIntegrationsShort')}</span>
              </label>
              <p className="kickoff-settings-hint">{t('includeIntegrationsHint')}</p>

              <label>
                <span>{t('customer')}</span>
                <input
                  className={fieldClass}
                  value={session.customer}
                  placeholder={t('customerPlaceholder')}
                  onChange={(e) =>
                    setSession((s) => ({ ...s, customer: e.target.value }))
                  }
                />
              </label>
              <label>
                <span>{t('linkLabel')}</span>
                <div className="flex flex-wrap gap-2 items-center">
                  <input
                    className={`${fieldClass} flex-1 min-w-[10rem]`}
                    value={session.linkLabel || ''}
                    placeholder={t('linkLabelPlaceholder')}
                    onChange={(e) =>
                      setSession((s) => ({ ...s, linkLabel: e.target.value }))
                    }
                  />
                  <button
                    type="button"
                    className="kickoff-btn-secondary text-sm shrink-0"
                    onClick={() =>
                      setSession((s) => ({
                        ...s,
                        linkLabel: suggestLinkLabelFromCustomer(s.customer) || s.linkLabel,
                      }))
                    }
                  >
                    {t('linkLabelSuggest')}
                  </button>
                </div>
                <p className="kickoff-settings-hint m-0 mt-1">
                  {t('linkLabelHint')}{' '}
                  <code className="text-[#7dffd4] text-xs">
                    https://{kickoffSubdomainPreviewHost(linkOpts)}/?s=…
                  </code>
                </p>
              </label>
              <label>
                <span>{t('facilitator')}</span>
                <input
                  className={fieldClass}
                  value={session.facilitator}
                  onChange={(e) =>
                    setSession((s) => ({ ...s, facilitator: e.target.value }))
                  }
                />
              </label>
              {!isPresenter && (
                <>
                  <div className="kickoff-settings-viz-block">
                    <p className="text-sm font-semibold text-white/85 m-0">
                      {t('modulesSettingsTitle')}
                    </p>
                    <p className="kickoff-settings-hint">{t('modulesSettingsHint')}</p>
                    <button
                      type="button"
                      className="kickoff-btn-secondary text-sm"
                      onClick={() =>
                        setSession((s) => ({
                          ...s,
                          vizConfig: applyTenantModulePreset(
                            s.tenantSlug || tenant?.slug
                          ),
                        }))
                      }
                    >
                      {t('modulesResetPreset')}
                    </button>
                  </div>

                  <label>
                    <span>{t('sessionId')}</span>
                    <input className={fieldClass} readOnly value={session.sessionId} />
                  </label>
                  <label>
                    <span>{t('passwordPlaceholder')}</span>
                    <input
                      type="password"
                      className={fieldClass}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </label>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                type="button"
                className="kickoff-btn-primary"
                onClick={persistCloud}
                disabled={syncing}
              >
                {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
                {syncing ? t('saving') : t('save')}
              </button>
              <button
                type="button"
                className="kickoff-btn-secondary"
                onClick={() => copyPresenterLink(true)}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {t('copyCustomerLink')}
              </button>
              {lastSaved && <span className="text-sm text-[#00a878] self-center">{t('saved')}</span>}
              {syncError && (
                <span className="text-sm text-amber-300 self-center">{syncError}</span>
              )}
            </div>
            {!isPresenter && (
              <div className="mt-6">
                <KickoffTenantLinksPanel
                  locale={locale}
                  session={session}
                  onSelectTenant={(tn) =>
                    setSession((s) => ({
                      ...s,
                      tenantSlug: tn.slug,
                      linkLabel: s.linkLabel || tn.subdomainSlug || '',
                      locale: tn.localeDefault,
                      includeIntegrations: tn.includeIntegrationsDefault,
                      vizConfig: applyTenantModulePreset(tn.slug),
                    }))
                  }
                />
              </div>
            )}
          </div>
        )}

        <div className="kickoff-slide-body">
          <div className="kickoff-slide-inner kickoff-slide-panel">
            <div className="kickoff-slide-header">
              <span className="kickoff-slide-kicker">
                {currentChapter ? chapterLabel(currentChapter, locale) : ''}
                {localizedCurrent && (
                  <>
                    {' · '}
                    <span
                      className={`kickoff-kind-badge kickoff-kind--${slideKindTheme(
                        currentSlide,
                        currentChapter
                      )}`}
                    >
                      {slideKindTheme(currentSlide, currentChapter) === 'workshop'
                        ? t('workshop')
                        : slideKindTheme(currentSlide, currentChapter) === 'integration'
                          ? locale === 'de'
                            ? 'Integration'
                            : 'Integration'
                          : t('theory')}
                    </span>
                  </>
                )}
              </span>
              <h2 className="kickoff-slide-headline">{localizedCurrent?.headline}</h2>
              {localizedCurrent?.subline && (
                <p className="kickoff-slide-subline">{localizedCurrent.subline}</p>
              )}
            </div>
            <SlideBody
              slide={localizedCurrent}
              rawSlide={currentSlide}
              answers={session.answers[currentSlide?.id] || {}}
              setAnswer={(patch) => currentSlide && setAnswer(currentSlide.id, patch)}
              locale={locale}
              captureEnabled={session.workshopCaptureEnabled}
              onEnableCapture={() =>
                setSession((s) => ({ ...s, workshopCaptureEnabled: true }))
              }
              vizConfig={normalizeVizConfig(
                session.vizConfig,
                session.tenantSlug || tenant
              )}
              onVizChange={setVizConfig}
              vizEditable={!isPresenter}
            />
          </div>
        </div>
      </main>

      <footer className="kickoff-footer">
        <div className="kickoff-footer-progress">
          <div className="kickoff-footer-bar">
            <div className="kickoff-footer-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span>
            {slideIndex + 1} / {visibleSlideList.length} · {progressPct}%
          </span>
        </div>
        <div className="kickoff-footer-nav">
          <button
            type="button"
            className="kickoff-btn-secondary kickoff-nav-btn"
            disabled={slideIndex <= 0}
            onClick={() => goToSlide(slideIndex - 1)}
          >
            <ChevronLeft className="w-5 h-5" />
            {t('prev')}
          </button>
          <button
            type="button"
            className="kickoff-btn-primary kickoff-nav-btn"
            disabled={slideIndex >= visibleSlideList.length - 1}
            onClick={() => goToSlide(slideIndex + 1)}
          >
            {t('next')}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <p className="kickoff-footer-brand">{t('poweredBy')}</p>
      </footer>
    </div>
  );
}
