/**
 * Service Worker (MV3).
 *
 * Aufgaben:
 *  - Auth-Token verwalten (von Onboarding-App via externally_connectable)
 *  - Tour/Slide/Branding aus Backend laden und cachen
 *  - Cross-Tab-Sync zwischen Side Panel, Modal und Content-Script
 *  - Side Panel pro Tempus-Tab automatisch aktivieren
 *  - Recorder-Mode an Content-Scripts ausspielen
 *  - Screenshots aufnehmen für Recorder-Steps
 *  - Progress-Events an Backend pushen (debounced)
 */

import type { RuntimeMessage, RuntimeResponse } from './lib/messaging';
import type { RecorderStep } from './lib/types';
import { Storage } from './lib/storage';
import { fetchCustomerIndex, loadTourBundle, pushProgress } from './lib/api';

const TOUR_TABS = new Map<number, { tourId: string; customerId: string }>();
const PROGRESS_BUFFER: Array<Parameters<typeof pushProgress>[2] & { customerId: string; userId: string }> = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

const TEMPUS_TAB_URLS = ['https://*.prosymmetry.com/*', 'https://*.tempus-resource.com/*'];

let pendingPickResolver: ((v: { x: number; y: number } | null) => void) | null = null;

function isTempusUrl(url: string): boolean {
  return /^https:\/\/[^/]+\.(prosymmetry|tempus-resource)\.com\//.test(url);
}

async function findTempusTab(preferredTabId?: number): Promise<chrome.tabs.Tab | null> {
  if (preferredTabId != null) {
    const t = await chrome.tabs.get(preferredTabId).catch(() => null);
    if (t?.url && isTempusUrl(t.url)) return t;
  }
  const [active] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (active?.url && isTempusUrl(active.url)) return active;
  const tabs = await chrome.tabs.query({ url: TEMPUS_TAB_URLS });
  return tabs[0] ?? null;
}

function sendToTempusTab<T>(tabId: number, message: RuntimeMessage): Promise<T | null> {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) resolve(null);
      else resolve((response as T) ?? null);
    });
  });
}

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
  const idx = await fetchCustomerIndex();
  if (idx) await Storage.setCustomerIndex(idx);
});

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (info.status === 'complete' && tab.url) {
    if (isTempusUrl(tab.url)) {
      try {
        await chrome.sidePanel.setOptions({
          tabId,
          path: 'src/sidepanel/index.html',
          enabled: true
        });
      } catch (e) {
        console.warn('[bg] sidePanel.setOptions failed', e);
      }
    }
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  TOUR_TABS.delete(tabId);
});

chrome.runtime.onMessage.addListener((msg: RuntimeMessage, sender, sendResponse) => {
  handleMessage(msg, sender)
    .then((res) => sendResponse(res))
    .catch((err) => sendResponse({ ok: false, error: String(err?.message ?? err) }));
  return true;
});

chrome.runtime.onMessageExternal.addListener((msg: RuntimeMessage, sender, sendResponse) => {
  handleMessage(msg, sender)
    .then((res) => sendResponse(res))
    .catch((err) => sendResponse({ ok: false, error: String(err?.message ?? err) }));
  return true;
});

