#!/usr/bin/env node
/**
 * Erzeugt eine 1-seitige Valkeen/Tempus-Referenz-Gamma zum Anlegen eines Custom Themes.
 *
 * Die Gamma-API kann KEINE Themes erstellen (POST /themes → 404).
 * Workflow: Dieses Deck öffnen → Farben/Fonts prüfen → in Gamma UI „Als Theme speichern“.
 *
 * Farben aus valkeen-2026-master.pptx Theme „Blau II“:
 *   dk2/accent headings #335B74, accent1 #1CADE4, accent2 #2683C6,
 *   accent3 #27CED7, accent4 #42BA97, lt2 #DFE3E5
 *
 * Env: GAMMA_API_KEY
 */

const GAMMA_API = 'https://public-api.gamma.app/v1.0';
const POLL_MS = 5000;
const POLL_MAX = 80;
const OUT = new URL('../docs/gamma-valkeen-theme-setup-result.json', import.meta.url);

const INPUT_TEXT = `# Valkeen · Tempus Resource
## Theme-Referenz „Blau II“

Diese eine Karte dient als Vorlage für ein **Custom Theme** in Gamma.

**Titelfolie-Stil:** Linkes Navy-Panel (#335B74) mit weißem Titel, rechts Teal-Akzent (#27CED7) oder dezentes Tech-Motiv.

**Inhaltsfolie-Stil:** Weißer Hintergrund, zentrierter Titel in Slate-Navy (#335B74), grauer Untertitel (#6B7280), schwarzer Body-Text, Footer „Valkeen GmbH · Tempus Resource“.

---

# Beispiel-Inhaltsfolie
## Eyebrow / Untertitel in Grau

- Akzent Teal #27CED7 für Icons und Hervorhebungen
- Akzent Grün #42BA97 für positive Callouts
- Akzent Blau #2683C6 für Diagramme
- Schrift: Calibri / Inter, viel Weißraum, wenig Text pro Folie`;

const ADDITIONAL = [
  'Exakt wie Tempus Resource Valkeen-Master (Theme Blau II aus valkeen-2026-master.pptx).',
  'Titelfolie: split layout — linkes vertikales Navy-Panel 35%, rechts Teal/Cyan mit dezenter Tech-Hand-Grafik (nicht überladen).',
  'Inhaltsfolien: rein weiß, zentrierte Überschrift #335B74 bold, Untertitel #8899A6, Body #1A1A1A.',
  'Footer-Leiste unten: dunkles Navy #335B74 mit weißem Text links Copyright Valkeen GmbH, Mitte WWW.VALKEEN.COM, rechts Kontakt.',
  'Akzentfarben: #1CADE4 #2683C6 #27CED7 #42BA97. Keine grellen Stock-Fotos.',
  'Corporate, ruhig, enterprise — wie ProSymmetry Tempus Sales Decks.',
].join('\n');

async function getApiKey() {
  if (process.env.GAMMA_API_KEY?.trim()) return process.env.GAMMA_API_KEY.trim();
  const { readFileSync, existsSync } = await import('node:fs');
  const envPath = '/Users/manumanera/Valkeen/docs/horizon_workshop/.env';
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^GAMMA_API_KEY=(.+)$/);
      if (m) return m[1].trim().replace(/^["']|["']$/g, '');
    }
  }
  throw new Error('GAMMA_API_KEY fehlt');
}

async function gamma(method, path, apiKey, body) {
  const res = await fetch(`${GAMMA_API}${path}`, {
    method,
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': 'Valkeen-Theme-Setup/1.0',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Gamma ${res.status}: ${text.slice(0, 500)}`);
  return text ? JSON.parse(text) : {};
}

async function listCustomThemes(apiKey) {
  const items = [];
  let after = '';
  for (let i = 0; i < 20; i++) {
    const q = new URLSearchParams({ limit: '50', type: 'custom' });
    if (after) q.set('after', after);
    const res = await gamma('GET', `/themes?${q}`, apiKey);
    items.push(...(res.data || []));
    if (!res.hasMore || !res.nextCursor) break;
    after = res.nextCursor;
  }
  return items.filter((t) => /valk|tempus|blau/i.test(t.name || ''));
}

async function poll(apiKey, generationId) {
  for (let i = 0; i < POLL_MAX; i++) {
    if (i) await new Promise((r) => setTimeout(r, POLL_MS));
    const st = await gamma('GET', `/generations/${generationId}`, apiKey);
    const status = (st.status || '').toLowerCase();
    process.stderr.write(`  [${i + 1}] ${status}\n`);
    if (status === 'completed') return st;
    if (status === 'failed') throw new Error(JSON.stringify(st));
  }
  throw new Error('Timeout');
}

async function main() {
  const apiKey = await getApiKey();
  const custom = await listCustomThemes(apiKey);
  if (custom.length) {
    console.error('Bereits Custom Themes:', custom.map((t) => `${t.name} (${t.id})`).join(', '));
  }

  const body = {
    inputText: INPUT_TEXT,
    textMode: 'preserve',
    format: 'presentation',
    numCards: 2,
    cardSplit: 'inputTextBreaks',
    title: 'Valkeen · Tempus Theme Referenz (Blau II)',
    additionalInstructions: ADDITIONAL,
    themeId: 'marine',
    textOptions: {
      amount: 'medium',
      language: 'de',
      tone: 'professionell, klar',
      audience: 'Enterprise PMO',
    },
    imageOptions: {
      source: 'themeAccent',
      style: 'Tempus Valkeen corporate navy teal minimal',
    },
    cardOptions: {
      dimensions: '16x9',
      headerFooter: {
        bottomRight: { type: 'text', value: 'Valkeen GmbH · Tempus Resource' },
      },
    },
  };

  console.error('Generiere Theme-Referenz-Deck (2 Karten: Titel + Inhalt) …');
  const created = await gamma('POST', '/generations', apiKey, body);
  const genId = created.generationId;
  if (!genId) throw new Error(JSON.stringify(created));
  const result = await poll(apiKey, genId);

  const out = {
    ...result,
    note: 'In Gamma UI: Theme anpassen → Als Custom Theme speichern → themeId in VALKEEN_GAMMA_THEME_ID',
    colors: {
      navy: '#335B74',
      teal: '#27CED7',
      blue: '#2683C6',
      lightBlue: '#1CADE4',
      green: '#42BA97',
      gray: '#DFE3E5',
    },
  };
  const { writeFileSync, mkdirSync } = await import('node:fs');
  const { dirname } = await import('node:path');
  const outPath = new URL(OUT).pathname;
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(out, null, 2));

  console.log(`\n✅ Theme-Referenz: ${result.gammaUrl}`);
  console.log(`
Nächste Schritte in Gamma:
1. Deck öffnen und Farben prüfen (Navy #335B74, Teal #27CED7)
2. ⋯ → **Customize theme** / Theme bearbeiten
3. **Save as custom theme** → Name: „Valkeen Tempus Blau II“
4. Theme-ID kopieren → export VALKEEN_GAMMA_THEME_ID=<id>
5. Walkthrough neu generieren: python3 scripts/post-excel-walkthrough-to-gamma.py
`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
