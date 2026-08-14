// CP2 (V41) — read-model Learning Experience PUR : explicabilité des états, priorité
// et complétude des next-best-actions (raison + preuve attendue), timeline dérivée,
// milestones fondés preuves, ABSENCE d'XP/progression inventée. Aucun I/O, aucun réseau.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  explainSkillState, nextBestActions, evidenceTimeline, milestones, experienceSummary,
  NEXT_ACTION_PRIORITIES,
} from '../lib/learning-experience.mjs';
import { SKILL_STATES } from '../lib/skill-state.mjs';

// Programme minimal : 4 compétences, chacune associée à des journées, pour piloter les états.
const program = {
  skills: [
    { id: 'http', name: 'HTTP / API' },
    { id: 'sql', name: 'SQL / Data' },
    { id: 'archi', name: 'Architecture' },
    { id: 'jsts', name: 'JavaScript / TypeScript' },
  ],
  days: [
    { day: 1, skill: 'http' }, { day: 2, skill: 'http' }, { day: 3, skill: 'http' }, // http : 3 jours → practiced
    { day: 4, skill: 'sql' },                                                        // sql : demonstrated via preuve
    { day: 5, skill: 'archi' },                                                      // archi : to-consolidate
    { day: 6, skill: 'jsts' },                                                       // jsts : discovered
  ],
};
const progress = {
  days: {
    1: { status: 'done', updatedAt: '2026-08-01T00:00:00.000Z' },
    2: { status: 'done', updatedAt: '2026-08-02T00:00:00.000Z' },
    3: { status: 'done', updatedAt: '2026-08-03T00:00:00.000Z' },
    4: { status: 'in-progress', evidence: [{ type: 'assessment', title: 'Diag SQL', skills: ['sql'], createdAt: '2026-08-05T00:00:00.000Z' }] },
    5: { status: 'to-review', updatedAt: '2026-08-06T00:00:00.000Z' },
    6: { status: 'in-progress', updatedAt: '2026-08-07T00:00:00.000Z' },
  },
};

test('explainSkillState : états ∈ SKILL_STATES, raisons cohérentes', () => {
  const stats = { http: null, sql: null, archi: null, jsts: null };
  // Dérive via skillStats indirectement : on construit un stat minimal par état attendu.
  const demo = explainSkillState({ id: 'sql', name: 'SQL', state: 'demonstrated', daysDone: 1, evidenceCount: 1 });
  assert.ok(SKILL_STATES.includes(demo.state));
  assert.ok(demo.reasons.some((r) => /preuve/.test(r)), 'demonstrated mentionne une preuve');
  assert.ok(demo.nextAction, 'demonstrated a une action d\'entretien');

  const cons = explainSkillState({ id: 'archi', name: 'Archi', state: 'to-consolidate', daysDone: 1, evidenceCount: 0 });
  assert.equal(cons.toConsolidate, true);
  assert.ok(cons.reasons.some((r) => /révision/.test(r)));
  assert.equal(cons.nextAction.href, '/revisions');

  const none = explainSkillState({ id: 'x', name: 'X', state: 'not-started', daysDone: 0, evidenceCount: 0 });
  assert.ok(none.reasons.some((r) => /aucune activité/.test(r)));

  const prac = explainSkillState({ id: 'http', name: 'HTTP', state: 'practiced', daysDone: 3, evidenceCount: 0 });
  assert.equal(prac.nextAction.goal, 'practiced → demonstrated');
  assert.ok(/diagnostic|capstone/.test(prac.nextAction.expectedEvidence));
});

test('nextBestActions : priorité respectée, chaque action a raison + preuve attendue', () => {
  const actions = nextBestActions(program, progress, { now: new Date('2026-08-10T00:00:00Z') });
  assert.ok(actions.length > 0);
  // ordre : les kinds apparaissent selon NEXT_ACTION_PRIORITIES
  const idx = actions.map((a) => NEXT_ACTION_PRIORITIES.indexOf(a.kind));
  for (let i = 1; i < idx.length; i++) assert.ok(idx[i] >= idx[i - 1], 'actions ordonnées par priorité');
  for (const a of actions) {
    assert.ok(a.reason && a.reason.length > 0, `action « ${a.action} » sans raison`);
    assert.ok(a.expectedEvidence && a.expectedEvidence.length > 0, `action « ${a.action} » sans preuve attendue`);
    assert.ok(a.href && a.href.startsWith('/'), 'href actionnable');
  }
});

test('nextBestActions : consolidation (archi to-consolidate) priorisée avant practice (jsts)', () => {
  const actions = nextBestActions(program, progress, { now: new Date('2026-08-10T00:00:00Z') });
  const consIdx = actions.findIndex((a) => a.kind === 'consolidate');
  const pracIdx = actions.findIndex((a) => a.kind === 'practice');
  if (consIdx !== -1 && pracIdx !== -1) assert.ok(consIdx < pracIdx, 'consolidate avant practice');
});

test('evidenceTimeline : agrège et trie par date décroissante', () => {
  const tl = evidenceTimeline(progress, program);
  assert.equal(tl.length, 1);
  assert.equal(tl[0].type, 'assessment');
  assert.equal(tl[0].day, 4);
  const empty = evidenceTimeline({ days: {} }, program);
  assert.deepEqual(empty, []);
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
});

test('garde-fou anti-XP : aucune sortie ne contient xp/points/level/streak', () => {
  const blob = JSON.stringify({
    a: nextBestActions(program, progress),
    t: evidenceTimeline(progress, program),
    m: milestones(program, progress),
    s: experienceSummary(program, progress),
    e: explainSkillState({ id: 'http', name: 'HTTP', state: 'practiced', daysDone: 3, evidenceCount: 0 }),
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
