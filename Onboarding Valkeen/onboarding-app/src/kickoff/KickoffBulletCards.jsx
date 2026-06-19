import {
  BarChart3,
  CheckCircle2,
  CircleDot,
  Clock,
  FileSpreadsheet,
  FolderKanban,
  GraduationCap,
  Handshake,
  PenLine,
  Plug,
  Shield,
  UserCog,
} from 'lucide-react';
import { iconForBullet } from './kickoffSlideDesignHints';

const ICONS = {
  CircleDot,
  Handshake,
  FileSpreadsheet,
  Plug,
  UserCog,
  BarChart3,
  Clock,
  Shield,
  GraduationCap,
  CheckCircle2,
  FolderKanban,
  PenLine,
};

function BulletIcon({ name, className }) {
  const C = ICONS[name] || CircleDot;
  return <C className={className} aria-hidden />;
}

/** Bullets als Icon-Kacheln statt simpler Liste */
export default function KickoffBulletCards({ bullets }) {
  const list = bullets || [];

  return (
    <ul className="kickoff-bullet-cards" role="list">
      {list.map((text, i) => {
        const colon = text.indexOf(':');
        const title = colon > 0 ? text.slice(0, colon).trim() : '';
        const body = colon > 0 ? text.slice(colon + 1).trim() : text;
        const iconName = iconForBullet(text);
        return (
          <li key={i} className="kickoff-bullet-card" role="listitem">
            <span className="kickoff-bullet-card-icon">
              <BulletIcon name={iconName} className="w-5 h-5" />
            </span>
            <div className="kickoff-bullet-card-text">
              {title ? (
                <>
                  <strong className="kickoff-bullet-card-title">{title}</strong>
                  {body && <p className="kickoff-bullet-card-body">{body}</p>}
                </>
              ) : (
                <p className="kickoff-bullet-card-body">{body}</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
