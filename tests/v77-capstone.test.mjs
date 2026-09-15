// V77 · CP6 — LE CAPSTONE ÉTAIT DÉGRADÉ, PAS SURCLASSÉ.
//
// ── L'ERREUR DE SENS INVERSE DE CELLE DU CP5 ────────────────────────────
//
// Le CP5 a retiré un surclassement : une mission validée d'un clic disait
// `passed`. Le CP6 répare l'erreur opposée, et elle vient du même endroit — un
// vocabulaire incomplet, jamais vérifié de bout en bout.
//
// `capstone-grade` était absent de `VALIDATION_KINDS`. `normalizeValidation`
// retombait donc sur `self`, et une correction SERVEUR déterministe — contre un
// corrigé déclaré d'avance, en plusieurs phases — était archivée comme une
// **auto-déclaration de l'apprenant**.
//
// ── CE QUE LA MESURE A MONTRÉ EN PLUS DE LA DETTE ───────────────────────
//
// Sur les 13 capstones réels, corrigé en main :
//
//     genre archivé       : 13 × `self`
//     niveau de preuve    : 13 × `DECLARED`
//     compétence projetée : 13 × `demonstrated`
//
// **Les deux dernières lignes se contredisent.** `isQualifying` ne regarde que
// le type de source et le statut : le produit disait « déclaration » dans le
// genre et créditait « démonstration » dans la compétence. Deux phrases
// opposées sur le même objet.
//
// ── CE QUE CE CHECKPOINT NE FAIT PAS ────────────────────────────────────
//
// Il ne remonte PAS les preuves héritées `capstone-review`. Leur correction n'a
// jamais été rejouée — la migration les a reclassées sur la foi de leur
// identifiant. Affirmer qu'une correction a eu lieu serait reconstruire un fait
// historique absent.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  makeEvidence, isQualifying, normalizeLedger, niveauDePreuve,
  VALIDATION_KINDS, NIVEAU_MAX_PAR_KIND, NIVEAU_MAX_PAR_SOURCE,
} from '../lib/evidence.mjs';
import { gradeCapstone } from '../lib/capstone.mjs';
import { projectCompetency } from '../lib/competency.mjs';
import { applyCommand } from '../lib/learning-engine.mjs';
import { normalizeAssessmentAttempts } from '../lib/assessment-attempt.mjs';

const ROOT = process.cwd();
const lire = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');
const NOW = '2026-09-15T12:00:00.000Z';
const base = { startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} };

const CAPSTONES = readdirSync(join(ROOT, 'data', 'capstones'))
  .filter((f) => f.endsWith('.json')).sort()
  .map((f) => JSON.parse(readFileSync(join(ROOT, 'data', 'capstones', f), 'utf8')));

/** Les réponses du CORRIGÉ : le meilleur cas, pas une simulation d'apprenant. */
function reponsesCorrectes(c) {
  const out = {};
  for (const p of c.phases ?? []) {
    for (const q of p.questions ?? []) {
      if (q.answer !== undefined) out[q.id] = q.answer;
      else if (q.expected !== undefined) out[q.id] = q.expected;
    }
  }
  return out;
}

function preuveDe(c, kind) {
  const r = gradeCapstone(c, reponsesCorrectes(c));
  return makeEvidence({
    sourceType: 'capstone', sourceId: c.id, competencyIds: c.skills ?? [],
    validation: {
      status: r.passedOverall ? 'passed' : 'failed', kind, checkedAt: NOW,
      detail: `${r.passed}/${r.total}`, score: { passed: r.passed, total: r.total },
    },
    title: `Capstone : ${c.title}`,
    provenance: { producer: 'capstone-grader', method: 'capstone-grade' },
    simulation: true,
  }, { now: NOW });
}

// ── 1 · LES 13, PAS UN ÉCHANTILLON ─────────────────────────────────────

test('V77 · CP6 — les 13 capstones archivent désormais `capstone-grade`, plus `self`', () => {
  assert.equal(CAPSTONES.length, 13, 'le corpus doit être celui qu’on croit');
  for (const c of CAPSTONES) {
    const v = preuveDe(c, 'capstone-grade');
    assert.equal(v.ok, true, `${c.id} : preuve refusée`);
    assert.equal(v.evidence.validation.kind, 'capstone-grade', `${c.id} : genre dégradé`);
    assert.equal(v.evidence.evidenceLevel, 'VALIDATED', `${c.id} : niveau`);
    assert.equal(v.evidence.simulation, true, `${c.id} : marque de simulation`);
  }
});

