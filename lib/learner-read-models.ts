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
import type { Evidence } from './evidence';
import { getDueReviews } from './review';
import { buildHistory, groupHistoryByDate, historySummary } from './learner-history';

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
  evidenceCount: number;
  qualifyingEvidenceCount: number;
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
  return {
    competencies,
    explanations,
    counts,
    assessedCount: competencies.filter((c) => c.state !== 'unassessed').length,
    totalCount: competencies.length,
    evidenceCount: all.length,
    qualifyingEvidenceCount: competencies.reduce((n, c) => n + c.qualifyingEvidenceCount, 0),
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
    lastEvidenceAt: summary.lastEvidenceAt,
    activeDays: history.summary.activeDays,
    reviewCandidates: summary.competencies.filter((c) => c.needsReview).length,
    /** Vrai quand rien n'a encore été enregistré : l'UI doit alors dire « aucune preuve », jamais « 0 % ». */
    isEmpty: summary.evidenceCount === 0,
  };
}
