/** Schematische SVG‑Diagramme zum Workshop‑Inhalt (keine externen Bild‑Assets). */

import { useId } from 'react';

function SvgWrap({ titleId, titleText, vb, height, children }) {
  return (
    <svg
      role="img"
      aria-labelledby={titleId}
      viewBox={vb}
      className="cw-diagram-svg"
      style={{
        height,
        width: '100%',
        display: 'block',
      }}
      preserveAspectRatio="xMidYMid meet"
    >
      <title id={titleId}>{titleText}</title>
      {children}
    </svg>
  );
}

function OrientFlowDiagram({ titleId }) {
  const steps = ['Check-in', 'Erarbeitung', 'Verdichtung', 'Commitment'];
  return (
    <SvgWrap titleId={titleId} titleText="Moderationsimpuls eines kompakten Workshop‑Blocks." vb="0 0 480 152" height="9.35rem">
      <path d="M36 94 H444" stroke="var(--cw-border)" strokeWidth="2" strokeLinecap="round" />
      {steps.map((label, i) => {
        const x = 60 + i * (360 / Math.max(steps.length - 1, 1));
        return (
          <g key={label}>
            <circle cx={x} cy="94" r="13" fill="var(--cw-card)" stroke="var(--cw-accent)" strokeWidth="2.5" />
            <circle cx={x} cy="94" r="4" fill="var(--cw-accent)" />
            <text
              x={x}
              y="130"
              textAnchor="middle"
              fill="var(--cw-text-muted)"
              style={{ font: 'bold 11px system-ui,sans-serif' }}
            >
              {label}
            </text>
          </g>
        );
      })}
      <text x="240" y="38" textAnchor="middle" fill="var(--cw-text-secondary)" style={{ font: '600 14px system-ui,sans-serif' }}>
        Von persönlicher Anbindung zur gemeinsamen Absicherung der nächsten Schritte
      </text>
    </SvgWrap>
  );
}

function EmotionCurveDiagram({ titleId }) {
  return (
    <SvgWrap titleId={titleId} titleText="Schemisches Spannungsbild bei einem grösseren organisationalen Umbau." vb="0 0 480 200" height="13rem">
      <text x="32" y="26" fill="var(--cw-text-muted)" style={{ font: 'bold 11px system-ui,sans-serif' }}>
        Energie für Veränderung (Beispieldarstellung)
      </text>
      <path d="M48 150 H426" stroke="var(--cw-border-subtle)" strokeWidth="2" strokeLinecap="round" />
      <path d="M48 36 V154" stroke="var(--cw-border-subtle)" strokeWidth="2" strokeLinecap="round" />
      <text x="380" y="176" fill="var(--cw-text-muted)" style={{ font: '11px system-ui,sans-serif' }}>
        Projekt‑/ Change‑Zeit →
      </text>
      <path
        d="M 56 118 C 120 146, 150 164, 200 152 S 290 118, 328 134 S 398 150, 430 138"
        fill="none"
        stroke="var(--cw-accent)"
        strokeOpacity={0.38}
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M 56 118 C 120 146, 150 164, 200 152 S 290 118, 328 134 S 398 150, 430 138"
        fill="none"
        stroke="var(--cw-accent-strong)"
        strokeOpacity={0.76}
        strokeWidth="3.5"
      />
      {[
        { x: 58, lb: 'Unsicherheit' },
        { x: 146, lb: 'Rückstellung' },
        { x: 234, lb: 'Auseinanders.' },
        { x: 328, lb: 'Experiment' },
        { x: 418, lb: 'Verankerung' },
      ].map((p) => (
        <g key={p.lb}>
          <circle cx={p.x} cy="92" r="5" fill="var(--cw-accent-strong)" opacity={p.lb.includes('Aus') ? 0.92 : 0.65} />
          <text
            x={p.x}
            y="62"
            textAnchor={p.x < 96 ? 'start' : p.x > 392 ? 'end' : 'middle'}
            fill="var(--cw-text-muted)"
            style={{ font: '10px system-ui,sans-serif' }}
          >
            {p.lb}
          </text>
        </g>
      ))}
    </SvgWrap>
  );
}