test('V77 · CP6 — DÉFAUT MESURÉ : un genre hors vocabulaire retombe sur `self`', () => {
  // Le mécanisme exact du défaut, rejoué. Ce n'est pas `capstone-grade` qui
  // était spécial : c'est l'absence du mot dans la liste.
  const v = preuveDe(CAPSTONES[0], 'genre-inexistant');
  assert.equal(v.evidence.validation.kind, 'self');
  assert.equal(v.evidence.evidenceLevel, 'DECLARED');
});

test('V77 · CP6 — LA CONTRADICTION MESURÉE : « déclaration » et « démontré » à la fois', () => {
  // Avant le CP6, la preuve disait `self` (une déclaration) ET créditait
  // `demonstrated`, parce que `isQualifying` ne regardait ni le genre ni le
  // niveau. Le CP6 a aligné le genre ; le CP9 a tranché le reste.
  const c = CAPSTONES[0];
  const avant = preuveDe(c, 'genre-inexistant').evidence;
  assert.equal(avant.evidenceLevel, 'DECLARED');
  // ── AMENDÉ PAR V77 · CP9 ──
  //
  // Le CP6 figeait la contradiction sans la trancher : `isQualifying` ignorait
  // le niveau, et cette preuve annoncée `self` créditait `demonstrated`. Le CP9
  // a appliqué le contrat gelé (*seul `VALIDATED` compte*), et la contradiction
  // a disparu — pas parce qu'on l'a maquillée, parce qu'on l'a résolue.
  assert.equal(isQualifying(avant), false, 'une auto-déclaration ne crédite plus rien');
  assert.equal(projectCompetency(c.skills[0], [avant]).state, 'practiced');

  const apres = preuveDe(c, 'capstone-grade').evidence;
  assert.equal(apres.evidenceLevel, 'VALIDATED');
  assert.equal(isQualifying(apres), true);
  assert.equal(projectCompetency(c.skills[0], [apres]).state, 'demonstrated',
    'corrigé par le serveur, le capstone démontre — et c’est le seul des deux qui le peut');
});

// ── 2 · CE QUI NE DOIT PAS ÊTRE REMONTÉ ────────────────────────────────

test('V77 · CP6 — `capstone-review` hérité N’EST PAS remonté', () => {
  // Sa correction n'a jamais été rejouée : la migration l'a reclassé sur la foi
  // de son identifiant. L'affirmer serait reconstruire un fait absent.
  assert.equal(NIVEAU_MAX_PAR_KIND['capstone-review'], 'OBSERVED');
  assert.equal(niveauDePreuve('capstone', { status: 'passed', kind: 'capstone-review' }), 'OBSERVED');
  assert.equal(niveauDePreuve('capstone', { status: 'passed', kind: 'capstone-grade' }), 'VALIDATED');
});

test('V77 · CP6 — une preuve héritée relue du disque garde son statut, pas son niveau', () => {
  const ancienne = {
    id: 'ev-capstone-vieux', sourceType: 'capstone', sourceId: 'vieux', competencyIds: ['algo'],
    createdAt: '2026-01-01T00:00:00.000Z',
    validation: { status: 'passed', kind: 'capstone-review', checkedAt: '2026-01-01T00:00:00.000Z', detail: '', score: null },
    provenance: { producer: 'legacy-migration', method: 'capstone', note: '' },
  };
  const [relue] = normalizeLedger([ancienne]);
  assert.equal(relue.validation.kind, 'capstone-review', 'le disque n’est pas réécrit');
  assert.equal(relue.evidenceLevel, 'OBSERVED', 'et elle n’est pas promue');
});

