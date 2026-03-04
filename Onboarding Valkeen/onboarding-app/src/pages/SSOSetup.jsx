/**
 * SSO Setup – Umfassender Assistent zur Verknüpfung
 * von Kunden-IdPs (Azure, Okta) mit Tempus-Instanzen
 */
import { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  Building2,
  Key,
  FileText,
  Users,
  CheckCircle2,
  Circle,
  Sparkles,
  Download,
  Search,
  Mail,
  FileCode,
  Upload,
  AlertCircle,
  Clock,
  X
} from 'lucide-react';
import {
  IDP_OPTIONS,
  ENV_OPTIONS,
  STEPS,
  SAML_IDPS,
  OAUTH_IDPS,
  AZURE_NEW_APP_URL,
  AZURE_APP_REGISTRATION_URL,
  OKTA_APPS_URL,
  GOOGLE_CLOUD_CONSOLE_URL,
  SAML_TOOL_URL,
  DEFAULT_TEMPUS_DOMAIN
} from '../data/ssoSetupData';

const STORAGE_KEY = 'sso-setup-projects';
const TEMPLATES_KEY = 'sso-setup-templates';

// --- URL-Berechnung ---
function computeBaseUrl(clientName, customBaseUrl, environment) {
  if (customBaseUrl?.trim()) {
    return customBaseUrl.trim().replace(/\/$/, '');
  }
  const slug = clientName.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const envSuffix = ENV_OPTIONS.find(e => e.id === environment)?.suffix || '';
  return `https://${slug}${envSuffix}.${DEFAULT_TEMPUS_DOMAIN}`;
}

function computeUrls(project) {
  const baseUrl = computeBaseUrl(project.clientName, project.customBaseUrl, project.environment);
  const entityId = `${baseUrl}/sg`;
  const replyUrl = `${baseUrl}/sg/home/saml`.toLowerCase();
  return { baseUrl, entityId, replyUrl };
}

// --- Validierung ---
function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// --- Hooks ---
function useSSOProjects() {
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      setProjects(Array.isArray(parsed) ? parsed : []);
    } catch {
      setProjects([]);
    }
  }, []);

  const saveProjects = (next) => {
    setProjects(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addProject = (data, fromTemplate = false) => {
    const id = `sso-${Date.now()}`;
    const { baseUrl, entityId, replyUrl } = computeUrls(data);
    const project = {
      id,
      clientName: data.clientName?.trim() || 'Unbekannt',
      clientSlug: (data.clientName || '').toLowerCase().replace(/[^a-z0-9-]/g, ''),
      customBaseUrl: data.customBaseUrl || '',
      environment: data.environment || 'production',
      idp: data.idp || 'azure',
      baseUrl,
      entityId,
      replyUrl,
      status: 'draft',
      currentStep: 1,
      completedSteps: {},
      tags: data.tags || [],
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateId: fromTemplate ? data.templateId : null
    };
    saveProjects([project, ...projects]);
    return project;
  };

  const updateProject = (id, updates) => {
    const p = projects.find(x => x.id === id);
    if (!p) return;
    const merged = { ...p, ...updates, updatedAt: new Date().toISOString() };
    const hasUrlEdits = ['baseUrl', 'entityId', 'replyUrl'].some(k => updates[k] !== undefined);
    const hasSourceEdits = ['clientName', 'customBaseUrl', 'environment'].some(k => updates[k] !== undefined);
    if (hasSourceEdits && !hasUrlEdits) {
      Object.assign(merged, computeUrls(merged));
    }
    saveProjects(projects.map(x => (x.id === id ? merged : x)));
  };

  const deleteProject = (id) => saveProjects(projects.filter(p => p.id !== id));
  const getProject = (id) => projects.find(p => p.id === id);

  const bulkAddProjects = (items) => {
    const newProjects = items.map((data, idx) => {
      const id = `sso-${Date.now()}-${idx}`;
      const { baseUrl, entityId, replyUrl } = computeUrls(data);
      return {
        id,
        clientName: data.clientName?.trim() || 'Unbekannt',
        clientSlug: (data.clientName || '').toLowerCase().replace(/[^a-z0-9-]/g, ''),
        customBaseUrl: data.customBaseUrl || '',
        environment: data.environment || 'production',
        idp: data.idp || 'azure',
        baseUrl,
        entityId,
        replyUrl,
        status: 'draft',
        currentStep: 1,
        completedSteps: {},
        tags: data.tags || [],
        notes: data.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });
    saveProjects([...newProjects, ...projects]);
    return newProjects;
  };

  return { projects, addProject, updateProject, deleteProject, getProject, bulkAddProjects };
}

function useSSOTemplates() {
  const [templates, setTemplates] = useState([]);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(TEMPLATES_KEY);
      setTemplates(stored ? JSON.parse(stored) : []);
    } catch {
      setTemplates([]);
    }
  }, []);

  const saveTemplates = (next) => {
    setTemplates(next);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(next));
  };

  const addTemplate = (name, project) => {
    const id = `tpl-${Date.now()}`;
    const t = {
      id,
      name,
      idp: project.idp,
      environment: project.environment,
      customBaseUrl: project.customBaseUrl,
      createdAt: new Date().toISOString()
    };
    saveTemplates([t, ...templates]);
    return t;
  };

  const deleteTemplate = (id) => saveTemplates(templates.filter(t => t.id !== id));
  return { templates, addTemplate, deleteTemplate };
}

function CopyButton({ text, label = 'Kopieren' }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm">
      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
      {copied ? 'Kopiert!' : label}
    </button>
  );
}

