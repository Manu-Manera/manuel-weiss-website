import { useCallback, useEffect, useState } from 'react';
import { Bot, CheckCircle, Circle, Loader2, Lightbulb, Plus, Trash2 } from 'lucide-react';
import { getOpenAIApiKey } from '../../services/awsService';

const STATUS_OPTIONS = [
  { value: 'open', label: 'Offen', color: 'text-slate-400' },
  { value: 'in_progress', label: 'In Bearbeitung', color: 'text-amber-500' },
  { value: 'done', label: 'Erledigt', color: 'text-emerald-600' },
];

const PRIORITY_OPTIONS = [
  { value: 'high', label: 'Hoch', bg: 'bg-red-100 text-red-700' },
  { value: 'medium', label: 'Mittel', bg: 'bg-amber-100 text-amber-700' },
  { value: 'low', label: 'Niedrig', bg: 'bg-slate-100 text-slate-600' },
];

function newActionId() {
  return `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function KotterReflectionForm({ catalogItem, initial, disabled, onPersist, idPrefix = 'kotter' }) {
  const [draft, setDraft] = useState(() => ({
    ...initial,
    _actions: initial?._actions || [],
    _status: initial?._status || 'open',
    _aiTip: initial?._aiTip || '',
    _aiTipGeneratedAt: initial?._aiTipGeneratedAt || null,
  }));
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    const t = window.setTimeout(() => {
      onPersist(draft);
    }, 650);
    return () => window.clearTimeout(t);
  }, [draft, catalogItem.slug, onPersist]);

  const updateAnswer = useCallback((key, value) => {
    setDraft((d) => ({ ...d, [key]: value }));
  }, []);

  const setStatus = useCallback((status) => {
    setDraft((d) => ({ ...d, _status: status }));
  }, []);

  const addAction = useCallback(() => {
    setDraft((d) => ({
      ...d,
      _actions: [
        ...d._actions,
        { id: newActionId(), text: '', priority: 'medium', done: false },
      ],
    }));
  }, []);

  const updateAction = useCallback((id, field, value) => {
    setDraft((d) => ({
      ...d,
      _actions: d._actions.map((a) => (a.id === id ? { ...a, [field]: value } : a)),
    }));
  }, []);

  const removeAction = useCallback((id) => {
    setDraft((d) => ({
      ...d,
      _actions: d._actions.filter((a) => a.id !== id),
    }));
  }, []);

  const generateAiTip = useCallback(async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const apiKey = await getOpenAIApiKey();
      const key = apiKey || localStorage.getItem('openai-api-key');
      if (!key?.startsWith('sk-')) {
        setAiError('Kein OpenAI API-Key gefunden.');
        return;
      }

      const answersText = catalogItem.prompts
        .map((p) => `${p.question}\n→ ${(draft[p.key] || '').trim() || '(keine Antwort)'}`)
        .join('\n\n');

      const prompt = `Du bist ein Change-Management-Experte. Analysiere die folgenden Workshop-Antworten zum Kotter-Bereich "${catalogItem.label}" (${catalogItem.kotterChapter}) und gib 2-3 konkrete, umsetzbare Handlungsempfehlungen.

Kontext: ${catalogItem.description}

Antworten aus dem Workshop:
${answersText}

Gib deine Empfehlungen als kurze, prägnante Bullet-Points (max. 3 Punkte, je 1-2 Sätze). Fokussiere auf praktische nächste Schritte.`;

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: 'gpt-4.1',
          messages: [
            { role: 'system', content: 'Du bist ein erfahrener Change-Management-Berater. Antworte auf Deutsch, kurz und praxisnah.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.6,
          max_tokens: 500,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const tip = data.choices?.[0]?.message?.content || '';
      setDraft((d) => ({
        ...d,
        _aiTip: tip,
        _aiTipGeneratedAt: new Date().toISOString(),
      }));
    } catch (e) {
      setAiError(e?.message || 'KI-Anfrage fehlgeschlagen');
    } finally {
      setAiLoading(false);
    }
  }, [catalogItem, draft]);

  const statusOption = STATUS_OPTIONS.find((o) => o.value === draft._status) || STATUS_OPTIONS[0];
  const hasContent = catalogItem.prompts.some((p) => (draft[p.key] || '').trim().length > 0);
  const completedActions = draft._actions.filter((a) => a.done).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bereichs-Status</span>
          <div className="flex gap-1">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(opt.value)}
                disabled={disabled}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  draft._status === opt.value
                    ? 'bg-violet-100 text-violet-700 ring-2 ring-violet-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {opt.value === 'done' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                {opt.value === 'in_progress' && <Circle className="w-3 h-3 inline mr-1 fill-current" />}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        {hasContent && (
          <span className="text-xs text-slate-500">
            {catalogItem.prompts.filter((p) => (draft[p.key] || '').trim()).length}/{catalogItem.prompts.length} Fragen beantwortet
          </span>
        )}
      </div>

      <fieldset disabled={disabled} className="space-y-6 border-0 p-0 m-0">
        <legend className="sr-only">Reflexionsfragen</legend>
        {catalogItem.prompts.map((p, idx) => (
          <div key={p.key} className="cw-card-subtle space-y-2">
            <label className="block" htmlFor={`${idPrefix}-${catalogItem.slug}-${p.key}`}>
              <span className="text-xs font-bold text-violet-600 mr-2">{idx + 1}.</span>
              <span className="font-semibold text-slate-800 text-sm leading-snug">{p.question}</span>
            </label>
            <textarea
              id={`${idPrefix}-${catalogItem.slug}-${p.key}`}
              rows={4}
              className="cw-textarea min-h-0"
              placeholder={p.placeholder || 'Antworten …'}
              value={draft[p.key] ?? ''}
              onChange={(e) => updateAnswer(p.key, e.target.value)}
            />
          </div>
        ))}
      </fieldset>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-slate-800 text-sm flex items-center gap-2 m-0">
            <CheckCircle className="w-4 h-4 text-violet-600" aria-hidden />
            Maßnahmen für diesen Bereich
          </p>
          <button
            type="button"
            onClick={addAction}
            disabled={disabled}
            className="cw-btn cw-btn-ghost cw-btn-compact inline-flex items-center gap-1 text-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Hinzufügen
          </button>
        </div>

        {draft._actions.length === 0 ? (
          <p className="text-xs text-slate-500 italic">
            Noch keine Maßnahmen definiert. Klicke «Hinzufügen» um konkrete Action Items festzuhalten.
          </p>
        ) : (
          <div className="space-y-2">
            {draft._actions.map((action) => (
              <div
                key={action.id}
                className={`flex items-start gap-2 rounded-lg border p-2 transition-all ${
                  action.done ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => updateAction(action.id, 'done', !action.done)}
                  disabled={disabled}
                  className={`mt-1 shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    action.done
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-300 hover:border-violet-400'
                  }`}
                  title={action.done ? 'Als offen markieren' : 'Als erledigt markieren'}
                >
                  {action.done && <CheckCircle className="w-3 h-3" />}
                </button>
                <input
                  type="text"
                  value={action.text}
                  onChange={(e) => updateAction(action.id, 'text', e.target.value)}
                  disabled={disabled}
                  placeholder="Maßnahme beschreiben…"
                  className={`flex-1 text-sm bg-transparent border-0 p-0 focus:ring-0 ${
                    action.done ? 'line-through text-slate-500' : 'text-slate-800'
                  }`}
                />
                <select
                  value={action.priority}
                  onChange={(e) => updateAction(action.id, 'priority', e.target.value)}
                  disabled={disabled}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded border-0 ${
                    PRIORITY_OPTIONS.find((p) => p.value === action.priority)?.bg || ''
                  }`}
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeAction(action.id)}
                  disabled={disabled}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  title="Maßnahme entfernen"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {draft._actions.length > 0 && (
              <p className="text-xs text-slate-500 mt-2">
                {completedActions}/{draft._actions.length} erledigt
              </p>
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50/80 to-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-slate-800 text-sm flex items-center gap-2 m-0">
            <Lightbulb className="w-4 h-4 text-violet-600" aria-hidden />
            KI-Handlungsempfehlung
          </p>
          <button
            type="button"
            onClick={generateAiTip}
            disabled={disabled || aiLoading}
            className="cw-btn cw-btn-primary-solid cw-btn-compact inline-flex items-center gap-1.5 text-xs"
          >
            {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
            {draft._aiTip ? 'Neu generieren' : 'Tipp generieren'}
          </button>
        </div>

        {aiError && <p className="text-xs text-red-600">{aiError}</p>}

        {draft._aiTip ? (
          <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
            {draft._aiTip}
            {draft._aiTipGeneratedAt && (
              <p className="text-[10px] text-slate-400 mt-2">
                Generiert: {new Date(draft._aiTipGeneratedAt).toLocaleString('de-CH')}
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">
            Klicke «Tipp generieren» für kontextbezogene Handlungsempfehlungen basierend auf deinen Antworten.
          </p>
        )}
      </div>
    </div>
  );
}
