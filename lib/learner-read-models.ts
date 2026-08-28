// READ-MODELS TRANSVERSES (V65 · CP12) — côté serveur.
//
// Une seule vérité par question, consommée à l'identique par le Dashboard,
// /skills, /diagnostics, /revisions, /day et /history. Avant V65, chaque page
// reconstruisait son propre index de preuves : trois implémentations
// concurrentes cohabitaient et pouvaient diverger.
//
// Ces fonctions ne font QUE LIRE. Aucune ne mute la progression.

import { getProgram } from './program';
import { readProgress } from './progress-server';
import { createLedger, projectCompetencies, whyCompetencyState } from './competency';
import type { CompetencyProjection, CompetencyExplanation, EvidenceLedger } from './competency';
import { isQualifying } from './evidence';
import type { Evidence } from './evidence';
import { getDueReviews } from './review';
import { buildHistory, groupHistoryByDate, historySummary } from './learner-history';
import { listExercises } from './exercises-server';
import { listAssessments } from './assessments-server';
import { listMissions } from './missions-server';
import { listCapstones } from './capstones-server';
import { programSkills } from './skill-taxonomy';

/** Contexte de projection : signaux de révision RÉELS, issus du modèle existant. */
function projectionContext(progress: ReturnType<typeof readProgress>) {
  const dueDays = new Set<number>(getDueReviews(progress.days).map((r: { day: number }) => r.day));
  const reviewFlaggedDays = new Set<number>();
  for (const [k, d] of Object.entries(progress.days ?? {})) {
    if (/^\d+$/.test(k) && (d as { comprehension?: string })?.comprehension === 'review') {
      reviewFlaggedDays.add(Number(k));
    }
  }
  return { dueDays, reviewFlaggedDays };
}

export interface CompetencySummary {
  competencies: CompetencyProjection[];
  explanations: Record<string, CompetencyExplanation>;
  counts: Record<string, number>;
  /** Nombre de compétences réellement évaluées — jamais un pourcentage inventé. */
  assessedCount: number;
  totalCount: number;
  /** Nombre d'ENREGISTREMENTS de preuve. */
  evidenceCount: number;
  /** Nombre d'enregistrements QUALIFIANTS. Comparable à `evidenceCount`. */
  qualifyingEvidenceCount: number;
  /**
   * Somme des crédits par compétence : une preuve qui en crédite trois compte
   * trois fois. Ce N'EST PAS un décompte de preuves et ne doit jamais être
   * affiché comme tel — voir la note dans `getCompetencySummary`.
   */
  competencyCreditCount: number;
  lastEvidenceAt: string | null;
}

/** Vue compétences complète — l'unique source de /skills et du Dashboard. */
export function getCompetencySummary(): CompetencySummary {
  const program = getProgram();
  const progress = readProgress();
  const ledger = createLedger(progress.evidence ?? []);
  const ctx = projectionContext(progress);

  const competencies = projectCompetencies(program.skills, ledger, ctx);
  const explanations: Record<string, CompetencyExplanation> = {};
  for (const c of competencies) {
    const why = whyCompetencyState(c, ledger);
    if (why) explanations[c.competencyId] = why;
  }

  const counts: Record<string, number> = { unassessed: 0, practiced: 0, demonstrated: 0, reinforced: 0 };
  for (const c of competencies) counts[c.state] = (counts[c.state] ?? 0) + 1;

  const all = ledger.all();

  // V65.1 · P0-2 — `qualifyingEvidenceCount` était la SOMME DES CRÉDITS
  // (`competencies.reduce(…)`). Une preuve créditant trois compétences comptait
  // trois fois. /skills affichait « 28 preuves qualifiantes sur 30
  // enregistrées » pour 14 preuves qualifiantes réelles : une somme de crédits
  // mise en regard d'un décompte d'enregistrements, dans la même phrase.
  // Invariants 6 et 22. Les deux grandeurs sont désormais nommées séparément.
  return {
    competencies,
    explanations,
    counts,
    assessedCount: competencies.filter((c) => c.state !== 'unassessed').length,
    totalCount: competencies.length,
    evidenceCount: all.length,
    qualifyingEvidenceCount: all.filter(isQualifying).length,
    competencyCreditCount: competencies.reduce((n, c) => n + c.qualifyingEvidenceCount, 0),
    lastEvidenceAt: all.length ? all[all.length - 1].createdAt : null,
  };
}

