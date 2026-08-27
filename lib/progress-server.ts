// Lecture/écriture de la progression utilisateur (data/progress.json).
// Côté serveur uniquement. La progression survit au navigateur (fichier local),
// contrairement à localStorage.

import { cache } from 'react';
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync, openSync, fsyncSync, closeSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { Progress, DayProgress } from './types';
import {
  migrateToV7, activeTrackProgress, writeActiveTrack, enrollTrack, setActiveTrack,
  tracksMeta, type ProgressV3, type TrackMeta,
} from './progress-store';

const ROOT = process.cwd();

// PERSISTANCE INJECTABLE (ADR-064 §8.3, brief §29). Les tests mutatifs pointent
// AICOS_PROGRESS_FILE vers une fixture isolée. Aucun test ne doit sauvegarder
// puis restaurer data/progress.json : ce procédé masque la mutation au lieu de
// l'empêcher. Par défaut, le fichier réel du propriétaire.
const FILE = process.env.AICOS_PROGRESS_FILE
  ? (process.env.AICOS_PROGRESS_FILE.startsWith('/') ? process.env.AICOS_PROGRESS_FILE : join(ROOT, process.env.AICOS_PROGRESS_FILE))
  : join(ROOT, 'data', 'progress.json');
const SNAPSHOT = `${FILE.replace(/\.json$/, '')}.backup.json`;

/** Chemin réellement utilisé — exposé pour les tests et les gates. */
export function progressFilePath(): string {
  return FILE;
}

export function emptyProgress(): Progress {
  return { startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} };
}

// Copie l'état courant vers progress.backup.json avant une opération destructive
// (import de remplacement, réinitialisation), pour offrir un filet de sécurité local.
export function snapshotProgress(): void {
  try { if (existsSync(FILE)) writeFileSync(SNAPSHOT, readFileSync(FILE, 'utf8')); } catch { /* best-effort */ }
}

// Lit la structure multi-parcours v3 (migre l'ancien format plat en mémoire).
// Mémoïsé PAR REQUÊTE via React.cache : les multiples lectures dérivées d'un même
// rendu (readProgress, getActiveTrackId, listTracks…) partagent UNE seule
// lecture+migration, tandis que chaque nouvelle requête relit le disque — donc
// toute mutation reste immédiatement visible (pas de cache global périmé).
export const readProgressV3: () => ProgressV3 = cache(() => {
  if (!existsSync(FILE)) return migrateToV7({});
  try {
    return migrateToV7(JSON.parse(readFileSync(FILE, 'utf8')));
  } catch {
    return migrateToV7({});
  }
});

// Lecture NON mémoïsée pour les mutations (read-modify-write) : garantit que
// l'écriture part de l'état disque courant, jamais d'un instantané mis en cache.
function readProgressV3Fresh(): ProgressV3 {
  if (!existsSync(FILE)) return migrateToV7({});
  try {
    return migrateToV7(JSON.parse(readFileSync(FILE, 'utf8')));
  } catch {
    return migrateToV7({});
  }
}

// API historique : progression PLATE du parcours actif (consommée partout).
export function readProgress(): Progress {
  return activeTrackProgress(readProgressV3());
}

// ÉCRITURE ATOMIQUE (ADR-064 §8.1). `writeFileSync` direct laissait, en cas
// d'interruption, un JSON tronqué que `readProgressV3` interprète comme une
// progression VIDE — soit une perte totale silencieuse. On écrit dans un
// fichier temporaire du MÊME répertoire, on force le vidage sur disque, puis on
// renomme : le rename est atomique sur un même système de fichiers, donc le
// lecteur voit soit l'ancien fichier intact, soit le nouveau complet.
function writeV3(v3: ProgressV3): void {
  const dir = dirname(FILE);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  try {
    writeFileSync(tmp, JSON.stringify(v3, null, 2));
    const fd = openSync(tmp, 'r+');
    try { fsyncSync(fd); } finally { closeSync(fd); }
    renameSync(tmp, FILE);
  } catch (e) {
    try { if (existsSync(tmp)) unlinkSync(tmp); } catch { /* best-effort */ }
    throw e;
  }
}

/** Écrit la structure multi-parcours v3 complète (import de sauvegarde V9). */
export function writeProgressV3(v3: ProgressV3): void {
  writeV3(v3);
}

// Écrit la progression plate dans le parcours actif de la structure v3.
export function writeProgress(p: Progress): void {
  writeV3(writeActiveTrack(readProgressV3Fresh(), p));
}

// ── Gestion des parcours ──
export function getActiveTrackId(): string {
  return readProgressV3().activeTrackId;
}
export function listTracks(): TrackMeta[] {
  return tracksMeta(readProgressV3());
}
export function enrollAndActivate(trackId: string, version = '1'): void {
  writeV3(enrollTrack(readProgressV3Fresh(), trackId, version));
}
export function activateTrack(trackId: string): void {
  writeV3(setActiveTrack(readProgressV3Fresh(), trackId));
}

export function getDayProgress(day: number): DayProgress | undefined {
  return readProgress().days[String(day)];
}
