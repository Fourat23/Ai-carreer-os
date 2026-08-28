// CP2 (V41) — read-model Learning Experience PUR : priorité et complétude des
// next-best-actions (raison + preuve attendue), timeline dérivée, milestones
// fondés sur des preuves, ABSENCE d'XP/progression inventée. Aucun I/O, aucun réseau.
//
// V65.1 · CP2 — RÉÉCRIT SUR LE MODÈLE CANONIQUE.
//
// Les assertions ci-dessous portaient sur `skill-state.mjs`, supprimé. Ce
// modèle faisait « 3 journées terminées → pratiquée » et « ≥ 1 preuve
// quelconque → démontrée » : terminer des journées suffisait à faire progresser
// une compétence, et une note personnelle valait démonstration. Les invariants
// 9, 10 et 11 de V65.1 l'interdisent, et le CP0 a mesuré ce que ça produisait :
// 20 compétences sur 20 divergentes entre le Dashboard et /skills.
//
// Les données stub portent donc désormais des PREUVES CANONIQUES, et
// `explainSkillState` a disparu au profit de `whyCompetencyState`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  nextBestActions, evidenceTimeline, milestones, experienceSummary,
  NEXT_ACTION_PRIORITIES,
} from '../lib/learning-experience.mjs';
import { COMPETENCY_STATES, createLedger, projectCompetencies } from '../lib/competency.mjs';

const program = {
  skills: [
    { id: 'http', name: 'HTTP / API' },
    { id: 'sql', name: 'SQL / Data' },
    { id: 'archi', name: 'Architecture' },
    { id: 'jsts', name: 'JavaScript / TypeScript' },
  ],
  days: [
    { day: 1, skill: 'http' }, { day: 2, skill: 'http' }, { day: 3, skill: 'http' },
    { day: 4, skill: 'sql' }, { day: 5, skill: 'archi' }, { day: 6, skill: 'jsts' },
  ],
};

// Une preuve par situation à couvrir :
//   sql   → validation réussie                   → Démontrée
//   archi → trace sans validation                → Pratiquée
//   http  → 3 journées terminées, AUCUNE preuve  → Non évaluée  (le point clé)
//   jsts  → rien                                 → Non évaluée
const ev = (o) => ({
  competencyIds: [], validation: null,
  provenance: { producer: 'test', method: 'stub', note: 'stub' },
  ...o,
});
const progress = {
  days: {
    1: { status: 'done', updatedAt: '2026-08-01T00:00:00.000Z' },
    2: { status: 'done', updatedAt: '2026-08-02T00:00:00.000Z' },
    3: { status: 'done', updatedAt: '2026-08-03T00:00:00.000Z' },
    5: { status: 'to-review', updatedAt: '2026-08-06T00:00:00.000Z' },
    6: { status: 'in-progress', updatedAt: '2026-08-07T00:00:00.000Z' },
  },
  evidence: [
    ev({
      id: 'ev-sql-1', sourceType: 'assessment', sourceId: 'diag-sql', competencyIds: ['sql'],
      createdAt: '2026-08-05T00:00:00.000Z', title: 'Diag SQL', dayId: 4,
      validation: { status: 'passed', kind: 'assessment-grade', checkedAt: '2026-08-05T00:00:00.000Z', detail: '5/5' },
    }),
    ev({
      id: 'ev-archi-1', sourceType: 'submission', sourceId: 'sub-archi-1', competencyIds: ['archi'],
      createdAt: '2026-08-06T00:00:00.000Z', title: 'Note d’architecture', dayId: 5,
    }),
  ],
};

test('terminer des journées ne fait progresser AUCUNE compétence', () => {
  // http a trois journées terminées et zéro preuve. C'est exactement le cas que
  // l'ancien modèle appelait « Pratiquée ».
  const ledger = createLedger(progress.evidence);
  const http = projectCompetencies(program.skills, ledger).find((c) => c.competencyId === 'http');
  assert.equal(http.state, 'unassessed');
  assert.equal(http.evidenceCount, 0);
});

test('nextBestActions : priorité respectée, chaque action a raison + preuve attendue', () => {
  const actions = nextBestActions(program, progress, { now: new Date('2026-08-10T00:00:00Z') });
  assert.ok(actions.length > 0);
  const idx = actions.map((a) => NEXT_ACTION_PRIORITIES.indexOf(a.kind));
  for (let i = 1; i < idx.length; i++) assert.ok(idx[i] >= idx[i - 1], 'actions ordonnées par priorité');
  for (const a of actions) {
    assert.ok(a.reason && a.reason.length > 0, `action « ${a.action} » sans raison`);
    assert.ok(a.expectedEvidence && a.expectedEvidence.length > 0, `action « ${a.action} » sans preuve attendue`);
    assert.ok(a.href && a.href.startsWith('/'), 'href actionnable');
  }
});

