// Types pour lib/backup.mjs (sauvegarde/restauration pure).
import type { Progress } from './types';
import type { ProgressV3 } from './progress-store';

export const SCHEMA_VERSION: number;
export const BACKUP_SCHEMA_V3: number;
export const APP_ID: string;

export interface WorkspaceExport { files: Record<string, string>; runtime?: string }
export type WorkspacesExport = Record<string, WorkspaceExport>;

export function serializeBackupV3(v3: ProgressV3, workspaces?: WorkspacesExport, now?: Date): unknown;
export function sanitizeWorkspaces(raw: unknown, allow: Map<string, Set<string>>):
  { workspaces: Record<string, { files: Record<string, string> }>; warnings: string[] };
export function parseBackupV3(input: unknown, allow?: Map<string, Set<string>>):
  | { ok: true; v3: ProgressV3; workspaces: Record<string, { files: Record<string, string> }>; warnings: string[]; version: number }
  | { ok: false; error: string };
export interface BackupStats {
  daysTracked: number; done: number; inProgress: number; toReview: number; notes: number; skillsRated: number;
}
export interface Backup {
  app: string; schemaVersion: number; exportedAt: string; stats: BackupStats; progress: Progress;
  activeTrackId?: string; trackCount?: number;
}
export interface BackupMeta { activeTrackId?: string; trackCount?: number }
export function normalizeProgress(p: unknown): Progress;
export function isProgressShape(p: unknown): boolean;
export function backupStats(progress: unknown): BackupStats;
export function serializeBackup(progress: unknown, now?: Date, meta?: BackupMeta | null): Backup;
export function migrate(obj: unknown): Progress;
export const DAY_STATUSES: readonly ['not-started', 'in-progress', 'done', 'to-review'];
export function validateStrict(src: unknown):
  | { ok: true; progress: Progress; warnings: string[] }
  | { ok: false; error: string };
export function parseBackup(input: unknown):
  | { ok: true; progress: Progress; version: number; stats: BackupStats; warnings: string[] }
  | { ok: false; error: string };
