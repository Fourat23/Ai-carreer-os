// V66 · CP13 — walkthrough navigateur réel, 5 largeurs.
// Détecte : débordement horizontal, chevauchement de cibles tactiles,
// violations axe-core sérieuses ou critiques, contraste.
import pw from '/home/user/Ai-carreer-os/node_modules/playwright-core/index.js';
const { chromium } = pw;
import { readFileSync, mkdirSync } from 'node:fs';

const BASE = 'http://localhost:3504';
const WIDTHS = [375, 768, 1024, 1440, 1920];
const ROUTES = [
  ['/retention', 'reactivation'],
  ['/doc/lessons/embeddings', 'lecon-embeddings'],
  ['/doc/lessons/docker-containers', 'lecon-docker'],
  ['/glossary?terme=ai-recall-at-k', 'glossaire-lien-profond'],
  ['/revisions', 'revisions'],
  ['/day/232', 'jour-232'],
];
const OUT = '/home/user/Ai-carreer-os/docs/design/v66/after';
mkdirSync(OUT, { recursive: true });

const axe = readFileSync('/home/user/Ai-carreer-os/node_modules/axe-core/axe.min.js', 'utf8');
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const problemes = [];

for (const [route, nom] of ROUTES) {
  for (const w of WIDTHS) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    await page.goto(BASE + route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(250);

    const debord = await page.evaluate(() => {
      const de = document.documentElement;
      const coupables = [];
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && (r.right > de.clientWidth + 1 || r.left < -1)) {
          coupables.push(`${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]}`);
        }
      }
      return { scroll: de.scrollWidth > de.clientWidth + 1, coupables: [...new Set(coupables)].slice(0, 4) };
    });
    if (debord.scroll) problemes.push(`${route} @${w} — débordement horizontal : ${debord.coupables.join(', ')}`);

    await page.addScriptTag({ content: axe });
    const res = await page.evaluate(async () => await window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    }));
    for (const v of res.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')) {
      problemes.push(`${route} @${w} — axe ${v.impact} : ${v.id} (${v.nodes.length}) — ${v.nodes[0]?.target?.[0] ?? ''}`);
    }

    if (w === 375 || w === 1440) {
      await page.screenshot({ path: `${OUT}/${nom}-${w}.png`, fullPage: true });
    }
    await page.close();
  }
}
await browser.close();
console.log(`── walkthrough : ${ROUTES.length} routes × ${WIDTHS.length} largeurs = ${ROUTES.length * WIDTHS.length} rendus`);
if (problemes.length === 0) console.log('✅ 0 débordement, 0 violation serious/critical');
else { console.log(`❌ ${problemes.length} problème(s) :`); for (const p of problemes) console.log('  • ' + p); }
