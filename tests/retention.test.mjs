// Retention Engine I — tests du modèle pur (V66 · CP2-CP7).
//
// Chaque test vise une règle NOMMÉE du modèle. Un test qui reste vert quand on
// casse la règle qu'il prétend couvrir ne mesure rien : c'est la leçon de
// V65 (N2) et de V65.1 (le test de déduplication qui ne testait rien). Les cas
// ci-dessous sont écrits pour échouer si la règle disparaît — le gate
// `v66:check` le vérifie en la cassant pour de vrai.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeAttempt, normalizeAttempts, projectRecall, projectSchedule,
  projectExposures, projectRetentionState, projectRetention, interleave,
  buildReviewQueue, availableFormats, nextFormat, retentionCounts,
  INTERVALS, RETAINED_MIN_SPAN_DAYS,
} from '../lib/retention.mjs';
import { applyCommand } from '../lib/learning-engine.mjs';

const A = (conceptId, at, outcome, format = 'free') => ({ conceptId, at, outcome, format });
const d = (n) => `2026-01-${String(n).padStart(2, '0')}T10:00:00.000Z`;

// ── Normalisation : ce qui n'est pas un fait n'entre pas ──────────────────

test('normalizeAttempt refuse une issue hors du domaine fermé', () => {
  assert.equal(normalizeAttempt(A('x', d(1), 'presque')), null);
  assert.equal(normalizeAttempt(A('x', d(1), 'ok')), null);
  assert.notEqual(normalizeAttempt(A('x', d(1), 'partial')), null);
});

test('normalizeAttempt refuse une date invalide ou un concept vide', () => {
  assert.equal(normalizeAttempt(A('x', 'hier', 'recalled')), null);
  assert.equal(normalizeAttempt(A('  ', d(1), 'recalled')), null);
});

test('une forme inconnue retombe sur free plutôt que de rejeter le fait', () => {
  // La forme est une métadonnée ; l'issue est le fait. Perdre une tentative
  // réelle parce que son étiquette de forme est inconnue serait pire.
  assert.equal(normalizeAttempt({ ...A('x', d(1), 'recalled'), format: 'zzz' }).format, 'free');
});

test('normalizeAttempts trie par date : la projection ne dépend pas de l’ordre d’insertion', () => {
  const desordre = [A('x', d(5), 'recalled'), A('x', d(1), 'failed'), A('x', d(3), 'partial')];
  assert.deepEqual(normalizeAttempts(desordre).map((a) => a.at), [d(1), d(3), d(5)]);
  // Rejouer dans un autre ordre doit rendre le même état.
  const a = projectRecall('x', desordre);
  const b = projectRecall('x', [...desordre].reverse());
  assert.deepEqual(a, b);
});

// ── La règle des trois issues ────────────────────────────────────────────

test('une réussite fait avancer la série', () => {
  const r = projectRecall('x', [A('x', d(1), 'recalled'), A('x', d(2), 'recalled')]);
  assert.equal(r.consecutiveSuccesses, 2);
  assert.equal(r.successes, 2);
});

test('un échec remet la série à zéro', () => {
  const r = projectRecall('x', [A('x', d(1), 'recalled'), A('x', d(2), 'recalled'), A('x', d(3), 'failed')]);
  assert.equal(r.consecutiveSuccesses, 0);
  assert.equal(r.failures, 1);
  assert.equal(r.successes, 2, 'un échec n’efface pas les réussites passées');
});

test('un rappel partiel GÈLE la série — ni progrès, ni recul', () => {
  const avant = projectRecall('x', [A('x', d(1), 'recalled'), A('x', d(2), 'recalled')]);
  const apres = projectRecall('x', [A('x', d(1), 'recalled'), A('x', d(2), 'recalled'), A('x', d(3), 'partial')]);
  assert.equal(apres.consecutiveSuccesses, avant.consecutiveSuccesses);
  assert.equal(apres.successes, avant.successes);
});

test('trois réussites le MÊME jour ne comptent que pour une date', () => {
  const meme = [
    A('x', '2026-01-01T08:00:00.000Z', 'recalled'),
    A('x', '2026-01-01T09:00:00.000Z', 'recalled'),
    A('x', '2026-01-01T10:00:00.000Z', 'recalled'),
  ];
  const r = projectRecall('x', meme);
  assert.equal(r.successes, 3);
  assert.equal(r.distinctSuccessDays, 1, 'répéter dans la journée n’espace rien');
  assert.equal(r.spanDays, 0);
});

