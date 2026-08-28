// V65.1 · CP12 — MATRICE DE COHÉRENCE TRANSVERSE.
//
// Le CP0 a mesuré ce qui arrive quand deux surfaces répondent à la même
// question avec deux modèles : 20 compétences sur 20 divergentes entre le
// Dashboard et /skills, dont 8 sémantiquement — quatre compétences réellement
// démontrées annoncées « Non abordée ».
//
// Ces quinze scénarios interrogent les READ-MODELS que les surfaces
// consomment, sur une progression construite ici. Ils échouent dès qu'une
// surface se remet à calculer sa propre vérité. Ce n'est pas un test d'UI :
// c'est le test qui rend la divergence impossible à réintroduire en silence.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLedger, projectCompetencies, whyCompetencyState, nextActionForCompetency, COMPETENCY_STATES, COMPETENCY_STATE_LABEL } from '../lib/competency.mjs';
import { makeEvidence, isQualifying, appendEvidence, evidenceKey } from '../lib/evidence.mjs';
import { evidenceTimeline, milestones, nextBestActions } from '../lib/learning-experience.mjs';
import { buildHistory, historySummary } from '../lib/learner-history.mjs';

const PROGRAM = {
  skills: [
    { id: 'jsts', name: 'JavaScript / TypeScript' },
    { id: 'algo', name: 'Algorithmie' },
    { id: 'archi', name: 'Architecture' },
    { id: 'secu', name: 'Sécurité' },
  ],
  days: [{ day: 1, skill: 'jsts' }, { day: 2, skill: 'algo' }, { day: 3, skill: 'archi' }],
};

/** Construit une preuve par le MODÈLE, jamais à la main. */
function ev(o, now) {
  const r = makeEvidence({
    provenance: { producer: 'test', method: 'stub', note: 'scénario' },
    ...o,
  }, { now });
  assert.ok(r.ok, r.error);
  return r.evidence;
}

// jsts : deux réussites, sources et jours distincts   → Consolidée
// algo : une réussite                                  → Démontrée
// archi : une trace sans validation                    → Pratiquée
// secu : rien                                          → Non évaluée
const EVIDENCE = [
  ev({ sourceType: 'exercise', sourceId: 'js-loops', competencyIds: ['javascript'], dayId: 1,
       title: 'Boucles', validation: { status: 'passed', kind: 'exercise-tests', detail: 'tous les tests passent' } },
     '2026-08-01T09:00:00.000Z'),
  ev({ sourceType: 'assessment', sourceId: 'diag-js', competencyIds: ['jsts'],
       title: 'Diagnostic JS', validation: { status: 'passed', kind: 'assessment-grade', detail: '5/5' } },
     '2026-08-03T09:00:00.000Z'),
  ev({ sourceType: 'exercise', sourceId: 'fizzbuzz', competencyIds: ['algo'], dayId: 2,
       title: 'FizzBuzz', validation: { status: 'passed', kind: 'exercise-tests', detail: 'tous les tests passent' } },
     '2026-08-02T09:00:00.000Z'),
  ev({ sourceType: 'submission', sourceId: 'sub-archi-1', competencyIds: ['archi'], dayId: 3,
       title: 'Note d’architecture' },
     '2026-08-04T09:00:00.000Z'),
  ev({ sourceType: 'exercise', sourceId: 'sec-secret', competencyIds: ['secu'], dayId: 5,
       title: 'Secret vs config', validation: { status: 'failed', kind: 'exercise-tests', detail: '1 test sur 4' } },
     '2026-08-05T09:00:00.000Z'),
];

const PROGRESS = {
  days: {
    1: { status: 'done', session: { state: 'completed', startedAt: '2026-08-01T08:00:00.000Z', completedAt: '2026-08-01T10:00:00.000Z' } },
    2: { status: 'done', session: { state: 'completed', startedAt: '2026-08-02T08:00:00.000Z', completedAt: '2026-08-02T10:00:00.000Z' } },
    3: { status: 'in-progress', session: { state: 'active', startedAt: '2026-08-04T08:00:00.000Z' } },
  },
  evidence: EVIDENCE,
};

const ledger = () => createLedger(PROGRESS.evidence);
const project = () => projectCompetencies(PROGRAM.skills, ledger());
const byId = () => new Map(project().map((c) => [c.competencyId, c]));

// ── 1 à 4 : l'état projeté est CELUI-LÀ, sur toutes les surfaces ──────────

test('S1 — la projection donne les quatre états attendus', () => {
  const m = byId();
  assert.equal(m.get('jsts').state, 'reinforced');
  assert.equal(m.get('algo').state, 'demonstrated');
  assert.equal(m.get('archi').state, 'practiced');
  assert.equal(m.get('secu').state, 'practiced', 'un échec est une trace, pas une absence');
});

