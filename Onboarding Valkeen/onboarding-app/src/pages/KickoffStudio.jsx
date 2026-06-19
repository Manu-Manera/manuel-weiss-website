import KickoffStudioCore from '../kickoff/KickoffStudioCore';

/** Facilitator-Ansicht innerhalb Onboarding-Hub (mit Sidebar). */
export default function KickoffStudio() {
  return (
    <div className="kickoff-facilitator-page w-full min-w-0 max-w-full overflow-hidden">
      <KickoffStudioCore viewMode="facilitator" />
    </div>
  );
}
