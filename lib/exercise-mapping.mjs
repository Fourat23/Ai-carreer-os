// V75 · CP4 — RÉSOLUTION EXERCICE → CONCEPTS (dette D8). Module PUR.
//
// ── LE PROBLÈME, MESURÉ ──────────────────────────────────────────────────
//
// Le CP0 de V74 avait publié « 192 exercices ambigus ». Le CP0 de V75 a refait
// la mesure : **137**, dont 67 multi-concepts PAR CONCEPTION et 32 résolubles
// par le contexte de leur journée. Ce module traite ce qui est traitable.
//
// ── LA RÈGLE DU CHECKPOINT ───────────────────────────────────────────────
//
// **Réduire l'ambiguïté RÉELLE, jamais la cacher.** Un exercice n'est rattaché
// que si une règle NOMMÉE le désigne SANS CHOIX ARBITRAIRE. Quand rien ne
// tranche, la fonction rend une liste VIDE et le dit : `AMBIGUOUS` est une
// réponse, pas un échec. Choisir une leçon au hasard parmi les candidates
// fabriquerait de la donnée — exactement ce que le brief interdit (R-« ne pas
// fabriquer une maîtrise »).
//
// ── LA CASCADE, DU PLUS FIABLE AU MOINS FIABLE ───────────────────────────
//
//   R1  une seule leçon DÉCLARE l'exercice   → intention d'auteur explicite
//   R2  plusieurs leçons le déclarent        → multi-concept PAR CONCEPTION,
//                                              on garde TOUTES les déclarantes
//   R3  sa journée n'enseigne qu'une leçon   → aucun choix n'est possible
//   R4  une seule leçon de sa journée partage
//       une compétence CANONIQUE avec lui    → la donnée désigne seule
//
// L'ORDRE EST LA DÉCISION. On s'arrête à la première règle qui tranche.
//
// ── CE QUE ÇA DONNE, ET CE QUE ÇA NE DONNE PAS ───────────────────────────
//
//   AMBIGUOUS : 137 → 125. **Le gain est de 9 %, et je ne l'habille pas.**
//
// Les 125 restants sont proposés par des journées qui enseignent plusieurs
// leçons de la MÊME compétence : rien dans la donnée déclarée ne les
// distingue. Les résoudre demanderait une décision d'AUTEUR (ajouter un
// `practiceRefs` dans la bonne leçon), pas un algorithme.
//
// ── POURQUOI CE MODULE EST PUR ───────────────────────────────────────────
//
// Le contexte (déclarants, leçons par journée, compétences par leçon) est
// INJECTÉ. Deux appelants s'en servent — `lib/exercise-concepts-server.ts` pour
// le produit, `scripts/v75/cp4-mapping.mjs` pour la mesure — et ils doivent
// répondre la MÊME chose. Deux implémentations donneraient deux vérités, ce
// qui est le défaut qu'on essaie de supprimer, pas de reproduire.
import { programSkills } from './skill-taxonomy.mjs';

/** Les six classes possibles. `AMBIGUOUS` et `ORPHAN` sont des RÉSULTATS. */
export const CLASSES_EXERCICE = Object.freeze([
  'UNAMBIGUOUS', 'MULTI_CONCEPT_BY_DESIGN', 'RESOLVABLE_FROM_CONTEXT',
  'RESOLVED_BY_SKILL', 'AMBIGUOUS', 'ORPHAN',
]);

/** Les classes qui rattachent l'exercice à au moins un concept. */
export const CLASSES_RATTACHEES = Object.freeze([
  'UNAMBIGUOUS', 'MULTI_CONCEPT_BY_DESIGN', 'RESOLVABLE_FROM_CONTEXT', 'RESOLVED_BY_SKILL',
]);

const liste = (v) => (Array.isArray(v) ? v.filter((s) => typeof s === 'string' && s) : []);

