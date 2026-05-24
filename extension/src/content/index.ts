/**
 * Einstiegspunkt des Content-Scripts. Wird auf jeder *.prosymmetry.com-Seite geladen.
 *
 * Aufgaben:
 *  - Tour-Runtime aktivieren (sobald Service Worker State sendet)
 *  - Recorder-Listener installieren (immer aktiv, aber nur auf RECORDER_MODE_CHANGED reagiert)
 *  - Bei Initialisierung den aktiven Tour-State vom Service Worker abfragen
 */

import type { RuntimeMessage } from '../lib/messaging';
import { applyTourState, startSpaWatcher } from './tour';
import { installRecorder, setRecorderActive } from './recorder';
import { showBanner, hideBanner } from './highlight';

function subdomain(): string {
  const host = location.host;
  const parts = host.split('.');
  return parts.length >= 3 ? parts[0] : host;
}

async function init(): Promise<void> {
  installRecorder();
  startSpaWatcher();

  await chrome.runtime.sendMessage({
    type: 'CS_READY',
    url: location.href,
    subdomain: subdomain()
  } satisfies RuntimeMessage).catch(() => undefined);

  const active = await chrome.runtime.sendMessage({ type: 'GET_ACTIVE_TOUR' } satisfies RuntimeMessage).catch(() => null);
  if (active?.ok && active.data) {
    void applyTourState(active.data);
  }

  const recOn = await chrome.runtime.sendMessage({ type: 'GET_AUTH' } satisfies RuntimeMessage).catch(() => null);
  if (recOn?.ok) {
    /* recOn nicht direkt, separater key – wir holen über storage events */
  }

  chrome.runtime.onMessage.addListener((msg: RuntimeMessage) => {
    if (msg.type === 'TOUR_STATE') {
      void applyTourState(msg);
    } else if (msg.type === 'RECORDER_MODE_CHANGED') {
      setRecorderActive(msg.on);
      if (msg.on) {
        showBanner('Aufnahme läuft – klicke wie gewohnt durch Tempus.', {
          variant: 'recording',
          actionLabel: 'Stoppen',
          onAction: () => {
            void chrome.runtime.sendMessage({ type: 'TOGGLE_RECORDER', on: false } satisfies RuntimeMessage);
          }
        });
      } else {
        hideBanner();
      }
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => void init());
} else {
  void init();
}
