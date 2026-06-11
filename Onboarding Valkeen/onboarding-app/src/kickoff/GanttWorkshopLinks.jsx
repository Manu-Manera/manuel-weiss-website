import { useNavigate } from 'react-router-dom';
import { ExternalLink, Presentation } from 'lucide-react';
import { resolveArtifactHref } from './implementationWorkshopCatalog';
import { workshopsForTask } from './implementationTaskWorkshops';

/**
 * Workshop-Sprunglinks — sichtbar beim Hover über die Gantt-Zeile.
 */
export default function GanttWorkshopLinks({ task, session, portalMode, locale, variant = 'gantt' }) {
  const navigate = useNavigate();
  const workshops = workshopsForTask(task, locale, session);
  if (!workshops.length) return null;

  const wrapClass = variant === 'table' ? 'implplan-workshop-links' : 'gantt-workshop-links';
  const btnClass = variant === 'table' ? 'implplan-workshop-link' : 'gantt-workshop-link';

  return (
    <div className={wrapClass} aria-label={locale === 'en' ? 'Workshops' : 'Workshops'}>
      {workshops.map((w) => (
        <button
          key={w.artifactId}
          type="button"
          className={btnClass}
          onClick={(e) => {
            e.stopPropagation();
            navigate(resolveArtifactHref(w.artifact, session.sessionId, { portalMode }));
          }}
        >
          <Presentation className="w-3 h-3" aria-hidden />
          <span>{w.title}</span>
          <ExternalLink className="w-3 h-3" aria-hidden style={{ opacity: 0.7 }} />
        </button>
      ))}
    </div>
  );
}
