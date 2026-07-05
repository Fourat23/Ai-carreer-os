// Lecture/écriture de la progression utilisateur (data/progress.json).
// Côté serveur uniquement. La progression survit au navigateur (fichier local),
// contrairement à localStorage.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Progress, DayProgress } from './types';

const ROOT = process.cwd();
const FILE = join(ROOT, 'data', 'progress.json');

function empty(): Progress {
  return { startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} };
}

export function readProgress(): Progress {
  if (!existsSync(FILE)) return empty();
  try {
    const p = JSON.parse(readFileSync(FILE, 'utf8')) as Progress;
    // Normalisation défensive (fichier édité à la main possible).
    return {
      startDate: p.startDate ?? null,
      days: p.days ?? {},
      skills: p.skills ?? {},
      weeklyReviews: p.weeklyReviews ?? {},
      monthlyReviews: p.monthlyReviews ?? {},
    };
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
