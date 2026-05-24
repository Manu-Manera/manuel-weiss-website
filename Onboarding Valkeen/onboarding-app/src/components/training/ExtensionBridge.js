/**
 * Bridge zur Browser-Extension. Stellt eine kleine Hook-API bereit, mit der die
 * Authoring- und Trainee-UIs prüfen, ob die Extension installiert ist und
 * Befehle senden können.
 *
 * Die Extension-ID wird als window.__VALKEEN_EXTENSION_ID__ vor dem Mount der App
 * gesetzt (z.B. in apps/web Layout oder via /onboarding/index.html). In Entwicklung
 * kann sie auch via VITE_VALKEEN_EXTENSION_ID gesetzt werden – wir schreiben dann
 * window.__VALKEEN_EXTENSION_ID__ beim Modul-Init.
 */

import { useEffect, useState, useCallback } from 'react';
import {
  pingExtension,
  pushAuthToExtension,
  startTourViaExtension,
  getRecorderSteps,
  getAuth
} from '../../services/trainingAdminService';

if (typeof window !== 'undefined' && !window.__VALKEEN_EXTENSION_ID__) {
  const fromEnv = import.meta?.env?.VITE_VALKEEN_EXTENSION_ID;
  if (fromEnv) window.__VALKEEN_EXTENSION_ID__ = fromEnv;
}

export function useExtensionStatus() {
  const [installed, setInstalled] = useState(null);
  const [version, setVersion] = useState(null);

  const refresh = useCallback(async () => {
    const res = await pingExtension();
    if (res?.ok) {
      setInstalled(true);
      setVersion(res.data?.version || null);
    } else {
      setInstalled(false);
      setVersion(null);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { installed, version, refresh };
}

export async function syncAuthToExtension() {
  const auth = getAuth();
  if (!auth) return false;
  return pushAuthToExtension(auth);
}

export async function startTour(tourId, customerId) {
  const synced = await syncAuthToExtension();
  if (!synced) return { ok: false, reason: 'auth_not_synced' };
  const ok = await startTourViaExtension(tourId, customerId);
  return { ok, reason: ok ? null : 'extension_failed' };
}

export async function fetchRecorderSteps() {
  return getRecorderSteps();
}

/** Unter Vite <code>base: '/onboarding/'</code> – echte HTML im Public-Ordner */
export const EXTENSION_INSTALL_DOC = `${import.meta.env.BASE_URL || '/'}extension-install.html`;
