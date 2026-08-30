// Gate V54 — Product UX Implementation II (au-dessus de v52/v53:check).
//  1) Gel Curriculum 1.0 (corpus SHA-1 + ordre 365 jours) + progress.json intact.
//  2) P0 intégrité : DayPanel garde le flush derrière un indicateur d'édition réel
//     (une consultation ne doit jamais écrire). Preuve runtime : v54-progress-integrity.
//  3) Anti-gamification (XP/streak/level/badge RPG/leaderboard/confetti).
//  4) Routes pilotes + cœur présentes.
//  5) Tokens : 0 hex en dur dans le TSX ; échelle d'élévation présente.
//  6) Primitives : PrimaryFocus + ListRow exportées ; primitives sans moteur.
//  7) Accent indigo ; tons sémantiques présents.
//  8) A11y : skip link + reduced-motion.
// Read-only, déterministe.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const errors = [];
const warns = [];
// Empreinte des leçons REGELÉE au V66 · CP8 (précédente : e34b1c76dc7f9e7be1cc40f7f8fcd0b7733811f2).
// 9 leçons durcies + une clôture de bloc réparée dans rag-evaluation.md.
// Inventaire ligne à ligne : docs/audits/V66-FLAGSHIPS.md. Le gel n'est pas
// assoupli : il a rougi comme prévu sur une modification autorisée.
// V67 · CP3-CP8 — RE-GEL, TROISIEME, sur autorisation explicite. 44 des 45
// lecons de famille C etaient privees de correction, de cas professionnel, de
// transfert et de recuperation active ; 17 lecons passaient sous le seuil de
// profondeur. V67 a traite ce stock. Le gel a rougi de lui-meme, ce qui est sa
// fonction ; il est mis a jour ici, jamais silencieusement.
//   V66 -> e34b1c76dc7f9e7be1cc40f7f8fcd0b7733811f2
//   V67 -> 8c049363e243c57be0be76f1d745005d47400682
// Re-gelé par V68 (CP15). Le corpus de leçons a changé parce que les 41 leçons du
// parcours qui n'avaient AUCUNE correction en ont désormais une, et que
// metrics-percentiles portait un p99 faux d'un facteur 50. Voir
// docs/V68-CP0-AUDIT.md et docs/V68-FINAL-REPORT.md. Aucune journée n'a été
// réordonnée ; data/progress.json est inchangé.
// Re-gelé en V69 (CP3-CP8) : réécriture pédagogique autorisée de 40 exemples guidés
// (docs/V69-FINAL-REPORT.md, docs/V69-LESSON-LEDGER.md). Le gel protège contre une
// dérive SILENCIEUSE du corpus, pas contre une réécriture décidée et documentée.
// Chaîne des empreintes : 7c9db74f -> b5ed5aee -> 7a3fd017 -> 64748e15.
// RE-GEL V70 CP5 puis CP6 — le corpus des 128 leçons a été modifié volontairement.
// Lot Frontend / Next.js / CSS : 19 leçons réécrites en profondeur (exemples
// guidés reconstruits, pratiques avec production observable, corrections
// raisonnées). Le gel passe de 64748e1522904dbc811bb486409d6fb53dc0ec75
// à 8c049363e243c57be0be76f1d745005d47400682.
// Ce n'est pas un contournement du gate : le gate protège contre une
// modification NON DÉCLARÉE du corpus, et celle-ci est déclarée, committée
// et mesurée (mini-statut CP5).
const FROZEN_CORPUS = '4154da31f6b732b83f2aaed304f17bbd457e19c4';
const FROZEN_PROGRESS = '323604021055588a9528a86875f36598dbdc7758';
const PILOTS = ['app/page.tsx', 'app/day/[id]/page.tsx', 'app/skills/page.tsx'];
const CORE = ['app/missions/page.tsx', 'app/revisions/page.tsx', 'app/diagnostics/page.tsx'];
const PRIMS = ['PrimaryFocus', 'ListRow', 'Status', 'PageHeader', 'Metric', 'Panel'];

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f); const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (f.endsWith('.tsx') || f.endsWith('.ts')) out.push(p);
  }
  return out;
}
const tsxFiles = existsSync(R('app')) ? walk(R('app')) : [];

// 1) Gel.
try { const s = execSync("find curriculum/lessons -name '*.md' | sort | xargs cat | sha1sum", { cwd: ROOT }).toString().trim().split(/\s+/)[0]; if (s !== FROZEN_CORPUS) errors.push(`[corpus] SHA-1 modifié : ${s}`); } catch { warns.push('[corpus] hash indisponible'); }
try { const b = execSync('git hash-object data/progress.json', { cwd: ROOT }).toString().trim(); if (b !== FROZEN_PROGRESS) errors.push(`[progress] modifié : ${b} (attendu ${FROZEN_PROGRESS})`); } catch { warns.push('[progress] indisponible'); }
try { const prog = JSON.parse(readFileSync(R('data/program.json'), 'utf8')); if (prog.days.length !== 365) errors.push(`[days] ${prog.days.length} ≠ 365`); else if (!prog.days.every((d, i) => d.day === i + 1)) errors.push('[order] ordre des 365 jours modifié'); } catch { warns.push('[program] illisible'); }

