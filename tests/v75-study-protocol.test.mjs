// V75 · CP12 — INSTRUMENTATION D'UNE VALIDATION HUMAINE.
//
// ── CE QUE CES TESTS GARDENT AVANT TOUT ─────────────────────────────────
//
// **Que le produit ne prétende jamais avoir mesuré un apprentissage humain.**
// Le brief l'interdit (« ne pas prétendre exécuter une étude humaine sans
// participants ») et le §7 du contrat gelé le déclare depuis le CP1 :
// `REAL_HUMAN_LEARNING_EVIDENCE = NOT YET MEASURED`.
//
// Les autres garanties :
//   · le protocole a SEPT étapes, et l'ordre est le protocole ;
//   · le délai est une CONDITION, vérifiée sur les faits ;
//   · la durée est mesurée ou absente — jamais estimée ;
//   · les données d'étude n'entrent dans AUCUNE projection du produit ;
//   · ce qui n'est pas collecté est écrit, donc vérifiable.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  ETAPES, ISSUES, DELAI_MINIMAL_H, NON_COLLECTE, RAISON_DE_L_ETAPE,
  normalizeStudyEvent, studyEventKey, etatDeLEtude, lectureDe,
} from '../lib/study-protocol.mjs';
import { projectLearnerMemory } from '../lib/learner-memory.mjs';

const ROOT = process.cwd();
const lire = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');

const T0 = '2026-09-01T10:00:00.000Z';
const plus = (h) => new Date(Date.parse(T0) + h * 3600_000).toISOString();
const ev = (o = {}) => ({
  studySessionId: 's1', stage: 'PRETEST', conceptIds: ['a'], outcome: 'failure',
  provenance: { producer: 'study-runner', method: 'protocol' }, at: T0, ...o,
});

// ── LA GARANTIE PRINCIPALE ──────────────────────────────────────────────

test('V75 · CP12 — aucune conclusion n’est JAMAIS possible', () => {
  // Quel que soit l'état d'une session — vide, partielle, complète, avec un
  // délai suffisant — le module refuse de conclure. Ce champ n'est pas une
  // précaution de style : il évite qu'une surface ait à le déduire.
  const complet = ETAPES.map((stage, i) => ev({ stage, at: plus(i * 30) }));
  for (const events of [[], [ev()], complet]) {
    assert.equal(etatDeLEtude(events).conclusionPossible, false);
  }
});

test('V75 · CP12 — le protocole est écrit, il n’est pas exécuté', () => {
  const doc = lire('docs/v75/V75-HUMAN-LEARNING-PROTOCOL.md');
  assert.ok(doc, 'le protocole est introuvable');
  assert.match(doc, /NOT YET MEASURED/);
  assert.match(doc, /participants\s*\|\s*\*\*aucun\*\*/);
  assert.match(doc, /résultats\s*\|\s*\*\*aucun\*\*/);
  // Et il ne contient aucun résultat chiffré déguisé en mesure.
  assert.doesNotMatch(doc, /participants ont|nous avons mesuré|les résultats montrent/i);
});

test('V75 · CP12 — la lecture d’une session ne conclut jamais à un apprentissage', () => {
  const complet = ETAPES.map((stage, i) => ev({ stage, at: plus(i === 4 ? 48 : i) }));
  const phrase = lectureDe(etatDeLEtude(complet));
  assert.match(phrase, /une session n’est pas une étude/i);
  assert.ok(!/prouve|démontre|confirme que tu/i.test(phrase), `conclusion abusive : ${phrase}`);
  assert.match(lectureDe(etatDeLEtude([])), /il n’a pas été exécuté/);
});

// ── LES SEPT ÉTAPES ─────────────────────────────────────────────────────

test('V75 · CP12 — sept étapes, dans l’ordre du brief', () => {
  assert.deepEqual(ETAPES, [
    'PRETEST', 'LEARNING', 'IMMEDIATE_RETRIEVAL', 'DELAY',
    'DELAYED_RETRIEVAL', 'TRANSFER', 'CONFUSION_REPORT',
  ]);
});

test('V75 · CP12 — chaque étape déclare l’ambiguïté qu’elle lève', () => {
  // Une étape sans raison est une étape décorative, et la collecte
  // superflue est précisément ce que le brief interdit.
  for (const s of ETAPES) {
    assert.ok(RAISON_DE_L_ETAPE[s] && RAISON_DE_L_ETAPE[s].length > 20, `${s} sans raison`);
  }
});

test('V75 · CP12 — une étape inconnue est REFUSÉE, pas repliée', () => {
  assert.equal(normalizeStudyEvent(ev({ stage: 'FREESTYLE' }), { now: T0 }), null);
  assert.equal(normalizeStudyEvent(ev({ stage: '' }), { now: T0 }), null);
});

