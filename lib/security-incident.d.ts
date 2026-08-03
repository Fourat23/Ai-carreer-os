// Types pour lib/security-incident.mjs (réponse à incident pure).
import type { SecurityScenario, IncidentKind } from './security';

export const INCIDENTS: IncidentKind[];
export function secretResponseOrder(): string[];
export function decideRecovery(ctx: { reversible?: boolean; urgent?: boolean; dataMigrationBlocks?: boolean }): 'rollback' | 'roll-forward' | 'hotfix' | 'mitigation';

export interface IncidentPhase { phase: string; action: string }
export interface IncidentResult {
  ok: boolean; error?: string; incident?: string; severity?: string;
  phases?: IncidentPhase[]; order?: string[]; decision?: string | null;
  diagnostics?: Array<{ code: string; severity: string; domain: string; title: string; recommendation: string; order: string[]; glossary: string[] }>;
}
export function simulateIncident(scn: SecurityScenario | Record<string, unknown>, kind?: string): IncidentResult;
