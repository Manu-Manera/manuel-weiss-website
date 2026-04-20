/**
 * Helpers für den Tempus Login Mailer:
 * - Excel-Parser (SheetJS) mit Spalten-Erkennung (E-Mail, Username, Passwort, URL, Name,
 *   Vorname, Nachname), inklusive Hyperlink-Erkennung (mailto:) und Lernen von
 *   Email-Mustern (z. B. {vorname}.{nachname}@firma.com), um fehlende Adressen
 *   aus Namen zu ergänzen.
 * - docx → HTML (mammoth)
 * - Platzhalter-Ersetzung {NAME} {EMAIL} {URL} {USERNAME} {PASSWORD}
 * - EML-Datei-Generator (RFC 822 / MIME multipart/related mit inline Bildern)
 * - Namens-/Usernames-Vorschläge (analog zur Desktop-App in services/name_suggester.py)
 * - Helfer zur Dateinamenbereinigung und ZIP-Batch-Download
 */

import * as XLSX from 'xlsx';
import mammoth from 'mammoth/mammoth.browser.js';
import JSZip from 'jszip';

// ---------------------------------------------------------------------------
// Excel Parsing
// ---------------------------------------------------------------------------

// 1:1 aus tempus-login-mailer/services/excel_parser.py portiert.
// Kein nacktes „adresse" (fängt sonst Straßen-Spalten ein).
const COLUMN_PATTERNS = {
  email:    /(e[-_\s]?mail|^\s*email\s*$|^\s*e_mail\s*$|^\s*mail\s*$|mail\s*adresse|mail\s*address|e.?mail\s*adresse|empf.+mail|recipient|work\s*e[-_]?mail|business\s*e[-_]?mail|primary\s*e[-_]?mail|contact\s*e[-_]?mail|\bemail\s*address\b|\bemail\b)/i,
  username: /(user\s?name|user\s?id|benutzer|benutzername|login.?id)/i,
  password: /(pass\s?word|passwort|kennwort|\bpw\b|\bpwd\b)/i,
  url:      /(url|link|website|login.?url|zugang)/i,
  name:     /(^name$|full\s?name|display\s?name|anzeigename|client\s?name|kunde|kontakt|empf[äa]nger|teilnehmer|vor[\s\-/]*(?:und|&|\+|u\.)?[\s\-/]*nachname|vor[\s\-/]*nachname|name\s*\(vorname)/i,
  vorname:  /(^vorname$|^firstname$|^given\s?name$|^voornaam$|^pr[eé]nom$)/i,
  nachname: /(^nachname$|^lastname$|^surname$|^family\s?name$|^achternaam$|^nom$)/i,
};

// Strenger: ASCII-typisch (wird zuerst geprüft).
const EMAIL_STRICT = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;
// Weicher: erlaubt Umlaute im lokalen Teil, IDN-Domains.
const EMAIL_LOOSE_FULL = /^[^\s<>,;:"']+@[^\s<>,;:"']+\.[^\s<>,;:"']{2,}$/;
const EMAIL_RE = /[^\s<>,;:"']+@[^\s<>,;:"']+\.[^\s<>,;:"']{2,}/;

// ---------------------------------------------------------------------------
// Transliteration & Namens-/Username-Vorschläge (Port aus name_suggester.py)
// ---------------------------------------------------------------------------

const UMLAUT_MAP = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss', 'Ä': 'Ae', 'Ö': 'Oe', 'Ü': 'Ue' };

/** Umlaute → ae/oe/ue/ss, Diakritika entfernen, ASCII-ähnlich. */
function translit(s) {
  if (!s) return '';
  let out = '';
  for (const ch of String(s)) out += (UMLAUT_MAP[ch] || ch);
  return out.normalize('NFKD').replace(/\p{Diacritic}/gu, '');
}

export const USERNAME_MODE_FIRSTNAME = 'firstname';
export const USERNAME_MODE_FULLNAME  = 'fullname';

export const DEFAULT_TEMPUS_PASSWORD = 'Passwort123@Tempus';

/** Ableitung: „leonie.dahl@firma.com" → „Leonie Dahl". */
export function suggestNameFromEmail(email) {
  if (!email || !email.includes('@')) return '';
  const local = email.split('@')[0].trim().toLowerCase();
  for (const sep of ['.', '_', '-']) {
    if (local.includes(sep)) {
      const parts = local.split(sep).filter(Boolean);
      if (parts.length >= 2) {
        return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
      }
    }
  }
  const m = local.match(/^([a-z])([a-z]+)$/);
  if (m && m[2].length >= 3) {
    return `${m[1].toUpperCase()}. ${m[2].charAt(0).toUpperCase() + m[2].slice(1)}`;
  }
  return local.charAt(0).toUpperCase() + local.slice(1);
}

function slugLoginToken(s) {
  return translit(String(s || '').toLowerCase().trim()).replace(/[^a-z0-9]/g, '');
}

function formatUsernameProperCase(username) {
  if (!username) return '';
  const cap = (seg) => !seg ? seg : (seg.length > 1 ? seg[0].toUpperCase() + seg.slice(1) : seg.toUpperCase());
  if (username.includes('.')) return username.split('.').filter(Boolean).map(cap).join('.');
  if (/\s/.test(username.trim())) return username.split(/\s+/).filter(Boolean).map(cap).join(' ');
  return cap(username);
}

/**
 * Username aus Anzeigenamen ableiten.
 * mode = 'firstname' → nur Vorname (z. B. „Leonie")
 * mode = 'fullname'  → „Vorname Nachname" (erster + letzter Token, Leerzeichen)
 */
export function suggestUsernameFromName(displayName, mode = USERNAME_MODE_FIRSTNAME) {
  const parts = String(displayName || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '';
  const tokens = parts.map(slugLoginToken).filter(Boolean);
  if (!tokens.length) return '';
  let raw;
  if (mode === USERNAME_MODE_FIRSTNAME) {
    raw = tokens[0];
  } else if (tokens.length === 1) {
    raw = tokens[0];
  } else {
    raw = `${tokens[0]} ${tokens[tokens.length - 1]}`;
  }
  return formatUsernameProperCase(raw);
}

// ---------------------------------------------------------------------------
// E-Mail-Muster lernen (aus bestehenden Paaren Name+E-Mail) und fehlende Adressen
// ableiten. Analog zu _learn_email_pattern + _format_local in excel_parser.py.
// ---------------------------------------------------------------------------

const LOCAL_PATTERNS = [
  '{vorname}.{nachname}',
  '{nachname}.{vorname}',
  '{v}.{nachname}',
  '{vorname}.{n}',
  '{vorname}{nachname}',
  '{nachname}{vorname}',
  '{vorname}_{nachname}',
  '{vorname}-{nachname}',
  '{v}{nachname}',
  '{vorname}',
  '{nachname}',
];

function formatLocal(pattern, vorname, nachname) {
  const v = translit(vorname).toLowerCase().replace(/\s+/g, '');
  const n = translit(nachname).toLowerCase().replace(/\s+/g, '');
  if (!v && !n) return '';
  return pattern
    .replace('{vorname}', v || '')
    .replace('{nachname}', n || '')
    .replace('{v}', v ? v[0] : '')
    .replace('{n}', n ? n[0] : '');
}

function learnEmailPattern(pairs) {
  const votes = new Map();
  for (const [name, email] of pairs) {
    if (!email || !email.includes('@')) continue;
    const [local, domain] = email.split('@');
    const [vor, nach] = splitName(name);
    if (!vor && !nach) continue;
    const localL = local.toLowerCase();
    const domainL = (domain || '').toLowerCase();
    for (const pat of LOCAL_PATTERNS) {
      const cand = formatLocal(pat, vor, nach);
      if (cand && cand === localL) {
        const key = `${pat}\u0000${domainL}`;
        votes.set(key, (votes.get(key) || 0) + 1);
        break;
      }
    }
  }
  if (!votes.size) return null;
  let bestKey = null, bestCount = -1;
  for (const [k, c] of votes) { if (c > bestCount) { bestCount = c; bestKey = k; } }
  const [pattern, domain] = bestKey.split('\u0000');
  return { pattern, domain };
}

function pickDominantDomain(emails) {
  const c = new Map();
  for (const e of emails) {
    const d = (e.split('@')[1] || '').trim().toLowerCase();
    if (d) c.set(d, (c.get(d) || 0) + 1);
  }
  let best = '', max = 0;
  for (const [d, n] of c) if (n > max) { max = n; best = d; }
  return best;
}

function cellToStr(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') {
    if (Number.isFinite(v) && Math.floor(v) === v) return String(v);
    return String(v).trim();
  }
  return String(v).trim();
}

function normalizeEmail(raw) {
  let s = cellToStr(raw);
  if (!s) return '';
  if (s.toLowerCase().startsWith('mailto:')) s = s.slice(7).trim();
  const bracket = s.match(/<([^<>@\s]+@[^>]+)>/);
  if (bracket) s = bracket[1].trim();
  s = s.trim().replace(/^["']+|["']+$/g, '');
  if (!s.includes('@')) return '';
  // Zuerst strikt (fullmatch), dann loose (fullmatch), dann Teilstring-Suche als
  // letzte Rettung. Verhindert, dass „müller@…" als „ller@…" zurückkommt.
  if (EMAIL_STRICT.test(s)) return s;
  if (EMAIL_LOOSE_FULL.test(s)) return s;
  const m = s.match(EMAIL_RE);
  return m ? m[0].trim() : '';
}

function firstEmailInRow(row) {
  for (const cell of row) {
    const e = normalizeEmail(cell);
    if (e) return e;
  }
  return '';
}

function firstEmailInLinks(linkRow) {
  if (!linkRow) return '';
  for (const le of linkRow) {
    if (le) return le;
  }
  return '';
}

/**
 * Liest das Sheet als 2D-Matrix – analog zu XLSX.utils.sheet_to_json({header:1}),
 * berücksichtigt aber zusätzlich Hyperlinks (cell.l.Target). Wenn die Zelle
 * sichtbar leer ist, das Hyperlink-Target aber eine mailto:-Adresse enthält,
 * wird diese im parallelen `linkEmails`-Array gemerkt. Das ist nötig, weil
 * Outlook-Kontakt-Exporte E-Mails häufig nur als Hyperlink speichern.
 */
function sheetToRowsWithLinks(ws) {
  const ref = ws['!ref'];
  if (!ref) return { rows: [], linkEmails: [] };
  const range = XLSX.utils.decode_range(ref);
  const rows = [];
  const linkEmails = [];

  for (let R = range.s.r; R <= range.e.r; R++) {
    const row = [];
    const linkRow = [];
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = ws[addr];
      if (!cell) { row.push(''); linkRow.push(''); continue; }
      const text = cell.w != null ? String(cell.w) : (cell.v != null ? String(cell.v) : '');
      let linkEmail = '';
      if (cell.l && cell.l.Target) {
        const t = String(cell.l.Target).replace(/^mailto:/i, '').split('?')[0].trim();
        const m = t.match(EMAIL_RE);
        if (m) linkEmail = m[0];
      }
      row.push(text);
      linkRow.push(linkEmail);
    }
    rows.push(row);
    linkEmails.push(linkRow);
  }
  return { rows, linkEmails };
}

function detectColumns(headers) {
  const map = { email: null, username: null, password: null, url: null, name: null, vorname: null, nachname: null };
  for (let i = 0; i < headers.length; i++) {
    const h = cellToStr(headers[i]);
    if (!h) continue;
    if (map.vorname === null && COLUMN_PATTERNS.vorname.test(h))   { map.vorname = i; continue; }
    if (map.nachname === null && COLUMN_PATTERNS.nachname.test(h)) { map.nachname = i; continue; }
  }
  for (let i = 0; i < headers.length; i++) {
    const h = cellToStr(headers[i]);
    if (!h) continue;
    for (const key of ['email', 'username', 'password', 'url', 'name']) {
      if (map[key] === null && COLUMN_PATTERNS[key].test(h)) { map[key] = i; break; }
    }
  }
  return map;
}

function pickHeaderRow(rows, maxScan = 30) {
  const limit = Math.min(maxScan, rows.length);
  const score = (headers) => {
    const cmap = detectColumns(headers);
    let s = 0;
    if (cmap.email !== null) s += 5;
    ['vorname', 'nachname', 'name', 'username', 'password', 'url'].forEach(k => { if (cmap[k] !== null) s += 1; });
    return s;
  };
  for (let i = 0; i < limit; i++) {
    const hdr = (rows[i] || []).map(cellToStr);
    if (!hdr.some(Boolean)) continue;
    if (score(hdr) >= 2) return i;
  }
  for (let i = 0; i < limit; i++) {
    const hdr = (rows[i] || []).map(cellToStr);
    if (!hdr.some(Boolean)) continue;
    if (score(hdr) >= 1 && !firstEmailInRow(rows[i])) return i;
  }
  return 0;
}

export function splitName(name) {
  const n = (name || '').trim();
  if (!n) return ['', ''];
  if (n.includes(',')) {
    const idx = n.indexOf(',');
    const a = n.slice(0, idx).trim();
    const b = n.slice(idx + 1).trim();
    if (a && b) return [b, a];
  }
  const toks = n.split(/\s+/);
  if (toks.length === 1) return [toks[0], ''];
  return [toks[0], toks.slice(1).join(' ')];
}

/** „Nachname, Vorname" → „Vorname Nachname"; sonst unverändert. */
function normalizeNameCell(raw) {
  const [vor, nach] = splitName(raw);
  if (vor && nach) return `${vor} ${nach}`.trim();
  return (raw || '').trim();
}

/** True, wenn die „Kopf"-Zeile eigentlich schon Daten ist (nur E-Mail-Adressen). */
function headerRowLooksLikeDataRow(headers, cmap) {
  const nonempty = headers.filter(Boolean);
  if (!nonempty.length) return false;
  const nEmail = nonempty.filter(h => normalizeEmail(h)).length;
  const other = Object.entries(cmap).filter(([k, v]) => v !== null && k !== 'email').length;
  return other === 0 && nEmail === nonempty.length && nEmail >= 1;
}

export async function parseExcelFile(file) {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });

  const allEntries = [];
  const sheetReports = [];

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const { rows, linkEmails } = sheetToRowsWithLinks(ws);
    if (!rows.length) continue;

    const hi = pickHeaderRow(rows);
    const headers = (rows[hi] || []).map(cellToStr);
    const cmap = detectColumns(headers);

    // Sonderfall: erste Zeile enthält schon @-Adressen (kein echter Kopf).
    let headerIsData = false;
    if (cmap.email === null) {
      for (let idx = 0; idx < (rows[hi] || []).length; idx++) {
        const cell = (rows[hi] || [])[idx];
        if (cell && String(cell).includes('@')) {
          cmap.email = idx;
          headerIsData = true;
          break;
        }
      }
    }
    if (!headerIsData && headerRowLooksLikeDataRow(headers, cmap)) {
      headerIsData = true;
    }
    const dataStart = headerIsData ? hi : hi + 1;

    const col = (row, idx) => (idx == null || idx < 0 || idx >= row.length) ? '' : cellToStr(row[idx]);
    const linkAt = (r, idx) => (idx == null || idx < 0 || !linkEmails[r] || idx >= linkEmails[r].length) ? '' : (linkEmails[r][idx] || '');

    const sheetEntries = [];
    for (let r = dataStart; r < rows.length; r++) {
      const row = rows[r] || [];
      const hasText = row.some(c => cellToStr(c) !== '');
      const hasLink = (linkEmails[r] || []).some(Boolean);
      if (!row.length || (!hasText && !hasLink)) continue;

      const vor  = col(row, cmap.vorname);
      const nach = col(row, cmap.nachname);
      const combined = `${vor} ${nach}`.trim();
      const singleNameRaw = col(row, cmap.name);
      const singleName = normalizeNameCell(singleNameRaw);
      let name = combined || singleName;

      // E-Mail-Suche: 1) Email-Spalte als Text, 2) Email-Spalte als Hyperlink-Target,
      // 3) irgendeine andere Zelle mit Text-Email, 4) irgendeine Zelle mit Hyperlink.
      const rawEmailCell = col(row, cmap.email);
      let email = normalizeEmail(rawEmailCell);
      if (!email) email = linkAt(r, cmap.email);
      if (!email) email = firstEmailInRow(row);
      if (!email) email = firstEmailInLinks(linkEmails[r]);

      // Notfall: In der E-Mail-Spalte steht „Nachname, Vorname" (kein @) und sonst
      // kein Name → als Namen übernehmen.
      if (!email && rawEmailCell && !name) {
        const maybeName = normalizeNameCell(rawEmailCell);
        if (maybeName && maybeName.includes(' ') && !maybeName.includes('@')) {
          name = maybeName;
        }
      }

      sheetEntries.push({
        name,
        email,
        username: col(row, cmap.username),
        password: col(row, cmap.password),
        url:      col(row, cmap.url),
        _sheet:   sheetName,
      });
    }

    // E-Mail-Muster aus vorhandenen (Name, E-Mail)-Paaren lernen und fehlende
    // Adressen ableiten. Bricht still ab, wenn kein Muster erkennbar; dann wird
    // als Fallback die dominante Domain + {vorname}.{nachname} versucht.
    const pairs = sheetEntries
      .filter(e => e.name && e.email)
      .map(e => [e.name, e.email]);
    let learned = learnEmailPattern(pairs);
    if (!learned) {
      const domain = pickDominantDomain(sheetEntries.filter(e => e.email).map(e => e.email));
      if (domain) learned = { pattern: '{vorname}.{nachname}', domain };
    }
    let inferred = 0;
    if (learned) {
      for (const e of sheetEntries) {
        if (e.email) continue;
        const [vor, nach] = splitName(e.name || '');
        if (!vor || !nach) continue;
        const local = formatLocal(learned.pattern, vor, nach);
        if (!local) continue;
        e.email = `${local}@${learned.domain}`;
        e._inferred = true;
        inferred++;
      }
    }

    sheetReports.push({
      sheet: sheetName,
      rows: rows.length,
      imported: sheetEntries.length,
      withEmail: sheetEntries.filter(e => e.email).length,
      inferredEmails: inferred,
      inferredPattern: learned ? `${learned.pattern}@${learned.domain}` : '',
    });
    allEntries.push(...sheetEntries);
  }

  return { entries: allEntries, report: sheetReports };
}

