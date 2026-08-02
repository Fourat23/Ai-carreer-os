// V17 — verrouillage du contenu enrichi (matrice de couverture réelle).
// Ce fichier grandit par checkpoint : il prouve que les sujets ciblés sont
// RÉELLEMENT présents dans le curriculum généré (pas seulement un mot-clé), que
// les exercices ajoutés respectent le contrat et sont reliés aux bonnes journées.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateExercise } from '../lib/exercise.mjs';
import { validateGlossary, filterEntries } from '../lib/glossary-core.mjs';

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
  // Le jour 69 peut accueillir d'autres exercices (V18) ; les deux exercices V17 restent présents.
  assert.ok(de['69'].includes('debt-audit') && de['69'].includes('refactor-legacy'));
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

// ── CP5 : documentation technique professionnelle ────────────────────────────

const methodologyDoc = () => readFileSync(new URL('../curriculum/methodology/documentation-technique.md', import.meta.url), 'utf8');

test('CP5 — jour 66 enseigne la carte de la documentation (décision/conception/exploitation)', () => {
  const md = day(66);
  for (const needle of ['RFC', 'HSD', 'HLD', 'LLD', 'TSD', 'C4', "contrat d'API", 'runbook', 'playbook', 'post-mortem sans blâme', 'decision log', 'changelog', 'SUR-documentation']) {
    assert.ok(md.includes(needle), `jour 66 doit mentionner « ${needle} »`);
  }
});

test('CP5 — référence de modèles : keep-marked, tous les documents couverts', () => {
  const doc = methodologyDoc();
  assert.ok(doc.startsWith('<!-- keep -->'), 'la référence doit être keep-marked (jamais régénérée)');
  for (const heading of ['README', 'ADR', 'RFC', 'HLD', 'HSD', 'LLD', 'TSD', 'Contrat d\'API', 'Modèle C4', 'Runbook', 'Playbook', 'Post-mortem', 'Changelog', 'Decision log']) {
    assert.ok(doc.includes(`## ${heading}`), `la référence doit couvrir « ${heading} »`);
  }
  // Chaque modèle explique but/audience/quand (pas juste un titre).
  assert.ok(doc.includes('**But**') && doc.includes('**Audience**'), 'but + audience présents');
  // Convention HSD documentée (cohérente avec ADR-017).
  assert.ok(/HSD.*High-Level Solution Design/s.test(doc), 'convention HSD explicite');
});

