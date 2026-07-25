// Liaison journée ↔ exercice — PURE, pilotée par fixture (data/day-exercises.json).
// AUCUNE modification du Markdown des 365 jours : le lien vit entièrement dans une
// fixture validée au chargement (jour existant, exercice connu, pas de doublon).

const DANGEROUS = new Set(['__proto__', 'prototype', 'constructor']);

/**
 * Construit l'index bidirectionnel jour↔exercice depuis la fixture brute.
 * @param {Record<string,string[]>} raw  { "1": ["greeting"], ... }
 * @param {Set<string>} knownExerciseIds  ids d'exercices existants
 * @param {Set<number>} dayNums           numéros de jours valides (1..365)
 * @returns {{ byDay: Map<number,string[]>, byExercise: Map<string,number[]> }}
 * @throws si un jour est invalide ou un exercice inconnu.
 */
export function buildDayExerciseIndex(raw, knownExerciseIds = null, dayNums = null) {
  const byDay = new Map();
  const byExercise = new Map();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { byDay, byExercise };

  for (const key of Object.keys(raw)) {
    if (DANGEROUS.has(key)) continue;
    if (!/^\d+$/.test(key)) throw new Error(`Liaison jour↔exercice : clé de jour non numérique « ${key} ».`);
    const day = Number(key);
    if (dayNums && !dayNums.has(day)) throw new Error(`Liaison jour↔exercice : jour inexistant ${day}.`);
    const ids = raw[key];
    if (!Array.isArray(ids)) throw new Error(`Liaison jour↔exercice : liste attendue pour le jour ${day}.`);
    const clean = [];
    for (const id of ids) {
      if (typeof id !== 'string' || !id) throw new Error(`Liaison jour↔exercice : id d'exercice invalide au jour ${day}.`);
      if (knownExerciseIds && !knownExerciseIds.has(id)) throw new Error(`Liaison jour↔exercice : exercice inconnu « ${id} » (jour ${day}).`);
      if (clean.includes(id)) continue; // pas de doublon dans un même jour
      clean.push(id);
      const days = byExercise.get(id) ?? [];
      if (!days.includes(day)) days.push(day);
      byExercise.set(id, days);
    }
    if (clean.length) byDay.set(day, clean);
  }
  for (const days of byExercise.values()) days.sort((a, b) => a - b);
  return { byDay, byExercise };
}

export function exercisesForDay(index, day) {
  return index?.byDay?.get(Number(day)) ?? [];
}

export function daysForExercise(index, exerciseId) {
  return index?.byExercise?.get(exerciseId) ?? [];
}
