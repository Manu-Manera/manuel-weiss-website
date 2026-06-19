/** Deterministisch: KI-JSON → Demo-State (heroHtml, agendaHtml, scenes[]) */

function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function bi(de, en) {
  const d = (de || '').trim();
  const e = (en || '').trim() || (d ? '(EN pending)' : '');
  return `<span class="t-de">${esc(d)}</span><span class="t-en">${esc(e)}</span>`;
}

function biBlock(de, en) {
  const d = (de || '').trim();
  const e = (en || '').trim() || (d ? '(EN pending)' : '');
  if (!d && !e) return '';
  return `<span class="t-de">${d}</span><span class="t-en">${e}</span>`;
}

const BOX_META = {
  say: { cls: 'box-say', icon: '🎙️', headerDe: 'Erklärpunkte', headerEn: 'Talking points' },
  click: { cls: 'box-click', icon: '🖱️', headerDe: 'Klickpfad', headerEn: 'Click path' },
  context: { cls: 'box-context', icon: '🧭', headerDe: 'Hintergrund', headerEn: 'Background' },
  must: { cls: 'box-click', icon: '✅', headerDe: 'Muss-Satz', headerEn: 'Must-use phrase' },
  feedback: { cls: 'box-feedback', icon: '💬', headerDe: 'Feedback', headerEn: 'Feedback' },
  tip: { cls: 'box-tip', icon: '💡', headerDe: 'Tipp', headerEn: 'Tip' },
  warn: { cls: 'box-warn', icon: '⚠️', headerDe: 'Hinweis', headerEn: 'Note' },
};

function buildBox(box) {
  const type = box.type || 'say';
  const meta = BOX_META[type] || BOX_META.say;
  const hdr = box.header?.de || box.header?.en ? box.header : { de: meta.headerDe, en: meta.headerEn };

  let body = '';
  if (type === 'click' && box.steps?.length) {
    const items = box.steps
      .map((s) => `<li>${biBlock(s.de, s.en)}</li>`)
      .join('');
    body = `<ul class="click-steps">${items}</ul>`;
  } else {
    const paras = (box.paragraphs || [])
      .filter((p) => p.de || p.en)
      .map((p) => `<p style="margin:0 0 10px;">${biBlock(p.de, p.en)}</p>`)
      .join('');
    body = paras || `<p>${biBlock('', '')}</p>`;
  }

  return `<div class="box ${meta.cls}">
    <div class="box-header"><span class="box-icon">${meta.icon}</span>${bi(hdr.de || meta.headerDe, hdr.en || meta.headerEn)}</div>
    <div class="box-body">${body}</div>
  </div>`;
}

function buildScene(scene, index) {
  const num = String(scene.num || index + 1).padStart(2, '0');
  const tags = (scene.tags || [])
    .map((t, i) => {
      const cls = ['tag-blue', 'tag-green', 'tag-orange', 'tag-teal'][i % 4];
      return `<span class="tag ${cls}">${esc(t)}</span>`;
    })
    .join('');
  const boxes = (scene.boxes || []).map(buildBox).join('\n');

  return `<div class="scene">
  <div class="scene-header">
    <div class="scene-num-badge" style="background:linear-gradient(135deg,var(--rm),var(--teal))">
      <div class="scene-num-big">${esc(num)}</div>
      <div class="scene-num-label">${bi(scene.label?.de || 'Block', scene.label?.en || 'Block')}</div>
    </div>
    <div class="scene-title-area">
      <div class="scene-act">${bi(scene.act?.de || '', scene.act?.en || '')}</div>
      <div class="scene-title">${bi(scene.title?.de || 'Szene', scene.title?.en || 'Scene')}</div>
      <div class="scene-subtitle">${bi(scene.subtitle?.de || '', scene.subtitle?.en || '')}</div>
    </div>
  </div>
  ${tags ? `<div class="scene-tags">${tags}</div>` : ''}
  <div class="scene-body">${boxes || buildBox({ type: 'say', paragraphs: [{ de: 'Inhalt ergänzen…', en: 'Add content…' }] })}</div>
</div>`;
}

export function buildHeroHtml(hero = {}) {
  const title = hero.title || {};
  const subtitle = hero.subtitle || {};
  const eyebrow = hero.eyebrow || {};
  return `<div class="hero">
  <div class="hero-inner">
    <div class="hero-eyebrow">${bi(eyebrow.de || 'Tempus Demo', eyebrow.en || 'Tempus Demo')}</div>
    <h1 class="hero-title">${bi(title.de || 'Neue Demo', title.en || 'New demo')}</h1>
    <p class="hero-subtitle">${bi(subtitle.de || '', subtitle.en || '')}</p>
  </div>
</div>`;
}

export function buildAgendaHtml(agenda = {}, agendaId = 'custom-training-agenda') {
  const blocks = (agenda.blocks || [])
    .map((b, i) => {
      const num = b.num ?? i + 1;
      const bullets = (b.bullets || [])
        .map((li) => `<li>${biBlock(li.de, li.en)}</li>`)
        .join('');
      return `<div class="agenda-fullpage-block">
        <div class="agenda-fullpage-num">${num}</div>
        <div>
          <h4>${bi(b.title?.de || `Block ${num}`, b.title?.en || `Block ${num}`)}</h4>
          <ul>${bullets || `<li>${biBlock('—', '—')}</li>`}</ul>
        </div>
      </div>`;
    })
    .join('');

  return `<div class="agenda-fullpage-wrap" id="${esc(agendaId)}">
  <div class="agenda-fullpage-inner">
    <p class="agenda-fullpage-kicker">${bi(agenda.kicker?.de || 'Training', agenda.kicker?.en || 'Training')}</p>
    <h2 class="agenda-fullpage-title"><span class="t-de">Agenda</span><span class="t-en">Agenda</span></h2>
    <p class="agenda-fullpage-sub">${bi(agenda.subtitle?.de || '', agenda.subtitle?.en || '')}</p>
    <div class="agenda-fullpage-blocks">${blocks}</div>
  </div>
</div>`;
}

export function buildIntroHtml(intro = {}) {
  return `<div class="page" id="custom-editable-intro">
  <div class="demo-macro-free-block" style="padding:20px 24px;">
    ${biBlock(intro.de || 'Willkommen — Demo-Skript aus Word importiert. Inhalte im Bearbeiten-Modus anpassen.', intro.en || '')}
  </div>
</div>`;
}

/**
 * @param {object} structure — KI-JSON
 * @returns {{ heroHtml, introHtml, agendaHtml, scenes: string[], schemaVersion: number }}
 */
export function buildDemoStateFromStructure(structure) {
  const scenes = (structure.scenes || []).map((s, i) => buildScene(s, i));
  return {
    schemaVersion: 1,
    heroHtml: buildHeroHtml(structure.hero),
    introHtml: buildIntroHtml(structure.intro),
    agendaHtml: buildAgendaHtml(structure.agenda),
    scenes,
    ts: Date.now(),
  };
}

export function slugifyDemoName(name) {
  return String(name || 'demo')
    .toLowerCase()
    .replace(/[äÄ]/g, 'ae')
    .replace(/[öÖ]/g, 'oe')
    .replace(/[üÜ]/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'demo';
}

const RESERVED = new Set(['pm', 'rm', 'bpafg', 'team-resources', 'catalog', 'custom']);

export function normalizeSlug(slug) {
  const s = slugifyDemoName(slug);
  if (RESERVED.has(s)) return `${s}-custom`;
  return s;
}
