// V54 P0 — Preuve automatisée : VISIT_DAY_DOES_NOT_MUTATE_PROGRESS.
// Visiter des pages /day/[id] (consultation seule, aucune interaction) NE DOIT
// PAS muter data/progress.json. On compare le hash du fichier avant/après une
// navigation réelle au navigateur — SANS aucune sauvegarde/restauration
// (contrairement au harnais visuel : ici on veut prouver la cause racine).
//
// Usage : node scripts/v54-progress-integrity.mjs [baseUrl]
// Sort 1 si le fichier a muté (régression P0), 0 sinon.
import { chromium } from 'playwright-core';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const EXEC = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASE = process.argv[2] ?? 'http://127.0.0.1:3200';
const PROGRESS = join(process.cwd(), 'data', 'progress.json');
const DAYS = ['/day/1', '/day/5', '/day/186', '/day/320'];

const hash = () => createHash('sha1').update(readFileSync(PROGRESS)).digest('hex');
const before = hash();
console.log(`── V54 P0 · intégrité de progression (consultation seule)`);
console.log(`progress.json avant : ${before}`);

const browser = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] });
try {
  for (const path of DAYS) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 30000 });
    // Laisser filer d'éventuels effets différés + déclencher un pagehide réel.
    await page.waitForTimeout(400);
    await page.close(); // provoque pagehide/unmount des composants clients
    await new Promise((r) => setTimeout(r, 150));
    const now = hash();
    console.log(`  visité ${path.padEnd(10)} → ${now}${now === before ? '' : '  ⟵ MUTATION'}`);
  }
} finally {
  await browser.close();
}

// Marge : laisser le disque se stabiliser après la dernière fermeture.
await new Promise((r) => setTimeout(r, 300));
const after = hash();
console.log(`progress.json après : ${after}`);
if (after !== before) {
  console.error('\n❌ RÉGRESSION P0 : une consultation de /day a muté data/progress.json.');
  process.exit(1);
}
console.log('\n✅ VISIT_DAY_DOES_NOT_MUTATE_PROGRESS : aucune mutation par simple navigation.');
