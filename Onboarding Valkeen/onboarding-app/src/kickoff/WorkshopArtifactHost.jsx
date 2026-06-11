import { lazy, Suspense } from 'react';
import { useOutletContext } from 'react-router-dom';
import ChecklistWorkshop from './ChecklistWorkshop';

const LazyKickoffStudio = lazy(() => import('../pages/KickoffStudio'));
const LazyStakeholderAnalysis = lazy(() => import('../pages/StakeholderAnalysis'));
const LazyChangeDashboard = lazy(() => import('../pages/ChangeDashboard'));
const LazyChangeWorkflow = lazy(() => import('../pages/ChangeWorkflow'));
const LazySSOSetup = lazy(() => import('../pages/SSOSetup'));
const LazyTraining = lazy(() => import('../pages/Training'));
const LazyQrgBuilder = lazy(() => import('../pages/QrgBuilder'));
const LazyCommunicationPlan = lazy(() => import('../pages/CommunicationPlan'));
const LazyChangeJourney = lazy(() => import('../pages/ChangeJourney'));
const LazyWorkshopTools = lazy(() => import('../pages/WorkshopTools'));
const LazyPhaseTilePage = lazy(() => import('../pages/PhaseTilePage'));
const LazyKotterTilePage = lazy(() => import('../pages/KotterTilePage'));
const LazyFeedbackFramework = lazy(() => import('../pages/FeedbackFramework'));
const LazyTempusDemo = lazy(() => import('../pages/TempusDemo'));
const LazyTempusTrainerHub = lazy(() => import('../pages/TempusTrainerHub'));

function Loader() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function WorkshopArtifactHost() {
  const { artifact, locale } = useOutletContext();

  if (!artifact) {
    return (
      <div className="impl-ws-checklist">
        <p>{locale === 'en' ? 'Workshop not found.' : 'Workshop nicht gefunden.'}</p>
      </div>
    );
  }

  const shell = artifact.shell || 'ChecklistWorkshop';

  let content;
  switch (shell) {
    case 'KickoffStudio':
      content = <LazyKickoffStudio />;
      break;
    case 'StakeholderAnalysis':
      content = <LazyStakeholderAnalysis />;
      break;
    case 'ChangeDashboard':
      content = <LazyChangeDashboard />;
      break;
    case 'ChangeWorkflow':
      content = <LazyChangeWorkflow />;
      break;
    case 'SSOSetup':
      content = <LazySSOSetup />;
      break;
    case 'Training':
      content = <LazyTraining />;
      break;
    case 'QrgBuilder':
      content = <LazyQrgBuilder />;
      break;
    case 'CommunicationPlan':
      content = <LazyCommunicationPlan />;
      break;
    case 'ChangeJourney':
      content = <LazyChangeJourney />;
      break;
    case 'WorkshopTools':
      content = <LazyWorkshopTools />;
      break;
    case 'PhaseTilePage':
      content = <LazyPhaseTilePage phaseIdOverride={artifact.phaseParam} embedInWorkshop />;
      break;
    case 'KotterTilePage':
      content = <LazyKotterTilePage kotterSlugOverride={artifact.kotterSlug} embedInWorkshop />;
      break;
    case 'FeedbackFramework':
      content = <LazyFeedbackFramework />;
      break;
    case 'TempusDemo':
      content = <LazyTempusDemo />;
      break;
    case 'TempusTrainerHub':
      content = <LazyTempusTrainerHub />;
      break;
    case 'ChecklistWorkshop':
      content = <ChecklistWorkshop />;
      break;
    default:
      content = <ChecklistWorkshop />;
  }

  return (
    <Suspense fallback={<Loader />}>
      {content}
    </Suspense>
  );
}
