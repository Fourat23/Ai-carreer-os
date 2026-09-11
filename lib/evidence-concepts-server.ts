// V75 · CP3 — LE SECOND MAILLON DU CONTRAT DES CONCEPTS (côté serveur).
//
// `lib/evidence.mjs` est pur : il valide la FORME d'un identifiant de concept
// (slug minuscule, borné, sûr) mais ne peut pas vérifier qu'il désigne une
// leçon réelle — il faudrait lire le corpus, donc perdre sa pureté.
//
// Ce module ferme le contrat : il vérifie l'APPARTENANCE au catalogue des 128
// leçons. Un identifiant bien formé mais inconnu est **écarté**, jamais stocké.
// C'est la même règle que pour les compétences : *on ne garde pas un pointeur
// qui ne désigne rien.*
//
// ── CE QU'IL NE FAIT PAS ─────────────────────────────────────────────────
//
// Il n'INVENTE aucun `conceptId`. Quand l'appelant n'en connaît pas, il n'en
// fabrique pas : une preuve sans concept reste une preuve valide. Le CP0 a
// mesuré que **137 exercices sur 376 sont réellement ambigus** ; exiger un
// concept les rendrait tous irrecevables, ou pousserait à en choisir un au
// hasard — ce que V74 avait déjà refusé pour l'option C.
import { programConcepts } from './evidence';
import { getConceptCatalogue } from './retention-server';

let connus: Set<string> | null = null;

/** Les 128 slugs de leçon, lus une fois par processus (le corpus est gelé). */
function catalogue(): Set<string> {
  if (connus) return connus;
  connus = new Set(getConceptCatalogue().concepts.map((c) => c.id));
  return connus;
}

/**
 * Filtre une liste d'identifiants de concept : forme valide **et** présence au
 * catalogue. Rend une liste éventuellement vide.
 *
 * Vide signifie « aucun concept connu pour cette preuve », jamais « aucun
 * concept concerné » — la nuance est celle du contournement G9 de V74, et
 * c'est pourquoi le champ existe toujours au lieu d'être omis.
 */
export function conceptsDuCatalogue(ids: unknown): string[] {
  const c = catalogue();
  return (programConcepts(ids as string[]) as string[]).filter((id) => c.has(id));
}

// La résolution exercice → concepts vivait ici au CP3, limitée aux déclarations
// de leçon. Le CP4 l'a reprise dans `lib/exercise-concepts-server.ts` avec deux
// règles de plus ; la garder en double aurait créé deux réponses possibles à la
// même question, et c'est précisément ce qu'on essaie de supprimer.
