import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { isKickoffShortHost } from './kickoff/kickoffTenants';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import { ProgressProvider } from './hooks/useLocalStorage';

const Tracker = lazy(() => import('./pages/Tracker'));
const Tagesvertrag = lazy(() => import('./pages/Tagesvertrag'));
const FeedbackFramework = lazy(() => import('./pages/FeedbackFramework'));
const Quiz = lazy(() => import('./pages/Quiz'));
const AICoach = lazy(() => import('./pages/AICoach'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Resources = lazy(() => import('./pages/Resources'));
const Report = lazy(() => import('./pages/Report'));
const Training = lazy(() => import('./pages/Training'));
const TrainingAdmin = lazy(() => import('./pages/TrainingAdmin'));
const TempusTrainerAdmin = lazy(() => import('./pages/TempusTrainerAdmin'));
const TempusTrainerHub = lazy(() => import('./pages/TempusTrainerHub'));
const MouseAutomation = lazy(() => import('./pages/MouseAutomation'));
const Flashcards = lazy(() => import('./pages/Flashcards'));
const SSOSetup = lazy(() => import('./pages/SSOSetup'));
const TempusDemo = lazy(() => import('./pages/TempusDemo'));
const KickoffStudio = lazy(() => import('./pages/KickoffStudio'));
const ImplementationGuide = lazy(() => import('./pages/ImplementationGuide'));
const ImplementationPlan = lazy(() => import('./pages/ImplementationPlan'));
const ImplementationLog = lazy(() => import('./pages/ImplementationLog'));
const LoginMailer = lazy(() => import('./pages/LoginMailer'));
const QrgBuilder = lazy(() => import('./pages/QrgBuilder'));
const ChangeWorkflow = lazy(() => import('./pages/ChangeWorkflow'));
const KotterTilePage = lazy(() => import('./pages/KotterTilePage'));
const WorkshopTools = lazy(() => import('./pages/WorkshopTools'));
const ChangeJourney = lazy(() => import('./pages/ChangeJourney'));
const PhaseTilePage = lazy(() => import('./pages/PhaseTilePage'));
const StakeholderAnalysis = lazy(() => import('./pages/StakeholderAnalysis'));
const CommunicationPlan = lazy(() => import('./pages/CommunicationPlan'));
const ChangeDashboard = lazy(() => import('./pages/ChangeDashboard'));
const JourneyPublicShell = lazy(() => import('./pages/JourneyPublicShell'));
const KotterPublicShareShell = lazy(() => import('./pages/KotterPublicShareShell'));
const WorkshopPrepPublicShell = lazy(() => import('./pages/WorkshopPrepPublicShell'));
const KickoffPresenter = lazy(() => import('./pages/KickoffPresenter'));
const KickoffPrepPublicShell = lazy(() => import('./pages/KickoffPrepPublicShell'));
const LegacyChangeWorkflowRedirect = lazy(() => import('./pages/LegacyChangeWorkflowRedirect'));

function PageLoader() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

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
      <Suspense fallback={<PageLoader />}>
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
            <Route path="tagesvertrag" element={<Tagesvertrag />} />
            <Route path="feedback-framework" element={<FeedbackFramework />} />
            <Route path="flashcards" element={<Flashcards />} />
            <Route path="quiz" element={<Quiz />} />
            <Route path="ai-coach" element={<AICoach />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="resources" element={<Resources />} />
            <Route path="report" element={<Report />} />
            <Route path="training" element={<Training />} />
            <Route path="training-admin" element={<TrainingAdmin />} />
            <Route path="tempus-trainer" element={<TempusTrainerHub />} />
            <Route path="mouse-automation" element={<MouseAutomation />} />
            <Route path="tempus-trainer-admin" element={<TempusTrainerAdmin />} />
            <Route path="sso-setup" element={<SSOSetup />} />
            <Route path="tempus-demo" element={<TempusDemo />} />
            <Route path="kickoff-studio" element={<KickoffStudio />} />
            <Route path="implementation-studio" element={<ImplementationGuide />} />
            <Route path="implementation-guide" element={<ImplementationGuide />} />
            <Route path="implementation-plan" element={<ImplementationPlan />} />
            <Route path="implementation-log" element={<ImplementationLog />} />
            <Route path="login-mailer" element={<LoginMailer />} />
            <Route path="qrg-builder" element={<QrgBuilder />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </ProgressProvider>
  );
}

function KickoffShortHostFallback() {
  const { search } = useLocation();
  return <Navigate to={{ pathname: '/', search }} replace />;
}

function KickoffShortHostRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<KickoffPresenter />} />
        <Route path="*" element={<KickoffShortHostFallback />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  const shortKickoff = typeof window !== 'undefined' && isKickoffShortHost(window.location.hostname);

  if (shortKickoff) {
    return (
      <BrowserRouter>
        <KickoffShortHostRoutes />
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter basename="/onboarding">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="kotter-share/:shareId/*" element={<KotterPublicShareShell />} />
          <Route path="workshop-prep/:shareId" element={<WorkshopPrepPublicShell />} />
          <Route path="kickoff-prep/:prepId/fragebogen" element={<KickoffPrepPublicShell />} />
          <Route path="kickoff-prep/:prepId" element={<KickoffPrepPublicShell />} />
          <Route path="kickoff-presenter/:tenantSlug?" element={<KickoffPresenter />} />
          <Route path="journey-share/:shareId" element={<JourneyPublicShell />} />
          <Route path="*" element={<AdminProgressRoutes />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
