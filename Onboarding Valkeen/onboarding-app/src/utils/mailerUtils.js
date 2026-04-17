/**
 * Helpers für den Tempus Login Mailer:
 * - Excel-Parser (SheetJS) mit Spalten-Erkennung (E-Mail, Username, Passwort, URL, Name)
 * - docx → HTML (mammoth)
 * - Platzhalter-Ersetzung {NAME} {EMAIL} {URL} {USERNAME} {PASSWORD}
 * - EML-Datei-Generator (RFC 822 / MIME multipart/related mit inline Bildern)
 * - Helfer zur Dateinamenbereinigung und ZIP-Batch-Download
 */

import * as XLSX from 'xlsx';
import mammoth from 'mammoth/mammoth.browser.js';
import JSZip from 'jszip';

// ---------------------------------------------------------------------------
// Excel Parsing
// ---------------------------------------------------------------------------

const COLUMN_PATTERNS = {
  email:    /(e[-_\s]?mail|mail\s*adresse|mail\s*address|empf.+mail|recipient|^email$|^mail$)/i,
  username: /(user\s?name|user\s?id|benutzer|benutzername|login.?id)/i,
  password: /(pass\s?word|passwort|kennwort|^pw$|^pwd$)/i,
  url:      /(url|link|website|login.?url|zugang)/i,
  name:     /(^name$|full\s?name|display\s?name|anzeigename|kunde|kontakt|empf[äa]nger|teilnehmer|vor[\s\-/]*(?:und|&|\+|u\.)?[\s\-/]*nachname|vor[\s\-/]*nachname)/i,
  vorname:  /^(vorname|firstname|given\s?name|pr[eé]nom)$/i,
  nachname: /^(nachname|lastname|surname|family\s?name|nom)$/i,
};

const EMAIL_RE = /[^\s<>,;:"']+@[^\s<>,;:"']+\.[^\s<>,;:"']{2,}/;

function cellToStr(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') {
    if (Number.isFinite(v) && Math.floor(v) === v) return String(v);
    return String(v).trim();
  }
  return String(v).trim();
}

function normalizeEmail(raw) {
  const s = cellToStr(raw).replace(/^mailto:/i, '').replace(/^"+|"+$/g, '').trim();
  if (!s || !s.includes('@')) return '';
  const m = s.match(/<([^<>@\s]+@[^>]+)>/);
  if (m) return m[1].trim();
  const m2 = s.match(EMAIL_RE);
  return m2 ? m2[0].trim() : '';
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

function splitName(name) {
  const n = (name || '').trim();
  if (!n) return ['', ''];
  if (n.includes(',')) {
    const [a, b] = n.split(',', 2).map(s => s.trim());
    if (a && b) return [b, a];
  }
  const toks = n.split(/\s+/);
  if (toks.length === 1) return [toks[0], ''];
  return [toks[0], toks.slice(1).join(' ')];
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

    // Daten ab nächste Zeile (oder Header-Zeile, falls schon Daten)
    const firstIsData = cmap.email === null && headers.some(h => EMAIL_RE.test(h));
    const dataStart = firstIsData ? hi : hi + 1;

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
      const singleName = col(row, cmap.name);
      const name = combined || singleName;

      // E-Mail-Suche: 1) Email-Spalte als Text, 2) Email-Spalte als Hyperlink-Target,
      // 3) irgendeine andere Zelle mit Text-Email, 4) irgendeine Zelle mit Hyperlink.
      let email = normalizeEmail(col(row, cmap.email));
      if (!email) email = linkAt(r, cmap.email);
      if (!email) email = firstEmailInRow(row);
      if (!email) email = firstEmailInLinks(linkEmails[r]);

      sheetEntries.push({
        name,
        email,
        username: col(row, cmap.username),
        password: col(row, cmap.password),
        url:      col(row, cmap.url),
        _sheet:   sheetName,
      });
    }

    sheetReports.push({
      sheet: sheetName,
      rows: rows.length,
      imported: sheetEntries.length,
      withEmail: sheetEntries.filter(e => e.email).length,
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
  // Alle <img src="..."> auf cid:bild<N> mappen, passende Bilder beilegen
  const cidMap = new Map();
  let replaced = html || '';
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

  // Plain text fallback: roher Text ohne Tags
  const textFallback = String(replaced).replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<[^>]+>/g, '').replace(/\s+\n/g, '\n');

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
