// Gate V50 — 365-Day Curriculum Integration & Learning Path Lock.
//  1) Corpus gelé + progress.json intact.
//  2) day-exercises : toute référence pointe un exercice existant (mort = FAIL) ;
//     un jour mappé existe dans le programme (1..365).
//  3) INTÉGRATION : aucun exercice professionnel (sprint v46-v49) orphelin du
//     parcours (FAIL) ; les exercices récents doivent être atteignables.
//  4) Prérequis : aucune pratique avant l'introduction d'une compétence
//     INTRODUITE PAR V50 (les cas hérités pré-V50 restent des avertissements).
//  5) Réactivation : oubli signalé (warning). Anti-seconde-source : day-exercises
//     reste l'unique mapping (pas de mapping concurrent).
// Read-only. Aucune écriture.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildTimeline, temporalAnomalies, orphanExercises, monthlyDistribution } from '../lib/curriculum-timeline.mjs';

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

const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const days = program.days;
const de = JSON.parse(readFileSync(R('data/day-exercises.json'), 'utf8'));
const exercises = readdirSync(R('data/exercises')).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(R('data/exercises'), f), 'utf8')));
const exIds = new Set(exercises.map((e) => e.id));

// 1) Corpus gelé + progress.
try { const s = execSync("find curriculum/lessons -name '*.md' | sort | xargs cat | sha1sum", { cwd: ROOT }).toString().trim().split(/\s+/)[0]; if (s !== FROZEN_CORPUS) errors.push(`[corpus] SHA-1 modifié : ${s}`); } catch { warns.push('[corpus] hash indisponible'); }
try { const b = execSync('git hash-object data/progress.json', { cwd: ROOT }).toString().trim(); if (b !== FROZEN_PROGRESS) errors.push(`[progress] modifié : ${b}`); } catch { warns.push('[progress] blob indisponible'); }

// 2) Références jour/exercice.
const validDays = new Set(days.map((d) => d.day));
for (const [k, ids] of Object.entries(de)) {
  const dn = Number(k);
  if (!validDays.has(dn)) errors.push(`[day-ref] jour ${k} inexistant dans le programme`);
  if (!Array.isArray(ids)) { errors.push(`[day-ref] jour ${k} : valeur non-liste`); continue; }
  for (const id of ids) if (!exIds.has(id)) errors.push(`[dead-ref] jour ${k} → exercice « ${id} » inexistant`);
}

const tl = buildTimeline({ days, dayExercises: de, exercises });

// 3) Intégration : exercices professionnels V46-V49 tous atteignables.
const orphans = new Set(orphanExercises(tl, exercises));
const proOrphans = exercises.filter((e) => ['v46', 'v47', 'v48', 'v49'].includes(e.sprint) && orphans.has(e.id));
if (proOrphans.length) errors.push(`[integration] ${proOrphans.length} exercice(s) professionnel(s) V46-V49 orphelin(s) du parcours : ${proOrphans.slice(0, 8).map((e) => e.id).join(', ')}${proOrphans.length > 8 ? '…' : ''}`);

// 4) Prérequis (V50 ne doit pas créer de pratique-avant-introduction).
// Baseline pré-V50 : ces cas hérités sont tolérés en warning. On échoue si le
// nombre dépasse la ligne de base connue (le générateur d'intégration en crée 0).
const pbi = temporalAnomalies(tl, exercises).filter((a) => a.kind === 'practice-before-intro');
const BASELINE_PBI = 10; // hérité pré-V50 (jours 1-30, on-ramps)
if (pbi.length > BASELINE_PBI) errors.push(`[prereq] ${pbi.length} pratiques avant introduction (> ligne de base ${BASELINE_PBI}) : V50 en a introduit`);
else if (pbi.length) warns.push(`[prereq] ${pbi.length} pratique(s) avant introduction (héritées, on-ramps jours 1-30)`);

// 5) Oubli (warning) + surcharge (warning).
const forgetting = temporalAnomalies(tl, exercises).filter((a) => a.kind === 'forgetting');
for (const f of forgetting) warns.push(`[forgetting] ${f.reason}`);
for (const [k, ids] of Object.entries(de)) if (ids.length > 10) warns.push(`[load] jour ${k} : ${ids.length} exercices (dense — thématique héritée)`);

const md = monthlyDistribution(tl);
const emptyCodeMonths = [];
for (let m = 1; m <= 12; m++) if ((md[m]?.daysWithPractice ?? 0) === 0) emptyCodeMonths.push(m);
if (emptyCodeMonths.length) warns.push(`[distribution] mois sans pratique de code : ${emptyCodeMonths.join(', ')} (mois intégratifs/non-code possibles)`);

console.log('── Gate V50 (365-Day Curriculum Integration & Learning Path Lock)');
console.log(`Jours : ${days.length} · jours avec pratique : ${Object.values(de).filter((v) => v.length).length} · exercices mappés : ${new Set(Object.values(de).flat()).size}/${exercises.length}`);
console.log(`Orphelins : ${orphans.size} (professionnels V46-V49 : ${proOrphans.length})`);
console.log('Pratique/mois : ' + Array.from({ length: 12 }, (_, i) => `M${i + 1}=${md[i + 1]?.daysWithPractice ?? 0}`).join(' '));
if (warns.length) { console.log(`Avertissements (${warns.length}) :`); for (const w of warns.slice(0, 12)) console.log('  ⚠ ' + w); }
if (errors.length) {
  console.error(`\n❌ Gate V50 : ${errors.length} violation(s) :`);
  for (const e of errors) console.error('  • ' + e);
  process.exit(1);
}
console.log('\n✅ V50 valide : corpus gelé, refs vivantes, pratique professionnelle intégrée au parcours, prérequis respectés.');
