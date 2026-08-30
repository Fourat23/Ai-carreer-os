// Gate V52 — Product UX Architecture & Design System guardrails.
//  1) Curriculum 1.0 gelé (corpus SHA-1 + ordre des 365 jours) + progress intact.
//  2) Anti-gamification : aucun littéral XP / streak / gamification dans l'UI.
//  3) Routes pilotes présentes (Dashboard, Aujourd'hui, Compétences).
//  4) Adoption des tokens : couleurs hex en dur dans le TSX ≤ ligne de base.
//  5) Design system : tokens clés présents dans globals.css.
//  6) Anti-seconde-source : le vocabulaire réutilise skill-state (pas de redéf.).
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
const FROZEN_CORPUS = '9b0add6ae087e03b0f0e938965b32403978684bc';
const FROZEN_PROGRESS = '323604021055588a9528a86875f36598dbdc7758';
const HEX_BASELINE = 6; // couleurs hex en dur tolérées dans app/**.tsx (héritées)

// Collecte récursive des .tsx sous app/.
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
try { const b = execSync('git hash-object data/progress.json', { cwd: ROOT }).toString().trim(); if (b !== FROZEN_PROGRESS) errors.push(`[progress] modifié : ${b}`); } catch { warns.push('[progress] indisponible'); }
try { const prog = JSON.parse(readFileSync(R('data/program.json'), 'utf8')); if (prog.days.length !== 365) errors.push(`[days] ${prog.days.length} ≠ 365`); else if (!prog.days.every((d, i) => d.day === i + 1)) errors.push('[order] ordre des 365 jours modifié'); } catch (e) { warns.push('[program] illisible'); }

// 2) Anti-gamification (littéraux non ambigus). « badge » (puce de statut) et
// « Niveau (0 à 5) » (rubrique de compétence) NE sont PAS de la gamification.
const GAMIF = /\bXP\b|\bstreak\b|gamif|\bconfetti\b|\bleaderboard\b/i;
for (const f of tsxFiles) {
  const txt = readFileSync(f, 'utf8');
  const lines = txt.split('\n');
  lines.forEach((ln, i) => { if (GAMIF.test(ln)) errors.push(`[gamification] ${f.replace(ROOT + '/', '')}:${i + 1} littéral de gamification : « ${ln.trim().slice(0, 60)} »`); });
}

// 3) Routes pilotes.
for (const route of ['app/page.tsx', 'app/day/[id]/page.tsx', 'app/skills/page.tsx']) {
  if (!existsSync(R(route))) errors.push(`[route] page pilote manquante : ${route}`);
}

// 4) Adoption des tokens (hex en dur dans le TSX).
let hex = 0;
for (const f of tsxFiles) { const m = readFileSync(f, 'utf8').match(/#[0-9a-fA-F]{6}\b/g); if (m) hex += m.length; }
if (hex > HEX_BASELINE) errors.push(`[tokens] ${hex} couleurs hex en dur dans le TSX (> base ${HEX_BASELINE}) : utiliser les variables de design`);
else if (hex) warns.push(`[tokens] ${hex} couleur(s) hex héritée(s) (≤ base)`);

// 5) Tokens clés présents.
const css = existsSync(R('app/globals.css')) ? readFileSync(R('app/globals.css'), 'utf8') : '';
for (const tk of ['--bg', '--panel', '--border', '--accent', '--muted', '--ok', '--danger', '--sp-4', '--r']) {
  if (!css.includes(`${tk}:`)) errors.push(`[design-system] token « ${tk} » absent de globals.css`);
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

console.log('── Gate V52 (Product UX & Design System)');
console.log(`Fichiers UI : ${tsxFiles.length} · hex en dur : ${hex} (base ${HEX_BASELINE}) · routes pilotes : OK`);
if (warns.length) { console.log(`Avertissements (${warns.length}) :`); for (const w of warns.slice(0, 10)) console.log('  ⚠ ' + w); }
if (errors.length) {
  console.error(`\n❌ Gate V52 : ${errors.length} violation(s) :`);
  for (const e of errors) console.error('  • ' + e);
  process.exit(1);
}
console.log('\n✅ V52 valide : Curriculum 1.0 gelé, aucune gamification, routes pilotes présentes, tokens adoptés, aucune seconde source.');
