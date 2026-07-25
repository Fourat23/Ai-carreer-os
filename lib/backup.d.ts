// Types pour lib/backup.mjs (sauvegarde/restauration pure).
import type { Progress } from './types';

export const SCHEMA_VERSION: number;
export const APP_ID: string;
export interface BackupStats {
  daysTracked: number; done: number; inProgress: number; toReview: number; notes: number; skillsRated: number;
}
export interface Backup {
  app: string; schemaVersion: number; exportedAt: string; stats: BackupStats; progress: Progress;
}
export function normalizeProgress(p: unknown): Progress;
export function isProgressShape(p: unknown): boolean;
export function backupStats(progress: unknown): BackupStats;
export function serializeBackup(progress: unknown, now?: Date): Backup;
export function migrate(obj: unknown): Progress;
export const DAY_STATUSES: readonly ['not-started', 'in-progress', 'done', 'to-review'];
export function validateStrict(src: unknown):
  | { ok: true; progress: Progress; warnings: string[] }
  | { ok: false; error: string };
export function parseBackup(input: unknown):
  | { ok: true; progress: Progress; version: number; stats: BackupStats; warnings: string[] }
  | { ok: false; error: string };
