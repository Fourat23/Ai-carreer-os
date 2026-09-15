// V76 · CP11 — UNE RÉUSSITE, UNE PREUVE.
//
// ── LE DÉFAUT, ET POURQUOI IL N'ÉTAIT PAS COSMÉTIQUE ────────────────────
//
// Une réussite au laboratoire écrivait DEUX preuves au registre canonique :
//
//   · `exercise:<exerciseId>`      — par `recordExerciseSuccess` (V27) ;
//   · `exercise:lab-<exerciseId>`  — par la commande `SUBMIT` (V64).
//
// Le dédoublonnage ne pouvait pas les fusionner : leurs clés métier diffèrent
// légitimement. Le code l'annonçait d'ailleurs, dans un commentaire de
// V75 · CP4 — écrit, assumé, **et jamais mesuré**.
//
// Ce que le CP11 a mesuré : la règle de consolidation (`lib/competency.mjs`)
// promeut une compétence à `reinforced` quand elle voit **deux sources
// distinctes et deux dates distinctes**. Le commentaire de cette règle dit
// pourquoi : *« deux réussites le même jour sont une séance, pas un
// réancrage »*. « Deux sources » veut dire deux occasions différentes de
// démontrer la compétence.
//
// **Un seul exercice en fournissait deux.** Résolu deux jours de suite, il
// suffisait à faire passer une compétence à `reinforced` — un réancrage
// déclaré sans avoir eu lieu, exactement ce que V75 appelait un score fabriqué.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { applyCommand } from '../lib/learning-engine.mjs';
import { recordExerciseSuccess } from '../lib/lab-progress.mjs';
import { normalizeLedger, fusionnerPreuvesDeLaboratoire, makeEvidence } from '../lib/evidence.mjs';
import { competencyStateFrom, projectCompetency } from '../lib/competency.mjs';
import { collectContacts } from '../lib/learner-memory.mjs';

const ROOT = process.cwd();
const lire = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');

const EX = 'demo-exercice';
const SKILL = 'jsts';

/** Rejoue le chemin EXACT de la route : `recordExerciseSuccess` puis `SUBMIT`. */
function reussiteAuLaboratoire(progress, { at, canonicalSourceId }) {
  let p = recordExerciseSuccess(progress, {
    exerciseId: EX, title: 'Démo', skills: [SKILL], dayRefs: [1], at, conceptIds: ['c1'],
  });
  const r = applyCommand(p, {
    type: 'SUBMIT',
    day: 1,
    stepId: `lab-${EX}`,
    kind: 'exercise',
    content: 'Tous les tests passent.',
    validation: { status: 'passed', kind: 'exercise-tests', checkedAt: at, detail: '3/3 tests' },
    evidenceId: `lab-${EX}`,
    ...(canonicalSourceId ? { canonicalSourceId } : {}),
    evidenceTitle: 'Exercice réussi : Démo',
    evidenceUrl: `/lab/${EX}`,
    skills: [SKILL],
    conceptIds: ['c1'],
  }, { now: new Date(at) });
  if (r.ok) p = r.progress;
  return { progress: p, ok: r.ok, code: r.code };
}

const depart = (at) => {
  const r = applyCommand({ startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} },
    { type: 'START', day: 1 }, { now: new Date(at) });
  return r.ok ? r.progress : null;
};

const preuvesDe = (p) => (p.evidence ?? []).filter((e) => e.sourceId === EX || e.sourceId === `lab-${EX}`);

// ── 1 · UNE RÉUSSITE, UNE PREUVE ────────────────────────────────────────

test('V76 · CP11 — une réussite au laboratoire écrit UNE preuve, pas deux', () => {
  const at = '2026-03-01T10:00:00.000Z';
  const { progress, ok } = reussiteAuLaboratoire(depart(at), { at, canonicalSourceId: EX });
  assert.equal(ok, true, 'la soumission a échoué');
  const p = preuvesDe(progress);
  assert.equal(p.length, 1, `${p.length} preuves pour une réussite : ${p.map((e) => e.sourceId).join(' + ')}`);
  assert.equal(p[0].sourceId, EX);
});

test('V76 · CP11 — la soumission RÉUSSIT quand même quand la preuve existe déjà', () => {
  // La moitié qu'on oublie : `appendEvidence` refuse un doublon, et le §P9 du
  // contrat V65 dit qu'une preuve refusée fait échouer la commande entière. Si
  // la convergence transformait le doublon en ERREUR, elle casserait la
  // soumission — la surface afficherait un échec sur une réussite.
  const at = '2026-03-01T10:00:00.000Z';
  const { ok, code } = reussiteAuLaboratoire(depart(at), { at, canonicalSourceId: EX });
  assert.equal(ok, true, `la soumission est refusée : ${code}`);
});

