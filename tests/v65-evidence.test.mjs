// V65 · Modèle de preuve canonique + projection de compétence.
// PURS : ces tests ne touchent aucun fichier.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  makeEvidence, isQualifying, evidenceKey, appendEvidence, normalizeLedger,
  normalizeEvidenceRecord, migrateLegacyEvidence, classifyLegacyEvidence,
  EVIDENCE_SOURCE_TYPES, QUALIFYING_SOURCE_TYPES,
} from '../lib/evidence.mjs';
import {
  createLedger, projectCompetency, projectCompetencies, competencyStateFrom,
  whyCompetencyState, COMPETENCY_STATES,
} from '../lib/competency.mjs';
import { programSkill, programSkills, isProgramSkill } from '../lib/skill-taxonomy.mjs';

const T1 = '2026-03-01T09:00:00.000Z';
const T2 = '2026-03-02T09:00:00.000Z';
const T1b = '2026-03-01T18:00:00.000Z'; // même jour que T1

const ok = (r) => { assert.equal(r.ok, true, r.error ?? ''); return r.evidence; };
const base = (over = {}) => ({
  sourceType: 'exercise', sourceId: 'ex-1', competencyIds: ['jsts'],
  provenance: { producer: 'lab', method: 'tests' },
  validation: { status: 'passed', kind: 'exercise-tests', checkedAt: T1, detail: '3/3' },
  ...over,
});

// ── Taxonomie : le palier fin → programme (défaut D3 du CP0) ──────────────

test('le palier fin → programme traduit les identifiants d’exercice', () => {
  assert.equal(programSkill('javascript'), 'jsts');
  assert.equal(programSkill('typescript'), 'jsts');
  assert.equal(programSkill('arrays'), 'ds');
  assert.equal(programSkill('conditions'), 'algo');
  assert.equal(programSkill('linux'), 'gitlinux');
  assert.equal(programSkill('react'), 'jsts');
  assert.equal(programSkill('testing'), 'se');
});

test('une compétence de programme se résout vers elle-même', () => {
  for (const id of ['algo', 'ds', 'jsts', 'python', 'gitlinux', 'ml', 'rag']) {
    assert.equal(programSkill(id), id);
    assert.equal(isProgramSkill(id), true);
  }
});

test('un identifiant inconnu ne se résout PAS — on ne devine jamais', () => {
  assert.equal(programSkill('quantum-blockchain'), null);
  assert.equal(programSkill(''), null);
  assert.equal(programSkill(null), null);
  assert.deepEqual(programSkills(['quantum-blockchain', 'javascript']), ['jsts']);
});

// ── CP2 : modèle canonique ────────────────────────────────────────────────

test('une preuve valide porte une identité, une provenance et une date serveur', () => {
  const e = ok(makeEvidence(base(), { now: T1 }));
  assert.equal(e.id, 'ev-exercise-ex-1');
  assert.equal(e.sourceType, 'exercise');
  assert.equal(e.sourceId, 'ex-1');
  assert.deepEqual(e.competencyIds, ['jsts']);
  assert.equal(e.createdAt, T1);
  assert.equal(e.provenance.producer, 'lab');
});

test('createdAt vient de l’HORLOGE SERVEUR, jamais du client', () => {
  const e = ok(makeEvidence(base({ createdAt: '1999-01-01T00:00:00.000Z' }), { now: T1 }));
  assert.equal(e.createdAt, T1, 'un horodatage client ne doit pas être retenu');
});

test('sans provenance, la preuve est REFUSÉE', () => {
  assert.equal(makeEvidence(base({ provenance: null }), { now: T1 }).code, 'MISSING_PROVENANCE');
  assert.equal(makeEvidence(base({ provenance: {} }), { now: T1 }).code, 'MISSING_PROVENANCE');
});

test('une compétence inconnue est REJETÉE, jamais stockée', () => {
  const r = makeEvidence(base({ competencyIds: ['quantum-blockchain'] }), { now: T1 });
  assert.equal(r.ok, false);
  assert.equal(r.code, 'UNKNOWN_COMPETENCY');
});

test('les compétences fines sont traduites, les inconnues écartées', () => {
  const e = ok(makeEvidence(base({ competencyIds: ['javascript', 'arrays', 'inconnu'] }), { now: T1 }));
  assert.deepEqual(e.competencyIds, ['jsts', 'ds']);
});

