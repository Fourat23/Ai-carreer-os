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
// V54.2.1 — étendu aux routes touchées par ce sprint. Toujours AUCUNE
// restauration : le fichier doit simplement ne pas être modifié par une visite.
const CASES = [
  { name: 'VISIT_DASHBOARD_DOES_NOT_MUTATE_PROGRESS', path: '/' },
  { name: 'VISIT_CALENDAR_DOES_NOT_MUTATE_PROGRESS', path: '/calendar' },
  { name: 'VISIT_PARCOURS_DOES_NOT_MUTATE_PROGRESS', path: '/parcours' },
  { name: 'VISIT_SYNTHESE_DOES_NOT_MUTATE_PROGRESS', path: '/synthese' },
  { name: 'VISIT_REVISIONS_DOES_NOT_MUTATE_PROGRESS', path: '/revisions' },
  // V56 — la Journée est la surface la plus utilisée : sa non-mutation par
  // simple consultation était déjà prouvée en V54, elle entre ici en routine.
  { name: 'VISIT_DAY_DOES_NOT_MUTATE_PROGRESS', path: '/day/80' },
  { name: 'VISIT_DOC_DOES_NOT_MUTATE_PROGRESS', path: '/doc/lessons/agents-fundamentals' },
  { name: 'VISIT_SKILLS_DOES_NOT_MUTATE_PROGRESS', path: '/skills' },
  // V57 — chaque route touchée par ce sprint entre en routine. Toujours AUCUNE
  // restauration : le fichier doit simplement ne pas être modifié par une visite.
  { name: 'VISIT_MONTH_DOES_NOT_MUTATE_PROGRESS', path: '/month/3' },
  { name: 'VISIT_WEEK_DOES_NOT_MUTATE_PROGRESS', path: '/week/12' },
  { name: 'VISIT_LAB_DOES_NOT_MUTATE_PROGRESS', path: '/lab' },
  { name: 'VISIT_LAB_EXERCISE_DOES_NOT_MUTATE_PROGRESS', path: '/lab/fizzbuzz' },
  { name: 'VISIT_DIAGNOSTICS_DOES_NOT_MUTATE_PROGRESS', path: '/diagnostics' },
  { name: 'VISIT_CAPSTONES_DOES_NOT_MUTATE_PROGRESS', path: '/capstones' },
  { name: 'VISIT_PROJECTS_DOES_NOT_MUTATE_PROGRESS', path: '/projects' },
  { name: 'VISIT_REVIEWS_DOES_NOT_MUTATE_PROGRESS', path: '/reviews' },
  { name: 'VISIT_PIPELINES_DOES_NOT_MUTATE_PROGRESS', path: '/pipelines' },
  { name: 'VISIT_KUBERNETES_DOES_NOT_MUTATE_PROGRESS', path: '/kubernetes' },
  { name: 'VISIT_CLOUD_LAB_DOES_NOT_MUTATE_PROGRESS', path: '/cloud-lab' },
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
console.log(`\n✅ Aucune des ${CASES.length} routes vérifiées ne mute la progression.`);
