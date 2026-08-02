// Déclarations TypeScript de l'état des missions (V18). Voir lib/mission-state.mjs.
import type { Mission } from './mission';

export type MissionStatus =
  | 'not-started' | 'in-progress' | 'deliverables-incomplete' | 'ready-for-review' | 'done';
export type DeliverableStatus =
  | 'todo' | 'submitted' | 'structure-valid' | 'self-assessed' | 'validated' | 'rejected';

export const MISSION_STATUSES: MissionStatus[];
export const DELIVERABLE_STATUSES: DeliverableStatus[];

export interface DeliverableState {
  status: DeliverableStatus;
  content?: string;
  selfAssessment?: Record<string, unknown>;
  reviewNote?: string;
  submittedAt?: string;
}
export interface MissionState {
  status: MissionStatus;
  deliverables: Record<string, DeliverableState>;
  startedAt: string | null;
  updatedAt: string | null;
}

export function emptyMissionState(): MissionState;
export function readMissionState(flat: unknown, missionId: string): MissionState;
export function startMission<T>(flat: T, missionId: string, now?: string): T;
export function submitDeliverable<T>(
  flat: T, missionDef: Mission, deliverableId: string,
  patch?: { status: DeliverableStatus; content?: string; selfAssessment?: Record<string, unknown>; reviewNote?: string },
  now?: string,
): T;
export function computeMissionStatus(missionDef: Mission, state: MissionState): MissionStatus;
export function recordMissionCompletion<T>(flat: T, missionDef: Mission, now?: string): T;
export function missionProgress(flat: unknown, missionDef: Mission): { status: MissionStatus; requiredTotal: number; requiredDone: number };
