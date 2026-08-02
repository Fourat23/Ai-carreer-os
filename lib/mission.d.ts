// Déclarations TypeScript du modèle de mission (V18). Voir lib/mission.mjs.

export type MissionCategory = 'debt-maintenance' | 'performance' | 'documentation' | 'incident';
export type DeliverableKind = 'code' | 'document' | 'metrics' | 'decision' | 'plan' | 'report';
export type ValidationMode = 'auto' | 'structural' | 'review';

export const MISSION_CATEGORIES: MissionCategory[];
export const DELIVERABLE_KINDS: DeliverableKind[];
export const VALIDATION_MODES: ValidationMode[];
export const MISSION_DEF_STATUSES: Array<'draft' | 'published'>;
export type RubricCategory = 'functional' | 'quality' | 'maintainability' | 'tests' | 'performance' | 'documentation' | 'security' | 'tradeoffs';
export const RUBRIC_CATEGORIES: RubricCategory[];

export interface DocSpec {
  requiredSections: string[];
  minLength?: number;
  maxLength?: number;
  requireMentions?: string[];
  forbidPlaceholders?: boolean;
}

export interface MissionDeliverable {
  id: string;
  kind: DeliverableKind;
  title: string;
  required: boolean;
  validation: ValidationMode;
  exerciseRef?: string;
  docSpec?: DocSpec;
  hint?: string;
}

export interface RubricCriterion {
  label: string;
  blocking?: boolean;
  category?: RubricCategory;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: MissionCategory;
  difficulty: number;
  estimatedHours: number;
  context: string;
  prerequisites?: string[];
  skills: string[];
  trackRefs?: string[];
  dayRefs: number[];
  starterFiles?: Array<{ path: string; content: string }>;
  deliverables: MissionDeliverable[];
  exerciseRefs?: string[];
  rubric?: RubricCriterion[];
  commonMistakes?: string[];
  dependsOn?: string[];
  status: 'draft' | 'published';
  version: string;
}

export interface MissionValidationContext {
  validDays?: Set<number>;
  trackIds?: Set<string>;
  skillIds?: Set<string> | { has(id: string): boolean };
  exerciseIds?: Set<string>;
}

export function validateMission(m: unknown, ctx?: MissionValidationContext): { ok: boolean; errors: string[] };
export function validateMissionCatalogue(missions: unknown[], ctx?: MissionValidationContext): { ok: boolean; errors: string[] };
export function publicMissionView(m: Mission): Record<string, unknown>;
export function validateDocumentStructure(text: string, spec?: DocSpec): {
  ok: boolean; missingSections: string[]; placeholders: boolean; tooShort: boolean; tooLong: boolean; missingMentions: string[];
};