function StepIndicator({ steps, currentStep, completedSteps }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {steps.map((s, i) => {
        const num = i + 1;
        const done = completedSteps[num];
        const active = currentStep === num;
        return (
          <div
            key={num}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
              active ? 'bg-indigo-500 text-white' : done ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-400'
            }`}
          >
            {done ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
            <span className="hidden sm:inline">{s.title}</span>
            <span className="sm:hidden">{num}</span>
          </div>
        );
      })}
    </div>
  );
}

// --- Export-Funktionen (nutzen gespeicherte URLs falls vorhanden) ---
function getStoredUrls(project) {
  const computed = computeUrls(project);
  return {
    baseUrl: project.baseUrl ?? computed.baseUrl,
    entityId: project.entityId ?? computed.entityId,
    replyUrl: project.replyUrl ?? computed.replyUrl
  };
}

function exportAsTxt(project) {
  const idpName = IDP_OPTIONS.find(i => i.id === project.idp)?.label || project.idp;
  const baseUrl = project.baseUrl ?? computeUrls(project).baseUrl;
  let content = `# SSO Konfiguration: ${project.clientName}
## IdP: ${idpName}
## Tempus
- Basis-URL: ${baseUrl}
`;
  if (SAML_IDPS.includes(project.idp)) {
    const { entityId, replyUrl } = getStoredUrls(project);
    content += `- Entity ID: ${entityId}
- Reply URL: ${replyUrl}

## IdP (für Kunde)
- Bezeichner/Entity ID: ${entityId}
- Antwort-URL/ACS: ${replyUrl}

## Tempus (General Settings → Miscellaneous → SSO)
- SAML application id: ${entityId}
- SAML configuration URL: ${project.samlConfigUrl || '(Metadaten-URL aus IdP einfügen)'}
${project.samlEndpoint ? `- SAML endpoint: ${project.samlEndpoint}\n` : ''}
- Custom label: ${project.customLabel || 'Continue With Saml'}
`;
  } else {
    const clientId = project.idp === 'google' ? project.googleClientId : project.microsoftClientId;
    const clientKey = project.idp === 'google' ? project.googleClientKey : project.microsoftClientKey;
    const redirectUri = `${baseUrl}/sg/home/${project.idp}`;
    content += `
## OAuth (Tempus)
- ${project.idp === 'google' ? 'Google' : 'Microsoft'} client id: ${clientId || '(eintragen)'}
- ${project.idp === 'google' ? 'Google' : 'Microsoft'} client key: ${clientKey ? '••••••••' : '(eintragen)'}
- Redirect URI: ${redirectUri}
- Custom label: ${project.customLabel || (project.idp === 'google' ? 'Continue With Google' : 'Continue With Microsoft')}
`;
  }
  content += `
## Benutzer
- Resource Management → User Identity → E-Mail + SSO aktivieren
`;
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sso-config-${project.clientSlug}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportAsHtml(project) {
  const baseUrl = project.baseUrl ?? computeUrls(project).baseUrl;
  const idpName = IDP_OPTIONS.find(i => i.id === project.idp)?.label || project.idp;
  const isSaml = SAML_IDPS.includes(project.idp);
  const entityId = isSaml ? getStoredUrls(project).entityId : '';
  const replyUrl = isSaml ? getStoredUrls(project).replyUrl : '';
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>SSO Setup ${project.clientName}</title>
<style>body{font-family:sans-serif;max-width:700px;margin:40px auto;padding:20px;background:#1a1a2e;color:#eee}
code{background:#333;padding:2px 6px;border-radius:4px}
h1{color:#818cf8}.box{background:#2d2d44;padding:16px;border-radius:8px;margin:16px 0}
.btn{display:inline-block;padding:8px 16px;background:#6366f1;color:#fff;border-radius:8px;margin:4px;text-decoration:none}
</style></head><body>
<h1>SSO Setup: ${project.clientName}</h1>
<p>IdP: <strong>${idpName}</strong></p>
${isSaml ? `<div class="box"><strong>Entity ID:</strong><br><code>${entityId}</code></div>
<div class="box"><strong>Reply URL:</strong><br><code>${replyUrl}</code></div>
<div class="box"><strong>SAML configuration URL:</strong><br><code>${project.samlConfigUrl || '(aus IdP)'}</code></div>` : `<div class="box"><strong>Redirect URI:</strong><br><code>${baseUrl}/sg/home/${project.idp}</code></div>
<div class="box"><strong>${project.idp === 'google' ? 'Google' : 'Microsoft'} client id:</strong><br><code>${project.idp === 'google' ? project.googleClientId : project.microsoftClientId || '(eintragen)'}</code></div>`}
<h2>Tempus</h2>
<ol><li>General Settings → Miscellaneous → SSO</li>
<li>${isSaml ? `SAML aktivieren, SAML Configuration URL einfügen` : `${project.idp === 'google' ? 'Google' : 'Microsoft'} aktivieren, Client ID & Key eintragen`}</li>
<li>Speichern</li></ol>
<h2>Benutzer</h2>
<p>Resource Management → User Identity → E-Mail + SSO aktivieren</p>
<a href="${baseUrl}" class="btn">Tempus öffnen</a>
</body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, '_blank', 'width=800,height=600');
  if (w) w.document.write(html);
  URL.revokeObjectURL(url);
}

function getEmailBody(project) {
  const baseUrl = project.baseUrl ?? computeUrls(project).baseUrl;
  const idpName = IDP_OPTIONS.find(i => i.id === project.idp)?.label || project.idp;
  if (SAML_IDPS.includes(project.idp)) {
    const { entityId, replyUrl } = getStoredUrls(project);
    return `Hallo,

anbei die SSO-Konfigurationswerte für Tempus (${project.clientName}):

Entity ID: ${entityId}
Reply URL: ${replyUrl}

Bitte in ${idpName} unter der SAML-Anwendung eintragen, dann die Metadaten-URL kopieren und in Tempus unter General Settings → Miscellaneous → SAML Configuration URL einfügen.

Tempus-URL: ${baseUrl}

Viele Grüße`;
  }
  const redirectUri = `${baseUrl}/sg/home/${project.idp}`;
  return `Hallo,

anbei die SSO-Konfigurationswerte für Tempus (${project.clientName}):

Redirect URI: ${redirectUri}
${project.idp === 'google' ? 'Google' : 'Microsoft'} Client ID: ${project.idp === 'google' ? project.googleClientId : project.microsoftClientId || '(eintragen)'}

Bitte in Tempus unter General Settings → Miscellaneous → SSO: ${project.idp === 'google' ? 'Google' : 'Microsoft'} aktivieren und Client ID sowie Client Key eintragen.

Tempus-URL: ${baseUrl}

Viele Grüße`;
}

function getPowerShellScript(project) {
  const { entityId, replyUrl } = getStoredUrls(project);
  return `# Azure Entra ID - Tempus SAML App (Beispiel)
# Voraussetzung: Microsoft Graph PowerShell Modul, Connect-MgGraph

$displayName = "Tempus ${project.clientName}"
$identifierUri = "${entityId}"
$replyUrl = "${replyUrl}"

# Hinweis: Enterprise Apps werden typischerweise über das Portal erstellt.
# Dieses Skript zeigt die erforderlichen Werte.
Write-Host "Entity ID (Bezeichner): $identifierUri"
Write-Host "Reply URL (ACS): $replyUrl"
Write-Host ""
Write-Host "In Azure: Unternehmensanwendungen -> Neue Anwendung -> Eigene Anwendung"
Write-Host "Einmalanmeldung -> SAML -> Grundlegende SAML-Konfiguration"
`;
}

export default function SSOSetup() {
  const { projects, addProject, updateProject, deleteProject, getProject, bulkAddProjects } = useSSOProjects();
  const { templates, addTemplate, deleteTemplate } = useSSOTemplates();

  const [selectedId, setSelectedId] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterIdp, setFilterIdp] = useState('all');
  const [sortBy, setSortBy] = useState('updated');

  // Form state für neues Projekt
  const [form, setForm] = useState({
    clientName: '',
    customBaseUrl: '',
    environment: 'production',
    idp: 'azure',
    tags: [],
    tagInput: '',
    notes: ''
  });

  const project = selectedId ? getProject(selectedId) : null;
  const isSaml = project && SAML_IDPS.includes(project.idp);
  const isOAuth = project && OAUTH_IDPS.includes(project.idp);
  const effectiveSteps = isOAuth
    ? [
        { id: 1, title: 'Kunde', key: 'customer' },
        { id: 2, title: 'OAuth Client', key: 'oauth' },
        { id: 3, title: 'Tempus', key: 'tempus' },
        { id: 4, title: 'Benutzer', key: 'users' },
        { id: 5, title: 'Fertig', key: 'done' }
      ]
    : STEPS;
  const maxStep = effectiveSteps.length;
  const currentStep = Math.min(project?.currentStep ?? 1, maxStep);
  const completedSteps = project?.completedSteps ?? {};

  const computedUrls = project ? computeUrls(project) : null;
  const projectUrls = project ? {
    baseUrl: project.baseUrl ?? computedUrls.baseUrl,
    entityId: project.entityId ?? computedUrls.entityId,
    replyUrl: project.replyUrl ?? computedUrls.replyUrl
  } : null;

  const markStepDone = (step) => {
    if (project) {
      const ts = new Date().toISOString();
      updateProject(project.id, { completedSteps: { ...completedSteps, [step]: ts } });
    }
  };

  const goToStep = (step) => {
    if (project) updateProject(project.id, { currentStep: step });
  };

  const filteredProjects = useMemo(() => {
    let list = [...projects];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => 
        p.clientName?.toLowerCase().includes(q) ||
        p.entityId?.toLowerCase().includes(q) ||
        (p.tags || []).some(t => t.toLowerCase().includes(q)) ||
        p.notes?.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'all') list = list.filter(p => p.status === filterStatus);
    if (filterIdp !== 'all') list = list.filter(p => p.idp === filterIdp);
    if (sortBy === 'updated') list.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    if (sortBy === 'name') list.sort((a, b) => (a.clientName || '').localeCompare(b.clientName || ''));
    if (sortBy === 'created') list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return list;
  }, [projects, search, filterStatus, filterIdp, sortBy]);

  const handleNewProject = (fromTemplate = null) => {
    const data = fromTemplate ? {
      clientName: form.clientName || 'Neuer Kunde',
      customBaseUrl: fromTemplate.customBaseUrl,
      environment: fromTemplate.environment,
      idp: fromTemplate.idp,
      tags: form.tags,
      notes: form.notes
    } : {
      clientName: form.clientName.trim(),
      customBaseUrl: form.customBaseUrl.trim(),
      environment: form.environment,
      idp: form.idp,
      tags: form.tags,
      notes: form.notes
    };
    if (!data.clientName && !fromTemplate) return;
    const p = addProject(data, !!fromTemplate);
    setSelectedId(p.id);
    setForm({ clientName: '', customBaseUrl: '', environment: 'production', idp: 'azure', tags: [], tagInput: '', notes: '' });
    setShowNewForm(false);
    setShowTemplates(false);
  };

  const bulkImportDefaults = { idp: project?.idp ?? form.idp, environment: project?.environment ?? form.environment };

  const handleBulkImport = (text) => {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const items = lines.map(line => {
      const name = line.split(/[,;\t]/)[0]?.trim();
      return name ? { clientName: name, idp: bulkImportDefaults.idp, environment: bulkImportDefaults.environment } : null;
    }).filter(Boolean);
    const created = bulkAddProjects(items);
    setShowBulkImport(false);
    if (created.length) setSelectedId(created[0].id);
  };

  const handleSaveAsTemplate = () => {
    if (!project) return;
    const name = prompt('Vorlagen-Name:', `${project.clientName} (${project.idp})`);
    if (name) {
      addTemplate(name, project);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Modals – immer sichtbar wenn geöffnet (auch in Projektansicht) */}
      {showBulkImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card p-6 max-w-xl w-full border-2 border-indigo-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-6 h-6 text-indigo-400" />
              <h3 className="font-semibold text-white text-lg">Bulk-Import – mehrere Kunden auf einmal</h3>
            </div>
            <p className="text-sm text-gray-400 mb-3">Eine Zeile pro Kunde. Erste Spalte = Kundenname. Komma, Semikolon oder Tab trennen weitere Spalten.</p>
            <textarea
              id="bulk-import"
              placeholder="valkeen&#10;acme-corp&#10;kunde123&#10;firma-xyz"
              className="w-full glass-input h-48 font-mono text-sm placeholder-gray-500"
            />
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <span>IdP: {IDP_OPTIONS.find(i => i.id === bulkImportDefaults.idp)?.label}</span>
              <span>•</span>
              <span>Umgebung: {ENV_OPTIONS.find(e => e.id === bulkImportDefaults.environment)?.label}</span>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => handleBulkImport(document.getElementById('bulk-import').value)} className="glass-button flex items-center gap-2">
                <Upload className="w-4 h-4" /> Importieren
              </button>
              <button onClick={() => setShowBulkImport(false)} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">Abbrechen</button>
            </div>
          </div>
        </div>
      )}
      {showTemplates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="glass-card p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-white">Vorlagen</h3>
              <button onClick={() => setShowTemplates(false)} className="p-2 text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            {templates.length === 0 ? (
              <p className="text-gray-400 text-sm">Keine Vorlagen. Erstelle ein Projekt und speichere es als Vorlage.</p>
            ) : (
              <div className="space-y-2">
                {templates.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div>
                      <p className="font-medium text-white">{t.name}</p>
                      <p className="text-xs text-gray-500">{IDP_OPTIONS.find(i => i.id === t.idp)?.label} • {ENV_OPTIONS.find(e => e.id === t.environment)?.label}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setForm(f => ({ ...f, idp: t.idp, environment: t.environment, customBaseUrl: t.customBaseUrl || '' })); setShowNewForm(true); setShowTemplates(false); setSelectedId(null); }} className="text-indigo-400 text-sm">Verwenden</button>
                      <button onClick={() => deleteTemplate(t.id)} className="text-red-400 text-sm">Löschen</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-indigo-400" />
          SSO Setup
        </h1>
        <p className="text-white/60 text-sm sm:text-base">
          Tempus SSO: Password, Google, Microsoft, SAML (Azure/Okta) – alle Optionen im Primary login
        </p>
      </div>

      {!project ? (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Projekte</h2>

          {/* Search, Filter, Sort */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Suchen..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
            >
              <option value="all">Status: Alle</option>
              <option value="draft">In Bearbeitung</option>
              <option value="done">Fertig</option>
            </select>
            <select
              value={filterIdp}
              onChange={(e) => setFilterIdp(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
            >
              <option value="all">IdP: Alle</option>
              {IDP_OPTIONS.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
            >
              <option value="updated">Sort: Zuletzt geändert</option>
              <option value="created">Sort: Erstellt</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>

          {/* Actions – prominent sichtbar */}
          <div className="flex flex-wrap gap-3 mb-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <span className="w-full sm:w-auto text-sm text-indigo-300 font-medium sm:font-normal">Aktionen:</span>
            <button onClick={() => setShowNewForm(true)} className="glass-button flex items-center gap-2">
              <Plus className="w-4 h-4" /> Neues Projekt
            </button>
            <button onClick={() => setShowBulkImport(true)} className="glass-button flex items-center gap-2">
              <Upload className="w-4 h-4" /> Bulk-Import (mehrere Kunden)
            </button>
            <button onClick={() => setShowTemplates(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10">
              <FileCode className="w-4 h-4" /> Vorlagen
            </button>
          </div>

          {/* New Project Form */}
          {showNewForm && (
            <div className="bg-white/5 rounded-xl p-6 mb-6 space-y-4">
              <h3 className="font-semibold text-white">Neues Projekt</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Kunden-Name *</label>
                  <input
                    value={form.clientName}
                    onChange={(e) => setForm(f => ({ ...f, clientName: e.target.value }))}
                    placeholder="z.B. valkeen, acme"
                    className="w-full glass-input"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Custom Base-URL (optional)</label>
                  <input
                    value={form.customBaseUrl}
                    onChange={(e) => setForm(f => ({ ...f, customBaseUrl: e.target.value }))}
                    placeholder="https://kunde.tempus-resource.eu"
                    className="w-full glass-input"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Identity Provider</label>
                  <select
                    value={form.idp}
                    onChange={(e) => setForm(f => ({ ...f, idp: e.target.value }))}
                    className="w-full glass-input"
                  >
                    {IDP_OPTIONS.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Umgebung</label>
                  <select
                    value={form.environment}
                    onChange={(e) => setForm(f => ({ ...f, environment: e.target.value }))}
                    className="w-full glass-input"
                  >
                    {ENV_OPTIONS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Tags (kommagetrennt)</label>
                <input
                  value={form.tagInput}
                  onChange={(e) => setForm(f => ({ ...f, tagInput: e.target.value, tags: e.target.value.split(/[,;]/).map(t => t.trim()).filter(Boolean) }))}
                  placeholder="z.B. DACH, Enterprise"
                  className="w-full glass-input"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Notizen</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Interne Notizen..."
                  className="w-full glass-input h-20"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleNewProject()} disabled={!form.clientName.trim()} className="glass-button flex items-center gap-2">
                  Erstellen
                </button>
                <button onClick={() => setShowNewForm(false)} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">Abbrechen</button>
              </div>
            </div>
          )}

          {/* Project List */}
          {filteredProjects.length === 0 ? (
            <p className="text-gray-400 text-sm">Keine Projekte. Erstelle ein neues oder importiere per Bulk-Import.</p>
          ) : (
            <div className="space-y-2">
              {filteredProjects.map(p => {
                const urls = computeUrls(p);
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                    onClick={() => setSelectedId(p.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Building2 className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-white">{p.clientName}</p>
                        <p className="text-xs text-gray-500 truncate">{SAML_IDPS.includes(p.idp) ? urls.entityId : urls.baseUrl}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10">{IDP_OPTIONS.find(i => i.id === p.idp)?.label}</span>
                          {(p.tags || []).slice(0, 2).map(tag => <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">{tag}</span>)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {Object.keys(p.completedSteps || {}).length > 0 && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {Object.keys(p.completedSteps || {}).length}/{SAML_IDPS.includes(p.idp) ? 7 : 5}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded ${p.status === 'done' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {p.status === 'done' ? 'Fertig' : 'In Bearbeitung'}
                      </span>
                      <button onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-white text-sm">← Zurück</button>
              <span className="text-gray-500">|</span>
              <span className="font-medium text-white">{project.clientName}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-white/10">{IDP_OPTIONS.find(i => i.id === project.idp)?.label}</span>
              <span className="text-gray-500">|</span>
              <button onClick={() => setShowBulkImport(true)} className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"><Upload className="w-3.5 h-3.5" /> Bulk-Import</button>
              <button onClick={() => setShowTemplates(true)} className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"><FileCode className="w-3.5 h-3.5" /> Vorlagen</button>
            </div>
            <button onClick={handleSaveAsTemplate} className="text-sm text-indigo-400 hover:text-indigo-300">Als Vorlage speichern</button>
          </div>

          <StepIndicator steps={effectiveSteps} currentStep={currentStep} completedSteps={completedSteps} />

          <div className="glass-card p-6">
            {/* Step 1: Kunde - bearbeitbar */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2"><Building2 className="w-6 h-6 text-indigo-400" /> Schritt 1: Kundendaten</h3>
                <div className="bg-white/5 rounded-xl p-3 text-sm text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
                  <span className="text-white font-medium">Tempus SSO – Primary login:</span>
                  <span>Password (Standard)</span>
                  <span>•</span>
                  <span>Google</span>
                  <span>•</span>
                  <span>Microsoft</span>
                  <span>•</span>
                  <span>SAML</span>
                  <span className="text-indigo-300">→ Du konfigurierst: {IDP_OPTIONS.find(i => i.id === project.idp)?.label}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Kunden-Name</label>
                    <input
                      value={project.clientName}
                      onChange={(e) => updateProject(project.id, { clientName: e.target.value })}
                      className="w-full glass-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Identity Provider</label>
                    <select
                      value={project.idp || 'azure'}
                      onChange={(e) => updateProject(project.id, { idp: e.target.value })}
                      className="w-full glass-input"
                    >
                      {IDP_OPTIONS.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Custom Base-URL (optional)</label>
                    <input
                      value={project.customBaseUrl || ''}
                      onChange={(e) => updateProject(project.id, { customBaseUrl: e.target.value })}
                      placeholder="Leer = Standard tempus-resource.com"
                      className="w-full glass-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Umgebung</label>
                    <select
                      value={project.environment || 'production'}
                      onChange={(e) => updateProject(project.id, { environment: e.target.value })}
                      className="w-full glass-input"
                    >
                      {ENV_OPTIONS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <label className="block text-sm text-gray-400 mb-1">Tempus-Basis-URL (bearbeitbar)</label>
                  <input
                    value={projectUrls.baseUrl}
                    onChange={(e) => updateProject(project.id, { baseUrl: e.target.value })}
                    className="w-full glass-input font-mono text-sm"
                    placeholder="https://kunde.tempus-resource.com"
                  />
                  {!validateUrl(projectUrls.baseUrl) && projectUrls.baseUrl && <p className="text-amber-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> URL-Format prüfen</p>}
                  <button onClick={() => updateProject(project.id, computeUrls(project))} className="mt-2 text-xs text-indigo-400 hover:text-indigo-300">↺ Aus Kundendaten neu berechnen</button>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Notizen</label>
                  <textarea
                    value={project.notes || ''}
                    onChange={(e) => updateProject(project.id, { notes: e.target.value })}
                    className="w-full glass-input h-20"
                    placeholder="Interne Notizen..."
                  />
                </div>
                <button onClick={() => { markStepDone(1); goToStep(2); }} className="glass-button flex items-center gap-2">Weiter <ChevronRight className="w-4 h-4" /></button>
              </div>
            )}

            {/* Step 2: OAuth Client (nur Google/Microsoft) */}
            {currentStep === 2 && isOAuth && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2"><Key className="w-6 h-6 text-indigo-400" /> Schritt 2: OAuth Client ID & Key</h3>
                {project.idp === 'google' ? (
                  <>
                    <p className="text-gray-400 text-sm">Client ID und Client Key aus der Google Cloud Console holen.</p>
                    <ol className="list-decimal list-inside space-y-3 text-gray-300">
                      <li>Öffne <a href={GOOGLE_CLOUD_CONSOLE_URL} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Google Cloud Console → APIs & Services → Credentials <ExternalLink className="w-3 h-3 inline" /></a></li>
                      <li>OAuth 2.0 Client IDs → Create Credentials → OAuth client ID</li>
                      <li>Application type: Web application</li>
                      <li>Authorized redirect URIs: <code className="text-green-300">{projectUrls.baseUrl}/sg/home/google</code> <CopyButton text={`${projectUrls.baseUrl}/sg/home/google`} /></li>
                      <li>Client ID und Client Secret kopieren – in Tempus eintragen (Schritt 3)</li>
                    </ol>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/5 rounded-xl p-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Google client id (Notiz)</label>
                        <input
                          value={project.googleClientId || ''}
                          onChange={(e) => updateProject(project.id, { googleClientId: e.target.value })}
                          placeholder="z.B. xxx.apps.googleusercontent.com"
                          className="w-full glass-input font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Google client key (Notiz)</label>
                        <input
                          type="password"
                          value={project.googleClientKey || ''}
                          onChange={(e) => updateProject(project.id, { googleClientKey: e.target.value })}
                          placeholder="Geheimnis aus Google"
                          className="w-full glass-input font-mono text-sm"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm text-gray-400 mb-1">Custom label (Tempus Login-Button)</label>
                        <input
                          value={project.customLabel || 'Continue With Google'}
                          onChange={(e) => updateProject(project.id, { customLabel: e.target.value })}
                          placeholder="Continue With Google"
                          className="w-full glass-input"
                        />
                      </div>
                    </div>
                    <button onClick={() => { markStepDone(2); goToStep(3); }} className="glass-button flex items-center gap-2">Weiter <ChevronRight className="w-4 h-4" /></button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-400 text-sm">Client ID und Client Secret aus Azure App Registration holen.</p>
                    <ol className="list-decimal list-inside space-y-3 text-gray-300">
                      <li>Öffne <a href={AZURE_APP_REGISTRATION_URL} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Azure Entra ID → App registrations → New registration <ExternalLink className="w-3 h-3 inline" /></a></li>
                      <li>Name: z.B. „Tempus {project.clientName}"</li>
                      <li>Supported account types: nach Bedarf (z.B. Single tenant)</li>
                      <li>Redirect URI: Web → <code className="text-green-300">{projectUrls.baseUrl}/sg/home/microsoft</code> <CopyButton text={`${projectUrls.baseUrl}/sg/home/microsoft`} /></li>
                      <li>Nach Erstellung: Application (client) ID und Client secrets → New client secret</li>
                      <li>Client ID und Secret in Tempus eintragen (Schritt 3)</li>
                    </ol>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/5 rounded-xl p-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Microsoft client id (Notiz)</label>
                        <input
                          value={project.microsoftClientId || ''}
                          onChange={(e) => updateProject(project.id, { microsoftClientId: e.target.value })}
                          placeholder="GUID aus Azure"
                          className="w-full glass-input font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Microsoft client key (Notiz)</label>
                        <input
                          type="password"
                          value={project.microsoftClientKey || ''}
                          onChange={(e) => updateProject(project.id, { microsoftClientKey: e.target.value })}
                          placeholder="Client secret aus Azure"
                          className="w-full glass-input font-mono text-sm"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm text-gray-400 mb-1">Custom label (Tempus Login-Button)</label>
                        <input
                          value={project.customLabel || 'Continue With Microsoft'}
                          onChange={(e) => updateProject(project.id, { customLabel: e.target.value })}
                          placeholder="Continue With Microsoft"
                          className="w-full glass-input"
                        />
                      </div>
                    </div>
                    <button onClick={() => { markStepDone(2); goToStep(3); }} className="glass-button flex items-center gap-2">Weiter <ChevronRight className="w-4 h-4" /></button>
                  </>
                )}
              </div>
            )}

            {/* Step 2: IdP-Werte (nur SAML) */}
            {currentStep === 2 && isSaml && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2"><Key className="w-6 h-6 text-indigo-400" /> Schritt 2: IdP-Werte</h3>
                <p className="text-gray-400 text-sm">Diese Werte im Identity Provider eintragen.</p>
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <label className="block text-xs text-gray-500 mb-1">Identifier (Entity ID) – Case Sensitive</label>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        value={projectUrls.entityId}
                        onChange={(e) => updateProject(project.id, { entityId: e.target.value })}
                        className="flex-1 min-w-0 glass-input font-mono text-sm text-green-300"
                      />
                      <CopyButton text={projectUrls.entityId} />
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <label className="block text-xs text-gray-500 mb-1">Reply URL (ACS) – lowercase</label>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        value={projectUrls.replyUrl}
                        onChange={(e) => updateProject(project.id, { replyUrl: e.target.value })}
                        className="flex-1 min-w-0 glass-input font-mono text-sm text-green-300"
                      />
                      <CopyButton text={projectUrls.replyUrl} />
                    </div>
                  </div>
                  <button onClick={() => updateProject(project.id, computeUrls(project))} className="text-xs text-indigo-400 hover:text-indigo-300">↺ URLs aus Kundendaten neu berechnen</button>
                </div>
                <button onClick={() => { markStepDone(2); goToStep(3); }} className="glass-button flex items-center gap-2">Weiter <ChevronRight className="w-4 h-4" /></button>
              </div>
            )}

            {/* Step 3: Tempus konfigurieren (nur OAuth) */}
            {currentStep === 3 && isOAuth && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2"><Sparkles className="w-6 h-6 text-indigo-400" /> Schritt 3: Tempus konfigurieren</h3>
                <div className="bg-white/5 rounded-xl p-3 text-sm text-gray-400">
                  <strong className="text-white">Tempus SSO – Primary login:</strong> Password, Google, Microsoft, SAML können parallel aktiv sein. Aktiviere {project.idp === 'google' ? 'Google' : 'Microsoft'} und trage die Werte ein.
                </div>
                <p className="text-gray-400 text-sm">General Settings → Miscellaneous → SSO. {project.idp === 'google' ? 'Google' : 'Microsoft'} aktivieren (Häkchen) und folgende Felder eintragen:</p>
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 space-y-4">
                  {project.idp === 'google' ? (
                    <>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Google client id</label>
                        <div className="flex gap-2">
                          <input value={project.googleClientId || ''} readOnly className="flex-1 glass-input font-mono text-sm text-green-300" />
                          <CopyButton text={project.googleClientId || ''} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Google client key</label>
                        <div className="flex gap-2">
                          <input value={project.googleClientKey ? '••••••••' : ''} readOnly className="flex-1 glass-input font-mono text-sm" />
                          <CopyButton text={project.googleClientKey || ''} label="Kopieren" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Microsoft client id</label>
                        <div className="flex gap-2">
                          <input value={project.microsoftClientId || ''} readOnly className="flex-1 glass-input font-mono text-sm text-green-300" />
                          <CopyButton text={project.microsoftClientId || ''} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Microsoft client key</label>
                        <div className="flex gap-2">
                          <input value={project.microsoftClientKey ? '••••••••' : ''} readOnly className="flex-1 glass-input font-mono text-sm" />
                          <CopyButton text={project.microsoftClientKey || ''} label="Kopieren" />
                        </div>
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Custom label</label>
                    <input value={project.customLabel || (project.idp === 'google' ? 'Continue With Google' : 'Continue With Microsoft')} readOnly className="w-full glass-input" />
                  </div>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm">
                  <li>Tempus öffnen: <a href={projectUrls.baseUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">{projectUrls.baseUrl}</a></li>
                  <li>General Settings → Miscellaneous → SSO</li>
                  <li>{project.idp === 'google' ? 'Google' : 'Microsoft'} aktivieren (Häkchen setzen)</li>
                  <li>Client ID und Client Key eintragen</li>
                  <li>Custom label anpassen (optional)</li>
                  <li>Speichern</li>
                </ol>
                <button onClick={() => { markStepDone(3); goToStep(4); }} className="glass-button flex items-center gap-2">Weiter <ChevronRight className="w-4 h-4" /></button>
              </div>
            )}

            {/* Step 3: IdP-spezifisch (nur SAML) */}
            {currentStep === 3 && isSaml && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2"><Shield className="w-6 h-6 text-indigo-400" /> Schritt 3: {IDP_OPTIONS.find(i => i.id === project.idp)?.label} konfigurieren</h3>
                {project.idp === 'azure' ? (
                  <>
                    <ol className="list-decimal list-inside space-y-3 text-gray-300">
                      <li>Öffne <a href={AZURE_NEW_APP_URL} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Azure Entra ID <ExternalLink className="w-3 h-3 inline" /></a></li>
                      <li>Unternehmensanwendungen → Neue Anwendung → Eigene Anwendung erstellen</li>
                      <li>Name: z.B. „Tempus {project.clientName}"</li>
                      <li>Einmalanmeldung → SAML</li>
                      <li>Grundlegende SAML-Konfiguration → Bearbeiten:</li>
                    </ol>
                    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 space-y-2">
                      <p><strong>Bezeichner:</strong> <code className="text-green-300">{projectUrls.entityId}</code> <CopyButton text={projectUrls.entityId} label="Kopieren" /></p>
                      <p><strong>Antwort-URL:</strong> <code className="text-green-300">{projectUrls.replyUrl}</code> <CopyButton text={projectUrls.replyUrl} label="Kopieren" /></p>
                    </div>
                  </>
                ) : (
                  <>
                    <ol className="list-decimal list-inside space-y-3 text-gray-300">
                      <li>Öffne <a href={OKTA_APPS_URL} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Okta Admin <ExternalLink className="w-3 h-3 inline" /></a></li>
                      <li>Applications → Add Application → Create New App → SAML 2.0</li>
                      <li>App name: z.B. „Tempus {project.clientName}"</li>
                      <li>Single sign-on URL: <code className="text-green-300">{projectUrls.replyUrl}</code></li>
                      <li>Audience URI (SP Entity ID): <code className="text-green-300">{projectUrls.entityId}</code></li>
                      <li>Okta füllt Entity ID ggf. automatisch – prüfen ob übereinstimmt</li>
                    </ol>
                    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 space-y-2">
                      <p><strong>Audience URI:</strong> <code className="text-green-300">{projectUrls.entityId}</code> <CopyButton text={projectUrls.entityId} label="Kopieren" /></p>
                      <p><strong>Single Sign-On URL:</strong> <code className="text-green-300">{projectUrls.replyUrl}</code> <CopyButton text={projectUrls.replyUrl} label="Kopieren" /></p>
                    </div>
                  </>
                )}
                <button onClick={() => { markStepDone(3); goToStep(4); }} className="glass-button flex items-center gap-2">Weiter <ChevronRight className="w-4 h-4" /></button>
              </div>
            )}

            {/* Step 4: Benutzer (nur OAuth) */}
            {currentStep === 4 && isOAuth && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2"><Users className="w-6 h-6 text-indigo-400" /> Schritt 4: Benutzer aktivieren</h3>
                <ol className="list-decimal list-inside space-y-3 text-gray-300">
                  <li>Resource Management → Benutzer → User Identity</li>
                  <li>E-Mail eintragen (muss mit {project.idp === 'google' ? 'Google' : 'Microsoft'}-Konto übereinstimmen)</li>
                  <li>SSO aktivieren → Speichern</li>
                </ol>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                  <p className="text-amber-400 font-medium">Zuerst mit anderem Benutzer testen!</p>
                </div>
                <button onClick={() => { markStepDone(4); goToStep(5); updateProject(project.id, { status: 'done' }); }} className="glass-button flex items-center gap-2">Weiter <ChevronRight className="w-4 h-4" /></button>
              </div>
            )}

            {/* Step 4: Metadaten (nur SAML) */}
            {currentStep === 4 && isSaml && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2"><FileText className="w-6 h-6 text-indigo-400" /> Schritt 4: Metadaten-URL</h3>
                <ol className="list-decimal list-inside space-y-3 text-gray-300">
                  <li>In der {IDP_OPTIONS.find(i => i.id === project.idp)?.label}-Anwendung: SAML-Einstellungen</li>
                  <li>Metadaten-URL / App-Verbundmetadaten-URL kopieren</li>
                  <li>Diese URL wird in Tempus für die automatische Konfiguration verwendet</li>
                </ol>
                {project.idp === 'azure' && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                    <p className="text-amber-400 font-medium">Azure:</p>
                    <p className="text-sm text-gray-300 mt-1">Entity ID in Azure muss mit <code className="text-green-300">{projectUrls.entityId}</code> übereinstimmen.</p>
                  </div>
                )}
                <button onClick={() => { markStepDone(4); goToStep(5); }} className="glass-button flex items-center gap-2">Weiter <ChevronRight className="w-4 h-4" /></button>
              </div>
            )}

            {/* Step 5: Fertig (nur OAuth) */}
            {currentStep === 5 && isOAuth && (
              <div className="space-y-6 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto" />
                <h3 className="text-xl font-semibold text-white">SSO Setup abgeschlossen</h3>
                <p className="text-gray-400">Der Kunde {project.clientName} kann nun per {IDP_OPTIONS.find(i => i.id === project.idp)?.label} SSO bei Tempus anmelden.</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button onClick={() => setSelectedId(null)} className="glass-button">Zurück</button>
                  <a href={projectUrls.baseUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20">
                    <ExternalLink className="w-4 h-4" /> Tempus öffnen
                  </a>
                  <button onClick={() => exportAsTxt(project)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20">
                    <Download className="w-4 h-4" /> TXT exportieren
                  </button>
                  <button onClick={() => exportAsHtml(project)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20">
                    <FileText className="w-4 h-4" /> HTML / Drucken
                  </button>
                  <a href={`mailto:?body=${encodeURIComponent(getEmailBody(project))}&subject=SSO%20Setup%20${encodeURIComponent(project.clientName)}`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20">
                    <Mail className="w-4 h-4" /> E-Mail-Vorlage
                  </a>
                </div>
              </div>
            )}

            {/* Step 5: Tempus (nur SAML) */}
            {currentStep === 5 && isSaml && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2"><Sparkles className="w-6 h-6 text-indigo-400" /> Schritt 5: Tempus konfigurieren</h3>
                <div className="bg-white/5 rounded-xl p-3 text-sm text-gray-400">
                  <strong className="text-white">Tempus SSO – Primary login section:</strong> Password, Google, Microsoft, SAML können parallel aktiv sein. Jeder IdP hat ein Custom label (z.B. „Log In“, „Continue With Saml“).
                </div>
                <p className="text-gray-400 text-sm">General Settings → Miscellaneous → SSO. SAML aktivieren und folgende Felder eintragen:</p>
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">SAML application id</label>
                    <div className="flex gap-2">
                      <input
                        value={projectUrls.entityId}
                        onChange={(e) => updateProject(project.id, { entityId: e.target.value })}
                        className="flex-1 glass-input font-mono text-sm text-green-300"
                      />
                      <CopyButton text={projectUrls.entityId} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">SAML configuration URL</label>
                    <input
                      value={project.samlConfigUrl || ''}
                      onChange={(e) => updateProject(project.id, { samlConfigUrl: e.target.value })}
                      placeholder="Metadaten-URL aus IdP (Azure/Okta) einfügen"
                      className="w-full glass-input font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Empfohlen: Automatische Konfiguration via Metadaten-URL</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">SAML endpoint (falls manuell)</label>
                    <input
                      value={project.samlEndpoint || ''}
                      onChange={(e) => updateProject(project.id, { samlEndpoint: e.target.value })}
                      placeholder="SingleSignOnService URL aus Metadaten"
                      className="w-full glass-input font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Nur bei manueller Konfiguration. Zertifikat: <a href={SAML_TOOL_URL} target="_blank" rel="noopener noreferrer" className="text-indigo-400">samltool.com</a> → SAML certificate file in Tempus hochladen</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Custom label</label>
                    <input
                      value={project.customLabel || 'Continue With Saml'}
                      onChange={(e) => updateProject(project.id, { customLabel: e.target.value })}
                      placeholder="Continue With Saml"
                      className="w-full glass-input"
                    />
                  </div>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm">
                  <li>In Tempus: General Settings → Miscellaneous → SSO</li>
                  <li>SAML aktivieren (Häkchen setzen)</li>
                  <li>SAML application id: <code className="text-green-300">{projectUrls.entityId}</code></li>
                  <li>SAML configuration URL: Metadaten-URL aus IdP einfügen</li>
                  <li>SAML certificate file: ggf. Zertifikat hochladen</li>
                  <li>Custom label anpassen (optional)</li>
                  <li>Speichern</li>
                </ol>
                <button onClick={() => { markStepDone(5); goToStep(6); }} className="glass-button flex items-center gap-2">Weiter <ChevronRight className="w-4 h-4" /></button>
              </div>
            )}

            {/* Step 6: Benutzer (nur SAML) */}
            {currentStep === 6 && isSaml && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2"><Users className="w-6 h-6 text-indigo-400" /> Schritt 6: Benutzer aktivieren</h3>
                <ol className="list-decimal list-inside space-y-3 text-gray-300">
                  <li>Resource Management → Benutzer → User Identity</li>
                  <li>E-Mail eintragen (muss mit IdP übereinstimmen)</li>
                  <li>SSO aktivieren → Speichern</li>
                </ol>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                  <p className="text-amber-400 font-medium">Zuerst mit anderem Benutzer testen!</p>
                </div>
                <button onClick={() => { markStepDone(6); goToStep(7); updateProject(project.id, { status: 'done' }); }} className="glass-button flex items-center gap-2">Weiter <ChevronRight className="w-4 h-4" /></button>
              </div>
            )}

            {/* Step 7: Fertig + Export (nur SAML) */}
            {currentStep === 7 && isSaml && (
              <div className="space-y-6 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto" />
                <h3 className="text-xl font-semibold text-white">SSO Setup abgeschlossen</h3>
                <p className="text-gray-400">Der Kunde {project.clientName} kann nun per {IDP_OPTIONS.find(i => i.id === project.idp)?.label} SSO bei Tempus anmelden.</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button onClick={() => setSelectedId(null)} className="glass-button">Zurück</button>
                  <a href={projectUrls.baseUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20">
                    <ExternalLink className="w-4 h-4" /> Tempus öffnen
                  </a>
                  <button onClick={() => exportAsTxt(project)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20">
                    <Download className="w-4 h-4" /> TXT exportieren
                  </button>
                  <button onClick={() => exportAsHtml(project)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20">
                    <FileText className="w-4 h-4" /> HTML / Drucken
                  </button>
                  <a href={`mailto:?body=${encodeURIComponent(getEmailBody(project))}&subject=SSO%20Setup%20${encodeURIComponent(project.clientName)}`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20">
                    <Mail className="w-4 h-4" /> E-Mail-Vorlage
                  </a>
                  {project.idp === 'azure' && (
                    <button
                      onClick={() => {
                        const blob = new Blob([getPowerShellScript(project)], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `azure-tempus-${project.clientSlug}.ps1`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20"
                    >
                      <FileCode className="w-4 h-4" /> PowerShell
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {currentStep > 1 && currentStep < maxStep && (
            <div className="flex justify-between mt-6">
              <button onClick={() => goToStep(currentStep - 1)} className="flex items-center gap-2 text-gray-400 hover:text-white"><ChevronLeft className="w-4 h-4" /> Zurück</button>
              <div className="flex gap-2">
                {effectiveSteps.map((s, i) => (
                  <button key={s.id} onClick={() => goToStep(i + 1)} className={`w-8 h-8 rounded-lg text-sm ${currentStep === i + 1 ? 'bg-indigo-500 text-white' : 'bg-white/5 hover:bg-white/10'}`}>{i + 1}</button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
