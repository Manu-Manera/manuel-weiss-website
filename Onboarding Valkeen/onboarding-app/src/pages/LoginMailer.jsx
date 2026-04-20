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
  Type,
  Code2,
  Copy,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Palette,
  Eraser,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ExternalLink,
  Zap,
  Plug,
  CheckCircle2,
  XCircle,
  MinusCircle,
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
  ensureHtmlDocument,
  inlineImagesAsDataUris,
  buildEml,
  sanitizeFileName,
  downloadBlob,
  downloadEmlZip,
  suggestNameFromEmail,
  suggestUsernameFromName,
  USERNAME_MODE_FIRSTNAME,
  USERNAME_MODE_FULLNAME,
  DEFAULT_TEMPUS_PASSWORD,
  TEMPUS_DEFAULT_BASE_URL,
  tempusIdentity,
  tempusListGlobalRoles,
  tempusListResourceSecurityGroups,
  tempusResourceNameExists,
  tempusCreateResource,
} from '../utils/mailerUtils';

const GLOBAL_URL_KEY      = 'tempus_mailer_global_url';
const DEFAULT_PW_KEY      = 'tempus_mailer_default_pw';
const USERNAME_MODE_KEY   = 'tempus_mailer_username_mode';

// Tempus-API-Konfiguration. Der Key wird NICHT im localStorage persistiert.
const TEMPUS_BASE_URL_KEY   = 'tempus_mailer_api_base_url';
const TEMPUS_ROLE_KEY       = 'tempus_mailer_api_role_id';
const TEMPUS_SG_KEY         = 'tempus_mailer_api_sg_id';
const TEMPUS_TIMESHEET_KEY  = 'tempus_mailer_api_timesheet';

const PLACEHOLDER_HINT = ['{NAME}', '{EMAIL}', '{URL}', '{USERNAME}', '{PASSWORD}'];

// Strukturierte Liste für das Platzhalter-Panel im Editor.
const PLACEHOLDERS = [
  { token: '{NAME}',     label: 'Name',        desc: 'Vor- und Nachname' },
  { token: '{EMAIL}',    label: 'E-Mail',      desc: 'E-Mail-Adresse' },
  { token: '{USERNAME}', label: 'Username',    desc: 'Benutzername' },
  { token: '{PASSWORD}', label: 'Passwort',    desc: 'Initialpasswort' },
  { token: '{URL}',      label: 'Login-URL',   desc: 'Zugangs-Link' },
];

