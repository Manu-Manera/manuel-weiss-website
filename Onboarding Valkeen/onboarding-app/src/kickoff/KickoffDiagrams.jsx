import { ui } from './kickoffStudioI18n';
import { KICKOFF_MODULES, moduleLabel } from './kickoffModuleCatalog';
import { toggleModuleInScope } from './kickoffVizConfig';
import { visualIdForSlide } from './kickoffSlideVisuals';

function ModuleGlyph({ id }) {
  const paths = {
    spm: 'M4 18V6l8-4 8 4v12',
    'portfolio-kanban': 'M4 6h5v12H4zm7 0h5v8h-5zm7 0h5v10h-5',
    'project-program': 'M6 18V8l6-4 6 4v10',
    'project-budget': 'M8 6h8v12H8z M10 10h4',
    'bi-reporting': 'M5 16V10h3v6H5zm5-3v3h3v-3h-3zm5 2v4h3v-4h-3',
    'sheets-storage': 'M6 8h12v10H6z M8 6h8v2H8',
    'resource-capacity': 'M8 16v-4l4-2 4 2v4',
    roadmapping: 'M4 14l6-8 4 5 6-7',
    'resource-request': 'M12 4a8 8 0 100 16',
    skills: 'M12 6a4 4 0 110 8',
    scenario: 'M12 4v16M4 12h16',
    timesheets: 'M12 6v6l4 2',
  };
  const d = paths[id] || 'M6 6h12v12H6z';
  return (
    <svg className="kickoff-module-glyph" viewBox="0 0 24 24" aria-hidden>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ModulesDiagram({ locale, modulesInScope, onModulesChange, editable }) {
  const t = (k) => ui(locale, k);
  const count = KICKOFF_MODULES.filter((m) => modulesInScope[m.id]).length;

  return (
    <div className="kickoff-viz kickoff-viz-modules">
      <div className="kickoff-viz-modules-head">
        <p className="kickoff-viz-modules-title">{t('modulesDiagramTitle')}</p>
        <span className="kickoff-viz-modules-count">
          {count} / {KICKOFF_MODULES.length} {t('modulesInScopeLabel')}
        </span>
      </div>
      {editable ? (
        <p className="kickoff-viz-hint">{t('modulesClickHint')}</p>
      ) : (
        <p className="kickoff-viz-hint kickoff-viz-hint--readonly">{t('modulesReadonlyHint')}</p>
      )}
      <div className="kickoff-modules-grid" role={editable ? 'group' : 'list'}>
        {KICKOFF_MODULES.map((mod) => {
          const active = !!modulesInScope[mod.id];
          const label = moduleLabel(mod, locale);
          const TileTag = editable ? 'button' : 'div';
          return (
            <TileTag
              key={mod.id}
              type={editable ? 'button' : undefined}
              className={`kickoff-module-tile ${active ? 'is-in-scope' : ''}`}
              aria-pressed={editable ? active : undefined}
              aria-label={
                editable
                  ? `${label} — ${active ? t('moduleInScope') : t('moduleOutOfScope')}`
                  : label
              }
              title={editable ? (active ? t('moduleClickOff') : t('moduleClickOn')) : label}
              onClick={
                editable
                  ? () => onModulesChange(toggleModuleInScope(modulesInScope, mod.id))
                  : undefined
              }
            >
              <span className="kickoff-module-tile-icon">
                <ModuleGlyph id={mod.id} />
              </span>
              <span className="kickoff-module-tile-label">{label}</span>
              {active && <span className="kickoff-module-tile-badge">{t('moduleBadge')}</span>}
            </TileTag>
          );
        })}
      </div>
      {editable && (
        <div className="kickoff-viz-modules-actions">
          <button
            type="button"
            className="kickoff-btn-secondary text-sm"
            onClick={() =>
              onModulesChange(
                Object.fromEntries(KICKOFF_MODULES.map((m) => [m.id, true]))
              )
            }
          >
            {t('modulesSelectAll')}
          </button>
          <button
            type="button"
            className="kickoff-btn-secondary text-sm"
            onClick={() =>
              onModulesChange(
                Object.fromEntries(KICKOFF_MODULES.map((m) => [m.id, false]))
              )
            }
          >
            {t('modulesClearAll')}
          </button>
        </div>
      )}
    </div>
  );
}

function PartnershipDiagram({ locale }) {
  const t = (k) => ui(locale, k);
  return (
    <div className="kickoff-viz kickoff-viz-partnership" aria-hidden>
      <svg viewBox="0 0 420 280" className="kickoff-viz-svg">
        <circle cx="210" cy="140" r="118" fill="none" stroke="rgba(0,168,120,0.35)" strokeWidth="2" />
        <text x="210" y="28" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11" letterSpacing="2">
          {t('vizProcesses')}
        </text>
        <polygon
          points="210,52 368,218 52,218"
          fill="rgba(15,76,129,0.55)"
          stroke="rgba(0,168,120,0.5)"
          strokeWidth="2"
        />
        <text x="210" y="88" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="600">
          {t('vizPortfolio')}
        </text>
        <text x="118" y="198" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="600">
          {t('vizProject')}
        </text>
        <text x="302" y="198" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="600">
          {t('vizProcess')}
        </text>
        <circle cx="210" cy="155" r="44" fill="rgba(0,168,120,0.25)" stroke="#00a878" strokeWidth="2" />
        <text x="210" y="150" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
          {t('vizResource')}
        </text>
        <text x="210" y="168" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="9">
          {t('vizResourceSub')}
        </text>
      </svg>
    </div>
  );
}

function PhasesDiagram({ locale }) {
  const phases =
    locale === 'de'
      ? ['Kick-off', 'Konfiguration', 'Daten', 'Training', 'Go-Live']
      : ['Kick-off', 'Configure', 'Data load', 'Training', 'Go-live'];
  return (
    <div className="kickoff-viz kickoff-viz-phases-wrap">
      <div className="kickoff-viz-phases">
        {phases.map((label, i) => (
          <div key={label} className="kickoff-viz-phase">
            <div className="kickoff-viz-phase-node">{i + 1}</div>
            <p className="kickoff-viz-phase-label">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function parseAgendaBullet(text) {
  const colon = text.indexOf(':');
  if (colon < 0) return { title: text.trim(), description: '' };
  return {
    title: text.slice(0, colon).trim(),
    description: text.slice(colon + 1).trim(),
  };
}

const AGENDA_BULLETS_FALLBACK = {
  de: [
    'Kontext: Partnerschaft, Phasen, Tempus-Fähigkeiten, Zusammenarbeit',
    'Workshop: Antworten live erfassen (→) und Tabellen',
    'Integrations-Block zuletzt — nur wenn ERP/Schnittstellen im Scope',
    'Abschluss: Entscheidungen, nächste Schritte, Parking Lot',
  ],
  en: [
    'Context: partnership, phases, Tempus capabilities, ways of working',
    'Workshop: capture answers live (→) and tables',
    'Integrations block last — only if ERP/interfaces are in scope',
    'Close: decisions, next steps, parking lot',
  ],
};

/** Wasserfall ab Schritt 1: jede Kachel mit Titel + Beschreibung aus den Agenda-Bullets */
function AgendaDiagram({ locale, bullets }) {
  const source =
    bullets?.length > 0
      ? bullets
      : AGENDA_BULLETS_FALLBACK[locale] || AGENDA_BULLETS_FALLBACK.en;
  const steps = source.map(parseAgendaBullet);

  return (
    <div className="kickoff-viz kickoff-viz-agenda-waterfall" role="list">
      {steps.map((step, i) => (
        <div
          key={`${step.title}-${i}`}
          className="kickoff-agenda-step"
          style={{ '--agenda-step': i }}
          role="listitem"
        >
          {i > 0 && (
            <svg
              className="kickoff-agenda-connector"
              viewBox="0 0 48 32"
              aria-hidden
            >
              <path
                d="M4 4 L4 20 Q4 28 12 28 L40 28"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
          <article className="kickoff-agenda-tile">
            <span className="kickoff-agenda-tile-num" aria-hidden>
              {i + 1}
            </span>
            <div className="kickoff-agenda-tile-body">
              <h3 className="kickoff-agenda-tile-title">{step.title}</h3>
              {step.description && (
                <p className="kickoff-agenda-tile-desc">{step.description}</p>
              )}
            </div>
          </article>
        </div>
      ))}
    </div>
  );
}

function CapacityDiagram({ locale }) {
  const rows =
    locale === 'de'
      ? [
          { key: 'nonwork', label: 'Nicht-Arbeitszeit', pct: 100 },
          { key: 'absence', label: 'Abwesenheit', pct: 82 },
          { key: 'bau', label: 'BAU', pct: 68 },
          { key: 'projects', label: 'Projekte', pct: 42 },
        ]
      : [
          { key: 'nonwork', label: 'Non-working', pct: 100 },
          { key: 'absence', label: 'Absences', pct: 82 },
          { key: 'bau', label: 'BAU', pct: 68 },
          { key: 'projects', label: 'Projects', pct: 42 },
        ];
  const steps =
    locale === 'de'
      ? ['Basis-Kapazität', 'Netto-Kapazität', 'Projekt-Verfügbarkeit', 'Netto-Verfügbarkeit']
      : ['Base capacity', 'Net capacity', 'Project availability', 'Net availability'];

  return (
    <div className="kickoff-viz kickoff-viz-capacity">
      <div className="kickoff-capacity-chart">
        {steps.map((step, si) => (
          <div key={step} className="kickoff-capacity-step">
            <span className="kickoff-capacity-step-label">{step}</span>
            <div className="kickoff-capacity-bar-stack">
              {rows.map((r, ri) => (
                <div
                  key={r.key}
                  className={`kickoff-capacity-seg kickoff-capacity-seg--${r.key}`}
                  style={{
                    height: `${Math.max(0, r.pct - si * 14)}%`,
                    opacity: ri <= 3 - si ? 1 : 0.15,
                  }}
                  title={r.label}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <ul className="kickoff-capacity-legend">
        {rows.map((r) => (
          <li key={r.key}>
            <span className={`kickoff-capacity-dot kickoff-capacity-dot--${r.key}`} />
            {r.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RoleConceptDiagram({ locale }) {
  const t = (k) => ui(locale, k);
  const example =
    locale === 'de'
      ? { primary: 'Entwickler', secondary: ['Tester', 'Analyst'], skills: ['Java', 'Englisch', 'HTML5'] }
      : { primary: 'Developer', secondary: ['Tester', 'Analyst'], skills: ['Java', 'English', 'HTML5'] };

  return (
    <div className="kickoff-viz kickoff-viz-role">
      <div className="kickoff-role-row">
        <div className="kickoff-role-person" aria-hidden>
          <svg viewBox="0 0 48 64" className="kickoff-role-silhouette">
            <circle cx="24" cy="14" r="10" fill="rgba(255,255,255,0.25)" />
            <path d="M8 58c4-14 32-14 40 0" fill="rgba(255,255,255,0.15)" />
          </svg>
        </div>
        <div className="kickoff-role-groups">
          <div className="kickoff-role-group kickoff-role-group--primary">
            <span className="kickoff-role-group-title">{t('vizRolePrimary')}</span>
            <span className="kickoff-role-chip">{example.primary}</span>
            <span className="kickoff-role-cardinality">1 → 1</span>
          </div>
          <div className="kickoff-role-group kickoff-role-group--secondary">
            <span className="kickoff-role-group-title">{t('vizRoleSecondary')}</span>
            <div className="kickoff-role-chips">
              {example.secondary.map((s) => (
                <span key={s} className="kickoff-role-chip">
                  {s}
                </span>
              ))}
            </div>
            <span className="kickoff-role-cardinality">1 → n</span>
          </div>
          <div className="kickoff-role-group kickoff-role-group--skills">
            <span className="kickoff-role-group-title">{t('vizRoleSkills')}</span>
            <div className="kickoff-role-chips">
              {example.skills.map((s) => (
                <span key={s} className="kickoff-role-chip">
                  {s}
                </span>
              ))}
            </div>
            <span className="kickoff-role-cardinality">1 → n</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function IntegratedProcessDiagram({ locale }) {
  const phases =
    locale === 'de'
      ? [
          { id: 'intake', label: 'Intake', steps: ['Bewertung', 'Grobplanung', 'Simulation', 'Gate'] },
          { id: 'plan', label: 'Planung', steps: ['Detailplanung', 'Freigabe'] },
          { id: 'exec', label: 'Umsetzung', steps: ['Forecast & Reporting'] },
        ]
      : [
          { id: 'intake', label: 'Intake', steps: ['Evaluation', 'Rough plan', 'Simulation', 'Gate'] },
          { id: 'plan', label: 'Planning', steps: ['Detailed plan', 'Approval'] },
          { id: 'exec', label: 'Execution', steps: ['Forecast & reporting'] },
        ];
  const lanes =
    locale === 'de'
      ? ['PM', 'RM', 'Portfolio']
      : ['PM', 'RM', 'Portfolio'];

  return (
    <div className="kickoff-viz kickoff-viz-process">
      <div className="kickoff-process-phases">
        {phases.map((ph) => (
          <div key={ph.id} className={`kickoff-process-phase kickoff-process-phase--${ph.id}`}>
            <span className="kickoff-process-phase-label">{ph.label}</span>
            <div className="kickoff-process-steps">
              {ph.steps.map((s) => (
                <span key={s} className="kickoff-process-step">
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="kickoff-process-lanes">
        {lanes.map((lane) => (
          <div key={lane} className="kickoff-process-lane">
            <span>{lane}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function IntegrationTilesDiagram() {
  const tiles = ['Excel', 'MS Project', 'Jira', 'Smartsheet', 'SAP', 'REST API', 'Exporter'];
  return (
    <div className="kickoff-viz kickoff-viz-integrations">
      <div className="kickoff-integration-tiles">
        {tiles.map((name) => (
          <span key={name} className="kickoff-integration-tile">
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

function DiagramById({ visualId, locale, slide, vizConfig, onVizChange, editable }) {
  switch (visualId) {
    case 'modules':
      return (
        <ModulesDiagram
          locale={locale}
          modulesInScope={vizConfig.modulesInScope}
          onModulesChange={(modulesInScope) => onVizChange({ modulesInScope })}
          editable={editable}
        />
      );
    case 'partnership':
      return <PartnershipDiagram locale={locale} />;
    case 'phases':
      return <PhasesDiagram locale={locale} />;
    case 'agenda':
      return <AgendaDiagram locale={locale} bullets={slide?.bullets} />;
    case 'capacity':
      return <CapacityDiagram locale={locale} />;
    case 'roleConcept':
      return <RoleConceptDiagram locale={locale} />;
    case 'integratedProcess':
      return <IntegratedProcessDiagram locale={locale} />;
    case 'integrationTiles':
      return <IntegrationTilesDiagram />;
    default:
      return null;
  }
}

/** Schaubild für aktuelle Folie — bei modules interaktiv im Facilitator-Modus */
export function KickoffSlideVisual({
  slideId,
  slide,
  locale,
  vizConfig,
  onVizChange,
  editable = false,
}) {
  const visualId = visualIdForSlide(slideId);
  if (!visualId) return null;

  return (
    <DiagramById
      visualId={visualId}
      locale={locale}
      slide={slide}
      vizConfig={vizConfig}
      onVizChange={onVizChange}
      editable={editable && visualId === 'modules'}
    />
  );
}
