/**
 * Persönlichkeits-Song Generator – SVG-Renderer
 *
 * Drei Charts:
 *  1. renderBigFiveRadar(scales, facets, opts) → SVG-Pentagon mit 5 Domänen,
 *     mit Facetten-Balken im Inneren.
 *  2. renderNatalWheel(chart, opts) → klassisches astrologisches Rad mit
 *     12 Segmenten, Planeten-Glyphen, Aspekt-Linien innen.
 *  3. renderMusicDNAcard(musicDNA, opts) → kompakte Karten-Darstellung
 *     der Klang-DNA (Tonart, Tempo, Energie usw.) – nicht zwingend SVG,
 *     wir liefern hier ein DocumentFragment mit den richtigen Klassen.
 */

(function () {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  function svg(tag, attrs, parent) {
    const el = document.createElementNS(SVG_NS, tag);
    if (attrs) Object.keys(attrs).forEach(k => el.setAttribute(k, attrs[k]));
    if (parent) parent.appendChild(el);
    return el;
  }

  function deg2rad(d) { return d * Math.PI / 180; }

  function getResponsiveChartSize(maxSize, minSize) {
    maxSize = maxSize || 380;
    minSize = minSize || 260;
    if (typeof window === 'undefined' || !window.innerWidth) return maxSize;
    const pad = window.innerWidth < 480 ? 32 : 56;
    return Math.max(minSize, Math.min(maxSize, window.innerWidth - pad));
  }

  function applyResponsiveSvg(svgEl, size) {
    svgEl.setAttribute('width', '100%');
    svgEl.setAttribute('height', 'auto');
    svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svgEl.style.maxWidth = size + 'px';
    svgEl.style.display = 'block';
    svgEl.style.margin = '0 auto';
    return svgEl;
  }

  // Kompakte Big-Five-Balken (Mobile / schmale Screens)
  function renderBigFiveBars(scales) {
    const labels = [
      { key: 'BIG5_O', label: 'Offenheit', color: '#a78bfa' },
      { key: 'BIG5_C', label: 'Gewissenhaftigkeit', color: '#34d399' },
      { key: 'BIG5_E', label: 'Extraversion', color: '#fbbf24' },
      { key: 'BIG5_A', label: 'Verträglichkeit', color: '#f472b6' },
      { key: 'BIG5_N', label: 'Neurotizismus', color: '#60a5fa' }
    ];
    const wrap = document.createElement('div');
    wrap.className = 'sg-big5-bars';
    wrap.setAttribute('role', 'img');
    wrap.setAttribute('aria-label', 'Big-Five Persönlichkeitsprofil als Balken');
    labels.forEach(function (l) {
      const val = Math.max(0, Math.min(100, scales[l.key] || 0));
      const row = document.createElement('div');
      row.className = 'sg-big5-bar-row';
      const head = document.createElement('div');
      head.className = 'sg-big5-bar-head';
      const lbl = document.createElement('span');
      lbl.className = 'sg-big5-bar-label';
      lbl.textContent = l.label;
      const num = document.createElement('span');
      num.className = 'sg-big5-bar-val';
      num.textContent = String(Math.round(val));
      head.appendChild(lbl);
      head.appendChild(num);
      const track = document.createElement('div');
      track.className = 'sg-big5-bar-track';
      const fill = document.createElement('div');
      fill.className = 'sg-big5-bar-fill';
      fill.style.width = val + '%';
      fill.style.background = l.color;
      track.appendChild(fill);
      row.appendChild(head);
      row.appendChild(track);
      wrap.appendChild(row);
    });
    return wrap;
  }

  // ────────────────────────────────────────────────────────────
  // 1) Big-Five-Radar
  // ────────────────────────────────────────────────────────────
  function renderBigFiveRadar(scales, facets, opts) {
    opts = opts || {};
    const size = opts.size || getResponsiveChartSize(380, 260);
    const cx = size / 2, cy = size / 2;
    const radius = size * 0.38;
    const labels = [
      { key:'BIG5_O', label:'Offenheit',          color:'#a78bfa' },
      { key:'BIG5_C', label:'Gewissenhaftigkeit', color:'#34d399' },
      { key:'BIG5_E', label:'Extraversion',       color:'#fbbf24' },
      { key:'BIG5_A', label:'Verträglichkeit',    color:'#f472b6' },
      { key:'BIG5_N', label:'Neurotizismus',      color:'#60a5fa' }
    ];

    const root = svg('svg', {
      viewBox: '0 0 ' + size + ' ' + size,
      class: 'sg-radar', width: size, height: size,
      role: 'img', 'aria-label':'Big-Five Persönlichkeitsprofil'
    });

    // Hintergrund-Polygone (Skala 20/40/60/80/100)
    for (let r = 1; r <= 5; r++) {
      const points = labels.map((_, i) => {
        const a = -Math.PI / 2 + i * (2 * Math.PI / labels.length);
        const rr = radius * r / 5;
        return (cx + rr * Math.cos(a)) + ',' + (cy + rr * Math.sin(a));
      }).join(' ');
      svg('polygon', {
        points, fill:'none', stroke:'rgba(167,139,250,0.18)', 'stroke-width': r === 5 ? 1.5 : 0.8
      }, root);
    }
    // Achsenlinien
    labels.forEach((_, i) => {
      const a = -Math.PI / 2 + i * (2 * Math.PI / labels.length);
      svg('line', {
        x1: cx, y1: cy,
        x2: cx + radius * Math.cos(a), y2: cy + radius * Math.sin(a),
        stroke:'rgba(167,139,250,0.25)', 'stroke-width':0.8
      }, root);
    });

    // Daten-Polygon
    const points = labels.map((l, i) => {
      const a = -Math.PI / 2 + i * (2 * Math.PI / labels.length);
      const v = Math.max(0, Math.min(100, scales[l.key] || 0)) / 100;
      return (cx + radius * v * Math.cos(a)) + ',' + (cy + radius * v * Math.sin(a));
    }).join(' ');
    svg('polygon', {
      points, fill:'rgba(99,102,241,0.35)', stroke:'#6366f1', 'stroke-width':2,
      'stroke-linejoin':'round'
    }, root);

    // Werte-Punkte
    labels.forEach((l, i) => {
      const a = -Math.PI / 2 + i * (2 * Math.PI / labels.length);
      const v = Math.max(0, Math.min(100, scales[l.key] || 0)) / 100;
      svg('circle', {
        cx: cx + radius * v * Math.cos(a),
        cy: cy + radius * v * Math.sin(a),
        r: 5, fill: l.color, stroke:'#fff', 'stroke-width':2
      }, root);
    });

    // Labels
    labels.forEach((l, i) => {
      const a = -Math.PI / 2 + i * (2 * Math.PI / labels.length);
      const lx = cx + (radius + 28) * Math.cos(a);
      const ly = cy + (radius + 28) * Math.sin(a);
      const anchor = Math.cos(a) > 0.3 ? 'start' : (Math.cos(a) < -0.3 ? 'end' : 'middle');
      const t = svg('text', {
        x: lx, y: ly, 'text-anchor': anchor,
        'font-size':'13', 'font-weight':'600',
        fill:'#0f172a', class:'sg-radar-label'
      }, root);
      t.textContent = l.label;
      const v = svg('text', {
        x: lx, y: ly + 16, 'text-anchor': anchor,
        'font-size':'11', 'font-weight':'500',
        fill:'#64748b', class:'sg-radar-value'
      }, root);
      v.textContent = Math.round(scales[l.key] || 0);
    });

    return applyResponsiveSvg(root, size);
  }

  // ────────────────────────────────────────────────────────────
  // 2) Natal-Wheel (12-Häuser-Diagramm)
  // ────────────────────────────────────────────────────────────
  function renderNatalWheel(chart, opts) {
    opts = opts || {};
    const size = opts.size || getResponsiveChartSize(460, 280);
    const cx = size / 2, cy = size / 2;
    const rOuter = size * 0.46;
    const rSign = size * 0.40;
    const rPlanet = size * 0.32;
    const rInner = size * 0.22;
    const SIGNS = window.SongAstrology ? window.SongAstrology.SIGNS : [];
    const PLANETS = window.SongAstrology ? window.SongAstrology.PLANETS : [];

    const root = svg('svg', {
      viewBox: '0 0 ' + size + ' ' + size,
      class: 'sg-wheel', width: size, height: size,
      role: 'img', 'aria-label': 'Astrologische Geburtskarte'
    });

    // Rotation so, dass Aszendent links auf 0°/180° steht (Whole-Sign)
    const ascLon = (chart.asc !== null && typeof chart.asc === 'number') ? chart.asc : 0;
    function lonToAngle(lon) {
      // 0° = links (West), gegen den Uhrzeigersinn nach oben
      const a = (lon - ascLon + 180) % 360;
      return ((a + 360) % 360); // 0..360 mathematisch
    }
    function polar(r, lon) {
      const a = deg2rad(lonToAngle(lon));
      return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) };
    }

    // Hintergrund-Kreise
    svg('circle', { cx, cy, r: rOuter, fill: '#fff', stroke: '#e2e8f0', 'stroke-width': 1.5 }, root);
    svg('circle', { cx, cy, r: rSign,  fill: '#fafaff', stroke: '#e2e8f0', 'stroke-width': 1 }, root);
    svg('circle', { cx, cy, r: rPlanet, fill: 'transparent', stroke: '#f1f5f9', 'stroke-width': 1 }, root);
    svg('circle', { cx, cy, r: rInner, fill: '#fafaff', stroke: '#e2e8f0', 'stroke-width': 1 }, root);

    // 12 Zeichen-Segmente
    for (let i = 0; i < 12; i++) {
      const lonStart = i * 30;
      const p1 = polar(rSign, lonStart);
      const p2 = polar(rOuter, lonStart);
      svg('line', {
        x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
        stroke:'#cbd5e1', 'stroke-width': 1
      }, root);
      // Zeichen-Symbol in der Mitte des Segments
      const mid = polar((rSign + rOuter) / 2, lonStart + 15);
      const sg = SIGNS[i];
      if (sg) {
        const t = svg('text', {
          x: mid.x, y: mid.y + 6, 'text-anchor':'middle',
          'font-size': '18', fill: '#6366f1'
        }, root);
        t.textContent = sg.symbol;
      }
    }

    // 12 Häuser-Linien (Whole-Sign: identisch mit Zeichengrenzen, daher
    // hier nur die wichtigsten 4 Achsen Asc/Desc/IC/MC hervorheben)
    if (chart.houses && chart.houses.length === 12) {
      // Häuser-Nummern in der Mitte der Häuser
      chart.houses.forEach(h => {
        const lonMid = h.cuspLongitude + 15;
        const pos = polar((rPlanet + rInner) / 2 - 4, lonMid);
        const t = svg('text', {
          x: pos.x, y: pos.y, 'text-anchor':'middle',
          'font-size':'10', fill:'#94a3b8'
        }, root);
        t.textContent = String(h.house);
      });
    }

    // Asc / MC Achsen
    if (typeof chart.asc === 'number') {
      const a = polar(rOuter + 8, chart.asc);
      const b = polar(rOuter + 8, (chart.asc + 180) % 360);
      svg('line', { x1: cx, y1: cy, x2: a.x, y2: a.y, stroke:'#ef4444', 'stroke-width': 1.5, 'stroke-dasharray':'4 2' }, root);
      svg('line', { x1: cx, y1: cy, x2: b.x, y2: b.y, stroke:'#94a3b8', 'stroke-width': 1, 'stroke-dasharray':'2 2' }, root);
      const lblAsc = svg('text', { x: a.x - 6, y: a.y, 'text-anchor':'end', 'font-size':'10', 'font-weight':'700', fill:'#ef4444' }, root);
      lblAsc.textContent = 'ASC';
    }
    if (typeof chart.mc === 'number') {
      const m = polar(rOuter + 8, chart.mc);
      svg('line', { x1: cx, y1: cy, x2: m.x, y2: m.y, stroke:'#0ea5e9', 'stroke-width': 1.5, 'stroke-dasharray':'4 2' }, root);
      const lbl = svg('text', { x: m.x, y: m.y - 6, 'text-anchor':'middle', 'font-size':'10', 'font-weight':'700', fill:'#0ea5e9' }, root);
      lbl.textContent = 'MC';
    }

    // Aspekt-Linien (im inneren Kreis)
    (chart.aspects || []).forEach(asp => {
      const pa = chart.placements.find(p => p.planet === asp.a);
      const pb = chart.placements.find(p => p.planet === asp.b);
      if (!pa || !pb) return;
      const A = polar(rInner - 4, pa.longitude);
      const B = polar(rInner - 4, pb.longitude);
      svg('line', {
        x1: A.x, y1: A.y, x2: B.x, y2: B.y,
        stroke: asp.color || '#94a3b8',
        'stroke-width': asp.type === 'conjunction' ? 0 : 1.2,
        opacity: 0.55
      }, root);
    });

    // Planeten-Glyphen
    // Kollisionsvermeidung: wenn Längen < 8° auseinander, leicht versetzen
    const placements = (chart.placements || []).slice().sort((a, b) => a.longitude - b.longitude);
    const positions = [];
    placements.forEach(pl => {
      let r = rPlanet;
      // Wenn nahe an einem schon gesetzten Planeten → in 2 Ringen abwechseln
      const tooClose = positions.some(p => Math.abs((p.lon - pl.longitude + 540) % 360 - 180) < 7);
      if (tooClose) r = rPlanet - 16;
      positions.push({ lon: pl.longitude, r });
      const p = polar(r, pl.longitude);
      const t = svg('text', {
        x: p.x, y: p.y + 7, 'text-anchor':'middle',
        'font-size': pl.kind === 'luminary' ? '22' : '18',
        'font-weight':'700',
        fill: pl.kind === 'luminary' ? '#f59e0b'
            : pl.kind === 'personal' ? '#6366f1'
            : pl.kind === 'social'   ? '#10b981' : '#7c3aed'
      }, root);
      t.textContent = pl.symbol;
      const title = svg('title', null, t);
      title.textContent = pl.de + ' ' + pl.degInSign.toFixed(1) + '° ' + pl.sign +
                          (pl.house ? ' (H' + pl.house + ')' : '');
    });

    return applyResponsiveSvg(root, size);
  }

  // ────────────────────────────────────────────────────────────
  // 3) Klang-DNA-Karte (DocumentFragment)
  // ────────────────────────────────────────────────────────────
  function renderMusicDNAcard(dna) {
    const frag = document.createDocumentFragment();
    if (!dna) return frag;

    const phase = dna.evolution_phase;
    if (phase && phase.label) {
      const phaseEl = document.createElement('div');
      phaseEl.className = 'sg-dna-layer sg-dna-layer-evolution';
      phaseEl.innerHTML = '<span class="sg-dna-layer-label">Entwicklung</span>' +
        '<span class="sg-dna-layer-value">' + phase.label + '</span>';
      frag.appendChild(phaseEl);
    }

    const grid = document.createElement('div');
    grid.className = 'sg-dna-grid';
    function cell(label, value) {
      const c = document.createElement('div'); c.className = 'sg-dna-cell';
      const l = document.createElement('span'); l.className = 'sg-dna-label'; l.textContent = label;
      const v = document.createElement('span'); v.className = 'sg-dna-value'; v.textContent = value;
      c.appendChild(l); c.appendChild(v); return c;
    }
    function bar(label, value01, prov) {
      const c = document.createElement('div'); c.className = 'sg-dna-cell';
      const l = document.createElement('span'); l.className = 'sg-dna-label'; l.textContent = label;
      const wrap = document.createElement('div'); wrap.className = 'sg-dna-bar-wrap';
      const bg = document.createElement('div'); bg.className = 'sg-dna-bar';
      const fg = document.createElement('div'); fg.className = 'sg-dna-bar-fill';
      fg.style.width = Math.round((value01 || 0) * 100) + '%';
      bg.appendChild(fg); wrap.appendChild(bg);
      const txt = document.createElement('span'); txt.className = 'sg-dna-value';
      txt.textContent = Math.round((value01 || 0) * 100) + '%';
      wrap.appendChild(txt); c.appendChild(l); c.appendChild(wrap);
      if (prov && prov.base != null) {
        const hint = document.createElement('span');
        hint.className = 'sg-dna-prov';
        var parts = ['Test ' + Math.round(prov.base * 100) + '%'];
        if (prov.astro) parts.push('Resonanz ' + (prov.astro >= 0 ? '+' : '') + Math.round(prov.astro * 100));
        if (prov.identity) parts.push('Entwicklung ' + (prov.identity >= 0 ? '+' : '') + Math.round(prov.identity * 100));
        hint.textContent = parts.join(' · ');
        c.appendChild(hint);
      }
      return c;
    }
    function provCell(label, provEntry) {
      if (!provEntry) return cell(label, '—');
      const c = document.createElement('div'); c.className = 'sg-dna-cell sg-dna-prov-cell';
      const l = document.createElement('span'); l.className = 'sg-dna-label'; l.textContent = label;
      const v = document.createElement('span'); v.className = 'sg-dna-value';
      v.textContent = provEntry.final + (label === 'Tempo' ? ' BPM' : '');
      const sub = document.createElement('span');
      sub.className = 'sg-dna-prov';
      sub.textContent = 'Test ' + provEntry.base +
        (provEntry.astro ? ', Resonanz ' + (provEntry.astro >= 0 ? '+' : '') + provEntry.astro : '') +
        ' → ' + provEntry.final;
      c.appendChild(l); c.appendChild(v); c.appendChild(sub);
      return c;
    }

    const prov = dna.provenance || {};
    if (prov.tempo_bpm) {
      grid.appendChild(provCell('Tempo', prov.tempo_bpm));
    } else {
      grid.appendChild(cell('Tempo', (dna.tempo_bpm || '?') + ' BPM'));
    }
    grid.appendChild(cell('Tonart', (dna.key || '?') + ' ' + (dna.mode || '')));
    grid.appendChild(cell('Takt', dna.time_signature || '?'));
    grid.appendChild(bar('Energie', dna.energy, prov.energy));
    grid.appendChild(bar('Helligkeit', dna.brightness, prov.brightness));
    grid.appendChild(bar('Wärme', dna.warmth, prov.warmth));
    grid.appendChild(bar('Dichte', dna.density, prov.density));
    grid.appendChild(bar('Grit', dna.grit, prov.grit));

    if (dna.instrumentation) {
      const inst = [].concat(dna.instrumentation.core || [], dna.instrumentation.color || [], dna.instrumentation.rhythm || []);
      grid.appendChild(cell('Instrumente', inst.slice(0, 6).join(' · ')));
    }
    if (dna.vocal) {
      grid.appendChild(cell('Stimme', (dna.vocal.delivery || '') + ' · ' + (dna.vocal.register || '')));
    }
    frag.appendChild(grid);

    if (dna.modifiers && dna.modifiers.astro) {
      const astroLayer = document.createElement('div');
      astroLayer.className = 'sg-dna-layers';
      const row = document.createElement('div');
      row.className = 'sg-dna-layer sg-dna-layer-astro';
      row.innerHTML = '<span class="sg-dna-layer-label">Symbolische Resonanz</span>' +
        '<span class="sg-dna-layer-value">' +
        ((dna.modifiers.astro.tags || []).slice(0, 3).join(', ') || 'fein moduliert') +
        '</span>';
      astroLayer.appendChild(row);
      frag.appendChild(astroLayer);
    }

    if (dna.compose_hints) {
      const hint = document.createElement('p');
      hint.className = 'sg-dna-compose-hint';
      hint.textContent = dna.compose_hints;
      frag.appendChild(hint);
    }

    return frag;
  }

  window.SongChartRenderer = {
    renderBigFiveRadar,
    renderBigFiveBars,
    renderNatalWheel,
    renderMusicDNAcard,
    getResponsiveChartSize
  };
})();
