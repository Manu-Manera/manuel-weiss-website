import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

function App() {
  const [authState, setAuthState] = useState('checking');

  useEffect(() => {
    if (checkAdminSession()) {
      setAuthState('ok');
    } else {
      setAuthState('redirect');
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

  if (authState === 'redirect') {
    window.location.href = '/admin-login.html?redirect=' + encodeURIComponent('/onboarding/');
    return null;
  }

  return (
    <BrowserRouter basename="/onboarding">
      <Routes>
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
    </BrowserRouter>
  );
}

export default App;
