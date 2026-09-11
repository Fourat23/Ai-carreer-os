// V75 · CP2 — le modèle événementiel V2.
//
// Ce que ces tests gardent avant tout : **aucune migration destructive**. Un
// fait écrit avant ce contrat doit continuer à être lu, et l'absence d'un
// champ récent ne doit jamais être confondue avec une faute — c'est le
// contournement G9 de V74 (« absence d'échec enregistré = absence d'échec »)
// appliqué aux métadonnées.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EVENT_SCHEMA_VERSION, GRAINS, ATTEMPT_OUTCOMES, FAITS,
  normalizeProvenance, normalizeEnvelope, normalizeDayAttempt, dayAttemptKey,
  normalizeWeeklyReview, dedupSorted,
} from '../lib/event-model.mjs';
import { recordAttempt, normalizeDay } from '../lib/learning.mjs';
import { applyCommand } from '../lib/learning-engine.mjs';

const NOW = '2026-09-01T10:00:00.000Z';

// ── LA PROVENANCE ────────────────────────────────────────────────────────

test('V75 · CP2 — un fait NOUVEAU sans producteur est REFUSÉ, jamais réparé', () => {
  assert.equal(normalizeProvenance({}, { legacy: false }), null);
  assert.equal(normalizeProvenance({ method: 'x' }, { legacy: false }), null);
  assert.equal(normalizeEnvelope({ at: NOW }, { now: NOW, legacy: false }), null);
});

test('V75 · CP2 — un fait ANCIEN sans producteur est LU, et marqué `legacy`', () => {
  // La distinction est le cœur du CP2 : refuser le nouveau mal formé, accepter
  // l'ancien en le rendant visible. Le marquer `legacy` plutôt que de laisser
  // le champ vide est ce qui empêche de le confondre avec un fait conforme.
  const e = normalizeEnvelope({ at: NOW }, { now: NOW, legacy: true });
  assert.ok(e);
  assert.equal(e.provenance.producer, 'legacy');
  assert.equal(e.schemaVersion, 1);
});

test('V75 · CP2 — un fait nouveau porte la version courante du schéma', () => {
  const e = normalizeEnvelope({ at: NOW, provenance: { producer: 'test' } }, { now: NOW });
  assert.equal(e.schemaVersion, EVENT_SCHEMA_VERSION);
  assert.ok(EVENT_SCHEMA_VERSION >= 2);
});

test('V75 · CP2 — l’horodatage vient du SERVEUR, jamais du client', () => {
  // `now` est injecté par l'appelant serveur. Un fait sans `at` ni `now` n'a
  // pas de date : il est refusé plutôt que daté d'aujourd'hui par défaut.
  assert.equal(normalizeEnvelope({ provenance: { producer: 't' } }, { now: null }), null);
});

// ── D3 — `DayAttempt` TYPÉ ───────────────────────────────────────────────

test('V75 · CP2 · D3 — le vocabulaire d’issue est FERMÉ', () => {
  const a = normalizeDayAttempt({ outcome: 'nimporte-quoi', provenance: { producer: 't' } }, { now: NOW });
  assert.equal(a.outcome, 'attempted', 'une issue inconnue doit retomber sur la plus neutre');
  for (const o of ATTEMPT_OUTCOMES) {
    assert.equal(normalizeDayAttempt({ outcome: o, provenance: { producer: 't' } }, { now: NOW }).outcome, o);
  }
});

test('V75 · CP2 · D3 — la tentative de journée a désormais une clé métier', () => {
  const base = { day: 12, at: NOW, outcome: 'success', provenance: { producer: 't' } };
  const a = normalizeDayAttempt(base, { now: NOW });
  const b = normalizeDayAttempt({ ...base, at: '2026-09-01T10:00:00.999Z' }, { now: NOW });
  assert.equal(dayAttemptKey(a), dayAttemptKey(b), 'un rejeu à la même seconde est le même fait');
  const c = normalizeDayAttempt({ ...base, outcome: 'failure' }, { now: NOW });
  assert.notEqual(dayAttemptKey(a), dayAttemptKey(c), 'deux issues différentes sont deux faits');
});

test('V75 · CP2 · D3 — `recordAttempt` écrit provenance et version, sans casser la forme', () => {
  const d = recordAttempt(normalizeDay({}), { at: NOW, outcome: 'success', summary: 'ok' });
  const e = d.attempts.history.at(-1);
  assert.equal(d.attempts.count, 1);
  assert.equal(e.at, NOW);
  assert.equal(e.outcome, 'success');
  assert.equal(e.summary, 'ok');
  assert.ok(e.provenance && typeof e.provenance.producer === 'string');
  assert.ok(Number.isInteger(e.schemaVersion));
});

