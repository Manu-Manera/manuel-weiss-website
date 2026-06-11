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
  Eye,
  EyeOff,
  Plus,
  Pencil,
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
} from './kickoffStudioCatalog';
import {
  defaultCustomSlide,
  getPresentationSlideList,
  getRailSlideList,
  isSlideHidden,
  toggleSlideHidden,
} from './kickoffDeckState';
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
  EDIT_PASSWORD_STORAGE_KEY,
  fetchCloudSession,
  loadLocalSession,
  newSessionId,
  requestGammaExport,
  requestGammaValkeenMaster,
  resolveEditPassword,
  saveCloudSession,
  saveLocalSession,
} from './kickoffStudioService';
import { slugifyLinkLabel, suggestLinkLabelFromCustomer } from './kickoffLinkLabel';
import {
  kickoffCustomerOpenHref,
  kickoffCustomerShareHref,
  kickoffPresenterFallbackHref,
  kickoffSubdomainPreviewHost,
} from './kickoffTenantUrls';
import { getTenantByHost, getTenantBySlug, parseKickoffShortHost } from './kickoffTenants';
import KickoffTenantLinksPanel from './KickoffTenantLinksPanel';
import SlideBody from './SlideBody';
import KickoffSlideEditor from './KickoffSlideEditor';
import KickoffSlideDesignPanel from './KickoffSlideDesignPanel';
import { hintForSlide } from './kickoffSlideDesignHints';
import KickoffPrepAdminPanel from './KickoffPrepAdminPanel';

const fieldClass = 'kickoff-input';

function sessionFromSearchParams(searchParams, tenant, hostContext = null) {
  const hostOnly = !!(hostContext?.linkLabel || hostContext?.tenant);
  const sid =
    searchParams.get('s') || searchParams.get('session') || newSessionId();
  const tenantSlug = hostOnly
    ? tenant?.slug || hostContext?.tenant?.slug || ''
    : searchParams.get('tenant') || tenant?.slug || '';
  const base = defaultSession(sid, tenantSlug || tenant);
  const linkLabel =
    hostContext?.linkLabel ||
    searchParams.get('label') ||
    slugifyLinkLabel(searchParams.get('kurz')) ||
    '';
  return {
    ...base,
    customer:
      searchParams.get('c') ||
      searchParams.get('customer') ||
      (hostOnly ? tenant?.customer || hostContext?.tenant?.customer : '') ||
      base.customer,
    locale: searchParams.get('locale') || tenant?.localeDefault || base.locale,
    includeIntegrations:
      searchParams.get('integrations') === '1'
        ? true
        : searchParams.get('integrations') === '0'
          ? false
          : hostOnly
            ? (tenant?.includeIntegrationsDefault ??
              hostContext?.tenant?.includeIntegrationsDefault ??
              base.includeIntegrations)
            : base.includeIntegrations,
    tenantSlug: hostOnly ? tenant?.slug || hostContext?.tenant?.slug || '' : tenantSlug,
    linkLabel: linkLabel || base.linkLabel,
    workshopCaptureEnabled: searchParams.get('capture') === '1',
  };
}

