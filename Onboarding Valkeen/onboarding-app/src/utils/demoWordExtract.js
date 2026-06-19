import mammoth from 'mammoth';

const MAX_CHARS = 120000;

/**
 * @param {File} file
 * @returns {Promise<{ text: string, html: string, truncated: boolean }>}
 */
export async function extractTextFromDocx(file) {
  const buf = await file.arrayBuffer();
  const [textResult, htmlResult] = await Promise.all([
    mammoth.extractRawText({ arrayBuffer: buf }),
    mammoth.convertToHtml({ arrayBuffer: buf }),
  ]);

  let text = (textResult.value || '').replace(/\r\n/g, '\n').trim();
  let html = htmlResult.value || '';
  let truncated = false;
  if (text.length > MAX_CHARS) {
    text = text.slice(0, MAX_CHARS) + '\n\n[… Dokument gekürzt für KI-Analyse …]';
    truncated = true;
  }
  return { text, html, truncated };
}

/** Grobe Abschnitte für sehr lange Docs (später Chunking) */
export function splitByHeadings(text) {
  const lines = text.split('\n');
  const sections = [];
  let current = { title: 'Einleitung', lines: [] };
  for (const line of lines) {
    const t = line.trim();
    if (/^(block\s*\d+|kapitel\s*\d+|\d+\.\s+|#{1,3}\s)/i.test(t) && t.length < 120) {
      if (current.lines.length) sections.push(current);
      current = { title: t, lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  if (current.lines.length) sections.push(current);
  return sections;
}