test('un type de source inconnu est refusé', () => {
  assert.equal(makeEvidence(base({ sourceType: 'magie' }), { now: T1 }).code, 'INVALID_SOURCE_TYPE');
});

test('un sourceId dangereux est refusé', () => {
  for (const bad of ['__proto__', '../secret', 'a/b', '', '..']) {
    assert.equal(makeEvidence(base({ sourceId: bad }), { now: T1 }).ok, false, `sourceId « ${bad} »`);
  }
});

test('une horloge invalide refuse la preuve', () => {
  assert.equal(makeEvidence(base(), { now: 'pas une date' }).code, 'INVALID_CLOCK');
});

// ── Qualification : la règle centrale du contrat ──────────────────────────

test('seule une validation « passed » d’un type qualifiant est qualifiante', () => {
  assert.equal(isQualifying(ok(makeEvidence(base(), { now: T1 }))), true);
  assert.equal(isQualifying(ok(makeEvidence(base({ validation: { status: 'failed', kind: 'exercise-tests' } }), { now: T1 }))), false);
  assert.equal(isQualifying(ok(makeEvidence(base({ validation: null }), { now: T1 }))), false);
});

test('une DÉCLARATION de l’apprenant n’est JAMAIS qualifiante', () => {
  const e = ok(makeEvidence({
    sourceType: 'declared', sourceId: 'note-1', competencyIds: ['python'],
    provenance: { producer: 'learner' }, validation: null, title: "j'ai lu la doc",
  }, { now: T1 }));
  assert.equal(isQualifying(e), false);
});

test('un type NON qualifiant portant « passed » est REFUSÉ', () => {
  for (const t of ['declared', 'submission', 'review']) {
    const r = makeEvidence({
      sourceType: t, sourceId: 'x', competencyIds: ['python'],
      provenance: { producer: 'p' },
      validation: { status: 'passed', kind: 'self' },
    }, { now: T1 });
    assert.equal(r.ok, false, `${t} ne doit pas pouvoir se déclarer réussi`);
    assert.equal(r.code, 'UNQUALIFIABLE_SOURCE');
  }
});

test('une incohérence héritée est neutralisée à la relecture, jamais promue', () => {
  const rec = normalizeEvidenceRecord({
    id: 'ev-declared-x', sourceType: 'declared', sourceId: 'x', competencyIds: ['python'],
    createdAt: T1, provenance: { producer: 'legacy' },
    validation: { status: 'passed', kind: 'self' },
  });
  assert.equal(rec.validation.status, 'manual');
  assert.equal(isQualifying(rec), false);
});

// ── Déduplication ─────────────────────────────────────────────────────────

test('une même réussite rejouée ne crée pas une seconde preuve', () => {
  const e = ok(makeEvidence(base(), { now: T1 }));
  const again = ok(makeEvidence(base(), { now: T2 })); // horloge différente
  let list = appendEvidence([], e).evidence;
  const r = appendEvidence(list, again);
  assert.equal(r.added, false);
  assert.equal(r.reason, 'DUPLICATE');
  assert.equal(r.evidence.length, 1);
});

test('deux exercices DIFFÉRENTS produisent deux preuves', () => {
  let list = appendEvidence([], ok(makeEvidence(base(), { now: T1 }))).evidence;
  list = appendEvidence(list, ok(makeEvidence(base({ sourceId: 'ex-2' }), { now: T1 }))).evidence;
  assert.equal(list.length, 2);
});

test('la clé de dédup distingue qualifiante et non qualifiante', () => {
  const passed = ok(makeEvidence(base(), { now: T1 }));
  const failed = ok(makeEvidence(base({ validation: { status: 'failed', kind: 'exercise-tests' } }), { now: T1 }));
  assert.notEqual(evidenceKey(passed), evidenceKey(failed));
});

