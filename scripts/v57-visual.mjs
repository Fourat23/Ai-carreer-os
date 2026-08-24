// V57 — Harnais de mesure « propagation de la signature ».
//
// Reprend À L'IDENTIQUE les formules gelées de scripts/v56-visual.mjs
// (docs/V56-SCORING-FROZEN.md) et n'y touche pas. Il AJOUTE les trois
// compteurs de docs/V57-METRICS-ADDENDUM.md — `topBlocks`, `cardsContainer`,
// `cardsItem` — dont le CP0 a établi la nécessité :
//   · `dominance` rend la même valeur pour une page bien composée, une page à
//     bloc unique (1,00) et une page sans bloc (0,00) ; `topBlocks` lève
//     l'ambiguïté sans remplacer la métrique gelée ;
//   · `cards` est un total qui ne distingue pas l'enveloppe de la feuille ;
//     V56 a cru sa dé-cardification sans effet alors qu'elle avait déplacé la
//     frontière de carte d'un niveau vers le haut.
// Aucun de ces trois compteurs n'entre dans un critère R : ils ne peuvent
// faire passer aucune route.
//
// Usage : node scripts/v57-visual.mjs <label> [baseUrl] [--routes a,b] [--widths ...]
// Ne restaure rien : la navigation ne doit pas muter data/progress.json.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const EXEC = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const LABEL = process.argv[2] ?? 'after';
const BASE = process.argv[3]?.startsWith('http') ? process.argv[3] : 'http://127.0.0.1:3257';
const arg = (flag, dflt) => {
  const i = process.argv.indexOf(flag);
  return i > 0 ? process.argv[i + 1] : dflt;
};
const WIDTHS = arg('--widths', '375,768,1440,1920').split(',').map(Number);
const SHOT = arg('--shots', 'yes') !== 'no';

// Routes V57 par défaut : celles que le sprint transforme, plus deux témoins
// déjà forts (`/` et `/day/80`) conservés SANS modification pour contrôle.
const DEFAULT = [
  '/revisions', '/month/1', '/week/1', '/lab', '/lab/fizzbuzz',
  '/diagnostics', '/capstones', '/capstones/agent-tool-loop-incident',
  '/projects', '/reviews', '/missions/cicd-blocked-delivery',
  '/pipelines', '/kubernetes', '/cloud-lab', '/security', '/cloud-foundations',
  '/', '/day/80',
];
const ROUTES = arg('--routes', DEFAULT.join(','))
  .split(',')
  .map((p) => ({ path: p, name: p.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'root' }));

const OUT = join(process.cwd(), 'docs', 'audits', 'visual', `v57-${LABEL}`);
mkdirSync(OUT, { recursive: true });

// Liste de motifs FIGÉE en V56 (§5) — fermée à cinq, aucun ajout en V57.
const MOTIFS = {
  '.pos-ring': 'PositionRing',
  '.tmap': 'TrajectoryMap',
  '.phase-rail': 'PhaseRail',
  '.evi-mark': 'EvidenceMark',
  '.year-band': 'YearBand',
};

