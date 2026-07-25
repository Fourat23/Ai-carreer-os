// Lecture/écriture de la progression utilisateur (data/progress.json).
// Côté serveur uniquement. La progression survit au navigateur (fichier local),
// contrairement à localStorage.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Progress, DayProgress } from './types';
import { migrateProgress } from './learning';

const ROOT = process.cwd();
const FILE = join(ROOT, 'data', 'progress.json');
const SNAPSHOT = join(ROOT, 'data', 'progress.backup.json');

export function emptyProgress(): Progress {
  return { startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} };
}
const empty = emptyProgress;

// Copie l'état courant vers progress.backup.json avant une opération destructive
// (import de remplacement, réinitialisation), pour offrir un filet de sécurité local.
export function snapshotProgress(): void {
  try { if (existsSync(FILE)) writeFileSync(SNAPSHOT, readFileSync(FILE, 'utf8')); } catch { /* best-effort */ }
}

export function readProgress(): Progress {
  if (!existsSync(FILE)) return empty();
  try {
    const p = JSON.parse(readFileSync(FILE, 'utf8'));
    // Migration/normalisation V5→V6 en mémoire : remplit les champs Active
    // Learning avec des valeurs sûres, sans perte des données existantes.
    return migrateProgress(p);
  } catch {
    // Fichier corrompu : on ne l'écrase pas silencieusement, on repart d'un état vide en mémoire.
    return empty();
  }
}

export function writeProgress(p: Progress): void {
  const dir = join(ROOT, 'data');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(FILE, JSON.stringify(p, null, 2));
}

export function getDayProgress(day: number): DayProgress | undefined {
  return readProgress().days[String(day)];
}
