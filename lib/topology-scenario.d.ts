// Types pour lib/topology-scenario.mjs (simulation d'incident pure).
import type { Topology } from './topology';
import type { Diagnostic, AnalysisSummary } from './topology-analysis';

export type ScenarioKind = 'drop-node' | 'drop-zone' | 'dependency-down' | 'traffic-spike';
export const SCENARIOS: ScenarioKind[];

export interface ScenarioProps { clientToService: boolean; reachableServiceIds: string[]; unreachableServiceIds: string[] }
export interface ScenarioResult {
  ok: boolean;
  error?: string;
  effects?: { removed: string[]; note: string };
  before?: ScenarioProps;
  after?: ScenarioProps;
  survived?: boolean;
  diagnostics?: Diagnostic[];
  degradedAnalysis?: AnalysisSummary;
}

export function runScenario(topo: Topology | Record<string, unknown>, scenario: { kind: string; target?: string }): ScenarioResult;
