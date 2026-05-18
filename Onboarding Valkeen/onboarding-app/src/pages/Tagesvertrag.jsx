import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Cloud, Loader2 } from 'lucide-react';
import { useProgress } from '../hooks/useLocalStorage';
import {
  emptyDayPayload,
  emptyWeekPayload,
  isoWeekString,
  normalizeDayPayload,
  normalizeWeekPayload,
  todayLocalISO,
} from '../utils/valkeenTagesvertrag';

/**
 * Lokaler Form-State für zuverlässige Eingabe; Hydration nur bei Tag/Woche/Load-Ende.
 * Jede Änderung schreibt sofort in den Progress (wie Aufgaben-Tracker → localStorage sofort).
 */
export default function Tagesvertrag() {
  const { progress, setProgress, isLoading, isSyncing, lastSyncError } = useProgress();
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const [currentDayISO, setCurrentDayISO] = useState(todayLocalISO);
  const [weekAnchor, setWeekAnchor] = useState(() => new Date());
  const weekKey = useMemo(() => isoWeekString(weekAnchor), [weekAnchor]);

  const [dayDraft, setDayDraft] = useState(emptyDayPayload);
  const [weekDraft, setWeekDraft] = useState(emptyWeekPayload);

  useEffect(() => {
    if (isLoading) return;
    setDayDraft(normalizeDayPayload(progressRef.current.valkeenTagesvertrag?.days?.[currentDayISO]));
  }, [currentDayISO, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    setWeekDraft(normalizeWeekPayload(progressRef.current.valkeenTagesvertrag?.weeks?.[weekKey]));
  }, [weekKey, isLoading]);

  const persistDayToProgress = useCallback(
    (nextDay) => {
      setProgress((p) => ({
        ...p,
        valkeenTagesvertrag: {
          days: { ...(p.valkeenTagesvertrag?.days || {}), [currentDayISO]: nextDay },
          weeks: { ...(p.valkeenTagesvertrag?.weeks || {}) },
        },
      }));
    },
    [currentDayISO, setProgress]
  );

  const persistWeekToProgress = useCallback(
    (nextWeek) => {
      setProgress((p) => ({
        ...p,
        valkeenTagesvertrag: {
          days: { ...(p.valkeenTagesvertrag?.days || {}) },
          weeks: { ...(p.valkeenTagesvertrag?.weeks || {}), [weekKey]: nextWeek },
        },
      }));
    },
    [weekKey, setProgress]
  );

  const updateDay = useCallback(
    (patch) => {
      setDayDraft((prev) => {
        const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch };
        persistDayToProgress(next);
        return next;
      });
    },
    [persistDayToProgress]
  );

  const updateWeekField = useCallback(
    (key, value) => {
      setWeekDraft((prev) => {
        const next = { ...prev, [key]: value };
        persistWeekToProgress(next);
        return next;
      });
    },
    [persistWeekToProgress]
  );

  const syncNote = lastSyncError
    ? lastSyncError
    : isLoading
      ? 'Lade Fortschritt…'
      : isSyncing
        ? 'Synchronisiere mit Cloud…'
        : 'Gesichert wie Aufgaben — sofort lokal, Cloud alle paar Sekunden';

  /**
   * Lesbarkeit: Body ~1.65–1.75 Zeilenabstand (WCAG-Blog-Empfehlung „ausreichend Zeilenabstand“),
   * größere vertikale Abstände zwischen Blöcken als 8px-Grid.
   */
  const cardClass =
    'rounded-3xl border border-white/[0.09] bg-white/[0.035] p-10 sm:p-14 lg:p-20 backdrop-blur-sm shadow-xl shadow-black/20';

  const fieldClass =
    'w-full min-h-[60px] rounded-2xl bg-white/[0.07] border border-white/[0.12] px-6 sm:px-8 py-5 text-[16px] leading-[1.7] text-white placeholder:text-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50 transition-shadow';

  const textareaClass = `${fieldClass} resize-y min-h-[160px] leading-[1.8] py-6`;

  const labelClass =
    'block text-base sm:text-[17px] font-medium text-white/75 mb-6 leading-[1.6] tracking-wide';

  const sectionIntroClass =
    'text-white/60 text-[17px] sm:text-lg mb-12 leading-[1.9] max-w-[58ch]';

  return (
    <div className="w-full space-y-14 sm:space-y-16 lg:space-y-20 pb-24 md:pb-32 text-[16px] leading-[1.7] text-white/90">
      <header className="space-y-8 pt-6 mb-4">
        <h1 className="text-[1.75rem] sm:text-[2.125rem] md:text-[2.35rem] font-bold gradient-text leading-[1.25] tracking-tight">
          Tagesvertrag · 20 Minuten reichen
        </h1>
        <p className="text-white/65 text-[17px] sm:text-lg leading-[1.8] max-w-[60ch]">
          Fokus, Reset, Review und Wochenritual — kurz halten. Speicherung wie beim Aufgaben-Tracker:
          sofort im Browser, dieselbe AWS-Onboarding-Sitzung.
        </p>
      </header>

      <div
        className={`${cardClass} flex flex-col lg:flex-row flex-wrap gap-16 lg:gap-20 items-start lg:items-end justify-between`}
      >
        <div className="flex flex-col gap-8 min-w-[min(100%,300px)]">
          <span className={labelClass}>Tag (Tagesvertrag)</span>
          <div className="flex flex-wrap items-center gap-6">
            <input
              type="date"
              value={currentDayISO}
              onChange={(e) => setCurrentDayISO(e.target.value || todayLocalISO())}
              className={`${fieldClass} w-auto max-w-full`}
            />
            <button
              type="button"
              onClick={() => setCurrentDayISO(todayLocalISO())}
              className="min-h-[60px] rounded-2xl px-8 py-4 text-base font-semibold leading-none bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-lg shadow-indigo-900/30"
            >
              Heute
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-8">
          <span className={labelClass}>Kalenderwoche (Sonntags-Ritual)</span>
          <div className="flex items-center gap-6 flex-wrap">
            <button
              type="button"
              aria-label="Vorherige Woche"
              onClick={() =>
                setWeekAnchor((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7))
              }
              className="min-h-[60px] min-w-[60px] rounded-2xl px-5 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] text-white text-2xl leading-none"
            >
              ‹
            </button>
            <span className="font-mono text-indigo-300 min-w-[10rem] text-center text-lg leading-[1.5] py-4 px-6 rounded-2xl bg-black/25 border border-white/5">
              {weekKey}
            </span>
            <button
              type="button"
              aria-label="Nächste Woche"
              onClick={() =>
                setWeekAnchor((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7))
              }
              className="min-h-[60px] min-w-[60px] rounded-2xl px-5 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] text-white text-2xl leading-none"
            >
              ›
            </button>
            <button
              type="button"
              onClick={() => setWeekAnchor(new Date())}
              className="min-h-[60px] rounded-2xl px-8 py-4 text-base font-semibold leading-none bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] text-white transition-colors"
            >
              Diese KW
            </button>
          </div>
        </div>
      </div>

      <section className={`${cardClass} space-y-14`} aria-labelledby="vt-h1">
        <h2
          id="vt-h1"
          className="text-[1.35rem] sm:text-2xl font-semibold text-white leading-snug flex flex-wrap items-center gap-4"
        >
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-500/35 text-indigo-100 leading-none">
            5 Min
          </span>
          Morgens: Fokus
        </h2>
        <p className={sectionIntroClass}>Heute zählt:</p>
        <div className="space-y-10 mb-14">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-start gap-6">
              <span className="text-white/50 font-semibold text-xl mt-5 min-w-[2.5rem]">{i + 1}.</span>
              <input
                type="text"
                value={dayDraft.morning.counts[i]}
                onChange={(e) =>
                  updateDay((d) => ({
                    ...d,
                    morning: {
                      ...d.morning,
                      counts: d.morning.counts.map((c, j) => (j === i ? e.target.value : c)),
                    },
                  }))
                }
                placeholder={`Priorität ${i + 1}`}
                className={`flex-1 ${fieldClass}`}
              />
            </div>
          ))}
        </div>
        <p className={`${sectionIntroClass}`}>Nicht heute:</p>
        <div className="space-y-8 mb-14">
          {[0, 1, 2].map((i) => (
            <input
              key={i}
              type="text"
              value={dayDraft.morning.notToday[i]}
              onChange={(e) =>
                updateDay((d) => ({
                  ...d,
                  morning: {
                    ...d.morning,
                    notToday: d.morning.notToday.map((c, j) => (j === i ? e.target.value : c)),
                  },
                }))
              }
              placeholder={`Nicht heute #${i + 1}`}
              className={fieldClass}
            />
          ))}
        </div>
        <p className={sectionIntroClass}>Eine Sache, die ich abschließe:</p>
        <input
          type="text"
          value={dayDraft.morning.oneThing}
          onChange={(e) =>
            updateDay((d) => ({
              ...d,
              morning: { ...d.morning, oneThing: e.target.value },
            }))
          }
          placeholder="Eine klare Abschluss-Sache"
          className={fieldClass}
        />
        <p className="mt-10 text-[16px] leading-[1.75] text-indigo-100/95 border-l-[3px] border-indigo-400 pl-6 py-4 pr-5 bg-indigo-500/[0.12] rounded-r-2xl">
          Das ist dein Tagesvertrag.
        </p>
      </section>

      <section className={`${cardClass} space-y-14`} aria-labelledby="vt-h2">
        <h2
          id="vt-h2"
          className="text-[1.35rem] sm:text-2xl font-semibold text-white leading-snug flex flex-wrap items-center gap-4"
        >
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-violet-500/35 text-violet-100 leading-none">
            3 Min
          </span>
          Während des Tages: Reset
        </h2>
        <p className={sectionIntroClass}>Wenn du springst oder emotional wirst:</p>
        <div className="space-y-14">
          {[
            ['Was mache ich gerade?', 'doing'],
            ['Was sollte ich eigentlich machen?', 'should'],
            ['Was ist der nächste kleinste Schritt?', 'step'],
          ].map(([label, key]) => (
            <label key={key} className="block space-y-5">
              <span className={labelClass}>{label}</span>
              <textarea
                rows={4}
                value={dayDraft.reset[key]}
                onChange={(e) =>
                  updateDay((d) => ({
                    ...d,
                    reset: { ...d.reset, [key]: e.target.value },
                  }))
                }
                className={`${textareaClass} focus-visible:ring-violet-400/50`}
                placeholder="…"
              />
            </label>
          ))}
        </div>
        <p className="mt-12 text-[16px] leading-[1.75] text-violet-100/95 border-l-[3px] border-violet-400 pl-6 py-4 pr-5 bg-violet-500/[0.12] rounded-r-2xl">
          Dann nur diesen Schritt.
        </p>
      </section>

      <section className={`${cardClass} space-y-14`} aria-labelledby="vt-h3">
        <h2
          id="vt-h3"
          className="text-[1.35rem] sm:text-2xl font-semibold text-white leading-snug flex flex-wrap items-center gap-4"
        >
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-fuchsia-500/30 text-fuchsia-100 leading-none">
            7 Min
          </span>
          Abends: Review
        </h2>
        <p className={sectionIntroClass}>Kurz festhalten:</p>
        <div className="space-y-14">
          {[
            ['done', 'Was habe ich abgeschlossen?'],
            ['jumped', 'Wo bin ich gesprungen?'],
            ['triggered', 'Was hat mich getriggert?'],
            ['reacted', 'Wie habe ich reagiert?'],
            ['easier', 'Was mache ich morgen einfacher?'],
          ].map(([key, label]) => (
            <label key={key} className="block space-y-5">
              <span className={labelClass}>{label}</span>
              <textarea
                rows={4}
                value={dayDraft.evening[key]}
                onChange={(e) =>
                  updateDay((d) => ({
                    ...d,
                    evening: { ...d.evening, [key]: e.target.value },
                  }))
                }
                className={`${textareaClass} focus-visible:ring-fuchsia-400/45`}
                placeholder="…"
              />
            </label>
          ))}
        </div>
        <p className="mt-10 text-[15px] text-white/45 leading-[1.75] max-w-[58ch]">
          Nicht länger — sonst wird es wieder zum Riesenprojekt.
        </p>
      </section>

      <section className={`${cardClass} space-y-14 ring-1 ring-amber-400/20`} aria-labelledby="vt-h4">
        <h2
          id="vt-h4"
          className="text-[1.35rem] sm:text-2xl font-semibold text-white leading-snug flex flex-wrap items-center gap-4"
        >
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/30 text-amber-50 leading-none">
            30 Min
          </span>
          Wochenritual (Sonntag)
        </h2>
        <p className={sectionIntroClass}>Kalenderwoche oben wählen — Fragen beantworten:</p>
        <div className="space-y-14">
          {[
            ['q1', '1. Was waren meine 3 wichtigsten Ergebnisse der Woche?'],
            ['q2', '2. Wo habe ich mich verzettelt?'],
            ['q3', '3. Was hat mich emotional am meisten getriggert?'],
            ['q4', '4. Welche offene Schleife kann ich schließen?'],
            ['q5', '5. Was sind die 3 Prioritäten für nächste Woche?'],
          ].map(([key, label]) => (
            <label key={key} className="block space-y-5">
              <span className={labelClass}>{label}</span>
              <textarea
                rows={4}
                value={weekDraft[key]}
                onChange={(e) => updateWeekField(key, e.target.value)}
                className={`${textareaClass} focus-visible:ring-amber-400/45`}
                placeholder="…"
              />
            </label>
          ))}
          <label className="block space-y-5">
            <span className={`${labelClass} text-amber-100/90 font-semibold`}>
              6. Was lasse ich bewusst liegen? (wichtigste Frage)
            </span>
            <textarea
              rows={5}
              value={weekDraft.q6}
              onChange={(e) => updateWeekField('q6', e.target.value)}
              className={`${textareaClass} min-h-[148px] focus-visible:ring-amber-400/45`}
              placeholder="Not-to-dos — bewusst nein sagen"
            />
          </label>
        </div>
        <p className="mt-12 text-[15px] text-amber-50/90 leading-[1.75] border border-amber-400/25 rounded-2xl px-6 py-5 bg-amber-500/[0.1] max-w-[58ch]">
          Der wichtigste Punkt ist Nummer 6 — du brauchst auch Not-to-dos.
        </p>
      </section>

      <footer
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 rounded-3xl border border-white/[0.08] bg-black/25 px-7 py-6 sm:px-10 text-[15px] leading-[1.75]"
        aria-live="polite"
      >
        <span className="flex items-start gap-4 text-white/55 max-w-xl">
          <Cloud className="w-5 h-5 shrink-0 mt-1 opacity-75" aria-hidden />
          <span>
            Speicherort: dieselbe DynamoDB wie der Aufgaben-Fortschritt. Nach einem Reload sollten Einträge
            wieder da sein — bei Problemen kurz warten, bis „Synchronisiere…“ verschwindet.
          </span>
        </span>
        <span
          className={`flex items-center gap-3 shrink-0 font-medium ${lastSyncError ? 'text-red-400' : 'text-emerald-400/95'}`}
        >
          {(isSyncing || isLoading) && <Loader2 className="w-5 h-5 animate-spin" aria-hidden />}
          {syncNote}
        </span>
      </footer>
    </div>
  );
}
