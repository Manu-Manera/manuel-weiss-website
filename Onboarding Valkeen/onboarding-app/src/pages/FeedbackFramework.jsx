import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Cloud,
  Copy,
  Check,
  Loader2,
  Target,
  MessageCircle,
  ClipboardList,
  Sparkles,
  Plus,
  Trash2,
  FileDown,
  Languages,
  ArrowLeft,
  Calendar,
  User,
  FolderOpen,
} from 'lucide-react';
import { useProgress } from '../hooks/useLocalStorage';
import { MEETING_NOTE_SECTIONS } from '../data/feedbackFrameworkDefaults';
import {
  achievementLabel,
  feedbackUi,
  INVITATION_QUESTIONS_I18N,
  LIVE_ONLY_QUESTION_I18N,
  MEETING_SECTIONS_I18N,
  SELF_ASSESSMENT_I18N,
} from '../data/feedbackFrameworkI18n';
import {
  createFeedbackSession,
  emptyRampUpFeedback,
  getSessionSummary,
  normalizeRampUpFeedback,
  participantNamesLabel,
  primaryParticipant,
  rampUpFeedbackToMarkdown,
} from '../utils/rampUpFeedback';
import { downloadRampUpFeedbackPdf } from '../utils/rampUpFeedbackPdf';
import { emptyParticipantNotes } from '../data/feedbackFrameworkDefaults';

const cardClass =
  'rounded-3xl border border-white/[0.09] bg-white/[0.035] p-8 sm:p-12 backdrop-blur-sm shadow-xl shadow-black/20';

const fieldClass =
  'w-full min-h-[52px] rounded-2xl bg-white/[0.07] border border-white/[0.12] px-5 py-4 text-[15px] leading-relaxed text-white placeholder:text-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50';

const textareaClass = `${fieldClass} resize-y min-h-[120px] leading-[1.75]`;

const labelClass = 'block text-sm font-medium text-white/75 mb-3 leading-snug';

const TAB_IDS = [
  { id: 'prep', labelKey: 'tabPrep', icon: ClipboardList },
  { id: 'questions', labelKey: 'tabQuestions', icon: MessageCircle },
  { id: 'meeting', labelKey: 'tabMeeting', icon: Target },
  { id: 'after', labelKey: 'tabAfter', icon: Sparkles },
];

