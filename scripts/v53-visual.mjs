// V53 — Harnais de validation visuelle réel (navigateur Chromium préinstallé).
// Réutilise playwright-core + le Chromium de /opt/pw-browsers (aucun téléchargement).
// Capture des screenshots multi-largeurs ET assertions d'overflow horizontal.
//
// Usage :
//   node scripts/v53-visual.mjs <label> [baseUrl]
// où <label> ∈ {before, after} range les captures dans docs/audits/visual/<label>/.
//
// Ne modifie aucune donnée. Sort en code 1 si un overflow horizontal est détecté
// (floor bloquant V53), 0 sinon.
import { chromium } from 'playwright-core';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// Visiter une page de jour déclenche un POST client vers /api/progress qui écrit
// data/progress.json (fichier local gelé). On le sauvegarde avant et on le
// restaure après : la validation visuelle est ainsi strictement non destructive.
const PROGRESS = join(process.cwd(), 'data', 'progress.json');
const progressBackup = existsSync(PROGRESS) ? readFileSync(PROGRESS, 'utf8') : null;
function restoreProgress() {
  if (progressBackup !== null) writeFileSync(PROGRESS, progressBackup);
}

const EXEC = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const LABEL = process.argv[2] ?? 'after';
const BASE = process.argv[3] ?? 'http://127.0.0.1:3200';
const WIDTHS = [375, 768, 1024, 1440, 1920];
const ROUTES = [
  { path: '/', name: 'dashboard' },
  { path: '/day/1', name: 'day-1' },
  { path: '/day/186', name: 'day-186' },
  { path: '/day/320', name: 'day-320' },
  { path: '/skills', name: 'skills' },
  { path: '/parcours', name: 'parcours' },
  { path: '/revisions', name: 'revisions' },
  { path: '/missions', name: 'missions' },
  { path: '/projects', name: 'projects' },
  { path: '/diagnostics', name: 'diagnostics' },
  { path: '/capstones', name: 'capstones' },
];
const OUT = join(process.cwd(), 'docs', 'audits', 'visual', LABEL);
mkdirSync(OUT, { recursive: true });

const overflows = [];
const results = [];

const browser = await chromium.launch({
  executablePath: EXEC,
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--disable-dev-shm-usage'],
});
try {
  for (const route of ROUTES) {
    for (const width of WIDTHS) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
      let status = 0;
      try {
        const resp = await page.goto(`${BASE}${route.path}`, { waitUntil: 'networkidle', timeout: 30000 });
        status = resp?.status() ?? 0;
      } catch (e) {
        results.push({ route: route.path, width, status: 'ERR', error: String(e).slice(0, 120) });
        await page.close();
        continue;
      }
      // Overflow horizontal réel : scrollWidth du document > largeur de viewport.
      const metrics = await page.evaluate(() => ({
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
        bodyScrollW: document.body ? document.body.scrollWidth : 0,
      }));
      const overflow = metrics.scrollW - metrics.clientW;
      const hasOverflow = overflow > 1; // tolérance sub-pixel
      if (hasOverflow) overflows.push({ route: route.path, width, overflowPx: overflow });
      // Capture pleine hauteur (preuve visuelle).
      const file = join(OUT, `${route.name}-${width}.png`);
      await page.screenshot({ path: file, fullPage: true });
      results.push({ route: route.path, width, status, scrollW: metrics.scrollW, clientW: metrics.clientW, overflow, hasOverflow });
      await page.close();
    }
  }
} finally {
  await browser.close();
  restoreProgress(); // fichier de progression gelé restauré à l'identique
}

// Rapport texte
console.log(`\n── V53 validation visuelle (${LABEL}) — base ${BASE}`);
console.log('route            largeur  http   scrollW  clientW  overflow');
for (const r of results) {
  const mark = r.hasOverflow ? ' ⟵ OVERFLOW' : '';
  const st = String(r.status);
  console.log(
    `${(r.route).padEnd(15)}  ${String(r.width).padStart(5)}  ${st.padStart(4)}   ${String(r.scrollW ?? '—').padStart(6)}   ${String(r.clientW ?? '—').padStart(6)}   ${String(r.overflow ?? '—').padStart(5)}${mark}`,
  );
}
const bad = results.filter((r) => r.status !== 200 && r.status !== 'ERR' && r.status !== 0);
const errs = results.filter((r) => r.status === 'ERR' || r.status === 0);
console.log(`\nCaptures : ${results.length} · dossier : docs/audits/visual/${LABEL}/`);
console.log(`HTTP non-200 : ${bad.length} · erreurs de navigation : ${errs.length} · overflows : ${overflows.length}`);
if (overflows.length) {
  console.log('\nOVERFLOWS HORIZONTAUX :');
  for (const o of overflows) console.log(`  ✗ ${o.route} @ ${o.width}px → +${o.overflowPx}px`);
}
if (errs.length) {
  console.log('\nERREURS :');
  for (const e of errs) console.log(`  ✗ ${e.route} @ ${e.width}px → ${e.error ?? e.status}`);
}
const ok = overflows.length === 0 && bad.length === 0 && errs.length === 0;
console.log(ok ? '\n✅ Validation visuelle : aucun overflow, toutes routes 200.' : '\n❌ Validation visuelle : anomalies ci-dessus.');
process.exit(ok ? 0 : 1);
