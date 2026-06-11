import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  Cloud,
  GanttChartSquare,
  ClipboardList,
  Loader2,
} from 'lucide-react';
import { useImplementationNav } from './useImplementationNav';
import { useImplPermissions } from './useImplPermissions';

/**
 * Sticky Hub-Leiste: zurück zum Leitfaden + Schnellnavigation.
 * Wird in Workshop-Shell und Framework-Seiten (Plan, Log, …) genutzt.
 */
export default function ImplementationHubBar({
  title,
  locale = 'de',
  session,
  portalMode = false,
  onSave,
  syncing = false,
  syncMsg = '',
  className = '',
}) {
  const nav = useImplementationNav();
  const perms = useImplPermissions(session, portalMode);
  const qs = nav.queryString;

  return (
    <div className={`impl-ws-bar ${className}`}>
      <Link className="impl-ws-bar__back" to={nav.hubHref()}>
        <ArrowLeft className="w-4 h-4" aria-hidden />
        {locale === 'en' ? 'Main overview' : 'Hauptübersicht'}
      </Link>
      {title && <h2 className="impl-ws-bar__title">{title}</h2>}
      <div className="impl-ws-bar__actions">
        {perms.canView('scorecard') && (
          <Link className="impl-btn impl-btn--nav" to={`/implementation-scorecard${qs}`}>
            <Activity className="w-4 h-4" aria-hidden />
            Scorecard
          </Link>
        )}
        {perms.canView('plan') && (
          <Link className="impl-btn impl-btn--nav" to={`/implementation-plan${qs}`}>
            <GanttChartSquare className="w-4 h-4" aria-hidden />
            {locale === 'en' ? 'Plan' : 'Plan'}
          </Link>
        )}
        {perms.canView('log') && (
          <Link className="impl-btn impl-btn--nav" to={`/implementation-log${qs}`}>
            <ClipboardList className="w-4 h-4" aria-hidden />
            {locale === 'en' ? 'Log' : 'Log'}
          </Link>
        )}
        {onSave && !portalMode && (
          <button className="impl-btn impl-btn--primary" type="button" onClick={onSave} disabled={syncing}>
            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
            {locale === 'en' ? 'Save' : 'Speichern'}
          </button>
        )}
        {syncMsg && <span className="impl-sync-msg">{syncMsg}</span>}
      </div>
    </div>
  );
}
