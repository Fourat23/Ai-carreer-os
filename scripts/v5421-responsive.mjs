// V54.2.1 — Contrôle responsive sur les 9 largeurs demandées.
// « 0 overflow » n'est qu'un plancher : on mesure aussi que rien n'est ROGNÉ
// (contenu plus large que son conteneur) et que l'ordre de lecture du
// calendrier reste chronologique à chaque largeur.
import { chromium } from 'playwright-core';

const EXEC = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASE = process.argv[2] ?? 'http://127.0.0.1:3221';
const WIDTHS = [375, 480, 640, 768, 1024, 1200, 1440, 1600, 1920];
const ROUTES = ['/', '/calendar', '/parcours', '/synthese', '/revisions'];

function probe() {
  const de = document.documentElement;
  const overflow = Math.max(0, de.scrollWidth - de.clientWidth);
  // Contenu RÉELLEMENT rogné : le contenu dépasse la boîte ET la boîte le
  // masque. Trois exclusions, chacune justifiée — un compteur qui les ignore
  // produit des faux positifs et ne vaut rien :
  //   · `overflow-x: visible` → rien n'est masqué, le contenu déborde à la vue ;
  //   · `overflow-x: auto|scroll` → le conteneur défile, c'est un choix ;
  //   · `text-overflow: ellipsis` → troncature délibérée et signalée ;
  //   · boîtes < 40 px → motif « visuellement masqué » (clip à 1 px).
  const clippedNodes = [];
  for (const el of document.querySelectorAll('main.content *')) {
    const cs = getComputedStyle(el);
    if (cs.overflowX !== 'hidden' && cs.overflowX !== 'clip') continue;
    if (cs.textOverflow === 'ellipsis') continue;
    if (el.clientWidth < 40) continue;
    if (el.scrollWidth - el.clientWidth > 4) clippedNodes.push(`${el.tagName}.${String(el.className).slice(0, 30)}`);
  }
  const clipped = clippedNodes.length;
  const asc = (a) => a.every((v, i) => i === 0 || v > a[i - 1]);
  const months = [...document.querySelectorAll('[data-calendar-month]')].map((e) => Number(e.getAttribute('data-calendar-month')));
  return { overflow, clipped, clippedNodes, calOrdered: months.length ? asc(months) : null, months: months.length };
}

const browser = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--disable-dev-shm-usage'] });
let bad = 0;
try {
  for (const route of ROUTES) {
    const page = await browser.newPage({ viewport: { width: 375, height: 900 } });
    const cells = [];
    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 45000 });
      const m = await page.evaluate(probe);
      const ok = m.overflow === 0 && m.clipped === 0 && m.calOrdered !== false;
      if (!ok) bad++;
      cells.push(`${w}:${ok ? 'ok' : `ovf${m.overflow}/rogn${m.clipped}${m.calOrdered === false ? '/ORDRE' : ''}`}`);
      if (!ok) console.log(`    ${route}@${w} → ${m.clippedNodes.join(' , ')}`);
    }
    console.log(`${route.padEnd(12)} ${cells.join('  ')}`);
    await page.close();
  }
} finally { await browser.close(); }
console.log(`\n${ROUTES.length * WIDTHS.length - bad}/${ROUTES.length * WIDTHS.length} états conformes.`);
process.exit(bad ? 1 : 0);
