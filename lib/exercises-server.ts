// Chargement serveur des exercices (fixtures JSON validées, mémoïsées).
// Les exercices sont du CONTENU versionné (data/exercises/*.json), séparé de la
// progression personnelle. Chaque fixture est validée au chargement : une
// fixture cassée lève une erreur explicite plutôt que d'échouer plus tard.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateExercise } from './exercise.mjs';
import { normalizeExerciseFiles } from './exercise-files.mjs';
import type { Exercise } from './exercise';

const DIR = join(process.cwd(), 'data', 'exercises');

let cached: Exercise[] | null = null;

function loadAll(): Exercise[] {
  let files: string[] = [];
  try {
    files = readdirSync(DIR).filter((f) => f.endsWith('.json')).sort();
  } catch {
    return [];
  }
  const out: Exercise[] = [];
  const seen = new Set<string>();
  for (const f of files) {
    const raw = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
    const v = validateExercise(raw);
    if (!v.ok) throw new Error(`Exercice invalide (${f}) : ${v.errors.join(' ; ')}`);
    normalizeExerciseFiles(raw); // valide aussi le modèle multi-fichiers (lève si cassé)
    if (seen.has(raw.id)) throw new Error(`Exercice : id dupliqué « ${raw.id} » (${f}).`);
    seen.add(raw.id);
    out.push(raw as Exercise);
  }
  return out;
}

export function listExercises(): Exercise[] {
  if (!cached) cached = loadAll();
  return cached;
}

export function getExercise(id: string): Exercise | null {
  return listExercises().find((e) => e.id === id) ?? null;
}
