// V77.1 · CP3 — LE SCOPE DU PILOTE, CONFRONTÉ AU CORPUS RÉEL.
//
// Une fixture est un document jusqu'au jour où quelqu'un la vérifie contre le
// corpus. Ces tests lisent `data/pilot/v78-pilot-1.json` ET `data/program.json`,
// et refusent tout écart : une leçon absente, un exercice renommé, une forme de
// rappel que la leçon n'offre pas, un exercice que plusieurs leçons déclarent.
//
// Le dernier point est LA règle du CP3 : un exercice multi-déclarants n'est pas
// mal rangé — il est multi-concept par choix d'auteur (règle `R2`). Mais sa
// trace ne dirait pas quel concept a été pratiqué, et le protocole exige de
// pouvoir le lire dans l'export SEUL.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import {
  ETAPES_DU_PROTOCOLE, STAGES_DE_CONCEPT, FAITS_ATTENDUS,
  incoherencesDuScope, exercicesDuPilote, etapeDuProtocole,
} from '../lib/pilot-scope.mjs';
import { availableFormats } from '../lib/retention.mjs';

const CHEMIN = 'data/pilot/v78-pilot-1.json';
const VERSION = 'V78-PILOT-PROTOCOL-1';

const fixture = JSON.parse(readFileSync(CHEMIN, 'utf8'));
const program = JSON.parse(readFileSync('data/program.json', 'utf8'));
const lecons = program.lessons ?? [];

/** Le corpus réel, construit ici comme le liant serveur le construit. */
function corpusReel() {
  const declarants = new Map();
  for (const l of lecons) {
    for (const r of l.practiceRefs ?? []) {
      if (r.kind !== 'exercise') continue;
      if (!declarants.has(r.id)) declarants.set(r.id, []);
      declarants.get(r.id).push(l.slug);
    }
  }
  const formats = new Map();
  for (const l of lecons) {
    const md = `curriculum/lessons/${l.slug}.md`;
    const titres = existsSync(md)
      ? [...readFileSync(md, 'utf8').matchAll(/^## +(.+)$/gm)].map((m) => m[1])
      : [];
    formats.set(l.slug, availableFormats(titres));
  }
  const exercices = new Set();
  for (const ids of Object.values(JSON.parse(readFileSync('data/day-exercises.json', 'utf8')))) {
    for (const id of ids) exercices.add(id);
  }
  for (const l of lecons) for (const r of l.practiceRefs ?? []) if (r.kind === 'exercise') exercices.add(r.id);
  return { declarants, formats, exercices };
}

const reel = corpusReel();
const transfertsExistants = new Set(
  readdirSync('data/transfer-challenges')
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(`data/transfer-challenges/${f}`, 'utf8')).id),
);

const corpus = {
  lecons: new Set(lecons.map((l) => l.slug)),
  exercices: reel.exercices,
  transferts: transfertsExistants,
  declarantsDe: (id) => reel.declarants.get(id) ?? [],
  formatsDe: (slug) => reel.formats.get(slug) ?? [],
};

// ─────────────────────────────────────────────────────────────────────────────

test('CP3 — le scope gelé ne porte AUCUNE incohérence face au corpus réel', () => {
  const v = incoherencesDuScope(fixture, corpus, VERSION);
  assert.deepEqual(v, [], `incohérences :\n  ${v.join('\n  ')}`);
});

test('CP3 — la fixture porte la version de protocole gelée au CP1', () => {
  // Pinnée en clair : la dériver de la fixture rendrait ce test tautologique.
  assert.equal(fixture.protocolVersion, 'V78-PILOT-PROTOCOL-1');
  assert.equal(fixture.primaryOutcome, 'SESSION_TRACE_RECONSTRUCTABILITY');
  assert.equal(fixture.delayedRetrievalDelayHours, 24);
  assert.deepEqual(fixture.delayedRetrievalWindowHours, [18, 36]);
  assert.equal(fixture.partialAfterHours, 72);
});