export default function FeedbackFramework() {
  const { progress, setProgress, isLoading, isSyncing, lastSyncError } = useProgress();
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const [viewMode, setViewMode] = useState('overview');
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [activeTab, setActiveTab] = useState('prep');
  const [activeParticipantId, setActiveParticipantId] = useState(null);
  const [draft, setDraft] = useState(emptyRampUpFeedback);
  const [copied, setCopied] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionPerson, setNewSessionPerson] = useState('');

  const locale = draft.meta?.uiLocale === 'en' ? 'en' : 'de';
  const t = (key) => feedbackUi(locale, key);

  const sessions = progress.feedbackSessions || [];

  useEffect(() => {
    if (isLoading) return;
    const savedActiveId = progressRef.current.feedbackActiveSessionId;
    const allSessions = progressRef.current.feedbackSessions || [];
    if (savedActiveId && allSessions.some((s) => s.id === savedActiveId)) {
      setActiveSessionId(savedActiveId);
      const session = allSessions.find((s) => s.id === savedActiveId);
      if (session) {
        const normalized = normalizeRampUpFeedback(session.data);
        setDraft(normalized);
        setActiveParticipantId(
          normalized.meta.primaryParticipantId || normalized.participants[0]?.id || null
        );
        setViewMode('detail');
      }
    } else if (allSessions.length > 0) {
      setViewMode('overview');
    } else {
      setViewMode('overview');
    }
  }, [isLoading]);

  const openSession = useCallback(
    (sessionId, sessionsOverride) => {
      const allSessions = sessionsOverride || sessions;
      const session = allSessions.find((s) => s.id === sessionId);
      if (!session) return;
      const normalized = normalizeRampUpFeedback(session.data);
      setDraft(normalized);
      setActiveSessionId(sessionId);
      setActiveParticipantId(
        normalized.meta.primaryParticipantId || normalized.participants[0]?.id || null
      );
      setActiveTab('prep');
      setViewMode('detail');
      setProgress((p) => ({ ...p, feedbackActiveSessionId: sessionId }));
    },
    [sessions, setProgress]
  );

  const createSession = useCallback(() => {
    const session = createFeedbackSession(
      newSessionName || `Feedback ${new Date().toLocaleDateString('de-DE')}`,
      newSessionPerson
    );
    const normalized = normalizeRampUpFeedback(session.data);
    setDraft(normalized);
    setActiveSessionId(session.id);
    setActiveParticipantId(
      normalized.meta.primaryParticipantId || normalized.participants[0]?.id || null
    );
    setActiveTab('prep');
    setViewMode('detail');
    setProgress((p) => ({
      ...p,
      feedbackSessions: [...(p.feedbackSessions || []), session],
      feedbackActiveSessionId: session.id,
    }));
    setNewSessionName('');
    setNewSessionPerson('');
  }, [newSessionName, newSessionPerson, setProgress]);

  const deleteSession = useCallback(
    (sessionId) => {
      if (!window.confirm('Dieses Gespräch wirklich löschen?')) return;
      setProgress((p) => {
        const next = (p.feedbackSessions || []).filter((s) => s.id !== sessionId);
        return {
          ...p,
          feedbackSessions: next,
          feedbackActiveSessionId:
            p.feedbackActiveSessionId === sessionId ? (next[0]?.id || null) : p.feedbackActiveSessionId,
        };
      });
      if (activeSessionId === sessionId) {
        setViewMode('overview');
        setActiveSessionId(null);
      }
    },
    [activeSessionId, setProgress]
  );

  const backToOverview = useCallback(() => {
    setViewMode('overview');
  }, []);

  const persist = useCallback(
    (next) => {
      const normalized = normalizeRampUpFeedback(next);
      setDraft(normalized);
      if (!activeSessionId) return;
      setProgress((p) => {
        const now = new Date().toISOString();
        const updatedSessions = (p.feedbackSessions || []).map((s) =>
          s.id === activeSessionId ? { ...s, data: normalized, updatedAt: now } : s
        );
        return { ...p, feedbackSessions: updatedSessions };
      });
    },
    [activeSessionId, setProgress]
  );

  const updateMeta = (patch) =>
    persist({ ...draft, meta: { ...draft.meta, ...patch } });

  const updatePrep = (patch) =>
    persist({ ...draft, prep: { ...draft.prep, ...patch } });

  const updateSelf = (key, value) =>
    persist({
      ...draft,
      prep: {
        ...draft.prep,
        selfAssessment: { ...draft.prep.selfAssessment, [key]: value },
      },
    });

  const toggleAchievement = (id, isCustom = false) => {
    if (isCustom) {
      const customAchievements = draft.prep.customAchievements.map((a) =>
        a.id === id ? { ...a, checked: !a.checked } : a
      );
      updatePrep({ customAchievements });
      return;
    }
    const achievements = draft.prep.achievements.map((a) =>
      a.id === id ? { ...a, checked: !a.checked } : a
    );
    updatePrep({ achievements });
  };

  const addCustomAchievement = () => {
    const id = `custom-${Date.now()}`;
    updatePrep({
      customAchievements: [
        ...draft.prep.customAchievements,
        { id, text: '', checked: false },
      ],
    });
  };

  const updateCustomText = (id, text) => {
    updatePrep({
      customAchievements: draft.prep.customAchievements.map((a) =>
        a.id === id ? { ...a, text } : a
      ),
    });
  };

  const removeCustom = (id) => {
    updatePrep({
      customAchievements: draft.prep.customAchievements.filter((a) => a.id !== id),
    });
  };

  const updateParticipant = (id, patch) => {
    persist({
      ...draft,
      participants: draft.participants.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
  };

  const addParticipant = () => {
    const id = `person-${Date.now()}`;
    persist({
      ...draft,
      participants: [...draft.participants, { id, name: '', role: '' }],
      meetingNotes: {
        byParticipant: {
          ...draft.meetingNotes.byParticipant,
          [id]: emptyParticipantNotes(),
        },
      },
    });
    setActiveParticipantId(id);
  };

  const removeParticipant = (id) => {
    if (draft.participants.length <= 1) return;
    const nextParticipants = draft.participants.filter((p) => p.id !== id);
    const { [id]: _removed, ...restNotes } = draft.meetingNotes.byParticipant;
    const nextPrimary =
      draft.meta.primaryParticipantId === id
        ? nextParticipants[0]?.id
        : draft.meta.primaryParticipantId;
    persist({
      ...draft,
      participants: nextParticipants,
      meta: { ...draft.meta, primaryParticipantId: nextPrimary },
      meetingNotes: { byParticipant: restNotes },
    });
    if (activeParticipantId === id) {
      setActiveParticipantId(nextPrimary);
    }
  };

  const setPrimaryParticipant = (id) => {
    persist({
      ...draft,
      meta: { ...draft.meta, primaryParticipantId: id },
    });
    setActiveParticipantId(id);
  };

  const updateMeeting = (participantId, key, value) => {
    const current = draft.meetingNotes.byParticipant[participantId] || emptyParticipantNotes();
    persist({
      ...draft,
      meetingNotes: {
        byParticipant: {
          ...draft.meetingNotes.byParticipant,
          [participantId]: { ...current, [key]: value },
        },
      },
    });
  };

  const activePerson =
    draft.participants.find((p) => p.id === activeParticipantId) ||
    primaryParticipant(draft);

  const updateAfter = (key, value) =>
    persist({
      ...draft,
      after: { ...draft.after, [key]: value },
    });

  const setLocale = (nextLocale) => {
    updateMeta({ uiLocale: nextLocale === 'en' ? 'en' : 'de' });
  };

  const handleCopyMarkdown = async () => {
    const md = rampUpFeedbackToMarkdown(draft, locale);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPdf = async () => {
    setPdfBusy(true);
    try {
      downloadRampUpFeedbackPdf(draft, locale);
    } catch (e) {
      alert(`${t('pdfFailed')}: ${e?.message || e}`);
    } finally {
      setPdfBusy(false);
    }
  };

  const syncNote = lastSyncError
    ? lastSyncError
    : isLoading
      ? t('syncLoading')
      : isSyncing
        ? t('syncSaving')
        : t('syncSaved');

  const invitationQuestions = INVITATION_QUESTIONS_I18N[locale];
  const liveOnlyQuestion = LIVE_ONLY_QUESTION_I18N[locale];
  const selfAssessmentPrompts = SELF_ASSESSMENT_I18N[locale];
  const meetingSections = MEETING_SECTIONS_I18N[locale];

  const ringColor = {
    indigo: 'ring-indigo-400/25 focus-visible:ring-indigo-400/50',
    violet: 'ring-violet-400/25 focus-visible:ring-violet-400/50',
    fuchsia: 'ring-fuchsia-400/25 focus-visible:ring-fuchsia-400/50',
    amber: 'ring-amber-400/25 focus-visible:ring-amber-400/50',
    emerald: 'ring-emerald-400/25 focus-visible:ring-emerald-400/50',
  };

  if (viewMode === 'overview') {
    return (
      <div className="w-full space-y-10 pb-24 text-white/90">
        <header className="space-y-4 pt-4">
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text leading-tight">
              Feedback-Gespräche
            </h1>
            <p className="text-white/60 text-base leading-relaxed max-w-[62ch]">
              Übersicht aller Ramp-Up Reviews und Feedback-Gespräche. Erstelle ein neues Gespräch
              oder wähle ein bestehendes aus.
            </p>
          </div>
        </header>

        <section className={`${cardClass} space-y-6`}>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Plus className="w-5 h-5" /> Neues Gespräch erstellen
          </h2>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px] space-y-2">
              <label className={labelClass}>Titel des Gesprächs</label>
              <input
                className={fieldClass}
                placeholder="z.B. Ramp-Up Review 3 Monate"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-[200px] space-y-2">
              <label className={labelClass}>Gesprächspartner</label>
              <input
                className={fieldClass}
                placeholder="z.B. Marc Neckermann"
                value={newSessionPerson}
                onChange={(e) => setNewSessionPerson(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={createSession}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> Erstellen
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5" /> Gespeicherte Gespräche ({sessions.length})
          </h2>
          {sessions.length === 0 ? (
            <div className={`${cardClass} text-center py-12`}>
              <p className="text-white/50">Noch keine Gespräche vorhanden.</p>
              <p className="text-white/40 text-sm mt-2">
                Erstelle oben dein erstes Feedback-Gespräch.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sessions.map((session) => {
                const summary = getSessionSummary(session);
                return (
                  <div
                    key={session.id}
                    className={`${cardClass} hover:border-indigo-400/30 transition-colors cursor-pointer group relative`}
                    onClick={() => openSession(session.id)}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                      className="absolute top-4 right-4 p-2 text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <h3 className="font-semibold text-white mb-3 pr-8">{summary.title}</h3>
                    <div className="space-y-2 text-sm text-white/60">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>
                          {summary.personName}
                          {summary.personRole && (
                            <span className="text-white/40"> · {summary.personRole}</span>
                          )}
                        </span>
                      </div>
                      {summary.reviewDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(summary.reviewDate).toLocaleDateString('de-DE')}</span>
                        </div>
                      )}
                      <div className="text-xs text-white/40 pt-2 border-t border-white/10">
                        Zuletzt bearbeitet:{' '}
                        {new Date(summary.updatedAt).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <footer className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-white/[0.08] bg-black/25 px-6 py-5 text-sm">
          <span className="flex items-start gap-3 text-white/55 max-w-xl">
            <Cloud className="w-5 h-5 shrink-0 mt-0.5" />
            Alle Gespräche werden automatisch in der Cloud gespeichert.
          </span>
          <span
            className={`flex items-center gap-2 font-medium ${lastSyncError ? 'text-red-400' : 'text-emerald-400/95'}`}
          >
            {(isSyncing || isLoading) && <Loader2 className="w-4 h-4 animate-spin" />}
            {lastSyncError
              ? lastSyncError
              : isLoading
                ? 'Laden…'
                : isSyncing
                  ? 'Speichern…'
                  : 'Gespeichert'}
          </span>
        </footer>
      </div>
    );
  }

  return (
    <div className="w-full space-y-10 pb-24 text-white/90">
      <header className="space-y-4 pt-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-4 flex-1 min-w-[240px]">
            <button
              type="button"
              onClick={backToOverview}
              className="flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200 mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Zurück zur Übersicht
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text leading-tight">
              {t('pageTitle')}
            </h1>
            <p className="text-white/60 text-base leading-relaxed max-w-[62ch]">
              {t('pageSubtitle')}
            </p>
          </div>
          <div
            className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.06] border border-white/[0.08]"
            role="group"
            aria-label="Language"
          >
            <Languages className="w-4 h-4 text-white/40 ml-2" />
            {['de', 'en'].map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setLocale(loc)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  locale === loc
                    ? 'bg-indigo-600 text-white'
                    : 'text-white/55 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {loc === 'de' ? t('langDe') : t('langEn')}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className={`${cardClass} space-y-6`}>
        <div className="flex flex-wrap gap-6 items-end">
          <div className="flex-1 min-w-[200px] space-y-2">
            <label className={labelClass}>{t('reviewTitle')}</label>
            <input
              className={fieldClass}
              value={draft.meta.title}
              onChange={(e) => updateMeta({ title: e.target.value })}
            />
          </div>
          <div className="min-w-[160px] space-y-2">
            <label className={labelClass}>{t('reviewDate')}</label>
            <input
              type="date"
              className={fieldClass}
              value={draft.meta.reviewDate}
              onChange={(e) => updateMeta({ reviewDate: e.target.value })}
            />
          </div>
          <div className="flex-1 min-w-[200px] space-y-2">
            <label className={labelClass}>{t('period')}</label>
            <input
              className={fieldClass}
              value={draft.meta.periodLabel}
              onChange={(e) => updateMeta({ periodLabel: e.target.value })}
            />
          </div>
          <div className="min-w-[160px] space-y-2">
            <label className={labelClass}>{t('probationEnd')}</label>
            <input
              type="date"
              className={fieldClass}
              value={draft.meta.probationEnd}
              onChange={(e) => updateMeta({ probationEnd: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-white/[0.08]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-white/85">{t('participants')}</h2>
            <button
              type="button"
              onClick={addParticipant}
              className="flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200"
            >
              <Plus className="w-4 h-4" /> {t('addPerson')}
            </button>
          </div>
          <ul className="space-y-3">
            {draft.participants.map((person) => (
              <li
                key={person.id}
                className={`flex flex-wrap items-center gap-3 p-4 rounded-2xl border ${
                  draft.meta.primaryParticipantId === person.id
                    ? 'border-indigo-400/35 bg-indigo-500/[0.08]'
                    : 'border-white/[0.08] bg-white/[0.03]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setPrimaryParticipant(person.id)}
                  className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium ${
                    draft.meta.primaryParticipantId === person.id
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white/[0.08] text-white/50 hover:text-white/80'
                  }`}
                  title={t('primaryTitle')}
                >
                  {t('primary')}
                </button>
                <input
                  className={`${fieldClass} flex-1 min-w-[140px]`}
                  placeholder={t('namePlaceholder')}
                  value={person.name}
                  onChange={(e) => updateParticipant(person.id, { name: e.target.value })}
                />
                <input
                  className={`${fieldClass} flex-1 min-w-[120px]`}
                  placeholder={t('rolePlaceholder')}
                  value={person.role}
                  onChange={(e) => updateParticipant(person.id, { role: e.target.value })}
                />
                {draft.participants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeParticipant(person.id)}
                    className="p-2 text-white/40 hover:text-red-400"
                    aria-label={`${person.name || 'Person'} entfernen`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
          <p className="text-xs text-white/40">
            {t('currentParticipants')}: {participantNamesLabel(draft.participants)}
            {primaryParticipant(draft).name ? ` · ${t('primaryLabel')}: ${primaryParticipant(draft).name}` : ''}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TAB_IDS.map(({ id, labelKey, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                : 'bg-white/[0.06] text-white/60 hover:bg-white/[0.1] hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            {t(labelKey)}
          </button>
        ))}
        <div className="ml-auto flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={pdfBusy}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-100 disabled:opacity-50"
          >
            {pdfBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            {pdfBusy ? t('pdfExporting') : t('exportPdf')}
          </button>
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium bg-white/[0.08] hover:bg-white/[0.12] text-white/80"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? t('copied') : t('copyMd')}
          </button>
        </div>
      </div>

      {activeTab === 'prep' && (
        <div className="space-y-8">
          <section className={`${cardClass} space-y-6`}>
            <h2 className="text-lg font-semibold text-white">{t('openingLine')}</h2>
            <textarea
              className={textareaClass}
              rows={3}
              value={draft.prep.openingLine}
              onChange={(e) => updatePrep({ openingLine: e.target.value })}
            />
          </section>

          <section className={`${cardClass} space-y-6`}>
            <h2 className="text-lg font-semibold text-white">{t('achievements')}</h2>
            <p className="text-white/50 text-sm">{t('achievementsHint')}</p>
            <ul className="space-y-3">
              {draft.prep.achievements.map((a) => (
                <li key={a.id} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={a.checked}
                    onChange={() => toggleAchievement(a.id)}
                    className="mt-1.5 w-5 h-5 rounded border-white/20"
                  />
                  <span className={a.checked ? 'text-white' : 'text-white/70'}>
                    {achievementLabel(locale, a.id, a.text)}
                  </span>
                </li>
              ))}
              {draft.prep.customAchievements.map((a) => (
                <li key={a.id} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={a.checked}
                    onChange={() => toggleAchievement(a.id, true)}
                    className="mt-1.5 w-5 h-5 rounded border-white/20"
                  />
                  <input
                    className={`${fieldClass} flex-1`}
                    value={a.text}
                    placeholder={t('customAchievement')}
                    onChange={(e) => updateCustomText(a.id, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeCustom(a.id)}
                    className="p-2 text-white/40 hover:text-red-400"
                    aria-label="Entfernen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={addCustomAchievement}
              className="flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200"
            >
              <Plus className="w-4 h-4" /> {t('addAchievement')}
            </button>
          </section>

          <section className={`${cardClass} space-y-8`}>
            <h2 className="text-lg font-semibold text-white">{t('selfAssessment')}</h2>
            {selfAssessmentPrompts.map(({ id, label, hint, placeholder }) => (
              <label key={id} className="block space-y-2">
                <span className={labelClass}>{label}</span>
                <span className="text-xs text-white/40 block -mt-1 mb-2">{hint}</span>
                <textarea
                  className={textareaClass}
                  rows={4}
                  placeholder={placeholder}
                  value={draft.prep.selfAssessment[id]}
                  onChange={(e) => updateSelf(id, e.target.value)}
                />
              </label>
            ))}
          </section>

          <section className={`${cardClass} space-y-4 ring-1 ring-amber-400/20`}>
            <h2 className="text-lg font-semibold text-amber-100">{t('liveOnly')}</h2>
            <p className="text-sm text-white/55 italic">{liveOnlyQuestion}</p>
            <textarea
              className={`${textareaClass} ${ringColor.amber}`}
              rows={3}
              placeholder={t('liveNotesPlaceholder')}
              value={draft.prep.liveQuestionNotes}
              onChange={(e) => updatePrep({ liveQuestionNotes: e.target.value })}
            />
          </section>
        </div>
      )}

      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {draft.participants.map((person) => (
              <button
                key={person.id}
                type="button"
                onClick={() => setActiveParticipantId(person.id)}
                className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                  activePerson?.id === person.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/[0.06] text-white/60 hover:bg-white/[0.1]'
                }`}
              >
                {person.name || t('unnamed')}
              </button>
            ))}
          </div>
          <p className="text-sm text-white/50 -mt-2">
            {t('questionsFor')}{' '}
            <strong className="text-white/75">{activePerson?.name || '—'}</strong>
            {activePerson?.role ? ` (${activePerson.role})` : ''}
          </p>
          {invitationQuestions.map((block) => (
            <section key={block.id} className={cardClass}>
              <h2 className="text-lg font-semibold text-indigo-200 mb-4">{block.title}</h2>
              <ul className="space-y-3">
                {block.items.map((q, i) => (
                  <li key={i} className="flex gap-3 text-white/80 leading-relaxed">
                    <span className="text-indigo-400 font-mono text-sm shrink-0">{i + 1}.</span>
                    {q}
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <section className={`${cardClass} ring-1 ring-amber-400/25`}>
            <h2 className="text-lg font-semibold text-amber-100 mb-3">{t('liveExtra')}</h2>
            <p className="text-white/75 leading-relaxed">{liveOnlyQuestion}</p>
          </section>
        </div>
      )}

      {activeTab === 'meeting' && (
        <div className="space-y-8">
          <div className="flex flex-wrap gap-2">
            {draft.participants.map((person) => (
              <button
                key={person.id}
                type="button"
                onClick={() => setActiveParticipantId(person.id)}
                className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                  activePerson?.id === person.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/[0.06] text-white/60 hover:bg-white/[0.1]'
                }`}
              >
                {person.name || t('unnamed')}
                {person.role ? ` · ${person.role}` : ''}
              </button>
            ))}
          </div>
          {meetingSections.map(({ id, title }, idx) => (
            <section key={`${activePerson?.id}-${id}`} className={`${cardClass} space-y-4`}>
              <h2 className="text-lg font-semibold text-white">
                {activePerson?.name || t('personLabel')}: {title}
              </h2>
              <textarea
                className={`${textareaClass} ${ringColor[MEETING_NOTE_SECTIONS[idx]?.color] || ''}`}
                rows={6}
                placeholder={t('meetingNotesPlaceholder')}
                value={draft.meetingNotes.byParticipant[activePerson?.id]?.[id] ?? ''}
                onChange={(e) => updateMeeting(activePerson?.id, id, e.target.value)}
              />
            </section>
          ))}
        </div>
      )}

      {activeTab === 'after' && (
        <div className="space-y-8">
          <section className={`${cardClass} space-y-4`}>
            <h2 className="text-lg font-semibold text-white">{t('summary')}</h2>
            <textarea
              className={textareaClass}
              rows={6}
              placeholder={t('summaryPlaceholder')}
              value={draft.after.summary}
              onChange={(e) => updateAfter('summary', e.target.value)}
            />
          </section>
          <section className={`${cardClass} space-y-4`}>
            <h2 className="text-lg font-semibold text-white">{t('commitments')}</h2>
            <textarea
              className={textareaClass}
              rows={5}
              placeholder={t('commitmentsPlaceholder')}
              value={draft.after.personalCommitments}
              onChange={(e) => updateAfter('personalCommitments', e.target.value)}
            />
          </section>
          <section className={`${cardClass} space-y-4`}>
            <label className={labelClass}>{t('nextReview')}</label>
            <input
              type="date"
              className={fieldClass}
              value={draft.after.nextReviewDate}
              onChange={(e) => updateAfter('nextReviewDate', e.target.value)}
            />
          </section>
        </div>
      )}

      <footer className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-white/[0.08] bg-black/25 px-6 py-5 text-sm">
        <span className="flex items-start gap-3 text-white/55 max-w-xl">
          <Cloud className="w-5 h-5 shrink-0 mt-0.5" />
          Feld <code className="text-indigo-300/90">rampUpFeedback</code> in{' '}
          <code className="text-indigo-300/90">mawps-onboarding-progress</code> (eu-central-1)
        </span>
        <span
          className={`flex items-center gap-2 font-medium ${lastSyncError ? 'text-red-400' : 'text-emerald-400/95'}`}
        >
          {(isSyncing || isLoading) && <Loader2 className="w-4 h-4 animate-spin" />}
          {syncNote}
        </span>
      </footer>
    </div>
  );
}
