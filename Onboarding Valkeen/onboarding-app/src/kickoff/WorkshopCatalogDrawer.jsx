import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { IMPL_PHASES, tx } from './implementationTemplate';
import { listArtifacts, resolveArtifactHref } from './implementationWorkshopCatalog';

export default function WorkshopCatalogDrawer({
  open,
  onClose,
  locale = 'de',
  sessionId,
  portalMode = false,
}) {
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const grouped = useMemo(() => {
    const all = listArtifacts();
    const needle = q.trim().toLowerCase();
    const filtered = needle
      ? all.filter((a) => {
          const t = tx(a.title, locale).toLowerCase();
          const d = tx(a.desc, locale).toLowerCase();
          return t.includes(needle) || d.includes(needle) || a.id.includes(needle);
        })
      : all;

    return IMPL_PHASES.map((ph) => ({
      phase: ph,
      items: filtered.filter((a) => a.phaseId === ph.id),
    })).filter((g) => g.items.length > 0);
  }, [q, locale]);

  if (!open) return null;

  return (
    <div className="impl-ws-catalog-drawer" onClick={onClose}>
      <div className="impl-ws-catalog-panel" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <h2 style={{ flex: 1, margin: 0, fontSize: '1rem' }}>
            {locale === 'en' ? 'All workshops & tools' : 'Alle Workshops & Tools'}
          </h2>
          <button type="button" className="impl-btn" onClick={onClose} aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <Search
            className="w-4 h-4"
            style={{ position: 'absolute', left: '0.65rem', top: '0.55rem', opacity: 0.5 }}
          />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={locale === 'en' ? 'Search…' : 'Suchen…'}
            style={{ paddingLeft: '2rem', width: '100%' }}
          />
        </div>
        {grouped.map(({ phase, items }) => (
          <section key={phase.id} style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.8rem', color: 'var(--impl-muted)', margin: '0 0 0.5rem' }}>
              {tx(phase.title, locale)}
            </h3>
            {items.map((a) => (
              <button
                key={a.id}
                type="button"
                className="impl-ws-catalog-item"
                onClick={() => {
                  navigate(resolveArtifactHref(a, sessionId, { portalMode }));
                  onClose();
                }}
              >
                <strong>{tx(a.title, locale)}</strong>
                <span>{tx(a.desc, locale)}</span>
              </button>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
