import { useState, useEffect } from 'react';
import { Settings2, Save, Upload, Image, Type } from 'lucide-react';
import { getTrainingConfig, saveTrainingConfig, getUploadUrl, uploadImageToS3 } from '../services/trainingAdminService';
import {
  DEFAULT_TABS,
  DEFAULT_LOGO,
  DEFAULT_DASHBOARD,
  DEFAULT_SCREENSHOTS
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
    })()
  };
}

export default function TrainingAdmin() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('logo');
  const [uploading, setUploading] = useState(null);

  useEffect(() => {
    loadConfig();
  }, []);

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
    { id: 'dashboard', label: 'Dashboard', icon: Image },
    { id: 'screenshots', label: 'Screenshots', icon: Image }
  ];

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
          <h2 className="text-xl font-semibold text-indigo-400">Tab-Bezeichnungen</h2>
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
              </div>
            ))}
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
