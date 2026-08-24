// V56 — Harnais de mesure « signature produit ».
//
// Étend v55-visual.mjs avec les indicateurs GELÉS À CP0 dans
// docs/V56-SCORING-FROZEN.md : anti-cardification (§3), motifs propriétaires
// (§5), et les critères R de « route réellement recomposée » (§4).
//
// Rappel de la règle du sprint : ces seuils ne sont PAS modifiables après CP0.
// Si un indicateur se révèle mauvais, on conserve son résultat et on le
// signale — on ne réécrit pas la règle.
//
// Usage : node scripts/v56-visual.mjs <label> [baseUrl] [--routes a,b,c]
// Ne restaure rien : la navigation ne doit pas muter data/progress.json.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const EXEC = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const LABEL = process.argv[2] ?? 'after';
const BASE = process.argv[3]?.startsWith('http') ? process.argv[3] : 'http://127.0.0.1:3240';
const WIDTHS = (() => {
  const i = process.argv.indexOf('--widths');
  return i > 0 ? process.argv[i + 1].split(',').map(Number) : [375, 768, 1440, 1920];
})();

// Journées représentatives FIGÉES à CP0 (§7 du document de gel).
const DAYS = [
  { day: 181, role: 'courte' },
  { day: 80, role: 'longue' },
  { day: 1, role: 'code' },
  { day: 150, role: 'data-ml' },
  { day: 205, role: 'ia-avancee' },
];
const DEFAULT_ROUTES = [
  { path: '/', name: 'dashboard' },
  ...DAYS.map((d) => ({ path: `/day/${d.day}`, name: `day-${d.day}-${d.role}` })),
  { path: '/revisions', name: 'revisions' },
  { path: '/parcours', name: 'parcours' },
  { path: '/calendar', name: 'calendar' },
];
const ROUTES = (() => {
  const i = process.argv.indexOf('--routes');
  if (i < 0) return DEFAULT_ROUTES;
  return process.argv[i + 1].split(',').map((p) => ({ path: p, name: p.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'root' }));
})();

const OUT = join(process.cwd(), 'docs', 'audits', 'visual', `v56-${LABEL}`);
mkdirSync(OUT, { recursive: true });