test('S2 — une étiquette FINE est projetée sur la compétence programme', () => {
  // La première preuve porte « javascript » ; elle doit créditer « jsts ».
  const m = byId();
  assert.ok(m.get('jsts').evidenceCount >= 2, 'la preuve fine a bien été projetée');
  assert.deepEqual(EVIDENCE[0].competencyIds, ['jsts'], 'makeEvidence projette à la construction');
});

test('S3 — décompte de preuves : enregistrements, jamais somme de crédits', () => {
  const all = ledger().all();
  const qualifying = all.filter(isQualifying);
  assert.equal(all.length, 5);
  assert.equal(qualifying.length, 3);
  // La somme des crédits par compétence peut être plus grande. Elle ne doit
  // jamais être confondue avec le décompte ci-dessus (P0-2 du CP0).
  const credits = project().reduce((n, c) => n + c.qualifyingEvidenceCount, 0);
  assert.equal(credits, 3);
  assert.ok(credits <= all.length);
});

test('S4 — la chronologie de la Synthèse EST le ledger', () => {
  const tl = evidenceTimeline(PROGRESS, PROGRAM, { limit: 1000 });
  assert.equal(tl.length, ledger().size);
  const ids = new Set(ledger().all().map((e) => e.id));
  for (const t of tl) assert.ok(ids.has(t.id), `preuve hors ledger : ${t.id}`);
});

// ── 5 à 8 : même vocabulaire, mêmes libellés ──────────────────────────────

test('S5 — la chronologie ne parle QUE le vocabulaire du programme', () => {
  const known = new Set(PROGRAM.skills.map((s) => s.id));
  for (const t of evidenceTimeline(PROGRESS, PROGRAM, { limit: 1000 })) {
    for (const s of t.skills) assert.ok(known.has(s), `étiquette hors programme : ${s}`);
  }
});

test('S6 — l’historique ne parle QUE le vocabulaire du programme', () => {
  const known = new Set(PROGRAM.skills.map((s) => s.id));
  for (const e of buildHistory(PROGRESS)) {
    for (const s of e.competencyIds ?? []) assert.ok(known.has(s), `étiquette hors programme : ${s}`);
  }
});

test('S7 — chaque état canonique a un libellé français, et un seul', () => {
  const labels = COMPETENCY_STATES.map((s) => COMPETENCY_STATE_LABEL[s]);
  assert.equal(new Set(labels).size, labels.length, 'deux états ne peuvent pas porter le même mot');
  for (const l of labels) assert.ok(l && !/^[a-z-]+$/.test(l), `libellé non français : ${l}`);
});

test('S8 — aucun identifiant d’état anglais dans un texte produit par le moteur', () => {
  const texts = [];
  for (const c of project()) {
    const why = whyCompetencyState(c, ledger());
    texts.push(why.rule, why.stateLabel, ...why.facts, ...why.needsReviewReasons);
    const a = nextActionForCompetency(c);
    if (a) texts.push(a.action, a.reason, a.goal, a.expectedEvidence, a.cta);
  }
  const blob = texts.join(' ').toLowerCase();
  for (const st of [...COMPETENCY_STATES, 'not-started', 'discovered', 'to-consolidate']) {
    assert.ok(!new RegExp(`\\b${st}\\b`).test(blob), `identifiant visible : ${st}`);
  }
});

// ── 9 à 12 : les actions ne contredisent jamais l'état ────────────────────

test('S9 — aucune action ne demande de démontrer une compétence consolidée', () => {
  const m = byId();
  for (const a of nextBestActions(PROGRAM, PROGRESS, { reviews: [], limit: 20 })) {
    if (!a.competencyId) continue;
    const c = m.get(a.competencyId);
    if (a.kind === 'demonstrate') assert.equal(c.state, 'practiced', `« ${a.action} » sur un état ${c.state}`);
    if (a.kind === 'practice') assert.equal(c.state, 'unassessed');
  }
});

test('S10 — une compétence consolidée n’appelle aucune action inventée', () => {
  const jsts = byId().get('jsts');
  assert.equal(jsts.needsReview, false, 'préalable du scénario');
  assert.equal(nextActionForCompetency(jsts), null);
});

test('S11 — chaque action porte une raison, une preuve attendue et un libellé de bouton', () => {
  for (const c of project()) {
    const a = nextActionForCompetency(c);
    if (!a) continue;
    for (const k of ['action', 'reason', 'goal', 'expectedEvidence', 'href', 'cta']) {
      assert.ok(a[k] && String(a[k]).trim().length > 0, `${c.competencyId} : ${k} vide`);
    }
    assert.ok(a.href.startsWith('/'), 'lien actionnable');
    assert.notEqual(a.cta, a.goal, 'un bouton dit une destination, pas une intention');
  }
});

