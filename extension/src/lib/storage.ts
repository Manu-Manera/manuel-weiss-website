/**
 * Wrapper um chrome.storage.local + .session (typisiert, async, defaults).
 *
 * - local:   Auth, Cache (Touren/Slides), Recorder-Buffer, Customer-Index
 * - session: aktive Tour-Session pro Browser-Session
 */

import type { Tour, Slide, Branding, RecorderStep, AuthState, CustomerIndex } from './types';

const KEYS = {
  AUTH: 'auth',
  CUSTOMER_INDEX: 'customerIndex',
  TOURS_PREFIX: 'tour:',          // tour:<customerId>:<tourId>
  SLIDES_PREFIX: 'slide:',        // slide:<customerId>:<slideId>
  BRANDING_PREFIX: 'branding:',   // branding:<customerId>
  RECORDER: 'recorder',
  RECORDER_ON: 'recorderOn',
  ACTIVE_TOUR: 'activeTour',      // session
  CURRENT_STEP: 'currentStep'     // session
} as const;

export const StorageKeys = KEYS;

async function getLocal<T>(key: string): Promise<T | undefined> {
  const result = await chrome.storage.local.get(key);
  return result[key] as T | undefined;
}

async function setLocal(key: string, value: unknown): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

async function removeLocal(key: string | string[]): Promise<void> {
  await chrome.storage.local.remove(key);
}

async function getSession<T>(key: string): Promise<T | undefined> {
  if (!chrome.storage.session) return undefined;
  const result = await chrome.storage.session.get(key);
  return result[key] as T | undefined;
}

async function setSession(key: string, value: unknown): Promise<void> {
  if (!chrome.storage.session) return;
  await chrome.storage.session.set({ [key]: value });
}

export const Storage = {
  async getAuth(): Promise<AuthState> {
    const auth = await getLocal<AuthState>(KEYS.AUTH);
    return auth ?? { token: null, customerId: null, userId: null, role: null, expiresAt: null };
  },
  async setAuth(auth: AuthState): Promise<void> {
    await setLocal(KEYS.AUTH, auth);
  },
  async clearAuth(): Promise<void> {
    await removeLocal(KEYS.AUTH);
  },

  async getCustomerIndex(): Promise<CustomerIndex | undefined> {
    return getLocal<CustomerIndex>(KEYS.CUSTOMER_INDEX);
  },
  async setCustomerIndex(idx: CustomerIndex): Promise<void> {
    await setLocal(KEYS.CUSTOMER_INDEX, idx);
  },

  async getTour(customerId: string, tourId: string): Promise<Tour | undefined> {
    return getLocal<Tour>(`${KEYS.TOURS_PREFIX}${customerId}:${tourId}`);
  },
  async setTour(tour: Tour): Promise<void> {
    await setLocal(`${KEYS.TOURS_PREFIX}${tour.customerId}:${tour.id}`, tour);
  },

  async getSlide(customerId: string, slideId: string): Promise<Slide | undefined> {
    return getLocal<Slide>(`${KEYS.SLIDES_PREFIX}${customerId}:${slideId}`);
  },
  async setSlide(slide: Slide): Promise<void> {
    await setLocal(`${KEYS.SLIDES_PREFIX}${slide.customerId}:${slide.id}`, slide);
  },

  async getBranding(customerId: string): Promise<Branding | undefined> {
    return getLocal<Branding>(`${KEYS.BRANDING_PREFIX}${customerId}`);
  },
  async setBranding(branding: Branding): Promise<void> {
    await setLocal(`${KEYS.BRANDING_PREFIX}${branding.customerId}`, branding);
  },

  async getRecorderOn(): Promise<boolean> {
    return (await getLocal<boolean>(KEYS.RECORDER_ON)) ?? false;
  },
  async setRecorderOn(on: boolean): Promise<void> {
    await setLocal(KEYS.RECORDER_ON, on);
  },
  async getRecorderSteps(): Promise<RecorderStep[]> {
    return (await getLocal<RecorderStep[]>(KEYS.RECORDER)) ?? [];
  },
  async pushRecorderStep(step: RecorderStep): Promise<void> {
    const arr = await this.getRecorderSteps();
    arr.push(step);
    await setLocal(KEYS.RECORDER, arr);
  },
  async clearRecorderSteps(): Promise<void> {
    await removeLocal(KEYS.RECORDER);
  },

  async getActiveTour(): Promise<{ tourId: string; customerId: string } | undefined> {
    return getSession<{ tourId: string; customerId: string }>(KEYS.ACTIVE_TOUR);
  },
  async setActiveTour(active: { tourId: string; customerId: string } | null): Promise<void> {
    if (!active) await chrome.storage.session?.remove(KEYS.ACTIVE_TOUR);
    else await setSession(KEYS.ACTIVE_TOUR, active);
  },

  async getCurrentStep(): Promise<string | undefined> {
    return getSession<string>(KEYS.CURRENT_STEP);
  },
  async setCurrentStep(stepId: string | null): Promise<void> {
    if (!stepId) await chrome.storage.session?.remove(KEYS.CURRENT_STEP);
    else await setSession(KEYS.CURRENT_STEP, stepId);
  }
};
