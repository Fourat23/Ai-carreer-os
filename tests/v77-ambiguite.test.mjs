// V77 · CP8 — LES 125 EXERCICES AMBIGUS : DÉCLARER, PAS DEVINER.
//
// ── LA RÈGLE DU CHECKPOINT, ET ELLE EST INHABITUELLE ────────────────────
//
// **125 → 0 n'est PAS un objectif.** Rester `AMBIGUOUS` est un résultat VALIDE.
// La précision prime sur la couverture, et « résoudre les 125 ambiguïtés par
// heuristique arbitraire » figure nommément dans la liste des interdits.
//
// Le CP8 livre donc un MÉCANISME et une MESURE, pas un chiffre amélioré :
//
//   · un fichier de déclaration **hors du corpus gelé**, pour qu'un auteur
//     puisse trancher sans modifier le curriculum ;
//   · l'audit de quatre sources possibles, avec leur rendement mesuré — **zéro
//     pour les quatre** ;
//   · une sous-classification des 125 sur une distinction qui a des
//     conséquences réelles.
//
// Les tests ci-dessous gardent surtout la chose la plus facile à perdre : que
// le mécanisme refuse une déclaration sans source.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  CHEMIN_DECLARATIONS, SOURCES_DECLARATION, normaliserDeclarations,
} from '../lib/exercise-declarations.mjs';
import { resoudreExercice } from '../lib/exercise-mapping.mjs';

const ROOT = process.cwd();

// ── 1 · LE MÉCANISME REFUSE CE QU'IL DOIT REFUSER ──────────────────────

test('V77 · CP8 — une déclaration SANS SOURCE est refusée, pas réparée', () => {
  // C'est la garde la plus importante du checkpoint : sans elle, le fichier
  // deviendrait l'endroit où écrire ce qu'on aimerait croire.
  const d = normaliserDeclarations({
    'ex-a': { lessons: ['une-lecon'] },                                  // aucune source
    'ex-b': { lessons: ['une-lecon'], source: 'ça me paraît évident' },   // source inventée
    'ex-c': { lessons: ['une-lecon'], source: 'auteur-du-curriculum' },   // valide
  });
  assert.deepEqual(Object.keys(d), ['ex-c']);
});

test('V77 · CP8 — une déclaration sans leçon n’entre pas', () => {
  const d = normaliserDeclarations({
    'ex-a': { lessons: [], source: 'auteur-du-curriculum' },
    'ex-b': { source: 'auteur-du-curriculum' },
    'ex-c': { lessons: ['  '], source: 'auteur-du-curriculum' },
  });
  assert.deepEqual(Object.keys(d), []);
});

test('V77 · CP8 — le vocabulaire des sources est FERMÉ', () => {
  assert.deepEqual([...SOURCES_DECLARATION],
    ['auteur-du-curriculum', 'cite-dans-la-lecon', 'declare-ailleurs-dans-le-corpus']);
});

test('V77 · CP8 — aucune pollution de prototype par un fichier annexe', () => {
  const d = normaliserDeclarations({ __proto__: { lessons: ['x'], source: 'auteur-du-curriculum' } });
  assert.equal(Object.keys(d).length, 0);
  assert.equal(({}).lessons, undefined);
});

test('V77 · CP8 — un fichier absent ou illisible vaut « aucune déclaration »', () => {
  // L'absence est l'état LIVRÉ par le CP8 : elle ne doit casser personne.
  assert.deepEqual(normaliserDeclarations(null), {});
  assert.deepEqual(normaliserDeclarations('pas du JSON'), {});
  assert.deepEqual(normaliserDeclarations([]), {});
});

// ── 2 · LA RÈGLE R1b FONCTIONNE — ET NE PRÉCÈDE PAS LE CORPUS ──────────

test('V77 · CP8 — R1b résout un exercice qu’aucune règle ne tranchait', () => {
  // La preuve que le mécanisme n'est pas décoratif : le même exercice, avec et
  // sans déclaration hors corpus.
  const ctx = {
    declarants: [],
    leconsDuJour: ['lecon-a', 'lecon-b', 'lecon-c'],
    skillsExercice: [],
    skillsDeLecon: () => [],
  };
  const sans = resoudreExercice(ctx);
  assert.equal(sans.classe, 'AMBIGUOUS');
  assert.match(sans.regle, /^R5/);

  const avec = resoudreExercice({ ...ctx, declarantsHorsCorpus: ['lecon-b'] });
  assert.equal(avec.classe, 'UNAMBIGUOUS');
  assert.deepEqual(avec.concepts, ['lecon-b']);
  assert.match(avec.regle, /^R1b/, 'la règle doit se NOMMER : une résolution muette est inauditable');
});

test('V77 · CP8 — deux déclarations hors corpus = multi-concept, pas un choix', () => {
  const r = resoudreExercice({
    declarants: [], leconsDuJour: ['a', 'b', 'c'], skillsExercice: [], skillsDeLecon: () => [],
    declarantsHorsCorpus: ['a', 'b'],
  });
  assert.equal(r.classe, 'MULTI_CONCEPT_BY_DESIGN');
  assert.deepEqual(r.concepts, ['a', 'b']);
});

