// Types pour lib/topology-analysis.mjs (analyse de topologie pure).
import type { Topology } from './topology';

export type Severity = 'blocking' | 'risk' | 'warning' | 'observation';
export type Dimension = 'availability' | 'security' | 'cost' | 'performance' | 'maintainability' | 'complexity';

export interface Diagnostic {
  code: string;
  severity: Severity;
  dimension: Dimension;
  title: string;
  explanation: string;
  evidence: string[];
  impact: string;
  recommendation: string;
  tradeoff: string;
  skills: string[];
  glossary: string[];
}
export interface AnalysisSummary {
  bySeverity: Record<Severity, number>;
  dimensions: string[];
  total: number;
}
export interface Analysis {
  diagnostics: Diagnostic[];
  summary: AnalysisSummary;
}

export const SEVERITIES: Severity[];
export function analyzeTopology(topo: Topology | Record<string, unknown>): Analysis;
export function ruleCodes(): string[];
