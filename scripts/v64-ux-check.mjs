// V64 · Non-régression UX. Le moteur ajoute des affordances à la Vue Jour ; il
// n'a PAS le droit de la rallonger (critère 10 de la clôture V63, repris au §2
// de docs/V64-CRITERIA-FROZEN.md).
//
// Mesure aussi : débordement horizontal et violations axe critical/serious.
import { chromium } from 'playwright-core';
import { readFileSync } from 'node:fs';

const EXEC = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASE = process.argv[2] ?? 'http://127.0.0.1:3486';
const AXE = './node_modules/axe-core/axe.min.js';

// Plafonds gelés AVANT la mesure (docs/V63-CRITERIA-FROZEN.md §2).
const CEILINGS = {
  '/day/80': { 375: 13425, 1440: 1321 },
  '/day/1': { 375: 6350 },
  '/day/181': { 375: 3616 },
  '/day/205': { 375: 4827 },
  '/day/320': { 375: 11483 },
};
const A11Y_ROUTES = ['/day/80', '/day/1', '/skills', '/revisions', '/diagnostics', '/'];
const WIDTHS = [375, 768, 1024, 1440, 1920];

let fail = 0;
const rows = [];

const browser = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] });
try {
  // ── 1. Budget de hauteur ──
  console.log('1. Hauteur de la Vue Jour — plafonds gelés en V63\n');
  for (const [route, byWidth] of Object.entries(CEILINGS)) {
    for (const [w, ceiling] of Object.entries(byWidth)) {
      const page = await browser.newPage({ viewport: { width: Number(w), height: 900 } });
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 45000 });
      const h = await page.evaluate(() => document.documentElement.scrollHeight);
      await page.close();
      const ok = h <= ceiling + 2; // tolérance sous-pixel documentée
      if (!ok) fail += 1;
      rows.push({ route, w, h, ceiling, ok });
      console.log(`  ${ok ? '✅' : '❌'} ${route} @${w} : ${h} px (plafond ${ceiling})`);
    }
  }

  // ── 2. Débordement horizontal ──
  console.log('\n2. Débordement horizontal');
  let overflow = 0, states = 0;
  for (const route of A11Y_ROUTES) {
    for (const w of WIDTHS) {
      const page = await browser.newPage({ viewport: { width: w, height: 900 } });
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 45000 });
      const over = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      await page.close();
      states += 1;
      if (over) { overflow += 1; console.log(`  ❌ ${route} @${w}`); }
    }
  }
  if (overflow) fail += 1;
  console.log(`  ${overflow === 0 ? '✅' : '❌'} ${overflow} débordement sur ${states} états`);

  // ── 3. Accessibilité ──
  console.log('\n3. axe-core (wcag2a/aa, wcag21a/aa)');
  const axeSrc = readFileSync(AXE, 'utf8');
  let critical = 0, serious = 0;
  for (const route of A11Y_ROUTES) {
    for (const w of [375, 1440]) {
      const page = await browser.newPage({ viewport: { width: w, height: 900 } });
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 45000 });
      await page.addScriptTag({ content: axeSrc });
      const r = await page.evaluate(async () => {
        // @ts-ignore
        return await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
      });
      await page.close();
      for (const v of r.violations) {
        if (v.impact === 'critical') { critical += 1; console.log(`  ❌ critical ${route}@${w} : ${v.id}`); }
        if (v.impact === 'serious') { serious += 1; console.log(`  ❌ serious ${route}@${w} : ${v.id}`); }
      }
    }
  }
  if (critical || serious) fail += 1;
  console.log(`  ${critical + serious === 0 ? '✅' : '❌'} ${critical} critical / ${serious} serious`);

  // ── 4. Les affordances de session sont RÉELLEMENT là ──
  console.log('\n4. Les affordances du moteur sont rendues');
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${BASE}/day/1`, { waitUntil: 'networkidle', timeout: 45000 });
    // La commande visible DÉPEND de l'état de la session : « Commencer » n'existe
    // que sur une journée non commencée. Au premier essai, ce contrôle exigeait
    // « Commencer » alors que le harnais d'intégrité avait déjà démarré le jour 1
    // sur la même fixture — un défaut d'orchestration du harnais, pas du produit.
    // On vérifie donc qu'UNE commande de cycle de vie est offerte, quelle qu'elle soit.
    const found = await page.evaluate(() => {
      const t = document.body.textContent ?? '';
      return {
        lifecycle: ['Commencer la journée', 'Mettre en pause', 'Reprendre', 'Journée terminée'].filter((s) => t.includes(s)),
        submit: document.querySelectorAll('.work-submit').length,
        eyebrow: t.includes('Ma session'),
      };
    });
    await page.close();
    const ok = found.lifecycle.length > 0 && found.eyebrow && found.submit > 0;
    if (!ok) fail += 1;
    console.log(`  ${ok ? '✅' : '❌'} session visible (commande : ${found.lifecycle.join(', ') || 'AUCUNE'} · libellé : ${found.eyebrow} · boutons « Rendre » : ${found.submit})`);
  }
} finally {
  await browser.close();
}

console.log(`\n${fail === 0 ? '✅ Aucune régression UX.' : `❌ ${fail} bloc(s) en échec.`}`);
process.exit(fail === 0 ? 0 : 1);