export default function KickoffStudioCore({
  viewMode = 'facilitator',
  tenantSlug: tenantSlugProp,
  linkLabel: linkLabelProp = '',
}) {
  const [searchParams] = useSearchParams();
  const hostContext = useMemo(
    () => parseKickoffShortHost(window.location.hostname),
    []
  );
  const legacyHostTenant = useMemo(() => getTenantByHost(window.location.hostname), []);
  const hostTenant = hostContext.tenant || legacyHostTenant;
  const pathTenant = getTenantBySlug(tenantSlugProp);
  const pathLinkLabel =
    linkLabelProp ||
    (!pathTenant && tenantSlugProp ? slugifyLinkLabel(tenantSlugProp) || tenantSlugProp : '');
  const routeTenant = useMemo(
    () =>
      pathTenant ||
      getTenantBySlug(tenantSlugProp) ||
      getTenantBySlug(searchParams.get('tenant')),
    [tenantSlugProp, searchParams]
  );
  const tenant = routeTenant || hostTenant;
  const resolvedHostContext = useMemo(
    () => ({
      tenant: hostContext.tenant || tenant,
      linkLabel: hostContext.linkLabel || pathLinkLabel,
    }),
    [hostContext, tenant, pathLinkLabel]
  );
  const isPresenter = viewMode === 'presenter';

  const [session, setSession] = useState(() =>
    mergeSession(
      sessionFromSearchParams(searchParams, tenant, resolvedHostContext),
      tenant
    )
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
  const [slideEditor, setSlideEditor] = useState({ open: false, initial: null, isNew: false });

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

  const railSlideList = useMemo(
    () => getRailSlideList(deckSlides, session),
    [deckSlides, session]
  );

  const navSlideList = useMemo(
    () =>
      isPresenter
        ? getPresentationSlideList(deckSlides, session)
        : railSlideList,
    [deckSlides, session, isPresenter, railSlideList]
  );

  const slideRailRef = useRef(null);
  const activeSlideIdRef = useRef(navSlideList[0]?.id);

  const currentSlide = navSlideList[slideIndex];
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
      if (!navSlideList.length) return;
      const i = Math.max(0, Math.min(index, navSlideList.length - 1));
      setSlideIndex(i);
      activeSlideIdRef.current = navSlideList[i]?.id;
    },
    [navSlideList]
  );

  const goToSlideId = useCallback(
    (slideId) => {
      const idx = navSlideList.findIndex((s) => s.id === slideId);
      if (idx >= 0) goToSlide(idx);
    },
    [navSlideList, goToSlide]
  );

  useEffect(() => {
    if (!navSlideList.length) return;
    const id = activeSlideIdRef.current;
    const idx = id ? navSlideList.findIndex((s) => s.id === id) : -1;
    if (idx >= 0 && idx !== slideIndex) {
      setSlideIndex(idx);
    } else if (slideIndex >= navSlideList.length) {
      setSlideIndex(navSlideList.length - 1);
    }
  }, [navSlideList, session.includeIntegrations, session.hiddenSlideIds, session.customSlides]);

  useEffect(() => {
    activeSlideIdRef.current = navSlideList[slideIndex]?.id;
    const el = slideRailRef.current?.querySelector('[data-slide-active="true"]');
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [slideIndex, navSlideList]);

  const railGroups = useMemo(() => {
    const used = new Set();
    const groups = chapters
      .map((ch) => {
        const slides = ch.slideIds
          .map((id) => railSlideList.find((s) => s.id === id))
          .filter(Boolean);
        slides.forEach((s) => used.add(s.id));
        return { ch, slides };
      })
      .filter((g) => g.slides.length);
    const orphan = railSlideList.filter((s) => !used.has(s.id));
    if (orphan.length) {
      groups.push({
        ch: { id: 'extra', section: 'core' },
        slides: orphan,
        isExtra: true,
      });
    }
    return groups;
  }, [chapters, railSlideList]);

  const persistSlideDraft = useCallback((draft) => {
    setSession((s) => {
      if (draft._source === 'custom' || String(draft.id).startsWith('custom-')) {
        const custom = [...(s.customSlides || [])];
        const idx = custom.findIndex((c) => c.id === draft.id);
        const { _source, ...rest } = draft;
        if (idx >= 0) custom[idx] = rest;
        else custom.push(rest);
        return { ...s, customSlides: custom };
      }
      const { id, _source, ...patch } = draft;
      return {
        ...s,
        slideOverrides: {
          ...(s.slideOverrides || {}),
          [id]: { ...(s.slideOverrides?.[id] || {}), ...patch },
        },
      };
    });
    setSlideEditor({ open: false, initial: null, isNew: false });
  }, []);

  const applyCardsToCurrent = useCallback(() => {
    if (!currentSlide) return;
    const patch = { designStyle: 'cards' };
    if (currentSlide._source === 'custom') {
      setSession((s) => ({
        ...s,
        customSlides: (s.customSlides || []).map((c) =>
          c.id === currentSlide.id ? { ...c, ...patch } : c
        ),
      }));
    } else {
      setSession((s) => ({
        ...s,
        slideOverrides: {
          ...(s.slideOverrides || {}),
          [currentSlide.id]: { ...(s.slideOverrides?.[currentSlide.id] || {}), ...patch },
        },
      }));
    }
  }, [currentSlide]);

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
      const pw = resolveEditPassword(password);
      await saveCloudSession(session, pw);
      setLastSaved(Date.now());
      try {
        const trimmed = String(password || '').trim();
        if (trimmed) localStorage.setItem(EDIT_PASSWORD_STORAGE_KEY, trimmed);
        else localStorage.removeItem(EDIT_PASSWORD_STORAGE_KEY);
      } catch {
        /* ignore */
      }
    } catch (e) {
      const msg = e.message || '';
      setSyncError(
        msg.includes('Invalid password') ? t('passwordInvalidHint') : msg || t('cloudError')
      );
    } finally {
      setSyncing(false);
    }
  };

  const runGamma = async () => {
    setGammaLoading(true);
    setGammaError('');
    setGammaUrl('');
    try {
      const pw = resolveEditPassword(password);
      const exportDeck = buildExportDeck(session);
      const res = await requestGammaExport({ ...session, exportDeck }, pw);
      if (res.gammaUrl) setGammaUrl(res.gammaUrl);
      else if (res.error) setGammaError(res.error);
    } catch (e) {
      const msg = e.message || '';
      setGammaError(
        msg.includes('Load failed') || msg.includes('Failed to fetch')
          ? t('gammaLoadFailed')
          : msg || t('gammaUnavailable')
      );
    } finally {
      setGammaLoading(false);
    }
  };

  const runGammaValkeenMaster = async (mode = 'workshop') => {
    setGammaLoading(true);
    setGammaError('');
    setGammaUrl('');
    try {
      const pw = resolveEditPassword(password);
      const exportDeck = buildExportDeck(session);
      const res = await requestGammaValkeenMaster(
        {
          mode,
          locale: session.locale,
          customer: session.customer,
          exportDeck: mode === 'workshop' ? exportDeck : undefined,
        },
        pw
      );
      if (res.gammaUrl) setGammaUrl(res.gammaUrl);
      else if (res.error) setGammaError(res.error);
    } catch (e) {
      const msg = e.message || '';
      setGammaError(
        msg.includes('Load failed') || msg.includes('Failed to fetch')
          ? t('gammaLoadFailed')
          : msg || t('gammaUnavailable')
      );
    } finally {
      setGammaLoading(false);
    }
  };

  const exportPdf = () => {
    exportKickoffPdf(buildExportDeck(session), locale);
  };

  const linkOpts = {
    tenantSlug: session.tenantSlug || tenant?.slug,
    linkLabel: session.linkLabel || suggestLinkLabelFromCustomer(session.customer),
    sessionId: session.sessionId,
    customer: session.customer,
    locale: session.locale,
    includeIntegrations: session.includeIntegrations,
    workshopCaptureEnabled: session.workshopCaptureEnabled,
  };

  const copyPresenterLink = (useShortSubdomain = true) => {
    const href = useShortSubdomain
      ? kickoffCustomerShareHref(linkOpts)
      : kickoffPresenterFallbackHref(linkOpts);
    navigator.clipboard.writeText(href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const progressPct =
    navSlideList.length > 0
      ? Math.round(((slideIndex + 1) / navSlideList.length) * 100)
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
                title={t('exportGammaHint')}
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
              <button
                type="button"
                className="kickoff-btn-secondary"
                onClick={() => runGammaValkeenMaster('workshop')}
                disabled={gammaLoading}
                title={t('exportGammaValkeenWorkshopHint')}
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden lg:inline">{t('exportGammaValkeenWorkshop')}</span>
              </button>
              <button
                type="button"
                className="kickoff-btn-secondary kickoff-btn-secondary--compact"
                onClick={() => runGammaValkeenMaster('full')}
                disabled={gammaLoading}
                title={t('exportGammaValkeenFullHint')}
              >
                <span className="hidden xl:inline">{t('exportGammaValkeenFull')}</span>
                <span className="xl:hidden">121</span>
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
              href={kickoffCustomerOpenHref({
                sessionId: session.sessionId,
                customer: session.customer,
                locale: session.locale,
                includeIntegrations: session.includeIntegrations,
                tenantSlug: session.tenantSlug,
                linkLabel: session.linkLabel || suggestLinkLabelFromCustomer(session.customer),
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
        {railGroups.map(({ ch, slides, isExtra }) => {
          const displaySlides = isPresenter
            ? slides.filter((s) => !isSlideHidden(session, s.id))
            : slides;
          if (!displaySlides.length) return null;
          return (
            <div
              key={ch.id}
              className={`kickoff-slide-group ${isExtra ? 'kickoff-slide-group--extra' : chapterThemeClass(ch)}`}
            >
              <div className="kickoff-slide-group-label">
                {isExtra ? t('slideChapterExtra') : chapterLabel(ch, locale)}
              </div>
              {displaySlides.map((slide) => {
                const idx = navSlideList.findIndex((s) => s.id === slide.id);
                const loc = localizeSlide(slide, locale, session.customer);
                const isActive = idx === slideIndex;
                const hidden = isSlideHidden(session, slide.id);
                return (
                  <div
                    key={slide.id}
                    className={`kickoff-slide-item-wrap ${hidden ? 'is-hidden-slide' : ''}`}
                  >
                    <button
                      type="button"
                      data-slide-active={isActive ? 'true' : 'false'}
                      className={`kickoff-slide-item ${isActive ? 'is-active' : ''} ${
                        idx >= 0 && idx < slideIndex ? 'is-past' : ''
                      }`}
                      onClick={() => (idx >= 0 ? goToSlide(idx) : goToSlideId(slide.id))}
                    >
                      <span className="kickoff-slide-item-num">{idx >= 0 ? idx + 1 : '·'}</span>
                      <span className="kickoff-slide-item-title">{loc.headline}</span>
                      {slide._source === 'custom' && (
                        <span className="kickoff-slide-item-badge">{t('slideCustomBadge')}</span>
                      )}
                    </button>
                    {!isPresenter && (
                      <div className="kickoff-slide-item-tools">
                        <button
                          type="button"
                          className="kickoff-icon-btn kickoff-icon-btn--sm"
                          title={hidden ? t('slideShow') : t('slideHide')}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSession((s) => ({
                              ...s,
                              hiddenSlideIds: toggleSlideHidden(s, slide.id),
                            }));
                          }}
                        >
                          {hidden ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          className="kickoff-icon-btn kickoff-icon-btn--sm"
                          title={t('slideEditorEdit')}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSlideEditor({
                              open: true,
                              initial: { ...slide },
                              isNew: false,
                            });
                          }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
        {!isPresenter && (
          <button
            type="button"
            className="kickoff-slide-add"
            onClick={() =>
              setSlideEditor({
                open: true,
                initial: defaultCustomSlide(currentSlide?.id),
                isNew: true,
              })
            }
          >
            <Plus className="w-4 h-4" />
            {t('slideAdd')}
          </button>
        )}
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
                      placeholder={t('passwordHint')}
                    />
                    <p className="kickoff-settings-hint m-0 mt-1">{t('passwordHint')}</p>
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
                {t('copySubdomainLink')}
              </button>
              {lastSaved && <span className="text-sm text-[#00a878] self-center">{t('saved')}</span>}
              {syncError && (
                <span className="text-sm text-amber-300 self-center">{syncError}</span>
              )}
            </div>
            {!isPresenter && (
              <>
                <KickoffPrepAdminPanel
                  session={session}
                  locale={locale}
                  editPassword={password}
                  onSessionUpdate={(patch) => setSession((s) => ({ ...s, ...patch }))}
                />
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
              </>
            )}
          </div>
        )}

        <div className={`kickoff-slide-body ${!isPresenter ? 'kickoff-slide-body--with-design' : ''}`}>
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
          {!isPresenter && currentSlide && hintForSlide(currentSlide.id, locale) && (
            <KickoffSlideDesignPanel
              slide={localizedCurrent || currentSlide}
              locale={locale}
              customer={session.customer}
              password={password}
              onApplyCards={applyCardsToCurrent}
              onGammaUrl={setGammaUrl}
            />
          )}
        </div>
      </main>

      <KickoffSlideEditor
        open={slideEditor.open}
        locale={locale}
        initial={slideEditor.initial}
        isNew={slideEditor.isNew}
        onSave={persistSlideDraft}
        onClose={() => setSlideEditor({ open: false, initial: null, isNew: false })}
      />

      <footer className="kickoff-footer">
        <div className="kickoff-footer-progress">
          <div className="kickoff-footer-bar">
            <div className="kickoff-footer-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span>
            {slideIndex + 1} / {navSlideList.length} · {progressPct}%
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
            disabled={slideIndex >= navSlideList.length - 1}
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
