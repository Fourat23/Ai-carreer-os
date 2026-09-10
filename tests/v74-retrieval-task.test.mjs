// V74 · CP5 — les archétypes de rappel : rien n'est inventé, tout cite une section réelle.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { ARCHETYPES, archetypesDisponibles, tachePour, couverture } from '../lib/retrieval-task.mjs';

const LECONS = readdirSync('curriculum/lessons').filter((f) => f.endsWith('.md')).map((f) => {
  const t = readFileSync(`curriculum/lessons/${f}`, 'utf8');
  return { id: f.slice(0, -3), titres: [...t.matchAll(/^## +(.+)$/gm)].map((m) => m[1]), aDuCode: /```/.test(t) };
});

test('V74 · CP5 — au moins dix archétypes, comme le brief l’exige', () => {
  assert.ok(ARCHETYPES.length >= 10, `${ARCHETYPES.length} archétypes`);
});

test('V74 · CP5 — chaque archétype déclare sa forme, ses exigences et où vérifier', () => {
  for (const a of ARCHETYPES) {
    assert.ok(a.id && a.titre && a.consigne && a.verifier, `${a.id} incomplet`);
    assert.ok(['free', 'cued', 'applied', 'discrim', 'generate'].includes(a.forme), `${a.id} : forme inconnue`);
    assert.ok(Array.isArray(a.exige) && a.exige.length > 0, `${a.id} n'exige aucune section`);
    assert.ok(Number.isInteger(a.minutes) && a.minutes > 0);
  }
});

test('V74 · CP5 — les cinq formes de V66 sont toutes réalisées par au moins un archétype', () => {
  const formes = new Set(ARCHETYPES.map((a) => a.forme));
  assert.deepEqual([...formes].sort(), ['applied', 'cued', 'discrim', 'free', 'generate']);
});

// ── la règle absolue : ne rien inventer ───────────────────────────────────

test('V74 · CP5 — une leçon sans la section exigée ne produit PAS l’archétype', () => {
  // Aucune section : aucun archétype. On préfère l'absence à l'invention.
  assert.equal(archetypesDisponibles([], false).length, 0);
  assert.equal(tachePour('free', [], false), null);
});

test('V74 · CP5 — un archétype exigeant du code n’est pas proposé sans bloc de code', () => {
  const titres = ['🌍 Le problème d’abord', '🧠 Modèle mental', 'Explication complète'];
  const sans = archetypesDisponibles(titres, false).map((a) => a.id);
  const avec = archetypesDisponibles(titres, true).map((a) => a.id);
  assert.ok(!sans.includes('PREDICT_BEFORE_RUN'));
  assert.ok(avec.includes('PREDICT_BEFORE_RUN'));
});

test('V74 · CP5 — le titre réel commence par un émoji, et la reconnaissance ne s’y trompe pas', () => {
  // C'est l'anomalie n° 6 : `/^objectif/i` ne reconnaissait pas « 🎯 Objectif »,
  // et FEYNMAN sortait disponible sur 0 leçon sur 128.
  const titres = ['🎯 Objectif', '📖 Vocabulaire'];
  assert.ok(archetypesDisponibles(titres, false).some((a) => a.id === 'FEYNMAN'));
});

// ── couverture RÉELLE sur le corpus, publiée telle quelle ─────────────────

test('V74 · CP5 — sur les 128 leçons réelles, chaque archétype a une couverture NON NULLE', () => {
  const c = couverture(LECONS);
  assert.equal(c.total, 128);
  for (const a of c.archetypes) {
    assert.ok(a.lecons > 0, `${a.id} n'est disponible sur aucune leçon — archétype creux`);
  }
});

test('V74 · CP5 — aucune leçon n’est privée de tout archétype', () => {
  assert.equal(couverture(LECONS).leconsSansAucunArchetype, 0);
});

test('V74 · CP5 — la couverture est publiée en NOMBRE, jamais arrondie', () => {
  const c = couverture(LECONS);
  // Deux archétypes sont volontairement rares : leur chiffre exact doit rester lisible.
  const dur = c.archetypes.find((a) => a.id === 'HARDER_IMPLEMENTATION');
  assert.ok(dur.lecons < 128 && dur.lecons > 0, 'un archétype rare reste rare, et on le dit');
});

// ── déterminisme ──────────────────────────────────────────────────────────

test('V74 · B2 — la tâche produite est déterministe', () => {
  const l = LECONS[0];
  assert.deepEqual(tachePour('free', l.titres, l.aDuCode), tachePour('free', l.titres, l.aDuCode));
});

test('V74 · CP5 — exclure un archétype déjà servi en propose un autre de la même forme', () => {
  const l = LECONS.find((x) => archetypesDisponibles(x.titres, x.aDuCode).filter((a) => a.forme === 'free').length >= 2);
  assert.ok(l, 'au moins une leçon porte deux archétypes de forme libre');
  const a1 = tachePour('free', l.titres, l.aDuCode);
  const a2 = tachePour('free', l.titres, l.aDuCode, { exclure: [a1.archetype] });
  assert.notEqual(a2.archetype, a1.archetype);
});

test('V74 · CP5 — aucune consigne ne prétend décrire la mémoire de l’apprenant', () => {
  for (const a of ARCHETYPES) {
    assert.doesNotMatch(a.consigne, /score|probabilit|m[ée]morisation de \d/i, `${a.id}`);
  }
});
