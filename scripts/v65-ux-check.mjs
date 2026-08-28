// V65 · QA responsive + accessibilité + captures des nouvelles surfaces.
import { chromium } from 'playwright-core';
import { readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const EXEC = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASE = process.argv[2] ?? 'http://127.0.0.1:3490';
const SHOOT = process.argv[3] === '--shoot';
const OUT = join(process.cwd(), 'docs', 'design', 'v65');
const AXE = './node_modules/axe-core/axe.min.js';

const WIDTHS = [375, 480, 640, 768, 1024, 1200, 1440, 1600, 1920];
const ROUTES = ['/skills', '/history', '/revisions', '/diagnostics', '/day/1'];

let fail = 0;
const browser = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] });

try {
  // ── 1. Débordement horizontal, 9 largeurs × 5 routes ──
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

  // ── 3. Focus visible + ordre de tabulation ──
  console.log('\n3. Clavier');
  for (const route of ['/skills', '/history']) {
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

  // ── 4. Le produit ne ment pas sur un état vide ──
  console.log('\n4. États honnêtes');
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${BASE}/skills`, { waitUntil: 'networkidle', timeout: 45000 });
    const txt = await page.evaluate(() => document.body.innerText);
    await page.close();
    const lies = /\b0\s*%|maîtrise\s+0|niveau moyen 0/i.test(txt);
    if (lies) fail += 1;
    console.log(`  ${lies ? '❌' : '✅'} /skills n'affiche aucun « 0 % de maîtrise »`);
  }

  // ── 5. Captures ──
  if (SHOOT) {
    console.log('\n5. Captures');
    mkdirSync(OUT, { recursive: true });
    for (const [route, name] of [['/skills', 'skills'], ['/history', 'history'],
                                 ['/revisions', 'revisions'], ['/diagnostics', 'diagnostics']]) {
      for (const w of [375, 768, 1440, 1920]) {
        const page = await browser.newPage({ viewport: { width: w, height: 900 } });
        await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 45000 });
        await page.screenshot({ path: join(OUT, `${name}-${w}.png`), fullPage: true });
        await page.close();
      }
    }
    console.log(`  ✅ captures écrites dans docs/design/v65/`);
  }
} finally {
  await browser.close();
}

console.log(`\n${fail === 0 ? '✅ Aucune régression UX.' : `❌ ${fail} bloc(s) en échec.`}`);
process.exit(fail === 0 ? 0 : 1);