test('le registre relu est dédupliqué et ordonné de façon déterministe', () => {
  const raw = [
    { id: 'ev-exercise-b', sourceType: 'exercise', sourceId: 'b', competencyIds: ['jsts'], createdAt: T2, provenance: { producer: 'lab' }, validation: { status: 'passed', kind: 'exercise-tests' } },
    { id: 'ev-exercise-a', sourceType: 'exercise', sourceId: 'a', competencyIds: ['jsts'], createdAt: T1, provenance: { producer: 'lab' }, validation: { status: 'passed', kind: 'exercise-tests' } },
    { id: 'ev-exercise-a', sourceType: 'exercise', sourceId: 'a', competencyIds: ['jsts'], createdAt: T1, provenance: { producer: 'lab' }, validation: { status: 'passed', kind: 'exercise-tests' } },
  ];
  const led = normalizeLedger(raw);
  assert.equal(led.length, 2);
  assert.deepEqual(led.map((e) => e.sourceId), ['a', 'b']);
  assert.deepEqual(normalizeLedger(led), led, 'normalisation idempotente');
});

// ── CP5 : projection ──────────────────────────────────────────────────────

test('machine à états — table exhaustive gelée au CP1', () => {
  const q = (id, at) => ({ sourceType: 'exercise', sourceId: id, createdAt: at, validation: { status: 'passed' } });
  const n = (id, at) => ({ sourceType: 'declared', sourceId: id, createdAt: at, validation: null });

  assert.equal(competencyStateFrom({ qualifying: [], nonQualifying: [] }), 'unassessed');
  assert.equal(competencyStateFrom({ qualifying: [], nonQualifying: [n('a', T1)] }), 'practiced');
  assert.equal(competencyStateFrom({ qualifying: [q('a', T1)], nonQualifying: [] }), 'demonstrated');
  // deux sources, MÊME jour → pas consolidée
  assert.equal(competencyStateFrom({ qualifying: [q('a', T1), q('b', T1b)] }), 'demonstrated');
  // même source, deux jours → pas consolidée
  assert.equal(competencyStateFrom({ qualifying: [q('a', T1), q('a', T2)] }), 'demonstrated');
  // deux sources ET deux jours → consolidée
  assert.equal(competencyStateFrom({ qualifying: [q('a', T1), q('b', T2)] }), 'reinforced');
});

test('AUCUNE progression sans preuve — la couverture n’est pas une démonstration', () => {
  const led = createLedger([]);
  const p = projectCompetency('jsts', led.getEvidenceBySkill('jsts'));
  assert.equal(p.state, 'unassessed');
  assert.equal(p.evidenceCount, 0);
  assert.equal(p.lastEvidenceAt, null);
});

test('une note libre rend « Pratiquée », plus jamais « Démontrée »', () => {
  const note = ok(makeEvidence({
    sourceType: 'declared', sourceId: 'note-1', competencyIds: ['python'],
    provenance: { producer: 'learner' }, title: "j'ai lu la doc",
  }, { now: T1 }));
  const led = createLedger([note]);
  const p = projectCompetency('python', led.getEvidenceBySkill('python'));
  assert.equal(p.state, 'practiced');
  assert.equal(p.qualifyingEvidenceCount, 0);
});

test('un exercice réussi rend « Démontrée »', () => {
  const led = createLedger([ok(makeEvidence(base(), { now: T1 }))]);
  const p = projectCompetency('jsts', led.getEvidenceBySkill('jsts'));
  assert.equal(p.state, 'demonstrated');
  assert.equal(p.qualifyingEvidenceCount, 1);
  assert.equal(p.lastQualifiedEvidenceAt, T1);
  assert.deepEqual(p.supportingEvidenceIds, ['ev-exercise-ex-1']);
});

test('deux exercices, jours distincts → « Consolidée »', () => {
  const led = createLedger([
    ok(makeEvidence(base(), { now: T1 })),
    ok(makeEvidence(base({ sourceId: 'ex-2' }), { now: T2 })),
  ]);
  const p = projectCompetency('jsts', led.getEvidenceBySkill('jsts'));
  assert.equal(p.state, 'reinforced');
  assert.equal(p.distinctSourceCount, 2);
  assert.equal(p.distinctDateCount, 2);
});

