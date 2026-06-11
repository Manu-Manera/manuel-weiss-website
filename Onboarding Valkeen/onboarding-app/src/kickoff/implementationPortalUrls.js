/** Change-Management-URL für Facilitator vs. Kundenportal. */
export function changeWorkflowHref({ portalMode, sessionId }) {
  const base = portalMode ? '/change-workflow/teilnehmer' : '/change-workflow/dashboard';
  const p = new URLSearchParams();
  if (sessionId) p.set('s', sessionId);
  if (portalMode) p.set('portal', '1');
  const qs = p.toString();
  return qs ? `${base}?${qs}` : base;
}
