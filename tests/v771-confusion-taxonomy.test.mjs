// V77.1 · CP5 — LA TAXONOMIE DE CONFUSION, ET LES TROIS DOCUMENTS.
//
// Les documents du pilote ne sont pas de la prose décorative : ce sont les
// seules choses qu'un facilitateur aura sous les yeux. Un document qui nomme une
// catégorie inexistante, oublie une règle d'arrêt ou décrit un chemin que le
// CP4 a mesuré comme absent enverrait quelqu'un improviser devant un
// participant — et une improvisation rend la session INVALID.
//
// Ces tests tiennent donc la CORRESPONDANCE entre le code, la fixture et les
// documents. Pas leur style.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  CATEGORIES_DE_CONFUSION, IDS_DE_CONFUSION, MOMENTS, PART_MAX_EN_AUTRE,
  normaliserRapportDeConfusion, decompteParCategorie, verdictH6,
} from '../lib/confusion-taxonomy.mjs';

const PROC = readFileSync('docs/v77-1/V78-PARTICIPANT-PROCEDURE.md', 'utf8');
const SCRIPT = readFileSync('docs/v77-1/V78-FACILITATOR-SCRIPT.md', 'utf8');
const LISTE = readFileSync('docs/v77-1/V78-PILOT-CHECKLIST.md', 'utf8');
const FIXTURE = JSON.parse(readFileSync('data/pilot/v78-pilot-1.json', 'utf8'));

// ─────────────────────────────────────────────────────────────────────────────
// 1. La taxonomie
// ─────────────────────────────────────────────────────────────────────────────

test('CP5 — les sept catégories sont celles-ci, pinnées en clair', () => {
  assert.deepEqual([...IDS_DE_CONFUSION], [
    'INSTRUCTION_UNCLEAR', 'UI_CONFUSION', 'CONCEPT_CONFUSION',
    'TOOL_CONFUSION', 'BUG', 'FATIGUE', 'OTHER',
  ]);
});

test('CP5 — chaque catégorie porte la QUESTION qui la distingue, et une conduite', () => {
  for (const c of CATEGORIES_DE_CONFUSION) {
    assert.ok(c.question.trim().length >= 25, `${c.id} : question trop courte`);
    assert.ok(c.action.trim().length >= 15, `${c.id} : aucune conduite`);
    assert.ok(c.porte.trim(), `${c.id} : ne dit pas sur quoi elle porte`);
  }
});

test('CP5 — INSTRUCTION_UNCLEAR et CONCEPT_CONFUSION portent sur des choses différentes', () => {
  const i = CATEGORIES_DE_CONFUSION.find((c) => c.id === 'INSTRUCTION_UNCLEAR');
  const c = CATEGORIES_DE_CONFUSION.find((c2) => c2.id === 'CONCEPT_CONFUSION');
  assert.notEqual(i.porte, c.porte);
  assert.match(i.porte, /TEXTE/);
  assert.match(c.porte, /NOTION/);
});

test('CP5 — un rapport hors vocabulaire est refusé, jamais rangé de force', () => {
  assert.equal(normaliserRapportDeConfusion({ categorie: 'PERDU', moment: 'LESSON' }), null);
  assert.equal(normaliserRapportDeConfusion({ categorie: 'BUG', moment: 'AILLEURS' }), null);
  assert.equal(normaliserRapportDeConfusion(null), null);
  assert.equal(normaliserRapportDeConfusion({ categorie: 'BUG', moment: 'LESSON' }).categorie, 'BUG');
});

test('CP5 — OTHER sans verbatim est refusé : un décompte sans contenu ne sert à rien', () => {
  assert.equal(normaliserRapportDeConfusion({ categorie: 'OTHER', moment: 'LESSON' }), null);
  assert.equal(normaliserRapportDeConfusion({ categorie: 'OTHER', moment: 'LESSON', verbatim: '   ' }), null);
  assert.ok(normaliserRapportDeConfusion({ categorie: 'OTHER', moment: 'LESSON', verbatim: 'il a soupiré' }));
});

test('CP5 — le décompte porte les sept catégories, y compris à zéro', () => {
  const d = decompteParCategorie([{ categorie: 'BUG', moment: 'EXERCISE' }]);
  assert.deepEqual(Object.keys(d).sort(), [...IDS_DE_CONFUSION].sort());
  assert.equal(d.BUG, 1);
  assert.equal(d.FATIGUE, 0);
  // Un zéro est une information : il ne disparaît pas du tableau.
  assert.equal(Object.values(d).length, 7);
});

