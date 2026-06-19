#!/usr/bin/env node
/**
 * Erzeugt eine 1-seitige Valkeen-2026-Master-Gamma (API).
 * Workspace-Template: in Gamma manuell „Als Vorlage speichern“ (API unterstützt das nicht).
 *
 * GAMMA_API_KEY aus Umgebung oder:
 *   aws lambda get-function-configuration --function-name website-kickoff-studio-api \
 *     --query 'Environment.Variables.GAMMA_API_KEY' --output text
 */

const GAMMA_API = 'https://public-api.gamma.app/v1.0';
const POLL_MS = 5000;
const POLL_MAX = 80;

const LOGO = 'https://manuel-weiss.ch/onboarding/kickoff/image1.png';

// Folie 1 des echten Masters (nur Stichworte — Gamma layoutet 1 Karte)
const INPUT_TEXT = `# Valkeen 2026 · Tempus Resource

Resource Portfolio Management — Implementierungs- und Sales-Master.

**Kunde:** {{customer}}
**Projekt:** {{project}}

---

Layout wie Valkeen-2026-PPTX: Navy-Gradient / Executive-Dunkel, grüner Akzent links, Logo oben links, Footer „Valkeen GmbH · Tempus Resource“. Eine Folie only.`;

const ADDITIONAL = [
  'Valkeen 2026 Corporate Design — exakt beibehalten.',
  'Primär #0f4c81, Akzent #00a878, Türkis #0ea5e9, Slate #335B74.',
  'Dunkler Executive-Hintergrund oder Navy-Gradient; minimaler Text; starke Typografie.',
  'Keine Stock-Foto-Wände; Icons und klare Diagramm-Flächen.',
  'Genau EINE Folie — Gamma API from-template erlaubt nur 1 Seite (nicht 121).',
  'Referenz-Master: valkeen-2026-master.pptx (121 Folien) — nur per Gamma-Import oder Kick-off „Gamma Master (121)“.',
].join('\n');

async function getApiKey() {
  if (process.env.GAMMA_API_KEY?.trim()) return process.env.GAMMA_API_KEY.trim();
  const { execSync } = await import('node:child_process');
  try {
    const key = execSync(
      'aws lambda get-function-configuration --function-name website-kickoff-studio-api --region eu-central-1 --query "Environment.Variables.GAMMA_API_KEY" --output text',
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    ).trim();
    if (key && key !== 'None') return key;
  } catch {
    /* ignore */
  }
  throw new Error('GAMMA_API_KEY fehlt (export GAMMA_API_KEY=… oder AWS-Lambda-Env)');
}

async function gamma(method, path, apiKey, body) {
  const res = await fetch(`${GAMMA_API}${path}`, {
    method,
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) throw new Error(`Gamma ${res.status}: ${text.slice(0, 500)}`);
  return data;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function listThemes(apiKey, query) {
  const items = [];
  let after = '';
  for (let page = 0; page < 20; page++) {
    const q = new URLSearchParams({ limit: '50', type: 'custom' });
    if (query) q.set('query', query);
    if (after) q.set('after', after);
    const res = await gamma('GET', `/themes?${q}`, apiKey);
    for (const t of res.data || []) items.push(t);
    if (!res.hasMore || !res.nextCursor) break;
    after = res.nextCursor;
  }
  return items;
}

async function pollGeneration(apiKey, generationId) {
  for (let i = 0; i < POLL_MAX; i++) {
    if (i > 0) await sleep(POLL_MS);
    const st = await gamma('GET', `/generations/${generationId}`, apiKey);
    const status = (st.status || st.generationStatus || 'pending').toLowerCase();
    if (status === 'completed' || status === 'complete') {
      return {
        gammaUrl: st.gammaUrl || st.url || st.generation?.gammaUrl,
        gammaId: st.gammaId || st.id,
        generationId,
      };
    }
    if (status === 'failed' || status === 'error') {
      throw new Error('Gamma-Generierung fehlgeschlagen');
    }
    process.stderr.write('.');
  }
  throw new Error('Timeout beim Warten auf Gamma');
}

async function main() {
  const apiKey = await getApiKey();
  const themes = await listThemes(apiKey, 'valkeen');
  let themeId = process.env.VALKEEN_GAMMA_THEME_ID || '';
  if (!themeId && themes.length) {
    themeId = themes[0].id;
    console.error(`Hinweis: Nutze vorhandenes Custom-Theme „${themes[0].name}" (${themeId})`);
  }

  const body = {
    inputText: INPUT_TEXT,
    textMode: 'preserve',
    format: 'presentation',
    numCards: 1,
    cardSplit: 'inputTextBreaks',
    title: 'Valkeen 2026 · Master (Template-Quelle)',
    additionalInstructions: ADDITIONAL,
    textOptions: {
      amount: 'medium',
      language: 'de',
      tone: 'professionell, klar',
      audience: 'Enterprise IT und PMO',
    },
    imageOptions: {
      source: 'themeAccent',
      style: 'Valkeen corporate, navy and teal, minimal stock',
    },
    cardOptions: {
      dimensions: '16x9',
      headerFooter: {
        topLeft: { type: 'image', source: 'custom', src: LOGO, size: 'sm' },
        bottomRight: { type: 'text', value: 'Valkeen GmbH · Tempus Resource' },
        hideFromFirstCard: false,
      },
    },
  };
  if (themeId) body.themeId = themeId;

  console.error('Starte 1-seitige Valkeen-Master-Gamma …');
  const created = await gamma('POST', '/generations', apiKey, body);
  const genId = created.generationId || created.id;
  if (!genId) throw new Error('Keine generationId: ' + JSON.stringify(created));

  const result = await pollGeneration(apiKey, genId);
  console.error('\n');

  console.log(JSON.stringify(result, null, 2));
  console.log(`
✅ Gamma erstellt.

Als **Workspace-Template** speichern (nur in der Gamma-App, nicht per API):

1. Öffne: ${result.gammaUrl}
2. Prüfe Layout/Farben — bei Bedarf Theme in Gamma anpassen und erneut speichern.
3. **⋯** (Menü) → **Save copy as template** / **Als Vorlage speichern**
   Oder: Dashboard → **Templates** → **+ Add a gamma** → diese Datei wählen.
4. Name z. B. „Valkeen 2026 · Tempus Master“.
5. Template-ID kopieren (⋯ → Copy template ID / gammaId) und setzen:
   VALKEEN_GAMMA_TEMPLATE_ID=<id>  (Lambda kickoff-studio-api)

Die 121-Folien-PPTX bleibt separat unter:
  https://manuel-weiss.ch/onboarding/kickoff/valkeen-2026-master.pptx
Workspace-Templates in Gamma sind immer **1 Seite** — für volle Decks weiter „Gamma Master (121)“ im Kick-off Studio nutzen.
`);
  if (result.gammaId) {
    console.log(`gammaId (nach Fertigstellung): ${result.gammaId}`);
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
