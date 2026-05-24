/**
 * Popup (Browser-Action). Zeigt:
 *  - Auth-Status (eingeloggt / nicht eingeloggt)
 *  - Aktive Tour (falls vorhanden) mit "Stop"
 *  - Recorder-Toggle
 *  - Link zum Onboarding-Hub
 */

import React, { useCallback, useEffect, useState } from 'react';
import type { AuthState, Tour } from '../lib/types';
import type { RuntimeMessage } from '../lib/messaging';

const HUB_PROD = 'https://manuel-weiss.ch/onboarding/training';
const HUB_LOCAL = 'http://localhost:3000/onboarding/training';

export function App(): JSX.Element {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [activeTour, setActiveTour] = useState<Tour | null>(null);
  const [recorderOn, setRecorderOn] = useState(false);
  const [recordingCount, setRecordingCount] = useState(0);

  const loadAll = useCallback(async () => {
    const a = await chrome.runtime.sendMessage({ type: 'GET_AUTH' } satisfies RuntimeMessage);
    if (a?.ok) setAuth(a.data as AuthState);
    const at = await chrome.runtime.sendMessage({ type: 'GET_ACTIVE_TOUR' } satisfies RuntimeMessage);
    if (at?.ok && at.data?.tour) setActiveTour(at.data.tour as Tour);
    else setActiveTour(null);
    const rec = await chrome.storage.local.get(['recorderOn', 'recorder']);
    setRecorderOn(!!rec.recorderOn);
    setRecordingCount(Array.isArray(rec.recorder) ? rec.recorder.length : 0);
  }, []);

  useEffect(() => {
    void loadAll();
    const interval = setInterval(loadAll, 1500);
    return () => clearInterval(interval);
  }, [loadAll]);

  const stopTour = async () => {
    await chrome.runtime.sendMessage({ type: 'STOP_TOUR_LOCAL' } satisfies RuntimeMessage);
    await loadAll();
  };

  const toggleRecorder = async () => {
    await chrome.runtime.sendMessage({ type: 'TOGGLE_RECORDER', on: !recorderOn } satisfies RuntimeMessage);
    await loadAll();
  };

  const clearRecorder = async () => {
    await chrome.runtime.sendMessage({ type: 'RECORDER_CLEAR_STEPS' } satisfies RuntimeMessage);
    await loadAll();
  };

  const openHub = (url: string) => {
    void chrome.tabs.create({ url });
    window.close();
  };

  const isLoggedIn = !!auth?.token && !!auth?.customerId;

  return (
    <div className="pop-root">
      <header className="pop-header">
        <div className="logo" />
        <div>
          <h1>Valkeen Tempus Trainer</h1>
          <p>Version {chrome.runtime.getManifest().version}</p>
        </div>
      </header>

      <section className="pop-section">
        <div className="pop-status">
          <div className={`dot ${isLoggedIn ? '' : 'off'}`} />
          {isLoggedIn ? `Eingeloggt als ${auth!.userId} (${auth!.customerId})` : 'Nicht eingeloggt'}
        </div>
      </section>

      {activeTour ? (
        <section className="pop-section">
          <div className="pop-label">Aktive Tour</div>
          <div className="pop-card">
            <strong>{activeTour.title}</strong>
            <div style={{ color: 'rgba(255,255,255,.55)', marginTop: 4 }}>
              {activeTour.steps.length} Schritte
            </div>
          </div>
          <button className="pop-btn pop-btn-ghost" style={{ marginTop: 8 }} onClick={() => void stopTour()}>
            Tour beenden
          </button>
        </section>
      ) : (
        <section className="pop-section">
          <div className="pop-label">Tour starten</div>
          <button className="pop-btn pop-btn-primary" onClick={() => openHub(HUB_PROD)}>
            Onboarding-Hub (manuel-weiss.ch)
          </button>
          <button className="pop-btn pop-btn-ghost" style={{ marginTop: 8 }} onClick={() => openHub(HUB_LOCAL)}>
            Onboarding-Hub (localhost:3000)
          </button>
          <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,.5)', margin: '6px 0 0' }}>
            Wähle dort eine Tour, sie startet automatisch im aktiven Tempus-Tab.
          </p>
        </section>
      )}

      <section className="pop-section">
        <div className="pop-label">Trainer-Modus</div>
        <button className={`pop-btn ${recorderOn ? 'pop-btn-danger' : 'pop-btn-ghost'}`} onClick={() => void toggleRecorder()}>
          {recorderOn ? `Aufnahme stoppen (${recordingCount} Schritte)` : 'Aufnahme starten'}
        </button>
        {recordingCount > 0 && !recorderOn && (
          <button className="pop-btn pop-btn-ghost" onClick={() => void clearRecorder()}>
            Aufnahme verwerfen
          </button>
        )}
        {recordingCount > 0 && (
          <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,.5)', margin: '6px 0 0' }}>
            {recordingCount} Schritt(e) aufgezeichnet. Importiere sie im Authoring-Editor.
          </p>
        )}
      </section>
    </div>
  );
}
