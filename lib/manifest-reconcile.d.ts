// Types pour lib/manifest-reconcile.mjs (réconciliation & simulation pures).
import type { ManifestSet, Resource } from './manifest';

export type IncidentKind =
  | 'crashloop' | 'imagepull' | 'pending' | 'oomkilled' | 'readiness-never'
  | 'liveness-aggressive' | 'bad-selector' | 'no-endpoints' | 'rollout-stuck'
  | 'regression' | 'rollback-blocked' | 'secret-exposed' | 'cpu-saturation'
  | 'mem-saturation' | 'dependency-down' | 'config-missing';
export const INCIDENTS: IncidentKind[];

export interface PodState { owner: string; labels: Record<string, string>; phase: string; ready: boolean }
export interface Reconciled { desiredPods: number; pods: PodState[]; endpoints: Record<string, number>; warnings: string[] }
export function reconcile(set: ManifestSet | Record<string, unknown>): Reconciled;

export interface IncidentDiag { code: string; severity: string; title: string; recommendation: string; glossary: string[] }
export interface IncidentResult {
  ok: boolean; error?: string; incident?: string;
  effects?: { note: string; affected?: string[] };
  podStates?: PodState[]; reachable?: boolean; diagnostics?: IncidentDiag[]; service?: string | null;
}
export function simulateIncident(set: ManifestSet | Record<string, unknown>, scenario: { kind: string; target?: string }): IncidentResult;

export interface RolloutStep { step: string; available: number; note: string }
export interface RolloutResult {
  strategy: string; replicas: number; healthy: boolean; succeeded: boolean;
  steps: RolloutStep[]; rollback: { available: number; note: string };
}
export function simulateRollout(deployment: Resource | Record<string, unknown>, opt?: { newImageHealthy?: boolean }): RolloutResult;
