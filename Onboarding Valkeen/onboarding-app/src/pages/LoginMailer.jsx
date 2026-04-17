import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Mail,
  Upload,
  FileSpreadsheet,
  FileText,
  Download,
  Plus,
  Trash2,
  Save,
  Eye,
  Users,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  Loader2,
  RefreshCw,
  X,
  Edit3,
  Archive,
} from 'lucide-react';

import {
  listTemplates,
  getTemplate,
  saveTemplate,
  deleteTemplate,
  uploadImage,
  deleteImage,
  getImage,
  getStorageMode,
  setStorageMode,
  isUsingLocalFallback,
  fileToBase64,
} from '../services/tempusMailerService';

import {
  parseExcelFile,
  docxToHtml,
  fillTemplate,
  inlineImagesAsDataUris,
  buildEml,
  sanitizeFileName,
  downloadBlob,
  downloadEmlZip,
} from '../utils/mailerUtils';

const PLACEHOLDER_HINT = ['{NAME}', '{EMAIL}', '{URL}', '{USERNAME}', '{PASSWORD}'];

const STEP_DEF = [
  { id: 'data',     label: 'Empfänger',  desc: 'Excel laden' },
  { id: 'template', label: 'Vorlage',    desc: 'Auswählen / bearbeiten' },
  { id: 'preview',  label: 'Vorschau',   desc: 'E-Mails prüfen' },
  { id: 'download', label: 'Download',   desc: 'EML-Dateien' },
];

const DEFAULT_NEW_BODY = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8" /></head>
<body style="font-family: Calibri, 'Segoe UI', sans-serif; font-size: 11pt;">
<p>Hallo {NAME},</p>
<p>
  <strong>E-Mail:</strong> {EMAIL}<br />
  <strong>URL:</strong> <a href="{URL}">{URL}</a><br />
  <strong>Username:</strong> {USERNAME}<br />
  <strong>Password:</strong> {PASSWORD}
