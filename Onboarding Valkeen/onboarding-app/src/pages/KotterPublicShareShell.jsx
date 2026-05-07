import { useCallback, useMemo } from 'react';
import { Link, Route, Routes, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Loader2, Lock, Save, Shield } from 'lucide-react';

import '../styles/change-workshop.css';
import { KotterReflectionForm } from '../components/kotter/KotterReflectionForm';
import { getKotterItemBySlug, KOTTER_CATALOG_ITEMS } from '../data/kotterCatalogData';
import { KotterShareProvider, useKotterShare } from '../context/KotterShareContext';
import { isValidKotterShareToken, KOTTER_MIRROR_PROFILE_ID } from '../utils/kotterShare';

function GuestHeader({ subtitle }) {
  return (
    <header className="cw-wh-header border-b border-slate-200/80">
      <div className="cw-container cw-wh-top flex flex-col gap-2 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="cw-kicker">Kotter · Kunden‑Vorbereitung</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
            <Lock className="h-3.5 w-3.5" aria-hidden /> nur mit Link erreichbar
          </span>
        </div>
        {subtitle && <p className="m-0 text-sm text-slate-600 max-w-prose">{subtitle}</p>}
        <div className="cw-callout-accent border-violet-200/80 bg-violet-50/60 py-3">
          <p className="cw-callout-heading m-0 flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-violet-700 shrink-0" aria-hidden />
            Datenschutz
          </p>
          <p className="cw-callout-body m-0 mt-1 text-xs leading-snug">
            Diese Seite speichert Ihre Eintragungen gesondert unter einem Zufallsschlüssel. Teilen Sie den Link wie ein
            Passwort nur mit Projekt-Ansprechpartner:innen der Valkeen. Keine Bewertungen — strukturierte
            Arbeitshinweise für den Workshop.
          </p>
        </div>
      </div>
    </header>
  );
}

function GuestSyncLine({ syncing }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
      {syncing ? (
        <span className="inline-flex items-center gap-1.5" title="Speichern in der Cloud">
          <Loader2 className="w-4 h-4 animate-spin text-violet-600" aria-hidden />
          Einträge werden gespeichert…
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-emerald-700">
          <Save className="w-4 h-4 shrink-0" aria-hidden />
          Zuletzt Eingetipptes ist zwischengespeichert (verzögert bis ca. 2 s).
        </span>
      )}
    </div>
  );
}