test('nextBestActions : consolider avant démontrer, démontrer avant pratiquer', () => {
  const actions = nextBestActions(program, progress, { now: new Date('2026-08-10T00:00:00Z') });
  const rank = (k) => actions.findIndex((a) => a.kind === k);
  const [cons, demo, prac] = ['consolidate', 'demonstrate', 'practice'].map(rank);
  if (cons !== -1 && demo !== -1) assert.ok(cons < demo, 'consolidate avant demonstrate');
  if (demo !== -1 && prac !== -1) assert.ok(demo < prac, 'demonstrate avant practice');
});

test('nextBestActions : aucune action ne contredit l’état affiché', () => {
  // Régression P0 mesurée au CP0 : « Démontrer JavaScript / TypeScript —
  // pratiquée mais jamais démontrée » pour une compétence Consolidée.
  const actions = nextBestActions(program, progress, { now: new Date('2026-08-10T00:00:00Z') });
  const ledger = createLedger(progress.evidence);
  const byId = new Map(projectCompetencies(program.skills, ledger).map((c) => [c.competencyId, c]));
  for (const a of actions) {
    if (!a.competencyId) continue;
    const c = byId.get(a.competencyId);
    assert.ok(c, `action sur une compétence inconnue : ${a.competencyId}`);
    if (a.kind === 'demonstrate') assert.equal(c.state, 'practiced');
    if (a.kind === 'practice') assert.equal(c.state, 'unassessed');
    if (a.kind === 'consolidate' && !c.needsReview) assert.equal(c.state, 'demonstrated');
  }
});

test('evidenceTimeline : c’est LE LEDGER, trié par date décroissante', () => {
  const tl = evidenceTimeline(progress, program);
  assert.equal(tl.length, 2);
  assert.equal(tl[0].createdAt, '2026-08-06T00:00:00.000Z', 'la plus récente d’abord');
  assert.equal(tl[1].type, 'assessment');
  assert.equal(tl[1].day, 4);
  assert.equal(tl[1].qualifying, true);
  assert.equal(tl[0].qualifying, false, 'une soumission n’est pas qualifiante');
  assert.deepEqual(evidenceTimeline({ days: {}, evidence: [] }, program), []);
});

test('evidenceTimeline : parle le vocabulaire du PROGRAMME, pas les étiquettes fines', () => {
  const known = new Set(program.skills.map((s) => s.id));
  for (const e of evidenceTimeline(progress, program)) {
    for (const s of e.skills) assert.ok(known.has(s), `étiquette hors programme : ${s}`);
  }
});

test('milestones : fondés sur preuves réelles, achieved porte un why', () => {
  const ms = milestones(program, progress);
  const firstEv = ms.find((m) => m.id === 'first-evidence');
  assert.equal(firstEv.achieved, true);
  assert.ok(firstEv.why.length > 0 && firstEv.achievedAt, 'milestone atteint a why + date');

  const firstDiag = ms.find((m) => m.id === 'first-diagnostic');
  assert.equal(firstDiag.achieved, true);

  const firstCap = ms.find((m) => m.id === 'first-capstone');
  assert.equal(firstCap.achieved, false, 'aucun capstone → non atteint');
  assert.equal(firstCap.why, '');

  // Une seule compétence porte une preuve QUALIFIANTE : pas de multi-domaines.
  const multi = ms.find((m) => m.id === 'multi-domain');
  assert.equal(multi.achieved, false);
});

test('milestone « première démonstration » : daté par la preuve qui l’a produite', () => {
  const ms = milestones(program, progress);
  const first = ms.find((m) => m.id === 'first-skill-demonstrated');
  assert.equal(first.achieved, true);
  assert.equal(first.achievedAt, '2026-08-05T00:00:00.000Z', 'date de la première preuve qualifiante');
});

test('aucun état canonique ne fuit en clair dans un texte lisible', () => {
  const readable = [
    ...nextBestActions(program, progress).flatMap((a) => [a.action, a.reason, a.goal, a.expectedEvidence]),
    ...milestones(program, progress).map((m) => `${m.label} ${m.description} ${m.why}`),
  ].join(' ').toLowerCase();
  for (const st of COMPETENCY_STATES) {
    assert.ok(!new RegExp(`\\b${st}\\b`).test(readable), `identifiant d'état visible : ${st}`);
  }
});

test('garde-fou anti-XP : aucune sortie ne contient xp/points/level/streak', () => {
  const blob = JSON.stringify({
    a: nextBestActions(program, progress),
    t: evidenceTimeline(progress, program),
    m: milestones(program, progress),
    s: experienceSummary(program, progress),
  }).toLowerCase();
  for (const forbidden of ['"xp"', '"points"', '"level"', '"streak"', '"coins"']) {
    assert.ok(!blob.includes(forbidden), `champ interdit présent : ${forbidden}`);
  }
});

test('experienceSummary : compte les jalons, propose un prochain jalon', () => {
  const s = experienceSummary(program, progress, { now: new Date('2026-08-10T00:00:00Z') });
  assert.ok(s.milestonesTotal >= 5);
  assert.ok(s.milestonesAchieved >= 1);
  assert.ok(Array.isArray(s.actions));
});
