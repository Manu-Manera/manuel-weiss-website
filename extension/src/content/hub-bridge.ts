/**
 * Läuft auf dem Onboarding-Hub (localhost / manuel-weiss.ch).
 * Die Web-App hat oft keine VITE_VALKEEN_EXTENSION_ID – dann kann sie keine
 * chrome.runtime.sendMessage(extensionId, …) senden. Stattdessen postet die App
 * auf window; dieses Script leitet an den eigenen Service Worker weiter.
 */
import type { RuntimeMessage, RuntimeResponse } from '../lib/messaging';

const PAGE_SOURCE = 'valkeen-training-hub';
const REPLY_SOURCE = 'valkeen-extension-bridge';

function originAllowed(origin: string): boolean {
  return (
    /^https:\/\/(www\.)?manuel-weiss\.ch$/.test(origin) ||
    /^http:\/\/localhost:\d+$/.test(origin) ||
    /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
  );
}

window.addEventListener('message', (ev: MessageEvent) => {
  const d = ev.data;
  if (!d || d.source !== PAGE_SOURCE || typeof d.id !== 'string' || !d.message) return;
  if (!originAllowed(ev.origin)) return;

  const msg = d.message as RuntimeMessage;
  chrome.runtime.sendMessage(msg, (response: RuntimeResponse | undefined) => {
    const err = chrome.runtime.lastError;
    const payload: RuntimeResponse =
      err != null
        ? { ok: false, error: err.message ?? 'runtime error' }
        : (response ?? { ok: false, error: 'no response' });
    window.postMessage({ source: REPLY_SOURCE, id: d.id, response: payload }, '*');
  });
});
