// V55 — Harnais de mesure « identité & convergence visuelle ».
//
// V54.2.1 a couvert la justesse (ordre, partition, vide structurel). Ce harnais
// mesure autre chose : la DENSITÉ DE DESIGN. Il tente de répondre par des
// nombres à la question « est-ce que ça ressemble encore à un dashboard interne
// générique ? », pour que la comparaison AVANT/APRÈS ne repose pas uniquement
// sur une opinion.
//
// Les indicateurs sont volontairement grossiers — aucun d'eux ne « prouve » la
// qualité. Ils servent à détecter l'absence de saut : un produit dont la
// dominance, la profondeur de surfaces et l'échelle typographique ne bougent
// pas n'a pas été recomposé, quoi qu'en dise le diff CSS.
//
// Usage : node scripts/v55-visual.mjs <label> [baseUrl]
// Ne restaure rien : la navigation ne doit pas muter data/progress.json.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const EXEC = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const LABEL = process.argv[2] ?? 'after';
const BASE = process.argv[3] ?? 'http://127.0.0.1:3230';
const WIDTHS = [375, 768, 1440, 1920];
const ROUTES = [
  { path: '/', name: 'dashboard' },
  { path: '/parcours', name: 'parcours' },
  { path: '/synthese', name: 'synthese' },
  { path: '/calendar', name: 'calendar' },
  { path: '/revisions', name: 'revisions' },
];
const OUT = join(process.cwd(), 'docs', 'audits', 'visual', `v55-${LABEL}`);
mkdirSync(OUT, { recursive: true });

function probe() {
  const de = document.documentElement;
  const main = document.querySelector('main.content') ?? document.body;
  const overflow = Math.max(0, de.scrollWidth - de.clientWidth);
  const pageH = de.scrollHeight;
  const area = (r) => Math.max(0, r.width) * Math.max(0, r.height);

  // ── Dominance : le plus grand bloc structurant occupe quelle part de la
  // surface des blocs structurants ? Une page « 8 blocs de poids équivalent »
  // (l'échec explicitement nommé) donne une dominance basse et un écart
  // premier/second proche de 1.
  const blocks = [...main.querySelectorAll('section, article, aside, .ui-focus, .panel, .ui-panel')]
    .filter((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 120 || r.height < 60) return false;
      // On ne compte pas un bloc dont un ancêtre est déjà compté (évite de
      // mesurer des poupées russes).
      return !el.parentElement?.closest('section, article, aside, .ui-focus, .panel, .ui-panel');
    })
    .map((el) => ({ a: area(el.getBoundingClientRect()), c: (el.getAttribute('class') || el.tagName).slice(0, 28) }))
    .sort((x, y) => y.a - x.a);
  const total = blocks.reduce((s, b) => s + b.a, 0) || 1;
  const dominance = blocks.length ? +(blocks[0].a / total).toFixed(3) : 0;
  const ratio12 = blocks.length > 1 && blocks[1].a > 0 ? +(blocks[0].a / blocks[1].a).toFixed(2) : null;

  // ── Profondeur de surfaces : combien de fonds distincts réellement utilisés
  // dans le contenu ? Un produit « background + panel + border » en a 2-3.
  const bgs = new Set();
  const shadows = new Set();
  const radii = new Set();
  for (const el of main.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.width < 60 || r.height < 24) continue;
    const cs = getComputedStyle(el);
    if (cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') bgs.add(cs.backgroundColor);
    if (cs.backgroundImage && cs.backgroundImage !== 'none') bgs.add(cs.backgroundImage.slice(0, 60));
    if (cs.boxShadow && cs.boxShadow !== 'none') shadows.add(cs.boxShadow.slice(0, 50));
    if (cs.borderTopLeftRadius && cs.borderTopLeftRadius !== '0px') radii.add(cs.borderTopLeftRadius);
  }

  // ── Échelle typographique effectivement RENDUE (pas déclarée dans les tokens).
  const sizes = new Map();
  for (const el of main.querySelectorAll('*')) {
    if (el.children.length) continue;
    const t = (el.textContent ?? '').trim();
    if (!t) continue;
    const cs = getComputedStyle(el);
    const px = Math.round(parseFloat(cs.fontSize));
    if (!px) continue;
    sizes.set(px, (sizes.get(px) ?? 0) + t.length);
  }
  const scale = [...sizes.keys()].sort((a, b) => b - a);
  const maxFont = scale[0] ?? 0;
  // Amplitude : rapport entre le plus gros titre rendu et le corps de texte
  // dominant (la taille qui porte le plus de caractères).
  const bodyPx = [...sizes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0;
  const typeRange = bodyPx ? +(maxFont / bodyPx).toFixed(2) : 0;

  // ── Répétition : la « constellation de petites cards identiques ».
  const classCount = new Map();
  for (const el of main.querySelectorAll('*')) {
    // `el.className` est un SVGAnimatedString sur les nœuds SVG : lire l'attribut.
    const c = (el.getAttribute('class') || '').trim();
    if (!c || c.length > 60) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 140 || r.height < 60) continue;
    classCount.set(c, (classCount.get(c) ?? 0) + 1);
  }
  const topRepeat = [...classCount.entries()].sort((a, b) => b[1] - a[1])[0] ?? ['—', 0];

  // ── Vide vertical maximal dans la colonne de contenu (bandes de 24 px).
  const band = 24;
  const bands = Math.max(1, Math.ceil(pageH / band));
  const filled = new Array(bands).fill(false);
  for (const el of main.querySelectorAll('*')) {
    if (el.children.length) continue;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) continue;
    const top = r.top + window.scrollY, bot = r.bottom + window.scrollY;
    for (let b = Math.floor(top / band); b <= Math.floor(bot / band); b++) if (b >= 0 && b < bands) filled[b] = true;
  }
  let gap = 0, cur = 0;
  for (const f of filled) { if (f) { gap = Math.max(gap, cur); cur = 0; } else cur++; }
  const fill = +(filled.filter(Boolean).length / bands).toFixed(3);

  const cta = document.querySelector('.btn.cta, .btn.primary');
  return {
    overflow, pageH,
    blocks: blocks.length, dominance, ratio12, topBlock: blocks[0]?.c ?? '—',
    surfaces: bgs.size, shadows: shadows.size, radii: radii.size,
    fontSteps: scale.length, maxFont, bodyPx, typeRange,
    topRepeatClass: topRepeat[0], topRepeatCount: topRepeat[1],
    fill, maxGap: gap * band,
    cta: !!cta,
  };
}

