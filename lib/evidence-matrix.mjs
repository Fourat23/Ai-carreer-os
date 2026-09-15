// V77 · CP9 — LA MATRICE D'UNIFICATION DES PREUVES. Module PUR.
//
// ── CE QUE LES CHECKPOINTS PRÉCÉDENTS ONT LAISSÉ ÉPARPILLÉ ──────────────
//
// Le CP5 a posé un plafond par SOURCE, le CP6 un plafond par MOYEN. Les deux
// vivaient dans `lib/evidence.mjs`, chacun avec sa justification, et **personne
// ne pouvait lire la règle complète en un seul endroit**. C'est exactement la
// situation qui produit les incohérences que V77 passe son temps à retirer :
// deux phrases vraies séparément, dont la combinaison n'a jamais été relue.
//
// Ce module ÉNUMÈRE toutes les combinaisons et rend, pour chacune, ce que la
// preuve vaut et ce qu'elle qualifie. Rien n'est décidé ici : la dérivation
// reste `niveauDePreuve`. Ce qui est nouveau, c'est qu'on peut désormais la
// LIRE — et la tester exhaustivement plutôt que par échantillons.
//
// ── LA DÉCISION DU CP9 ──────────────────────────────────────────────────
//
// Le CP6 avait laissé une question ouverte, et elle était la plus lourde :
//
//   > `isQualifying` ignore le niveau. Une preuve `DECLARED` d'un type
//   > qualifiant portant `passed` crédite encore une compétence.
//
// Le contrat gelé au CP1 §2 ne laisse pas le choix :
//
//   > **Seul `VALIDATED` compte** pour compétence, rétention et récupération.
//
// La matrice applique donc cette phrase. `OBSERVED` et `DECLARED` ne qualifient
// rien — c'est délibérément sévère, et le contrat le dit : *sous-déclarer une
// maîtrise est moins grave que la sur-déclarer.*
//
// ── CE QUE LA MATRICE NE FAIT PAS ───────────────────────────────────────
//
// Elle ne distingue **pas** ce que la compétence, la rétention et la
// récupération qualifient. Le contrat les traite ensemble, et inventer trois
// règles là où il en pose une serait ajouter de la doctrine, pas de la
// précision. Les trois colonnes existent parce que le brief les demande ; elles
// disent la même chose, et ce module le dit plutôt que de le maquiller.
import {
  EVIDENCE_SOURCE_TYPES, VALIDATION_KINDS, VALIDATION_STATUSES,
  QUALIFYING_SOURCE_TYPES, NIVEAUX_DE_PREUVE, niveauDePreuve,
} from './evidence.mjs';

/** Les trois moteurs qui consomment une preuve. */
export const MOTEURS = Object.freeze(['competency', 'retention', 'recovery']);

/**
 * Une preuve qualifie-t-elle pour les moteurs ?
 *
 * Trois conditions, et il faut les TROIS :
 *   1. le type de source PEUT qualifier (règle V65, inchangée) ;
 *   2. la validation a ABOUTI (`passed`) ;
 *   3. le niveau dérivé vaut `VALIDATED` (contrat CP1 §2, appliqué au CP9).
 *
 * La troisième est la nouveauté, et elle est la raison d'être du checkpoint :
 * sans elle, `capstone` + `self` + `passed` créditait une compétence tout en
 * s'annonçant comme une auto-déclaration.
 */
export function qualifiePourLesMoteurs(sourceType, validation) {
  if (!QUALIFYING_SOURCE_TYPES.has(sourceType)) return false;
  if (validation?.status !== 'passed') return false;
  return niveauDePreuve(sourceType, validation) === 'VALIDATED';
}

