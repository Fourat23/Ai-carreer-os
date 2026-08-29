// V68 · CP14 — INSPECTION MANUELLE EN NAVIGATEUR.
//
// V67 a trouvé au navigateur, en quarante vérifications, un défaut que dix
// checkpoints de lecture avaient manqué : les 52 revues ne liaient aucune leçon.
// C'est la raison d'être de ce checkpoint — le fichier Markdown et la page rendue
// ne sont pas le même objet.
//
// Ce que ce script vérifie, et que la lecture ne peut PAS voir :
//   1. les 25 leçons hors parcours sont-elles réellement atteignables depuis
//      /lessons ? V67 l'affirmait sans l'avoir vérifié en navigateur ;
//   2. l'apprenant qui arrive sur une leçon de l'étagère de référence SAIT-il
//      qu'elle est hors parcours ?
//   3. les nouvelles sections (« Vérification de compréhension », « Correction
//      attendue ») sont-elles rendues, et le tableau des huit combinaisons de
//      react-application-states ne déborde-t-il pas ;
//   4. accessibilité (axe-core, sérieux et critiques) et erreurs JavaScript.

import pw from '../node_modules/playwright-core/index.js';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';

const { chromium } = pw;
const BASE = process.env.BASE ?? 'http://localhost:3509';
const OUT = 'docs/design/v68';
const AXE = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');

const PAGES = [
  ['lessons', '/lessons', 'catalogue : les 25 hors parcours sont-elles listées ?'],
  ['lecon-p0', '/doc/lessons/metrics-percentiles', 'la leçon P0 refaite'],
  ['lecon-etagere', '/doc/lessons/css-flexbox', 'une leçon hors parcours, excellente'],
  ['lecon-tableau', '/doc/lessons/react-application-states', 'le tableau des 8 combinaisons'],
  ['lecon-avert', '/doc/lessons/incident-response', "l'avertissement « étagère de référence »"],
  ['jour-79', '/day/79', 'une journée qui programme metrics-percentiles'],
];
const LARGEURS = [375, 768, 1024, 1440, 1920];

const resultats = [];
const navigateur = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'],
});

for (const [nom, chemin, but] of PAGES) {
  for (const largeur of LARGEURS) {
    const ctx = await navigateur.newContext({ viewport: { width: largeur, height: 900 } });
    const page = await ctx.newPage();
    const erreursJs = [];
    page.on('pageerror', (e) => erreursJs.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') erreursJs.push(m.text()); });

    await page.goto(BASE + chemin, { waitUntil: 'networkidle' });

    // Débordement horizontal : le symptôme visuel le plus fréquent et le plus laid.
    const deborde = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);

    // axe-core : on ne retient que sérieux et critique, comme V67.
    await page.addScriptTag({ content: AXE });
    const a11y = await page.evaluate(async () => {
      const r = await window.axe.run(document, { resultTypes: ['violations'] });
      return r.violations.filter((v) => ['serious', 'critical'].includes(v.impact))
        .map((v) => `${v.id} (${v.impact}) ×${v.nodes.length}`);
    });

    if (largeur === 1440) {
      mkdirSync(OUT, { recursive: true });
      await page.screenshot({ path: `${OUT}/${nom}.png`, fullPage: false });
    }

    resultats.push({ nom, chemin, largeur, but, deborde, a11y, erreursJs: erreursJs.slice(0, 3) });
    await ctx.close();
  }
}

// --- Vérifications de fond, une seule largeur suffit ---
const ctx = await navigateur.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// 1. Les 25 hors parcours sont-elles atteignables depuis /lessons ?
await page.goto(BASE + '/lessons', { waitUntil: 'networkidle' });
const liens = await page.evaluate(() =>
  [...document.querySelectorAll('a[href*="/doc/lessons/"]')].map((a) => a.getAttribute('href').split('/').pop()));
const HORS = ['cloud-aws-core', 'cloud-azure-core', 'cloud-compute-storage', 'cloud-finops',
  'cloud-fundamentals', 'cloud-networking', 'css-flexbox', 'css-fundamentals', 'css-grid',
  'deployment-strategies', 'iac-fundamentals', 'k8s-config-probes', 'k8s-networking-services',
  'k8s-security', 'k8s-troubleshooting', 'k8s-why-architecture', 'k8s-workloads',
  'linux-services-systemd', 'linux-ssh-remote', 'nextjs-data-production', 'nextjs-foundations',
  'nextjs-rendering', 'nextjs-server-client-components', 'release-incident-recovery',
  'responsive-design'];
