#!/usr/bin/env node
// Gate V44 — lance : npm run v44:check
//
// Contrôle la QUALITÉ de la pratique (cf. TSD-044), en réutilisant les read-models
// dérivés existants. Aucune vérité propre. Contrôles bloquants :
//   1. AUCUNE source de vérité concurrente interdite ;
//   2. chaque compétence fine d'exercice se projette vers une compétence de programme ;
//   3. chaque misconception : leçon(s)/exercice(s) de remédiation RÉELS ;
//   4. readiness `strong-junior` ⇒ preuves requises (autonomy + diagnostic + transfer full).
// Avertissements (non bloquants, jamais « N exercices par skill ») :
//   - distribution de difficulté pathologique (compétence à pratique de code sans d4/d5) ;
//   - couverture de feedback diagnostique (nb d'exercices reliés à une misconception).
// Lecture seule ; exit 1 au moindre problème bloquant.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LESSONS } from './data/lessons-map.mjs';
import { MISCONCEPTIONS } from '../lib/misconceptions.mjs';
import { coverageMatrix, projectSkill } from '../lib/practice-coverage.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const errors = [];
const warn = [];

console.log('── Gate V44 (Practice Mastery II — difficulté, feedback, readiness)');

const FORBIDDEN = ['data/skills-v2.json', 'data/practice-database.json', 'data/progression-v2.json', 'lib/practice-engine-v2.mjs', 'lib/mastery-engine-v2.mjs'];
for (const f of FORBIDDEN) if (existsSync(R(f))) errors.push(`source concurrente interdite : ${f}`);

const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const programSkills = new Set(program.skills.map((s) => s.id));
const knownLessons = new Set(program.lessons.map((l) => l.slug));
const load = (d) => { try { return readdirSync(R(d)).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(R(`${d}/${f}`), 'utf8'))); } catch { return []; } };
const exercises = load('data/exercises');
const knownEx = new Set(exercises.map((e) => e.id));

// 2. Projection complète.
for (const e of exercises) for (const s of (e.skills || [])) {
  if (!programSkills.has(projectSkill(s))) errors.push(`exercice ${e.id} : compétence fine « ${s} » non projetable`);
}

// 3. Misconceptions vivantes.
let feedbackEx = new Set();
for (const m of MISCONCEPTIONS) {
  if (!programSkills.has(m.skill)) errors.push(`misconception ${m.id} : skill « ${m.skill} » hors programme`);
  for (const l of (m.lessonRefs || [])) if (!knownLessons.has(l)) errors.push(`misconception ${m.id} : leçon morte « ${l} »`);
  for (const ex of (m.exerciseRefs || [])) { if (!knownEx.has(ex)) errors.push(`misconception ${m.id} : exercice mort « ${ex} »`); else feedbackEx.add(ex); }
  if (!(m.lessonRefs || []).length) errors.push(`misconception ${m.id} : aucune leçon de remédiation`);
}

// 4. Readiness strong-junior ⇒ preuves.
const lessons = LESSONS.map((l) => ({ slug: l.file.replace(/\.md$/, ''), skills: l.skills || [] }));
const labs = [
  { id: 'kubernetes', skills: ['cloud'] }, { id: 'cloud-topology', skills: ['cloud'] },
  { id: 'cloud-architecture', skills: ['cloud', 'archi'] }, { id: 'security', skills: ['secu'] },
  { id: 'pipeline', skills: ['cloud'] }, { id: 'terminal', skills: ['gitlinux'] },
];
const sources = {
  lessons, exercises: exercises.map((e) => ({ id: e.id, skills: e.skills || [], difficulty: e.difficulty })), labs,
  assessments: load('data/assessments'), capstones: load('data/capstones'),
  transferChallenges: load('data/transfer-challenges'),
  missions: load('data/missions').map((m) => ({ id: m.id, skills: m.skills || [] })), misconceptions: MISCONCEPTIONS,
};
const matrix = coverageMatrix(program, sources);
for (const r of matrix) {
  if (r.readiness === 'strong-junior') {
    const need = ['autonomy', 'diagnostic', 'transfer'];
    for (const d of need) if (r.dimensions[d].level !== 'full') errors.push(`readiness strong-junior de « ${r.skill} » sans preuve ${d} (=${r.dimensions[d].level})`);
  }
}

// Avertissements difficulté : compétences à pratique de code sans d4/d5.
const codeSkillDiff = {};
for (const e of exercises) for (const s of new Set((e.skills || []).map(projectSkill))) {
  (codeSkillDiff[s] ??= { total: 0, high: 0 });
  codeSkillDiff[s].total += 1;
  if ((e.difficulty || 2) >= 4) codeSkillDiff[s].high += 1;
}
for (const [s, d] of Object.entries(codeSkillDiff)) {
  if (d.total >= 8 && d.high === 0) warn.push(`difficulté : compétence « ${s} » a ${d.total} exercices mais aucun de difficulté ≥ 4 (pyramide plate)`);
}

console.log(`Exercices          : ${exercises.length}`);
console.log(`Feedback diag.     : ${feedbackEx.size} exercice(s) reliés à une misconception`);
console.log(`Misconceptions     : ${MISCONCEPTIONS.length}`);
for (const w of warn) console.log(`⚠️  ${w}`);

if (errors.length) {
  console.error(`\n❌ ${errors.length} problème(s) :`);
  for (const e of errors) console.error(`   • ${e}`);
  process.exit(1);
}
console.log('\n✅ V44 valide : projection complète, misconceptions vivantes, readiness fondée sur preuves, aucune source concurrente.');
