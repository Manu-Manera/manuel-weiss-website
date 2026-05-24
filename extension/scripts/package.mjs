/**
 * Packt extension/dist/ als ZIP für Chrome Web Store / Edge Add-ons.
 * Aufruf: npm run package
 */
import { createWriteStream, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { execSync } from 'node:child_process';

const root = resolve(new URL('..', import.meta.url).pathname);
const dist = join(root, 'dist');
const out = join(root, 'release');

if (!existsSync(dist)) {
  console.error('Bitte zuerst "npm run build" ausführen.');
  process.exit(1);
}

if (!existsSync(out)) mkdirSync(out, { recursive: true });

const manifest = JSON.parse(readFileSync(join(dist, 'manifest.json'), 'utf-8'));
const version = manifest.version || '0.0.0';
const zipPath = join(out, `valkeen-tempus-trainer-${version}.zip`);

execSync(`cd "${dist}" && zip -r "${zipPath}" . -x "*.map"`, { stdio: 'inherit' });
console.log(`Paket erstellt: ${zipPath}`);
