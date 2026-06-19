import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Lock, Loader2 } from 'lucide-react';
import '../styles/kickoff-brand.css';
import '../styles/kickoff-studio.css';
import '../styles/kickoff-prep.css';
import { KickoffPrepProvider, readPrepAuth, storePrepAuth } from '../context/KickoffPrepContext';
import { isValidPrepId, hasSeenWelcome, markWelcomeSeen } from '../kickoff/kickoffPrepShare';
import { fetchPrepPublic } from '../kickoff/kickoffPrepService';
import KickoffPrepWelcome from '../kickoff/KickoffPrepWelcome';
import KickoffPrepQuestionnaire from '../kickoff/KickoffPrepQuestionnaire';
import { uiPrep } from '../kickoff/kickoffPrepI18n';
import { normalizePrepRecord } from '../kickoff/kickoffPrepShare';

function PrepPasswordGate({ prepId, locale, onAuthed }) {
  const t = (k) => uiPrep(locale, k);
  const [pw, setPw] = useState(readPrepAuth(prepId));
  const [err, setErr] = useState('');
  const [checking, setChecking] = useState(false);

  const tryAuth = async (e) => {
    e?.preventDefault();
    setChecking(true);
    setErr('');
    try {
      const raw = await fetchPrepPublic(prepId, pw);
      if (!raw) {
        setErr(t('prepNotFound'));
        return;
      }
      storePrepAuth(prepId, pw);
      onAuthed(normalizePrepRecord(raw));
    } catch (ex) {
      if (ex.message === 'PREP_AUTH_INVALID') setErr(t('prepPasswordWrong'));
      else setErr(ex.message || t('prepNotFound'));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="kickoff-prep-page">
      <main className="kickoff-prep-welcome-main">
        <form className="kickoff-prep-welcome-card" onSubmit={tryAuth}>
          <Lock className="w-10 h-10 text-[#7dffd4] mx-auto" />
          <h1 className="kickoff-prep-welcome-title text-center">{t('prepPasswordTitle')}</h1>
          <p className="kickoff-prep-welcome-sub text-center">{t('prepPasswordHint')}</p>
          <input
            type="password"
            className="kickoff-input kickoff-prep-input"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoComplete="current-password"
          />
          {err && <p className="text-sm text-amber-300 text-center">{err}</p>}
          <button type="submit" className="kickoff-btn-primary w-full" disabled={checking || !pw}>
            {checking ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t('prepPasswordSubmit')}
          </button>
        </form>
      </main>
    </div>
  );
}

function PrepFlow({ forceQuestionnaire }) {
  const { prepId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const prepPassword = readPrepAuth(prepId);
  const [bootPrep, setBootPrep] = useState(null);
  const [bootLoading, setBootLoading] = useState(true);
  const [bootErr, setBootErr] = useState('');

  const skipWelcome =
    forceQuestionnaire ||
    location.pathname.endsWith('/fragebogen') ||
    hasSeenWelcome(prepId);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setBootLoading(true);
      try {
        const raw = await fetchPrepPublic(prepId, prepPassword);
        if (!raw) {
          if (!cancelled) setBootErr('NOT_FOUND');
          return;
        }
        const norm = normalizePrepRecord(raw);
        if (norm.access?.status === 'draft') {
          if (!cancelled) setBootErr('NOT_RELEASED');
          return;
        }
        if (norm.access?.requiresPassword && !prepPassword) {
          if (!cancelled) setBootErr('AUTH');
          return;
        }
        if (!cancelled) setBootPrep(norm);
      } catch (e) {
        if (!cancelled) {
          if (e.message === 'PREP_AUTH_REQUIRED') setBootErr('AUTH');
          else if (e.message === 'PREP_AUTH_INVALID') setBootErr('AUTH_INVALID');
          else setBootErr(e.message || 'LOAD');
        }
      } finally {
        if (!cancelled) setBootLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [prepId, prepPassword]);

  if (bootLoading) {
    return (
      <div className="kickoff-prep-page flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#00a878]" />
      </div>
    );
  }

  if (bootErr === 'AUTH') {
    return (
      <PrepPasswordGate
        prepId={prepId}
        locale="de"
        onAuthed={(p) => {
          setBootPrep(p);
          setBootErr('');
        }}
      />
    );
  }

  if (bootErr === 'NOT_FOUND' || bootErr === 'NOT_RELEASED') {
    const locale = 'de';
    const t = (k) => uiPrep(locale, k);
    return (
      <div className="kickoff-prep-page flex items-center justify-center min-h-[50vh] p-6">
        <p className="text-center text-white/80">
          {bootErr === 'NOT_RELEASED' ? t('prepNotReleased') : t('prepNotFound')}
        </p>
      </div>
    );
  }

  if (!bootPrep) {
    return null;
  }

  const goToForm = () => {
    markWelcomeSeen(prepId);
    navigate(`/kickoff-prep/${prepId}/fragebogen`, { replace: true });
  };

  if (!skipWelcome) {
    return <KickoffPrepWelcome prep={bootPrep} onContinue={goToForm} />;
  }

  return (
    <KickoffPrepProvider prepId={prepId} prepPassword={prepPassword}>
      <KickoffPrepQuestionnaire />
    </KickoffPrepProvider>
  );
}

export default function KickoffPrepPublicShell() {
  const { prepId } = useParams();
  const location = useLocation();
  const forceQuestionnaire = location.pathname.endsWith('/fragebogen');

  if (!isValidPrepId(prepId)) {
    return (
      <div className="kickoff-prep-page flex items-center justify-center min-h-[50vh] p-6">
        <p className="text-center text-white/80">Link nicht gültig.</p>
      </div>
    );
  }

  return <PrepFlow forceQuestionnaire={forceQuestionnaire} />;
}
