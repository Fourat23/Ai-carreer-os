#!/usr/bin/env node
// V45 AUDIT HARNESS — STRICTEMENT LECTURE SEULE. N'écrit QUE docs/audits/*.json.
// Ne modifie AUCUNE source métier. Compose les read-models existants (practice-coverage,
// practice-ladder, misconceptions) et lit les données brutes pour produire des matrices
// d'audit. Aucun verdict « en dur » : ce script INVENTORIE et MESURE ; les verdicts
// qualitatifs sont écrits à la main dans les .md par l'auditeur.
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LESSONS } from './data/lessons-map.mjs';
import { MISCONCEPTIONS } from '../lib/misconceptions.mjs';
import { coverageMatrix, coverageSummary, projectSkill } from '../lib/practice-coverage.mjs';
import { ladderMatrix } from '../lib/practice-ladder.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const loadDir = (d) => { try { return readdirSync(R(d)).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(R(`${d}/${f}`), 'utf8'))); } catch { return []; } };
const count = (arr) => { const m = {}; for (const v of arr) m[v] = (m[v] || 0) + 1; return m; };

const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const exercises = loadDir('data/exercises');
const assessments = loadDir('data/assessments');
const capstones = loadDir('data/capstones');
const transfers = loadDir('data/transfer-challenges');
const missions = loadDir('data/missions');
const playbooks = loadDir('data/playbooks');

