import { useState, useCallback, useEffect } from 'react';
import { useAppStore } from './store';
import * as api from './api';
import Layout from './components/Layout';
import AdminLogin from './components/AdminLogin';
import PrivacyConsent from './components/PrivacyConsent';
import SettingsPanel from './components/SettingsPanel';
import FileUpload from './components/FileUpload';
import AnalysisView from './components/AnalysisView';
import MappingReview from './components/MappingReview';
import ValidationPanel from './components/ValidationPanel';
import ExportPanel from './components/ExportPanel';

const SESSION_KEY = 'admin_auth_session';

function checkAdminSession(): boolean {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return false;
    const session = JSON.parse(stored);
    const expiresAt = session.expiresAt ? new Date(session.expiresAt) : null;
    if (expiresAt && expiresAt < new Date()) return false;
    const idToken = session.user?.idToken || session.idToken;
    if (!idToken) return false;
    const base64 = idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    const groups = (payload['cognito:groups'] as string[]) || [];
    return groups.includes('admin');
  } catch {
    return false;
  }
}

const STEPS = [
  { id: 0, label: 'Konfiguration', key: 'settings' },
  { id: 1, label: 'Excel Upload', key: 'upload' },
  { id: 2, label: 'Analyse & Tempus-Sync', key: 'analysis' },
  { id: 3, label: 'Mapping Review', key: 'mapping' },
  { id: 4, label: 'Validierung', key: 'validation' },
  { id: 5, label: 'Export', key: 'export' },
];

export default function App() {
  const currentStep = useAppStore((s) => s.currentStep);
  const [authState, setAuthState] = useState<'checking' | 'login' | 'ok'>('checking');
  const [consentGiven, setConsentGiven] = useState(false);
  const [aiConsented, setAiConsented] = useState(false);

  useEffect(() => {
    setAuthState(checkAdminSession() ? 'ok' : 'login');
  }, []);

  const handleConsent = useCallback(async (aiProcessing: boolean) => {
    setConsentGiven(true);
    setAiConsented(aiProcessing);

    try {
      await fetch('/api/privacy/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'pre-session',
          privacyAccepted: true,
          aiProcessingAccepted: aiProcessing,
        }),
      });
    } catch {
      // Consent wird auch lokal gehalten
    }
  }, []);

  if (authState === 'checking') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔐</div>
          <div>Authentifizierung wird geprüft…</div>
        </div>
      </div>
    );
  }

  if (authState === 'login') {
    return <AdminLogin onSuccess={() => setAuthState('ok')} />;
  }

  if (!consentGiven) {
    return <PrivacyConsent onAccept={handleConsent} />;
  }

  function renderStep() {
    switch (currentStep) {
      case 0: return <SettingsPanel />;
      case 1: return <FileUpload />;
      case 2: return <AnalysisView />;
      case 3: return <MappingReview />;
      case 4: return <ValidationPanel />;
      case 5: return <ExportPanel />;
      default: return <SettingsPanel />;
    }
  }

  return (
    <Layout steps={STEPS} currentStep={currentStep}>
      {renderStep()}
    </Layout>
  );
}