test('CP3 — le scope compte 3 à 6 concepts, dont exactement UN focal', () => {
  assert.ok(fixture.concepts.length >= 3 && fixture.concepts.length <= 6, `${fixture.concepts.length} concepts`);
  assert.equal(fixture.concepts.filter((c) => c.stage === 'FOCAL').length, 1);
  for (const c of fixture.concepts) assert.ok(STAGES_DE_CONCEPT.includes(c.stage), c.stage);
});

test('CP3 — CHAQUE exercice du pilote a exactement UN déclarant, et c’est son concept', () => {
  const ex = exercicesDuPilote(fixture);
  assert.ok(ex.length >= 1);
  for (const e of ex) {
    const d = corpus.declarantsDe(e.exerciseId);
    assert.equal(d.length, 1, `${e.exerciseId} a ${d.length} déclarants`);
    assert.equal(d[0], e.conceptId);
    assert.match(e.regleDeResolution, /^R1 /);
  }
});

test('CP3 — chaque exercice du pilote porte une justification, pas une étiquette', () => {
  for (const e of exercicesDuPilote(fixture)) {
    assert.ok(e.justification.trim().length >= 40, `${e.exerciseId} : justification trop courte`);
  }
});

test('CP3 — les exercices écartés le sont parce qu’ils ont PLUSIEURS déclarants', () => {
  assert.ok(fixture.excludedExercises.length >= 1);
  for (const x of fixture.excludedExercises) {
    const d = corpus.declarantsDe(x.exerciseId);
    assert.ok(d.length > 1, `${x.exerciseId} n'a que ${d.length} déclarant(s) : l'écarter n'a pas de raison`);
    assert.deepEqual([...x.declarants].sort(), [...d].sort());
    assert.match(x.raison, /MULTI_CONCEPT_BY_DESIGN/);
  }
});

test('CP3 — aucun exercice n’est à la fois retenu et écarté', () => {
  const retenus = new Set(exercicesDuPilote(fixture).map((e) => e.exerciseId));
  for (const x of fixture.excludedExercises) assert.equal(retenus.has(x.exerciseId), false, x.exerciseId);
});

test('CP3 — les formes de rappel demandées existent vraiment dans la leçon', () => {
  for (const c of fixture.concepts) {
    if (!c.retrieval) continue;
    const dispo = corpus.formatsDe(c.conceptId);
    for (const f of c.retrieval.formats) {
      assert.ok(dispo.includes(f), `${c.conceptId} : « ${f} » absent de ${JSON.stringify(dispo)}`);
    }
  }
});

test('CP3 — les onze étapes du protocole figurent dans la fixture', () => {
  const ids = fixture.steps.map((s) => s.id);
  for (const e of ETAPES_DU_PROTOCOLE) {
    assert.ok(ids.some((id) => id === e || id.startsWith(`${e}_`)), `étape « ${e} » absente`);
  }
  // Et l'ordre est croissant : une étape qui recule n'est plus un protocole.
  const ns = fixture.steps.map((s) => s.n);
  assert.deepEqual(ns, [...ns].sort((a, b) => a - b));
});

test('CP3 — chaque étape qui attend un fait nomme un fait du produit', () => {
  const avecFait = fixture.steps.filter((s) => s.fait != null);
  assert.ok(avecFait.length >= 5);
  for (const s of avecFait) assert.ok(FAITS_ATTENDUS.includes(s.fait), `${s.id} → ${s.fait}`);
});

test('CP3 — les quatre étapes sans fait le disent, au lieu de rester muettes', () => {
  const sansFait = fixture.steps.filter((s) => s.fait === null).map((s) => s.id);
  assert.deepEqual(sansFait.sort(), ['CONFUSION_REPORT', 'LESSON', 'SESSION_EXPORT']);
});

