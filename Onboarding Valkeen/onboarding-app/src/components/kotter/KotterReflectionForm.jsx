import { useEffect, useState } from 'react';

export function KotterReflectionForm({ catalogItem, initial, disabled, onPersist, idPrefix = 'kotter' }) {
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
          <label className="block" htmlFor={`${idPrefix}-${catalogItem.slug}-${p.key}`}>
            <span className="font-semibold text-slate-800 text-sm leading-snug">{p.question}</span>
          </label>
          <textarea
            id={`${idPrefix}-${catalogItem.slug}-${p.key}`}
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
