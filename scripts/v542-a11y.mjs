// V54.2 — Audit d'accessibilité RÉEL des 3 surfaces de référence.
// 1) axe-core (devDependency, JS pur, aucun appel réseau) injecté dans la page.
// 2) Contrôles clavier/structure mesurés dans le DOM : landmarks, hiérarchie de
//    titres, focus visible, ordre de tabulation, noms accessibles, skip link,
//    statut jamais transmis par la couleur seule.
import { chromium } from 'playwright-core';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const AXE_PATH = require.resolve('axe-core/axe.min.js');
const AXE_SRC = readFileSync(AXE_PATH, 'utf8');
const EXEC = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASE = process.argv[2] ?? 'http://127.0.0.1:3220';
const PAGES = [
  { name: 'dashboard', path: '/' },
  { name: 'parcours', path: '/parcours' },
  { name: 'synthese', path: '/synthese' },
];

const browser = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox', '--disable-gpu'] });
let violationsTotal = 0;
const structural = [];
try {
  for (const p of PAGES) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${BASE}${p.path}`, { waitUntil: 'networkidle', timeout: 30000 });

    // ── axe-core ──────────────────────────────────────────────────────────
    await page.addScriptTag({ content: AXE_SRC });
    const axe = await page.evaluate(async () => {
      // @ts-ignore — axe est injecté dans la page
      const res = await window.axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'best-practice'] },
      });
      return res.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, help: v.help }));
    });

    // ── contrôles structure / clavier ─────────────────────────────────────
    const s = await page.evaluate(() => {
      const main = document.querySelector('main');
      const headings = [...document.querySelectorAll('main h1, main h2, main h3, main h4')]
        .map((h) => Number(h.tagName[1]));
      // Saut de niveau (ex. h1 → h3) ?
      let jump = false;
      for (let i = 1; i < headings.length; i++) if (headings[i] - headings[i - 1] > 1) jump = true;
      // Éléments focusables sans nom accessible.
      const focusables = [...document.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"]), input, select, textarea')];
      const unnamed = focusables.filter((el) => {
        const t = (el.textContent ?? '').trim();
        return !t && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby') && !el.getAttribute('title');
      }).length;
      // Statut : chaque .ui-status doit porter un libellé texte (pas juste une couleur).
      const statuses = [...document.querySelectorAll('.ui-status')];
      const colorOnly = statuses.filter((el) => !(el.querySelector('.ui-status-label')?.textContent ?? '').trim()).length;
      return {
        landmarks: { main: !!main, nav: document.querySelectorAll('nav').length, header: document.querySelectorAll('header').length },
        h1: document.querySelectorAll('main h1').length,
        headingJump: jump,
        focusables: focusables.length,
        unnamed,
        statuses: statuses.length,
        statusColorOnly: colorOnly,
        skipLink: !!document.querySelector('.skip-link'),
      };
    });

    // Ordre de tabulation réel : 12 Tab, on vérifie que le focus progresse et
    // qu'un contour de focus est bien peint.
    const kb = await page.evaluate(() => ({ start: document.activeElement?.tagName ?? 'BODY' }));
    const seen = [];
    let focusRingOk = false;
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const cs = getComputedStyle(el);
        const outline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
        return { tag: el.tagName, cls: (el.className?.toString?.() ?? '').slice(0, 24), outline };
      });
      if (info) { seen.push(info.tag); if (info.outline) focusRingOk = true; }
    }

    const errs = axe.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    violationsTotal += errs.length;
    structural.push({ page: p.name, axe, errs, s, kbCount: seen.length, focusRingOk, kbStart: kb.start });
    await page.close();
  }
} finally {
  await browser.close();
}

console.log('── V54.2 · audit accessibilité (axe-core + clavier réel)');
for (const r of structural) {
  console.log(`\n▸ ${r.page}`);
  console.log(`  landmarks  : main=${r.s.landmarks.main} nav=${r.s.landmarks.nav} header=${r.s.landmarks.header} · skip-link=${r.s.skipLink}`);
  console.log(`  titres     : h1=${r.s.h1} · saut de niveau=${r.s.headingJump ? 'OUI ⚠' : 'non'}`);
  console.log(`  focusables : ${r.s.focusables} · sans nom accessible=${r.s.unnamed}`);
  console.log(`  statuts    : ${r.s.statuses} · couleur seule=${r.s.statusColorOnly}`);
  console.log(`  clavier    : ${r.kbCount}/12 Tab atteignent un élément · focus visible=${r.focusRingOk ? 'oui' : 'NON'}`);
  if (r.axe.length === 0) console.log('  axe-core   : 0 violation');
  else for (const v of r.axe) console.log(`  axe-core   : [${v.impact}] ${v.id} ×${v.n} — ${v.help}`);
}
console.log(`\nViolations axe critical/serious : ${violationsTotal}`);
process.exit(violationsTotal > 0 ? 1 : 0);
