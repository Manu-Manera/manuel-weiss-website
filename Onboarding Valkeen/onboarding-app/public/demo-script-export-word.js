/**
 * Export Tempus demo guides to .docx — compact trainer script (Team Resources Word style).
 * Labels: Klick: / Sagen: / Muss-Satz: / [FEEDBACK:]
 */
(function (global) {
  'use strict';

  const DOCX_MODULE = 'https://esm.sh/docx@8.5.0?bundle';

  const SKIP_BOX = new Set(['box-watchout', 'box-reto', 'box-peter']);
  const OPTIONAL_BOX = new Set(['box-context', 'box-tip', 'box-warn']);

  let docxModulePromise = null;

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function currentLang() {
    return document.documentElement.classList.contains('lang-de') ? 'de' : 'en';
  }

  function labels(lang) {
    return lang === 'de'
      ? { click: 'Klick: ', say: 'Sagen: ', must: 'Muss-Satz: ', bg: 'Hintergrund: ', tip: 'Tipp: ', note: 'Hinweis: ', goal: 'Ziel: ', opening: 'Opening', story: 'Empfohlene Demo-Story', agenda: 'Agenda', closing: 'Abschluss & Recap', cheat: 'Quick Cheat Sheet' }
      : { click: 'Click: ', say: 'Say: ', must: 'Must-use: ', bg: 'Background: ', tip: 'Tip: ', note: 'Note: ', goal: 'Goal: ', opening: 'Opening', story: 'Recommended demo story', agenda: 'Agenda', closing: 'Closing & recap', cheat: 'Quick cheat sheet' };
  }

  function langText(root, lang) {
    if (!root) return '';
    const clone = root.cloneNode(true);
    clone.querySelectorAll(lang === 'de' ? '.t-en' : '.t-de').forEach((n) => n.remove());
    clone.querySelectorAll('script, style, .edit-chrome-remove-btn').forEach((n) => n.remove());
    return (clone.innerText || clone.textContent || '')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function truncate(text, max) {
    if (!text) return '';
    if (text.length <= max) return text;
    const cut = text.slice(0, max - 1);
    const sp = cut.lastIndexOf(' ');
    return (sp > max * 0.6 ? cut.slice(0, sp) : cut).trim() + '…';
  }

  function sanitizeFilename(name) {
    return (name || 'Tempus_Demo')
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 120);
  }

  async function loadDocx() {
    if (!docxModulePromise) {
      docxModulePromise = import(DOCX_MODULE).then((mod) => mod.default ?? mod);
    }
    return docxModulePromise;
  }

  function inlinePara(docx, label, labelColor, body, bodyOpts = {}) {
    const { Paragraph, TextRun } = docx;
    return new Paragraph({
      spacing: { before: 60, after: 100 },
      children: [
        new TextRun({ text: label, bold: true, color: labelColor }),
        new TextRun({ text: body, ...bodyOpts }),
      ],
    });
  }

  function feedbackPara(docx, text) {
    const { Paragraph, TextRun } = docx;
    const clean = text.replace(/^\[FEEDBACK:\s*/i, '').replace(/\]$/, '').trim();
    const t = `[FEEDBACK: ${clean}]`;
    return new Paragraph({
      spacing: { before: 60, after: 100 },
      children: [new TextRun({ text: t, bold: true, color: 'B45309', size: 20 })],
    });
  }

  function bulletParas(docx, items, maxItems = 6, maxLen = 220) {
    const { Paragraph, TextRun } = docx;
    return items
      .slice(0, maxItems)
      .map((t) => truncate(t, maxLen))
      .filter((t) => t.length > 0)
      .map(
        (t) =>
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 50 },
            children: [new TextRun({ text: t })],
          })
      );
  }

  function headingPara(docx, text, level) {
    const { Paragraph, TextRun, HeadingLevel } = docx;
    const map = { 1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2 };
    return new Paragraph({
      heading: map[level] || HeadingLevel.HEADING_2,
      spacing: { before: level === 1 ? 220 : 180, after: level === 1 ? 100 : 60 },
      children: [new TextRun({ text, bold: true })],
    });
  }

  function shouldExportBox(box, counters, lang) {
    for (const c of SKIP_BOX) {
      if (box.classList.contains(c)) return false;
    }
    if (box.classList.contains('box-story')) {
      return false;
    }
    for (const c of OPTIONAL_BOX) {
      if (box.classList.contains(c)) {
        if (counters.optionalUsed) return false;
        const body = box.querySelector('.box-body');
        const text = langText(body, lang);
        if (!text || text.length > 340) return false;
        counters.optionalUsed = true;
        return true;
      }
    }
    return true;
  }

  function boxToParagraphs(docx, box, lang) {
    const { Paragraph, TextRun } = docx;
    const L = labels(lang);
    const body = box.querySelector('.box-body');
    if (!body) return [];
    const classes = box.classList;
    const out = [];

    if (classes.contains('box-feedback')) {
      out.push(feedbackPara(docx, langText(body, lang)));
      return out;
    }

    if (classes.contains('box-click')) {
      const steps = [];
      body.querySelectorAll('.click-steps li').forEach((li) => {
        const t = langText(li, lang).replace(/^\d+\s*/, '');
        if (t) steps.push(t);
      });
      if (steps.length) {
        steps.forEach((step) => {
          out.push(inlinePara(docx, L.click, '2563EB', truncate(step, 280)));
        });
      } else {
        out.push(inlinePara(docx, L.click, '2563EB', truncate(langText(body, lang), 320)));
      }
      return out;
    }

    if (classes.contains('box-say')) {
      const lis = [];
      body.querySelectorAll('ul li').forEach((li) => {
        const t = langText(li, lang);
        if (t) lis.push(t);
      });
      if (lis.length > 1) {
        out.push(
          new Paragraph({
            spacing: { before: 60, after: 40 },
            children: [new TextRun({ text: L.say.replace(/: $/, ''), bold: true, color: '065F46' })],
          })
        );
        out.push(...bulletParas(docx, lis, 5, 200));
      } else {
        const text = lis[0] || langText(body, lang);
        out.push(inlinePara(docx, L.say, '065F46', truncate(text, 900)));
      }
      return out;
    }

    if (classes.contains('box-impact')) {
      out.push(inlinePara(docx, L.must, '5B3FA0', truncate(langText(body, lang), 400), { italics: true }));
      return out;
    }

    if (classes.contains('box-tip')) {
      out.push(inlinePara(docx, L.tip, '6B7280', truncate(langText(body, lang), 320)));
      return out;
    }

    if (classes.contains('box-warn')) {
      out.push(inlinePara(docx, L.note, '6B7280', truncate(langText(body, lang), 320)));
      return out;
    }

    if (classes.contains('box-context')) {
      const lis = [];
      body.querySelectorAll('ul li').forEach((li) => {
        const t = langText(li, lang);
        if (t) lis.push(t);
      });
      if (lis.length > 1) {
        out.push(inlinePara(docx, L.bg, '6B7280', ''));
        out.push(...bulletParas(docx, lis, 4, 180));
      } else {
        out.push(inlinePara(docx, L.bg, '6B7280', truncate(langText(body, lang), 320)));
      }
      return out;
    }

    const plain = truncate(langText(body, lang), 280);
    if (plain) {
      out.push(inlinePara(docx, '', '111827', plain));
    }
    return out;
  }

  function parseSceneHeading(scene, lang) {
    const act = langText(scene.querySelector('.scene-act'), lang);
    const title = langText(scene.querySelector('.scene-title'), lang);
    const num = scene.querySelector('.scene-num-big')?.textContent?.trim() || '';
    if (/^Block\s+\d+/i.test(act)) return act;
    if (num && title) {
      return `${lang === 'de' ? 'Block' : 'Block'} ${num} · ${title}`;
    }
    return act || title || (lang === 'de' ? 'Szene' : 'Scene');
  }

  function collectCastStory(lang) {
    const cast = document.querySelector('.cast-section');
    if (!cast) return null;
    const title = langText(cast.querySelector('h3'), lang) || labels(lang).story;
    const bullets = [];
    cast.querySelectorAll('.cast-card').forEach((card) => {
      const name = langText(card.querySelector('.cast-name'), lang);
      const role = langText(card.querySelector('.cast-role'), lang);
      const quote = langText(card.querySelector('.cast-quote'), lang);
      let line = name;
      if (role) line += role === name ? '' : ` — ${role}`;
      if (quote) line += ` (${quote.replace(/^["„]|["”]$/g, '')})`;
      if (line) bullets.push(truncate(line, 200));
    });
    return bullets.length ? { title, bullets } : null;
  }

  function collectOpening(lang) {
    const hooks = [...document.querySelectorAll('.story-hook')].filter((h) => !h.closest('.scene') && !h.closest('template'));
    if (!hooks.length) return null;
    const parts = [];
    hooks.forEach((hook) => {
      const t = langText(hook.querySelector('.story-hook-body'), lang);
      if (t) parts.push(t);
      hook.querySelectorAll('.box-feedback .box-body').forEach((fb) => {
        parts.push('__FEEDBACK__' + langText(fb, lang));
      });
    });
    return parts.length ? parts : null;
  }

  function collectAgendaCompact(lang) {
    const blocks = [];
    document.querySelectorAll('.agenda-fullpage-block').forEach((block, i) => {
      const title = langText(block.querySelector('h4'), lang);
      const items = [];
      block.querySelectorAll('li').forEach((li) => {
        const t = langText(li, lang);
        if (t) items.push(truncate(t, 160));
      });
      if (title) {
        blocks.push({
          num: block.querySelector('.agenda-fullpage-num')?.textContent?.trim() || String(i + 1),
          title,
          items: items.slice(0, 4),
        });
      }
    });
    return blocks.length ? blocks : null;
  }

  function collectDocumentSections(lang) {
    const L = labels(lang);
    const sections = [];

    const heroTitle = document.querySelector('.hero-title');
    const heroSub = document.querySelector('.hero-subtitle');
    sections.push({ type: 'title', text: langText(heroTitle, lang) });
    const metaBits = [langText(heroSub, lang)];
    document.querySelectorAll('.hero-meta-item').forEach((m, i) => {
      if (i < 2) {
        const t = langText(m, lang);
        if (t && !/trial5|tempus-resource\.com/i.test(t)) metaBits.push(t);
      }
    });
    sections.push({ type: 'meta', text: metaBits.filter(Boolean).join(' · ') });

    const cast = collectCastStory(lang);
    if (cast) sections.push({ type: 'bullets', title: cast.title, items: cast.bullets });

    const opening = collectOpening(lang);
    if (opening) sections.push({ type: 'opening', title: L.opening, parts: opening });

    const agenda = collectAgendaCompact(lang);
    if (agenda) sections.push({ type: 'agenda', title: L.agenda, blocks: agenda });

    document.querySelectorAll('.scene').forEach((scene) => {
      if (scene.closest('template')) return;
      const subtitle = langText(scene.querySelector('.scene-subtitle'), lang);
      const boxes = [];
      const counters = { optionalUsed: false };
      scene.querySelectorAll('.scene-body > .box').forEach((box) => {
        if (shouldExportBox(box, counters, lang)) boxes.push(box);
      });
      if (!boxes.length && !subtitle) return;
      sections.push({
        type: 'scene',
        heading: parseSceneHeading(scene, lang),
        subtitle: truncate(subtitle, 200),
        boxes,
      });
    });

    const closing = document.querySelector('.closing');
    if (closing) {
      const items = [];
      closing.querySelectorAll('.closing-item').forEach((it) => {
        const t = langText(it, lang);
        if (t) items.push(truncate(t, 200));
      });
      const final = truncate(langText(closing.querySelector('.closing-final'), lang), 300);
      sections.push({ type: 'closing', title: L.closing, items: items.slice(0, 8), final });
    }

    document.querySelectorAll('.qr-section').forEach((qr) => {
      const header = langText(qr.querySelector('.qr-header'), lang);
      const isCheat = /cheat|spick|kurz|nicht zu tief|skip|20 min/i.test(header);
      const bullets = [];
      qr.querySelectorAll('ul li').forEach((li) => {
        const t = langText(li, lang);
        if (t) bullets.push(truncate(t, 160));
      });
      const body = langText(qr.querySelector('.qr-body'), lang);
      if (bullets.length) {
        sections.push({
          type: 'bullets',
          title: isCheat ? L.cheat : truncate(header, 80) || L.cheat,
          items: bullets.slice(0, 10),
        });
      } else if (body && body.length < 400) {
        sections.push({ type: 'section', title: truncate(header, 80), body });
      }
    });

    document.querySelectorAll('.page .box-feedback').forEach((box) => {
      if (box.closest('.scene') || box.closest('.story-hook')) return;
      sections.push({ type: 'orphanBox', box });
    });

    return sections;
  }

  function buildDocxChildren(docx, lang) {
    const { Paragraph, TextRun, HeadingLevel, AlignmentType } = docx;
    const L = labels(lang);
    const children = [];
    const sections = collectDocumentSections(lang);
    let sceneIndex = 0;

    for (const sec of sections) {
      if (sec.type === 'title') {
        children.push(
          new Paragraph({
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 160 },
            children: [new TextRun({ text: sec.text, bold: true })],
          })
        );
      } else if (sec.type === 'meta') {
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 280 },
            children: [new TextRun({ text: sec.text, italics: true, size: 22 })],
          })
        );
      } else if (sec.type === 'section') {
        children.push(headingPara(docx, sec.title, 1));
        if (sec.body) {
          children.push(inlinePara(docx, '', '111827', sec.body));
        }
      } else if (sec.type === 'bullets') {
        children.push(headingPara(docx, sec.title, 1));
        children.push(...bulletParas(docx, sec.items, 8, 220));
      } else if (sec.type === 'opening') {
        children.push(headingPara(docx, sec.title, 1));
        sec.parts.forEach((part) => {
          if (part.startsWith('__FEEDBACK__')) {
            children.push(feedbackPara(docx, part.slice(12)));
          } else {
            children.push(inlinePara(docx, L.say, '065F46', truncate(part, 1200)));
          }
        });
      } else if (sec.type === 'agenda') {
        children.push(headingPara(docx, sec.title, 1));
        sec.blocks.forEach((b) => {
          children.push(headingPara(docx, `${b.num}. ${b.title}`, 2));
          children.push(...bulletParas(docx, b.items, 4, 180));
        });
      } else if (sec.type === 'scene') {
        sceneIndex += 1;
        children.push(headingPara(docx, sec.heading, 2));
        if (sec.subtitle) {
          children.push(
            new Paragraph({
              spacing: { after: 80 },
              children: [
                new TextRun({ text: L.goal, bold: true }),
                new TextRun({ text: sec.subtitle }),
              ],
            })
          );
        }
        sec.boxes.forEach((box) => {
          children.push(...boxToParagraphs(docx, box, lang));
        });
      } else if (sec.type === 'closing') {
        children.push(headingPara(docx, sec.title, 1));
        children.push(...bulletParas(docx, sec.items, 8, 200));
        if (sec.final) {
          children.push(
            new Paragraph({
              spacing: { before: 120, after: 100 },
              children: [new TextRun({ text: sec.final, bold: true, italics: true })],
            })
          );
        }
      } else if (sec.type === 'orphanBox') {
        children.push(...boxToParagraphs(docx, sec.box, lang));
      }
    }

    return children;
  }

  async function exportDemo(options = {}) {
    const lang = options.lang || currentLang();
    const btn = document.querySelector('.demo-export-word-btn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '⏳ Word…';
    }

    try {
      const docx = await loadDocx();
      const { Document, Packer } = docx;

      const children = buildDocxChildren(docx, lang);
      if (!children.length) throw new Error(lang === 'de' ? 'Kein Inhalt zum Exportieren.' : 'No content to export.');

      const doc = new Document({
        sections: [{ properties: {}, children }],
      });

      const blob = await Packer.toBlob(doc);
      const base =
        options.filenameBase ||
        sanitizeFilename(document.title.replace(/^Tempus Demo[ –-]*/i, '')) ||
        'Tempus_Demo';
      const suffix = lang === 'de' ? '_DE' : '_EN';
      downloadBlob(blob, `${base}${suffix}.docx`);
    } catch (err) {
      console.error('Word export failed:', err);
      alert(
        (lang === 'de' ? 'Word-Export fehlgeschlagen: ' : 'Word export failed: ') +
          (err.message || String(err))
      );
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = '📄 Word';
      }
    }
  }

  function exportDemoSafe() {
    return exportDemo().catch((err) => {
      console.error('Word export failed (unhandled):', err);
      const lang = currentLang();
      alert(
        (lang === 'de' ? 'Word-Export fehlgeschlagen: ' : 'Word export failed: ') +
          (err && err.message ? err.message : String(err))
      );
    });
  }

  global.DemoWordExport = { export: exportDemoSafe, currentLang };
})(typeof window !== 'undefined' ? window : globalThis);
