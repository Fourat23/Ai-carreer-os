// Chargement serveur des missions d'ingénierie (V18). CONTENU versionné
// (data/missions/*.json), séparé de la progression personnelle. Chaque mission
// est validée au chargement contre les données réelles (jours, parcours,
// compétences, exercices) ; une mission cassée lève une erreur explicite.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cache } from 'react';
import { validateMission, publicMissionView } from './mission.mjs';
import type { Mission } from './mission';
import { listExercises } from './exercises-server';
import { getProgram } from './program';
import { DEFAULT_TRACK_ID, FULLSTACK_TRACK_ID, BACKEND_TRACK_ID } from './catalogue.mjs';
import { isKnownSkill } from './skill-taxonomy.mjs';

const DIR = join(process.cwd(), 'data', 'missions');

function loadAll(): Mission[] {
  let files: string[] = [];
  try {
    files = readdirSync(DIR).filter((f) => f.endsWith('.json')).sort();
  } catch {
    return [];
  }
  const program = getProgram();
  const ctx = {
    validDays: new Set<number>((program.days ?? []).map((d) => d.day)),
    trackIds: new Set<string>([DEFAULT_TRACK_ID, FULLSTACK_TRACK_ID, BACKEND_TRACK_ID]),
    skillIds: { has: (s: string) => isKnownSkill(s) },
    exerciseIds: new Set<string>(listExercises().map((e) => e.id)),
  };
  const out: Mission[] = [];
  const seen = new Set<string>();
  for (const f of files) {
    const raw = JSON.parse(readFileSync(join(DIR, f), 'utf8')) as Mission;
    const v = validateMission(raw, ctx);
    if (!v.ok) throw new Error(`Mission invalide (${f}) : ${v.errors.join(' ; ')}`);
    if (seen.has(raw.id)) throw new Error(`Mission : id dupliqué « ${raw.id} » (${f}).`);
    seen.add(raw.id);
    out.push(raw);
  }
  return out;
}

export const listMissions: () => Mission[] = cache(() => loadAll());

export function getMission(id: string): Mission | null {
  return listMissions().find((m) => m.id === id) ?? null;
}

/** Missions publiées reliées à une journée (dérivé de dayRefs). */
export function missionsForDay(day: number): Mission[] {
  return listMissions().filter((m) => m.status === 'published' && (m.dayRefs ?? []).includes(day));
}

/** Vue publique (indexable / envoyable au client) d'une mission. */
export function publicMission(m: Mission) {
  return publicMissionView(m);
}

// ── Réconciliation des livrables AUTO depuis les preuves d'exercice ──────────
import { submitDeliverable, missionProgress as _missionProgress } from './mission-state.mjs';
import { hasLabEvidence } from './lab-progress';

/** Reflète les livrables 'auto' (validés si l'exercice lié a une preuve). Pur. */
export function reconcileAutoDeliverables<T extends { days?: Record<string, unknown> }>(flat: T, mission: Mission): T {
  let next = flat;
  for (const d of mission.deliverables) {
    if (d.validation !== 'auto' || !d.exerciseRef) continue;
    const days = (next.days ?? {}) as Record<string, unknown>;
    const passed = Object.values(days).some((dp) => hasLabEvidence(dp, d.exerciseRef as string));
    if (passed) next = submitDeliverable(next, mission, d.id, { status: 'validated' });
  }
  return next;
}

/** Avancement d'une mission pour un flat donné, livrables auto reflétés. */
export function missionProgressFor(flat: { days?: Record<string, unknown> }, mission: Mission) {
  return _missionProgress(reconcileAutoDeliverables(flat, mission), mission);
}