test('CP3 — les étapes de rappel plafonnent à DECLARED : l’issue est auto-déclarée', () => {
  for (const id of ['PRETEST', 'PRETEST_FOCAL', 'IMMEDIATE_RETRIEVAL', 'DELAYED_RETRIEVAL']) {
    const e = etapeDuProtocole(fixture, id);
    assert.ok(e, `étape ${id} absente`);
    assert.equal(e.niveauDePreuveMax, 'DECLARED', `${id} prétend dépasser DECLARED`);
  }
  assert.match(JSON.stringify(fixture.pretestRules.limiteConnue), /DECLARED/);
});

test('CP3 — le transfert principal cite deux concepts du scope', () => {
  const t = fixture.transfers.find((x) => x.role === 'PRINCIPAL');
  assert.ok(t);
  assert.equal(transfertsExistants.has(t.id), true);
  const ids = new Set(fixture.concepts.map((c) => c.conceptId));
  for (const r of t.lessonRefs) assert.equal(ids.has(r), true, `${r} hors du scope`);
});

test('CP3 — le transfert du protocole est bien celui du concept focal', () => {
  const focal = fixture.concepts.find((c) => c.stage === 'FOCAL');
  const principal = fixture.transfers.find((x) => x.role === 'PRINCIPAL');
  assert.equal(focal.transfer, principal.id);
  assert.match(etapeDuProtocole(fixture, 'TRANSFER').surface, new RegExp(principal.id));
});

test('CP3 — les deux règles de PRETEST sont chiffrées, pas décrites', () => {
  const r = fixture.pretestRules;
  assert.match(r.PRETEST_HIGH.seuil, /2 sur 2/);
  assert.match(r.MISSING_PREREQUISITE.seuil, /0 sur 2/);
  assert.match(r.PRETEST_HIGH.decision, /repli/);
  assert.match(r.MISSING_PREREQUISITE.decision, /INVALID/);
  // Le plafond mène à INVALID, jamais à ABORTED : la distinction est gelée au CP1.
  assert.match(r.PRETEST_HIGH.siLeRepliPlafonneAussi, /INVALID/);
});

test('CP3 — le scope de repli existe vraiment dans le corpus', () => {
  const f = fixture.fallbackScope;
  assert.equal(corpus.lecons.has(f.conceptFocal), true);
  for (const id of f.exercices) {
    assert.equal(corpus.exercices.has(id), true, `${id} inexistant`);
    assert.equal(corpus.declarantsDe(id).length, 1, `${id} n'est pas exclusif`);
  }
  assert.equal(transfertsExistants.has(f.transfert), true);
  const dispo = corpus.formatsDe(f.conceptFocal);
  for (const fmt of f.formats) assert.ok(dispo.includes(fmt), fmt);
});

test('CP3 — le CP3 n’a résolu AUCUNE ambiguïté du corpus', () => {
  // `data/exercise-declarations.json` est livré vide depuis V77 · CP8. Le CP3
  // n'y a rien ajouté : il restreint le pilote, il ne tranche pas le curriculum.
  const decl = existsSync('data/exercise-declarations.json')
    ? readFileSync('data/exercise-declarations.json', 'utf8').trim()
    : '';
  assert.ok(decl === '' || decl === '{}' || decl === '[]', `déclarations ajoutées : ${decl.slice(0, 120)}`);
  assert.match(fixture.nonResolu.ambiguitesDuCorpus, /125/);
});

test('CP3 — la fixture est protégée de la suppression totale', async () => {
  const { REPERTOIRES_DU_PRODUIT, violationsDuPlan } = await import('../lib/learner-data.mjs');
  assert.ok(REPERTOIRES_DU_PRODUIT.includes('data/pilot'));
  const v = violationsDuPlan([{ id: 'progress', chemin: `${process.cwd()}/${CHEMIN}` }], process.cwd());
  assert.ok(v.length >= 1, 'la fixture du pilote serait supprimable');
});