/**
 * Applique la cascade R1→R4.
 *
 * @param {object}   ctx
 * @param {string[]} ctx.declarants      leçons qui déclarent l'exercice (`practiceRefs`)
 * @param {string[]} ctx.leconsDuJour    leçons enseignées les jours où il est proposé
 * @param {string[]} ctx.skillsExercice  compétences de l'exercice (vocabulaire fin)
 * @param {(slug:string)=>string[]} ctx.skillsDeLecon  compétences d'une leçon
 * @returns {{concepts:string[], classe:string, regle:string}}
 *          `regle` est obligatoire : une résolution muette est inauditable.
 */
export function resoudreExercice({
  declarants = [], leconsDuJour = [], skillsExercice = [], skillsDeLecon = () => [],
} = {}) {
  const decl = [...new Set(liste(declarants))];

  // R1 — DÉCLARATION UNIQUE. Un auteur a écrit « cet exercice pratique cette
  // leçon ». Aucune inférence ne vaut cette phrase-là.
  if (decl.length === 1) {
    return { concepts: decl, classe: 'UNAMBIGUOUS', regle: 'R1 · déclaré par une seule leçon' };
  }

  // R2 — DÉCLARATIONS MULTIPLES. Ce n'est PAS une ambiguïté à trancher :
  // plusieurs leçons ont délibérément choisi le même exercice. Le CP0 en a
  // mesuré 67. N'en garder qu'une serait perdre un fait, pas en gagner un.
  if (decl.length > 1) {
    return { concepts: decl, classe: 'MULTI_CONCEPT_BY_DESIGN', regle: `R2 · déclaré par ${decl.length} leçons` };
  }

  const parJour = [...new Set(liste(leconsDuJour))];

  // Aucun rattachement possible : l'exercice n'est proposé par aucune journée
  // connue et aucune leçon ne le déclare. Le CP0 en a mesuré 0 ; le cas reste
  // traité parce qu'un corpus change.
  if (parJour.length === 0) {
    return { concepts: [], classe: 'ORPHAN', regle: 'R0 · aucune leçon, aucune journée' };
  }

  // R3 — JOURNÉE À LEÇON UNIQUE. La coïncidence de calendrier ne vaut
  // normalement rien (médiane 3 candidates, jusqu'à 15) — sauf quand il n'y a
  // littéralement rien à choisir.
  if (parJour.length === 1) {
    return { concepts: parJour, classe: 'RESOLVABLE_FROM_CONTEXT', regle: 'R3 · sa journée n’enseigne qu’une leçon' };
  }

  // R4 — INTERSECTION DE COMPÉTENCES, sur un vocabulaire CANONIQUE.
  //
  // Première version : je comparais les `skills` de l'exercice (vocabulaire fin
  // de 51 termes — `hooks`, `accessibility`, `arrays`…) aux `skills` des leçons
  // (les 20 compétences du programme). **Deux vocabulaires différents.**
  // L'intersection était vide presque partout et la règle ne résolvait que 9
  // exercices au lieu de 12. `skill-taxonomy.mjs` fait déjà cette traduction
  // (`['react','state','events','hooks'] → ['jsts']`) : on l'utilise plutôt que
  // d'inventer une seconde table de correspondance qui divergerait.
  const sEx = new Set(programSkills(skillsExercice));
  if (sEx.size) {
    const compatibles = parJour.filter((slug) => programSkills(skillsDeLecon(slug) ?? []).some((k) => sEx.has(k)));
    // UNE seule compatible, sinon rien. Deux compatibles, c'est un choix ;
    // prendre « la première » serait arbitraire et invisible.
    if (compatibles.length === 1) {
      return { concepts: compatibles, classe: 'RESOLVED_BY_SKILL', regle: 'R4 · une seule leçon de sa journée partage sa compétence' };
    }
  }

  // Rien ne tranche. On le DIT. La liste vide signifie « concept inconnu »,
  // jamais « aucun concept concerné » — la nuance est celle du G9 de V74.
  return { concepts: [], classe: 'AMBIGUOUS', regle: `R5 · ${parJour.length} leçons candidates, aucune règle ne tranche` };
}
