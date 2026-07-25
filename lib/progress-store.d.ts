// Types pour lib/progress-store.mjs (store multi-parcours v3, pur).
import type { Progress } from './types';

export const PROGRESS_SCHEMA: number;

export interface TrackProgress extends Progress {
  version: string;
  enrolledAt: string | null;
  lastOpenedAt: string | null;
}
export interface ProgressV3 {
  schemaVersion: number;
  activeTrackId: string;
  tracks: Record<string, TrackProgress>;
}
export interface TrackMeta {
  id: string; version: string; active: boolean;
  enrolledAt: string | null; lastOpenedAt: string | null; daysTracked: number;
}

export function emptyFlat(): Progress;
export function migrateToV7(raw: unknown, now?: string): ProgressV3;
export function activeTrackProgress(v3: ProgressV3): Progress;
export function writeActiveTrack(v3: unknown, flat: Progress, now?: string): ProgressV3;
export function enrollTrack(v3: unknown, trackId: string, version?: string, now?: string): ProgressV3;
export function setActiveTrack(v3: unknown, trackId: string, now?: string): ProgressV3;
export function tracksMeta(v3: unknown): TrackMeta[];
export function normalizeDay(d: unknown): Required<Progress['days'][string]>;