test('la projection est DÉTERMINISTE et reconstructible', () => {
  const list = [ok(makeEvidence(base(), { now: T1 })), ok(makeEvidence(base({ sourceId: 'ex-2' }), { now: T2 }))];
  const a = projectCompetency('jsts', createLedger(list).getEvidenceBySkill('jsts'));
  const b = projectCompetency('jsts', createLedger([...list].reverse()).getEvidenceBySkill('jsts'));
  assert.deepEqual(b, a, 'l’ordre d’entrée ne doit rien changer');
});

test('projectCompetencies couvre TOUTES les compétences, même sans preuve', () => {
  const skills = [{ id: 'jsts', name: 'JS/TS' }, { id: 'python', name: 'Python' }];
  const out = projectCompetencies(skills, createLedger([ok(makeEvidence(base(), { now: T1 }))]));
  assert.equal(out.length, 2);
  assert.equal(out.find((s) => s.competencyId === 'jsts').state, 'demonstrated');
  assert.equal(out.find((s) => s.competencyId === 'python').state, 'unassessed');
  for (const s of out) assert.ok(COMPETENCY_STATES.includes(s.state));
});

// ── needsReview : orthogonal ──────────────────────────────────────────────

test('needsReview est un DRAPEAU, pas un niveau', () => {
  const e = ok(makeEvidence(base({ dayId: 14 }), { now: T1 }));
  const led = createLedger([e]);
  const withDue = projectCompetency('jsts', led.getEvidenceBySkill('jsts'), { dueDays: new Set([14]) });
  assert.equal(withDue.state, 'demonstrated', 'l’état ne change pas');
  assert.equal(withDue.needsReview, true);
  assert.match(withDue.needsReviewReasons[0], /journée 14/i);

  const without = projectCompetency('jsts', led.getEvidenceBySkill('jsts'));
  assert.equal(without.needsReview, false);
});

test('une dernière validation en échec lève needsReview', () => {
  const led = createLedger([
    ok(makeEvidence(base(), { now: T1 })),
    ok(makeEvidence(base({ sourceId: 'ex-2', validation: { status: 'failed', kind: 'exercise-tests' } }), { now: T2 })),
  ]);
  const p = projectCompetency('jsts', led.getEvidenceBySkill('jsts'));
  assert.equal(p.needsReview, true);
  assert.equal(p.state, 'demonstrated', 'un échec récent ne détruit pas la démonstration passée');
});

// ── CP4 : ledger ──────────────────────────────────────────────────────────

test('le ledger indexe par compétence, journée, session et source', () => {
  const led = createLedger([
    ok(makeEvidence(base({ dayId: 14, sessionId: 's1' }), { now: T1 })),
    ok(makeEvidence(base({ sourceId: 'ex-2', competencyIds: ['python'], dayId: 20 }), { now: T2 })),
  ]);
  assert.equal(led.size, 2);
  assert.equal(led.getEvidenceBySkill('jsts').length, 1);
  assert.equal(led.getEvidenceBySkill('python').length, 1);
  assert.equal(led.getEvidenceByDay(14).length, 1);
  assert.equal(led.getEvidenceBySession('s1').length, 1);
  assert.equal(led.getEvidenceBySource('exercise', 'ex-2').length, 1);
  assert.equal(led.getEvidenceById('ev-exercise-ex-1').sourceId, 'ex-1');
  assert.equal(led.getEvidenceById('inexistante'), null);
  assert.deepEqual(led.getEvidenceTimeline(1).map((e) => e.sourceId), ['ex-2'], 'plus récente d’abord');
});

// ── CP6 : explicabilité ───────────────────────────────────────────────────

test('chaque état affiché est explicable par ses preuves', () => {
  const led = createLedger([ok(makeEvidence(base({ dayId: 14, title: 'FizzBuzz' }), { now: T1 }))]);
  const p = projectCompetency('jsts', led.getEvidenceBySkill('jsts'));
  const why = whyCompetencyState(p, led);
  assert.equal(why.state, 'demonstrated');
  assert.equal(why.stateLabel, 'Démontrée');
  assert.match(why.rule, /validation réussie/);
  assert.equal(why.evidence.length, 1);
  assert.equal(why.evidence[0].sourceLabel, 'Exercice de laboratoire');
  assert.equal(why.evidence[0].dayId, 14);
  assert.equal(why.evidence[0].qualifying, true);
});

