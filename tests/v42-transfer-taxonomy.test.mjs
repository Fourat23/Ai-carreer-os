// CP2 (V42) — taxonomie de distance de transfert : niveaux, mapping Bloom→T,
// classifieur CONSERVATEUR (ne promeut jamais en T5 sans pont + cross-domain +
// multi-étapes). PUR.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  TRANSFER_LEVELS, TRANSFER_LABEL, BLOOM_TO_TRANSFER, TRANSFER_RUBRIC,
  isTransferLevel, maxLevel, suggestTransferLevel, transferLevelSummary,
} from '../lib/transfer-taxonomy.mjs';

test('niveaux et libellés exposés', () => {
  assert.deepEqual([...TRANSFER_LEVELS], ['T0', 'T1', 'T2', 'T3', 'T4', 'T5']);
  assert.equal(TRANSFER_LABEL.T5, 'Deep / Far transfer');
  assert.equal(BLOOM_TO_TRANSFER.TRANSFER, 'T4');
  assert.equal(TRANSFER_RUBRIC.length, 10);
});

test('isTransferLevel / maxLevel', () => {
  assert.equal(isTransferLevel('T4'), true);
  assert.equal(isTransferLevel('X'), false);
  assert.equal(maxLevel('T2', 'T5'), 'T5');
  assert.equal(maxLevel('T4', 'T3'), 'T4');
});

test('classifieur : mcq simple sans pont reste borné (≤ T3)', () => {
  const r = suggestTransferLevel({ kind: 'mcq', taxonomy: 'TRANSFER', options: ['a', 'b'] }, {});
  assert.ok(['T2', 'T3'].includes(r.level), `attendu ≤ T3, obtenu ${r.level}`);
  assert.equal(r.canBeT5, false);
});

test('classifieur : near transfer (T4) avec pont + cross-domain + multi-étapes', () => {
  const r = suggestTransferLevel(
    { kind: 'multi', taxonomy: 'APPLICATION', options: ['a', 'b', 'c', 'd'] },
    { bridge: 'idempotence HTTP → consumer de file', crossDomain: true, steps: 2 },
  );
  assert.ok(['T4', 'T5'].includes(r.level));
});

test('classifieur : T5 REFUSÉ sans pont', () => {
  const r = suggestTransferLevel(
    { kind: 'multi', taxonomy: 'TRANSFER', options: ['a', 'b', 'c', 'd'] },
    { crossDomain: true, steps: 3 },
  );
  assert.equal(r.canBeT5, false);
  assert.ok(r.reasons.some((x) => /pont manquant/.test(x)));
});

test('classifieur : T5 REFUSÉ sans changement de domaine', () => {
  const r = suggestTransferLevel(
    { kind: 'multi', taxonomy: 'TRANSFER', options: ['a', 'b', 'c', 'd'] },
    { bridge: 'un pont conceptuel réel et détaillé', crossDomain: false, steps: 3 },
  );
  assert.equal(r.canBeT5, false);
  assert.ok(r.reasons.some((x) => /même domaine/.test(x)));
});

test('classifieur : T5 défendable avec pont + cross-domain + multi-étapes + discrimination', () => {
  const r = suggestTransferLevel(
    { kind: 'multi', taxonomy: 'TRANSFER', options: ['a', 'b', 'c', 'd'] },
    { bridge: 'idempotence HTTP → consumer de file : rejouer sans dommage', crossDomain: true, steps: 3 },
  );
  assert.equal(r.canBeT5, true);
  assert.equal(r.level, 'T5');
});

test('transferLevelSummary compte par niveau', () => {
  const s = transferLevelSummary(['T4', 'T4', 'T5', 'X']);
  assert.equal(s.T4, 2);
  assert.equal(s.T5, 1);
});