// ── Motifs propriétaires — liste FIGÉE à CP0 (§5) ─────────────────────────
// Chaque entrée : classe racine → nom du motif. Un motif ne compte que s'il
// est réutilisé sur ≥ 2 surfaces (agrégé après la passe).
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

  // ── Dominance (identique à V55 pour rester comparable) ──────────────────
  const blocks = [...main.querySelectorAll('section, article, aside, .ui-focus, .ui-hero, .panel, .ui-panel')]
    .filter((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 120 || r.height < 60) return false;
      return !el.parentElement?.closest('section, article, aside, .ui-focus, .ui-hero, .panel, .ui-panel');
    })
    .map((el) => ({ a: area(el.getBoundingClientRect()), c: (el.getAttribute('class') || el.tagName).slice(0, 28) }))
    .sort((x, y) => y.a - x.a);
  const totalA = blocks.reduce((s, b) => s + b.a, 0) || 1;
  const dominance = blocks.length ? +(blocks[0].a / totalA).toFixed(3) : 0;

  // ── Profondeur ──────────────────────────────────────────────────────────
  const bgs = new Set(); const shadows = new Set();
  for (const el of main.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.width < 60 || r.height < 24) continue;
    const cs = getComputedStyle(el);
    if (cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') bgs.add(cs.backgroundColor);
    if (cs.backgroundImage && cs.backgroundImage !== 'none') bgs.add(cs.backgroundImage.slice(0, 60));
    if (cs.boxShadow && cs.boxShadow !== 'none') shadows.add(cs.boxShadow.slice(0, 50));
  }

  // ── Typographie ─────────────────────────────────────────────────────────
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

  // ── ANTI-CARDIFICATION (seuils gelés §3) ────────────────────────────────
  // Une « carte » = fond non transparent ET bordure ET rayon ≥ 6 px ET
  // aire ≥ 12 000 px². Définition volontairement stricte : elle ne compte pas
  // les puces, badges et lignes de liste.
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

  // Part des caractères du contenu principal vivant HORS d'une surface carte.
  let charsTotal = 0, charsOnCanvas = 0;
  for (const el of main.querySelectorAll('*')) {
    if (el.children.length) continue;
    const t = (el.textContent ?? '').trim();
    if (!t) continue;
    charsTotal += t.length;
    if (!cardEls.some((c) => c.contains(el))) charsOnCanvas += t.length;
  }
  const canvasShare = charsTotal ? +(charsOnCanvas / charsTotal).toFixed(3) : 0;

  // Répétition de structures identiques.
  const classCount = new Map();
  for (const el of main.querySelectorAll('*')) {
    const c = (el.getAttribute('class') || '').trim();
    if (!c || c.length > 60) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 140 || r.height < 60) continue;
    classCount.set(c, (classCount.get(c) ?? 0) + 1);
  }
  const topRepeat = [...classCount.entries()].sort((a, b) => b[1] - a[1])[0] ?? ['—', 0];

  // ── MÉTRIQUE COMPLÉMENTAIRE (ajoutée en cours de V56, jamais en
  // remplacement — la règle de gel interdit de réécrire un seuil, elle
  // autorise d'AJOUTER).
  // Limite constatée de `maxRepeat` : il compte la répétition d'une signature
  // de classe quelle qu'elle soit. Or la journée 80 porte RÉELLEMENT 16
  // activités ; seize LIGNES d'une même liste ne sont pas de la cardification,
  // seize CARTES le sont. `maxRepeatCarded` ne compte donc que la répétition
  // parmi les éléments réellement « carte ». Les deux valeurs sont reportées.
  const cardedCount = new Map();
  for (const el of cardEls) {
    const c = (el.getAttribute('class') || '').trim();
    if (!c || c.length > 60) continue;
    cardedCount.set(c, (cardedCount.get(c) ?? 0) + 1);
  }
  const topCarded = [...cardedCount.entries()].sort((a, b) => b[1] - a[1])[0] ?? ['—', 0];
  const surfaceRatio = cards ? +(bgs.size / cards).toFixed(2) : null;

  // ── Motifs propriétaires présents ───────────────────────────────────────
  const motifs = motifSelectors.filter((s) => document.querySelector(s));

  // ── Contenu rogné (même définition qu'en V54.2.1) ───────────────────────
  let clipped = 0;
  for (const el of main.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    if (cs.overflowX !== 'hidden' && cs.overflowX !== 'clip') continue;
    if (cs.textOverflow === 'ellipsis') continue;
    if (el.clientWidth < 40) continue;
    if (el.scrollWidth - el.clientWidth > 4) clipped++;
  }

  // ── Remplissage vertical ────────────────────────────────────────────────
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

  // Structure de premier niveau, pour le critère R1 (comparaison AVANT/APRÈS).
  const topStructure = blocks.map((b) => b.c);

  return {
    overflow, clipped, pageH, fill,
    blocks: blocks.length, dominance, topStructure,
    surfaces: bgs.size, shadows: shadows.size,
    maxFont, bodyPx, typeRange, fontSteps: scale.length,
    cards, maxRepeat: topRepeat[1], topRepeatClass: topRepeat[0],
    maxRepeatCarded: topCarded[1], topCardedClass: topCarded[0],
    canvasShare, surfaceRatio,
    motifs,
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
      const resp = await page.goto(`${BASE}${route.path}`, { waitUntil: 'networkidle', timeout: 60000 });
      const m = await page.evaluate(probe, sel);
      await page.screenshot({ path: join(OUT, `${route.name}@${width}.png`), fullPage: true });
      rows.push({ route: route.name, path: route.path, width, status: resp?.status() ?? 0, errors: errs.length, ...m });
      await page.close();
    }
  }
} finally { await browser.close(); }

writeFileSync(join(OUT, 'metrics.json'), JSON.stringify(rows, null, 2));

const seen = new Map();
for (const r of rows) for (const s of r.motifs) seen.set(s, (seen.get(s) ?? new Set()).add(r.route));

console.log(`\n=== V56 SIGNATURE (${LABEL}) — ${BASE} ===`);
console.log('page@largeur              | ovf rogn | hauteur | dom.  surf omb | typo amp | cartes rép/cartées canvas ratio | motifs | CTA');
for (const r of rows) {
  console.log(
    `${`${r.route}@${r.width}`.padEnd(25)} | ${String(r.overflow).padStart(3)} ${String(r.clipped).padStart(4)} `
    + `| ${String(r.pageH).padStart(7)} | ${String(r.dominance).padStart(5)} ${String(r.surfaces).padStart(4)} ${String(r.shadows).padStart(3)} `
    + `| ${String(r.maxFont).padStart(4)} ${String(r.typeRange).padStart(4)} `
    + `| ${String(r.cards).padStart(6)} ${String(r.maxRepeat).padStart(3)}/${String(r.maxRepeatCarded).padEnd(2)} ${String(r.canvasShare).padStart(6)} ${String(r.surfaceRatio ?? '—').padStart(5)} `
    + `| ${String(r.motifs.length).padStart(6)} | ${r.cta ? 'oui' : 'NON'}${r.errors ? ` | err ${r.errors}` : ''}`,
  );
}
console.log('\nMotifs propriétaires détectés (règle : ≥ 2 surfaces pour compter) :');
for (const [s, routes] of seen) {
  const n = new Set([...routes].map((x) => x.replace(/-\d+.*/, ''))).size;
  console.log(`  ${MOTIFS[s].padEnd(16)} ${s.padEnd(14)} ${n} surface(s) : ${[...routes].join(', ')}`);
}
if (!seen.size) console.log('  aucun');
console.log(`\ncaptures → ${OUT}`);
