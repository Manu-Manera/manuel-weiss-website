import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tracker from './pages/Tracker';
import Quiz from './pages/Quiz';
import AICoach from './pages/AICoach';
import Calendar from './pages/Calendar';
import Resources from './pages/Resources';
import Report from './pages/Report';
import Training from './pages/Training';
import TrainingAdmin from './pages/TrainingAdmin';
import Flashcards from './pages/Flashcards';
import SSOSetup from './pages/SSOSetup';
import TempusDemo from './pages/TempusDemo';
import LoginMailer from './pages/LoginMailer';
import ChangeWorkflow from './pages/ChangeWorkflow';
import KotterTilePage from './pages/KotterTilePage';
import WorkshopTools from './pages/WorkshopTools';
import ChangeJourney from './pages/ChangeJourney';
import PhaseTilePage from './pages/PhaseTilePage';
import StakeholderAnalysis from './pages/StakeholderAnalysis';
import CommunicationPlan from './pages/CommunicationPlan';
import ChangeDashboard from './pages/ChangeDashboard';
import JourneyPublicShell from './pages/JourneyPublicShell';
import KotterPublicShareShell from './pages/KotterPublicShareShell';
import WorkshopPrepPublicShell from './pages/WorkshopPrepPublicShell';
import LegacyChangeWorkflowRedirect from './pages/LegacyChangeWorkflowRedirect';
import { ProgressProvider } from './hooks/useLocalStorage';

function checkAdminSession() {
  try {
    const stored = localStorage.getItem('admin_auth_session');
    if (!stored) return false;
    const session = JSON.parse(stored);
    const expiresAt = session.expiresAt ? new Date(session.expiresAt) : null;
    if (expiresAt && expiresAt < new Date()) return false;
    const idToken = session.user?.idToken || session.idToken;
    if (!idToken) return false;
    const base64 = idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    const groups = payload['cognito:groups'] || [];
    return groups.includes('admin');
  } catch {
    return false;
  }
}

/** Öffentlicher Kotter-Share liegt außerhalb der Admin-/Progress-Sitzung — zuerst in den Routes erwischen. */
function AdminProgressRoutes() {
  const location = useLocation();

  if (!checkAdminSession()) {
    window.location.replace(
      '/admin-login.html?redirect=' + encodeURIComponent(`/onboarding${location.pathname}${location.search}`)
    );
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-500 text-sm">
        Weiterleitung zur Anmeldung…
      </div>
    );
  }

  return (
    <ProgressProvider>
      <Routes>
        <Route path="change-workflow/kotter/:slug" element={<KotterTilePage />} />
        <Route path="change-workflow/tools" element={<WorkshopTools />} />
        <Route path="change-workflow/journey" element={<ChangeJourney />} />
        <Route path="change-workflow/phase/:phaseId" element={<PhaseTilePage />} />
        <Route path="change-workflow/stakeholders" element={<StakeholderAnalysis />} />
        <Route path="change-workflow/comms-plan" element={<CommunicationPlan />} />
        <Route path="change-workflow/dashboard" element={<ChangeDashboard />} />
        <Route path="change-workflow/teilnehmer" element={<ChangeWorkflow />} />
        <Route path="change-workflow" element={<ChangeWorkflow />} />
        <Route path="login-mailer/change-workflow" element={<LegacyChangeWorkflowRedirect />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="tracker" element={<Tracker />} />
          <Route path="flashcards" element={<Flashcards />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="ai-coach" element={<AICoach />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="resources" element={<Resources />} />
          <Route path="report" element={<Report />} />
          <Route path="training" element={<Training />} />
          <Route path="training-admin" element={<TrainingAdmin />} />
          <Route path="sso-setup" element={<SSOSetup />} />
          <Route path="tempus-demo" element={<TempusDemo />} />
          <Route path="login-mailer" element={<LoginMailer />} />
        </Route>
      </Routes>
    </ProgressProvider>
  );
}

function App() {
  return (
    <BrowserRouter basename="/onboarding">
      <Routes>
        <Route path="kotter-share/:shareId/*" element={<KotterPublicShareShell />} />
        <Route path="workshop-prep/:shareId" element={<WorkshopPrepPublicShell />} />
        <Route path="journey-share/:shareId" element={<JourneyPublicShell />} />
        <Route path="*" element={<AdminProgressRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
