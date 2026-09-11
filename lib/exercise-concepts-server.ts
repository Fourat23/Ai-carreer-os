// V75 · CP4 — RÉSOLUTION EXERCICE → CONCEPTS (dette D8), côté serveur.
//
// Ce module ne DÉCIDE rien : la cascade R1→R4 vit dans `lib/exercise-mapping.mjs`
// (pure, testée, partagée avec la mesure du CP4). Ici on fait l'I/O que ce
// module refuse de faire — lire le corpus pour savoir qui déclare quoi, quelles
// leçons chaque journée enseigne, et quelles compétences chaque leçon porte.
//
// C'est la séparation habituelle du dépôt (`retention.mjs` / `retention-server.ts`),
// et elle a une raison précise ici : la mesure publiée au CP4 et le
// comportement du produit doivent venir du MÊME code. Deux implémentations
// donneraient deux vérités.
//
// ── CE QUE ÇA A DONNÉ, MESURÉ (`scripts/v75/cp4-mapping.mjs`) ────────────
//
//   UNAMBIGUOUS              140      RESOLVABLE_FROM_CONTEXT   32
//   MULTI_CONCEPT_BY_DESIGN   67      RESOLVED_BY_SKILL         12
//   AMBIGUOUS                125  (avant : 137)                ORPHAN 0
//
// **Le gain est modeste et je ne l'habille pas : 137 → 125, soit 9 %.** Les
// 125 restants sont proposés par des journées qui enseignent plusieurs leçons
// de la MÊME compétence ; rien dans la donnée déclarée ne les distingue. Les
// résoudre demanderait une décision d'auteur, pas un algorithme — et en
// inventer une serait exactement ce que le brief interdit.
import { resoudreExercice } from './exercise-mapping.mjs';
import { getProgram } from './program';
import { getDayExerciseIndex } from './day-exercises-server';
import { daysForExercise } from './day-exercises';
import { getConceptCatalogue } from './retention-server';
import { conceptsDuCatalogue } from './evidence-concepts-server';

export type ClasseExercice =
  | 'UNAMBIGUOUS' | 'MULTI_CONCEPT_BY_DESIGN' | 'RESOLVABLE_FROM_CONTEXT'
  | 'RESOLVED_BY_SKILL' | 'AMBIGUOUS' | 'ORPHAN';

export interface ResolutionExercice {
  /** Vide = « concept inconnu », jamais « aucun concept concerné ». */
  concepts: string[];
  classe: ClasseExercice;
  /** La règle qui a tranché, en clair. Une résolution muette est inauditable. */
  regle: string;
}

interface Contexte {
  declarants: Map<string, string[]>;
  skillsDeLecon: Map<string, string[]>;
  leconsDuJour: Map<number, string[]>;
}
let ctx: Contexte | null = null;

function contexte(): Contexte {
  if (ctx) return ctx;
  const lessons = getProgram().lessons ?? [];

  const declarants = new Map<string, string[]>();
  for (const l of lessons) {
    for (const r of l.practiceRefs ?? []) {
      if (r.kind !== 'exercise') continue;
      if (!declarants.has(r.id)) declarants.set(r.id, []);
      declarants.get(r.id)!.push(l.slug);
    }
  }
  const skillsDeLecon = new Map(lessons.map((l) => [l.slug, l.skills ?? []]));

  // Les leçons enseignées chaque journée, dérivées du catalogue de concepts —
  // la même source que le reste du produit, jamais une seconde lecture du
  // corpus qui pourrait en diverger.
  const { conceptDays } = getConceptCatalogue();
  const leconsDuJour = new Map<number, string[]>();
  for (const [slug, jours] of Object.entries(conceptDays)) {
    for (const j of jours) {
      if (!leconsDuJour.has(j)) leconsDuJour.set(j, []);
      leconsDuJour.get(j)!.push(slug);
    }
  }

  ctx = { declarants, skillsDeLecon, leconsDuJour };
  return ctx;
}

/**
 * Les concepts d'un exercice, avec la RÈGLE qui a tranché.
 *
 * @param exerciseId identifiant de l'exercice
 * @param skills     compétences déclarées par l'exercice (vocabulaire fin)
 */
export function conceptsDeLExerciceResolu(exerciseId: string, skills: string[] = []): ResolutionExercice {
  const c = contexte();
  const jours = daysForExercise(getDayExerciseIndex(), exerciseId);

  const r = resoudreExercice({
    declarants: c.declarants.get(exerciseId) ?? [],
    leconsDuJour: [...new Set(jours.flatMap((j) => c.leconsDuJour.get(j) ?? []))],
    skillsExercice: skills,
    skillsDeLecon: (slug: string) => c.skillsDeLecon.get(slug) ?? [],
  }) as ResolutionExercice;

  // Dernier filtre : un slug doit désigner une leçon RÉELLE du catalogue.
  // Même règle que pour les compétences — on ne garde pas un pointeur qui ne
  // désigne rien. Si le filtre vide la liste, la classe reste celle qui a
  // tranché : l'information « on savait, mais le pointeur est mort » vaut mieux
  // qu'un `AMBIGUOUS` qui ferait croire à une indécision.
  return { ...r, concepts: conceptsDuCatalogue(r.concepts) };
}
