import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useImplPortal } from './useImplPermissions';
import { useImplementationPortal } from '../context/ImplementationPortalContext';

/** Session-Query für alle Implementation-Links (?s= & portal). */
export function buildSessionQuery(sessionId, { portalMode = false, extra = {} } = {}) {
  const p = new URLSearchParams();
  if (sessionId) p.set('s', sessionId);
  if (portalMode) p.set('portal', '1');
  for (const [k, v] of Object.entries(extra)) {
    if (v != null && v !== '') p.set(k, String(v));
  }
  const qs = p.toString();
  return qs ? `?${qs}` : '';
}

export function buildHubHref(sessionId, opts = {}) {
  const base = opts.portalMode ? '/implementation-studio' : '/implementation-studio';
  return `${base}${buildSessionQuery(sessionId, {
    portalMode: opts.portalMode,
    extra: opts.highlightStep ? { highlight: opts.highlightStep } : {},
  })}`;
}

export function buildWorkshopHref(artifactId, sessionId, opts = {}) {
  return `/implementation/w/${encodeURIComponent(artifactId)}${buildSessionQuery(sessionId, {
    portalMode: opts.portalMode,
    extra: { from: opts.from || artifactId },
  })}`;
}

export function buildMeetingHref(meetingId, sessionId, opts = {}) {
  return `/implementation/m/${encodeURIComponent(meetingId)}${buildSessionQuery(sessionId, {
    portalMode: opts.portalMode,
  })}`;
}

export function buildPageHref(path, sessionId, opts = {}) {
  const base = path.split('?')[0];
  const existing = path.includes('?') ? new URLSearchParams(path.split('?')[1]) : new URLSearchParams();
  if (sessionId) existing.set('s', sessionId);
  if (opts.portalMode) existing.set('portal', '1');
  if (opts.from) existing.set('from', opts.from);
  const qs = existing.toString();
  return qs ? `${base}?${qs}` : base;
}

export function useImplementationNav() {
  const [searchParams] = useSearchParams();
  const portalFromHost = useImplPortal();
  const { portalMode: portalFromCtx, sessionId: portalSessionId } = useImplementationPortal();

  const sessionId =
    searchParams.get('s') || searchParams.get('session') || portalSessionId || '';
  const portalMode = portalFromCtx || portalFromHost;
  const fromStep = searchParams.get('from') || searchParams.get('highlight') || '';

  return useMemo(
    () => ({
      sessionId,
      portalMode,
      fromStep,
      hubHref: () => buildHubHref(sessionId, { portalMode, highlightStep: fromStep }),
      workshopHref: (artifactId, extra = {}) =>
        buildWorkshopHref(artifactId, sessionId, { portalMode, from: extra.from || artifactId }),
      meetingHref: (meetingId) => buildMeetingHref(meetingId, sessionId, { portalMode }),
      pageHref: (path, extra = {}) =>
        buildPageHref(path, sessionId, { portalMode, from: extra.from }),
      queryString: buildSessionQuery(sessionId, { portalMode }),
    }),
    [sessionId, portalMode, fromStep]
  );
}
