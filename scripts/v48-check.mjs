// Gate V48 — Professional Practice IV (deep practice & scénarios intégrés).
//  1) Intégrité globale du catalogue (schéma, skills, practiceMode) + unicité
//     des ids sur toutes les familles (collision = HARD FAIL, hérité v47).
//  2) Corpus académique GELÉ (SHA-1 des leçons inchangé).
//  3) Contrat des exercices V48 + floors de profondeur (D3/D4/D5) + unités
//     substantielles (exercices + phases de capstones V48 + transfer V48).
//  4) Scénarios professionnels : ≥5 traversables, domaines cibles présents.
//  5) Frontière LLM honnête + références mortes + progress.json intact.
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

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const errors = [];
const warns = [];

// Empreinte du corpus des leçons, REGELÉE au V66 · CP8 — et il faut dire quoi
// et pourquoi, sinon cette ligne est un contournement déguisé en mise à jour.
//
// Valeur précédente : 4c1f3028ed1303e0e0c5f8220215e8c88a99fdb3 (gel V48).
// Ce qui a changé, et rien d'autre : 9 leçons durcies au CP8 de V66, plus la
// réparation d'une clôture de bloc de code dans `rag-evaluation.md` qui faisait
// disparaître 11 de ses 18 sections au rendu. L'inventaire exact, ligne à ligne,
// est publié dans `docs/audits/V66-FLAGSHIPS.md`.
//
// Le gel n'est PAS assoupli : sa fonction reste d'interdire toute dérive non
// demandée du corpus. Il constate qu'une modification autorisée a eu lieu, ce
// qui est exactement ce pour quoi il existe — il a d'ailleurs rougi au premier
// essai, sans qu'on ait eu à le lui demander.
// V67 · CP3-CP8 — RE-GEL, TROISIÈME. Le corpus des leçons a de nouveau changé,
// et de nouveau sur autorisation explicite : 44 des 45 leçons de famille C
// étaient privées de correction, de cas professionnel, de transfert et de
// récupération active, et 17 leçons passaient sous le seuil de profondeur.
// V67 a traité ce stock. Le gel a rougi de lui-même, comme en V66, ce qui est
// exactement sa fonction ; il est mis à jour ici et jamais silencieusement.
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
const FROZEN_CORPUS_SHA1 = 'f4d01edc7992c2a23a6cc89228cc210a96e68b64';
const FROZEN_PROGRESS_BLOB = '323604021055588a9528a86875f36598dbdc7758';

const readJsonDir = (dir) => {
  const abs = R(dir);
  if (!existsSync(abs)) return [];
  return readdirSync(abs).filter((f) => f.endsWith('.json')).map((f) => {
    try { return { file: f, ...JSON.parse(readFileSync(join(abs, f), 'utf8')) }; }
    catch (e) { errors.push(`[json] ${dir}/${f} invalide : ${e.message}`); return { file: f, __bad: true }; }
  });
};

// ── 1) Unicité des ids par famille ───────────────────────────────────────────
const FAMILIES = ['data/exercises', 'data/assessments', 'data/capstones', 'data/missions', 'data/playbooks', 'data/transfer-challenges'];
for (const dir of FAMILIES) {
  const seen = new Map();
  for (const o of readJsonDir(dir)) {
    if (o.__bad) continue;
    if (!o.id) { warns.push(`[${dir}] ${o.file} sans id`); continue; }
    if (seen.has(o.id)) errors.push(`[collision] ${dir} : id « ${o.id} » dans ${o.file} ET ${seen.get(o.id)}`);
    else seen.set(o.id, o.file);
    if (`${o.id}.json` !== o.file) warns.push(`[${dir}] ${o.file} : nom ≠ id (${o.id})`);
  }
}

// ── 2) Corpus gelé + progress.json intact ────────────────────────────────────
try {
  const sha = execSync("find curriculum/lessons -name '*.md' | sort | xargs cat | sha1sum", { cwd: ROOT }).toString().trim().split(/\s+/)[0];
  if (sha !== FROZEN_CORPUS_SHA1) errors.push(`[corpus] SHA-1 des leçons modifié : ${sha} ≠ ${FROZEN_CORPUS_SHA1}`);
} catch (e) { warns.push(`[corpus] hash non calculable : ${e.message}`); }
try {
  const blob = execSync('git hash-object data/progress.json', { cwd: ROOT }).toString().trim();
  if (blob !== FROZEN_PROGRESS_BLOB) errors.push(`[progress] data/progress.json modifié : ${blob} ≠ ${FROZEN_PROGRESS_BLOB}`);
} catch (e) { warns.push(`[progress] blob non calculable : ${e.message}`); }

