// V54.2 — Intégrité de progression sur les 3 surfaces de référence.
//   VISIT_DASHBOARD_DOES_NOT_MUTATE_PROGRESS
//   VISIT_PARCOURS_DOES_NOT_MUTATE_PROGRESS
//   VISIT_SYNTHESE_DOES_NOT_MUTATE_PROGRESS
// Compare le hash de data/progress.json avant/après une navigation réelle.
// AUCUNE restauration : le fichier doit simplement ne pas être modifié.
import { chromium } from 'playwright-core';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const EXEC = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASE = process.argv[2] ?? 'http://127.0.0.1:3220';
const PROGRESS = join(process.cwd(), 'data', 'progress.json');
const CASES = [
  { name: 'VISIT_DASHBOARD_DOES_NOT_MUTATE_PROGRESS', path: '/' },
  { name: 'VISIT_PARCOURS_DOES_NOT_MUTATE_PROGRESS', path: '/parcours' },
  { name: 'VISIT_SYNTHESE_DOES_NOT_MUTATE_PROGRESS', path: '/synthese' },
];

const hash = () => createHash('sha1').update(readFileSync(PROGRESS)).digest('hex');

console.log('── V54.2 · intégrité de progression (consultation seule, sans restauration)');
const start = hash();
console.log(`progress.json initial : ${start}`);

const browser = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] });
const failures = [];
try {
  for (const c of CASES) {
    const before = hash();
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${BASE}${c.path}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(400);
    await page.close();               // provoque pagehide / démontage des composants clients
    await new Promise((r) => setTimeout(r, 200));
    const after = hash();
    const ok = after === before;
    if (!ok) failures.push(c.name);
    console.log(`  ${ok ? '✅' : '❌'} ${c.name} (${c.path}) → ${after}`);
  }
} finally {
  await browser.close();
}

const end = hash();
console.log(`progress.json final   : ${end}`);
if (end !== start || failures.length) {
  console.error(`\n❌ Mutation détectée par simple navigation : ${failures.join(', ') || 'écart global'}`);
  process.exit(1);
}
console.log('\n✅ Les 3 surfaces de référence ne mutent pas la progression.');
