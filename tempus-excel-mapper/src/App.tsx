import { useState, useCallback } from 'react';
import { useAppStore } from './store';
import * as api from './api';
import Layout from './components/Layout';
import PrivacyConsent from './components/PrivacyConsent';
import SettingsPanel from './components/SettingsPanel';
import FileUpload from './components/FileUpload';
import AnalysisView from './components/AnalysisView';
import MappingReview from './components/MappingReview';
import ValidationPanel from './components/ValidationPanel';
import ExportPanel from './components/ExportPanel';

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
  const [consentGiven, setConsentGiven] = useState(false);
  const [aiConsented, setAiConsented] = useState(false);

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