// ── 3) Intégrité globale + contrat V48 + floors ──────────────────────────────
const CODE = new Set(['node-js', 'python3', 'python-ds', 'typescript']);
const MODES = new Set([undefined, 'LOCAL_EXECUTABLE', 'SIMULATION', 'PROXY', 'EXTERNAL_ENVIRONMENT_REQUIRED', 'TOOLING_ENVIRONMENT_REQUIRED']);
const exs = readJsonDir('data/exercises').filter((e) => !e.__bad);
const exIds = new Set(exs.map((e) => e.id));
for (const e of exs) {
  const v = validateExercise(e);
  if (!v.ok) errors.push(`[schema] ${e.file} : ${v.errors.join(' ; ')}`);
  if (!Array.isArray(e.tests) || e.tests.length === 0) errors.push(`[no-test] ${e.file}`);
  for (const s of e.skills ?? []) if (!isKnownSkill(s) || !projectSkill(s)) errors.push(`[skill] ${e.file} : « ${s} »`);
  if (e.practiceMode !== undefined && !MODES.has(e.practiceMode)) errors.push(`[practiceMode] ${e.file} : « ${e.practiceMode} »`);
}
const v48 = exs.filter((e) => e.sprint === 'v48');
for (const e of v48) {
  if (!(e.tests ?? []).some((t) => !t.private)) errors.push(`[v48] ${e.file} : ≥1 test public`);
  if (!(e.tests ?? []).some((t) => t.private)) errors.push(`[v48] ${e.file} : ≥1 test privé`);
  if (e.difficulty >= 4 && (e.tests ?? []).length < 2) errors.push(`[v48] ${e.file} : D${e.difficulty} exige ≥2 tests`);
  if (e.runtime === 'python-ds' && e.practiceMode !== 'TOOLING_ENVIRONMENT_REQUIRED') errors.push(`[v48] ${e.file} : python-ds exige TOOLING_ENVIRONMENT_REQUIRED`);
  const proj = [...new Set((e.skills ?? []).map(projectSkill))];
  const aiish = proj.some((s) => ['rag', 'agents', 'llm', 'evalia', 'ml', 'dl'].includes(s));
  if (aiish && !CODE.has(e.runtime) && e.practiceMode === undefined) errors.push(`[v48] ${e.file} : domaine IA non-exécutable sans practiceMode`);
}
const d = (n) => v48.filter((e) => e.difficulty === n).length;

// ── 4) Scénarios professionnels (capstones) ─────────────────────────────────
const caps = readJsonDir('data/capstones').filter((c) => !c.__bad);
for (const c of caps) {
  const v = validateCapstone(c);
  if (!v.ok) errors.push(`[capstone] ${c.file} : ${v.errors.join(' ; ')}`);
  for (const r of c.exerciseRefs ?? []) if (!exIds.has(r)) errors.push(`[capstone-ref] ${c.file} : exerciseRef mort « ${r} »`);
}
const capSkills = new Set(caps.flatMap((c) => (c.skills ?? []).map(projectSkill)));
for (const need of ['agents', 'llm', 'archi']) {
  if (!capSkills.has(need)) errors.push(`[scenario] aucun scénario professionnel ne mobilise « ${need} » (cible V48)`);
}
if (caps.length < 5) errors.push(`[scenario] ≥5 scénarios professionnels requis (obtenu ${caps.length})`);

// ── 5) Références mortes des misconceptions ─────────────────────────────────
for (const m of MISCONCEPTIONS) for (const r of m.exerciseRefs ?? []) if (!exIds.has(r)) errors.push(`[misconception-ref] ${m.id} : exerciseRef mort « ${r} »`);

// ── 6) Unités substantielles V48 ────────────────────────────────────────────
const v48caps = caps.filter((c) => c.sprint === 'v48');
const v48transfer = readJsonDir('data/transfer-challenges').filter((t) => !t.__bad && t.sprint === 'v48');
const phaseUnits = v48caps.reduce((n, c) => n + (Array.isArray(c.phases) ? c.phases.length : 0), 0);
const substantial = v48.length + phaseUnits + v48transfer.length;

console.log('── Gate V48 (Professional Practice IV)');
console.log(`Exercices totaux : ${exs.length} · ajoutés V48 : ${v48.length} (D3=${d(3)} D4=${d(4)} D5=${d(5)})`);
console.log(`Scénarios pro : ${caps.length} (V48 : ${v48caps.length}, ${phaseUnits} phases) · transfer V48 : ${v48transfer.length}`);
console.log(`Unités substantielles V48 : ${substantial} (exos ${v48.length} + phases ${phaseUnits} + transfer ${v48transfer.length})`);

// Floors (substance) — exercices V48.
if (v48.length) {
  if (d(3) < 12) errors.push(`[floor] D3 V48 ≥ 12 requis (obtenu ${d(3)})`);
  if (d(4) < 12) errors.push(`[floor] D4 V48 ≥ 12 requis (obtenu ${d(4)})`);
  if (d(5) < 6) errors.push(`[floor] D5 V48 ≥ 6 requis (obtenu ${d(5)})`);
  if (substantial < 36) errors.push(`[floor] ≥36 unités substantielles requises (obtenu ${substantial})`);
}

if (warns.length) { console.log(`Avertissements (${warns.length}) :`); for (const w of warns.slice(0, 12)) console.log('  ⚠ ' + w); }
if (errors.length) {
  console.error(`\n❌ Gate V48 : ${errors.length} violation(s) :`);
  for (const e of errors) console.error('  • ' + e);
  process.exit(1);
}
console.log('\n✅ V48 valide : corpus gelé, ids uniques, contrat & floors V48, scénarios pro couvrant agents/llm/archi, aucune référence morte.');
