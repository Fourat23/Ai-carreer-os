// V65.1 · QA responsive + accessibilité + captures.
//
// Étendu par rapport à v65-ux-check : les surfaces NOUVELLES du sprint
// (/skills/[id], /history filtré) et les surfaces MIGRÉES (/, /synthese,
// /diagnostics) sont mesurées avec la même exigence que les anciennes.
//
// La leçon de V65 est intégrée : ces mesures ne valent QUE sur des données
// réelles. Lancé sur une progression vide, ce script serait vert en cachant
// tout ce qu'il est censé trouver — c'est exactement ce qui a laissé passer
// `role="img"` sur `.rev-track` pendant huit sprints.
import { chromium } from 'playwright-core';
import { readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const EXEC = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASE = process.argv[2] ?? 'http://127.0.0.1:3498';
const SHOOT = process.argv[3] === '--shoot';
const OUT = join(process.cwd(), 'docs', 'design', 'v651', 'after');
const AXE = './node_modules/axe-core/axe.min.js';

const WIDTHS = [375, 480, 640, 768, 1024, 1200, 1440, 1600, 1920];
const ROUTES = [
  '/', '/skills', '/skills/jsts', '/skills/autonomy', '/history',
  '/history?competence=jsts', '/synthese', '/revisions', '/diagnostics', '/day/13',
];
const SHOTS = [
  ['/', 'dashboard'], ['/skills', 'skills'], ['/skills/jsts', 'skill-detail'],
  ['/skills/autonomy', 'skill-detail-inatteignable'], ['/history', 'history'],
  ['/history?competence=jsts', 'history-filtre'], ['/synthese', 'synthese'],
  ['/revisions', 'revisions'], ['/diagnostics', 'diagnostics'], ['/day/13', 'day13'],
];

// Identifiants d'état qui ne doivent JAMAIS atteindre un texte rendu (critère C4).
const LEAKED_STATES = [
  'unassessed', 'practiced', 'demonstrated', 'reinforced',
  'not-started', 'discovered', 'to-consolidate',
];

let fail = 0;
const browser = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] });