function KotterEightDiagram({ titleId }) {
  const items = [
    'Dringlichkeit',
    'Führungsnetzwerk',
    'Vision',
    'Kommunikation',
    'Befähigung',
    'Quick Wins',
    'Vertiefung',
    'Verankerung',
  ];
  return (
    <SvgWrap titleId={titleId} titleText="Klassische Ursachenfelder wenn Change stockt." vb="0 0 480 228" height="14rem">
      <text x="240" y="26" textAnchor="middle" fill="var(--cw-text-secondary)" style={{ font: '600 13px system-ui,sans-serif' }}>
        Prüfkatalog (Auszug — Kotter)
      </text>
      {items.map((txt, idx) => {
        const row = idx < 4 ? 0 : 1;
        const col = idx % 4;
        const x = 26 + col * 112;
        const y = row === 0 ? 44 : 128;
        return (
          <g key={txt}>
            <rect x={x} y={y} rx="12" width="104" height="72" fill="var(--cw-link-muted-bg)" stroke="var(--cw-accent-soft-border)" />
            <text x={x + 52} y={y + 28} textAnchor="middle" fill="var(--cw-accent-strong)" style={{ font: 'bold 13px system-ui,sans-serif' }}>
              {idx + 1}.
            </text>
            <text x={x + 52} y={y + 52} textAnchor="middle" fill="var(--cw-text)" style={{ font: 'bold 11px system-ui,sans-serif' }}>
              {txt}
            </text>
          </g>
        );
      })}
    </SvgWrap>
  );
}

function PmCmLanesDiagram({ titleId }) {
  const lanes = [
    { y: 58, label: 'Projektleitung', color: '#64748b', ms: ['Start', 'Plan', 'Gestalt.', 'Liefer.', 'Betrieb'] },
    { y: 130, label: 'Change', color: '#5b21b6', ms: ['Sinn', 'Stakeh.', 'Motiv.', 'Adopt.', 'Kultur'] },
  ];
  const lineY = -12;
  return (
    <SvgWrap titleId={titleId} titleText="Zwei Strange entlang des Produktlebenszyklus." vb="0 0 480 192" height="12rem">
      {lanes.map((lane) => (
        <g key={lane.label}>
          <text x="26" y={lane.y} fill="var(--cw-text)" style={{ font: '700 12px system-ui,sans-serif', letterSpacing: '0.04em' }}>
            {lane.label}
          </text>
          <path d={`M134 ${lane.y + lineY} H454`} stroke="var(--cw-border-subtle)" strokeWidth="10" strokeLinecap="round" />
          <path d={`M134 ${lane.y + lineY} H454`} stroke={lane.color} strokeOpacity={lane.label === 'Change' ? 0.12 : 0.06} strokeWidth="10" strokeLinecap="round" />
          {lane.ms.map((m, i) => {
            const span = (454 - 134) / (lane.ms.length - 1);
            const x = 134 + i * span;
            return (
              <g key={m}>
                <circle
                  cx={x}
                  cy={lane.y + lineY}
                  r="13"
                  fill="var(--cw-card)"
                  stroke={lane.color}
                  strokeWidth={lane.label === 'Change' ? 2.3 : 1.65}
                />
                <circle
                  cx={x}
                  cy={lane.y + lineY}
                  r="5"
                  fill={lane.color}
                  opacity={lane.label === 'Change' ? 0.92 : 0.48}
                />
                <text x={x} y={lane.y + 26} textAnchor="middle" fill="var(--cw-text-muted)" style={{ font: '10px system-ui,sans-serif' }}>
                  {m}
                </text>
              </g>
            );
          })}
        </g>
      ))}
    </SvgWrap>
  );
}

function KopfHerzHandDiagram({ titleId }) {
  const nodes = [
    { cx: 240, cy: 46, primary: 'Kopf · Verstehen', sub: 'Logik & Rollenklarheit' },
    { cx: 96, cy: 158, primary: 'Herz · Mitgehen', sub: 'Sinn & Teilhabe' },
    { cx: 384, cy: 158, primary: 'Hand · Tun', sub: 'Rituale · Skills · Alltag' },
  ];
  return (
    <SvgWrap titleId={titleId} titleText="Überlagerte Hebel: Kopf, Herz und Hand greifen ineinander." vb="0 0 480 190" height="12rem">
      <polygon points="240,54 118,154 362,154" fill="var(--cw-accent-soft-bg)" stroke="var(--cw-accent)" strokeWidth="2.5" />
      {nodes.map((n) => (
        <g key={n.primary}>
          <circle cx={n.cx} cy={n.cy} r="42" fill="var(--cw-card-soft)" stroke="var(--cw-border-subtle)" />
          <text x={n.cx} y={n.cy - 12} textAnchor="middle" fill="var(--cw-text)" style={{ font: '600 11.5px system-ui,sans-serif' }}>
            {n.primary}
          </text>
          <text x={n.cx} y={n.cy + 10} textAnchor="middle" fill="var(--cw-text-muted)" style={{ font: '10px system-ui,sans-serif' }}>
            {n.sub}
          </text>
        </g>
      ))}
    </SvgWrap>
  );
}

