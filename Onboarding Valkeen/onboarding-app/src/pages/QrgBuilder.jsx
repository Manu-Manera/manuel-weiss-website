import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FileText,
  Download,
  Save,
  Upload,
  Printer,
  Package,
  Sparkles,
  Settings2,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  FileSpreadsheet,
  Calendar,
  Users,
  UserCheck,
  Building2,
  Globe,
  Palette,
  Workflow,
  Layers,
  CheckCircle2,
  Info,
  Lightbulb,
} from 'lucide-react';

import { defaultConfig, presets, getPresetConfig } from '../data/qrgPresets';
import { qrgTemplates, buildAllQrgs } from '../data/qrgTemplates';
import {
  downloadDocx,
  downloadJson,
  downloadMarkdown,
  downloadAllAsZip,
  readJsonFile,
  printPreview,
  slugify,
} from '../utils/qrgExport';

const STORAGE_KEY = 'qrg-builder-config-v1';

const ICONS = {
  FileSpreadsheet,
  Sparkles,
  Calendar,
  Users,
  UserCheck,
};

// ──────────────────────────────────────────────────────────────
// Block renderer (preview)
// ──────────────────────────────────────────────────────────────
function renderInline(text) {
  const parts = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let m;
  let key = 0;
  const t = String(text ?? '');
  while ((m = re.exec(t))) {
    if (m.index > last) parts.push(t.slice(last, m.index));
    parts.push(<strong key={`b-${key++}`} className="font-semibold text-white">{m[1]}</strong>);
    last = m.index + m[0].length;
  }
  if (last < t.length) parts.push(t.slice(last));
  return parts;
}

