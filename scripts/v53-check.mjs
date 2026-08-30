// Gate V53 — Product UX Implementation guardrails (au-dessus de v52:check).
//  1) Gel Curriculum 1.0 (corpus SHA-1 + ordre 365 jours) + progress.json intact.
//  2) Anti-gamification : aucun littéral XP/streak/level/badge RPG/leaderboard.
//  3) Routes pilotes présentes (Dashboard, Aujourd'hui, Compétences).
//  4) Tokens : ZÉRO hex en dur dans le TSX (consolidés en V53).
//  5) Design system : tokens clés + accent indigo présents dans globals.css.
//  6) Primitives partagées présentes (app/ui/*) et ADOPTÉES par les 3 pilotes.
//  7) Anti-seconde-source : les primitives ne redéfinissent aucun moteur (pas de
//     SKILL_STATES, pas d'import de progress-server) ; skill-vocabulary réutilise
//     skill-state.
//  8) Non-régression P0 /day : la liste blanche de parcours reste complète.
//  9) A11y : skip link présent dans le shell ; reduced-motion géré.
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
const FROZEN_CORPUS = '8c049363e243c57be0be76f1d745005d47400682';
const FROZEN_PROGRESS = '323604021055588a9528a86875f36598dbdc7758';
const HEX_BASELINE = 0; // V53 : plus aucune couleur hex en dur dans le TSX.
const PILOTS = ['app/page.tsx', 'app/day/[id]/page.tsx', 'app/skills/page.tsx'];
const PRIMITIVES = ['Status', 'PageHeader', 'SectionHeader', 'Metric', 'ActionRow', 'EmptyState', 'InlineNotice', 'Panel'];

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    const s = statSync(p);
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

// 2) Anti-gamification (littéraux non ambigus).
const GAMIF = /\bXP\b|\bstreak\b|gamif|\bconfetti\b|\bleaderboard\b/i;
for (const f of tsxFiles) {
  readFileSync(f, 'utf8').split('\n').forEach((ln, i) => {
    if (GAMIF.test(ln)) errors.push(`[gamification] ${f.replace(ROOT + '/', '')}:${i + 1} : « ${ln.trim().slice(0, 60)} »`);
  });
}

// 3) Routes pilotes.
for (const route of PILOTS) if (!existsSync(R(route))) errors.push(`[route] page pilote manquante : ${route}`);