/**
 * ── LA MATRICE, ÉNUMÉRÉE ─────────────────────────────────────────────────
 *
 * Toutes les combinaisons `sourceType × kind × status`, avec le niveau dérivé
 * et ce que chacune qualifie. `simulation` est une COLONNE et non une
 * dimension : elle ne change aucun niveau ni aucune qualification, et le
 * contrat l'exige — `VALIDATED` et `simulation: true` tiennent ensemble.
 * L'énumérer comme dimension doublerait la table pour rien ; l'afficher comme
 * colonne dit qu'elle est présente ET sans effet, ce qui est le fait.
 */
export function matriceDesPreuves() {
  const lignes = [];
  for (const sourceType of EVIDENCE_SOURCE_TYPES) {
    for (const kind of VALIDATION_KINDS) {
      for (const status of VALIDATION_STATUSES) {
        const validation = { status, kind, checkedAt: null, detail: '', score: null };
        const niveau = niveauDePreuve(sourceType, validation);
        const qualifie = qualifiePourLesMoteurs(sourceType, validation);
        lignes.push({
          sourceType,
          kind,
          status,
          evidenceLevel: niveau,
          /** Colonne, pas dimension : sans effet sur le niveau ni la qualification. */
          simulationChangeLeNiveau: false,
          qualifiesFor: Object.fromEntries(MOTEURS.map((m) => [m, qualifie])),
        });
      }
    }
  }
  return lignes;
}

/** Résumé par niveau — combien de combinaisons tombent dans chaque case. */
export function resumeParNiveau(lignes = matriceDesPreuves()) {
  const out = Object.fromEntries(NIVEAUX_DE_PREUVE.map((n) => [n, 0]));
  for (const l of lignes) out[l.evidenceLevel] += 1;
  return out;
}

/** Les combinaisons qui qualifient. Volontairement rares — et énumérables. */
export function combinaisonsQualifiantes(lignes = matriceDesPreuves()) {
  return lignes.filter((l) => l.qualifiesFor.competency)
    .map((l) => `${l.sourceType} + ${l.kind} + ${l.status}`);
}

/**
 * ── LES INCOHÉRENCES QUE LA MATRICE DOIT NE PAS CONTENIR ─────────────────
 *
 * Une matrice se relit mal à l'œil : 7 sources × 6 moyens × 4 statuts font 168
 * lignes. On énonce donc les propriétés, et on les vérifie sur la table entière
 * plutôt que sur des exemples choisis — c'est la différence entre « on a
 * regardé » et « on a vérifié ».
 */
export function incoherencesDeLaMatrice(lignes = matriceDesPreuves()) {
  const pb = [];
  for (const l of lignes) {
    // P1 — rien ne qualifie sans `VALIDATED`.
    if (l.qualifiesFor.competency && l.evidenceLevel !== 'VALIDATED') {
      pb.push(`${l.sourceType}+${l.kind}+${l.status} qualifie en ${l.evidenceLevel}`);
    }
    // P2 — rien ne qualifie sans `passed`.
    if (l.qualifiesFor.competency && l.status !== 'passed') {
      pb.push(`${l.sourceType}+${l.kind}+${l.status} qualifie sans réussite`);
    }
    // P3 — une auto-déclaration ne dépasse jamais `DECLARED`.
    if (l.kind === 'self' && l.evidenceLevel !== 'DECLARED') {
      pb.push(`${l.sourceType}+self atteint ${l.evidenceLevel}`);
    }
    // P4 — un type NON qualifiant ne qualifie jamais, quoi qu'il porte.
    if (!QUALIFYING_SOURCE_TYPES.has(l.sourceType) && l.qualifiesFor.competency) {
      pb.push(`${l.sourceType} qualifie alors que son type ne le peut pas`);
    }
    // P5 — les trois moteurs disent la même chose. Si un jour ils divergent,
    // c'est une décision qui doit être ÉCRITE, pas un effet de bord.
    const v = new Set(Object.values(l.qualifiesFor));
    if (v.size !== 1) pb.push(`${l.sourceType}+${l.kind}+${l.status} : moteurs divergents`);
  }
  return [...new Set(pb)];
}