function PreviewBlock({ block, accent }) {
  switch (block.type) {
    case 'h1':
      return (
        <h1 className="text-2xl font-bold mt-8 mb-3 pb-2 border-b" style={{ borderColor: accent, color: accent }}>
          {block.text}
        </h1>
      );
    case 'h2':
      return <h2 className="text-xl font-semibold mt-6 mb-2 text-white">{block.text}</h2>;
    case 'h3':
      return <h3 className="text-base font-semibold mt-4 mb-2 text-white/90">{block.text}</h3>;
    case 'p':
      return <p className="text-sm leading-relaxed text-white/70 mb-3">{renderInline(block.text)}</p>;
    case 'ul':
      return (
        <ul className="space-y-1.5 mb-3 ml-4 list-disc text-sm text-white/70">
          {block.items.map((it, i) => <li key={i} className="leading-relaxed">{renderInline(it)}</li>)}
        </ul>
      );
    case 'ol':
      return (
        <ol className="space-y-1.5 mb-3 ml-5 list-decimal text-sm text-white/70">
          {block.items.map((it, i) => <li key={i} className="leading-relaxed">{renderInline(it)}</li>)}
        </ol>
      );
    case 'note':
      return (
        <div className="my-4 p-4 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-100/90">{renderInline(block.text)}</p>
        </div>
      );
    case 'tip':
      return (
        <div className="my-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/30 flex items-start gap-3">
          <Lightbulb className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-100/90">{renderInline(block.text)}</p>
        </div>
      );
    case 'table':
      return (
        <div className="my-4 overflow-x-auto">
          {block.caption && <p className="text-xs uppercase tracking-wider text-white/40 mb-2">{block.caption}</p>}
          <table className="w-full text-xs border border-white/10 rounded-lg overflow-hidden">
            <thead>
              <tr style={{ background: accent }}>
                {block.columns.map((c, i) => (
                  <th key={i} className="text-left px-2.5 py-2 font-semibold text-white">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((r, ri) => (
                <tr key={ri} className={ri % 2 ? 'bg-white/[0.02]' : ''}>
                  {r.map((cell, ci) => (
                    <td key={ci} className="px-2.5 py-2 align-top text-white/70 border-t border-white/5">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'spacer':
      return <div className="h-4" />;
    default:
      return null;
  }
}

// ──────────────────────────────────────────────────────────────
// Form helpers
// ──────────────────────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <label className="block mb-5">
      <span className="block text-xs uppercase tracking-wider text-white/50 mb-2 font-medium">{label}</span>
      {children}
      {hint && <span className="block text-xs text-white/40 mt-2 leading-relaxed">{hint}</span>}
    </label>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-400/50 focus:bg-white/[0.07] transition"
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-indigo-400/50 focus:bg-white/[0.07] transition"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-slate-900">{o.label}</option>
      ))}
    </select>
  );
}

function Toggle({ checked, onChange, label, sub }) {
  return (
    <label className="flex items-start gap-4 cursor-pointer p-3 -mx-3 rounded-xl hover:bg-white/5 transition">
      <span
        className={`relative shrink-0 w-10 h-6 rounded-full transition mt-0.5 ${checked ? 'bg-indigo-500' : 'bg-white/10'}`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition ${checked ? 'left-5' : 'left-1'}`}
        />
      </span>
      <input type="checkbox" className="sr-only" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="text-sm leading-snug">
        <span className="text-white/85 block">{label}</span>
        {sub && <span className="text-xs text-white/45 block mt-1">{sub}</span>}
      </span>
    </label>
  );
}

function MultiCheck({ value, onChange, options }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value?.includes(o);
        return (
          <button
            type="button"
            key={o}
            onClick={() => {
              const set = new Set(value || []);
              if (active) set.delete(o); else set.add(o);
              onChange(Array.from(set));
            }}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition border ${
              active
                ? 'bg-indigo-500/25 border-indigo-400/50 text-indigo-100'
                : 'bg-white/5 border-white/10 text-white/55 hover:bg-white/10'
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function Section({ title, icon: Icon, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/5 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left text-white/85 hover:text-white transition"
      >
        <span className="flex items-center gap-3">
          {Icon && <Icon className="w-4 h-4 text-indigo-400" />}
          <span className="font-semibold text-sm">{title}</span>
        </span>
        {open ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Main page
// ──────────────────────────────────────────────────────────────
export default function QrgBuilder() {
  const [config, setConfig] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return getPresetConfig('blank');
  });
  const [activeQrgId, setActiveQrgId] = useState('excel');
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef(null);
  const previewScrollRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // ignore
    }
  }, [config]);

  // Available QRGs based on role flags
  const qrgs = useMemo(() => buildAllQrgs(config), [config]);
  const activeQrg = qrgs.find((q) => q.id === activeQrgId) || qrgs[0];

  const update = (path, val) => {
    setConfig((prev) => {
      const next = structuredClone(prev);
      const keys = path.split('.');
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) {
        cur[keys[i]] = cur[keys[i]] ?? {};
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = val;
      return next;
    });
  };

  const applyPreset = (presetId) => {
    setConfig(getPresetConfig(presetId));
  };

  const resetConfig = () => {
    if (confirm('Konfiguration auf Defaults zurücksetzen?')) {
      setConfig(structuredClone(defaultConfig));
    }
  };

  // ── Export Handlers ─────────────────────────────────────────
  const baseName = slugify(config.meta.customerShort || 'customer');

  const onExportDocx = async () => {
    if (!activeQrg) return;
    setExporting(true);
    try {
      await downloadDocx(activeQrg.blocks, `${baseName}-${activeQrg.id}-qrg.docx`, {
        accentColor: config.meta.primaryColor,
      });
    } finally {
      setExporting(false);
    }
  };

  const onExportMd = () => {
    if (!activeQrg) return;
    downloadMarkdown(activeQrg.blocks, `${baseName}-${activeQrg.id}-qrg.md`);
  };

  const onExportProfile = () => {
    downloadJson(config, `${baseName}-qrg-profile.json`);
  };

  const onLoadProfile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const loaded = await readJsonFile(file);
      if (loaded && typeof loaded === 'object' && loaded.meta && loaded.instance) {
        setConfig(loaded);
      } else {
        alert('Profil-JSON sieht ungültig aus.');
      }
    } catch {
      alert('Konnte JSON nicht lesen.');
    } finally {
      e.target.value = '';
    }
  };

  const onExportAll = async () => {
    setExporting(true);
    try {
      await downloadAllAsZip(qrgs, config);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] uppercase tracking-wider text-white/40 font-medium">Tempus Onboarding</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-semibold">NEU</span>
          </div>
          <h1 className="text-3xl font-bold">
            <span className="gradient-text">QRG Builder</span>
          </h1>
          <p className="text-white/55 text-sm mt-1.5 max-w-2xl">
            Quick Reference Guides pro Kundeninstanz — Profil wählen, Variablen anpassen, fertige DOCX/MD-Dateien herunterladen.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={''}
            onChange={(e) => {
              if (!e.target.value) return;
              applyPreset(e.target.value);
              e.target.value = '';
            }}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-indigo-400/50 transition"
            title="Kundenprofil laden"
          >
            <option value="" className="bg-slate-900">Preset laden…</option>
            {presets.map((p) => (
              <option key={p.id} value={p.id} className="bg-slate-900">{p.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/80 hover:bg-white/10 transition flex items-center gap-2"
            title="Profil aus JSON-Datei laden"
          >
            <Upload className="w-4 h-4" /> Laden
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={onLoadProfile}
          />
          <button
            type="button"
            onClick={onExportProfile}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/80 hover:bg-white/10 transition flex items-center gap-2"
            title="Aktuelle Konfiguration als JSON speichern"
          >
            <Save className="w-4 h-4" /> Profil
          </button>
          <button
            type="button"
            onClick={resetConfig}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/60 hover:text-white/90 transition flex items-center gap-2"
            title="Auf Defaults zurücksetzen"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── 2-Spalten-Layout: Config + Preview ─────────────── */}
      <div className="grid lg:grid-cols-[360px_1fr] xl:grid-cols-[400px_1fr] 2xl:grid-cols-[440px_1fr] gap-8 xl:gap-10 items-start">
        {/* ───────── Linke Spalte: Config-Panel ───────── */}
        <aside className="glass rounded-2xl border border-white/10 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto print:hidden">
          <div className="px-5 pt-5 pb-3 flex items-center gap-3 border-b border-white/5">
            <Settings2 className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-sm text-white/90">Kundenkonfiguration</span>
          </div>

          <Section title="Branding" icon={Palette} defaultOpen>
            <Field label="Kundenname (lang)">
              <TextInput value={config.meta.customerName} onChange={(v) => update('meta.customerName', v)} placeholder="Almirall, Siemens Healthineers…" />
            </Field>
            <Field label="Kurzname (Dateinamen, Titel)">
              <TextInput value={config.meta.customerShort} onChange={(v) => update('meta.customerShort', v)} placeholder="Almirall" />
            </Field>
            <Field label="Sprache">
              <Select
                value={config.meta.language}
                onChange={(v) => update('meta.language', v)}
                options={[
                  { value: 'en', label: 'Englisch (Standard)' },
                  { value: 'de', label: 'Deutsch' },
                ]}
              />
            </Field>
            <Field label="Primärfarbe (Headings, Tabelle)">
              <div className="flex gap-2">
                <input
                  type="color"
                  value={config.meta.primaryColor}
                  onChange={(e) => update('meta.primaryColor', e.target.value)}
                  className="w-12 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                />
                <TextInput value={config.meta.primaryColor} onChange={(v) => update('meta.primaryColor', v)} placeholder="#0d7fa0" />
              </div>
            </Field>
          </Section>

          <Section title="Tempus-Instanz" icon={Globe}>
            <Field label="Tempus-URL" hint="Vollständige URL inkl. /sg/">
              <TextInput value={config.instance.tempusUrl} onChange={(v) => update('instance.tempusUrl', v)} placeholder="https://customer.tempus-resource.com/sg/" />
            </Field>
            <Field label="SSO-Button-Beschriftung" hint='z.B. "Continue With Microsoft", "Healthineers-ID Login"'>
              <TextInput value={config.instance.ssoButtonLabel} onChange={(v) => update('instance.ssoButtonLabel', v)} />
            </Field>
            <Field label="Anzahl Homepage-Tiles">
              <TextInput type="number" value={config.instance.homepageTileCount} onChange={(v) => update('instance.homepageTileCount', v)} />
            </Field>
            <Toggle
              checked={config.instance.helpCenterAccess}
              onChange={(v) => update('instance.helpCenterAccess', v)}
              label="Help Center Zugang"
              sub="Tempus Resource Help Center freigeschaltet"
            />
          </Section>

          <Section title="Terminologie" icon={Workflow}>
            <Field label="Proposal-Bezeichnung" hint='"Proposal" (default), "Opportunity" (SHS), oder leer (Cegeka)'>
              <Select
                value={config.terminology.proposalLabel}
                onChange={(v) => update('terminology.proposalLabel', v)}
                options={[
                  { value: 'Proposal', label: 'Proposal' },
                  { value: 'Opportunity', label: 'Opportunity' },
                  { value: '', label: '— nicht verwendet —' },
                ]}
              />
            </Field>
            <Field label="BAU/Non-Project-Bezeichnung">
              <Select
                value={config.terminology.bauLabel}
                onChange={(v) => update('terminology.bauLabel', v)}
                options={[
                  { value: 'Non-Project Activities', label: 'Non-Project Activities' },
                  { value: 'BAU', label: 'BAU' },
                  { value: '', label: '— nicht verwendet —' },
                ]}
              />
            </Field>
            <Field label="Grid-Bezeichnung">
              <Select
                value={config.terminology.gridLabel}
                onChange={(v) => update('terminology.gridLabel', v)}
                options={[
                  { value: 'Project Management Grid', label: 'Project Management Grid' },
                  { value: 'Work Management Grid', label: 'Work Management Grid' },
                ]}
              />
            </Field>
            <Field label="Reject-Aktion durch RM">
              <Select
                value={config.terminology.rejectActionLabel}
                onChange={(v) => update('terminology.rejectActionLabel', v)}
                options={[
                  { value: 'reject', label: 'reject (Standard)' },
                  { value: 'delegate', label: 'delegate (Cegeka)' },
                ]}
              />
            </Field>
          </Section>

          <Section title="Resource-Typen" icon={Users}>
            <Toggle
              checked={config.resources.hasNamed}
              onChange={(v) => update('resources.hasNamed', v)}
              label="Named Resources"
              sub="Individuen mit Capacity & ggf. Login"
            />
            <Toggle
              checked={config.resources.hasGroup}
              onChange={(v) => update('resources.hasGroup', v)}
              label="Group Resources"
              sub="z.B. QP Generic (SAB) bei Almirall"
            />
            {config.resources.hasGroup && (
              <Field label="Beispiel für Group Resource">
                <TextInput value={config.resources.groupExample} onChange={(v) => update('resources.groupExample', v)} placeholder="QP Generic (SAB)" />
              </Field>
            )}
            <Toggle
              checked={config.resources.hasDemandPlanning}
              onChange={(v) => update('resources.hasDemandPlanning', v)}
              label="Demand Planning Resources"
              sub="Generische Platzhalter (Teams, Rollen)"
            />
          </Section>

          <Section title="Project-Typen" icon={Building2}>
            <Toggle checked={config.projects.hasStandard} onChange={(v) => update('projects.hasStandard', v)} label="Standard-Projekte" />
            <Toggle checked={config.projects.hasProposals} onChange={(v) => update('projects.hasProposals', v)} label={`${config.terminology.proposalLabel || 'Proposal'}-Projekte`} sub="vor Approval" />
            <Toggle checked={config.projects.hasBau} onChange={(v) => update('projects.hasBau', v)} label={`${config.terminology.bauLabel || 'Non-Project'}-Projekte`} sub="Absence, Admin, Run, Change" />
            <Field label="Custom Attributes (Beispielliste)">
              <TextInput
                value={config.projects.customAttributesExamples}
                onChange={(v) => update('projects.customAttributesExamples', v)}
                placeholder="Priority, Stage, Product, Phase…"
              />
            </Field>
          </Section>

          <Section title="Capacity & Units" icon={Layers}>
            <Field label="Capacity Units (Mehrfachauswahl)">
              <MultiCheck
                value={config.capacity.units}
                onChange={(v) => update('capacity.units', v)}
                options={['FTE', 'Hours', 'Mandays']}
              />
            </Field>
            <Field label="Empfohlene Capacity Unit">
              <Select
                value={config.capacity.recommendedUnit}
                onChange={(v) => update('capacity.recommendedUnit', v)}
                options={(config.capacity.units || []).map((u) => ({ value: u, label: u }))}
              />
            </Field>
            <Field label="Capacity Aggregationen">
              <MultiCheck
                value={config.capacity.aggregations}
                onChange={(v) => update('capacity.aggregations', v)}
                options={['DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR']}
              />
            </Field>
            <Field label="Empfohlene Aggregation">
              <Select
                value={config.capacity.recommendedAggregation}
                onChange={(v) => update('capacity.recommendedAggregation', v)}
                options={(config.capacity.aggregations || []).map((u) => ({ value: u, label: u }))}
              />
            </Field>
            <Field label="Time Periods (Assignment)">
              <MultiCheck
                value={config.capacity.timePeriods}
                onChange={(v) => update('capacity.timePeriods', v)}
                options={['Day', 'Week', 'Month', 'Quarter', 'Year', 'Project']}
              />
            </Field>
            <Field label="Datumsformat">
              <Select
                value={config.capacity.dateFormat}
                onChange={(v) => update('capacity.dateFormat', v)}
                options={[
                  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
                  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
                  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
                ]}
              />
            </Field>
          </Section>

          <Section title="Workflow" icon={Workflow}>
            <Toggle
              checked={config.workflow.hasResourceRequest}
              onChange={(v) => update('workflow.hasResourceRequest', v)}
              label="Resource-Request-Workflow"
              sub="Mit RM-Freigabe"
            />
            <Field label="Assignment-Typen">
              <MultiCheck
                value={config.workflow.assignmentTypes}
                onChange={(v) => update('workflow.assignmentTypes', v)}
                options={['Planned', 'Actual']}
              />
            </Field>
          </Section>

          <Section title="Module / QRGs" icon={FileText}>
            {qrgTemplates.map((t) => (
              <Toggle
                key={t.id}
                checked={config.roles[t.roleFlag]}
                onChange={(v) => update(`roles.${t.roleFlag}`, v)}
                label={t.label}
                sub={t.description}
              />
            ))}
            {qrgTemplates.filter((t) => t.id === 'pm').map(() => (
              <div key="pm-sub" className="mt-3 pt-3 border-t border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-white/35 mb-2">PM-Modulsektionen</p>
                <Toggle checked={config.modules.pm.coverHomepage} onChange={(v) => update('modules.pm.coverHomepage', v)} label="Navigation & Homepage" />
                <Toggle checked={config.modules.pm.coverPmGrid} onChange={(v) => update('modules.pm.coverPmGrid', v)} label="Project Management Grid" />
                <Toggle checked={config.modules.pm.coverSpaGrid} onChange={(v) => update('modules.pm.coverSpaGrid', v)} label="Single Project Allocation" />
                <Toggle checked={config.modules.pm.coverBpaFlatgrid} onChange={(v) => update('modules.pm.coverBpaFlatgrid', v)} label="Bulk Project Allocation Flatgrid" />
                <Toggle checked={config.modules.pm.coverResourceReplace} onChange={(v) => update('modules.pm.coverResourceReplace', v)} label="Resource Replace" />
                <Toggle checked={config.modules.pm.coverAdvancedAssignment} onChange={(v) => update('modules.pm.coverAdvancedAssignment', v)} label="Advanced Assignment" />
              </div>
            ))}
          </Section>
        </aside>

        {/* ───────── Rechte Spalte: Preview + Export ───────── */}
        <section className="min-w-0">
          {/* QRG-Tabs */}
          <div className="flex flex-wrap gap-2 mb-4 print:hidden">
            {qrgs.length === 0 ? (
              <p className="text-sm text-white/45 italic">Keine QRG-Module ausgewählt — aktiviere oben links mindestens eines.</p>
            ) : (
              qrgs.map((q) => {
                const Icon = ICONS[q.icon] || FileText;
                const active = q.id === activeQrgId;
                return (
                  <button
                    type="button"
                    key={q.id}
                    onClick={() => {
                      setActiveQrgId(q.id);
                      previewScrollRef.current?.scrollTo({ top: 0 });
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition ${
                      active
                        ? 'bg-indigo-500/20 border-indigo-400/40 text-white'
                        : 'bg-white/5 border-white/10 text-white/55 hover:bg-white/10 hover:text-white/85'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{q.short}</span>
                  </button>
                );
              })
            )}
          </div>

          {/* Export-Bar */}
          {activeQrg && (
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/10 print:hidden">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-sm text-white/75 truncate">
                  <strong className="text-white">{activeQrg.label}</strong>
                  <span className="text-white/45 ml-2">· {activeQrg.blocks.length} Blöcke</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onExportDocx}
                  disabled={exporting}
                  className="px-3 py-2 rounded-lg bg-indigo-500/20 border border-indigo-400/40 text-indigo-100 text-sm font-medium hover:bg-indigo-500/30 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> DOCX
                </button>
                <button
                  type="button"
                  onClick={onExportMd}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/80 hover:bg-white/10 transition flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" /> Markdown
                </button>
                <button
                  type="button"
                  onClick={printPreview}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/80 hover:bg-white/10 transition flex items-center gap-2"
                  title="Browser-Druckdialog (→ Speichern als PDF)"
                >
                  <Printer className="w-4 h-4" /> PDF
                </button>
                <button
                  type="button"
                  onClick={onExportAll}
                  disabled={exporting || qrgs.length === 0}
                  className="px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
                  title="Alle aktiven QRGs + Profil als ZIP"
                >
                  <Package className="w-4 h-4" /> Bundle (ZIP)
                </button>
              </div>
            </div>
          )}

          {/* Live-Preview */}
          <div
            ref={previewScrollRef}
            className="glass-card rounded-2xl border border-white/10 p-6 sm:p-8 lg:p-10 print:p-0 print:border-0 print:bg-white print:text-black"
            id="qrg-preview"
          >
            {activeQrg ? (
              <article>
                <div className="mb-6 pb-4 border-b border-white/10 print:border-slate-200">
                  <p className="text-xs uppercase tracking-wider text-white/40 mb-1 print:text-slate-500">
                    {config.meta.customerName} · Quick Reference Guide · v{config.meta.documentVersion} · {config.meta.documentDate}
                  </p>
                  <h2 className="text-2xl font-bold" style={{ color: config.meta.primaryColor }}>
                    {activeQrg.label}
                  </h2>
                </div>
                <div className="qrg-content">
                  {activeQrg.blocks.map((b, i) => (
                    <PreviewBlock key={i} block={b} accent={config.meta.primaryColor} />
                  ))}
                </div>
              </article>
            ) : (
              <div className="text-center py-16">
                <FileText className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/45 text-sm">Keine QRGs aktiv. Aktiviere oben links mindestens ein Modul.</p>
              </div>
            )}
          </div>

          {/* Hilfe-Sektion */}
          <div className="mt-4 grid sm:grid-cols-3 gap-3 print:hidden">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-xs uppercase tracking-wider text-white/50 font-semibold">1 · Preset wählen</span>
              </div>
              <p className="text-xs text-white/55 leading-relaxed">
                Almirall, SHS, Cegeka, Knauf, HR Campus — fertig vorbefüllt mit den richtigen URLs, SSO-Labels & Terminologie.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-2 mb-1.5">
                <Settings2 className="w-4 h-4 text-indigo-400" />
                <span className="text-xs uppercase tracking-wider text-white/50 font-semibold">2 · Anpassen</span>
              </div>
              <p className="text-xs text-white/55 leading-relaxed">
                Terminologie (Proposal/Opportunity), Capacity Units, Workflow-Details — alle Änderungen erscheinen live im Preview.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-2 mb-1.5">
                <Download className="w-4 h-4 text-indigo-400" />
                <span className="text-xs uppercase tracking-wider text-white/50 font-semibold">3 · Exportieren</span>
              </div>
              <p className="text-xs text-white/55 leading-relaxed">
                Einzeln als DOCX/Markdown/PDF, oder als ZIP-Bundle (alle QRGs + Profil-JSON für Wiederverwendung).
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ── Print-Styles (auch PDF-Export via Browser) ─────── */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .print\\:hidden { display: none !important; }
          #qrg-preview { color: #111 !important; }
          #qrg-preview * { color: inherit !important; }
          #qrg-preview h1, #qrg-preview h2, #qrg-preview h3 { color: ${config.meta.primaryColor} !important; }
          #qrg-preview strong { color: #000 !important; }
          #qrg-preview p, #qrg-preview li, #qrg-preview td { color: #222 !important; }
          #qrg-preview table { page-break-inside: avoid; }
          #qrg-preview h1, #qrg-preview h2 { page-break-after: avoid; }
        }
      `}</style>
    </div>
  );
}