// 4) Tokens : zéro hex en dur dans le TSX.
let hex = 0;
for (const f of tsxFiles) { const m = readFileSync(f, 'utf8').match(/#[0-9a-fA-F]{6}\b/g); if (m) hex += m.length; }
if (hex > HEX_BASELINE) errors.push(`[tokens] ${hex} couleur(s) hex en dur dans le TSX (> base ${HEX_BASELINE}) : utiliser les variables`);

// 5) Design system + accent indigo.
const css = existsSync(R('app/globals.css')) ? readFileSync(R('app/globals.css'), 'utf8') : '';
for (const tk of ['--bg', '--panel', '--border', '--accent', '--muted', '--ok', '--danger', '--sp-4', '--r']) {
  if (!css.includes(`${tk}:`)) errors.push(`[design-system] token « ${tk} » absent de globals.css`);
}
// Accent indigo/violet : composante bleue dominante (#8b8ff5). Anti-retour au teal.
const accentMatch = css.match(/--accent:\s*#([0-9a-fA-F]{6})/);
if (!accentMatch) errors.push('[accent] --accent introuvable');
else {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(accentMatch[1].slice(i, i + 2), 16));
  if (!(b > r && b >= g)) errors.push(`[accent] --accent #${accentMatch[1]} n'est pas indigo/violet (bleu non dominant)`);
}
for (const tone of ['.tone-neutral', '.tone-info', '.tone-positive', '.tone-attention', '.tone-blocking', '.tone-accent']) {
  if (!css.includes(tone)) errors.push(`[design-system] ton « ${tone} » absent (couleur jamais seule)`);
}

// 6) Primitives présentes + adoptées par les pilotes.
if (!existsSync(R('app/ui/index.ts'))) errors.push('[primitives] app/ui/index.ts absent');
else {
  const barrel = readFileSync(R('app/ui/index.ts'), 'utf8');
  for (const p of PRIMITIVES) if (!barrel.includes(p)) errors.push(`[primitives] « ${p} » non exporté par app/ui`);
}
for (const route of PILOTS) {
  if (!existsSync(R(route))) continue;
  const txt = readFileSync(R(route), 'utf8');
  // Le pilote (ou son composant client co-localisé) doit consommer app/ui.
  const dir = route.slice(0, route.lastIndexOf('/'));
  const localFiles = existsSync(R(dir)) ? readdirSync(R(dir)).filter((f) => f.endsWith('.tsx')).map((f) => readFileSync(join(R(dir), f), 'utf8')) : [];
  const usesUi = [txt, ...localFiles].some((t) => /from ['"]@\/app\/ui['"]/.test(t));
  if (!usesUi) errors.push(`[primitives] la page pilote ${route} n'adopte pas app/ui`);
}

// 7) Anti-seconde-source.
const uiFiles = existsSync(R('app/ui')) ? readdirSync(R('app/ui')).filter((f) => f.endsWith('.tsx') || f.endsWith('.ts')) : [];
for (const f of uiFiles) {
  const t = readFileSync(R(join('app/ui', f)), 'utf8');
  if (/progress-server|progress-store|writeProgress/.test(t)) errors.push(`[second-source] app/ui/${f} touche au moteur de progression (interdit)`);
  if (/\bSKILL_STATES\s*=/.test(t)) errors.push(`[second-source] app/ui/${f} redéfinit SKILL_STATES`);
}
// 6) Anti-seconde-source : un SEUL fichier définit les états de compétence.
//    V65.1 · CP2 — la règle exigeait auparavant que `lib/skill-vocabulary.mjs`
//    réutilise `lib/skill-state.mjs`. Les deux fichiers ont été supprimés : ils
//    portaient un second modèle à cinq états dont les libellés chevauchaient
//    ceux du modèle canonique en désignant autre chose. Écrite comme elle
//    l'était (`if (vocab && …)`), la règle serait devenue muette au lieu de
//    protéger son intention. Elle vérifie donc maintenant l'intention.
{
  const owners = [];
  for (const f of readdirSync(R('lib'))) {
    if (!f.endsWith('.mjs')) continue;
    const src = readFileSync(R(join('lib', f)), 'utf8');
    if (/\b(COMPETENCY_STATES|COMPETENCY_STATE_LABEL|SKILL_STATES|SKILL_STATE_LABEL)\s*=/.test(src)) owners.push(f);
  }
  if (owners.length !== 1 || owners[0] !== 'competency.mjs') {
    errors.push(`[second-source] les états de compétence doivent être définis dans lib/competency.mjs et nulle part ailleurs — trouvés dans : ${owners.join(', ') || 'aucun fichier'}`);
  }
}

// 8) Non-régression P0 /day : liste blanche de parcours complète.
const ms = existsSync(R('lib/missions-server.ts')) ? readFileSync(R('lib/missions-server.ts'), 'utf8') : '';
for (const tk of ['DATA_ML_TRACK_ID', 'FRONTEND_TRACK_ID', 'APPSEC_CLOUD_TRACK_ID', 'CLOUD_DEVOPS_TRACK_ID']) {
  if (!ms.includes(tk)) errors.push(`[p0-day] lib/missions-server.ts : parcours « ${tk} » absent de la liste blanche (régression /day 500)`);
}

// 9) A11y.
const shell = existsSync(R('app/shell/AppShell.tsx')) ? readFileSync(R('app/shell/AppShell.tsx'), 'utf8') : '';
if (!/skip-link|#main/.test(shell)) errors.push('[a11y] skip link absent du shell');
if (!/prefers-reduced-motion/.test(css)) errors.push('[a11y] prefers-reduced-motion non géré');

console.log('── Gate V53 (Product UX Implementation)');
console.log(`Fichiers UI : ${tsxFiles.length} · hex en dur : ${hex} (base ${HEX_BASELINE}) · primitives : ${PRIMITIVES.length} · pilotes : ${PILOTS.length}`);
if (warns.length) { console.log(`Avertissements (${warns.length}) :`); for (const w of warns.slice(0, 10)) console.log('  ⚠ ' + w); }
if (errors.length) {
  console.error(`\n❌ Gate V53 : ${errors.length} violation(s) :`);
  for (const e of errors) console.error('  • ' + e);
  process.exit(1);
}
console.log('\n✅ V53 valide : Curriculum gelé, accent indigo, primitives adoptées par les 3 pilotes, aucune seconde source, P0 /day protégé, a11y (skip link + reduced-motion).');
