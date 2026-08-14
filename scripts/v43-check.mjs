#!/usr/bin/env node
// Gate V43 — lance : npm run v43:check
//
// Valide le dispositif de PRATIQUE (cf. TSD-043) : read-model de couverture dérivé,
// projection fine→programme complète, absence de source concurrente. NE crée aucune
// vérité propre ; la couverture est un PROXY structurel. Contrôles bloquants :
//   1. AUCUNE source de vérité concurrente sur disque (skills-v2, practice-database,
//      practice-engine-v2, progression-v2) ;
//   2. chaque compétence fine d'exercice se PROJETTE vers une compétence de PROGRAMME
//      (sinon la couverture a un angle mort) ;
//   3. chaque exerciseRef de misconception pointe un exercice réel ;
//   4. la matrice classe TOUTES les compétences de programme (readiness valide).
// Affiche la matrice de couverture (readiness + trous). Avertit sur les compétences
// not-ready. Lecture seule ; exit 1 au moindre problème bloquant.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LESSONS } from './data/lessons-map.mjs';
import { MISCONCEPTIONS } from '../lib/misconceptions.mjs';
import {
  coverageMatrix, coverageSummary, projectSkill, READINESS_LEVELS,
} from '../lib/practice-coverage.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const errors = [];
const warn = [];

console.log('── Gate V43 (Practice Mastery — couverture de pratique dérivée)');

// 1. Sources concurrentes interdites.
const FORBIDDEN = ['data/skills-v2.json', 'data/practice-database.json', 'lib/practice-engine-v2.mjs', 'lib/progression-v2.mjs', 'data/practice-state.json'];
for (const f of FORBIDDEN) if (existsSync(R(f))) errors.push(`source concurrente interdite présente : ${f}`);

const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const programSkills = new Set(program.skills.map((s) => s.id));
const load = (d) => { try { return readdirSync(R(d)).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(R(`${d}/${f}`), 'utf8'))); } catch { return []; } };
const knownEx = new Set(readdirSync(R('data/exercises')).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')));

// 2. Projection complète des compétences fine d'exercice.
const exercises = load('data/exercises');
const unprojected = new Set();
for (const e of exercises) for (const s of (e.skills || [])) {
  const p = projectSkill(s);
  if (!programSkills.has(p)) unprojected.add(`${s}→${p}`);
}
for (const u of unprojected) errors.push(`compétence fine non projetée vers une compétence de programme : ${u}`);

// 3. exerciseRefs de misconceptions résolus.
for (const m of MISCONCEPTIONS) for (const e of (m.exerciseRefs || [])) {
  if (!knownEx.has(e)) errors.push(`misconception ${m.id} : exercice « ${e} » introuvable`);
}

// 4. Matrice complète.
const lessons = LESSONS.map((l) => ({ slug: l.file.replace(/\.md$/, ''), skills: l.skills || [] }));
const labs = [
  { id: 'kubernetes', skills: ['cloud'] }, { id: 'cloud-topology', skills: ['cloud'] },
  { id: 'cloud-architecture', skills: ['cloud', 'archi'] }, { id: 'security', skills: ['secu'] },
  { id: 'pipeline', skills: ['cloud'] }, { id: 'terminal', skills: ['gitlinux'] },
];
const sources = {
  lessons,
  exercises: exercises.map((e) => ({ id: e.id, skills: e.skills || [], difficulty: e.difficulty })),
  labs,
  assessments: load('data/assessments'),
  capstones: load('data/capstones'),
  transferChallenges: load('data/transfer-challenges'),
  missions: load('data/missions').map((m) => ({ id: m.id, skills: m.skills || [] })),
  misconceptions: MISCONCEPTIONS,
};
const matrix = coverageMatrix(program, sources);
if (matrix.length !== program.skills.length) errors.push(`matrice incomplète : ${matrix.length}/${program.skills.length} compétences`);
for (const r of matrix) if (!READINESS_LEVELS.includes(r.readiness)) errors.push(`readiness invalide pour ${r.skill} : ${r.readiness}`);

const sum = coverageSummary(matrix);
console.log(`Compétences        : ${matrix.length}`);
console.log(`Readiness          : ${READINESS_LEVELS.map((r) => `${r}=${sum.byReadiness[r]}`).join(' · ')}`);
const notReady = matrix.filter((r) => r.readiness === 'not-ready').map((r) => r.skill);
if (notReady.length) warn.push(`compétences not-ready (pratique de code faible ou compétence non-exercice) : ${notReady.join(', ')}`);
for (const w of warn) console.log(`⚠️  ${w}`);

if (errors.length) {
  console.error(`\n❌ ${errors.length} problème(s) :`);
  for (const e of errors) console.error(`   • ${e}`);
  process.exit(1);
}
console.log('\n✅ V43 valide : couverture dérivée cohérente (projection complète, matrice complète, misconceptions reliées, aucune source concurrente).');
