// V74 · CP7 — RESSOURCES DE REMÉDIATION (côté serveur).
//
// `lib/remediation.mjs` décide QUELLE marche proposer. Il ne sait pas lire le
// disque, et c'est volontaire (pureté, critère B2). Ce module fait l'I/O qu'il
// refuse : il va chercher, pour un exercice donné, les ressources RÉELLES sur
// lesquelles chaque marche s'appuie.
//
// La règle du module est celle du CP5 : **on ne rend une ressource que si elle
// existe.** Une section absente rend `false`, un voisin introuvable rend
// `null`, et le moteur replie en le disant plutôt que de proposer un pointeur
// vers une page qui n'existe pas.
//
// Aucun registre nouveau n'est créé. Les misconceptions viennent de
// `lib/misconceptions.mjs` (57 entrées, 18 compétences), qui existait avant
// V74 ; les rattacher ici plutôt que de les redéclarer est ce qui évite le
// doublon que le brief interdit.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { getExercise } from './exercises-server';
import { getDayExerciseIndex } from './day-exercises-server';
import { daysForExercise } from './day-exercises';
import { getConceptCatalogue } from './retention-server';
import { MISCONCEPTIONS } from './misconceptions';
import { plusSimpleParmi, leconUnique } from './remediation';

const ROOT = process.cwd();
const CUR = join(ROOT, 'curriculum');
const EX_DIR = join(ROOT, 'data', 'exercises');

/** Sections d'une leçon mobilisables par une marche de remédiation. */
export interface SectionsRemediation {
  modeleMental: boolean;
  erreurs: boolean;
  antipatterns: boolean;
  exempleGuide: boolean;
  exempleApplique: boolean;
  correction: boolean;
}

export interface RessourcesRemediation {
  sections: SectionsRemediation;
  misconception: { id: string; right: string } | null;
  voisinPlusSimple: { id: string; title: string; difficulty: number } | null;
  /** Leçon dont les sections ont été lues, pour que le pointeur soit cliquable. */
  leconRef: string | null;
}

// L'émoji de tête décore le titre, il ne le définit pas — c'est l'anomalie de
// sonde n° 6 du CP5, et elle ne doit pas se rejouer ici.
const nu = (t: string) => String(t).replace(/^[^\p{L}]+/u, '').trim();

const MOTIFS: Record<keyof SectionsRemediation, RegExp> = {
  modeleMental: /mod[eè]le mental/i,
  erreurs: /erreurs fr[eé]quentes/i,
  antipatterns: /anti-?patterns/i,
  exempleGuide: /exemple guid/i,
  exempleApplique: /exemple appliqu/i,
  correction: /correction/i,
};

const VIDE: SectionsRemediation = {
  modeleMental: false, erreurs: false, antipatterns: false,
  exempleGuide: false, exempleApplique: false, correction: false,
};

type ExerciceBref = { id: string; title: string; difficulty: number; skills: string[] };
let catalogue: ExerciceBref[] | null = null;

/**
 * Catalogue léger des 376 exercices : identifiant, titre, difficulté,
 * compétences. Rien d'autre — surtout pas les tests ni la solution de
 * référence, qui n'ont aucune raison de traverser ce chemin.
 */
function getCatalogueExercices(): ExerciceBref[] {
  if (catalogue) return catalogue;
  catalogue = readdirSync(EX_DIR).filter((f) => f.endsWith('.json')).map((f) => {
    const j = JSON.parse(readFileSync(join(EX_DIR, f), 'utf8')) as
      { id: string; title?: string; difficulty?: number; skills?: string[] };
    return {
      id: j.id,
      title: j.title ?? j.id,
      difficulty: Number(j.difficulty) || 0,
      skills: Array.isArray(j.skills) ? j.skills : [],
    };
  });
  return catalogue;
}

/**
 * Sections réellement présentes dans une leçon. Mesuré au CP7 sur les 128
 * leçons : « Modèle mental » 128, « Erreurs fréquentes » 128, « Exemple
 * guidé » 128, « Correction attendue » 127, « Anti-patterns » 51, « Exemple
 * appliqué » 39.
 */
export function sectionsDeLecon(slug: string): SectionsRemediation {
  const path = join(CUR, 'lessons', `${slug}.md`);
  if (!existsSync(path)) return { ...VIDE };
  const titres = [...readFileSync(path, 'utf8').matchAll(/^## +(.+)$/gm)].map((m) => nu(m[1]));
  const out = { ...VIDE };
  for (const k of Object.keys(MOTIFS) as (keyof SectionsRemediation)[]) {
    out[k] = titres.some((t) => MOTIFS[k].test(t));
  }
  return out;
}

/**
 * La leçon d'un exercice, ou `null`.
 *
 * Ce module ne DÉCIDE pas : il collecte les deux ensembles de candidates et
 * délègue l'arbitrage à `leconUnique` du module pur. C'est ce qui permet à la
 * sonde `scripts/v74/cp7-rattachement.mjs` de mesurer la MÊME règle que celle
 * que le produit applique, au lieu d'en réimplémenter une approchante.
 */
export function leconDeLExercice(exerciseId: string): { slug: string; via: string } | null {
  const program = JSON.parse(readFileSync(join(ROOT, 'data', 'program.json'), 'utf8')) as
    { lessons?: { slug: string; practiceRefs?: { kind: string; id: string }[] }[] };
  const declarants = (program.lessons ?? [])
    .filter((l) => (l.practiceRefs ?? []).some((r) => r.kind === 'exercise' && r.id === exerciseId))
    .map((l) => l.slug);

  const jours = daysForExercise(getDayExerciseIndex(), exerciseId);
  const { conceptDays } = getConceptCatalogue();
  const parJournee = jours.length
    ? Object.entries(conceptDays).filter(([, days]) => days.some((d) => jours.includes(d))).map(([slug]) => slug)
    : [];

  return leconUnique(declarants, parJournee) as { slug: string; via: string } | null;
}

/**
 * La misconception enregistrée pour un exercice, ou `null`.
 *
 * Le rattachement NOMMÉ est le seul retenu : 121 exercices sur 376 sont cités
 * explicitement par une des 57 entrées, et zéro référence fantôme. Rattacher
 * par COMPÉTENCE aurait couvert 172 exercices, mais aurait aussi servi à un
 * apprenant l'idée fausse d'un autre exercice de la même compétence — un
 * indice faux est pire qu'aucun indice.
 */
export function misconceptionDeLExercice(exerciseId: string): { id: string; right: string } | null {
  const m = MISCONCEPTIONS.find((x) => (x.exerciseRefs ?? []).includes(exerciseId));
  return m ? { id: m.id, right: m.right } : null;
}

/** Toutes les ressources d'un exercice, prêtes à être injectées dans `remedier`. */
export function ressourcesDe(exerciseId: string): RessourcesRemediation {
  const ex = getExercise(exerciseId) as { id: string; difficulty?: number; skills?: string[] } | null;
  const lecon = leconDeLExercice(exerciseId);
  const voisin = ex
    ? plusSimpleParmi(getCatalogueExercices(), {
      id: ex.id,
      difficulty: Number(ex.difficulty) || 0,
      skills: Array.isArray(ex.skills) ? ex.skills : [],
    }) as ExerciceBref | null
    : null;
  return {
    sections: lecon ? sectionsDeLecon(lecon.slug) : { ...VIDE },
    misconception: misconceptionDeLExercice(exerciseId),
    voisinPlusSimple: voisin ? { id: voisin.id, title: voisin.title, difficulty: voisin.difficulty } : null,
    leconRef: lecon ? lecon.slug : null,
  };
}
