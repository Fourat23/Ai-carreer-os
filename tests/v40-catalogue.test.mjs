// CP10/CP14 (V40) — le catalogue RÉEL de capstones (data/capstones/*.json) est
// valide, cohérent et honnête : structure valide, id == fichier, ids uniques,
// compétences ∈ programme, refs (leçons/exos/playbooks/jours) résolues,
// auto-cohérence (réponses déclarées corrigent à 100 %), ≥ 1 diagnosis, ≥ 1 bruit,
// anti-leak (cause absente du signal/contexte), domaine simulé → simulationNote.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validateCapstone, gradeCapstone } from '../lib/capstone.mjs';
import { normalizeText } from '../lib/glossary-core.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const knownSkills = new Set(program.skills.map((s) => s.id));
const knownLessons = new Set(program.lessons.map((l) => l.slug));
const validDays = new Set(program.days.map((d) => d.day));
const knownEx = new Set(readdirSync(R('data/exercises')).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')));
const knownPb = new Set(readdirSync(R('data/playbooks')).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')));
const DIR = R('data/capstones');
const files = readdirSync(DIR).filter((f) => f.endsWith('.json')).sort();
const load = (f) => JSON.parse(readFileSync(join(DIR, f), 'utf8'));

test('catalogue non vide (≥ 4 capstones cible)', () => {
  assert.ok(files.length >= 4, `seulement ${files.length} capstones`);
});

test('chaque fichier est un capstone valide, id == nom de fichier, unique', () => {
  const seen = new Set();
  for (const f of files) {
    const c = load(f);
    const v = validateCapstone(c);
    assert.ok(v.ok, `${f} invalide : ${v.errors.join(' ; ')}`);
    assert.equal(c.id, f.replace(/\.json$/, ''), `${f} : id ≠ nom de fichier`);
    assert.ok(!seen.has(c.id), `id dupliqué ${c.id}`);
    seen.add(c.id);
  }
});

test('compétences ∈ programme ; refs (leçons/exos/playbooks/jours) résolues', () => {
  for (const f of files) {
    const c = load(f);
    for (const s of c.skills) assert.ok(knownSkills.has(s), `${f} : skill inconnu ${s}`);
    for (const l of c.lessonRefs ?? []) assert.ok(knownLessons.has(l), `${f} : lessonRef inconnu ${l}`);
    for (const e of c.exerciseRefs ?? []) assert.ok(knownEx.has(e), `${f} : exerciseRef inconnu ${e}`);
    for (const p of c.playbookRefs ?? []) assert.ok(knownPb.has(p), `${f} : playbookRef inconnu ${p}`);
    for (const d of c.dayRefs ?? []) assert.ok(validDays.has(d), `${f} : dayRef inconnu ${d}`);
  }
});

test('auto-cohérence : les réponses déclarées corrigent à 100 %', () => {
  for (const f of files) {
    const c = load(f);
    const resp = {};
    for (const p of c.phases) for (const q of p.questions) resp[q.id] = q.answer;
    const r = gradeCapstone(c, resp);
    assert.equal(r.passed, r.total, `${f} : ${r.passed}/${r.total}`);
    assert.equal(r.passedOverall, true, `${f} : devrait passer avec ses propres réponses`);
  }
});

test('anti-leak : la bonne réponse d\'une phase diagnosis n\'apparaît pas dans le signal/contexte', () => {
  for (const f of files) {
    const c = load(f);
    const hay = normalizeText(`${c.signal} ${c.context}`);
    for (const ph of c.phases.filter((p) => p.kind === 'diagnosis')) {
      for (const q of ph.questions) {
        const correct = q.kind === 'mcq' ? [q.options[q.answer]]
          : q.kind === 'multi' ? q.answer.map((i) => q.options[i]) : [];
        for (const t of correct) {
          if (typeof t === 'string' && t.length >= 12) {
            assert.ok(!hay.includes(normalizeText(t)), `${f} : fuite de réponse « ${t} »`);
          }
        }
      }
    }
  }
});

test('honnêteté SIMULATION : domaines cloud/k8s/ai/rag/ml portent une simulationNote', () => {
  for (const f of files) {
    const c = load(f);
    const dom = normalizeText(c.domain || '');
    if (/(cloud|kubernetes|k8s|ai|rag|ml|data)/.test(dom)) {
      assert.ok(typeof c.simulationNote === 'string' && c.simulationNote.length > 0, `${f} : simulationNote requise pour un domaine simulé`);
    }
  }
});
