// Types pour lib/security-analysis.mjs (analyse de sécurité pure).
import type { SecurityScenario } from './security';

export type Severity = 'blocking' | 'risk' | 'warning' | 'observation';
export type Confidence = 'high' | 'medium' | 'low';

export interface Diagnostic {
  code: string; severity: Severity; domain: string; resource: string; path: string;
  message: string; explanation: string; risk: string; recommendation: string;
  remediationOrder: number | null; autofixable: boolean;
  confidence: Confidence; real: boolean; simulated: boolean;
  cwe: string | null; glossary: string[];
}
export interface AnalysisSummary {
  bySeverity: Record<Severity, number>;
  byDomain: Record<string, number>;
  dimensions: string[];
  total: number;
  limits: string[];
}
export interface Analysis { diagnostics: Diagnostic[]; summary: AnalysisSummary }

export const SEVERITIES: Severity[];
export const DOMAINS: string[];
export function analyzeScenario(scn: SecurityScenario | Record<string, unknown>, cveDb?: unknown): Analysis;
export function ruleCodes(): string[];