test('V75 · CP12 — l’étape suivante est celle qui manque', () => {
  const e = etatDeLEtude([ev({ stage: 'PRETEST' }), ev({ stage: 'LEARNING', at: plus(1) })]);
  assert.equal(e.prochaine, 'IMMEDIATE_RETRIEVAL');
  assert.equal(e.complete, false);
});

// ── LE DÉLAI EST UNE CONDITION, PAS UNE DÉCLARATION ─────────────────────

test('V75 · CP12 — le délai se mesure sur les FAITS', () => {
  const court = etatDeLEtude([
    ev({ stage: 'IMMEDIATE_RETRIEVAL', at: T0 }),
    ev({ stage: 'DELAYED_RETRIEVAL', at: plus(2) }),
  ]);
  assert.equal(court.delaiH, 2);
  assert.equal(court.delaiSuffisant, false);
  assert.match(lectureDe({ ...court, complete: true }), /mémoire de travail/);

  const long = etatDeLEtude([
    ev({ stage: 'IMMEDIATE_RETRIEVAL', at: T0 }),
    ev({ stage: 'DELAYED_RETRIEVAL', at: plus(30) }),
  ]);
  assert.equal(long.delaiSuffisant, true);
});

test('V75 · CP12 — sans les deux rappels, le délai est `null`, pas zéro', () => {
  const e = etatDeLEtude([ev({ stage: 'IMMEDIATE_RETRIEVAL' })]);
  assert.equal(e.delaiH, null);
  assert.equal(e.delaiSuffisant, null, 'zéro laisserait croire à un délai mesuré et nul');
});

test('V75 · CP12 — le seuil de délai est DÉCLARÉ, en un seul endroit', () => {
  assert.equal(DELAI_MINIMAL_H, 24);
});

// ── LA DURÉE : MESURÉE OU ABSENTE ───────────────────────────────────────

test('V75 · CP12 — une durée absurde n’est pas enregistrée', () => {
  // Une durée déduite du temps passé sur une page mesure surtout les onglets
  // laissés ouverts. `null` est une réponse.
  assert.equal(normalizeStudyEvent(ev({ durationMs: 9 * 3600 * 1000 }), { now: T0 }).durationMs, null);
  assert.equal(normalizeStudyEvent(ev({ durationMs: -5 }), { now: T0 }).durationMs, null);
  assert.equal(normalizeStudyEvent(ev({ durationMs: 'longtemps' }), { now: T0 }).durationMs, null);
  assert.equal(normalizeStudyEvent(ev({ durationMs: 120_000 }), { now: T0 }).durationMs, 120_000);
});

// ── LE CONTRAT DU CP2 S'APPLIQUE ICI AUSSI ──────────────────────────────

test('V75 · CP12 — provenance obligatoire, vocabulaire fermé, version', () => {
  assert.equal(normalizeStudyEvent(ev({ provenance: {} }), { now: T0 }), null);
  assert.equal(normalizeStudyEvent(ev({ studySessionId: '' }), { now: T0 }), null);
  const e = normalizeStudyEvent(ev({ outcome: 'formidable' }), { now: T0 });
  assert.ok(ISSUES.includes(e.outcome));
  assert.equal(e.outcome, 'skipped', 'une issue inconnue devient la plus neutre');
  assert.equal(e.schemaVersion, 2);
});

test('V75 · CP12 — cardinalité réelle des concepts, comme partout ailleurs', () => {
  const e = normalizeStudyEvent(ev({ conceptIds: ['a', 'b', 'a', ''] }), { now: T0 });
  assert.deepEqual(e.conceptIds, ['a', 'b']);
});

test('V75 · CP12 — clé métier : session + étape + seconde + concepts', () => {
  const a = normalizeStudyEvent(ev(), { now: T0 });
  const b = normalizeStudyEvent(ev(), { now: T0 });
  assert.equal(studyEventKey(a), studyEventKey(b));
  const autre = normalizeStudyEvent(ev({ stage: 'LEARNING' }), { now: T0 });
  assert.notEqual(studyEventKey(a), studyEventKey(autre));
});

test('V75 · CP12 — la projection est DÉTERMINISTE', () => {
  const events = ETAPES.map((stage, i) => ev({ stage, at: plus(i) }));
  assert.deepEqual(etatDeLEtude(events), etatDeLEtude([...events].reverse()));
});

// ── ISOLATION : L'OBSERVATION NE DOIT PAS MODIFIER CE QU'ELLE OBSERVE ───