const rows = [];
const browser = await chromium.launch({
  executablePath: EXEC,
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--disable-dev-shm-usage'],
});
try {
  for (const route of ROUTES) {
    for (const width of WIDTHS) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      const errs = [];
      page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 90)));
      const resp = await page.goto(`${BASE}${route.path}`, { waitUntil: 'networkidle', timeout: 45000 });
      const m = await page.evaluate(probe);
      await page.screenshot({ path: join(OUT, `${route.name}@${width}.png`), fullPage: true });
      rows.push({ route: route.name, width, status: resp?.status() ?? 0, errors: errs.length, ...m });
      await page.close();
    }
  }
} finally { await browser.close(); }

writeFileSync(join(OUT, 'metrics.json'), JSON.stringify(rows, null, 2));
console.log(`\n=== V55 DESIGN DENSITY (${LABEL}) — ${BASE} ===`);
console.log('page@largeur          | ovf | hauteur | blocs dom.  1er/2e | surf omb ray | typo pas/max/amp | répétition | remplissage vide | CTA');
for (const r of rows) {
  console.log(
    `${`${r.route}@${r.width}`.padEnd(21)} | ${String(r.overflow).padStart(3)} | ${String(r.pageH).padStart(7)} `
    + `| ${String(r.blocks).padStart(2)} ${String(r.dominance).padStart(5)} ${String(r.ratio12 ?? '—').padStart(6)} `
    + `| ${String(r.surfaces).padStart(4)} ${String(r.shadows).padStart(3)} ${String(r.radii).padStart(3)} `
    + `| ${String(r.fontSteps).padStart(6)} ${String(r.maxFont).padStart(3)} ${String(r.typeRange).padStart(5)} `
    + `| ${String(r.topRepeatCount).padStart(2)}× ${r.topRepeatClass.slice(0, 16).padEnd(16)} `
    + `| ${String(r.fill).padStart(5)} ${String(r.maxGap).padStart(4)} | ${r.cta ? 'oui' : 'NON'}${r.errors ? ` | err ${r.errors}` : ''}`,
  );
}
console.log(`\ncaptures → ${OUT}`);
