/**
 * Highlight-Layer (Shadow-DOM) für Tooltip + Highlight-Box.
 *
 * Wird in den Tempus-DOM injiziert, ohne deren Styles zu erben oder zu beeinflussen.
 */

const HOST_ID = 'valkeen-tempus-trainer-host';

let host: HTMLDivElement | null = null;
let shadow: ShadowRoot | null = null;
let highlightBox: HTMLDivElement | null = null;
let tooltipEl: HTMLDivElement | null = null;
let bannerEl: HTMLDivElement | null = null;
let trackTarget: HTMLElement | null = null;
let rafId = 0;

const STYLE = `
  :host { all: initial; }
  .vk-overlay {
    position: fixed; inset: 0; pointer-events: none;
    z-index: 2147483646;
    font-family: ui-sans-serif, -apple-system, system-ui, "Segoe UI", Roboto, sans-serif;
  }
  .vk-highlight {
    position: absolute;
    border: 2px solid var(--vk-accent, #6366f1);
    border-radius: 8px;
    box-shadow: 0 0 0 9999px rgba(15, 23, 42, 0.55);
    transition: top .2s ease, left .2s ease, width .2s ease, height .2s ease, opacity .2s ease;
    pointer-events: none;
    opacity: 1;
  }
  .vk-highlight.pulse::after {
    content: ""; position: absolute; inset: -4px;
    border: 2px solid var(--vk-accent, #6366f1); border-radius: 10px;
    animation: vk-pulse 1.6s ease-in-out infinite;
  }
  @keyframes vk-pulse {
    0%, 100% { opacity: .8; transform: scale(1); }
    50% { opacity: 0; transform: scale(1.15); }
  }
  .vk-tooltip {
    position: absolute; max-width: 360px; min-width: 240px;
    background: rgba(15, 23, 42, 0.96); color: white;
    backdrop-filter: blur(12px);
    border: 1px solid rgba(99, 102, 241, 0.35);
    border-radius: 14px; padding: 14px 16px 16px;
    box-shadow: 0 18px 48px rgba(0,0,0,0.45);
    pointer-events: auto;
    transition: top .2s ease, left .2s ease, opacity .2s ease;
  }
  .vk-tooltip h3 {
    margin: 0 0 6px; font-size: 14px; font-weight: 700;
    color: var(--vk-accent, #a5b4fc);
    letter-spacing: .01em;
  }
  .vk-tooltip p {
    margin: 0; font-size: 13.5px; line-height: 1.45; color: rgba(255,255,255,.85);
    white-space: pre-wrap;
  }
  .vk-tooltip .vk-actions {
    display: flex; gap: 8px; margin-top: 12px;
  }
  .vk-tooltip button {
    appearance: none; border: 0;
    padding: 7px 12px; border-radius: 9px;
    font: inherit; font-size: 12.5px; font-weight: 600;
    cursor: pointer;
    transition: background .15s ease;
  }
  .vk-btn-primary {
    background: var(--vk-accent, #6366f1); color: white;
  }
  .vk-btn-primary:hover { filter: brightness(1.1); }
  .vk-btn-ghost {
    background: rgba(255,255,255,.08); color: rgba(255,255,255,.85);
  }
  .vk-btn-ghost:hover { background: rgba(255,255,255,.14); }

  .vk-banner {
    position: fixed; top: 16px; left: 50%;
    transform: translateX(-50%);
    z-index: 2147483647;
    padding: 8px 16px;
    background: rgba(15,23,42,.92);
    color: #f8fafc;
    border: 1px solid rgba(99,102,241,.4);
    border-radius: 999px;
    font: 600 12.5px ui-sans-serif, system-ui;
    box-shadow: 0 10px 32px rgba(0,0,0,.4);
    pointer-events: auto;
    display: flex; align-items: center; gap: 10px;
  }
  .vk-banner.recording { background: rgba(220,38,38,.92); border-color: #fecaca; }
  .vk-banner button {
    appearance: none; border: 0;
    background: rgba(255,255,255,.18); color: white;
    padding: 4px 10px; border-radius: 999px;
    font: inherit; cursor: pointer;
  }
`;

function ensureHost(): ShadowRoot {
  if (shadow) return shadow;
  host = document.createElement('div');
  host.id = HOST_ID;
  host.style.all = 'initial';
  shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = STYLE;
  shadow.appendChild(style);
  const overlay = document.createElement('div');
  overlay.className = 'vk-overlay';
  shadow.appendChild(overlay);
  document.documentElement.appendChild(host);
  return shadow;
}

export function setAccentColor(hex: string): void {
  const root = ensureHost().host as HTMLElement;
  (root.style as CSSStyleDeclaration).setProperty('--vk-accent', hex);
}

interface TooltipOptions {
  title: string;
  body: string;
  position?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
}

