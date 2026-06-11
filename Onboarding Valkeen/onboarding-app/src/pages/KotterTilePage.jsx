import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Circle,
  Copy,
  Import,
  Link2,
  Loader2,
  Map,
  RefreshCw,
  Save,
  Users,
} from 'lucide-react';

import '../styles/change-workshop.css';
import { KotterReflectionForm } from '../components/kotter/KotterReflectionForm';
import { getKotterItemBySlug, KOTTER_CATALOG_ITEMS } from '../data/kotterCatalogData';
import { useProgress } from '../hooks/useLocalStorage';
import { loadProgress, saveProgress } from '../services/awsService';
import {
  buildMirrorKotterFromFacilitatorProfile,
  buildProgressBlobWithKotter,
  kotterShareUserId,
  mergeGuestTileAnswersIntoProfileTileAnswers,
  KOTTER_MIRROR_PROFILE_ID,
} from '../utils/kotterShare';

function newProfileId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `kp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function buildKotterShareAbsoluteUrl(token) {
  try {
    const base = `${window.location.origin}${import.meta.env.BASE_URL}`;
    const root = base.endsWith('/') ? base : `${base}/`;
    return new URL(`kotter-share/${encodeURIComponent(String(token || '').trim())}/`, root).href;
  } catch {
    return `/onboarding/kotter-share/${encodeURIComponent(String(token || '').trim())}/`;
  }
}

export default function KotterTilePage({ kotterSlugOverride, embedInWorkshop = false }) {
  const { slug: slugParam } = useParams();
  const slug = kotterSlugOverride || slugParam;
  const navigate = useNavigate();
  const { progress, isLoading, isSyncing, lastSyncError, updateChangeWorkshopKotter } = useProgress();

  const catalogItem = slug ? getKotterItemBySlug(slug) : undefined;
  const kotter = progress.changeWorkshopKotter || { activeProfileId: null, profiles: {} };
  const { activeProfileId, profiles } = kotter;

  const activeProfile = activeProfileId ? profiles[activeProfileId] : null;

  const [inviteBusy, setInviteBusy] = useState(false);
  const [mirrorBusy, setMirrorBusy] = useState(false);
  const [mergeBusy, setMergeBusy] = useState(false);
  const [inviteHint, setInviteHint] = useState('');

  useEffect(() => {
    if (!inviteHint) return undefined;
    const t = window.setTimeout(() => setInviteHint(''), 4200);
    return () => window.clearTimeout(t);
  }, [inviteHint]);

  /** Erstes speicherbares Paket anlegen, falls noch leer */
  useEffect(() => {
    if (isLoading) return;
    updateChangeWorkshopKotter((cw) => {
      if (cw.activeProfileId && cw.profiles[cw.activeProfileId]) return cw;
      const id = newProfileId();
      return {
        activeProfileId: id,
        profiles: {
          ...cw.profiles,
          [id]: {
            id,
            customerLabel: '',
            tileAnswers: {},
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });
  }, [isLoading, updateChangeWorkshopKotter]);

  const saveTileDraft = useCallback(
    (tileSlug, answers) => {
      updateChangeWorkshopKotter((cw) => {
        const id = cw.activeProfileId;
        const prof = id ? cw.profiles[id] : null;
        if (!id || !prof) return cw;
        return {
          ...cw,
          profiles: {
            ...cw.profiles,
            [id]: {
              ...prof,
              tileAnswers: {
                ...prof.tileAnswers,
                [tileSlug]: answers,
              },
              updatedAt: new Date().toISOString(),
            },
          },
        };
      });
    },
    [updateChangeWorkshopKotter]
  );

  const persistCurrentTile = useCallback(
    (answers) => {
      if (!catalogItem) return;
      saveTileDraft(catalogItem.slug, answers);
    },
    [saveTileDraft, catalogItem]
  );

  const idx = useMemo(
    () => (catalogItem ? KOTTER_CATALOG_ITEMS.findIndex((x) => x.slug === catalogItem.slug) : -1),
    [catalogItem]
  );
  const prevItem = idx > 0 ? KOTTER_CATALOG_ITEMS[idx - 1] : null;
  const nextItem = idx >= 0 && idx < KOTTER_CATALOG_ITEMS.length - 1 ? KOTTER_CATALOG_ITEMS[idx + 1] : null;

  const addCustomerProfile = () => {
    const name = window.prompt(
      'Bezeichnung für das Kundenpaket (z. B. Mandant, Projektname, Workshop-Datum):',
      ''
    );
    if (name === null) return;
    const id = newProfileId();
    updateChangeWorkshopKotter((cw) => ({
      ...cw,
      activeProfileId: id,
      profiles: {
        ...cw.profiles,
        [id]: {
          id,
          customerLabel: name.trim(),
          tileAnswers: {},
          updatedAt: new Date().toISOString(),
        },
      },
    }));
  };

  const updateCustomerLabel = (label) => {
    if (!activeProfileId || !profiles[activeProfileId]) return;
    const id = activeProfileId;
    updateChangeWorkshopKotter((cw) => ({
      ...cw,
      profiles: {
        ...cw.profiles,
        [id]: {
          ...cw.profiles[id],
          customerLabel: label,
          updatedAt: new Date().toISOString(),
        },
      },
    }));
  };

  const pushMirrorToGuestSlot = useCallback(
    async (token) => {
      if (!activeProfile) throw new Error('Kein aktives Paket');
      const slice = buildMirrorKotterFromFacilitatorProfile(activeProfile);
      await saveProgress(buildProgressBlobWithKotter(slice), kotterShareUserId(token));
    },
    [activeProfile]
  );

  const createOrRotateInviteLink = useCallback(async () => {
    if (!activeProfileId || !activeProfile) return;
    setInviteBusy(true);
    try {
      const token = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : newProfileId();
      await pushMirrorToGuestSlot(token);
      updateChangeWorkshopKotter((cw) => {
        const id = cw.activeProfileId;
        const p = id ? cw.profiles[id] : null;
        if (!id || !p) return cw;
        return {
          ...cw,
          profiles: {
            ...cw.profiles,
            [id]: {
              ...p,
              inviteShareToken: token,
              inviteShareCreatedAt: new Date().toISOString(),
            },
          },
        };
      });
      const url = buildKotterShareAbsoluteUrl(token);
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setInviteHint('Link in die Zwischenablage kopiert. Ein neuer Link ersetzt den vorherigen für dieses Paket.');
      } else {
        window.prompt('Einladungslink (kopieren):', url);
      }
    } catch (e) {
      window.alert(e?.message || 'Speichern des Einladungslinks fehlgeschlagen.');
    } finally {
      setInviteBusy(false);
    }
  }, [activeProfile, activeProfileId, pushMirrorToGuestSlot, updateChangeWorkshopKotter]);

  const refreshMirrorKeepingToken = useCallback(async () => {
    const tok = activeProfile?.inviteShareToken?.trim();
    if (!tok) {
      window.alert('Zuerst einen Einladungslink erzeugen.');
      return;
    }
    setMirrorBusy(true);
    try {
      await pushMirrorToGuestSlot(tok);
      setInviteHint('Aktueller Moderationsstand wurde in den Kunden-Link gespiegelt.');
    } catch (e) {
      window.alert(e?.message || 'Spiegeln fehlgeschlagen.');
    } finally {
      setMirrorBusy(false);
    }
  }, [activeProfile?.inviteShareToken, pushMirrorToGuestSlot]);

  const copyInviteLinkOnly = useCallback(async () => {
    const tok = activeProfile?.inviteShareToken?.trim();
    if (!tok) return;
    const url = buildKotterShareAbsoluteUrl(tok);
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
      else window.prompt('Link:', url);
      setInviteHint('Link erneut in die Zwischenablage kopiert.');
    } catch {
      window.prompt('Link:', url);
    }
  }, [activeProfile?.inviteShareToken]);

  const absorbGuestAnswers = useCallback(async () => {
    const tok = activeProfile?.inviteShareToken?.trim();
    if (!tok || !activeProfileId || !activeProfile) {
      window.alert('Es liegt kein Einladungslink zu diesem Paket vor.');
      return;
    }
    setMergeBusy(true);
    try {
      const blob = await loadProgress(kotterShareUserId(tok));
      const guestProf = blob?.changeWorkshopKotter?.profiles?.[KOTTER_MIRROR_PROFILE_ID];
      const guestTiles = guestProf?.tileAnswers;
      const merged = mergeGuestTileAnswersIntoProfileTileAnswers(activeProfile.tileAnswers, guestTiles);
      updateChangeWorkshopKotter((cw) => {
        const id = activeProfileId;
        const prof = cw.profiles[id];
        if (!prof) return cw;
        return {
          ...cw,
          profiles: {
            ...cw.profiles,
            [id]: {
              ...prof,
              tileAnswers: merged,
              guestAnswersMergedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        };
      });
      setInviteHint('Antworten aus dem Kunden-Link wurden in dieses Paket eingemischt.');
    } catch (e) {
      window.alert(e?.message || 'Einlesen fehlgeschlagen.');
    } finally {
      setMergeBusy(false);
    }
  }, [activeProfile, activeProfileId, updateChangeWorkshopKotter]);

  if (!slug || !catalogItem) {
    return (
      <div className="cw-workshop min-h-screen cw-kotter-page">
        <div className="cw-container py-10">
          <p className="text-slate-600">Unbekannte Kachel.</p>
          <Link className="cw-participant-banner-link mt-4 inline-block" to="/change-workflow">
            Zurück zum Workshop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cw-workshop min-h-screen relative">
      <div className="cw-workshop-page-bg" aria-hidden />
      <div className="cw-workshop-page-overlay" aria-hidden />

      <header className="cw-wh-header border-b border-slate-200/80">
        <div className="cw-container cw-wh-top flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-3">
          <div className="flex flex-wrap items-center gap-3">
            {!embedInWorkshop && (
              <button
                type="button"
                onClick={() => navigate('/change-workflow')}
                className="cw-btn cw-btn-ghost cw-btn-compact inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden />
                Workshop
              </button>
            )}
            <span className="cw-kicker">Kotter · Prüfkatalog</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            {isSyncing && (
              <span className="inline-flex items-center gap-1.5" title="Synchronisation mit AWS">
                <Loader2 className="w-4 h-4 animate-spin text-violet-600" aria-hidden />
                Speichern…
              </span>
            )}
            {!isSyncing && !lastSyncError && (
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <Save className="w-4 h-4" aria-hidden />
                Änderungen mit Cloud synchronisiert (verzögert bis ca. 2 s)
              </span>
            )}
            {lastSyncError && (
              <span className="text-amber-800" role="status">
                {lastSyncError} — lokale Kopie liegt im Browser weiter vor.
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="cw-container py-8 max-w-3xl">
        <div className="cw-card cw-kotter-profile-card space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" aria-hidden />
            <div className="min-w-0 flex-1 space-y-3">
              <p className="cw-callout-heading m-0">Kundenpaket (ein Paket pro Kunde / Projekt)</p>
              <p className="cw-protocol-lead m-0 text-sm">
                Alle acht Kotter‑Kacheln schreiben in dasselbe Paket. Es wird im Onboarding‑Fortschritt (AWS)
                gespeichert — inklusive im Workshop‑PDF, sobald ihr dort exportiert.
              </p>
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-end">
                <label className="flex flex-col gap-1 min-w-[12rem] flex-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Aktives Paket
                  </span>
                  <select
                    className="cw-input-text cw-wh-session-input"
                    value={activeProfileId || ''}
                    onChange={(e) =>
                      updateChangeWorkshopKotter((cw) => ({
                        ...cw,
                        activeProfileId: e.target.value || null,
                      }))
                    }
                    disabled={isLoading}
                  >
                    {Object.keys(profiles).length === 0 ? (
                      <option value="">—</option>
                    ) : (
                      Object.values(profiles).map((p) => (
                        <option key={p.id} value={p.id}>
                          {(p.customerLabel || 'Ohne Bezeichnung').slice(0, 80)}
                        </option>
                      ))
                    )}
                  </select>
                </label>
                <button
                  type="button"
                  className="cw-btn cw-btn-accent-outline cw-btn-compact"
                  onClick={addCustomerProfile}
                  disabled={isLoading}
                >
                  Neues Paket
                </button>
              </div>
              {activeProfile && (
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Bezeichnung bearbeiten
                  </span>
                  <input
                    type="text"
                    className="cw-input-text cw-wh-session-input"
                    value={activeProfile.customerLabel || ''}
                    onChange={(e) => updateCustomerLabel(e.target.value)}
                    placeholder="z. B. «Werk Süd · Roadmap 2026»"
                  />
                </label>
              )}
              {activeProfile && (
                <div className="rounded-xl border border-violet-200/70 bg-gradient-to-br from-violet-50/60 to-white p-4 space-y-3">
                  <p className="m-0 cw-callout-heading text-sm flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-violet-600 shrink-0" aria-hidden />
                    Kunden-Link ohne Admin-Login
                  </p>
                  <p className="m-0 text-xs text-slate-600 leading-relaxed">
                    Erzeugt einen geheimen Link. Kund:innen füllen dieselben Kotter-Kacheln; die Antworten liegen unter
                    eigenem Speicherschlüssel. «Aktuellen Stand spiegeln» überschreibt nur den Kunden-Spiegel —
                    «Antworten einlesen» ergänzt später die Kundeneinträge hier im Paket pro Frage (Überschreiben
                    nur, wenn dieselbe Frage erneut ausgefüllt wurde).
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="cw-btn cw-btn-primary-solid cw-btn-compact inline-flex items-center gap-2"
                      onClick={createOrRotateInviteLink}
                      disabled={inviteBusy || mirrorBusy || mergeBusy || isLoading}
                    >
                      {inviteBusy ? (
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                      ) : (
                        <Link2 className="w-4 h-4" aria-hidden />
                      )}
                      Neuen Einladungslink
                    </button>
                    <button
                      type="button"
                      className="cw-btn cw-btn-accent-outline cw-btn-compact inline-flex items-center gap-2"
                      onClick={refreshMirrorKeepingToken}
                      disabled={
                        !activeProfile.inviteShareToken || mirrorBusy || inviteBusy || mergeBusy || isLoading
                      }
                      title="Schreibt den jetzigen Moderationsstand erneut in den bestehenden Link"
                    >
                      {mirrorBusy ? (
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                      ) : (
                        <RefreshCw className="w-4 h-4" aria-hidden />
                      )}
                      Stand spiegeln
                    </button>
                    <button
                      type="button"
                      className="cw-btn cw-btn-ghost cw-btn-compact inline-flex items-center gap-2"
                      onClick={() => void copyInviteLinkOnly()}
                      disabled={!activeProfile.inviteShareToken || inviteBusy || mirrorBusy || mergeBusy || isLoading}
                    >
                      <Copy className="w-4 h-4" aria-hidden />
                      Link kopieren
                    </button>
                    <button
                      type="button"
                      className="cw-btn cw-btn-accent-fill cw-btn-compact inline-flex items-center gap-2"
                      onClick={() => void absorbGuestAnswers()}
                      disabled={
                        !activeProfile.inviteShareToken || mergeBusy || inviteBusy || mirrorBusy || isLoading
                      }
                    >
                      {mergeBusy ? (
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                      ) : (
                        <Import className="w-4 h-4" aria-hidden />
                      )}
                      Antworten einlesen
                    </button>
                  </div>
                  {activeProfile.inviteShareToken ? (
                    <p className="text-[11px] text-slate-600 break-all font-mono leading-snug m-0">
                      {buildKotterShareAbsoluteUrl(activeProfile.inviteShareToken)}
                    </p>
                  ) : null}
                  {inviteHint ? (
                    <p role="status" className="text-xs text-emerald-800 m-0">
                      {inviteHint}
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
              <Map className="w-3.5 h-3.5" aria-hidden />
              Kotter-Fortschritt
            </span>
            <Link to="/change-workflow/journey" className="text-xs text-violet-600 hover:underline">
              → Change Journey
            </Link>
          </div>
          <div className="flex gap-1">
            {KOTTER_CATALOG_ITEMS.map((item) => {
              const tileData = activeProfile?.tileAnswers?.[item.slug];
              const status = tileData?._status || 'open';
              const hasContent = item.prompts.some((p) => (tileData?.[p.key] || '').trim().length > 0);
              const isCurrent = item.slug === catalogItem.slug;
              return (
                <Link
                  key={item.slug}
                  to={`/change-workflow/kotter/${item.slug}`}
                  title={`${item.order}. ${item.label}${status === 'done' ? ' ✓' : status === 'in_progress' ? ' (in Bearbeitung)' : ''}`}
                  className={`flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent
                      ? 'ring-2 ring-violet-500 ring-offset-1'
                      : ''
                  } ${
                    status === 'done'
                      ? 'bg-emerald-100 text-emerald-700'
                      : status === 'in_progress'
                      ? 'bg-amber-100 text-amber-700'
                      : hasContent
                      ? 'bg-violet-100 text-violet-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {status === 'done' ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : (
                    item.order
                  )}
                </Link>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-slate-500">
            <span>
              {KOTTER_CATALOG_ITEMS.filter((item) => activeProfile?.tileAnswers?.[item.slug]?._status === 'done').length}/8 abgeschlossen
            </span>
            <span>
              {KOTTER_CATALOG_ITEMS.filter((item) => {
                const ta = activeProfile?.tileAnswers?.[item.slug];
                return item.prompts.some((p) => (ta?.[p.key] || '').trim().length > 0);
              }).length}/8 bearbeitet
            </span>
          </div>
        </div>

        <p className="cw-eyebrow-accent mb-2">{catalogItem.kotterChapter}</p>
        <h1 className="cw-phase-title mb-2">{catalogItem.label}</h1>
        <p className="cw-phase-meta mb-6">{catalogItem.description}</p>

        <div className="cw-callout-accent mb-8">
          <p className="cw-callout-heading">Moderationsimpuls</p>
          <p className="cw-callout-body m-0">{catalogItem.moderationHint}</p>
        </div>

        <KotterReflectionForm
          key={`${activeProfile?.id}-${catalogItem.slug}`}
          catalogItem={catalogItem}
          idPrefix="kotter-mod"
          initial={activeProfile?.tileAnswers?.[catalogItem.slug] || {}}
          disabled={isLoading || !activeProfile}
          onPersist={persistCurrentTile}
        />

        <nav className="flex flex-wrap justify-between gap-3 mt-10 pt-6 border-t border-slate-200" aria-label="Kotter-Kacheln">
          {prevItem ? (
            <Link
              to={`/change-workflow/kotter/${prevItem.slug}`}
              className="cw-btn cw-btn-ghost cw-btn-compact inline-flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden />
              {prevItem.order}. {prevItem.label}
            </Link>
          ) : (
            <span />
          )}
          {nextItem ? (
            <Link
              to={`/change-workflow/kotter/${nextItem.slug}`}
              className="cw-btn cw-btn-primary-solid cw-btn-compact inline-flex items-center gap-2"
            >
              {nextItem.order}. {nextItem.label}
              <ChevronRight className="w-4 h-4" aria-hidden />
            </Link>
          ) : (
            <Link to="/change-workflow" className="cw-btn cw-btn-accent-fill cw-btn-compact">
              Zurück zum Workshop
            </Link>
          )}
        </nav>
      </main>
    </div>
  );
}