function WhyLayersDiagram({ titleId }) {
  const layers = [
    { x: 100, y: 42, w: 280, h: 42, txt: 'Organisation — Kontext · Dringlichkeit' },
    { x: 80, y: 96, w: 320, h: 42, txt: 'Team — Auftrag · Rollenbild' },
    { x: 60, y: 150, w: 360, h: 42, txt: 'Persönlich — Vorteile im Alltag heute' },
  ];
  return (
    <SvgWrap titleId={titleId} titleText="Geschachteltes Warum‑Verständnis." vb="0 0 480 206" height="12.95rem">
      {layers.map((L) => (
        <g key={L.txt}>
          <rect
            x={L.x}
            y={L.y}
            rx="16"
            width={L.w}
            height={L.h}
            fill="var(--cw-link-muted-bg)"
            stroke="var(--cw-accent-soft-border)"
          />
          <text x={L.x + L.w / 2} y={L.y + L.h / 2 + 5} textAnchor="middle" fill="var(--cw-text-secondary)" style={{ font: '600 12px system-ui,sans-serif' }}>
            {L.txt}
          </text>
        </g>
      ))}
    </SvgWrap>
  );
}

function StakeholderMatrixDiagram({ titleId }) {
  return (
    <SvgWrap titleId={titleId} titleText="Priorisierung nach Einfluss und Einstellung." vb="0 0 480 218" height="13.85rem">
      <text x="240" y="28" textAnchor="middle" fill="var(--cw-text-secondary)" style={{ font: '600 13px system-ui,sans-serif' }}>
        Stakeholder‑Matrix (Konzept)
      </text>
      <rect x="64" y="56" width="352" height="128" rx="14" fill="var(--cw-card-soft)" stroke="var(--cw-border-subtle)" />
      <path d="M240 56 V184 M64 128 H416" stroke="var(--cw-border-subtle)" strokeWidth="2" />
      <text x="246" y="96" fill="var(--cw-text-muted)" style={{ font: '11px system-ui,sans-serif' }}>
        kritisch ← → befürwortend
      </text>
      <text x="72" y="124" fill="var(--cw-text-muted)" style={{ font: '11px system-ui,sans-serif' }}>
        wenig Einfluss
      </text>
      <text x="318" y="124" fill="var(--cw-text-muted)" style={{ font: '11px system-ui,sans-serif' }}>
        grosser Einfluss
      </text>
      {[
        { x: 146, y: 84, lb: 'Beobachten' },
        { x: 342, y: 84, lb: 'Aktiv gestalten' },
        { x: 146, y: 160, lb: 'Informieren' },
        { x: 342, y: 160, lb: 'Einbinden / Co‑Erstellung' },
      ].map((q) => (
        <text key={q.lb} x={q.x} y={q.y} textAnchor="middle" fill="var(--cw-text-muted)" style={{ font: '600 11px system-ui,sans-serif' }}>
          {q.lb}
        </text>
      ))}
    </SvgWrap>
  );
}

function CommsPyramidDiagram({ titleId }) {
  const levels = [
    { y: 48, w: 120, txt: '1:1 / Kleingruppe' },
    { y: 106, w: 200, txt: 'Workshop • Team' },
    { y: 164, w: 296, txt: 'All‑Hands • Broadcasts' },
  ];
  const cx = 240;
  return (
    <SvgWrap titleId={titleId} titleText="Mehr Tiefe dort, wo weniger Köpfe entscheiden müssen." vb="0 0 480 224" height="14rem">
      <text x="240" y="28" textAnchor="middle" fill="var(--cw-text-secondary)" style={{ font: '600 13px system-ui,sans-serif' }}>
        Kanalwahl zwischen Reichweite und Detailtiefe
      </text>
      {levels.map((L, idx) => (
        <g key={L.txt}>
          <rect
            x={cx - L.w / 2}
            y={L.y}
            width={L.w}
            height="44"
            rx="12"
            fill={idx === 2 ? 'var(--cw-accent-soft-bg)' : 'var(--cw-link-muted-bg)'}
            stroke="var(--cw-accent-soft-border)"
          />
          <text x={cx} y={L.y + 29} textAnchor="middle" fill="var(--cw-text)" style={{ font: '600 13px system-ui,sans-serif' }}>
            {L.txt}
          </text>
        </g>
      ))}
    </SvgWrap>
  );
}

function StoryArcDiagram({ titleId }) {
  return (
    <SvgWrap titleId={titleId} titleText="Dramaturgie eines knappen Narrativs zur Veränderung." vb="0 0 480 160" height="10.25rem">
      <path
        d="M48 126 C160 132,196 54,266 62 C336 72,392 148,434 146"
        fill="none"
        stroke="var(--cw-accent)"
        strokeOpacity={0.72}
        strokeWidth="6"
        strokeLinecap="round"
      />
      {[
        { cx: 64, lb: 'Einleitung' },
        { cx: 274, lb: 'Kernbotschaft' },
        { cx: 438, lb: 'Nächste Schritte' },
      ].map((p) => (
        <g key={p.lb}>
          <circle cx={p.cx} cy="126" r="12" fill="var(--cw-card-soft)" stroke="var(--cw-accent-strong)" strokeWidth="2.75" />
          <text x={p.cx} y="154" textAnchor={p.lb === 'Einleitung' ? 'middle' : p.lb === 'Kernbotschaft' ? 'middle' : 'end'} fill="var(--cw-text-muted)" style={{ font: '600 11px system-ui,sans-serif' }}>
            {p.lb}
          </text>
        </g>
      ))}
    </SvgWrap>
  );
}