test('CP5 — H6 est falsifiée au-delà d’un tiers de OTHER, et le chiffre est rendu', () => {
  assert.equal(PART_MAX_EN_AUTRE, 1 / 3);
  const autre = (n) => Array.from({ length: n }, () => ({ categorie: 'OTHER', moment: 'LESSON', verbatim: 'x' }));
  const classe = (n) => Array.from({ length: n }, () => ({ categorie: 'BUG', moment: 'LESSON' }));
  assert.equal(verdictH6([...autre(1), ...classe(2)]).verdict, 'H6_TIENT');
  const f = verdictH6([...autre(2), ...classe(2)]);
  assert.equal(f.verdict, 'H6_FALSIFIEE');
  assert.equal(f.part, 0.5);
  assert.equal(f.total, 4);
});

test('CP5 — aucun rapport n’est NOT_OBSERVED, pas H6_TIENT par défaut', () => {
  const v = verdictH6([]);
  assert.equal(v.verdict, 'NOT_OBSERVED');
  assert.equal(v.part, null);
  assert.equal(v.total, 0);
});

test('CP5 — les moments couvrent les étapes du protocole', () => {
  assert.ok(MOMENTS.includes('HORS_ETAPE'), 'une confusion hors étape doit être rangeable');
  for (const m of ['PRETEST', 'LESSON', 'EXERCISE', 'HINT', 'RETRIEVAL', 'TRANSFER', 'EXPORT']) {
    assert.ok(MOMENTS.includes(m), m);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Les trois documents — la correspondance, pas le style
// ─────────────────────────────────────────────────────────────────────────────

test('CP5 — les sept catégories figurent dans le script ET dans la liste', () => {
  for (const id of IDS_DE_CONFUSION) {
    assert.ok(SCRIPT.includes(id), `« ${id} » absente du script du facilitateur`);
    assert.ok(LISTE.includes(id), `« ${id} » absente de la liste de contrôle`);
  }
});

test('CP5 — le script nomme le chemin de repli du risque R8', () => {
  // Le CP4 a mesuré que /retention ne propose PAS le concept focal. Laisser un
  // facilitateur le découvrir devant un participant, c'est le pousser à
  // improviser — et improviser rend la session INVALID (N1).
  assert.match(SCRIPT, /\/retention.+ne proposera RIEN|ne proposera RIEN/);
  assert.match(SCRIPT, /RECORD_RECALL/);
  assert.match(SCRIPT, /Aucune tentative de rappel\s*\n?\s*>?\s*enregistrée|Aucune tentative de rappel/);
  assert.match(LISTE, /\/retention ne propose rien/);
});

test('CP5 — le compteur d’amorces figure dans le script ET dans la liste', () => {
  // Rien dans un fait de rappel ne dit à quelle étape il appartient : c'est le
  // point le plus fragile du protocole, et il se tient sur papier.
  assert.match(SCRIPT, /compteur d'amorces|Le compteur d'amorces|compteur d’amorces/i);
  assert.match(LISTE, /exactement 2/);
  assert.match(LISTE, /exactement 1/);
  assert.match(LISTE, /décale|débordement/i);
});

test('CP5 — les cinq règles d’arrêt du pilote figurent dans le script et la liste', () => {
  for (const a of ['A1', 'A2', 'A3', 'A4', 'A5']) {
    assert.ok(SCRIPT.includes(a), `${a} absente du script`);
    assert.ok(LISTE.includes(a), `${a} absente de la liste`);
  }
});

test('CP5 — les huit conditions de non-interprétabilité figurent dans la liste', () => {
  for (let i = 1; i <= 8; i += 1) assert.ok(LISTE.includes(`N${i}`), `N${i} absente`);
});

test('CP5 — les quatre statuts de session figurent dans la liste, et un seul se coche', () => {
  for (const s of ['COMPLETE', 'PARTIAL', 'ABORTED', 'INVALID']) assert.ok(LISTE.includes(s), s);
  assert.match(LISTE, /un seul/i);
  assert.match(LISTE, /sort du dénominateur, jamais du rapport/);
});

test('CP5 — les trois documents portent la version de protocole gelée', () => {
  for (const [nom, doc] of [['procédure', PROC], ['script', SCRIPT], ['liste', LISTE]]) {
    assert.ok(doc.includes(FIXTURE.protocolVersion), `${nom} : version de protocole absente`);
  }
});

test('CP5 — le délai et sa fenêtre sont les mêmes dans la fixture et dans les documents', () => {
  const [min, max] = FIXTURE.delayedRetrievalWindowHours;
  assert.equal(FIXTURE.delayedRetrievalDelayHours, 24);
  for (const doc of [PROC, SCRIPT, LISTE]) {
    assert.ok(doc.includes(String(min)) && doc.includes(String(max)), 'fenêtre absente d’un document');
  }
  assert.ok(SCRIPT.includes(String(FIXTURE.partialAfterHours)));
  assert.ok(LISTE.includes(String(FIXTURE.partialAfterHours)));
});

test('CP5 — le scope, l’exercice et le transfert des documents sont ceux de la fixture', () => {
  const focal = FIXTURE.concepts.find((c) => c.stage === 'FOCAL');
  const principal = focal.exercises.find((e) => e.role === 'PRINCIPAL').exerciseId;
  const secours = focal.exercises.find((e) => e.role === 'SECOURS').exerciseId;
  const transfert = FIXTURE.transfers.find((t) => t.role === 'PRINCIPAL').id;
  for (const doc of [SCRIPT, LISTE]) {
    assert.ok(doc.includes(focal.conceptId), 'concept focal absent');
    assert.ok(doc.includes(principal), 'exercice principal absent');
    assert.ok(doc.includes(transfert), 'transfert absent');
  }
  assert.ok(SCRIPT.includes(secours), 'exercice de secours absent du script');
  assert.ok(LISTE.includes(secours), 'exercice de secours absent de la liste');
  assert.ok(SCRIPT.includes(FIXTURE.fallbackScope.scopeId), 'scope de repli absent');
});

test('CP5 — les seuils de PRETEST des documents sont ceux de la fixture', () => {
  assert.match(FIXTURE.pretestRules.PRETEST_HIGH.seuil, /2 sur 2/);
  assert.match(FIXTURE.pretestRules.MISSING_PREREQUISITE.seuil, /0 sur 2/);
  assert.match(SCRIPT, /PRETEST_HIGH/);
  assert.match(SCRIPT, /MISSING_PREREQUISITE/);
  // Et la nuance qui compte : un plafond donne INVALID, pas ABORTED.
  assert.match(SCRIPT, /INVALID.+\*\*pas\*\* `ABORTED`|INVALID.+PAS ABORTED|`INVALID`.+\*\*pas\*\*/s);
  assert.match(LISTE, /INVALID \(N6\), PAS ABORTED/);
});

test('CP5 — la procédure participant ne promet aucune note, aucun score', () => {
  assert.match(PROC, /On teste un logiciel, pas toi|on teste le logiciel, pas toi/i);
  assert.match(PROC, /Rater un exercice est utile|Rater est utile/i);
  assert.match(PROC, /aucun score|Personne ne verra une note/i);
  assert.match(PROC, /sans te justifier/);
  // Et elle dit la vérité sur les données, telle que le CP2 l'a établie.
  assert.match(PROC, /Supprimer toutes mes données/);
  assert.match(PROC, /SUPPRIMER/);
  assert.match(PROC, /ton code compris|le code que tu écris/i);
});

test('CP5 — le script interdit explicitement l’aide hors script, et en dit le prix', () => {
  assert.match(SCRIPT, /INVALID/);
  assert.match(SCRIPT, /N1/);
  assert.match(SCRIPT, /jamais dire|ne faut jamais dire/i);
  // Le facilitateur qui dérape doit s'auto-dénoncer : c'est dans les deux docs.
  assert.match(SCRIPT, /aide hors script/i);
  assert.match(LISTE, /AIDE HORS SCRIPT/i);
});

test('CP5 — la liste rappelle ce que la session ne permettra PAS de conclure', () => {
  assert.match(LISTE, /NE permettra PAS de conclure/i);
  for (const interdit of ['appris', 'rétention', 'transfert fonctionne']) {
    assert.ok(LISTE.toLowerCase().includes(interdit.toLowerCase()), interdit);
  }
  assert.match(LISTE, /reconstructible/);
});

test('CP5 — la liste nomme les deux étapes dont le concept vient de la fixture', () => {
  // Mesuré au CP4 : un ÉCHEC d'exercice ne porte aucun concept.
  assert.ok(LISTE.includes('EXERCISE_ATTEMPT_FAIL'));
  assert.ok(LISTE.includes('EXERCISE_ATTEMPT_RETRY'));
  const derives = FIXTURE.steps.filter((s) => s.origineDuConcept === 'fixture').map((s) => s.id);
  assert.deepEqual(derives, ['EXERCISE_ATTEMPT_FAIL', 'EXERCISE_ATTEMPT_RETRY']);
});

test('CP5 — la liste dit qu’une étape sans fait est prévue, pas un incident', () => {
  assert.match(LISTE, /ne laisse AUCUN fait/);
  assert.match(LISTE, /NOT_OBSERVED \(jamais FAILED\)|NOT_OBSERVED/);
  assert.match(LISTE, /jamais FAILED/);
});
