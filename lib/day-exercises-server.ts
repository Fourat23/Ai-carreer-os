// Accès serveur à la liaison jour↔exercice (mémoïsée, validée contre les
// exercices existants et les jours du programme). Fixture immuable → cache serveur.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { getProgram } from './program';
import { listExercises } from './exercises-server';
import { buildDayExerciseIndex, type DayExerciseIndex } from './day-exercises';

const FILE = join(process.cwd(), 'data', 'day-exercises.json');

let cached: DayExerciseIndex | null = null;

export function getDayExerciseIndex(): DayExerciseIndex {
  if (cached) return cached;
  const raw = existsSync(FILE) ? JSON.parse(readFileSync(FILE, 'utf8')) : {};
  const knownIds = new Set(listExercises().map((e) => e.id));
  const dayNums = new Set(getProgram().days.map((d) => d.day));
  cached = buildDayExerciseIndex(raw, knownIds, dayNums);
  return cached;
}