const atteignables = HORS.filter((s) => liens.includes(s));

// 2. L'apprenant voit-il qu'une leçon est hors parcours ?
await page.goto(BASE + '/doc/lessons/css-flexbox', { waitUntil: 'networkidle' });
const texteEtagere = await page.evaluate(() => document.body.innerText);
const signaleHorsParcours = /hors parcours|étagère de référence|aucune des 365/i.test(texteEtagere);

// 3. Les nouvelles sections sont-elles rendues ?
await page.goto(BASE + '/doc/lessons/metrics-percentiles', { waitUntil: 'networkidle' });
const t = await page.evaluate(() => document.body.innerText);
const rendu = {
  verification: /Vérification de compréhension/i.test(t),
  correction: /Correction attendue/i.test(t),
  erreurProbable: /erreur probable/i.test(t),
  verifieSeul: /Vérifie seul, sans corrigé/i.test(t),
  p99Correct: /p99 = 50 ms/.test(t) || /p99\D{0,20}50 ms/.test(t),
  p99FauxAbsent: !/p99 = 5 000 ms.*maximum/s.test(t.slice(0, 4000)),
};

// 4. Le tableau des huit combinaisons déborde-t-il sur mobile ?
await ctx.close();
const ctxM = await navigateur.newContext({ viewport: { width: 375, height: 900 } });
const pm = await ctxM.newPage();
await pm.goto(BASE + '/doc/lessons/react-application-states', { waitUntil: 'networkidle' });
const tableau = await pm.evaluate(() => {
  const tables = [...document.querySelectorAll('table')];
  return tables.map((tb) => {
    const p = tb.parentElement;
    return { scrollable: getComputedStyle(p).overflowX === 'auto' || getComputedStyle(tb).overflowX === 'auto',
             deborde: tb.scrollWidth > document.documentElement.clientWidth + 1 };
  });
});
await ctxM.close();
await navigateur.close();

// --- Rapport ---
console.log(`\n=== V68 CP14 — ${resultats.length} vérifications (${PAGES.length} pages × ${LARGEURS.length} largeurs) ===\n`);
const debordent = resultats.filter((r) => r.deborde);
const fautes = resultats.filter((r) => r.a11y.length);
const js = resultats.filter((r) => r.erreursJs.length);
console.log(`débordement horizontal   : ${debordent.length}/${resultats.length}`);
for (const r of debordent) console.log(`   ⚠️  ${r.nom} @ ${r.largeur}px`);
console.log(`axe-core sérieux/critique: ${fautes.length}/${resultats.length}`);
for (const r of fautes) console.log(`   ⚠️  ${r.nom} @ ${r.largeur}px — ${r.a11y.join(', ')}`);
console.log(`erreurs JavaScript       : ${js.length}/${resultats.length}`);
for (const r of js) console.log(`   ⚠️  ${r.nom} @ ${r.largeur}px — ${r.erreursJs[0]}`);

console.log(`\n1. leçons hors parcours atteignables depuis /lessons : ${atteignables.length}/25`);
if (atteignables.length < 25) console.log(`   MANQUANTES : ${HORS.filter((s) => !atteignables.includes(s)).join(', ')}`);
console.log(`2. la page d'une leçon hors parcours le signale-t-elle ? ${signaleHorsParcours ? 'OUI' : 'NON'}`);
console.log('3. rendu des nouvelles sections sur metrics-percentiles :');
for (const [k, v] of Object.entries(rendu)) console.log(`   ${v ? '✅' : '❌'} ${k}`);
console.log(`4. tableaux de react-application-states : ${tableau.length} trouvé(s)`);
for (const [i, tb] of tableau.entries()) console.log(`   tableau ${i + 1} @375px — déborde: ${tb.deborde}, conteneur scrollable: ${tb.scrollable}`);

writeFileSync(`${OUT}/resultats.json`, JSON.stringify({ resultats, atteignables, signaleHorsParcours, rendu, tableau }, null, 1));
console.log(`\ncaptures + resultats.json → ${OUT}/`);
