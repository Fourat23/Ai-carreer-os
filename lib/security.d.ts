// Déclarations de types pour le modèle de scénario de sécurité (lib/security.mjs).

export type Domain = 'secrets' | 'supply-chain' | 'rbac' | 'kubernetes' | 'exposure' | 'incident' | 'deployment';
export type ArtifactKind = 'config' | 'env' | 'log' | 'manifest' | 'rbac' | 'lockfile' | 'sbom' | 'headers' | 'pipeline' | 'dockerfile';
export type IncidentKind = 'secret-leak' | 'dependency-compromise' | 'access-compromise' | 'broken-security-deploy' | 'critical-regression' | 'image-untrusted';

export const DOMAINS: Domain[];
export const ARTIFACT_KINDS: ArtifactKind[];
export const INCIDENTS: IncidentKind[];
export const SECURITY_CAPS: {
  maxArtifacts: number; maxDepth: number; maxContentBytes: number;
  maxArrayItems: number; maxSerializedBytes: number;
};

export interface Artifact { id: string; kind: ArtifactKind; path?: string | null; content: unknown }
export interface SecurityScenario {
  id: string; title: string; description: string; domain: Domain; difficulty?: number;
  artifacts: Artifact[]; fixedArtifacts?: Artifact[]; incident?: IncidentKind;
  playbookRef?: string;
  skills: string[]; dayRefs: number[]; trackScope?: string[] | null;
  exerciseRefs?: string[]; missionRefs?: string[];
}
export interface SecurityValidationCtx {
  skillIds?: { has: (s: string) => boolean };
  validDays?: Set<number>;
  trackIds?: Set<string>;
}
export interface SecretCandidate {
  match: string; index: number; kind: string;
  confidence: 'high' | 'medium' | 'low'; fake: boolean;
}

export function detectSecretCandidates(text: string): SecretCandidate[];
export function validateScenario(scn: SecurityScenario, ctx?: SecurityValidationCtx): { ok: boolean; errors: string[] };
export function publicScenarioView(scn: SecurityScenario): Record<string, unknown>;
