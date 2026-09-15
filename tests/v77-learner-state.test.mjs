// V77 · CP11 — LES FAITS DEVIENNENT LISIBLES, SANS NOUVEAU MOTEUR.
//
// ── LE DÉFAUT QUE CE CHECKPOINT CORRIGE ────────────────────────────────
//
// Les quatre faits construits aux CP3→CP7 étaient écrits, persistés, exportés,
// restaurés… et **aucune surface ne les lisait**. Un fait que personne ne peut
// lire n'est pas encore une observation : c'est du stockage.
//
// C'est le cinquième sprint d'affilée où la chose à brancher existe déjà,
// débranchée — et cette fois je l'avais construite moi-même quatre checkpoints
// plus tôt.
//
// ── CE QUE CE CHECKPOINT NE FAIT PAS ───────────────────────────────────
//
// **Aucun nouveau moteur.** L'historique est une PROJECTION des faits déjà
// persistés — l'architecture choisie en V65. Les quatre nouveaux faits s'y
// ajoutent exactement comme les cinq autres : rien n'est recalculé, rien n'est
// stocké en double, aucun score n'apparaît.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  buildHistory, historySummary, HISTORY_EVENT_TYPES, HISTORY_EVENT_LABEL, HISTORY_USAGE_TYPES,
} from '../lib/learner-history.mjs';
import { applyCommand } from '../lib/learning-engine.mjs';
import { migrateToV7, activeTrackProgress, writeActiveTrack } from '../lib/progress-store.mjs';

const ROOT = process.cwd();
const lire = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');
const T = (s) => `2026-09-15T12:00:${String(s).padStart(2, '0')}.000Z`;

/** Une progression portant les QUATRE nouveaux faits, écrite par le moteur. */
function progressionAvecLesQuatre() {
  let p = activeTrackProgress(migrateToV7({}));
  p = applyCommand(p, {
    type: 'RECORD_ASSESSMENT_ATTEMPT', assessmentId: 'async-messaging-queues',
    competencyIds: ['jsts'], passed: 3, total: 5, seuil: 0.7, empreinte: 'e1',
    provenance: { producer: 'assessment-grader', method: 'm' },
  }, { now: new Date(T(1)) }).progress;
  p = applyCommand(p, {
    type: 'RECORD_MISSION_SUBMISSION', missionId: 'm1', deliverableId: 'rev',
    mode: 'review', statut: 'validated', provenance: { producer: 'mission-engine', method: 'm' },
  }, { now: new Date(T(2)) }).progress;
  p = applyCommand(p, {
    type: 'RECORD_ARTIFACT_ANALYSIS', surface: 'kubernetes', artifactId: 'broken-service',
    artefactFourni: true, diagnostics: 7, parSeverite: { blocking: 1 }, dimensions: ['resilience'],
    empreinte: 'a1', provenance: { producer: 'artifact-analyzer', method: 'm' },
  }, { now: new Date(T(3)) }).progress;
  p = applyCommand(p, {
    type: 'RECORD_USAGE_EVENT', surface: 'terminal', action: 'run', ref: 'term-list-files',
    detail: { adapter: 'local', exitCode: 0 }, provenance: { producer: 'terminal-route', method: 'm' },
  }, { now: new Date(T(4)) }).progress;
  return p;
}

// ── 1 · LES QUATRE FAITS SONT ENFIN LUS ────────────────────────────────

test('V77 · CP11 — les quatre faits apparaissent dans l’historique', () => {
  const ev = buildHistory(progressionAvecLesQuatre());
  const types = new Set(ev.map((e) => e.type));
  for (const t of ['ASSESSMENT_SUBMITTED', 'MISSION_DELIVERABLE', 'ARTIFACT_ANALYZED', 'SURFACE_USED']) {
    assert.equal(types.has(t), true, `${t} manque à l’historique`);
  }
  assert.equal(ev.length, 4, 'quatre faits, quatre lignes — rien d’inventé');
});

test('V77 · CP11 — chaque ligne porte l’horodatage RÉEL du fait, jamais reconstruit', () => {
  const ev = buildHistory(progressionAvecLesQuatre());
  assert.deepEqual(ev.map((e) => e.at).sort(), [T(1), T(2), T(3), T(4)]);
});

test('V77 · CP11 — une progression VIDE ne fabrique aucun événement', () => {
  assert.deepEqual(buildHistory(activeTrackProgress(migrateToV7({}))), []);
  assert.deepEqual(buildHistory(null), []);
});

test('V77 · CP11 — les faits survivent au disque AVANT d’être lus', () => {
  // Une projection qui ne lirait que la mémoire mentirait dès le rechargement.
  const p = progressionAvecLesQuatre();
  const relu = activeTrackProgress(JSON.parse(JSON.stringify(writeActiveTrack(migrateToV7({}), p))));
  assert.equal(buildHistory(relu).length, 4);
});

// ── 2 · CE QUE LES LIGNES ONT LE DROIT DE DIRE ─────────────────────────

test('V77 · CP11 — la courbe d’un diagnostic devient LISIBLE', () => {
  // Avant le CP4 elle n'existait pas ; depuis le CP11 elle se voit.
  let p = activeTrackProgress(migrateToV7({}));
  for (const [i, passed] of [0, 1, 4].entries()) {
    p = applyCommand(p, {
      type: 'RECORD_ASSESSMENT_ATTEMPT', assessmentId: 'a', competencyIds: ['jsts'],
      passed, total: 5, seuil: 0.7, empreinte: `v${i}`,
      provenance: { producer: 'assessment-grader', method: 'm' },
    }, { now: new Date(T(i * 10 + 1)) }).progress;
  }
  const lignes = buildHistory(p).filter((e) => e.type === 'ASSESSMENT_SUBMITTED');
  assert.equal(lignes.length, 3);
  assert.deepEqual(lignes.map((e) => e.detail).reverse(), ['a — 0/5', 'a — 1/5', 'a — 4/5']);
});