// ── Espacement ───────────────────────────────────────────────────────────

test('l’échéance suit les paliers publiés, indexés par la série', () => {
  for (let consecutiveSuccesses = 0; consecutiveSuccesses <= 3; consecutiveSuccesses++) {
    const attempts = Array.from({ length: consecutiveSuccesses }, (_, i) => A('x', d(i + 1), 'recalled'));
    if (consecutiveSuccesses === 0) attempts.push(A('x', d(1), 'failed'));
    const s = projectSchedule(projectRecall('x', attempts));
    assert.equal(s.intervalDays, INTERVALS[consecutiveSuccesses], `série ${consecutiveSuccesses}`);
  }
});

test('l’échéance ne dépend PAS de l’horloge courante — elle est rejouable', () => {
  const r = projectRecall('x', [A('x', d(1), 'recalled')]);
  const s1 = projectSchedule(r);
  const s2 = projectSchedule(r);
  assert.equal(s1.dueAt, s2.dueAt);
  assert.equal(s1.dueAt, '2026-01-04T10:00:00.000Z', '1 réussite → +3 jours à partir de la tentative');
});

test('un concept jamais tenté n’a pas d’échéance inventée', () => {
  const s = projectSchedule(projectRecall('x', []));
  assert.equal(s.dueAt, null);
  assert.equal(s.intervalDays, null);
});

// ── Exposition ───────────────────────────────────────────────────────────

test('l’exposition distingue « jamais vu » de « vu, jamais testé »', () => {
  const ex = projectExposures({ a: [1, 2], b: [3] }, { 1: { startedAt: d(1) } });
  assert.equal(ex.a.exposed, true);
  assert.equal(ex.a.firstExposedAt, d(1));
  assert.equal(ex.b.exposed, false, 'la journée 3 n’a jamais été ouverte');
  assert.deepEqual(ex.b.teachingDays, [3], 'le corpus l’enseigne quand même');
});

test('une journée seulement OUVERTE expose déjà ses concepts', () => {
  // Exiger « terminée » ferait disparaître les concepts de la journée en cours,
  // c’est-à-dire exactement ceux qu’il faut réactiver.
  const ex = projectExposures({ a: [7] }, { 7: { startedAt: d(2) } });
  assert.equal(ex.a.exposed, true);
});

// ── États ────────────────────────────────────────────────────────────────

const stateOf = (attempts, now, conceptDays = { x: [1] }, days = { 1: { startedAt: d(1) } }) => {
  const ex = projectExposures(conceptDays, days).x;
  return projectRetentionState(ex, projectRecall('x', attempts), now).state;
};

test('nouveau : exposé, jamais tenté', () => {
  assert.equal(stateOf([], d(2)), 'nouveau');
});

test('fragile : la dernière tentative a échoué', () => {
  // On se place AVANT l’échéance pour isoler la règle de l’échéance.
  assert.equal(stateOf([A('x', d(1), 'recalled'), A('x', d(2), 'failed')], '2026-01-02T11:00:00.000Z'), 'fragile');
});

test('fragile : une seule journée de réussite ne prouve rien', () => {
  assert.equal(stateOf([A('x', d(1), 'recalled')], '2026-01-01T11:00:00.000Z'), 'fragile');
});

test('a_revoir prime sur tout : un concept dû est dû', () => {
  const attempts = [A('x', d(1), 'recalled'), A('x', d(5), 'recalled'), A('x', d(12), 'recalled')];
  // Série 3 → +16 j après le 12 janvier = 28 janvier. Bien après :
  assert.equal(stateOf(attempts, '2026-03-01T10:00:00.000Z'), 'a_revoir');
});

