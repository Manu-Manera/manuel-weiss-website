/**
 * Side Panel: zeigt aktive Tour, Schritt-Liste, Fortschritt.
 *
 * Liest live aus dem Service Worker via GET_ACTIVE_TOUR und reagiert auf TOUR_STATE-Broadcasts.
 */

import React, { useEffect, useState, useCallback } from 'react';
import type { Tour, Branding } from '../lib/types';
import type { RuntimeMessage } from '../lib/messaging';

interface ActiveData {
  tour: Tour | null;
  currentStepId: string | null;
  branding: Branding | null;
}

export function App(): JSX.Element {
  const [data, setData] = useState<ActiveData>({ tour: null, currentStepId: null, branding: null });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await chrome.runtime.sendMessage({ type: 'GET_ACTIVE_TOUR' } satisfies RuntimeMessage).catch(() => null);
    if (res?.ok && res.data) {
      setData({
        tour: res.data.tour,
        currentStepId: res.data.currentStepId,
        branding: res.data.branding
      });
    } else {
      setData({ tour: null, currentStepId: null, branding: null });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
    const listener = (msg: RuntimeMessage) => {
      if (msg.type === 'TOUR_STATE') {
        setData({
          tour: msg.tour,
          currentStepId: msg.currentStepId,
          branding: msg.branding
        });
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [refresh]);

  const stop = async () => {
    await chrome.runtime.sendMessage({ type: 'STOP_TOUR_LOCAL' } satisfies RuntimeMessage);
    await refresh();
  };

  const accent = data.branding?.accentColor ?? '#6366f1';

  if (loading) {
    return (
      <div className="sp-root">
        <header className="sp-header">
          <h1>Valkeen Tempus Trainer</h1>
          <p>Lade…</p>
        </header>
      </div>
    );
  }

  if (!data.tour) {
    return (
      <div className="sp-root">
        <header className="sp-header">
          <h1>Valkeen Tempus Trainer</h1>
          <p>Bereit für Tempus-Training</p>
        </header>
        <div className="sp-empty">
          Aktuell läuft keine Tour.
          <br />
          <br />
          Öffne das <strong>Onboarding-Hub</strong> (manuel-weiss.ch/onboarding) und starte eine Tour, oder klicke auf das Extension-Icon, um eine Tour direkt zu wählen.
        </div>
      </div>
    );
  }

  const currentIdx = data.tour.steps.findIndex((s) => s.id === data.currentStepId);
  const total = data.tour.steps.length;
  const completed = currentIdx === -1 ? 0 : currentIdx;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="sp-root">
      <header className="sp-header">
        <span className="sp-badge" style={{ color: accent, borderColor: `${accent}55`, background: `${accent}22` }}>
          {data.branding?.customerName ?? 'Tour'}
        </span>
        <h1>{data.tour.title}</h1>
        <p>
          Schritt {Math.max(currentIdx + 1, 1)} von {total}
        </p>
        <div className="sp-progress">
          <div className="sp-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className="sp-section">
        <h2>Schritte</h2>
        {data.tour.steps.map((step, i) => {
          const active = step.id === data.currentStepId;
          const done = currentIdx > -1 && i < currentIdx;
          return (
            <div key={step.id} className={`sp-step ${active ? 'active' : ''} ${done ? 'done' : ''}`}>
              <div className="num">{i + 1}</div>
              <div>
                <strong>{labelForKind(step.kind)}</strong>
                <div style={{ color: 'rgba(255,255,255,.65)', fontSize: 12, marginTop: 2 }}>
                  {step.tip?.title ?? step.slideId ?? step.id}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="sp-actions">
        <button className="sp-btn sp-btn-ghost" onClick={() => void stop()}>Tour beenden</button>
      </div>
    </div>
  );
}

function labelForKind(kind: string): string {
  switch (kind) {
    case 'theory': return 'Theorie';
    case 'highlight': return 'Hinweis';
    case 'click': return 'Klick';
    case 'input': return 'Eingabe';
    case 'wait': return 'Warten';
    case 'quiz': return 'Quiz';
    case 'checklist': return 'Abschluss';
    default: return kind;
  }
}