// ── Lessons structural signals (read the ACTUAL markdown, not just metadata) ──
const lessonFiles = readdirSync(R('curriculum/lessons')).filter((f) => f.endsWith('.md'));
const lessonMeta = new Map(LESSONS.map((l) => [l.file, l]));
const lessonAudit = lessonFiles.map((f) => {
  const md = readFileSync(R(`curriculum/lessons/${f}`), 'utf8');
  const meta = lessonMeta.get(f) || {};
  const words = md.split(/\s+/).filter(Boolean).length;
  const codeBlocks = (md.match(/```/g) || []).length / 2;
  const headings = (md.match(/^#{2,3} /gm) || []).length;
  // Depth signals for named pedagogical sections.
  const section = (re) => { const m = md.match(re); return m ? m.index : -1; };
  const sliceAfter = (idx, n = 600) => idx < 0 ? '' : md.slice(idx, idx + n);
  const mentalIdx = section(/#{2,3}[^\n]*(Modèle mental|modèle mental|🧠)/);
  const problemIdx = section(/#{2,3}[^\n]*(problème d'abord|🌍)/);
  const recapIdx = section(/#{2,3}[^\n]*(récap|Récap|à retenir|En résumé|résumé|🎯 Objectif)/);
  const trapIdx = section(/(piège|Piège|erreur fréquente|misconception|idée fausse|à éviter)/);
  const mentalWords = mentalIdx < 0 ? 0 : sliceAfter(mentalIdx, 900).split(/\s+/).filter(Boolean).length;
  return {
    file: f, slug: f.replace(/\.md$/, ''),
    title: meta.title || null, cat: meta.cat || null, level: meta.level || null,
    skills: meta.skills || [], practiceRefs: (meta.practiceRefs || []).length,
    keep: /^<!--\s*keep\s*-->/.test(md),
    words, codeBlocks, headings,
    hasProblemFirst: problemIdx >= 0, hasMentalModel: mentalIdx >= 0, mentalModelWords: mentalWords,
    hasRecap: recapIdx >= 0, hasTrap: trapIdx >= 0,
  };
});

// ── Exercise classification (what it really measures, structurally) ──
const CODE_RT = new Set(['node-js', 'typescript', 'python3']);
const exAudit = exercises.map((e) => {
  const tests = e.tests || [];
  const pub = tests.filter((t) => !t.private).length;
  const priv = tests.filter((t) => t.private).length;
  const id = String(e.id);
  const isDebug = /(^|[-_])debug([-_]|$)/.test(id);
  const d = e.difficulty || 2;
  // Structural bloom-ish class (heuristic, honest label).
  let measures = 'APPLICATION';
  if (isDebug) measures = 'DEBUGGING';
  else if (d >= 5) measures = 'PROFESSIONAL_JUDGEMENT';
  else if (d === 4) measures = 'DIAGNOSIS';
  else if (d <= 1) measures = 'RECALL';
  else if (d === 2) measures = 'UNDERSTANDING';
  else if (d === 3) measures = 'APPLICATION';
  const programSkills = [...new Set((e.skills || []).map(projectSkill).filter(Boolean))];
  return { id, difficulty: d, runtime: e.runtime, programSkills, publicTests: pub, privateTests: priv, measures,
    contractOk: !(CODE_RT.has(e.runtime) && priv === 0) && pub >= 1 };
});

// ── Coverage + ladder (reuse read-models with full sources incl. labs) ──
const labs = [
  { id: 'kubernetes', skills: ['cloud'] }, { id: 'cloud-topology', skills: ['cloud'] },
  { id: 'cloud-architecture', skills: ['cloud', 'archi'] }, { id: 'security', skills: ['secu'] },
  { id: 'pipeline', skills: ['cloud'] }, { id: 'terminal', skills: ['gitlinux'] },
];
const covSources = {
  lessons: LESSONS.map((l) => ({ slug: l.file.replace(/\.md$/, ''), skills: l.skills || [] })),
  exercises: exercises.map((e) => ({ id: e.id, skills: e.skills || [], difficulty: e.difficulty })), labs,
  assessments, capstones, transferChallenges: transfers,
  missions: missions.map((m) => ({ id: m.id, skills: m.skills || [] })), misconceptions: MISCONCEPTIONS,
};
const matrix = coverageMatrix(program, covSources);
const ladders = ladderMatrix(program, { ...covSources });

const out = {
  generatedAt: 'V45-AUDIT',
  inventory: {
    lessons: lessonFiles.length, programLessons: program.lessons.length, skills: program.skills.length,
    days: (program.days || []).length, exercises: exercises.length,
    executableExercises: exercises.filter((e) => CODE_RT.has(e.runtime) || ['web', 'react-tsx'].includes(e.runtime)).length,
    assessments: assessments.length, assessmentQuestions: assessments.reduce((s, a) => s + (a.questions || []).length, 0),
    capstones: capstones.length, transferChallenges: transfers.length, missions: missions.length, playbooks: playbooks.length,
    misconceptions: MISCONCEPTIONS.length,
    publicTests: exAudit.reduce((s, e) => s + e.publicTests, 0), privateTests: exAudit.reduce((s, e) => s + e.privateTests, 0),
  },
  distributions: {
    exerciseDifficulty: count(exAudit.map((e) => 'd' + e.difficulty)),
    exerciseRuntime: count(exAudit.map((e) => e.runtime)),
    exerciseMeasures: count(exAudit.map((e) => e.measures)),
    exerciseByProgramSkill: count(exAudit.flatMap((e) => e.programSkills)),
    lessonByCategory: count(lessonAudit.map((l) => l.cat || 'unknown')),
    lessonByLevel: count(lessonAudit.map((l) => 'L' + (l.level || '?'))),
    lessonWordBuckets: count(lessonAudit.map((l) => l.words < 800 ? '<800' : l.words < 1500 ? '800-1500' : l.words < 2500 ? '1500-2500' : '>2500')),
  },
  quality: {
    exercisesFailingContract: exAudit.filter((e) => !e.contractOk).map((e) => e.id),
    lessonsWithoutMentalModel: lessonAudit.filter((l) => !l.hasMentalModel).map((l) => l.slug),
    lessonsThinMentalModel: lessonAudit.filter((l) => l.hasMentalModel && l.mentalModelWords < 60).map((l) => l.slug),
    lessonsWithoutProblemFirst: lessonAudit.filter((l) => !l.hasProblemFirst).map((l) => l.slug),
    lessonsWithoutRecap: lessonAudit.filter((l) => !l.hasRecap).map((l) => l.slug),
    lessonsWithoutTrap: lessonAudit.filter((l) => !l.hasTrap).map((l) => l.slug),
    lessonsWithoutPractice: lessonAudit.filter((l) => l.practiceRefs === 0).map((l) => l.slug),
    lessonsShort: lessonAudit.filter((l) => l.words < 800).map((l) => l.slug),
  },
  coverage: matrix.map((r) => ({ skill: r.skill, readiness: r.readiness, gaps: r.gaps,
    dims: Object.fromEntries(Object.entries(r.dimensions).map(([k, v]) => [k, v.level])) })),
  coverageSummary: coverageSummary(matrix),
  ladders: ladders.map((l) => ({ skill: l.skill, complete: l.complete, missing: l.missing,
    present: Object.entries(l.steps).filter(([, s]) => s.present).map(([k]) => k) })),
  lessonAudit, exAudit,
};

const target = R('docs/audits/v45-audit-data.json');
writeFileSync(target, JSON.stringify(out, null, 2) + '\n');
console.log('── V45 audit harness (read-only) → docs/audits/v45-audit-data.json');
console.log('Inventaire   :', JSON.stringify(out.inventory));
console.log('Difficulté   :', JSON.stringify(out.distributions.exerciseDifficulty));
console.log('Ce que mesurent les exos:', JSON.stringify(out.distributions.exerciseMeasures));
console.log('Readiness    :', JSON.stringify(out.coverageSummary.byReadiness));
console.log('Contrat KO   :', out.quality.exercisesFailingContract.length, 'exercices');
console.log('Leçons sans modèle mental:', out.quality.lessonsWithoutMentalModel.length,
  '| modèle mental maigre:', out.quality.lessonsThinMentalModel.length,
  '| sans pratique:', out.quality.lessonsWithoutPractice.length,
  '| courtes(<800 mots):', out.quality.lessonsShort.length);