function probe(motifSelectors) {
  const de = document.documentElement;
  const main = document.querySelector('main.content') ?? document.body;
  const overflow = Math.max(0, de.scrollWidth - de.clientWidth);
  const pageH = de.scrollHeight;
  const area = (r) => Math.max(0, r.width) * Math.max(0, r.height);

  // ── Dominance — formule GELÉE V56, non modifiée ─────────────────────────
  const blockEls = [...main.querySelectorAll('section, article, aside, .ui-focus, .ui-hero, .panel, .ui-panel')]
    .filter((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 120 || r.height < 60) return false;
      return !el.parentElement?.closest('section, article, aside, .ui-focus, .ui-hero, .panel, .ui-panel');
    });
  const blocks = blockEls
    .map((el) => ({ a: area(el.getBoundingClientRect()), c: (el.getAttribute('class') || el.tagName).slice(0, 28) }))
    .sort((x, y) => y.a - x.a);
  const totalA = blocks.reduce((s, b) => s + b.a, 0) || 1;
  const dominance = blocks.length ? +(blocks[0].a / totalA).toFixed(3) : 0;
  // AJOUT V57 — se lit AVEC dominance, jamais à sa place (addendum §2).
  const topBlocks = blocks.length;

  // ── Profondeur — GELÉE ──────────────────────────────────────────────────
  const bgs = new Set(); const shadows = new Set();
  for (const el of main.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.width < 60 || r.height < 24) continue;
    const cs = getComputedStyle(el);
    if (cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') bgs.add(cs.backgroundColor);
    if (cs.backgroundImage && cs.backgroundImage !== 'none') bgs.add(cs.backgroundImage.slice(0, 60));
    if (cs.boxShadow && cs.boxShadow !== 'none') shadows.add(cs.boxShadow.slice(0, 50));
  }

  // ── Typographie — GELÉE ─────────────────────────────────────────────────
  const sizes = new Map();
  for (const el of main.querySelectorAll('*')) {
    if (el.children.length) continue;
    const t = (el.textContent ?? '').trim();
    if (!t) continue;
    const px = Math.round(parseFloat(getComputedStyle(el).fontSize));
    if (px) sizes.set(px, (sizes.get(px) ?? 0) + t.length);
  }
  const scale = [...sizes.keys()].sort((a, b) => b - a);
  const maxFont = scale[0] ?? 0;
  const bodyPx = [...sizes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0;
  const typeRange = bodyPx ? +(maxFont / bodyPx).toFixed(2) : 0;

  // ── Cardification — définition GELÉE de `cards`, inchangée ──────────────
  const cardEls = [];
  for (const el of main.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (area(r) < 12000) continue;
    const cs = getComputedStyle(el);
    const hasBg = cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)';
    const hasBorder = parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderLeftWidth) > 0;
    const radius = parseFloat(cs.borderTopLeftRadius) || 0;
    if (hasBg && hasBorder && radius >= 6) cardEls.push(el);
  }
  const cards = cardEls.length;
  // AJOUT V57 — décomposition de `cards`, jamais un remplacement.
  // Invariant vérifié plus bas : cardsItem + cardsContainer === cards.
  let cardsContainer = 0;
  for (const el of cardEls) if (cardEls.some((o) => o !== el && el.contains(o))) cardsContainer++;
  const cardsItem = cards - cardsContainer;

  let charsTotal = 0, charsOnCanvas = 0;
  for (const el of main.querySelectorAll('*')) {
    if (el.children.length) continue;
    const t = (el.textContent ?? '').trim();
    if (!t) continue;
    charsTotal += t.length;
    if (!cardEls.some((c) => c.contains(el))) charsOnCanvas += t.length;
  }
  const canvasShare = charsTotal ? +(charsOnCanvas / charsTotal).toFixed(3) : 0;

  const classCount = new Map();
  for (const el of main.querySelectorAll('*')) {
    const c = (el.getAttribute('class') || '').trim();
    if (!c || c.length > 60) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 140 || r.height < 60) continue;
    classCount.set(c, (classCount.get(c) ?? 0) + 1);
  }
  const topRepeat = [...classCount.entries()].sort((a, b) => b[1] - a[1])[0] ?? ['—', 0];

  const cardedCount = new Map();
  for (const el of cardEls) {
    const c = (el.getAttribute('class') || '').trim();
    if (!c || c.length > 60) continue;
    cardedCount.set(c, (cardedCount.get(c) ?? 0) + 1);
  }
  const topCarded = [...cardedCount.entries()].sort((a, b) => b[1] - a[1])[0] ?? ['—', 0];
  const surfaceRatio = cards ? +(bgs.size / cards).toFixed(2) : null;

  const motifs = motifSelectors.filter((s) => document.querySelector(s));

  // ── Contenu rogné — définition GELÉE (V54.2.1) ──────────────────────────
  let clipped = 0; const clippedNodes = [];
  for (const el of main.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    if (cs.overflowX !== 'hidden' && cs.overflowX !== 'clip') continue;
    if (cs.textOverflow === 'ellipsis') continue;
    if (el.clientWidth < 40) continue;
    if (el.scrollWidth - el.clientWidth > 4) { clipped++; clippedNodes.push(`${el.tagName}.${String(el.className).slice(0, 26)}`); }
  }

  const band = 24;
  const bands = Math.max(1, Math.ceil(pageH / band));
  const filled = new Array(bands).fill(false);
  for (const el of main.querySelectorAll('*')) {
    if (el.children.length) continue;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) continue;
    for (let b = Math.floor((r.top + scrollY) / band); b <= Math.floor((r.bottom + scrollY) / band); b++) {
      if (b >= 0 && b < bands) filled[b] = true;
    }
  }
  const fill = +(filled.filter(Boolean).length / bands).toFixed(3);

  return {
    overflow, clipped, clippedNodes, pageH, fill,
    blocks: blocks.length, topBlocks, dominance, topStructure: blocks.map((b) => b.c).slice(0, 14),
    surfaces: bgs.size, shadows: shadows.size,
    maxFont, bodyPx, typeRange, fontSteps: scale.length,
    cards, cardsContainer, cardsItem,
    maxRepeat: topRepeat[1], topRepeatClass: topRepeat[0],
    maxRepeatCarded: topCarded[1], topCardedClass: topCarded[0],
    canvasShare, surfaceRatio, motifs,
    cta: !!document.querySelector('.btn.cta, .btn.primary'),
  };
}