test('V76 · CP11 — la preuve conserve ses compétences et ses concepts', () => {
  // Converger ne doit rien perdre : une preuve unique qui aurait perdu ses
  // concepts annulerait le gain de V75 · CP3/CP4.
  const at = '2026-03-01T10:00:00.000Z';
  const { progress } = reussiteAuLaboratoire(depart(at), { at, canonicalSourceId: EX });
  const [e] = preuvesDe(progress);
  assert.deepEqual(e.competencyIds, [SKILL]);
  assert.deepEqual(e.conceptIds, ['c1']);
  assert.equal(e.validation?.status, 'passed');
});

test('V76 · CP11 — la preuve de JOURNÉE reste unique elle aussi', () => {
  const at = '2026-03-01T10:00:00.000Z';
  const { progress } = reussiteAuLaboratoire(depart(at), { at, canonicalSourceId: EX });
  const pj = (progress.days['1']?.evidence ?? []).filter((e) => e.url === `/lab/${EX}`);
  assert.equal(pj.length, 1);
  assert.equal(pj[0].id, `lab-${EX}`);
});

// ── 2 · CE QUE LE DOUBLON FAISAIT À LA COMPÉTENCE ───────────────────────

test('V76 · CP11 — UN exercice résolu deux jours ne vaut PAS un réancrage', () => {
  // Le test décisif. Sans la convergence, ces deux réussites du MÊME exercice
  // produisaient quatre preuves sous deux `sourceId` et deux dates : la règle y
  // voyait « deux sources distinctes », donc `reinforced`.
  let p = depart('2026-03-01T10:00:00.000Z');
  p = reussiteAuLaboratoire(p, { at: '2026-03-01T10:00:00.000Z', canonicalSourceId: EX }).progress;
  p = reussiteAuLaboratoire(p, { at: '2026-03-05T10:00:00.000Z', canonicalSourceId: EX }).progress;

  const pour = normalizeLedger(p.evidence).filter((e) => (e.competencyIds ?? []).includes(SKILL));
  const proj = projectCompetency(SKILL, pour);
  assert.equal(proj.distinctSourceCount, 1,
    `un seul exercice fournit ${proj.distinctSourceCount} sources distinctes`);
  assert.notEqual(proj.state, 'reinforced',
    'un seul exercice suffit à déclarer un réancrage : le produit fabrique une maîtrise');
  assert.equal(proj.state, 'demonstrated');
});

test('V76 · CP11 — deux preuves de la MÊME source ne valent pas un réancrage', () => {
  // ── LE GARDE QUE LE DOUBLON CONTOURNAIT ──
  //
  // `sources.size >= 2` est la moitié de la règle qui exige deux OCCASIONS
  // différentes ; `dates.size >= 2` n'en est que la moitié temporelle. Le
  // doublon `<id>` / `lab-<id>` satisfaisait la première sans qu'aucune seconde
  // occasion n'ait eu lieu.
  //
  // La mutation « la consolidation ne regarde plus les sources » a survécu à la
  // première version de ce fichier : mes autres tests ne produisaient jamais
  // deux preuves qualifiantes pour une seule source, donc la branche n'était
  // pas atteinte. Elle l'est ici.
  const q = (sourceId, at, comps) => makeEvidence({
    sourceType: 'exercise', sourceId, competencyIds: comps,
    validation: { status: 'passed', kind: 'exercise-tests', checkedAt: at, detail: 'ok' },
    title: sourceId, provenance: { producer: 'lab-runner', method: 'exercise-tests' },
  }, { now: at }).evidence;
  const etat = competencyStateFrom({
    qualifying: [
      q('ex-a', '2026-03-01T10:00:00.000Z', [SKILL]),
      q('ex-a', '2026-03-05T10:00:00.000Z', [SKILL, 'python']),
    ],
    nonQualifying: [],
  });
  assert.equal(etat, 'demonstrated',
    'un seul exercice, revu à deux dates, est déclaré réancré : la règle ne mesure plus les occasions');
});

test('V76 · CP11 — DEUX exercices différents valent toujours un réancrage', () => {
  // La moitié qu'on oublie, une fois de plus : une convergence qui empêcherait
  // TOUTE promotion « protégerait » aussi bien, et rendrait `reinforced`
  // inatteignable. C'est le cas légitime, et il doit continuer de passer.
  const q = (sourceId, at) => makeEvidence({
    sourceType: 'exercise', sourceId, competencyIds: [SKILL],
    validation: { status: 'passed', kind: 'exercise-tests', checkedAt: at, detail: 'ok' },
    title: sourceId, provenance: { producer: 'lab-runner', method: 'exercise-tests' },
  }, { now: at }).evidence;
  const etat = competencyStateFrom({
    qualifying: [q('ex-a', '2026-03-01T10:00:00.000Z'), q('ex-b', '2026-03-05T10:00:00.000Z')],
    nonQualifying: [],
  });
  assert.equal(etat, 'reinforced');
});