test('retenu exige 3 réussites, 3 dates, et un étalement réel', () => {
  // Trois réussites resserrées : l’étalement manque, donc PAS retenu.
  const serre = [A('x', d(1), 'recalled'), A('x', d(2), 'recalled'), A('x', d(3), 'recalled')];
  assert.equal(stateOf(serre, '2026-01-03T11:00:00.000Z'), 'en_consolidation');

  // Les mêmes réussites étalées au-delà du seuil : retenu.
  const etale = [
    A('x', '2026-01-01T10:00:00.000Z', 'recalled'),
    A('x', '2026-01-10T10:00:00.000Z', 'recalled'),
    A('x', '2026-02-05T10:00:00.000Z', 'recalled'),
  ];
  assert.ok(projectRecall('x', etale).spanDays >= RETAINED_MIN_SPAN_DAYS);
  assert.equal(stateOf(etale, '2026-02-05T11:00:00.000Z'), 'retenu');
});

test('aucune commande ne peut écrire un état de rétention', () => {
  // C’est l’invariant central : l’état est mérité par des faits, jamais posé.
  let p = { startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {}, evidence: [], recallAttempts: [] };
  for (const type of ['SET_RETENTION', 'SET_RETENTION_STATE', 'MARK_RETAINED', 'SCHEDULE_CONCEPT']) {
    const r = applyCommand(p, { type, conceptId: 'x', state: 'retenu' }, { now: d(1) });
    assert.equal(r.ok, false, `${type} ne doit pas exister`);
    assert.equal(r.code, 'UNKNOWN_COMMAND');
  }
});

test('la projection est reconstructible : rejouer depuis les seules tentatives rend le même état', () => {
  let p = { startDate: null, days: { 1: { startedAt: d(1) } }, skills: {}, weeklyReviews: {}, monthlyReviews: {}, evidence: [], recallAttempts: [] };
  for (const [i, outcome] of [['1', 'recalled'], ['5', 'recalled'], ['9', 'failed']]) {
    const r = applyCommand(p, { type: 'RECORD_RECALL', conceptId: 'x', outcome, format: 'cued' }, { now: d(Number(i)) });
    assert.equal(r.ok, true, r.error);
    p = r.progress;
  }
  const args = { concepts: [{ id: 'x', title: 'X' }], conceptDays: { x: [1] }, days: p.days, attempts: p.recallAttempts, now: d(20) };
  assert.deepEqual(projectRetention(args), projectRetention(args), 'déterminisme');
  // Même résultat en repartant d’une progression vidée de tout sauf les faits.
  const nu = { concepts: [{ id: 'x', title: 'X' }], conceptDays: { x: [1] }, days: p.days, attempts: JSON.parse(JSON.stringify(p.recallAttempts)), now: d(20) };
  assert.deepEqual(projectRetention(nu), projectRetention(args));
});

// ── Entrelacement ────────────────────────────────────────────────────────

test('interleave alterne les familles au lieu de grouper', () => {
  const mk = (id, skill, due) => ({ conceptId: id, skills: [skill], schedule: { dueAt: due } });
  const items = [
    mk('rag1', 'rag', d(1)), mk('rag2', 'rag', d(2)), mk('rag3', 'rag', d(3)),
    mk('js1', 'jsts', d(1)), mk('js2', 'jsts', d(2)),
  ];
  const out = interleave(items);
  assert.equal(out.length, 5, 'rien n’est perdu');

  // L’INVARIANT, énoncé sans supposer quelle famille passe en tête (le
  // départage entre familles également en retard est alphabétique et
  // déterministe, mais ce n’est pas ce qu’on teste ici) : tant qu’une autre
  // famille a encore des éléments, on ne sert pas deux fois la même de suite.
  const restants = { rag: 3, jsts: 2 };
  for (let i = 0; i < out.length; i++) {
    const f = out[i].skills[0];
    restants[f] -= 1;
    if (i + 1 < out.length && out[i + 1].skills[0] === f) {
      const autres = Object.entries(restants).filter(([k]) => k !== f).reduce((n, [, v]) => n + v, 0);
      assert.equal(autres, 0, `deux ${f} de suite alors qu’une autre famille attend encore`);
    }
  }
});

test('interleave est déterministe', () => {
  const mk = (id, skill, due) => ({ conceptId: id, skills: [skill], schedule: { dueAt: due } });
  const items = [mk('b', 's1', d(2)), mk('a', 's1', d(2)), mk('c', 's2', d(1))];
  assert.deepEqual(interleave(items).map((i) => i.conceptId), interleave(items).map((i) => i.conceptId));
});

