import { useEffect, useState } from 'react';
import { X, Save } from 'lucide-react';
import { ui } from './kickoffStudioI18n';

const LAYOUTS = ['content', 'capture', 'workshop_qa', 'decisions', 'checklist'];

export default function KickoffSlideEditor({
  open,
  locale,
  initial,
  isNew,
  onSave,
  onClose,
}) {
  const t = (k) => ui(locale, k);
  const [draft, setDraft] = useState(initial || {});

  useEffect(() => {
    if (open) setDraft(initial || {});
  }, [open, initial]);

  if (!open) return null;

  const bulletsText = (draft.bullets || []).join('\n');

  const handleSave = () => {
    const bullets = bulletsText
      .split('\n')
      .map((b) => b.trim())
      .filter(Boolean);
    onSave({
      ...draft,
      bullets: draft.layout === 'content' ? bullets : draft.bullets,
      items: draft.layout === 'checklist' ? bullets : draft.items,
    });
  };

  return (
    <div className="kickoff-slide-editor-backdrop" role="dialog" aria-modal="true">
      <div className="kickoff-slide-editor">
        <div className="kickoff-slide-editor-head">
          <strong>{isNew ? t('slideEditorNew') : t('slideEditorEdit')}</strong>
          <button type="button" className="kickoff-icon-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="kickoff-slide-editor-body">
          <label>
            <span>{t('slideEditorHeadline')}</span>
            <input
              className="kickoff-input"
              value={draft.headline || ''}
              onChange={(e) => setDraft((d) => ({ ...d, headline: e.target.value }))}
            />
          </label>
          <label>
            <span>{t('slideEditorSubline')}</span>
            <input
              className="kickoff-input"
              value={draft.subline || ''}
              onChange={(e) => setDraft((d) => ({ ...d, subline: e.target.value }))}
            />
          </label>
          <label>
            <span>{t('slideEditorLayout')}</span>
            <select
              className="kickoff-input"
              value={draft.layout || 'content'}
              onChange={(e) => setDraft((d) => ({ ...d, layout: e.target.value }))}
            >
              {LAYOUTS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{t('slideEditorDesign')}</span>
            <select
              className="kickoff-input"
              value={draft.designStyle || 'cards'}
              onChange={(e) => setDraft((d) => ({ ...d, designStyle: e.target.value }))}
            >
              <option value="cards">{t('slideDesignCards')}</option>
              <option value="plain">{t('slideDesignPlain')}</option>
            </select>
          </label>
          {(draft.layout === 'content' || !draft.layout) && (
            <label>
              <span>{t('slideEditorBullets')}</span>
              <textarea
                className="kickoff-input kickoff-textarea"
                rows={8}
                value={bulletsText}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    bullets: e.target.value.split('\n'),
                  }))
                }
                placeholder={t('slideEditorBulletsHint')}
              />
            </label>
          )}
        </div>
        <div className="kickoff-slide-editor-foot">
          <button type="button" className="kickoff-btn-secondary" onClick={onClose}>
            {t('slideEditorCancel')}
          </button>
          <button type="button" className="kickoff-btn-primary" onClick={handleSave}>
            <Save className="w-4 h-4" /> {t('slideEditorSave')}
          </button>
        </div>
      </div>
    </div>
  );
}
