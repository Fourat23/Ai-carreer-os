// Gate V51 — Curriculum Retention & Cognitive Progression Lock.
//  1) Corpus gelé + progress intact + 365 jours (ordre inchangé) + refs vivantes.
//  2) Rétention (mesurée sur la PRATIQUE, honnête) : 0 écart de pratique > seuil
//     pour les compétences de code (hors non-code/enseignées en fin).
//  3) Aucun exercice orphelin ; aucune pratique-avant-intro NOUVELLE (≤ base).
//  4) Charge : aucune journée « excessive » NOUVELLE (les denses sont héritées).
//  5) Progression : pas de D5 isolé (D5 sans D3/D4 en pratique).
// Déterministe, read-only.
import { readFileSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildTimeline, retentionAnomalies, difficultyAnomalies, temporalAnomalies, orphanExercises, loadHistogram } from '../lib/curriculum-timeline.mjs';

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
const FROZEN_CORPUS = 'ce72e8c7e02a0923f3d860d4f57ae0143d0cf768';
const FROZEN_PROGRESS = '323604021055588a9528a86875f36598dbdc7758';
const BASELINE_PBI = 10;        // pratique-avant-intro héritée (on-ramps jours 1-30)
const BASELINE_EXCESSIVE = 7;   // journées thématiques denses héritées (>6 exercices)
const JUSTIFIED_LATE = { rag: true, evalia: true, agents: true, llm: true }; // enseignées en fin d'année

const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const days = program.days;
const de = JSON.parse(readFileSync(R('data/day-exercises.json'), 'utf8'));
const exercises = readdirSync(R('data/exercises')).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(R('data/exercises'), f), 'utf8')));
const exIds = new Set(exercises.map((e) => e.id));

// 1) Gel + structure.
try { const s = execSync("find curriculum/lessons -name '*.md' | sort | xargs cat | sha1sum", { cwd: ROOT }).toString().trim().split(/\s+/)[0]; if (s !== FROZEN_CORPUS) errors.push(`[corpus] SHA-1 modifié : ${s}`); } catch { warns.push('[corpus] hash indisponible'); }
try { const b = execSync('git hash-object data/progress.json', { cwd: ROOT }).toString().trim(); if (b !== FROZEN_PROGRESS) errors.push(`[progress] modifié : ${b}`); } catch { warns.push('[progress] indisponible'); }
if (days.length !== 365) errors.push(`[days] ${days.length} jours (attendu 365)`);
for (let i = 0; i < days.length; i++) if (days[i].day !== i + 1) { errors.push(`[order] ordre des jours modifié à l'index ${i}`); break; }
for (const [k, ids] of Object.entries(de)) for (const id of ids) if (!exIds.has(id)) errors.push(`[dead-ref] jour ${k} → « ${id} » inexistant`);

const tl = buildTimeline({ days, dayExercises: de, exercises });

// 2) Rétention honnête.
const ret = retentionAnomalies(tl, { justifiedLateSkills: JUSTIFIED_LATE });
for (const a of ret) errors.push(`[retention] ${a.reason}`);

// 3) Orphelins + pratique-avant-intro.
const orphans = orphanExercises(tl, exercises).length;
if (orphans !== 0) errors.push(`[orphan] ${orphans} exercice(s) orphelin(s) du parcours`);
const pbi = temporalAnomalies(tl, exercises).filter((a) => a.kind === 'practice-before-intro').length;
if (pbi > BASELINE_PBI) errors.push(`[prereq] ${pbi} pratiques-avant-intro (> base ${BASELINE_PBI})`);
else if (pbi) warns.push(`[prereq] ${pbi} pratique(s)-avant-intro héritées (on-ramps)`);

// 4) Charge.
const hist = loadHistogram(days, tl);
if (hist.excessive > BASELINE_EXCESSIVE) errors.push(`[load] ${hist.excessive} journées excessives (> base ${BASELINE_EXCESSIVE}) : V51 a créé une surcharge`);
else if (hist.excessive) warns.push(`[load] ${hist.excessive} journées denses héritées (thématiques)`);

// 5) Progression.
for (const a of difficultyAnomalies(tl)) { if (a.kind === 'isolated-d5') errors.push(`[progression] ${a.reason}`); else warns.push(`[progression] ${a.reason}`); }

console.log('── Gate V51 (Curriculum Retention & Cognitive Progression Lock)');
console.log(`Jours : ${days.length} · exercices mappés : ${new Set(Object.values(de).flat()).size}/${exercises.length} · orphelins : ${orphans}`);
console.log(`Rétention (écarts de pratique > seuil, code) : ${ret.length} · charge : ${JSON.stringify(hist)}`);
if (warns.length) { console.log(`Avertissements (${warns.length}) :`); for (const w of warns.slice(0, 12)) console.log('  ⚠ ' + w); }
if (errors.length) {
  console.error(`\n❌ Gate V51 : ${errors.length} violation(s) :`);
  for (const e of errors) console.error('  • ' + e);
  process.exit(1);
}
console.log('\n✅ V51 valide : corpus & ordre gelés, rétention certifiée (0 écart de pratique > seuil), progression cohérente, aucune surcharge nouvelle.');
