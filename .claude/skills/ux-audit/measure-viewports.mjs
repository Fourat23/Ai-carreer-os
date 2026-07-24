// measure-viewports.mjs — mesure RESPONSIVE en lecture seule (aucune modification du dépôt).
// Vérifie, à 375/768/1024/1440px, la présence de barre horizontale parasite et de superposition
// sidebar/contenu, sur une liste de routes. Dépendance NON incluse au dépôt : playwright-core.
// Dégradation gracieuse : si playwright-core ou Chromium sont absents, imprime la marche à suivre
// et sort en code 0 (l'audit peut continuer par l'analyse du code/CSS).
//
// Usage :
//   node .claude/skills/ux-audit/measure-viewports.mjs [baseURL] [route1 route2 ...]
// Prérequis navigateur (comme utilisé pour LOCAL_V1_INTEGRITY) :
//   npm install --no-save playwright-core   # transitoire, n'ajoute pas de dépendance au dépôt
//   Chromium pré-installé : /opt/pw-browsers/chromium-1194/chrome-linux/chrome
// Le serveur doit tourner (ex. `npm run build && PORT=3100 npm start`).

import fs from 'node:fs';

const BASE = process.argv[2] || 'http://localhost:3100';
const ROUTES = process.argv.slice(3);
const DEFAULT_ROUTES = ['/', '/day/1', '/day/314', '/calendar', '/glossary', '/skills', '/reviews', '/projects', '/lessons'];
const routes = ROUTES.length ? ROUTES : DEFAULT_ROUTES;
const WIDTHS = [375, 768, 1024, 1440];

function findChromium() {
  const guesses = [
    '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  ];
  for (const g of guesses) if (fs.existsSync(g)) return g;
  // recherche générique
  try {
    const base = '/opt/pw-browsers';
    for (const d of fs.readdirSync(base)) {
      const p = `${base}/${d}/chrome-linux/chrome`;
      if (fs.existsSync(p)) return p;
    }
  } catch {}
  return null;
}

let chromium;
try {
  ({ chromium } = await import('playwright-core'));
} catch {
  console.log('ℹ️ playwright-core absent — mesure navigateur ignorée (dégradation gracieuse).');
  console.log('   Pour activer : npm install --no-save playwright-core');
  console.log('   L\'audit ux-audit peut continuer via l\'analyse du CSS/JSX (media queries, overflow-x, etc.).');
  process.exit(0);
}
const EXE = findChromium();
if (!EXE) {
  console.log('ℹ️ Chromium introuvable sous /opt/pw-browsers — mesure ignorée (dégradation gracieuse).');
  process.exit(0);
}

let browser;
try {
  browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
} catch (e) {
  console.log('ℹ️ Lancement de Chromium impossible (' + e.message + ') — mesure ignorée.');
  process.exit(0);
}

let anyBad = false;
for (const w of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  const page = await ctx.newPage();
  const bad = [];
  for (const r of routes) {
    try {
      const resp = await page.goto(BASE + r, { waitUntil: 'networkidle', timeout: 15000 });
      if (!resp || resp.status() >= 400) { bad.push(`${r}(HTTP ${resp ? resp.status() : 'no-resp'})`); anyBad = true; continue; }
    } catch (e) {
      bad.push(`${r}(navigation KO)`); anyBad = true; continue;
    }
    const m = await page.evaluate(() => {
      const de = document.documentElement;
      const sb = document.querySelector('.sidebar')?.getBoundingClientRect();
      const ct = (document.querySelector('main.content') || document.querySelector('.content') || document.querySelector('main'))?.getBoundingClientRect();
      let overlap = false;
      if (sb && ct) overlap = !(sb.bottom <= ct.top + 1 || sb.right <= ct.left + 1 || ct.right <= sb.left + 1 || ct.bottom <= sb.top + 1);
      return { hScroll: de.scrollWidth > de.clientWidth + 1, overlap };
    });
    if (m.hScroll || m.overlap) { bad.push(`${r}(hScroll=${m.hScroll},overlap=${m.overlap})`); anyBad = true; }
  }
  console.log(`=== ${w}px === ${bad.length ? 'PROBLÈMES: ' + bad.join(' | ') : 'OK — ' + routes.length + ' routes, 0 débordement, 0 superposition'}`);
  await ctx.close();
}
await browser.close();
console.log(anyBad
  ? '\nRESULTAT: ❌ défauts responsive détectés (voir ci-dessus).'
  : `\nRESULTAT: ✅ ${WIDTHS.join('/')}px sur ${routes.length} routes — aucune barre horizontale, aucune superposition.`);