export function showHighlight(target: HTMLElement, opts: TooltipOptions): void {
  trackTarget = target;
  const root = ensureHost();
  const overlay = root.querySelector<HTMLDivElement>('.vk-overlay')!;

  if (!highlightBox) {
    highlightBox = document.createElement('div');
    highlightBox.className = 'vk-highlight pulse';
    overlay.appendChild(highlightBox);
  }
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'vk-tooltip';
    overlay.appendChild(tooltipEl);
  }

  tooltipEl.innerHTML = '';
  const h = document.createElement('h3');
  h.textContent = opts.title;
  tooltipEl.appendChild(h);
  const p = document.createElement('p');
  p.textContent = opts.body;
  tooltipEl.appendChild(p);
  const actions = document.createElement('div');
  actions.className = 'vk-actions';
  if (opts.secondaryLabel) {
    const sec = document.createElement('button');
    sec.className = 'vk-btn-ghost';
    sec.textContent = opts.secondaryLabel;
    sec.onclick = () => opts.onSecondary?.();
    actions.appendChild(sec);
  }
  if (opts.primaryLabel) {
    const prim = document.createElement('button');
    prim.className = 'vk-btn-primary';
    prim.textContent = opts.primaryLabel;
    prim.onclick = () => opts.onPrimary?.();
    actions.appendChild(prim);
  }
  if (actions.children.length) tooltipEl.appendChild(actions);

  highlightBox.style.opacity = '1';
  tooltipEl.style.opacity = '1';
  positionToTarget(target, opts.position);
  startTracking();
  scrollIntoViewIfNeeded(target);
}

export function showFloatingTip(opts: TooltipOptions): void {
  trackTarget = null;
  const root = ensureHost();
  const overlay = root.querySelector<HTMLDivElement>('.vk-overlay')!;
  if (highlightBox) highlightBox.style.opacity = '0';
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'vk-tooltip';
    overlay.appendChild(tooltipEl);
  }
  tooltipEl.innerHTML = '';
  const h = document.createElement('h3');
  h.textContent = opts.title;
  tooltipEl.appendChild(h);
  const p = document.createElement('p');
  p.textContent = opts.body;
  tooltipEl.appendChild(p);
  const actions = document.createElement('div');
  actions.className = 'vk-actions';
  if (opts.secondaryLabel) {
    const sec = document.createElement('button');
    sec.className = 'vk-btn-ghost';
    sec.textContent = opts.secondaryLabel;
    sec.onclick = () => opts.onSecondary?.();
    actions.appendChild(sec);
  }
  if (opts.primaryLabel) {
    const prim = document.createElement('button');
    prim.className = 'vk-btn-primary';
    prim.textContent = opts.primaryLabel;
    prim.onclick = () => opts.onPrimary?.();
    actions.appendChild(prim);
  }
  if (actions.children.length) tooltipEl.appendChild(actions);

  tooltipEl.style.bottom = '24px';
  tooltipEl.style.right = '24px';
  tooltipEl.style.left = 'auto';
  tooltipEl.style.top = 'auto';
  tooltipEl.style.opacity = '1';
}

export function hideHighlight(): void {
  if (highlightBox) highlightBox.style.opacity = '0';
  if (tooltipEl) tooltipEl.style.opacity = '0';
  trackTarget = null;
  stopTracking();
}

export function showBanner(text: string, opts?: { variant?: 'default' | 'recording'; actionLabel?: string; onAction?: () => void }): void {
  const root = ensureHost();
  if (!bannerEl) {
    bannerEl = document.createElement('div');
    bannerEl.className = 'vk-banner';
    root.appendChild(bannerEl);
  }
  bannerEl.className = `vk-banner ${opts?.variant === 'recording' ? 'recording' : ''}`;
  bannerEl.innerHTML = '';
  const span = document.createElement('span');
  span.textContent = text;
  bannerEl.appendChild(span);
  if (opts?.actionLabel) {
    const btn = document.createElement('button');
    btn.textContent = opts.actionLabel;
    btn.onclick = () => opts.onAction?.();
    bannerEl.appendChild(btn);
  }
}

export function hideBanner(): void {
  if (bannerEl) {
    bannerEl.remove();
    bannerEl = null;
  }
}

function positionToTarget(target: HTMLElement, position = 'bottom'): void {
  if (!highlightBox || !tooltipEl) return;
  const rect = target.getBoundingClientRect();
  const pad = 6;
  highlightBox.style.left = `${rect.left - pad}px`;
  highlightBox.style.top = `${rect.top - pad}px`;
  highlightBox.style.width = `${rect.width + pad * 2}px`;
  highlightBox.style.height = `${rect.height + pad * 2}px`;

  const tipRect = tooltipEl.getBoundingClientRect();
  const tipW = tipRect.width || 320;
  const tipH = tipRect.height || 120;
  const margin = 12;
  let top = rect.bottom + margin;
  let left = rect.left;
  if (position.startsWith('top')) {
    top = rect.top - tipH - margin;
  } else if (position.startsWith('right')) {
    top = rect.top;
    left = rect.right + margin;
  } else if (position.startsWith('left')) {
    top = rect.top;
    left = rect.left - tipW - margin;
  }
  if (position.endsWith('-end')) {
    if (position.startsWith('top') || position.startsWith('bottom')) left = rect.right - tipW;
    else top = rect.bottom - tipH;
  }
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (left + tipW > vw - 8) left = vw - tipW - 8;
  if (left < 8) left = 8;
  if (top + tipH > vh - 8) top = vh - tipH - 8;
  if (top < 8) top = 8;
  tooltipEl.style.left = `${left}px`;
  tooltipEl.style.top = `${top}px`;
  tooltipEl.style.right = 'auto';
  tooltipEl.style.bottom = 'auto';
}

function startTracking(): void {
  cancelAnimationFrame(rafId);
  const tick = () => {
    if (trackTarget && document.contains(trackTarget)) {
      positionToTarget(trackTarget);
    }
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
}

function stopTracking(): void {
  cancelAnimationFrame(rafId);
}

function scrollIntoViewIfNeeded(el: HTMLElement): void {
  const rect = el.getBoundingClientRect();
  if (rect.top < 0 || rect.bottom > window.innerHeight) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
  }
}
