/**
 * Tour-Runtime im Content-Script.
 *
 * - Hält den aktuellen TourStep, prüft Validierung,
 * - rendert Highlight/Modal/Side-Panel-Tipps,
 * - hört auf DOM-/URL-Änderungen via MutationObserver + history-Hooks.
 */

import type { Tour, TourStep, Slide, Branding, StepValidation } from '../lib/types';
import type { RuntimeMessage } from '../lib/messaging';
import { findElement, isElementVisible } from '../lib/selector';
import { showHighlight, hideHighlight, showFloatingTip, setAccentColor } from './highlight';
import { showSlideModal, closeModal } from './modal';

interface RuntimeState {
  tour: Tour | null;
  currentStepId: string | null;
  branding: Branding | null;
  slides: Record<string, Slide>;
  searchTimer: ReturnType<typeof setTimeout> | null;
  validationTimer: ReturnType<typeof setTimeout> | null;
  mutationObserver: MutationObserver | null;
  lastHref: string;
}

const state: RuntimeState = {
  tour: null,
  currentStepId: null,
  branding: null,
  slides: {},
  searchTimer: null,
  validationTimer: null,
  mutationObserver: null,
  lastHref: location.href
};

function currentStep(): TourStep | null {
  if (!state.tour || !state.currentStepId) return null;
  return state.tour.steps.find((s) => s.id === state.currentStepId) ?? null;
}

function nextStep(step: TourStep): TourStep | null {
  if (!state.tour) return null;
  const idx = state.tour.steps.findIndex((s) => s.id === step.id);
  if (step.next) {
    return state.tour.steps.find((s) => s.id === step.next) ?? null;
  }
  return state.tour.steps[idx + 1] ?? null;
}

function failStep(step: TourStep): TourStep | null {
  if (!state.tour) return null;
  if (step.onFail) return state.tour.steps.find((s) => s.id === step.onFail) ?? null;
  return null;
}

async function fetchSlide(slideId: string): Promise<Slide | null> {
  if (state.slides[slideId]) return state.slides[slideId];
  const auth = state.branding?.customerId;
  if (!auth) return null;
  try {
    const res = await chrome.runtime.sendMessage({
      type: 'GET_SLIDE',
      slideId,
      customerId: auth
    } satisfies RuntimeMessage);
    if (res?.ok && res.data) {
      state.slides[slideId] = res.data;
      return res.data;
    }
  } catch {
    return null;
  }
  return null;
}

async function reportProgress(stepId: string, status: 'started' | 'completed' | 'skipped' | 'failed' | 'help'): Promise<void> {
  if (!state.tour) return;
  await chrome.runtime.sendMessage({
    type: 'PROGRESS_EVENT',
    tourId: state.tour.id,
    stepId,
    status
  } satisfies RuntimeMessage).catch(() => undefined);
}

function clearTimers(): void {
  if (state.searchTimer) {
    clearTimeout(state.searchTimer);
    state.searchTimer = null;
  }
  if (state.validationTimer) {
    clearTimeout(state.validationTimer);
    state.validationTimer = null;
  }
}

export async function applyTourState(payload: { tour: Tour | null; currentStepId: string | null; branding: Branding | null; slides?: Record<string, Slide> }): Promise<void> {
  state.tour = payload.tour;
  state.currentStepId = payload.currentStepId;
  state.branding = payload.branding;
  if (payload.slides) state.slides = payload.slides;
  if (state.branding?.accentColor) setAccentColor(state.branding.accentColor);
  if (!state.tour || !state.currentStepId) {
    clearTimers();
    hideHighlight();
    closeModal();
    return;
  }
  await renderCurrentStep();
}

export async function renderCurrentStep(): Promise<void> {
  const step = currentStep();
  if (!step) {
    hideHighlight();
    closeModal();
    return;
  }
  void reportProgress(step.id, 'started');

  if (step.kind === 'theory' && step.slideId) {
    const slide = await fetchSlide(step.slideId);
    if (!slide) {
      showFloatingTip({
        title: 'Folie nicht verfügbar',
        body: 'Die Theorie-Folie konnte nicht geladen werden. Klicke "Weiter", um zum nächsten Schritt zu springen.',
        primaryLabel: 'Weiter',
        onPrimary: () => goToNext(step)
      });
      return;
    }
    if (step.placement === 'sidepanel') {
      showFloatingTip({
        title: slide.title,
        body: extractFirstParagraph(slide),
        primaryLabel: 'Weiter',
        secondaryLabel: 'Mehr',
        onPrimary: () => goToNext(step),
        onSecondary: () => showSlideModal(slide, { onNext: () => goToNext(step) })
      });
    } else {
      showSlideModal(slide, {
        onNext: () => goToNext(step),
        onClose: () => undefined
      });
    }
    return;
  }

  if (step.kind === 'checklist') {
    showFloatingTip({
      title: step.tip?.title ?? 'Geschafft',
      body: step.tip?.body ?? '',
      primaryLabel: 'Tour beenden',
      onPrimary: () => {
        void chrome.runtime.sendMessage({ type: 'STOP_TOUR_LOCAL' } satisfies RuntimeMessage);
      }
    });
    void reportProgress(step.id, 'completed');
    return;
  }

  if (!step.target?.selectors?.length) {
    showFloatingTip({
      title: step.tip?.title ?? 'Hinweis',
      body: step.tip?.body ?? '',
      primaryLabel: 'Weiter',
      onPrimary: () => goToNext(step)
    });
    return;
  }

  await waitForElementAndShow(step);
}

