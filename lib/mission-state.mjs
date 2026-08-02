// État PUR des missions dans la progression v3 (V18). Opère sur un « track plat »
// ({ days, skills, missions, ... }) et renvoie TOUJOURS un nouvel objet.
// Réutilise le système de preuves (addEvidence) et la carte de compétences —
// aucune seconde progression (cf. ADR-018).

import { addEvidence } from './learning.mjs';

export const MISSION_STATUSES = [
  'not-started', 'in-progress', 'deliverables-incomplete', 'ready-for-review', 'done',
];
export const DELIVERABLE_STATUSES = [
  'todo', 'submitted', 'structure-valid', 'self-assessed', 'validated', 'rejected',
];
const RANK = { todo: 0, submitted: 1, 'structure-valid': 2, 'self-assessed': 3, validated: 4, rejected: -1 };

const MISSION_SKILL_LEVEL = 3; // plancher « pratiqué » attribué par une mission terminée
const MAX_CONTENT = 20000;     // borne de taille d'un livrable utilisateur

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

/** Cible atteinte pour « soumis » (prêt à revoir) selon le mode de validation. */
function submitTargetRank(mode) {
  return mode === 'auto' ? RANK.validated : mode === 'structural' ? RANK['structure-valid'] : RANK['self-assessed'];
}
/** Cible atteinte pour « terminé » selon le mode de validation. */
function doneTargetRank(mode) {
  return mode === 'auto' ? RANK.validated : mode === 'structural' ? RANK['structure-valid'] : RANK.validated;
}

export function emptyMissionState() {
  return { status: 'not-started', deliverables: {}, startedAt: null, updatedAt: null };
}

/** Lit l'état d'une mission dans un track plat (jamais undefined). */
export function readMissionState(flat, missionId) {
  const s = isObj(flat?.missions) ? flat.missions[missionId] : null;
  return isObj(s) ? { ...emptyMissionState(), ...s } : emptyMissionState();
}

function writeMissionState(flat, missionId, state) {
  const missions = { ...(isObj(flat?.missions) ? flat.missions : {}) };
  missions[missionId] = state;
  return { ...flat, missions };
}

/** Démarre une mission (not-started → in-progress). Idempotent. */
export function startMission(flat, missionId, now = new Date().toISOString()) {
  if (!isObj(flat) || typeof missionId !== 'string' || !missionId) return flat;
  const state = readMissionState(flat, missionId);
  if (state.status !== 'not-started') return flat;
  return writeMissionState(flat, missionId, { ...state, status: 'in-progress', startedAt: now, updatedAt: now });
}

/**
 * Applique un résultat de livrable. `status` doit être un statut valide et la
 * transition non régressive interdite (sauf 'rejected' explicite). `content`
 * est borné. Recalcule le statut de la mission.
 * @param {object} flat
 * @param {object} missionDef  définition (pour dériver le statut global)
 * @param {string} deliverableId
 * @param {{status:string, content?:string, selfAssessment?:object, reviewNote?:string}} patch
 */
export function submitDeliverable(flat, missionDef, deliverableId, patch = {}, now = new Date().toISOString()) {
  if (!isObj(flat) || !isObj(missionDef)) return flat;
  const def = (missionDef.deliverables ?? []).find((d) => d.id === deliverableId);
  if (!def) return flat; // livrable inconnu : dégradation propre
  if (!DELIVERABLE_STATUSES.includes(patch.status)) return flat;

  const state = readMissionState(flat, missionDef.id);
  const prev = state.deliverables[deliverableId] ?? { status: 'todo' };
  // Anti-régression : on ne redescend pas un livrable (sauf rejet explicite).
  if (patch.status !== 'rejected' && RANK[patch.status] < RANK[prev.status]) return flat;

  const entry = { status: patch.status, submittedAt: now };
  if (typeof patch.content === 'string') entry.content = patch.content.slice(0, MAX_CONTENT);
  else if (prev.content != null) entry.content = prev.content;
  if (isObj(patch.selfAssessment)) entry.selfAssessment = patch.selfAssessment;
  else if (prev.selfAssessment) entry.selfAssessment = prev.selfAssessment;
  if (typeof patch.reviewNote === 'string') entry.reviewNote = patch.reviewNote.slice(0, 4000);

  const deliverables = { ...state.deliverables, [deliverableId]: entry };
  const nextState = { ...state, deliverables, updatedAt: now };
  if (nextState.status === 'not-started') { nextState.status = 'in-progress'; nextState.startedAt = state.startedAt ?? now; }
  nextState.status = computeMissionStatus(missionDef, nextState);
  return writeMissionState(flat, missionDef.id, nextState);
}

/** Dérive le statut d'une mission depuis l'état de ses livrables REQUIS. */
export function computeMissionStatus(missionDef, state) {
  const required = (missionDef.deliverables ?? []).filter((d) => d.required);
  if (required.length === 0) return state.status === 'not-started' ? 'not-started' : 'in-progress';
  const rankOf = (d) => RANK[state.deliverables?.[d.id]?.status ?? 'todo'];
  const someProgressed = required.some((d) => rankOf(d) > 0);
  const anyStarted = state.startedAt || someProgressed;
  if (!anyStarted) return 'not-started';
  const allDone = required.every((d) => rankOf(d) >= doneTargetRank(d.validation));
  if (allDone) return 'done';
  const allSubmitted = required.every((d) => rankOf(d) >= submitTargetRank(d.validation));
  if (allSubmitted) return 'ready-for-review';
  if (someProgressed) return 'deliverables-incomplete';
  return 'in-progress';
}

/**
 * Enregistre la complétion d'une mission : ajoute une preuve de type 'mission'
 * aux journées liées (dédoublonnée) et relève les compétences. À n'appeler que
 * lorsque computeMissionStatus === 'done'. Renvoie un nouveau track plat.
 */
export function recordMissionCompletion(flat, missionDef, now = new Date().toISOString()) {
  if (!isObj(flat) || !isObj(missionDef)) return flat;
  const state = readMissionState(flat, missionDef.id);
  if (computeMissionStatus(missionDef, state) !== 'done') return flat;

  const url = `/missions/${missionDef.id}`;
  const days = { ...(flat.days ?? {}) };
  for (const d of missionDef.dayRefs ?? []) {
    const key = String(d);
    const dp = days[key] ?? {};
    if ((dp.evidence ?? []).some((e) => e && e.url === url)) continue;
    days[key] = addEvidence(dp, {
      id: `mission-${missionDef.id}`,
      type: 'mission',
      title: `Mission terminée : ${missionDef.title}`,
      description: 'Livrables requis complétés (auto vérifiés + structure validée + auto-évaluation/revue).',
      url,
      skills: [...(missionDef.skills ?? [])],
      createdAt: now,
    });
  }
  const skills = { ...(flat.skills ?? {}) };
  for (const s of missionDef.skills ?? []) {
    if (!(typeof skills[s] === 'number') || skills[s] < MISSION_SKILL_LEVEL) skills[s] = MISSION_SKILL_LEVEL;
  }
  return { ...flat, days, skills };
}

/** Synthèse lisible (pure) de l'avancement d'une mission. */
export function missionProgress(flat, missionDef) {
  const state = readMissionState(flat, missionDef.id);
  const required = (missionDef.deliverables ?? []).filter((d) => d.required);
  const done = required.filter((d) => RANK[state.deliverables?.[d.id]?.status ?? 'todo'] >= doneTargetRank(d.validation)).length;
  return { status: computeMissionStatus(missionDef, state), requiredTotal: required.length, requiredDone: done };
}
