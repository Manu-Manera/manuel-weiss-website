import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tracker from './pages/Tracker';
import Quiz from './pages/Quiz';
import AICoach from './pages/AICoach';
import Calendar from './pages/Calendar';
import Resources from './pages/Resources';
import Report from './pages/Report';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="tracker" element={<Tracker />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="ai-coach" element={<AICoach />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="resources" element={<Resources />} />
          <Route path="report" element={<Report />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
