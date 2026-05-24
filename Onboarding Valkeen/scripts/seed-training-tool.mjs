#!/usr/bin/env node
/**
 * Seed-Skript für das Tempus-Trainings-Tool.
 *
 * Lädt
 *   - customers/index.json
 *   - customers/demo/branding.json
 *   - customers/demo/slides/*.json
 *   - customers/demo/tours/*.json
 *   - customers/demo/tours/_index.json
 *   - customers/demo/slides/_index.json
 *
 * in den S3-Bucket manuel-weiss-website unter Prefix training-admin/.
 *
 * Voraussetzung: AWS-Credentials in der Umgebung (AWS_PROFILE oder ACCESS_KEY).
 *
 * Aufruf:
 *   node "Onboarding Valkeen/scripts/seed-training-tool.mjs"
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');

const BUCKET = process.env.TRAINING_BUCKET || 'manuel-weiss-website';
const REGION = process.env.AWS_REGION || 'eu-central-1';
const PREFIX = 'training-admin/';

const s3 = new S3Client({ region: REGION });

async function putJson(key, data) {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: JSON.stringify(data, null, 2),
    ContentType: 'application/json'
  }));
  console.log(`  ✓ ${key}`);
}

async function main() {
  const seedPath = pathToFileURL(join(REPO_ROOT, 'Onboarding Valkeen', 'onboarding-app', 'src', 'data', 'seedTours.js'));
  const { DEMO_CUSTOMER_INDEX, DEMO_BRANDING, DEMO_SLIDES, DEMO_TOUR } = await import(seedPath.href);

  console.log(`Seed → s3://${BUCKET}/${PREFIX} (${REGION})`);

  await putJson(`${PREFIX}customers/index.json`, DEMO_CUSTOMER_INDEX);
  await putJson(`${PREFIX}customers/${DEMO_BRANDING.customerId}/branding.json`, DEMO_BRANDING);

  for (const slide of DEMO_SLIDES) {
    await putJson(`${PREFIX}customers/${slide.customerId}/slides/${slide.id}.json`, slide);
  }
  await putJson(`${PREFIX}customers/${DEMO_BRANDING.customerId}/slides/_index.json`, {
    slides: DEMO_SLIDES.map((s) => ({ id: s.id, title: s.title, updatedAt: s.updatedAt }))
  });

  await putJson(`${PREFIX}customers/${DEMO_TOUR.customerId}/tours/${DEMO_TOUR.id}.json`, DEMO_TOUR);
  await putJson(`${PREFIX}customers/${DEMO_TOUR.customerId}/tours/_index.json`, {
    tours: [{
      id: DEMO_TOUR.id,
      title: DEMO_TOUR.title,
      status: DEMO_TOUR.status,
      audience: DEMO_TOUR.audience,
      updatedAt: DEMO_TOUR.updatedAt
    }]
  });

  console.log('\nFertig.');
}

main().catch((e) => {
  console.error('Seed fehlgeschlagen:', e);
  process.exit(1);
});
