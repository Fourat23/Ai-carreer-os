// Types pour lib/practice-coverage.mjs (read-model de couverture, pur).
import type { Program } from './types';

export type CoverageDimension = 'foundation' | 'practice' | 'autonomy' | 'diagnostic' | 'variation' | 'transfer' | 'professional';
export type CoverageLevel = 'full' | 'partial' | 'none';
export type ReadinessLevel = 'not-ready' | 'foundational' | 'guided' | 'junior-ready' | 'strong-junior';

export interface CoverageCell { level: CoverageLevel; from: string[]; }

export interface SkillCoverage {
  skill: string;
  name: string;
  dimensions: Record<CoverageDimension, CoverageCell>;
  readiness: ReadinessLevel;
  gaps: CoverageDimension[];
}

export interface CoverageSources {
  lessons?: Array<{ slug: string; skills: string[] }>;
  exercises?: Array<{ id: string; skills: string[]; difficulty?: number }>;
  assessments?: Array<{ id: string; skills: string[]; questions?: Array<{ taxonomy: string }> }>;
  capstones?: Array<{ id: string; skills: string[]; phases?: Array<{ kind: string }> }>;
  transferChallenges?: Array<{ id: string; skills: string[] }>;
  missions?: Array<{ id: string; skills: string[] }>;
  labs?: Array<{ id: string; skills: string[] }>;
  misconceptions?: Array<{ id: string; skill: string; wrong: string; right: string; lessonRefs?: string[]; exerciseRefs?: string[] }>;
  skillName?: string;
}

export interface CoverageSummary {
  byReadiness: Record<ReadinessLevel, number>;
  gapsByDimension: Record<CoverageDimension, number>;
  total: number;
}

export const COVERAGE_DIMENSIONS: readonly CoverageDimension[];
export const READINESS_LEVELS: readonly ReadinessLevel[];
export const FINE_TO_PROGRAM: Record<string, string>;

export function projectSkill(id: unknown): string | null;
export function skillCoverage(skillId: string, sources?: CoverageSources): SkillCoverage;
export function coverageMatrix(program: Program, sources?: CoverageSources): SkillCoverage[];
export function coverageSummary(matrix: SkillCoverage[]): CoverageSummary;
export function diagnosticFeedback(
  q: { skill?: string; exerciseId?: string },
  misconceptions?: CoverageSources['misconceptions'],
): { candidates: Array<{ id: string; wrong: string; right: string; lessonRefs: string[]; exerciseRefs: string[] }> };