// Entfernt „versteckte" helle/weiße Textfarben aus HTML. Solche Farben stammen
// aus Copy/Paste aus dunklen Oberflächen und machen den Text auf weißem Mail-
// Hintergrund unsichtbar. Wir lassen die Browser-Default-Farbe (Schwarz) greifen.
// Wird vor Speichern, beim Öffnen im Editor und vor dem Anzeigen aufgerufen.
function stripHiddenTextColors(html) {
  if (!html) return '';
  let out = String(html);
  // Farbnamen: white
  out = out.replace(/color\s*:\s*white\s*(!important)?\s*;?/gi, '');
  // #fff, #ffffff (auch Groß-/Kleinschreibung, mit/ohne #)
  out = out.replace(/color\s*:\s*#\s*(?:fff|ffffff)\b\s*(!important)?\s*;?/gi, '');
  // rgb/rgba(255,255,255[,x])
  out = out.replace(/color\s*:\s*rgba?\(\s*255\s*[,\s]\s*255\s*[,\s]\s*255\s*[,\s\d.]*\)\s*(!important)?\s*;?/gi, '');
  // nah-weiße Farben rgb(≥230, ≥230, ≥230) pauschal entfernen
  out = out.replace(
    /color\s*:\s*rgba?\(\s*(2[3-9]\d|25[0-5])\s*[,\s]\s*(2[3-9]\d|25[0-5])\s*[,\s]\s*(2[3-9]\d|25[0-5])\s*[,\s\d.]*\)\s*(!important)?\s*;?/gi,
    ''
  );
  // <font color="white" | "#fff…" | "#eee…"> vom alten execCommand-Output
  out = out.replace(/<font\b([^>]*)\scolor\s*=\s*(["'])\s*(?:white|#\s*(?:fff|ffffff|eee|eeeeee))\s*\2([^>]*)>/gi, '<font$1$3>');
  // leer gewordene style="" aufräumen
  out = out.replace(/\sstyle\s*=\s*(['"])\s*\1/gi, '');
  return out;
}

// HTML → grober Plain-Text (für mailto:-Fallback beim Öffnen im Mailclient).
function htmlToPlainText(html) {
  if (!html) return '';
  return String(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const STEP_DEF = [
  { id: 'data',     label: 'Empfänger',  desc: 'Excel laden' },
  { id: 'template', label: 'Vorlage',    desc: 'Auswählen / bearbeiten' },
  { id: 'preview',  label: 'Vorschau',   desc: 'E-Mails prüfen' },
  { id: 'download', label: 'Senden',     desc: 'In Outlook öffnen' },
];

// Kleine Wiederverwendbare UI-Bausteine für die Formatierungs-Toolbar.
function ToolbarButton({ onClick, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()} // verhindert, dass der Editor-Cursor verloren geht
      onClick={onClick}
      title={title}
      className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition"
    >
      {children}
    </button>
  );
}
function ToolbarDivider() {
  return <span className="w-px h-5 bg-white/10 mx-1" aria-hidden="true" />;
}

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

  // --- Globale Defaults (analog Desktop-App) ---
  const [globalUrl, setGlobalUrl] = useState(() => {
    try { return localStorage.getItem(GLOBAL_URL_KEY) || ''; } catch { return ''; }
  });
  const [defaultPassword, setDefaultPassword] = useState(() => {
    try { return localStorage.getItem(DEFAULT_PW_KEY) || DEFAULT_TEMPUS_PASSWORD; } catch { return DEFAULT_TEMPUS_PASSWORD; }
  });
  const [usernameMode, setUsernameMode] = useState(() => {
    try { return localStorage.getItem(USERNAME_MODE_KEY) || USERNAME_MODE_FIRSTNAME; } catch { return USERNAME_MODE_FIRSTNAME; }
  });
  // Zuletzt "angewandte" globale URL. Wird genutzt, um bei einer Änderung der
  // globalen URL automatisch genau die Zeilen mitzuziehen, die vorher auf
  // diesem Wert standen (typisch: alle, die enrichEntry() gesetzt hat).
  // Zeilen mit individuell abweichender URL bleiben unangetastet.
  const lastAppliedGlobalUrlRef = useRef(globalUrl || '');
  useEffect(() => { try { localStorage.setItem(GLOBAL_URL_KEY, globalUrl || ''); } catch { /* ignore */ } }, [globalUrl]);
  useEffect(() => { try { localStorage.setItem(DEFAULT_PW_KEY, defaultPassword || ''); } catch { /* ignore */ } }, [defaultPassword]);
  useEffect(() => { try { localStorage.setItem(USERNAME_MODE_KEY, usernameMode); } catch { /* ignore */ } }, [usernameMode]);

  // Übernimmt die neue globale URL in alle Zeilen, die leer waren ODER die
  // bisher exakt auf dem zuletzt angewandten globalen Wert standen.
  // Rückgabe: { changed, preserved } — Anzahl geänderter / beibehaltener Zeilen.
  const propagateGlobalUrlChange = (nextUrl) => {
    const next = (nextUrl || '').trim();
    const prev = (lastAppliedGlobalUrlRef.current || '').trim();
    if (next === prev) return { changed: 0, preserved: 0 };
    let changed = 0;
    let preserved = 0;
    setEntries(list => list.map(e => {
      const u = (e.url || '').trim();
      if (!u || u === prev) {
        if (u !== next) changed += 1;
        return { ...e, url: next };
      }
      preserved += 1;
      return e;
    }));
    lastAppliedGlobalUrlRef.current = next;
    return { changed, preserved };
  };

  const effectivePassword = () => (defaultPassword?.trim() || DEFAULT_TEMPUS_PASSWORD);

  // Defaults + Auto-Vorschläge auf einen einzelnen Empfänger anwenden (wie in
  // app.py::_add_row bzw. _import_excel): URL/Passwort füllen, Name aus Email
  // raten falls leer, Username aus Name ableiten (Modus beachten).
  const enrichEntry = (e, { forceUsernameFromName = false } = {}) => {
    const out = { ...e };
    if (!out.url && globalUrl.trim()) out.url = globalUrl.trim();
    if (!(out.password || '').trim()) out.password = effectivePassword();
    if (!out.name && out.email) out.name = suggestNameFromEmail(out.email);
    const name = (out.name || '').trim();
    const shouldSetUser = forceUsernameFromName || !(out.username || '').trim();
    if (name && shouldSetUser) {
      const derived = suggestUsernameFromName(name, usernameMode);
      out.username = derived;
      out._autoUsername = derived; // Marker für später: Username wurde automatisch gesetzt
    }
    return out;
  };

  const excelInputRef = useRef(null);

  const onPickExcel = async (file) => {
    if (!file) return;
    try {
      const { entries: imported, report } = await parseExcelFile(file);
      // Beim Import: Username immer aus dem Anzeigenamen ableiten (die Excel-
      // Spalte „Benutzername" ist oft falsch/leer), Passwörter und URL aus den
      // globalen Defaults füllen. Das deckt sich mit app.py::_import_excel.
      const enriched = imported.map((e) => enrichEntry(e, { forceUsernameFromName: true }));
      setEntries((prev) => [...prev, ...enriched]);
      setParseReport({ file: file.name, sheets: report });
    } catch (err) {
      alert('Excel konnte nicht gelesen werden: ' + (err?.message || err));
    }
  };

  const addManualEntry = () => {
    setEntries((prev) => [
      ...prev,
      enrichEntry({ name: '', email: '', username: '', password: '', url: '', _manual: true }),
    ]);
  };

  const updateEntry = (idx, field, value) => {
    setEntries((prev) => prev.map((e, i) => {
      if (i !== idx) return e;
      const next = { ...e, [field]: value };

      // Reaktive Ableitung wie in app.py::_on_email_changed / _on_name_changed
      if (field === 'email') {
        const email = (value || '').trim();
        if (email && email.includes('@') && !next.name) {
          next.name = suggestNameFromEmail(email);
        }
        if (next.name && !(next.username || '').trim()) {
          const derived = suggestUsernameFromName(next.name, usernameMode);
          next.username = derived;
          next._autoUsername = derived;
        }
        if (!(next.password || '').trim()) next.password = effectivePassword();
      } else if (field === 'name') {
        const name = (value || '').trim();
        if (name) {
          const derivedNow = suggestUsernameFromName(name, usernameMode);
          const current = (next.username || '').trim();
          // Username mitziehen, wenn er leer ist oder noch dem letzten Auto-Wert entspricht.
          if (!current || current === (e._autoUsername || '')) {
            next.username = derivedNow;
            next._autoUsername = derivedNow;
          }
        }
      } else if (field === 'username') {
        // Manuell angepasst → Auto-Marker entfernen, damit spätere Namenänderung ihn nicht mehr überschreibt.
        delete next._autoUsername;
      }
      return next;
    }));
  };

  const removeEntry = (idx) => {
    setEntries((prev) => prev.filter((_, i) => i !== idx));
  };

  const clearEntries = () => {
    if (entries.length && !confirm(`Alle ${entries.length} Empfänger wirklich entfernen?`)) return;
    setEntries([]);
    setParseReport(null);
  };

  // --- Bulk-Aktionen (analog Desktop-App) ---
  const applyUrlToAll = () => {
    const g = globalUrl.trim();
    if (!g) { alert('Bitte zuerst eine globale URL eingeben.'); return; }
    if (!entries.length) { alert('Keine Empfänger vorhanden.'); return; }
    const nonempty = entries.filter(e => (e.url || '').trim()).length;
    let overwriteAll = true;
    if (nonempty) {
      const r = confirm(
        'Einige Zeilen haben bereits eine URL.\n\n' +
        'OK = alle mit der globalen URL überschreiben\n' +
        'Abbrechen = nur leere URL-Zellen füllen'
      );
      overwriteAll = r === true;
    }
    setEntries(prev => prev.map(e => (overwriteAll || !(e.url || '').trim()) ? { ...e, url: g } : e));
  };

  const applyPasswordToAll = () => {
    const pw = effectivePassword();
    if (!entries.length) { alert('Keine Empfänger vorhanden.'); return; }
    if (!confirm('Alle Passwort-Felder mit dem Initialpasswort überschreiben?')) return;
    setEntries(prev => prev.map(e => ({ ...e, password: pw })));
  };

  const reapplyUsernames = () => {
    if (!entries.length) { alert('Keine Empfänger vorhanden.'); return; }
    setEntries(prev => prev.map(e => {
      const name = (e.name || '').trim();
      if (!name) return e;
      const derived = suggestUsernameFromName(name, usernameMode);
      return { ...e, username: derived, _autoUsername: derived };
    }));
  };

  // ---------------------------------------------------------------------------
  // Tempus-API-Sync: Resources nacheinander anlegen
  // ---------------------------------------------------------------------------
  // Der API-Key wird bewusst nur im State gehalten (nicht in localStorage),
  // damit er nach Reload weg ist. Die Auswahlparameter (Rolle, Security-Group,
  // Timesheet-Flag, Base-URL) werden persistiert.

  const [tempusApiKey, setTempusApiKey] = useState('');
  const [tempusBaseUrl, setTempusBaseUrl] = useState(() => {
    try { return localStorage.getItem(TEMPUS_BASE_URL_KEY) || TEMPUS_DEFAULT_BASE_URL; }
    catch { return TEMPUS_DEFAULT_BASE_URL; }
  });
  useEffect(() => {
    try { localStorage.setItem(TEMPUS_BASE_URL_KEY, tempusBaseUrl || ''); } catch { /* ignore */ }
  }, [tempusBaseUrl]);

  const [tempusIdentityInfo, setTempusIdentityInfo]   = useState(null);
  const [tempusRoles, setTempusRoles]                 = useState([]);
  const [tempusGroups, setTempusGroups]               = useState([]);
  const [tempusConnectError, setTempusConnectError]  = useState('');
  const [tempusConnecting, setTempusConnecting]      = useState(false);
  const tempusErrorRef = useRef(null);
  // ID erhöht sich mit jedem Connect-Versuch, damit der Effekt sicher feuert
  // (auch wenn dieselbe Fehlermeldung zweimal hintereinander auftritt).
  const [tempusErrorBumpId, setTempusErrorBumpId] = useState(0);
  useEffect(() => {
    if (tempusConnectError && tempusErrorRef.current) {
      try {
        tempusErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch { /* ignore */ }
    }
  }, [tempusConnectError, tempusErrorBumpId]);

  const [tempusRoleId, setTempusRoleId] = useState(() => {
    try { const v = localStorage.getItem(TEMPUS_ROLE_KEY); return v ? Number(v) : null; }
    catch { return null; }
  });
  const [tempusSecurityGroupId, setTempusSecurityGroupId] = useState(() => {
    try { const v = localStorage.getItem(TEMPUS_SG_KEY); return v ? Number(v) : null; }
    catch { return null; }
  });
  const [tempusIsTimesheetUser, setTempusIsTimesheetUser] = useState(() => {
    try { return localStorage.getItem(TEMPUS_TIMESHEET_KEY) === '1'; } catch { return false; }
  });
  useEffect(() => {
    try { tempusRoleId != null ? localStorage.setItem(TEMPUS_ROLE_KEY, String(tempusRoleId)) : localStorage.removeItem(TEMPUS_ROLE_KEY); } catch { /* ignore */ }
  }, [tempusRoleId]);
  useEffect(() => {
    try { tempusSecurityGroupId != null ? localStorage.setItem(TEMPUS_SG_KEY, String(tempusSecurityGroupId)) : localStorage.removeItem(TEMPUS_SG_KEY); } catch { /* ignore */ }
  }, [tempusSecurityGroupId]);
  useEffect(() => {
    try { localStorage.setItem(TEMPUS_TIMESHEET_KEY, tempusIsTimesheetUser ? '1' : '0'); } catch { /* ignore */ }
  }, [tempusIsTimesheetUser]);

  // Status pro Empfänger-Zeile beim Sync-Lauf.
  // Jeder Eintrag: { status: 'pending'|'running'|'created'|'exists'|'error'|'skipped', message?, resourceId? }
  const [tempusSyncRows, setTempusSyncRows] = useState([]);
  const [tempusSyncRunning, setTempusSyncRunning] = useState(false);

  const handleTempusConnect = async () => {
    // Robust: trim + alle Whitespaces/Zero-Width-Chars entfernen, die per
    // Copy/Paste aus PDFs/E-Mails reinrutschen und sonst zu „401 Unauthorized“
    // führen ohne dass der User es sieht.
    const rawKey = tempusApiKey || '';
    const key = rawKey
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Zero-Width-Chars
      .replace(/\s+/g, '')                   // Spaces, Tabs, Zeilenumbrüche
      .trim();
    if (key !== rawKey) {
      // Bereinigten Key zurückschreiben, damit der User das auch sieht.
      setTempusApiKey(key);
    }

    setTempusConnectError('');
    if (!key) {
      setTempusConnectError('API-Key fehlt.');
      setTempusErrorBumpId(x => x + 1);
      return;
    }
    // Sehr lockere Format-Prüfung: Tempus-Keys haben das Schema
    // "<resourceId>-<uuid>" (z. B. 373-79b17597-9bc4-4912-9ecb-bcbfcb223050).
    if (!/^\d+-[0-9a-f-]{30,}$/i.test(key)) {
      setTempusConnectError(
        'Der eingegebene API-Key sieht nicht wie ein Tempus-Key aus ' +
        '(erwartet: „<Zahlen>-<UUID>“, z. B. 373-79b17597-9bc4-4912-9ecb-bcbfcb223050). ' +
        'Bitte prüfen, ob der Key vollständig kopiert wurde.'
      );
      setTempusErrorBumpId(x => x + 1);
      return;
    }

    setTempusConnecting(true);
    // Hilfreich beim Debuggen aus der Browser-Konsole
    // (Key wird maskiert ausgegeben, nie vollständig).
    const masked = key.length > 12 ? `${key.slice(0, 6)}…${key.slice(-4)}` : '***';
    // eslint-disable-next-line no-console
    console.info('[Tempus] Verbinde mit Tempus', { keyLength: key.length, masked, baseUrl: tempusBaseUrl });

    try {
      const identity = await tempusIdentity(key);
      const [roles, groups] = await Promise.all([
        tempusListGlobalRoles(key).catch((e) => {
          // eslint-disable-next-line no-console
          console.warn('[Tempus] Rollen konnten nicht geladen werden', e);
          return [];
        }),
        tempusListResourceSecurityGroups(key).catch((e) => {
          // eslint-disable-next-line no-console
          console.warn('[Tempus] Security-Groups konnten nicht geladen werden', e);
          return [];
        }),
      ]);
      // eslint-disable-next-line no-console
      console.info('[Tempus] Verbunden', { identity, roleCount: roles.length, groupCount: groups.length });
      setTempusIdentityInfo(identity);
      setTempusRoles(roles);
      setTempusGroups(groups);
      setTempusRoleId((curr) => {
        if (curr != null && roles.some(r => r.id === curr)) return curr;
        const nonAdmin = roles.find(r => r.systemKey !== 'Administrator');
        return (nonAdmin || roles[0])?.id ?? null;
      });
      setTempusSecurityGroupId((curr) => {
        if (curr != null && groups.some(g => g.id === curr)) return curr;
        return groups[0]?.id ?? null;
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[Tempus] Verbindungs-Fehler', err);
      setTempusIdentityInfo(null);
      const status = err?.status;
      let msg = err?.message || String(err);
      if (status === 401 || status === 403) {
        msg = `Tempus hat den API-Key abgelehnt (HTTP ${status}). ` +
              `Bitte prüfen, ob der Key noch gültig ist und für die Instanz ` +
              `${tempusBaseUrl} ausgegeben wurde. Original-Antwort: ${msg}`;
      } else if (/failed to fetch|networkerror|load failed/i.test(msg)) {
        msg = `Netzwerk-/Browser-Fehler beim Tempus-Aufruf. ` +
              `Häufigste Ursache: ein Adblocker (uBlock, Brave Shield, Privacy Badger, …) ` +
              `blockiert AWS-API-URLs. Bitte für diese Seite deaktivieren oder Inkognito ` +
              `probieren. Original: ${msg}`;
      }
      setTempusConnectError(msg);
      setTempusErrorBumpId(x => x + 1);
    } finally {
      setTempusConnecting(false);
    }
  };

  const handleTempusDisconnect = () => {
    setTempusApiKey('');
    setTempusIdentityInfo(null);
    setTempusRoles([]);
    setTempusGroups([]);
    setTempusConnectError('');
    setTempusSyncRows([]);
  };

  const handleTempusSync = async () => {
    if (!tempusIdentityInfo) { alert('Bitte zuerst mit Tempus verbinden.'); return; }
    if (tempusRoleId == null || tempusSecurityGroupId == null) {
      alert('Bitte Globale Rolle und Security-Group wählen.');
      return;
    }
    const targets = entries
      .map((e, idx) => ({ idx, name: (e.name || '').trim(), email: (e.email || '').trim() }))
      .filter(t => t.name);

    if (!targets.length) {
      alert('Keine Empfänger mit Namen vorhanden. (Die Tempus-API benötigt zwingend einen Namen.)');
      return;
    }

    const ok = confirm(
      `Es werden ${targets.length} Resources nacheinander in Tempus angelegt.\n\n` +
      `Ziel: ${tempusBaseUrl}\n` +
      `Rolle: ${(tempusRoles.find(r => r.id === tempusRoleId)?.name) || tempusRoleId}\n` +
      `Security-Group: ${(tempusGroups.find(g => g.id === tempusSecurityGroupId)?.name) || tempusSecurityGroupId}\n` +
      `Timesheet-User: ${tempusIsTimesheetUser ? 'ja' : 'nein'}\n\n` +
      `Fortfahren?`
    );
    if (!ok) return;

    setTempusSyncRunning(true);
    const initial = targets.map(t => ({ idx: t.idx, name: t.name, email: t.email, status: 'pending' }));
    setTempusSyncRows(initial);

    const updateRow = (idx, patch) => {
      setTempusSyncRows(prev => prev.map(r => (r.idx === idx ? { ...r, ...patch } : r)));
    };

    for (const t of targets) {
      updateRow(t.idx, { status: 'running' });
      try {
        const exists = await tempusResourceNameExists(tempusApiKey, t.name);
        if (exists) {
          updateRow(t.idx, { status: 'exists', message: 'Name in Tempus bereits vergeben — übersprungen.' });
        } else {
          const newId = await tempusCreateResource(tempusApiKey, {
            name: t.name,
            globalRoleId: tempusRoleId,
            securityGroupId: tempusSecurityGroupId,
            isEnabled: true,
            isTimesheetUser: tempusIsTimesheetUser,
          });
          updateRow(t.idx, { status: 'created', resourceId: newId, message: `Angelegt (Id ${newId}).` });
        }
      } catch (err) {
        updateRow(t.idx, { status: 'error', message: err?.message || String(err) });
      }
      // Kurze Pause, damit die API nicht überlastet wird und der Fortschritt sichtbar ist.
      await new Promise(res => setTimeout(res, 150));
    }

    setTempusSyncRunning(false);
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

  const [editDraft, setEditDraft] = useState({ slug: '', title: '', subject: '', bodyHtml: '', fromExt: 'html' });
  const [editorMode, setEditorMode] = useState('visual'); // 'visual' | 'html'
  const visualRef = useRef(null);

  const openEditor = () => {
    if (!activeTemplate) return;
    // Für HTML-Vorlagen: bodyText ist der Quelltext.
    // Für DOCX-Vorlagen: es gibt keinen editierbaren „Quelltext" — wir nehmen das
    // von mammoth gerenderte HTML (mit Bildern als data:-URIs), damit der Nutzer
    // lesbaren Inhalt sieht und direkt bearbeiten kann.
    const rawHtml = activeTemplate.bodyExt === 'docx'
      ? (activeTemplate.renderedHtml || '')
      : (activeTemplate.bodyText || '');
    // Helle/weiße Farben aus dem Quelltext entfernen, bevor sie im weiß-
    // hintergrund-Editor unsichtbar werden.
    const initialHtml = stripHiddenTextColors(rawHtml);
    setEditDraft({
      slug: activeTemplate.slug,
      title: activeTemplate.title,
      subject: activeTemplate.subject,
      bodyHtml: initialHtml,
      fromExt: activeTemplate.bodyExt || 'html',
    });
    setEditorMode('visual');
    setEditing(true);
  };

  // Beim Aktivieren des visuellen Editors bzw. beim Öffnen: innerHTML einmal
  // setzen. Danach arbeiten wir über onInput direkt auf dem DOM-Inhalt, damit
  // React den Cursor nicht bei jedem Tastendruck verliert.
  useEffect(() => {
    if (!editing) return;
    if (editorMode !== 'visual') return;
    const el = visualRef.current;
    if (!el) return;
    if (el.innerHTML !== editDraft.bodyHtml) {
      el.innerHTML = editDraft.bodyHtml || '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, editorMode]);

  const syncVisualToDraft = () => {
    const el = visualRef.current;
    if (!el) return;
    setEditDraft(d => ({ ...d, bodyHtml: el.innerHTML }));
  };

  const insertPlaceholder = (token) => {
    if (editorMode === 'visual') {
      const el = visualRef.current;
      if (!el) return;
      el.focus();
      // execCommand ist zwar als deprecated markiert, wird aber für Rich-Text-
      // Insert in allen gängigen Browsern weiterhin unterstützt. Wir fügen als
      // reinen Text ein, damit keine Farben o. ä. aus der Zwischenablage kommen.
      const ok = document.execCommand && document.execCommand('insertText', false, token);
      if (!ok) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount) {
          const range = sel.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(token));
          range.collapse(false);
        } else {
          el.appendChild(document.createTextNode(token));
        }
      }
      syncVisualToDraft();
    } else {
      setEditDraft(d => ({ ...d, bodyHtml: (d.bodyHtml || '') + token }));
    }
  };

  // Rich-Text-Toolbar: execCommand-Wrapper mit anschließendem Sync.
  const exec = (cmd, value) => {
    const el = visualRef.current;
    if (!el) return;
    el.focus();
    document.execCommand(cmd, false, value);
    syncVisualToDraft();
  };

  // Fix gegen "weiße Schrift auf weißem Hintergrund": Wenn der Nutzer Text aus
  // einer dunklen Oberfläche (wie unserer App) kopiert und im Editor einfügt,
  // nimmt der Browser Farb-Styles mit. Wir entfernen weiße/helle Schriftfarben
  // und dunkle Hintergründe aus den Paste-Daten und fügen dann bereinigt ein.
  const onEditorPaste = (e) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    if (html) {
      const cleaned = html
        // white / #fff / #ffffff / rgb(255,255,255) / rgba(255,255,255,x)
        .replace(/color\s*:\s*(?:white|#fff(?:fff)?|rgba?\(\s*255[,\s]+255[,\s]+255[\s,\d.]*\))\s*;?/gi, '')
        // fast-weiße Farben (rgb >= 230,230,230) pauschal entfernen
        .replace(/color\s*:\s*rgba?\(\s*2[3-5]\d[,\s]+2[3-5]\d[,\s]+2[3-5]\d[\s,\d.]*\)\s*;?/gi, '')
        // Hintergrundfarben aus Dark-UIs entfernen (macht den Editor lesbar)
        .replace(/background(-color)?\s*:\s*[^;"']*;?/gi, '')
        // leere style=""-Reste aufräumen
        .replace(/\sstyle\s*=\s*(['"])\s*\1/gi, '');
      document.execCommand('insertHTML', false, cleaned);
    } else if (text) {
      document.execCommand('insertText', false, text);
    }
    syncVisualToDraft();
  };

  const [copiedToken, setCopiedToken] = useState('');
  const copyToClipboard = async (token) => {
    try {
      await navigator.clipboard.writeText(token);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = token;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch { /* ignore */ }
      ta.remove();
    }
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(t => (t === token ? '' : t)), 1400);
  };

  const handleSave = async () => {
    // Falls der Nutzer zuletzt im Visual-Modus getippt hat, aktuellen Stand
    // aus dem DOM ziehen (useState kennt erst den letzten onInput-Sync).
    const el = visualRef.current;
    const rawBody = (editorMode === 'visual' && el) ? el.innerHTML : editDraft.bodyHtml;

    // Vor dem Speichern helle/weiße Schrift-Farben herausstreichen (Outlook-
    // Sicherheit) und in ein vollständiges HTML-Dokument wickeln (damit
    // Outlook nicht seinen Default-Style nimmt und die Mail nicht abschneidet).
    const bodyHtml = ensureHtmlDocument(stripHiddenTextColors(rawBody));

    if (editDraft.fromExt === 'docx') {
      const ok = confirm(
        'Diese Vorlage war bisher eine Word-Datei (.docx).\n\n' +
        'Beim Speichern wird sie durch die bearbeitete HTML-Version ersetzt. ' +
        'Die Original-.docx geht dabei verloren.\n\nFortfahren?'
      );
      if (!ok) return;
    }

    setBusy(true);
    try {
      await saveTemplate({
        slug: editDraft.slug,
        title: editDraft.title,
        subject: editDraft.subject,
        bodyHtml,
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

  // Body-HTML der aktiven Vorlage. Helle/weiße Farben werden auch hier
  // aktiv entfernt – so wirken Platzhalter in der Vorschau und in
  // Outlook-Entwürfen nicht „unsichtbar", falls sie noch aus einem alten
  // Save mit weißer Schrift stammen.
  const templateRawHtml = stripHiddenTextColors(
    activeTemplate?.bodyExt === 'docx'
      ? (activeTemplate.renderedHtml || '')
      : (activeTemplate?.bodyText || '')
  );

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

  const buildEmlForEntry = (entry, { debug = false } = {}) => {
    const filledHtml = fillTemplate(templateRawHtml, entry);
    const filledSubject = fillTemplate(activeTemplate?.subject || '', entry);
    const eml = buildEml({
      to: entry.email,
      from: senderEmail || undefined,
      subject: filledSubject,
      html: filledHtml,
      images: imageData,
    });
    if (debug) {
      // eslint-disable-next-line no-console
      console.group('[EML Debug]', entry.email);
      // eslint-disable-next-line no-console
      console.log('Länge:', eml.length, 'Zeichen');
      // eslint-disable-next-line no-console
      console.log('Start (erste 800 Zeichen):\n', eml.slice(0, 800));
      // eslint-disable-next-line no-console
      console.log('Header-Check:', {
        hatTo: eml.startsWith('To:'),
        hatMimeVersion: eml.includes('MIME-Version:'),
        hatXUnsent: eml.includes('X-Unsent: 1'),
        hatBoundary: eml.includes('boundary='),
      });
      // eslint-disable-next-line no-console
      console.groupEnd();
    }
    return eml;
  };

  const downloadSingleEml = (entry, { debug = false } = {}) => {
    const content = buildEmlForEntry(entry, { debug: debug || entries.length < 5 });
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

  /**
   * Lädt alle .eml-Dateien einzeln nacheinander herunter. Weil .eml auf macOS/
   * Windows standardmäßig mit Outlook bzw. Mail.app verknüpft ist, öffnet das
   * OS jede Datei direkt als Entwurf. Der Browser fragt beim ersten Mal, ob
   * mehrere Downloads erlaubt sein sollen — danach läuft es durch.
   */
  const [sequentialOpening, setSequentialOpening] = useState(false);
  const [sequentialProgress, setSequentialProgress] = useState(0);

  const openAllInOutlook = async () => {
    if (!validEntries.length || !activeTemplate) return;
    if (validEntries.length > 20) {
      const ok = confirm(
        `${validEntries.length} Entwürfe werden gleichzeitig in Outlook geöffnet.\n\n` +
        `Das kann Outlook ausbremsen. Fortfahren?`
      );
      if (!ok) return;
    }
    setSequentialOpening(true);
    setSequentialProgress(0);
    try {
      for (let i = 0; i < validEntries.length; i++) {
        downloadSingleEml(validEntries[i]);
        setSequentialProgress(i + 1);
        // Kleine Pause, damit der Browser nicht alle Downloads blockt und das OS
        // die einzelnen .eml-Dateien der Reihe nach in Outlook aufmachen kann.
        await new Promise(res => setTimeout(res, 350));
      }
    } finally {
      setSequentialOpening(false);
    }
  };

  /**
   * Alternative: öffnet den Entwurf direkt im System-Mailclient (Standard: Outlook
   * auf Windows, konfigurierbar auf macOS) über einen mailto:-Link. Ohne Download-
   * Umweg, aber ohne HTML-Formatierung und ohne eingebettete Bilder — wir fallen
   * auf Plain-Text aus dem HTML-Body zurück.
   */
  const openInMailClient = (entry) => {
    if (!activeTemplate) return;
    const filledHtml = fillTemplate(templateRawHtml, entry);
    const filledSubject = fillTemplate(activeTemplate.subject || '', entry);
    const plain = htmlToPlainText(filledHtml);
    const url =
      `mailto:${encodeURIComponent(entry.email)}` +
      `?subject=${encodeURIComponent(filledSubject)}` +
      `&body=${encodeURIComponent(plain)}`;
    // mailto: via <a>-Klick ist zuverlässiger als location.href (letzteres
    // navigiert weg, wenn das OS den Handler erst noch öffnet).
    const a = document.createElement('a');
    a.href = url;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const openAllInMailClient = async () => {
    if (!validEntries.length || !activeTemplate) return;
    const ok = confirm(
      `Es werden ${validEntries.length} Entwürfe nacheinander im Standard-Mailclient (mailto:) geöffnet.\n\n` +
      `Hinweis: Über mailto: gehen HTML-Formatierung und Inline-Bilder verloren – es wird eine Plain-Text-Version gesendet. ` +
      `Für formatierte Entwürfe nutze "Alle in Outlook öffnen" (.eml).\n\nFortfahren?`
    );
    if (!ok) return;
    for (let i = 0; i < validEntries.length; i++) {
      openInMailClient(validEntries[i]);
      // Kurze Pause, damit das OS den mailto-Handler nacheinander verarbeitet.
      await new Promise(res => setTimeout(res, 800));
    }
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
          Excel laden → Vorlage wählen → personalisierte Outlook-Entwürfe direkt öffnen
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

      {/* ── STEP 1: EMPFÄNGER ── */}
      {step === 'data' && (
        <section className="glass rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-semibold">Empfänger</h2>
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
              <label className="block text-sm text-white/60 mb-2">Import aus Excel (.xlsx/.xls/.csv)</label>
              <div className="flex gap-2">
                <button
                  onClick={() => excelInputRef.current?.click()}
                  className="flex-1 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-medium flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" /> Excel hinzufügen
                </button>
                <input
                  ref={excelInputRef}
                  type="file"
                  accept=".xlsx,.xls,.xlsm,.csv"
                  onChange={(e) => {
                    onPickExcel(e.target.files?.[0]);
                    if (excelInputRef.current) excelInputRef.current.value = '';
                  }}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-white/40 mt-1">Beim Import werden URL, Passwort und Username gemäß den Defaults unten ergänzt.</p>
            </div>
          </div>

          {/* ── GLOBALE DEFAULTS (URL / Passwort / Username-Modus) ── */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
            <p className="text-sm font-semibold text-white/80">Globale Defaults</p>

            <div className="grid md:grid-cols-[2fr_auto] gap-2 items-end">
              <div>
                <label className="block text-xs text-white/50 mb-1">Globale URL (für alle)</label>
                <input
                  value={globalUrl}
                  onChange={(e) => setGlobalUrl(e.target.value)}
                  onBlur={() => {
                    // Beim Verlassen des Felds leere Zellen + alle auf den
                    // alten globalen Wert gesetzten Zellen mitziehen.
                    // Individuell abweichende URLs bleiben erhalten.
                    propagateGlobalUrlChange(globalUrl);
                  }}
                  placeholder="https://zugang.firma.ch"
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm"
                />
              </div>
              <button
                onClick={applyUrlToAll}
                className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm whitespace-nowrap"
              >
                URL in alle Zeilen
              </button>
            </div>

            <div className="grid md:grid-cols-[2fr_auto] gap-2 items-end">
              <div>
                <label className="block text-xs text-white/50 mb-1">Initialpasswort</label>
                <input
                  value={defaultPassword}
                  onChange={(e) => setDefaultPassword(e.target.value)}
                  placeholder={DEFAULT_TEMPUS_PASSWORD}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm font-mono"
                />
              </div>
              <button
                onClick={applyPasswordToAll}
                className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm whitespace-nowrap"
              >
                Passwörter setzen
              </button>
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1">Username-Modus</label>
              <div className="flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="username_mode"
                    checked={usernameMode === USERNAME_MODE_FIRSTNAME}
                    onChange={() => setUsernameMode(USERNAME_MODE_FIRSTNAME)}
                  />
                  Nur Vorname <span className="text-white/40 text-xs">(z. B. Leonie)</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="username_mode"
                    checked={usernameMode === USERNAME_MODE_FULLNAME}
                    onChange={() => setUsernameMode(USERNAME_MODE_FULLNAME)}
                  />
                  Vor- &amp; Nachname <span className="text-white/40 text-xs">(z. B. Maria Mueller)</span>
                </label>
                <button
                  onClick={reapplyUsernames}
                  className="ml-auto px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
                >
                  Usernames neu setzen
                </button>
              </div>
            </div>
          </div>

          {parseReport && (
            <div className="mt-2 p-4 rounded-xl bg-white/5 border border-white/10 text-sm">
              <p className="font-semibold mb-2">Letzter Import: {parseReport.file}</p>
              <ul className="space-y-1 text-white/70">
                {parseReport.sheets.map((s, i) => (
                  <li key={i}>
                    Blatt <span className="font-mono text-white/90">{s.sheet}</span>: {s.imported} Zeilen importiert
                    {' '}(<span className="text-emerald-300">{s.withEmail} mit E-Mail</span>)
                    {s.inferredEmails > 0 && (
                      <>
                        {' · '}
                        <span className="text-amber-300">{s.inferredEmails} aus Muster ergänzt</span>
                        <span className="text-white/40"> ({s.inferredPattern})</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Aktions-Leiste */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-white/10">
            <div className="text-sm text-white/60">
              {entries.length === 0
                ? 'Noch keine Empfänger. Manuell hinzufügen oder Excel importieren.'
                : <>
                    <span className="text-white font-semibold">{entries.length}</span> Empfänger insgesamt
                    {' · '}
                    <span className="text-emerald-300">{validEntries.length} mit E-Mail</span>
                  </>
              }
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={addManualEntry}
                className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Empfänger hinzufügen
              </button>
              {entries.length > 0 && (
                <button
                  onClick={clearEntries}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-red-500/30 text-sm flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Alle entfernen
                </button>
              )}
            </div>
          </div>

          {entries.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-white/60">
                  <tr>
                    <th className="px-2 py-2 text-left font-semibold w-10">#</th>
                    <th className="px-2 py-2 text-left font-semibold min-w-[160px]">Name</th>
                    <th className="px-2 py-2 text-left font-semibold min-w-[200px]">E-Mail</th>
                    <th className="px-2 py-2 text-left font-semibold min-w-[140px]">Username</th>
                    <th className="px-2 py-2 text-left font-semibold min-w-[180px]">URL</th>
                    <th className="px-2 py-2 text-left font-semibold min-w-[140px]">Passwort</th>
                    <th className="px-2 py-2 text-right font-semibold w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {entries.slice(0, 200).map((e, i) => {
                    const emailValid = e.email && /^[^\s@]+@[^\s@]+\.[^\s@]+/.test(e.email);
                    return (
                      <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02]">
                        <td className="px-2 py-1 text-white/40">{i + 1}</td>
                        <td className="px-2 py-1">
                          <input
                            value={e.name || ''}
                            onChange={(ev) => updateEntry(i, 'name', ev.target.value)}
                            placeholder="Vor- und Nachname"
                            className="w-full px-2 py-1 rounded bg-transparent border border-transparent hover:border-white/10 focus:border-indigo-400/60 focus:bg-white/5 outline-none text-sm"
                          />
                        </td>
                        <td className="px-2 py-1">
                          <input
                            type="email"
                            value={e.email || ''}
                            onChange={(ev) => updateEntry(i, 'email', ev.target.value)}
                            placeholder="name@firma.ch"
                            className={`w-full px-2 py-1 rounded bg-transparent border focus:bg-white/5 outline-none text-sm font-mono ${
                              e.email
                                ? (emailValid ? 'text-emerald-300 border-transparent hover:border-white/10 focus:border-emerald-400/60' : 'text-red-300 border-red-400/30 focus:border-red-400/60')
                                : 'text-white/60 border-red-400/20 focus:border-indigo-400/60'
                            }`}
                          />
                        </td>
                        <td className="px-2 py-1">
                          <input
                            value={e.username || ''}
                            onChange={(ev) => updateEntry(i, 'username', ev.target.value)}
                            className="w-full px-2 py-1 rounded bg-transparent border border-transparent hover:border-white/10 focus:border-indigo-400/60 focus:bg-white/5 outline-none text-sm"
                          />
                        </td>
                        <td className="px-2 py-1">
                          <input
                            value={e.url || ''}
                            onChange={(ev) => updateEntry(i, 'url', ev.target.value)}
                            className="w-full px-2 py-1 rounded bg-transparent border border-transparent hover:border-white/10 focus:border-indigo-400/60 focus:bg-white/5 outline-none text-sm text-white/70"
                          />
                        </td>
                        <td className="px-2 py-1">
                          <input
                            value={e.password || ''}
                            onChange={(ev) => updateEntry(i, 'password', ev.target.value)}
                            className="w-full px-2 py-1 rounded bg-transparent border border-transparent hover:border-white/10 focus:border-indigo-400/60 focus:bg-white/5 outline-none text-sm font-mono"
                          />
                        </td>
                        <td className="px-2 py-1 text-right">
                          <button
                            onClick={() => removeEntry(i)}
                            title="Empfänger entfernen"
                            className="p-1.5 rounded-md text-white/30 hover:text-red-300 hover:bg-red-500/10 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {entries.length > 200 && (
                <div className="px-3 py-2 text-xs text-white/40 bg-white/5 border-t border-white/10">
                  … {entries.length - 200} weitere Zeilen ausgeblendet. Für &gt;200 Empfänger bitte in Batches verarbeiten.
                </div>
              )}
            </div>
          )}

          {/* ── TEMPUS-API-SYNC ─────────────────────────────────────────── */}
          {entries.length > 0 && (
            <div className="mt-4 p-4 rounded-xl border border-indigo-400/30 bg-indigo-500/[0.06] space-y-4">
              <div className="flex items-start gap-3">
                <Zap className="w-6 h-6 text-indigo-300 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">User in Tempus anlegen (optional)</h3>
                  <p className="text-xs text-white/60 mt-1">
                    Legt pro Empfänger einen <span className="font-semibold text-white/80">Tempus-Resource-Eintrag</span> (Stammdatensatz) via API
                    an. Bestehende Namen werden übersprungen, E-Mail/Username/Passwort werden NICHT über die API gesetzt —
                    diese kommen weiterhin via Login-Mail. Ziel-Instanz ist aktuell fest:
                    {' '}<span className="font-mono text-white/70">{TEMPUS_DEFAULT_BASE_URL}</span>.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-[1fr_auto] gap-2 items-end">
                <div>
                  <label className="block text-xs text-white/50 mb-1">Tempus API-Key</label>
                  <input
                    type="password"
                    autoComplete="off"
                    value={tempusApiKey}
                    onChange={(e) => setTempusApiKey(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !tempusConnecting) handleTempusConnect(); }}
                    placeholder="z. B. 373-79b17597-9bc4-4912-9ecb-bcbfcb223050"
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm font-mono"
                  />
                  <p className="text-xs text-white/40 mt-1">
                    Profil → <span className="text-white/60">API Token</span> in Tempus. Wird nicht gespeichert; nach Reload erneut eingeben.
                  </p>
                </div>
                <div className="flex gap-2">
                  {!tempusIdentityInfo ? (
                    <button
                      onClick={handleTempusConnect}
                      disabled={tempusConnecting || !tempusApiKey.trim()}
                      className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm flex items-center gap-2"
                    >
                      {tempusConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plug className="w-4 h-4" />}
                      Verbinden
                    </button>
                  ) : (
                    <button
                      onClick={handleTempusDisconnect}
                      className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm flex items-center gap-2"
                    >
                      <X className="w-4 h-4" /> Trennen
                    </button>
                  )}
                </div>
              </div>

              {tempusConnectError && (
                <div
                  ref={tempusErrorRef}
                  role="alert"
                  className="p-4 rounded-lg bg-red-500/15 border-2 border-red-400/60 text-sm text-red-100 flex items-start gap-3 shadow-lg shadow-red-500/10"
                >
                  <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-red-300" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-red-200 mb-1">
                      Verbindung zu Tempus fehlgeschlagen
                    </div>
                    <span className="break-words whitespace-pre-wrap">{tempusConnectError}</span>
                    <div className="mt-2 text-xs text-red-200/70">
                      Tipp: Browser-Konsole öffnen (F12 → Console) für Details. Suche nach „[Tempus]“.
                    </div>
                  </div>
                  <button
                    onClick={() => setTempusConnectError('')}
                    className="text-red-200/70 hover:text-red-100 shrink-0"
                    title="Fehler ausblenden"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {tempusIdentityInfo && (
                <>
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-400/30 text-sm text-emerald-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                      Verbunden als <span className="font-semibold">{tempusIdentityInfo.name}</span>
                      {' '}(Id {tempusIdentityInfo.id})
                      {tempusIdentityInfo.globalRoleId && <span className="text-white/60"> · globalRoleId {tempusIdentityInfo.globalRoleId}</span>}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-white/50 mb-1">Globale Rolle für neue User</label>
                      <select
                        value={tempusRoleId ?? ''}
                        onChange={(e) => setTempusRoleId(e.target.value ? Number(e.target.value) : null)}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm"
                      >
                        <option value="">– bitte wählen –</option>
                        {tempusRoles.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.name}{r.systemKey === 'Administrator' ? ' ⚠︎' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-white/50 mb-1">Security-Group</label>
                      <select
                        value={tempusSecurityGroupId ?? ''}
                        onChange={(e) => setTempusSecurityGroupId(e.target.value ? Number(e.target.value) : null)}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm"
                      >
                        <option value="">– bitte wählen –</option>
                        {tempusGroups.map(g => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-white/50 mb-1">Timesheets</label>
                      <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tempusIsTimesheetUser}
                          onChange={(e) => setTempusIsTimesheetUser(e.target.checked)}
                        />
                        isTimesheetUser = true
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
                    <p className="text-xs text-white/60">
                      {entries.filter(e => (e.name || '').trim()).length} von {entries.length} Empfängern haben einen Namen und werden versucht anzulegen.
                    </p>
                    <button
                      onClick={handleTempusSync}
                      disabled={tempusSyncRunning || !entries.length || tempusRoleId == null || tempusSecurityGroupId == null}
                      className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 font-semibold text-sm flex items-center gap-2"
                    >
                      {tempusSyncRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                      {tempusSyncRunning ? 'Lege an …' : `Alle ${entries.filter(e => (e.name || '').trim()).length} in Tempus anlegen`}
                    </button>
                  </div>
                </>
              )}

              {tempusSyncRows.length > 0 && (
                <div className="mt-3 rounded-xl border border-white/10 overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-white/5 text-xs text-white/60">
                    <span>
                      Fortschritt:
                      {' '}<span className="text-emerald-300">{tempusSyncRows.filter(r => r.status === 'created').length} angelegt</span>
                      {' · '}<span className="text-amber-300">{tempusSyncRows.filter(r => r.status === 'exists').length} existieren</span>
                      {' · '}<span className="text-red-300">{tempusSyncRows.filter(r => r.status === 'error').length} Fehler</span>
                      {' · '}<span className="text-white/50">{tempusSyncRows.filter(r => r.status === 'pending' || r.status === 'running').length} offen</span>
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    <table className="w-full text-sm">
                      <tbody>
                        {tempusSyncRows.map((r) => {
                          const iconMap = {
                            pending:  <MinusCircle className="w-4 h-4 text-white/30" />,
                            running:  <Loader2 className="w-4 h-4 animate-spin text-indigo-300" />,
                            created:  <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
                            exists:   <AlertTriangle className="w-4 h-4 text-amber-300" />,
                            error:    <XCircle className="w-4 h-4 text-red-400" />,
                            skipped:  <MinusCircle className="w-4 h-4 text-white/30" />,
                          };
                          return (
                            <tr key={r.idx} className="border-t border-white/5">
                              <td className="px-3 py-2 w-8">{iconMap[r.status] || null}</td>
                              <td className="px-2 py-2">
                                <div className="font-medium text-white/90">{r.name || <span className="text-white/40">(kein Name)</span>}</div>
                                {r.email && <div className="text-xs text-white/40 font-mono">{r.email}</div>}
                              </td>
                              <td className="px-2 py-2 text-xs text-white/60">
                                {r.message || (r.status === 'running' ? 'läuft …' : r.status === 'pending' ? 'warte …' : '')}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => {
                // Sicherheitsnetz: wenn der Nutzer die globale URL im Feld
                // geändert, aber noch nicht "bestätigt" hat (kein Blur), die
                // Änderung jetzt noch kurz vor dem Wechsel propagieren.
                propagateGlobalUrlChange(globalUrl);
                setStep('template');
              }}
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
                      className="rounded-xl bg-white text-slate-900 p-4 max-h-[400px] overflow-auto text-sm mailer-visual-editor"
                      dangerouslySetInnerHTML={{
                        __html: stripHiddenTextColors(
                          inlineImagesAsDataUris(
                            activeTemplate.bodyExt === 'docx'
                              ? (activeTemplate.renderedHtml || '')
                              : (activeTemplate.bodyText || ''),
                            imageData
                          )
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

                    <div className="ml-auto inline-flex rounded-lg bg-white/5 border border-white/10 p-0.5">
                      <button
                        type="button"
                        onClick={() => setEditorMode('visual')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
                          editorMode === 'visual'
                            ? 'bg-indigo-500 text-white'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        <Type className="w-3.5 h-3.5" /> Visuell
                      </button>
                      <button
                        type="button"
                        onClick={() => { syncVisualToDraft(); setEditorMode('html'); }}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
                          editorMode === 'html'
                            ? 'bg-indigo-500 text-white'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        <Code2 className="w-3.5 h-3.5" /> HTML-Quelltext
                      </button>
                    </div>
                  </div>

                  {editDraft.fromExt === 'docx' && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-400/30 text-xs text-amber-100 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        Diese Vorlage war eine <b>Word-Datei</b>. Du bearbeitest gerade die automatisch
                        aus <span className="font-mono">body.docx</span> konvertierte HTML-Ansicht. Wenn
                        du speicherst, wird die <span className="font-mono">.docx</span> durch diese
                        HTML-Version ersetzt.
                      </div>
                    </div>
                  )}

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

                  <div className="grid md:grid-cols-[220px_1fr] gap-3">
                    {/* Platzhalter-Panel links */}
                    <aside className="space-y-3">
                      <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                        <p className="text-xs font-semibold text-white/80 mb-2">Platzhalter</p>
                        <p className="text-[11px] text-white/40 mb-2 leading-snug">
                          Klick = an Cursor einfügen · <Copy className="w-3 h-3 inline-block" /> = kopieren (nur als Text einfügen)
                        </p>
                        <ul className="space-y-1">
                          {PLACEHOLDERS.map(({ token, label, desc }) => (
                            <li key={token} className="flex items-stretch gap-1">
                              <button
                                type="button"
                                onClick={() => insertPlaceholder(token)}
                                className="flex-1 text-left px-2 py-1.5 rounded-md bg-white/5 hover:bg-indigo-500/20 border border-white/5 hover:border-indigo-400/40 transition"
                                title={`${token} an Cursor einfügen`}
                              >
                                <span className="block font-mono text-xs text-indigo-200">{token}</span>
                                <span className="block text-[10px] text-white/40 leading-tight">{label} — {desc}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(token)}
                                className={`px-2 rounded-md border text-white/60 hover:text-white transition ${
                                  copiedToken === token
                                    ? 'bg-emerald-500/30 border-emerald-400/60 text-emerald-100'
                                    : 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/20'
                                }`}
                                title="In Zwischenablage kopieren"
                              >
                                {copiedToken === token ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                        <p className="text-xs font-semibold text-white/80 mb-2">Tipps</p>
                        <ul className="text-[11px] text-white/50 space-y-1.5 leading-snug">
                          <li>Platzhalter werden beim Versand automatisch durch die Daten aus der Empfängerliste ersetzt.</li>
                          <li>Beim Einfügen aus der App wird die Farbe automatisch bereinigt (keine weiße Schrift mehr).</li>
                          <li><kbd className="px-1 py-0.5 rounded bg-white/10 text-[10px]">⌘/Ctrl+B</kbd> fett · <kbd className="px-1 py-0.5 rounded bg-white/10 text-[10px]">⌘/Ctrl+I</kbd> kursiv · <kbd className="px-1 py-0.5 rounded bg-white/10 text-[10px]">⌘/Ctrl+U</kbd> unterstrichen.</li>
                        </ul>
                      </div>
                    </aside>

                    {/* Editor rechts (Toolbar + Eingabefeld) */}
                    <div className="space-y-0">
                      {editorMode === 'visual' && (
                        <div className="flex items-center gap-0.5 flex-wrap px-2 py-1.5 rounded-t-lg bg-slate-800/80 border border-b-0 border-white/20">
                          <ToolbarButton onClick={() => exec('bold')} title="Fett (⌘/Ctrl+B)"><Bold className="w-4 h-4" /></ToolbarButton>
                          <ToolbarButton onClick={() => exec('italic')} title="Kursiv (⌘/Ctrl+I)"><Italic className="w-4 h-4" /></ToolbarButton>
                          <ToolbarButton onClick={() => exec('underline')} title="Unterstrichen (⌘/Ctrl+U)"><Underline className="w-4 h-4" /></ToolbarButton>
                          <ToolbarDivider />
                          <select
                            onChange={(e) => { if (e.target.value) { exec('formatBlock', e.target.value); e.target.value = ''; } }}
                            className="px-1.5 py-1 text-xs rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white/70"
                            title="Absatz-Format"
                            defaultValue=""
                          >
                            <option value="" disabled>Format</option>
                            <option value="p">Absatz</option>
                            <option value="h1">Überschrift 1</option>
                            <option value="h2">Überschrift 2</option>
                            <option value="h3">Überschrift 3</option>
                            <option value="blockquote">Zitat</option>
                            <option value="pre">Code-Block</option>
                          </select>
                          <ToolbarButton onClick={() => exec('formatBlock', 'h2')} title="Überschrift 2"><Heading2 className="w-4 h-4" /></ToolbarButton>
                          <ToolbarButton onClick={() => exec('formatBlock', 'h3')} title="Überschrift 3"><Heading3 className="w-4 h-4" /></ToolbarButton>
                          <ToolbarDivider />
                          <ToolbarButton onClick={() => exec('insertUnorderedList')} title="Aufzählungsliste"><List className="w-4 h-4" /></ToolbarButton>
                          <ToolbarButton onClick={() => exec('insertOrderedList')} title="Nummerierte Liste"><ListOrdered className="w-4 h-4" /></ToolbarButton>
                          <ToolbarDivider />
                          <ToolbarButton onClick={() => exec('justifyLeft')} title="Linksbündig"><AlignLeft className="w-4 h-4" /></ToolbarButton>
                          <ToolbarButton onClick={() => exec('justifyCenter')} title="Zentriert"><AlignCenter className="w-4 h-4" /></ToolbarButton>
                          <ToolbarButton onClick={() => exec('justifyRight')} title="Rechtsbündig"><AlignRight className="w-4 h-4" /></ToolbarButton>
                          <ToolbarDivider />
                          <ToolbarButton
                            onClick={() => {
                              const sel = window.getSelection()?.toString();
                              const url = prompt('Link-URL (inkl. https://):', 'https://');
                              if (!url) return;
                              if (!sel) {
                                // kein Text markiert → Text + Link in einem Rutsch einfügen
                                const label = prompt('Link-Text:', url) || url;
                                exec('insertHTML', `<a href="${url}">${label}</a>`);
                              } else {
                                exec('createLink', url);
                              }
                            }}
                            title="Link einfügen"
                          ><LinkIcon className="w-4 h-4" /></ToolbarButton>
                          <label className="relative inline-flex items-center px-1 py-1 rounded hover:bg-white/10 cursor-pointer" title="Textfarbe">
                            <Palette className="w-4 h-4 text-white/70" />
                            <input
                              type="color"
                              onChange={(e) => exec('foreColor', e.target.value)}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </label>
                          <ToolbarDivider />
                          <ToolbarButton onClick={() => exec('removeFormat')} title="Formatierung entfernen"><Eraser className="w-4 h-4" /></ToolbarButton>
                        </div>
                      )}

                      {editorMode === 'visual' ? (
                        <div
                          ref={visualRef}
                          contentEditable
                          suppressContentEditableWarning
                          onInput={syncVisualToDraft}
                          onBlur={syncVisualToDraft}
                          onPaste={onEditorPaste}
                          className="w-full min-h-[460px] max-h-[600px] overflow-auto px-5 py-4 rounded-b-lg bg-white text-slate-900 border border-white/20 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-400/40 shadow-inner mailer-visual-editor"
                          style={{ fontFamily: "Calibri, 'Segoe UI', Arial, sans-serif" }}
                        />
                      ) : (
                        <textarea
                          value={editDraft.bodyHtml}
                          onChange={(e) => setEditDraft(d => ({ ...d, bodyHtml: e.target.value }))}
                          rows={24}
                          spellCheck={false}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900/80 border border-white/20 text-xs font-mono leading-relaxed"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between gap-2 items-center">
                    <p className="text-xs text-white/40">
                      {editorMode === 'visual'
                        ? 'Direkt bearbeiten wie in Word. Platzhalter werden beim Versand ersetzt.'
                        : 'HTML-Quelltext. Praktisch für Profis und zum Ersetzen von Bild-Pfaden wie src="bilder/logo.png".'}
                    </p>
                    <div className="flex gap-2">
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
              Weiter: In Outlook öffnen →
            </button>
          </div>
        </section>
      )}

      {/* ── STEP 4: SENDEN / ENTWÜRFE ÖFFNEN ── */}
      {step === 'download' && (
        <section className="glass rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-semibold">Entwürfe in Outlook öffnen</h2>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 space-y-3">
            <p>
              Zwei Wege, alle Entwürfe zu öffnen:
            </p>
            <ul className="space-y-2 text-xs">
              <li className="flex gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-bold">A</span>
                <span>
                  <b className="text-white/90">Mit HTML &amp; Bildern (empfohlen) →</b>{' '}
                  <b>„Alle in Outlook öffnen (.eml)"</b> lädt die Dateien herunter. Das OS öffnet jede <b>.eml</b> als Entwurf in Outlook – wenn die Datei-Verknüpfung stimmt.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center text-[10px] font-bold">B</span>
                <span>
                  <b className="text-white/90">Sofort-Compose (nur Plain-Text) →</b>{' '}
                  <b>„Alle im Mailclient öffnen (mailto)"</b> startet Outlook direkt ohne Download. <b>Ohne</b> HTML-Format und <b>ohne</b> Bilder.
                </span>
              </li>
            </ul>

            <details className="rounded-lg bg-black/20 border border-white/10 p-3 text-xs text-white/60">
              <summary className="cursor-pointer select-none font-semibold text-white/80">
                Outlook öffnet meine .eml nicht automatisch? (einmalige Einrichtung)
              </summary>
              <div className="mt-2 space-y-2">
                <p>
                  <b className="text-white/80">macOS</b> — im Finder eine beliebige <span className="font-mono">.eml</span> rechts-klicken →{' '}
                  <b>„Informationen"</b> → unter <b>„Öffnen mit"</b> Outlook wählen → <b>„Alle ändern…"</b> klicken.
                  Danach öffnet sich jede .eml per Doppelklick direkt als Outlook-Entwurf.
                </p>
                <p>
                  <b className="text-white/80">Chrome</b> — nach dem ersten Download einmal den kleinen Pfeil neben der Datei in der Download-Leiste öffnen
                  und <b>„Dateien dieses Typs immer öffnen"</b> aktivieren. Danach startet Chrome jede neue .eml direkt im Mail-Handler.
                </p>
                <p>
                  <b className="text-white/80">Windows</b> — Einstellungen → Standard-Apps → Mail → Outlook wählen, oder eine .eml rechts-klicken →
                  <b> „Öffnen mit"</b> → <b>„Andere App auswählen"</b> → Outlook + <b>„Immer diese App verwenden"</b>.
                </p>
              </div>
            </details>
          </div>

          {/* Haupt-Actions: zwei Wege */}
          <div className="grid md:grid-cols-2 gap-3">
            <button
              onClick={openAllInOutlook}
              disabled={!validEntries.length || !activeTemplate || sequentialOpening}
              className="p-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3"
            >
              {sequentialOpening ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Mail className="w-5 h-5" />
              )}
              <div className="text-left flex-1">
                <p>
                  {sequentialOpening
                    ? `Öffne ${sequentialProgress} / ${validEntries.length} in Outlook…`
                    : `Alle ${validEntries.length} in Outlook öffnen (.eml)`}
                </p>
                <p className="text-xs opacity-70 font-normal">
                  Weg A — Mit HTML &amp; Bildern · Download + OS-Handler
                </p>
              </div>
            </button>

            <button
              onClick={openAllInMailClient}
              disabled={!validEntries.length || !activeTemplate}
              className="p-5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3"
            >
              <ExternalLink className="w-5 h-5" />
              <div className="text-left flex-1">
                <p>Alle {validEntries.length} im Mailclient öffnen</p>
                <p className="text-xs opacity-80 font-normal">
                  Weg B — Sofort ohne Download · Plain-Text (mailto:)
                </p>
              </div>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {/* Alternative: ZIP-Download */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Archive className="w-4 h-4 text-indigo-300" /> Stattdessen als ZIP
              </p>
              <p className="text-xs text-white/50">
                Sinnvoll bei sehr vielen Empfängern: eine einzige <b>.zip</b> herunterladen, entpacken,
                alle <b>.eml</b> markieren und auf das Outlook-Icon im Dock ziehen.
              </p>
              <button
                onClick={downloadAllEmls}
                disabled={!validEntries.length || !activeTemplate}
                className="w-full px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Archive className="w-4 h-4" /> ZIP aller {validEntries.length} Entwürfe
              </button>
            </div>

            {/* Einzeln öffnen */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400" /> Einzeln öffnen
              </p>
              <p className="text-[11px] text-white/40 mb-2">
                <Mail className="w-3 h-3 inline-block" /> .eml (HTML + Bilder) · <ExternalLink className="w-3 h-3 inline-block" /> mailto (direkt im Mailclient, Plain-Text)
                <button
                  onClick={() => {
                    if (!validEntries.length) return;
                    const sample = buildEmlForEntry(validEntries[0], { debug: true });
                    // eslint-disable-next-line no-console
                    console.log('[EML] Voller Inhalt der ersten E-Mail:', sample);
                    alert(
                      `EML-Debug (erste E-Mail) — öffne F12 → Console für Details.\n\n` +
                      `Länge: ${sample.length} Zeichen\n` +
                      `Anfang:\n${sample.slice(0, 400)}…`
                    );
                  }}
                  className="ml-2 underline text-indigo-300 hover:text-indigo-200"
                  title="Zeigt die ersten Zeichen der generierten EML in der Konsole/Alert"
                >
                  (Debug)
                </button>
              </p>
              <div className="max-h-[260px] overflow-y-auto space-y-1 text-sm">
                {validEntries.map((e, i) => (
                  <div key={i} className="flex items-stretch gap-1">
                    <button
                      onClick={() => downloadSingleEml(e)}
                      className="flex-1 flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-left"
                      title="Als .eml herunterladen und in Outlook öffnen (HTML + Bilder)"
                    >
                      <span className="truncate">
                        <span className="text-white/60 text-xs mr-2">{i + 1}.</span>
                        <span>{e.name || e.email}</span>
                      </span>
                      <Mail className="w-4 h-4 text-white/40 flex-shrink-0" />
                    </button>
                    <button
                      onClick={() => openInMailClient(e)}
                      className="px-3 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-400/20 text-sky-200"
                      title="Direkt im Standard-Mailclient öffnen (mailto, Plain-Text)"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
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
