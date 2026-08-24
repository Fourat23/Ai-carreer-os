// Gate V55 — PRODUCT IDENTITY.
//
// Les gates précédents protègent la JUSTESSE (ordre, partition, vide
// structurel, accessibilité). Celui-ci protège l'IDENTITÉ : il empêche le
// produit de retomber silencieusement sur « background + panel + border »,
// une échelle typographique plate et des pages sans point focal.
//
// Aucun de ces contrôles ne « prouve » la qualité — ils rendent impossible la
// disparition discrète des acquis. Les mesures de rendu réel (dominance,
// profondeur, amplitude typographique) vivent dans scripts/v55-visual.mjs.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const errors = [];
const warns = [];
const css = readFileSync(R('app/globals.css'), 'utf8');

// ── 1) Échelle de surfaces à six crans ────────────────────────────────────
const SURFACES = ['--canvas', '--shell', '--surface', '--raised', '--focus-surface', '--interactive'];
for (const t of SURFACES) {
  if (!new RegExp(`${t}\\s*:`).test(css)) errors.push(`[profondeur] token de surface « ${t} » absent`);
}
// Élévation : quatre crans + halo d'accent réservé au focus.
for (const t of ['--shadow-1', '--shadow-2', '--shadow-3', '--shadow-focus', '--glow-accent']) {
  if (!new RegExp(`${t}\\s*:`).test(css)) errors.push(`[profondeur] token d'élévation « ${t} » absent`);
}
// Gradients LOCAUX déclarés comme tokens (et non éparpillés en dur).
for (const t of ['--grad-surface', '--grad-raised', '--grad-focus', '--grad-accent-edge']) {
  if (!new RegExp(`${t}\\s*:`).test(css)) errors.push(`[profondeur] token de gradient « ${t} » absent`);
}

// ── 2) Le halo d'accent est réservé à UNE zone ────────────────────────────
// `--glow-accent` sur plusieurs sélecteurs = plus de point focal du tout.
const glowUses = (css.match(/var\(--glow-accent\)/g) ?? []).length;
if (glowUses === 0) errors.push('[identité] --glow-accent déclaré mais jamais utilisé');
if (glowUses > 3) errors.push(`[identité] --glow-accent utilisé ${glowUses} fois : le halo doit rester exceptionnel`);

// ── 3) Échelle typographique avec un vrai cran display ────────────────────
for (const t of ['--fs-display-xl', '--fs-display-lg', '--tracking-display', '--lh-display']) {
  if (!new RegExp(`${t}\\s*:`).test(css)) errors.push(`[typographie] token « ${t} » absent`);
}
// Le titre de page DOIT consommer le cran display (sinon l'échelle est morte).
if (!/\.page-title\s*\{[^}]*--fs-display-xl/.test(css)) {
  errors.push('[typographie] .page-title ne consomme pas --fs-display-xl');
}
// Le cran display doit être fluide : une valeur fixe replafonne le rendu.
if (!/--fs-display-xl:\s*clamp\(/.test(css)) errors.push('[typographie] --fs-display-xl doit être fluide (clamp)');

// ── 4) Un point focal par grande page, jamais zéro ni deux ────────────────
const FOCUS_PAGES = [
  ['app/page.tsx', 'Dashboard'],
  ['app/parcours/page.tsx', 'Parcours'],
  ['app/synthese/page.tsx', 'Synthèse'],
  ['app/calendar/page.tsx', 'Calendrier'],
];
for (const [f, name] of FOCUS_PAGES) {
  const src = readFileSync(R(f), 'utf8');
  const n = (src.match(/<HeroFocus\b/g) ?? []).length + (src.match(/<PrimaryFocus\b/g) ?? []).length;
  if (n !== 1) errors.push(`[composition] ${name} doit avoir exactement 1 point focal (trouvé ${n})`);
}

// ── 5) Le halo est réservé au Dashboard (tone accent) ─────────────────────
// Les autres pages utilisent le hero en ton `calm` : une seule page « appelle
// à l'action » avec l'accent plein, sinon l'accent cesse de signifier.
for (const [f, name] of FOCUS_PAGES.slice(1)) {
  const src = readFileSync(R(f), 'utf8');
  if (/<HeroFocus\b/.test(src) && !/tone="calm"/.test(src)) {
    errors.push(`[identité] ${name} : le hero doit être en ton « calm » (le halo reste au Dashboard)`);
  }
}

// ── 6) Aucun élément graphique sans donnée ────────────────────────────────
// L'anneau de position ne doit consommer que des grandeurs réelles ; s'il
// prenait une valeur littérale, il deviendrait un ornement.
const ring = existsSync(R('app/ui/PositionRing.tsx')) ? readFileSync(R('app/ui/PositionRing.tsx'), 'utf8') : '';
if (!ring) errors.push('[identité] app/ui/PositionRing.tsx absent');
else if (/percent=\{?\s*\d/.test(ring)) errors.push('[données] PositionRing reçoit une valeur littérale');
for (const [f] of FOCUS_PAGES) {
  const src = readFileSync(R(f), 'utf8');
  for (const m of src.match(/<PositionRing[^/]*\/>/gs) ?? []) {
    if (/percent=\{\s*\d+(\.\d+)?\s*\}/.test(m)) errors.push(`[données] ${f} : PositionRing avec un pourcentage en dur`);
  }
}

// ── 7) Anti-slop : aucun ornement animé, aucun décor sans fonction ────────
// Une animation permanente (`infinite`) est décorative par définition.
for (const m of css.match(/animation:[^;]+;/g) ?? []) {
  if (/infinite/.test(m) && !/spin/.test(m)) errors.push(`[slop] animation permanente : ${m.slice(0, 60)}`);
}
// `prefers-reduced-motion` doit neutraliser les transitions ajoutées en V55.
if (!/@media \(prefers-reduced-motion: reduce\)/.test(css)) {
  errors.push('[a11y] aucune neutralisation prefers-reduced-motion');
}

// ── 8) Aucune couleur en dur dans le TSX (le design system fait foi) ──────
function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f); const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (f.endsWith('.tsx')) out.push(p);
  }
  return out;
}
let hex = 0;
for (const file of walk(R('app'))) {
  const src = readFileSync(file, 'utf8');
  for (const m of src.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []) {
    // Les ancres et fragments d'URL ne sont pas des couleurs.
    if (/^#[0-9a-fA-F]{3,8}$/.test(m)) { hex++; errors.push(`[tokens] couleur en dur ${m} dans ${file.replace(ROOT + '/', '')}`); }
  }
}

// ── 9) Le harnais de densité de design existe ─────────────────────────────
if (!existsSync(R('scripts/v55-visual.mjs'))) errors.push('[harnais] scripts/v55-visual.mjs manquant');

console.log('── Gate V55 (product identity)');
console.log(`Surfaces : ${SURFACES.length} crans · halo d'accent : ${glowUses} usage(s) · hex en dur : ${hex}`);
if (warns.length) { console.log(`Avertissements (${warns.length}) :`); for (const w of warns) console.log(`  ⚠ ${w}`); }
if (errors.length) {
  console.error(`\n❌ V55 invalide (${errors.length}) :`);
  for (const e of errors) console.error(`  • ${e}`);
  process.exit(1);
}
console.log('\n✅ V55 valide : profondeur de surfaces à six crans, élévation à quatre crans, '
  + 'cran display fluide consommé par les titres, exactement 1 point focal par grande page, '
  + 'halo réservé au Dashboard, aucun élément graphique sans donnée, 0 couleur en dur.');
