import { useState, useEffect } from 'react';
import { Settings2, Save, Upload, Image, Type, Plus, Trash2, GripVertical, FileText } from 'lucide-react';
import { getTrainingConfig, saveTrainingConfig, getUploadUrl, uploadImageToS3 } from '../services/trainingAdminService';
import {
  DEFAULT_TABS,
  DEFAULT_LOGO,
  DEFAULT_DASHBOARD,
  DEFAULT_SCREENSHOTS,
  genId,
  createBlock,
  createQuizQuestion
} from '../data/trainingAdminDefaults';

function mergeConfig(saved) {
  return {
    logo: { ...DEFAULT_LOGO, ...(saved?.logo || {}) },
    tabs: saved?.tabs?.length ? saved.tabs : DEFAULT_TABS,
    dashboard: { ...DEFAULT_DASHBOARD, ...(saved?.dashboard || {}) },
    screenshots: (() => {
      const map = {};
      DEFAULT_SCREENSHOTS.forEach(s => { map[s.id] = { ...s }; });
      if (saved?.screenshots) {
        Object.entries(saved.screenshots).forEach(([k, v]) => {
          if (map[k]) map[k] = { ...map[k], ...v };
        });
      }
      return map;
    })(),
    pages: saved?.pages || {}
  };
}

