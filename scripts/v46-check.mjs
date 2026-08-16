// Gate V46 — Executable Practice Remediation I.
// Vérifie l'INTÉGRITÉ de la pratique (toute la base) et le CONTRAT des exercices
// ajoutés en V46 (marqués `"sprint": "v46"`). Ne maquille pas les domaines non
// exécutables localement : ils sont déclarés via `practiceMode`. Source unique :
// data/exercises + data/program.json + lib/practice-coverage.mjs. Aucun second
// moteur, aucune écriture.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validateExercise } from '../lib/exercise.mjs';
import { isKnownSkill } from '../lib/skill-taxonomy.mjs';
import { projectSkill } from '../lib/practice-coverage.mjs';
import { MISCONCEPTIONS } from '../lib/misconceptions.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const read = (p) => JSON.parse(readFileSync(R(p), 'utf8'));

const program = read('data/program.json');
const programSkills = new Set(program.skills.map((s) => s.id));
const exDir = R('data/exercises');
const files = readdirSync(exDir).filter((f) => f.endsWith('.json'));
const exercises = files.map((f) => ({ file: f, ...JSON.parse(readFileSync(join(exDir, f), 'utf8')) }));
const misconceptions = MISCONCEPTIONS;

const CODE_RUNTIMES = new Set(['node-js', 'python3', 'typescript']);
const PRACTICE_MODES = new Set([undefined, 'LOCAL_EXECUTABLE', 'SIMULATION', 'EXTERNAL_ENVIRONMENT_REQUIRED']);
const errors = [];
const warns = [];

// ── Intégrité (TOUTE la base) ────────────────────────────────────────────────
for (const ex of exercises) {
  const v = validateExercise(ex);
  if (!v.ok) errors.push(`[schema] ${ex.file} : ${v.errors.join(' ; ')}`);
  if (!Array.isArray(ex.tests) || ex.tests.length === 0) errors.push(`[no-test] ${ex.file} : aucun test`);
  for (const s of ex.skills ?? []) {
    if (!isKnownSkill(s)) errors.push(`[skill-inconnu] ${ex.file} : « ${s} »`);
    else if (!projectSkill(s)) errors.push(`[skill-non-projetable] ${ex.file} : « ${s} »`);
  }
  if (ex.practiceMode !== undefined && !PRACTICE_MODES.has(ex.practiceMode)) {
    errors.push(`[practiceMode] ${ex.file} : mode inconnu « ${ex.practiceMode} »`);
  }
}

// ── Contrat des exercices AJOUTÉS en V46 ─────────────────────────────────────
const v46 = exercises.filter((e) => e.sprint === 'v46');
for (const ex of v46) {
  const pub = (ex.tests ?? []).filter((t) => !t.private).length;
  const priv = (ex.tests ?? []).filter((t) => t.private).length;
  if (pub < 1) errors.push(`[v46] ${ex.file} : ≥1 test public requis`);
  if (priv < 1) errors.push(`[v46] ${ex.file} : ≥1 test privé requis`);
  if (typeof ex.difficulty !== 'number' || ex.difficulty < 1 || ex.difficulty > 5) {
    errors.push(`[v46] ${ex.file} : difficulté 1..5 requise`);
  }
  if (ex.difficulty >= 4 && (ex.tests ?? []).length < 2) {
    errors.push(`[v46] ${ex.file} : D${ex.difficulty} exige ≥2 tests (anti-trivial)`);
  }
  const projected = [...new Set((ex.skills ?? []).map(projectSkill).filter(Boolean))];
  const isCode = CODE_RUNTIMES.has(ex.runtime);
  // Un exercice de domaine IA/data doit soit EXÉCUTER du code réel, soit DÉCLARER
  // sa nature (SIMULATION déterministe / environnement externe requis).
  const aiish = projected.some((s) => ['rag', 'agents', 'llm', 'evalia', 'ml', 'dl'].includes(s));
  if (aiish && !isCode && ex.practiceMode === undefined) {
    errors.push(`[v46] ${ex.file} : domaine IA non-exécutable sans practiceMode explicite`);
  }
  // Cloud/infra non exécutable localement : doit être honnêtement étiqueté.
  if (ex.practiceMode === 'EXTERNAL_ENVIRONMENT_REQUIRED') {
    for (const k of ['objective', 'prerequisites', 'commands', 'expectedEvidence', 'successCriteria']) {
      if (ex[k] === undefined) warns.push(`[v46-external] ${ex.file} : champ « ${k} » recommandé`);
    }
  }
  if (!ex.summary || String(ex.summary).length < 20) warns.push(`[v46] ${ex.file} : résumé court`);
}

// ── Rapport de couverture exécutable (informatif, ne maquille rien) ──────────
const per = {};
for (const s of programSkills) per[s] = { ex: 0, exec: 0, d: { 3: 0, 4: 0, 5: 0 }, v46: 0 };
for (const ex of exercises) {
  const projected = [...new Set((ex.skills ?? []).map(projectSkill).filter(Boolean))];
  for (const s of projected) {
    if (!per[s]) continue;
    per[s].ex += 1;
    if (CODE_RUNTIMES.has(ex.runtime) || ex.runtime === 'web' || ex.runtime === 'react-tsx') per[s].exec += 1;
    if (per[s].d[ex.difficulty] !== undefined) per[s].d[ex.difficulty] += 1;
    if (ex.sprint === 'v46') per[s].v46 += 1;
  }
}

// ── FLOOR V46 (progression, dur seulement à la clôture via test dédié) ────────
const created = v46.length;
const d3 = v46.filter((e) => e.difficulty === 3).length;
const d4 = v46.filter((e) => e.difficulty === 4).length;
const d5 = v46.filter((e) => e.difficulty === 5).length;
const diagRefs = new Set(misconceptions.flatMap((m) => m.exerciseRefs ?? []));
const diag = v46.filter((e) => diagRefs.has(e.id)).length;

console.log('── Gate V46 (Executable Practice Remediation I)');
console.log(`Exercices totaux      : ${exercises.length}`);
console.log(`Ajoutés V46           : ${created}  (D3=${d3} · D4=${d4} · D5=${d5} · diagnostic=${diag})`);
const zero = [...programSkills].filter((s) => per[s].exec === 0);
console.log(`Compétences sans pratique exécutable : ${zero.length ? zero.join(', ') : '—'}`);
if (warns.length) { console.log(`\nAvertissements (${warns.length}) :`); for (const w of warns.slice(0, 20)) console.log('  ⚠ ' + w); }

if (errors.length) {
  console.error(`\n❌ Gate V46 : ${errors.length} violation(s) d'intégrité/contrat :`);
  for (const e of errors) console.error('  • ' + e);
  process.exit(1);
}
console.log('\n✅ V46 valide : intégrité de la pratique OK, contrat des exercices V46 respecté, aucune simulation non étiquetée.');
