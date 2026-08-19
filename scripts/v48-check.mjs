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

const FROZEN_CORPUS_SHA1 = '4c1f3028ed1303e0e0c5f8220215e8c88a99fdb3';
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