try {
  // ── 1. Débordement horizontal ──
  console.log(`1. Débordement horizontal — ${WIDTHS.length} largeurs × ${ROUTES.length} routes`);
  let over = 0, states = 0;
  for (const route of ROUTES) {
    for (const w of WIDTHS) {
      const page = await browser.newPage({ viewport: { width: w, height: 900 } });
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 45000 });
      const r = await page.evaluate(() => ({
        over: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        h1: document.querySelectorAll('h1').length,
        main: document.querySelectorAll('main').length,
      }));
      await page.close();
      states += 1;
      if (r.over) { over += 1; console.log(`  ❌ débordement ${route} @${w}`); }
      if (w === 1440) {
        if (r.h1 !== 1) { fail += 1; console.log(`  ❌ ${route} : ${r.h1} <h1> (attendu 1)`); }
        if (r.main !== 1) { fail += 1; console.log(`  ❌ ${route} : ${r.main} <main> (attendu 1)`); }
      }
    }
  }
  if (over) fail += 1;
  console.log(`  ${over === 0 ? '✅' : '❌'} ${over} débordement sur ${states} états`);

  // ── 2. Accessibilité ──
  console.log('\n2. axe-core (wcag2a/aa, wcag21a/aa)');
  const axeSrc = readFileSync(AXE, 'utf8');
  let critical = 0, serious = 0;
  for (const route of ROUTES) {
    for (const w of [375, 768, 1440]) {
      const page = await browser.newPage({ viewport: { width: w, height: 900 } });
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 45000 });
      await page.addScriptTag({ content: axeSrc });
      const res = await page.evaluate(async () =>
        // @ts-ignore
        window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } }));
      await page.close();
      for (const v of res.violations) {
        if (v.impact === 'critical') { critical += 1; console.log(`  ❌ critical ${route}@${w} : ${v.id}`); }
        if (v.impact === 'serious') { serious += 1; console.log(`  ❌ serious ${route}@${w} : ${v.id}`); }
      }
    }
  }
  if (critical || serious) fail += 1;
  console.log(`  ${critical + serious === 0 ? '✅' : '❌'} ${critical} critical / ${serious} serious`);

  // ── 3. Clavier ──
  console.log('\n3. Clavier');
  for (const route of ['/skills', '/skills/jsts', '/history', '/revisions']) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 45000 });
    const r = await page.evaluate(() => {
      const stops = [...document.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')];
      let hidden = 0;
      for (const el of stops) {
        const rc = el.getBoundingClientRect();
        if (rc.width === 0 && rc.height === 0) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none') hidden += 1;
      }
      return { stops: stops.length, hidden };
    });
    await page.close();
    const ok = r.hidden === 0;
    if (!ok) fail += 1;
    console.log(`  ${ok ? '✅' : '❌'} ${route} : ${r.stops} arrêts de tabulation, ${r.hidden} masqué(s)`);
  }

  // ── 4. Le produit ne ment pas ──
  console.log('\n4. États honnêtes et vocabulaire');
  for (const route of ['/', '/skills', '/skills/jsts', '/history', '/synthese', '/diagnostics', '/revisions']) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 45000 });
    const txt = await page.evaluate(() => document.body.innerText);
    await page.close();

    // SONDE CORRIGÉE, pas produit. Le motif « \b0\s*% » accusait /synthese
    // de dire « 0 % de maîtrise » alors qu'il lisait « 0/119 · 0% » : la
    // progression réelle d'un parcours jamais commencé, un vrai quotient avec
    // son numérateur et son dénominateur affichés à côté. Dixième faux
    // diagnostic de sonde de la série ; on corrige la sonde. Ce qui est
    // interdit, c'est un pourcentage de MAÎTRISE — un 0 % sans grandeur
    // derrière.
    const lies = /(maîtrise|compétence|niveau)[^.\n]{0,20}\b0\s*%|\b0\s*%[^.\n]{0,20}(de maîtrise|de compétence)/i.test(txt);
    if (lies) { fail += 1; console.log(`  ❌ ${route} affiche un « 0 % de maîtrise »`); }

    // C4 — aucun identifiant d'état anglais visible.
    for (const st of LEAKED_STATES) {
      if (new RegExp(`\\b${st}\\b`).test(txt)) {
        fail += 1; console.log(`  ❌ ${route} : identifiant d'état « ${st} » visible`);
      }
    }
    // C3 — aucune étiquette FINE affichée comme une compétence programme.
    for (const fin of ['javascript · algo', 'linux · arrays', 'hashmap · data', 'conditions · errors']) {
      if (txt.toLowerCase().includes(fin)) {
        fail += 1; console.log(`  ❌ ${route} : vocabulaire fin « ${fin} »`);
      }
    }
  }
  console.log('  ✅ vérifié sur 7 surfaces');

  // ── 5. C2 — cohérence transverse des décomptes ──
  console.log('\n5. Cohérence transverse');
  const textOf = async (r) => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${BASE}${r}`, { waitUntil: 'networkidle', timeout: 45000 });
    const t = await page.evaluate(() => document.body.innerText);
    await page.close();
    return t;
  };
  const dash = await textOf('/');
  const skills = await textOf('/skills');
  const q = /(\d+)\s+preuves? qualifiantes? sur\s+(\d+)\s+enregistrées?/;
  const a = dash.match(q), b = skills.match(q);
  if (!a || !b) { fail += 1; console.log('  ❌ décompte de preuves absent d’une surface'); }
  else if (a[1] !== b[1] || a[2] !== b[2]) {
    fail += 1; console.log(`  ❌ décompte divergent : « ${a[0]} » vs « ${b[0]} »`);
  } else console.log(`  ✅ même décompte sur / et /skills : ${a[0]}`);

  const c = dash.match(/(\d+)\s+compétences? sur (\d+) repose/);
  const d = skills.match(/(\d+)\s+compétences? sur (\d+) reposent?/);
  if (!c || !d) { fail += 1; console.log('  ❌ décompte de compétences absent'); }
  else if (c[1] !== d[1] || c[2] !== d[2]) {
    fail += 1; console.log(`  ❌ compétences évaluées divergentes : ${c[1]}/${c[2]} vs ${d[1]}/${d[2]}`);
  } else console.log(`  ✅ mêmes compétences évaluées : ${c[1]} / ${c[2]}`);

  // ── 6. Captures ──
  if (SHOOT) {
    console.log('\n6. Captures');
    mkdirSync(OUT, { recursive: true });
    for (const [route, name] of SHOTS) {
      for (const w of [375, 768, 1024, 1440, 1920]) {
        const page = await browser.newPage({ viewport: { width: w, height: 900 } });
        await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 45000 });
        await page.screenshot({ path: join(OUT, `${name}-${w}.png`), fullPage: true });
        await page.close();
      }
    }
    console.log(`  ✅ ${SHOTS.length * 5} captures dans docs/design/v651/after/`);
  }
} finally {
  await browser.close();
}

console.log(`\n${fail === 0 ? '✅ Aucune régression UX.' : `❌ ${fail} bloc(s) en échec.`}`);
process.exit(fail === 0 ? 0 : 1);
