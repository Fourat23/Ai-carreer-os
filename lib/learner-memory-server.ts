// V74 · CP2 — CONTEXTE CURRICULAIRE du Learner Memory Model (côté serveur).
//
// Ce module fait l'I/O que `lib/learner-memory.mjs` refuse de faire : lire le
// programme pour savoir quelles journées enseignent quels concepts, quels
// exercices une leçon déclare, quelles journées sont des projets, et quel
// niveau chaque compétence est censée atteindre.
//
// Rien n'est déclaré à la main, et rien n'est lu dans `scripts/` : tout vient
// de `data/program.json`, qui porte déjà `skills` et `practiceRefs` pour les
// 128 leçons. C'est la règle « dériver, jamais énumérer » héritée de V65.1 et
// de V66.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { getProgram } from './program';
import { getConceptCatalogue } from './retention-server';

const ROOT = process.cwd();

export interface MemoryContext {
  skills: string[];
  conceptDays: Record<string, number[]>;
  dayConcepts: Map<number, string[]>;
  conceptSkills: Map<string, string[]>;
  /** Exercice → concept UNIQUE qui le déclare. Un exercice ambigu est absent. */
  exerciseConcept: Map<string, string>;
  exerciseSkills: Map<string, string[]>;
  projectDays: Set<number>;
  transferDays: Set<number>;
  expectedLevelBySkill: Map<string, number>;
  projectDaysBySkill: Map<string, number[]>;
  prereqDepth: Map<string, number>;
}

type LessonEntry = {
  slug: string;
  skills?: string[];
  practiceRefs?: { kind: string; id: string }[];
};

let cached: MemoryContext | null = null;

/**
 * Construit le contexte une fois par processus : le corpus est gelé, le
 * relire à chaque requête coûterait des centaines de lectures pour un
 * résultat invariant. `startDate` n'en fait PAS partie — il appartient à
 * l'apprenant et change ; il est injecté à l'appel.
 */
export function getMemoryContext(): MemoryContext {
  if (cached) return cached;
  const program = getProgram();
  const { conceptDays } = getConceptCatalogue();
  const lessons = ((program as unknown as { lessons?: LessonEntry[] }).lessons ?? []);

  const dayConcepts = new Map<number, string[]>();
  for (const [conceptId, days] of Object.entries(conceptDays)) {
    for (const d of days) {
      if (!dayConcepts.has(d)) dayConcepts.set(d, []);
      dayConcepts.get(d)!.push(conceptId);
    }
  }

  const conceptSkills = new Map<string, string[]>(
    lessons.map((l) => [l.slug, Array.isArray(l.skills) ? l.skills : []]),
  );

  // ── Exercice → concept UNIQUE déclaré (§3.4 condition 1 du contrat gelé).
  //
  // Un exercice déclaré par PLUSIEURS leçons n'est rattaché à AUCUNE : choisir
  // serait fabriquer de la donnée. Le CP1 a mesuré que 207 exercices sur 376
  // sont dans le cas non ambigu, et que rattacher les 169 autres aurait exigé
  // de trancher entre 3 leçons en médiane, jusqu'à 15.
  const declarants = new Map<string, Set<string>>();
  for (const l of lessons) {
    for (const r of l.practiceRefs ?? []) {
      if (r.kind !== 'exercise') continue;
      if (!declarants.has(r.id)) declarants.set(r.id, new Set());
      declarants.get(r.id)!.add(l.slug);
    }
  }
  const exerciseConcept = new Map<string, string>();
  const exerciseSkills = new Map<string, string[]>();
  for (const [exId, slugs] of declarants) {
    if (slugs.size !== 1) continue;              // ambigu → non rattaché, volontairement
    const slug = [...slugs][0];
    exerciseConcept.set(exId, slug);
    exerciseSkills.set(exId, conceptSkills.get(slug) ?? []);
  }

  const days = program.days as Array<{ day: number; project?: number | null }>;
  const projectDays = new Set<number>();
  for (const d of days) if (d.project != null) projectDays.add(d.day);

  // ── Journées de TRANSFERT : celles dont les leçons portent au moins deux
  // compétences distinctes. La notion y est employée hors de son seul contexte
  // d'origine — c'est la définition §1.9 du contrat, appliquée au grain jour.
  const transferDays = new Set<number>();
  for (const [day, cs] of dayConcepts) {
    const skills = new Set<string>();
    for (const c of cs) for (const s of conceptSkills.get(c) ?? []) skills.add(s);
    if (skills.size >= 2) transferDays.add(day);
  }

  // Niveau attendu = maximum CUMULATIF des `expectedScores` (lecture gelée au
  // CP10 de V73 : « à la fin du mois N, tu devrais être à ce niveau »).
  const expectedLevelBySkill = new Map<string, number>();
  for (const m of program.months as Array<{ expectedScores?: Record<string, number> }>) {
    for (const [s, n] of Object.entries(m.expectedScores ?? {})) {
      if ((expectedLevelBySkill.get(s) ?? 0) < n) expectedLevelBySkill.set(s, n);
    }
  }

  const projectDaysBySkill = new Map<string, number[]>();
  for (const d of days) {
    if (d.project == null) continue;
    const skills = new Set<string>();
    for (const c of dayConcepts.get(d.day) ?? []) for (const s of conceptSkills.get(c) ?? []) skills.add(s);
    for (const s of skills) {
      if (!projectDaysBySkill.has(s)) projectDaysBySkill.set(s, []);
      projectDaysBySkill.get(s)!.push(d.day);
    }
  }
  for (const v of projectDaysBySkill.values()) v.sort((a, b) => a - b);

  // Profondeur de prérequis : longueur de la plus longue chaîne REQUIS. Publiée
  // par le graphe canonique de V73 ; absente, la carte reste vide plutôt que
  // devinée.
  const prereqDepth = new Map<string, number>();
  const graphPath = join(ROOT, 'docs', 'v73', 'curriculum-graph.json');
  if (existsSync(graphPath)) {
    const g = JSON.parse(readFileSync(graphPath, 'utf8')) as { prereq?: { requis?: Record<string, string[]> } };
    const requis = g.prereq?.requis ?? {};
    const memo = new Map<string, number>();
    const depth = (s: string, seen = new Set<string>()): number => {
      if (memo.has(s)) return memo.get(s)!;
      if (seen.has(s)) return 0;
      seen.add(s);
      const deps = requis[s] ?? [];
      const d = deps.length ? 1 + Math.max(...deps.map((x) => depth(x, new Set(seen)))) : 0;
      memo.set(s, d);
      return d;
    };
    for (const s of Object.keys(requis)) prereqDepth.set(s, depth(s));
  }

  cached = {
    skills: (program.skills as Array<{ id: string }>).map((s) => s.id),
    conceptDays,
    dayConcepts,
    conceptSkills,
    exerciseConcept,
    exerciseSkills,
    projectDays,
    transferDays,
    expectedLevelBySkill,
    projectDaysBySkill,
    prereqDepth,
  };
  return cached;
}
