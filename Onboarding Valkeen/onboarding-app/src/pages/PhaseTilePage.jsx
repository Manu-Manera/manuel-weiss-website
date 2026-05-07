import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Map,
  Save,
  Users,
} from 'lucide-react';

import '../styles/change-workshop.css';
import { KotterReflectionForm } from '../components/kotter/KotterReflectionForm';
import { getWorkshopPhaseById, WORKSHOP_PHASE_CATALOG } from '../data/workshopPhaseCatalog';
import { useProgress } from '../hooks/useLocalStorage';

function newProfileId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `kp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export default function PhaseTilePage() {
  const { phaseId } = useParams();
  const navigate = useNavigate();
  const { progress, isLoading, isSyncing, lastSyncError, updateChangeWorkshopKotter } = useProgress();

  const phaseItem = phaseId ? getWorkshopPhaseById(phaseId) : undefined;
  const kotter = progress.changeWorkshopKotter || { activeProfileId: null, profiles: {} };
  const { activeProfileId, profiles } = kotter;
  const activeProfile = activeProfileId ? profiles[activeProfileId] : null;

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
            phaseAnswers: {},
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });
  }, [isLoading, updateChangeWorkshopKotter]);

  const savePhaseDraft = useCallback(
    (pId, answers) => {
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
              phaseAnswers: {
                ...(prof.phaseAnswers || {}),
                [pId]: answers,
              },
              updatedAt: new Date().toISOString(),
            },
          },
        };
      });
    },
    [updateChangeWorkshopKotter]
  );

  const persistCurrentPhase = useCallback(
    (answers) => {
      if (!phaseItem) return;
      savePhaseDraft(phaseItem.id, answers);
    },
    [savePhaseDraft, phaseItem]
  );

  const idx = useMemo(
    () => (phaseItem ? WORKSHOP_PHASE_CATALOG.findIndex((x) => x.id === phaseItem.id) : -1),
    [phaseItem]
  );
  const prevItem = idx > 0 ? WORKSHOP_PHASE_CATALOG[idx - 1] : null;
  const nextItem = idx >= 0 && idx < WORKSHOP_PHASE_CATALOG.length - 1 ? WORKSHOP_PHASE_CATALOG[idx + 1] : null;

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
          phaseAnswers: {},
          updatedAt: new Date().toISOString(),
        },
      },
    }));
  };

  const updateCustomerLabel = (label) => {
    if (!activeProfileId || !profiles[activeProfileId]) return;
    updateChangeWorkshopKotter((cw) => ({
      ...cw,
      profiles: {
        ...cw.profiles,
        [activeProfileId]: {
          ...cw.profiles[activeProfileId],
          customerLabel: label,
          updatedAt: new Date().toISOString(),
        },
      },
    }));
  };

  if (!phaseId || !phaseItem) {
    return (
      <div className="cw-workshop min-h-screen">
        <div className="cw-container py-10">
          <p className="text-slate-600">Unbekannte Phase.</p>
          <Link className="cw-participant-banner-link mt-4 inline-block" to="/change-workflow">
            Zurück zum Workshop
          </Link>
        </div>
      </div>
    );
  }

  const catalogItemForForm = {
    slug: phaseItem.id,
    prompts: phaseItem.prompts,
  };

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
            <span className="cw-kicker">Workshop · Schritt {phaseItem.order}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            {isSyncing && (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin text-violet-600" aria-hidden />
                Speichern…
              </span>
            )}
            {!isSyncing && !lastSyncError && (
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <Save className="w-4 h-4" aria-hidden />
                Synchronisiert
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
              <p className="cw-callout-heading m-0">Kundenpaket</p>
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
                    placeholder="z. B. «Projekt Alpha · Q2 2026»"
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
              <Map className="w-3.5 h-3.5" aria-hidden />
              Workshop-Fortschritt
            </span>
            <Link to="/change-workflow/journey" className="text-xs text-violet-600 hover:underline">
              → Change Journey
            </Link>
          </div>
          <div className="flex gap-1">
            {WORKSHOP_PHASE_CATALOG.map((item) => {
              const phaseData = activeProfile?.phaseAnswers?.[item.id];
              const status = phaseData?._status || 'open';
              const hasContent = item.prompts.some((p) => (phaseData?.[p.key] || '').trim().length > 0);
              const isCurrent = item.id === phaseItem.id;
              return (
                <Link
                  key={item.id}
                  to={`/change-workflow/phase/${item.id}`}
                  title={`${item.order}. ${item.label}${status === 'done' ? ' ✓' : status === 'in_progress' ? ' (in Bearbeitung)' : ''}`}
                  className={`flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent ? 'ring-2 ring-violet-500 ring-offset-1' : ''
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
                  {status === 'done' ? <CheckCircle className="w-3.5 h-3.5" /> : item.order}
                </Link>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-slate-500">
            <span>
              {WORKSHOP_PHASE_CATALOG.filter((item) => activeProfile?.phaseAnswers?.[item.id]?._status === 'done').length}/8 abgeschlossen
            </span>
            <span>
              {WORKSHOP_PHASE_CATALOG.filter((item) => {
                const pa = activeProfile?.phaseAnswers?.[item.id];
                return item.prompts.some((p) => (pa?.[p.key] || '').trim().length > 0);
              }).length}/8 bearbeitet
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <span className="cw-eyebrow-accent">Schritt {phaseItem.order}</span>
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <Clock className="w-3 h-3" aria-hidden />
            {phaseItem.durationHint}
          </span>
        </div>
        <h1 className="cw-phase-title mb-1">{phaseItem.label}</h1>
        <p className="text-sm text-slate-500 mb-4">{phaseItem.subtitle}</p>
        <p className="cw-phase-meta mb-6">{phaseItem.description}</p>

        <div className="cw-callout-accent mb-8">
          <p className="cw-callout-heading">Moderationsimpuls</p>
          <p className="cw-callout-body m-0">{phaseItem.moderationHint}</p>
        </div>

        <KotterReflectionForm
          key={`${activeProfile?.id}-${phaseItem.id}`}
          catalogItem={catalogItemForForm}
          idPrefix={`phase-${phaseItem.id}`}
          initial={activeProfile?.phaseAnswers?.[phaseItem.id] || {}}
          disabled={isLoading || !activeProfile}
          onPersist={persistCurrentPhase}
        />

        <nav className="flex flex-wrap justify-between gap-3 mt-10 pt-6 border-t border-slate-200" aria-label="Workshop-Phasen">
          {prevItem ? (
            <Link
              to={`/change-workflow/phase/${prevItem.id}`}
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
              to={`/change-workflow/phase/${nextItem.id}`}
              className="cw-btn cw-btn-primary-solid cw-btn-compact inline-flex items-center gap-2"
            >
              {nextItem.order}. {nextItem.label}
              <ChevronRight className="w-4 h-4" aria-hidden />
            </Link>
          ) : (
            <Link to="/change-workflow/journey" className="cw-btn cw-btn-accent-fill cw-btn-compact inline-flex items-center gap-2">
              <Map className="w-4 h-4" aria-hidden />
              Zur Change Journey
            </Link>
          )}
        </nav>
      </main>
    </div>
  );
}
