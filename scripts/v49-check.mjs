// Gate V49 — Professional Coverage & Transfer Closure.
//  1) Intégrité globale (schéma, skills, modes) + unicité des ids (collision=FAIL).
//  2) Corpus gelé + progress.json intact.
//  3) Références vivantes : transfer/capstone/misconception → exercices existants.
//  4) Cohérence D5 (≥2 tests), scénarios (validateCapstone), pas de simulation
//     présentée comme REAL.
//  5) Ledger DÉRIVÉ : recompute la matrice et refuse toute DÉRIVE du fichier
//     committé (garantie « une seule source de vérité »).
//  6) Cohérence de boucle : practice⇒diagnostic, professional⇒evidence.
// Read-only. Aucune écriture.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validateExercise } from '../lib/exercise.mjs';
import { validateCapstone } from '../lib/capstone.mjs';
import { isKnownSkill } from '../lib/skill-taxonomy.mjs';
import { projectSkill } from '../lib/practice-coverage.mjs';
import { MISCONCEPTIONS } from '../lib/misconceptions.mjs';
import { buildLedger } from './v49-ledger.mjs';

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
const FROZEN_CORPUS = '1dd4107325f278f9ba2ac67314c04cb720a0e1e8';
const FROZEN_PROGRESS = '323604021055588a9528a86875f36598dbdc7758';

const readDir = (dir) => existsSync(R(dir)) ? readdirSync(R(dir)).filter((f) => f.endsWith('.json')).map((f) => {
  try { return { file: f, ...JSON.parse(readFileSync(join(R(dir), f), 'utf8')) }; }
  catch (e) { errors.push(`[json] ${dir}/${f} : ${e.message}`); return { file: f, __bad: true }; }
}) : [];

// ── 1) Unicité des ids ───────────────────────────────────────────────────────
for (const dir of ['data/exercises', 'data/assessments', 'data/capstones', 'data/missions', 'data/playbooks', 'data/transfer-challenges']) {
  const seen = new Map();
  for (const o of readDir(dir)) {
    if (o.__bad || !o.id) continue;
    if (seen.has(o.id)) errors.push(`[collision] ${dir} : « ${o.id} » dans ${o.file} ET ${seen.get(o.id)}`);
    else seen.set(o.id, o.file);
    if (`${o.id}.json` !== o.file) warns.push(`[${dir}] ${o.file} : nom ≠ id`);
  }
}

// ── 2) Corpus gelé + progress ────────────────────────────────────────────────
try { const s = execSync("find curriculum/lessons -name '*.md' | sort | xargs cat | sha1sum", { cwd: ROOT }).toString().trim().split(/\s+/)[0]; if (s !== FROZEN_CORPUS) errors.push(`[corpus] SHA-1 modifié : ${s}`); } catch (e) { warns.push('[corpus] hash indisponible'); }
try { const b = execSync('git hash-object data/progress.json', { cwd: ROOT }).toString().trim(); if (b !== FROZEN_PROGRESS) errors.push(`[progress] modifié : ${b}`); } catch (e) { warns.push('[progress] blob indisponible'); }

// ── 3) Intégrité exercices + refs vivantes ───────────────────────────────────
const MODES = new Set([undefined, 'LOCAL_EXECUTABLE', 'SIMULATION', 'PROXY', 'EXTERNAL_ENVIRONMENT_REQUIRED', 'TOOLING_ENVIRONMENT_REQUIRED']);
const exs = readDir('data/exercises').filter((e) => !e.__bad);
const exIds = new Set(exs.map((e) => e.id));
for (const e of exs) {
  const v = validateExercise(e);
  if (!v.ok) errors.push(`[schema] ${e.file} : ${v.errors.join(' ; ')}`);
  for (const s of e.skills ?? []) if (!isKnownSkill(s) || !projectSkill(s)) errors.push(`[skill] ${e.file} : « ${s} »`);
  if (e.practiceMode !== undefined && !MODES.has(e.practiceMode)) errors.push(`[practiceMode] ${e.file} : « ${e.practiceMode} »`);
  // Cohérence D5 : au moins 2 tests (anti-trivial).
  if (e.difficulty === 5 && (e.tests ?? []).length < 2) errors.push(`[D5] ${e.file} : D5 exige ≥2 tests`);
}
for (const m of MISCONCEPTIONS) for (const r of m.exerciseRefs ?? []) if (!exIds.has(r)) errors.push(`[misconception-ref] ${m.id} : « ${r} » mort`);

// ── 4) Scénarios : structure + refs + honnêteté REAL ────────────────────────
const caps = readDir('data/capstones').filter((c) => !c.__bad);
for (const c of caps) {
  const v = validateCapstone(c);
  if (!v.ok) errors.push(`[capstone] ${c.file} : ${v.errors.join(' ; ')}`);
  for (const r of c.exerciseRefs ?? []) if (!exIds.has(r)) errors.push(`[capstone-ref] ${c.file} : exerciseRef « ${r} » mort`);
  // honnêteté : un scénario dont le contenu est simulé doit le déclarer (simulationNote).
  if (!c.simulationNote) warns.push(`[capstone] ${c.file} : simulationNote recommandé`);
}
// Transfer challenges : refs (si présentes) vivantes.
const trs = readDir('data/transfer-challenges').filter((t) => !t.__bad);
for (const t of trs) {
  for (const key of ['exerciseRefs', 'practiceRefs']) for (const r of t[key] ?? []) if (!exIds.has(r)) warns.push(`[transfer] ${t.file} : ${key} « ${r} » non trouvé`);
}

// ── 5) Ledger dérivé : pas de dérive ─────────────────────────────────────────
const ledger = buildLedger();
const ledgerPath = R('docs/audits/v49-coverage-ledger.json');
if (!existsSync(ledgerPath)) errors.push('[ledger] docs/audits/v49-coverage-ledger.json manquant (npm run v49:ledger)');
else {
  const committed = JSON.parse(readFileSync(ledgerPath, 'utf8'));
  if (JSON.stringify(committed.matrix) !== JSON.stringify(ledger.matrix)) errors.push('[ledger] DÉRIVE : le ledger committé ≠ matrice recalculée (npm run v49:ledger)');
}

// ── 6) Cohérence de boucle (par compétence, sur la matrice dérivée) ──────────
for (const row of ledger.matrix) {
  if (row.dims.practice && !row.dims.diagnostic && row.runtime === 'REAL') warns.push(`[loop] ${row.skill} : pratique sans diagnostic`);
  if (row.dims.professional && !row.dims.evidence) errors.push(`[loop] ${row.skill} : professional sans evidence`);
  if (row.status === 'PROFESSIONAL_READY' && !Object.values(row.dims).every(Boolean)) errors.push(`[loop] ${row.skill} : PROFESSIONAL_READY sans les 8 dimensions`);
}

console.log('── Gate V49 (Professional Coverage & Transfer Closure)');
console.log(`Exercices : ${exs.length} · scénarios : ${caps.length} · transfer : ${trs.length} · misconceptions : ${MISCONCEPTIONS.length}`);
console.log(`Boucles professionnelles complètes : ${ledger.completeLoops}/${ledger.totalSkills}`);
if (warns.length) { console.log(`Avertissements (${warns.length}) :`); for (const w of warns.slice(0, 12)) console.log('  ⚠ ' + w); }
if (errors.length) {
  console.error(`\n❌ Gate V49 : ${errors.length} violation(s) :`);
  for (const e of errors) console.error('  • ' + e);
  process.exit(1);
}
console.log('\n✅ V49 valide : intégrité, corpus gelé, refs vivantes, ledger sans dérive, cohérence de boucle.');
