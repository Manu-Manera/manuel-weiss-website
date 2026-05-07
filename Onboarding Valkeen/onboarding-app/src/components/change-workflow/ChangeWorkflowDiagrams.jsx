/** Präsentationsnahe Workshop‑Diagramme (SVG mit Verläufen, Schatten, klarer Hierarchie). */

import { useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { KOTTER_CATALOG_ITEMS } from '../../data/kotterCatalogData';

/** Stabile lokale SVG‑IDs (pro Komponenteninstanz durch useId eindeutig). */
function useSvgUid(prefix) {
  return `${prefix}${useId().replace(/[^a-zA-Z0-9_-]/g, 'x')}`;
}

/**
 * Gemeinsamer Rahmen mit Standard‑Defs für „Folienstil“ (Violett, Schatten, Flächen).
 * @param {{ titleId: string, titleText: string, vb: string, height: string, children: (uid: string) => React.ReactNode }} props
 */
function SvgChartShell({ titleId, titleText, vb, height, children }) {
  const U = useSvgUid('cwD');
  return (
    <svg
      role="img"
      aria-labelledby={titleId}
      viewBox={vb}
      width="560"
      className="cw-diagram-svg"
      style={{ height, width: '100%', display: 'block' }}
      preserveAspectRatio="xMidYMid meet"
    >
      <title id={titleId}>{titleText}</title>
      <defs>
        <linearGradient id={`${U}_vioStroke`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--cw-accent-strong)" />
          <stop offset="100%" stopColor="var(--cw-accent)" />
        </linearGradient>
        <linearGradient id={`${U}_vioFade`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--cw-accent)" stopOpacity={0.32} />
          <stop offset="100%" stopColor="var(--cw-accent-strong)" stopOpacity={0.04} />
        </linearGradient>
        <linearGradient id={`${U}_pane`} x1="12%" y1="0%" x2="88%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.98} />
          <stop offset="100%" stopColor="var(--cw-card-soft)" stopOpacity={1} />
        </linearGradient>
        <linearGradient id={`${U}_silver`} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#cbd5e1" stopOpacity={0.35} />
          <stop offset="50%" stopColor="#94a3b8" stopOpacity={0.2} />
          <stop offset="100%" stopColor="#cbd5e1" stopOpacity={0.35} />
        </linearGradient>
        <filter id={`${U}_softDrop`} x="-35%" y="-35%" width="170%" height="170%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#312e81" floodOpacity="0.12" />
        </filter>
        <filter id={`${U}_nodeLift`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#1e293b" floodOpacity="0.14" />
        </filter>
        <filter id={`${U}_glowDot`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.8" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {children(U)}
    </svg>
  );
}

/** Beschriftungs‑„Pill« hinter KPI‑Text über der Grafik */
function SvgLabelBadge({ cx, cy, w, lines, accent = false }) {
  const lh = 13;
  const padY = 7;
  const h = padY * 2 + lines.length * lh;
  const x = cx - w / 2;
  const y = cy - h / 2;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="11"
        fill={accent ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.95)'}
        stroke={accent ? 'rgba(124,58,237,0.35)' : 'rgba(148,163,184,0.55)'}
        strokeWidth={1}
      />
      {lines.map((line, i) => (
        <text
          key={i}
          x={cx}
          y={y + padY + 10 + i * lh}
          textAnchor="middle"
          fill={accent ? 'var(--cw-accent-strong)' : 'var(--cw-text-muted)'}
          style={{ font: `${i === 0 ? 'bold' : '500'} ${i === 0 ? '10.5px' : '10px'} system-ui,sans-serif` }}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function OrientFlowDiagram({ titleId }) {
  const steps = ['Check-in', 'Erarbeitung', 'Verdichtung', 'Commitment'];
  return (
    <SvgChartShell titleId={titleId} titleText="Moderationsimpuls eines kompakten Workshop‑Blocks." vb="0 0 520 164" height="10.75rem">
      {(U) => (
        <>
          <rect x="26" y="22" width="468" height="122" rx="20" fill={`url(#${U}_pane)`} stroke="var(--cw-border-subtle)" />
          <text x="260" y="48" textAnchor="middle" fill="var(--cw-text-secondary)" style={{ font: '700 13.5px system-ui,sans-serif' }}>
            Vom Check‑in zur Verdichtung
          </text>
          <path
            d="M54 118 H472"
            fill="none"
            stroke={`url(#${U}_silver)`}
            strokeWidth={8}
            strokeLinecap="round"
          />
          <path
            d="M54 118 H472"
            fill="none"
            stroke={`url(#${U}_vioStroke)`}
            strokeOpacity={0.55}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray="2 14"
          />
          {steps.map((label, i) => {
            const x = 68 + i * ((472 - 68) / (steps.length - 1 || 1));
            return (
              <g key={label} filter={`url(#${U}_nodeLift)`}>
                <circle cx={x} cy="118" r="18" fill="#fff" stroke={`url(#${U}_vioStroke)`} strokeWidth={2.5} />
                <circle cx={x} cy="118" r="10" fill="rgba(167,139,250,0.35)" stroke="none" />
                <circle cx={x} cy="118" r="5.5" fill="var(--cw-accent-strong)" />
                <text
                  x={x}
                  y="152"
                  textAnchor="middle"
                  fill="var(--cw-text)"
                  style={{ font: '700 11.5px system-ui,sans-serif' }}
                >
                  {label}
                </text>
              </g>
            );
          })}
        </>
      )}
    </SvgChartShell>
  );
}

function EmotionCurveDiagram({ titleId }) {
  const curve =
    'M 64 138 C 128 174, 168 178, 220 154 S 304 118, 352 138 S 420 154, 456 146';
  const baseY = 182;
  const fillPath = `${curve} L 456 ${baseY} L 64 ${baseY} Z`;
  return (
    <SvgChartShell
      titleId={titleId}
      titleText="Schemisches Spannungs‑ und Aktivierungsfeld über die Zeit eines Change‑Programms."
      vb="0 0 560 254"
      height="15.875rem"
    >
      {(U) => (
        <>
          <defs>
            <linearGradient id={`${U}_emoRiver`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6d28d9" stopOpacity={0.32} />
              <stop offset="42%" stopColor="#8b5cf6" stopOpacity={0.16} />
              <stop offset="100%" stopColor="#ede9fe" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id={`${U}_emoGlow`} x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="var(--cw-accent-strong)" stopOpacity={0} />
              <stop offset="50%" stopColor="var(--cw-accent)" stopOpacity={0.42} />
              <stop offset="100%" stopColor="var(--cw-accent-strong)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id={`${U}_emoRail`} x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" stopOpacity={0.94} />
              <stop offset="100%" stopColor="#e4e8f5" stopOpacity={0.18} />
            </linearGradient>
          </defs>
          <rect x="22" y="18" width="516" height="214" rx="22" fill={`url(#${U}_pane)`} stroke="var(--cw-border-subtle)" />
          <text x="40" y="46" fill="var(--cw-text-secondary)" style={{ font: '700 12.5px system-ui,sans-serif' }}>
            Dynamik unter Veränderung
          </text>
          <text x="40" y="64" fill="var(--cw-text-muted)" style={{ font: '600 11px system-ui,sans-serif' }}>
            Beispieldarstellung zur Moderation · keine Timing‑Pflicht
          </text>
          <rect x="90" y="84" width="438" height="96" rx="14" fill={`url(#${U}_emoRail)`} stroke="rgba(148,163,184,0.35)" strokeWidth={0.8} opacity={0.85} />
          <text x="48" y="96" fill="var(--cw-text-muted)" transform="rotate(-90 46 146)" style={{ font: '600 10px system-ui,sans-serif', letterSpacing: '0.04em' }}>
            INTENSITÄT
          </text>
          <path d={`M92 172 H526`} stroke="var(--cw-border-subtle)" strokeWidth="2" strokeLinecap="round" />
          <path d={`M92 88 V192`} stroke="var(--cw-border-subtle)" strokeWidth="2" strokeLinecap="round" />
          {[0.25, 0.55, 0.78].map((pct, idx) => (
            <path
              key={idx}
              d={`M92 ${88 + pct * (172 - 88)} H520`}
              stroke="var(--cw-border-subtle)"
              strokeWidth="1"
              strokeDasharray="3 10"
              opacity={0.6}
            />
          ))}
          <path d={fillPath} fill={`url(#${U}_emoRiver)`} stroke="none" />
          <path d={fillPath} fill={`url(#${U}_vioFade)`} stroke="none" opacity={0.75} />
          <path d={curve} fill="none" stroke={`url(#${U}_emoGlow)`} strokeWidth={16} strokeLinecap="round" opacity={0.35} />
          <path d={curve} fill="none" stroke={`url(#${U}_vioStroke)`} strokeWidth={7} strokeLinecap="round" opacity={0.2} />
          <path d={curve} fill="none" stroke={`url(#${U}_vioStroke)`} strokeWidth={3.6} strokeLinecap="round" filter={`url(#${U}_softDrop)`} />
          {[
            { x: 64, lines: ['Unsicherheit'] },
            { x: 160, lines: ['Rückstellung'] },
            { x: 244, lines: ['Auseinander-', 'setzung'] },
            { x: 356, lines: ['Experiment'] },
            { x: 450, lines: ['Verankerung'] },
          ].map((p, i) => (
            <g key={p.lines.join('-')} filter={`url(#${U}_glowDot)`}>
              <circle cx={p.x} cy="138" r="9.5" fill="#fff" stroke={`url(#${U}_vioStroke)`} strokeWidth={2} />
              <circle cx={p.x} cy="138" r="5" fill="var(--cw-accent-strong)" />
              <SvgLabelBadge
                cx={p.x}
                cy={i === 2 ? 104 : i === 0 || i === 4 ? 98 : 98}
                w={i === 2 ? 118 : i === 0 ? 112 : i === 4 ? 104 : 100}
                lines={p.lines}
                accent={i === 2}
              />
            </g>
          ))}
          <text x="520" y="216" textAnchor="end" fill="var(--cw-text-muted)" style={{ font: '600 11px system-ui,sans-serif', letterSpacing: '0.02em' }}>
            Zeit / Reife ⟶
          </text>
          <rect x="102" y="198" width="132" height="30" rx="8" fill="rgba(248,250,252,0.96)" stroke="var(--cw-border-subtle)" />
          <text x="111" y="216.5" fill="var(--cw-text-muted)" style={{ font: '500 10.5px system-ui,sans-serif' }}>
            ● Meilenpunkt&nbsp;&nbsp;<tspan opacity={0.55}>⋯</tspan> Hilfsraster
          </text>
        </>
      )}
    </SvgChartShell>
  );
}

function KotterEightDiagram({ titleId, kotterInteractive = false }) {
  const navigate = useNavigate();
  const go = (kotterSlug) => {
    navigate(`/change-workflow/kotter/${kotterSlug}`);
  };
  return (
    <SvgChartShell titleId={titleId} titleText="Klassische Ursachen wenn Change‑Programme stagnieren." vb="0 0 532 274" height="17.125rem">
      {(U) => (
        <>
          <rect x="18" y="18" width="496" height="238" rx="22" fill={`url(#${U}_pane)`} stroke="var(--cw-border-subtle)" />
          <text x="266" y="48" textAnchor="middle" fill="var(--cw-text-secondary)" style={{ font: '700 14px system-ui,sans-serif' }}>
            Prüfkatalog (Auszug — Kotter)
          </text>
          <text x="266" y="68" textAnchor="middle" fill="var(--cw-text-muted)" style={{ font: '600 11px system-ui,sans-serif' }}>
            Acht typische Ursachen bei stockenden Initiativen
          </text>
          {KOTTER_CATALOG_ITEMS.map((item, idx) => {
            const row = idx < 4 ? 0 : 1;
            const col = idx % 4;
            const x = 42 + col * 114;
            const y = row === 0 ? 88 : 174;
            const label = `${item.order}. ${item.label} — Prüfkatalog öffnen`;
            const halo = idx % 5;
            const halos = ['rgba(109,40,217,0.075)', 'rgba(59,130,246,0.06)', 'rgba(124,58,237,0.09)', 'rgba(14,165,233,0.065)', 'rgba(168,85,247,0.07)'][halo];
            const inner = (
              <>
                <rect x={x - 2} y={y - 2} rx="17" width="108" height="88" fill={halos} stroke="none" />
                <rect
                  x={x}
                  y={y}
                  rx="16"
                  width="104"
                  height="84"
                  fill="#ffffff"
                  stroke={`url(#${U}_vioStroke)`}
                  strokeWidth={1.15}
                />
                <rect x={x} y={y} width="104" height="28" rx="16" ry="12" fill="rgba(245,243,255,1)" stroke="none" />
                <circle cx={x + 52} cy={y + 16} r="13" fill="#fff" stroke="rgba(124,58,237,0.35)" strokeWidth={1} />
                <text x={x + 52} y={y + 20} textAnchor="middle" fill="var(--cw-accent-strong)" style={{ font: 'bold 13px system-ui,sans-serif' }}>
                  {idx + 1}.
                </text>
                <text x={x + 52} y={y + 62} textAnchor="middle" fill="var(--cw-text)" style={{ font: 'bold 11px system-ui,sans-serif', lineHeight: 1.2 }}>
                  {item.label}
                </text>
              </>
            );
            if (!kotterInteractive) {
              return (
                <g key={item.slug} filter={`url(#${U}_nodeLift)`}>
                  {inner}
                </g>
              );
            }
            return (
              <g
                key={item.slug}
                className="cw-kotter-tile"
                filter={`url(#${U}_nodeLift)`}
                role="button"
                tabIndex={0}
                style={{ cursor: 'pointer' }}
                aria-label={label}
                onClick={() => go(item.slug)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    go(item.slug);
                  }
                }}
              >
                {inner}
              </g>
            );
          })}
        </>
      )}
    </SvgChartShell>
  );
}

function PmCmLanesDiagram({ titleId }) {
  const lanes = [
    { y: 66, label: 'Projekt', tint: '#64748b', ms: ['Start', 'Plan', 'Gestalt.', 'Liefer.', 'Betrieb'] },
    { y: 158, label: 'Change', tint: '#5b21b6', ms: ['Sinn', 'Stakeh.', 'Motiv.', 'Adopt.', 'Kultur'] },
  ];
  return (
    <SvgChartShell titleId={titleId} titleText="Parallele Arbeitsspuren entlang eines Vorhabens." vb="0 0 548 246" height="15.375rem">
      {(U) => (
        <>
          <rect x="16" y="16" width="516" height="214" rx="22" fill={`url(#${U}_pane)`} stroke="var(--cw-border-subtle)" />
          <text x="274" y="46" textAnchor="middle" fill="var(--cw-text-secondary)" style={{ font: '700 14px system-ui,sans-serif' }}>
            Zwei Strange — gekoppelt, nicht austauschbar
          </text>
          <text x="274" y="66" textAnchor="middle" fill="var(--cw-text-muted)" style={{ font: '600 11px system-ui,sans-serif' }}>
            Planung liefern & Menschen aktivieren
          </text>
          {lanes.map((lane) => (
            <g key={lane.label}>
              <text x={40} y={lane.y + 22} fill="var(--cw-text)" style={{ font: '800 12px system-ui,sans-serif', letterSpacing: '0.08em' }}>
                {lane.label.toUpperCase()}
              </text>
              <path
                d={`M154 ${lane.y} H492`}
                stroke="var(--cw-border-subtle)"
                strokeWidth={14}
                strokeLinecap="round"
              />
              <path
                d={`M154 ${lane.y} H492`}
                stroke={lane.tint}
                opacity={lane.label === 'Change' ? 0.18 : 0.08}
                strokeWidth={14}
                strokeLinecap="round"
              />
              {lane.ms.map((m, i) => {
                const span = (492 - 154) / Math.max(lane.ms.length - 1, 1);
                const x = 154 + i * span;
                return (
                  <g key={m} filter={`url(#${U}_nodeLift)`}>
                    <circle cx={x} cy={lane.y} r="18" fill="#ffffff" stroke={lane.tint} strokeWidth={lane.label === 'Change' ? 2.6 : 2} opacity={lane.label === 'Change' ? 1 : 0.98} />
                    <circle cx={x} cy={lane.y} r="8" fill={lane.tint} opacity={lane.label === 'Change' ? 0.35 : 0.2} />
                    <circle cx={x} cy={lane.y} r="5" fill={lane.tint} opacity={lane.label === 'Change' ? 1 : 0.55} />
                    <text
                      x={x}
                      y={lane.y + 34}
                      textAnchor="middle"
                      fill="var(--cw-text)"
                      style={{ font: '600 10px system-ui,sans-serif' }}
                    >
                      {m}
                    </text>
                  </g>
                );
              })}
            </g>
          ))}
        </>
      )}
    </SvgChartShell>
  );
}

function KopfHerzHandDiagram({ titleId }) {
  const nodes = [
    { cx: 280, cy: 52, p: 'Kopf', s: 'Verstehen • Logik' },
    { cx: 118, cy: 188, p: 'Herz', s: 'Sinn • Mitgehen' },
    { cx: 442, cy: 188, p: 'Hand', s: 'Tun • Skills • Alltag' },
  ];
  return (
    <SvgChartShell titleId={titleId} titleText="Dreigliedrige Hebel erfolgreicher Veränderungen." vb="0 0 548 268" height="17rem">
      {(U) => (
        <>
          <rect x="18" y="18" width="512" height="232" rx="22" fill={`url(#${U}_pane)`} stroke="var(--cw-border-subtle)" />
          <text x="274" y="48" textAnchor="middle" fill="var(--cw-text-secondary)" style={{ font: '700 14px system-ui,sans-serif' }}>
            Kopf • Herz • Hand gleichberechtigt
          </text>
          <polygon
            points="280,74 146,218 416,218"
            fill={`url(#${U}_vioFade)`}
            stroke={`url(#${U}_vioStroke)`}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          {nodes.map((n) => (
            <g key={n.p} filter={`url(#${U}_nodeLift)`}>
              <circle cx={n.cx} cy={n.cy} r="54" fill="#ffffff" stroke="var(--cw-border-subtle)" strokeWidth={1} />
              <circle cx={n.cx} cy={n.cy} r="54" fill="rgba(248,250,252,0.5)" stroke="none" />
              <text x={n.cx} y={n.cy - 14} textAnchor="middle" fill="#5b21b6" style={{ font: '800 15px system-ui,sans-serif' }}>
                {n.p}
              </text>
              <text x={n.cx} y={n.cy + 14} textAnchor="middle" fill="var(--cw-text-muted)" style={{ font: '600 10.5px system-ui,sans-serif' }}>
                {n.s}
              </text>
            </g>
          ))}
        </>
      )}
    </SvgChartShell>
  );
}

function WhyLayersDiagram({ titleId }) {
  const layers = [
    { x: 108, y: 56, w: 324, h: 48, t: 'Organisation — Kontext · Dringlichkeit', z: 0 },
    { x: 86, y: 116, w: 368, h: 48, t: 'Team — Auftrag · Rollenbilder', z: 1 },
    { x: 64, y: 176, w: 412, h: 48, t: 'Persönlich — Vorteile im Alltag', z: 2 },
  ];
  return (
    <SvgChartShell titleId={titleId} titleText="Verschachtelte Warum‑Ebenen." vb="0 0 548 274" height="17.125rem">
      {(U) => (
        <>
          <rect x="16" y="16" width="516" height="242" rx="22" fill={`url(#${U}_pane)`} stroke="var(--cw-border-subtle)" />
          <text x="274" y="46" textAnchor="middle" fill="var(--cw-text-secondary)" style={{ font: '700 14px system-ui,sans-serif' }}>
            Die drei Schalen des „Warum“
          </text>
          {layers.map((L) => (
            <g key={L.t} filter={`url(#${U}_softDrop)`}>
              <rect
                x={L.x}
                y={L.y}
                width={L.w}
                height={L.h}
                rx="18"
                fill={L.z === 2 ? 'rgba(248,250,252,0.92)' : L.z === 1 ? '#ffffff' : 'rgba(255,255,255,0.88)'}
                stroke="var(--cw-accent-soft-border)"
                strokeWidth={1}
              />
              <rect x={L.x + 14} y={L.y + 12} width="4" height="24" rx="2" fill={`url(#${U}_vioStroke)`} opacity={0.6} />
              <text x={L.x + L.w / 2} y={L.y + L.h / 2 + 5} textAnchor="middle" fill="var(--cw-text)" style={{ font: '700 13px system-ui,sans-serif' }}>
                {L.t}
              </text>
            </g>
          ))}
        </>
      )}
    </SvgChartShell>
  );
}

function StakeholderMatrixDiagram({ titleId }) {
  const q = [
    {
      gx: 90,
      gy: 98,
      w: 174,
      h: 74,
      fill: 'rgba(148,163,184,0.14)',
      stroke: 'rgba(100,116,139,0.28)',
      cx: 176,
      cy: 138,
      lines: ['Beobachten', 'informieren halten'],
    },
    {
      gx: 272,
      gy: 98,
      w: 174,
      h: 74,
      fill: 'rgba(124,58,237,0.11)',
      stroke: 'rgba(91,33,182,0.32)',
      cx: 360,
      cy: 138,
      lines: ['Aktiv gestalten', '& anführen'],
    },
    {
      gx: 90,
      gy: 174,
      w: 174,
      h: 74,
      fill: 'rgba(148,163,184,0.09)',
      stroke: 'rgba(100,116,139,0.22)',
      cx: 176,
      cy: 214,
      lines: ['Gezielt erreichen', 'klare Botschaften'],
    },
    {
      gx: 272,
      gy: 174,
      w: 174,
      h: 74,
      fill: 'rgba(124,58,237,0.16)',
      stroke: 'rgba(91,33,182,0.36)',
      cx: 360,
      cy: 214,
      lines: ['Co‑Erstellung', 'einbinden & nutzen'],
    },
  ];
  return (
    <SvgChartShell titleId={titleId} titleText="Priorisierung von Stakeholdern nach Einfluss und Einstellung." vb="0 0 548 294" height="18.375rem">
      {(U) => (
        <>
          <rect x="16" y="16" width="516" height="262" rx="22" fill={`url(#${U}_pane)`} stroke="var(--cw-border-subtle)" />
          <text x="274" y="48" textAnchor="middle" fill="var(--cw-text-secondary)" style={{ font: '700 14px system-ui,sans-serif' }}>
            Einfluss vs. Unterstützung
          </text>
          <text x="274" y="70" textAnchor="middle" fill="var(--cw-text-muted)" style={{ font: '600 11px system-ui,sans-serif' }}>
            Kombination entscheidet über Taktik (informieren • einladen • mitgestalten)
          </text>
          <rect x="80" y="88" width="388" height="168" rx="18" fill="rgba(248,250,252,0.85)" stroke="var(--cw-border-subtle)" filter={`url(#${U}_softDrop)`} />
          <path d="M274 88 V254 M94 174 H458" stroke="var(--cw-border-subtle)" strokeWidth="2.8" opacity={0.85} strokeLinecap="round" />
          <text x="358" y="108" fill="var(--cw-text-muted)" style={{ font: '600 10px system-ui,sans-serif' }}>
            kritisch ◀————————▶ treibend / befürwortend
          </text>
          <text x="134" y="168" transform="rotate(-90 138 174)" fill="var(--cw-text-muted)" style={{ font: '600 10px system-ui,sans-serif', letterSpacing: '0.04em' }}>
            WENIG EINFLUSS
          </text>
          <text x="412" y="168" transform="rotate(90 408 174)" fill="var(--cw-text-muted)" style={{ font: '600 10px system-ui,sans-serif', letterSpacing: '0.04em' }}>
            HOHER EINFLUSS
          </text>
          {q.map((cell, qi) => (
            <g key={qi}>
              <rect x={cell.gx} y={cell.gy} width={cell.w} height={cell.h} rx="14" fill={cell.fill} stroke={cell.stroke} />
              {cell.lines.map((ln, ri) => (
                <text
                  key={`${qi}-${ln}`}
                  x={cell.cx}
                  y={cell.cy - 10 + ri * 16}
                  textAnchor="middle"
                  fill={ri === 0 ? 'var(--cw-text-secondary)' : 'var(--cw-text-muted)'}
                  style={{ font: `${ri === 0 ? '700' : '600'} ${ri === 0 ? '11.5px' : '10.5px'} system-ui,sans-serif` }}
                >
                  {ln}
                </text>
              ))}
            </g>
          ))}
        </>
      )}
    </SvgChartShell>
  );
}

function CommsPyramidDiagram({ titleId }) {
  const tiers = [
    {
      bw: 168,
      y: 90,
      h: 48,
      title: '1:1 · Kleinteams',
      detail: 'Höchste Tiefe • sensibles Feedback',
      fill: 'rgba(124,58,237,0.15)',
      strokeStrength: 2,
    },
    {
      bw: 242,
      y: 150,
      h: 50,
      title: 'Workshops · Produkt‑Squads',
      detail: 'Mischung aus Mitgestalten & Einordnen',
      fill: 'rgba(167,139,250,0.16)',
      strokeStrength: 1.8,
    },
    {
      bw: 348,
      y: 214,
      h: 52,
      title: 'All‑hands · Broadcasts',
      detail: 'Grosse Reichweite · weniger Detailtiefe',
      fill: 'rgba(237,233,254,0.94)',
      strokeStrength: 1.65,
    },
  ];
  return (
    <SvgChartShell titleId={titleId} titleText="Formate mit höherem Dialoggrad dort, wo es auf Details ankommt." vb="0 0 548 300" height="18.625rem">
      {(U) => (
        <>
          <rect x="16" y="16" width="516" height="268" rx="22" fill={`url(#${U}_pane)`} stroke="var(--cw-border-subtle)" />
          <text x="274" y="48" textAnchor="middle" fill="var(--cw-text-secondary)" style={{ font: '700 14px system-ui,sans-serif' }}>
            Kommunikations‑Pyramide
          </text>
          <text x="274" y="70" textAnchor="middle" fill="var(--cw-text-muted)" style={{ font: '600 11px system-ui,sans-serif' }}>
            weiter oben weniger Teilnehmer · mehr Kontexttiefe möglich
          </text>
          {tiers.map((tier) => {
            const x = 274 - tier.bw / 2;
            return (
              <g key={tier.title} filter={`url(#${U}_softDrop)`}>
                <rect
                  x={x}
                  y={tier.y}
                  width={tier.bw}
                  height={tier.h}
                  rx="18"
                  fill={tier.fill}
                  stroke={`url(#${U}_vioStroke)`}
                  strokeWidth={tier.strokeStrength}
                />
                <rect x={x + tier.bw / 2 - 22} y={tier.y + 14} width="44" height="4" rx="2" fill="var(--cw-accent-strong)" opacity={0.32} />
                <text x="274" y={tier.y + 30} textAnchor="middle" fill="var(--cw-text-secondary)" style={{ font: '800 13px system-ui,sans-serif', letterSpacing: '0.01em' }}>
                  {tier.title}
                </text>
                <text x="274" y={tier.y + tier.h - 12} textAnchor="middle" fill="var(--cw-text-muted)" style={{ font: '600 10.5px system-ui,sans-serif' }}>
                  {tier.detail}
                </text>
              </g>
            );
          })}
          <text x="274" y="287" textAnchor="middle" fill="var(--cw-text-muted)" style={{ font: '600 10px system-ui,sans-serif' }}>
            Stufen nicht verwechseln: weniger granular ≠ weniger Bedeutsamkeit
          </text>
        </>
      )}
    </SvgChartShell>
  );
}

function StoryArcDiagram({ titleId }) {
  const pathD = 'M56 154 C168 174,216 74,294 92 C378 114,394 174,482 174';
  return (
    <SvgChartShell titleId={titleId} titleText="Dramaturgie einer erzählerischen Change‑Story." vb="0 0 562 216" height="13.625rem">
      {(U) => (
        <>
          <rect x="18" y="18" width="526" height="180" rx="22" fill={`url(#${U}_pane)`} stroke="var(--cw-border-subtle)" />
          <text x="281" y="48" textAnchor="middle" fill="var(--cw-text-secondary)" style={{ font: '700 14px system-ui,sans-serif' }}>
            Story‑Arc: Spannungsaufbau und Auflösung
          </text>
          <path d={`${pathD} L482 174 L56 174 Z`} fill={`url(#${U}_vioFade)`} opacity={0.9} stroke="none" />
          <path d={pathD} fill="none" stroke={`url(#${U}_vioStroke)`} strokeWidth={8} strokeLinecap="round" opacity={0.2} />
          <path d={pathD} fill="none" stroke={`url(#${U}_vioStroke)`} strokeWidth={4.2} strokeLinecap="round" filter={`url(#${U}_softDrop)`} />
          {[
            { cx: 110, lbs: ['Einleitung'] },
            { cx: 310, lbs: ['Kernbotschaft'] },
            { cx: 478, lbs: ['Nächste Schritte'] },
          ].map((p, i) => (
            <g key={p.lbs.join()}>
              <circle cx={p.cx} cy="154" r="22" fill="#ffffff" stroke={`url(#${U}_vioStroke)`} strokeWidth={3} filter={`url(#${U}_nodeLift)`} />
              <circle cx={p.cx} cy="154" r="9" fill="var(--cw-accent-strong)" opacity={i === 1 ? 0.92 : 0.55} />
              <SvgLabelBadge cx={p.cx} cy={126} w={134} lines={p.lbs} accent={i === 1} />
            </g>
          ))}
          <path d={`M56 174 H506`} stroke="var(--cw-border-subtle)" strokeDasharray="4 14" opacity={0.75} strokeWidth={1} />
          <text x="281" y="202" textAnchor="middle" fill="var(--cw-text-muted)" style={{ font: '600 10.5px system-ui,sans-serif' }}>
            Emotionaler Höhepunkt liegt typischerweise in der Kernbotschaft
          </text>
        </>
      )}
    </SvgChartShell>
  );
}

function ElevatorDiagram({ titleId }) {
  const cols = [
    { x: 54, w: 108, t: 'Problem' },
    { x: 180, w: 100, t: 'Ansatz' },
    { x: 294, w: 96, t: 'Nutzen' },
    { x: 402, w: 112, t: 'Nächster Schritt' },
  ];
  return (
    <SvgChartShell titleId={titleId} titleText="Elevator‑Pitch‑Kette in etwa 90 Sekunden." vb="0 0 596 174" height="11rem">
      {(U) => (
        <>
          <rect x="18" y="18" width="560" height="138" rx="22" fill={`url(#${U}_pane)`} stroke="var(--cw-border-subtle)" />
          <text x="298" y="48" textAnchor="middle" fill="var(--cw-text-secondary)" style={{ font: '700 14px system-ui,sans-serif' }}>
            Pitch-Gerüst (ca. 90 s Sprechzeit)
          </text>
          <text x="298" y="68" textAnchor="middle" fill="var(--cw-text-muted)" style={{ font: '600 11px system-ui,sans-serif' }}>
            Jede Station klar formulieren · nicht überspringen
          </text>
          {cols.map((col, i) => (
            <g key={col.t} filter={`url(#${U}_softDrop)`}>
              <rect x={col.x} y="86" width={col.w} height="58" rx="16" fill="#ffffff" stroke="var(--cw-accent-soft-border)" />
              <rect x={col.x} y="86" width={col.w} height="20" rx="16" ry="10" fill="rgba(124,58,237,0.16)" stroke="none" />
              <text x={col.x + col.w / 2} y="101" textAnchor="middle" fill="var(--cw-accent-strong)" style={{ font: 'bold 11px system-ui,sans-serif', letterSpacing: '0.04em' }}>
                {col.t.toUpperCase()}
              </text>
              <circle cx={col.x + col.w / 2} cy={124} r="11" fill="#fff" stroke={`url(#${U}_vioStroke)`} strokeWidth={2} />
              <text x={col.x + col.w / 2} y="129" textAnchor="middle" fill="var(--cw-accent-strong)" style={{ font: 'bold 13px system-ui,sans-serif' }}>
                {i + 1}.
              </text>
              {i < cols.length - 1 && (
                <>
                  <path
                    d={`M${col.x + col.w + 10},117 L${col.x + col.w + 26},117`}
                    stroke={`url(#${U}_silver)`}
                    strokeWidth={4}
                    strokeLinecap="round"
                  />
                  <polygon points={`${col.x + col.w + 30},117 ${col.x + col.w + 16},109 ${col.x + col.w + 16},125`} fill="var(--cw-text-muted)" />
                </>
              )}
            </g>
          ))}
        </>
      )}
    </SvgChartShell>
  );
}

function LifecycleDiagram({ titleId }) {
  const pts = [
    { x: 84, lbl: ['Start •', 'Kontext'] },
    { x: 220, lbl: ['Regelm.', 'Pulse'] },
    { x: 356, lbl: ['Go‑live‑', 'Vorbereitung'] },
    { x: 478, lbl: ['Verankern', '& skalieren'] },
  ];
  return (
    <SvgChartShell titleId={titleId} titleText="Change als zusätzlicher Arbeitstrang im Projekt." vb="0 0 586 246" height="15.625rem">
      {(U) => (
        <>
          <rect x="18" y="18" width="550" height="210" rx="22" fill={`url(#${U}_pane)`} stroke="var(--cw-border-subtle)" />
          <text x="293" y="48" textAnchor="middle" fill="var(--cw-text-secondary)" style={{ font: '700 14px system-ui,sans-serif' }}>
            Fahrspur durch den Projekt‑Lebenszyklus
          </text>
          <text x="293" y="70" textAnchor="middle" fill="var(--cw-text-muted)" style={{ font: '600 11px system-ui,sans-serif' }}>
            Change‑Arbeit sollte eigene Rhythmik behalten, nicht erst „bei Go‑live«.
          </text>
          <path d="M64 154 H554" stroke="var(--cw-border-subtle)" strokeWidth={13} strokeLinecap="round" />
          <path d="M64 154 H554" stroke={`url(#${U}_vioStroke)`} opacity={0.38} strokeWidth={13} strokeLinecap="round" />
          {pts.map((p, idx) => (
            <g key={p.lbl.join('-')} filter={`url(#${U}_nodeLift)`}>
              <circle cx={p.x} cy="154" r="34" fill="#ffffff" stroke={`url(#${U}_vioStroke)`} strokeWidth={idx === pts.length - 1 ? 3 : 2.4} />
              <circle cx={p.x} cy="154" r="18" fill="rgba(167,139,250,0.25)" stroke="none" />
              <circle cx={p.x} cy="154" r="11" fill="var(--cw-accent-strong)" opacity={idx === pts.length - 1 ? 0.95 : 0.72} />
              <text x={p.x} y="146" textAnchor="middle" fill="var(--cw-text-secondary)" style={{ font: '700 10.5px system-ui,sans-serif' }}>
                {p.lbl[0]}
              </text>
              <text x={p.x} y="162" textAnchor="middle" fill="var(--cw-text-muted)" style={{ font: '600 9.75px system-ui,sans-serif' }}>
                {p.lbl[1]}
              </text>
            </g>
          ))}
          <path d={`M94 206 L548 206`} stroke={`url(#${U}_silver)`} strokeDasharray="2 14" opacity={0.9} strokeWidth={2} strokeLinecap="round" />
          <text x="293" y="228" textAnchor="middle" fill="var(--cw-text-muted)" style={{ font: '600 10.5px system-ui,sans-serif' }}>
            Arbeitspakte verbindlich im Plan verankern (Review‑Slots nicht vergessen).
          </text>
        </>
      )}
    </SvgChartShell>
  );
}

const DIAGRAM_REGISTRY = {
  'orient-flow': OrientFlowDiagram,
  'emotion-curve': EmotionCurveDiagram,
  'kotter-8': KotterEightDiagram,
  'pm-cm-rails': PmCmLanesDiagram,
  'head-heart-hand': KopfHerzHandDiagram,
  'why-layers': WhyLayersDiagram,
  'stakeholder-matrix': StakeholderMatrixDiagram,
  'comms-pyramid': CommsPyramidDiagram,
  'story-arc': StoryArcDiagram,
  'elevator-pitch': ElevatorDiagram,
  'change-lifecycle': LifecycleDiagram,
};

function Graphic({ variant, titleId, kotterInteractive }) {
  const C = DIAGRAM_REGISTRY[variant];
  if (!C) return null;
  if (variant === 'kotter-8') {
    return <C titleId={titleId} kotterInteractive={kotterInteractive} />;
  }
  return <C titleId={titleId} />;
}

function DiagramFigure({ entry, kotterInteractive }) {
  const capId = useId();
  const titleId = useId();
  if (!DIAGRAM_REGISTRY[entry.id]) return null;
  return (
    <figure className="cw-diagram-frame" aria-labelledby={capId}>
      <div className="cw-diagram-svg-wrap">
        <Graphic variant={entry.id} titleId={titleId} kotterInteractive={kotterInteractive} />
      </div>
      <figcaption id={capId} className="cw-diagram-caption">
        {entry.caption}
      </figcaption>
    </figure>
  );
}

/**
 * @param {{ entries?: { id: string, caption: string }[], kotterInteractive?: boolean }} props
 */
export function ChangeWorkflowDiagrams({ entries, kotterInteractive }) {
  if (!entries?.length) return null;
  return (
    <div className="cw-diagram-stack">
      {entries.map((entry, idx) => (
        <DiagramFigure key={`${entry.id}-${idx}`} entry={entry} kotterInteractive={kotterInteractive} />
      ))}
    </div>
  );
}