</p>
<p>Viele Grüße</p>
</body>
</html>`;

export default function LoginMailer() {
  const [step, setStep] = useState('data');
  const [storageMode, setStorageModeState] = useState('auto');
  const [usingLocal, setUsingLocal] = useState(false);

  useEffect(() => {
    setStorageModeState(getStorageMode());
  }, []);

  const changeStorageMode = (mode) => {
    setStorageMode(mode);
    setStorageModeState(mode);
    // Seite neu laden, damit Templates aus dem gewählten Backend kommen
    window.location.reload();
  };

  // --- Daten: Excel ---
  const [entries, setEntries] = useState([]);
  const [parseReport, setParseReport] = useState(null);
  const [senderEmail, setSenderEmail] = useState(() => {
    try { return localStorage.getItem('tempus_mailer_sender') || ''; } catch { return ''; }
  });
  useEffect(() => {
    try { localStorage.setItem('tempus_mailer_sender', senderEmail || ''); } catch { /* ignore */ }
  }, [senderEmail]);

  const excelInputRef = useRef(null);

  const onPickExcel = async (file) => {
    if (!file) return;
    try {
      const { entries, report } = await parseExcelFile(file);
      setEntries(entries);
      setParseReport({ file: file.name, sheets: report });
    } catch (err) {
      alert('Excel konnte nicht gelesen werden: ' + (err?.message || err));
    }
  };

  // --- Templates ---
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  const loadAllTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const list = await listTemplates();
      setTemplates(list);
      if (!selectedSlug && list.length) {
        setSelectedSlug(list[0].slug);
      }
      setUsingLocal(isUsingLocalFallback());
    } catch (err) {
      alert('Vorlagen konnten nicht geladen werden: ' + err.message);
    } finally {
      setLoadingTemplates(false);
    }
  };

  useEffect(() => {
    loadAllTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTemplateBySlug = async (slug) => {
    if (!slug) {
      setActiveTemplate(null);
      return;
    }
    setBusy(true);
    try {
      const tpl = await getTemplate(slug);
      // Wenn docx → vorab einmal zu HTML konvertieren, damit wir es anzeigen können
      if (tpl.bodyExt === 'docx' && tpl.bodyBase64) {
        try {
          tpl.renderedHtml = await docxToHtml(tpl.bodyBase64);
        } catch (err) {
          tpl.renderedHtml = `<pre>DOCX konnte nicht konvertiert werden: ${err.message}</pre>`;
        }
      }
      setActiveTemplate(tpl);
    } catch (err) {
      alert('Vorlage konnte nicht geladen werden: ' + err.message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (selectedSlug) loadTemplateBySlug(selectedSlug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlug]);

  const [editDraft, setEditDraft] = useState({ slug: '', title: '', subject: '', bodyHtml: '' });

  const openEditor = () => {
    if (!activeTemplate) return;
    setEditDraft({
      slug: activeTemplate.slug,
      title: activeTemplate.title,
      subject: activeTemplate.subject,
      bodyHtml: activeTemplate.bodyText || activeTemplate.renderedHtml || '',
    });
    setEditing(true);
  };

  const handleSave = async () => {
    setBusy(true);
    try {
      await saveTemplate({
        slug: editDraft.slug,
        title: editDraft.title,
        subject: editDraft.subject,
        bodyHtml: editDraft.bodyHtml,
      });
      await loadAllTemplates();
      await loadTemplateBySlug(editDraft.slug);
      setEditing(false);
    } catch (err) {
      alert('Speichern fehlgeschlagen: ' + err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleNewTemplate = async () => {
    const title = prompt('Name der neuen Vorlage:', 'Neue Vorlage');
    if (!title) return;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 60) || 'neu_' + Date.now();
    setBusy(true);
    try {
      await saveTemplate({ slug, title, subject: 'Tempus Login', bodyHtml: DEFAULT_NEW_BODY });
      await loadAllTemplates();
      setSelectedSlug(slug);
    } catch (err) {
      alert('Vorlage konnte nicht angelegt werden: ' + err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!activeTemplate) return;
    if (!confirm(`Vorlage "${activeTemplate.title}" wirklich löschen?`)) return;
    setBusy(true);
    try {
      await deleteTemplate(activeTemplate.slug);
      setActiveTemplate(null);
      setSelectedSlug('');
      await loadAllTemplates();
    } catch (err) {
      alert('Löschen fehlgeschlagen: ' + err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleUploadDocx = async (file) => {
    if (!activeTemplate) return;
    setBusy(true);
    try {
      const base64 = await fileToBase64(file);
      await saveTemplate({
        slug: activeTemplate.slug,
        title: activeTemplate.title,
        subject: activeTemplate.subject,
        bodyBase64Docx: base64,
      });
      await loadTemplateBySlug(activeTemplate.slug);
    } catch (err) {
      alert('Word-Upload fehlgeschlagen: ' + err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (!activeTemplate) return;
    setBusy(true);
    try {
      await uploadImage(activeTemplate.slug, file);
      await loadTemplateBySlug(activeTemplate.slug);
    } catch (err) {
      alert('Bild-Upload fehlgeschlagen: ' + err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleImageDelete = async (name) => {
    if (!activeTemplate) return;
    if (!confirm(`Bild "${name}" löschen?`)) return;
    setBusy(true);
    try {
      await deleteImage(activeTemplate.slug, name);
      await loadTemplateBySlug(activeTemplate.slug);
    } catch (err) {
      alert('Bild löschen fehlgeschlagen: ' + err.message);
    } finally {
      setBusy(false);
    }
  };

  // --- Vorschau / Rendering pro Empfänger ---
  const [imageData, setImageData] = useState([]); // base64 objects
  useEffect(() => {
    // Bilder als Base64 laden, damit wir sie inline bzw. als cid einbetten können
    (async () => {
      if (!activeTemplate || !activeTemplate.images?.length) { setImageData([]); return; }
      try {
        const all = [];
        for (const img of activeTemplate.images) {
          const data = await getImage(activeTemplate.slug, img.name);
          all.push({ name: img.name, contentType: data.contentType, bodyBase64: data.bodyBase64 });
        }
        setImageData(all);
      } catch (err) {
        console.warn('Bilder konnten nicht vorab geladen werden:', err);
        setImageData([]);
      }
    })();
  }, [activeTemplate]);

  const templateRawHtml = activeTemplate?.bodyExt === 'docx'
    ? (activeTemplate.renderedHtml || '')
    : (activeTemplate?.bodyText || '');

  const validEntries = useMemo(() => entries.filter(e => e.email), [entries]);

  const [previewIndex, setPreviewIndex] = useState(0);
  useEffect(() => { setPreviewIndex(0); }, [selectedSlug, entries]);

  const currentPreviewHtml = useMemo(() => {
    if (!templateRawHtml || !validEntries.length) return '';
    const entry = validEntries[previewIndex] || validEntries[0];
    const filled = fillTemplate(templateRawHtml, entry);
    return inlineImagesAsDataUris(filled, imageData);
  }, [templateRawHtml, validEntries, previewIndex, imageData]);

  const currentSubject = useMemo(() => {
    if (!activeTemplate || !validEntries.length) return activeTemplate?.subject || '';
    return fillTemplate(activeTemplate.subject || '', validEntries[previewIndex] || validEntries[0]);
  }, [activeTemplate, validEntries, previewIndex]);

  // --- Downloads ---

  const buildEmlForEntry = (entry) => {
    const filledHtml = fillTemplate(templateRawHtml, entry);
    const filledSubject = fillTemplate(activeTemplate?.subject || '', entry);
    return buildEml({
      to: entry.email,
      from: senderEmail || undefined,
      subject: filledSubject,
      html: filledHtml,
      images: imageData,
    });
  };

  const downloadSingleEml = (entry) => {
    const content = buildEmlForEntry(entry);
    const fname = `${sanitizeFileName(entry.name || entry.email)}.eml`;
    downloadBlob(fname, new Blob([content], { type: 'message/rfc822' }));
  };

  const downloadAllEmls = async () => {
    if (!validEntries.length || !activeTemplate) return;
    const entriesZip = validEntries.map(entry => ({
      name: `${sanitizeFileName(entry.name || entry.email)}.eml`,
      content: buildEmlForEntry(entry),
    }));
    const zipName = `${sanitizeFileName(activeTemplate.slug)}_${new Date().toISOString().slice(0, 10)}.zip`;
    await downloadEmlZip(zipName, entriesZip);
  };

  // ------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          <span className="gradient-text">Tempus Login Mailer</span>
        </h1>
        <p className="text-white/60">
          Excel laden → Vorlage wählen → personalisierte Outlook-Entwürfe (.eml) herunterladen
        </p>
      </div>

      {/* ── SPEICHER-HINWEIS ── */}
      {usingLocal && (
        <div className="glass rounded-2xl p-4 border border-cyan-400/30 bg-cyan-500/5 flex items-center gap-3 flex-wrap">
          <AlertTriangle className="w-5 h-5 text-cyan-300 flex-shrink-0" />
          <div className="flex-1 min-w-[220px]">
            <p className="text-sm text-cyan-100 font-semibold">Lokaler Speicher-Modus aktiv</p>
            <p className="text-xs text-white/60">
              Die AWS-Lambda ist aktuell nicht verfügbar. Deine Vorlagen liegen solange nur im Browser dieses Geräts.
              Sobald das Backend deployed ist, werden sie automatisch in S3 synchronisiert.
            </p>
          </div>
          <select
            value={storageMode}
            onChange={(e) => changeStorageMode(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm"
          >
            <option value="auto">Auto (Cloud, Fallback lokal)</option>
            <option value="cloud">Nur Cloud</option>
            <option value="local">Nur lokal</option>
          </select>
        </div>
      )}

      {/* ── SCHRITTLEISTE ── */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {STEP_DEF.map((s, idx) => {
          const active = step === s.id;
          const done = STEP_DEF.findIndex(x => x.id === step) > idx;
          return (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left flex-shrink-0 ${
                active
                  ? 'bg-indigo-500/20 border-indigo-400/40 text-white'
                  : done
                    ? 'bg-emerald-500/10 border-emerald-400/30 text-white/80'
                    : 'bg-white/5 border-white/10 text-white/50 hover:text-white/80'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                active ? 'bg-indigo-500 text-white' : done ? 'bg-emerald-500 text-white' : 'bg-white/10'
              }`}>
                {done ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold leading-tight">{s.label}</p>
                <p className="text-xs opacity-70">{s.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── STEP 1: EXCEL ── */}
      {step === 'data' && (
        <section className="glass rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-semibold">Empfängerliste aus Excel laden</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Absender (From)</label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="manu@firma.ch"
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm"
              />
              <p className="text-xs text-white/40 mt-1">Wird in den Entwurf übernommen. Leer lassen, wenn Outlook den Absender selbst bestimmt.</p>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Excel-Datei (.xlsx/.xls)</label>
              <div className="flex gap-2">
                <button
                  onClick={() => excelInputRef.current?.click()}
                  className="flex-1 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-medium flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" /> Excel auswählen
                </button>
                <input
                  ref={excelInputRef}
                  type="file"
                  accept=".xlsx,.xls,.xlsm,.csv"
                  onChange={(e) => onPickExcel(e.target.files?.[0])}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {parseReport && (
            <div className="mt-2 p-4 rounded-xl bg-white/5 border border-white/10 text-sm">
              <p className="font-semibold mb-2">{parseReport.file}</p>
              <ul className="space-y-1 text-white/70">
                {parseReport.sheets.map((s, i) => (
                  <li key={i}>
                    Blatt <span className="font-mono text-white/90">{s.sheet}</span>: {s.imported} Zeilen importiert
                    {' '}(<span className="text-emerald-300">{s.withEmail} mit E-Mail</span>)
                  </li>
                ))}
              </ul>
            </div>
          )}

          {entries.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-white/60">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">#</th>
                    <th className="px-3 py-2 text-left font-semibold">Name</th>
                    <th className="px-3 py-2 text-left font-semibold">E-Mail</th>
                    <th className="px-3 py-2 text-left font-semibold">Username</th>
                    <th className="px-3 py-2 text-left font-semibold">URL</th>
                    <th className="px-3 py-2 text-left font-semibold">Passwort</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.slice(0, 200).map((e, i) => (
                    <tr key={i} className="border-t border-white/5">
                      <td className="px-3 py-2 text-white/40">{i + 1}</td>
                      <td className="px-3 py-2">{e.name || <span className="text-white/30">—</span>}</td>
                      <td className="px-3 py-2">
                        {e.email
                          ? <span className="font-mono text-emerald-300">{e.email}</span>
                          : <span className="text-red-300 text-xs inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" />ohne E-Mail</span>}
                      </td>
                      <td className="px-3 py-2 text-white/70">{e.username}</td>
                      <td className="px-3 py-2 text-white/50 truncate max-w-[200px]">{e.url}</td>
                      <td className="px-3 py-2 font-mono text-white/60">{e.password}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {entries.length > 200 && (
                <div className="px-3 py-2 text-xs text-white/40 bg-white/5 border-t border-white/10">
                  … {entries.length - 200} weitere Zeilen ausgeblendet.
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setStep('template')}
              disabled={!validEntries.length}
              className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium"
            >
              Weiter: Vorlage wählen →
            </button>
          </div>
        </section>
      )}

      {/* ── STEP 2: VORLAGE ── */}
      {step === 'template' && (
        <section className="glass rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold">Vorlage auswählen</h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadAllTemplates}
                disabled={loadingTemplates}
                className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loadingTemplates ? 'animate-spin' : ''}`} />
                Neu laden
              </button>
              <button
                onClick={handleNewTemplate}
                className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Neue Vorlage
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-[280px_1fr] gap-4">
            {/* Template-Liste */}
            <div className="space-y-2">
              {loadingTemplates && (
                <div className="text-white/50 text-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Lade Vorlagen…
                </div>
              )}
              {!loadingTemplates && templates.length === 0 && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white/60">
                  Noch keine Vorlagen in S3. Klicke oben auf <b>Neue Vorlage</b>.
                </div>
              )}
              {templates.map((t) => {
                const active = t.slug === selectedSlug;
                return (
                  <button
                    key={t.slug}
                    onClick={() => setSelectedSlug(t.slug)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      active
                        ? 'bg-purple-500/20 border-purple-400/40'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <p className="font-semibold text-sm truncate">{t.title}</p>
                    <p className="text-xs text-white/40 truncate">{t.bodyFile}</p>
                  </button>
                );
              })}
            </div>

            {/* Template-Details */}
            <div className="min-h-[300px]">
              {busy && !activeTemplate && (
                <div className="flex items-center gap-2 text-white/60"><Loader2 className="w-4 h-4 animate-spin" /> Lade…</div>
              )}
              {activeTemplate && !editing && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <h3 className="text-lg font-semibold">{activeTemplate.title}</h3>
                      <p className="text-xs text-white/40">
                        Slug: <span className="font-mono">{activeTemplate.slug}</span> · Body: <span className="font-mono">{activeTemplate.bodyFile}</span>
                      </p>
                    </div>
                    <button onClick={openEditor} className="px-3 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-sm font-medium flex items-center gap-2">
                      <Edit3 className="w-4 h-4" /> Bearbeiten
                    </button>
                    <button onClick={handleDelete} className="px-3 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-sm font-medium flex items-center gap-2">
                      <Trash2 className="w-4 h-4" /> Löschen
                    </button>
                  </div>

                  <div>
                    <p className="text-sm text-white/60 mb-1">Betreff</p>
                    <p className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm">{activeTemplate.subject}</p>
                  </div>

                  <div>
                    <p className="text-sm text-white/60 mb-2">Body-Vorschau (roh, ohne Platzhalter-Ersetzung)</p>
                    <div
                      className="rounded-xl bg-white text-slate-900 p-4 max-h-[400px] overflow-auto text-sm"
                      dangerouslySetInnerHTML={{
                        __html: inlineImagesAsDataUris(
                          activeTemplate.bodyExt === 'docx'
                            ? (activeTemplate.renderedHtml || '')
                            : (activeTemplate.bodyText || ''),
                          imageData
                        )
                      }}
                    />
                  </div>

                  {/* Word-Upload + Bilder */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-400" /> Word-Vorlage ersetzen
                      </p>
                      <p className="text-xs text-white/50 mb-3">Lädt eine .docx hoch und speichert sie als Body dieser Vorlage.</p>
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-sm font-semibold">
                        <Upload className="w-4 h-4" /> .docx hochladen
                        <input
                          type="file"
                          accept=".docx"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadDocx(f); e.target.value = ''; }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-pink-400" /> Bilder
                      </p>
                      <p className="text-xs text-white/50 mb-2">
                        In HTML referenzieren mit <code className="px-1 bg-white/10 rounded">&lt;img src="bilder/datei.png"&gt;</code>.
                      </p>
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-pink-500 hover:bg-pink-400 text-white text-sm font-semibold mb-3">
                        <Upload className="w-4 h-4" /> Bild hochladen
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ''; }}
                          className="hidden"
                        />
                      </label>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {(activeTemplate.images || []).map((img) => (
                          <div key={img.name} className="flex items-center justify-between gap-2 text-xs">
                            <span className="font-mono truncate text-white/70">{img.name}</span>
                            <button onClick={() => handleImageDelete(img.name)} className="text-red-300 hover:text-red-200">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {(!activeTemplate.images || !activeTemplate.images.length) && (
                          <p className="text-xs text-white/30">— Keine Bilder —</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTemplate && editing && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-semibold">Vorlage bearbeiten</h3>
                  </div>
                  <input
                    value={editDraft.title}
                    onChange={(e) => setEditDraft(d => ({ ...d, title: e.target.value }))}
                    placeholder="Titel"
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm"
                  />
                  <input
                    value={editDraft.subject}
                    onChange={(e) => setEditDraft(d => ({ ...d, subject: e.target.value }))}
                    placeholder="Betreff"
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm"
                  />
                  <div className="flex flex-wrap gap-1">
                    {PLACEHOLDER_HINT.map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setEditDraft(d => ({ ...d, bodyHtml: d.bodyHtml + p }))}
                        className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-mono"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={editDraft.bodyHtml}
                    onChange={(e) => setEditDraft(d => ({ ...d, bodyHtml: e.target.value }))}
                    rows={18}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900/80 border border-white/20 text-sm font-mono"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm">Abbrechen</button>
                    <button
                      onClick={handleSave}
                      disabled={busy}
                      className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                    >
                      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Speichern
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between gap-2 pt-2">
            <button onClick={() => setStep('data')} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm">← Zurück</button>
            <button
              onClick={() => setStep('preview')}
              disabled={!activeTemplate || !validEntries.length}
              className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium"
            >
              Weiter: Vorschau →
            </button>
          </div>
        </section>
      )}

      {/* ── STEP 3: VORSCHAU ── */}
      {step === 'preview' && (
        <section className="glass rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <Eye className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-semibold">Vorschau</h2>
            <span className="ml-auto text-sm text-white/50">
              <Users className="w-4 h-4 inline-block mr-1" />
              {validEntries.length} Empfänger · {previewIndex + 1} / {validEntries.length}
            </span>
          </div>

          {!activeTemplate || !validEntries.length ? (
            <div className="text-white/60 text-sm">Wähle zuerst eine Vorlage und lade eine Excel-Liste.</div>
          ) : (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  disabled={previewIndex <= 0}
                  onClick={() => setPreviewIndex(i => Math.max(0, i - 1))}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm disabled:opacity-40"
                >← Vorheriger</button>
                <select
                  value={previewIndex}
                  onChange={(e) => setPreviewIndex(parseInt(e.target.value, 10))}
                  className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm min-w-[260px]"
                >
                  {validEntries.map((e, i) => (
                    <option key={i} value={i}>
                      {i + 1}. {e.name || e.email}
                    </option>
                  ))}
                </select>
                <button
                  disabled={previewIndex >= validEntries.length - 1}
                  onClick={() => setPreviewIndex(i => Math.min(validEntries.length - 1, i + 1))}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm disabled:opacity-40"
                >Nächster →</button>

                <button
                  onClick={() => downloadSingleEml(validEntries[previewIndex])}
                  className="ml-auto px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold text-sm flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Diese als .eml
                </button>
              </div>

              <div className="grid md:grid-cols-[1fr_2fr] gap-4">
                <div className="space-y-2 text-sm">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/40 text-xs">An</p>
                    <p className="font-mono text-emerald-300 break-all">{validEntries[previewIndex]?.email}</p>
                  </div>
                  {senderEmail && (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-white/40 text-xs">Von</p>
                      <p className="font-mono">{senderEmail}</p>
                    </div>
                  )}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/40 text-xs">Betreff</p>
                    <p className="font-semibold">{currentSubject}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/40 text-xs mb-1">Variablen</p>
                    <ul className="space-y-0.5 text-xs">
                      <li><span className="text-white/40">Name:</span> {validEntries[previewIndex]?.name}</li>
                      <li><span className="text-white/40">Username:</span> <span className="font-mono">{validEntries[previewIndex]?.username}</span></li>
                      <li><span className="text-white/40">Passwort:</span> <span className="font-mono">{validEntries[previewIndex]?.password}</span></li>
                      <li><span className="text-white/40">URL:</span> <span className="font-mono break-all">{validEntries[previewIndex]?.url}</span></li>
                    </ul>
                  </div>
                </div>
                <div className="rounded-xl bg-white text-slate-900 p-5 max-h-[520px] overflow-auto text-sm shadow-inner"
                     dangerouslySetInnerHTML={{ __html: currentPreviewHtml || '<p>— leer —</p>' }} />
              </div>
            </>
          )}

          <div className="flex justify-between gap-2 pt-2">
            <button onClick={() => setStep('template')} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm">← Zurück</button>
            <button
              onClick={() => setStep('download')}
              disabled={!activeTemplate || !validEntries.length}
              className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium"
            >
              Weiter: Download →
            </button>
          </div>
        </section>
      )}

      {/* ── STEP 4: DOWNLOAD ── */}
      {step === 'download' && (
        <section className="glass rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <Download className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-semibold">E-Mails herunterladen</h2>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 space-y-2">
            <p>
              Alle Entwürfe liegen als <b>.eml</b>-Datei vor. Doppelklick auf Mac öffnet sie in <b>Outlook/Mail</b> als Entwurf,
              auf Windows öffnet sie Outlook ebenfalls als Entwurf inkl. HTML-Body und eingebundener Bilder.
            </p>
            <p className="text-xs text-white/50">
              Tipp: Für viele Empfänger als ZIP herunterladen, entpacken, alle .eml-Dateien markieren und auf das
              Outlook-Symbol im Dock ziehen.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <button
              onClick={downloadAllEmls}
              disabled={!validEntries.length || !activeTemplate}
              className="p-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3"
            >
              <Archive className="w-5 h-5" />
              <div className="text-left">
                <p>ZIP aller {validEntries.length} Entwürfe</p>
                <p className="text-xs opacity-70 font-normal">Eine .zip mit allen .eml-Dateien</p>
              </div>
            </button>

            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400" /> Einzeln herunterladen
              </p>
              <div className="max-h-[260px] overflow-y-auto space-y-1 text-sm">
                {validEntries.map((e, i) => (
                  <button
                    key={i}
                    onClick={() => downloadSingleEml(e)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-left"
                  >
                    <span className="truncate">
                      <span className="text-white/60 text-xs mr-2">{i + 1}.</span>
                      <span>{e.name || e.email}</span>
                    </span>
                    <Download className="w-4 h-4 text-white/40 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-2 pt-2">
            <button onClick={() => setStep('preview')} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm">← Zurück</button>
            <button onClick={() => { setStep('data'); }} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm">
              ↻ Neuer Durchlauf
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
