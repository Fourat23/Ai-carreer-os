// V17 — verrouillage du contenu enrichi (matrice de couverture réelle).
// Ce fichier grandit par checkpoint : il prouve que les sujets ciblés sont
// RÉELLEMENT présents dans le curriculum généré (pas seulement un mot-clé), que
// les exercices ajoutés respectent le contrat et sont reliés aux bonnes journées.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateExercise } from '../lib/exercise.mjs';

const day = (n) => readFileSync(new URL(`../curriculum/days/day-${String(n).padStart(3, '0')}.md`, import.meta.url), 'utf8');
const exercise = (id) => JSON.parse(readFileSync(new URL(`../data/exercises/${id}.json`, import.meta.url), 'utf8'));
const dayExercises = () => JSON.parse(readFileSync(new URL('../data/day-exercises.json', import.meta.url), 'utf8'));

// ── CP3 : dette technique & maintenance ──────────────────────────────────────

test('CP3 — jour 69 enseigne la taxonomie de la dette technique', () => {
  const md = day(69);
  for (const needle of ['matrice de Fowler', 'REGISTRE DE DETTE', 'impact × risque × effort', 'boy-scout', 'INTÉRÊTS', 'SYSTÉMIQUE']) {
    assert.ok(md.includes(needle), `jour 69 doit mentionner « ${needle} »`);
  }
});

test('CP3 — jour 85 enseigne les 4 types de maintenance et le cycle de vie', () => {
  const md = day(85);
  for (const needle of ['ISO 14764', 'CORRECTIVE', 'ADAPTATIVE', 'PRÉVENTIVE', 'ÉVOLUTIVE', 'backward compatibility', 'DÉPRÉCIATION', 'strangler', 'ROLLBACK', 'FIN DE VIE']) {
    assert.ok(md.includes(needle), `jour 85 doit mentionner « ${needle} »`);
  }
});

test('CP3 — exercices dette+refactoring : contrat valide, tests public+privé', () => {
  for (const id of ['debt-audit', 'refactor-legacy']) {
    const ex = exercise(id);
    assert.deepEqual(validateExercise(ex), { ok: true, errors: [] }, `${id} doit être un exercice valide`);
    assert.ok(ex.tests.some((t) => !t.private), `${id} doit exposer au moins un test public`);
    assert.ok(ex.tests.some((t) => t.private), `${id} doit garder au moins un test privé`);
    // starter volontairement incomplet (≠ référence)
    const starter = ex.workspace.files.find((f) => f.path === ex.activeFile).content;
    assert.notEqual(starter, ex.reference[ex.activeFile], `${id} : le starter ne doit pas être la solution`);
  }
});

test('CP3 — exercices reliés au jour 69 (atteignable depuis les 3 parcours)', () => {
  const de = dayExercises();
  assert.deepEqual(de['69'], ['debt-audit', 'refactor-legacy']);
});

test('CP3 — refactor-legacy verrouille par des tests de CARACTÉRISATION', () => {
  const ex = exercise('refactor-legacy');
  const publicTests = ex.tests.filter((t) => !t.private);
  assert.ok(publicTests.some((t) => /caractérisation/i.test(t.name)), 'au moins un test public nommé « caractérisation »');
});

// ── CP4 : performance, profiling & optimisation ──────────────────────────────

test('CP4 — jour 80 enseigne le protocole de mesure et les percentiles', () => {
  const md = day(80);
  for (const needle of ['BASELINE', 'HYPOTHÈSE', 'PROFILER', 'hot path', 'tail latency', 'p50', 'p95', 'p99', 'CPU-bound', 'I/O-bound', 'memory-bound', 'memory leak', 'cold start', 'BUDGET DE PERFORMANCE', 'RÉGRESSION DE PERFORMANCE', 'premature optimization']) {
    assert.ok(md.includes(needle), `jour 80 doit mentionner « ${needle} »`);
  }
});

test('CP4 — jour 102 enseigne le poids du bundle et le budget frontend', () => {
  const md = day(102);
  for (const needle of ['bundle size', 'code splitting', 'lazy loading', 'React.lazy', 'bundle analyzer', 'BUDGET DE PERFORMANCE', 'RÉGRESSION']) {
    assert.ok(md.includes(needle), `jour 102 doit mentionner « ${needle} »`);
  }
});

test('CP4 — exercices perf à métriques explicites : contrat valide, public+privé', () => {
  for (const id of ['latency-percentiles', 'perf-budget']) {
    const ex = exercise(id);
    assert.deepEqual(validateExercise(ex), { ok: true, errors: [] }, `${id} doit être valide`);
    assert.ok(ex.tests.some((t) => !t.private) && ex.tests.some((t) => t.private), `${id} : public + privé`);
    const starter = ex.workspace.files.find((f) => f.path === ex.activeFile).content;
    assert.notEqual(starter, ex.reference[ex.activeFile], `${id} : starter ≠ solution`);
  }
});

test('CP4 — exercices perf reliés à des journées de performance', () => {
  const de = dayExercises();
  assert.ok(de['80'].includes('latency-percentiles') && de['80'].includes('perf-budget'), 'jour 80 → percentiles + budget');
  assert.ok(de['102'].includes('perf-budget'), 'jour 102 → budget');
});
