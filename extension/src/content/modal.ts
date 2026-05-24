/**
 * Theorie-Folien-Modal (Shadow-DOM, Vollbild über Tempus).
 *
 * Erwartet einen Slide aus dem Schema (Block-Liste). Rendert simple HTML –
 * Markdown-Blöcke werden minimal verarbeitet (fett, kursiv, Code, Listen).
 */

import type { Slide, SlideBlock } from '../lib/types';

const MODAL_HOST_ID = 'valkeen-tempus-trainer-modal-host';
let host: HTMLDivElement | null = null;
let shadow: ShadowRoot | null = null;
let onCloseCb: (() => void) | null = null;

const STYLE = `
  :host { all: initial; }
  .vk-modal-root {
    position: fixed; inset: 0; z-index: 2147483647;
    display: flex; align-items: center; justify-content: center;
    background: rgba(7, 11, 24, 0.78);
    backdrop-filter: blur(8px);
    font-family: ui-sans-serif, -apple-system, system-ui, "Segoe UI", Roboto, sans-serif;
    color: #e5e7eb;
    animation: vk-fade .25s ease;
  }
  @keyframes vk-fade { from { opacity: 0; } to { opacity: 1; } }
  .vk-modal-card {
    width: min(720px, 92vw);
    max-height: 88vh;
    background: linear-gradient(180deg, rgba(20,25,45,.96), rgba(15,18,35,.96));
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 18px;
    box-shadow: 0 30px 80px rgba(0,0,0,.6);
    display: flex; flex-direction: column;
    overflow: hidden;
  }
  header {
    padding: 22px 26px 12px;
    border-bottom: 1px solid rgba(255,255,255,.06);
    display: flex; align-items: flex-start; gap: 12px;
  }
  header .badge {
    background: rgba(99,102,241,.2);
    color: #a5b4fc;
    border: 1px solid rgba(99,102,241,.35);
    border-radius: 999px;
    padding: 3px 10px;
    font-size: 11px; font-weight: 700; letter-spacing: .04em;
    text-transform: uppercase;
  }
  header h1 { margin: 8px 0 4px; font-size: 22px; font-weight: 700; color: white; }
  header h2 { margin: 0; font-size: 14px; font-weight: 500; color: rgba(255,255,255,.6); }
  .vk-close {
    margin-left: auto;
    background: rgba(255,255,255,.06); border: 0;
    width: 32px; height: 32px; border-radius: 10px;
    color: white; font-size: 18px; cursor: pointer;
  }
  .vk-close:hover { background: rgba(255,255,255,.12); }
  .vk-body {
    padding: 22px 26px 26px;
    overflow-y: auto;
    line-height: 1.55;
  }
  .vk-body h3 { font-size: 17px; margin: 18px 0 8px; color: white; }
  .vk-body p { margin: 0 0 12px; font-size: 14.5px; }
  .vk-body img { max-width: 100%; border-radius: 10px; }
  .vk-body figure { margin: 16px 0; }
  .vk-body figure figcaption { font-size: 12.5px; color: rgba(255,255,255,.5); margin-top: 6px; }
  .vk-body code { background: rgba(255,255,255,.08); padding: 2px 6px; border-radius: 5px; font-size: 12.5px; }
  .vk-body pre {
    background: rgba(0,0,0,.35); border: 1px solid rgba(255,255,255,.05);
    padding: 12px; border-radius: 10px; overflow-x: auto;
    font-size: 12.5px; font-family: ui-monospace, Menlo, monospace;
  }
  .vk-callout {
    border-left: 3px solid var(--vk-accent, #6366f1);
    background: rgba(99,102,241,.08);
    padding: 12px 14px; border-radius: 10px;
    margin: 14px 0;
    font-size: 13.5px;
  }
  .vk-callout.warn { border-left-color: #f59e0b; background: rgba(245,158,11,.08); }
  .vk-callout.success { border-left-color: #10b981; background: rgba(16,185,129,.08); }
  .vk-callout.tip { border-left-color: #38bdf8; background: rgba(56,189,248,.08); }
  .vk-quiz {
    background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
    border-radius: 12px; padding: 14px 16px; margin: 14px 0;
  }
  .vk-quiz .q { font-weight: 600; margin-bottom: 8px; }
  .vk-quiz .opt {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 10px; border-radius: 8px;
    background: rgba(255,255,255,.03);
    margin-bottom: 6px; cursor: pointer;
    border: 1px solid transparent;
  }
  .vk-quiz .opt:hover { background: rgba(255,255,255,.07); }
  .vk-quiz .opt.correct { border-color: #10b981; background: rgba(16,185,129,.12); }
  .vk-quiz .opt.wrong { border-color: #ef4444; background: rgba(239,68,68,.12); }
  footer {
    padding: 14px 26px 22px;
    display: flex; gap: 10px; justify-content: flex-end;
    border-top: 1px solid rgba(255,255,255,.06);
  }
  footer button {
    appearance: none; border: 0;
    padding: 9px 16px; border-radius: 10px;
    font: 600 13px ui-sans-serif, system-ui;
    cursor: pointer;
  }
  .vk-btn-primary { background: var(--vk-accent, #6366f1); color: white; }
  .vk-btn-primary:hover { filter: brightness(1.1); }
  .vk-btn-ghost { background: rgba(255,255,255,.07); color: rgba(255,255,255,.85); }
`;

