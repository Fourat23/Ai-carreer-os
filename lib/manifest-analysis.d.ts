// Types pour lib/manifest-analysis.mjs (analyse de manifests pure).
import type { ManifestSet } from './manifest';

export type Severity = 'blocking' | 'risk' | 'warning' | 'observation';
export type Category = 'security' | 'availability' | 'performance' | 'maintenance' | 'delivery' | 'observability';

export interface Diagnostic {
  code: string;
  severity: Severity;
  category: Category;
  resource: string;
  path: string;
  message: string;
  explanation: string;
  risk: string;
  recommendation: string;
  autofixable: boolean;
  glossary: string[];
}
export interface AnalysisSummary {
  bySeverity: Record<Severity, number>;
  byCategory: Record<string, number>;
  dimensions: string[];
  total: number;
}
export interface Analysis {
  diagnostics: Diagnostic[];
  summary: AnalysisSummary;
}

export const SEVERITIES: Severity[];
export const CATEGORIES: Category[];
export function analyzeManifests(set: ManifestSet | Record<string, unknown>): Analysis;
export function ruleCodes(): string[];