async function handleMessage(msg: RuntimeMessage, sender: chrome.runtime.MessageSender): Promise<RuntimeResponse> {
  switch (msg.type) {
    case 'EXT_PING':
      return { ok: true, data: { version: chrome.runtime.getManifest().version } };

    case 'EXT_AUTH':
      await Storage.setAuth({
        token: msg.token,
        customerId: msg.customerId,
        userId: msg.userId,
        role: msg.role,
        expiresAt: msg.expiresAt
      });
      return { ok: true, data: { stored: true } };

    case 'GET_AUTH':
      return { ok: true, data: await Storage.getAuth() };

    case 'CLEAR_AUTH':
      await Storage.clearAuth();
      return { ok: true, data: { cleared: true } };

    case 'EXT_START_TOUR':
    case 'START_TOUR_LOCAL': {
      const bundle = await loadTourBundle(msg.customerId, msg.tourId);
      if (!bundle.tour) return { ok: false, error: 'Tour nicht gefunden' };
      await Storage.setActiveTour({ tourId: msg.tourId, customerId: msg.customerId });
      const firstStep = bundle.tour.steps[0]?.id ?? null;
      await Storage.setCurrentStep(firstStep);

      const tabs = await chrome.tabs.query({ url: TEMPUS_TAB_URLS });
      for (const tab of tabs) {
        if (tab.id) {
          TOUR_TABS.set(tab.id, { tourId: msg.tourId, customerId: msg.customerId });
          chrome.tabs.sendMessage(tab.id, {
            type: 'TOUR_STATE',
            tour: bundle.tour,
            currentStepId: firstStep,
            branding: bundle.branding
          } satisfies RuntimeMessage).catch(() => undefined);
        }
      }
      return { ok: true, data: { tourId: msg.tourId, currentStep: firstStep } };
    }

    case 'EXT_STOP_TOUR':
    case 'STOP_TOUR_LOCAL': {
      await Storage.setActiveTour(null);
      await Storage.setCurrentStep(null);
      const tabs = await chrome.tabs.query({ url: TEMPUS_TAB_URLS });
      for (const tab of tabs) {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'TOUR_STATE',
            tour: null,
            currentStepId: null,
            branding: null
          } satisfies RuntimeMessage).catch(() => undefined);
        }
      }
      return { ok: true, data: { stopped: true } };
    }

    case 'GET_ACTIVE_TOUR': {
      const active = await Storage.getActiveTour();
      const stepId = await Storage.getCurrentStep();
      if (!active) return { ok: true, data: null };
      const bundle = await loadTourBundle(active.customerId, active.tourId);
      return {
        ok: true,
        data: {
          tour: bundle.tour,
          currentStepId: stepId ?? bundle.tour?.steps[0]?.id ?? null,
          branding: bundle.branding,
          slides: bundle.slides
        }
      };
    }

    case 'GET_TOUR_DATA': {
      const bundle = await loadTourBundle(msg.customerId, msg.tourId);
      return { ok: true, data: bundle };
    }

    case 'GET_SLIDE': {
      const slide = await Storage.getSlide(msg.customerId, msg.slideId);
      return { ok: true, data: slide ?? null };
    }

    case 'GET_BRANDING': {
      const b = await Storage.getBranding(msg.customerId);
      return { ok: true, data: b ?? null };
    }

    case 'CAPTURE_SCREENSHOT': {
      const tabId = sender.tab?.id;
      const dataUrl = await chrome.tabs.captureVisibleTab(undefined as unknown as number, {
        format: 'png'
      }).catch(() => null);
      return { ok: true, data: { dataUrl, tabId: tabId ?? null } };
    }

    case 'TOGGLE_RECORDER': {
      await Storage.setRecorderOn(msg.on);
      const tabs = await chrome.tabs.query({ url: TEMPUS_TAB_URLS });
      for (const tab of tabs) {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'RECORDER_MODE_CHANGED',
            on: msg.on
          } satisfies RuntimeMessage).catch(() => undefined);
        }
      }
      return { ok: true, data: { on: msg.on } };
    }

    case 'RECORDER_PUSH_STEP': {
      let step: RecorderStep = msg.step;
      if (!step.screenshotDataUrl) {
        const dataUrl = await chrome.tabs
          .captureVisibleTab(undefined as unknown as number, { format: 'png' })
          .catch(() => null);
        if (dataUrl) step = { ...step, screenshotDataUrl: dataUrl };
      }
      await Storage.pushRecorderStep(step);
      return { ok: true, data: { count: (await Storage.getRecorderSteps()).length } };
    }

    case 'EXT_GET_RECORDING':
    case 'RECORDER_GET_STEPS': {
      const steps = await Storage.getRecorderSteps();
      return { ok: true, data: steps };
    }

    case 'RECORDER_CLEAR_STEPS':
      await Storage.clearRecorderSteps();
      return { ok: true, data: { cleared: true } };

    case 'PROGRESS_EVENT': {
      const auth = await Storage.getAuth();
      if (auth.customerId && auth.userId) {
        PROGRESS_BUFFER.push({
          customerId: auth.customerId,
          userId: auth.userId,
          tourId: msg.tourId,
          stepId: msg.stepId,
          status: msg.status
        });
        scheduleFlush();
      }
      return { ok: true, data: { buffered: PROGRESS_BUFFER.length } };
    }

    case 'EXT_OPEN_RECORDER': {
      await Storage.setRecorderOn(true);
      return { ok: true, data: { on: true } };
    }

    case 'EXT_MOUSE_DRAG': {
      const tab = await findTempusTab(msg.tabId);
      if (!tab?.id) {
        return { ok: false, error: 'Kein Tempus-Tab offen (*.prosymmetry.com oder *.tempus-resource.com)' };
      }
      const response = await sendToTempusTab<RuntimeResponse>(tab.id, {
        type: 'MOUSE_DRAG',
        drags: msg.drags,
        steps: msg.steps,
        stepDelayMs: msg.stepDelayMs,
        pauseBeforeMs: msg.pauseBeforeMs,
        pauseAfterMs: msg.pauseAfterMs
      });
      if (!response) {
        return { ok: false, error: 'Content-Script antwortet nicht – Seite neu laden oder Extension prüfen' };
      }
      return response;
    }

    case 'EXT_MOUSE_PICK_COORD': {
      const tab = await findTempusTab(msg.tabId);
      if (!tab?.id) {
        return { ok: false, error: 'Kein Tempus-Tab offen' };
      }
      const coords = await new Promise<{ x: number; y: number } | null>((resolve) => {
        pendingPickResolver = resolve;
        setTimeout(() => {
          if (pendingPickResolver === resolve) {
            pendingPickResolver = null;
            resolve(null);
          }
        }, 90_000);
        void chrome.tabs.sendMessage(tab.id!, { type: 'MOUSE_PICK_COORD' } satisfies RuntimeMessage);
      });
      if (!coords) return { ok: false, error: 'Keine Koordinaten – Zeitüberschreitung oder Abbruch' };
      return { ok: true, data: coords };
    }

    case 'MOUSE_PICK_RESULT': {
      if (pendingPickResolver) {
        pendingPickResolver({ x: msg.x, y: msg.y });
        pendingPickResolver = null;
      }
      return { ok: true, data: { received: true } };
    }

    case 'MOUSE_DRAG_RESULT':
    case 'MOUSE_DRAG':
    case 'MOUSE_PICK_COORD':
    case 'CS_READY':
    case 'CS_STEP_RESULT':
    case 'CS_USER_REQUEST_HELP':
    case 'CS_USER_NEXT':
    case 'TOUR_STATE':
    case 'SHOW_SLIDE':
    case 'NEXT_STEP':
    case 'GO_TO_STEP':
    case 'RECORDER_MODE_CHANGED':
      return { ok: true, data: null };

    default:
      return { ok: false, error: `Unbekannter Message-Typ` };
  }
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(async () => {
    flushTimer = null;
    const batch = PROGRESS_BUFFER.splice(0, PROGRESS_BUFFER.length);
    for (const item of batch) {
      const { customerId, userId, ...payload } = item;
      await pushProgress(customerId, userId, payload as Parameters<typeof pushProgress>[2])
        .catch(() => undefined);
    }
  }, 1500);
}
