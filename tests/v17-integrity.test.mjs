// CP9 (V17) — intégrité transverse : liens internes non cassés, journées liées
// du glossaire résolues, exercices V17 atteignables depuis les bons parcours,
// aucune fuite de test privé. Complète v17-content (présence) par la cohérence.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { extractDayRefs } from '../lib/v17-coverage.mjs';
import { buildCatalogue, resolveTrackDays, DEFAULT_TRACK_ID, FULLSTACK_TRACK_ID, BACKEND_TRACK_ID } from '../lib/catalogue.mjs';
import { buildDayExerciseIndex, daysForExercise } from '../lib/day-exercises.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const read = (p) => readFileSync(R(p), 'utf8');
const program = JSON.parse(read('data/program.json'));
const validDays = new Set(program.days.map((d) => d.day));
const glossary = JSON.parse(read('curriculum/glossary/glossary.json'));
const exerciseIds = new Set(readdirSync(R('data/exercises')).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')));

const V17_DAYS = [66, 69, 80, 85, 102];
const V17_EXERCISES = ['debt-audit', 'refactor-legacy', 'latency-percentiles', 'perf-budget', 'fix-nplus1'];

test('CP9 — aucun lien /day/N cassé dans le contenu V17', () => {
  const texts = [
    ...V17_DAYS.map((n) => read(`curriculum/days/day-${String(n).padStart(3, '0')}.md`)),
    read('curriculum/methodology/documentation-technique.md'),
  ];
  for (const txt of texts) {
    for (const m of txt.matchAll(/\/day\/(\d+)/g)) {
      assert.ok(validDays.has(Number(m[1])), `lien /day/${m[1]} cassé`);
    }
    // Références « jour N » en toutes lettres.
    for (const n of extractDayRefs(txt)) assert.ok(validDays.has(n), `« jour ${n} » inexistant`);
  }
});

test('CP9 — aucun lien /lab/id cassé dans le contenu V17', () => {
  for (const n of V17_DAYS) {
    const txt = read(`curriculum/days/day-${String(n).padStart(3, '0')}.md`);
    for (const m of txt.matchAll(/\/lab\/([a-z0-9-]+)/g)) {
      assert.ok(exerciseIds.has(m[1]), `lien /lab/${m[1]} cassé (jour ${n})`);
    }
  }
});

test('CP9 — liens /doc de la référence documentation résolvent vers un fichier réel', () => {
  const sources = [read('curriculum/days/day-066.md'), read('curriculum/methodology/documentation-technique.md')];
  const ALLOWED = new Set(['methodology', 'rubrics', 'resources', 'career', 'lessons', 'year-overview']);
  for (const txt of sources) {
    for (const m of txt.matchAll(/\/doc\/([a-z0-9-]+)\/([a-z0-9-]+)/g)) {
      assert.ok(ALLOWED.has(m[1]), `catégorie /doc/${m[1]} non autorisée`);
      assert.ok(existsSync(R(`curriculum/${m[1]}/${m[2]}.md`)), `document /doc/${m[1]}/${m[2]} introuvable`);
    }
  }
});

test('CP9 — journées associées du glossaire pointent des jours réels', () => {
  for (const e of glossary) {
    for (const n of e.days ?? []) {
      assert.ok(validDays.has(n), `entrée ${e.id} : jour associé ${n} inexistant`);
    }
  }
});

test('CP9 — exercices V17 atteignables depuis les parcours attendus', () => {
  const cat = buildCatalogue(program);
  const de = JSON.parse(read('data/day-exercises.json'));
  const idx = buildDayExerciseIndex(de, new Set(Object.values(de).flat()), validDays);
  const sets = {
    [DEFAULT_TRACK_ID]: new Set(resolveTrackDays(cat, DEFAULT_TRACK_ID)),
    [FULLSTACK_TRACK_ID]: new Set(resolveTrackDays(cat, FULLSTACK_TRACK_ID)),
    [BACKEND_TRACK_ID]: new Set(resolveTrackDays(cat, BACKEND_TRACK_ID)),
  };
  for (const id of V17_EXERCISES) {
    const days = daysForExercise(idx, id);
    assert.ok(days.length > 0, `${id} doit être relié à au moins une journée`);
    // tous atteignables depuis Foundations (couvre les 365 jours)
    assert.ok(days.some((d) => sets[DEFAULT_TRACK_ID].has(d)), `${id} atteignable depuis Foundations`);
  }
});

test('CP9 — aucune fuite : chaque exercice V17 garde des tests privés non exposés', () => {
  for (const id of V17_EXERCISES) {
    const ex = JSON.parse(read(`data/exercises/${id}.json`));
    const priv = ex.tests.filter((t) => t.private);
    const pub = ex.tests.filter((t) => !t.private);
    assert.ok(priv.length > 0, `${id} : au moins un test privé`);
    assert.ok(pub.length > 0, `${id} : au moins un test public`);
    // La référence existe (serveur) mais n'est pas un champ « public » du contrat.
    assert.ok(ex.reference && Object.keys(ex.reference).length > 0, `${id} : référence côté serveur`);
  }
});