function ElevatorDiagram({ titleId }) {
  const cols = [
    { x: 44, w: 100, t: 'Problem' },
    { x: 160, w: 98, t: 'Ansatz' },
    { x: 274, w: 88, t: 'Nutzen' },
    { x: 378, w: 80, t: 'Nächster Schritt' },
  ];
  return (
    <SvgWrap titleId={titleId} titleText="Elevator‑Pitch‑Kette in etwa 90 Sekunden." vb="0 0 480 150" height="9.85rem">
      <text x="240" y="28" textAnchor="middle" fill="var(--cw-text-secondary)" style={{ font: '600 13px system-ui,sans-serif' }}>
        Pitch‑Gerüst (≙ 90 s)
      </text>
      {cols.map((col, i) => (
        <g key={col.t}>
          <rect x={col.x} y="54" width={col.w} height="74" rx="14" fill="var(--cw-link-muted-bg)" stroke="var(--cw-accent-soft-border)" />
          <text x={col.x + col.w / 2} y="98" textAnchor="middle" fill="var(--cw-text)" style={{ font: '600 12px system-ui,sans-serif' }}>
            {col.t}
          </text>
          {i < cols.length - 1 && (
            <>
              <path d={`M${col.x + col.w + 2},92 L${col.x + col.w + 12},92`} stroke="var(--cw-text-muted)" strokeWidth="2.5" />
              <polygon
                points={`${col.x + col.w + 14},92 ${col.x + col.w + 6},87 ${col.x + col.w + 6},97`}
                fill="var(--cw-text-muted)"
              />
            </>
          )}
        </g>
      ))}
    </SvgWrap>
  );
}

function LifecycleDiagram({ titleId }) {
  const ms = [
    { x: 64, lb: 'Start & Kontext' },
    { x: 184, lb: 'regelmässige Pulse' },
    { x: 296, lb: 'Go‑live‑Vorbereitung' },
    { x: 416, lb: 'Verankern' },
  ];
  return (
    <SvgWrap titleId={titleId} titleText="Change als durchgängiges Arbeitspaket neben Projekt‑Meilensteinen." vb="0 0 480 180" height="11.65rem">
      <path d="M40 90 H446" stroke="var(--cw-border-subtle)" strokeWidth="12" strokeLinecap="round" />
      <path d="M40 90 H446" stroke="var(--cw-accent)" strokeOpacity={0.18} strokeWidth="12" strokeLinecap="round" />
      {ms.map((m) => (
        <g key={m.lb}>
          <circle cx={m.x} cy="90" r="18" fill="var(--cw-card-soft)" stroke="var(--cw-accent-strong)" strokeWidth="2.75" />
          <circle cx={m.x} cy="90" r="5" fill="var(--cw-accent-strong)" opacity={0.55} />
          <text x={m.x} y="138" textAnchor="middle" fill="var(--cw-text-muted)" style={{ font: '600 10.5px system-ui,sans-serif' }}>
            {m.lb}
          </text>
        </g>
      ))}
      <text x="240" y="168" textAnchor="middle" fill="var(--cw-text-muted)" style={{ font: '500 10px system-ui,sans-serif' }}>
        Arbeitspunkte sollten wiederkehrend mit im Projektplan stehen
      </text>
    </SvgWrap>
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

function Graphic({ variant, titleId }) {
  const C = DIAGRAM_REGISTRY[variant];
  return C ? <C titleId={titleId} /> : null;
}

function DiagramFigure({ entry }) {
  const capId = useId();
  const titleId = useId();
  if (!DIAGRAM_REGISTRY[entry.id]) return null;
  return (
    <figure className="cw-diagram-frame" aria-labelledby={capId}>
      <div className="cw-diagram-svg-wrap">
        <Graphic variant={entry.id} titleId={titleId} />
      </div>
      <figcaption id={capId} className="cw-diagram-caption">
        {entry.caption}
      </figcaption>
    </figure>
  );
}

/**
 * @param {{ entries?: { id: string, caption: string }[] }} props
 */
export function ChangeWorkflowDiagrams({ entries }) {
  if (!entries?.length) return null;
  return (
    <div className="cw-diagram-stack">
      {entries.map((entry, idx) => (
        <DiagramFigure key={`${entry.id}-${idx}`} entry={entry} />
      ))}
    </div>
  );
}
