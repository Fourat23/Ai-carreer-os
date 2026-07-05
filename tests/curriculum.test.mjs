// Tests d'intégrité du curriculum généré et de la structure du programme.
// Zéro dépendance : node:test natif. Lance : npm test
// Prérequis : `npm run generate` a été exécuté (data/program.json existe).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SKILLS } from '../scripts/data/skills.mjs';
import { MONTHS, WEEKS, monthOfWeek, weekOfDay } from '../scripts/data/program-structure.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const program = JSON.parse(readFileSync(join(ROOT, 'data', 'program.json'), 'utf8'));

test('program.json : dimensions correctes', () => {
  assert.equal(program.days.length, 365);
  assert.equal(program.weeks.length, 52);
  assert.equal(program.months.length, 12);
  assert.equal(program.skills.length, 20);
});

test('chaque jour a un titre, une compétence connue, un mois et une semaine valides', () => {
  const skillIds = new Set(SKILLS.map((s) => s.id));
  for (const d of program.days) {
    assert.ok(d.title && d.title.length > 3, `jour ${d.day} sans titre`);
    assert.ok(skillIds.has(d.skill), `jour ${d.day} compétence inconnue: ${d.skill}`);
    assert.ok(d.month >= 1 && d.month <= 12, `jour ${d.day} mois invalide`);
    assert.ok(d.week >= 1 && d.week <= 52, `jour ${d.day} semaine invalide`);
  }
});

test('numéros de jour uniques et continus 1..365', () => {
  const nums = program.days.map((d) => d.day).sort((a, b) => a - b);
  for (let i = 0; i < 365; i++) assert.equal(nums[i], i + 1);
});

test('les jours de revue sont exactement les multiples de 7', () => {
  for (const d of program.days) {
    const shouldBeReview = d.day % 7 === 0;
    assert.equal(d.isReview, shouldBeReview, `jour ${d.day} statut revue incohérent`);
  }
});

test('mapping semaine→mois cohérent avec le jour', () => {
  for (const d of program.days) {
    assert.equal(d.week, weekOfDay(d.day), `weekOfDay(${d.day})`);
    assert.equal(d.month, monthOfWeek(d.week), `monthOfWeek(${d.week})`);
  }
});

test('les fichiers markdown des jours existent tous', () => {
  for (let n = 1; n <= 365; n++) {
    const p = join(ROOT, 'curriculum', 'days', `day-${String(n).padStart(3, '0')}.md`);
    assert.ok(existsSync(p), `manque day-${n}.md`);
  }
});

test('chaque jour non-revue a une correction', () => {
  for (const d of program.days) {
    if (d.isReview) continue;
    const p = join(ROOT, 'curriculum', 'solutions', `day-${String(d.day).padStart(3, '0')}-solution.md`);
    assert.ok(existsSync(p), `manque correction jour ${d.day}`);
  }
});

test('le jour 1 est complet et détaillé (structure pédagogique)', () => {
  const md = readFileSync(join(ROOT, 'curriculum', 'days', 'day-001.md'), 'utf8');
  for (const section of [
    'Objectif du jour', 'Cours approfondi', 'Exemple guidé', 'Pratique autonome',
    'Exercice principal', 'Livrable', "Consigne d'utilisation de l'IA", 'Découpage horaire',
    'Mini-quiz', 'À retenir', 'Pourquoi ça comptera plus tard',
  ]) {
    assert.ok(md.includes(section), `jour 1 : section « ${section} » manquante`);
  }
  // Le jour 1 renvoie vers une leçon de fond.
  assert.ok(md.includes('/doc/lessons/'), 'jour 1 : pas de renvoi vers une leçon de fond');
  const sol = readFileSync(join(ROOT, 'curriculum', 'solutions', 'day-001-solution.md'), 'utf8');
  assert.ok(sol.includes('logique attendue'), 'jour 1 : correction sans logique attendue');
});

test('les 21 leçons de fond existent', () => {
  const lessons = [
    'terminal-shell-filesystem', 'git-fundamentals', 'javascript-basics', 'typescript-basics',
    'algorithmic-thinking', 'data-structures-intro', 'http-rest-json', 'api-design-basics',
    'sql-foundations', 'clean-code', 'testing-foundations', 'architecture-basics',
    'design-patterns-intro', 'python-foundations', 'statistics-for-ml', 'machine-learning-basics',
    'llm-fundamentals', 'rag-fundamentals', 'agents-fundamentals', 'ai-evaluation', 'ai-security',
  ];
  for (const l of lessons)
    assert.ok(existsSync(join(ROOT, 'curriculum', 'lessons', `${l}.md`)), `manque la leçon ${l}`);
});

test('chaque jour de travail a un exemple guidé OU renvoie vers une leçon de fond', () => {
  for (const d of program.days) {
    if (d.isReview) continue;
    const md = readFileSync(join(ROOT, 'curriculum', 'days', `day-${String(d.day).padStart(3, '0')}.md`), 'utf8');
    const ok = md.includes('Exemple guidé') || md.includes('/doc/lessons/');
    assert.ok(ok, `jour ${d.day} : ni exemple guidé ni leçon de fond liée`);
  }
});

test('le mois 1 est complet (fichier + revue mensuelle)', () => {
  const md = readFileSync(join(ROOT, 'curriculum', 'month-01.md'), 'utf8');
  for (const section of ['Objectif du mois', 'Revue mensuelle', 'Compétences acquises', "Livrable portfolio"]) {
    assert.ok(md.includes(section), `mois 1 : section « ${section} » manquante`);
  }
});

test('les 30 premiers jours sont détaillés (découpage horaire présent)', () => {
  let detailed = 0;
  for (let n = 1; n <= 30; n++) {
    if (program.days.find((d) => d.day === n)?.isReview) continue;
    const md = readFileSync(join(ROOT, 'curriculum', 'days', `day-${String(n).padStart(3, '0')}.md`), 'utf8');
    if (md.includes('Découpage horaire')) detailed++;
  }
  assert.ok(detailed >= 24, `attendu ≥24 jours détaillés sur 1-30, obtenu ${detailed}`);
});

test('les 7 fiches projets existent', () => {
  for (const id of ['01', '02', '03', '04', '05', '06', 'final']) {
    assert.ok(existsSync(join(ROOT, 'curriculum', 'projects', `project-${id}.md`)), `manque projet ${id}`);
  }
});

test('les documents de méthodologie, rubriques et carrière existent', () => {
  const docs = [
    'methodology/how-to-learn.md', 'methodology/how-to-use-ai-without-dependency.md',
    'methodology/how-to-debug.md', 'methodology/how-to-think-like-an-engineer.md',
    'methodology/how-to-design-architecture.md',
    'rubrics/skills-scorecard.md', 'rubrics/monthly-evaluation.md', 'rubrics/interview-evaluation.md',
    'career/cv-linkedin-strategy.md', 'career/interview-prep.md',
    'resources/resources.md', 'year-overview.md',
  ];
  for (const d of docs) assert.ok(existsSync(join(ROOT, 'curriculum', d)), `manque ${d}`);
});

test('structure : 12 mois et 52 semaines définis', () => {
  assert.equal(MONTHS.length, 12);
  assert.equal(WEEKS.length, 52);
  for (const m of MONTHS) {
    assert.ok(m.title && m.summary, `mois ${m.month} incomplet`);
    assert.ok(m.expectedScores && Object.keys(m.expectedScores).length > 0, `mois ${m.month} sans scores attendus`);
  }
  for (const w of WEEKS) {
    assert.ok(w.theme && w.passCriteria?.length, `semaine ${w.week} incomplète`);
  }
});
