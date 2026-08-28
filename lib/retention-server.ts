// Catalogue des CONCEPTS et read-models de rétention — côté serveur (V66).
//
// Ce module fait l'I/O que `lib/retention.mjs` refuse de faire : lire le
// corpus pour savoir QUELS concepts existent, QUELLES journées les enseignent,
// et QUELLES formes de rappel chaque leçon rend possibles.
//
// Rien n'est déclaré à la main. Le rattachement journée → concept est celui que
// les journées écrivent elles-mêmes, sous forme de liens `/doc/lessons/<slug>`.
// Ajouter un lien dans une journée suffit à changer le résultat ; aucune liste
// n'est à maintenir en parallèle. C'est la même règle que l'atteignabilité des
// compétences (V65.1 · CP3) : dériver, jamais énumérer.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { getProgram } from './program';
import { readProgress } from './progress-server';
import {
  projectRetention, buildReviewQueue, retentionCounts, availableFormats, nextFormat,
  isEncountered,
} from './retention';
import type { RetentionProjection, RecallFormat, RetentionStateId } from './retention';

const ROOT = process.cwd();
const CUR = join(ROOT, 'curriculum');
const pad3 = (n: number) => String(n).padStart(3, '0');

export interface Concept {
  id: string;
  title: string;
  skills: string[];
  /** Formes de rappel que la leçon rend RÉELLEMENT possibles (mesurées). */
  formats: RecallFormat[];
}

interface ConceptCatalogue {
  concepts: Concept[];
  /** concept → journées qui l'enseignent, dérivé des liens des journées. */
  conceptDays: Record<string, number[]>;
}

let cached: ConceptCatalogue | null = null;

/**
 * Construit le catalogue une fois par processus. Le corpus est gelé : le
 * relire à chaque requête coûterait 365 lectures de fichier pour un résultat
 * invariant.
 */
export function getConceptCatalogue(): ConceptCatalogue {
  if (cached) return cached;
  const program = getProgram();
  const lessons = (program.lessons ?? []) as Array<{ slug: string; title?: string; skills?: string[] }>;

  const concepts: Concept[] = lessons.map((l) => {
    const path = join(CUR, 'lessons', `${l.slug}.md`);
    let titles: string[] = [];
    if (existsSync(path)) {
      const md = readFileSync(path, 'utf8');
      titles = [...md.matchAll(/^## +(.+)$/gm)].map((m) => m[1]);
    }
    return {
      id: l.slug,
      title: l.title ?? l.slug,
      skills: Array.isArray(l.skills) ? l.skills : [],
      formats: availableFormats(titles) as RecallFormat[],
    };
  });

  const known = new Set(concepts.map((c) => c.id));
  const conceptDays: Record<string, number[]> = {};
  for (const c of concepts) conceptDays[c.id] = [];
  for (const d of program.days as Array<{ day: number }>) {
    const path = join(CUR, 'days', `day-${pad3(d.day)}.md`);
    if (!existsSync(path)) continue;
    const md = readFileSync(path, 'utf8');
    const slugs = new Set([...md.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1]));
    for (const s of slugs) {
      // Un lien vers une leçon qui n'existe pas n'invente pas un concept.
      if (known.has(s)) conceptDays[s].push(d.day);
    }
  }
  cached = { concepts, conceptDays };
  return cached;
}

export interface RetentionSummary {
  projection: RetentionProjection[];
  counts: Record<RetentionStateId, number>;
  /** Concepts dus aujourd'hui, entrelacés et bornés. */
  queue: RetentionProjection[];
  /** Concepts que le corpus enseigne mais que l'apprenant n'a pas encore rencontrés. */
  notYetReached: number;
  totalConcepts: number;
  attemptCount: number;
}

/**
 * Vue rétention complète. UNE seule source pour toutes les surfaces — même
 * règle que les read-models de compétence : deux pages qui affichent le même
 * nombre lisent la même fonction.
 */
export function getRetentionSummary(now: string = new Date().toISOString()): RetentionSummary {
  const { concepts, conceptDays } = getConceptCatalogue();
  const progress = readProgress() as { days?: Record<string, unknown>; recallAttempts?: unknown[] };
  const attempts = Array.isArray(progress.recallAttempts) ? progress.recallAttempts : [];

  const projection = projectRetention({
    concepts, conceptDays, days: progress.days ?? {}, attempts, now,
  }) as RetentionProjection[];

  return {
    projection,
    counts: retentionCounts(projection) as Record<RetentionStateId, number>,
    queue: buildReviewQueue(projection, { now }) as RetentionProjection[],
    // « Pas encore rencontré » et les cinq états sont deux grandeurs DISJOINTES :
    // leur somme vaut exactement le nombre de notions du programme. Sans cette
    // disjonction, la page comptait les mêmes notions deux fois (CP14).
    notYetReached: projection.filter((p) => !isEncountered(p)).length,
    totalConcepts: projection.length,
    attemptCount: attempts.length,
  };
}

export interface RecallPrompt {
  conceptId: string;
  title: string;
  format: RecallFormat | null;
  /** Journées où le concept est enseigné — pour aller vérifier APRÈS avoir tenté. */
  teachingDays: number[];
  state: RetentionStateId;
  reason: string;
}

/**
 * Ce qu'on propose à l'apprenant pour un concept : une forme de rappel qu'il
 * n'a pas encore utilisée sur ce concept, choisie parmi celles que la leçon
 * rend réellement possibles.
 *
 * On ne propose JAMAIS une forme que la leçon ne permet pas : demander
 * « refais le mini-exercice » à propos d'une leçon sans mini-exercice serait
 * envoyer l'apprenant contre un mur.
 */
export function getRecallPrompt(p: RetentionProjection): RecallPrompt {
  const { concepts } = getConceptCatalogue();
  const c = concepts.find((x) => x.id === p.conceptId);
  return {
    conceptId: p.conceptId,
    title: p.title,
    format: nextFormat(p.recall, c?.formats ?? []) as RecallFormat | null,
    teachingDays: p.exposure.teachingDays,
    state: p.state,
    reason: p.reason,
  };
}
