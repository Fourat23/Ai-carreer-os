// Types pour lib/cloud-architecture.mjs (modèle cloud provider-aware, pur).

export type CloudProvider = 'aws' | 'azure' | 'generic';

export interface CloudPolicy { actions: string[]; resources?: string[]; effect?: 'allow' | 'deny'; }
export interface CloudIdentity {
  id: string; type: 'user' | 'role' | 'service-principal' | 'managed-identity' | 'group';
  policies?: CloudPolicy[]; staticKeys?: boolean; accessKeys?: boolean;
}
export interface CloudResource {
  id: string; kind: string; label?: string; service?: string; zone?: string | null;
  environment?: string | null; public?: boolean; props?: Record<string, unknown>;
}
export interface CloudEdge { id: string; from: string; to: string; kind: string; }
export interface CloudSubnet { id: string; cidr: string; public?: boolean; }
export interface CloudNetwork { cidr?: string; subnets?: CloudSubnet[]; securityGroups?: unknown[]; }
export interface CloudCostHint { resourceId?: string; sizing?: string; oversized?: boolean; monthlyUnits?: number; }

export interface CloudArchitecture {
  id: string; title: string; description: string;
  provider: CloudProvider; region: string; zones?: (string | { id: string; label?: string })[];
  need?: string; constraints?: string[];
  resources: CloudResource[]; edges?: CloudEdge[]; identities?: CloudIdentity[];
  network?: CloudNetwork | null; observability?: { logs?: boolean; metrics?: boolean; alerts?: boolean } | null;
  costHints?: CloudCostHint[]; objectives?: { id: string; kind: string; target?: string }[];
  fixedResources?: CloudResource[]; fixedIdentities?: CloudIdentity[]; fixedNetwork?: CloudNetwork | null;
  skills: string[]; dayRefs: number[]; trackScope?: string[] | null;
  missionRefs?: string[]; playbookRef?: string | null;
}

export interface ValidateCtx { skillIds?: { has(s: string): boolean }; validDays?: Set<number> | null; trackIds?: Set<string> | null; }

export const PROVIDERS: CloudProvider[];
export const CLOUD_DOMAINS: string[];
export const CLOUD_RESOURCE_KINDS: string[];
export const IDENTITY_TYPES: string[];
export const CLOUD_CAPS: Record<string, number>;

export function isCidr(v: unknown): boolean;
export function cidrRange(cidr: string): { start: number; end: number };
export function cidrsOverlap(a: string, b: string): boolean;
export function detectCloudSecretLike(text: unknown): { match: string; index: number; fake: boolean }[];
export function toTopology(arch: CloudArchitecture): Record<string, unknown>;
export function validateCloudArchitecture(arch: CloudArchitecture, ctx?: ValidateCtx): { ok: boolean; errors: string[] };
export function publicCloudView(arch: CloudArchitecture): Record<string, unknown>;