test('V77 · CP8 — le CORPUS fait foi : un fichier annexe ne le contredit pas', () => {
  // R1b vient APRÈS R1. Sans cet ordre, un fichier annexe pourrait remplacer en
  // silence une déclaration d'auteur déjà présente dans le curriculum.
  const r = resoudreExercice({
    declarants: ['lecon-du-corpus'],
    leconsDuJour: ['a', 'b'], skillsExercice: [], skillsDeLecon: () => [],
    declarantsHorsCorpus: ['lecon-annexe'],
  });
  assert.equal(r.classe, 'UNAMBIGUOUS');
  assert.deepEqual(r.concepts, ['lecon-du-corpus']);
  assert.match(r.regle, /^R1 /);
});

test('V77 · CP8 — `AMBIGUOUS` reste une RÉPONSE, avec sa raison', () => {
  const r = resoudreExercice({
    declarants: [], leconsDuJour: ['a', 'b', 'c', 'd'], skillsExercice: [], skillsDeLecon: () => [],
  });
  assert.equal(r.classe, 'AMBIGUOUS');
  assert.deepEqual(r.concepts, [], 'liste VIDE = concept inconnu, jamais « aucun concept »');
  assert.match(r.regle, /4 leçons candidates/, 'la raison est chiffrée, pas vague');
});

// ── 3 · CE QUE LE CHECKPOINT A LIVRÉ, ET CE QU'IL N'A PAS INVENTÉ ──────

test('V77 · CP8 — le fichier de déclaration vit HORS du corpus gelé', () => {
  // Ni un fichier d'exercice, ni `program.json`, ni un Markdown de curriculum :
  // modifier l'un de ces trois serait une modification du curriculum.
  assert.equal(CHEMIN_DECLARATIONS, 'data/exercise-declarations.json');
  assert.equal(CHEMIN_DECLARATIONS.startsWith('curriculum/'), false);
  assert.equal(CHEMIN_DECLARATIONS.includes('program.json'), false);
  assert.equal(CHEMIN_DECLARATIONS.includes('data/exercises/'), false);
});

test('V77 · CP8 — la mesure publiée dit 125 → 125, et l’assume', () => {
  const p = join(ROOT, 'docs', 'v77', 'cp8-ambiguite.json');
  assert.ok(existsSync(p), 'la mesure doit être publiée, pas seulement racontée');
  const m = JSON.parse(readFileSync(p, 'utf8'));
  assert.equal(m.avant.AMBIGUOUS, 125);
  assert.equal(m.apres.AMBIGUOUS, 125, 'aucun exercice n’a été résolu, et c’est le résultat');
  assert.equal(m.declarationsPresentes, 0, 'le fichier est livré VIDE');
});

test('V77 · CP8 — les quatre sources auditées ont un rendement PUBLIÉ', () => {
  // Un rendement nul MESURÉ vaut mieux qu'une piste jamais essayée : c'est ce
  // qui permet de dire que le blocage est dans la donnée, pas dans l'effort.
  const m = JSON.parse(readFileSync(join(ROOT, 'docs', 'v77', 'cp8-ambiguite.json'), 'utf8'));
  assert.equal(m.audit.length, 4);
  for (const a of m.audit) {
    assert.ok(typeof a.touches === 'number' && typeof a.tranchent === 'number', a.nom);
    assert.equal(a.tranchent, 0, `${a.nom} : si cette source tranche désormais, la mesure doit être refaite`);
  }
});

test('V77 · CP8 — la sous-classification couvre les 125, sans en reclasser un seul', () => {
  const m = JSON.parse(readFileSync(join(ROOT, 'docs', 'v77', 'cp8-ambiguite.json'), 'utf8'));
  assert.equal(m.sousClasses.length, 125);
  const total = Object.values(m.parSousClasse).reduce((a, b) => a + b, 0);
  assert.equal(total, 125);
  // La distinction doit avoir des conséquences : les deux classes existent.
  assert.ok(m.parSousClasse.METADATA_MISSING_CONSEQUENTE > 0);
  assert.ok(m.parSousClasse.METADATA_MISSING_SANS_CONSEQUENCE_COMPETENCE > 0);
  // Et chaque ligne porte de quoi la vérifier.
  for (const s of m.sousClasses.slice(0, 20)) {
    assert.ok(s.candidates >= 2, `${s.id} : un ambigu a au moins deux candidates`);
    assert.ok(Array.isArray(s.competences));
  }
});

test('V77 · CP8 — aucun exercice n’a été rattaché par heuristique', () => {
  // Le test qui garde l'interdit principal. Si un jour `apres.AMBIGUOUS` baisse
  // sans que `declarationsPresentes` augmente, quelqu'un aura deviné.
  const m = JSON.parse(readFileSync(join(ROOT, 'docs', 'v77', 'cp8-ambiguite.json'), 'utf8'));
  const resolus = m.avant.AMBIGUOUS - m.apres.AMBIGUOUS;
  assert.ok(resolus <= m.declarationsPresentes,
    `${resolus} exercice(s) résolu(s) pour ${m.declarationsPresentes} déclaration(s) : une résolution sans déclaration est une heuristique`);
});
