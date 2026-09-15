// V77 · CP8 — DÉCLARER UN RATTACHEMENT **HORS DU CORPUS GELÉ**.
//
// ── POURQUOI CE FICHIER EXISTE ──────────────────────────────────────────
//
// Le CP0 a mesuré les 125 exercices `AMBIGUOUS` et leur cause UNIQUE : `R5 · N
// leçons candidates, aucune règle ne tranche`. La raison de fond n'est pas un
// défaut d'algorithme :
//
//   > un fichier d'exercice ne contient **ni `conceptIds` ni `lessonRefs`**.
//
// Le rattachement est entièrement dérivé du calendrier. Quand une journée
// enseigne plusieurs leçons, rien ne tranche — **et c'est correct de ne pas
// trancher**. Les résoudre demande une décision d'AUTEUR, pas un algorithme.
//
// Or le corpus est GELÉ : ajouter un champ dans les 376 fichiers d'exercice ou
// dans `data/program.json` (généré) serait une modification du curriculum, que
// le brief interdit. D'où ce fichier : **une déclaration d'auteur qui vit à
// côté**, auditée, versionnée, et que le générateur ne touche jamais.
//
// ── CE QUE CE MÉCANISME N'EST PAS ───────────────────────────────────────
//
// **Ce n'est pas un endroit où deviner.** Une entrée n'a le droit d'exister que
// si une source pédagogique RÉELLE la soutient, et chaque entrée doit dire
// laquelle (`source`). Une déclaration sans source est refusée — pas corrigée,
// pas ignorée en silence : refusée.
//
// Le CP8 a audité quatre sources possibles et publié leur rendement, y compris
// nul (`docs/v77/V77-CP8-AMBIGUITE.md`). Le fichier est donc livré **vide ou
// presque**, et c'est le résultat honnête : le blocage est dans la donnée, pas
// dans l'effort. `125 → 0 n'est pas un objectif.`
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

/** Le chemin, exporté pour que la mesure et le produit parlent du même fichier. */
export const CHEMIN_DECLARATIONS = 'data/exercise-declarations.json';

/**
 * Les sources qu'une déclaration peut invoquer. Vocabulaire FERMÉ : une source
 * libre permettrait d'écrire « évident » et de refermer le débat.
 */
export const SOURCES_DECLARATION = Object.freeze([
  // Un auteur a écrit la leçon et sait quel exercice elle pratique.
  'auteur-du-curriculum',
  // La leçon nomme l'exercice dans son texte, sans l'avoir mis en `practiceRefs`.
  'cite-dans-la-lecon',
  // Le corpus déclare déjà le lien ailleurs, et on ne fait que le recopier ici.
  'declare-ailleurs-dans-le-corpus',
]);

/**
 * Normalise le contenu du fichier. Ce qui ne porte pas de source reconnue
 * n'entre pas — et le silence n'est pas une source.
 *
 * @param {unknown} raw  contenu JSON brut
 * @returns {Record<string, {lessons: string[], source: string, note: string}>}
 */
export function normaliserDeclarations(raw) {
  const src = isObj(raw) ? (isObj(raw.exercises) ? raw.exercises : raw) : {};
  const out = {};
  for (const id of Object.keys(src)) {
    if (id === '__proto__' || id === 'constructor' || id === 'prototype') continue;
    const e = src[id];
    if (!isObj(e)) continue;
    if (!SOURCES_DECLARATION.includes(e.source)) continue;
    const lessons = Array.isArray(e.lessons)
      ? [...new Set(e.lessons.filter((s) => typeof s === 'string' && s.trim()).map((s) => s.trim().slice(0, 120)))]
      : [];
    if (lessons.length === 0) continue;
    out[id.slice(0, 120)] = {
      lessons: lessons.slice(0, 12),
      source: e.source,
      note: typeof e.note === 'string' ? e.note.slice(0, 300) : '',
    };
  }
  return out;
}

/**
 * ── CE MODULE EST PUR, ET LA LECTURE VIT AILLEURS ────────────────────────
 *
 * `lib/exercise-declarations-server.ts` fait l'I/O que celui-ci refuse, et la
 * mesure du CP8 lit le fichier elle-même. C'est la séparation habituelle du
 * dépôt, et elle a une raison précise ici : la normalisation doit être testable
 * sans disque, et identique pour le produit et pour la mesure. Deux
 * implémentations donneraient deux vérités.
 */