test('V77 · CP11 — un livrable de revue est annoncé comme VALIDÉ PAR L’APPRENANT', () => {
  const e = buildHistory(progressionAvecLesQuatre()).find((x) => x.type === 'MISSION_DELIVERABLE');
  assert.match(e.detail, /validé par l’apprenant/);
  assert.equal(e.niveau, 'DECLARED');
});

test('V77 · CP11 — un artefact analysé dit un COMPTE, pas un verdict', () => {
  const e = buildHistory(progressionAvecLesQuatre()).find((x) => x.type === 'ARTIFACT_ANALYZED');
  assert.match(e.detail, /7 diagnostics/);
  assert.equal(e.niveau, 'OBSERVED');
  assert.equal(e.simulation, true);
  for (const mot of ['réussi', 'validé', 'correct']) {
    assert.equal(e.detail.toLowerCase().includes(mot), false, `« ${mot} » n’a rien à faire ici`);
  }
});

test('V77 · CP11 — une ligne d’USAGE le dit DANS SON TEXTE, pas seulement dans un champ', () => {
  // Il serait trop facile de la confondre avec du travail. Deux gardes : le
  // texte, et `usage: true` pour les consommateurs qui ne lisent pas le texte.
  const e = buildHistory(progressionAvecLesQuatre()).find((x) => x.type === 'SURFACE_USED');
  assert.equal(e.usage, true);
  assert.match(e.detail, /usage constaté, aucune réussite mesurée/);
});

test('V77 · CP11 — aucun SCORE, aucun pourcentage, aucun percentile dans l’historique', () => {
  const ev = buildHistory(progressionAvecLesQuatre());
  for (const e of ev) {
    const texte = `${e.label} ${e.detail}`.toLowerCase();
    for (const interdit of ['score', '%', 'percentile', 'maîtris', 'maitris', 'niveau de']) {
      assert.equal(texte.includes(interdit), false, `« ${interdit} » dans « ${texte} »`);
    }
    // Et aucun champ nommé comme un score.
    for (const champ of ['score', 'mastery', 'percentile', 'ranking']) {
      assert.equal(champ in e, false, `champ « ${champ} »`);
    }
  }
});

// ── 3 · LE COMPTEUR NE MÉLANGE PAS USAGE ET TRAVAIL ────────────────────

test('V77 · CP11 — `travail` et `usage` sont comptés SÉPARÉMENT', () => {
  // Additionner l'usage au reste aurait fait grimper un chiffre sans qu'un seul
  // exercice de plus ait été résolu — le genre d'amélioration qui ne mesure rien.
  const s = historySummary(buildHistory(progressionAvecLesQuatre()));
  assert.equal(s.total, 4);
  assert.equal(s.usage, 1);
  assert.equal(s.travail, 3);
  assert.equal(s.travail + s.usage, s.total);
});

test('V77 · CP11 — la surface affiche les deux nombres, séparés', () => {
  const src = lire('app/history/page.tsx');
  assert.ok(src.includes("k: 'Travail'"), 'le compteur de travail doit être visible');
  assert.ok(src.includes("k: 'Usage'"), 'et l’usage à côté, pas fondu dedans');
  // Chaque type a une icône : une ligne sans icône serait une ligne oubliée.
  for (const t of HISTORY_EVENT_TYPES) {
    assert.ok(src.includes(`${t}:`), `${t} n’a pas d’icône dans la surface`);
  }
});

test('V77 · CP11 — chaque type a un libellé, et `HISTORY_USAGE_TYPES` est explicite', () => {
  for (const t of HISTORY_EVENT_TYPES) {
    assert.ok(HISTORY_EVENT_LABEL[t], `${t} n’a pas de libellé`);
  }
  assert.deepEqual([...HISTORY_USAGE_TYPES], ['SURFACE_USED']);
});

// ── 4 · AUCUN NOUVEAU MOTEUR ───────────────────────────────────────────

test('V77 · CP11 — l’historique reste une PROJECTION : aucun état n’est stocké', () => {
  // Deux appels sur la même progression rendent exactement la même chose, et la
  // progression n'est pas modifiée. Un moteur, lui, écrirait.
  const p = progressionAvecLesQuatre();
  const avant = JSON.stringify(p);
  const a = buildHistory(p);
  const b = buildHistory(p);
  assert.deepEqual(a, b);
  assert.equal(JSON.stringify(p), avant, 'lire ne doit rien écrire');
});

test('V77 · CP11 — AUCUN moteur n’a appris à lire les nouveaux faits', () => {
  // Le contrat du CP3 l'interdit pour l'usage, et les CP4→CP7 n'ont pas encore
  // décidé ce que leurs faits qualifient. L'historique n'est pas un moteur.
  for (const f of ['lib/competency.mjs', 'lib/retention.mjs', 'lib/recovery-mode.mjs']) {
    const src = lire(f);
    for (const champ of ['usageEvents', 'assessmentAttempts', 'missionSubmissions', 'artifactAnalyses']) {
      assert.equal(src.includes(champ), false, `${f} lit ${champ}`);
    }
  }
});