/** Preuves récentes — même liste pour toutes les surfaces qui en montrent. */
export function getRecentEvidence(limit = 10): Evidence[] {
  return createLedger(readProgress().evidence ?? []).getEvidenceTimeline(limit);
}

/** Le registre lui-même, pour une surface qui a besoin d'interroger finement. */
export function getEvidenceLedger(): EvidenceLedger {
  return createLedger(readProgress().evidence ?? []);
}

/** Historique factuel + regroupement par date + compteurs. */
export function getLearningHistory(limit = 200) {
  const program = getProgram();
  const progress = readProgress();
  const titleOf = (day: number) => program.days.find((d: { day: number }) => d.day === day)?.title ?? '';
  const events = buildHistory(progress, titleOf).slice(0, limit);
  return { events, groups: groupHistoryByDate(events), summary: historySummary(events) };
}

export interface ReviewCandidate {
  competencyId: string;
  name: string;
  state: string;
  reasons: string[];
  lastQualifiedEvidenceAt: string | null;
  evidenceCount: number;
}

/**
 * Pont RÉVISION (CP11) — candidats dérivés des PREUVES et des signaux existants.
 * Une révision ne modifie jamais une compétence : elle produira une preuve, et
 * la projection fera le reste.
 */
export function getReviewCandidates(): ReviewCandidate[] {
  const { competencies } = getCompetencySummary();
  return competencies
    .filter((c) => c.needsReview)
    .map((c) => ({
      competencyId: c.competencyId,
      name: c.name ?? c.competencyId,
      state: c.state,
      reasons: c.needsReviewReasons,
      lastQualifiedEvidenceAt: c.lastQualifiedEvidenceAt,
      evidenceCount: c.evidenceCount,
    }))
    .sort((a, b) => (a.lastQualifiedEvidenceAt ?? '').localeCompare(b.lastQualifiedEvidenceAt ?? ''));
}

/** Synthèse d'accueil — chiffres RÉELS uniquement, aucun pourcentage de maîtrise. */
export function getLearnerOverview() {
  const summary = getCompetencySummary();
  const history = getLearningHistory(50);
  return {
    assessedCount: summary.assessedCount,
    totalCount: summary.totalCount,
    counts: summary.counts,
    evidenceCount: summary.evidenceCount,
    qualifyingEvidenceCount: summary.qualifyingEvidenceCount,
    competencyCreditCount: summary.competencyCreditCount,
    lastEvidenceAt: summary.lastEvidenceAt,
    activeDays: history.summary.activeDays,
    reviewCandidates: summary.competencies.filter((c) => c.needsReview).length,
    /** Vrai quand rien n'a encore été enregistré : l'UI doit alors dire « aucune preuve », jamais « 0 % ». */
    isEmpty: summary.evidenceCount === 0,
  };
}

// ── ATTEIGNABILITÉ (V65.1 · CP3) ──────────────────────────────────────────
//
// Une compétence « Non évaluée » peut l'être pour deux raisons très
// différentes : l'apprenant n'a rien fait, ou le produit ne lui offre AUCUN
// moyen de la démontrer. Confondre les deux fait porter à l'apprenant un
// manque qui est celui du corpus.
//
// Mesure du CP3, sur le corpus réel : `autonomy` n'est alimentée par aucun
// exercice, aucun diagnostic, aucune mission et aucun capstone. Elle ne peut
// donc PAS sortir de « Non évaluée », quoi que fasse l'apprenant. `cloud` et
// `comm` n'ont aucun exercice ; `python`, `dl`, `agents` et `evalia` aucun
// diagnostic.
//
// On ne fabrique rien pour combler ça (invariants 2 et 7 : le curriculum est
// gelé, une donnée absente reste absente). On le DIT.

