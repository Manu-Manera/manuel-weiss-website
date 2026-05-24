import { useEffect, useState } from 'react';
import { Save, Plus, Trash2, ChevronUp, ChevronDown, Loader2, AlertTriangle, Upload } from 'lucide-react';
import { listSlides, getSlide, putSlide, deleteSlide, getUploadUrl, uploadImageToS3 } from '../../services/trainingAdminService';
import { newSlide, newBlock, validateSlide } from '../../data/trainingSchema';

const BLOCK_LABEL = {
  heading: 'Überschrift',
  text: 'Text (Markdown)',
  image: 'Bild',
  video: 'Video',
  callout: 'Callout',
  code: 'Code',
  quiz: 'Quiz'
};

const BLOCK_TYPES = ['heading', 'text', 'image', 'video', 'callout', 'code', 'quiz'];

export default function SlideEditor({ customerId }) {
  const [slides, setSlides] = useState([]);
  const [slideId, setSlideId] = useState(null);
  const [slide, setSlide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);
  const [info, setInfo] = useState(null);
  const [uploading, setUploading] = useState(null);

  useEffect(() => {
    if (!customerId) return;
    void refreshList();
  }, [customerId]);

  useEffect(() => {
    if (!customerId || !slideId) { setSlide(null); return; }
    void loadSlide(slideId);
  }, [slideId, customerId]);

  async function refreshList() {
    setLoading(true);
    try {
      const data = await listSlides(customerId);
      setSlides(data?.slides || []);
      if (data?.slides?.length && !slideId) setSlideId(data.slides[0].id);
    } catch (e) {
      setErrors([`Listen-Fehler: ${e.message}`]);
    } finally { setLoading(false); }
  }

  async function loadSlide(id) {
    setLoading(true);
    try {
      const s = await getSlide(customerId, id);
      setSlide(s);
    } catch (e) {
      setErrors([`Slide-Lade-Fehler: ${e.message}`]);
      setSlide(null);
    } finally { setLoading(false); }
  }

  async function createSlide() {
    const s = newSlide(customerId, { title: 'Neue Folie' });
    setSlide(s);
    setSlideId(s.id);
  }

  async function save() {
    if (!slide) return;
    const errs = validateSlide(slide);
    if (errs.length) { setErrors(errs); return; }
    setSaving(true);
    setErrors([]);
    try {
      await putSlide(customerId, slide);
      setInfo('Folie gespeichert.');
      setTimeout(() => setInfo(null), 3000);
      await refreshList();
    } catch (e) {
      setErrors([`Speicher-Fehler: ${e.message}`]);
    } finally { setSaving(false); }
  }

  async function remove() {
    if (!slide || !window.confirm(`Folie "${slide.title}" löschen?`)) return;
    try {
      await deleteSlide(customerId, slide.id);
      setSlide(null);
      setSlideId(null);
      await refreshList();
    } catch (e) {
      setErrors([`Lösch-Fehler: ${e.message}`]);
    }
  }

  function addBlock(type) {
    setSlide((s) => ({ ...(s || newSlide(customerId)), blocks: [...((s?.blocks) || []), newBlock(type)] }));
  }

  function patchBlock(idx, partial) {
    setSlide((s) => ({ ...s, blocks: s.blocks.map((b, i) => (i === idx ? { ...b, ...partial } : b)) }));
  }

  function moveBlock(idx, dir) {
    setSlide((s) => {
      const arr = [...s.blocks];
      const j = idx + dir;
      if (j < 0 || j >= arr.length) return s;
      const [removed] = arr.splice(idx, 1);
      arr.splice(j, 0, removed);
      return { ...s, blocks: arr };
    });
  }

  function removeBlock(idx) {
    setSlide((s) => ({ ...s, blocks: s.blocks.filter((_, i) => i !== idx) }));
  }

  async function handleUpload(idx, file) {
    if (!file) return;
    try {
      setUploading(idx);
      const editId = `slide_${slide.id}_${idx}_${Date.now().toString(36)}`;
      const { uploadUrl, publicUrl } = await getUploadUrl(editId, file.type, customerId);
      await uploadImageToS3(uploadUrl, file);
      patchBlock(idx, { src: publicUrl });
    } catch (e) {
      setErrors([`Upload-Fehler: ${e.message}`]);
    } finally { setUploading(null); }
  }

  if (!customerId) return <div className="text-white/60">Bitte zuerst Kunde wählen.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={slideId || ''}
            onChange={(e) => setSlideId(e.target.value || null)}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
          >
            <option value="">– Folie wählen –</option>
            {slides.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
          <button
            onClick={createSlide}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-300 text-sm"
          >
            <Plus className="w-4 h-4" /> Neue Folie
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={save}
            disabled={!slide || saving}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Speichern
          </button>
          {slide && (
            <button onClick={remove} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 text-sm">
              <Trash2 className="w-4 h-4" /> Löschen
            </button>
          )}
        </div>
      </div>

      {errors.length > 0 && (
        <div className="glass-card p-3 border-red-500/30 bg-red-500/10 text-red-300 text-sm flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5" />
          <ul className="list-disc list-inside">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
        </div>
      )}
      {info && <div className="glass-card p-3 border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm">{info}</div>}

      {loading && <div className="text-white/60 text-sm flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Lade…</div>}

      {slide && (
        <div className="glass-card p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={slide.title}
              onChange={(e) => setSlide((s) => ({ ...s, title: e.target.value }))}
              placeholder="Folien-Titel"
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
            />
            <input
              value={slide.subtitle || ''}
              onChange={(e) => setSlide((s) => ({ ...s, subtitle: e.target.value }))}
              placeholder="Untertitel"
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
            />
          </div>

          <div className="border-t border-white/10 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/80 font-semibold">Blöcke ({slide.blocks?.length || 0})</span>
              <div className="flex flex-wrap gap-2">
                {BLOCK_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => addBlock(t)}
                    className="text-xs px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-white/70"
                  >
                    + {BLOCK_LABEL[t]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {(slide.blocks || []).map((b, i) => (
                <div key={b.id} className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300">{BLOCK_LABEL[b.type] ?? b.type}</span>
                    <button onClick={() => moveBlock(i, -1)} className="text-white/40 hover:text-white"><ChevronUp className="w-4 h-4" /></button>
                    <button onClick={() => moveBlock(i, 1)} className="text-white/40 hover:text-white"><ChevronDown className="w-4 h-4" /></button>
                    <button onClick={() => removeBlock(i)} className="ml-auto text-red-400 hover:bg-red-500/15 rounded p-1"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  {renderBlockEditor(b, i, patchBlock, handleUpload, uploading)}
                </div>
              ))}
              {(!slide.blocks || slide.blocks.length === 0) && (
                <div className="text-white/40 text-sm py-6 text-center border border-dashed border-white/10 rounded-xl">
                  Keine Blöcke – klicke oben einen Typ.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function renderBlockEditor(block, idx, patchBlock, handleUpload, uploading) {
  switch (block.type) {
    case 'heading':
      return (
        <input
          value={block.text || ''}
          onChange={(e) => patchBlock(idx, { text: e.target.value })}
          placeholder="Überschrift"
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-base font-semibold"
        />
      );
    case 'text':
    case 'callout':
      return (
        <div className="space-y-2">
          {block.type === 'callout' && (
            <select
              value={block.variant || 'info'}
              onChange={(e) => patchBlock(idx, { variant: e.target.value })}
              className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white"
            >
              <option value="info">Info</option>
              <option value="tip">Tipp</option>
              <option value="warn">Warnung</option>
              <option value="success">Erfolg</option>
            </select>
          )}
          <textarea
            value={block.markdown || ''}
            onChange={(e) => patchBlock(idx, { markdown: e.target.value })}
            placeholder="Markdown-Text (**fett**, *kursiv*, `code`)"
            rows={4}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-mono"
          />
        </div>
      );
    case 'image':
    case 'video':
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              value={block.src || ''}
              onChange={(e) => patchBlock(idx, { src: e.target.value })}
              placeholder={`${block.type === 'image' ? 'Bild' : 'Video'}-URL oder Upload`}
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
            />
            <label className="cursor-pointer flex items-center gap-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-sm">
              {uploading === idx ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Upload
              <input
                type="file"
                accept={block.type === 'image' ? 'image/*' : 'video/*'}
                onChange={(e) => handleUpload(idx, e.target.files?.[0])}
                className="hidden"
              />
            </label>
          </div>
          {block.type === 'image' && block.src && (
            <img src={block.src} alt={block.alt || ''} className="max-h-40 rounded-lg" />
          )}
          <input
            value={block.caption || ''}
            onChange={(e) => patchBlock(idx, { caption: e.target.value })}
            placeholder="Bildunterschrift (optional)"
            className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
          />
        </div>
      );
    case 'code':
      return (
        <div className="space-y-2">
          <input
            value={block.language || 'plaintext'}
            onChange={(e) => patchBlock(idx, { language: e.target.value })}
            placeholder="Sprache (z.B. js, sql, plaintext)"
            className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
          />
          <textarea
            value={block.text || ''}
            onChange={(e) => patchBlock(idx, { text: e.target.value })}
            placeholder="Code-Snippet"
            rows={5}
            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm font-mono"
          />
        </div>
      );
    case 'quiz':
      return (
        <div className="space-y-2">
          {(block.questions || []).map((q, qi) => (
            <div key={q.id} className="rounded-lg bg-white/5 p-3 space-y-2">
              <input
                value={q.text}
                onChange={(e) => patchBlock(idx, {
                  questions: block.questions.map((qq, j) => j === qi ? { ...qq, text: e.target.value } : qq)
                })}
                placeholder="Frage"
                className="w-full px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-white text-sm"
              />
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`q_${q.id}`}
                    checked={q.correctIndex === oi}
                    onChange={() => patchBlock(idx, {
                      questions: block.questions.map((qq, j) => j === qi ? { ...qq, correctIndex: oi } : qq)
                    })}
                  />
                  <input
                    value={opt}
                    onChange={(e) => patchBlock(idx, {
                      questions: block.questions.map((qq, j) =>
                        j === qi ? { ...qq, options: qq.options.map((o, k) => k === oi ? e.target.value : o) } : qq
                      )
                    })}
                    placeholder={`Option ${oi + 1}`}
                    className="flex-1 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-white text-sm"
                  />
                </div>
              ))}
            </div>
          ))}
          <button
            onClick={() => patchBlock(idx, {
              questions: [...(block.questions || []), { id: 'q_' + Date.now().toString(36), text: '', options: ['', '', '', ''], correctIndex: 0 }]
            })}
            className="text-xs px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-white/70"
          >
            + Frage
          </button>
        </div>
      );
    default:
      return null;
  }
}