function ensureHost(): ShadowRoot {
  if (shadow) return shadow;
  host = document.createElement('div');
  host.id = MODAL_HOST_ID;
  host.style.all = 'initial';
  shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = STYLE;
  shadow.appendChild(style);
  document.documentElement.appendChild(host);
  return shadow;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
}

function renderInlineMarkdown(s: string): string {
  return escapeHtml(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(?:^|[^*])\*([^*\n]+)\*/g, (m, p1) => m.replace(`*${p1}*`, `<em>${p1}</em>`))
    .replace(/\n/g, '<br/>');
}

function renderBlock(block: SlideBlock): string {
  switch (block.type) {
    case 'heading':
      return `<h3>${escapeHtml(block.text ?? '')}</h3>`;
    case 'text':
      return `<p>${renderInlineMarkdown(block.markdown ?? block.text ?? '')}</p>`;
    case 'image':
      return `<figure><img src="${escapeHtml(block.src ?? '')}" alt="${escapeHtml(block.alt ?? '')}"/>${
        block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ''
      }</figure>`;
    case 'video':
      return `<figure><video src="${escapeHtml(block.src ?? '')}" controls style="width:100%;border-radius:10px;"></video>${
        block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ''
      }</figure>`;
    case 'callout':
      return `<div class="vk-callout ${escapeHtml(block.variant ?? 'info')}">${renderInlineMarkdown(block.markdown ?? block.text ?? '')}</div>`;
    case 'code':
      return `<pre><code>${escapeHtml(block.text ?? '')}</code></pre>`;
    case 'quiz':
      return (block.questions ?? [])
        .map(
          (q) => `<div class="vk-quiz">
            <div class="q">${escapeHtml(q.text)}</div>
            ${q.options
              .map(
                (o, i) =>
                  `<div class="opt" data-correct="${i === q.correctIndex ? '1' : '0'}">${escapeHtml(o)}</div>`
              )
              .join('')}
          </div>`
        )
        .join('');
    default:
      return '';
  }
}

export function showSlideModal(slide: Slide, options: { onClose?: () => void; onNext?: () => void; nextLabel?: string }): void {
  const root = ensureHost();
  onCloseCb = options.onClose ?? null;

  let card = root.querySelector<HTMLDivElement>('.vk-modal-root');
  if (!card) {
    card = document.createElement('div');
    card.className = 'vk-modal-root';
    root.appendChild(card);
  }
  card.innerHTML = `
    <div class="vk-modal-card">
      <header>
        <div>
          <span class="badge">Theorie</span>
          <h1>${escapeHtml(slide.title)}</h1>
          ${slide.subtitle ? `<h2>${escapeHtml(slide.subtitle)}</h2>` : ''}
        </div>
        <button class="vk-close" aria-label="Schließen">×</button>
      </header>
      <div class="vk-body">
        ${slide.blocks.map(renderBlock).join('')}
      </div>
      <footer>
        <button class="vk-btn-ghost" data-action="close">Schließen</button>
        <button class="vk-btn-primary" data-action="next">${escapeHtml(options.nextLabel ?? 'Weiter')}</button>
      </footer>
    </div>
  `;

  card.querySelector('.vk-close')?.addEventListener('click', () => closeModal());
  card.querySelector('[data-action="close"]')?.addEventListener('click', () => closeModal());
  card.querySelector('[data-action="next"]')?.addEventListener('click', () => {
    options.onNext?.();
    closeModal();
  });
  card.querySelectorAll('.vk-quiz .opt').forEach((opt) => {
    opt.addEventListener('click', () => {
      opt.classList.add(opt.getAttribute('data-correct') === '1' ? 'correct' : 'wrong');
    });
  });
}

export function closeModal(): void {
  if (!shadow) return;
  const card = shadow.querySelector('.vk-modal-root');
  if (card) card.remove();
  if (onCloseCb) onCloseCb();
  onCloseCb = null;
}