export interface CompetencyReachability {
  competencyId: string;
  exercises: number;
  assessments: number;
  missions: number;
  capstones: number;
  /** Total des sources QUALIFIANTES disponibles dans le corpus. */
  total: number;
  /** Faux quand le produit n'offre aucun moyen de démontrer cette compétence. */
  reachable: boolean;
}

/**
 * Pour chaque compétence du programme, ce que le CORPUS permet réellement.
 * Dérivé des catalogues, jamais énuméré à la main : ajouter un exercice suffit
 * à changer le résultat.
 */
export function getCompetencyReachability(): Record<string, CompetencyReachability> {
  const out: Record<string, CompetencyReachability> = {};
  for (const s of getProgram().skills as Array<{ id: string }>) {
    out[s.id] = {
      competencyId: s.id, exercises: 0, assessments: 0, missions: 0, capstones: 0,
      total: 0, reachable: false,
    };
  }
  const tally = (skills: string[] | undefined, key: 'exercises' | 'assessments' | 'missions' | 'capstones') => {
    for (const p of programSkills(skills ?? [])) {
      const row = out[p];
      if (!row) continue; // une étiquette hors programme n'invente pas de ligne
      row[key] += 1;
      row.total += 1;
      row.reachable = true;
    }
  };
  for (const e of listExercises()) tally((e as { skills?: string[] }).skills, 'exercises');
  for (const a of listAssessments()) tally((a as { skills?: string[] }).skills, 'assessments');
  for (const m of listMissions()) tally((m as { skills?: string[] }).skills, 'missions');
  for (const c of listCapstones()) tally((c as { skills?: string[] }).skills, 'capstones');
  return out;
}

// ── HISTORIQUE PAR SOURCE (V65.1 · CP9) ───────────────────────────────────
//
// `/diagnostics` était un catalogue AVEUGLE : strictement identique pour un
// apprenant ayant passé zéro diagnostic et pour un apprenant en ayant passé
// deux, dont un réussi — alors que le ledger et `/history` portaient les deux
// tentatives (CP0, P0-4). Le catalogue ignorait son propre lecteur.

export interface SourceAttempt {
  sourceId: string;
  createdAt: string;
  qualifying: boolean;
  status: string | null;
  detail: string;
  competencyIds: string[];
}

export interface SourceHistory {
  attempts: SourceAttempt[];
  /** Dernière tentative, chronologiquement. */
  last: SourceAttempt | null;
  /** Vrai dès qu'UNE tentative a produit une preuve qualifiante. */
  passed: boolean;
}

/**
 * Historique de l'apprenant sur toutes les sources d'un type donné, indexé par
 * `sourceId`. Dérivé du ledger — jamais d'un compteur parallèle.
 */
export function getHistoryBySource(sourceType: string): Record<string, SourceHistory> {
  const out: Record<string, SourceHistory> = {};
  for (const e of getEvidenceLedger().all()) {
    if (e.sourceType !== sourceType) continue;
    const row = out[e.sourceId] ?? { attempts: [], last: null, passed: false };
    const attempt: SourceAttempt = {
      sourceId: e.sourceId,
      createdAt: e.createdAt,
      qualifying: isQualifying(e),
      status: e.validation?.status ?? null,
      detail: e.validation?.detail ?? '',
      competencyIds: e.competencyIds,
    };
    row.attempts.push(attempt);
    if (!row.last || attempt.createdAt > row.last.createdAt) row.last = attempt;
    if (attempt.qualifying) row.passed = true;
    out[e.sourceId] = row;
  }
  for (const row of Object.values(out)) {
    row.attempts.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
  return out;
}
