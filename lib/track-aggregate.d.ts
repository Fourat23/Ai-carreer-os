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
  lastEvidence: { day: number; title: string; at: string } | null;
  skillsCount: number;
  started: boolean;
  complete: boolean;
}

export function aggregateTrack(catalogue: Catalogue, track: Track, progressV3: ProgressV3, program: Program): TrackAggregate;
export function aggregateTracks(catalogue: Catalogue, progressV3: ProgressV3, program: Program): TrackAggregate[];
