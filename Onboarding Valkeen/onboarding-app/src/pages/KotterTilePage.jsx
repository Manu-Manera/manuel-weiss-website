import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Save, Users } from 'lucide-react';

import '../styles/change-workshop.css';
import { getKotterItemBySlug, KOTTER_CATALOG_ITEMS } from '../data/kotterCatalogData';
import { useProgress } from '../hooks/useLocalStorage';

function newProfileId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `kp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function KotterReflectionForm({ catalogItem, initial, disabled, onPersist }) {
  const [draft, setDraft] = useState(() => ({ ...initial }));

  useEffect(() => {
    const t = window.setTimeout(() => {
      onPersist(draft);
    }, 650);
    return () => window.clearTimeout(t);
  }, [draft, catalogItem.slug, onPersist]);

  return (
    <fieldset disabled={disabled} className="space-y-6 border-0 p-0 m-0">
      <legend className="sr-only">Reflexionsfragen</legend>
      {catalogItem.prompts.map((p) => (
        <div key={p.key} className="cw-card-subtle space-y-2">
          <label className="block" htmlFor={`kotter-${catalogItem.slug}-${p.key}`}>
            <span className="font-semibold text-slate-800 text-sm leading-snug">{p.question}</span>
          </label>
          <textarea
            id={`kotter-${catalogItem.slug}-${p.key}`}
            rows={4}
            className="cw-textarea min-h-0"
            placeholder={p.placeholder || 'Antworten …'}
            value={draft[p.key] ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, [p.key]: e.target.value }))}
          />
        </div>
      ))}
    </fieldset>
  );
}

export default function KotterTilePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { progress, isLoading, isSyncing, lastSyncError, updateChangeWorkshopKotter } = useProgress();

  const catalogItem = slug ? getKotterItemBySlug(slug) : undefined;
  const kotter = progress.changeWorkshopKotter || { activeProfileId: null, profiles: {} };
  const { activeProfileId, profiles } = kotter;

  const activeProfile = activeProfileId ? profiles[activeProfileId] : null;

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
            <button
              type="button"
              onClick={() => navigate('/change-workflow')}
              className="cw-btn cw-btn-ghost cw-btn-compact inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden />
              Workshop
            </button>
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
            </div>
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