test('V77 · CP6 — DEUX plafonds, et le plus sévère gagne', () => {
  // La source dit ce qu'on PEUT observer, le moyen ce qu'on PEUT affirmer.
  assert.equal(NIVEAU_MAX_PAR_SOURCE.capstone, 'VALIDATED');
  assert.equal(NIVEAU_MAX_PAR_SOURCE.mission, 'OBSERVED');
  // Source généreuse + moyen faible → le moyen gagne.
  assert.equal(niveauDePreuve('capstone', { status: 'passed', kind: 'self' }), 'DECLARED');
  // Source plafonnée + moyen généreux → la source gagne.
  assert.equal(niveauDePreuve('mission', { status: 'passed', kind: 'assessment-grade' }), 'OBSERVED');
});

// ── 3 · LA SIMULATION EST UN CHAMP, ET NE DÉGRADE RIEN ─────────────────

test('V77 · CP6 — `simulation: true` et `VALIDATED` tiennent ENSEMBLE', () => {
  // Le contrat gelé l'exige : réussir une simulation professionnelle est un
  // indice fort, ce n'est pas une expérience réelle. Les deux faits coexistent.
  const v = preuveDe(CAPSTONES[0], 'capstone-grade').evidence;
  assert.equal(v.simulation, true);
  assert.equal(v.evidenceLevel, 'VALIDATED');
  assert.equal(isQualifying(v), true);
});

test('V77 · CP6 — la simulation ne se devine pas : absente, elle vaut `false`', () => {
  const v = makeEvidence({
    sourceType: 'exercise', sourceId: 'x', competencyIds: ['algo'],
    validation: { status: 'passed', kind: 'exercise-tests', checkedAt: NOW, detail: '' },
    title: 'x', provenance: { producer: 'p', method: 'm' },
  }, { now: NOW });
  assert.equal(v.evidence.simulation, false);
  // Et du texte ne vaut pas un booléen (dette `D9`).
  const t = makeEvidence({
    sourceType: 'exercise', sourceId: 'y', competencyIds: ['algo'],
    validation: { status: 'passed', kind: 'exercise-tests', checkedAt: NOW, detail: '' },
    title: 'y', provenance: { producer: 'p', method: 'm' }, simulation: 'environnement simulé',
  }, { now: NOW });
  assert.equal(t.evidence.simulation, false);
});

// ── 4 · LE FAIT DU CP4, BRANCHÉ SUR LES CAPSTONES ──────────────────────

test('V77 · CP6 — un capstone écrit le MÊME fait qu’un diagnostic, avec `kind: capstone`', () => {
  // Décision du CP2 : deux surfaces, un seul type de fait. La différence
  // pédagogique vit dans le genre, l'environnement dans `simulation`.
  const r = applyCommand({ ...base }, {
    type: 'RECORD_ASSESSMENT_ATTEMPT', assessmentId: 'agent-tool-loop-incident',
    kind: 'capstone', passed: 7, total: 7, seuil: 0.7, simulation: true,
    empreinte: 'q1=1', provenance: { producer: 'capstone-grader', method: 'POST /api/capstones/[id]' },
  }, { now: new Date(NOW) });
  assert.equal(r.ok, true);
  const [a] = normalizeAssessmentAttempts(r.progress.assessmentAttempts);
  assert.equal(a.kind, 'capstone');
  assert.equal(a.simulation, true);
  assert.equal(a.reussiteGlobale, true);
});

test('V77 · CP6 — la route des capstones écrit le fait AVANT la branche `record`', () => {
  const src = lire('app/api/capstones/[id]/route.ts');
  const iFait = src.indexOf('RECORD_ASSESSMENT_ATTEMPT');
  const iRecord = src.indexOf('if (body.record !== true)');
  assert.ok(iFait > 0, 'la route n’écrit aucune tentative');
  assert.ok(iRecord > iFait, 'la tentative n’est écrite que si l’apprenant conserve');
  assert.ok(src.includes("kind: 'capstone'"));
  assert.ok(src.includes('simulation: true'));
  // Et le seuil vient de la fixture, jamais d'une constante recopiée.
  assert.ok(src.includes('capstone.passThreshold'));
});

test('V77 · CP6 — le vocabulaire accueille `capstone-grade` sans perdre `capstone-review`', () => {
  assert.equal(VALIDATION_KINDS.includes('capstone-grade'), true);
  assert.equal(VALIDATION_KINDS.includes('capstone-review'), true, 'les preuves héritées restent lisibles');
  assert.equal(VALIDATION_KINDS.includes('mission-deliverables'), true);
});