test('une compétence sans preuve dit « je ne sais pas »', () => {
  const led = createLedger([]);
  const why = whyCompetencyState(projectCompetency('rag', []), led);
  assert.equal(why.state, 'unassessed');
  assert.match(why.facts[0], /Aucune preuve/);
  assert.equal(why.evidence.length, 0);
});

test('« démontrée mais pas consolidée » explique CE QUI MANQUE', () => {
  const led = createLedger([
    ok(makeEvidence(base(), { now: T1 })),
    ok(makeEvidence(base({ sourceId: 'ex-2' }), { now: T1b })), // même jour
  ]);
  const why = whyCompetencyState(projectCompetency('jsts', led.getEvidenceBySkill('jsts')), led);
  assert.equal(why.state, 'demonstrated');
  assert.ok(why.facts.some((f) => /même jour/.test(f)), why.facts.join(' | '));
});

// ── Migration des preuves héritées ────────────────────────────────────────

test('classification héritée : la provenance est LUE, jamais supposée', () => {
  assert.equal(classifyLegacyEvidence({ id: 'lab-fizz', url: '/lab/fizz' }).sourceType, 'exercise');
  assert.equal(classifyLegacyEvidence({ id: 'mission-x', url: '/missions/x' }).sourceType, 'mission');
  assert.equal(classifyLegacyEvidence({ id: 'diag-http' }).sourceType, 'assessment');
  assert.equal(classifyLegacyEvidence({ id: 'sub-ev-act-1' }).sourceType, 'submission');
  assert.equal(classifyLegacyEvidence({ id: 'ev-0', type: 'note' }).sourceType, 'declared');
});

test('migration : une preuve dupliquée sur N journées devient UNE preuve', () => {
  const days = {
    '8': { evidence: [{ id: 'lab-fizz', type: 'exercise', title: 'FizzBuzz', url: '/lab/fizz', skills: ['javascript'], createdAt: T1 }] },
    '9': { evidence: [{ id: 'lab-fizz', type: 'exercise', title: 'FizzBuzz', url: '/lab/fizz', skills: ['javascript'], createdAt: T1 }] },
  };
  const led = migrateLegacyEvidence(days);
  assert.equal(led.length, 1, 'le même fait ne doit pas exister deux fois');
  assert.equal(led[0].sourceType, 'exercise');
  assert.deepEqual(led[0].competencyIds, ['jsts'], 'la compétence fine est traduite');
  assert.equal(isQualifying(led[0]), true);
});

test('migration : une note libre héritée devient NON qualifiante', () => {
  const days = { '3': { evidence: [{ id: 'ev-0', type: 'note', title: 'lu la doc', url: '', skills: ['python'], createdAt: T1 }] } };
  const led = migrateLegacyEvidence(days);
  assert.equal(led.length, 1);
  assert.equal(led[0].sourceType, 'declared');
  assert.equal(isQualifying(led[0]), false);
});

test('migration : déterministe et idempotente', () => {
  const days = {
    '8': { evidence: [{ id: 'lab-fizz', type: 'exercise', title: 'F', url: '/lab/fizz', skills: ['javascript'], createdAt: T1 }] },
    '3': { evidence: [{ id: 'ev-0', type: 'note', title: 'n', url: '', skills: ['python'], createdAt: T2 }] },
  };
  const a = migrateLegacyEvidence(days);
  assert.deepEqual(migrateLegacyEvidence(days), a);
  assert.deepEqual(normalizeLedger(a), a);
});

test('migration : une preuve sans date ou sans compétence connue est écartée', () => {
  const days = {
    '1': { evidence: [
      { id: 'x', type: 'note', title: 'sans date', url: '', skills: ['python'] },
      { id: 'y', type: 'note', title: 'sans compétence', url: '', skills: ['inconnue'], createdAt: T1 },
    ] },
  };
  assert.equal(migrateLegacyEvidence(days).length, 0);
});

test('tous les types de source déclarés sont soit qualifiables soit explicitement non', () => {
  for (const t of EVIDENCE_SOURCE_TYPES) {
    assert.equal(typeof QUALIFYING_SOURCE_TYPES.has(t), 'boolean');
  }
  assert.deepEqual([...QUALIFYING_SOURCE_TYPES].sort(), ['assessment', 'capstone', 'exercise', 'mission']);
});
