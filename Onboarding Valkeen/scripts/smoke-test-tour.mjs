#!/usr/bin/env node
/**
 * Smoke-Test für eine Tempus-Tour.
 *
 * Lädt eine Tour vom Backend, öffnet die Tempus-Domain mit Playwright headless
 * und prüft, ob die Selectors aller Steps Treffer liefern. Ergebnis als JSON
 * auf stdout; nicht-null Selectors → exit 0, fehlende → exit 1.
 *
 * Soll als monatlicher Cron laufen, damit Tempus-Updates frühzeitig auffallen.
 *
 * Voraussetzung:
 *   npm i -g playwright   # oder lokal in einem CI-Container
 *
 * Aufruf:
 *   PLAYWRIGHT_TEMPUS_USER=user@kunde.de PLAYWRIGHT_TEMPUS_PWD=secret \
 *     CUSTOMER_ID=demo TOUR_ID=tour_rm_basics \
 *     node "Onboarding Valkeen/scripts/smoke-test-tour.mjs"
 *
 * NB: Login-Flow muss pro Kunde angepasst werden (SSO-Variationen). Default ist
 * ein fail-soft mit klarer Logmeldung.
 */

const API_BASE = process.env.TRAINING_API_BASE || 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1';
const CUSTOMER_ID = process.env.CUSTOMER_ID || 'demo';
const TOUR_ID = process.env.TOUR_ID || 'tour_rm_basics';
const TOKEN = process.env.TRAINING_TOKEN;

if (!TOKEN) {
  console.error('TRAINING_TOKEN nicht gesetzt – kein Smoke-Test möglich.');
  process.exit(2);
}

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('playwright nicht installiert. Installation via "npm i playwright".');
  process.exit(2);
}

async function fetchTour() {
  const res = await fetch(`${API_BASE}/training-admin/customers/${CUSTOMER_ID}/tours/${TOUR_ID}`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
  if (!res.ok) throw new Error(`Tour fetch ${res.status}`);
  return res.json();
}

async function main() {
  const tour = await fetchTour();
  const url = `https://${tour.domainHint || `${CUSTOMER_ID}.prosymmetry.com`}/`;
  console.log(`Smoke-Test: ${tour.title} → ${url}`);
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  try {
    await page.goto(url, { timeout: 60000 });
  } catch (e) {
    console.error('Tempus-Seite konnte nicht geladen werden:', e.message);
    await browser.close();
    process.exit(1);
  }

  console.log('TODO: Login (kunden-spezifisch). Skript liefert nur Selector-Probe.');

  const report = [];
  for (const step of tour.steps) {
    if (!step.target?.selectors?.length) {
      report.push({ id: step.id, kind: step.kind, ok: true, note: 'kein Selector (theory/checklist)' });
      continue;
    }
    let found = null;
    for (const sel of step.target.selectors) {
      try {
        const handle = await page.waitForSelector(sel, { timeout: 1500 });
        if (handle) { found = sel; break; }
      } catch { /* try next */ }
    }
    report.push({ id: step.id, kind: step.kind, ok: !!found, foundSelector: found });
  }

  await browser.close();

  const broken = report.filter((r) => !r.ok);
  console.log(JSON.stringify({ tour: tour.id, customer: CUSTOMER_ID, report, brokenCount: broken.length }, null, 2));
  process.exit(broken.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('Smoke-Test fehlgeschlagen:', e);
  process.exit(1);
});
