// V77 · CP13 — LES CHAÎNES TRAVERSÉES DE BOUT EN BOUT, ET LEUR RÉSULTAT PINÉ.
//
// ── CE QUE CES TESTS GARDENT, ET CE QU'ILS NE GARDENT PAS ──────────────
//
// La vraie mesure est `scripts/v77/cp13-e2e.mjs` : il lance six chaînes en HTTP
// contre le produit RECONSTRUIT, et lit l'état par l'EXPORT du produit — pas par
// le fichier sur disque, pour ne pas mesurer son propre appareil.
//
// Ces tests-ci gardent son RÉSULTAT publié. Ils ne remplacent pas le script : ils
// empêchent qu'un comportement change sans que personne ne le rejoue. Si le
// produit change, le fichier publié devient faux et ces tests rougissent — ce
// qui est exactement le signal qu'il faut relancer la sonde.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const P = join(ROOT, 'docs', 'v77', 'cp13-e2e.json');
const M = existsSync(P) ? JSON.parse(readFileSync(P, 'utf8')) : null;
const chaine = (prefixe) => M.chaines.find((c) => c.nom.startsWith(prefixe));

test('V77 · CP13 — la mesure de bout en bout est PUBLIÉE, pas seulement racontée', () => {
  assert.ok(M, 'docs/v77/cp13-e2e.json doit exister');
  assert.equal(M.chaines.length, 6);
});

test('V77 · CP13 — C1 : une production, UNE seule preuve qualifiante', () => {
  // La chaîne du défaut A13 du CP0 : deux preuves qualifiantes sur la même
  // compétence à partir d'un exercice + un document faux + un clic.
  const c = chaine('C1');
  assert.equal(c.ecrit.evidence, 2, 'les deux preuves existent toujours');
  assert.equal(c.ecrit.evidenceQualifiantes, 1, 'une seule démontre');
  assert.equal(c.ecrit.exerciseAttempts, 1);
  assert.equal(c.ecrit.missionSubmissions, 3, 'document + auto-évaluation + validation');
  assert.ok(c.preuves.some((p) => p.includes('exercise:') && p.includes('VALIDATED')));
  assert.ok(c.preuves.some((p) => p.includes('mission:') && p.includes('manual/mission-deliverables DECLARED')));
});

test('V77 · CP13 — C2 : la courbe d’un diagnostic est conservée', () => {
  const c = chaine('C2');
  assert.equal(c.ecrit.assessmentAttempts, 2, 'avant le CP4 : une seule trace');
  assert.equal(c.ecrit.evidence, 2);
  assert.equal(c.ecrit.evidenceQualifiantes, 1, 'seule la réussite démontre');
  assert.ok(c.preuves.some((p) => p.includes('failed/assessment-grade OBSERVED')));
  assert.ok(c.preuves.some((p) => p.includes('passed/assessment-grade VALIDATED')));
});

test('V77 · CP13 — C3 : le capstone est archivé pour ce qu’il est', () => {
  const c = chaine('C3');
  assert.equal(c.ecrit.assessmentAttempts, 1);
  assert.equal(c.ecrit.evidenceQualifiantes, 1);
  assert.ok(c.preuves.some((p) => p.includes('capstone-grade VALIDATED')),
    'avant le CP6 : `self`, donc une auto-déclaration');
});

test('V77 · CP13 — C4 : analyser la FIXTURE n’écrit rien ; un artefact posté, oui', () => {
  // La garde la plus facile à perdre du CP7, vérifiée sur le produit qui tourne.
  const c = chaine('C4');
  assert.deepEqual(c.ecritSansArtefact, {}, 'analyser la fixture ne doit RIEN écrire');
  assert.equal(c.ecrit.artifactAnalyses, 2, 'deux versions postées = deux productions');
  assert.equal(c.ecrit.evidence ?? 0, 0, 'un artefact analysé ne produit AUCUNE preuve');
});

test('V77 · CP13 — C5 : un usage ne produit ni preuve ni fait pédagogique', () => {
  const c = chaine('C5');
  assert.equal(c.ecrit.usageEvents, 2);
  assert.equal(c.ecrit.evidence ?? 0, 0);
  assert.equal(c.ecrit.exerciseAttempts ?? 0, 0);
  assert.equal(c.ecrit.assessmentAttempts ?? 0, 0);
  // Le pipeline a rendu un verdict, et le fait ne le porte pas.
  assert.match(c.note, /success/);
});

test('V77 · CP13 — C6 : une chaîne qui n’écrit RIEN est une réponse VALIDE', () => {
  // Consulter, réinitialiser, demander le corrigé du produit : aucun de ces
  // gestes n'est un travail de l'apprenant. Réparer cette chaîne pour remplir
  // un tableau serait exactement le piège que V77 évite.
  const c = chaine('C6');
  assert.deepEqual(c.ecrit, {});
});

test('V77 · CP13 — la sonde lit l’état par l’EXPORT, pas par son propre fichier', () => {
  // Une sonde qui lirait le disque qu'elle vient d'écrire mesurerait son
  // appareil. V76 · CP14 a payé trois faux survivants pour cette leçon.
  const src = readFileSync(join(ROOT, 'scripts', 'v77', 'cp13-e2e.mjs'), 'utf8');
  assert.ok(src.includes("get('/api/progress/export')"));
  assert.equal(src.includes('readFileSync(PROG'), false);
});

test('V77 · CP13 — la sonde ne contourne AUCUNE garantie du produit', () => {
  // Les corrigés ne sont jamais servis par l'API (V76). La sonde les lit dans
  // les fixtures, comme un auteur — elle n'ouvre pas une porte pour se faciliter
  // la tâche, ce qui invaliderait la mesure et la garantie.
  const src = readFileSync(join(ROOT, 'scripts', 'v77', 'cp13-e2e.mjs'), 'utf8');
  assert.ok(src.includes("'data', 'exercises'"), 'le corrigé vient de la fixture');
  assert.equal(/exercise\?\.reference|json\?\.exercise\?\.reference/.test(src), false,
    'aucune tentative de lire un corrigé depuis l’API');
});
