// Déclarations pour le read-model agrégé multi-parcours (pur, lecture seule).
import type { Catalogue, Track } from './catalogue';
import type { Program } from './types';
import type { ProgressV3 } from './progress-store';

export interface TrackAggregate {
  trackId: string;
  title: string;
  status: string;
  active: boolean;
  totalDays: number;
  completedDays: number;
  percent: number;
  resumeDay: number | null;
  inProgress: number;
  toReview: number;
  reviewsDue: number;
  /** Dernière preuve du LEDGER canonique. `day` est null pour une preuve hors journée. */
  lastEvidence: { day: number | null; title: string; at: string; qualifying: boolean } | null;
  /** Compétences portant ≥ 1 preuve qualifiante. Jamais un niveau déclaré. */
  demonstratedCount: number;
  /** Compétences portant ≥ 1 trace, qualifiante ou non. */
  assessedCount: number;
  /** Niveaux auto-déclarés — une DÉCLARATION, jamais une preuve. */
  declaredCount: number;
  /** Nombre d'enregistrements de preuve (pas une somme de crédits). */
  evidenceCount: number;
  started: boolean;
  complete: boolean;
}

export function aggregateTrack(catalogue: Catalogue, track: Track, progressV3: ProgressV3, program: Program): TrackAggregate;
export function aggregateTracks(catalogue: Catalogue, progressV3: ProgressV3, program: Program): TrackAggregate[];
