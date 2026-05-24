/**
 * QRG Builder — Export-Helpers
 *
 * Konvertiert das einheitliche Block-Format aus `qrgTemplates.js` in:
 *   - Markdown  (universell, GitHub-kompatibel)
 *   - DOCX      (Office OpenXML, manuell als ZIP zusammengebaut)
 *   - JSON      (Roundtrip-Format für die Customer-Config)
 *   - Print     (öffnet Druck-Dialog → PDF via Browser)
 */

import JSZip from 'jszip';

// ────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────

/** Filename-safe slug. */
export function slugify(input) {
  return String(input)
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Browser-Download. */
function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Markdown: parse `**bold**` for emphasis (simple, no full md). */
function mdInline(text) {
  return String(text || '');
}

/** XML-safe escape. */
function xml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Bold runs `**...**` → OOXML runs. */
function parseRuns(text) {
  const runs = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let m;
  const t = String(text ?? '');
  while ((m = re.exec(t))) {
    if (m.index > last) runs.push({ text: t.slice(last, m.index), bold: false });
    runs.push({ text: m[1], bold: true });
    last = m.index + m[0].length;
  }
  if (last < t.length) runs.push({ text: t.slice(last), bold: false });
  if (runs.length === 0) runs.push({ text: t, bold: false });
  return runs;
}

// ────────────────────────────────────────────────────────────────────
// Markdown export
// ────────────────────────────────────────────────────────────────────
export function blocksToMarkdown(blocks) {
  const out = [];
  for (const b of blocks) {
    switch (b.type) {
      case 'h1': out.push(`# ${b.text}`); break;
      case 'h2': out.push(`## ${b.text}`); break;
      case 'h3': out.push(`### ${b.text}`); break;
      case 'p':  out.push(mdInline(b.text)); break;
      case 'ul': out.push(b.items.map((i) => `- ${mdInline(i)}`).join('\n')); break;
      case 'ol': out.push(b.items.map((i, ix) => `${ix + 1}. ${mdInline(i)}`).join('\n')); break;
      case 'note': out.push(`> **Hinweis:** ${mdInline(b.text)}`); break;
      case 'tip':  out.push(`> **Tipp:** ${mdInline(b.text)}`); break;
      case 'table': {
        if (b.caption) out.push(`*${b.caption}*`);
        const sep = b.columns.map(() => '---').join(' | ');
        const head = b.columns.join(' | ');
        const body = b.rows.map((r) => r.join(' | ')).join('\n');
        out.push(`| ${head} |\n| ${sep} |\n| ${body.split('\n').join(' |\n| ')} |`);
        break;
      }
      case 'spacer': out.push(''); break;
      default: break;
    }
    out.push('');
  }
  return out.join('\n');
}

export function downloadMarkdown(blocks, filename) {
  const md = blocksToMarkdown(blocks);
  download(new Blob([md], { type: 'text/markdown;charset=utf-8' }), filename);
}

// ────────────────────────────────────────────────────────────────────
// DOCX export — Office Open XML, ZIP-packed manually
// ────────────────────────────────────────────────────────────────────

function ooxmlRun(run, opts = {}) {
  const rPr = [];
  if (run.bold) rPr.push('<w:b/>');
  if (opts.color) rPr.push(`<w:color w:val="${opts.color}"/>`);
  if (opts.size) rPr.push(`<w:sz w:val="${opts.size}"/><w:szCs w:val="${opts.size}"/>`);
  if (opts.font) rPr.push(`<w:rFonts w:ascii="${opts.font}" w:hAnsi="${opts.font}"/>`);
  const rPrXml = rPr.length ? `<w:rPr>${rPr.join('')}</w:rPr>` : '';
  return `<w:r>${rPrXml}<w:t xml:space="preserve">${xml(run.text)}</w:t></w:r>`;
}

function ooxmlPara({ text = '', style = '', runOpts = {}, align = null, numId = null, ilvl = 0 }) {
  const pPr = [];
  if (style) pPr.push(`<w:pStyle w:val="${style}"/>`);
  if (align) pPr.push(`<w:jc w:val="${align}"/>`);
  if (numId != null) pPr.push(`<w:numPr><w:ilvl w:val="${ilvl}"/><w:numId w:val="${numId}"/></w:numPr>`);
  const pPrXml = pPr.length ? `<w:pPr>${pPr.join('')}</w:pPr>` : '';
  const runs = parseRuns(text).map((r) => ooxmlRun(r, runOpts)).join('');
  return `<w:p>${pPrXml}${runs}</w:p>`;
}

function ooxmlEmptyPara() {
  return '<w:p/>';
}

function ooxmlTable(cols, rows, accent) {
  const widthsPct = cols.map(() => Math.floor(5000 / cols.length));
  const header = cols
    .map(
      (c, i) =>
        `<w:tc><w:tcPr><w:tcW w:w="${widthsPct[i]}" w:type="pct"/><w:shd w:val="clear" w:color="auto" w:fill="${accent.replace(
          '#',
          ''
        )}"/></w:tcPr>${ooxmlPara({
          text: c,
          runOpts: { bold: true, color: 'FFFFFF', size: 20 },
        })}</w:tc>`
    )
    .join('');
  const body = rows
    .map(
      (r) =>
        `<w:tr>${r
          .map((cell, i) => `<w:tc><w:tcPr><w:tcW w:w="${widthsPct[i]}" w:type="pct"/></w:tcPr>${ooxmlPara({ text: cell, runOpts: { size: 20 } })}</w:tc>`)
          .join('')}</w:tr>`
    )
    .join('');
  return `<w:tbl>
<w:tblPr>
<w:tblW w:w="5000" w:type="pct"/>
<w:tblBorders>
<w:top w:val="single" w:sz="4" w:space="0" w:color="DDDDDD"/>
<w:left w:val="single" w:sz="4" w:space="0" w:color="DDDDDD"/>
<w:bottom w:val="single" w:sz="4" w:space="0" w:color="DDDDDD"/>
<w:right w:val="single" w:sz="4" w:space="0" w:color="DDDDDD"/>
<w:insideH w:val="single" w:sz="4" w:space="0" w:color="EEEEEE"/>
<w:insideV w:val="single" w:sz="4" w:space="0" w:color="EEEEEE"/>
</w:tblBorders>
</w:tblPr>
<w:tr>${header}</w:tr>
${body}
</w:tbl>${ooxmlEmptyPara()}`;
}

function ooxmlCallout(text, fillHex, borderHex) {
  const fill = fillHex.replace('#', '');
  const border = borderHex.replace('#', '');
  const runs = parseRuns(text).map((r) => ooxmlRun(r, { size: 20 })).join('');
  return `<w:p>
<w:pPr>
<w:pBdr>
<w:top w:val="single" w:sz="6" w:space="6" w:color="${border}"/>
<w:left w:val="single" w:sz="6" w:space="6" w:color="${border}"/>
<w:bottom w:val="single" w:sz="6" w:space="6" w:color="${border}"/>
<w:right w:val="single" w:sz="6" w:space="6" w:color="${border}"/>
</w:pBdr>
<w:shd w:val="clear" w:color="auto" w:fill="${fill}"/>
<w:spacing w:before="120" w:after="120"/>
</w:pPr>
${runs}
</w:p>`;
}

function blocksToOoxmlBody(blocks, accent) {
  let numIdCounter = { ul: 2, ol: 3 };
  const parts = [];
  for (const b of blocks) {
    switch (b.type) {
      case 'h1': parts.push(ooxmlPara({ text: b.text, style: 'Heading1' })); break;
      case 'h2': parts.push(ooxmlPara({ text: b.text, style: 'Heading2' })); break;
      case 'h3': parts.push(ooxmlPara({ text: b.text, style: 'Heading3' })); break;
      case 'p':  parts.push(ooxmlPara({ text: b.text, runOpts: { size: 22 } })); break;
      case 'ul':
        for (const it of b.items)
          parts.push(ooxmlPara({ text: it, numId: numIdCounter.ul, ilvl: 0, runOpts: { size: 22 } }));
        break;
      case 'ol':
        for (const it of b.items)
          parts.push(ooxmlPara({ text: it, numId: numIdCounter.ol, ilvl: 0, runOpts: { size: 22 } }));
        break;
      case 'note': parts.push(ooxmlCallout(`Hinweis: ${b.text}`, '#FFF7E0', '#E0A500')); break;
      case 'tip':  parts.push(ooxmlCallout(`Tipp: ${b.text}`, '#E0F7EC', '#1E9E5E')); break;
      case 'table':
        if (b.caption) parts.push(ooxmlPara({ text: b.caption, runOpts: { bold: true, size: 20, color: '666666' } }));
        parts.push(ooxmlTable(b.columns, b.rows, accent));
        break;
      case 'spacer': parts.push(ooxmlEmptyPara()); break;
      default: break;
    }
  }
  return parts.join('\n');
}

const CONTENT_TYPES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
</Types>`;

const ROOT_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const DOC_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
</Relationships>`;

function stylesXml(accentHex) {
  const accent = accentHex.replace('#', '');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:rPrDefault>
    <w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="288" w:lineRule="auto"/></w:pPr></w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="Heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:before="360" w:after="180"/><w:outlineLvl w:val="0"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Calibri Light" w:hAnsi="Calibri Light"/><w:b/><w:color w:val="${accent}"/><w:sz w:val="44"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="Heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:before="280" w:after="140"/><w:outlineLvl w:val="1"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Calibri Light" w:hAnsi="Calibri Light"/><w:b/><w:color w:val="${accent}"/><w:sz w:val="32"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="Heading 3"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:before="220" w:after="120"/><w:outlineLvl w:val="2"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Calibri Light" w:hAnsi="Calibri Light"/><w:b/><w:color w:val="404040"/><w:sz w:val="26"/></w:rPr>
  </w:style>
</w:styles>`;
}

const NUMBERING_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="0">
    <w:lvl w:ilvl="0"><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr></w:lvl>
  </w:abstractNum>
  <w:abstractNum w:abstractNumId="1">
    <w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%1."/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr></w:lvl>
  </w:abstractNum>
  <w:num w:numId="2"><w:abstractNumId w:val="0"/></w:num>
  <w:num w:numId="3"><w:abstractNumId w:val="1"/></w:num>
</w:numbering>`;

function documentXml(blocks, accentHex) {
  const body = blocksToOoxmlBody(blocks, accentHex);
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>
${body}
<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>
</w:body>
</w:document>`;
}

/** Erzeugt eine DOCX-Datei für eine Block-Liste. */
export async function blocksToDocx(blocks, { accentColor = '#0d7fa0' } = {}) {
  const zip = new JSZip();
  zip.file('[Content_Types].xml', CONTENT_TYPES_XML);
  zip.folder('_rels').file('.rels', ROOT_RELS_XML);
  const word = zip.folder('word');
  word.folder('_rels').file('document.xml.rels', DOC_RELS_XML);
  word.file('styles.xml', stylesXml(accentColor));
  word.file('numbering.xml', NUMBERING_XML);
  word.file('document.xml', documentXml(blocks, accentColor));
  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

export async function downloadDocx(blocks, filename, opts = {}) {
  const blob = await blocksToDocx(blocks, opts);
  download(blob, filename);
}

// ────────────────────────────────────────────────────────────────────
// Print → user uses browser's "Save as PDF"
// ────────────────────────────────────────────────────────────────────
export function printPreview() {
  window.print();
}

// ────────────────────────────────────────────────────────────────────
// JSON profile import/export
// ────────────────────────────────────────────────────────────────────
export function downloadJson(obj, filename) {
  const json = JSON.stringify(obj, null, 2);
  download(new Blob([json], { type: 'application/json' }), filename);
}

export function readJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        resolve(JSON.parse(String(e.target.result)));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// ────────────────────────────────────────────────────────────────────
// Bulk: alle aktiven QRGs als ZIP herunterladen (DOCX + MD)
// ────────────────────────────────────────────────────────────────────
export async function downloadAllAsZip(qrgs, cfg) {
  const zip = new JSZip();
  for (const q of qrgs) {
    const base = `${slugify(cfg.meta.customerShort)}-${q.id}-qrg`;
    const docx = await blocksToDocx(q.blocks, { accentColor: cfg.meta.primaryColor });
    zip.file(`${base}.docx`, docx);
    zip.file(`${base}.md`, blocksToMarkdown(q.blocks));
  }
  zip.file(`${slugify(cfg.meta.customerShort)}-profile.json`, JSON.stringify(cfg, null, 2));
  const blob = await zip.generateAsync({ type: 'blob' });
  download(blob, `qrg-bundle-${slugify(cfg.meta.customerShort)}.zip`);
}