test('un concept sans compétence n’est pas rangé au hasard dans une famille existante', () => {
  const mk = (id, skills, due) => ({ conceptId: id, skills, schedule: { dueAt: due } });
  // Deux concepts SANS compétence, deux concepts « rag ». Deux modèles
  // possibles, qui donnent des ordres DIFFÉRENTS — c'est ce qui rend le choix
  // observable :
  //   — fondre les sans-compétence dans une famille commune → n1, r1, n2, r2 ;
  //   — donner à chacun sa propre famille           → n1, n2, r1, r2.
  // Le modèle retient le second, à contre-courant de ce qui « alterne le mieux » :
  // fondre reviendrait à AFFIRMER que deux concepts sont apparentés parce que
  // le programme ne leur a attribué aucune compétence. C'est une relation
  // inventée, et l'entrelacement n'est utile que s'il repose sur une parenté
  // réelle. Le prix est assumé : deux orphelins peuvent se suivre.
  const items = [mk('n1', [], d(1)), mk('n2', [], d(1)), mk('r1', ['rag'], d(1)), mk('r2', ['rag'], d(1))];
  assert.deepEqual(interleave(items).map((i) => i.conceptId), ['n1', 'n2', 'r1', 'r2']);
});

// ── File de réactivation ─────────────────────────────────────────────────

test('la file ne contient que du dû, et elle est bornée', () => {
  const proj = Array.from({ length: 30 }, (_, i) => ({
    conceptId: `c${i}`, title: `C${i}`, skills: [`s${i % 3}`],
    state: 'a_revoir', reason: '', recall: { attemptCount: 1 },
    schedule: { dueAt: d(1), intervalDays: 1, basis: '' },
    exposure: { exposed: true },
  }));
  proj.push({
    conceptId: 'z', title: 'Z', skills: ['s0'], state: 'retenu', reason: '',
    recall: { attemptCount: 4 }, schedule: { dueAt: d(28), intervalDays: 35, basis: '' },
    exposure: { exposed: true },
  });
  const q = buildReviewQueue(proj, { now: d(2) });
  assert.equal(q.length, 8, 'bornée par défaut à 8');
  assert.ok(!q.some((x) => x.conceptId === 'z'), 'un concept non dû n’entre pas dans la file');
});

test('un concept « nouveau » n’entre jamais dans la file de réactivation', () => {
  // On ne peut pas RÉACTIVER ce qui n’a jamais été activé.
  const proj = [{
    conceptId: 'n', title: 'N', skills: [], state: 'nouveau', reason: '',
    recall: { attemptCount: 0 }, schedule: { dueAt: null, intervalDays: null, basis: '' },
    exposure: { exposed: true },
  }];
  assert.equal(buildReviewQueue(proj, { now: d(9) }).length, 0);
});

// ── Formes de rappel ─────────────────────────────────────────────────────

test('availableFormats mesure ce que la leçon offre, et rien d’autre', () => {
  assert.deepEqual(
    availableFormats(['🎯 Objectif', '📖 Explication complète', '🎤 Questions d’entretien']),
    ['free', 'cued'],
  );
  assert.deepEqual(availableFormats([]), [], 'aucune section, aucune forme');
  assert.deepEqual(
    availableFormats(['🎯 Objectif', '✍️ Mini-exercice', '⚠️ Erreurs fréquentes', '🟢 Checklist « quand suis-je prêt ? »']),
    ['free', 'applied', 'discrim', 'generate'],
  );
});

test('nextFormat varie la forme pour ne pas mémoriser la question', () => {
  const r = projectRecall('x', [A('x', d(1), 'recalled', 'free')]);
  assert.equal(nextFormat(r, ['free', 'cued', 'applied']), 'cued');
});

test('nextFormat ne propose jamais une forme que la leçon ne permet pas', () => {
  const r = projectRecall('x', [A('x', d(1), 'recalled', 'free')]);
  assert.equal(nextFormat(r, ['free']), 'free', 'une seule forme disponible : on la reprend');
  assert.equal(nextFormat(r, []), null, 'aucune forme disponible : on ne propose rien');
});

test('retentionCounts couvre les cinq états, même à zéro', () => {
  const c = retentionCounts([]);
  assert.deepEqual(Object.keys(c).sort(), ['a_revoir', 'en_consolidation', 'fragile', 'nouveau', 'retenu']);
  assert.ok(Object.values(c).every((n) => n === 0));
});
