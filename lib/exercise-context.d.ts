// Déclarations pour le contexte de parcours d'un exercice (pur).
import type { Catalogue } from './catalogue';

export interface ExerciseContext {
  reachableTracks: string[];
  activeDays: number[];
  inActive: boolean;
  multiTrack: boolean;
  scope: 'active' | 'other' | 'global';
}

export function trackDaySets(catalogue: Catalogue): Map<string, Set<number>>;
export function classifyExercise(
  exerciseDayNums: number[],
  sets: Map<string, Set<number>>,
  activeTrackId: string,
): ExerciseContext;
export function matchesScope(ctx: ExerciseContext, scopeFilter: string): boolean;
export function reachableFromTrack(ctx: ExerciseContext, trackId: string): boolean;
export function contextBadge(
  ctx: ExerciseContext,
): { label: string; kind: 'active' | 'other' | 'global' };
