// Types pour lib/cloud-analysis.mjs (analyse cloud déterministe, pure).
import type { CloudArchitecture } from './cloud-architecture';

export interface CloudDiagnostic {
  id: string; severity: 'blocking' | 'risk' | 'warning' | 'observation';
  domain: string; title: string; explanation: string; evidence: string[];
  remediation: string; provider: string; confidence: 'high' | 'medium' | 'low';
  real: boolean; simulated: boolean; glossary: string[];
}
export interface CloudAnalysis {
  diagnostics: CloudDiagnostic[];
  summary: {
    bySeverity: Record<string, number>; byDomain: Record<string, number>;
    cost: unknown; dimensions: string[]; total: number; limits: string[];
  };
}
export const SEVERITIES: string[];
export function analyzeCloud(arch: CloudArchitecture, priceBook?: unknown): CloudAnalysis;
export function cloudRuleCodes(): string[];
