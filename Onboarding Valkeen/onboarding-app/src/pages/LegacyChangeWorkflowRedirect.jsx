import { useEffect } from 'react';

/** Alte URL /login-mailer/change-workflow → /change-workflow (ohne Router-Basename-Fallen). */
export default function LegacyChangeWorkflowRedirect() {
  useEffect(() => {
    const base = import.meta.env.BASE_URL || '/onboarding/';
    const target = new URL('change-workflow', window.location.origin + base).href;
    window.location.replace(target);
  }, []);
  return (
    <div className="min-h-[40vh] flex items-center justify-center text-white/50 text-sm">
      Weiterleitung zum Change Workshop…
    </div>
  );
}
