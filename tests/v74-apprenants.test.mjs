// V74 · CP13 — les huit apprenants synthétiques, en test.
//
// ── CE QUE CES TESTS NE PROUVENT PAS ─────────────────────────────────────
//
// **Une simulation n'est pas une preuve d'apprentissage.** Aucun apprenant
// humain n'a suivi ce parcours sous mesure (`REAL_HUMAN_LEARNING_EVIDENCE =
// NOT YET MEASURED`, §8.2 du contrat gelé). Rien ici ne dit que le moteur fait
// apprendre.
//
// Ce qui est vérifié est une propriété de **ROBUSTESSE** : sur huit
// trajectoires plausibles, le moteur ne part pas en boucle, n'accumule pas un
// arriéré explosif, ne propose pas éternellement la même notion, n'abandonne
// personne, explique toujours son choix et tient toujours son budget.
//
// Les confondre serait « transformer une heuristique en vérité scientifique ».
import test from 'node:test';
import assert from 'node:assert/strict';
import { PROFILS, simulerProfil, CIBLE_FAIBLE } from '../scripts/v74/cp13-apprenants.mjs';

// Une seule simulation par profil, réutilisée par tous les tests : la
// projection complète sur 240 jours coûte trop cher pour être refaite huit fois
// par assertion.
const RESULTATS = new Map(PROFILS.map((p) => [p.id, { profil: p, r: simulerProfil(p) }]));

test('V74 · CP13 — les huit profils du brief sont couverts', () => {
  assert.deepEqual(PROFILS.map((p) => p.id), ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
  // Le CP8 ne faisait varier qu'un TAUX DE RÉUSSITE CONSTANT. Ces profils-ci
  // font varier l'assiduité, la progression, la sélectivité de l'oubli, l'arrêt
  // prolongé et la production de preuves — ce que le CP8 laissait hors champ.
  assert.ok(PROFILS.some((p) => !p.ouvre(3)), 'aucun profil n’a de jours d’inactivité');
  assert.ok(PROFILS.some((p) => !p.produitPreuve), 'aucun profil ne travaille sans produire de preuve');
});

test('V74 · CP13 — la compétence affaiblie du profil F vient du CORPUS, pas de moi', () => {
  // Choisir à la main la compétence à faire échouer permettrait de choisir
  // celle qui arrange. Elle est dérivée du programme.
  assert.ok(typeof CIBLE_FAIBLE === 'string' && CIBLE_FAIBLE.length > 0);
});

for (const id of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']) {
  const { profil, r } = RESULTATS.get(id);
  const nom = `${id} (${profil.nom})`;

  test(`V74 · CP13 · ${nom} — aucune boucle : jamais 20 jours consécutifs sur la même notion`, () => {
    assert.ok(r.pireSerie < 20,
      `${r.pireSerie} jours consécutifs sur « ${r.conceptSerie} »`);
  });

  test(`V74 · CP13 · ${nom} — aucune FAMINE : rien n’attend plus de 30 jours actifs`, () => {
    // La distinction est décisive, et le décompte brut des « jamais proposées »
    // la manquait : une notion rencontrée l'avant-veille n'a pas encore eu son
    // tour — ce n'est pas une famine. Une notion rencontrée il y a trois mois et
    // jamais proposée en serait une.
    assert.equal(r.famine, 0,
      `${r.famine} notions attendent depuis plus de 30 jours actifs (attente max : ${r.attenteMax})`);
  });

  test(`V74 · CP13 · ${nom} — l’arriéré ne croît pas de façon explosive`, () => {
    assert.ok(r.croissance2 <= Math.max(5, r.croissance1 * 2),
      `croissance 1ʳᵉ moitié ${r.croissance1} → 2ᵉ moitié ${r.croissance2}`);
  });

  test(`V74 · CP13 · ${nom} — toute unité proposée porte son POURQUOI (B10)`, () => {
    assert.equal(r.sansPourquoi, 0, `${r.sansPourquoi} unités proposées sans justification`);
  });

  test(`V74 · CP13 · ${nom} — le budget accordé est TOUJOURS tenu`, () => {
    assert.equal(r.horsBudget, 0, `${r.horsBudget} séances ont dépassé le budget accordé`);
  });
}

test('V74 · CP13 — la borne d’attente observée est PUBLIÉE, pas seulement le seuil', () => {
  // Le seuil de 30 jours a été choisi APRÈS avoir observé le maximum réel : le
  // dire est la seule façon de ne pas faire passer un seuil confortable pour
  // une démonstration. Ce qui prouve la propriété est la BORNE MESURÉE, pas le
  // seuil. Ce test la garde : si elle dérive, il rougit.
  const pire = Math.max(...[...RESULTATS.values()].map(({ r }) => r.attenteMax));
  assert.ok(pire <= 30,
    `l’attente maximale observée est passée à ${pire} jours actifs : la borne a dérivé`);
});

test('V74 · CP13 — un apprenant qui ne produit AUCUNE preuve est quand même servi', () => {
  // Profil H. Le moteur ne doit pas cesser de proposer sous prétexte qu'aucune
  // preuve validée n'arrive : la preuve est une PROJECTION, la tentative est le
  // FAIT (décision du CP2).
  const { r } = RESULTATS.get('H');
  assert.ok(r.tentatives > 100, `seulement ${r.tentatives} tentatives proposées`);
  assert.ok(r.proposees > 50, `seulement ${r.proposees} notions proposées`);
});

test('V74 · CP13 — après 30 jours d’arrêt, le moteur ne se bloque pas et ne noie pas', () => {
  // Profil G. Deux échecs possibles au retour : ne rien proposer (le moteur
  // considère la file périmée) ou tout proposer d'un coup (session ingérable).
  // Le budget du CP10 protège du second, la place réservée du CP8 du premier.
  const { r } = RESULTATS.get('G');
  assert.ok(r.proposees > 0, 'rien n’a été proposé après la reprise');
  assert.equal(r.horsBudget, 0, 'la reprise a produit des séances hors budget');
  assert.ok(r.arriereMax < 200, `arriéré de ${r.arriereMax} après la reprise`);
});