test('S12 — le jalon « première démonstration » est daté par la preuve, pas par la dernière activité', () => {
  const first = milestones(PROGRAM, PROGRESS).find((m) => m.id === 'first-skill-demonstrated');
  assert.equal(first.achieved, true);
  assert.equal(first.achievedAt, '2026-08-01T09:00:00.000Z');
});

// ── 13 à 15 : intégrité du ledger ─────────────────────────────────────────

test('S13 — le jalon multi-domaines compte des COMPÉTENCES, pas des étiquettes', () => {
  const m = milestones(PROGRAM, PROGRESS).find((x) => x.id === 'multi-domain');
  const covered = project().filter((c) => c.qualifyingEvidenceCount > 0).length;
  assert.equal(covered, 2, 'jsts et algo');
  assert.ok(m.why.includes('2'), `« ${m.why} » ne cite pas le bon décompte`);
});

test('S14 — une même preuve métier ne peut pas être créditée deux fois', () => {
  // CE QUE SEULE LA CLÉ MÉTIER ATTRAPE : le même fait, sous un AUTRE
  // identifiant. Le premier essai de ce test passait encore après avoir cassé
  // la clé, parce qu'une seconde garde dédoublonnait par `id` et que les deux
  // preuves partageaient le même identifiant déterministe — exactement le trou
  // trouvé au CP2 de V65. Un test négatif qui reste vert parce qu'un AUTRE
  // mécanisme protège l'invariant ne prouve rien sur la règle visée.
  const same = ev({
    id: 'ev-importe-dun-autre-appareil',
    sourceType: 'exercise', sourceId: 'fizzbuzz', competencyIds: ['algo'], dayId: 2,
    title: 'FizzBuzz (rejoué)',
    validation: { status: 'passed', kind: 'exercise-tests', detail: 'tous les tests passent' },
  }, '2026-08-09T09:00:00.000Z');
  assert.notEqual(same.id, EVIDENCE[2].id, 'identifiants différents : la garde par id ne peut rien');
  assert.equal(evidenceKey(same), evidenceKey(EVIDENCE[2]), 'même fait métier, même clé');
  const r = appendEvidence(EVIDENCE, same);
  assert.equal(r.added, false);
  assert.equal(r.reason, 'DUPLICATE', 'refusée par la clé métier, pas par l’id');
  assert.equal(r.evidence.length, EVIDENCE.length);
});

test('S14b — une réussite APRÈS un échec sur la même source est bien enregistrée', () => {
  // Régression P0 mesurée sur la fixture : journée 7, `linux-path-traversal-x`
  // échoué puis validé — le ledger ne gardait QUE l'échec. La garde par `id`
  // rejetait la réussite parce que l'identifiant déterministe ignorait le
  // caractère qualifiant que la clé métier, elle, distinguait.
  const failed = ev({
    sourceType: 'exercise', sourceId: 'retry-me', competencyIds: ['algo'],
    title: 'Tentative', validation: { status: 'failed', kind: 'exercise-tests', detail: '1/4' },
  }, '2026-08-10T09:00:00.000Z');
  const passed = ev({
    sourceType: 'exercise', sourceId: 'retry-me', competencyIds: ['algo'],
    title: 'Tentative validée', validation: { status: 'passed', kind: 'exercise-tests', detail: '4/4' },
  }, '2026-08-10T10:00:00.000Z');

  assert.notEqual(failed.id, passed.id, 'un échec et une réussite ne sont pas le même fait');
  const a = appendEvidence([], failed);
  assert.equal(a.added, true);
  const b = appendEvidence(a.evidence, passed);
  assert.equal(b.added, true, 'la réussite doit entrer au ledger');

  const c = projectCompetencies([{ id: 'algo', name: 'Algorithmie' }], createLedger(b.evidence))[0];
  assert.equal(c.qualifyingEvidenceCount, 1);
  assert.equal(c.evidenceCount, 2);
  assert.equal(c.state, 'demonstrated');
});

test('S15 — la projection est reconstructible et déterministe', () => {
  const a = JSON.stringify(project());
  const b = JSON.stringify(project());
  assert.equal(a, b, 'deux projections identiques');

  // On efface tout champ dérivé de la progression et on rejoue : seul le
  // ledger doit suffire.
  const stripped = { evidence: PROGRESS.evidence };
  const c = JSON.stringify(projectCompetencies(PROGRAM.skills, createLedger(stripped.evidence)));
  assert.equal(a, c, 'la projection ne dépend que des preuves');

  // Et le résumé d'historique reste cohérent avec le ledger.
  const s = historySummary(buildHistory(PROGRESS));
  assert.equal(s.byType.EVIDENCE_CREATED, PROGRESS.evidence.length);
});