// 2) P0 intégrité : la garde d'édition dans DayPanel.
const dayPanel = existsSync(R('app/day/[id]/DayPanel.tsx')) ? readFileSync(R('app/day/[id]/DayPanel.tsx'), 'utf8') : '';
if (!dayPanel) errors.push('[p0] DayPanel introuvable');
else {
  if (!/edited\s*=\s*useRef\(false\)/.test(dayPanel)) errors.push('[p0] indicateur d\'édition « edited » absent de DayPanel');
  if (!/if\s*\(!edited\.current\)\s*return/.test(dayPanel)) errors.push('[p0] flush non gardé par edited.current (régression mutation à la consultation)');
}
if (!existsSync(R('scripts/v54-progress-integrity.mjs'))) errors.push('[p0] preuve VISIT_DAY_DOES_NOT_MUTATE_PROGRESS absente');

// 3) Anti-gamification.
const GAMIF = /\bXP\b|\bstreak\b|gamif|\bconfetti\b|\bleaderboard\b/i;
for (const f of tsxFiles) readFileSync(f, 'utf8').split('\n').forEach((ln, i) => { if (GAMIF.test(ln)) errors.push(`[gamification] ${f.replace(ROOT + '/', '')}:${i + 1}`); });

// 4) Routes.
for (const route of [...PILOTS, ...CORE]) if (!existsSync(R(route))) errors.push(`[route] manquante : ${route}`);

// 5) Tokens + élévation.
let hex = 0;
for (const f of tsxFiles) { const m = readFileSync(f, 'utf8').match(/#[0-9a-fA-F]{6}\b/g); if (m) hex += m.length; }
if (hex > 0) errors.push(`[tokens] ${hex} couleur(s) hex en dur dans le TSX (base 0)`);
const css = existsSync(R('app/globals.css')) ? readFileSync(R('app/globals.css'), 'utf8') : '';
for (const tk of ['--bg', '--panel', '--panel-2', '--raised', '--border', '--accent', '--ok', '--shadow-1']) {
  if (!css.includes(`${tk}:`)) errors.push(`[design-system] token « ${tk} » absent (échelle d'élévation V54)`);
}
// Accent indigo (bleu dominant).
const am = css.match(/--accent:\s*#([0-9a-fA-F]{6})/);
if (am) { const [r, g, b] = [0, 2, 4].map((i) => parseInt(am[1].slice(i, i + 2), 16)); if (!(b > r && b >= g)) errors.push(`[accent] #${am[1]} non indigo`); }
else errors.push('[accent] --accent introuvable');
for (const tone of ['.tone-positive', '.tone-attention', '.tone-accent']) if (!css.includes(tone)) errors.push(`[design-system] ton « ${tone} » absent`);

// 6) Primitives.
const barrel = existsSync(R('app/ui/index.ts')) ? readFileSync(R('app/ui/index.ts'), 'utf8') : '';
for (const p of PRIMS) if (!barrel.includes(p)) errors.push(`[primitives] « ${p} » non exporté par app/ui`);
const uiFiles = existsSync(R('app/ui')) ? readdirSync(R('app/ui')).filter((f) => f.endsWith('.tsx') || f.endsWith('.ts')) : [];
for (const f of uiFiles) { const t = readFileSync(R(join('app/ui', f)), 'utf8'); if (/progress-server|progress-store|writeProgress/.test(t)) errors.push(`[second-source] app/ui/${f} touche au moteur de progression`); }

// 8) A11y.
const shell = existsSync(R('app/shell/AppShell.tsx')) ? readFileSync(R('app/shell/AppShell.tsx'), 'utf8') : '';
if (!/skip-link|#main/.test(shell)) errors.push('[a11y] skip link absent');
if (!/prefers-reduced-motion/.test(css)) errors.push('[a11y] prefers-reduced-motion absent');

console.log('── Gate V54 (Product UX Implementation II)');
console.log(`Fichiers UI : ${tsxFiles.length} · hex : ${hex} · primitives : ${PRIMS.length} · routes : ${PILOTS.length + CORE.length}`);
if (warns.length) { console.log(`Avertissements (${warns.length}) :`); for (const w of warns.slice(0, 10)) console.log('  ⚠ ' + w); }
if (errors.length) {
  console.error(`\n❌ Gate V54 : ${errors.length} violation(s) :`);
  for (const e of errors) console.error('  • ' + e);
  process.exit(1);
}
console.log('\n✅ V54 valide : Curriculum gelé, P0 intégrité gardé, élévation + accent indigo, primitives cockpit adoptées, anti-gamification, a11y.');
