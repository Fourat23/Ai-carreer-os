// V75 · CP5 — READ-MODEL DE L'ARRIÉRÉ (côté serveur).
//
// ── POURQUOI CE FICHIER EXISTE ───────────────────────────────────────────
//
// Le CP0 a mesuré le défaut **P2** sur le rendu réel : à **84 notions
// réellement en retard**, la page affichait « **8** » et proposait **3 cartes**.
// Elle ne mentait pas volontairement — elle lisait `s.queue.length`, la file
// V66 **plafonnée à 8**, et l'annonçait comme un total. Le produit cachait donc
// déjà la dette, sans intention, par plafonnement d'affichage.
//
// L'invariant `I5` du contrat gelé répond exactement à ce défaut : *« le nombre
// montré à l'apprenant comme en retard est l'arriéré TOTAL, jamais une file
// plafonnée. »* Ce module le calcule.
//
// ── CE QU'IL NE FAIT PAS ─────────────────────────────────────────────────
//
// Aucune décision, aucun seuil. Il fait l'I/O que `lib/backlog-triage.mjs`
// refuse de faire et lui passe le contexte. C'est la même séparation que
// `plan-jour-server.ts` : une couche d'assemblage ne doit pas devenir un
// moteur de plus.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { readProgress } from './progress-server';
import { getProgram } from './program';
import { getMemoryContext } from './learner-memory-server';
import { getConceptCatalogue } from './retention-server';
import { projectLearnerMemory } from './learner-memory';
import { statutDe, prioriteDe } from './retention-priority';
import { echeanceDe, formeDe, MINUTES_PAR_FORME } from './retention-scheduler';
import { projectRecall, normalizeAttempts } from './retention';
import { progressPosition } from './position';
import { trierArriere, notionsEssentielles } from './backlog-triage';
import type { NotionTriage, Pression } from './backlog-triage';
import type { FicheMemoire } from './learner-memory';
import type { Progress } from './types';

const ROOT = process.cwd();

/** Horizon gelé au §3 du contrat de récupération. Publié, pas déduit. */
export const HORIZON_ESSENTIEL = 14;

export interface NotionTriee extends NotionTriage {
  /** Titre de la leçon, ajouté ici : le module pur ne lit pas le corpus. */
  titre: string;
}

export interface VueArriere {
  /** `I1` · l'arriéré total, mesuré indépendamment de ce que le plan propose. */
  total: number;
  /** `I2` · `total = actif + differe + gare`, exactement. */
  actif: number;
  differe: number;
  gare: number;
  notions: NotionTriee[];
  /** `BACKLOG_PRESSURE` — cinq facteurs nommés, jamais un score (§2). */
  pression: Pression;
  /** Position dans le parcours : première journée non terminée. */
  jourCourant: number;
  /** Vrai quand le graphe de prérequis de V73 est absent (aucun garage possible). */
  sansGraphePrerequis: boolean;
  /** Vrai quand la soupape a dû dégarer l'ensemble. Publié, pas masqué. */
  soupape: boolean;
}

let prereqs: Map<string, string[]> | null = null;

/**
 * Prérequis déclarés par le graphe canonique de V73 (`prereq.requis`, 120
 * leçons sur 128). **Absent, la carte reste vide plutôt que devinée** : la
 * conséquence est qu'aucune notion n'est garée et qu'aucune n'est essentielle,
 * ce qui est le comportement prudent. Inventer un prérequis produirait un
 * garage injustifiable — et le §7 du contrat déclare déjà que la qualité de ce
 * graphe n'est pas rejugée ici.
 */
function getPrerequis(): Map<string, string[]> {
  if (prereqs) return prereqs;
  prereqs = new Map();
  const p = join(ROOT, 'docs', 'v73', 'curriculum-graph.json');
  if (existsSync(p)) {
    const g = JSON.parse(readFileSync(p, 'utf8')) as { prereq?: { requis?: Record<string, string[]> } };
    for (const [k, v] of Object.entries(g.prereq?.requis ?? {})) {
      prereqs.set(k, Array.isArray(v) ? v : []);
    }
  }
  return prereqs;
}

/**
 * L'arriéré trié, prêt à afficher.
 *
 * @param now horloge injectée (jamais lue ici)
 */
