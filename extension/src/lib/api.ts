/**
 * API-Client für die Training-Admin-API (AWS Lambda).
 *
 * Liest aus dem Service-Worker mit Bearer-Token. Bei 401/Token-Ablauf wird
 * AuthState gelöscht und null zurückgegeben (UI fragt dann nach Re-Login).
 */

import type { Tour, Slide, Branding, CustomerIndex } from './types';
import { Storage } from './storage';

export const API_BASE = 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1';

async function authedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const auth = await Storage.getAuth();
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (auth.token) headers.set('Authorization', `Bearer ${auth.token}`);
  if (auth.customerId) headers.set('X-Customer-Id', auth.customerId);
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (res.status === 401) {
    await Storage.clearAuth();
  }
  return res;
}

export async function fetchCustomerIndex(): Promise<CustomerIndex | null> {
  try {
    const res = await fetch(`${API_BASE}/training-admin/customers/index`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchBranding(customerId: string): Promise<Branding | null> {
  try {
    const res = await authedFetch(`/training-admin/customers/${customerId}/branding`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchTours(customerId: string): Promise<Tour[]> {
  try {
    const res = await authedFetch(`/training-admin/customers/${customerId}/tours`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.tours ?? [];
  } catch {
    return [];
  }
}

export async function fetchTour(customerId: string, tourId: string): Promise<Tour | null> {
  try {
    const res = await authedFetch(`/training-admin/customers/${customerId}/tours/${tourId}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchSlide(customerId: string, slideId: string): Promise<Slide | null> {
  try {
    const res = await authedFetch(`/training-admin/customers/${customerId}/slides/${slideId}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function pushProgress(
  customerId: string,
  userId: string,
  payload: { tourId: string; stepId: string; status: string; meta?: Record<string, unknown> }
): Promise<boolean> {
  try {
    const res = await authedFetch(`/training-admin/customers/${customerId}/progress/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ ...payload, timestamp: new Date().toISOString() })
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Holt aus localStorage / API: Tour mit allen referenzierten Slides vorgeladen.
 */
export async function loadTourBundle(customerId: string, tourId: string): Promise<{
  tour: Tour | null;
  slides: Record<string, Slide>;
  branding: Branding | null;
}> {
  const [cached, branding] = await Promise.all([
    Storage.getTour(customerId, tourId),
    Storage.getBranding(customerId).then((b) => b ?? fetchBranding(customerId))
  ]);

  let tour: Tour | null = cached ?? null;
  if (!tour) {
    tour = await fetchTour(customerId, tourId);
    if (tour) await Storage.setTour(tour);
  }

  const slides: Record<string, Slide> = {};
  if (tour) {
    const slideIds = Array.from(
      new Set(tour.steps.map((s) => s.slideId).filter((x): x is string => !!x))
    );
    await Promise.all(
      slideIds.map(async (sid) => {
        let slide = await Storage.getSlide(customerId, sid);
        if (!slide) {
          const fetched = await fetchSlide(customerId, sid);
          if (fetched) {
            await Storage.setSlide(fetched);
            slide = fetched;
          }
        }
        if (slide) slides[sid] = slide;
      })
    );
  }

  if (branding) await Storage.setBranding(branding);
  return { tour, slides, branding };
}