// ---------------------------------------------------------------------------
// DOCX → HTML
// ---------------------------------------------------------------------------

export async function docxToHtml(arrayBufferOrBase64) {
  let arrayBuffer;
  if (typeof arrayBufferOrBase64 === 'string') {
    const binary = atob(arrayBufferOrBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    arrayBuffer = bytes.buffer;
  } else {
    arrayBuffer = arrayBufferOrBase64;
  }
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return result.value || '';
}

// ---------------------------------------------------------------------------
// Platzhalter-Ersetzung
// ---------------------------------------------------------------------------

export function fillTemplate(text, vars) {
  if (!text) return '';
  const map = {
    '{NAME}':     vars.name || '',
    '{EMAIL}':    vars.email || '',
    '{URL}':      vars.url || '',
    '{USERNAME}': vars.username || '',
    '{PASSWORD}': vars.password || '',
  };
  let out = text;
  for (const [k, v] of Object.entries(map)) {
    out = out.split(k).join(v);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Inline-Bilder: <img src="relative.png"> → data: URI
// ---------------------------------------------------------------------------

/**
 * @param {string} html
 * @param {{name:string, contentType:string, bodyBase64:string}[]} images
 */
export function inlineImagesAsDataUris(html, images) {
  if (!html || !images?.length) return html || '';
  const byName = new Map();
  for (const img of images) {
    byName.set(img.name.toLowerCase(), img);
  }
  return html.replace(/src\s*=\s*(['"])([^'"]+)\1/gi, (match, quote, src) => {
    if (/^(https?:|data:|cid:)/i.test(src)) return match;
    const clean = src.replace(/^\.?\/?/, '').replace(/^bilder\//i, '').toLowerCase();
    const img = byName.get(clean) || byName.get(src.toLowerCase());
    if (!img) return match;
    return `src=${quote}data:${img.contentType};base64,${img.bodyBase64}${quote}`;
  });
}

// ---------------------------------------------------------------------------
// EML-Generator (multipart/related mit inline Bildern via cid:)
// ---------------------------------------------------------------------------

function randomBoundary(prefix) {
  const r = Math.random().toString(36).slice(2, 10);
  return `----=_${prefix}_${Date.now().toString(36)}_${r}`;
}

/**
 * Stellt sicher, dass ein HTML-Body einen vollständigen Wrapper hat
 * (DOCTYPE + <html> + <head> + <body>). `contentEditable` entfernt beim
 * Öffnen der Vorlage diese Tags; ohne sie nutzt Outlook seine Default-
 * Formatierung (andere Schriftart, oft blaue Farbe) und manche Versionen
 * brechen die Anzeige sogar vorzeitig ab ("Nachricht abgeschnitten").
 *
 * Wenn der gespeicherte Body ein reines Fragment ist, wickeln wir ihn in
 * ein Standard-Gerüst mit Calibri / 11pt / Schwarz ein. Hat die Vorlage
 * bereits eigene Styles im <body>, lassen wir sie unangetastet.
 */
export function ensureHtmlDocument(html) {
  const raw = String(html ?? '').trim();
  if (!raw) {
    return (
      '<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"></head>' +
      '<body style="font-family: Calibri, \'Segoe UI\', Arial, sans-serif; font-size: 11pt; color: #000000;">' +
      '</body></html>'
    );
  }
  const hasHtmlTag = /<html[\s>]/i.test(raw);
  const hasBodyTag = /<body[\s>]/i.test(raw);
  const hasDoctype = /^<!doctype/i.test(raw);
  if (hasHtmlTag && hasBodyTag) {
    // Schon ein komplettes Dokument – ggf. DOCTYPE voranstellen.
    return hasDoctype ? raw : `<!DOCTYPE html>${raw}`;
  }
  if (hasBodyTag && !hasHtmlTag) {
    return `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"></head>${raw}</html>`;
  }
  return (
    '<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"></head>' +
    '<body style="font-family: Calibri, \'Segoe UI\', Arial, sans-serif; font-size: 11pt; color: #000000; line-height: 1.5;">' +
    raw +
    '</body></html>'
  );
}

function foldHeader(value) {
  const s = String(value || '').replace(/\r?\n/g, ' ');
  if (/^[\x20-\x7e]*$/.test(s)) return s;
  return '=?UTF-8?B?' + btoa(unescape(encodeURIComponent(s))) + '?=';
}

function b64Encode(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin);
}

function wrapBase64(s, width = 76) {
  const out = [];
  for (let i = 0; i < s.length; i += width) out.push(s.slice(i, i + width));
  return out.join('\r\n');
}

/**
 * Build a .eml string. When opened on macOS/Windows, Mail.app/Outlook create a draft.
 * @param {Object} opts
 * @param {string} opts.to
 * @param {string} [opts.from]
 * @param {string} opts.subject
 * @param {string} opts.html
 * @param {{name:string, contentType:string, bodyBase64:string}[]} [opts.images]  // werden als cid: eingebettet
 */
export function buildEml({ to, from, subject, html, images }) {
  // Body IMMER in ein vollständiges HTML-Dokument wickeln. Ohne <html>/<body>
  // nutzt Outlook den Default-Style (oft blaue Schrift) und kann den HTML-Teil
  // bei manchen Versionen sogar vorzeitig beenden ("abgeschnitten"). Mit
  // Wrapper bekommen wir konsistent Calibri 11pt Schwarz.
  const htmlDoc = ensureHtmlDocument(html);

  // Alle <img src="..."> auf cid:bild<N> mappen, passende Bilder beilegen
  const cidMap = new Map();
  let replaced = htmlDoc;
  if (images?.length) {
    let counter = 0;
    const byName = new Map();
    for (const img of images) byName.set(img.name.toLowerCase(), img);

    replaced = replaced.replace(/src\s*=\s*(['"])([^'"]+)\1/gi, (match, quote, src) => {
      if (/^(https?:|data:|cid:)/i.test(src)) return match;
      const clean = src.replace(/^\.?\/?/, '').replace(/^bilder\//i, '').toLowerCase();
      const img = byName.get(clean) || byName.get(src.toLowerCase());
      if (!img) return match;
      counter += 1;
      const cid = `img${counter}@tempus-mailer`;
      cidMap.set(cid, img);
      return `src=${quote}cid:${cid}${quote}`;
    });
  }

  const bRelated = randomBoundary('rel');
  const bAlt     = randomBoundary('alt');

  const headers = [
    `To: ${foldHeader(to)}`,
    from ? `From: ${foldHeader(from)}` : null,
    `Subject: ${foldHeader(subject || '')}`,
    'MIME-Version: 1.0',
    'X-Unsent: 1',
    `Content-Type: multipart/related; boundary="${bRelated}"; type="multipart/alternative"`,
    '',
  ].filter(Boolean).join('\r\n');

  // Plain text fallback: nur den Body-Inhalt nehmen (ohne DOCTYPE/head/style),
  // dann Tags raus & die wichtigsten HTML-Entities decodieren (Umlaute, Quotes).
  const bodyOnly = (String(replaced).match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1]) || String(replaced);
  const textFallback = bodyOnly
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&auml;/gi, 'ä').replace(/&Auml;/g, 'Ä')
    .replace(/&ouml;/gi, 'ö').replace(/&Ouml;/g, 'Ö')
    .replace(/&uuml;/gi, 'ü').replace(/&Uuml;/g, 'Ü')
    .replace(/&szlig;/gi, 'ß')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const plainPart = [
    `--${bAlt}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    wrapBase64(b64Encode(textFallback)),
    '',
  ].join('\r\n');

  const htmlPart = [
    `--${bAlt}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    wrapBase64(b64Encode(replaced)),
    '',
    `--${bAlt}--`,
    '',
  ].join('\r\n');

  const altBlock = [
    `--${bRelated}`,
    `Content-Type: multipart/alternative; boundary="${bAlt}"`,
    '',
    plainPart,
    htmlPart,
  ].join('\r\n');

  let imagesBlock = '';
  for (const [cid, img] of cidMap.entries()) {
    imagesBlock += [
      `--${bRelated}`,
      `Content-Type: ${img.contentType}; name="${img.name}"`,
      'Content-Transfer-Encoding: base64',
      `Content-ID: <${cid}>`,
      `Content-Disposition: inline; filename="${img.name}"`,
      '',
      wrapBase64(img.bodyBase64),
      '',
    ].join('\r\n');
  }

  const body = `${altBlock}\r\n${imagesBlock}--${bRelated}--\r\n`;

  return `${headers}\r\n${body}`;
}

export function sanitizeFileName(s) {
  return String(s || '').replace(/[^A-Za-z0-9._\-]+/g, '_').slice(0, 120) || 'mail';
}

export function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function downloadEmlZip(filename, emlEntries) {
  const zip = new JSZip();
  for (const { name, content } of emlEntries) {
    zip.file(name, content);
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(filename, blob);
}

// ---------------------------------------------------------------------------
// Tempus Supergrid API Client
// ---------------------------------------------------------------------------
//
// Der Browser kann aus CORS-Gründen nicht direkt Tempus aufrufen. Stattdessen
// läuft jeder Call über unseren Proxy (API Gateway, das 1:1 an die Tempus-
// Trial-Instanz weiterleitet und den X-Tempus-Auth-Header wieder auf
// Authorization mappt – Authorization ist vom API-Gateway reserviert).
//
// Wichtig: direkte Aufrufe an *.execute-api.amazonaws.com werden von vielen
// Adblockern/Privacy-Tools (uBlock, Brave Shield, Privacy Badger, …)
// geblockt → „TypeError: Failed to fetch". Darum bevorzugen wir im Browser
// den Same-Origin-Pfad /v1/tempus-proxy/… (CloudFront-Behavior vor
// manuel-weiss.ch leitet das transparent an das API-Gateway weiter). Falls
// das nicht verfügbar ist (z. B. Dev-Server ohne CloudFront), fällt der
// Client automatisch auf die absolute API-Gateway-URL zurück.
//
// Hinweis: Die Ziel-Basis-URL ist momentan FIX konfiguriert
//   https://trial5.tempus-resource.com/slot4
// Für weitere Tempus-Instanzen muss eine zusätzliche Proxy-Route angelegt
// werden (siehe docs/RECOVERY_tempus-proxy.md als Muster).

// absolute Fallback-URL (wird in Dev / ohne CloudFront genutzt)
export const TEMPUS_PROXY_ABSOLUTE =
  'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1/tempus-proxy';

// same-origin Pfad (wird vor manuel-weiss.ch via CloudFront weitergereicht)
export const TEMPUS_PROXY_SAMEORIGIN = '/v1/tempus-proxy';

// Backward-Compat: war früher die absolute URL, bleibt als export erhalten.
export const TEMPUS_PROXY_BASE = TEMPUS_PROXY_ABSOLUTE;

export const TEMPUS_DEFAULT_BASE_URL = 'https://trial5.tempus-resource.com/slot4';

function buildTempusBases() {
  // In Node/SSR (kein window) nutzen wir direkt die Absolute-URL.
  if (typeof window === 'undefined' || !window.location) {
    return [TEMPUS_PROXY_ABSOLUTE];
  }
  const host = window.location.host || '';
  // Wenn wir auf manuel-weiss.ch oder einer bekannten CloudFront-Domain laufen,
  // probieren wir zuerst Same-Origin (umgeht Adblocker), dann Absolute.
  const isProductionHost =
    /(^|\.)manuel-weiss\.ch$/i.test(host) ||
    /\.cloudfront\.net$/i.test(host);
  if (isProductionHost) {
    const sameOrigin = `${window.location.origin}${TEMPUS_PROXY_SAMEORIGIN}`;
    return [sameOrigin, TEMPUS_PROXY_ABSOLUTE];
  }
  // Dev/unbekannter Host: nur absolute URL.
  return [TEMPUS_PROXY_ABSOLUTE];
}

/**
 * Kleiner Helfer für alle Tempus-Aufrufe.
 * @param {Object} opts
 * @param {string} opts.apiKey     - Tempus API-Key (z. B. "373-...")
 * @param {string} opts.method     - GET | POST | PUT | DELETE
 * @param {string} opts.path       - Tempus-Pfad ab Instanz-Root (z. B. "api/sg/v1/Resources")
 * @param {Object} [opts.query]    - optionale Query-Parameter
 * @param {Object} [opts.body]     - optionaler JSON-Body
 */
export async function callTempus({ apiKey, method = 'GET', path, query, body }) {
  if (!apiKey) throw new Error('Tempus API-Key fehlt.');
  if (!path) throw new Error('Tempus API-Pfad fehlt.');

  const cleanPath = String(path).replace(/^\/+/, '');
  const bases = buildTempusBases();

  const init = {
    method,
    headers: {
      'X-Tempus-Auth': `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
  };
  if (body !== undefined && method !== 'GET') {
    init.headers['Content-Type'] = 'application/json';
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  // Reihenfolge: zuerst same-origin (wenn vorhanden), dann absolute URL.
  // Fallback-Trigger: (a) Netzwerkfehler (Adblocker / Offline) oder
  //                   (b) 403/404 mit text/html Body (Bucket-Fehlerseite, weil
  //                       die CloudFront-Route noch nicht ausgerollt ist).
  let res;
  let lastNetError = null;
  let lastBadRes = null;
  for (let i = 0; i < bases.length; i += 1) {
    const base = bases[i];
    const isAbsolute = /^https?:\/\//i.test(base);
    const url = new URL(
      `${base}/${cleanPath}`,
      isAbsolute ? undefined : (window?.location?.origin || 'http://localhost')
    );
    if (query && typeof query === 'object') {
      for (const [k, v] of Object.entries(query)) {
        if (v === undefined || v === null) continue;
        url.searchParams.set(k, Array.isArray(v) ? v.join(',') : String(v));
      }
    }
    let attempt;
    try {
      attempt = await fetch(url.toString(), init);
    } catch (e) {
      lastNetError = e;
      if (i < bases.length - 1) continue;
      break;
    }
    if (
      (attempt.status === 403 || attempt.status === 404) &&
      /text\/html/i.test(attempt.headers.get('content-type') || '') &&
      i < bases.length - 1
    ) {
      lastBadRes = attempt;
      continue;
    }
    res = attempt;
    break;
  }
  if (!res) {
    if (lastBadRes) {
      res = lastBadRes;
    } else {
      const hint =
        ' Möglicherweise blockiert ein Browser-Adblocker oder Datenschutz-Plugin' +
        ' die AWS-API-URL. Bitte uBlock/Brave-Shield/Privacy Badger für diese' +
        ' Seite deaktivieren oder einen anderen Browser/Inkognito-Modus probieren.';
      throw new Error(
        `Netzwerkfehler beim Tempus-Aufruf: ${lastNetError?.message || 'Failed to fetch'}.${hint}`
      );
    }
  }

  const text = await res.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch { /* plain text */ }
  }

  if (!res.ok) {
    // 401/403 enthalten oft KEINEN Body → ohne Sondertext steht da nur
    // „… → 401: HTTP 401“. Mit explizitem Hinweis ist klar, was zu tun ist.
    let msg =
      (data && (data.message || data.error)) ||
      (typeof data === 'string' ? data : null) ||
      (text && text.trim()) ||
      '';
    if (!msg) {
      if (res.status === 401) msg = 'API-Key ungültig oder abgelaufen (kein Response-Body).';
      else if (res.status === 403) msg = 'API-Key hat keine Berechtigung für diesen Aufruf.';
      else if (res.status === 404) msg = 'Tempus-Endpoint nicht gefunden (Pfad oder Instanz prüfen).';
      else msg = `HTTP ${res.status}`;
    }
    const error = new Error(`Tempus ${method} ${cleanPath} → ${res.status}: ${msg}`);
    error.status = res.status;
    error.data = data ?? text;
    throw error;
  }

  return data;
}

/** Identity-Check: liefert den Resource-Datensatz des API-Key-Besitzers. */
export function tempusIdentity(apiKey) {
  return callTempus({ apiKey, path: 'api/sg/v1/Resources/Identity' });
}

/** Alle globalen Rollen (Admin/normale Nutzer/Team-Leader …). */
export async function tempusListGlobalRoles(apiKey) {
  const data = await callTempus({ apiKey, path: 'api/sg/v1/Roles' });
  return (Array.isArray(data) ? data : [])
    .filter(r => String(r.roleType || '').toLowerCase() === 'global')
    .map(r => ({ id: r.id, name: r.name, systemKey: r.systemGlobalRoleKey || null }));
}

/** Security-Groups vom Typ Resource (für Zuordnung neuer User). */
export async function tempusListResourceSecurityGroups(apiKey) {
  const data = await callTempus({
    apiKey,
    path: 'api/sg/v1/SecurityGroups',
    query: { securityGroupType: 'Resource' },
  });
  return (Array.isArray(data) ? data : []).map(g => ({ id: g.id, name: g.name }));
}

/**
 * Prüft, ob ein Resource-Name in Tempus bereits vergeben ist.
 * Nutzt den CheckNameExist-Endpoint, der von der API als Bulk-Check
 * gedacht ist (liefert boolean).
 */
export async function tempusResourceNameExists(apiKey, name) {
  if (!name) return false;
  const data = await callTempus({
    apiKey,
    path: 'api/sg/v1/Resources/CheckNameExist',
    query: { name },
  });
  return data === true || data === 'true';
}

/**
 * Legt EINE Resource in Tempus an und gibt die neue Id zurück.
 * @returns {Promise<number>}
 */
export async function tempusCreateResource(apiKey, resource) {
  if (!resource || !resource.name) throw new Error('Resource-Name fehlt.');
  const body = [{
    name: resource.name,
    globalRoleId: resource.globalRoleId ?? 1,
    updateGlobalRole: true,
    securityGroupId: resource.securityGroupId ?? 1,
    updateSecurityGroup: true,
    isEnabled: resource.isEnabled !== false,
    isTimesheetUser: !!resource.isTimesheetUser,
    isTeamResource: false,
    updateDefaultRate: false,
    updateAdvancedRate: false,
    updateAutoCalculateRate: false,
  }];
  const data = await callTempus({
    apiKey,
    method: 'POST',
    path: 'api/sg/v1/Resources',
    body,
  });
  const id = Array.isArray(data) ? data[0] : null;
  if (typeof id !== 'number') {
    throw new Error('Tempus antwortete ohne Resource-Id.');
  }
  return id;
}
