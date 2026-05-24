/**
 * Recorder: Hört auf Klicks/Inputs/Navigation und schiebt Schritte zum Service Worker.
 *
 * - Klick: extrahiert Selectors via buildSelectors + macht Screenshot
 * - Input (debounced): speichert Eingabewert und Selectors
 * - Navigation: chrome.webNavigation.onHistoryStateUpdated wird im SW abonniert,
 *   das CS sendet hier nur einen "navigate"-Step bei pushState/popstate
 *
 * Aktivierung wird vom Service Worker per RECORDER_MODE_CHANGED gesteuert.
 */

import { buildSelectors } from '../lib/selector';
import type { RecorderStep } from '../lib/types';
import type { RuntimeMessage } from '../lib/messaging';

let active = false;
let inputDebounce: ReturnType<typeof setTimeout> | null = null;
let lastUrl = location.href;

function makeStepId(): string {
  return `rec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function isHostNode(target: EventTarget | null): boolean {
  if (!(target instanceof Node)) return false;
  let cur: Node | null = target;
  while (cur) {
    if (cur instanceof HTMLElement && cur.id?.startsWith('valkeen-tempus-trainer')) return true;
    cur = (cur as Node).parentNode;
  }
  return false;
}

async function pushStep(step: RecorderStep): Promise<void> {
  await chrome.runtime.sendMessage({ type: 'RECORDER_PUSH_STEP', step } satisfies RuntimeMessage).catch(() => undefined);
}

function onClick(ev: MouseEvent): void {
  if (!active) return;
  if (isHostNode(ev.target)) return;
  const el = ev.target as HTMLElement | null;
  if (!el) return;
  const selectors = buildSelectors(el);
  if (!selectors.length) return;
  const text = el.textContent?.trim().slice(0, 60) ?? '';
  void pushStep({
    id: makeStepId(),
    selectors,
    url: location.href,
    action: 'click',
    timestamp: new Date().toISOString(),
    textHint: text || undefined
  });
}

function onInput(ev: Event): void {
  if (!active) return;
  if (isHostNode(ev.target)) return;
  const el = ev.target as HTMLInputElement | HTMLTextAreaElement;
  if (!el || !('value' in el)) return;
  if (inputDebounce) clearTimeout(inputDebounce);
  inputDebounce = setTimeout(() => {
    const selectors = buildSelectors(el);
    if (!selectors.length) return;
    void pushStep({
      id: makeStepId(),
      selectors,
      url: location.href,
      action: 'input',
      inputValue: el.value,
      timestamp: new Date().toISOString()
    });
  }, 600);
}

function onNavigate(): void {
  if (!active) return;
  if (location.href === lastUrl) return;
  lastUrl = location.href;
  void pushStep({
    id: makeStepId(),
    selectors: [],
    url: location.href,
    action: 'navigate',
    timestamp: new Date().toISOString()
  });
}

export function setRecorderActive(on: boolean): void {
  active = on;
}

export function installRecorder(): void {
  document.addEventListener('click', onClick, true);
  document.addEventListener('change', onInput, true);
  document.addEventListener('input', onInput, true);
  window.addEventListener('popstate', onNavigate);
  const origPush = history.pushState.bind(history);
  const origReplace = history.replaceState.bind(history);
  history.pushState = (...args) => { origPush(...args); onNavigate(); };
  history.replaceState = (...args) => { origReplace(...args); onNavigate(); };
}