export function getVueArriere(now: string = new Date().toISOString()): VueArriere {
  const progress = readProgress() as unknown as Progress & {
    recallAttempts?: unknown[]; exerciseAttempts?: unknown[]; evidence?: unknown[];
  };
  const ctx = getMemoryContext();
  const { concepts } = getConceptCatalogue();

  const projection = projectLearnerMemory({
    facts: {
      days: progress.days ?? {},
      recallAttempts: progress.recallAttempts ?? [],
      exerciseAttempts: progress.exerciseAttempts ?? [],
      evidence: progress.evidence ?? [],
    },
    context: { ...ctx, startDate: null },
    now,
  });
  // Une notion jamais rencontrée n'est pas en retard : elle n'a pas commencé.
  // Les confondre serait le contournement G9 de V74.
  const fiches: FicheMemoire[] = projection.concepts.filter((f) => f.firstExposureAt);

  // ── LA POSITION DANS LE PARCOURS, ENFIN TRANSMISE ──
  //
  // Le défaut P1 du CP0 avait deux verrous, et le second était celui-ci : le
  // read-model du plan passe `startDate: null`, donc `positionDuJour` rend 0 et
  // plus rien n'est jamais « proche ». Le produit connaît pourtant sa position.
  //
  // On lit `progressPosition`, que le dépôt déclare « source de vérité UNIQUE
  // pour le positionnement ». **Le choix de `resumeDay` plutôt que
  // `nextIncompleteDay` est délibéré** : ce dernier rend la première journée non
  // terminée, donc *le trou le plus ancien*. Un apprenant irrégulier qui a sauté
  // la journée 2 et travaille aujourd'hui la 300 y serait décrit « au jour 2 »
  // pour toujours, et l'horizon des 14 prochains jours désignerait le début du
  // programme. `resumeDay` applique la règle « première non terminée APRÈS la
  // dernière terminée », qui est la position réelle.
  const jourCourant = progressPosition(getProgram().days, progress as Progress, new Date(now)).resumeDay;

  const prereq = getPrerequis();
  const prerequisDe = (id: string) => prereq.get(id) ?? [];
  const essentielles = notionsEssentielles({
    jourCourant,
    horizon: HORIZON_ESSENTIEL,
    leconsDuJour: (j: number) => ctx.dayConcepts.get(j) ?? [],
    prerequisDe,
  });

  const titreDe = new Map(concepts.map((c) => [c.id, c.title]));
  const formatsDe = new Map(concepts.map((c) => [c.id, c.formats]));
  const ficheDe = new Map(fiches.map((f) => [f.id, f]));

  const attemptsParConcept = new Map<string, unknown[]>();
  for (const a of (progress.recallAttempts ?? []) as { conceptId?: string }[]) {
    if (!a?.conceptId) continue;
    if (!attemptsParConcept.has(a.conceptId)) attemptsParConcept.set(a.conceptId, []);
    attemptsParConcept.get(a.conceptId)!.push(a);
  }

  // Minutes : celles de la FORME que le scheduler choisirait, jamais une
  // moyenne inventée. Une notion dont la leçon ne supporte aucune forme ne
  // coûte pas 0 minute « parce qu'elle est facile » — elle coûte 0 parce que
  // le produit ne peut rien proposer dessus. Elle reste comptée dans `volume`.
  const minutesDe = (id: string) => {
    const f = ficheDe.get(id);
    if (!f) return 0;
    const recall = projectRecall(id, normalizeAttempts(attemptsParConcept.get(id) ?? []));
    const forme = formeDe(f, formatsDe.get(id) ?? [], recall);
    return forme ? (MINUTES_PAR_FORME as Record<string, number>)[forme.format] ?? 0 : 0;
  };

  const dueAtOf = (id: string) => {
    const f = ficheDe.get(id);
    return f ? echeanceDe(f)?.dueAt ?? null : null;
  };

  const r = trierArriere({
    fiches,
    dueAtOf,
    statutDe,
    estEssentielle: (id: string) => essentielles.has(id),
    prerequisDe,
    minutesDe,
    // L'ORDRE vient du CP3 de V74. Le triage ne recalcule aucune priorité :
    // deux échelles pour une même question finiraient par diverger.
    scoreDe: (id: string) => {
      const f = ficheDe.get(id);
      return f ? prioriteDe(f, { dueAt: dueAtOf(id), now }).score : 0;
    },
    besoinDe: (id: string) => ficheDe.get(id)?.nextCurriculumNeed ?? null,
    now,
  });

  return {
    total: r.total,
    actif: r.placement.actif,
    differe: r.placement.differe,
    gare: r.placement.gare,
    notions: r.notions.map((n) => ({ ...n, titre: titreDe.get(n.id) ?? n.id })),
    pression: r.pression,
    jourCourant,
    sansGraphePrerequis: prereq.size === 0,
    soupape: r.soupape,
  };
}
