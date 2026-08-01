// Calculs de progression dérivés (dashboard). Purs, testables, sans I/O.

import type { Program, Progress } from './types';

export interface Stats {
  totalDays: number;
  completedDays: number;
  inProgressDays: number;
  toReviewDays: number;
  percent: number;
  // Jour "actuel" du programme : le premier jour non terminé.
  currentDay: number;
  // Jour "attendu" selon la date de début (rythme 1 jour/jour calendaire).
  expectedDay: number | null;
  // Retard en jours (expectedDay - currentDay), >= 0.
  delay: number;
  // Prochain livrable (jour non terminé le plus proche qui a un livrable).
  nextDeliverable: { day: number; title: string; deliverable: string } | null;
}

const DONE = new Set(['done']);

// `days` = journées ORDONNÉES du parcours actif (Fondations = 365 ; parcours
// ciblé = son sous-ensemble). Toutes les stats (livrable, jour attendu, retard)
// sont ainsi calculées dans le périmètre du parcours actif.
export function computeStats(days: Program['days'], progress: Progress): Stats {
  const totalDays = days.length;
  let completedDays = 0, inProgressDays = 0, toReviewDays = 0;
  for (const d of days) {
    const s = progress.days[String(d.day)]?.status;
    if (s === 'done') completedDays++;
    else if (s === 'in-progress') inProgressDays++;
    else if (s === 'to-review') toReviewDays++;
  }

  // Jour actuel = premier jour dont le statut n'est pas "done".
  let currentDay = totalDays; // si tout est fini
  for (const d of days) {
    if (!DONE.has(progress.days[String(d.day)]?.status ?? '')) { currentDay = d.day; break; }
  }

  // Jour attendu selon la date de début.
  let expectedDay: number | null = null;
  if (progress.startDate) {
    const start = new Date(progress.startDate + 'T00:00:00');
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
    expectedDay = Math.max(1, Math.min(totalDays, diffDays + 1));
  }

  const delay = expectedDay ? Math.max(0, expectedDay - currentDay) : 0;

  // Prochain livrable.
  let nextDeliverable: Stats['nextDeliverable'] = null;
  for (const d of days) {
    if (DONE.has(progress.days[String(d.day)]?.status ?? '')) continue;
    if (d.deliverable) { nextDeliverable = { day: d.day, title: d.title, deliverable: d.deliverable }; break; }
  }

  return {
    totalDays,
    completedDays,
    inProgressDays,
    toReviewDays,
    percent: totalDays ? Math.round((completedDays / totalDays) * 100) : 0,
    currentDay,
    expectedDay,
    delay,
    nextDeliverable,
  };
}

// Compétences travaillées "en ce moment" : celles de la semaine du jour courant.
export function currentSkills(program: Program, currentDay: number): string[] {
  const day = program.days.find((d) => d.day === currentDay);
  if (!day) return [];
  const week = program.weeks.find((w) => w.week === day.week);
  return week?.skills ?? [];
}