function KotterGuestOverview() {
  const { cw, loading, loadError, syncing } = useKotterShare();
  const profile = cw.profiles[KOTTER_MIRROR_PROFILE_ID];
  const label = profile?.customerLabel?.trim();

  return (
    <div className="cw-workshop min-h-screen relative">
      <div className="cw-workshop-page-bg" aria-hidden />
      <div className="cw-workshop-page-overlay" aria-hidden />
      <GuestHeader
        subtitle={
          label
            ? `Bezeichnung vom Moderationsteam: «${label}». Bitte nacheinander die Kachel öffnen, die Sie vorbereiten möchten.`
            : 'Bitte öffnen Sie eine Kachel unten — Ihre Notizen werden pro Kachel gesichert.'
        }
      />

      <main className="cw-container py-8 max-w-3xl space-y-6">
        {loadError && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="status">
            {loadError}. Sie können weiterarbeiten — es wird beim Speichern erneut versucht.
          </div>
        )}
        {loading ? (
          <p className="text-slate-600 text-sm inline-flex gap-2 items-center">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            Inhalt wird geladen…
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <h1 className="cw-phase-title m-0 text-lg sm:text-xl">Alle acht Kotter-Kacheln</h1>
              <GuestSyncLine syncing={syncing} />
            </div>

            <ol className="grid gap-3 sm:grid-cols-2 m-0 p-0 list-none">
              {KOTTER_CATALOG_ITEMS.map((item) => {
                const slug = item.slug;
                const hasText = !!(profile?.tileAnswers?.[slug] && Object.values(profile.tileAnswers[slug]).some(Boolean));
                return (
                  <li key={slug}>
                    <Link
                      to={slug}
                      className={`cw-card block no-underline text-inherit transition hover:border-violet-300 hover:shadow-sm ${
                        hasText ? 'border-violet-200/70 bg-violet-50/25' : 'cw-card-subtle'
                      }`}
                    >
                      <span className="text-xs font-bold text-violet-700">{item.order}.</span>
                      <span className="font-semibold text-slate-800 block mt-1">{item.label}</span>
                      <span className="text-xs text-slate-500 mt-1 block">{item.kotterChapter}</span>
                      {hasText && <span className="text-[11px] font-semibold text-emerald-800 mt-2 inline-block">Einträge vorhanden</span>}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </main>
    </div>
  );
}

function KotterGuestTile() {
  const { slug } = useParams();
  const { cw, loading, loadError, syncing, saveTileAnswers } = useKotterShare();
  const catalogItem = slug ? getKotterItemBySlug(slug) : undefined;
  const profile = cw.profiles[KOTTER_MIRROR_PROFILE_ID];

  const idx = useMemo(
    () => (catalogItem ? KOTTER_CATALOG_ITEMS.findIndex((x) => x.slug === catalogItem.slug) : -1),
    [catalogItem]
  );
  const prevItem = idx > 0 ? KOTTER_CATALOG_ITEMS[idx - 1] : null;
  const nextItem = idx >= 0 && idx < KOTTER_CATALOG_ITEMS.length - 1 ? KOTTER_CATALOG_ITEMS[idx + 1] : null;

  const persistCurrentTile = useCallback(
    (answers) => {
      if (!catalogItem) return;
      saveTileAnswers(catalogItem.slug, answers);
    },
    [catalogItem, saveTileAnswers]
  );

  if (!catalogItem) {
    return (
      <div className="cw-workshop min-h-screen cw-kotter-page">
        <div className="cw-container py-10">
          <p className="text-slate-600">Unbekannte Kachel.</p>
          <Link className="cw-participant-banner-link mt-4 inline-block" to=".." relative="path">
            Zur Übersicht
          </Link>
        </div>
      </div>
    );
  }

  const label = profile?.customerLabel?.trim();

  return (
    <div className="cw-workshop min-h-screen relative">
      <div className="cw-workshop-page-bg" aria-hidden />
      <div className="cw-workshop-page-overlay" aria-hidden />
      <GuestHeader subtitle={label ? `Kontext: «${label}»` : undefined} />

      <div className="cw-container cw-wh-top flex flex-wrap gap-4 justify-between py-3 border-b border-slate-200/70">
        <Link to=".." className="cw-btn cw-btn-ghost cw-btn-compact inline-flex items-center gap-2" relative="path">
          <ChevronLeft className="w-4 h-4" aria-hidden /> Alle Kacheln
        </Link>
        <GuestSyncLine syncing={syncing && !loading} />
      </div>

      <main className="cw-container py-8 max-w-3xl">
        {loadError && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 mb-6" role="status">
            {loadError}
          </div>
        )}
        <p className="cw-eyebrow-accent mb-2">{catalogItem.kotterChapter}</p>
        <h1 className="cw-phase-title mb-2">{catalogItem.label}</h1>
        <p className="cw-phase-meta mb-6">{catalogItem.description}</p>

        <div className="cw-callout-accent mb-8">
          <p className="cw-callout-heading">Hinweise für Selbständiges Ausfüllen</p>
          <p className="cw-callout-body m-0">{catalogItem.moderationHint}</p>
        </div>

        {loading ? (
          <p className="text-slate-600 text-sm inline-flex gap-2 items-center">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            Daten werden geladen…
          </p>
        ) : (
          <KotterReflectionForm
            key={`guest-${catalogItem.slug}`}
            catalogItem={catalogItem}
            idPrefix="kotter-guest"
            initial={profile?.tileAnswers?.[catalogItem.slug] || {}}
            disabled={!profile || loading}
            onPersist={persistCurrentTile}
          />
        )}

        <nav className="flex flex-wrap justify-between gap-3 mt-10 pt-6 border-t border-slate-200" aria-label="Navigation">
          {prevItem ? (
            <Link to={`../${prevItem.slug}`} className="cw-btn cw-btn-ghost cw-btn-compact inline-flex items-center gap-2" relative="path">
              <ChevronLeft className="w-4 h-4" aria-hidden />
              {prevItem.order}. {prevItem.label}
            </Link>
          ) : (
            <span />
          )}
          {nextItem ? (
            <Link to={`../${nextItem.slug}`} className="cw-btn cw-btn-primary-solid cw-btn-compact inline-flex items-center gap-2" relative="path">
              {nextItem.order}. {nextItem.label}
              <ChevronRight className="w-4 h-4" aria-hidden />
            </Link>
          ) : (
            <Link to=".." className="cw-btn cw-btn-accent-fill cw-btn-compact" relative="path">
              Zur Übersicht
            </Link>
          )}
        </nav>
      </main>
    </div>
  );
}

export default function KotterPublicShareShell() {
  const { shareId } = useParams();
  if (!isValidKotterShareToken(shareId)) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md text-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900 m-0">Link nicht gültig</h1>
          <p className="text-sm text-slate-600 mt-2 m-0">
            Bitte kopieren Sie die vollständige Adresse aus der Einladung oder erbitten Sie einen neuen Einladungslink.
          </p>
        </div>
      </div>
    );
  }

  return (
    <KotterShareProvider shareId={shareId}>
      <Routes>
        <Route index element={<KotterGuestOverview />} />
        <Route path=":slug" element={<KotterGuestTile />} />
      </Routes>
    </KotterShareProvider>
  );
}