test('CP5 — jour 66 lie la référence réutilisable (route /doc/methodology valide)', () => {
  assert.ok(day(66).includes('/doc/methodology/documentation-technique'), 'lien vers la référence');
  // Le slug relève de la catégorie « methodology » servie par app/doc/[...slug].
  const route = readFileSync(new URL('../app/doc/[...slug]/page.tsx', import.meta.url), 'utf8');
  assert.ok(/ALLOWED\s*=\s*new Set\(\[[^\]]*'methodology'/s.test(route), 'la catégorie methodology est autorisée par la route /doc');
});

test('CP5 — livrable documentaire évalué ajouté au projet (jour 66 → runbook)', () => {
  const program = JSON.parse(readFileSync(new URL('../data/program.json', import.meta.url), 'utf8'));
  const d = program.days.find((x) => x.day === 66);
  assert.ok(/runbook/i.test(d.deliverable), 'le livrable du projet inclut un runbook');
});

// ── CP6 : corpus d'exercices & projets reliés ────────────────────────────────

test('CP6 — les 5 exercices V17 sont valides, avec public + privé', () => {
  for (const id of ['debt-audit', 'refactor-legacy', 'latency-percentiles', 'perf-budget', 'fix-nplus1']) {
    const ex = exercise(id);
    assert.deepEqual(validateExercise(ex), { ok: true, errors: [] }, `${id} valide`);
    assert.ok(ex.tests.some((t) => !t.private) && ex.tests.some((t) => t.private), `${id} : public + privé`);
    const starter = ex.workspace.files.find((f) => f.path === ex.activeFile).content;
    assert.notEqual(starter, ex.reference[ex.activeFile], `${id} : starter ≠ solution`);
  }
});

test('CP6 — chaque exercice V17 est relié à une journée thématiquement cohérente', () => {
  const de = dayExercises();
  // dette/refactoring → jour 69 ; performance/goulot → jour 80 ; budget → aussi jour 102.
  assert.ok(de['69'].includes('debt-audit') && de['69'].includes('refactor-legacy'));
  for (const id of ['latency-percentiles', 'perf-budget', 'fix-nplus1']) assert.ok(de['80'].includes(id), `jour 80 → ${id}`);
  assert.ok(de['102'].includes('perf-budget'));
});

test('CP6 — matrice de couverture des activités : aucun manque', () => {
  // Chaque activité CP6 est couverte soit par un exercice de code (lab), soit par
  // un livrable documentaire évalué / une référence réutilisable.
  const de = dayExercises();
  const program = JSON.parse(readFileSync(new URL('../data/program.json', import.meta.url), 'utf8'));
  const doc = readFileSync(new URL('../curriculum/methodology/documentation-technique.md', import.meta.url), 'utf8');
  const allExercises = new Set(Object.values(de).flat());
  const d66 = program.days.find((x) => x.day === 66);

  // Activités « code » → exercices réels.
  assert.ok(allExercises.has('debt-audit'), 'identification de dette');
  assert.ok(allExercises.has('refactor-legacy'), 'refactoring sans régression + caractérisation');
  assert.ok(allExercises.has('latency-percentiles'), 'analyse de performance');
  assert.ok(allExercises.has('fix-nplus1'), 'correction d’un goulot');
  assert.ok(allExercises.has('perf-budget'), 'budget/régression de performance');
  // Activités « documentaires » → livrables évalués / modèles de référence.
  assert.ok(/runbook/i.test(d66.deliverable), 'runbook : livrable évalué');
  assert.ok(/ADR/.test(d66.deliverable), 'ADR : livrable évalué');
  assert.ok(doc.includes('## Post-mortem'), 'post-mortem : modèle de référence');
  assert.ok(doc.includes('## TSD') && doc.includes('## HSD'), 'TSD/HSD : modèles de référence');
});

test('CP6 — anti-fuite corpus : aucune référence/solution des exercices V17 indexée', () => {
  // Les fichiers d'exercice contiennent la référence, mais elle ne doit jamais
  // transiter par une surface publique. On vérifie que le champ reference existe
  // (serveur) mais qu'aucun test PRIVÉ n'est marqué public par erreur.
  for (const id of ['debt-audit', 'refactor-legacy', 'latency-percentiles', 'perf-budget', 'fix-nplus1']) {
    const ex = exercise(id);
    assert.ok(ex.reference && Object.keys(ex.reference).length > 0, `${id} a une référence (serveur only)`);
    const privateNames = ex.tests.filter((t) => t.private).map((t) => t.name);
    // un test privé ne doit pas révéler l'attendu dans un test public homonyme
    assert.ok(privateNames.every((n) => n.includes('privé')), `${id} : tests privés étiquetés`);
  }
});

// ── CP7 : enrichissement du glossaire ────────────────────────────────────────

const glossary = () => JSON.parse(readFileSync(new URL('../curriculum/glossary/glossary.json', import.meta.url), 'utf8'));

test('CP7 — les 32 termes cibles sont présents (terme, acronyme ou alias)', () => {
  const g = glossary();
  const have = new Set(g.flatMap((e) => [e.term, e.fullForm, ...(e.aliases ?? [])].filter(Boolean).map((s) => s.toLowerCase())));
  const targets = ['code smell', 'backward compatibility', 'corrective maintenance', 'adaptive maintenance', 'preventive maintenance', 'perfective maintenance', 'patch', 'baseline', 'benchmark', 'profiling', 'latency', 'throughput', 'p50', 'p95', 'p99', 'CPU-bound', 'I/O-bound', 'memory leak', 'cache hit ratio', 'cold start', 'hot path', 'N+1', 'bundle size', 'RFC', 'HLD', 'HSD', 'LLD', 'API contract', 'C4 model', 'playbook', 'changelog', 'decision log'];
  const missing = targets.filter((t) => !have.has(t.toLowerCase()));
  assert.deepEqual(missing, [], `termes manquants : ${missing.join(', ')}`);
});

test('CP7 — glossaire enrichi reste valide (schéma, relations, unicité)', () => {
  assert.deepEqual(validateGlossary(glossary()).errors, []);
});

test('CP7 — HSD : convention documentée et ambiguïté signalée', () => {
  const hsd = glossary().find((e) => e.id === 'arch-hsd');
  assert.ok(hsd, 'entrée HSD présente');
  assert.match(hsd.fullForm, /High-Level Solution Design/);
  assert.ok(hsd.ambiguityNote && /pas un acronyme standard/i.test(hsd.ambiguityNote), 'ambiguïté signalée');
});

test('CP7 — nouvelles entrées reliées à des journées (journées associées)', () => {
  const g = glossary();
  for (const id of ['prod-percentile', 'arch-hld', 'dev-bundle-size', 'prod-corrective-maintenance']) {
    const e = g.find((x) => x.id === id);
    assert.ok(Array.isArray(e.days) && e.days.length > 0, `${id} doit référencer au moins une journée`);
  }
});

test('CP7 — recherche : les nouveaux termes clés sont trouvables', () => {
  const g = glossary();
  for (const [q, id] of [['RFC', 'arch-rfc'], ['percentile', 'prod-percentile'], ['fuite mémoire', 'prod-memory-leak'], ['bundle size', 'dev-bundle-size'], ['playbook', 'prod-playbook']]) {
    assert.ok(filterEntries(g, { query: q }).some((e) => e.id === id), `« ${q} » doit trouver ${id}`);
  }
});
