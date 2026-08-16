// Gate V47 — Professional Practice II.
//  1) UNICITÉ des ids sur TOUS les artefacts (collision = HARD FAIL) — protège
//     contre l'écrasement silencieux découvert en V46.
//  2) Rapport des capacités runtime (dérivé de l'environnement, aucune 2e source).
//  3) Contrat des exercices ajoutés en V47 (sprint=v47) + practiceMode honnête.
// Read-only. Aucune écriture.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validateExercise } from '../lib/exercise.mjs';
import { isKnownSkill } from '../lib/skill-taxonomy.mjs';
import { projectSkill } from '../lib/practice-coverage.mjs';
import { detectRuntime } from '../lib/runtime-detect.mjs';
import { RUNTIMES } from '../lib/runtime.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const errors = [];
const warns = [];

// ── 1) Unicité des ids par famille d'artefacts ───────────────────────────────
const FAMILIES = [
  ['exercices', 'data/exercises'],
  ['assessments', 'data/assessments'],
  ['capstones', 'data/capstones'],
  ['missions', 'data/missions'],
  ['playbooks', 'data/playbooks'],
  ['transfer-challenges', 'data/transfer-challenges'],
];
for (const [label, dir] of FAMILIES) {
  const abs = R(dir);
  if (!existsSync(abs)) continue;
  const seen = new Map();
  for (const f of readdirSync(abs).filter((x) => x.endsWith('.json'))) {
    let obj;
    try { obj = JSON.parse(readFileSync(join(abs, f), 'utf8')); } catch (e) { errors.push(`[${label}] ${f} JSON invalide : ${e.message}`); continue; }
    const id = obj.id;
    if (!id) { warns.push(`[${label}] ${f} sans id`); continue; }
    if (seen.has(id)) errors.push(`[collision] ${label} : id « ${id} » dans ${f} ET ${seen.get(id)}`);
    else seen.set(id, f);
    // cohérence id ↔ nom de fichier (source d'écrasement silencieux)
    if (`${id}.json` !== f) warns.push(`[${label}] ${f} : nom de fichier ≠ id (${id})`);
  }
}
// unicité des ids de runtime
{
  const ids = Object.keys(RUNTIMES);
  if (new Set(ids).size !== ids.length) errors.push('[runtime] ids de runtime dupliqués');
}

// ── 2) Capacités runtime (rapport, ne bloque pas) ───────────────────────────
const CAP_IDS = ['node-js', 'python3', 'python-ds', 'typescript', 'web', 'react-tsx'];
console.log('── Gate V47 (Professional Practice II)');
console.log('Capacités runtime :');
for (const id of CAP_IDS) {
  const d = detectRuntime(id);
  console.log(`  ${id.padEnd(12)} ${d.available ? '✅' : '—'} ${d.version || d.error || ''}`);
}

// ── 3) Contrat des exercices V47 ────────────────────────────────────────────
const exDir = R('data/exercises');
const exs = readdirSync(exDir).filter((f) => f.endsWith('.json')).map((f) => ({ file: f, ...JSON.parse(readFileSync(join(exDir, f), 'utf8')) }));
const CODE = new Set(['node-js', 'python3', 'python-ds', 'typescript']);
const MODES = new Set([undefined, 'LOCAL_EXECUTABLE', 'SIMULATION', 'PROXY', 'EXTERNAL_ENVIRONMENT_REQUIRED', 'TOOLING_ENVIRONMENT_REQUIRED']);
const v47 = exs.filter((e) => e.sprint === 'v47');
for (const e of exs) {
  // intégrité globale (toute la base)
  const v = validateExercise(e);
  if (!v.ok) errors.push(`[schema] ${e.file} : ${v.errors.join(' ; ')}`);
  if (!Array.isArray(e.tests) || e.tests.length === 0) errors.push(`[no-test] ${e.file}`);
  for (const s of e.skills ?? []) if (!isKnownSkill(s) || !projectSkill(s)) errors.push(`[skill] ${e.file} : « ${s} »`);
  if (e.practiceMode !== undefined && !MODES.has(e.practiceMode)) errors.push(`[practiceMode] ${e.file} : « ${e.practiceMode} »`);
}
for (const e of v47) {
  if (!(e.tests ?? []).some((t) => !t.private)) errors.push(`[v47] ${e.file} : ≥1 test public`);
  if (!(e.tests ?? []).some((t) => t.private)) errors.push(`[v47] ${e.file} : ≥1 test privé`);
  if (e.difficulty >= 4 && (e.tests ?? []).length < 2) errors.push(`[v47] ${e.file} : D${e.difficulty} exige ≥2 tests`);
  if (e.runtime === 'python-ds' && e.practiceMode !== 'TOOLING_ENVIRONMENT_REQUIRED') {
    errors.push(`[v47] ${e.file} : python-ds exige practiceMode=TOOLING_ENVIRONMENT_REQUIRED`);
  }
  const aiish = [...new Set((e.skills ?? []).map(projectSkill))].some((s) => ['rag', 'agents', 'llm', 'evalia', 'ml', 'dl'].includes(s));
  if (aiish && !CODE.has(e.runtime) && e.practiceMode === undefined) errors.push(`[v47] ${e.file} : domaine IA non-exécutable sans practiceMode`);
}

const d = (n) => v47.filter((e) => e.difficulty === n).length;
console.log(`Exercices totaux : ${exs.length} · ajoutés V47 : ${v47.length} (D3=${d(3)} D4=${d(4)} D5=${d(5)})`);
if (warns.length) { console.log(`Avertissements (${warns.length}) :`); for (const w of warns.slice(0, 15)) console.log('  ⚠ ' + w); }

if (errors.length) {
  console.error(`\n❌ Gate V47 : ${errors.length} violation(s) :`);
  for (const e of errors) console.error('  • ' + e);
  process.exit(1);
}
console.log('\n✅ V47 valide : ids uniques (aucune collision), capacités cohérentes, contrat V47 respecté.');