// ── 3 · CE QUE LE DOUBLON FAISAIT À LA RÉTENTION ────────────────────────

test('V76 · CP11 — une réussite produit UN contact de type `evidence`', () => {
  // `collectContacts` pousse un contact par preuve validée. Deux preuves du
  // même fait ⇒ deux contacts ⇒ le moteur de rétention voyait deux occasions de
  // se souvenir là où il n'y en avait qu'une.
  const at = '2026-03-01T10:00:00.000Z';
  const { progress } = reussiteAuLaboratoire(depart(at), { at, canonicalSourceId: EX });
  const contacts = collectContacts({ ...progress, evidence: normalizeLedger(progress.evidence) })
    .filter((c) => c.kind === 'evidence');
  assert.equal(contacts.length, 1, `${contacts.length} contacts de preuve pour une réussite`);
});

// ── 4 · LES REGISTRES DÉJÀ ÉCRITS ───────────────────────────────────────

test('V76 · CP11 — un registre hérité voit ses deux preuves fusionnées à la lecture', () => {
  const at = '2026-03-01T10:00:00.000Z';
  // L'ancien comportement, reproduit tel quel : deux `sourceId` pour un fait.
  const { progress } = reussiteAuLaboratoire(depart(at), { at, canonicalSourceId: null });
  assert.equal(preuvesDe(progress).length, 2, 'le scénario hérité n’a pas été reproduit');
  const apres = normalizeLedger(progress.evidence).filter((e) => e.sourceId === EX || e.sourceId === `lab-${EX}`);
  assert.equal(apres.length, 1);
  assert.equal(apres[0].sourceId, EX, 'c’est la preuve `lab-` qui a survécu au lieu de la canonique');
});

test('V76 · CP11 — la fusion ne perd JAMAIS une preuve isolée', () => {
  // Règle étroite : on ne retire `lab-<id>` que si `<id>` existe. Une preuve
  // `lab-` seule (le producteur canonique a pu échouer) reste au registre —
  // perdre une preuve serait pire que le doublon.
  const seule = [{ sourceType: 'exercise', sourceId: 'lab-orphelin', competencyIds: ['s'] }];
  assert.deepEqual(fusionnerPreuvesDeLaboratoire(seule), seule);
});

test('V76 · CP11 — la fusion ne touche QUE des preuves d’exercice de mêmes compétences', () => {
  const liste = [
    { sourceType: 'exercise', sourceId: 'ex1', competencyIds: ['a'] },
    // Mêmes compétences que `ex1` : c'est le même fait, il part.
    { sourceType: 'exercise', sourceId: 'lab-ex1', competencyIds: ['a'] },
    // Compétences DIFFÉRENTES : on ne peut pas affirmer que c'est le même fait.
    { sourceType: 'exercise', sourceId: 'ex2', competencyIds: ['a'] },
    { sourceType: 'exercise', sourceId: 'lab-ex2', competencyIds: ['b'] },
    // Autre type de source : jamais concerné.
    { sourceType: 'assessment', sourceId: 'lab-ex1', competencyIds: ['a'] },
  ];
  const out = fusionnerPreuvesDeLaboratoire(liste);
  assert.deepEqual(out.map((e) => `${e.sourceType}:${e.sourceId}`),
    ['exercise:ex1', 'exercise:ex2', 'exercise:lab-ex2', 'assessment:lab-ex1']);
});

test('V76 · CP11 — aucun exercice du corpus ne s’appelle `lab-…`', () => {
  // La règle de fusion repose là-dessus : si un exercice s'appelait `lab-foo`
  // et un autre `foo`, elle confondrait deux exercices RÉELS.
  const ids = readdirSync(join(ROOT, 'data/exercises')).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5));
  assert.equal(ids.filter((i) => i.startsWith('lab-')).length, 0);
  assert.equal(ids.length, 376, `${ids.length} exercices — l’invariant du corpus a bougé`);
});

// ── 5 · LE BRANCHEMENT ──────────────────────────────────────────────────

test('V76 · CP11 — la route nomme le FAIT séparément de la preuve de journée', () => {
  const route = lire('app/api/lab/[exerciseId]/route.ts');
  assert.match(route, /canonicalSourceId:\s*ex\.id/, 'la route ne nomme pas la source canonique');
  assert.match(route, /evidenceId:\s*`lab-\$\{ex\.id\}`/, 'la preuve de journée a changé d’identifiant');
});

test('V76 · CP11 — le moteur lit `canonicalSourceId`, et retombe sur l’ancien défaut sans lui', () => {
  const moteur = lire('lib/learning-engine.mjs');
  assert.match(moteur, /validId\(cmd\.canonicalSourceId, 64\) \?\? cmd\.evidenceId/,
    'le moteur ignore le nom du fait, ou n’a plus de repli compatible');
});