export default function TrainingAdmin() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('logo');
  const [uploading, setUploading] = useState(null);
  const [selectedPageTab, setSelectedPageTab] = useState(null);

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    if (config?.tabs?.length && !selectedPageTab) setSelectedPageTab(config.tabs[0].id);
  }, [config?.tabs, selectedPageTab]);

  async function loadConfig() {
    try {
      setLoading(true);
      const saved = await getTrainingConfig();
      setConfig(mergeConfig(saved));
      setError(null);
    } catch (e) {
      setError(e.message);
      setConfig(mergeConfig({}));
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      await saveTrainingConfig(config);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(editId, file) {
    try {
      setUploading(editId);
      const { uploadUrl, publicUrl } = await getUploadUrl(editId, file.type);
      await uploadImageToS3(uploadUrl, file);
      setConfig(prev => ({
        ...prev,
        screenshots: {
          ...prev.screenshots,
          [editId]: { ...prev.screenshots[editId], src: publicUrl }
        }
      }));
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(null);
    }
  }

  const sections = [
    { id: 'logo', label: 'Logo & Header', icon: Type },
    { id: 'tabs', label: 'Tabs', icon: Settings2 },
    { id: 'pages', label: 'Seiten (pro Tab)', icon: FileText },
    { id: 'dashboard', label: 'Dashboard', icon: Image },
    { id: 'screenshots', label: 'Screenshots', icon: Image }
  ];

  const selectedTabForPage = selectedPageTab || config.tabs[0]?.id;
  const pageBlocks = (config.pages?.[selectedTabForPage]?.blocks || []);

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-white/60">Lade Konfiguration…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Settings2 className="w-8 h-8 text-amber-400" />
            Training Admin
          </h1>
          <p className="text-white/60">
            Bearbeite Logo, Tabs, Überschriften und alle Screenshots. Änderungen werden in AWS gespeichert.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Speichern…' : 'In AWS speichern'}
        </button>
      </div>

      {error && (
        <div className="glass-card p-4 border border-red-500/30 bg-red-500/10 text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
              activeSection === id ? 'bg-indigo-500/30 text-white' : 'bg-white/5 hover:bg-white/10 text-white/70'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Logo & Header */}
      {activeSection === 'logo' && (
        <div className="glass-card p-6 space-y-6">
          <h2 className="text-xl font-semibold text-indigo-400">Logo & Header</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-1">Logo-Text (z.B. TR)</label>
              <input
                type="text"
                value={config.logo.logoText}
                onChange={e => setConfig(prev => ({ ...prev, logo: { ...prev.logo, logoText: e.target.value } }))}
                className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Bezeichnung (z.B. Tempus Resource)</label>
              <input
                type="text"
                value={config.logo.logoLabel}
                onChange={e => setConfig(prev => ({ ...prev, logo: { ...prev.logo, logoLabel: e.target.value } }))}
                className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Logo-Bild (URL, optional – überschreibt Logo-Text)</label>
              <input
                type="url"
                placeholder="https://..."
                value={config.logo.logoImageUrl || ''}
                onChange={e => setConfig(prev => ({ ...prev, logo: { ...prev.logo, logoImageUrl: e.target.value || null } }))}
                className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      {activeSection === 'tabs' && (
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-indigo-400">Tabs</h2>
            <button
              onClick={() => {
                const newId = 'tab_' + genId();
                setConfig(prev => ({ ...prev, tabs: [...prev.tabs, { id: newId, label: 'Neuer Tab', advanced: false }] }));
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400"
            >
              <Plus className="w-4 h-4" />
              Tab hinzufügen
            </button>
          </div>
          <div className="space-y-4">
            {config.tabs.map((tab, i) => (
              <div key={tab.id} className="flex items-center gap-4">
                <input
                  type="text"
                  value={tab.label}
                  onChange={e => {
                    const next = [...config.tabs];
                    next[i] = { ...next[i], label: e.target.value };
                    setConfig(prev => ({ ...prev, tabs: next }));
                  }}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
                <label className="flex items-center gap-2 text-white/60">
                  <input
                    type="checkbox"
                    checked={tab.advanced}
                    onChange={e => {
                      const next = [...config.tabs];
                      next[i] = { ...next[i], advanced: e.target.checked };
                      setConfig(prev => ({ ...prev, tabs: next }));
                    }}
                  />
                  Advanced
                </label>
                <button
                  onClick={() => {
                    if (config.tabs.length <= 1) return;
                    const next = config.tabs.filter((_, j) => j !== i);
                    setConfig(prev => ({ ...prev, tabs: next }));
                    if (selectedPageTab === tab.id) setSelectedPageTab(next[0]?.id);
                  }}
                  className="p-2 rounded-lg text-red-400 hover:bg-red-500/20"
                  title="Tab entfernen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seiten (pro Tab) */}
      {activeSection === 'pages' && (
        <div className="glass-card p-6 space-y-6">
          <h2 className="text-xl font-semibold text-indigo-400">Seiten bearbeiten</h2>
          <p className="text-white/60 text-sm">Jeder Tab hat eine eigene Seite. Wähle einen Tab und bearbeite Zeilen, Bilder und Quiz.</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {config.tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedPageTab(tab.id)}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  selectedTabForPage === tab.id ? 'bg-indigo-500 text-white' : 'bg-white/5 hover:bg-white/10 text-white/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="border-t border-white/10 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-white/80">Inhaltsblöcke für «{config.tabs.find(t => t.id === selectedTabForPage)?.label}»</h3>
              <div className="flex gap-2">
                <button onClick={() => setConfig(prev => ({
                  ...prev,
                  pages: {
                    ...prev.pages,
                    [selectedTabForPage]: {
                      blocks: [...(prev.pages?.[selectedTabForPage]?.blocks || []), createBlock('text')]
                    }
                  }
                })} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-sm">
                  <Plus className="w-4 h-4" /> Text
                </button>
                <button onClick={() => setConfig(prev => ({
                  ...prev,
                  pages: {
                    ...prev.pages,
                    [selectedTabForPage]: {
                      blocks: [...(prev.pages?.[selectedTabForPage]?.blocks || []), createBlock('image')]
                    }
                  }
                })} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-sm">
                  <Plus className="w-4 h-4" /> Bild
                </button>
                <button onClick={() => setConfig(prev => ({
                  ...prev,
                  pages: {
                    ...prev.pages,
                    [selectedTabForPage]: {
                      blocks: [...(prev.pages?.[selectedTabForPage]?.blocks || []), createBlock('quiz')]
                    }
                  }
                })} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-sm">
                  <Plus className="w-4 h-4" /> Quiz
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {pageBlocks.map((block, bi) => (
                <div key={block.id} className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-white/40 mt-2"><GripVertical className="w-4 h-4" /></span>
                    <div className="flex-1 space-y-3">
                      {block.type === 'text' && (
                        <>
                          <input
                            type="text"
                            placeholder="Überschrift"
                            value={block.title}
                            onChange={e => setConfig(prev => {
                              const blocks = [...(prev.pages?.[selectedTabForPage]?.blocks || [])];
                              blocks[bi] = { ...blocks[bi], title: e.target.value };
                              return { ...prev, pages: { ...prev.pages, [selectedTabForPage]: { blocks } } };
                            })}
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                          />
                          <textarea
                            placeholder="Inhalt (Text, HTML möglich)"
                            value={block.content}
                            onChange={e => setConfig(prev => {
                              const blocks = [...(prev.pages?.[selectedTabForPage]?.blocks || [])];
                              blocks[bi] = { ...blocks[bi], content: e.target.value };
                              return { ...prev, pages: { ...prev.pages, [selectedTabForPage]: { blocks } } };
                            })}
                            rows={4}
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                          />
                        </>
                      )}
                      {block.type === 'image' && (
                        <>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Bild-URL oder Screenshot-ID"
                              value={block.src}
                              onChange={e => setConfig(prev => {
                                const blocks = [...(prev.pages?.[selectedTabForPage]?.blocks || [])];
                                blocks[bi] = { ...blocks[bi], src: e.target.value };
                                return { ...prev, pages: { ...prev.pages, [selectedTabForPage]: { blocks } } };
                              })}
                              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                            />
                            <label className="cursor-pointer px-3 py-2 rounded-lg bg-indigo-500/50 hover:bg-indigo-500/70 text-sm">
                              <Upload className="w-4 h-4 inline mr-1" />
                              {uploading === block.id ? '…' : 'Hochladen'}
                              <input type="file" accept="image/*" className="hidden" onChange={async e => {
                                const f = e.target.files?.[0];
                                if (f) {
                                  try {
                                    setUploading(block.id);
                                    const { uploadUrl, publicUrl } = await getUploadUrl(block.id, f.type);
                                    await uploadImageToS3(uploadUrl, f);
                                    setConfig(prev => {
                                      const blocks = [...(prev.pages?.[selectedTabForPage]?.blocks || [])];
                                      blocks[bi] = { ...blocks[bi], src: publicUrl };
                                      return { ...prev, pages: { ...prev.pages, [selectedTabForPage]: { blocks } } };
                                    });
                                  } catch (err) { setError(err.message); } finally { setUploading(null); }
                                }
                                e.target.value = '';
                              }} />
                            </label>
                          </div>
                          <input
                            type="text"
                            placeholder="Bildunterschrift"
                            value={block.caption || ''}
                            onChange={e => setConfig(prev => {
                              const blocks = [...(prev.pages?.[selectedTabForPage]?.blocks || [])];
                              blocks[bi] = { ...blocks[bi], caption: e.target.value };
                              return { ...prev, pages: { ...prev.pages, [selectedTabForPage]: { blocks } } };
                            })}
                            className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white"
                          />
                        </>
                      )}
                      {block.type === 'quiz' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-indigo-400 font-medium">Quiz-Fragen</span>
                            <button
                              onClick={() => setConfig(prev => {
                                const blocks = [...(prev.pages?.[selectedTabForPage]?.blocks || [])];
                                const qs = [...(blocks[bi].questions || []), createQuizQuestion()];
                                blocks[bi] = { ...blocks[bi], questions: qs };
                                return { ...prev, pages: { ...prev.pages, [selectedTabForPage]: { blocks } } };
                              }}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-sm"
                            >
                              <Plus className="w-3 h-3" /> Frage unten hinzufügen
                            </button>
                          </div>
                          {(block.questions || []).map((q, qi) => (
                            <div key={q.id} className="rounded-lg bg-white/5 p-3 space-y-2">
                              <div className="flex items-center gap-2">
                                <GripVertical className="w-4 h-4 text-white/40" />
                                <span className="text-white/60 text-sm">Frage {qi + 1}</span>
                                <button
                                  onClick={() => qi > 0 && setConfig(prev => {
                                    const blocks = [...(prev.pages?.[selectedTabForPage]?.blocks || [])];
                                    const qs = [...(blocks[bi].questions || [])];
                                    [qs[qi - 1], qs[qi]] = [qs[qi], qs[qi - 1]];
                                    blocks[bi] = { ...blocks[bi], questions: qs };
                                    return { ...prev, pages: { ...prev.pages, [selectedTabForPage]: { blocks } } };
                                  })}
                                  disabled={qi === 0}
                                  className="px-1.5 py-0.5 rounded text-xs text-white/50 hover:bg-white/10 disabled:opacity-30"
                                >
                                  ↑
                                </button>
                                <button
                                  onClick={() => qi < (block.questions?.length || 0) - 1 && setConfig(prev => {
                                    const blocks = [...(prev.pages?.[selectedTabForPage]?.blocks || [])];
                                    const qs = [...(blocks[bi].questions || [])];
                                    [qs[qi], qs[qi + 1]] = [qs[qi + 1], qs[qi]];
                                    blocks[bi] = { ...blocks[bi], questions: qs };
                                    return { ...prev, pages: { ...prev.pages, [selectedTabForPage]: { blocks } } };
                                  })}
                                  disabled={qi === (block.questions?.length || 0) - 1}
                                  className="px-1.5 py-0.5 rounded text-xs text-white/50 hover:bg-white/10 disabled:opacity-30"
                                >
                                  ↓
                                </button>
                                <button
                                  onClick={() => setConfig(prev => {
                                    const blocks = [...(prev.pages?.[selectedTabForPage]?.blocks || [])];
                                    const qs = (blocks[bi].questions || []).filter((_, j) => j !== qi);
                                    blocks[bi] = { ...blocks[bi], questions: qs };
                                    return { ...prev, pages: { ...prev.pages, [selectedTabForPage]: { blocks } } };
                                  }}
                                  className="ml-auto p-1 rounded text-red-400 hover:bg-red-500/20"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <input
                                type="text"
                                placeholder="Fragentext"
                                value={q.text}
                                onChange={e => setConfig(prev => {
                                  const blocks = [...(prev.pages?.[selectedTabForPage]?.blocks || [])];
                                  const qs = [...(blocks[bi].questions || [])];
                                  qs[qi] = { ...qs[qi], text: e.target.value };
                                  blocks[bi] = { ...blocks[bi], questions: qs };
                                  return { ...prev, pages: { ...prev.pages, [selectedTabForPage]: { blocks } } };
                                })}
                                className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                {(q.options || ['', '', '', '']).map((opt, oi) => (
                                  <div key={oi} className="flex items-center gap-2">
                                    <label className="flex items-center gap-1 text-white/60 text-xs w-6">
                                      <input
                                        type="radio"
                                        name={`q-${block.id}`}
                                        checked={q.correctIndex === oi}
                                        onChange={() => setConfig(prev => {
                                          const blocks = [...(prev.pages?.[selectedTabForPage]?.blocks || [])];
                                          const qs = [...(blocks[bi].questions || [])];
                                          qs[qi] = { ...qs[qi], correctIndex: oi };
                                          blocks[bi] = { ...blocks[bi], questions: qs };
                                          return { ...prev, pages: { ...prev.pages, [selectedTabForPage]: { blocks } } };
                                        })}
                                      />
                                      {String.fromCharCode(97 + oi)}
                                    </label>
                                    <input
                                      type="text"
                                      placeholder={`Antwort ${String.fromCharCode(97 + oi)}`}
                                      value={opt}
                                      onChange={e => setConfig(prev => {
                                        const blocks = [...(prev.pages?.[selectedTabForPage]?.blocks || [])];
                                        const qs = [...(blocks[bi].questions || [])];
                                        const opts = [...(qs[qi].options || [])];
                                        opts[oi] = e.target.value;
                                        qs[qi] = { ...qs[qi], options: opts };
                                        blocks[bi] = { ...blocks[bi], questions: qs };
                                        return { ...prev, pages: { ...prev.pages, [selectedTabForPage]: { blocks } } };
                                      })}
                                      className="flex-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-sm"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setConfig(prev => {
                        const blocks = (prev.pages?.[selectedTabForPage]?.blocks || []).filter((_, j) => j !== bi);
                        return { ...prev, pages: { ...prev.pages, [selectedTabForPage]: { blocks } } };
                      })}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-500/20"
                      title="Block entfernen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => bi > 0 && setConfig(prev => {
                        const blocks = [...(prev.pages?.[selectedTabForPage]?.blocks || [])];
                        [blocks[bi - 1], blocks[bi]] = [blocks[bi], blocks[bi - 1]];
                        return { ...prev, pages: { ...prev.pages, [selectedTabForPage]: { blocks } } };
                      })}
                      disabled={bi === 0}
                      className="px-2 py-1 rounded text-sm text-white/60 hover:bg-white/10 disabled:opacity-30"
                    >
                      ↑ Nach oben
                    </button>
                    <button
                      onClick={() => bi < pageBlocks.length - 1 && setConfig(prev => {
                        const blocks = [...(prev.pages?.[selectedTabForPage]?.blocks || [])];
                        [blocks[bi], blocks[bi + 1]] = [blocks[bi + 1], blocks[bi]];
                        return { ...prev, pages: { ...prev.pages, [selectedTabForPage]: { blocks } } };
                      })}
                      disabled={bi === pageBlocks.length - 1}
                      className="px-2 py-1 rounded text-sm text-white/60 hover:bg-white/10 disabled:opacity-30"
                    >
                      ↓ Nach unten
                    </button>
                  </div>
                </div>
              ))}
              {pageBlocks.length === 0 && (
                <p className="text-white/40 text-center py-8">Noch keine Blöcke. Klicke auf «Text», «Bild» oder «Quiz» um hinzuzufügen.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dashboard */}
      {activeSection === 'dashboard' && (
        <div className="glass-card p-6 space-y-6">
          <h2 className="text-xl font-semibold text-indigo-400">Dashboard Überschrift</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-1">Titel</label>
              <input
                type="text"
                value={config.dashboard.title}
                onChange={e => setConfig(prev => ({ ...prev, dashboard: { ...prev.dashboard, title: e.target.value } }))}
                className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Untertitel</label>
              <textarea
                value={config.dashboard.subtitle}
                onChange={e => setConfig(prev => ({ ...prev, dashboard: { ...prev.dashboard, subtitle: e.target.value } }))}
                rows={3}
                className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Screenshots */}
      {activeSection === 'screenshots' && (
        <div className="glass-card p-6 space-y-6">
          <h2 className="text-xl font-semibold text-indigo-400">Screenshots ({Object.keys(config.screenshots).length})</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(config.screenshots).map(([id, sc]) => (
              <div key={id} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                <div className="aspect-video bg-black/30 flex items-center justify-center relative">
                  {sc.src ? (
                    <img
                      src={sc.src.startsWith('http') ? sc.src : `${window.location.origin}/Onboarding%20Valkeen/docs/${sc.src}`}
                      alt={sc.alt}
                      className="max-h-40 object-contain"
                    />
                  ) : (
                    <span className="text-white/40">Kein Bild</span>
                  )}
                  <label className="absolute bottom-2 right-2 cursor-pointer px-3 py-1.5 rounded-lg bg-indigo-500/80 hover:bg-indigo-500 text-sm">
                    <Upload className="w-4 h-4 inline mr-1" />
                    {uploading === id ? '…' : 'Hochladen'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) handleImageUpload(id, f);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
                <div className="p-3 space-y-2">
                  <input
                    type="text"
                    placeholder="Bildunterschrift"
                    value={sc.caption}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      screenshots: {
                        ...prev.screenshots,
                        [id]: { ...prev.screenshots[id], caption: e.target.value }
                      }
                    }))}
                    className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white"
                  />
                  <input
                    type="text"
                    placeholder="Alt-Text"
                    value={sc.alt}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      screenshots: {
                        ...prev.screenshots,
                        [id]: { ...prev.screenshots[id], alt: e.target.value }
                      }
                    }))}
                    className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