async function waitForElementAndShow(step: TourStep): Promise<void> {
  clearTimers();
  const target = step.target!;
  const timeout = step.validation?.timeoutMs ?? 30000;
  const started = Date.now();
  const tryFind = () => {
    const el = findElement(target.selectors, target.textHint);
    if (el && isElementVisible(el)) {
      showHighlight(el, {
        title: step.tip?.title ?? '',
        body: step.tip?.body ?? '',
        position: step.tip?.placement?.position ?? 'bottom',
        primaryLabel: 'Verstanden',
        secondaryLabel: 'Hilfe',
        onPrimary: () => goToNext(step),
        onSecondary: () => requestHelp(step)
      });
      installValidationListener(step, el);
      return;
    }
    if (Date.now() - started > timeout) {
      showFloatingTip({
        title: 'Element nicht gefunden',
        body: 'Das gesuchte Element ist aktuell nicht sichtbar. Du kannst die Tour fortsetzen oder auf den Hilfe-Schritt wechseln.',
        primaryLabel: 'Trotzdem weiter',
        secondaryLabel: 'Hilfe',
        onPrimary: () => goToNext(step),
        onSecondary: () => requestHelp(step)
      });
      return;
    }
    state.searchTimer = setTimeout(tryFind, 400);
  };
  tryFind();
}

function installValidationListener(step: TourStep, el: HTMLElement): void {
  const v = step.validation;
  if (!v || v.type === 'manual-next') return;
  if (v.type === 'click-target') {
    const onClick = () => {
      el.removeEventListener('click', onClick, true);
      void reportProgress(step.id, 'completed');
      goToNext(step);
    };
    el.addEventListener('click', onClick, true);
    return;
  }
  if (v.type === 'url-contains' || v.type === 'url-equals') {
    const check = () => evaluateUrlValidation(step, v);
    state.validationTimer = setInterval(check, 500) as unknown as ReturnType<typeof setTimeout>;
    return;
  }
  if (v.type === 'element-exists' || v.type === 'element-removed') {
    const check = () => {
      const f = findElement([v.selector ?? ''], undefined);
      if (v.type === 'element-exists' && f) finalize(step, 'completed');
      if (v.type === 'element-removed' && !f) finalize(step, 'completed');
    };
    state.validationTimer = setInterval(check, 500) as unknown as ReturnType<typeof setTimeout>;
    return;
  }
  if (v.type === 'input-equals') {
    const handler = () => {
      const target = el as HTMLInputElement;
      if (target.value === v.value) finalize(step, 'completed');
    };
    el.addEventListener('input', handler);
    el.addEventListener('change', handler);
  }
}

function evaluateUrlValidation(step: TourStep, v: StepValidation): void {
  const ok =
    v.type === 'url-equals'
      ? location.href === v.value
      : location.href.includes(v.value ?? '');
  if (ok) finalize(step, 'completed');
}

function finalize(step: TourStep, result: 'completed' | 'failed' | 'skipped'): void {
  clearTimers();
  void reportProgress(step.id, result);
  if (result === 'completed' || result === 'skipped') {
    goToNext(step);
  } else {
    const help = failStep(step);
    if (help) goToStep(help.id);
  }
}

function goToNext(step: TourStep): void {
  const next = nextStep(step);
  if (next) goToStep(next.id);
  else stopTour();
}

function goToStep(stepId: string): void {
  state.currentStepId = stepId;
  void renderCurrentStep();
}

function requestHelp(step: TourStep): void {
  const help = failStep(step);
  if (help) {
    void reportProgress(step.id, 'help');
    goToStep(help.id);
  }
}

function stopTour(): void {
  clearTimers();
  hideHighlight();
  closeModal();
  void chrome.runtime.sendMessage({ type: 'STOP_TOUR_LOCAL' } satisfies RuntimeMessage);
}

function extractFirstParagraph(slide: Slide): string {
  const text = slide.blocks.find((b) => b.type === 'text');
  if (text?.markdown) return text.markdown.replace(/[*_`#]/g, '').slice(0, 240);
  if (text?.text) return text.text.slice(0, 240);
  return slide.subtitle ?? slide.title;
}

export function startSpaWatcher(): void {
  if (state.mutationObserver) return;
  state.mutationObserver = new MutationObserver(() => {
    if (location.href !== state.lastHref) {
      state.lastHref = location.href;
    }
  });
  state.mutationObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
}