test('V75 · CP2 · D3 — AUCUNE MIGRATION DESTRUCTIVE : une entrée ancienne survit', () => {
  // Forme telle qu'elle existait avant V75 : ni provenance, ni version.
  const ancien = { attempts: { count: 1, lastAt: NOW, history: [{ at: NOW, outcome: 'attempted', summary: 'vieux' }] } };
  const d = normalizeDay(ancien);
  const e = d.attempts.history[0];
  assert.equal(e.at, NOW, 'la date ancienne est conservée');
  assert.equal(e.summary, 'vieux', 'le contenu ancien est conservé');
  assert.equal(e.provenance.producer, 'legacy', 'l’absence de provenance est NOMMÉE, pas masquée');
  assert.equal(e.schemaVersion, 1, 'un fait sans version est lu comme v1');
});

// ── D6 — `WeeklyReview` HORODATÉE ────────────────────────────────────────

test('V75 · CP2 · D6 — une revue hebdomadaire porte enfin une date et une provenance', () => {
  const r = applyCommand(
    { days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {}, evidence: [], recallAttempts: [], exerciseAttempts: [] },
    { type: 'SET_WEEKLY_REVIEW', week: '7', patch: { done: true, note: 'fait', score: 4 } },
    { now: new Date(NOW) },
  );
  assert.ok(r.ok, r.error);
  const w = r.progress.weeklyReviews['7'];
  assert.equal(w.done, true);
  assert.equal(w.note, 'fait');
  assert.ok(w.at, 'la revue doit être horodatée');
  assert.ok(w.provenance && w.provenance.producer, 'la revue doit porter sa provenance');
  assert.equal(w.schemaVersion, EVENT_SCHEMA_VERSION);
});

test('V75 · CP2 · D6 — le score reste une AUTO-ÉVALUATION, nommée comme telle', () => {
  const w = normalizeWeeklyReview({ score: 4, provenance: { producer: 'learner' }, at: NOW }, { now: NOW, legacy: false });
  assert.equal(w.scoreDeclare, 4, 'la valeur déclarée est conservée');
  // Et elle reste bornée comme avant : V75 n'invente aucun barème.
  assert.equal(normalizeWeeklyReview({ score: 99 }, { now: NOW }).scoreDeclare, 5);
  assert.equal(normalizeWeeklyReview({ score: -3 }, { now: NOW }).scoreDeclare, 0);
});

test('V75 · CP2 · D6 — compatibilité : l’ancien champ `score` reste écrit', () => {
  const r = applyCommand(
    { days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {}, evidence: [], recallAttempts: [], exerciseAttempts: [] },
    { type: 'SET_WEEKLY_REVIEW', week: '3', patch: { score: 2 } },
    { now: new Date(NOW) },
  );
  assert.equal(r.progress.weeklyReviews['3'].score, 2, 'un lecteur ancien doit continuer à trouver `score`');
  assert.equal(r.progress.weeklyReviews['3'].scoreDeclare, 2);
});

test('V75 · CP2 · D6 — une revue ANCIENNE, sans date, reste lisible', () => {
  const w = normalizeWeeklyReview({ done: true, note: 'ancienne', score: 3 }, { now: null, legacy: true });
  assert.equal(w.done, true);
  assert.equal(w.note, 'ancienne');
  assert.equal(w.scoreDeclare, 3);
  assert.equal(w.at, null, 'sans date, on n’en invente pas une');
  assert.equal(w.provenance.producer, 'legacy');
});

// ── DÉDUPLICATION ET DÉTERMINISME ────────────────────────────────────────

test('V75 · CP2 — la déduplication trie à la LECTURE : l’ordre d’écriture n’a aucun effet', () => {
  const a = { at: '2026-01-02T00:00:00.000Z', id: 'b' };
  const b = { at: '2026-01-01T00:00:00.000Z', id: 'a' };
  const k = (x) => x.id;
  assert.deepEqual(dedupSorted([a, b], k), dedupSorted([b, a], k));
  assert.equal(dedupSorted([a, b], k)[0].id, 'a');
  assert.equal(dedupSorted([a, b, a], k).length, 2);
});

// ── L'INVENTAIRE ─────────────────────────────────────────────────────────

test('V75 · CP2 — tout grain déclaré par un fait est un grain connu', () => {
  for (const f of FAITS) assert.ok(GRAINS.includes(f.grain), `${f.nom} : grain « ${f.grain} » inconnu`);
});

test('V75 · CP2 — tous les faits exigent une provenance et une clé', () => {
  for (const f of FAITS) {
    assert.equal(f.provenance, true, `${f.nom} sans provenance`);
    assert.equal(f.cle, true, `${f.nom} sans clé métier`);
    assert.equal(f.horodate, true, `${f.nom} sans horodatage`);
  }
});