test('V75 · CP12 — les données d’étude n’entrent dans AUCUNE projection', () => {
  // Le point le plus facile à perdre de vue : si l'étude nourrissait le moteur,
  // l'observation modifierait ce qu'elle observe et la mesure ne vaudrait rien.
  const avant = projectLearnerMemory({
    facts: { days: {} }, context: { conceptDays: { a: [1] }, conceptSkills: { a: ['http'] }, skills: ['http'] },
    now: T0,
  });
  const apres = projectLearnerMemory({
    facts: { days: {}, studyEvents: ETAPES.map((stage, i) => ev({ stage, at: plus(i) })) },
    context: { conceptDays: { a: [1] }, conceptSkills: { a: ['http'] }, skills: ['http'] },
    now: T0,
  });
  assert.deepEqual(apres, avant, 'un événement d’étude a modifié l’état d’apprentissage');
});

test('V75 · CP12 — aucun moteur du produit ne lit le protocole', () => {
  for (const f of ['lib/learner-memory.mjs', 'lib/backlog-triage.mjs', 'lib/recovery-mode.mjs',
    'lib/plan-unifie.mjs', 'lib/retention-scheduler.mjs']) {
    assert.doesNotMatch(lire(f), /study-protocol|studySessionId/,
      `${f} consomme des données d’étude : l’observation modifierait l’observé`);
  }
});

// ── CE QUI N'EST PAS COLLECTÉ, ÉCRIT POUR ÊTRE VÉRIFIÉ ──────────────────

test('V75 · CP12 — la liste des non-collectes est publiée et non vide', () => {
  assert.ok(NON_COLLECTE.length >= 5);
  const t = NON_COLLECTE.join(' ');
  for (const attendu of ['frappe', 'percentile', 'localisation', 'tiers']) {
    assert.ok(t.includes(attendu), `${attendu} devrait figurer parmi les non-collectes`);
  }
});

test('V75 · CP12 — le module ne collecte effectivement rien de tout cela', () => {
  const e = normalizeStudyEvent(ev({
    keystrokes: 412, scrollDepth: 0.8, userAgent: 'Mozilla', ip: '10.0.0.1',
    percentile: 82, cohorte: 'beta',
  }), { now: T0 });
  for (const interdit of ['keystrokes', 'scrollDepth', 'userAgent', 'ip', 'percentile', 'cohorte']) {
    assert.ok(!(interdit in e), `le fait a conservé ${interdit}`);
  }
});

test('V75 · CP12 — le module ne compare JAMAIS deux apprenants', () => {
  // Nuance trouvée en écrivant le test : `percentile` et `classement`
  // FIGURENT dans le module — mais dans `NON_COLLECTE`, c'est-à-dire dans la
  // déclaration de ce qu'il refuse d'enregistrer. Interdire le mot partout
  // reviendrait à interdire de nommer ce qu'on s'interdit. On vérifie donc
  // qu'il n'apparaît QUE là, et jamais dans la logique.
  const src = lire('lib/study-protocol.mjs');
  const sansCommentaires = src.split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
  const sansDeclaration = sansCommentaires.replace(/export const NON_COLLECTE[\s\S]*?\]\);/, '');
  assert.doesNotMatch(sansDeclaration, /percentile|cohort|moyenne des|classement|rang\b/i,
    'une comparaison entre apprenants est implémentée');
  // Et la déclaration, elle, doit bien les nommer.
  assert.match(src, /aucun percentile/);
});

// ── LE DOCUMENT DIT CE QU'IL DOIT DIRE ──────────────────────────────────

test('V75 · CP12 — hypothèses, métriques, biais et limites sont écrits', () => {
  const doc = lire('docs/v75/V75-HUMAN-LEARNING-PROTOCOL.md');
  for (const section of ['Hypothèses', 'Métriques', 'Biais et limites',
    'Ce qui n’est **pas** enregistré', 'comment le supprimer', 'opt-in']) {
    assert.ok(doc.includes(section) || doc.includes(section.replace('’', "'")),
      `section manquante : ${section}`);
  }
});

test('V75 · CP12 — le biais le plus lourd est nommé, pas noyé', () => {
  const doc = lire('docs/v75/V75-HUMAN-LEARNING-PROTOCOL.md');
  assert.match(doc, /absence de témoin/i);
  assert.match(doc, /apprennent \*\*avec\*\*[\s\S]{0,80}pas[\s\S]{0,40}\*\*grâce à\*\*/,
    'la limite causale doit être dite explicitement');
});

test('V75 · CP12 — le protocole dit ce qu’il ne pourra JAMAIS montrer', () => {
  const doc = lire('docs/v75/V75-HUMAN-LEARNING-PROTOCOL.md');
  assert.match(doc, /ne pourra jamais montrer/i);
  assert.match(doc, /causalité/i);
});