const sel = Object.keys(MOTIFS);
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
      const resp = await page.goto(`${BASE}${route.path}`, { waitUntil: 'networkidle', timeout: 90000 });
      const m = await page.evaluate(probe, sel);
      if (SHOT) await page.screenshot({ path: join(OUT, `${route.name}@${width}.png`), fullPage: true });
      rows.push({ route: route.name, path: route.path, width, status: resp?.status() ?? 0, errors: errs.length, ...m });
      await page.close();
    }
  }
} finally { await browser.close(); }

// L'addendum ne peut pas dériver de la métrique gelée : on le vérifie.
const drift = rows.filter((r) => r.cardsItem + r.cardsContainer !== r.cards);
writeFileSync(join(OUT, 'metrics.json'), JSON.stringify(rows, null, 2));

console.log(`\n=== V57 PROPAGATION (${LABEL}) — ${BASE} ===`);
console.log('page@largeur              | ovf rogn | hauteur | dom.  topB | surf omb | typo amp | cartes cont/item | rép/cartées | canvas | motifs');
for (const r of rows) {
  console.log(
    `${`${r.route}@${r.width}`.padEnd(25)} | ${String(r.overflow).padStart(3)} ${String(r.clipped).padStart(4)} `
    + `| ${String(r.pageH).padStart(7)} | ${String(r.dominance).padStart(5)} ${String(r.topBlocks).padStart(4)} `
    + `| ${String(r.surfaces).padStart(4)} ${String(r.shadows).padStart(3)} `
    + `| ${String(r.maxFont).padStart(4)} ${String(r.typeRange).padStart(4)} `
    + `| ${String(r.cards).padStart(6)} ${String(r.cardsContainer).padStart(4)}/${String(r.cardsItem).padEnd(4)} `
    + `| ${String(r.maxRepeat).padStart(3)}/${String(r.maxRepeatCarded).padEnd(3)} | ${String(r.canvasShare).padStart(6)} `
    + `| ${r.motifs.map((s) => MOTIFS[s]).join('+') || '—'}${r.errors ? ` | err ${r.errors}` : ''}`,
  );
}
if (drift.length) {
  console.error(`\n❌ Invariant d'addendum rompu sur ${drift.length} état(s) : cardsItem + cardsContainer ≠ cards.`);
  process.exit(1);
}
console.log(`\ncaptures → ${OUT}`);
